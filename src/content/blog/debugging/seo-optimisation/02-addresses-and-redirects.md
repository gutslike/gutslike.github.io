---
title: "The Addresses Your Site Advertises"
description: "Canonicals, redirects and hreflang codes that pointed at addresses the site didn't actually serve, and how I brought them back in line."
pubDate: 2026-09-16
series: "seo-optimisation"
order: 2
---

A website has opinions about its own URLs, and it states them in several places at once: canonical tags, the sitemap, `robots.txt`, Open Graph tags, `hreflang` clusters and redirects. When those opinions disagree, search engines have to guess — and you do not get to choose what they guess.

In this post I cover three defects that were all the same mistake in different clothes: **the site advertising an address that was not the address it served.**

---

## Concept: what a canonical tag is for

```html
<link rel="canonical" href="https://www.example.com/about" />
```

A canonical says: *if you found this content at some other URL, this is the one I want indexed.*

It exists because the same page is usually reachable several ways — with and without `www`, with and without a trailing slash, with tracking parameters, at an id-based URL and a slug-based URL. Left alone, a search engine treats those as separate documents competing with each other, and the reputation a page earns is divided between them rather than accumulated.

The critical property: **a canonical is a hint, not a command, and a wrong one is worse than none.** If you omit it, Google self-canonicalises to the URL it fetched — usually right. If you point it somewhere wrong, you have actively told the engine to ignore this page.

## Defect 1: advertising a host that redirects

Production served `https://www.example.com` and 308-redirected the bare domain. The application advertised the **non-www** form in every canonical, every sitemap entry, `robots.txt`, and every Open Graph image URL.

The cause was a fallback that had quietly become the actual value:

```ts
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
```

The environment variable was never set in production, so the fallback won everywhere. I found it in **six** files — a metadata helper (twice), the sitemap, `robots.ts`, a layout, and a structured-data module.

### Why this is more than cosmetic

- Every published URL pointed at an address that immediately redirects. Redirects are followed, but they cost a round trip and dilute signals.
- `og:image` returned a **308 instead of an image**. Most social scrapers do not follow redirects for images. Every share rendered with no picture — an entirely invisible failure, because the person sharing sees a cached card.

### The fix, and the part people skip

I set the environment variable, *and* changed the hardcoded fallbacks to the correct form. A fallback should fail safe: if the variable goes missing again, the fallback should be the value you actually want, not the one you had in 2023.

Note the deployment detail: `NEXT_PUBLIC_*` variables are **inlined at build time**, not read at runtime. Setting the variable is not enough — you must redeploy.

## Defect 2: a comment that described the opposite of reality

The build config contained:

```ts
// SEO: Redirect www to non-www and handle common URL issues
async redirects() { /* ...no www rule anywhere... */ }
```

No such rule existed, and production did the reverse.

This is worth its own section because of what it *cost*. A wrong comment is not neutral — it is an active instruction to stop looking. Anyone auditing the canonical host read that line, believed it, and moved on. It is entirely plausible that this comment is why Defect 1 survived as long as it did.

> **Treat comments as claims that expire.** A comment describing behaviour that lives somewhere else — a dashboard, a CDN, another repo — will eventually be wrong, and nothing will fail when it is.

### A sting in the tail

While I was verifying that comment, I found the actual redirect in a file nobody had searched: `src/proxy.ts`. **Next.js 16 renamed `middleware.ts` to `proxy.ts`.** An earlier investigation had searched for `middleware.*` and a hosting config file, found neither, and concluded the redirect was configured outside the repo. That conclusion was wrong, and it had been written down confidently.

Two real defects were sitting in that file:

```ts
// Before
const url = new URL(`/${locale}${pathname}`, request.url);
return NextResponse.redirect(url);          // defaults to 307
```

- When `pathname` was `/`, this built `/en/` **with a trailing slash**. A `trailingSlash: false` setting then fired a *second* redirect to strip it. Two hops where one would do.
- `NextResponse.redirect()` defaults to **307**.

## Concept: redirect status codes, and why the number matters

| Code | Meaning | Method preserved | Cached |
|---|---|---|---|
| 301 | Moved permanently | Not guaranteed — may become GET | Yes, aggressively |
| 302 | Found (temporary) | Not guaranteed | No |
| 307 | Temporary redirect | **Yes** | No |
| 308 | Permanent redirect | **Yes** | Yes |

For SEO the temporary/permanent distinction is the whole game:

- A **permanent** redirect tells a crawler *stop asking for the old URL, transfer its accumulated value to the new one.*
- A **temporary** redirect says *keep asking for the old URL; this detour is not the real answer.*

Sending a visitor from `/` to `/en` is permanent — the default locale is not a temporary detour. With a 307, nothing ever consolidates on `/en`; the engine keeps treating `/` as the real URL and keeps re-requesting it forever.

307/308 are the modern pair because they guarantee the HTTP method survives. A 301 may legally turn a POST into a GET, which is a separate class of bug.

Here is what I changed it to:

```ts
const suffix = pathname === "/" ? "" : pathname;
const url = new URL(`/${locale}${suffix}`, request.url);
return NextResponse.redirect(url, 308);
```

Bare domain to final URL: **one hop, permanent**, down from two hops via a temporary.

## Defect 3: `hreflang` values that were silently ignored

The site served seven locales, at paths like `/en`, `/de`, `/fr`, `/cn`, `/vn`, `/kr`.

Three of those are not language codes.

| In use | What it actually is | Correct code |
|---|---|---|
| `cn` | ISO 3166-1 **country** code for China | `zh` |
| `vn` | ISO 3166-1 country code for Vietnam | `vi` |
| `kr` | ISO 3166-1 country code for South Korea | `ko` |

### Concept: the two standards that look the same

- **ISO 639-1** is a two-letter code for a *language*: `en`, `de`, `fr`, `zh`, `vi`, `ko`.
- **ISO 3166-1 alpha-2** is a two-letter code for a *country*: `US`, `DE`, `FR`, `CN`, `VN`, `KR`.

They overlap confusingly. For English, German, French, Russian, Spanish and Italian the language code and the country code you would reach for are **identical or near-identical**, so you can build a locale switcher, test it on those, and never discover the rule you have broken.

You find out on the languages where they differ — which is precisely the set you are least likely to read.

`hreflang` accepts `language` or `language-REGION` (`zh`, `zh-CN`, `pt-BR`). It **does not** accept a bare country code, and the spec's behaviour for an invalid value is to **ignore the annotation entirely** — silently. No console warning, no report, no failed build. Three of seven locales were contributing nothing, and an incomplete cluster can devalue the whole set.

### The trap inside the fix

Renaming locale directories is a mechanical find-and-replace, which is exactly why it is dangerous. The resource map used **unquoted** object keys:

```ts
const resources = {
  en: { translation: en },
  cn: { translation: cn },   // a quoted-string search-and-replace never sees this
};
```

My substitution targeted `"cn"`. It updated the locale list and missed this. The result would have been a `locales` array saying `zh` and a `resources` map still keyed `cn` — **three locales with no translations at all**, falling back to English, with a completely clean build.

I caught it by reading the diff rather than trusting the script.

> **When a rename is mechanical, the review has to be manual.** The failure mode of a bad search-and-replace is silence, not an error.

## A checklist you can actually run

```bash
# 1. Does the canonical match the URL you fetched?
curl -s https://www.example.com/about | grep -o 'rel="canonical" href="[^"]*"'

# 2. How many hops from the bare domain?
curl -sIL https://example.com -o /dev/null -w '%{num_redirects} hops -> %{url_effective}\n'

# 3. Are the redirects permanent?
curl -sI https://example.com | grep -i '^HTTP'

# 4. Does og:image return an image, or a redirect?
curl -sI "$(curl -s https://www.example.com/about \
  | grep -o 'property="og:image" content="[^"]*"' \
  | sed 's/.*content="//;s/"//')" | grep -iE '^(HTTP|content-type)'
```

## Takeaways

1. **A wrong canonical is worse than a missing one.** Omission gets self-canonicalised correctly; commission tells the engine to ignore the page.
2. **Fallbacks become production values.** Make the fallback the answer you want.
3. **Comments about behaviour that lives elsewhere expire silently.** Verify before trusting one.
4. **Use 308, not 307, for anything permanent** — and count your hops.
5. **Language codes are not country codes**, and the languages where that matters are the ones you are least likely to notice.
