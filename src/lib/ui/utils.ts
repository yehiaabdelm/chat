import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';
import copyButtonSvg from '$lib/ui/icons/Copy.svg?raw';

export const marked = new Marked(
	markedHighlight({
		langPrefix: 'hljs language-',
		highlight: (code, lang) => {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			const { value } = hljs.highlight(code, { language });
			const id = Math.random().toString(36).substring(7);
			return `<div class="tt-code-container">
						<button class="tt-copy-code-button" style="position: absolute; top: 0; right: 0; z-index: 9; background: radial-gradient(rgb(var(--theme-color)), rgb(var(--theme-color), 0) 80%);" onclick="copyCode('${id}')" id="button-${id}">${copyButtonSvg}</button>
						<div id="${id}" style="display: block; overflow: auto; margin-top: 0;" class="tt-code">${value}</div>
					</div>`;
		}
	}),
	markedKatex({ throwOnError: false })
);

export const debounce = (func: Function, timeout = 250) => {
	let timer: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
};
