important-
lowercase folders
lowercase files
hyphen-separated names
no `&` in folder names (the slugifier drops it silently)

frontmatter-

    title: "Title Here"          # required
    description: "Short summary" # required
    pubDate: 2026-06-03          # required
    updatedDate: 2026-07-01      # optional
    heroImage: "../../../assets/thing.jpg"   # optional, path relative to the post
    topic: "go"                  # optional, defaults to the folder
    series: "basics"             # optional, defaults to the folder
    order: 2                     # optional, position within a series
    tags: ["go", "memory"]       # optional
    draft: true                  # optional, keeps it out of the build

dates are ISO 8601 — YYYY-MM-DD, unquoted, zero-padded.
never `Aug 6 2026` or `july 18 2026`.
ISO sorts chronologically as plain text, and there is only one way to write it.

taxonomy-
frontmatter wins, the folder path is the fallback. resolved in src/lib/posts.ts,
and nowhere else — routes never split the id themselves.

    go/basics/maps.md   ->  topic go, series basics
    go/roadmap.md       ->  topic go, no series (a post under the topic)
    scratch.md          ->  no topic (just a post, cannot collide)

a post needs two path segments to get a topic. that is what stops a root-level
post from becoming its own "topic" and overwriting itself.
set `topic:` explicitly if you want a shallow file filed somewhere.

drafts-
`draft: true` is served by `npm run dev` and excluded from `npm run build`.
so it is gone from the page, the feed, and the sitemap at the same time.

ordering-
series and topic lists run oldest first (reading order), `order` beats pubDate
rss runs newest first (feed convention)
topics on /blog/ run most-recently-active first

code blocks-
always fence with a language (```go, ```python, ```bash). the language becomes
the label on the block, and unlabelled fences get no label and no copy button.
