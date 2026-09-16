---
title: "Seven Locales, One Language"
description: "Seven translation bundles that all server-rendered English: browser-only resolvers, frozen t() calls, a request-leaking singleton, and a German bundle that was Dutch."
pubDate: 2026-09-16
series: "seo-optimisation"
order: 5
---

The application supported seven languages, with real translation bundles — thousands of keys each, 94–98% complete. Someone had done a great deal of work.

Every one of those locales server-rendered English.

In this post I go through the traps that sit between "we have translations" and "we serve translations", including one that is a genuine correctness bug rather than an SEO one.

---

## Trap 1: resolving the language from things that do not exist on a server

The language resolver looked like this:

```ts
function getInitialLanguage() {
  const fromPath = window.location.pathname.split("/")[1];
  if (locales.includes(fromPath)) return fromPath;

  const fromCookie = document.cookie.match(/NEXT_LOCALE=([^;]+)/)?.[1];
  if (fromCookie) return fromCookie;

  return navigator.language.split("-")[0];
}
```

`window`, `document` and `navigator` are browser objects. During server rendering none of them exist, so this either throws or — as here, guarded — falls through to the default. Every locale server-rendered English, then the browser hydrated and swapped in the right language.

Two consequences:

**Duplicate content.** Six locales served prose identical to the seventh, each with a canonical pointing at itself. A German URL had over a thousand characters of body text and **zero non-ASCII characters** — a fast, decisive way to check whether a locale is actually rendering:

```bash
curl -s https://example.com/de/about | tr -d '\000-\177' | wc -c
```

If that returns 0 for a language that should have accents or non-Latin script, the page is not localised regardless of what it looks like in a browser.

**A hydration mismatch.** The server sent English; the client rendered German; React reported error #418. This is worth understanding properly.

### Concept: hydration and why the mismatch matters

Hydration is React attaching to server-rendered HTML rather than rebuilding it. It assumes the first client render produces the **same tree** the server produced. When it does not, React discards the server HTML for that subtree and re-renders from scratch.

So a mismatch costs you:

- the performance benefit of SSR (the work is done twice),
- a visible flash of the wrong content,
- and an error that is easy to dismiss as noise.

React logs hydration mismatches as **errors**, not warnings. A console check is a genuine test:

> zero console errors on a locale page is a meaningful assertion, not a nicety.

## Trap 2: the module-scope `t` that freezes at import time

Fixing the resolver was not enough. Several components did this:

```ts
import { t } from "i18next";

const benefits = [
  { title: t("about.benefits.title1") },   // evaluated once, at import
  { title: t("about.benefits.title2") },
];
```

Two separate bugs in three lines.

**It binds to the global default instance**, bypassing whatever instance the provider supplies. Passing a correct per-request instance down the tree achieves nothing if a component ignores it.

**It is evaluated at module scope** — once, when the module is first imported — so the strings are frozen at whatever the language was at that moment. This was also a pre-existing client bug: those strings never updated when a user switched language in the UI. Nobody had reported it, because it only affects visitors who switch languages mid-session.

The fix is to resolve inside the component, through the hook:

```tsx
function Benefits() {
  const { t } = useTranslation();
  const benefits = [
    { title: t("about.benefits.title1") },
  ];
}
```

> **Translation is a render-time operation, not an import-time one.** Any `t()` at module scope is a value frozen in the past.

## Trap 3: the singleton that leaks between requests

This is the one that is a real correctness bug, not just SEO.

The natural fix for "the server renders the wrong language" is:

```ts
// DO NOT DO THIS ON A SERVER
i18n.changeLanguage(lang);
```

In a browser that is correct — there is one user and one instance.

On a server, **the module is shared across every concurrent request**. Node caches modules per process; a module-scope i18next instance is a single mutable object serving every visitor at once. `changeLanguage` mutates it.

So: request A (German) sets the language to `de`. Request B (Japanese) sets it to `ja` a millisecond later. Request A's render, still in progress, now emits Japanese. Under load this is non-deterministic, unreproducible locally, and looks like nonsense in a bug report.

The fix is a **fresh instance per server render**:

```ts
export function createI18nInstance(lang: string) {
  const instance = createInstance();
  instance.init({
    resources,                       // static imports: init is synchronous
    lng: locales.includes(lang) ? lang : "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
  return instance;
}
```

Two deliberate details:

- **Resources are static imports**, so `init()` completes synchronously and the instance is usable the moment it returns. No await, no loading gate. (A loading gate is what broke everything in [post 1](/blog/debugging/seo-optimisation/01-the-three-line-bug/).)
- **No `.use(initReactI18next)`.** That registers a *global default* instance — reintroducing exactly the shared mutable state I was trying to avoid. Pass the instance to the provider explicitly instead.

### Caching it safely

Creating an instance over every bundle on every render is wasteful for something like metadata generation, which only ever calls `t()`. Memoisation is safe here **only because of a specific property**:

```ts
const cache = new Map<string, I18n>();

export function getI18nInstance(lang: string) {
  const key = locales.includes(lang) ? lang : "en";
  let instance = cache.get(key);
  if (!instance) {
    instance = createI18nInstance(key);
    cache.set(key, instance);
  }
  return instance;
}
```

**The cache key is the locale, and the language is fixed at init and never mutated.** Two requests for different locales get different objects; two requests for the same locale share an object whose language is already correct. Nothing can leak.

That safety evaporates the moment someone calls `changeLanguage` on a cached instance, so that constraint belongs in a comment at the definition, not in someone's memory.

## Trap 4: `fallbackLng` pointing at the broken locale

A subtle one, which I found while deleting bad translations.

```ts
fallbackLng: initialLanguage,     // whatever language we started in
```

That reads as "fall back to the user's language", which sounds reasonable and is meaningless: the fallback exists for when *that* language lacks a key.

On a German page the fallback was `de`. So a missing German key fell back to German, found nothing, and rendered **the raw key path** — `policy.title` — as visible text.

Nothing had surfaced it because the German bundle happened to be complete. The moment I deleted keys, every legal page would have rendered key paths in production. I changed it to `"en"` *before* deleting anything.

> `fallbackLng` should be the one language you are certain is complete. Setting it to a variable defeats the mechanism.

## Trap 5: a bundle in the wrong language

The `de` bundle contained **Dutch**. Over a thousand values carried Dutch markers against a couple of hundred German ones. It had been served under a German label for a long time.

German and Dutch are close enough that a skim passes. `Mijn hackathons` versus *Meine Hackathons* — if you do not read German, both look German.

### The interesting part: verifying the fix

I tried regex detection first, and it was **wrong in both directions**:

- **False positives:** `je` is a common Dutch word, but also German in *je nach*. `Mai` and `Juli` are German months and look Dutch-adjacent.
- **False negatives:** many values are identical or near-identical in both languages.

What actually worked was comparing every value against the **original file in git history**. Anything byte-identical to the Dutch original had not been translated. That found **988 values the regexes had missed**.

> When checking "did every item change?", diff against the previous state. Do not write a classifier for the property you are checking — you will be testing your classifier, not the data.

### A judgement call worth recording

I **deleted roughly 1,400 legal values** — privacy policy, terms, cookie policy — rather than machine-translating them, so they fall back to English.

Machine-translated legal text is a liability. In several jurisdictions, terms presented in the local language are the terms that bind you, and a mistranslated clause is worse than a clause the reader has to read in English. "Wrong but German" is worse than "English".

Translating UI copy is an engineering task. Translating contractual text is not.

## Trap 6: locale codes that are not language codes

I covered this in detail in [post 2](/blog/debugging/seo-optimisation/02-addresses-and-redirects/): three of the seven codes were ISO 3166 **country** codes rather than ISO 639-1 **language** codes (`cn` instead of `zh`, `vn`/`vi`, `kr`/`ko`), which made their `hreflang` annotations invalid and silently ignored.

The reason it survives so long: for English, German, French and Russian the two standards give you the same letters. You can build and test the whole feature without ever touching a case where they differ.

## Trap 7: metadata that never got the memo

Content localised; `<title>` and `<meta name="description">` still English. I covered this in [post 3](/blog/debugging/seo-optimisation/03-metadata-inheritance/). Those two strings are the ones a search result actually shows, so localising the body and not the metadata gets the visible part backwards.

## Still open: `<html lang>`

Worth naming as a deliberate non-fix.

```html
<html lang="en">   <!-- on every locale -->
```

The root layout sits **above** the locale segment, and the framework only permits `<html>` in the root layout — so it cannot read the locale param without a structural change (a header set in middleware, or restructuring so the locale wraps `<html>`).

It is **not really an SEO problem**: search engines determine page language from content and `hreflang`, both of which are now correct.

It is a real **accessibility** problem. Screen readers select pronunciation and voice from `lang`. A Russian page declaring `lang="en"` is read aloud with English phonetics — effectively unusable. It also affects browser translation prompts, spellcheck, and CJK font selection.

I deferred it deliberately, and wrote it down as deferred rather than quietly dropping it.

## A locale checklist

```bash
# Does each locale actually render its own language?
for l in en de fr ru zh vi ko; do
  printf '%-4s non-ascii bytes: ' "$l"
  curl -s "https://example.com/$l/about" | tr -d '\000-\177' | wc -c
done

# Is the title localised, not just the body?
for l in en de ko; do
  printf '%-4s ' "$l"
  curl -s "https://example.com/$l/about" | grep -o '<title>[^<]*</title>'
done
```

## Takeaways

1. **Browser globals do not exist on a server.** Anything resolving state from `window` or `document` resolves to the default during SSR.
2. **A module-scope i18n instance is shared across concurrent requests.** Never `changeLanguage` it on a server; build per-request instances, and only cache them keyed by locale.
3. **`t()` at module scope freezes at import time** and bypasses your provider.
4. **`fallbackLng` must be a language you know is complete** — never the current one.
5. **Verify bulk translation by diffing against the original**, not by classifying the output.
6. **Do not machine-translate legal text.**
7. **`lang` is an accessibility attribute first.** Fix it even when it does not move rankings.
