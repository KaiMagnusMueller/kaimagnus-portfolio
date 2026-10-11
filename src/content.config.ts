import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema, articleSchema, workSchema, tilSchema } from './content/_schemas';

const projects = defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
    schema: projectSchema,
});
const articles = defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/articles' }),
    schema: articleSchema,
});

const work = defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
    schema: workSchema,
});

const til = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/til' }),
    schema: tilSchema,
});

export const collections = {
    projects: projects,
    articles: articles,
    work: work,
    til: til,
};
