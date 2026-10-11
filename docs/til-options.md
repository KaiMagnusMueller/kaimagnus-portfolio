# TIL section: options

Notes from exploring how to add a "Today I Learned" section for short snippets, facts and links.
The branch implements **Option A** (with the stream index); the rest is here for comparison.

## Requirements

- Short entries: code snippets, facts, links
- Detail page per entry
- Tags as categories, with a page per tag
- Homepage preview of the ~5 most recent entries

## Where the content lives

### A. New `til` collection (implemented)

`src/content/til/*.md(x)` with its own, lighter schema (`src/content/_schemas.ts`):

| Field           | Notes                                                          |
| --------------- | -------------------------------------------------------------- |
| `title`         | required, phrased as the thing learned                          |
| `datePublished` | required                                                        |
| `tags`          | required, at least one, lowercase slugs (`css`, `figma-api`)    |
| `description`   | optional; falls back to the title for meta tags and aria-labels |
| `link`          | optional; for link posts, rendered as `hostname ↗`             |
| `draft`         | optional, same behaviour as other collections                  |

- Pro: fits the existing pattern (one collection per section), schema can be minimal, no `author`/`ogImage`/`featured` noise.
- Pro: writing a new entry is "create a file, add 4 lines of frontmatter".
- Con: one more collection to wire up in places that list "all content" (RSS, highlights).

### B. Reuse `articles` with a `kind: 'til'` field

- Pro: no new collection, RSS and lists work immediately.
- Con: articles need `description`, have heavier layouts, and every article list must filter TILs out. Mixing short notes into "Writing" changes its character.

### C. Single data file (`til.yaml` / `til.json` with the `file()` loader)

- Pro: very fast to add entries, everything in one place.
- Con: code snippets and Markdown in YAML strings are painful; MDX components are impossible. Detail pages still work, but writing is worse.

**Recommendation:** A. It is the least surprising given the codebase, and it keeps TILs light.

## Entry types

Snippets, facts and links could be modelled as:

1. **Just tags + optional `link`** (implemented). A link post is any entry with `link`. Simple, no extra field to maintain.
2. **`type: 'snippet' | 'fact' | 'link'` enum.** Lets you render each type differently (e.g. link posts show a favicon, snippets get a monospace preview on the homepage). Worth adding once you notice you want different layouts; easy to add later with a default.

## Index page

1. **Stream** (implemented at `/til`): entries rendered in full, newest first. TILs are short, so reading them inline is the main use; the title links to the detail page for sharing.
2. **List** like `/articles` (title + date). Compact, but makes you click for two sentences of content.
3. **Grouped by tag or month.** Nice once there are 50+ entries; can be added on top of the stream later.

Pagination is not needed until there are many entries; Astro's `paginate()` can be added to `/til` then.

## Tags

- Implemented: `/til/tags/[tag]` pages generated from the tags in use, tag list on the index ordered by frequency, `#tag` links on every entry.
- Tags are restricted to lowercase slugs by the schema so URLs and duplicates (`CSS` vs `css`) stay clean.
- Alternative: client-side filtering on `/til` (no extra pages). Less shareable, needs JS; not chosen.
- Alternative: a fixed `z.enum([...])` of categories. Stricter and gives typos a build error, but you have to edit the schema for every new category.

## Homepage preview

- Implemented: a "Today I Learned" section after "Writing", using the existing `CollectionList` with the 5 newest entries. The heading links to `/til`. Hidden when there are no published entries.
- Alternative: a custom compact card list that shows the first lines of each entry, which would better show off the "short" nature. More design work; the table keeps the homepage consistent.
- TILs are deliberately left out of "Highlights" (`featured`) since they are not portfolio pieces.

## Open questions / follow-ups

- **RSS:** add TILs to `rss.xml` or a separate `til/rss.xml`? TIL readers and portfolio readers may be different audiences, so a separate feed seems better.
- **OG images:** TILs have no `ogImage`; a generated one (satori is already a dependency) would make shared links look better.
- **Naming:** "TIL", "Today I Learned", "Notes" or "Snippets"? The URL `/til` is short either way.
- The three sample entries in `src/content/til/` are `draft: true`, so they show up in `astro dev` but not in production. Replace or delete them before publishing.
