# timesheet

A lightweight timesheet web app that now ships as an installable Progressive Web App.

## Run locally

1. Serve the root folder (for example with `python -m http.server 8000`).
2. Open `http://localhost:8000` in your browser.
3. Use the browser's **Install App/Add to Home Screen** option to install the PWA.

## Offline support

- A service worker precaches the app shell, icons, manifest, and CDN dependencies so the interface and charts work offline.
- Timesheet entries continue to be stored in `localStorage`, so data is available while offline.
