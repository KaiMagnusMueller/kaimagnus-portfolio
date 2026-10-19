---
title: Fixing CSS blur in Safari
datePublished: 2025-02-12
draft: true
tags:
    - css
    - safari
---

Sometimes `filter: blur()` just doesn't render in Safari. I never found out why, but adding any one of these fixes it:

```css
transform: translate3d(0, 0, 0);
will-change: transform;
-webkit-backdrop-filter: blur(32px);
```

The first two push the element onto its own compositing layer, which seems to be what Safari needs.
