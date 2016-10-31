/// <reference path="../../../typings/main.d.ts" />

namespace HowlCI.Terminal {
	// Time period to increment the slider by
	const tickLength = 50;
	const valueIncrement = 1e5 * tickLength;

	export class TerminalControl {
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

			let interacting = false;

			// Auto-play the slider
			const increment = () => {
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
			const timeout = increment();
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
	}
}
