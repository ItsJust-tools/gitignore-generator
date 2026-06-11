# .gitignore Generator

[![Live](https://img.shields.io/badge/Live-gitignore.itsjust.tools-2ea043?style=for-the-badge&logo=vercel&logoColor=white)](https://gitignore-generator.itsjust.tools)
[![CI](https://github.com/ItsJust-tools/gitignore-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/ItsJust-tools/gitignore-generator/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Generate `.gitignore` files from **60 templates** — combine languages, frameworks, IDEs, OS rules, platforms, and custom entries. All client-side, privacy-first, zero dependencies on external services.

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

- **60 hand-curated templates** — each containing the real rules you actually need
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

### Platforms & Tools (17)
Android, Flutter, Deno, Bun, Solid.js, Gradle, Docker, Terraform, Ansible, Unity, Unreal Engine, Godot, Jekyll, Hugo, GitBook, pnpm, Playwright

## How It Works

1. **Browse** templates using category tabs or search
2. **Select** the ones that match your project
3. **Add custom rules** if you need project-specific entries
4. **Click "Generate .gitignore"** — your combined file appears on screen
5. **Copy or download** — paste into your project root

Everything runs in your browser. No data is sent to any server.

## Common Stack Combinations

Quick pick combinations for popular project types:

| Project Type | Templates to Select |
|---|---|
| **Node.js API** | Node.js + VS Code + macOS/Windows/Linux |
| **React + Vite** | React + Node.js + VS Code + macOS |
| **Next.js App** | Next.js + Node.js + VS Code + macOS/Windows |
| **Python + Django** | Python + Django + VS Code |
| **Spring Boot API** | Spring Boot + Java + Gradle + JetBrains |
| **Rust CLI** | Rust + VS Code + macOS/Windows/Linux |
| **Go Microservice** | Go + Docker + Terraform + VS Code |
| **Flutter Mobile** | Flutter + Android + Xcode + VS Code + macOS |
| **Unity Game** | Unity + C# + VS Code + JetBrains + macOS/Windows |
| **Jekyll Blog** | Jekyll + Ruby + VS Code + macOS |
| **FastAPI + Docker** | Python + Docker + VS Code + macOS/Windows/Linux |
| **Terraform Infra** | Terraform + VS Code + JetBrains |
| **React Native** | React + Node.js + Android + Xcode + macOS |

## Architecture

This tool follows the ItsJust Template architecture with Next.js App Router:

```
src/
├── app/                    # Next.js routes, layout, and metadata
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main tool route
│   ├── help/page.tsx       # Help / usage guide page
│   ├── tool-client.tsx     # Tool runtime wiring (state, effects, callbacks)
│   ├── globals.css         # Theme variables, CSS custom properties
│   └── ...
├── lib/                    # Shared utilities
│   ├── utils.ts            # cn() helper, format utilities
│   └── seo.ts              # Metadata and JSON-LD generation
├── tool/                   # Tool-specific logic
│   ├── components/
│   │   ├── tool-canvas.tsx     # .gitignore output display with line numbers
│   │   ├── tool-sidebar.tsx    # Template browser, search, filters, custom rules
│   │   └── tool-toolbar.tsx    # Help link and keyboard shortcut hints
│   ├── exporters/
│   │   └── json.ts         # Structured JSON export
│   ├── index.ts            # Public exports barrel
│   ├── tool-definition.ts  # Tool state, buildGitignore(), TEMPLATE_RULES, serialize/deserialize
│   ├── tool.config.ts      # Tool metadata, shortcuts, theme
│   └── types.ts            # TypeScript types, TEMPLATES, TEMPLATE_CATEGORIES
```

### Key Modules

- **`tool-definition.ts`** — Contains the `buildGitignore()` function that merges selected template rules with custom entries, the `TEMPLATE_RULES` map (60+ gitignore rule sets), and the tool's serialize/deserialize logic for import/export/sharing.
- **`tool-sidebar.tsx`** — Template browser with category filtering, search, multi-select, and custom rules editor. Memoised filtered template list for performance.
- **`tool-canvas.tsx`** — Read-only output view with synchronised line numbers, copy-to-clipboard with visual feedback, and direct file download.
- **`tool-client.tsx`** — Wires everything together: URL state sharing (lz-string compressed), undo/redo, toast notifications, and keyboard shortcut handlers.

### Data Flow

1. User browses/searches templates in the sidebar and toggles selections.
2. `tool-client.tsx` updates the tool state via `setToolData()`.
3. On "Generate", `buildGitwinner()` scans `selectedTemplates`, looks up each in `TEMPLATE_RULES`, and concatenates the rules with a header comment.
4. The generated content is displayed in `ToolCanvas` with line numbers.
5. User can copy, download, or share (URL-encoded with lz-string compression).

### State Shape

```typescript
interface GitignoreState {
  selectedTemplates: GitignoreTemplate[];  // Array of template IDs
  customRules: string;                     // User-typed custom .gitignore entries
  outputContent: string;                   // Generated .gitignore body
  visibilityFilter: VisibilityFilter;      // 'all' | 'language' | 'framework' | 'ide' | 'os' | 'platform'
  searchQuery: string;                     // Filter text
  copied: boolean;                         // Clipboard feedback flag
}
```

## Deployment

Deploy to Vercel with zero configuration:

```bash
npx vercel
```

Set `NEXT_PUBLIC_URL` to your production URL in your Vercel project settings.

## License

MIT
