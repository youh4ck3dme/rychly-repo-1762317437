# TODO Build Guide

This document outlines the steps to ensure a successful build and deployment for your project.

### Key Steps to Pass the Build:

1. **Add npm `lint` Script:**
   - Ensure that the `package.json` file includes a `lint` script to check code style.
   - Suggested content for the script:
     ```json
     "scripts": {
       "lint": "eslint . --ext .tsx,.ts,.js,.jsx"
     }
     ```

2. **Automate Code Formatting:**
   - Install Prettier and ESLint as devDependencies to enforce code formatting rules automatically.
   ```bash
   npm install prettier eslint eslint-config-prettier eslint-plugin-prettier --save-dev
   ```
   - Add the following npm script to automate fixes:
     ```json
     "scripts": {
       "format": "npx prettier --write . && npx eslint . --fix"
     }
     ```
   - Run Prettier with:
     ```bash
     npm run format
     ```

3. **Fix Code Style Issues:**
   - Two files have been identified with formatting problems:
     - `hair-changer/components/VirtualTryOn.tsx`
     - `hair-changer/vite.config.ts`
   - Run the following command locally to automatically fix these files:
     ```bash
     npx prettier --write .
     npx eslint . --fix
     ```

4. **Update GitHub Actions Workflow:**
   - Modify the `.github/workflows/ci-cd.yml` file to include a code formatting step during the pipeline:
     ```yaml
     - name: Format and Lint Code
       run: npm run format
     ```

5. **Set Environment Variables:**
   - Ensure the following environment variables are properly set for the workflow:
     ```yaml
     env:
       NODE_ENV: production
       NODE_VERSION: 18.x
     ```

6. **Deploy with `Vercel`:**
   - Use the following command for a seamless deployment:
     ```bash
     vercel --prod
     ```

### Notes:
- Ensure all dependencies are installed before running any script or workflow (`npm install`).
- Test changes locally using the `vercel dev` command.

By following these steps, your project is guaranteed to pass the build and deploy successfully.
