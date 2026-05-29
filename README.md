# MELENT CARE

Professional web application for MELENT CARE.

This repository is dedicated to the company website / application interface only. It is not related to the exhibition booth, carpentry drawings, printing files, or booth execution package.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm install
npm run build
```

The production output folder is:

```txt
dist
```

## Deployment Settings

Use the following settings on Vercel, Netlify, or any static hosting platform:

- Framework: Vite
- Install Command: npm install
- Build Command: npm run build
- Output Directory: dist
- Node Version: 20

Do not use Webpack for this project. If the platform asks to install `webpack-cli`, the build command is incorrect and must be changed to `npm run build`.
