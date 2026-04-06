# 🗺️ Minecraft Progress Tracker

A modern, ultra-fast web app to track your Minecraft advancement progress. Built with Angular 21, Tailwind CSS, and TypeScript.

![License](https://img.shields.io/badge/license-MIT-emerald)
![Angular](https://img.shields.io/badge/Angular-21-red)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-blue)

---

## ✨ Features

- **Drag & Drop** — Drop your `advancements.json` file and instantly see your progress.
- **100% Client-Side** — Your data never leaves your browser. No accounts, no servers.
- **Persistent State** — Progress is saved in `localStorage` across sessions.
- **Seed Integration** — Enter your world seed and jump directly to Chunkbase for map exploration.
- **Modern Craft UI** — A clean, beautiful interface inspired by Minecraft's palette.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- npm (v10+)

### Installation

```bash
# Clone the repository
git clone https://github.com/SweetMeSoft/Minecradvance.git
cd Minecradvance

# Install dependencies
npm install

# Start the dev server
npm start
```

The app will be available at `http://localhost:4200`.

### How to Use

1. Open Minecraft and locate your world's advancement file:
   - **Windows:** `%appdata%\.minecraft\saves\<world>\advancements\<uuid>.json`
   - **macOS:** `~/Library/Application Support/minecraft/saves/<world>/advancements/<uuid>.json`
   - **Linux:** `~/.minecraft/saves/<world>/advancements/<uuid>.json`
2. Drag and drop the `.json` file into the app.
3. Explore your progress across Biomes, Advancements, Nether, End, and more!
4. Optionally enter your world seed to get Chunkbase map links.

## 🏗️ Tech Stack

| Technology | Purpose |
|---|---|
| **Angular 21** | Standalone components, Signals, Control Flow |
| **Tailwind CSS** | Utility-first styling with custom Minecraft palette |
| **TypeScript** | Type-safe development |
| **localStorage** | Client-side persistence |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

## ☕ Support

If you find this tool useful, consider supporting the project:

- [Ko-fi](https://ko-fi.com/) — Buy me a Speed Potion ☕
- ⭐ Star this repository!

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
