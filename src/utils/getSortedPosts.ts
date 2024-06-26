import { collections } from '@content/config';
import type { CollectionEntry } from 'astro:content';

const getSortedPosts = (posts: CollectionEntry<'articles' | 'projects'>[]) =>
    posts
        .filter(({ data }) => !data.draft)
        .sort(
            (a, b) =>
                Math.floor(new Date(b.data.datePublished).getTime() / 1000) -
                Math.floor(new Date(a.data.datePublished).getTime() / 1000)
        );

export default getSortedPosts;
