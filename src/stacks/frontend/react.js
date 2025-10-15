const fs = require('fs-extra');
const path = require('path');

class ReactGenerator {
  async generate(targetDir, config) {
    const useTailwind = (config.cssTool || 'none').toLowerCase() === 'tailwind';
    const arch = (config.frontendArchitecture || 'default').toLowerCase();
    await fs.ensureDir(path.join(targetDir, 'src'));

    const pkg = {
      name: `${config.projectName}-react`,
      private: true,
      version: '0.1.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        vite: '^5.0.0',
        '@vitejs/plugin-react': '^4.2.0'
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
    <title>${config.projectName} - React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
  </html>`;

    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;

    const appComponent = `export function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div>
        <h1 className="text-2xl font-bold">${config.projectName} - React</h1>
        <p className="mt-2 text-gray-600">Généré avec Nexus CLI v2</p>
      </div>
    </div>
  );
}
`;

    const mainJsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
${useTailwind ? "import './index.css'\n" : ''}import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`;

    // Si frontend embarqué (fullstack), on garde package.json local pour fusion
    await fs.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');
    await fs.writeFile(path.join(targetDir, 'index.html'), indexHtml, 'utf8');
    await fs.writeFile(path.join(targetDir, 'vite.config.js'), viteConfig, 'utf8');
    await fs.writeFile(path.join(targetDir, 'src', 'App.jsx'), appComponent, 'utf8');
    await fs.writeFile(path.join(targetDir, 'src', 'main.jsx'), mainJsx, 'utf8');

    // Optionnel: structure selon "arch"
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
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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

    await fs.writeFile(path.join(targetDir, 'README.md'), `# Frontend React\n\n- Dev: npm run dev\n- Build: npm run build\n- Preview: npm run preview\n\n${useTailwind ? 'Tailwind est preconfigure.' : ''}\n`, 'utf8');
    const gitignore = `node_modules\n.dist\n.vite\n.DS_Store\nThumbs.db\n`;
    await fs.writeFile(path.join(targetDir, '.gitignore'), gitignore, 'utf8');
  }
}

module.exports = { ReactGenerator };


