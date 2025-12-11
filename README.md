# NX Downloader

NX Downloader is a modern desktop application built with Electron, designed to search, preview, and extract download links from roms websites. 

The app performs intelligent scraping, displaying game covers, organizing download blocks (Base Game, DLC, Updates) and providing direct download links.

The goal of this project is to provide a fast, safe, and convenient desktop tool for accessing roms content without distractions — ideal for users who want clean access to the download information.

## 🔑 Key Features
- 🔍 Fast game search with cover preview
- 🤔 Provider selector
- 📦 Organized download blocks (Base Game, DLC, Updates, etc.)
- 🔗 Host detection (1Fichier, MegaUp, FreeDL, etc.)
- 📋 Copy link button for quick access
- ⚡ Modern, dark-mode UI inspired by game launchers
- 🚀 Animated splash screen on startup
- 🔄 Auto-update support via GitHub Releases
- 🖥️ Multi-platform builds for Windows (.exe), macOS (.dmg), and Linux (.AppImage / .deb)
- 🚫 No ads, no popups, no redirects — clean extraction of download information

## 🌐 Currently supported websites
| Name | Search | Extract links |
| -------- | ------- | -------- |
| NxBrew | ✅ | ✅ |
| Romslab | ✅ | ✅ |
| NSWPedia | ✅ | ✅ |
| Romsim | ✅ | ✅ |
| Ziperto | ✅ | ✅ |
| SwitchROM | ✅ | ✅ |
| SwitchRoms - cloudfare protected | ❌ | ❌ |
| APKMARA - cloudfare protected | ❌ | ❌ |

You can open an [issue](https://github.com/Just1diaxx/NXdownloader/issues) to suggest websites!

The application provides a significantly smoother experience compared to browsing the websites manually, removing unnecessary ads, clicks, pages, and popup interruptions.

## 🧩 Technologies Used
- Electron (cross-platform desktop framework)
- electron-builder (packaging + installers)
- electron-updater (auto-updates)
- Axios (HTTP requests)
- Cheerio (web scraping)
- Node.js
- HTML / CSS / JavaScript

## 📥 Download

Compiled builds for Windows, MacOS and Linux are available in:

👉 GitHub --> Releases

## ⚙️ How to build
- Download node.js by their official website (https://nodejs.org/en/download)
- Download the project by this page
- Open it with a terminal
- Execute `npm i` (Installs all dependencies from package.json)
- Execute `npm run build` (The installer/executable will appear inside the `/dist` directory.)
