/// <reference path="../../../typings/main.d.ts" />

namespace HowlCI.Terminal {
	"use strict";

	// Time period to increment the slider by
	const tickLength = 50;
	const valueIncrement = 1e5 * tickLength;

	class PlaybackControl {
		private useTime: HTMLInputElement;
		private usePackets: HTMLInputElement;

		private goBack: HTMLLinkElement;
		private goForward: HTMLLinkElement;
		private play: HTMLLinkElement;
		private pause: HTMLLinkElement;

		private progress: HTMLInputElement;

		private playing: boolean = true;
		private playingId: number|null = null;
		private playingTick: () => void;

		constructor(id: number, callback: () => void) {
			this.useTime = <HTMLInputElement> document.getElementById("playback-time-" + id);
			this.usePackets = <HTMLInputElement> document.getElementById("playback-time-" + id);

			this.goBack = <HTMLLinkElement> document.getElementById("playback-back-" + id);
			this.goForward = <HTMLLinkElement> document.getElementById("playback-forward-" + id);
			this.play = <HTMLLinkElement> document.getElementById("playback-play-" + id);
			this.pause = <HTMLLinkElement> document.getElementById("playback-pause-" + id);

			this.progress = <HTMLInputElement> document.getElementById("playback-progress-" + id);

			// Register playback handlers
			this.playing = true;
			this.progress.onmousedown = this.progress.oninput = () => {
				callback();
				this.doPause();
			};

			this.playingTick = () => {
				if (!this.playing) return null;

				this.progress.valueAsNumber += valueIncrement;
				if (this.progress.valueAsNumber < parseInt(this.progress.max, 10)) {
					this.playingId = setTimeout(this.playingTick, tickLength);
				} else {
					this.playing = false;
					this.playingId = null;
				}

				callback();
			}

			this.play.onclick = () => {
				this.doPlay();
				return false;
			}

			this.pause.onclick = () => {
				this.doPause();
				return false;
			}

			this.useTime.onchange = this.usePackets.onchange = () => {

			}
		}

		private doPause() {
			this.playing = false;
			if (this.playingId !== null) {
				clearTimeout(this.playingId);
				this.playingId = null;
			}

			this.play.parentElement.style.display = null;
			this.pause.parentElement.style.display = "none";
		}

		private doPlay() {
			this.playing = true;

			if(this.playingId === null) {
				this.playingTick();
			}

			this.play.parentElement.style.display = "none";
			this.pause.parentElement.style.display = null;
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

		public getTime():number {
			return this.progress.valueAsNumber;
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

		constructor(id: number, lines: Packets.Packet[], terminals: TerminalData[]) {
			this.lines = lines;
			this.terminals = terminals;

			this.canvas = <HTMLCanvasElement> document.getElementById("computer-" + id);
			this.context = <CanvasRenderingContext2D> this.canvas.getContext("2d");

			const log = this.log = <HTMLPreElement> document.getElementById("computer-output-" + id);
			this.follow = <HTMLInputElement> document.getElementById("computer-follow-" + id);

			this.playback = new PlaybackControl(id, this.redrawTerminal.bind(this));
			this.playbackWrapper = <HTMLElement> document.getElementById("playback-" + id)

			this.sticky = new Sticky();
			this.sticky.setup(this.canvas.parentElement, { marginTop: 50, stickyFor: 800 });
			this.sticky.setup(this.playbackWrapper, { marginTop: 0, stickyClass: "fixed" });

			// Build the log, adding the entries to the list
			let logLength = 0;
			for (let i = 0; i < lines.length; i++) {
				const time = lines[i].time;
				const terminal = terminals[i];
				for (let i = logLength; i < terminal.log.length; i++) {
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

			// Setup handler objects
			this.onResizeHandler = this.onResize.bind(this);
			this.onScrollHandler = this.onScroll.bind(this);

			this.follow.onchange = this.doScroll.bind(this);
		}

		private redrawTerminal(): void {
			const time = this.playback.getTime();

			let terminal = this.terminals[0];
			for (let i = 1; i < this.lines.length; i++) {
				const line = this.lines[i];
				terminal = this.terminals[i - 1];
				if (line.time > time) {
					break;
				}
			}

			const logLines = this.log.childNodes;
			for (let i = 0; i < logLines.length; i++) {
				const logLine = logLines[i];
				if (logLine instanceof HTMLElement) {
					let line = <string> logLine.getAttribute("data-time");
					logLine.style.display = parseInt(line, 10) > time ? "none" : null;
				}
			}

			this.doScroll();

			const ctx = this.context;

			const sizeX = terminal.sizeX || 51;
			const sizeY = terminal.sizeY || 19;

			// FIXME: We subtract 8 as that is the padding of the parent element. This is a "magic" value.
			const actualWidth = this.canvas.parentElement.clientWidth - 8;

			const width = sizeX * Render.pixelWidth;
			const height = sizeY * Render.pixelHeight;

			let scale = Math.floor(actualWidth / width);

			// Prevent having an empty terminal.
			// Sure, you can"t read at thsis level but it is better than nothing.
			if (scale <= 0) scale = 1;

			if (this.canvas.height !== height * scale || this.canvas.width !== width * scale) {
				this.canvas.height = height * scale;
				this.canvas.width = width * scale;
			}

			(<any> ctx).imageSmoothingEnabled = false; // Isn"t standardised so we have to cast.
			ctx.oImageSmoothingEnabled = false;
			ctx.webkitImageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;
			ctx.msImageSmoothingEnabled = false;

			if (terminal.sizeX === 0 && terminal.sizeY === 0) {
				Render.bsod(ctx, sizeX, sizeY, scale, "No terminal output");
			} else {
				Render.terminal(ctx, terminal, scale, Math.floor(this.playback.getTime() / 400e6) % 2 === 0);
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
			if(Math.abs(window.scrollY - this.expectedScroll) > 10) {
				this.follow.checked = false;
			}
		}

		private doScroll() {
			if(this.follow.checked) {
				// Scroll the window to the bottom of the log.
				// We have a flag to suppress scroll events
				let scroll = this.expectedScroll = this.log.parentElement.offsetTop + this.log.parentElement.scrollHeight - window.innerHeight + 10;
				window.scrollTo(window.scrollX, scroll);
			}
		}

		public attach() {
			this.resizeSensor = new ResizeSensor.ResizeSensor(document.body, this.onResizeHandler);
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
