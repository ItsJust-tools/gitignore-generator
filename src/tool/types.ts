export type GitignoreTemplate =
  | 'node'
  | 'python'
  | 'java'
  | 'rust'
  | 'go'
  | 'ruby'
  | 'dotnet'
  | 'c'
  | 'cpp'
  | 'swift'
  | 'android'
  | 'flutter'
  | 'react'
  | 'vue'
  | 'angular'
  | 'laravel'
  | 'rails'
  | 'django'
  | 'spring'
  | 'nextjs'
  | 'nuxt'
  | 'svelte'
  | 'docker'
  | 'terraform'
  | 'ansible'
  | 'macos'
  | 'windows'
  | 'linux'
  | 'vim'
  | 'emacs'
  | 'jetbrains'
  | 'visualstudio'
  | 'vscode'
  | 'gitbook'
  | 'jekyll'
  | 'hugo'
  | 'elixir'
  | 'haskell'
  | 'julia'
  | 'kotlin'
  | 'scala'
  | 'lua'
  | 'perl'
  | 'r'
  | 'matlab'
  | 'unity'
  | 'unrealengine'
  | 'godot'
  | 'xcode'
  | 'sass'
  | 'gatsby'
  | 'eleventy'
  | 'deno'
  | 'bun'
  | 'solidjs'
  | 'custom';

export type VisibilityFilter = 'all' | 'os' | 'ide' | 'language' | 'framework';

export interface GitignoreState {
  selectedTemplates: GitignoreTemplate[];
  customRules: string;
  outputContent: string;
  visibilityFilter: VisibilityFilter;
  searchQuery: string;
  copied: boolean;
}

export interface TemplateCategory {
  id: string;
  label: string;
  icon: string;
}

export interface TemplateInfo {
  id: GitignoreTemplate;
  label: string;
  description: string;
  category: 'os' | 'ide' | 'language' | 'framework';
  icon: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'language', label: 'Languages', icon: '💻' },
  { id: 'framework', label: 'Frameworks', icon: '🛠️' },
  { id: 'ide', label: 'IDEs & Editors', icon: '✏️' },
  { id: 'os', label: 'Operating Systems', icon: '💿' },
];

export const TEMPLATES: TemplateInfo[] = [
  // Languages
  { id: 'node', label: 'Node.js', description: 'node_modules, npm/yarn/pnpm logs', category: 'language', icon: '🟢' },
  { id: 'python', label: 'Python', description: 'venv, __pycache__, .pyc, .egg', category: 'language', icon: '🐍' },
  { id: 'java', label: 'Java', description: '.class, .jar, target/, build/', category: 'language', icon: '☕' },
  { id: 'rust', label: 'Rust', description: 'target/, Cargo.lock for libs', category: 'language', icon: '🦀' },
  { id: 'go', label: 'Go', description: 'bin/, vendor/ (opt-in)', category: 'language', icon: '🔵' },
  { id: 'ruby', label: 'Ruby', description: '*.gem, .bundle, vendor/bundle', category: 'language', icon: '💎' },
  { id: 'dotnet', label: '.NET', description: 'bin/, obj/, *.user, packages/', category: 'language', icon: '🔷' },
  { id: 'c', label: 'C', description: '*.o, *.obj, *.exe, build/', category: 'language', icon: '⚙️' },
  { id: 'cpp', label: 'C++', description: '*.o, *.obj, build/, .deps/', category: 'language', icon: '⚡' },
  { id: 'swift', label: 'Swift', description: '.build/, Packages/, *.xcodeproj', category: 'language', icon: '🟧' },
  { id: 'kotlin', label: 'Kotlin', description: '.kotlin_module, build/', category: 'language', icon: '🟣' },
  { id: 'scala', label: 'Scala', description: 'target/, *.class', category: 'language', icon: '🔴' },
  { id: 'elixir', label: 'Elixir', description: '_build/, deps/, mix.lock', category: 'language', icon: '🟪' },
  { id: 'haskell', label: 'Haskell', description: 'dist-newstyle/, .stack-work/', category: 'language', icon: '🟦' },
  { id: 'julia', label: 'Julia', description: 'Manifest.toml, LocalPreferences', category: 'language', icon: '🟥' },
  { id: 'lua', label: 'Lua', description: '*.luac, build/', category: 'language', icon: '🔷' },
  { id: 'perl', label: 'Perl', description: 'blib/, _build/', category: 'language', icon: '🐪' },
  { id: 'r', label: 'R', description: '.Rhistory, .RData, .Rproj.user', category: 'language', icon: '📊' },
  { id: 'matlab', label: 'MATLAB', description: '*.asv, *.m~, slprj/', category: 'language', icon: '🧮' },

  // Frameworks
  { id: 'react', label: 'React', description: 'node_modules, build/, .env.local', category: 'framework', icon: '⚛️' },
  { id: 'nextjs', label: 'Next.js', description: '.next/, out/, build/', category: 'framework', icon: '▲' },
  { id: 'vue', label: 'Vue', description: 'dist/, node_modules, *.log', category: 'framework', icon: '💚' },
  { id: 'nuxt', label: 'Nuxt', description: '.nuxt/, dist/, node_modules', category: 'framework', icon: '🟢' },
  { id: 'svelte', label: 'Svelte', description: 'build/, .svelte-kit/', category: 'framework', icon: '🧡' },
  { id: 'angular', label: 'Angular', description: 'dist/, .angular/, node_modules', category: 'framework', icon: '🔴' },
  { id: 'gatsby', label: 'Gatsby', description: 'public/, .cache/', category: 'framework', icon: '🟣' },
  { id: 'eleventy', label: 'Eleventy', description: '_site/, .cache/', category: 'framework', icon: '🌐' },
  { id: 'django', label: 'Django', description: '*.pyc, __pycache__, media/', category: 'framework', icon: '🎸' },
  { id: 'rails', label: 'Ruby on Rails', description: 'tmp/, log/, storage/', category: 'framework', icon: '🚂' },
  { id: 'laravel', label: 'Laravel', description: 'vendor/, node_modules, .env', category: 'framework', icon: '🎯' },
  { id: 'spring', label: 'Spring Boot', description: 'target/, .mvn/, *.jar', category: 'framework', icon: '🍃' },
  { id: 'sass', label: 'Sass', description: '.sass-cache/', category: 'framework', icon: '🎨' },

  // IDEs & Editors
  { id: 'vscode', label: 'VS Code', description: '.vscode/settings.json, launch.json', category: 'ide', icon: '💙' },
  { id: 'jetbrains', label: 'JetBrains', description: '.idea/, *.iml', category: 'ide', icon: '🧠' },
  { id: 'vim', label: 'Vim', description: '*.swp, *.swo, .vim/', category: 'ide', icon: '⌨️' },
  { id: 'emacs', label: 'Emacs', description: '*~, .#*, .emacs.desktop', category: 'ide', icon: '🔰' },
  { id: 'visualstudio', label: 'Visual Studio', description: '.vs/, *.suo, *.user', category: 'ide', icon: '🟣' },
  { id: 'xcode', label: 'Xcode', description: '*.xcworkspace, DerivedData', category: 'ide', icon: '🔵' },

  // Operating Systems
  { id: 'macos', label: 'macOS', description: '.DS_Store, ._*, .Spotlight-V100', category: 'os', icon: '🍎' },
  { id: 'windows', label: 'Windows', description: 'Thumbs.db, desktop.ini', category: 'os', icon: '🪟' },
  { id: 'linux', label: 'Linux', description: '*~, .fuse_hidden*', category: 'os', icon: '🐧' },

  // Platforms & Tools
  { id: 'android', label: 'Android', description: '.gradle/, build/, local.properties', category: 'framework', icon: '🤖' },
  { id: 'flutter', label: 'Flutter', description: '.dart_tool/, build/, .flutter-plugins', category: 'framework', icon: '💙' },
  // Platforms & Tools
  { id: 'deno', label: 'Deno', description: 'deno.lock, .deno/, dist/', category: 'framework', icon: '🦕' },
  { id: 'bun', label: 'Bun', description: 'bun.lock, node_modules/', category: 'framework', icon: '🥟' },
  { id: 'solidjs', label: 'Solid.js', description: 'node_modules, dist/, .solid/', category: 'framework', icon: '🔷' },
  { id: 'docker', label: 'Docker', description: '.dockerignore (companion)', category: 'framework', icon: '🐳' },
  { id: 'terraform', label: 'Terraform', description: '.terraform/, *.tfstate', category: 'framework', icon: '🏗️' },
  { id: 'ansible', label: 'Ansible', description: '*.retry, inventory/', category: 'framework', icon: '🛝' },
  { id: 'unity', label: 'Unity', description: 'Library/, Temp/, Build/', category: 'framework', icon: '🎮' },
  { id: 'unrealengine', label: 'Unreal Engine', description: 'DerivedDataCache/, Intermediate/', category: 'framework', icon: '🎯' },
  { id: 'godot', label: 'Godot', description: '.godot/, export/', category: 'framework', icon: '🎮' },
  { id: 'jekyll', label: 'Jekyll', description: '_site/, .jekyll-cache/', category: 'framework', icon: '📝' },
  { id: 'hugo', label: 'Hugo', description: 'public/, resources/', category: 'framework', icon: '🐹' },
  { id: 'gitbook', label: 'GitBook', description: '_book/, book/', category: 'framework', icon: '📖' },
];
