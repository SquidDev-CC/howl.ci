/**
 * Copyright (c) 2013 Marc J. Schmidt
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * @license https://github.com/marcj/css-element-queries/blob/master/LICENSE
 */
namespace ResizeSensor {

	// Only used for the dirty checking, so the event callback count is limted to max 1 call per fps per sensor.
	// In combination with the event based resize sensor this saves cpu time, because the sensor is too fast and
	// would generate too many unnecessary events.
	const requestAnimationFrame = window.requestAnimationFrame ||
		(window as any).mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		(fn => window.setTimeout(fn, 20));

	/**
	 * Iterate over each of the provided element(s).
	 *
	 * @param {HTMLElement|HTMLElement[]} elements
	 * @param {Function}                  callback
	 */
	function forEachElement(elements: HTMLElement|NodeList|HTMLElement[], callback) {
		const elementsType = Object.prototype.toString.call(elements);

		const isCollectionTyped = ("[object Array]" === elementsType
			|| ("[object NodeList]" === elementsType)
			|| ("[object HTMLCollection]" === elementsType)
		);
		if (isCollectionTyped) {
			const j = (elements as HTMLElement[]).length;
			for (let i; i < j; i++) {
				callback(elements[i]);
			}
		} else {
			callback(elements);
		}
	}

	/**
	 *
	 * @constructor
	 */
	const EventQueue = function() {
		let  q: Array<() => void> = [];
		this.add = ev => q.push(ev);

		this.call = () => {
			const l = q.length;
			for (let i = 0; i < l; i++) {
				q[i].call(null);
			}
		};

		this.remove = (ev) => {
			const newQueue: Array<() => void> = [];
			const l = q.length;
			for (let i = 0; i < l; i++) {
				if (q[i] !== ev) newQueue.push(q[i]);
			}
			q = newQueue;
		};

		this.length = () => q.length;
	};

	/**
	 * @param {HTMLElement} element
	 * @param {String}      prop
	 * @returns {String|Number}
	 */
	const getComputedStyle = (element, prop) => {
		if (element.currentStyle) {
			return element.currentStyle[prop];
		} else if (window.getComputedStyle) {
			return window.getComputedStyle(element).getPropertyValue(prop);
		} else {
			return element.style[prop];
		}
	};

	/**
	 * Class for dimension change detection.
	 *
	 * @param {Element|Element[]|Elements|jQuery} element
	 * @param {Function} callback
	 *
	 * @constructor
	 */
	export const attach = (elements: HTMLElement|NodeList|HTMLElement[], callback: () => void): void => {
		/**
		 *
		 * @param {HTMLElement} element
		 * @param {Function}    resized
		 */
		function attachResizeEvent(element, resized) {
			if (!element.resizedAttached) {
				element.resizedAttached = new EventQueue();
				element.resizedAttached.add(resized);
			} else if (element.resizedAttached) {
				element.resizedAttached.add(resized);
				return;
			}

			element.resizeSensor = document.createElement("div");
			element.resizeSensor.className = "resize-sensor";
			const style = "position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1;"
				+ "visibility: hidden;";
			const styleChild = "position: absolute; left: 0; top: 0; transition: 0s;";

			element.resizeSensor.style.cssText = style;
			element.resizeSensor.innerHTML =
				`<div class="resize-sensor-expand" style="${style}"><div style="${styleChild}"></div></div>` +
				`<div class="resize-sensor-shrink" style="${style}">` +
					`<div style="${styleChild} width: 200%; height: 200%"></div>` +
				`</div>`;
			element.appendChild(element.resizeSensor);

			if (getComputedStyle(element, "position") === "static") {
				element.style.position = "relative";
			}

			const expand = element.resizeSensor.childNodes[0];
			const expandChild = expand.childNodes[0];
			const shrink = element.resizeSensor.childNodes[1];

			const reset = () => {
				expandChild.style.width  = 100000 + "px";
				expandChild.style.height = 100000 + "px";

				expand.scrollLeft = 100000;
				expand.scrollTop = 100000;

				shrink.scrollLeft = 100000;
				shrink.scrollTop = 100000;
			};

			reset();
			let dirty = false;

			const dirtyChecking = () => {
				if (!element.resizedAttached) return;

				if (dirty) {
					element.resizedAttached.call();
					dirty = false;
				}

				requestAnimationFrame(dirtyChecking);
			};

			requestAnimationFrame(dirtyChecking);
			let lastWidth;
			let lastHeight;
			let cachedWidth; // useful to not query offsetWidth twice
			let cachedHeight;

			const onScroll = () => {
				cachedWidth = element.offsetWidth;
				cachedHeight = element.offsetHeight;
				if (cachedWidth !== lastWidth || cachedHeight !== lastHeight) {
					dirty = true;

					lastWidth = cachedWidth;
					lastHeight = cachedHeight;
				}
				reset();
			};

			const addEvent = (el, name, cb) => {
				if (el.attachEvent) {
					el.attachEvent("on" + name, cb);
				} else {
					el.addEventListener(name, cb);
				}
			};

			addEvent(expand, "scroll", onScroll);
			addEvent(shrink, "scroll", onScroll);
		}

		forEachElement(elements, (elem) => {
			attachResizeEvent(elem, callback);
		});
	};

	export const detach = (element, ev?: (() => void)) => {
		forEachElement(element, (elem) => {
			if (elem.resizedAttached && typeof ev === "function") {
				elem.resizedAttached.remove(ev);
				if (elem.resizedAttached.length()) return;
			}
			if (elem.resizeSensor) {
				if (elem.contains(elem.resizeSensor)) {
					elem.removeChild(elem.resizeSensor);
				}
				delete elem.resizeSensor;
				delete elem.resizedAttached;
			}
		});
	};
}
