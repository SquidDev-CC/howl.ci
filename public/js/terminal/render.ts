namespace HowlCI.Terminal {
	"use strict";

	const cellWidth = 6;
	const cellHeight = 9;

	const fontWidth = 96;
	const fontHeight = 144;

	const terminalScale = 2;
	const border = 4;

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

		overlayCanvas: HTMLCanvasElement;
		overlayContext: CanvasRenderingContext2D;

		time: HTMLInputElement;

		lines: Packets.Packet[];
		terminals: TerminalData[];

		constructor(id: number, lines: Packets.Packet[], terminals: TerminalData[]) {
			this.lines = lines;
			this.terminals = terminals;

			this.canvas = <HTMLCanvasElement>document.getElementById("computer-" + id);
			this.context = this.canvas.getContext("2d");

			this.overlayCanvas = <HTMLCanvasElement>document.getElementById("computer-overlay-" + id);
			this.overlayContext = this.overlayCanvas.getContext("2d");

			this.time = <HTMLInputElement>document.getElementById("computer-time-" + id);

			let interacting = false;

			// Auto-play the slider
			let increment = () => {
				if(interacting) return null;

				this.time.value = (parseInt(this.time.value, 10) + valueIncrement).toString();
				let id : number | null = null;
				if(this.time.value < this.time.max) {
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
		}

		redrawTerminal(): void {
			let time = this.time.valueAsNumber;

			let terminal = this.terminals[0];
			for(let i = 1; i < this.lines.length; i++) {
				let line = this.lines[i];
				if(line.time > time) {
					terminal = this.terminals[i - 1];
					break;
				}
			}

			let ctx = this.context;
			ctx.fillStyle = colors.f;

			let sizeX = terminal.sizeX || 51;
			let sizeY = terminal.sizeY || 19;

			let height = sizeY * cellHeight * terminalScale + border * 2;
			let width = sizeX * cellWidth * terminalScale + border * 2;

			this.canvas.height = this.overlayCanvas.height = height;
			this.canvas.width = this.overlayCanvas.width = width;
			this.time.style.width = width + "px";

			ctx.imageSmoothingEnabled = false;
			ctx.oImageSmoothingEnabled = false;
			ctx.webkitImageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;
			ctx.msImageSmoothingEnabled = false;

			ctx.beginPath();
			ctx.rect(0, 0, border, height);
			ctx.fill();

			ctx.beginPath();
			ctx.rect(width - border, 0, border, height);
			ctx.fill();

			ctx.beginPath();
			ctx.rect(0, 0, width, border);
			ctx.fill();

			ctx.beginPath();
			ctx.rect(0, height - border, width, border);
			ctx.fill();

			if(terminal.sizeX === 0 && terminal.sizeY === 0) {
				ctx.beginPath();
				ctx.rect(border, border, width - border * 2, height - border * 2);
				ctx.fillStyle = colors["b"];
				ctx.fill();

				let str = "No terminal output";
				let startX = Math.floor((sizeX - str.length) / 2);
				let startY = Math.floor((sizeY - 1) / 2);
				for(let x = 0; x < str.length; x++) {
					this.renderForeground(startX + x, startY, "0", str.charAt(x));
				}

				return;
			}

			for(let y = 0; y < terminal.sizeY; y++) {
				for(let x = 0; x < terminal.sizeX; x++) {
					this.renderBackground(x, y, terminal.back[y].charAt(x));
					this.renderForeground(x, y, terminal.fore[y].charAt(x), terminal.text[y].charAt(x));
				}
			}
		}

		private renderBackground(x: number, y: number, color: string):void {
			let ctx = this.context;

			let actualWidth = cellWidth * terminalScale;
			let actualHeight = cellHeight * terminalScale;
			let cellX = x * actualWidth + border;
			let cellY = y * actualHeight + border;

			ctx.beginPath();
			ctx.rect(cellX, cellY, actualWidth, actualHeight);
			ctx.fillStyle = colors[color];
			ctx.fill();
		}

		private renderForeground(x: number, y: number, color: string, chr: string):void {
			if(!fontLoaded) return;

			let ctx = this.context;

			let actualWidth = cellWidth * terminalScale;
			let actualHeight = cellHeight * terminalScale;
			let cellX = x * actualWidth + border;
			let cellY = y * actualHeight + border;

			let point = chr.charCodeAt(0);

			let imgX = (point % (fontWidth / cellWidth)) * cellWidth;
			let imgY = Math.floor(point / (fontHeight / cellHeight)) * cellHeight;

			ctx.drawImage(
				fonts[color],
				imgX, imgY, cellWidth, cellHeight,
				cellX, cellY, cellWidth * terminalScale, cellHeight * terminalScale
			);
		}
	}
}
