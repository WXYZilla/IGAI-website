# IGAI website — GitHub Pages

This folder contains the latest five-page Igai website, including the updated blueprint, home-only model rotation, and static camera. No build step, API key, or backend is required.

## Publish

1. Create a GitHub repository, for example `igai-website`. A public repository is the simplest option for GitHub Pages on GitHub Free.
2. Upload the CONTENTS of this folder to the repository's `main` branch. Do not upload the ZIP itself or place this entire folder inside another folder. `index.html` must appear at the repository root, alongside `app.js`, `style.css`, `assets/`, `vendor/`, and `.nojekyll`.
3. Open the repository's Settings > Pages.
4. Under Build and deployment, select Deploy from a branch.
5. Select `main` and `/(root)`, then Save.
6. Wait for GitHub Pages to finish publishing. Open the website URL shown in Settings > Pages, typically `https://YOUR-USERNAME.github.io/igai-website/`.
7. Ensure Enforce HTTPS is enabled where that option is available.

If the upload interface omits the hidden `.nojekyll` file, create a file with that exact name in the repository root. It can be empty. Future changes committed to the publishing branch will update the site.

## Local preview

Open this folder in Visual Studio Code and use Live Server on `index.html`. Alternatively, if Python is installed, run `python -m http.server 8000` from this folder and visit `http://localhost:8000`.

Opening index.html directly as a file may block the JavaScript modules used by the 3D model.

## Files and privacy

Everything published with a public website is downloadable, including the original artwork and PDFs in `assets/`. The supplied PDFs and artwork include the project's author attribution and may include identifying information. Review those documents before making the repository public. There are no Sites repository credentials or hosting archives in this folder.

Three.js is bundled locally. The existing Elza font stylesheet loads over HTTPS from Adobe Fonts; if it is unavailable, the site uses fallback fonts. Moving to GitHub Pages does not remove that external font dependency.

The website is a static presentation. HTTPS protects traffic in transit; it does not make all content, external dependencies, or account settings inherently secure.

GitHub documentation:
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
