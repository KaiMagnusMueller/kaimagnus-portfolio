import { slug as slugger } from 'github-slugger';
import type { ProjectFrontmatter, ArticleFrontmatter } from '@content/_schemas';

export const slugifyStr = (str: string) => slugger(str);

const slugify = (post: ProjectFrontmatter | ArticleFrontmatter) =>
	post.postSlug ? slugger(post.postSlug) : slugger(post.title);

export const slufigyAll = (arr: string[]) => arr.map((str) => slugifyStr(str));

export default slugify;
