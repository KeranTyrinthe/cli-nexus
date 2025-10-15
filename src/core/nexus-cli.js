const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const { ArchitectureFactory } = require('./architecture-factory');
const { ProjectValidator } = require('./project-validator');
const { FileGenerator } = require('./file-generator');
const { ReactGenerator } = require('../stacks/frontend/react');
const { VueGenerator } = require('../stacks/frontend/vue');
const { AngularGenerator } = require('../stacks/frontend/angular');

/**
 * Classe principale de la CLI Nexus
 * Orchestre la génération de projets selon l'architecture choisie
 */
class NexusCLI {
  constructor() {
    this.architectureFactory = new ArchitectureFactory();
    this.projectValidator = new ProjectValidator();
    this.fileGenerator = new FileGenerator();
    this.spinner = null;
  }

  /**
   * Point d'entrée v2: exécute selon flags ou prompts
   */
  async execute(options) {
    const autoConfirm = Boolean(options.yes);
    const noInstall = Boolean(options.noInstall);
    const force = Boolean(options.force);
    const verbose = Boolean(options.verbose);
    const directory = options.directory || './';

    // Si flags v2 présents -> génération directe
    const hasV2Flags = Boolean(options.type || options.frontend || options.backend || options.database);
    if (hasV2Flags || options.model) {
      // En mode flags, passer en autoConfirm par défaut si --yes non fourni
      const effectiveAutoConfirm = options.yes !== undefined ? Boolean(options.yes) : true;
      const validatedDir = await this.validateDirectory(directory, { autoConfirm: effectiveAutoConfirm, force });
      return this.generateViaFlags(options, validatedDir, { autoConfirm: effectiveAutoConfirm, noInstall, verbose });
    }

    // Sinon mode interactif v2
    return this.startInteractiveV2(directory, { autoConfirm, noInstall, verbose, force });
  }

  /**
   * Démarre le mode interactif
   */
  async startInteractive(directory = './', autoConfirm = false) {
    // Reroute vers v2 interactif pour compatibilite ascendante
    return this.startInteractiveV2(directory, { autoConfirm, noInstall: false, verbose: false });
  }

  /**
   * Mode interactif v2 (type de projet, techno, DB, archi)
   */
  async startInteractiveV2(targetDir = './', { autoConfirm = false, noInstall = false, verbose = false, force = false } = {}) {
    console.log(chalk.blue('Bienvenue dans Nexus CLI v2 !'));
    console.log(chalk.gray('Generez un projet Backend, Frontend ou Fullstack en quelques etapes.\n'));

    try {
      const projectType = await this.promptProjectType();

      let selections = {};
      let backendArchitecture = null;
      let frontendArchitecture = 'default';
      if (projectType === 'backend') {
        selections = await this.promptBackendStack();
        backendArchitecture = await this.selectArchitecture();
      } else if (projectType === 'frontend') {
        selections = await this.promptFrontendStack();
        frontendArchitecture = await this.selectFrontendArchitecture();
      } else {
        selections = await this.promptFullstackStack();
        // Pour fullstack: une seule architecture s'applique au backend et au frontend
        backendArchitecture = await this.selectArchitecture();
        frontendArchitecture = backendArchitecture ? backendArchitecture.name : 'default';
      }

      const projectConfig = await this.configureProject(backendArchitecture, autoConfirm);

      const fullConfig = {
        ...projectConfig,
        projectType,
        ...selections,
        frontendArchitecture
      };

      const validatedTargetDir = await this.validateDirectory(targetDir, { autoConfirm, force });
      await this.generateByType(backendArchitecture, fullConfig, validatedTargetDir, { noInstall });
      await this.finalizeByType(validatedTargetDir, fullConfig, { noInstall, verbose });
    } catch (error) {
      this.stopSpinner();
      throw error;
    }
  }

  /**
   * Génération directe avec architecture spécifiée
   */
  async generateDirect(architectureName, directory = './', autoConfirm = false) {
    try {
      const targetDir = await this.validateDirectory(directory);
      const architecture = this.architectureFactory.getArchitecture(architectureName);
      
      if (!architecture) {
        throw new Error(`Architecture '${architectureName}' non reconnue. Utilisez: mvc, clean, ou hexa`);
      }

      const projectConfig = await this.configureProject(architecture, autoConfirm);
      await this.generateProject(architecture, projectConfig, targetDir);
      await this.finalizeProject(targetDir, projectConfig);
      
    } catch (error) {
      this.stopSpinner();
      throw error;
    }
  }

  /**
   * Génération via flags v2
   */
  async generateViaFlags(options, targetDir, { autoConfirm = false, noInstall = false, verbose = false } = {}) {
    // Architecture (v1 compat via --model)
    const architecture = options.model
      ? this.architectureFactory.getArchitecture(options.model)
      : this.architectureFactory.getArchitecture('mvc');
    if (!architecture) {
      throw new Error(`Architecture '${options.model}' non reconnue. Utilisez: mvc, clean, hexa`);
    }

    const baseConfig = await this.configureProject(architecture, autoConfirm);
    const fullConfig = {
      ...baseConfig,
      projectType: (options.type || 'backend').toLowerCase(),
      frontendFramework: options.frontend ? options.frontend.toLowerCase() : undefined,
      cssTool: options.css ? options.css.toLowerCase() : 'none',
      backendRuntime: options.backend ? options.backend.toLowerCase() : 'node',
      database: options.database ? options.database.toLowerCase() : 'none',
      frontendArchitecture: options.frontendArchitecture ? options.frontendArchitecture.toLowerCase() : 'default'
    };

    // Validations v2
    const typeVal = this.projectValidator.validateProjectType(fullConfig.projectType);
    if (!typeVal.isValid) throw new Error(typeVal.error);
    const dbVal = this.projectValidator.validateDatabase(fullConfig.database);
    if (!dbVal.isValid) throw new Error(dbVal.error);
    if (fullConfig.projectType !== 'backend') {
      const feVal = this.projectValidator.validateFrontend({ framework: fullConfig.frontendFramework || '', css: fullConfig.cssTool || 'none' });
      if (!feVal.isValid) throw new Error(feVal.error);
    }

    await this.generateByType(architecture, fullConfig, targetDir, { noInstall });
    await this.finalizeByType(targetDir, fullConfig, { noInstall, verbose });
  }

  /**
   * Valide et prépare le répertoire de destination
   */
  async validateDirectory(directory, { autoConfirm = false, force = false } = {}) {
    const targetDir = path.resolve(directory);
    if (await fs.pathExists(targetDir)) {
      const contents = await fs.readdir(targetDir);
      if (contents.length > 0 && !force) {
        if (autoConfirm) return targetDir;
        const { proceed } = await inquirer.prompt([{
          type: 'confirm',
          name: 'proceed',
          message: `Le répertoire '${targetDir}' n'est pas vide. Voulez-vous continuer ?`,
          default: false
        }]);
        if (!proceed) {
          throw new Error('Génération annulée par l\'utilisateur');
        }
      }
    }
    return targetDir;
  }

  /**
   * Sélection interactive de l'architecture
   */
  async selectArchitecture() {
    const { architecture } = await inquirer.prompt([{
      type: 'list',
      name: 'architecture',
      message: 'Quelle architecture souhaitez-vous utiliser ?',
      choices: [
        {
          name: 'MVC (Model-View-Controller) - Architecture classique',
          value: 'mvc'
        },
        {
          name: 'Clean Architecture - Organisation en couches metier',
          value: 'clean'
        },
        {
          name: 'Hexagonal Architecture - Ports et adapters pour modularite',
          value: 'hexa'
        }
      ]
    }]);

    return this.architectureFactory.getArchitecture(architecture);
  }

  async selectFrontendArchitecture() {
    const { frontendArchitecture } = await inquirer.prompt([{
      type: 'list',
      name: 'frontendArchitecture',
      message: 'Architecture frontend ?',
      choices: [
        { name: 'Architecture par défaut (aucune structure imposée)', value: 'default' },
        { name: 'MVC (dossiers views/controllers utils...)', value: 'mvc' },
        { name: 'Clean (dossiers domain/application/ui...)', value: 'clean' },
        { name: 'Hexagonal (ports/adapters)', value: 'hexa' }
      ],
      default: 'default'
    }]);
    return frontendArchitecture;
  }

  /**
   * Configuration du projet
   */
  async configureProject(architecture, autoConfirm = false) {
    const questions = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Nom du projet:',
        default: 'mon-projet-nexus',
        validate: (input) => {
          if (!input.trim()) return 'Le nom du projet est requis';
          if (!/^[a-z0-9-]+$/.test(input)) {
            return 'Le nom doit contenir uniquement des lettres minuscules, chiffres et tirets';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description du projet:',
        default: 'Projet Node.js généré avec Nexus CLI'
      },
      {
        type: 'input',
        name: 'author',
        message: 'Auteur:',
        default: 'Développeur Nexus'
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Gestionnaire de paquets:',
        choices: ['npm', 'yarn', 'pnpm'],
        default: 'npm'
      }
    ];

    if (!autoConfirm) {
      const answers = await inquirer.prompt(questions);
      return { ...answers, architecture: architecture ? architecture.name : undefined };
    }

    // Mode auto-confirm
    return {
      projectName: 'mon-projet-nexus',
      description: 'Projet Node.js généré avec Nexus CLI',
      author: 'Développeur Nexus',
      packageManager: 'npm',
      architecture: architecture ? architecture.name : undefined
    };
  }

  /**
   * Generation du projet
   */
  async generateProject(architecture, config, targetDir) {
    this.startSpinner('Generation de la structure du projet...');
    
    try {
      // Creation de la structure de base
      await this.fileGenerator.createProjectStructure(targetDir, config);
      
      // Generation des fichiers selon l'architecture
      await architecture.generate(targetDir, config);
      
      this.stopSpinner();
      console.log(chalk.green('Structure du projet generee avec succes !'));
      
    } catch (error) {
      this.stopSpinner();
      throw new Error(`Erreur lors de la generation: ${error.message}`);
    }
  }

  /**
   * Finalisation du projet
   */
  async finalizeProject(targetDir, config, { noInstall = false, verbose = false } = {}) {
    this.startSpinner('Finalisation du projet...');
    try {
      // .env.example minimal
      await this.createEnvExample(targetDir, config);

      if (!noInstall) {
        await this.installDependencies(targetDir, config.packageManager, { verbose });
      }

      this.stopSpinner();
      console.log(chalk.green('\nProjet cree avec succes !'));
      console.log(chalk.blue(`\nRepertoire: ${targetDir}`));
      console.log(chalk.blue(`Architecture: ${config.architecture}`));
      console.log(chalk.yellow('\nPour demarrer votre projet:'));
      console.log(chalk.gray(`  cd ${path.basename(targetDir)}`));
      console.log(chalk.gray(`  ${config.packageManager} start`));
      console.log(chalk.yellow('\nDocumentation disponible dans le README.md'));
    } catch (error) {
      this.stopSpinner();
      console.log(chalk.yellow('Projet cree mais erreur lors de l\'installation des dependances'));
      console.log(chalk.gray(`Vous pouvez installer manuellement avec: cd ${targetDir} && ${config.packageManager} install`));
    }
  }

  async finalizeByType(targetDir, config, { noInstall = false, verbose = false } = {}) {
    if (config.projectType === 'fullstack') {
      // Installer deps root seulement (frontend embarqué sous src/frontend)
      if (!noInstall) {
        try { await this.installDependencies(targetDir, config.packageManager, { verbose }); } catch (_) {}
      }
      console.log(chalk.green('\nProjet fullstack cree avec succes !'));
      console.log(chalk.gray(`Dossier: ${targetDir}`));
      console.log(chalk.gray(`Frontend: ${path.join('src', 'frontend')}`));
      return;
    }
    if (config.projectType === 'frontend') {
      if (!noInstall) {
        try { await this.installDependencies(targetDir, config.packageManager, { verbose }); } catch (_) {}
      }
      console.log(chalk.green('\nProjet frontend cree avec succes !'));
      console.log(chalk.blue(`\nRepertoire: ${targetDir}`));
      console.log(chalk.blue(`Framework: ${config.frontendFramework || 'react'}${config.cssTool && config.cssTool !== 'none' ? ', CSS: ' + config.cssTool : ''}`));
      console.log(chalk.yellow('\nPour demarrer votre projet:'));
      console.log(chalk.gray(`  cd ${path.basename(targetDir)}`));
      console.log(chalk.gray('  npm run dev'));
      console.log(chalk.yellow('\nDocumentation disponible dans le README.md'));
      return;
    }
    return this.finalizeProject(targetDir, config, { noInstall, verbose });
  }

  /**
   * Installation des dépendances
   */
  async installDependencies(targetDir, packageManager, { verbose = false } = {}) {
    const { execSync } = require('child_process');
    
    try {
      execSync(`${packageManager} install`, {
        cwd: targetDir,
        stdio: verbose ? 'inherit' : 'pipe'
      });
    } catch (error) {
      throw new Error(`Erreur lors de l'installation des dépendances: ${error.message}`);
    }
  }

  /**
   * Démarre le spinner de chargement
   */
  startSpinner(text) {
    this.spinner = ora(text).start();
  }

  /**
   * Arrête le spinner de chargement
   */
  stopSpinner() {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  // ===== Prompts v2 =====
  async promptProjectType() {
    const { projectType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'Quel type de projet veux-tu creer ?',
        choices: [
          { name: 'Backend uniquement (Node.js)', value: 'backend' },
          { name: 'Frontend uniquement (React, Vue, Angular, Tailwind)', value: 'frontend' },
          { name: 'Fullstack (Node + React/Vue/Angular)', value: 'fullstack' }
        ]
      }
    ]);
    return projectType;
  }

  async promptBackendStack() {
    const { database } = await inquirer.prompt([
      {
        type: 'list',
        name: 'database',
        message: 'Choisis une base de donnees:',
        choices: [
          { name: 'PostgreSQL', value: 'postgres' },
          { name: 'MySQL', value: 'mysql' },
          { name: 'MongoDB', value: 'mongodb' },
          { name: 'SQLite', value: 'sqlite' },
          { name: 'Aucune', value: 'none' }
        ],
        default: 'none'
      }
    ]);
    return { backendRuntime: 'node', database };
  }

  async promptFrontendStack() {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'frontendFramework',
        message: 'Choisis un framework frontend:',
        choices: [
          { name: 'React', value: 'react' },
          { name: 'Vue', value: 'vue' },
          { name: 'Angular', value: 'angular' }
        ],
        default: 'react'
      },
      {
        type: 'list',
        name: 'cssTool',
        message: 'Choisis un outil CSS:',
        choices: [
          { name: 'Tailwind CSS', value: 'tailwind' },
          { name: 'Aucun', value: 'none' }
        ],
        default: 'none'
      }
    ]);
    return answers;
  }

  async promptFullstackStack() {
    const front = await this.promptFrontendStack();
    const back = await this.promptBackendStack();
    return { ...front, ...back };
  }

  // ===== Generation par type =====
  async generateByType(architecture, config, targetDir, { noInstall = false } = {}) {
    if (config.projectType === 'backend') {
      await this.generateProject(architecture, config, targetDir);
      await this.createEnvExample(targetDir);
      await this.injectDatabaseDeps(targetDir, config);
      return;
    }

    if (config.projectType === 'frontend') {
      await this.generateFrontend(targetDir, config);
      return;
    }

    // fullstack: un seul projet, frontend sous src/frontend
    await this.generateProject(architecture, config, targetDir);
    await this.createEnvExample(targetDir, config);
    await this.injectDatabaseDeps(targetDir, config);
    const frontendRoot = path.join(targetDir, 'src', 'frontend');
    await fs.ensureDir(frontendRoot);
    const embedConfig = { ...config, embedInRoot: true };
    await this.generateFrontend(frontendRoot, embedConfig);
    await this.injectFrontendDeps(targetDir, embedConfig);
  }

  async createEnvExample(targetDir, config) {
    const envPath = path.join(targetDir, '.env.example');
    let content = `# Variables d'environnement
PORT=3000
NODE_ENV=development
`;
    if (config && config.database && config.database !== 'none') {
      switch (config.database) {
        case 'postgres':
          content += `# PostgreSQL\nDATABASE_URL=postgres://user:password@localhost:5432/${config.projectName}\n`;
          break;
        case 'mysql':
          content += `# MySQL\nDATABASE_URL=mysql://user:password@localhost:3306/${config.projectName}\n`;
          break;
        case 'mongodb':
          content += `# MongoDB\nMONGODB_URI=mongodb://localhost:27017/${config.projectName}\n`;
          break;
        case 'sqlite':
          content += `# SQLite\nSQLITE_FILE=./data/${config.projectName}.sqlite\n`;
          break;
        default:
          break;
      }
    }
    try {
      await fs.writeFile(envPath, content, 'utf8');
      await fs.writeFile(path.join(targetDir, '.env'), content, 'utf8');
    } catch (_) {}
  }

  async injectDatabaseDeps(targetDir, config) {
    if (!config || !config.database || config.database === 'none') return;
    const pkgPath = path.join(targetDir, 'package.json');
    if (!(await fs.pathExists(pkgPath))) return;
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    pkg.dependencies = pkg.dependencies || {};
    switch (config.database) {
      case 'postgres':
        pkg.dependencies.pg = '^8.11.0';
        break;
      case 'mysql':
        pkg.dependencies.mysql2 = '^3.9.0';
        break;
      case 'mongodb':
        pkg.dependencies.mongodb = '^6.3.0';
        break;
      case 'sqlite':
        pkg.dependencies.sqlite3 = '^5.1.7';
        break;
      default:
        break;
    }
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
  }

   /**
    * Fusionne les dépendances frontend (générées sous src/frontend) dans le package.json racine
    */
  async injectFrontendDeps(rootDir, config) {
    try {
      const rootPkgPath = path.join(rootDir, 'package.json');
      const fePkgPath = path.join(rootDir, 'src', 'frontend', 'package.json');
      if (!(await fs.pathExists(rootPkgPath)) || !(await fs.pathExists(fePkgPath))) return;
      const rootPkg = JSON.parse(await fs.readFile(rootPkgPath, 'utf8'));
      const fePkg = JSON.parse(await fs.readFile(fePkgPath, 'utf8'));
      rootPkg.dependencies = { ...(rootPkg.dependencies || {}), ...(fePkg.dependencies || {}) };
      rootPkg.devDependencies = { ...(rootPkg.devDependencies || {}), ...(fePkg.devDependencies || {}) };
      // Ajouter scripts frontend en préfixant
      rootPkg.scripts = rootPkg.scripts || {};
      const feScripts = fePkg.scripts || {};
      if (feScripts.dev) rootPkg.scripts['frontend:dev'] = feScripts.dev;
      if (feScripts.build) rootPkg.scripts['frontend:build'] = feScripts.build;
      if (feScripts.preview) rootPkg.scripts['frontend:preview'] = feScripts.preview;
      await fs.writeFile(rootPkgPath, JSON.stringify(rootPkg, null, 2), 'utf8');
    } catch (_) {}
  }

  async generateFrontend(targetDir, config) {
    const framework = (config.frontendFramework || 'react').toLowerCase();
    // Harmoniser: si l'architecture du backend est fournie, l'utiliser pour le frontend en fullstack
    const inferredFa = config.frontendArchitecture || (config.projectType === 'fullstack' ? (config.architecture || 'default') : 'default');
    const frontendArchitecture = (inferredFa || 'default').toLowerCase();
    const generatorOptions = { ...config, frontendArchitecture };
    switch (framework) {
      case 'react':
        return new ReactGenerator().generate(targetDir, generatorOptions);
      case 'vue':
        return new VueGenerator().generate(targetDir, generatorOptions);
      case 'angular':
        return new AngularGenerator().generate(targetDir, generatorOptions);
      default:
        throw new Error(`Framework frontend inconnu: ${framework}`);
    }
  }
}

module.exports = { NexusCLI }; 