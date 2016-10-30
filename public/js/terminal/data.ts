namespace HowlCI.Terminal {
	"use strict";

	export enum LogLevel {
		Debug,
		Warning,
		Error,
		Failure,
		Success,
	};

	export class LogItem {
		text:string;
		level:LogLevel;
	}

	let interSplice = function(text:string, partial:string, offset:number) {
		return text.substr(0, offset) + partial + text.substr(offset + partial.length);
	}

	export class TerminalData {
		text: string[];
		fore: string[];
		back: string[];

		currentFore: string;
		currentBack: string;

		sizeX:number;
		sizeY:number;

		cursorX:number;
		cursorY:number;
		cursorBlink:boolean;

		log:LogItem[];

		static empty():TerminalData {
			let data = new TerminalData();
			data.init(0, 0);
			return data;
		}

		init(width:number,height:number):void {
			this.cursorX = 0;
			this.cursorY = 0;
			this.cursorBlink = false;

			this.currentFore = "0";
			this.currentBack = "f";

			this.log = [];

			this.resize(width, height);
		}

		resize(width:number,height:number):void {
			this.sizeX = width;
			this.sizeY = height;

			this.text = new Array(height);
			this.fore = new Array(height);
			this.back = new Array(height);

			let baseText = "", baseFore = "", baseBack = "";
			for(let x = 0; x < width; x++ ) {
				baseText += " ";
				baseFore += this.currentFore;
				baseBack += this.currentBack;
			}
			for(let y = 0; y < height; y++) {
				this.text[y] = baseText;
				this.fore[y] = baseFore;
				this.back[y] = baseBack;
			}
		}

		clone():TerminalData {
			let copied = new TerminalData();
			copied.text = this.text;
			copied.fore = this.fore;
			copied.back = this.back;

			copied.sizeX = this.sizeX;
			copied.sizeY = this.sizeY;

			copied.currentFore = this.currentFore;
			copied.currentBack = this.currentBack;

			copied.cursorX = this.cursorX;
			copied.cursorY = this.cursorY;
			copied.cursorBlink = this.cursorBlink;

			copied.log = this.log;

			return copied;
		}

		handlePacket(code:string, data:string):TerminalData {
			let cloned = this.clone();
			switch(code) {
				case "TC": { // Set cursor position
					let [_, x, y] = data.match(/(-?\d+),(-?\d+)/);
					cloned.cursorX = parseInt(x, 10) - 1;
					cloned.cursorY = parseInt(y, 10) - 1;
					break;
				}
				case "TB": { // Set cursor blink
					cloned.cursorBlink = data === "true";
					break;
				}
				case "TF": { // Set foreground color
					cloned.currentFore = data.charAt(0);
					break;
				}
				case "TK": { // Set background color
					cloned.currentBack = data.charAt(0);
					break;
				}
				case "TR": { // Resizes the terminal
					let [_, width, height] = data.match(/(\d+),(\d+)/);
					cloned.resize(parseInt(width, 10), parseInt(height, 10));
					break;
				}
				case "TE": { // Clears the terminal
					cloned.resize(cloned.sizeX, cloned.sizeY);
					break;
				}
				case "TV": { // Blits the entire terminal
					let width = data.indexOf(',');
					if(width != cloned.sizeX) throw new Error(`Width: ${width} != ${cloned.sizeX}`);

					cloned.text = new Array(cloned.sizeY);
					cloned.fore = new Array(cloned.sizeY);
					cloned.back = new Array(cloned.sizeY);
					for(let y = 0; y < cloned.sizeY; y++) {
						cloned.fore[y] = data.substr((3 * y + 0) * (width + 1), width);
						cloned.back[y] = data.substr((3 * y + 1) * (width + 1), width);
						cloned.text[y] = data.substr((3 * y + 2) * (width + 1), width);
					}
					break;
				}
				case "TY": { // Blits the current line
					cloned.text = cloned.text.slice(0);
					cloned.fore = cloned.fore.slice(0);
					cloned.back = cloned.back.slice(0);

					let width = data.indexOf(",");
					let y = this.cursorY, x = this.cursorX;

					// TODO: Handle invalid cursor x
					if(y < 0 || y >= this.sizeY) break;

					cloned.fore[y] = interSplice(cloned.fore[y], data.substr(0 * (width + 1), width), x);
					cloned.back[y] = interSplice(cloned.back[y], data.substr(1 * (width + 1), width), x);
					cloned.text[y] = interSplice(cloned.text[y], data.substr(2 * (width + 1), width), x);
					break;
				}
				case "TZ": { // Blits a selective region of the terminal
					cloned.text = cloned.text.slice(0);
					cloned.fore = cloned.fore.slice(0);
					cloned.back = cloned.back.slice(0);

					// We use [\s\S] to capture "\r" too.
					let [_, xV, yV, remainder] = data.match(/(\d+),(\d+),([\s\S]*)/);
					let x = parseInt(xV, 10) - 1, y = parseInt(yV, 10) - 1;

					let width = remainder.indexOf(",");

					cloned.fore[y] = interSplice(cloned.fore[y], remainder.substr(0 * (width + 1), width), x);
					cloned.back[y] = interSplice(cloned.back[y], remainder.substr(1 * (width + 1), width), x);
					cloned.text[y] = interSplice(cloned.text[y], remainder.substr(2 * (width + 1), width), x);

					break;
				}
				case "TS": {
					let [_, dir] = data.match(/(-?\d+)/);
					let diff = parseInt(dir, 10);

					cloned.resize(cloned.sizeX, cloned.sizeY);

					for(let y = 0; y < this.sizeY; ++y) {
						let oldY = y + diff;
						if(oldY >= 0 && oldY < this.sizeY) {
							cloned.text[y] = this.text[oldY];
							cloned.fore[y] = this.fore[oldY];
							cloned.back[y] = this.back[oldY];
						}
					}
					break;
				}
				case "TW": {
					cloned.text = cloned.text.slice(0);
					cloned.fore = cloned.fore.slice(0);
					cloned.back = cloned.back.slice(0);

					let width = data.length;
					let y = this.cursorY, x = this.cursorX;

					// TODO: Handle invalid cursor x
					if(y < 0 || y >= this.sizeY) break;

					let baseFore = "", baseBack = "";
					for(let x = 0; x < width; x++ ) {
						baseFore += cloned.currentFore;
						baseBack += cloned.currentBack;
					}

					cloned.fore[y] = interSplice(cloned.fore[y], baseFore, x);
					cloned.back[y] = interSplice(cloned.back[y], baseBack, x);
					cloned.text[y] = interSplice(cloned.text[y], data.substr(0, width), x);
					break;
				}
				case "XD": // Add a debug message to the log
					cloned.log = cloned.log.slice(0);
					cloned.log.push({
						level: LogLevel.Debug,
						text: data,
					});
					break;
				case "XW": // Add a warning to the log
					cloned.log = cloned.log.slice(0);
					cloned.log.push({
						level: LogLevel.Warning,
						text: data,
					});
					break;
				case "XE": // Add an error to the log
					cloned.log = cloned.log.slice(0);
					cloned.log.push({
						level: LogLevel.Error,
						text: data,
					});
					break;
				case "XS": // Add a status message to the log
					cloned.log = cloned.log.slice(0);

					let [type, message] = data.split(',', 2);
					let kind = LogLevel.Error;
					switch(type) {
						case "failure":
							kind = LogLevel.Failure;
							break;
						case "error":
							kind = LogLevel.Error;
							break;
						case "success":
							kind =LogLevel.Success;
							break;
						default:
							// Append unknown entries
							message = type + "," + message;
							break;
					}
					cloned.log.push({
						level: kind,
						text: message,
					});
					break;
				case "SC": // Close the terminal
					cloned.log = cloned.log.slice(0);
					cloned.log.push({
						level: LogLevel.Debug,
						text: "Closed: " + data,
					});
					break;
				default:
					console.log("Unhandled packet " + code);
					break;
			}

			return cloned;
		}
	}
}
