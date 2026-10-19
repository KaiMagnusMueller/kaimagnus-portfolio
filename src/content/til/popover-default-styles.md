---
title: HTML popovers come with surprising default styles
datePublished: 2026-02-18
draft: true
tags:
    - css
    - html
---

The native `popover` attribute is great for menus and tooltips, but browsers style it more than you'd expect:

- They add a border, padding and `margin: auto` to center it on screen. Reset these before positioning it yourself. ([Firefox's defaults](https://searchfox.org/mozilla-central/source/layout/style/res/html.css) are a good reference.)
- Don't touch its `display` property. Browsers use it to show and hide the popover.
- While it's closed, it has no dimensions, so `getBoundingClientRect()` returns zeros. Measure it after it opens.
