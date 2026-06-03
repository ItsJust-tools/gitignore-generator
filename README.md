# .gitignore Generator

[![Live](https://img.shields.io/badge/Live-gitignore.itsjust.tools-2ea043?style=for-the-badge&logo=vercel&logoColor=white)](https://gitignore-generator.itsjust.tools)
[![CI](https://github.com/ItsJust-tools/gitignore-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/ItsJust-tools/gitignore-generator/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Generate `.gitignore` files from **60+ templates** — combine languages, frameworks, IDEs, OS rules, platforms, and custom entries. All client-side, privacy-first, zero dependencies on external services.

**Live at:** [gitignore-generator.itsjust.tools](https://gitignore-generator.itsjust.tools)

## What is this?

Stop searching for the perfect .gitignore or pasting together rules from half-remembered projects. The .gitignore Generator gives you a single interface to:

- ✅ Pick templates for **languages** (Node.js, Python, Rust, Go, Java…)
- ✅ Pick templates for **frameworks** (React, Next.js, Django, Rails, Laravel…)
- ✅ Pick templates for **IDEs & editors** (VS Code, JetBrains, Vim, Emacs, Xcode…)
- ✅ Pick templates for **OS-specific files** (macOS .DS_Store, Windows Thumbs.db, Linux…)
- ✅ Pick templates for **platforms & tools** (Docker, Terraform, Flutter, Unity, Godot…)
- ✅ Add **custom rules** inline
- ✅ **Copy** to clipboard or **download** directly
- ✅ **Export** as `.txt` or structured `.json`
- ✅ **Share** your configuration via URL
- ✅ **100% client-side** — your selections never leave your browser

## Features

- **60+ hand-curated templates** — each containing the real rules you actually need
- **Category filters** — browse by Language, Framework, IDE, or OS
- **Search** — quickly find any template
- **Multi-select** — combine any number of templates
- **Custom rules** — add your own `.gitignore` entries
- **Copy to clipboard** with visual feedback
- **Download** as `.gitignore` file
- **Export** as `.json` (structured) or `.txt` (plain text)
- **Share via URL** — encode your full selection into the URL
- **Dark mode** — automatic system preference detection + manual toggle
- **Export to PNG/JPEG/WebP/PDF** for screenshots and documentation
- **Undo/redo** for accidental changes
- **PWA-ready** — install as an app
- **Accessible** — keyboard navigable, screen reader friendly

## Quick Start (Development)

```bash
git clone https://github.com/ItsJust-tools/gitignore-generator.git
cd gitignore-generator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the tool.

## Compatibility

| Requirement | Version   |
| ----------- | --------- |
| Node.js     | >= 22.0.0 |
| npm         | >= 10.0.0 |
| pnpm        | >= 9.0.0  |

## Scripts

| Command                      | Description                          |
| ---------------------------- | ------------------------------------ |
| `npm run dev`                | Start dev server (Turbopack)         |
| `npm run build`              | Build core package + Next.js         |
| `npm test`                   | Run Vitest unit tests                |
| `npm run test:e2e`           | Run Playwright E2E tests             |
| `npm run lint`               | Run ESLint                           |
| `npm run format`             | Format with Prettier                 |

## Template Categories

### Languages (21)
Node.js, Python, Java, Rust, Go, Ruby, .NET, C, C++, Swift, Kotlin, Scala, Elixir, Haskell, Julia, Lua, Perl, R, MATLAB, Zig, Crystal

### Frameworks (13)
React, Next.js, Vue, Nuxt, Svelte, Angular, Gatsby, Eleventy, Django, Ruby on Rails, Laravel, Spring Boot, Sass

### IDEs & Editors (6)
VS Code, JetBrains, Vim, Emacs, Visual Studio, Xcode

### Operating Systems (3)
macOS, Windows, Linux

### Platforms & Tools (14)
Android, Flutter, Deno, Bun, Solid.js, Docker, Terraform, Ansible, Unity, Unreal Engine, Godot, Jekyll, Hugo, GitBook

## How It Works

1. **Browse** templates using category tabs or search
2. **Select** the ones that match your project
3. **Add custom rules** if you need project-specific entries
4. **Click "Generate .gitignore"** — your combined file appears on screen
5. **Copy or download** — paste into your project root

Everything runs in your browser. No data is sent to any server.

## Deployment

Deploy to Vercel with zero configuration:

```bash
npx vercel
```

Set `NEXT_PUBLIC_URL` to your production URL in your Vercel project settings.

## License

MIT
