import { render } from 'astro:content';
import type { CollectionEntry, CollectionKey } from 'astro:content';

export async function getHeadingsRender(entries: CollectionEntry<CollectionKey>[]) {
    return await Promise.all(
        entries.map((entry) =>
            render(entry).then((data) => {
                const headings = data.headings;
                // Add the title of the page manually, because they are not part of the .md files
                headings.unshift({ depth: 1, text: entry.data.title, slug: entry.slug });
                return data.headings;
            }),
        ),
    );
}
