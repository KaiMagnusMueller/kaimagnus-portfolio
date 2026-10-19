---
title: Retiring Figma components without breaking files
datePublished: 2024-12-10
draft: true
tags:
    - figma
    - design-systems
---

When a component update isn't backwards compatible, don't edit it in place. Instead:

1. Duplicate the component and rename the old one with a prefix like 🕸️, so it's obviously outdated.
2. Make your changes to the new one and publish.
3. Mark the old component as **Hide when publishing**. It shows up as "removed" in the library publish panel and won't appear in design files anymore.

Note: If at least one instance of the old component is still present on a page, it will still show up in searches, that's why renaming it before is important
