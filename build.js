'use strict';

let fs     = require('fs'),
    path   = require('path'),
    hogan  = require('hogan.js'),
    sass   = require('node-sass'),
    Uglify = require('uglify-js'),
    colors = require('colors'),
    ts     = require('typescript');

let config = {
	templateDir: 'public/templates/',
	tempDir: 'temp/',
};

let javascript = [
	'node_modules/hogan.js/lib/template.js',
	'node_modules/es6-promise/dist/es6-promise.auto.js',
	'temp/templates.js',
	'dist/main.js'
];
config.scripts = javascript.map(x => ({script: path.basename(x)}));

if(fs.existsSync('config.json')) {
	Object.assign(config, JSON.parse(fs.readFileSync('config.json')));
}

let watching = false;
for(let arg of process.argv.slice(2)) {
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

let updateConfig = () => {
	let date = new Date();
	let dateObj = config.date = {};
	for(let field of Object.getOwnPropertyNames(Date.prototype)) {
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

let step = function(name, func, run) {
	if(arguments.length < 3 || run) {
		console.log(colors.green('Starting ' + name));
		let start = Date.now();
		func();
		let end = Date.now();
		console.log(colors.cyan('         ' + name + ' took ' + (end - start) + " milliseconds"));
	} else {
		console.log(colors.yellow('Skipping ' + name));
	}

	return () => step.apply(null, arguments);
}

step('Ensure exists', () => {
	if(!fs.existsSync('temp')) fs.mkdirSync('temp');
	if(!fs.existsSync('dist')) fs.mkdirSync('dist');
});

step('Clean', () => {
	for(let file of fs.readdirSync('dist')) fs.unlinkSync("dist/" + file);
});

step('Copy font', () => {
	let contents = fs.readFileSync("public/termFont.png");
	fs.writeFileSync("dist/termFont.png", contents);
});

let templatesLayout = step('Generate layout.html', () => {
	let contents = fs.readFileSync(config.templateDir + 'layout.html', 'utf8');
	let template = hogan.compile(contents);

	let rendered = template.render(config);
	fs.writeFileSync('dist/index.html', rendered);
});

let templatesMake = step('Generate templates', () => {
	let templates = fs.readdirSync(config.templateDir, 'utf8')
		.filter(x => x != 'layout.html' && x.endsWith('.html'))
		.map(file => {
			let contents = fs.readFileSync(config.templateDir + file, 'utf8');
			let template = hogan.compile(contents, { asString: true});
			let name = file.replace(/\..*$/, '');

			return 'templates["' + name + '"] = new Hogan.Template(' + template + ');';
		});

	let header = 'var HowlCI; (function (HowlCI) { var templates = HowlCI.templates = {};\n';
	let footer = '\n})(HowlCI || (HowlCI = {}));';

	fs.writeFileSync(config.tempDir + 'templates.js', header + templates.join('\n') + footer);
});

let jsCopy = step('Copy JS', () => {
	for(let file of javascript) {
		if(file.startsWith('dist/')) continue;

		let contents = fs.readFileSync(file, 'utf8');
		fs.writeFileSync('dist/' + path.basename(file), contents);
	}
}, config.development);

let tsBuild = step('Compile TS', () => {
	let config = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
	let configP = ts.parseJsonConfigFileContent(config, ts.sys, path.resolve("."), null, path.resolve("tsconfig.json"));

	// TODO: Incremental compilation?: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
	let program = ts.createProgram(configP.fileNames, configP.options);
	let emitResult = program.emit();

	let diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
	for(let diagnostic of diagnostics) {
		let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		if(diagnostic.start && diagnostic.file) {
			let pos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			console.log(colors.red(`${diagnostic.file.fileName} (${pos.line + 1},${pos.character + 1}): `) + message);
		} else {
			console.log(colors.red(message));
		}
	}
});

let jsMinify = step('Minify JS', () => {
	var result = Uglify.minify(javascript, {
		mangle: { toplevel: true },
		compress: false,
	});
	fs.writeFileSync('dist/main.min.js', result.code);
	fs.unlink('dist/main.js');
}, !config.development);

let sassCombine = step('Compile Sass', () => {
	let contents = sass.renderSync({
		file: 'public/css/main.scss',
		outputStyle: 'expanded',
	});

	fs.writeFileSync('dist/main.css', contents.css);
}, config.development);

let sassMinify = step('Minify Sass', () => {
	let contents = sass.renderSync({
		file: 'public/css/main.scss',
		outputStyle: 'compressed',
	});

	fs.writeFileSync('dist/main.min.css', contents.css);
}, !config.development);

let watcher = (file, callback) => {
	let triggered = false;
	let defer = () => {
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
		templatesLayout();
		templatesMake();

		let contents = fs.readFileSync('temp/templates.js', 'utf8');
		fs.writeFileSync('dist/templates.js', contents);

		jsMinify();
	});
}

console.log(colors.green("Build completed"));
