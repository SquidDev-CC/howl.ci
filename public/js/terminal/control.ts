/// <reference path="../../../typings/main.d.ts" />

namespace HowlCI.Terminal {
	"use strict";

	// Time period to increment the slider by
	const tickLengthMilli = 50;
	const tickLengthSec = tickLengthMilli * 1e-3;

	// Create an event handler for holding down a button
	const addHold = (elem: HTMLElement, callback: () => void) => {
		let id = 0;
		let holding = false;

		const handler = () => {
			if (holding) {
				callback();
				id = setTimeout(handler, tickLengthMilli);
			}
		};

		elem.onclick = () => false;
		elem.onmousedown = () => {
			if (!holding) {
				holding = true;
				callback();

				// Initial delay for press
				id = setTimeout(handler, 300);
			}

			return false;
		};

		elem.onmouseup = () => {
			if (holding) {
				holding = false;
				clearTimeout(id);
			}

			return false;
		};
	};

	class PlaybackControl {
		private lines: Packets.PacketCollection;

		private useTime: HTMLInputElement;
		private usePackets: HTMLInputElement;
		private speedTime: HTMLInputElement;
		private speedPackets: HTMLInputElement;

		private goBack: HTMLLinkElement;
		private goForward: HTMLLinkElement;
		private play: HTMLLinkElement;
		private pause: HTMLLinkElement;

		private progress: HTMLInputElement;

		private playing: boolean = true;
		private playingId: number|null = null;
		private playingTick: () => void;

		constructor(id: number, lines: Packets.PacketCollection, callback: (id: number) => void) {
			this.lines = lines;

			this.useTime = <HTMLInputElement> document.getElementById("playback-time-" + id);
			this.usePackets = <HTMLInputElement> document.getElementById("playback-packet-" + id);
			this.speedTime = <HTMLInputElement> document.getElementById("playback-speed-time-" + id);
			this.speedPackets = <HTMLInputElement> document.getElementById("playback-speed-packet-" + id);

			this.goBack = <HTMLLinkElement> document.getElementById("playback-back-" + id);
			this.goForward = <HTMLLinkElement> document.getElementById("playback-forward-" + id);
			this.play = <HTMLLinkElement> document.getElementById("playback-play-" + id);
			this.pause = <HTMLLinkElement> document.getElementById("playback-pause-" + id);

			this.progress = <HTMLInputElement> document.getElementById("playback-progress-" + id);

			// Register playback handlers
			this.playing = true;
			this.progress.onmousedown = this.progress.oninput = () => {
				callback(this.getId());
				this.doPause();
			};

			this.playingTick = () => {
				if (!this.playing) return null;

				this.progress.valueAsNumber += this.useTime.checked
					? this.speedTime.valueAsNumber * 1e9 * tickLengthSec
					: this.speedPackets.valueAsNumber * tickLengthSec;

				if (this.progress.valueAsNumber < parseInt(this.progress.max, 10)) {
					this.playingId = setTimeout(this.playingTick, tickLengthMilli);
				} else {
					this.doPause();
				}

				callback(this.getId());
			};

			this.play.onclick = () => {
				this.doPlay();
				return false;
			};

			this.pause.onclick = () => {
				this.doPause();
				return false;
			};

			addHold(this.goBack, () => {
				this.doPause();
				const before = this.getId();
				this.progress.valueAsNumber -= this.useTime.checked
					? this.speedTime.valueAsNumber * 1e9 * tickLengthSec
					: 1;
				callback(this.getId());
			});

			addHold(this.goForward, () => {
				this.doPause();
				const before = this.getId();
				this.progress.valueAsNumber += this.useTime.checked
					? this.speedTime.valueAsNumber * 1e9 * tickLengthSec
					: 1;
				callback(this.getId());
			});

			this.useTime.onchange = this.usePackets.onchange = () => {
				const useTime = this.useTime.checked;
				// We invert as the value has already changed
				const termId = this.getIdWithMode(!useTime);

				if (useTime) {
					const line = this.lines.lines[termId];

					this.progress.min = this.lines.minTime.toString();
					this.progress.max = this.lines.maxTime.toString();
					this.progress.valueAsNumber = line.time;
					this.progress.step = "1";

					this.speedTime.parentElement.style.display = null;
					this.speedPackets.parentElement.style.display = "none";
				} else {
					this.progress.min = "0";
					this.progress.max = (this.lines.lines.length - 1).toString();
					this.progress.valueAsNumber = termId;
					this.progress.step = "0.01";

					this.speedTime.parentElement.style.display = "none";
					this.speedPackets.parentElement.style.display = null;
				}

				callback(termId);
			};

			this.speedPackets.parentElement.style.display = "none";
		}

		private doPause() {
			this.playing = false;
			if (this.playingId !== null) {
				clearTimeout(this.playingId);
				this.playingId = null;
			}

			this.play.style.display = null;
			this.pause.style.display = "none";
		}

		private doPlay() {
			this.playing = true;

			if (this.playingId === null) {
				this.playingTick();
			}

			this.play.style.display = "none";
			this.pause.style.display = null;
		}

		public attach() {
			if (this.playing) this.doPlay();
		}

		public detach() {
			if (this.playingId !== null) {
				clearTimeout(this.playingId);
				this.playingId = null;
			}
		}

		public getId(): number {
			return this.getIdWithMode(this.useTime.checked);
		}

		private getIdWithMode(useTime: boolean): number {
			const val = Math.floor(this.progress.valueAsNumber);
			if (useTime) {
				let termId = 0;
				const lines = this.lines.lines;
				for (let i = 1; i < lines.length; i++) {
					termId = i - 1;
					if (lines[i].time > val) break;
				}
				return termId;
			} else {
				return val;
			}
		}

		public getTime(): number {
			if (this.useTime.checked) {
				return this.progress.valueAsNumber;
			} else {
				// TODO: Interpolate between multiple terminals depending on the slider
				const termId = Math.floor(this.progress.valueAsNumber);
				return this.lines.lines[termId].time;
			}
		}
	}

	export class TerminalControl {
		// Rendering elements
		private canvas: HTMLCanvasElement;
		private context: CanvasRenderingContext2D;

		// Terminal elements
		private log: HTMLPreElement;
		private follow: HTMLInputElement;

		private playback: PlaybackControl;
		private playbackWrapper: HTMLElement;
		private lastTerminalId: number = -1;
		private lastBlink: boolean = false;

		// Terminal data
		private lines: Packets.Packet[];
		private terminals: TerminalData[];

		// Sticky terminal
		private sticky: Sticky;

		// Scrolling
		private expectedScroll: number;
		private onScrollHandler: () => void;

		// Resize
		private oldWidth: number;
		private oldHeight: number;
		private onResizeHandler: () => void;
		private resizeSensor: any|null;

		constructor(id: number, lines: Packets.PacketCollection, terminals: TerminalData[]) {
			this.lines = lines.lines;
			this.terminals = terminals;

			this.canvas = <HTMLCanvasElement> document.getElementById("computer-" + id);
			this.context = <CanvasRenderingContext2D> this.canvas.getContext("2d");

			const log = this.log = <HTMLPreElement> document.getElementById("computer-output-" + id);
			this.follow = <HTMLInputElement> document.getElementById("computer-follow-" + id);

			this.playback = new PlaybackControl(id, lines, this.redrawTerminal.bind(this));
			this.playbackWrapper = <HTMLElement> document.getElementById("playback-" + id);

			this.sticky = new Sticky();
			this.sticky.setup(this.canvas.parentElement, { marginTop: 50, stickyFor: 800 });
			this.sticky.setup(this.playbackWrapper, { marginTop: 0, stickyClass: "fixed" });

			// Build the log, adding the entries to the list
			let logLength = 0;
			for (let termId = 0; termId < lines.lines.length; termId++) {
				const time = lines.lines[termId].time;
				const terminal = terminals[termId];
				for (let lineId = logLength; lineId < terminal.log.length; lineId++) {
					const line = terminal.log[lineId];
					const kindName = LogKind[line.kind].toLowerCase();
					const levelName = line.level.replace(/[^\w-]/g, "").toLowerCase();

					const element = document.createElement("p");
					element.style.display = "hidden";
					element.className = `log-entry log-${kindName}`;
					element.setAttribute("data-terminal", termId.toString());

					const kind = document.createElement("span");
					kind.innerText = `[${levelName}]`;
					kind.className = `log-level log-level-${levelName}`;

					const text = document.createElement("span");
					text.innerText = line.text;

					element.appendChild(kind);
					element.appendChild(text);

					log.appendChild(element);
				}
				logLength = terminal.log.length;
			}

			// Setup handler objects
			this.onResizeHandler = this.onResize.bind(this);
			this.onScrollHandler = this.onScroll.bind(this);

			this.follow.onchange = this.doScroll.bind(this);
		}

		private redrawTerminal(id?: number): void {
			// If id is undefined then we *must* redraw
			const changed = id === undefined || id !== this.lastTerminalId;

			const termId = this.lastTerminalId = id === undefined ? this.playback.getId() : id;

			const terminal = this.terminals[termId];
			const line = this.lines[termId];

			const sizeX = terminal.sizeX || 51;
			const sizeY = terminal.sizeY || 19;

			const blink = Math.floor(this.playback.getTime() / 400e6) % 2 === 0;

			// Abort as soon as possible if we don't need to redraw at all.
			if (
				!changed &&
				(
					!terminal.cursorBlink || this.lastBlink === blink ||
					terminal.cursorX < 0 || terminal.cursorX >= sizeX ||
					terminal.cursorY < 0 || terminal.cursorY >= sizeY
				)
			) {
				return;
			}
			this.lastBlink = blink;

			const ctx = this.context;

			// Calculate terminal scaling to fit the screen
			const actualWidth = this.canvas.parentElement.clientWidth - Render.margin;

			const width = sizeX * Render.pixelWidth;
			const height = sizeY * Render.pixelHeight;

			// It has to be an integer (though converted within the renderer) to ensure pixels are integers.
			// Otherwise you get texture issues.
			let scale = Math.floor(actualWidth / width);

			// Prevent having an empty terminal.
			// Sure, you can"t read at thsis level but it is better than nothing.
			if (scale <= 0) scale = 1;

			// If we're just redrawing the cursor. We've aborted earlier if the cursor is not visible/
			// out of range and hasn't changed.
			if (!changed) {
				if (blink) {
					Render.foreground(ctx, terminal.cursorX, terminal.cursorY, terminal.currentFore, "_", scale);
				} else {
					const x = terminal.cursorX;
					const y = terminal.cursorY;

					Render.background(ctx, x, y, terminal.back[y][x], scale, sizeX, sizeY);
					Render.foreground(ctx, x, y, terminal.fore[y][x],  terminal.text[y][x], scale);
				}

				return;
			}

			// Update the log lines
			const logLines = this.log.childNodes;
			for (let i = 0; i < logLines.length; i++) {
				const logLine = logLines[i];
				if (logLine instanceof HTMLElement) {
					let elem = <string> logLine.getAttribute("data-terminal");
					logLine.style.display = parseInt(elem, 10) > termId ? "none" : null;
				}
			}

			this.doScroll();

			// Actually update the canvas dimensions.
			const canvasWidth = width * scale + Render.margin * 2;
			const canvasHeight = height * scale + Render.margin * 2;

			if (this.canvas.height !== canvasHeight || this.canvas.width !== canvasWidth) {
				this.canvas.height = canvasHeight;
				this.canvas.width = canvasWidth;
			}

			// Prevent blur when up/down-scaling
			(<any> ctx).imageSmoothingEnabled = false; // Isn"t standardised so we have to cast.
			ctx.oImageSmoothingEnabled = false;
			ctx.webkitImageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;
			ctx.msImageSmoothingEnabled = false;

			// And render!
			if (terminal.sizeX === 0 && terminal.sizeY === 0) {
				Render.bsod(ctx, sizeX, sizeY, scale, "No terminal output");
			} else {
				Render.terminal(ctx, terminal, scale, blink);
			}
		}

		private onResize(force = false) {
			// Check if we have resized this item
			const element = this.canvas.parentElement;
			if (force || element.clientWidth !== this.oldWidth || element.clientHeight !== this.oldHeight) {
				// Save the new dimensions
				this.oldWidth = element.clientWidth;
				this.oldHeight = element.clientHeight;

				// And redraw/update scrolling as size has changed
				this.redrawTerminal();
				this.sticky.update(this.canvas.parentElement);
				this.sticky.update(this.playbackWrapper);
			}
		}

		private onScroll(e: Event) {
			if (Math.abs(window.scrollY - this.expectedScroll) > 10) {
				this.follow.checked = false;
			}
		}

		private doScroll() {
			if (this.follow.checked) {
				// Scroll the window to the bottom of the log.
				// We have a flag to suppress scroll events
				const bottom = this.log.parentElement.offsetTop + this.log.parentElement.scrollHeight;
				const scroll = this.expectedScroll = bottom - window.innerHeight + 10;
				window.scrollTo(window.scrollX, scroll);
			}
		}

		public attach() {
			this.resizeSensor = ResizeSensor.attach(document.body, this.onResizeHandler);
			this.onResize(true);
			this.doScroll();

			this.playback.attach();

			window.addEventListener("scroll", this.onScrollHandler);
		}

		public detach() {
			window.removeEventListener("scroll", this.onScrollHandler);

			ResizeSensor.detach(document.body);
			this.playback.detach();
		}
	}
}
