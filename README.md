# Kai Magnus Müller Portfolio Website

Built with [Astro](https://astro.build) and some [Svelte](https://svelte.dev) components, hosted on [Vercel](https://vercel.com/).

## ⚙️ TODO: Document components

From the Astro starter readme:

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Environment Variables

Vite automatically provides the env vars `MODE`, `DEV` and `PROD` [see Vite docs](https://vitejs.dev/guide/env-and-mode). To filter draft posts during production builds (via `npm run preview/build`), `index.astro` uses the following shorthand:

```
return import.meta.env.PROD ? data.draft !== true : true;
```
