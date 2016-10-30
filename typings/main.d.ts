declare namespace Hogan {
	export class Template {
		constructor(code:any);
		render: (model:any, partial?:{[name:string]:Template},indent?:string)=>string;
	}
}

declare namespace HowlCI {
	export let templates:{[name:string]:Hogan.Template};
}
