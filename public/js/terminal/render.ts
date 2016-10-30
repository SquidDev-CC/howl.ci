/// <reference path="../../../typings/main.d.ts" />

namespace HowlCI.Terminal {
	"use strict";

	const cellWidth = 6;
	const cellHeight = 9;
	const cellGCD = 3; // Common factor which won't result in characters skewing

	const fontWidth = 96;
	const fontHeight = 144;

	// Time period to increment the slider by
	const tickLength = 50;
	const valueIncrement = 1e5 * tickLength;

	// Color code lookups
	const colors = {
		"0": "rgb(240, 240, 240)", // White
		"1": "rgb(242, 178, 51)",  // Orange
		"2": "rgb(229, 127, 216)", // Magenta
		"3": "rgb(153, 178, 242)", // Light blue
		"4": "rgb(222, 222, 108)", // Yellow
		"5": "rgb(127, 204, 25)",  // Lime
		"6": "rgb(242, 178, 204)", // Pink
		"7": "rgb(76, 76, 76)",    // Grey
		"8": "rgb(153, 153, 153)", // Light grey
		"9": "rgb(76, 153, 178)",  // Cyan
		"a": "rgb(178, 102, 229)", // Purple
		"b": "rgb(37, 49, 146)",   // Blue
		"c": "rgb(127, 102, 76)",  // Brown
		"d": "rgb(87, 166, 78)",   // Green
		"e": "rgb(204, 76, 76)",   // Red
		"f": "rgb(0, 0, 0)",       // Black
	};

	const font = new Image();
	const fonts = {};
	font.src = "termFont.png";

	// Generate a series of fonts for each color code
	let fontLoaded = false;
	font.onload = () => {
		for(let key in colors) {
			if(!colors.hasOwnProperty(key)) {
				continue;
			}

			let canvas = document.createElement("canvas");
			let context = canvas.getContext("2d");

			canvas.width = fontWidth;
			canvas.height = fontHeight;

			context.globalCompositeOperation = 'destination-atop';
			context.fillStyle = colors[key];
			context.globalAlpha = 1.0;

			context.fillRect(0, 0, fontWidth, fontHeight);
			context.drawImage(font, 0, 0);

			fonts[key] = canvas;
		}

		fontLoaded = true;
	};

	export class TerminalRender {
		canvas: HTMLCanvasElement;
		context: CanvasRenderingContext2D;

		time: HTMLInputElement;
		log: HTMLPreElement;

		lines: Packets.Packet[];
		terminals: TerminalData[];

		sticky: Sticky;

		constructor(id: number, lines: Packets.Packet[], terminals: TerminalData[]) {
			this.lines = lines;
			this.terminals = terminals;

			this.canvas = <HTMLCanvasElement>document.getElementById("computer-" + id);
			this.context = this.canvas.getContext("2d");

			this.time = <HTMLInputElement>document.getElementById("computer-time-" + id);
			let log = this.log = <HTMLPreElement>document.getElementById("computer-output-" + id);

			this.sticky = new Sticky({
				marginTop: 10,
				stickyFor: 800,
			});
			this.sticky.setup(this.canvas.parentElement);

			// Build the log, adding the entries to the list
			let logLength = 0;
			for(let i = 0; i < lines.length; i++) {
				let time = lines[i].time;
				let terminal = terminals[i];
				for(let i = logLength; i < terminal.log.length; i++) {
					let entry = terminal.log[i];
					let kindName = LogKind[entry.kind].toLowerCase();
					let levelName = entry.level.replace(/[^\w-]/g, "").toLowerCase();

					let element = document.createElement("p");
					element.style.display = "hidden";
					element.className = `log-entry log-${kindName}`;
					element.setAttribute("data-time", time.toString());

					let kind = document.createElement("span");
					kind.innerText = levelName;
					kind.className = `log-level log-level-${levelName}`;

					let text = document.createElement("span");
					text.innerText = entry.text;

					element.appendChild(kind);
					element.appendChild(text);

					log.appendChild(element);
				}
				logLength = terminal.log.length;
			}

			let interacting = false;

			// Auto-play the slider
			let increment = () => {
				if(interacting) return null;

				this.time.valueAsNumber += valueIncrement;
				let id : number | null = null;
				if(this.time.valueAsNumber < parseInt(this.time.max, 10)) {
					id = setTimeout(increment, tickLength);
				}

				this.redrawTerminal();
				return id;
			};

			// If the slider is changed then abort the animation and set the value
			let timeout = increment();
			this.time.oninput = () => {
				this.redrawTerminal();
				interacting = true;
				if(timeout !== null) clearTimeout(timeout);
			}
			this.time.onmousedown = () => {
				interacting = true;
				if(timeout !== null) clearTimeout(timeout);
			}

			new ResizeSensor.ResizeSensor(this.canvas.parentElement, () => {
				this.redrawTerminal();
				this.sticky.update(this.canvas.parentElement);
			});
		}

		redrawTerminal(): void {
			let time = this.time.valueAsNumber;

			let terminal = this.terminals[0];
			for(let i = 1; i < this.lines.length; i++) {
				let line = this.lines[i];
				terminal = this.terminals[i - 1];
				if(line.time > time) {
					break;
				}
			}

			let logLines = this.log.childNodes;
			for(let i = 0; i < logLines.length; i++) {
				let logLine = logLines[i];
				if(logLine instanceof HTMLElement) {
					logLine.style.display = parseInt(logLine.getAttribute("data-time"), 10) > time ? "none" : null;
				}
			}

			let ctx = this.context;
			ctx.fillStyle = colors.f;

			let sizeX = terminal.sizeX || 51;
			let sizeY = terminal.sizeY || 19;

			// Attempt to scale the canvas down to fit the screen
			// We have to clamp it to a particular scale level to avoid textures being weird.
			let actualWidth = this.canvas.parentElement.clientWidth - 40;

			let width = sizeX * cellWidth;
			let height = sizeY * cellHeight;
			let scale = actualWidth / width;

			scale = Math.floor(scale * 3) / 3;
			if(scale == 0) scale = 1/3;

			if(this.canvas.height !== height * scale || this.canvas.width !== width * scale) {
				this.canvas.height = height * scale;
				this.canvas.width = width * scale;
			}

			(<any>ctx).imageSmoothingEnabled = false; // Isn't standardised yet so...
			ctx.oImageSmoothingEnabled = false;
			ctx.webkitImageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;
			ctx.msImageSmoothingEnabled = false;

			if(terminal.sizeX === 0 && terminal.sizeY === 0) {
				ctx.beginPath();
				ctx.rect(0, 0, width * scale, height * scale);
				ctx.fillStyle = colors["b"];
				ctx.fill();

				let str = "No terminal output";
				let startX = Math.floor((sizeX - str.length) / 2);
				let startY = Math.floor((sizeY - 1) / 2);
				for(let x = 0; x < str.length; x++) {
					this.renderForeground(startX + x, startY, "0", str.charAt(x), scale);
				}

				return;
			}

			for(let y = 0; y < terminal.sizeY; y++) {
				for(let x = 0; x < terminal.sizeX; x++) {
					this.renderBackground(x, y, terminal.back[y].charAt(x), scale);
					this.renderForeground(x, y, terminal.fore[y].charAt(x), terminal.text[y].charAt(x), scale);
				}
			}

			if(
				terminal.cursorBlink &&
				terminal.cursorX >= 0 && terminal.cursorX < sizeX &&
				terminal.cursorY >= 0 && terminal.cursorY < sizeY &&
				Math.floor(this.time.valueAsNumber / 400e6) % 2 === 0
			) {
				 this.renderForeground(terminal.cursorX, terminal.cursorY, terminal.currentFore, "_", scale);
			}
		}

		private renderBackground(x: number, y: number, color: string, scale: number):void {
			let ctx = this.context;

			let actualWidth = cellWidth * scale;
			let actualHeight = cellHeight * scale;
			let cellX = x * actualWidth;
			let cellY = y * actualHeight;

			ctx.beginPath();
			ctx.rect(cellX, cellY, actualWidth, actualHeight);
			ctx.fillStyle = colors[color];
			ctx.fill();
		}

		private renderForeground(x: number, y: number, color: string, chr: string, scale: number):void {
			if(!fontLoaded) return;

			let ctx = this.context;

			let actualWidth = cellWidth * scale;
			let actualHeight = cellHeight * scale;
			let cellX = x * actualWidth;
			let cellY = y * actualHeight;

			let point = chr.charCodeAt(0);

			let imgX = (point % (fontWidth / cellWidth)) * cellWidth;
			let imgY = Math.floor(point / (fontHeight / cellHeight)) * cellHeight;

			ctx.drawImage(
				fonts[color],
				imgX, imgY, cellWidth, cellHeight,
				cellX, cellY, cellWidth * scale, cellHeight * scale
			);
		}
	}
}
