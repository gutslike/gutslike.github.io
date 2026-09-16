---
title: "When Every Page Claims to Be the Homepage"
description: "How one canonical in a Next.js layout made 28 routes declare themselves the homepage, and the title and Open Graph traps I hit while fixing it."
pubDate: 2026-09-16
series: "seo-optimisation"
order: 3
---

Metadata in the Next.js App Router is **inherited**. A layout exports `metadata`, and every route beneath it starts from that object and overrides what it wants.

That is a good design. It is also a loaded gun, because a wrong value in a layout does not stay in the layout — it propagates to every descendant, and none of them raise an error.

---

## The defect

A locale layout contained this:

```ts
export const metadata: Metadata = {
  title: { default: "Acme | Platform", template: "%s | Acme" },
  alternates: {
    canonical: BASE_URL,        // <-- the homepage
  },
  openGraph: {
    url: BASE_URL,              // <-- also the homepage
  },
};
```

When I counted, twenty-eight of forty-three public routes inherited that canonical. They did not merely lack their own metadata — **they actively declared themselves to be the homepage.**

Ten of those routes were listed in the sitemap. So the site was submitting URLs for indexing that, on arrival, told the crawler *"do not index me, index `/` instead."*

## Concept: inheritance and the shape of a canonical

Three states a page can be in, worst to best:

1. **Wrong canonical** — "I am a copy of that other page." The page is excluded from the index and its value is credited elsewhere.
2. **No canonical** — the engine self-canonicalises to the URL it fetched. Usually correct.
3. **Correct self-canonical** — explicit and unambiguous.

The instinct on finding state 1 is to jump to state 3 everywhere. That was the audit's recommendation: *"wire all 28 routes."*

It was the wrong target, for two reasons.

**Many of those routes should not be indexed at all.** They were action pages and authenticated flows — create forms, apply flows, team management, token-bearing invitation links. Giving them polished titles and self-canonicals would have made them *more* discoverable, which is the opposite of what anyone wanted.

**Fifteen of them were client components**, and a client component cannot export `metadata`. The recommendation could not have been implemented as written.

The highest-leverage change was in the audit's throwaway closing line: *"also consider changing the layout's static canonical."* I removed four lines from one file, and that moved 16 routes from state 1 to state 2 instantly.

> **When a bad value is inherited, fix the ancestor before you override the descendants.** One deletion beat twenty-eight edits, and did not risk making private pages indexable.

## Trap: the title template

Next lets a layout define a title template:

```ts
title: {
  default: "Acme | Platform",
  template: "%s | Acme",
}
```

A child route exporting `title: "About"` gets `About | Acme`. Clean.

There are two ways to break it, and I ran into both.

### Breaking it by overriding with a plain string

A child layout that exports a plain string title **replaces the whole title object**, template included. Its own children then lose the brand suffix entirely:

```ts
// In a child layout — silently strips the template for everything beneath it
export const metadata = { title: "Programme" };

// Correct: re-declare the template alongside the default
export const metadata = {
  title: { default: "Programme", template: "%s | Acme" },
};
```

This one was my own doing, and I only caught it because I had captured a baseline of every route's title *before* the change and compared it *after*. Without that, two routes would have quietly lost their brand suffix.

### Breaking it by baking the brand into the value

The opposite error, which I found on five separate not-found branches:

```ts
if (!record) {
  return { title: "Page Not Found | Acme" };   // template appends another " | Acme"
}
```

Served output: `Page Not Found | Acme | Acme`.

These were all `noindex` pages, so the SEO cost was nil — but it is visible in the browser tab, and it signals that nobody looked at the rendered output.

> **Rule: a `title` under a `template` never carries the brand.** Pass the bare name and let the template do its job.

## Trap: the helper nobody called

A helper existed to build metadata for detail pages. It was never called. The pages emitted the generic site title and the inherited homepage canonical.

The audit described the helper as "complete, correct — just wire it up." It was neither:

- **Its parameter names did not match the data model.** It expected `name` and `bannerImage`; the model had `title` and a differently-named banner column. Wiring it up naively produces `<title>undefined</title>` — which *looks* like it worked, because a title appears.
- **The page fetched no data at all.** Fifteen lines, no params, no query. Before I could call the helper, I had to write the query.

There is a general lesson here about dead code: **an uncalled function has never been tested against reality.** Its signature drifted from the schema and nothing complained, because nothing ran it. Dead code is not neutral; it is a confident-looking claim that has never been checked.

### What I added that the audit did not ask for

A status gate. The database held a large number of draft and pending records alongside published ones. Wiring up metadata without a gate would have handed every unfinished record a proper title and a self-canonical — making drafts *more* indexable than before the fix.

With the gate in place, non-public statuses keep a real title (useful to humans in a browser tab) but emit `noindex, nofollow`.

> **Any change that improves discoverability has to answer: discoverable to whom, and for what?** "Better metadata" applied indiscriminately can publish things you never meant to publish.

## Open Graph: the automation that had drifted

Most routes shared one social image, so every share looked identical.

The interesting part: **the infrastructure already existed and was automated.** A script screenshotted live routes at 1200×630 with Puppeteer; a scheduled workflow ran it and committed the results. I did not have to design anything.

Two lists had simply drifted out of sync with the routes that existed — the generator's route array, and the route-to-image map used at render time.

The ordering detail that matters: **add the image before you reference it.** Adding map entries alone points `og:image` at files that do not exist yet, so every card renders broken until CI next runs. The generated files and the references have to land in the same change.

## Localised metadata: content in one language, metadata in another

The last variant of this bug. Page *content* was localised across seven languages. Page *metadata* was not — every call site passed an English literal:

```ts
createPageMetadata({
  title: "About Us",
  description: "...",
  route: "/about",
});
```

So a German page rendered German body copy under an English title. The title and meta description are the two strings a search engine actually **displays**. For six of seven locales, both were in the wrong language.

### The fix that touched zero call sites

Every call site already passed `route`. That is enough to derive a translation key:

```text
/                      ->  meta.home
/about                 ->  meta.about
/legal/privacy-policy  ->  meta.legal_privacy-policy
```

I changed the helper to resolve `meta.<key>.title` against the request locale and **keep the English literal as the fallback**. A route with no translation yet renders English — not a raw key path like `meta.about.title`, which is the classic way this goes wrong in public.

Twenty-four call sites, zero of them edited.

### A malformed tag nobody had noticed

While I was in that function, I spotted this:

```ts
locale: lang === "en" ? "en_US" : lang,     // emits og:locale="de"
```

`og:locale` expects `language_TERRITORY` — `de_DE`, `zh_CN`, `ko_KR`. Facebook and LinkedIn **ignore values that are not on their supported list**, so the tag was being discarded on six of seven locales. It had been "working" in the sense that it appeared in the HTML.

> A tag being present is not evidence that it is doing anything. Formats with fixed vocabularies fail silently by design.

## Takeaways

1. **Metadata inherits. Fix the ancestor first** — it is usually one deletion instead of many edits.
2. **A missing canonical beats a wrong one.** Do not rush to add canonicals to pages that should not be indexed.
3. **Capture a baseline before a metadata change** and diff every route after. Title regressions are invisible otherwise.
4. **Never put the brand in a title that sits under a template.**
5. **Dead code has never been tested against the schema.** Check its signature before trusting it.
6. **Ship generated assets with the references to them**, never one without the other.
