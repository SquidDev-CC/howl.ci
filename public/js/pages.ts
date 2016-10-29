namespace HowlCI {
	"use strict";

	let request = function(url : string, type? : string):Promise<XMLHttpRequest> {
		return new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest();

			xhr.open("GET", url);
			xhr.setRequestHeader("Accept", type || "application/vnd.travis-ci.2+json");
			xhr.timeout = 10000;

			xhr.onload = () => {
				if(xhr.status >= 200 && xhr.status < 300) {
					resolve(xhr);
				} else {
					reject(xhr);
				}
			};

			xhr.onerror = () => reject(xhr);

			xhr.send(null);
		});
	};

	let always = function<T>(args : T) { return  Promise.resolve(args); };

	let handleError = function<T extends {}>(xhr : XMLHttpRequest, data : T): T {
		let output;
		if(xhr.status) {
			output = {
				success: false,
				text: xhr.responseText,
				status: xhr.status + ": " + xhr.statusText,
				headers: xhr.getAllResponseHeaders(),
			};
		} else {
			output = {
				success: false,
			};
		}

		for(let key in data) {
			if(data.hasOwnProperty(key)) {
				output[key] = data[key];
			}
		}

		return output;
	};

	type Args = { [name:string]:string|null }
	export type Page<T> = {
		build:  (args:Args) => Promise<T>,
		title:  (model:T)   => string,
		after?: (model:T)   => void,
	}

	export let pages : { [name: string]:Page<any> }= {};

	pages["index"] = {
		build: always,
		title: _ => "Home | howl.ci",
	};

	pages["error"] = {
		build: always,
		title: _ => "Page not found | howl.ci",
	};

	pages["builds"] = {
		build: (args) => {
			let repo = args["repo"];

			return request(`https://api.travis-ci.org/repos/${repo}/builds`).then(
				xhr => {
					let res = JSON.parse(xhr.responseText);
					let commitLookup = {};
					for(let commit of res.commits) {
						commitLookup[commit.id] = commit;
					}

					for(let build of res.builds) {
						build.commit = commitLookup[build.commit_id];
						build.success = build.state === "passed";
					}

					return {
						repo: repo,
						success: true,
						builds: res.builds,
					};
				},
				xhr => handleError(xhr, { repo: repo })
			);
		},
		title: model => model.repo + " | howl.ci",
	};

	pages["build"] = {
		build: (args) => {
			let build = args["id"];

			return request(`https://api.travis-ci.org/builds/${build}`)
				.then(
					xhr => {
						let res = JSON.parse(xhr.responseText);

						// Taken from https://github.com/travis-ci/travis-web/blob/master/app/models/log.js
						let tasks = res.jobs.map(job => request(
							`https://api.travis-ci.org/jobs/${job.id}/log?cors_hax=true`,
							"application/json; chunked=true; version=2, text/plain; version=2"
							).then(xhr => {
								if(xhr.status === 204) {
									return request(<string>xhr.getResponseHeader("Location"), "text/plain");
								} else {
									return xhr;
								}
							}).then(xhr => ({ job: job, content: xhr.responseText }))
						);
						tasks.push(
							request(`https://api.travis-ci.org/repos/${res.build.repository_id}`)
								.then(x => JSON.parse(x.responseText).repo)
						);

						return Promise.all(tasks)
							.then((tasks : any[]) => {
								let repo = tasks.pop();
								let logs = tasks.map(x => ({job: x.job, lines: Packets.parse(x.content)}));

								return {
									success: true,
									id: build,
									logs: logs,
									repo: repo,
									build: res.build,
									commit: res.commit,
								};
							});
					},
					xhr => handleError(xhr, { id: build })
				);
		},
		title: model => "Build #" + model.id + " | howl.ci",
		after: model => {
			if(model.success) {
				for(let log of model.logs) {
					let term = Terminal.TerminalData.empty();

					let lines = log.lines.lines;
					let terminals : Terminal.TerminalData[] = new Array(lines.length);

					for(let x = 0; x < lines.length; x++) {
						let packet : Packets.Packet = lines[x];
						term = terminals[x] = term.handlePacket(packet.command, packet.data);
					}

					new Terminal.TerminalRender(log.job.id, lines, terminals).redrawTerminal();
				}
			}
		}
	};

	pages["url"] = {
		build: (args) => {
			let url = args["url"];

			return request(url).then(
				xhr => {
					let res = xhr.responseText;

					return {
						url: url,
						success: true,
						lines: Packets.parse(res),
					};
				},
				xhr => handleError(xhr, { url: url })
			);
		},
		title: model => "URL " + model.url + " | howl.ci",
		after: model => {
			if(model.success) {
				let term = Terminal.TerminalData.empty();

				let lines = model.lines.lines;
				let terminals : Terminal.TerminalData[] = new Array(lines.length);

				for(let x = 0; x < lines.length; x++) {
					let packet : Packets.Packet = lines[x];
					term = terminals[x] = term.handlePacket(packet.command, packet.data);
				}

				new Terminal.TerminalRender(0, lines, terminals).redrawTerminal();
			}
		}
	}
}
