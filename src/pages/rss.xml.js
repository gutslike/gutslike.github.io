import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { byNewest, getPosts } from '../lib/posts';

export async function GET(context) {
	// Feed convention is newest first. getCollection returns file-path order,
	// which put "Azure Day 1" at the top of the feed. getPosts also keeps
	// drafts out.
	const posts = (await getPosts()).sort(byNewest);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		// Listed explicitly rather than spreading ...post.data, which pushed the
		// resolved heroImage object into every feed item.
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
		})),
	});
}
