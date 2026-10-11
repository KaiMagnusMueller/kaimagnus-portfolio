---
title: Content collection IDs come from the file name
datePublished: 2026-10-03
draft: true
tags:
    - astro
    - content-collections
---

With the `glob()` loader, `entry.id` is the slugified file path without the extension, so `My Post.mdx` becomes `my-post`. Set a `slug` in the frontmatter to override it.
