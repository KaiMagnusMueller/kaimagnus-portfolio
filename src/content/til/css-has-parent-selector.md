---
title: CSS :has() works as a parent selector
datePublished: 2026-10-08
draft: true
tags:
    - css
---

`:has()` lets you style an element based on its children. For example, a card that contains an image:

```css
.card:has(img) {
    grid-template-rows: auto 1fr;
}
```
