---
title: "Verify Before You Fix"
description: "Ten of sixteen SEO audit findings contained material errors, and they fell into a few recognisable shapes — including the mistakes I made myself while fixing them."
pubDate: 2026-09-16
series: "seo-optimisation"
order: 7
---

An external audit produced sixteen findings. When I worked through them carefully, **ten contained material errors** — wrong root causes, fixes that would not compile, and in one case a claim that was the exact opposite of the truth.

That is not a complaint about the auditors. Most of the errors were the predictable result of inspecting a site from the outside, or of reading code without running it. The useful part is the pattern: the errors fall into a small number of recognisable shapes, and each shape has a cheap check that catches it.

This post is about those shapes — including the ones I produced myself while fixing the others.

---

## Shape 1: the symptom attributed to the wrong cause

Several findings described real, verifiable symptoms and then guessed at the cause.

> *"Public pages are served private and uncacheable. Likely something in the root layout reads session or cookie state."*

The symptom was correct — every page was `private, no-store`. The cause was not. Neither layout read cookies, headers, or a session, and nothing set `force-dynamic`. I grepped for each of those; it took under a minute and ruled the hypothesis out.

The actual cause was structural: a dynamic route segment with no `generateStaticParams` anywhere in the codebase, so the framework could not know which values existed and had to render everything on demand.

**The check:** for each causal claim, name the specific line that would have to exist for it to be true. Then look for that line. A hypothesis you can falsify in one grep should be falsified before it becomes a ticket.

## Shape 2: the fix that cannot compile

Three separate findings recommended adding `export const metadata` to pages that were `"use client"`.

A client component cannot export metadata. It is not a lint preference; the framework reads metadata during server rendering and a client module is not evaluated there. The recommendation could not be implemented as written on any of those files.

This shape comes from reading the route list rather than the files. The fix is correct *in general* — it is just inapplicable to those specific routes, and nothing in a URL tells you which category a page is in.

**The check:** before estimating, open the file and look at line 1. `"use client"` changes what is possible.

## Shape 3: the claim that is the opposite of the truth

The most expensive one.

An earlier investigation concluded that a redirect was "configured in the hosting dashboard, not in the repository." It had searched for `middleware.*` and a hosting config file, found neither, and written the conclusion down confidently.

**Next.js 16 renamed `middleware.ts` to `proxy.ts`.** The redirect was in the repository the whole time, in a file whose name had changed in a major version. Two real defects were sitting in it — a double redirect hop and a temporary status code where a permanent one belonged — and both were fixable in code by anyone who had opened the file.

The cost was not the wrong sentence. It was that the sentence **stopped everyone else looking.** A confident negative ("this is not in the repo") is a much stronger claim than a positive one, and it should be held to a higher standard of evidence.

**The check:** "I searched and found nothing" is not the same as "it does not exist." Before concluding absence, verify that your search would have found the thing if it were there — search for the *behaviour*, not the filename you expect.

## Shape 4: the assumption that the data matches the code

A helper function existed to build metadata for detail pages. The audit described it as "complete, correct — just wire it up."

Its parameter names did not match the database model. Wiring it up naively produces `<title>undefined</title>` — which looks superficially like success, because a title appears.

A commented-out block in another file filtered records on a boolean column that **does not exist on that model**. It would not have compiled. Whoever wrote it assumed a feature existed; the comment made the whole area look handled, and it stayed that way for months.

**The check:** dead code has never been tested against reality. An uncalled function's signature has been free to drift from the schema, and nothing complained, because nothing ran it. Treat commented-out code as a claim, not as a head start.

## Shape 5: measuring the wrong thing and believing the number

These were mine. All five happened in one project.

**Grepping for a string the framework does not emit.** I searched the served HTML for `hreflang` and got zero. React emits the JSX attribute `hrefLang`, and the serialised HTML preserves that casing. The tags were there the whole time; my measurement was wrong.

**A `sed` that destroyed what it was measuring.** A cleanup expression I used to shorten output was stripping the host from every URL, which made canonical tags look empty.

**Counting the wrong symbols.** A build summary marks routes `○` static, `ƒ` dynamic and `●` prerendered-with-params. I counted only the first two, which under-reported the static routes substantially.

**`grep -c` counts lines, not matches.** Serialised JSON-LD is one line, so twelve questions inside it counted as "1". `grep -o … | wc -l` gives the real number.

**A greedy pattern that captured the rest of the line.** `grep -o '"@type":"Person".*'` returns everything after the match — including unrelated content further along — which gave me a false positive for a data leak that was not there. Parsing the JSON properly showed it was clean.

Every one of these produced a plausible number. Four of them produced a number that would have led me to the wrong action.

**The check:** when a measurement contradicts your expectation, suspect the measurement first. And prefer parsing structured output over pattern-matching text — `JSON.parse` cannot miscount.

## Shape 6: the fix that breaks something else

Two of my own worth recording.

**A title regression.** I added plain-string titles to two layouts, which silently stripped the parent's title template from every child route and removed the brand suffix. I only caught it because I had captured a baseline of every route's title before the change and diffed it after.

**A dropped query string.** Consolidating two URLs into one involved a two-hop redirect. My first implementation preserved the query string on hop one and dropped it on hop two. That would have broken every notification email already sent with a `?tab=` parameter — a failure invisible in any test that only checks the final URL.

**The check:** capture a baseline *before* you change anything, over more routes than the ones you are touching. Then diff. A change that improves fifteen routes and quietly breaks two is not an improvement.

## Shape 7: destroying the thing you are editing

Worth including because it is embarrassing and entirely avoidable.

A script I was running opened a file in write mode, then failed on an encoding error before writing anything:

```python
with io.open(path, "w", encoding="utf-8") as f:
    f.write(content)          # raises — but the file is already truncated
```

Opening a file with `"w"` **truncates it immediately**, before the write is attempted. The file was left at zero bytes. It was not in version control, so there was no copy to restore.

I rebuilt most of it from a session transcript, but some sections were lost.

The pattern that prevents it:

```python
data = content.encode("utf-8")        # fail here, before touching the file
tmp = path + ".tmp"
with open(tmp, "wb") as f:
    f.write(data)
assert os.path.getsize(tmp) > expected_minimum
os.replace(tmp, path)                 # atomic
```

**Encode before opening. Write to a temporary file. Check the size. Then replace.**

This happened to me twice in one project before the lesson took. The first occurrence should have been enough.

## What actually works

A few habits did most of the work:

**Re-verify every inherited claim before acting on it.** Ten of sixteen findings were wrong, and I could not tell the right ones from the wrong ones without checking.

**Measure before and after, with the same command, over a wider surface than you changed.** Nearly every regression I caught here came from a baseline diff rather than from a test.

**Prefer parsing to pattern-matching.** `JSON.parse` fails loudly; `grep` fails plausibly.

**Look at the output with your eyes at least once.** I opened two generated images rather than trusting their file sizes — which is how I ruled out a rendering quirk in a vector source. An HTML diff is not a substitute for loading the page.

**Write down what you did not do, and why.** "Deferred because the source data is ambiguous" is a finding. A ticket closed with a guess is a future bug with no paper trail.

**When several findings all describe absence, look for one upstream cause.** Four separate tickets in this project — no structured data, no headings, wrong status codes, wrong language — were one bug.

## Takeaways

1. An audit is a set of **hypotheses**, not a work order.
2. Falsify causal claims with a grep before they become tickets.
3. `"use client"` changes what is possible — check line 1 before estimating.
4. A confident negative deserves more evidence than a positive.
5. Dead code has never been checked against the schema.
6. Suspect your measurement before your expectation, and parse rather than pattern-match.
7. Baseline widely, diff after, and never open a file for writing before you are ready to write.
