const fs = require('fs-extra');
const path = require('path');

class AngularGenerator {
  async generate(targetDir, config) {
    // Squelette minimal (l'intégration du CLI Angular peut être ajoutée plus tard)
    const arch = (config.frontendArchitecture || 'default').toLowerCase();
    await fs.ensureDir(path.join(targetDir, 'src'));
    const pkg = {
      name: `${config.projectName}-angular`,
      private: true,
      version: '0.1.0',
      scripts: {
        start: 'echo "Configurez Angular CLI (ng) pour démarrer"'
      },
      dependencies: {},
      devDependencies: {}
    };
    await fs.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');
    await fs.writeFile(path.join(targetDir, 'README.md'), `# Frontend Angular\n\nCe squelette minimal nécessite l'installation et l'initialisation avec Angular CLI.\n`, 'utf8');
    await fs.writeFile(path.join(targetDir, 'src', 'index.html'), `<!doctype html>\n<html><head><meta charset=\"utf-8\"><title>${config.projectName} - Angular</title></head><body><app-root>Angular app</app-root></body></html>`, 'utf8');
    const gitignore = `node_modules\n.dist\n.DS_Store\nThumbs.db\n`;
    await fs.writeFile(path.join(targetDir, '.gitignore'), gitignore, 'utf8');

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
  }
}

module.exports = { AngularGenerator };


