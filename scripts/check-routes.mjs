/**
 * Compares the routes the build just emitted against docs/route-baseline.txt
 * and exits non-zero if they differ.
 *
 * Line endings are normalised on both sides. The baseline is committed as LF,
 * but git's core.autocrlf rewrites it to CRLF on a Windows checkout, which made
 * a plain `diff` report all 51 lines as changed when nothing had changed at all.
 * A safety net that cries wolf on one platform is a net people learn to ignore.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const BASELINE = 'docs/route-baseline.txt';

function walk(dir, out = []) {
	for (const name of readdirSync(dir).sort()) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (name.endsWith('.html')) out.push(relative(DIST, full).split(sep).join('/'));
	}
	return out;
}

const lines = (text) => text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).sort();

const expected = lines(readFileSync(BASELINE, 'utf8'));
const actual = walk(DIST).sort();

const missing = expected.filter((r) => !actual.includes(r));
const added = actual.filter((r) => !expected.includes(r));

if (!missing.length && !added.length) {
	console.log(`routes ok — all ${expected.length} intact`);
	process.exit(0);
}

if (missing.length) console.error(`MISSING (${missing.length}):\n  ` + missing.join('\n  '));
if (added.length) console.error(`ADDED (${added.length}):\n  ` + added.join('\n  '));
console.error('\nIf an addition is intended, refresh the baseline:');
console.error('  node scripts/routes.mjs > docs/route-baseline.txt');
process.exit(1);
