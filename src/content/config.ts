import { defineCollection } from 'astro:content';
import { projectSchema, articleSchema, workSchema } from './_schemas';

const projects = defineCollection({
	schema: projectSchema,
});
const articles = defineCollection({
	schema: articleSchema,
});

const work = defineCollection({
	schema: workSchema,
});

export const collections = {
	projects: projects,
	articles: articles,
	work: work,
};
