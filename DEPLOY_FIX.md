# MELENT CARE Build Fix

This repository is configured as a Vite application.

Use these commands for deployment:

```bash
npm install
npm run build
```

Deployment settings:

- Framework: Vite
- Install Command: npm install
- Build Command: npm run build
- Output Directory: dist
- Node Version: 20

The build must not run Webpack or npx webpack. If the hosting platform asks for webpack-cli, the build command is wrong and should be changed to npm run build.
