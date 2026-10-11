import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export async function getTils(): Promise<CollectionEntry<'til'>[]> {
    const entries = await getCollection('til', ({ data }) => {
        return import.meta.env.PROD ? data.draft !== true : true;
    });
    return entries.sort((a, b) => b.data.datePublished.getTime() - a.data.datePublished.getTime());
}

// Tags sorted by number of entries, most used first
export function getTilTags(entries: CollectionEntry<'til'>[]): { tag: string; count: number }[] {
    const counts = new Map<string, number>();
    entries.forEach((entry) => entry.data.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)));
    return [...counts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
