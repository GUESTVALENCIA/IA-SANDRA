# Offline Mode Enhancement for Sandra Desktop

This folder contains updated Electron main process files that add a degraded **Offline Mode** to the Sandra Desktop application.  The goal is to ensure the app continues to provide a basic interface and clear feedback when the network is unavailable, which is critical for emergency use cases.

## Key Features

- **Overlay Notification:** An overlay appears when `navigator.onLine` reports `false`.  It informs the user that the app is offline and that certain functions may not be available.
- **Automatic Detection:** Listeners for the `online` and `offline` events are injected into the loaded HTML, so the overlay appears and disappears automatically.
- **Non-Intrusive:** The overlay is only created once if it does not exist; subsequent page loads reuse it.
- **Self‑Contained:** Modifications live entirely in the Electron main process; no changes are required to the HTML files or their content.

## Files

- `electron-main.js`: Replacement for the original `electron-main.js`, updated to inject the offline overlay after loading `sandra-desktop.html`.
- `electron-main-v2.js`: Replacement for `electron-main-v2.js`, updated similarly for the v2 interface.
- `README.md`: This document, summarizing the changes.

## Integration Steps

1. Copy the appropriate main file (`electron-main.js` or `electron-main-v2.js`) into your project’s root or wherever the Electron entry point resides, replacing the existing version.
2. Run the Electron app as usual (`npm run electron`), and test by disconnecting your network to see the offline overlay in action.
3. If you have more entry points or variations, apply the same injection pattern in their `createWindow()` method.

These changes complete the **emergency-ready offline mode** for Sandra and support reliable operation even when no network connection is available.
