const fs = require('fs-extra');
const path = require('path');

class VueGenerator {
  async generate(targetDir, config) {
    const useTailwind = (config.cssTool || 'none').toLowerCase() === 'tailwind';
    const arch = (config.frontendArchitecture || 'default').toLowerCase();
    await fs.ensureDir(path.join(targetDir, 'src'));

    const pkg = {
      name: `${config.projectName}-vue`,
      private: true,
      version: '0.1.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        vue: '^3.4.0'
      },
      devDependencies: {
        vite: '^5.0.0',
        '@vitejs/plugin-vue': '^5.0.0'
      }
    };

    if (useTailwind) {
      pkg.devDependencies.tailwindcss = '^3.4.0';
      pkg.devDependencies.postcss = '^8.4.35';
      pkg.devDependencies.autoprefixer = '^10.4.16';
    }

    const indexHtml = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.projectName} - Vue</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
  </html>`;

    const viteConfig = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
`;

    const appVue = `<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div>
      <h1 class="text-2xl font-bold">${config.projectName} - Vue</h1>
      <p class="mt-2 text-gray-600">Généré avec Nexus CLI v2</p>
    </div>
  </div>
  </template>

<script setup>
</script>

<style>
</style>
`;

    const mainJs = `${useTailwind ? "import './index.css'\n" : ''}import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`;

    await fs.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');
    await fs.writeFile(path.join(targetDir, 'index.html'), indexHtml, 'utf8');
    await fs.writeFile(path.join(targetDir, 'vite.config.js'), viteConfig, 'utf8');
    await fs.writeFile(path.join(targetDir, 'src', 'App.vue'), appVue, 'utf8');
    await fs.writeFile(path.join(targetDir, 'src', 'main.js'), mainJs, 'utf8');

    // structure selon "arch"
    if (arch === 'mvc') {
      await fs.ensureDir(path.join(targetDir, 'src', 'controllers'));
      await fs.ensureDir(path.join(targetDir, 'src', 'views'));
      await fs.ensureDir(path.join(targetDir, 'src', 'models'));
    } else if (arch === 'clean') {
      await fs.ensureDir(path.join(targetDir, 'src', 'domain'));
      await fs.ensureDir(path.join(targetDir, 'src', 'application'));
      await fs.ensureDir(path.join(targetDir, 'src', 'ui'));
    } else if (arch === 'hexa') {
      await fs.ensureDir(path.join(targetDir, 'src', 'domain'));
      await fs.ensureDir(path.join(targetDir, 'src', 'application'));
      await fs.ensureDir(path.join(targetDir, 'src', 'adapters'));
      await fs.ensureDir(path.join(targetDir, 'src', 'ports'));
    }

    if (useTailwind) {
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: { extend: {} },
  plugins: [],
};
`;
      const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
      const indexCss = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
      await fs.writeFile(path.join(targetDir, 'tailwind.config.js'), tailwindConfig, 'utf8');
      await fs.writeFile(path.join(targetDir, 'postcss.config.js'), postcssConfig, 'utf8');
      await fs.writeFile(path.join(targetDir, 'src', 'index.css'), indexCss, 'utf8');
    }

    await fs.writeFile(path.join(targetDir, 'README.md'), `# Frontend Vue\n\n- Dev: npm run dev\n- Build: npm run build\n- Preview: npm run preview\n\n${useTailwind ? 'Tailwind est preconfigure.' : ''}\n`, 'utf8');
    const gitignore = `node_modules\n.dist\n.vite\n.DS_Store\nThumbs.db\n`;
    await fs.writeFile(path.join(targetDir, '.gitignore'), gitignore, 'utf8');
  }
}

module.exports = { VueGenerator };


