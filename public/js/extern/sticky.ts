/**
 * Sticky.js
 * Library for sticky elements written in vanilla javascript. With this library
 * you can easily set sticky elements on your website. It's also responsive.
 *
 * @version 1.1.4
 * @author Rafal Galus <biuro@rafalgalus.pl>
 * @website https://rgalus.github.io/sticky-js/
 * @repo https://github.com/rgalus/sticky-js
 * @license https://github.com/rgalus/sticky-js/blob/master/LICENSE
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Rafał Gałus
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";

declare type StickyOptions = {
	marginTop?: number;
	stickyClass?: string;
	stickyFor?: number;
};

class Sticky {
	private vp: { width: number, height: number };
	private scrollTop: number;
	private options: StickyOptions;

	/**
	 * Sticky instance constructor
	 * @constructor
	 * @param {HTMLElement} element - The element to use
	 * @param {string} options - Global options for sticky elements (could be overwritten by data-{option}=""
	 * attributes)
	 */
	constructor(options: StickyOptions = {}) {
		this.vp = this.getViewportSize();
		this.scrollTop = this.getScrollTopPosition();

		this.options = {
			marginTop: options.marginTop || 0,
			stickyClass: options.stickyClass || undefined,
			stickyFor: options.stickyFor || 0,
		};
	}

	/**
	 * Function that assign needed variables for sticky element, that are used in future for calculations and other
	 * @function
	 * @param {node} element - Element to be rendered
	 */
	public setup(element, options: StickyOptions = {}) {
		if (element.sticky) return;

		// create container for variables needed in future
		element.sticky = {};

		// set default variables
		element.sticky.active = false;

		element.sticky.marginTop = parseInt(element.getAttribute("data-margin-top"), 10)
			|| options.marginTop || this.options.marginTop;
		element.sticky.stickyFor = parseInt(element.getAttribute("data-sticky-for"), 10)
			|| options.stickyFor || this.options.stickyFor;
		element.sticky.stickyClass = element.getAttribute("data-sticky-class")
			|| options.stickyClass || this.options.stickyClass;

		element.sticky.container = this.getStickyContainer(element);
		element.sticky.container.rect = this.getRectangle(element.sticky.container);

		element.sticky.rect = this.getRectangle(element);

		// fix when element is image that has not yet loaded and width, height = 0
		if (element.tagName.toLowerCase === "img") {
			element.onload = () => element.sticky.rect = this.getRectangle(element);
		}

		// activate rendered element
		this.activate(element);
	}

	/**
	 * Function that activates element when specified conditions are met and then initalise events
	 * @function
	 * @param {node} element - Element to be activated
	 */
	private activate(element) {
		const heightBefore = element.sticky.container.offsetHeight;

		this.css(element, { position: "fixed" });

		const heightAfter = element.sticky.container.offsetHeight;

		this.css(element, { position: "" });

		if (!element.sticky.resizeEvent) {
			this.initResizeEvents(element);
			element.sticky.resizeEvent = true;
		}

		if (!element.sticky.scrollEvent) {
			this.initScrollEvents(element);
			element.sticky.scrollEvent = true;
		}

		this.onResizeEvents(element);
	}

	/**
	 * Function which is adding onResizeEvents to window listener and assigns function to element as resizeListener
	 * @function
	 * @param {node} element - Element for which resize events are initialised
	 */
	private initResizeEvents(element) {
		element.sticky.resizeListener = () => this.onResizeEvents(element);
		window.addEventListener("resize", element.sticky.resizeListener);
	}

	/**
	 * Function which is fired when user resize window. It checks if element should be activated or deactivated and then
	 * run setPosition function
	 * @function
	 * @param {node} element - Element for which event function is fired
	 */
	private onResizeEvents(element) {
		this.vp = this.getViewportSize();

		element.sticky.rect = this.getRectangle(element);
		element.sticky.container.rect = this.getRectangle(element.sticky.container);

		if (
			element.sticky.stickyFor < this.vp.width
			&& !element.sticky.active
		) {
			element.sticky.active = true;
		} else if (
			element.sticky.stickyFor >= this.vp.width
			&& element.sticky.active
		) {
			element.sticky.active = false;
		}

		this.setPosition(element);
	}

	/**
	 * Function which is adding onScrollEvents to window listener and assigns function to element as scrollListener
	 * @function
	 * @param {node} element - Element for which scroll events are initialised
	 */
	private initScrollEvents(element) {
		element.sticky.scrollListener = () => this.onScrollEvents(element);
		window.addEventListener("scroll", element.sticky.scrollListener);
	}

	/**
	 * Function which is fired when user scroll window. If element is active, function is invoking setPosition function
	 * @function
	 * @param {node} element - Element for which event function is fired
	 */
	private onScrollEvents(element) {
		this.scrollTop = this.getScrollTopPosition();

		if (element.sticky.active) {
			this.setPosition(element);
		}
	}

	/**
	 * Main function for the library. Here are some condition calculations and css appending for sticky element when
	 * user scroll window
	 * @function
	 * @param {node} element - Element that will be positioned if it"s active
	 */
	private setPosition(element) {
		this.css(element, { position: "", width: "", top: "", left: "" });

		if ((this.vp.height < element.sticky.rect.height) || !element.sticky.active) {
			return;
		}

		if (!element.sticky.rect.width) {
			element.sticky.rect = this.getRectangle(element);
		}

		// TODO: Fix when too high for screen
		if (this.scrollTop > (element.sticky.rect.top - element.sticky.marginTop)) {
			this.css(element, {
				position: "fixed",
				width: element.sticky.rect.width + "px",
				left: element.sticky.rect.left + "px",
			});

			if (
				(this.scrollTop + element.sticky.rect.height + element.sticky.marginTop)
				> (element.sticky.container.rect.top + element.sticky.container.offsetHeight)
			) {

				if (element.sticky.stickyClass) element.classList.remove(element.sticky.stickyClass);

				this.css(element, {
					top: (element.sticky.container.rect.top + element.sticky.container.offsetHeight)
						- (this.scrollTop + element.sticky.rect.height) + "px" },
				);
			} else {
				if (element.sticky.stickyClass) element.classList.add(element.sticky.stickyClass);

				this.css(element, { top: element.sticky.marginTop + "px" });
			}
		} else {
			if (element.sticky.stickyClass) element.classList.remove(element.sticky.stickyClass);

			this.css(element, { position: "", width: "", top: "", left: "" });
		}
	}

	/**
	 * Function that updates element sticky rectangle (with sticky container), then activate or deactivate element, then
	 * update position if it"s active
	 * @function
	 */
	public update(element) {
		element.sticky.rect = this.getRectangle(element);
		element.sticky.container.rect = this.getRectangle(element.sticky.container);

		this.activate(element);
	}

	/**
	 * Function that returns container element in which sticky element is stuck (if is not specified, then it"s stuck to
	 * body)
	 * @function
	 * @param {node} element - Element which sticky container are looked for
	 * @return {node} element - Sticky container
	 */
	private getStickyContainer(element) {
		let container = element;

		while (
			!container.hasAttribute("data-sticky-container")
			&& container !== document.querySelector("body")
		) {
			container = container.parentNode;
		}

		return container;
	}

	/**
	 * Function that returns element rectangle & position (width, height, top, left)
	 * @function
	 * @param {node} element - Element which position & rectangle are returned
	 * @return {object}
	 */
	private getRectangle(element) {
		this.css(element, { position: "", width: "", top: "", left: "" });

		const width = Math.max(element.offsetWidth, element.clientWidth);
		const height = Math.max(element.offsetHeight, element.clientHeight);

		let top = 0;
		let left = 0;

		do {
			top += element.offsetTop || 0;
			left += element.offsetLeft || 0;
			element = element.offsetParent;
		} while (element);

		return { top, left, width, height };
	}

	/**
	 * Function that returns viewport dimensions
	 * @function
	 * @return {object}
	 */
	private getViewportSize() {
		return {
			width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
			height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		};
	}

	/**
	 * Function that returns scroll position offset from top
	 * @function
	 * @return {number}
	 */
	private getScrollTopPosition() {
		return (window.pageYOffset || document.body.scrollTop)  - (document.body.clientTop || 0) || 0;
	}

	/**
	 * Helper function for loops
	 * @helper
	 * @param {array}
	 * @param {function} callback - Callback function (no need for explanation)
	 */
	private forEach(array, callback) {
		for (let i = 0, len = array.length; i < len; i++) {
			callback(array[i]);
		}
	}

	/**
	 * Helper function to add/remove css properties for specified element.
	 * @helper
	 * @param {node} element - DOM element
	 * @param {object} properties - CSS properties that will be added/removed from specified element
	 */
	private css(element, properties) {
		for (let property in properties) {
			if (properties.hasOwnProperty(property)) {
				element.style[property] = properties[property];
			}
		}
	}
}
