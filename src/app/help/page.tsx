import type { Metadata } from 'next';
import Link from 'next/link';
import toolConfig from '@/tool/tool.config';

export const metadata: Metadata = {
  title: `Help — ${toolConfig.name}`,
  description: `How to use the ${toolConfig.name}. Combine templates from 60+ languages, frameworks, IDEs, and platforms.`,
};

export default function HelpPage() {
  return (
    <div className="help-page">
      <div className="help-card">
        <Link href="/" className="help-back-link" aria-label="Back to tool">
          ← Back to {toolConfig.name}
        </Link>
        <h1 className="help-title">How to Use the .gitignore Generator</h1>

        <section className="help-section">
          <h2>Quick Start</h2>
          <ol className="help-steps">
            <li>
              <strong>Browse templates</strong> — Use the category tabs (Languages, Frameworks, IDEs, etc.) or the search bar to find what you need.
            </li>
            <li>
              <strong>Select templates</strong> — Click any template card to add it to your selection. Combine multiple templates freely.
            </li>
            <li>
              <strong>Add custom rules</strong> — Type any additional .gitignore rules in the text area (e.g., <code>secrets/</code> or <code>*.local</code>).
            </li>
            <li>
              <strong>Generate</strong> — Click &quot;Generate .gitignore&quot; to produce your combined file.
            </li>
            <li>
              <strong>Copy or download</strong> — Copy to clipboard with one click, or download the <code>.gitignore</code> file directly.
            </li>
          </ol>
        </section>

        <section className="help-section">
          <h2>Template Categories</h2>
          <div className="help-category-grid">
            <div className="help-category">
              <h3>💻 Languages (21)</h3>
              <p>Node.js, Python, Java, Rust, Go, Ruby, .NET, C, C++, Swift, Kotlin, Scala, Elixir, Haskell, Julia, Lua, Perl, R, MATLAB, Zig, Crystal</p>
            </div>
            <div className="help-category">
              <h3>🛠️ Frameworks (13)</h3>
              <p>React, Next.js, Vue, Nuxt, Svelte, Angular, Gatsby, Eleventy, Django, Rails, Laravel, Spring Boot, Sass</p>
            </div>
            <div className="help-category">
              <h3>✏️ IDEs &amp; Editors (6)</h3>
              <p>VS Code, JetBrains, Vim, Emacs, Visual Studio, Xcode</p>
            </div>
            <div className="help-category">
              <h3>💿 Operating Systems (3)</h3>
              <p>macOS, Windows, Linux</p>
            </div>
            <div className="help-category">
              <h3>🧰 Platforms &amp; Tools (15)</h3>
              <p>Android, Flutter, Deno, Bun, Solid.js, Gradle, Docker, Terraform, Ansible, Unity, Unreal Engine, Godot, Jekyll, Hugo, GitBook</p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Tips</h2>
          <ul className="help-tips">
            <li><strong>Combine freely</strong> — Select a language, its framework, your IDE, and your OS all at once. The output merges them cleanly.</li>
            <li><strong>Search filters</strong> — Start typing in the search box to instantly filter templates by name, description, or ID.</li>
            <li><strong>Select All / Deselect All</strong> — Use the buttons in the selection summary to toggle all templates visible in the current filter.</li>
            <li><strong>Browser storage</strong> — Your selections are saved automatically. Close and come back later without losing your work.</li>
            <li><strong>Share via URL</strong> — Use the share button to encode your entire selection into the URL. Send it to teammates.</li>
            <li><strong>Keyboard shortcuts</strong> — Hover over the &quot;Shortcuts&quot; button in the toolbar to see available shortcuts. Or use <kbd>Ctrl+Shift+F</kbd> to focus search, <kbd>Ctrl+Shift+C</kbd> to copy, <kbd>Ctrl+Shift+D</kbd> to download.</li>
            <li><strong>Dark mode</strong> — The tool follows your system preference. Use the theme toggle to switch manually.</li>
          </ul>
        </section>

        <section className="help-section">
          <h2>Privacy</h2>
          <p>This tool runs entirely in your browser. No data is sent to any server. Your template selections, custom rules, and generated .gitignore files never leave your device.</p>
        </section>

        <section className="help-section">
          <h2>Need More Help?</h2>
          <p>
            Reports issues or suggest templates on the{' '}
            <a href="https://github.com/ItsJust-tools/gitignore-generator/issues" target="_blank" rel="noopener noreferrer">
              GitHub issue tracker
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}