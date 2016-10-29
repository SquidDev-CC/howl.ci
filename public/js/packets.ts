namespace HowlCI.Packets {
	"use strict";

	export type Packet = {
		computer: string,
		time: number,
		command: string,
		meta: string,
		data: string,
	}

	export type PacketCollection = {
		lines: Packet[],
		minTime: number,
		maxTime: number,
	}

	export let parse = function(stream : string) : PacketCollection {
		let out : Packet[] = [];

		let lastTime = 0;

		let minTime = Number.POSITIVE_INFINITY, maxTime = Number.NEGATIVE_INFINITY;
		for(let line of stream.split("\n")) {
			// We use [\s\S] to capture "\r" too.
			let match = line.match(/^([A-Z]{2}):([^;]*);([\s\S]*)$/);
			if(match) {
				let computer = "unknown", time = lastTime;
				let meta = match[2];

				let metaMatch = meta.match(/^([^,]+),(\d+)$/);
				if(metaMatch) {
					computer = metaMatch[1];
					time = lastTime = parseInt(metaMatch[2], 10);
				}

				minTime = Math.min(minTime, time);
				maxTime = Math.max(maxTime, time);

				out.push({
					computer: computer,
					time: lastTime,
					command: match[1],
					meta: meta,
					data: match[3],
				});
			}
		}

		out.sort((a, b) => a.time - b.time);

		return {
			lines: out,
			minTime: minTime,
			maxTime: maxTime,
		};
	};
}
