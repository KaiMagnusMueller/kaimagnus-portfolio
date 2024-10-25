import { defineConfig } from 'astro/config';

// https://astro.build/config
import svelte from '@astrojs/svelte';

// https://astro.build/config
import mdx from '@astrojs/mdx';

import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { autolinkConfig } from './plugins/rehype-autolink-config';
import vercel from '@astrojs/vercel/static';

// https://astro.build/config
export default defineConfig({
    adapter: vercel({
        webAnalytics: {
            enabled: true,
        },
    }),
    site: 'https://kaimagnus.de/',
    integrations: [svelte(), mdx()],
    vite: {
        plugins: [],
    },

    compressHTML: false,
    devToolbar: {
        enabled: false,
    },

    image: {
        remotePatterns: [{ protocol: 'https' }],
    },

    markdown: {
        shikiConfig: {
            wrap: false,
            theme: 'github-dark',
            defaultColor: false,
        },
        rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, autolinkConfig]],
    },
});
