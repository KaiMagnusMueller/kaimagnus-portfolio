import { z } from 'astro:content';

export const projectSchema = z
	.object({
		author: z.string().optional(),
		pubDatetime: z.date(),
		title: z.string(),
		featured: z.boolean().optional(),
		draft: z.boolean().optional(),
		tags: z.array(z.string()).default(['others']),
		ogImage: z.string().optional(),
		description: z.string(),
		semesterDate: z.string(),
		course: z.string(),
	})
	.strict();

export type ProjectFrontmatter = z.infer<typeof projectSchema>;

export const articleSchema = z
	.object({
		author: z.string().optional(),
		pubDatetime: z.date(),
		title: z.string(),
		featured: z.boolean().optional(),
		draft: z.boolean().optional(),
		tags: z.array(z.string()).default(['others']),
		ogImage: z.string().optional(),
		description: z.string(),
	})
	.strict();

export type ArticleFrontmatter = z.infer<typeof articleSchema>;
