import { defineConfig } from 'astro/config';

// https://astro.build/config
import svelte from '@astrojs/svelte';

// https://astro.build/config
import mdx from '@astrojs/mdx';

// https://astro.build/config
import image from '@astrojs/image';

import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { autolinkConfig } from './plugins/rehype-autolink-config';

// https://astro.build/config
export default defineConfig({
	site: 'https://kaimagnus-portfolio-git-dev-kaimagnusmueller.vercel.app/',
	integrations: [
		svelte(),
		mdx(),

		image({
			serviceEntryPoint: '@astrojs/image/sharp',
		}),
	],
	vite: {
		plugins: [],
	},

	markdown: {
		rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, autolinkConfig]],
	},
});
