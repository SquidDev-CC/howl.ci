namespace HowlCI.Terminal.Render {
	"use strict";

	const cellWidth = 6;
	const cellHeight = 9;

	// Computed from above: the GCD of the two dimensions.
	// By always scaling to an integer we ensure the texture offsets are also integers.
	const cellGCD = 3;

	export const pixelWidth = cellWidth / cellGCD;
	export const pixelHeight = cellHeight / cellGCD;

	export const margin = 4;

	const fontWidth = 96;
	const fontHeight = 144;

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
		for (const key in colors) {
			if (!colors.hasOwnProperty(key)) continue;

			const canvas = document.createElement("canvas");
			const context = <CanvasRenderingContext2D> canvas.getContext("2d");

			canvas.width = fontWidth;
			canvas.height = fontHeight;

			context.globalCompositeOperation = "destination-atop";
			context.fillStyle = colors[key];
			context.globalAlpha = 1.0;

			context.fillRect(0, 0, fontWidth, fontHeight);
			context.drawImage(font, 0, 0);

			fonts[key] = canvas;
		}

		fontLoaded = true;
	};

	export const background = (
		ctx: CanvasRenderingContext2D, x: number, y: number,
		color: string, scale: number,
		width: number, height: number,
	): void => {
		scale /= 3;

		let actualWidth = cellWidth * scale;
		let actualHeight = cellHeight * scale;
		let cellX = x * actualWidth + margin;
		let cellY = y * actualHeight + margin;

		if (x === 0) {
			cellX -= margin;
			actualWidth += margin;
		}
		if (x === width - 1) {
			actualWidth += margin;
		}

		if (y === 0) {
			cellY -= margin;
			actualHeight += margin;
		}
		if (y === height - 1) {
			actualHeight += margin;
		}

		ctx.beginPath();
		ctx.rect(cellX, cellY, actualWidth, actualHeight);
		ctx.fillStyle = colors[color];
		ctx.fill();
	};

	export const foreground = (
		ctx: CanvasRenderingContext2D, x: number, y: number,
		color: string, chr: string, scale: number,
	): void => {
		if (!fontLoaded) return;

		scale /= 3;

		const actualWidth = cellWidth * scale;
		const actualHeight = cellHeight * scale;
		const cellX = x * actualWidth + margin;
		const cellY = y * actualHeight + margin;

		const point = chr.charCodeAt(0);

		const imgX = (point % (fontWidth / cellWidth)) * cellWidth;
		const imgY = Math.floor(point / (fontHeight / cellHeight)) * cellHeight;

		ctx.drawImage(
			fonts[color],
			imgX, imgY, cellWidth, cellHeight,
			cellX, cellY, cellWidth * scale, cellHeight * scale,
		);
	};

	export const terminal = (ctx: CanvasRenderingContext2D, term: TerminalData, scale: number, blink: boolean) => {
		const sizeX = term.sizeX;
		const sizeY = term.sizeY;

		for (let y = 0; y < sizeY; y++) {
			for (let x = 0; x < sizeX; x++) {
				background(ctx, x, y, term.back[y].charAt(x), scale, term.sizeX, term.sizeY);
				foreground(ctx, x, y, term.fore[y].charAt(x), term.text[y].charAt(x), scale);
			}
		}

		if (
			blink && term.cursorBlink &&
			term.cursorX >= 0 && term.cursorX < sizeX &&
			term.cursorY >= 0 && term.cursorY < sizeY
		) {
			foreground(ctx, term.cursorX, term.cursorY, term.currentFore, "_", scale);
		}
	};

	export const bsod = (
		ctx: CanvasRenderingContext2D, width: number, height: number,
		scale: number, text: string,
	) => {
		const oScale = scale / 3;

		ctx.beginPath();
		ctx.rect(
			0, 0,
			width * cellWidth * oScale + margin * 2,
			height * cellHeight * oScale + margin * 2,
		);
		ctx.fillStyle = colors.b;
		ctx.fill();

		const startX = Math.floor((width - text.length) / 2);
		const startY = Math.floor((height - 1) / 2);
		for (let x = 0; x < text.length; x++) {
			foreground(ctx, startX + x, startY, "0", text.charAt(x), scale);
		}
	};
}
