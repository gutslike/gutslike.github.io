/**
 * Wraps each Shiki `<pre>` in a `<figure>` that carries the language name.
 *
 * The label has to live outside the `<pre>`, because Shiki gives that element
 * `overflow-x: auto` — anything inside it scrolls away as soon as a long line
 * does. Putting it in a wrapper also gives the copy button somewhere to sit.
 *
 * Written as a plain recursive walk rather than using `unist-util-visit`,
 * which is only present here as a transitive dependency of Astro's markdown
 * pipeline and could disappear in any minor upgrade.
 */
export function rehypeCodeFigure() {
	return function transform(tree) {
		walk(tree);
	};
}

function walk(node) {
	if (!node || !Array.isArray(node.children)) return;

	for (let i = 0; i < node.children.length; i++) {
		const child = node.children[i];

		if (child?.type === 'element' && child.tagName === 'pre') {
			const lang = child.properties?.dataLanguage;

			if (lang && lang !== 'plaintext' && lang !== 'text') {
				node.children[i] = wrap(child, String(lang));
				// Don't descend into what we just built.
				continue;
			}
		}

		walk(child);
	}
}

function wrap(pre, lang) {
	return {
		type: 'element',
		tagName: 'figure',
		properties: { className: ['code-block'], 'data-language': lang },
		children: [
			{
				type: 'element',
				tagName: 'figcaption',
				properties: { className: ['code-lang'] },
				children: [{ type: 'text', value: lang }],
			},
			pre,
		],
	};
}
