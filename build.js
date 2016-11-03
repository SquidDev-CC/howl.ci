'use strict';

const fs     = require('fs'),
      path   = require('path'),
      hogan  = require('hogan.js'),
      sass   = require('node-sass'),
      Uglify = require('uglify-js'),
      colors = require('colors'),
      rimraf = require('rimraf'),
      ts     = require('typescript');

const config = {
	templateDir: 'public/templates/',
};

const javascript = [
	'node_modules/hogan.js/lib/template.js',
	'node_modules/es6-promise/dist/es6-promise.auto.js',
	'dist/templates.js',
	'dist/main.js'
];

config.scripts = javascript.map(x => ({script: path.basename(x)}));

if(fs.existsSync('config.json')) {
	Object.assign(config, JSON.parse(fs.readFileSync('config.json')));
}

let watching = false;
for(const arg of process.argv.slice(2)) {
	switch(arg) {
		case "--development":
		case "--dev":
		case "-d":
			config.development = true;
			break;
		case "--release":
		case "-r":
			config.development = false;
			break;
		case "--watch":
		case "-w":
			watching = true;
			break;
		default:
			console.error(`Unknown option ${arg}`);
			process.exit(1);
	}
}

const updateConfig = () => {
	const date = new Date();
	const dateObj = config.date = {};
	for(const field of Object.getOwnPropertyNames(Date.prototype)) {
		if(field.startsWith("get")) {
			dateObj[field.charAt(3).toLowerCase() + field.substr(4)] = Date.prototype[field].call(date);
		}
	}

	if(config.development) {
		config.version = 'dev' + date.getTime();
	} else {
		config.version = JSON.parse(fs.readFileSync('package.json')).version;
	}

	console.log('Building Howl.CI: ' + config.version + " at " + date);
}

updateConfig();

const step = function(name, func, run) {
	if(arguments.length < 3 || run) {
		console.log(colors.green('Starting ' + name));
		const start = Date.now();
		func();
		const end = Date.now();
		console.log(colors.cyan('         ' + name + ' took ' + (end - start) + " milliseconds"));
	} else {
		console.log(colors.yellow('Skipping ' + name));
	}

	return () => step.apply(null, arguments);
}

step('Ensure exists', () => {
	if(!fs.existsSync('dist')) fs.mkdirSync('dist');
	if(!fs.existsSync('temp')) fs.mkdirSync('temp');
});

step('Clean', () => {
	rimraf.sync('dist/**/*');
});

step('Copy font', () => {
	const contents = fs.readFileSync("public/termFont.png");
	fs.writeFileSync("dist/termFont.png", contents);
});

const listDir = root => {
	const results = [];
	const queue = [''];
	while(queue.length > 0) {
		const dir = queue.pop();
		const wholeDir = path.join(root, dir);

		for(const file of fs.readdirSync(wholeDir)) {
			const wholeFile = path.join(wholeDir, file);
			const relFile = path.join(dir, file);

			if(fs.statSync(wholeFile).isDirectory()) {
				queue.push(relFile);
			} else {
				results.push(relFile);
			}
		}
	}

	return results;
}

const templatesLayout = step('Generate layout.html', () => {
	const layout = hogan.compile(fs.readFileSync(config.templateDir + 'layout.html', 'utf8'));
	const sidebar = hogan.compile(fs.readFileSync(config.templateDir + 'partial/sidebar.html', 'utf8'));

	const root = path.join(config.templateDir, 'static');
	const templates = listDir(root)
		.filter(x => x.endsWith(".html"));

	for(const template of templates) {
		let dir = 'dist/' + path.dirname(template);
		while(!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			dir = path.dirname(dir);
		}

		let base = "";
		let levels = template.split(path.sep).length - 1;
		if(levels == 0) base = "./";
		for(let i = 0; i < levels; i++) base += "../";

		fs.writeFileSync('dist/' + template, layout.render(Object.assign({
			javascript: template == 'index.html',
			base: base,
		}, config), {
			['content']: hogan.compile(fs.readFileSync(path.join(root, template), 'utf8')),
			['partial/sidebar']: sidebar
		}));
	}
});

const templatesMake = step('Generate templates', () => {
	const templates = listDir(config.templateDir)
		.filter(x => x != 'layout.html' && !x.startsWith("static") && x.endsWith(".html"))
		.map(file => {
			const contents = fs.readFileSync(config.templateDir + file, 'utf8');
			const template = hogan.compile(contents, { asString: true});
			const name = file.replace(/\..*$/, '').replace('\\', '/');

			return 'templates["' + name + '"] = new Hogan.Template(' + template + ');';
		});

	const header = 'var HowlCI; (function (HowlCI) { var templates = HowlCI.templates = {};\n';
	const footer = '\n})(HowlCI || (HowlCI = {}));';

	fs.writeFileSync('dist/templates.js', header + templates.join('\n') + footer);
});

const jsCopy = step('Copy JS', () => {
	for(const file of javascript) {
		if(file.startsWith('dist/')) continue;

		const contents = fs.readFileSync(file, 'utf8');
		fs.writeFileSync('dist/' + path.basename(file), contents);
	}
}, config.development);

const tsBuild = step('Compile TS', () => {
	const config = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
	const configP = ts.parseJsonConfigFileContent(config, ts.sys, path.resolve("."), null, path.resolve("tsconfig.json"));

	// TODO: Incremental compilation?: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
	const program = ts.createProgram(configP.fileNames, configP.options);
	const emitResult = program.emit();

	const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
	for(const diagnostic of diagnostics) {
		const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		if(diagnostic.start && diagnostic.file) {
			const pos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			console.log(colors.red(`${diagnostic.file.fileName} (${pos.line + 1},${pos.character + 1}): `) + message);
		} else {
			console.log(colors.red(message));
		}
	}
});

const jsMinify = step('Minify JS', () => {
	var result = Uglify.minify(javascript, {
		mangle: { toplevel: true },
		compress: false,
		output: { comments: "some" },
	});
	fs.writeFileSync('dist/main.min.js', result.code);
	for(const file of javascript) {
		if(file.startsWith('dist/')) fs.unlink(file);
	}
}, !config.development);

const sassCombine = step('Compile Sass', () => {
	const contents = sass.renderSync({
		file: 'public/css/main.scss',
		outputStyle: 'expanded',
	});

	fs.writeFileSync('dist/main.css', contents.css);
}, config.development);

const sassMinify = step('Minify Sass', () => {
	const contents = sass.renderSync({
		file: 'public/css/main.scss',
		outputStyle: 'compressed',
	});

	fs.writeFileSync('dist/main.min.css', contents.css);
}, !config.development);

const watcher = (file, callback) => {
	let triggered = false;
	const defer = () => {
		try {
			updateConfig();
			templatesLayout();

			callback();
		} catch(e) {
			console.log(colors.red(e));
		}
		triggered = false;
	};

	fs.watch(file, { recursive: true, persistent: true }, () => {
		if(triggered) return;
		triggered = true;
		setTimeout(defer, 100);
	});
};

if(watching) {
	watcher("public/css", () => {
		sassCombine();
		sassMinify();
	});

	watcher("public/js", () => {
		tsBuild();
		jsMinify();
	});

	watcher("tsconfig.json", () => {
		tsBuild();
		jsMinify();
	});

	watcher("public/templates", () => {
		templatesMake();
		jsMinify();
	});
}

console.log(colors.green("Build completed"));
