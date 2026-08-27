/**
 * Lists every HTML file the build emitted, one dist-relative path per line,
 * sorted. Diffing this against docs/route-baseline.txt is how we prove a
 * refactor did not silently drop a URL.
 *
 * Paths are normalised to forward slashes so the baseline is identical on
 * Windows and on the Linux runner that builds for GitHub Pages.
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';

function walk(dir, out = []) {
	for (const name of readdirSync(dir).sort()) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (name.endsWith('.html')) out.push(relative(DIST, full).split(sep).join('/'));
	}
	return out;
}

console.log(walk(DIST).sort().join('\n'));
