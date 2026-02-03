# FRACTRAN Animator

A visual, interactive tool for exploring FRACTRAN programs - an esoteric programming language invented by John Conway that uses fraction multiplication to perform computation.

## Features

- **Interactive Visualization**: Watch FRACTRAN programs execute step-by-step with animated register updates
- **Multiple Presets**: Includes classic FRACTRAN programs (Addition, Multiplication, Primes generator, etc.)
- **Custom Programs**: Write and test your own FRACTRAN programs
- **Playback Controls**: Step through execution, play/pause, adjust speed
- **Event Logging**: Track program execution with detailed event history
- **Responsive Design**: Works on desktop and mobile devices

## Run Locally

**Prerequisites:** Node.js (v18 or higher recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/fractran-animator.git
   cd fractran-animator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Deploy to GitHub Pages

This project is configured for easy deployment to GitHub Pages.

### One-time Setup

1. Create a new GitHub repository named `fractran-animator`
2. Push your code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fractran-animator.git
   git push -u origin main
   ```

3. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Click Save

### Deploy

Run the deploy script to build and publish:

```bash
npm run deploy
```

This will:
1. Build the production version of the app
2. Push the built files to the `gh-pages` branch
3. GitHub Pages will automatically serve your site at `https://YOUR_USERNAME.github.io/fractran-animator/`

### Alternative: Automatic Deployment with GitHub Actions

For automatic deployment on every push to main, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

Then in Settings → Pages, change Source to "GitHub Actions".

## Project Structure

```
fractran-animator/
├── components/         # React components
│   ├── Configuration.tsx
│   ├── Controls.tsx
│   ├── EventLog.tsx
│   ├── ProgramPanel.tsx
│   └── RegisterBoard.tsx
├── services/          # Core logic
│   └── fractranLogic.ts
├── App.tsx            # Main application component
├── constants.ts       # Preset programs and primes
├── types.ts           # TypeScript type definitions
├── index.tsx          # Application entry point
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
└── package.json       # Dependencies and scripts
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via CDN)
- **lucide-react** - Icons

## About FRACTRAN

FRACTRAN is a Turing-complete esoteric programming language invented by mathematician John Conway. A FRACTRAN program is an ordered list of positive fractions. The program operates on a single positive integer by multiplying it by the first fraction in the list that produces another integer, then repeating with the result.

Despite its simplicity, FRACTRAN can perform any computation that a traditional computer can.

## License

MIT
