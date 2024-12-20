import { slufigyAll } from './slugify';
import type { CollectionEntry } from 'astro:content';

const getPostsByTag = (posts: CollectionEntry<any>[], tag: string) =>
    posts.filter((post) => slufigyAll(post.data.tags).includes(tag));

export default getPostsByTag;
