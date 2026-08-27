import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),

			// Taxonomy. Optional because the folder path still says the same thing
			// for every existing post — see src/lib/posts.ts for how the two
			// resolve against each other. Set these when the folder can't or
			// shouldn't carry the meaning.
			topic: z.string().optional(),
			series: z.string().optional(),

			// Position within a series. Wins over pubDate when present, so a
			// curriculum can be reordered without back-dating anything.
			order: z.number().optional(),

			tags: z.array(z.string()).default([]),

			// Excluded from production builds; still served by `astro dev` so a
			// half-finished post can live in the repo and be previewed locally.
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };
