---
title: "Structured Data That Actually Validates"
description: "JSON-LD that looks right and gets silently discarded: relative URLs, dates with no year, loose URL validation, and deciding what not to publish."
pubDate: 2026-09-16
series: "seo-optimisation"
order: 6
---

Structured data is the machine-readable version of your page. You are telling a parser *"this page is about an event, and here are its dates"* rather than hoping it infers that from prose.

It is also unusually easy to ship something that looks correct, appears in the HTML, and is silently discarded. In this post I go through the ways that happened on this project.

---

## Concept: JSON-LD and schema.org

Two separate things people conflate:

- **schema.org** is the vocabulary — the set of types (`Event`, `Person`, `Organization`, `BreadcrumbList`) and their properties.
- **JSON-LD** is one syntax for expressing it, and the one every search engine now recommends. It sits in a `<script>` tag and does not touch your markup:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme",
  "url": "https://www.example.com"
}
</script>
```

The advantage over inline microdata is that it is a separate document. Restyling the page cannot break it, and a designer moving a `<div>` cannot invalidate your markup.

The disadvantage is exactly the same property: **it can drift away from what the page actually says, and nothing will complain.**

## Rule zero: only mark up what is on the page

This is the rule that governs everything else. Search engines require structured data to describe content **visible to the user on that page**. Marking up content that is not rendered — because it is behind a tab, on another page, or simply not implemented yet — is a violation, and the penalty is manual action rather than a quiet ignore.

It came up twice for me, in opposite directions:

**A false alarm.** When I audited the FAQ data, I found a large number of published question/answer rows and no FAQ markup, which looked like a straightforward gap. My first conclusion was that the content was not rendered publicly at all, and therefore could not be marked up.

That conclusion was **wrong** — I had grepped the wrong directory. The FAQs *were* rendered, via a component nested two levels inside a view component. Once I had established that, the markup was straightforward and legitimate: the content was on the page.

**A real constraint.** The same logic in reverse: if that content had *not* been rendered, the correct move would have been to leave the markup out until it was, not to add it and hope.

> Before writing structured data, load the page and find the content with your eyes. "It is in the database" is not the same as "it is on the page."

## Trap: relative URLs are silently dropped

`BreadcrumbList` is a good example of a type where a small mistake voids the whole block.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home",     "item": "https://www.example.com/en" },
    { "@type": "ListItem", "position": 2, "name": "Events",   "item": "https://www.example.com/en/events" },
    { "@type": "ListItem", "position": 3, "name": "Spring Hack" }
  ]
}
```

Three requirements that each fail silently:

1. **`item` must be an absolute URL.** A relative `/en/events` is dropped by validators, taking the entry with it.
2. **`position` must start at 1 and be contiguous.** A gap invalidates the list.
3. **The last item may omit `item`** — it is the current page. Including it is allowed; omitting it is conventional.

Because these fail by omission, a breadcrumb block can be present in your HTML, well-formed JSON, and contribute nothing.

## Trap: fields that are format-constrained

`Event` requires `startDate` in **ISO 8601**. Not "a date" — that format specifically.

This is where I hit a genuinely blocked case. Past events had dates stored as display strings:

```text
"May 24–25"
"July 21–Sep 1"
```

No year. A related field carried years, but as **localised free text** with entries like `"Aug Week 1, 2025"` and `"Within 1-2 Weeks"`. And the two sources contradicted each other — one record showed `"Aug 23–23"` in one field and `"August 22-23, 2025"` in the other.

I decided **not to implement `Event` for those pages**. Inferring an ISO date from that means publishing a guess about when a real event happened. The correct fix is a data change — explicit `startDate`/`endDate` fields — which is not an engineering judgement call.

A second reason reinforced it: event rich results are aimed at **upcoming** events. Correct markup on finished ones earns close to nothing, so the risk/benefit is bad in both directions.

> A blocked task should be recorded as blocked, with the reason. "We could not do this because the source data is ambiguous" is a finding. Guessing to close a ticket is not.

## Trap: a vocabulary that fails closed

`sameAs` is how you say *"this entity is also these other URLs"* — the property that links a profile to the same person's presence elsewhere. It requires absolute URLs.

The profile form validated social links with this:

```ts
const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
```

Note `(https?:\/\/)?` — **the scheme is optional**. The API stored the trimmed value unchanged. So a row could legitimately hold `github.com/someone`, which is not an absolute URL and would be discarded.

So I wrote the helper to repair it rather than trust the input:

```ts
function toAbsoluteUrl(value?: string | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(candidate);
    if (!url.hostname.includes(".")) return null;   // "not a url" would otherwise parse
    return url.toString();
  } catch {
    return null;
  }
}
```

Worth noting honestly: when I inspected the live data, every stored value happened to already have a scheme. The guard did not fire. It is still correct — the validation permits scheme-less input, so the case is reachable — but it is an example of a defence that is justified by the code path, not by an observed failure.

## Privacy: structured data is a publishing decision

Adding `Person` markup to public profiles raised a question worth separating from the technical one.

A profile table typically holds more than a profile page displays — the one here included age, gender, date of birth and phone number alongside bio and social links. It is tempting to map everything that has a schema.org equivalent.

Don't. Two reasons:

**Scope.** A decision that profiles are "public" is a decision that they are *findable*. It is not a decision to publish every column. Those are different questions with different answers.

**Extraction cost.** JSON-LD is machine-readable *by design*. A phone number rendered in page markup requires someone to write a scraper. The same number in JSON-LD is a one-line extraction from a format built for bulk parsing. Putting a value in structured data materially lowers the cost of harvesting it.

So I kept the emitted type deliberately narrow — name, canonical URL, image, bio, `sameAs`, skills, education, current role — and I **verified that exclusion by walking every nested key** of the emitted object rather than by reading the code that built it:

```js
function deepKeys(o, acc = new Set()) {
  if (o && typeof o === "object") {
    for (const k of Object.keys(o)) { acc.add(k); deepKeys(o[k], acc); }
  }
  return acc;
}
// then assert none of the private field names appear
```

## Another judgement: `worksFor` should be current

```ts
const current = workExperience.find((w) => w.currentlyWorkHere);
```

`worksFor` is a factual claim about where someone works **now**. Mapping the most recent row instead — the obvious shortcut — publishes a false statement about a real person the moment they leave a job and add the next one. Only the row flagged current qualifies.

Small detail, but it is the kind of thing structured data makes consequential: you are not styling a CV, you are asserting facts in a format built for machines to believe.

## A caveat worth stating out loud: FAQ rich results

`FAQPage` markup is cheap and looks like an easy win. It mostly is not, any more.

**In August 2023 Google restricted FAQ rich results to authoritative government and health sites.** For everyone else the expandable Q&A block in search results simply does not appear.

The markup is still worth adding — other engines use it, and it helps any parser understand the page — but it should be described accurately. Adding `FAQPage` to a ticket board as "will get us FAQ rich results" is, for most sites, no longer true.

> Structured-data advice ages badly. Check the current documentation for the specific type before promising an outcome.

## Verifying without Google's tool

Google's Rich Results Test cannot be pointed at `localhost`, so local verification means parsing what you serve:

```js
const blocks = [...html.matchAll(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
)].map(m => m[1]);

for (const b of blocks) {
  const json = JSON.parse(b);          // throws if malformed
  console.log(json["@type"]);
}
```

That catches malformed JSON, missing required fields, relative URLs and non-contiguous positions — most of what actually goes wrong. Running it across every URL in the sitemap turns "I added structured data" into a number.

What it cannot tell you is whether Google will *use* it. That check has to happen after deploy, and it should stay on the ticket until it does.

## A counting mistake worth repeating

While I was verifying, this command reported one question per page:

```bash
curl -s "$URL" | grep -c '"@type":"Question"'
```

The real number was twelve. `grep -c` counts **matching lines**, not matches — and serialised JSON-LD is a single line.

```bash
curl -s "$URL" | grep -o '"@type":"Question"' | wc -l    # counts matches
```

A whole class of "verification" produces confident wrong numbers this way.

## Takeaways

1. **Only mark up what the page displays.** Check with your eyes, not the database.
2. **Relative URLs, non-contiguous positions and wrong date formats fail silently.** Present in the HTML is not the same as valid.
3. **If the source data cannot support a required field, do not guess.** Record it as blocked.
4. **Structured data lowers the cost of extracting whatever you put in it.** Decide what belongs there separately from what is in your database.
5. **Verify by parsing your own output**, and remember `grep -c` counts lines.
6. **Check current documentation before promising a rich result.** The rules change.
