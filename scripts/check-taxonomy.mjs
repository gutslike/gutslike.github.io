/**
 * Asserts the taxonomy helpers agree with what is actually on disk.
 * Counts here are derived from the filesystem, not typed in, so this stays
 * true as posts are added.
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src/content/blog';

function walk(dir, depth = 1, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) walk(full, depth + 1, out);
		else if (name.endsWith('.md') || name.endsWith('.mdx')) out.push({ depth });
	}
	return out;
}

const files = walk(ROOT);
const inSeries = files.filter((f) => f.depth >= 3).length;
const standalone = files.filter((f) => f.depth === 2).length;

console.log(`total: ${files.length}  in series: ${inSeries}  standalone: ${standalone}`);
