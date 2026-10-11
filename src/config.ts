import type { CollectionKey } from 'astro:content';

export const SITE = {
    // website: 'https://www.kaimagnus.de/',
    author: 'Kai Magnus Müller',
    desc: 'Professional projects and other works of Kai Magnus Müller, interaction designer and hobby developer',
    title: 'Kai Magnus Müller, Interaction Designer',
    titleShort: 'Kai Magnus',
    ogImage: '',
    lightAndDarkMode: true,
};

// Display names per content collection. `satisfies` makes a missing collection a type error.
export const COLLECTIONS = {
    articles: { navTitle: 'Articles', title: 'Articles' },
    work: { navTitle: 'Work', title: 'Professional Work' },
    projects: { navTitle: 'Projects', title: 'University Projects' },
    til: { navTitle: 'TIL', title: 'Today I Learned' },
} satisfies Record<CollectionKey, { navTitle: string; title: string }>;
