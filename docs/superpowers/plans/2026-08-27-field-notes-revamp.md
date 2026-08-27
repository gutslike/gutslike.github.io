# Field Notes Portfolio Revamp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the home page as a portfolio, deepen the about page, and split the blog index into series and notes — all in the Field Notes visual direction, without changing a single URL.

**Architecture:** Astro static site, zero new runtime dependencies. All person-data moves into one typed module (`src/lib/profile.ts`); all taxonomy stays in `src/lib/posts.ts`. Two new layout primitives (`Section`, `LeaderRow`) express the section-rail and dotted-leader patterns that the three rebuilt pages share. The visual change is driven entirely through the existing CSS token system.

**Tech Stack:** Astro 6.3.8, TypeScript, Astro Fonts API (Google provider), Shiki, no CSS framework, no UI library.

**Spec:** `docs/superpowers/specs/2026-08-27-portfolio-revamp-design.md`

## Global Constraints

- **No new npm dependencies.** Not one. The user explicitly dropped the external-component idea on 2026-08-27.
- **No new client JavaScript.** The site ships 647 bytes total (`CopyCode.astro`) and that number must not rise.
- **No URL may change.** All 35 post URLs, 5 topic URLs and 7 series URLs must survive. Enforced by the route check built in Task 1.
- **`npm run build` must finish with zero warnings.** This has been the standard since Phase 3.
- **`getCollection` and `post.id.split()` appear only in `src/lib/posts.ts`.** Never re-derive taxonomy in a page.
- **Every colour comes from a token.** No literal hex in a component. Tokens are defined three times — bare `:root`, `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme='light'])`, and `:root[data-theme='dark']`.
- **Real content only.** No lorem, no invented facts. Everything about the person comes from `public/Manubhav_Sharma_Resume.pdf` or from what the user supplied on 2026-08-27.
- **The phone number from the CV never appears in any file under `src/`.**
- **Counts are derived, never typed.** "35 posts", "7 series", "4 notes" are computed from the collection at build time.

**Exact values, copied from the spec:**

```
Light   --ground #f3f4ef   --surface #ffffff   --sunken #e8eae1
        --ink #191c15      --muted #6b7263     --line #d2d7c8
        --accent #2f6b1f   --accent-hover #3d8626   --on-accent #f3f4ef

Dark    --ground #141610   --surface #1b1e16   --sunken #22261d
        --ink #e4e7dc      --muted #949c88     --line #2c3128
        --accent #8fd16e   --accent-hover #a6e086   --on-accent #141610

Shape   --radius 2px   --radius-lg 3px   all --shadow* removed
Type    headings/labels JetBrains Mono 400,700   body Source Serif 4 400,600 + italic
```

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `scripts/routes.mjs` | **Create.** Lists every HTML file in `dist/`, sorted. The safety net for "no URL may change". | 1 |
| `docs/route-baseline.txt` | **Create.** The pre-change route manifest, committed so any task can diff against it. | 1 |
| `astro.config.mjs` | **Modify.** Swap the local Atkinson font block for Source Serif 4 via the Google provider. | 2 |
| `src/components/BaseHead.astro` | **Modify.** Render the `--font-serif` variable instead of `--font-atkinson`. | 2 |
| `src/assets/fonts/` | **Delete.** Dead once Atkinson is unreferenced. | 2 |
| `src/styles/global.css` | **Modify.** Token values, heading font, radius, shadows, code-figure and copy-button shape. | 2, 3 |
| `src/components/PostNav.astro` | **Modify.** Panels → ruled rows. | 3 |
| `src/layouts/BlogPost.astro` | **Modify.** Hero image shadow → hairline border. | 3 |
| `src/pages/blog/[topic]/index.astro` | **Modify.** Cards → ruled rows. | 3 |
| `src/pages/blog/[topic]/[series]/index.astro` | **Modify.** Cards → ruled rows. | 3 |
| `src/lib/profile.ts` | **Create.** All person-data: identity, skills, projects, education, certificates. Pure data, no markup. | 4 |
| `src/lib/posts.ts` | **Modify.** Add `seriesIndex()` and `standalonePosts()`. Nothing else changes. | 5 |
| `src/components/Section.astro` | **Create.** The section-rail primitive — `§ n` + label in a left rail, content beside it. | 6 |
| `src/components/LeaderRow.astro` | **Create.** One dotted-leader row. Used by projects, series, education, certificates. | 6 |

**One deliberate deviation from spec §9:** the spec listed a third new component, `SkillGroups.astro`. It is not created. The skill groups render on exactly one page, and a component with a single consumer costs a file and an indirection while buying nothing — the `<dl>` lives inline in `index.astro` instead. `Section` and `LeaderRow` earn their existence because three and four pages use them respectively.
| `src/consts.ts` | **Modify.** Site title and description are currently "Manubhav's blogs" / "Welcome to my website!". | 7 |
| `src/components/Header.astro` | **Rewrite.** Mono masthead, 1px accent underline for the active page. | 7 |
| `src/components/Footer.astro` | **Rewrite.** Mono, left-aligned, GitHub + LinkedIn + email. | 7 |
| `src/pages/index.astro` | **Rewrite.** The portfolio home — five sections. | 8 |
| `src/pages/about.astro` | **Rewrite.** Drops the `BlogPost` layout and its meaningless 2021 date. Seven sections. | 9 |
| `src/pages/blog/index.astro` | **Rewrite.** Two zones: series, then notes. Kills the dead `topicInfo` map. | 10 |

---

## Task 1: Route safety net

Nothing else in this plan is safe without this. Every later task diffs against the baseline this produces.

**Files:**
- Create: `scripts/routes.mjs`
- Create: `docs/route-baseline.txt`

**Interfaces:**
- Consumes: nothing.
- Produces: `node scripts/routes.mjs` prints one `dist`-relative HTML path per line, sorted. `docs/route-baseline.txt` holds the pre-change output.

- [ ] **Step 1: Get to a clean starting point**

The working tree currently holds ~60 uncommitted files from Phases 1–5. **Confirm with the user before running this** — it is their call, not the executor's.

```bash
git add -A
git commit -m "chore: phases 1-5 of the site revamp

Taxonomy module, single layout, token system, contrast fixes,
code-block figures, table of contents, post navigation.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01SmQ6oaM2LbSQHVXJMZ24sN"
```

- [ ] **Step 2: Write the route lister**

Create `scripts/routes.mjs`:

```js
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
```

- [ ] **Step 3: Build and capture the baseline**

```bash
rm -rf .astro dist
npm run build
node scripts/routes.mjs > docs/route-baseline.txt
wc -l < docs/route-baseline.txt
```

Expected: **51 lines.** (35 posts + 5 topics + 7 series + home + about + blog index + 404 = 51. If the number differs, stop and reconcile before going further — the baseline is only useful if it is correct.)

- [ ] **Step 4: Prove the check catches a real regression**

A safety net nobody has seen fail is not known to work.

```bash
rm -rf dist/blog/misc
node scripts/routes.mjs | diff docs/route-baseline.txt - ; echo "exit=$?"
```

Expected: diff prints the removed `blog/misc/cdn-and-sanity/index.html` line and `exit=1`.

Then restore: `npm run build && node scripts/routes.mjs | diff docs/route-baseline.txt - && echo "clean"` → prints `clean`.

- [ ] **Step 5: Commit**

```bash
git add scripts/routes.mjs docs/route-baseline.txt
git commit -m "test: add route manifest baseline to guard against URL loss"
```

---

## Task 2: Typography — Atkinson out, Source Serif 4 in

**Files:**
- Modify: `astro.config.mjs:28-53` (the Atkinson font entry)
- Modify: `src/components/BaseHead.astro:35`
- Modify: `src/styles/global.css:125` (body) and `:156-166` (headings)
- Delete: `src/assets/fonts/`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS variables `--font-serif` and `--font-mono` are both live on every page. `--font-atkinson` no longer exists anywhere.

- [ ] **Step 1: Replace the font entry in `astro.config.mjs`**

Delete the entire `Atkinson` object (provider `local()`, lines 28–53) and put this in its place, keeping the JetBrains Mono entry below it untouched:

```js
    {
      // Body text. Astro downloads and self-hosts this, so there is no runtime
      // request to Google. Source Serif 4 ships a true italic — Atkinson, which
      // this replaces, had no italic file in the repo, so every <em> on the site
      // was a browser-synthesised oblique.
      provider: fontProviders.google(),
      name: "Source Serif 4",
      cssVariable: "--font-serif",
      weights: [400, 600],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "Cambria", "Times New Roman", "serif"],
    },
```

- [ ] **Step 2: Render the new variable in `BaseHead.astro`**

The `<Font>` component is what actually emits the CSS variable. A `cssVariable` that is configured but never rendered resolves to nothing, and the rule silently falls back — this exact bug hid in `--font-mono` for a whole phase.

Replace line 35:

```diff
-<Font cssVariable="--font-atkinson" preload />
+<Font cssVariable="--font-serif" preload />
 <Font cssVariable="--font-mono" />
```

- [ ] **Step 3: Point the body and headings at the new faces**

In `src/styles/global.css`, change the `body` rule's first declaration:

```diff
 body {
-  font-family: var(--font-atkinson);
+  font-family: var(--font-serif, Georgia, Cambria, 'Times New Roman', serif);
```

And give headings the mono face — this is the core of the Field Notes look:

```diff
 h1,
 h2,
 h3,
 h4,
 h5,
 h6 {
+  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
+  font-weight: 700;
+  letter-spacing: -0.02em;
   margin: 0 0 0.5rem 0;
   color: inherit;
   line-height: 1.2;
   text-wrap: balance;
 }
```

- [ ] **Step 4: Delete the dead font files**

```bash
git rm -r src/assets/fonts
grep -rn "atkinson\|Atkinson" src/ astro.config.mjs || echo "no references remain"
```

Expected: `no references remain`.

- [ ] **Step 5: Build and verify the routes are untouched**

```bash
rm -rf .astro dist && npm run build 2>&1 | tee /tmp/build.log
grep -ci "warn" /tmp/build.log
node scripts/routes.mjs | diff docs/route-baseline.txt - && echo "routes clean"
```

Expected: warning count `0`, and `routes clean`.

- [ ] **Step 6: Verify the fonts actually resolve in a browser**

Do not skip this for a visual check. A broken `var()` looks like a font you might have chosen.

Serve `dist/` and, on the home page, read the computed styles:

```js
getComputedStyle(document.body).fontFamily          // must contain "Source Serif 4"
getComputedStyle(document.querySelector('h1')).fontFamily  // must contain "JetBrains Mono"
```

Then confirm the italic is real, not synthesised — open any post with an `<em>` and check that the glyph shapes differ from a slanted roman (Source Serif 4's italic `a` is single-storey; the roman is double-storey).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: swap Atkinson for Source Serif 4, mono headings

Source Serif 4 ships a real italic; the repo had no Atkinson italic
file, so every <em> was a synthesised oblique."
```

---

## Task 3: The visual system — tokens, shape, and every component that depended on the old one

The largest blast radius in this plan. Tokens and the components that consume them move together, because tokens changed alone would leave cards with neither shadow nor border — objects that read as broken rather than flat.

**Files:**
- Modify: `src/styles/global.css` (token blocks ×3, `figure.code-block`, `.copy-code`)
- Modify: `src/components/PostNav.astro:44-64`
- Modify: `src/layouts/BlogPost.astro:97-102`
- Modify: `src/pages/blog/[topic]/index.astro` (`.card`, `.post-card`)
- Modify: `src/pages/blog/[topic]/[series]/index.astro` (`.post-card`)

**Interfaces:**
- Consumes: nothing.
- Produces: the token set listed in Global Constraints, plus `--text-label: 0.7rem`. `--grad-1`, `--grad-2`, `--on-grad-1`, `--on-grad-2`, `--shadow-sm`, `--shadow`, `--shadow-lg` no longer exist.

- [ ] **Step 1: Rewrite the three token blocks**

In `src/styles/global.css`, replace the surface/text/accent/gradient/shadow declarations inside `:root` with:

```css
  /* Surfaces and text — paper */
  --ground: #f3f4ef;
  --surface: #ffffff;
  --sunken: #e8eae1;
  --ink: #191c15;
  --muted: #6b7263;
  --line: #d2d7c8;

  /* Accent */
  --accent: #2f6b1f;
  --accent-hover: #3d8626;
  --on-accent: #f3f4ef;

  --radius: 2px;
  --radius-lg: 3px;

  --text-label: 0.7rem;
```

Delete the `--grad-1` / `--on-grad-1` / `--grad-2` / `--on-grad-2` declarations and all three `--shadow*` declarations. Keep the brand ramp (`--spruce`, `--green`, `--emerald`, `--aquamarine`), the type scale, and `--measure`.

Make the same deletions in both dark blocks, and set their surface values to:

```css
    --ground: #141610;
    --surface: #1b1e16;
    --sunken: #22261d;
    --ink: #e4e7dc;
    --muted: #949c88;
    --line: #2c3128;

    --accent: #8fd16e;
    --accent-hover: #a6e086;
    --on-accent: #141610;
```

Apply to **both** `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) }` and `:root[data-theme='dark']`. They must stay identical — a value in one and not the other is the classic unreadable-artifact bug.

- [ ] **Step 2: Reshape the code figures**

Paper does not have 12px corners.

```diff
 figure.code-block {
   position: relative;
   margin: 2em 0;
   border: 1px solid var(--line);
-  border-radius: 12px;
+  border-radius: var(--radius);
   overflow: hidden;
   background: var(--surface);
 }
```

```diff
 .copy-code {
   position: absolute;
   top: 0.25em;
   right: 0.5em;
   font: inherit;
   font-size: 0.72rem;
   line-height: 1;
   padding: 0.45em 0.8em;
-  border-radius: 999px;
+  border-radius: var(--radius);
```

Also drop the now-dangling `border-radius: 12px` from the bare `pre` rule, replacing it with `var(--radius)`.

- [ ] **Step 3: Prove no orphan token references remain**

```bash
grep -rn "grad-1\|grad-2\|on-grad\|var(--shadow" src/ || echo "no orphans"
```

Expected at this point: **matches in four files** — `BlogPost.astro`, `blog/index.astro`, `blog/[topic]/index.astro`, `blog/[topic]/[series]/index.astro`. Steps 4–6 clear three of them; `blog/index.astro` is rewritten in Task 10. Re-run this grep after Task 10 and expect `no orphans`.

- [ ] **Step 4: `PostNav.astro` — panels become ruled rows**

Replace the `.post-nav a` rule:

```diff
 .post-nav a {
   display: flex;
   flex-direction: column;
   gap: 0.3rem;
-  padding: 1.1rem 1.3rem;
-  border: 1px solid var(--line);
-  border-radius: var(--radius);
-  background: var(--surface);
+  padding: 1rem 0;
+  border-top: 1px solid var(--line);
   text-decoration: none;
   color: var(--ink);
-  transition: border-color 0.2s ease;
+  transition: border-color 0.2s ease, color 0.2s ease;
 }
 
 .post-nav a:hover {
   border-color: var(--accent);
+  color: var(--accent);
 }
```

- [ ] **Step 5: `BlogPost.astro` — hero shadow becomes a hairline**

```diff
 .hero-image img {
   display: block;
   margin: 0 auto;
-  border-radius: 12px;
-  box-shadow: var(--shadow);
+  border-radius: var(--radius);
+  border: 1px solid var(--line);
 }
```

- [ ] **Step 6: The two `[topic]` pages — cards become ruled rows**

In `src/pages/blog/[topic]/index.astro`, replace the `.grid` / `.card` / `.post-card` rules:

```css
	.grid {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--line);
	}

	.card {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.1rem 0;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		color: var(--ink);
		transition: color 0.2s ease;
	}

	.card:hover {
		color: var(--accent);
	}

	.card h2 {
		margin: 0;
		font-size: var(--text-h4);
	}

	.card p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--muted);
		text-align: right;
	}

	.post-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--line);
	}

	.post-card {
		display: block;
		padding: 1.1rem 0;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		color: var(--ink);
		transition: color 0.2s ease;
	}

	.post-card:hover {
		color: var(--accent);
	}

	.post-card h3 {
		margin: 0 0 0.2rem;
		font-size: var(--text-h5);
	}

	.post-card p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--muted);
	}
```

Delete the `transform: translateY(...)` hover rules and the `@media (prefers-reduced-motion)` block that only existed to cancel them — a colour transition needs no such escape hatch, and leaving a rule that references a removed transform is dead code.

Then in `src/pages/blog/[topic]/[series]/index.astro`, replace its `.post-list` / `.post-card` rules and delete its `@media (prefers-reduced-motion)` block entirely. The full replacement:

```css
	.post-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--line);
	}

	.post-card {
		display: block;
		padding: 1.1rem 0;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		color: var(--ink);
		transition: color 0.2s ease;
	}

	.post-card:hover {
		color: var(--accent);
	}

	.post-card h3 {
		margin: 0 0 0.2rem;
		font-size: var(--text-h5);
	}

	.post-card p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--muted);
	}
```

- [ ] **Step 7: Build, check routes, check contrast**

```bash
rm -rf .astro dist && npm run build 2>&1 | grep -ci warn
node scripts/routes.mjs | diff docs/route-baseline.txt - && echo "routes clean"
```

Expected: `0` and `routes clean`.

Then in a browser, measure — do not eyeball — the contrast of every distinct text-on-background pairing, in light and in dark:

| Pair | Floor |
|---|---|
| `--ink` on `--ground` | 4.5:1 |
| `--muted` on `--ground` | 4.5:1 |
| `--muted` on `--surface` | 4.5:1 |
| `--accent` on `--ground` | 4.5:1 |
| `--on-accent` on `--accent` | 4.5:1 |

Phase 3 established a floor of 5.68:1 across the site. This task must not lower it. If a pair fails, adjust the token — never the component.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: retune tokens to the Field Notes palette, drop shadows and radii

Cards become ruled rows across the topic and series pages; gradient
and shadow tokens are removed rather than left orphaned."
```

---

## Task 4: `src/lib/profile.ts` — the person, as data

**Files:**
- Create: `src/lib/profile.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `PROFILE`, `SKILLS: SkillGroup[]`, `PROJECTS: Project[]`, `EDUCATION: Education[]`, `CERTIFICATES: Certificate[]`, and the four interfaces. Tasks 7–9 import these by exactly these names.

- [ ] **Step 1: Write the module**

```ts
/**
 * Everything the site knows about the person, in one place.
 *
 * Sourced from public/Manubhav_Sharma_Resume.pdf and from what the user
 * supplied directly on 2026-08-27. Pages read from here; nothing about the
 * person is written twice.
 *
 * The phone number on the CV is deliberately absent. A public HTML page with
 * a phone number on it is a scraping target and nothing here needs one.
 */

export interface SkillGroup {
	label: string;
	items: string[];
}

export interface Project {
	/** Display index. Two digits, because the list is short and ordered. */
	n: string;
	title: string;
	stack: string;
	blurb: string;
	/** Omitted until a URL exists — a row with no link renders with no action. */
	href?: string;
	hrefLabel?: string;
}

export interface Education {
	what: string;
	where: string;
	when: string;
}

export interface Certificate {
	name: string;
	issuer: string;
}

export const PROFILE = {
	name: 'Manubhav Sharma',
	tagline: 'Aspiring full-stack developer.',
	location: 'Ghaziabad, UP',
	email: 'manubhavsharma09@gmail.com',
	github: 'https://github.com/gutslike',
	linkedin: 'https://www.linkedin.com/in/manubhav-sharma-343b98283',
	cv: '/Manubhav_Sharma_Resume.pdf',
} as const;

export const SKILLS: SkillGroup[] = [
	{ label: 'Languages', items: ['JavaScript', 'Python', 'Java', 'C', 'Go'] },
	{
		label: 'Frontend',
		items: ['React.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Context API', 'Bootstrap'],
	},
	{ label: 'Backend', items: ['Node.js', 'Express.js', 'Go', 'RESTful APIs'] },
	{ label: 'Databases', items: ['MongoDB', 'MySQL', 'SQLite3', 'Firebase'] },
	{
		label: 'Testing',
		items: ['Selenium WebDriver', 'Playwright', 'Cypress', 'TestNG', 'Postman', 'REST Assured'],
	},
	{ label: 'Platform', items: ['Linux', 'Git', 'GitHub', 'Jenkins', 'Azure'] },
];

export const PROJECTS: Project[] = [
	{
		n: '01',
		title: 'E-commerce Platform',
		stack: 'MERN · Admin panel',
		blurb:
			'An end-to-end storefront with an admin panel covering the full set of operational utilities, built so the catalogue and orders are handled dynamically rather than hard-coded.',
		href: 'https://e-commerce-qs8m.vercel.app/',
		hrefLabel: 'Live demo',
	},
	{
		n: '02',
		title: 'FIR Classification System',
		stack: 'Python · PyTorch',
		blurb:
			'A deep-learning model that reads the text of a First Information Report and predicts the correct Indian Penal Code section. I owned the training pipeline end to end, including the hyperparameter tuning that moved classification accuracy.',
	},
	{
		n: '03',
		title: 'HTTPS Server',
		stack: 'C',
		blurb:
			'An HTTPS server written from scratch in C, with a proxy cache layer in front of it.',
	},
	{
		n: '04',
		title: 'CLI Argument Parser',
		stack: 'C',
		blurb:
			'A general-purpose command-line parser in C that dissects arguments and input — built as the foundation other command-line tools sit on top of.',
	},
];

export const EDUCATION: Education[] = [
	{ what: 'B.Tech, Computer Science & Engineering', where: 'ABES Institute of Technology', when: '2026' },
	{ what: 'Class XII', where: 'KDB Public School', when: '2022' },
	{ what: 'Class X', where: "St. Mary's Convent School", when: '2020' },
];

export const CERTIFICATES: Certificate[] = [
	{ name: 'Certified Entry-Level Python Programmer (PCEP)', issuer: 'Python Institute' },
	{ name: 'Mastering Test Automation with Playwright and TypeScript', issuer: 'CodeSignal' },
	{ name: 'Oracle Certified Foundations Associate, Java', issuer: 'Oracle' },
	{ name: 'Introduction to Linux (LFS101)', issuer: 'The Linux Foundation' },
	{ name: 'Jenkins Beginner', issuer: 'Udemy' },
	{ name: 'MongoDB Intermediate', issuer: 'MongoDB' },
	{ name: 'AI and ML, Beginner', issuer: 'Self-study' },
];
```

- [ ] **Step 2: Verify it type-checks and the phone number is absent**

```bash
npx astro check 2>&1 | tail -20
grep -rn "8586996858" src/ && echo "FAIL: phone number present" || echo "ok: no phone number"
```

Expected: no errors from `astro check`, and `ok: no phone number`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/profile.ts
git commit -m "feat: add profile data module"
```

---

## Task 5: `posts.ts` — series index and standalone posts

**Files:**
- Modify: `src/lib/posts.ts` (append; change nothing that exists)

**Interfaces:**
- Consumes: `Post`, `topicOf`, `seriesOf`, `byReadingOrder`, `byNewest` — all already in this file.
- Produces: `SeriesEntry { topic: string; series: string; posts: Post[]; latest: Date }`, `seriesIndex(all: Post[]): SeriesEntry[]`, `standalonePosts(all: Post[]): Post[]`. Tasks 8 and 10 import both functions.

- [ ] **Step 1: Append the two helpers**

```ts
/** One series, with its posts in reading order and its most recent activity. */
export interface SeriesEntry {
	topic: string;
	series: string;
	posts: Post[];
	latest: Date;
}

/**
 * Every (topic, series) pair that has at least one post, most recently active
 * first — so a series being written now rises above one finished in May.
 *
 * Posts within an entry keep reading order, because a series is a curriculum
 * even when the index that lists it is sorted by recency.
 */
export function seriesIndex(all: Post[]): SeriesEntry[] {
	const groups = new Map<string, Post[]>();

	for (const post of all) {
		const topic = topicOf(post);
		const series = seriesOf(post);
		if (!topic || !series) continue;

		const key = `${topic}/${series}`;
		const bucket = groups.get(key);
		if (bucket) bucket.push(post);
		else groups.set(key, [post]);
	}

	return [...groups.entries()]
		.map(([key, posts]) => {
			const slash = key.indexOf('/');
			return {
				topic: key.slice(0, slash),
				series: key.slice(slash + 1),
				posts: [...posts].sort(byReadingOrder),
				latest: posts.reduce(
					(max, p) => (p.data.pubDate > max ? p.data.pubDate : max),
					posts[0].data.pubDate,
				),
			};
		})
		.sort((a, b) => b.latest.valueOf() - a.latest.valueOf());
}

/**
 * Posts that belong to a topic but to no series — the "notes" zone on /blog.
 * Newest first, because these are notes rather than a curriculum.
 */
export function standalonePosts(all: Post[]): Post[] {
	return all.filter((post) => topicOf(post) && !seriesOf(post)).sort(byNewest);
}
```

- [ ] **Step 2: Write a check that asserts the real counts**

Create `scripts/check-taxonomy.mjs`:

```js
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
```

- [ ] **Step 3: Run it**

```bash
node scripts/check-taxonomy.mjs
```

Expected: `total: 35  in series: 31  standalone: 4`

- [ ] **Step 4: Verify the helpers agree, at build time**

Temporarily add to `src/pages/index.astro`, above the template:

```ts
import { getPosts, seriesIndex, standalonePosts } from '../lib/posts';
const _all = await getPosts();
console.log('[check] series:', seriesIndex(_all).length, 'notes:', standalonePosts(_all).length, 'total:', _all.length);
```

```bash
npm run build 2>&1 | grep "\[check\]"
```

Expected: `[check] series: 7 notes: 4 total: 35`

Remove the temporary lines afterwards — Task 8 rewrites this file anyway, but do not leave a `console.log` in a committed build.

- [ ] **Step 5: Commit**

```bash
git add src/lib/posts.ts scripts/check-taxonomy.mjs
git commit -m "feat: add seriesIndex and standalonePosts helpers"
```

---

## Task 6: Layout primitives

**Files:**
- Create: `src/components/Section.astro`
- Create: `src/components/LeaderRow.astro`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `Section` — props `{ n: string; label: string }`, default slot is the content.
  - `LeaderRow` — props `{ href?: string }`, default slot is the left side, named slot `right` is the right side. Renders as `<a>` when `href` is given, `<div>` otherwise.
  - Tasks 8, 9 and 10 use both.

- [ ] **Step 1: Write `Section.astro`**

```astro
---
/**
 * One top-level section of a page: a narrow left rail carrying its number and
 * a one-word label, and the content beside it.
 *
 * The numbers are not decoration. These pages are documents meant to be read
 * top to bottom, and `§ n` is how a paper refers to its own parts.
 */
interface Props {
	n: string;
	label: string;
}

const { n, label } = Astro.props;
---

<section class="section">
	<div class="rail">
		<span class="n">§ {n}</span>
		<span class="label">{label}</span>
	</div>
	<div class="content"><slot /></div>
</section>

<style>
	.section {
		display: grid;
		grid-template-columns: 8.5rem minmax(0, 1fr);
		gap: 1.75rem;
		padding: 2.25rem 0;
		border-bottom: 1px solid var(--line);
	}

	.section:last-of-type {
		border-bottom: none;
	}

	.rail {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.n,
	.label {
		font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
		font-size: var(--text-label);
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
		line-height: 1.4;
	}

	/*
	  Below this the rail would squeeze the content to nothing, so it stops
	  being a rail and becomes a label stacked above what it names.
	*/
	@media (max-width: 760px) {
		.section {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.75rem;
		}

		.rail {
			flex-direction: row;
			gap: 0.75rem;
		}
	}
</style>
```

- [ ] **Step 2: Write `LeaderRow.astro`**

```astro
---
/**
 * One row with a dotted leader running between its two sides, the way a table
 * of contents carries the eye from a chapter name to its page number.
 *
 * Renders as a link when given an href and as a plain row otherwise, so a
 * project with no repo URL yet simply has no action rather than a dead one.
 */
interface Props {
	href?: string | undefined;
}

const { href } = Astro.props;
const Tag = href ? 'a' : 'div';
---

<Tag class="leader-row" {...href ? { href } : {}}>
	<span class="left"><slot /></span>
	<i class="dots" aria-hidden="true"></i>
	<span class="right"><slot name="right" /></span>
</Tag>

<style>
	.leader-row {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.55rem 0;
		border-bottom: 1px dotted var(--line);
		text-decoration: none;
		color: var(--ink);
	}

	.leader-row:last-child {
		border-bottom: none;
	}

	a.leader-row {
		transition: color 0.2s ease;
	}

	a.leader-row:hover {
		color: var(--accent);
	}

	.left {
		font-weight: 600;
	}

	/*
	  The leader itself. It flexes to fill whatever gap is left, and sits on the
	  baseline rather than the bottom of the line box.
	*/
	.dots {
		flex: 1;
		border-bottom: 1px dotted var(--line);
		transform: translateY(-0.22em);
		min-width: 1.5rem;
	}

	.right {
		font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
		font-size: var(--text-label);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		white-space: nowrap;
		text-align: right;
	}

	@media (max-width: 520px) {
		.leader-row {
			flex-wrap: wrap;
			gap: 0.1rem 0.6rem;
		}

		.dots {
			display: none;
		}

		.right {
			flex-basis: 100%;
			text-align: left;
		}
	}
</style>
```

- [ ] **Step 3: Build**

```bash
npm run build 2>&1 | grep -ci warn
```

Expected: `0`. (Astro does not warn about unused components; this step confirms both files parse.)

- [ ] **Step 4: Commit**

```bash
git add src/components/Section.astro src/components/LeaderRow.astro
git commit -m "feat: add Section and LeaderRow layout primitives"
```

---

## Task 7: Header, Footer, and the site's own name

**Files:**
- Modify: `src/consts.ts`
- Rewrite: `src/components/Header.astro`
- Rewrite: `src/components/Footer.astro`

**Interfaces:**
- Consumes: `PROFILE` from Task 4; `SITE_TITLE` from `src/consts.ts`.
- Produces: nothing later tasks import.

- [ ] **Step 1: Give the site a real name and description**

`src/consts.ts` currently says `"Manubhav's blogs"` and `"Welcome to my website!"`. The second is the meta description on every page that does not set its own — it is what search results show.

```ts
// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Manubhav Sharma';
export const SITE_DESCRIPTION =
	'Full-stack developer. Projects, and notes on Go, Python, algorithms and the systems underneath.';
```

- [ ] **Step 2: Rewrite `Header.astro`**

```astro
---
import { SITE_TITLE } from '../consts';
import { PROFILE } from '../lib/profile';
import HeaderLink from './HeaderLink.astro';
---

<header>
	<nav>
		<a class="wordmark" href="/">{SITE_TITLE}</a>

		<div class="internal-links">
			<HeaderLink href="/">Home</HeaderLink>
			<HeaderLink href="/blog">Blog</HeaderLink>
			<HeaderLink href="/about">About</HeaderLink>
		</div>

		<div class="social-links">
			<a href={PROFILE.github} target="_blank" rel="noopener noreferrer">
				<span class="sr-only">{PROFILE.name} on GitHub</span>
				<svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20"
					><path
						fill="currentColor"
						d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
					></path></svg
				>
			</a>
		</div>
	</nav>
</header>

<style>
	/*
	  A running head, not a chrome bar. The rule under it is drawn in --ink
	  rather than --line because it separates the page's furniture from the
	  document, which is a heavier boundary than the one between two sections.
	*/
	header {
		background: var(--ground);
		border-bottom: 1px solid var(--ink);
	}

	nav {
		max-width: 60rem;
		margin-inline: auto;
		padding: 0 1em;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
	}

	.wordmark,
	nav :global(a) {
		font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
		font-size: var(--text-label);
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.wordmark {
		color: var(--ink);
		padding: 1.1em 0;
	}

	.internal-links {
		display: flex;
		gap: 0.25rem;
		margin-left: auto;
	}

	nav :global(.internal-links a) {
		color: var(--muted);
		padding: 1.1em 0.75em;
		border-bottom: 1px solid transparent;
	}

	nav :global(.internal-links a:hover) {
		color: var(--ink);
	}

	/* A 1px rule, not a 4px bar. A bar is a tab; this is a paper. */
	nav :global(.internal-links a.active) {
		color: var(--ink);
		border-bottom-color: var(--accent);
	}

	.social-links {
		display: flex;
	}

	.social-links a {
		display: flex;
		align-items: center;
		color: var(--muted);
		padding: 1.1em 0 1.1em 0.75em;
	}

	.social-links a:hover {
		color: var(--accent);
	}

	@media (max-width: 720px) {
		.social-links {
			display: none;
		}

		.internal-links {
			gap: 0;
		}

		nav :global(.internal-links a) {
			padding-inline: 0.5em;
		}
	}
</style>
```

**Note on `:global()`** — `HeaderLink.astro` renders the `<a>`, so Astro's scoped styles do not reach it from here. This is why the nav-link rules are wrapped. Verify in Step 5 that the active link actually shows its accent rule; if the scoping fights back, move those rules into `HeaderLink.astro` rather than escalating specificity.

- [ ] **Step 3: Rewrite `Footer.astro`**

```astro
---
import { PROFILE } from '../lib/profile';

const year = new Date().getFullYear();
---

<footer>
	<div class="inner">
		<span class="colophon">
			© {year} {PROFILE.name} · Set in JetBrains Mono and Source Serif 4 · Built with Astro
		</span>

		<nav class="links" aria-label="Elsewhere">
			<a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
			<a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
			<a href={`mailto:${PROFILE.email}`}>Email</a>
			<a href="/rss.xml">RSS</a>
		</nav>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--line);
		margin-top: 4rem;
	}

	.inner {
		max-width: 60rem;
		margin-inline: auto;
		padding: 1.75em 1em 4em;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem 1.5rem;
	}

	.colophon,
	.links a {
		font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
		font-size: var(--text-label);
		letter-spacing: 0.08em;
		color: var(--muted);
	}

	.links {
		display: flex;
		gap: 1.25rem;
	}

	.links a {
		text-decoration: none;
		text-transform: uppercase;
		font-weight: 700;
	}

	.links a:hover {
		color: var(--accent);
	}
</style>
```

- [ ] **Step 4: Build and check routes**

```bash
rm -rf .astro dist && npm run build 2>&1 | grep -ci warn
node scripts/routes.mjs | diff docs/route-baseline.txt - && echo "routes clean"
```

Expected: `0` and `routes clean`.

- [ ] **Step 5: Verify the active-link rule survives scoping**

In a browser on `/about`, confirm the About link has a visible accent underline and the others do not:

```js
[...document.querySelectorAll('.internal-links a')]
  .map(a => [a.textContent.trim(), getComputedStyle(a).borderBottomColor])
```

Expected: `About` shows the accent colour; `Home` and `Blog` show `rgba(0, 0, 0, 0)`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Field Notes header and footer, real site title"
```

---

## Task 8: The portfolio home page

**Files:**
- Rewrite: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Base`, `Section`, `LeaderRow`, `FormattedDate`, `PROFILE`/`SKILLS`/`PROJECTS` (Task 4), `getPosts`/`seriesIndex`/`standalonePosts`/`byNewest` (Task 5), `src/assets/photo.png`.
- Produces: nothing.

- [ ] **Step 1: Write the page**

```astro
---
import { Image } from 'astro:assets';
import photo from '../assets/photo.png';
import FormattedDate from '../components/FormattedDate.astro';
import LeaderRow from '../components/LeaderRow.astro';
import Section from '../components/Section.astro';
import Base from '../layouts/Base.astro';
import { SITE_DESCRIPTION } from '../consts';
import { byNewest, getPosts, seriesIndex, standalonePosts } from '../lib/posts';
import { PROFILE, PROJECTS, SKILLS } from '../lib/profile';

const posts = await getPosts();
const allSeries = seriesIndex(posts);
const notes = standalonePosts(posts);
const latest = [...posts].sort(byNewest).slice(0, 3);
---

<Base title={PROFILE.name} description={SITE_DESCRIPTION}>
	<main>
		<Section n="0" label="Who">
			<div class="who">
				<div class="who-text">
					<h1>{PROFILE.name}</h1>
					<p class="tagline">{PROFILE.tagline}</p>

					<p>
						MERN stack, RESTful APIs with Node and Express, React interfaces —
						and a habit of testing what I build, with Playwright, Cypress and
						Selenium.
					</p>

					<p>
						B.Tech CSE at ABES Institute of Technology, class of 2026. Based in
						{PROFILE.location}. Most of what I learn ends up written down on
						this site.
					</p>

					<div class="actions">
						<a class="btn" href={PROFILE.cv} download>Download CV</a>
						<a class="btn ghost" href={PROFILE.github} target="_blank" rel="noopener noreferrer">
							GitHub
						</a>
					</div>
				</div>

				<figure class="plate">
					<Image src={photo} alt={PROFILE.name} width={300} height={400} densities={[1, 2]} />
					<figcaption>{PROFILE.location}</figcaption>
				</figure>
			</div>
		</Section>

		<Section n="1" label="Toolkit">
			<dl class="groups">
				{
					SKILLS.map((group) => (
						<div class="group">
							<dt>{group.label}</dt>
							<dd>{group.items.join(' · ')}</dd>
						</div>
					))
				}
			</dl>
		</Section>

		<Section n="2" label="Built">
			<div class="projects">
				{
					PROJECTS.map((project) => (
						<article class="project">
							<LeaderRow href={project.href}>
								<span class="pn">{project.n}</span>{project.title}
								<Fragment slot="right">{project.stack}</Fragment>
							</LeaderRow>
							<p>{project.blurb}</p>
							{project.href && (
								<a class="demo" href={project.href} target="_blank" rel="noopener noreferrer">
									{project.hrefLabel} →
								</a>
							)}
						</article>
					))
				}
			</div>
		</Section>

		<Section n="3" label="Writing">
			<p class="summary">
				{posts.length} posts, {allSeries.length} series, {notes.length} loose notes.
			</p>

			<div class="series">
				{
					allSeries.slice(0, 5).map((entry) => (
						<LeaderRow href={`/blog/${entry.topic}/${entry.series}/`}>
							{entry.series.replace(/-/g, ' ')}
							<Fragment slot="right">
								{entry.topic} · {entry.posts.length}
							</Fragment>
						</LeaderRow>
					))
				}
			</div>

			<h2 class="sub">Most recent</h2>
			<div class="recent">
				{
					latest.map((post) => (
						<LeaderRow href={`/blog/${post.id}/`}>
							{post.data.title}
							<Fragment slot="right">
								<FormattedDate date={post.data.pubDate} />
							</Fragment>
						</LeaderRow>
					))
				}
			</div>

			<a class="more" href="/blog">Everything I've written →</a>
		</Section>

		<Section n="4" label="Elsewhere">
			<div class="elsewhere">
				<a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
				<a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
				<a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
			</div>
		</Section>
	</main>
</Base>

<style>
	main {
		--main-max: 60rem;
	}

	/* --- § 0 who --- */
	.who {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: 2.5rem;
		align-items: start;
	}

	h1 {
		font-size: var(--text-h1);
		margin: 0 0 0.35rem;
	}

	.tagline {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: var(--text-label);
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--accent);
		margin: 0 0 1.5rem;
	}

	.who-text p {
		max-width: 46ch;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 1.75rem;
	}

	.btn {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: var(--text-label);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
		padding: 0.8em 1.4em;
		border: 1px solid var(--accent);
		border-radius: var(--radius);
		background: var(--accent);
		color: var(--on-accent);
	}

	.btn:hover {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
		color: var(--on-accent);
	}

	.btn.ghost {
		background: none;
		color: var(--accent);
	}

	.btn.ghost:hover {
		background: none;
		color: var(--accent-hover);
	}

	/* A plate in a paper, not a hero portrait. */
	.plate {
		margin: 0;
	}

	.plate :global(img) {
		display: block;
		width: 100%;
		height: auto;
		border: 1px solid var(--line);
		border-radius: var(--radius);
	}

	.plate figcaption {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: var(--text-label);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		margin-top: 0.5rem;
	}

	/* --- § 1 toolkit --- */
	.groups {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.group {
		display: grid;
		grid-template-columns: 7rem minmax(0, 1fr);
		gap: 1rem;
		align-items: baseline;
	}

	.group dt {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: var(--text-label);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.group dd {
		margin: 0;
	}

	/* --- § 2 built --- */
	.projects {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.project p {
		margin: 0.6rem 0 0;
		max-width: 62ch;
		color: var(--muted);
		font-size: 0.95em;
	}

	.pn {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: var(--text-label);
		font-weight: 700;
		color: var(--muted);
		margin-right: 0.7em;
		font-variant-numeric: tabular-nums;
	}

	.demo {
		display: inline-block;
		margin-top: 0.5rem;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: var(--text-label);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
	}

	/* --- § 3 writing --- */
	.summary {
		margin: 0 0 1.25rem;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	.sub {
		font-size: var(--text-label);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
		margin: 1.75rem 0 0.4rem;
	}

	.more {
		display: inline-block;
		margin-top: 1.5rem;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: var(--text-label);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
	}

	/* --- § 4 elsewhere --- */
	.elsewhere {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.elsewhere a {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: var(--text-label);
		letter-spacing: 0.08em;
		text-decoration: none;
	}

	@media (max-width: 900px) {
		.who {
			grid-template-columns: minmax(0, 1fr);
		}

		.plate {
			max-width: 240px;
		}
	}

	@media (max-width: 520px) {
		.group {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.1rem;
		}
	}
</style>
```

- [ ] **Step 2: Build and check routes**

```bash
rm -rf .astro dist && npm run build 2>&1 | grep -ci warn
node scripts/routes.mjs | diff docs/route-baseline.txt - && echo "routes clean"
```

Expected: `0` and `routes clean`.

- [ ] **Step 3: Verify the counts are real and the CV resolves**

```bash
grep -o "3[0-9] posts, [0-9] series, [0-9] loose notes" dist/index.html
test -f dist/Manubhav_Sharma_Resume.pdf && echo "cv present"
grep -c "Manubhav_Sharma_Resume.pdf" dist/index.html
```

Expected: `35 posts, 7 series, 4 loose notes`, `cv present`, and `1`.

- [ ] **Step 4: Verify the photo was optimised**

```bash
ls -la dist/_astro/photo.*
```

Expected: a hashed file **well under** the 2.5 MB source. If it is 2.5 MB, the `<Image>` component was bypassed and the page ships the original.

- [ ] **Step 5: Browser check**

At 1440px, 900px and 390px, in light and dark: no horizontal body scroll, the rail collapses under 760px, the photo drops below the text under 900px, and the Download CV button actually downloads.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: rebuild the home page as a portfolio"
```

---

## Task 9: The about page

**Files:**
- Rewrite: `src/pages/about.astro`

**Interfaces:**
- Consumes: `Base`, `Section`, `LeaderRow`, `PROFILE`/`EDUCATION`/`CERTIFICATES` (Task 4).
- Produces: nothing.

- [ ] **Step 1: Write the page**

The current version borrows `BlogPost`, which forces it to carry `pubDate={new Date('August 08 2021')}` — a date that means nothing and renders under the title as though the page were written then. It gets `Base` instead.

```astro
---
import LeaderRow from '../components/LeaderRow.astro';
import Section from '../components/Section.astro';
import Base from '../layouts/Base.astro';
import { CERTIFICATES, EDUCATION, PROFILE } from '../lib/profile';

const description =
	'Manubhav Sharma — full-stack developer, B.Tech CSE at ABES Institute of Technology. What I have built, what I have studied, and what I do when I am not doing either.';
---

<Base title="About" description={description}>
	<main>
		<Section n="0" label="Intro">
			<h1>About</h1>
			<p>
				I'm Manubhav Sharma — an aspiring full-stack developer, most at home in
				the MERN stack, and reliably curious about what a thing is doing
				underneath the layer I'm supposed to be working at.
			</p>
			<p>
				I build with React on the front and Node and Express behind it, and I
				test what I build rather than hoping. Somewhere along the way the
				testing stopped being a chore and turned into one of the parts I'm best
				at.
			</p>
		</Section>

		<Section n="1" label="Path">
			<p>
				It started as curiosity and turned into a habit. Something would break,
				or work for a reason I couldn't explain, and the only way out was to go
				a layer down. That's how the C projects happened — writing an HTTPS
				server rather than importing one, building a command-line parser from
				nothing to understand what every CLI tool is quietly doing with my
				arguments.
			</p>
			<p>
				The blog is the same instinct with a paper trail. I learn best by
				writing it down for someone who doesn't know it yet, which usually turns
				out to be me, six months later. Most of what's there is Go, Python,
				algorithms, and the occasional note about infrastructure.
			</p>
		</Section>

		<Section n="2" label="Education">
			<div class="rows">
				{
					EDUCATION.map((item) => (
						<LeaderRow>
							{item.what} — {item.where}
							<Fragment slot="right">{item.when}</Fragment>
						</LeaderRow>
					))
				}
			</div>
		</Section>

		<Section n="3" label="Hackathon">
			<p>
				<strong>Smart India Hackathon</strong> — participant. Our team designed a
				portal, web and app, for emergency SOS transmission in places with
				almost no connectivity: relay a victim's location and a set of survival
				instructions to the nearest government response agency, the NDRF among
				them, using whatever signal is actually available.
			</p>
		</Section>

		<Section n="4" label="Certificates">
			<div class="rows">
				{
					CERTIFICATES.map((cert) => (
						<LeaderRow>
							{cert.name}
							<Fragment slot="right">{cert.issuer}</Fragment>
						</LeaderRow>
					))
				}
			</div>
		</Section>

		<Section n="5" label="Beyond code">
			<p>
				I take things apart. Hardware mostly — there's a specific satisfaction
				in the moment a sealed object becomes a set of parts that explain each
				other. It's the same pull that made me write an HTTPS server in C rather
				than use one, and probably why most of what I blog about sits a layer
				below where I actually need to be working.
			</p>
			<p>
				Outside that: bikes, and the travelling that gives me an excuse to ride.
				Basketball. Music, more or less constantly. Geopolitics, which I follow
				closely enough that people have stopped asking. And a steady output of
				small software built for no reason beyond thinking it ought to exist.
			</p>
			<p>
				Manga is the one I'd argue about. <em>Berserk</em>, <em>Vagabond</em>,
				<em>Monster</em>, <em>20th Century Boys</em>, <em>Pluto</em> — long
				stories patient enough to let their characters be wrong for years before
				they're right. Anime and film for the same reasons, less systematically.
			</p>
		</Section>

		<Section n="6" label="Why I write">
			<p>
				Writing is how I find out whether I actually understood something. A
				concept can feel solid right up to the sentence that won't finish.
			</p>
			<p>
				So this is where the notes go: decisions, mistakes, debugging sessions
				that took far longer than they should have, and the explanations I wish
				someone had given me the first time. If you're learning the same things,
				some of it might save you an afternoon.
			</p>
			<p class="sign">
				<a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
			</p>
		</Section>
	</main>
</Base>

<style>
	main {
		--main-max: 60rem;
	}

	h1 {
		font-size: var(--text-h1);
		margin: 0 0 1rem;
	}

	p {
		max-width: 62ch;
	}

	.rows {
		display: flex;
		flex-direction: column;
	}

	.sign {
		margin-top: 1.5rem;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: var(--text-label);
		letter-spacing: 0.08em;
	}

	.sign a {
		text-decoration: none;
	}
</style>
```

- [ ] **Step 2: Build and verify the stale date and stock image are gone**

```bash
rm -rf .astro dist && npm run build 2>&1 | grep -ci warn
node scripts/routes.mjs | diff docs/route-baseline.txt - && echo "routes clean"
grep -c "2021" dist/about/index.html || echo "no stale date"
grep -c "blog-placeholder-about" dist/about/index.html || echo "no stock hero"
```

Expected: `0`, `routes clean`, `no stale date`, `no stock hero`.

- [ ] **Step 3: Verify the italics render as true italics**

The manga titles in `§ 5` are the first real `<em>` run on a top-level page. In a browser:

```js
getComputedStyle(document.querySelector('em')).fontStyle       // "italic"
getComputedStyle(document.querySelector('em')).fontFamily      // contains "Source Serif 4"
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: rewrite the about page with real depth

Drops the BlogPost layout and the meaningless 2021 pubDate it forced."
```

---

## Task 10: The blog index — two zones

**Files:**
- Rewrite: `src/pages/blog/index.astro`

**Interfaces:**
- Consumes: `Base`, `Section`, `LeaderRow`, `FormattedDate`, `getPosts`/`seriesIndex`/`standalonePosts`/`topicOf` (Task 5).
- Produces: nothing.

- [ ] **Step 1: Write the page**

This kills the `topicInfo` map, which currently describes a topic named `ai` that does not exist and has no entry for `go` or `python`, which do.

```astro
---
import FormattedDate from '../../components/FormattedDate.astro';
import LeaderRow from '../../components/LeaderRow.astro';
import Section from '../../components/Section.astro';
import Base from '../../layouts/Base.astro';
import { getPosts, seriesIndex, standalonePosts, topicOf } from '../../lib/posts';

const posts = await getPosts();
const allSeries = seriesIndex(posts);
const notes = standalonePosts(posts);

// Topics, most recently active first — the same ordering the series list uses,
// so the two zones agree about what is current.
const latestByTopic = new Map<string, Date>();
for (const post of posts) {
	const topic = topicOf(post);
	if (!topic) continue;
	const seen = latestByTopic.get(topic);
	if (!seen || post.data.pubDate > seen) latestByTopic.set(topic, post.data.pubDate);
}
const topics = [...latestByTopic.entries()]
	.sort((a, b) => b[1].valueOf() - a[1].valueOf())
	.map(([topic]) => topic);

const title = (slug: string) => slug.replace(/-/g, ' ');
---

<Base
	title="Writing"
	description="Series and loose notes on Go, Python, algorithms, Linux and Azure."
>
	<main>
		<Section n="0" label="Writing">
			<h1>Writing</h1>
			<p class="summary">
				{posts.length} posts, {allSeries.length} series, {notes.length} loose notes,
				across {topics.length} topics.
			</p>
			<div class="topics">
				{topics.map((topic) => <a href={`/blog/${topic}/`}>{topic}</a>)}
			</div>
		</Section>

		<Section n="1" label="Series">
			<p class="zone-note">
				Things I'm working through in order. Each one is meant to be read start
				to finish.
			</p>
			<div class="rows">
				{
					allSeries.map((entry) => (
						<LeaderRow href={`/blog/${entry.topic}/${entry.series}/`}>
							{title(entry.series)}
							<Fragment slot="right">
								{entry.topic} · {entry.posts.length}{' '}
								{entry.posts.length === 1 ? 'post' : 'posts'} ·{' '}
								<FormattedDate date={entry.latest} />
							</Fragment>
						</LeaderRow>
					))
				}
			</div>
		</Section>

		<Section n="2" label="Notes">
			<p class="zone-note">
				Standalone posts that aren't part of anything larger.
			</p>
			<div class="rows">
				{
					notes.map((post) => (
						<LeaderRow href={`/blog/${post.id}/`}>
							{post.data.title}
							<Fragment slot="right">
								<FormattedDate date={post.data.pubDate} />
							</Fragment>
						</LeaderRow>
					))
				}
			</div>
		</Section>
	</main>
</Base>

<style>
	main {
		--main-max: 60rem;
	}

	h1 {
		font-size: var(--text-h1);
		margin: 0 0 0.75rem;
	}

	.summary {
		margin: 0 0 1.25rem;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	.topics {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.topics a {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: var(--text-label);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
		padding: 0.4em 0.8em;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		color: var(--muted);
	}

	.topics a:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.zone-note {
		margin: 0 0 1rem;
		color: var(--muted);
		max-width: 56ch;
		font-size: 0.95em;
	}

	.rows {
		display: flex;
		flex-direction: column;
	}
</style>
```

- [ ] **Step 2: Build, check routes, confirm the orphan tokens are finally gone**

```bash
rm -rf .astro dist && npm run build 2>&1 | grep -ci warn
node scripts/routes.mjs | diff docs/route-baseline.txt - && echo "routes clean"
grep -rn "grad-1\|grad-2\|on-grad\|var(--shadow" src/ || echo "no orphans"
```

Expected: `0`, `routes clean`, and — now that this file is rewritten — `no orphans`.

- [ ] **Step 3: Verify both zones are complete**

```bash
grep -c 'href="/blog/[a-z]*/[a-z-]*/"' dist/blog/index.html
grep -o "35 posts, 7 series, 4 loose notes" dist/blog/index.html
```

Expected: at least `7` series links, and the count line present. Then confirm all four notes are listed and that no series link 404s by spot-checking two against `docs/route-baseline.txt`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: split /blog into series and notes zones

Removes the topicInfo map, which described a nonexistent 'ai' topic
and omitted go and python."
```

---

## Task 11: Whole-site verification

No new code. This is the gate that decides whether the revamp is done, and it exists as its own task because the per-task checks each looked at one page.

**Files:** none modified.

- [ ] **Step 1: Clean build from nothing**

```bash
rm -rf .astro dist node_modules/.vite
npm run build 2>&1 | tee /tmp/final.log
grep -ci "warn\|error" /tmp/final.log
```

Expected: `0`.

- [ ] **Step 2: Every URL still exists**

```bash
node scripts/routes.mjs | diff docs/route-baseline.txt - && echo "all 51 routes intact"
```

- [ ] **Step 3: The JavaScript budget did not move**

```bash
find dist -name "*.js" -exec wc -c {} + | tail -1
```

Expected: the total is unchanged from before the revamp — around 647 bytes. Any increase means a dependency or a client directive crept in.

- [ ] **Step 4: No dead references anywhere**

```bash
grep -rn "atkinson\|Atkinson\|grad-1\|grad-2\|on-grad\|var(--shadow\|topicInfo" src/ || echo "clean"
grep -rn "8586996858" src/ dist/ && echo "FAIL" || echo "no phone number"
```

Expected: `clean`, `no phone number`.

- [ ] **Step 5: Browser sweep**

Serve `dist/`. For each of `/`, `/about`, `/blog`, `/blog/go/`, `/blog/go/composite-types/`, and one post — at 1440px, 900px and 390px, in **all three theme states**:

- light (`data-theme="light"`)
- dark by OS (no attribute, `prefers-color-scheme: dark` emulated)
- explicit dark (`data-theme="dark"`)

Check on each: no horizontal scroll on `<body>`, no text sitting on a same-theme background, the section rail collapses correctly under 760px, code blocks scroll inside their own figure, and the copy button still copies.

- [ ] **Step 6: Contrast floor holds**

Re-measure every distinct text-on-background pairing across the six pages above, in light and dark. Nothing below 4.5:1 for body text or 3:1 for large text. Record the lowest measured ratio and compare it against Phase 3's 5.68:1 — this revamp must not have lowered it.

- [ ] **Step 7: Fonts resolved, not fallen back**

On `/` and on a post:

```js
getComputedStyle(document.body).fontFamily
getComputedStyle(document.querySelector('h1')).fontFamily
getComputedStyle(document.querySelector('code')).fontFamily
```

Expected: Source Serif 4, JetBrains Mono, JetBrains Mono. A silent fallback here is the single most likely invisible failure in this plan.

- [ ] **Step 8: Commit the verification record**

```bash
git add -A
git commit -m "chore: whole-site verification pass for the Field Notes revamp"
```

---

## Deferred — not in this plan

Carried from spec §11. Each is a small, separate change.

1. **Project repo links.** Four rows render without an action until URLs exist. One line each in `PROJECTS`.
2. **`og:image`.** 47 of 51 pages share `blog-placeholder-1.jpg` — Astro's own promotional artwork — as their social preview. Now that a real photo and identity exist, this deserves a proper card.
3. **Theme toggle.** The tokens have supported one since Phase 1; nothing sets `data-theme`. Roughly ten lines of script, and the first thing that would raise the JS budget.
4. **`h1` duplication.** Seven posts open with a body-level `# heading` that repeats the layout's `<h1>`.
5. **Mobile table of contents.** The TOC rail is desktop-only above 1100px.
