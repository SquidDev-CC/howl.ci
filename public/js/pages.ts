namespace HowlCI {
	"use strict";

	const request = function(url: string, type?: string): Promise<XMLHttpRequest> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.open("GET", url);
			xhr.setRequestHeader("Accept", type || "application/vnd.travis-ci.2+json");
			xhr.timeout = 10000;

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(xhr);
				} else {
					reject(xhr);
				}
			};

			xhr.onerror = () => reject(xhr);

			xhr.send(null);
		});
	};

	const always = function<T>(args: T) { return  Promise.resolve(args); };

	type FailureBase = { success: false, nothing: true } |
		{ success: false, text: string, status: string, headers: string };

	type Failure<T> = T & FailureBase;

	const handleError = function<T extends {}>(xhr: XMLHttpRequest, data: T): Failure<T> {
		let output: FailureBase;
		if (xhr.status) {
			output = {
				success: false,
				text: xhr.responseText,
				status: xhr.status + ": " + xhr.statusText,
				headers: xhr.getAllResponseHeaders(),
			};
		} else {
			output = {
				success: false,
				nothing: true,
			};
		}

		for (const key in data) {
			if (data.hasOwnProperty(key)) {
				output[key] = data[key];
			}
		}

		return <Failure<T>> output;
	};

	type Args = { [name: string]: string|null };
	export type Page<T> = {
		build: (args: Args) => Promise<T>,
		title: (model: T)   => string,
		after?: (model: T)  => void,
	};

	export const pages: { [name: string]: Page<any> } = {};

	let staticPage = (title: string) => ({ build: always, title: _ => title });

	pages["index"] = staticPage("Home | howl.ci");
	pages["error"] = staticPage("Page not found | howl.ci");

	pages["travis/builds"] = {
		build: (args) => {
			const repo = args["repo"];

			return request(`https://api.travis-ci.org/repos/${repo}/builds`).then(
				xhr => {
					const res = JSON.parse(xhr.responseText);
					const commitLookup = {};
					for (const commit of res.commits) {
						commitLookup[commit.id] = commit;
					}

					for (const build of res.builds) {
						build.commit = commitLookup[build.commit_id];
						build.success = build.state === "passed";
					}

					return {
						repo: repo,
						success: true,
						builds: res.builds,
					};
				},
				xhr => handleError(xhr, { repo: repo }),
			);
		},
		title: model => model.repo + " | howl.ci",
	};

	pages["travis/build"] = {
		build: (args) => {
			const build = args["id"];

			return request(`https://api.travis-ci.org/builds/${build}`)
				.then(
					xhr => {
						const res = JSON.parse(xhr.responseText);

						// Taken from https://github.com/travis-ci/travis-web/blob/master/app/models/log.js
						const tasks = res.jobs.map(job => request(
							`https://api.travis-ci.org/jobs/${job.id}/log?cors_hax=true`,
							"text/plain",
							).then(req => {
								if (req.status === 204) {
									return request(<string> req.getResponseHeader("Location"), "text/plain");
								} else {
									return req;
								}
							}).then(req => ({
								job: job,
								id: job.id,
								lines: Packets.parse(req.responseText),
								config: !!job.config.env,
							})),
						);
						tasks.push(
							request(`https://api.travis-ci.org/repos/${res.build.repository_id}`)
								.then(x => JSON.parse(x.responseText).repo),
						);

						return Promise.all(tasks)
							.then((results: any[]) => {
								const repo = results.pop();
								const logs = results;

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
					xhr => handleError(xhr, { id: build }),
				);
		},
		title: model => "Build #" + model.id + " | howl.ci",
		after: model => {
			if (model.success) {
				let activeJobLink: HTMLElement|null = null;
				let activeJobTerminal: Terminal.TerminalControl|null = null;
				let activeJobTab: HTMLElement|null  = null;

				for (const log of model.logs) {
					let terminal: Terminal.TerminalControl|null;

					if (log.lines.exists) {
						let term = Terminal.TerminalData.empty();

						const lines = log.lines.lines;
						const terminals: Terminal.TerminalData[] = new Array(lines.length);

						for (let x = 0; x < lines.length; x++) {
							const packet: Packets.Packet = lines[x];
							term = terminals[x] = term.handlePacket(packet.command, packet.data);
						}

						terminal = new Terminal.TerminalControl(log.job.id, log.lines, terminals);
					} else {
						terminal = null;
					}

					const link = <HTMLElement> document.getElementById("job-link-" + log.job.id);
					const linker = link.parentElement;
					const tab = <HTMLElement> document.getElementById("job-" + log.job.id);

					const onClick = () => {
						if (link === activeJobLink) return false;

						if (activeJobLink != null) {
							activeJobLink.classList.remove("active");
							activeJobLink.firstElementChild.setAttribute("aria-selected", "false");
						}
						if (activeJobTab != null) activeJobTab.classList.remove("active");
						if (activeJobTerminal) activeJobTerminal.detach();

						linker.classList.add("active");
						linker.firstElementChild.setAttribute("aria-selected", "true");
						tab.classList.add("active");
						if (terminal != null) terminal.attach();

						activeJobLink = linker;
						activeJobTab = tab;
						activeJobTerminal = terminal;

						return false;
					};

					link.onclick = onClick;

					if (activeJobLink == null) onClick();
				}
			}
		},
	};

	type URLModel = Failure<{url: string}> | {
		success: true,
		url: string,
		id: 0,
		lines: Packets.PacketCollection,
	};

	pages["url"] = <Page<URLModel>> {
		build: (args) => {
			const url = args["url"];

			return request(String(url)).then(
				xhr => {
					const res = xhr.responseText;

					let lines = Packets.parse(res);
					if (lines.exists) {
						return {
							url: url,
							success: true,
							id: 0,
							lines: lines,
						};
					} else {
						return {
							url: url,
							success: false,
							fetched: true,
						};
					}
				},
				xhr => handleError(xhr, { url: url }),
			);
		},
		title: model => "URL " + model.url + " | howl.ci",
		after: model => {
			if (model.success && model.lines) {
				let term = Terminal.TerminalData.empty();

				const lines = model.lines.lines;
				const terminals: Terminal.TerminalData[] = new Array(lines.length);

				for (let x = 0; x < lines.length; x++) {
					const packet: Packets.Packet = lines[x];
					term = terminals[x] = term.handlePacket(packet.command, packet.data);
				}

				const terminal = new Terminal.TerminalControl(0, model.lines, terminals);
				terminal.attach();
			}
		},
	};

	pages["gist"] = {
		build: (args) => {
			const provided = <string> args["gist"];

			const firstSlash = provided.indexOf("/");
			const secondSlash = provided.indexOf("/", firstSlash + 1);

			let path;
			let view;
			let fetch;
			const user = provided.substring(0, firstSlash);
			if (secondSlash >= 0) {
				const main = provided.substring(firstSlash + 1, secondSlash);
				const file = provided.substr(secondSlash + 1);

				path = main + "/" + file;
				view = user + "/" + main + "#file-" + file.replace(".", "-");
				fetch = user + "/" + main + "/raw/" + file;
			} else {
				path = provided.substr(firstSlash + 1);
				view = provided;
				fetch = provided + "/raw/";
			}

			return request(String("https://gist.githubusercontent.com/" + fetch)).then(
				xhr => {
					const res = xhr.responseText;

					let lines = Packets.parse(res);
					if (lines.exists) {
						return {
							user: user,
							path: path,
							view: view,
							success: true,
							id: 0,
							lines: lines,
						};
					} else {
						return {
							user: user,
							path: path,
							view: view,
							success: false,
							fetched: true,
						};
					}
				},
				xhr => handleError(xhr, {
					path: path,
					view: view,
					user: user,
				}),
			);
		},
		title: model => "Gist/" + model.path + " | howl.ci",
		after: model => {
			if (model.success && model.lines) {
				let term = Terminal.TerminalData.empty();

				const lines = model.lines.lines;
				const terminals: Terminal.TerminalData[] = new Array(lines.length);

				for (let x = 0; x < lines.length; x++) {
					const packet: Packets.Packet = lines[x];
					term = terminals[x] = term.handlePacket(packet.command, packet.data);
				}

				const terminal = new Terminal.TerminalControl(0, model.lines, terminals);
				terminal.attach();
			}
		},
	};
}
