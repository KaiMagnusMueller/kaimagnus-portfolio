import { z } from 'astro:content';

export const projectSchema = z
    .object({
        author: z.string().optional(),
        datePublished: z.date(),
        title: z.string(),
        draft: z.boolean().optional(),
        featured: z.array(z.string()).default(['']),
        tags: z.array(z.string()).default(['others']),
        ogImage: z.string().optional(),
        description: z.string(),
        semesterDate: z.string().optional(),
        course: z.string().optional(),
        team: z.array(z.string()).optional(),
    })
    .strict();

export type ProjectFrontmatter = z.infer<typeof projectSchema>;

export const articleSchema = z
    .object({
        author: z.string().optional(),
        datePublished: z.date(),
        title: z.string(),
        draft: z.boolean().optional(),
        featured: z.array(z.string()).default(['']),
        tags: z.array(z.string()).default(['others']),
        ogImage: z.string().optional(),
        description: z.string(),
    })
    .strict();

export type ArticleFrontmatter = z.infer<typeof articleSchema>;

export const workSchema = z
    .object({
        author: z.string().optional(),
        customer: z.string().optional(),
        datePublished: z.date(),
        description: z.string(),
        draft: z.boolean().optional(),
        employer: z.string().optional(),
        featured: z.array(z.string()).default(['']),
        ogImage: z.string().optional(),
        projectEndDate: z.date().optional(),
        projectStartDate: z.date().optional(),
        tags: z.array(z.string()).default(['others']),
        title: z.string(),
    })
    .strict();

export type WorkFrontmatter = z.infer<typeof workSchema>;
