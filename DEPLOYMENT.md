# Deployment Guide

## Quick Start (GitHub Pages)

### Option 1: Manual Deployment

1. **Create a GitHub repository**:
   ```bash
   cd /Users/adj/Documents/Code/app-development/fractran-animator
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a new repository on GitHub** named `fractran-animator`

3. **Push your code**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fractran-animator.git
   git push -u origin main
   ```

4. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

5. **Deploy**:
   ```bash
   npm run deploy
   ```

6. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

Your site will be live at: `https://YOUR_USERNAME.github.io/fractran-animator/`

### Option 2: Automatic Deployment with GitHub Actions

This repository includes a GitHub Actions workflow that automatically deploys on every push to main.

1. **Follow steps 1-3 from Option 1** to create and push your repository

2. **Enable GitHub Pages with GitHub Actions**:
   - Go to Settings → Pages
   - Source: GitHub Actions
   - Save

3. **Push any changes to main**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

The GitHub Action will automatically build and deploy your site!

## Configuration

### Custom Domain

If you want to use a custom domain:

1. Add a `public/CNAME` file with your domain:
   ```bash
   mkdir -p public
   echo "yourdomain.com" > public/CNAME
   ```

2. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/',  // Change from '/fractran-animator/'
     // ... rest of config
   });
   ```

3. Configure your DNS provider to point to GitHub Pages

### Different Repository Name

If you use a different repository name, update the `base` path in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/YOUR-REPO-NAME/',
  // ... rest of config
});
```

## Local Development

```bash
npm install    # Install dependencies
npm run dev    # Start dev server at http://localhost:3000
npm run build  # Build for production
npm run preview # Preview production build
```

## Troubleshooting

### Assets not loading (404 errors)

Make sure the `base` path in `vite.config.ts` matches your repository name:
- Repository: `https://github.com/username/fractran-animator`
- Base path should be: `base: '/fractran-animator/'`

### GitHub Actions deployment fails

1. Check that you've selected "GitHub Actions" as the source in Settings → Pages
2. Verify the workflow has the correct permissions (already configured in `.github/workflows/deploy.yml`)
3. Check the Actions tab for detailed error logs

### Manual deployment (`npm run deploy`) fails

1. Make sure you have `gh-pages` installed: `npm install`
2. Ensure you have a remote named `origin` pointing to your GitHub repo
3. Check that you have push permissions to the repository
