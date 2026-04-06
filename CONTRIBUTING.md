# Contributing to Minecraft Progress Tracker

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs

1. Check existing [Issues](https://github.com/SweetMeSoft/Minecradvance/issues) to avoid duplicates.
2. Open a new issue with:
   - A clear, descriptive title.
   - Steps to reproduce the bug.
   - Expected vs. actual behavior.
   - Browser and OS information.

### Suggesting Features

Open an issue with the **"Feature Request"** label and describe:
- The problem you're trying to solve.
- Your proposed solution.
- Any alternatives you've considered.

### Submitting Code

1. **Fork** the repository.
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```
3. **Make your changes** following the code style below.
4. **Test** your changes locally (`npm start`).
5. **Commit** with a descriptive message:
   ```bash
   git commit -m "feat: add biome filter search"
   ```
6. **Push** and open a **Pull Request** against `main`.

## Code Style

- Follow Angular's [official style guide](https://angular.dev/style-guide).
- Use standalone components.
- Use Angular Signals for state management.
- Use Tailwind CSS utility classes — avoid inline styles.
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/).

## Updating Advancement Data

When a new Minecraft version adds advancements:

1. Update `src/assets/data/master-advancements.json` with the new entries.
2. Add corresponding icons to `src/assets/icons/`.
3. Submit a PR with the Minecraft version in the title (e.g., *"data: update advancements for 1.21"*).

## Translations

We welcome translations! To add a new language:

1. Create a new JSON file in `src/assets/i18n/` (e.g., `es.json`).
2. Translate all keys from the base `en.json` file.
3. Submit a PR with the language name in the title.

## Code of Conduct

Be respectful and constructive. We're all here because we love Minecraft. 💚
