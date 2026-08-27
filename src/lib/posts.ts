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
