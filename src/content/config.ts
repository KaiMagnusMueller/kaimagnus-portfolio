import { defineCollection } from 'astro:content';
import { projectSchema, articleSchema } from './_schemas';

const projects = defineCollection({
	schema: projectSchema,
});
const articles = defineCollection({
	schema: articleSchema,
});

export const collections = { projects, articles };
