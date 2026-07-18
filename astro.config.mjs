import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { autolinkConfig } from './plugins/rehype-autolink-config';
import vercel from '@astrojs/vercel';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
    adapter: vercel({
        webAnalytics: {
            enabled: true,
        },
    }),
    site: 'https://kaimagnus.de/',
    integrations: [svelte(), mdx()],
    compressHTML: true, //prevent spaces between inline elements from being deleted
    vite: {
        plugins: [],
    },
    devToolbar: {
        enabled: false,
    },
    image: {
        remotePatterns: [{ protocol: 'https' }],
    },
    markdown: {
        processor: unified({ rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, autolinkConfig]] }), //possibly remove this?
        shikiConfig: {
            wrap: false,
            theme: 'github-dark',
            defaultColor: false,
        },
    },
});
