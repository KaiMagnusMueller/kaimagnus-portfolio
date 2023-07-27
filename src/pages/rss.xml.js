import { SITE } from '@config';
import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export async function get(context) {
	const projects = await getCollection('projects', ({ data }) => !data.draft);
	const articles = await getCollection('articles', ({ data }) => !data.draft);

	let _blog = [...projects, ...articles];
	_blog.sort(
		(a, b) =>
			Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
			Math.floor(new Date(a.data.pubDatetime).getTime() / 1000)
	);

	let _items = _blog.map((elem) => ({
		link: elem.collection + '/' + elem.slug,
		title: elem.data.title,
		author: elem.data.author,
		description: elem.data.description,
		pubDate: new Date(elem.data.pubDatetime),
		content:
			elem.data.description +
			'<blockquote>Note: This feed is still in beta until I figure out how to properly render .mdx content in Astro.</blockquote><br> in the meantime, ' +
			'<a href="' +
			elem.collection +
			'/' +
			elem.slug +
			'">view the full post here</a>',
		...elem.data,
	}));

	return rss({
		// `<title>` field in output xml
		title: `${SITE.title}`,
		// `<description>` field in output xml
		description: `${SITE.desc}`,
		// Pull in your project "site" from the endpoint context
		// https://docs.astro.build/en/reference/api-reference/#contextsite
		site: context.site,
		// Array of `<item>`s in output xml
		// See "Generating items" section for examples using content collections and glob imports
		items: _items,
		// (optional) inject custom xml
		customData: `<language>en-us</language>`,
	});
}
