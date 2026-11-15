import type { CollectionEntry } from 'astro:content';

const CLOUDINARY_URL = /https:\/\/res\.cloudinary\.com\/[^\s"'()<>]+\.(?:jpe?g|png|webp|gif)/i;

// Image for a card: the entry's ogImage, or else the first Cloudinary image in its body.
// Cloudinary images are requested small and cropped instead of at full size.
export function getCardImage(
	entry: CollectionEntry<'projects' | 'articles' | 'work'>,
	{ width = 560, height = 440 } = {},
): string | undefined {
	const src = entry.data.ogImage ?? entry.body?.match(CLOUDINARY_URL)?.[0];
	if (!src?.includes('res.cloudinary.com')) return src;
	return src.replace('/upload/', `/upload/c_fill,g_auto,w_${width},h_${height},f_auto,q_auto/`);
}
