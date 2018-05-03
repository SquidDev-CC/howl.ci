namespace HowlCI {
	"use strict";

	const request = (url: string, type: string, travis?: boolean): Promise<XMLHttpRequest> => {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.open("GET", url);
			if (travis) {
				xhr.setRequestHeader("Travis-API-Version", "3");
			}

			// Sadly we can't set the user agent due to security reasons.
			xhr.setRequestHeader("Accept", type);
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

	const requestTravis = (url: string, type?: string) => request(url, type || "application/json", true);

	const always = <T>(args: T) => Promise.resolve(args);

	type FailureBase = { success: false, nothing: true } |
		{ success: false, text: string, status: string, headers: string };

	type Failure<T> = T & FailureBase;

	const handleError = <T extends {}>(xhr: XMLHttpRequest, data: T): Failure<T> => {
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
				(output as any)[key] = data[key];
			}
		}

		return output as Failure<T>;
	};

	type Args = { [name: string]: string | null };
	export type Page<T> = {
		build: (args: Args) => Promise<T>,
		title: (model: T) => string,
		after?: (model: T) => void,
	};

	export const pages: { [name: string]: Page<any> } = {};

	const staticPage = (title: string) => ({ build: always, title: _ => title });

	pages["index"] = staticPage("Home | howl.ci");
	pages["error"] = staticPage("Page not found | howl.ci");

	pages["travis/builds"] = {
		build: (args) => {
			const repo = args["repo"];
			if (!repo) {
				return Promise.resolve({
					success: false,
					nothing: true,
					repo,
				});
			}

			return requestTravis(`https://api.travis-ci.org/repo/${encodeURIComponent(repo)}/builds`).then(
				xhr => {
					const res = JSON.parse(xhr.responseText);
					for (const build of res.builds) {
						build.success = build.state === "passed";
					}

					return {
						repo,
						success: true,
						builds: res.builds,
					};
				},
				xhr => handleError(xhr, { repo }),
			);
		},
		title: model => model.repo + " | howl.ci",
	};

	pages["travis/build"] = {
		build: (args) => {
			const build = args["id"];

			return requestTravis(`https://api.travis-ci.org/build/${build}/jobs?include=job.config`)
				.then(
					xhr => {
						const res = JSON.parse(xhr.responseText);
						if (!res.jobs || res.jobs.length === 0) {
							return Promise.reject(handleError(xhr, { id: build }));
						}

						const tasks = res.jobs.map(job => requestTravis(
							`https://api.travis-ci.org/job/${job.id}/log.txt`,
							"text/plain",
						).then(req => {
							if (req.status === 204) {
								return request(req.getResponseHeader("Location") as string, "text/plain");
							} else {
								return req;
							}
						}).then(req => ({
							job,
							id: job.id,
							lines: Packets.parse(req.responseText),
							config: !!job.config.env,
						})),
						);

						const info = res.jobs[0];

						return Promise.all(tasks)
							.then((logs: any[]) => {
								return {
									success: true,
									id: build,
									logs,
									repo: info.repository,
									build: info.build,
									commit: info.commit,
								};
							});
					},
					xhr => handleError(xhr, { id: build }),
			);
		},
		title: model => "Build #" + model.id + " | howl.ci",
		after: model => {
			if (model.success) {
				let activeJobLink: HTMLElement | null = null;
				let activeJobTerminal: Terminal.TerminalControl | null = null;
				let activeJobTab: HTMLElement | null = null;

				for (const log of model.logs) {
					let terminal: Terminal.TerminalControl | null;

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

					const link = document.getElementById("job-link-" + log.job.id) as HTMLElement;
					const linker = link.parentElement;
					const tab = document.getElementById("job-" + log.job.id) as HTMLElement;

					const onClick = () => {
						if (link === activeJobLink) return false;

						if (activeJobLink != null) {
							activeJobLink.classList.remove("active");
							activeJobLink.firstElementChild!.setAttribute("aria-selected", "false");
						}
						if (activeJobTab != null) activeJobTab.classList.remove("active");
						if (activeJobTerminal) activeJobTerminal.detach();

						linker!.classList.add("active");
						linker!.firstElementChild!.setAttribute("aria-selected", "true");
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

	type URLModel = Failure<{ url: string }> | {
		success: true,
		url: string,
		id: 0,
		lines: Packets.PacketCollection,
	};

	pages["url"] = {
		build: (args) => {
			const url = args["url"];

			return request(String(url), "text/plain").then(
				xhr => {
					const res = xhr.responseText;

					const lines = Packets.parse(res);
					if (lines.exists) {
						return {
							url,
							success: true,
							id: 0,
							lines,
						};
					} else {
						return {
							url,
							success: false,
							fetched: true,
						};
					}
				},
				xhr => handleError(xhr, { url }),
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
	} as Page<URLModel>;

	pages["gist"] = {
		build: (args) => {
			const provided = args["gist"] as string;

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

			return request(String("https://gist.githubusercontent.com/" + fetch), "text/plain").then(
				xhr => {
					const res = xhr.responseText;

					const lines = Packets.parse(res);
					if (lines.exists) {
						return {
							user, path, view,
							success: true,
							id: 0,
							lines,
						};
					} else {
						return {
							user, path, view,
							success: false,
							fetched: true,
						};
					}
				},
				xhr => handleError(xhr, { user, path, view }),
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
