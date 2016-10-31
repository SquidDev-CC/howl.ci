/// <reference path="../../../typings/main.d.ts" />

namespace HowlCI.Terminal {
	"use strict";

	// Time period to increment the slider by
	const tickLength = 50;
	const valueIncrement = 1e5 * tickLength;

	export class TerminalControl {
		// Rendering elements
		private canvas: HTMLCanvasElement;
		private context: CanvasRenderingContext2D;

		// Terminal elements
		private time: HTMLInputElement;
		private log: HTMLPreElement;

		// Terminal data
		private lines: Packets.Packet[];
		private terminals: TerminalData[];

		// Sticky terminal
		private sticky: Sticky;

		// Resize
		private oldWidth: number;
		private oldHeight: number;
		private onResizeHandler : () => void;

		// Playback
		private playing: boolean;
		private playbackId : number|null;

		constructor(id: number, lines: Packets.Packet[], terminals: TerminalData[]) {
			this.lines = lines;
			this.terminals = terminals;

			this.canvas = <HTMLCanvasElement>document.getElementById("computer-" + id);
			this.context = this.canvas.getContext("2d");

			this.time = <HTMLInputElement>document.getElementById("computer-time-" + id);
			const log = this.log = <HTMLPreElement>document.getElementById("computer-output-" + id);

			this.sticky = new Sticky({
				marginTop: 10,
				stickyFor: 800,
			});
			this.sticky.setup(this.canvas.parentElement);

			// Build the log, adding the entries to the list
			let logLength = 0;
			for(let i = 0; i < lines.length; i++) {
				const time = lines[i].time;
				const terminal = terminals[i];
				for(let i = logLength; i < terminal.log.length; i++) {
					const entry = terminal.log[i];
					const kindName = LogKind[entry.kind].toLowerCase();
					const levelName = entry.level.replace(/[^\w-]/g, "").toLowerCase();

					const element = document.createElement("p");
					element.style.display = "hidden";
					element.className = `log-entry log-${kindName}`;
					element.setAttribute("data-time", time.toString());

					const kind = document.createElement("span");
					kind.innerText = `[${levelName}]`;
					kind.className = `log-level log-level-${levelName}`;

					const text = document.createElement("span");
					text.innerText = entry.text;

					element.appendChild(kind);
					element.appendChild(text);

					log.appendChild(element);
				}
				logLength = terminal.log.length;
			}

			// Register resize handlers
			this.onResizeHandler = this.onResize.bind(this);

			// Register playback handlers
			this.playing = true;
			this.time.oninput = () => {
				this.redrawTerminal();
				this.playing = false;
				if(this.playbackId !== null) {
					this.playbackId = null;
					clearTimeout(this.playbackId);
				}
			}
			this.time.onmousedown = () => {
				this.playing = false;
				if(this.playbackId !== null) {
					this.playbackId = null;
					clearTimeout(this.playbackId);
				}
			}
		}

		private redrawTerminal(): void {
			const time = this.time.valueAsNumber;

			let terminal = this.terminals[0];
			for(let i = 1; i < this.lines.length; i++) {
				const line = this.lines[i];
				terminal = this.terminals[i - 1];
				if(line.time > time) {
					break;
				}
			}

			const logLines = this.log.childNodes;
			for(let i = 0; i < logLines.length; i++) {
				const logLine = logLines[i];
				if(logLine instanceof HTMLElement) {
					logLine.style.display = parseInt(logLine.getAttribute("data-time"), 10) > time ? "none" : null;
				}
			}

			const ctx = this.context;

			const sizeX = terminal.sizeX || 51;
			const sizeY = terminal.sizeY || 19;

			// FIXME: We subtract 8 as that is the padding of the parent element. This is a "magic" value.
			const actualWidth = this.canvas.parentElement.clientWidth - 8;

			const width = sizeX * Render.pixelWidth;
			const height = sizeY * Render.pixelHeight;

			let scale = Math.floor(actualWidth / width);

			// Prevent having an empty terminal.
			// Sure, you can't read at thsis level but it is better than nothing.
			if(scale <= 0) scale = 1;

			if(this.canvas.height !== height * scale || this.canvas.width !== width * scale) {
				this.canvas.height = height * scale;
				this.canvas.width = width * scale;
			}

			(<any>ctx).imageSmoothingEnabled = false; // Isn't standardised so we have to cast.
			ctx.oImageSmoothingEnabled = false;
			ctx.webkitImageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;
			ctx.msImageSmoothingEnabled = false;

			if(terminal.sizeX === 0 && terminal.sizeY === 0) {
				Render.bsod(ctx, sizeX, sizeY, scale, "No terminal output");
			} else {
				Render.terminal(ctx, terminal, scale, Math.floor(this.time.valueAsNumber / 400e6) % 2 === 0);
			}
		}

		private onResize(force = false) {
			// Check if we have resized this item
			const element = this.canvas.parentElement;
			if(force || element.clientWidth !== this.oldWidth || element.clientHeight !== this.oldHeight) {
				// Save the new dimensions
				this.oldWidth = element.clientWidth;
				this.oldHeight = element.clientHeight;

				// And redraw/update scrolling as size has changed
				this.redrawTerminal();
				this.sticky.update(this.canvas.parentElement);
			}
		}

		public attach() {
			window.addEventListener('resize', this.onResizeHandler);
			this.onResize(true);

			if(this.playing) {
				// Auto-play the slider
				const increment = () => {
					if(!this.playing) return null;

					this.time.valueAsNumber += valueIncrement;
					if(this.time.valueAsNumber < parseInt(this.time.max, 10)) {
						this.playbackId = setTimeout(increment, tickLength);
					} else {
						this.playing = false;
						this.playbackId = null;
					}

					this.redrawTerminal();
				};

				// If the slider is changed then abort the animation and set the value
				increment();
			}
		}

		public detach() {
			window.removeEventListener('resize', this.onResizeHandler);

			if(this.playbackId !== null) {
				clearTimeout(this.playbackId);
				this.playbackId = null;
			}
		}
	}
}
