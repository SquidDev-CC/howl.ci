/// <reference path="../typings/hogan.d.ts" />
var HowlCI;
(function (HowlCI) {
    HowlCI.templates = {};
    HowlCI.templates["build"] = new Hogan.Template({ code: function (c, p, i) { var t = this; t.b(i = i || ""); if (t.s(t.f("success", c, p, 1), c, p, 0, 12, 1607, "{{ }}")) {
            t.rs(c, p, function (c, p, t) { t.b("	<h2>"); t.b("\n" + i); t.b("		"); t.b(t.v(t.d("repo.slug", c, p, 0))); t.b("\n" + i); t.b("		<span class=\"pull-right\">"); t.b("\n" + i); t.b("			<a href=\"https://github.com/"); t.b(t.v(t.d("repo.slug", c, p, 0))); t.b("\" title=\"Open on GitHub\" target=\"_blank\">"); t.b("\n" + i); t.b("				<span class=\"fa fa-0 fa-github\"></span>"); t.b("\n" + i); t.b("			</a>"); t.b("\n" + i); t.b("			<a href=\"https://travis-ci.org/"); t.b(t.v(t.d("repo.slug", c, p, 0))); t.b("\" title=\"Open on Travis.org\" target=\"_blank\">"); t.b("\n" + i); t.b("				<span class=\"fa fa-0 fa-cubes\"></span>"); t.b("\n" + i); t.b("			</a>"); t.b("\n" + i); t.b("		</span>"); t.b("\n" + i); t.b("	</h2>"); t.b("\n" + i); t.b("	<div class=\"build build-"); t.b(t.v(t.d("build.state", c, p, 0))); t.b("\">"); t.b("\n" + i); t.b("		<h3>"); t.b("\n" + i); t.b("			<a href=\"?p=build&id="); t.b(t.v(t.f("id", c, p, 0))); t.b("\">"); t.b("\n" + i); t.b("				#"); t.b(t.v(t.d("build.number", c, p, 0))); t.b(" "); t.b(t.v(t.d("build.state", c, p, 0))); t.b(" :: <span class=\"fa fa-0 fa-code-fork\"></span> "); t.b(t.v(t.d("commit.branch", c, p, 0))); t.b("\n" + i); t.b("			</a>"); t.b("\n" + i); t.b("			<span class=\"pull-right\">"); t.b("\n" + i); t.b("				<a href=\"https://github.com/"); t.b(t.v(t.d("repo.slug", c, p, 0))); t.b("/commit/"); t.b(t.v(t.d("commit.sha", c, p, 0))); t.b("\" title=\"Open on GitHub\" target=\"_blank\">"); t.b("\n" + i); t.b("					<span class=\"fa fa-github\"></span>"); t.b("\n" + i); t.b("				</a>"); t.b("\n" + i); t.b("				<a href=\"https://travis-ci.org/"); t.b(t.v(t.d("repo.slug", c, p, 0))); t.b("/builds/"); t.b(t.v(t.d("build.id", c, p, 0))); t.b("\" title=\"Open on Travis.org\" target=\"_blank\">"); t.b("\n" + i); t.b("					<span class=\"fa fa-cubes\"></span>"); t.b("\n" + i); t.b("				</a>"); t.b("\n" + i); t.b("			</span>"); t.b("\n" + i); t.b("		</h3>"); t.b("\n" + i); t.b("		<div class=\"build-info\">"); t.b("\n" + i); t.b("			<pre>"); t.b(t.v(t.d("commit.author_name", c, p, 0))); t.b(": "); t.b(t.v(t.d("commit.message", c, p, 0))); t.b("</pre>"); t.b("\n" + i); t.b("		</div>"); t.b("\n" + i); t.b("	</div>"); t.b("\n"); t.b("\n" + i); if (t.s(t.f("logs", c, p, 1), c, p, 0, 1035, 1597, "{{ }}")) {
                t.rs(c, p, function (c, p, t) { t.b("		<div class=\"job\">"); t.b("\n" + i); t.b("			<h3>Job #"); t.b(t.v(t.d("job.id", c, p, 0))); t.b("</h3>"); t.b("\n"); t.b("\n" + i); t.b("			<div class=\"computer-control\">"); t.b("\n" + i); t.b("				<div class=\"computer-log\">"); t.b("\n" + i); t.b("					<pre class=\"computer-output\" id=\"computer-output-"); t.b(t.v(t.d("job.id", c, p, 0))); t.b("\"></pre>"); t.b("\n" + i); t.b("				</div>"); t.b("\n" + i); t.b("				<div class=\"computer-terminal\">"); t.b("\n" + i); t.b("					<div class=\"computer-terminal-container\">"); t.b("\n" + i); t.b("						<input type=\"range\" class=\"computer-time\" min=\""); t.b(t.v(t.d("lines.minTime", c, p, 0))); t.b("\" max=\""); t.b(t.v(t.d("lines.maxTime", c, p, 0))); t.b("\" value=\""); t.b(t.v(t.d("lines.minTime", c, p, 0))); t.b("\" id=\"computer-time-"); t.b(t.v(t.d("job.id", c, p, 0))); t.b("\" step=\"1\" />"); t.b("\n" + i); t.b("						<canvas class=\"computer-canvas\" id=\"computer-"); t.b(t.v(t.d("job.id", c, p, 0))); t.b("\"></canvas>"); t.b("\n" + i); t.b("					</div>"); t.b("\n" + i); t.b("				</div>"); t.b("\n" + i); t.b("			</div>"); t.b("\n" + i); t.b("		</div>"); t.b("\n" + i); });
                c.pop();
            } });
            c.pop();
        } if (!t.s(t.f("success", c, p, 1), c, p, 1, 0, 0, "")) {
            t.b("	<div class=\"text-content\">");
            t.b(t.rp("<request_error0", c, p, ""));
            t.b("</div>");
            t.b("\n" + i);
        } ; return t.fl(); }, partials: { "<request_error0": { name: "request_error", partials: {}, subs: {} } }, subs: {} });
    HowlCI.templates["builds"] = new Hogan.Template({ code: function (c, p, i) { var t = this; t.b(i = i || ""); t.b("<div class=\"text-content\">"); t.b("\n" + i); if (t.s(t.f("success", c, p, 1), c, p, 0, 39, 1150, "{{ }}")) {
            t.rs(c, p, function (c, p, t) { t.b("	<h2>"); t.b("\n" + i); t.b("		"); t.b(t.v(t.f("repo", c, p, 0))); t.b("\n" + i); t.b("		<span class=\"pull-right\">"); t.b("\n" + i); t.b("			<a href=\"https://github.com/"); t.b(t.v(t.f("repo", c, p, 0))); t.b("\" title=\"Open on GitHub\" target=\"_blank\">"); t.b("\n" + i); t.b("				<span class=\"fa fa-0 fa-github\"></span>"); t.b("\n" + i); t.b("			</a>"); t.b("\n" + i); t.b("			<a href=\"https://travis-ci.org/"); t.b(t.v(t.f("repo", c, p, 0))); t.b("\" title=\"Open on Travis.org\" target=\"_blank\">"); t.b("\n" + i); t.b("				<span class=\"fa fa-0 fa-cubes\"></span>"); t.b("\n" + i); t.b("			</a>"); t.b("\n" + i); t.b("		</span>"); t.b("\n" + i); t.b("	</h2>"); t.b("\n"); t.b("\n" + i); if (t.s(t.f("builds", c, p, 1), c, p, 0, 387, 1035, "{{ }}")) {
                t.rs(c, p, function (c, p, t) { t.b("		<div class=\"build build-"); t.b(t.v(t.f("state", c, p, 0))); t.b("\">"); t.b("\n" + i); t.b("			<h3>"); t.b("\n" + i); t.b("				<a href=\"?p=build&id="); t.b(t.v(t.f("id", c, p, 0))); t.b("\">"); t.b("\n" + i); t.b("					#"); t.b(t.v(t.f("number", c, p, 0))); t.b(" "); t.b(t.v(t.f("state", c, p, 0))); t.b(" :: <span class=\"fa fa-0 fa-code-fork\"></span> "); t.b(t.v(t.d("commit.branch", c, p, 0))); t.b("\n" + i); t.b("				</a>"); t.b("\n" + i); t.b("				<span class=\"pull-right\">"); t.b("\n" + i); t.b("					<a href=\"https://github.com/"); t.b(t.v(t.f("repo", c, p, 0))); t.b("/commit/"); t.b(t.v(t.d("commit.sha", c, p, 0))); t.b("\" title=\"Open on GitHub\" target=\"_blank\">"); t.b("\n" + i); t.b("						<span class=\"fa fa-github\"></span>"); t.b("\n" + i); t.b("					</a>"); t.b("\n" + i); t.b("					<a href=\"https://travis-ci.org/"); t.b(t.v(t.f("repo", c, p, 0))); t.b("/builds/"); t.b(t.v(t.f("id", c, p, 0))); t.b("\" title=\"Open on Travis.org\" target=\"_blank\">"); t.b("\n" + i); t.b("						<span class=\"fa fa-cubes\"></span>"); t.b("\n" + i); t.b("					</a>"); t.b("\n" + i); t.b("				</span>"); t.b("\n" + i); t.b("			</h3>"); t.b("\n" + i); t.b("			<div class=\"build-info\">"); t.b("\n" + i); t.b("				<pre>"); t.b(t.v(t.d("commit.author_name", c, p, 0))); t.b(": "); t.b(t.v(t.d("commit.message", c, p, 0))); t.b("</pre>"); t.b("\n" + i); t.b("			</div>"); t.b("\n" + i); t.b("		</div>"); t.b("\n" + i); });
                c.pop();
            } if (!t.s(t.f("builds", c, p, 1), c, p, 1, 0, 0, "")) {
                t.b("		<p>It doesn't appear this repo has any builds. Are you sure it exists?</p>");
                t.b("\n" + i);
            } ; });
            c.pop();
        } if (!t.s(t.f("success", c, p, 1), c, p, 1, 0, 0, "")) {
            t.b(t.rp("<request_error0", c, p, "	"));
        } ; t.b("</div>"); t.b("\n"); return t.fl(); }, partials: { "<request_error0": { name: "request_error", partials: {}, subs: {} } }, subs: {} });
    HowlCI.templates["error"] = new Hogan.Template({ code: function (c, p, i) { var t = this; t.b(i = i || ""); t.b("<div class=\"text-content\">"); t.b("\n" + i); t.b("<h2>Ooops</h2>"); t.b("\n"); t.b("\n" + i); t.b("<p class=\"text-error\">"); t.b("\n" + i); t.b("	We can't find the page <code>"); t.b(t.v(t.f("name", c, p, 0))); t.b("</code>. Maybe you mistyped it, or something else broke."); t.b("\n" + i); t.b("</p>"); t.b("\n" + i); t.b("</div>"); t.b("\n"); return t.fl(); }, partials: {}, subs: {} });
    HowlCI.templates["index"] = new Hogan.Template({ code: function (c, p, i) { var t = this; t.b(i = i || ""); t.b("<div class=\"text-content\">"); t.b("\n"); t.b("\n" + i); t.b("<h2>howl.ci</h2>"); t.b("\n" + i); t.b("<p>"); t.b("\n" + i); t.b("	howl.ci is a project which aims to provide a continuous integration service to ComputerCraft users."); t.b("\n" + i); t.b("</p>"); t.b("\n" + i); t.b("<p>"); t.b("\n" + i); t.b("	Builds are executed by <a href=\"https://travis-ci.org/\" title=\"The Travis CI provider\" target=\"_blank\">Travis</a>"); t.b("\n" + i); t.b("	and the terminal output captured. howl.ci then scrapes these logs and renders them in place on the website."); t.b("\n" + i); t.b("</p>"); t.b("\n"); t.b("\n" + i); t.b("<h3>Example</h3>"); t.b("\n" + i); t.b("<p>"); t.b("\n" + i); t.b("	You can view <a href=\"?p=builds&repo=SquidDev-CC/Howl\">historic builds of Howl</a>. You can also render log files from"); t.b("\n" + i); t.b("	<a href=\"?p=url&url=https://gist.githubusercontent.com/SquidDev/b3e88899a86ee73fa2510389b141e9e3/raw/terminal_codes.txt\">aribtrary"); t.b("\n" + i); t.b("	urls</a>"); t.b("\n" + i); t.b("</p>"); t.b("\n"); t.b("\n" + i); t.b("<h3>Getting set up</h3>"); t.b("\n" + i); t.b("<p>"); t.b("\n" + i); t.b("	Firstly you'll need to get set up with Travis. You need to download the executor and run it in the relevent"); t.b("\n" + i); t.b("	directory. We'll create a <code>.travis.yml</code> file like so:"); t.b("\n" + i); t.b("</p>"); t.b("\n" + i); t.b("<pre class=\"box\">"); t.b("\n" + i); t.b("jdk:"); t.b("\n" + i); t.b("  - oraclejdk8"); t.b("\n" + i); t.b("install:"); t.b("\n" + i); t.b("  - wget -O howlci.jar https://dl.bintray.com/squiddev/maven/org/squiddev/howl.ci/0.1/howl.ci-0.1.jar"); t.b("\n" + i); t.b("script:"); t.b("\n" + i); t.b("  - java -jar howlci.jar"); t.b("\n" + i); t.b("</pre>"); t.b("\n" + i); t.b("<p>"); t.b("\n" + i); t.b("	You'll probably want to configure howl.ci for your particular use case. To do this you'll need a"); t.b("\n" + i); t.b("	<code>.howl.properties</code> file."); t.b("\n" + i); t.b("</p>"); t.b("\n" + i); t.b("<pre class=\"box\">"); t.b("\n" + i); t.b("computer.0.saveDir=."); t.b("\n" + i); t.b("computer.0.startup=.build.lua"); t.b("\n" + i); t.b("</pre>"); t.b("\n" + i); t.b("<p>"); t.b("\n" + i); t.b("	This configures the initial computer to run in the current directory and execute the .build.lua file. You don't need"); t.b("\n" + i); t.b("	to specify that second line if you have a <code>startup</code> file."); t.b("\n" + i); t.b("</p>"); t.b("\n"); t.b("\n" + i); t.b("<h3>Making your builds do something</h3>"); t.b("\n" + i); t.b("<p>"); t.b("\n" + i); t.b("	The issue here is that howl.ci, and so Travis has no way of telling if your build has succeeded or not. To do this"); t.b("\n" + i); t.b("	you should use the <code>howlci</code> API. This provides a <code>howlapi.status(status:string, message:string)</code>"); t.b("\n" + i); t.b("	that sets the status of your build."); t.b("\n" + i); t.b("</p>"); t.b("\n" + i); t.b("<p>"); t.b("\n" + i); t.b("	Builds have three states: \"success\" for when everything went OK, \"failure\" for when your tests didn't go right and"); t.b("\n" + i); t.b("	\"error\" for when something unexpected that you were not expecting: such as everything crashing. If you don't"); t.b("\n" + i); t.b("	terminate with a status then howl.ci will presume the build errored."); t.b("\n" + i); t.b("</p>"); t.b("\n"); t.b("\n" + i); t.b("</div>"); t.b("\n"); return t.fl(); }, partials: {}, subs: {} });
    HowlCI.templates["request_error"] = new Hogan.Template({ code: function (c, p, i) { var t = this; t.b(i = i || ""); t.b("<h2>There was an error connecting to the Travis API</h2>"); t.b("\n" + i); if (t.s(t.f("status", c, p, 1), c, p, 0, 68, 295, "{{ }}")) {
            t.rs(c, p, function (c, p, t) { t.b("	<p>My AJAX request went to Travis and all it got was this lousy status code: <code>"); t.b(t.v(t.f("status", c, p, 0))); t.b("</code></p>"); t.b("\n" + i); t.b("	<hr />"); t.b("\n" + i); t.b("	<h3>Response body:</h3>"); t.b("\n" + i); t.b("	<p><pre>"); t.b(t.v(t.f("text", c, p, 0))); t.b("</pre></p>"); t.b("\n" + i); t.b("	<h3>Response headers:</h3>"); t.b("\n" + i); t.b("	<p><pre>"); t.b(t.v(t.f("headers", c, p, 0))); t.b("</pre></p>"); t.b("\n" + i); });
            c.pop();
        } if (!t.s(t.f("status", c, p, 1), c, p, 1, 0, 0, "")) {
            t.b("	<p>We couldn't connect to Travis at all: maybe it is down?");
            t.b("\n" + i);
        } ; return t.fl(); }, partials: {}, subs: {} });
    HowlCI.templates["url"] = new Hogan.Template({ code: function (c, p, i) { var t = this; t.b(i = i || ""); if (t.s(t.f("success", c, p, 1), c, p, 0, 12, 638, "{{ }}")) {
            t.rs(c, p, function (c, p, t) { t.b("	<h2>"); t.b("\n" + i); t.b("		"); t.b(t.v(t.f("url", c, p, 0))); t.b("\n" + i); t.b("		<span class=\"pull-right\">"); t.b("\n" + i); t.b("			<a href=\""); t.b(t.v(t.f("url", c, p, 0))); t.b("\" title=\"Open this URL\" target=\"_blank\">"); t.b("\n" + i); t.b("				<span class=\"fa fa-0 fa-link\"></span>"); t.b("\n" + i); t.b("			</a>"); t.b("\n" + i); t.b("		</span>"); t.b("\n" + i); t.b("	</h2>"); t.b("\n"); t.b("\n" + i); t.b("	<div class=\"computer-control\">"); t.b("\n" + i); t.b("		<div class=\"computer-log\">"); t.b("\n" + i); t.b("			<pre class=\"computer-output\" id=\"computer-output-0\"></pre>"); t.b("\n" + i); t.b("		</div>"); t.b("\n" + i); t.b("		<div class=\"computer-terminal\">"); t.b("\n" + i); t.b("			<div class=\"computer-terminal-container\">"); t.b("\n" + i); t.b("				<input type=\"range\" class=\"computer-time\" min=\""); t.b(t.v(t.d("lines.minTime", c, p, 0))); t.b("\" max=\""); t.b(t.v(t.d("lines.maxTime", c, p, 0))); t.b("\" value=\""); t.b(t.v(t.d("lines.minTime", c, p, 0))); t.b("\" id=\"computer-time-0\" step=\"1\" />"); t.b("\n" + i); t.b("				<canvas class=\"computer-canvas\" id=\"computer-0\"></canvas>"); t.b("\n" + i); t.b("			</div>"); t.b("\n" + i); t.b("		</div>"); t.b("\n" + i); t.b("	</div>"); t.b("\n" + i); });
            c.pop();
        } if (!t.s(t.f("success", c, p, 1), c, p, 1, 0, 0, "")) {
            t.b("	<div class=\"text-content\">");
            t.b("\n" + i);
            t.b("	<h2>");
            t.b("\n" + i);
            t.b("		");
            t.b(t.v(t.f("url", c, p, 0)));
            t.b("\n" + i);
            t.b("		<span class=\"pull-right\">");
            t.b("\n" + i);
            t.b("			<a href=\"");
            t.b(t.v(t.f("url", c, p, 0)));
            t.b("\" title=\"Open this URL\" target=\"_blank\">");
            t.b("\n" + i);
            t.b("				<span class=\"fa fa-0 fa-link\"></span>");
            t.b("\n" + i);
            t.b("			</a>");
            t.b("\n" + i);
            t.b("		</span>");
            t.b("\n" + i);
            t.b("	</h2>");
            t.b("\n");
            t.b("\n" + i);
            if (t.s(t.f("status", c, p, 1), c, p, 0, 876, 1112, "{{ }}")) {
                t.rs(c, p, function (c, p, t) { t.b("		<p>My AJAX request went to your URL and all it got was this lousy status code: <code>"); t.b(t.v(t.f("status", c, p, 0))); t.b("</code></p>"); t.b("\n" + i); t.b("		<hr />"); t.b("\n" + i); t.b("		<h3>Response body:</h3>"); t.b("\n" + i); t.b("		<p><pre>"); t.b(t.v(t.f("text", c, p, 0))); t.b("</pre></p>"); t.b("\n" + i); t.b("		<h3>Response headers:</h3>"); t.b("\n" + i); t.b("		<p><pre>"); t.b(t.v(t.f("headers", c, p, 0))); t.b("</pre></p>"); t.b("\n" + i); });
                c.pop();
            }
            if (!t.s(t.f("status", c, p, 1), c, p, 1, 0, 0, "")) {
                t.b("		<p>We couldn't connect to this site at at all: maybe it is down?");
                t.b("\n" + i);
            }
            ;
            t.b("	</div>");
            t.b("\n" + i);
        } ; return t.fl(); }, partials: {}, subs: {} });
})(HowlCI || (HowlCI = {}));
/**
 * Copyright (c) 2013 Marc J. Schmidt
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */
var ResizeSensor;
(function (ResizeSensor_1) {
    // Only used for the dirty checking, so the event callback count is limted to max 1 call per fps per sensor.
    // In combination with the event based resize sensor this saves cpu time, because the sensor is too fast and
    // would generate too many unnecessary events.
    var requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (fn) {
            return window.setTimeout(fn, 20);
        };
    /**
     * Iterate over each of the provided element(s).
     *
     * @param {HTMLElement|HTMLElement[]} elements
     * @param {Function}                  callback
     */
    function forEachElement(elements, callback) {
        var elementsType = Object.prototype.toString.call(elements);
        var isCollectionTyped = ("[object Array]" === elementsType
            || ("[object NodeList]" === elementsType)
            || ("[object HTMLCollection]" === elementsType));
        var i = 0, j = elements.length;
        if (isCollectionTyped) {
            for (; i < j; i++) {
                callback(elements[i]);
            }
        }
        else {
            callback(elements);
        }
    }
    /**
     * Class for dimension change detection.
     *
     * @param {Element|Element[]|Elements|jQuery} element
     * @param {Function} callback
     *
     * @constructor
     */
    ResizeSensor_1.ResizeSensor = function (element, callback) {
        /**
         *
         * @constructor
         */
        function EventQueue() {
            var q = [];
            this.add = function (ev) { return q.push(ev); };
            var i, j;
            this.call = function () {
                for (i = 0, j = q.length; i < j; i++) {
                    q[i].call();
                }
            };
            this.remove = function (ev) {
                var newQueue = [];
                for (i = 0, j = q.length; i < j; i++) {
                    if (q[i] !== ev)
                        newQueue.push(q[i]);
                }
                q = newQueue;
            };
            this.length = function () {
                return q.length;
            };
        }
        /**
         * @param {HTMLElement} element
         * @param {String}      prop
         * @returns {String|Number}
         */
        function getComputedStyle(element, prop) {
            if (element.currentStyle) {
                return element.currentStyle[prop];
            }
            else if (window.getComputedStyle) {
                return window.getComputedStyle(element, null).getPropertyValue(prop);
            }
            else {
                return element.style[prop];
            }
        }
        /**
         *
         * @param {HTMLElement} element
         * @param {Function}    resized
         */
        function attachResizeEvent(element, resized) {
            if (!element.resizedAttached) {
                element.resizedAttached = new EventQueue();
                element.resizedAttached.add(resized);
            }
            else if (element.resizedAttached) {
                element.resizedAttached.add(resized);
                return;
            }
            element.resizeSensor = document.createElement("div");
            element.resizeSensor.className = "resize-sensor";
            var style = "position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;";
            var styleChild = "position: absolute; left: 0; top: 0; transition: 0s;";
            element.resizeSensor.style.cssText = style;
            element.resizeSensor.innerHTML =
                ("<div class=\"resize-sensor-expand\" style=\"" + style + "\"><div style=\"" + styleChild + "\"></div></div>") +
                    ("<div class=\"resize-sensor-shrink\" style=\"" + style + "\">") +
                    ("<div style=\"" + styleChild + " width: 200%; height: 200%\"></div>") +
                    "</div>";
            element.appendChild(element.resizeSensor);
            if (getComputedStyle(element, "position") == "static") {
                element.style.position = "relative";
            }
            var expand = element.resizeSensor.childNodes[0];
            var expandChild = expand.childNodes[0];
            var shrink = element.resizeSensor.childNodes[1];
            var reset = function () {
                expandChild.style.width = 100000 + "px";
                expandChild.style.height = 100000 + "px";
                expand.scrollLeft = 100000;
                expand.scrollTop = 100000;
                shrink.scrollLeft = 100000;
                shrink.scrollTop = 100000;
            };
            reset();
            var dirty = false;
            var dirtyChecking = function () {
                if (!element.resizedAttached)
                    return;
                if (dirty) {
                    element.resizedAttached.call();
                    dirty = false;
                }
                requestAnimationFrame(dirtyChecking);
            };
            requestAnimationFrame(dirtyChecking);
            var lastWidth, lastHeight;
            var cachedWidth, cachedHeight; // useful to not query offsetWidth twice
            var onScroll = function () {
                if ((cachedWidth = element.offsetWidth) !== lastWidth || (cachedHeight = element.offsetHeight) != lastHeight) {
                    dirty = true;
                    lastWidth = cachedWidth;
                    lastHeight = cachedHeight;
                }
                reset();
            };
            var addEvent = function (el, name, cb) {
                if (el.attachEvent) {
                    el.attachEvent("on" + name, cb);
                }
                else {
                    el.addEventListener(name, cb);
                }
            };
            addEvent(expand, "scroll", onScroll);
            addEvent(shrink, "scroll", onScroll);
        }
        forEachElement(element, function (elem) {
            attachResizeEvent(elem, callback);
        });
        this.detach = function (ev) {
            ResizeSensor_1.ResizeSensor.detach(element, ev);
        };
    };
    ResizeSensor_1.ResizeSensor.detach = function (element, ev) {
        forEachElement(element, function (elem) {
            if (elem.resizedAttached && typeof ev === "function") {
                elem.resizedAttached.remove(ev);
                if (elem.resizedAttached.length())
                    return;
            }
            if (elem.resizeSensor) {
                if (elem.contains(elem.resizeSensor)) {
                    elem.removeChild(elem.resizeSensor);
                }
                delete elem.resizeSensor;
                delete elem.resizedAttached;
            }
        });
    };
})(ResizeSensor || (ResizeSensor = {}));
var HowlCI;
(function (HowlCI) {
    var Packets;
    (function (Packets) {
        "use strict";
        Packets.parse = function (stream) {
            var out = [];
            var lastTime = 0;
            var minTime = Number.POSITIVE_INFINITY, maxTime = Number.NEGATIVE_INFINITY;
            for (var _i = 0, _a = stream.split("\n"); _i < _a.length; _i++) {
                var line = _a[_i];
                // We use [\s\S] to capture "\r" too.
                var match = line.match(/^([A-Z]{2}):([^;]*);([\s\S]*)$/);
                if (match) {
                    var computer = "unknown", time = lastTime;
                    var meta = match[2];
                    var metaMatch = meta.match(/^([^,]+),(\d+)$/);
                    if (metaMatch) {
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
                        data: match[3]
                    });
                }
            }
            out.sort(function (a, b) { return a.time - b.time; });
            return {
                lines: out,
                minTime: minTime,
                maxTime: maxTime
            };
        };
    })(Packets = HowlCI.Packets || (HowlCI.Packets = {}));
})(HowlCI || (HowlCI = {}));
var HowlCI;
(function (HowlCI) {
    var Terminal;
    (function (Terminal) {
        "use strict";
        (function (LogKind) {
            LogKind[LogKind["Status"] = 0] = "Status";
            LogKind[LogKind["Log"] = 1] = "Log";
            LogKind[LogKind["Close"] = 2] = "Close";
        })(Terminal.LogKind || (Terminal.LogKind = {}));
        var LogKind = Terminal.LogKind;
        ;
        var LogItem = (function () {
            function LogItem() {
            }
            return LogItem;
        }());
        Terminal.LogItem = LogItem;
        var interSplice = function (text, partial, offset) {
            return text.substr(0, offset) + partial + text.substr(offset + partial.length);
        };
        var TerminalData = (function () {
            function TerminalData() {
            }
            TerminalData.empty = function () {
                var data = new TerminalData();
                data.init(0, 0);
                return data;
            };
            TerminalData.prototype.init = function (width, height) {
                this.cursorX = 0;
                this.cursorY = 0;
                this.cursorBlink = false;
                this.currentFore = "0";
                this.currentBack = "f";
                this.log = [];
                this.resize(width, height);
            };
            TerminalData.prototype.resize = function (width, height) {
                this.sizeX = width;
                this.sizeY = height;
                this.text = new Array(height);
                this.fore = new Array(height);
                this.back = new Array(height);
                var baseText = "", baseFore = "", baseBack = "";
                for (var x = 0; x < width; x++) {
                    baseText += " ";
                    baseFore += this.currentFore;
                    baseBack += this.currentBack;
                }
                for (var y = 0; y < height; y++) {
                    this.text[y] = baseText;
                    this.fore[y] = baseFore;
                    this.back[y] = baseBack;
                }
            };
            TerminalData.prototype.clone = function () {
                var copied = new TerminalData();
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
            };
            TerminalData.prototype.handlePacket = function (code, data) {
                var cloned = this.clone();
                switch (code) {
                    case "TC": {
                        var _a = data.match(/(-?\d+),(-?\d+)/), _ = _a[0], x = _a[1], y = _a[2];
                        cloned.cursorX = parseInt(x, 10) - 1;
                        cloned.cursorY = parseInt(y, 10) - 1;
                        break;
                    }
                    case "TB": {
                        cloned.cursorBlink = data === "true";
                        break;
                    }
                    case "TF": {
                        cloned.currentFore = data.charAt(0);
                        break;
                    }
                    case "TK": {
                        cloned.currentBack = data.charAt(0);
                        break;
                    }
                    case "TR": {
                        var _b = data.match(/(\d+),(\d+)/), _ = _b[0], width = _b[1], height = _b[2];
                        cloned.resize(parseInt(width, 10), parseInt(height, 10));
                        break;
                    }
                    case "TE": {
                        cloned.resize(cloned.sizeX, cloned.sizeY);
                        break;
                    }
                    case "TV": {
                        var width = data.indexOf(',');
                        if (width != cloned.sizeX)
                            throw new Error("Width: " + width + " != " + cloned.sizeX);
                        cloned.text = new Array(cloned.sizeY);
                        cloned.fore = new Array(cloned.sizeY);
                        cloned.back = new Array(cloned.sizeY);
                        for (var y = 0; y < cloned.sizeY; y++) {
                            cloned.fore[y] = data.substr((3 * y + 0) * (width + 1), width);
                            cloned.back[y] = data.substr((3 * y + 1) * (width + 1), width);
                            cloned.text[y] = data.substr((3 * y + 2) * (width + 1), width);
                        }
                        break;
                    }
                    case "TY": {
                        cloned.text = cloned.text.slice(0);
                        cloned.fore = cloned.fore.slice(0);
                        cloned.back = cloned.back.slice(0);
                        var width = data.indexOf(",");
                        var y = this.cursorY, x = this.cursorX;
                        // TODO: Handle invalid cursor x
                        if (y < 0 || y >= this.sizeY)
                            break;
                        cloned.fore[y] = interSplice(cloned.fore[y], data.substr(0 * (width + 1), width), x);
                        cloned.back[y] = interSplice(cloned.back[y], data.substr(1 * (width + 1), width), x);
                        cloned.text[y] = interSplice(cloned.text[y], data.substr(2 * (width + 1), width), x);
                        break;
                    }
                    case "TZ": {
                        cloned.text = cloned.text.slice(0);
                        cloned.fore = cloned.fore.slice(0);
                        cloned.back = cloned.back.slice(0);
                        // We use [\s\S] to capture "\r" too.
                        var _c = data.match(/(\d+),(\d+),([\s\S]*)/), _ = _c[0], xV = _c[1], yV = _c[2], remainder = _c[3];
                        var x = parseInt(xV, 10) - 1, y = parseInt(yV, 10) - 1;
                        var width = remainder.indexOf(",");
                        cloned.fore[y] = interSplice(cloned.fore[y], remainder.substr(0 * (width + 1), width), x);
                        cloned.back[y] = interSplice(cloned.back[y], remainder.substr(1 * (width + 1), width), x);
                        cloned.text[y] = interSplice(cloned.text[y], remainder.substr(2 * (width + 1), width), x);
                        break;
                    }
                    case "TS": {
                        var _d = data.match(/(-?\d+)/), _ = _d[0], dir = _d[1];
                        var diff = parseInt(dir, 10);
                        cloned.resize(cloned.sizeX, cloned.sizeY);
                        for (var y = 0; y < this.sizeY; ++y) {
                            var oldY = y + diff;
                            if (oldY >= 0 && oldY < this.sizeY) {
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
                        var width = data.length;
                        var y = this.cursorY, x = this.cursorX;
                        // TODO: Handle invalid cursor x
                        if (y < 0 || y >= this.sizeY)
                            break;
                        var baseFore = "", baseBack = "";
                        for (var x_1 = 0; x_1 < width; x_1++) {
                            baseFore += cloned.currentFore;
                            baseBack += cloned.currentBack;
                        }
                        cloned.fore[y] = interSplice(cloned.fore[y], baseFore, x);
                        cloned.back[y] = interSplice(cloned.back[y], baseBack, x);
                        cloned.text[y] = interSplice(cloned.text[y], data.substr(0, width), x);
                        break;
                    }
                    case "XD":
                        cloned.log = cloned.log.slice(0);
                        cloned.log.push({
                            level: "debug",
                            kind: LogKind.Log,
                            text: data
                        });
                        break;
                    case "XW":
                        cloned.log = cloned.log.slice(0);
                        cloned.log.push({
                            level: "warning",
                            kind: LogKind.Log,
                            text: data
                        });
                        break;
                    case "XE":
                        cloned.log = cloned.log.slice(0);
                        cloned.log.push({
                            level: "error",
                            kind: LogKind.Log,
                            text: data
                        });
                        break;
                    case "XL": {
                        cloned.log = cloned.log.slice(0);
                        var _e = data.split(',', 2), type = _e[0], message = _e[1];
                        cloned.log.push({
                            level: type,
                            kind: LogKind.Log,
                            text: message
                        });
                        break;
                    }
                    case "XS": {
                        cloned.log = cloned.log.slice(0);
                        var _f = data.split(',', 2), type = _f[0], message = _f[1];
                        cloned.log.push({
                            level: type,
                            kind: LogKind.Status,
                            text: message
                        });
                        break;
                    }
                    case "SC":
                        cloned.log = cloned.log.slice(0);
                        cloned.log.push({
                            level: "close",
                            kind: LogKind.Close,
                            text: data
                        });
                        break;
                    default:
                        console.log("Unhandled packet " + code);
                        break;
                }
                return cloned;
            };
            return TerminalData;
        }());
        Terminal.TerminalData = TerminalData;
    })(Terminal = HowlCI.Terminal || (HowlCI.Terminal = {}));
})(HowlCI || (HowlCI = {}));
var HowlCI;
(function (HowlCI) {
    var Terminal;
    (function (Terminal) {
        "use strict";
        var cellWidth = 6;
        var cellHeight = 9;
        var cellGCD = 3; // Common factor which won't result in characters skewing
        var fontWidth = 96;
        var fontHeight = 144;
        // Time period to increment the slider by
        var tickLength = 50;
        var valueIncrement = 1e5 * tickLength;
        // Color code lookups
        var colors = {
            "0": "rgb(240, 240, 240)",
            "1": "rgb(242, 178, 51)",
            "2": "rgb(229, 127, 216)",
            "3": "rgb(153, 178, 242)",
            "4": "rgb(222, 222, 108)",
            "5": "rgb(127, 204, 25)",
            "6": "rgb(242, 178, 204)",
            "7": "rgb(76, 76, 76)",
            "8": "rgb(153, 153, 153)",
            "9": "rgb(76, 153, 178)",
            "a": "rgb(178, 102, 229)",
            "b": "rgb(37, 49, 146)",
            "c": "rgb(127, 102, 76)",
            "d": "rgb(87, 166, 78)",
            "e": "rgb(204, 76, 76)",
            "f": "rgb(0, 0, 0)"
        };
        var font = new Image();
        var fonts = {};
        font.src = "termFont.png";
        // Generate a series of fonts for each color code
        var fontLoaded = false;
        font.onload = function () {
            for (var key in colors) {
                if (!colors.hasOwnProperty(key)) {
                    continue;
                }
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                canvas.width = fontWidth;
                canvas.height = fontHeight;
                context.globalCompositeOperation = 'destination-atop';
                context.fillStyle = colors[key];
                context.globalAlpha = 1.0;
                context.fillRect(0, 0, fontWidth, fontHeight);
                context.drawImage(font, 0, 0);
                fonts[key] = canvas;
            }
            fontLoaded = true;
        };
        var TerminalRender = (function () {
            function TerminalRender(id, lines, terminals) {
                var _this = this;
                this.lines = lines;
                this.terminals = terminals;
                this.canvas = document.getElementById("computer-" + id);
                this.context = this.canvas.getContext("2d");
                this.time = document.getElementById("computer-time-" + id);
                var log = this.log = document.getElementById("computer-output-" + id);
                // Build the log, adding the entries to the list
                var logLength = 0;
                for (var i = 0; i < lines.length; i++) {
                    var time = lines[i].time;
                    var terminal = terminals[i];
                    for (var i_1 = logLength; i_1 < terminal.log.length; i_1++) {
                        var entry = terminal.log[i_1];
                        var kindName = Terminal.LogKind[entry.kind].toLowerCase();
                        var levelName = entry.level.replace(/[^\w-]/g, "").toLowerCase();
                        var element = document.createElement("p");
                        element.style.display = "hidden";
                        element.className = "log-entry log-" + kindName;
                        element.setAttribute("data-time", time.toString());
                        var kind = document.createElement("span");
                        kind.innerText = levelName;
                        kind.className = "log-level log-level-" + levelName;
                        var text = document.createElement("span");
                        text.innerText = entry.text;
                        element.appendChild(kind);
                        element.appendChild(text);
                        log.appendChild(element);
                    }
                    logLength = terminal.log.length;
                }
                var interacting = false;
                // Auto-play the slider
                var increment = function () {
                    if (interacting)
                        return null;
                    _this.time.valueAsNumber += valueIncrement;
                    var id = null;
                    if (_this.time.valueAsNumber < parseInt(_this.time.max, 10)) {
                        id = setTimeout(increment, tickLength);
                    }
                    _this.redrawTerminal();
                    return id;
                };
                // If the slider is changed then abort the animation and set the value
                var timeout = increment();
                this.time.oninput = function () {
                    _this.redrawTerminal();
                    interacting = true;
                    if (timeout !== null)
                        clearTimeout(timeout);
                };
                this.time.onmousedown = function () {
                    interacting = true;
                    if (timeout !== null)
                        clearTimeout(timeout);
                };
                new ResizeSensor.ResizeSensor(this.canvas.parentElement, function () {
                    _this.redrawTerminal();
                });
            }
            TerminalRender.prototype.redrawTerminal = function () {
                var time = this.time.valueAsNumber;
                var terminal = this.terminals[0];
                for (var i = 1; i < this.lines.length; i++) {
                    var line = this.lines[i];
                    terminal = this.terminals[i - 1];
                    if (line.time > time) {
                        break;
                    }
                }
                var logLines = this.log.childNodes;
                for (var i = 0; i < logLines.length; i++) {
                    var logLine = logLines[i];
                    if (logLine instanceof HTMLElement) {
                        logLine.style.display = parseInt(logLine.getAttribute("data-time"), 10) > time ? "none" : "initial";
                    }
                }
                var ctx = this.context;
                ctx.fillStyle = colors.f;
                var sizeX = terminal.sizeX || 51;
                var sizeY = terminal.sizeY || 19;
                var actualWidth = this.canvas.parentElement.clientWidth;
                var width = sizeX * cellWidth;
                var scale = actualWidth / width;
                scale = Math.floor(scale * 3) / 3;
                var height = sizeY * cellHeight;
                this.canvas.height = height * scale;
                this.canvas.width = width * scale;
                ctx.imageSmoothingEnabled = false; // Isn't standardised yet so...
                ctx.oImageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.mozImageSmoothingEnabled = false;
                ctx.msImageSmoothingEnabled = false;
                if (terminal.sizeX === 0 && terminal.sizeY === 0) {
                    ctx.beginPath();
                    ctx.rect(0, 0, width * scale, height * scale);
                    ctx.fillStyle = colors["b"];
                    ctx.fill();
                    var str = "No terminal output";
                    var startX = Math.floor((sizeX - str.length) / 2);
                    var startY = Math.floor((sizeY - 1) / 2);
                    for (var x = 0; x < str.length; x++) {
                        this.renderForeground(startX + x, startY, "0", str.charAt(x), scale);
                    }
                    return;
                }
                for (var y = 0; y < terminal.sizeY; y++) {
                    for (var x = 0; x < terminal.sizeX; x++) {
                        this.renderBackground(x, y, terminal.back[y].charAt(x), scale);
                        this.renderForeground(x, y, terminal.fore[y].charAt(x), terminal.text[y].charAt(x), scale);
                    }
                }
                if (terminal.cursorBlink &&
                    terminal.cursorX >= 0 && terminal.cursorX < sizeX &&
                    terminal.cursorY >= 0 && terminal.cursorY < sizeY &&
                    Math.floor(this.time.valueAsNumber / 400e6) % 2 === 0) {
                    this.renderForeground(terminal.cursorX, terminal.cursorY, terminal.currentFore, "_", scale);
                }
            };
            TerminalRender.prototype.renderBackground = function (x, y, color, scale) {
                var ctx = this.context;
                var actualWidth = cellWidth * scale;
                var actualHeight = cellHeight * scale;
                var cellX = x * actualWidth;
                var cellY = y * actualHeight;
                ctx.beginPath();
                ctx.rect(cellX, cellY, actualWidth, actualHeight);
                ctx.fillStyle = colors[color];
                ctx.fill();
            };
            TerminalRender.prototype.renderForeground = function (x, y, color, chr, scale) {
                if (!fontLoaded)
                    return;
                var ctx = this.context;
                var actualWidth = cellWidth * scale;
                var actualHeight = cellHeight * scale;
                var cellX = x * actualWidth;
                var cellY = y * actualHeight;
                var point = chr.charCodeAt(0);
                var imgX = (point % (fontWidth / cellWidth)) * cellWidth;
                var imgY = Math.floor(point / (fontHeight / cellHeight)) * cellHeight;
                ctx.drawImage(fonts[color], imgX, imgY, cellWidth, cellHeight, cellX, cellY, cellWidth * scale, cellHeight * scale);
            };
            return TerminalRender;
        }());
        Terminal.TerminalRender = TerminalRender;
    })(Terminal = HowlCI.Terminal || (HowlCI.Terminal = {}));
})(HowlCI || (HowlCI = {}));
var HowlCI;
(function (HowlCI) {
    "use strict";
    var request = function (url, type) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.setRequestHeader("Accept", type || "application/vnd.travis-ci.2+json");
            xhr.timeout = 10000;
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr);
                }
                else {
                    reject(xhr);
                }
            };
            xhr.onerror = function () { return reject(xhr); };
            xhr.send(null);
        });
    };
    var always = function (args) { return Promise.resolve(args); };
    var handleError = function (xhr, data) {
        var output;
        if (xhr.status) {
            output = {
                success: false,
                text: xhr.responseText,
                status: xhr.status + ": " + xhr.statusText,
                headers: xhr.getAllResponseHeaders()
            };
        }
        else {
            output = {
                success: false
            };
        }
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                output[key] = data[key];
            }
        }
        return output;
    };
    HowlCI.pages = {};
    HowlCI.pages["index"] = {
        build: always,
        title: function (_) { return "Home | howl.ci"; }
    };
    HowlCI.pages["error"] = {
        build: always,
        title: function (_) { return "Page not found | howl.ci"; }
    };
    HowlCI.pages["builds"] = {
        build: function (args) {
            var repo = args["repo"];
            return request("https://api.travis-ci.org/repos/" + repo + "/builds").then(function (xhr) {
                var res = JSON.parse(xhr.responseText);
                var commitLookup = {};
                for (var _i = 0, _a = res.commits; _i < _a.length; _i++) {
                    var commit = _a[_i];
                    commitLookup[commit.id] = commit;
                }
                for (var _b = 0, _c = res.builds; _b < _c.length; _b++) {
                    var build = _c[_b];
                    build.commit = commitLookup[build.commit_id];
                    build.success = build.state === "passed";
                }
                return {
                    repo: repo,
                    success: true,
                    builds: res.builds
                };
            }, function (xhr) { return handleError(xhr, { repo: repo }); });
        },
        title: function (model) { return model.repo + " | howl.ci"; }
    };
    HowlCI.pages["build"] = {
        build: function (args) {
            var build = args["id"];
            return request("https://api.travis-ci.org/builds/" + build)
                .then(function (xhr) {
                var res = JSON.parse(xhr.responseText);
                // Taken from https://github.com/travis-ci/travis-web/blob/master/app/models/log.js
                var tasks = res.jobs.map(function (job) { return request("https://api.travis-ci.org/jobs/" + job.id + "/log?cors_hax=true", "application/json; chunked=true; version=2, text/plain; version=2").then(function (xhr) {
                    if (xhr.status === 204) {
                        return request(xhr.getResponseHeader("Location"), "text/plain");
                    }
                    else {
                        return xhr;
                    }
                }).then(function (xhr) { return ({ job: job, content: xhr.responseText }); }); });
                tasks.push(request("https://api.travis-ci.org/repos/" + res.build.repository_id)
                    .then(function (x) { return JSON.parse(x.responseText).repo; }));
                return Promise.all(tasks)
                    .then(function (tasks) {
                    var repo = tasks.pop();
                    var logs = tasks.map(function (x) { return ({ job: x.job, lines: HowlCI.Packets.parse(x.content) }); });
                    return {
                        success: true,
                        id: build,
                        logs: logs,
                        repo: repo,
                        build: res.build,
                        commit: res.commit
                    };
                });
            }, function (xhr) { return handleError(xhr, { id: build }); });
        },
        title: function (model) { return "Build #" + model.id + " | howl.ci"; },
        after: function (model) {
            if (model.success) {
                for (var _i = 0, _a = model.logs; _i < _a.length; _i++) {
                    var log = _a[_i];
                    var term = HowlCI.Terminal.TerminalData.empty();
                    var lines = log.lines.lines;
                    var terminals = new Array(lines.length);
                    for (var x = 0; x < lines.length; x++) {
                        var packet = lines[x];
                        term = terminals[x] = term.handlePacket(packet.command, packet.data);
                    }
                    new HowlCI.Terminal.TerminalRender(log.job.id, lines, terminals).redrawTerminal();
                }
            }
        }
    };
    HowlCI.pages["url"] = {
        build: function (args) {
            var url = args["url"];
            return request(url).then(function (xhr) {
                var res = xhr.responseText;
                return {
                    url: url,
                    success: true,
                    lines: HowlCI.Packets.parse(res)
                };
            }, function (xhr) { return handleError(xhr, { url: url }); });
        },
        title: function (model) { return "URL " + model.url + " | howl.ci"; },
        after: function (model) {
            if (model.success) {
                var term = HowlCI.Terminal.TerminalData.empty();
                var lines = model.lines.lines;
                var terminals = new Array(lines.length);
                for (var x = 0; x < lines.length; x++) {
                    var packet = lines[x];
                    term = terminals[x] = term.handlePacket(packet.command, packet.data);
                }
                new HowlCI.Terminal.TerminalRender(0, lines, terminals).redrawTerminal();
            }
        }
    };
})(HowlCI || (HowlCI = {}));
var queryArgs = window.location.search
    .substring(1)
    .split('&')
    .map(function (x) { return x.split('=', 2).map(decodeURIComponent); });
var query = {};
for (var _i = 0, queryArgs_1 = queryArgs; _i < queryArgs_1.length; _i++) {
    var _a = queryArgs_1[_i], k = _a[0], v = _a[1];
    query[k] = v;
}
var pageName = query['p'] || 'index';
var page = HowlCI.pages[pageName];
if (!page) {
    pageName = "error";
    page = HowlCI.pages["error"];
}
page.build(query).then(function (model) {
    if (!model)
        model = {};
    model.page = pageName;
    document.title = page.title(model);
    document.getElementById("content").innerHTML = HowlCI.templates[pageName].render(model, HowlCI.templates);
    if (page.after)
        page.after(model);
    // history.replaceState(model, document.title, window.location.toString());
    // window.onpopstate = function(event) {
    // 	let model = event.state;
    // 	let page = pages[model.page];
    // 	document.title = page.title(model);
    // 	document.getElementById("content").innerHTML = page.render(model, templates);
    // }
}, function (e) {
    var content = String(e);
    if (e instanceof Error)
        content = e.stack;
    content = content
        .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;");
    document.title = "Error | Howl.CI";
    document.getElementById("content").innerHTML = "<h2>Error in Error handling</h2><pre>" + content + "</pre>";
});
