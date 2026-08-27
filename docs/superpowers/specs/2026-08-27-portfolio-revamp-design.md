# Portfolio revamp — design spec

**Date:** 2026-08-27
**Status:** awaiting review
**Scope:** home page, about page, blog index, header, footer, global type + colour tokens
**Phase:** 6 of the revamp (phases 1–5 complete, uncommitted)

---

## 1. Goal

Turn the home page into a portfolio, give the about page real depth, and split the
blog index into two zones — series and loose notes — without changing a single URL.

The visual direction is **Field Notes**: a typeset engineering paper. Monospace sets
the headings and labels, a serif sets the text, and nothing sits in a box. Hairline
rules and a wide left margin do all the separating.

### Non-goals

- No new URLs, no redirects, no route changes.
- No UI component library, no CSS framework, no new runtime dependency. (Decided
  2026-08-27: "scrap the external ui components idea".)
- No client-side JavaScript beyond the existing 647-byte copy button.
- Blog post pages (`/blog/[...slug]`) keep their Phase 5 layout. They inherit the new
  tokens and typefaces, but their structure is unchanged.

---

## 2. Decisions already made

| Question | Decision | Date |
|---|---|---|
| Blog split | One `/blog` page, two zones. Nav stays Home · Blog · About. | 2026-08-27 |
| Visual direction | Field Notes | 2026-08-27 |
| Projects shown | The four on the resume only | 2026-08-27 |
| GitHub handle | `gutslike` | 2026-08-27 |
| Positioning | Full-stack, as worded on the resume | 2026-08-27 |
| Project repo links | Left blank; user will add them later | 2026-08-27 |

---

## 3. Assets in place

| Asset | Path | Notes |
|---|---|---|
| CV | `public/Manubhav_Sharma_Resume.pdf` | 816 KB, one page. Served as a plain static file at `/Manubhav_Sharma_Resume.pdf`. Revised by the user on 2026-08-27 to carry `github.com/gutslike`; re-extracted and confirmed. |
| Photo | `src/assets/photo.png` | 1086 × 1448, portrait 3:4, 2.5 MB PNG. Astro resizes and re-encodes at build; the 2.5 MB never ships. |

The CV filename is used verbatim in the download link. **If the file is renamed, the
link breaks silently** — the spec assumes this exact name.

---

## 4. Type

Two families, replacing three.

| Role | Face | Weights | Source |
|---|---|---|---|
| Headings, labels, nav, code | JetBrains Mono | 400, 700 | Google provider — already configured |
| Body text | Source Serif 4 | 400, 600, 400 italic | Google provider — **new** |

**Atkinson Hyperlegible is removed.** Two reasons:

1. It is a humanist sans and cannot carry a typeset-paper direction.
2. The repo has no italic file for it, so every `<em>` on the site is currently a
   synthesised oblique. This was logged as an open issue in Phase 5. Source Serif 4
   ships a real italic, which closes it.

Atkinson is a genuinely excellent face for low-vision readers, and dropping it is a
real trade-off. Source Serif 4 is a Latin-text face designed by Adobe for extended
reading at small sizes, with large x-height and open apertures — it is a defensible
replacement, but it is a replacement, not an upgrade in that specific respect.

The local font files under `src/assets/fonts/` become dead weight once Atkinson is
unreferenced and should be deleted in the same change.

### Scale

Unchanged from Phase 1 — the 1.25 ratio and the `--text-h1 … --text-h6` tokens stay.
Two additions:

```
--text-label: 0.7rem     /* mono, uppercase, 0.16em tracking */
--measure:    68ch       /* unchanged */
```

Body size stays at 20px / 18px below 720px. Serif at 20px reads slightly larger than
sans at 20px; if it proves too big in review, the fix is the body rule, not the scale.

---

## 5. Colour

Retunes the existing three-state token system. **No new tokens, no new theme states.**
Every value below replaces an existing one in `src/styles/global.css`.

### Light

```
--ground:  #f3f4ef    paper
--surface: #ffffff    header bar, code figures
--sunken:  #e8eae1    inline code, figure captions
--ink:     #191c15
--muted:   #6b7263
--line:    #d2d7c8    hairlines
--accent:  #2f6b1f
--accent-hover: #3d8626
--on-accent:    #f3f4ef
```

### Dark

Paper at night, not a console. Same hues, inverted lightness.

```
--ground:  #141610
--surface: #1b1e16
--sunken:  #22261d
--ink:     #e4e7dc
--muted:   #949c88
--line:    #2c3128
--accent:  #8fd16e
--accent-hover: #a6e086
--on-accent:    #141610
```

Applied to all three viewer states exactly as today: bare `:root`, then
`@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme='light'])`,
then `:root[data-theme='dark']`.

### Shape and depth — the breaking change

Field Notes has no floating surfaces. Two global tokens change value, and that ripples
through every component built in phases 1–5:

```
--radius:    24px  →  2px
--radius-lg: 28px  →  3px
--shadow-sm / --shadow / --shadow-lg  →  none
```

Components that currently rely on a shadow or a large radius to read as separate
objects must be re-expressed with a hairline border or a rule. Setting the shadow
tokens to `none` without doing that work leaves a card with neither shadow nor border
— an object that looks broken rather than flat. Every site is listed here:

| File | Line | Uses | Becomes |
|---|---|---|---|
| `components/PostNav.astro` | 50 | `--radius` | ruled rows, no panel |
| `layouts/BlogPost.astro` | 101 | `--shadow` | hairline border on the hero image |
| `pages/blog/index.astro` | 105, 118 | `--shadow`, `--shadow-lg` | rewritten entirely (§8.4) |
| `pages/blog/[topic]/index.astro` | 104, 138 | `--shadow-sm` ×2 | ruled rows |
| `pages/blog/[topic]/[series]/index.astro` | 82 | `--shadow-sm` | ruled rows |
| `styles/global.css` | `figure.code-block` | 12px radius | 2px, keeps its border |
| `styles/global.css` | `.copy-code` | 999px pill | 2px rectangle |

The two `[topic]` pages were missed on a first pass of this spec. They are not
otherwise being rewritten, so they need an explicit restyle or they will be the one
place the new direction does not reach.

The `--grad-1` / `--grad-2` gradient tokens and their paired `--on-grad-*` text colours
become unused — their only consumer is `pages/blog/index.astro` (lines 139–154), which
is rewritten in §8.4. Field Notes has no gradient surfaces, so they are removed rather
than left orphaned.

---

## 6. Layout primitives

### The section rail

The one structural idea the whole design rests on. Every top-level section is a
two-column grid: a narrow left rail carrying a section number and a one-word label,
and the content beside it.

```
┌──────────┬────────────────────────────────────────┐
│  § 1     │  Go   Python   Java   C   JavaScript   │
│  TOOLKIT │  React.js   Node.js   Express.js  …    │
└──────────┴────────────────────────────────────────┘
──────────────────────────────────────────────────────  hairline
```

```css
.section {
  display: grid;
  grid-template-columns: 8.5rem minmax(0, 1fr);
  gap: 1.75rem;
  padding: 2.25rem 0;
  border-bottom: 1px solid var(--line);
}
```

Below 760px the rail collapses to a label stacked above its content
(`grid-template-columns: minmax(0,1fr)`, `gap: 0.75rem`).

The section numbers are not decoration: the home page is a document meant to be read
top to bottom, and `§ n` is how a paper refers to its own parts. They are ordered
because the order carries meaning — who, then what with, then what built, then what
written.

### Rules, not boxes

Section boundaries are `1px solid var(--line)`. The masthead rule under the header is
`1px solid var(--ink)` — heavier, because it separates chrome from document.

Project rows use dotted leaders (`border-bottom: 1px dotted var(--line)` on a flexing
spacer) to carry the eye from title to stack, the way a table of contents does.

### Width

`main` keeps `--main-max` as its only width authority (Phase 2). Home and About set
`--main-max: 60rem` to fit the rail plus a full measure. The blog index keeps its
wider setting.

---

## 7. Content model

A new module, `src/lib/profile.ts`, holds everything about the person as typed data.
Markup reads from it; nothing is written twice.

```ts
export const PROFILE = {
  name: 'Manubhav Sharma',
  tagline: 'Aspiring full-stack developer.',
  location: 'Ghaziabad, UP',
  email: 'manubhavsharma09@gmail.com',
  github: 'https://github.com/gutslike',
  linkedin: 'https://www.linkedin.com/in/manubhav-sharma-343b98283',
  cv: '/Manubhav_Sharma_Resume.pdf',
};

export const SKILLS: SkillGroup[] = [ /* six groups, §7.1 */ ];
export const PROJECTS: Project[] = [ /* four, §7.2 */ ];
export const EDUCATION: Education[] = [ /* three, §7.3 */ ];
export const CERTIFICATES: Certificate[] = [ /* seven, §7.3 */ ];
```

**The phone number on the resume does not go on the site.** A public page with a phone
number on it is a scraping target, and nothing about a portfolio needs one.

Blog counts — 35 posts, 7 series, 4 loose notes — are **never hardcoded**. They are
derived at build time from `src/lib/posts.ts` via two new helpers (§9).

### 7.1 Skills

Grouped as the resume groups them. Grouping is the point: a flat list of thirty words
reads as padding, six labelled groups read as range.

| Group | Items |
|---|---|
| Languages | JavaScript, Python, Java, C, Go |
| Frontend | React.js, HTML5, CSS3, Tailwind CSS, Context API, Bootstrap |
| Backend | Node.js, Express.js, Go, RESTful APIs |
| Databases | MongoDB, MySQL, SQLite3, Firebase |
| Testing | Selenium WebDriver, Playwright, Cypress, TestNG, Postman, REST Assured |
| Platform | Linux, Windows, Git, GitHub, Jenkins, Azure |

Three editorial calls on this table, each reversible in one line of `profile.ts`:

1. **ShadCN is dropped** from the Frontend row. It is a component library the site
   deliberately does not use, and listing it on a page that is an argument against it
   reads badly.
2. **The resume's "AI Tools" row is dropped** — "experience with Gemini, GPT, Claude
   for code generation". Naming the assistants you use is not a skill a reader can
   evaluate, and on a portfolio it tends to subtract rather than add. Say so if you
   disagree; it goes back as a one-line entry.
3. **"Operating Systems" and "CI/CD & DevOps" are merged into "Platform."** Six groups
   is already the upper limit of what scans at a glance, and Linux/Windows alone is a
   thin row.

### 7.2 Projects

Four, from the resume. Rendered as ruled rows with dotted leaders. Repo links are
omitted entirely for now — **an empty or `#` link is worse than no link**, so a row
without a URL simply renders without an action.

| # | Title | Stack | Outline | Link |
|---|---|---|---|---|
| 01 | E-commerce Platform | MERN · Admin panel | End-to-end storefront with an admin panel covering the full set of operational utilities, built for dynamic data handling. | Live demo: `e-commerce-qs8m.vercel.app` |
| 02 | AI-Powered FIR Classification System | Python · PyTorch | A deep-learning model that reads the text of a First Information Report and predicts the correct Indian Penal Code section. Owned the full training pipeline, including hyperparameter tuning to lift classification accuracy. | — |
| 03 | HTTPS Server | C | An HTTPS server written from scratch in C, with a proxy cache layer. | — |
| 04 | CLI Argument Parser | C | A general-purpose command-line parser in C that dissects arguments and input, meant as a foundation for larger CLI tools. | — |

### 7.3 About-page material

All from the resume, none invented.

- **Education** — B.Tech CSE, ABES Institute of Technology, 09/2026 · Class XII, KDB
  Public School, 2022 · Class X, St. Mary's Convent School, 2020. All Ghaziabad, UP.
- **Hackathon** — Smart India Hackathon, participant. Team designed a portal (web and
  app) for emergency SOS transmission in low-connectivity areas, relaying location data
  and survival tips to the nearest government response agency such as the NDRF.
- **Certificates** — PCEP (Python Institute) · Mastering Test Automation with
  Playwright and TypeScript (CodeSignal) · Oracle Certified Foundations Associate, Java
  · Introduction to Linux, LFS101 (Linux Foundation) · Jenkins Beginner (Udemy) ·
  MongoDB Intermediate · AI and ML Beginner.
- **Why I write** — carried over from the current about page, rewritten in the new voice.

### 7.4 Beyond Code — the about page's closing section

Supplied by the user 2026-08-27: bikes, travelling, geopolitics, music, basketball,
building small software for fun, taking hardware apart to see what's inside, manga
(Berserk, Vagabond, Monster, 20th Century Boys, Pluto), anime, film.

The throughline worth writing to is the user's own phrase from the current about page —
*"figuring out how things work under the hood."* Taking hardware apart, writing an
HTTPS server in C rather than importing one, and blogging about pointers and memory
management are the same instinct pointed at three different things. That connection is
real, not a construction, and it is what turns a list of hobbies into a paragraph that
says something.

Draft copy, to be reviewed and freely rewritten by the user:

> I take things apart. Hardware mostly — there's a specific satisfaction in the moment
> a sealed object becomes a set of parts that explain each other. It's the same pull
> that made me write an HTTPS server in C rather than use one, and probably why most of
> what I blog about sits a layer below where I actually need to be working.
>
> Outside that: bikes, and the travelling that gives me an excuse to ride. Basketball.
> Music, more or less constantly. Geopolitics, which I follow closely enough that people
> have stopped asking. And a steady output of small software built for no reason beyond
> thinking it ought to exist.
>
> Manga is the one I'd argue about. Berserk, Vagabond, Monster, 20th Century Boys,
> Pluto — long stories patient enough to let their characters be wrong for years before
> they're right. Anime and film for the same reasons, less systematically.

This section is **no longer a placeholder**. It ships as written above.

---

## 8. Pages

### 8.1 Header

```
MANUBHAV SHARMA                          HOME   BLOG   ABOUT      ⌘
────────────────────────────────────────────────────────────────────  1px solid ink
```

Name left in JetBrains Mono, uppercase, 0.16em tracking. Nav right, same treatment,
current page in full ink and the rest in `--muted`. The active-page underline moves
from a 4px accent bar to a 1px accent rule — a 4px bar is a tab, and this is a paper.

The GitHub mark stays as the existing inline SVG (no icon dependency), pointing at
`gutslike`. It stays hidden below 720px as it is today.

### 8.2 Home

```
§ 0   WHO        Manubhav Sharma                        ┌──────────┐
                 Aspiring full-stack developer.         │  photo   │
                 [ two paragraphs ]                     │   3:4    │
                 [Download CV]  [GitHub]                └──────────┘
                                                        fig. 1 — Ghaziabad, 2026
─────────────────────────────────────────────────────────────────────────────
§ 1   TOOLKIT    Languages    Go · Python · Java · C · JavaScript
                 Frontend     React.js · HTML5 · CSS3 · …
                 [ six groups ]
─────────────────────────────────────────────────────────────────────────────
§ 2   BUILT      E-commerce Platform ·············· MERN · Admin panel
                 FIR Classification ··············· Python · PyTorch
                 HTTPS Server ····················· C
                 CLI Argument Parser ·············· C
─────────────────────────────────────────────────────────────────────────────
§ 3   WRITING    35 posts across 7 series.
                 Go — Composite Types  10    Python Basics  7
                 Arrays & Hashing       6    Go Basics      4
                 [ three most recent posts, dated ]
                 Read everything →
─────────────────────────────────────────────────────────────────────────────
§ 4   ELSEWHERE  email · github · linkedin
```

The photo is set as a `<figure>` with a mono `<figcaption>` — a plate in a paper, not a
hero portrait. Three columns on wide screens (rail · text · photo); the photo moves
below the text under 900px and the rail collapses under 760px.

`§ 3 WRITING` is the "overview of the whole site" the brief asked for: live counts,
the series index, and the three newest posts.

### 8.3 About

Loses the `BlogPost` layout. It currently borrows a blog post's shell, which forces it
to carry a `pubDate` of `August 08 2021` — a date that means nothing and renders under
the title as though the page were written then. It gets `Base` and its own `<main>`,
same section-rail structure as the home page.

```
§ 0  INTRO        who I am, in the resume's own framing
§ 1  PATH         how I got here — narrative, not bullets
§ 2  EDUCATION    three rows, ruled, right-aligned years
§ 3  HACKATHON    SIH — the SOS portal, in a paragraph
§ 4  CERTIFICATES seven rows, issuer in mono on the right
§ 5  BEYOND CODE  hobbies — copy written, see §7.4
§ 6  WHY I WRITE  carried over, rewritten
```

The `blog-placeholder-about.jpg` hero image is dropped. It is stock art from the Astro
template and says nothing about the person the page is about.

### 8.4 Blog index — two zones

One page, one URL, two zones, exactly as agreed.

```
WRITING
35 posts. 7 series. 4 loose notes.
─────────────────────────────────────────────────────────────────
SERIES
Go — Composite Types ·········· go ······· 10 posts ··· Aug 2026
Python Basics ················· python ···  7 posts ··· Jul 2026
Arrays & Hashing ·············· leetcode ·  6 posts ··· Aug 2026
Go Basics ····················· go ·······  4 posts ··· Jun 2026
Azure ························· devops ···  2 posts ··· May 2026
Linux ························· devops ···  1 post ···· May 2026
Daily Challenge ··············· leetcode ·  1 post ···· Aug 2026
─────────────────────────────────────────────────────────────────
NOTES
Loose posts that aren't part of a series.
CDN and Sanity ································· 12 Aug 2026
Go Roadmap ····································· 03 Jun 2026
…
```

Series rows link to the existing `/blog/[topic]/[series]/` pages, so the `[topic]` and
`[series]` routes built in Phase 4 stay reachable rather than orphaned.

**Bug fixed here:** the `topicInfo` map in `src/pages/blog/index.astro` currently has an
entry for a topic named `ai` that does not exist, and no entry for `go` or `python`,
which do. The map is replaced by a lookup that is driven by the actual topic list.

---

## 9. New code

### `src/lib/posts.ts` — two additions

Everything else in the module is unchanged. `getCollection` and `id.split()` continue
to appear in this file and nowhere else.

```ts
export interface SeriesEntry {
  topic: string;
  series: string;
  posts: Post[];
  latest: Date;
}

/** Every (topic, series) pair that has at least one post, newest activity first. */
export function seriesIndex(all: Post[]): SeriesEntry[];

/** Posts that belong to a topic but not to a series — the "notes" zone. */
export function standalonePosts(all: Post[]): Post[];
```

`seriesIndex` sorts by `latest` descending so an actively-updated series rises. Posts
within an entry keep `byReadingOrder`.

### New components

| File | Purpose |
|---|---|
| `src/components/Section.astro` | The rail primitive: takes `n` and `label`, slots content. |
| `src/components/LeaderRow.astro` | One dotted-leader row: left slot, leader, right slot. Used by projects, series, certificates, education. |
| `src/components/SkillGroups.astro` | Renders `SKILLS` as labelled groups. |

`LeaderRow` is the piece that earns its keep — four different sections are the same
shape, and writing that shape once is what keeps the page consistent.

### Files rewritten

`src/pages/index.astro`, `src/pages/about.astro`, `src/pages/blog/index.astro`,
`src/components/Header.astro`, `src/components/Footer.astro`, `src/styles/global.css`.

### Files edited

| File | Change |
|---|---|
| `astro.config.mjs` | Drop the Atkinson local font block, add Source Serif 4 via the Google provider. |
| `src/components/BaseHead.astro` | Swap the `--font-atkinson` preload for `--font-serif`; keep the `--font-mono` render. |
| `src/pages/blog/[topic]/index.astro` | Restyle only — cards to ruled rows (§5). |
| `src/pages/blog/[topic]/[series]/index.astro` | Restyle only — cards to ruled rows (§5). |
| `src/components/PostNav.astro` | Restyle only — panels to ruled rows. |
| `src/layouts/BlogPost.astro` | Restyle only — hero shadow to hairline border. |

### Files deleted

`src/assets/fonts/` (Atkinson, now unreferenced).

---

## 10. Verification

The change is not done until all of these pass:

1. `npm run build` completes with **zero warnings** — the Phase 3 standard.
2. Every one of the 35 posts still builds to its existing URL. Compared by diffing the
   list of emitted HTML paths against a build from before the change.
3. `/blog` links to all 7 series and all 4 loose notes; the counts on the page match
   `find src/content/blog -name '*.md' | wc -l`.
4. The CV link resolves to a real PDF, checked against the built `dist/`.
5. Rendered in a browser at 1440px, 900px and 390px, in **all three theme states**
   (light, dark-by-OS, and explicit `data-theme`), with no horizontal body scroll.
6. Body text renders in Source Serif 4 and headings in JetBrains Mono — verified by
   reading `getComputedStyle(...).fontFamily` in the browser, not by looking at it.
   The `--font-mono` variable was silently missing once already; a CSS variable that
   fails to resolve is invisible until measured.
7. Text-on-background contrast measured at every distinct pairing, ≥ 4.5:1 for body and
   ≥ 3:1 for large text. Phase 3's floor was 5.68:1; this change must not lower it.
8. `<em>` renders as a real italic, not a synthesised oblique.

---

## 11. Open items

Blocking nothing — the build proceeds and these are visible gaps, not silent ones.

1. **Project repo links.** Four rows render without an action until URLs arrive. Adding
   one is a one-line edit to `PROJECTS` in `profile.ts`.
2. **`og:image`.** 47 of 51 pages currently share `blog-placeholder-1.jpg`, which is
   Astro's own promotional artwork — "Build the web you want" — on every link preview
   of this site. Now that a real photo and a real visual identity exist, this should be
   replaced. Out of scope here; worth its own small change.
3. **Theme toggle.** The tokens support one and always have; nothing sets
   `data-theme`. Roughly ten lines of script. Still deferred.
4. **Positioning drift.** The resume says B.Tech CSE; the old site said "Computer
   Science (AI)". The site will now say CSE, matching the CV. Flagging in case the AI
   specialisation is real and the resume is the thing that is out of date.

### Closed since the first draft

- **Hobbies** — supplied 2026-08-27, written up in §7.4.
- **GitHub handle inconsistency** — the user updated the CV; it now reads
  `github.com/gutslike`, matching the site and the earlier decision. Re-verified
  against the PDF on disk, not assumed.
- **"AI Tools" skills row** — user is indifferent, so it stays dropped per the
  reasoning in §7.1. One line in `profile.ts` restores it.

---

## 12. Risk

The radius and shadow change touches every component built in phases 1–5. That is the
largest surface area in this spec and the most likely source of a visual regression in
a place nobody thinks to look — a blog post's `PostNav`, or the copy button on a code
block. Verification step 5 covers a post page explicitly for this reason.
