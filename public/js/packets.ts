namespace HowlCI.Packets {
	"use strict";

	export type Packet = {
		computer: string,
		time: number,
		command: string,
		meta: string,
		data: string,
	};

	export type PacketCollection = {
		lines: Packet[],
		exists: boolean,
		minTime: number,
		maxTime: number,
	};

	export const parse = (stream: string): PacketCollection => {
		const out: Packet[] = [];

		let lastTime = 0;

		let minTime = Number.POSITIVE_INFINITY;
		let maxTime = Number.NEGATIVE_INFINITY;
		for (const line of stream.split("\n")) {
			// We use [\s\S] to capture "\r" too.
			const match = line.match(/^([A-Z]{2}):([^;]*);([\s\S]*)$/);
			if (match) {
				let computer = "unknown";
				let time = lastTime;
				const meta = match[2];

				const metaMatch = meta.match(/^([^,]+),(\d+)$/);
				if (metaMatch) {
					computer = metaMatch[1];
					time = lastTime = parseInt(metaMatch[2], 10);
				}

				minTime = Math.min(minTime, time);
				maxTime = Math.max(maxTime, time);

				out.push({
					computer,
					time: lastTime,
					command: match[1],
					meta,
					data: match[3],
				});
			}
		}

		out.sort((a, b) => a.time - b.time);

		return {
			lines: out,
			exists: out.length > 0,
			minTime, maxTime,
		};
	};
}
