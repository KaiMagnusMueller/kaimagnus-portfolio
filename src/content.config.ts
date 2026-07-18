import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema, articleSchema, workSchema } from './content/_schemas';

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

export const collections = {
    projects: projects,
    articles: articles,
    work: work,
};
