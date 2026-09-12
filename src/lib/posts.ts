import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * Every route reads the collection through here, so draft handling and the
 * taxonomy rules below exist in one place instead of being re-derived (and
 * quietly diverging) in each page.
 */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('blog');

	// Drafts stay visible while writing, and never reach a build.
	return import.meta.env.DEV ? posts : posts.filter((post) => !post.data.draft);
}

/**
 * Which topic a post belongs to, or undefined if it belongs to none.
 *
 * Frontmatter wins. The folder path is the fallback, so no existing post needs
 * editing — but it is only a fallback, which is what stops the path from being
 * load-bearing. Depth decides when frontmatter is silent:
 *
 *   go/basics/maps.md -> topic "go"
 *   go/roadmap.md     -> topic "go"
 *   scratch.md        -> no topic
 *
 * That last case matters. A root-level post used to become its own "topic",
 * which meant the topic route and the post route both claimed /blog/scratch/
 * and the post lost. Requiring two segments makes that collision impossible
 * rather than merely absent.
 */
export function topicOf(post: Post): string | undefined {
	if (post.data.topic) return post.data.topic;

	const parts = post.id.split('/');
	return parts.length >= 2 ? parts[0] : undefined;
}

/**
 * Which series a post belongs to, or undefined if it sits directly under its
 * topic. Needs three segments from the path, so `go/roadmap.md` is a post in
 * the "go" topic rather than a one-post series called "roadmap".
 */
export function seriesOf(post: Post): string | undefined {
	if (post.data.series) return post.data.series;

	const parts = post.id.split('/');
	return parts.length >= 3 ? parts[1] : undefined;
}

/**
 * Reading order: explicit `order` first, then oldest-to-newest. Posts without
 * an `order` sort after those that have one, then fall back to pubDate.
 */
export function byReadingOrder(a: Post, b: Post): number {
	const ao = a.data.order ?? Number.POSITIVE_INFINITY;
	const bo = b.data.order ?? Number.POSITIVE_INFINITY;

	if (ao !== bo) return ao - bo;

	return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
}

/** Feed order: newest first. */
export function byNewest(a: Post, b: Post): number {
	return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

/**
 * Rough minutes-to-read, from the raw markdown body at 200 words per minute.
 * Deliberately coarse — it's a signal about length, not a measurement.
 */
export function readingTime(post: Post): number {
	const words = String(post.body ?? '')
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;

	return Math.max(1, Math.round(words / 200));
}

/**
 * The posts either side of this one within its own series, in reading order.
 * Posts that sit directly under a topic get each other as neighbours, since
 * they share an (undefined) series.
 */
export function neighbours(
	all: Post[],
	post: Post,
): { prev?: Post; next?: Post } {
	const topic = topicOf(post);
	if (!topic) return {};

	const series = seriesOf(post);

	const siblings = all
		.filter((p) => topicOf(p) === topic && seriesOf(p) === series)
		.sort(byReadingOrder);

	const i = siblings.findIndex((p) => p.id === post.id);
	if (i === -1) return {};

	return { prev: siblings[i - 1], next: siblings[i + 1] };
}

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
			// Split on the first slash only. A topic is one path segment, so the
			// remainder is the series name even if it somehow contained a slash.
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
 * Blogs that contain views and opinions, not part of documentation.
 * Newest first.
 */
export function blogPosts(all: Post[]): Post[] {
	return all.filter((post) => topicOf(post) === 'blogs').sort(byNewest);
}

/**
 * Debugging stories.
 * Newest first.
 */
export function debuggingPosts(all: Post[]): Post[] {
	return all.filter((post) => topicOf(post) === 'debugging').sort(byNewest);
}

/**
 * Posts that belong to a topic but not a series (loose notes).
 */
export function standalonePosts(all: Post[]): Post[] {
	return all.filter((post) => !seriesOf(post) && topicOf(post) !== 'blogs' && topicOf(post) !== 'debugging').sort(byReadingOrder);
}

/** Words that stay lowercase inside a title, but not at the start of one. */
const MINOR_WORDS = new Set([
	'a',
	'an',
	'and',
	'as',
	'at',
	'but',
	'by',
	'for',
	'in',
	'of',
	'on',
	'or',
	'the',
	'to',
	'vs',
	'with',
]);

/**
 * A folder slug as a human-readable label: `composite-types` -> `Composite
 * Types`, `arrays-and-hashing` -> `Arrays and Hashing`.
 *
 * Display-only — nothing routes on this, so it can be changed freely.
 */
export function labelOf(slug: string): string {
	return slug
		.split('-')
		.map((word, i) =>
			i > 0 && MINOR_WORDS.has(word)
				? word
				: word.charAt(0).toUpperCase() + word.slice(1),
		)
		.join(' ');
}
