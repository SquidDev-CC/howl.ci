/// <reference path="../../typings/main.d.ts" />

"use strict";

const queryArgs = window.location.search
	.substring(1)
	.split('&')
	.map(x => x.split('=', 2).map(decodeURIComponent));

const query : {[key:string]:string}= {};

for(const [k, v] of queryArgs) query[k] = v;

let pageName = query['p'] || 'index';
let page = HowlCI.pages[pageName];
if(!page) {
	pageName = "error";
	page = HowlCI.pages["error"];
}

page.build(query).then(model => {
	if(!model) model = {};
	model.page = pageName;

	document.title = page.title(model);
	document.getElementById("content").innerHTML = HowlCI.templates[pageName].render(model, HowlCI.templates);

	if(page.after) page.after(model);

	// history.replaceState(model, document.title, window.location.toString());

	// window.onpopstate = function(event) {
	// 	const model = event.state;
	// 	const page = pages[model.page];

	// 	document.title = page.title(model);
	// 	document.getElementById("content").innerHTML = page.render(model, templates);
	// }
}, e => {
	let content = String(e);
	if(e instanceof Error) content = e.stack;

	content = content
		.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
		.replace(/</g, "&lt;").replace(/>/g, "&gt;");

	document.title = "Error | Howl.CI";
	document.getElementById("content").innerHTML = `<h2>Error in Error handling</h2><pre>${content}</pre>`;
});
