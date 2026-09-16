---
title: "The Three-Line Bug That Made a Whole Site Invisible"
description: "How a loading gate in an i18n provider made every page server-render empty, and why deleting three lines fixed five audit findings."
pubDate: 2026-09-16
series: "seo-optimisation"
order: 1
---

An SEO audit came back with sixteen findings. One of them was filed as an epic: *"public pages ship no server-rendered content."* I fixed it by deleting three lines.

More interestingly, deleting those three lines also fixed four other findings that had been filed as separate problems.

---

## The symptom

When I fetched any public page without executing JavaScript — which is what `curl` does, and what a surprising amount of the internet does — I got this:

```bash
$ curl -s https://example.com/about | wc -c
41213
```

41 KB of HTML. Looks healthy. Then I counted what a parser can actually read:

```bash
$ curl -s https://example.com/about | grep -c '<h1'
0
$ curl -s https://example.com/about | grep -c 'application/ld+json'
0
```

Zero headings. Zero structured data. The page had **27 characters of body text** inside 41 KB of markup. Everything else was `<script>` and `<link>` tags.

## The concept: what a crawler actually receives

When a browser loads a React app it does two things: it renders the HTML the server sent, then it runs JavaScript that may replace or extend that HTML. This second step is *hydration*.

A modern search crawler will also run that JavaScript — eventually. It goes into a rendering queue, and pages come out of that queue anywhere from hours to weeks later. Meanwhile:

- **Non-JS consumers see only the first step.** Many social-card scrapers, several AI answer engines, most feed readers and every `curl` never run your JavaScript at all.
- **Crawl budget is spent on the first step.** If the HTML is empty, a crawler has no links to follow and no reason to prioritise the page.

So "it works in my browser" and "it works for a crawler" are genuinely different claims. The only way to check the second one is to look at the HTML the server sent — *before* any JavaScript runs.

## The cause

The app wrapped its entire tree in an i18n provider. Reduced to its essentials:

```tsx
export function I18nProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    i18n.init().then(() => setIsInitialized(true));
  }, []);

  if (!isInitialized) {
    return <div className="min-h-screen" />;   // <-- here
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
```

That looks like ordinary defensive code: *don't render until translations are ready.* In a browser-only app it is harmless. On a server it is fatal.

**`useEffect` never runs during server rendering.** This is not a bug in React; it is the definition. Effects are for synchronising with something outside React — a subscription, a timer, the DOM — and during SSR there is no DOM and no commit phase. React renders your component to a string and stops.

So on the server, `isInitialized` was `false`, always. The provider returned an empty `<div>` and **discarded its entire children tree** — which, because it wrapped the layout, was the whole site.

The extra sting: the gate was guarding nothing. The i18n instance was initialised **synchronously at module scope** from static JSON imports. By the time any component rendered, initialisation had already finished. The code was waiting for an event that had already happened, in an environment where the waiting mechanism does not run.

## Why this is easy to ship

Every local check passes:

- `npm run dev` looks perfect — the browser runs the effect, sets state, renders everything.
- Clicking around works.
- Lighthouse, if run in a browser, sees the hydrated DOM.
- No error is thrown anywhere.

The failure is only visible if you look at the **server's output**, and almost nothing in a normal development loop shows you that.

## How one bug looked like five

This is the part worth internalising. The audit had separate findings for:

- no structured data on any route
- no `<h1>` on any page
- pages that should 404 returning 200
- all locales serving identical English content

All four were **the same bug**.

- **Structured data** was being emitted by a server component. It never reached the HTML because the provider threw away the subtree containing it.
- **Headings** existed in the components. Same reason.
- **The 404s**: one page did call `notFound()`. But `notFound()` works by throwing during render, and the page component never rendered, so nothing ever threw. The framework returned 200 for a page it never executed.
- **The locales**: the language resolver read `window.location` and `navigator.language`. On the server those do not exist, so it fell through to the default. But nobody noticed the content was English, because there was no content.

Four independent-looking tickets, one deletion.

> **The lesson:** when several findings all describe *absence* — no headings, no metadata, no structured data, no content — suspect a single upstream cause before you write four fixes. Absence is usually one thing failing, not four things missing.

## The fix

I deleted the gate. Then came the real work: making the provider produce a correct instance on the server.

```tsx
export function I18nProvider({ lang, children }) {
  // On the server, build a fresh instance for this request.
  // In the browser, reuse the module singleton.
  const instance = useMemo(
    () => (typeof window === "undefined" ? createI18nInstance(lang) : clientI18n),
    [lang]
  );

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
```

Why a *fresh instance per request* on the server matters is its own trap, which I cover in [post 5](/blog/debugging/seo-optimisation/05-i18n-traps/).

## Measuring the fix

I measured before and after on the same URL, with the same command:

| Metric | Before | After |
|---|---|---|
| Body text on the homepage | 27 chars | 7,020 chars |
| `<h1>` elements | 0 | 1 |
| JSON-LD blocks | 0 | 2 |
| Sitemap URLs rendering real content | 0 | all of them |

One command to check the thing that actually matters:

```bash
curl -s https://example.com/ | sed 's/<script[^>]*>.*<\/script>//g' | wc -c
```

If that number is small, nothing else in your SEO checklist matters yet.

## Takeaways

1. **`useEffect` does not run on the server.** Any `if (!stateSetByAnEffect) return null` is an instruction to render nothing during SSR.
2. **Test with JavaScript disabled**, or with `curl`. It is the only way to see what a crawler's first pass sees.
3. **A gate that waits for something synchronous is always wrong.** If initialisation is synchronous, there is nothing to wait for.
4. **Cluster your bug reports by symptom shape.** Several "X is missing" findings usually share one cause upstream.
