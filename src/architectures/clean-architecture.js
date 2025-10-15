const { BaseArchitecture } = require('../core/base-architecture');
const path = require('path');

/**
 * Clean Architecture
 * Organisation en couches métier avec séparation des responsabilités
 */
class CleanArchitecture extends BaseArchitecture {
  constructor() {
    super();
    this.name = 'clean';
    this.displayName = 'Clean Architecture';
    this.description = 'Architecture en couches avec séparation claire des responsabilités métier';
    this.features = [
      'Séparation en couches (Entities, Use Cases, Interfaces, Frameworks)',
      'Indépendance des frameworks',
      'Testabilité élevée',
      'Inversion de dépendances'
    ];
  }

  /**
   * Génère la structure Clean Architecture complète
   */
  async generate(targetDir, config) {
    this.validateConfig(config);
    
    // Création de la structure des dossiers
    await this.createDirectoryStructure(targetDir);
    
    // Génération des fichiers de base
    await this.generateBaseFiles(targetDir, config);
    
    // Génération des fichiers spécifiques Clean Architecture
    await this.generateArchitectureFiles(targetDir, config);
  }

  /**
   * Crée la structure des dossiers Clean Architecture
   */
  async createDirectoryStructure(targetDir) {
    const directories = [
      'src/domain/entities',
      'src/domain/value-objects',
      'src/domain/repositories',
      'src/application/use-cases',
      'src/application/services',
      'src/application/dto',
      'src/infrastructure/database',
      'src/infrastructure/repositories',
      'src/infrastructure/http',
      'src/infrastructure/config',
      'src/presentation/controllers',
      'src/presentation/middleware',
      'src/presentation/routes',
      'src/shared/utils',
      'src/shared/errors'
    ];

    for (const dir of directories) {
      await this.ensureDirectory(path.join(targetDir, dir));
    }
  }

  /**
   * Génère les fichiers de base du projet
   */
  async generateBaseFiles(targetDir, config) {
    // package.json
    const packageJson = this.getPackageJsonTemplate(config);
    await this.writeFile(path.join(targetDir, 'package.json'), packageJson);

    // README.md
    const readme = this.getReadmeTemplate(config);
    await this.writeFile(path.join(targetDir, 'README.md'), readme);

    // .gitignore
    const gitignore = this.getGitignoreTemplate();
    await this.writeFile(path.join(targetDir, '.gitignore'), gitignore);
  }

  /**
   * Génère les fichiers spécifiques à Clean Architecture
   */
  async generateArchitectureFiles(targetDir, config) {
    // Point d'entrée principal
    const appJs = this.getAppJsTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/app.js'), appJs);

    // Serveur
    const serverJs = this.getServerJsTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/server.js'), serverJs);

    // Entité de base
    const entityBase = this.getEntityBaseTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/domain/entities/base.entity.js'), entityBase);

    // Use Case de base
    const useCaseBase = this.getUseCaseBaseTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/application/use-cases/base.use-case.js'), useCaseBase);

    // Repository de base
    const repositoryBase = this.getRepositoryBaseTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/domain/repositories/base.repository.js'), repositoryBase);

    // Contrôleur de base
    const controllerBase = this.getControllerBaseTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/presentation/controllers/base.controller.js'), controllerBase);

    // Routes principales
    const routesIndex = this.getRoutesIndexTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/presentation/routes/index.js'), routesIndex);
  }

  // Templates des fichiers
  getPackageJsonTemplate(config) {
    return JSON.stringify({
      name: config.projectName,
      version: "1.0.0",
      description: config.description,
      main: "src/server.js",
      scripts: {
        start: "node src/server.js",
        dev: "nodemon src/server.js",
        test: "jest"
      },
      keywords: ["nodejs", "clean-architecture", "ddd", "api"],
      author: config.author,
      license: "MIT",
      dependencies: {
        express: "^4.18.2",
        cors: "^2.8.5",
        helmet: "^7.1.0",
        morgan: "^1.10.0",
        dotenv: "^16.3.1"
      },
      devDependencies: {
        nodemon: "^3.0.2",
        jest: "^29.7.0"
      },
      engines: {
        node: ">=16.0.0"
      }
    }, null, 2);
  }

  getReadmeTemplate(config) {
    return `# ${config.projectName}

${config.description}

## 🏗️ Clean Architecture

Ce projet utilise **Clean Architecture** avec une séparation claire des responsabilités.

### Structure des dossiers

\`\`\`
src/
├── domain/           # Couche métier (entités, value objects, repositories)
├── application/      # Cas d'usage et services applicatifs
├── infrastructure/   # Implémentations techniques (DB, HTTP, etc.)
├── presentation/     # Contrôleurs, routes, middleware
└── shared/           # Utilitaires et erreurs partagées
\`\`\`

## 🚀 Installation

\`\`\`bash
npm install
\`\`\`

## 🔧 Configuration

1. Copiez \`.env.example\` vers \`.env\`
2. Configurez vos variables d'environnement

## 🏃‍♂️ Démarrage

\`\`\`bash
# Développement
npm run dev

# Production
npm start
\`\`\`

## 👨‍💻 Auteur

${config.author}

---

*Généré avec ❤️ par Nexus CLI*
`;
  }

  getGitignoreTemplate() {
    return `# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env

# Logs
logs
*.log

# Coverage directory
coverage/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
`;
  }

  getAppJsTemplate(config) {
    const className = this.generateClassName(config.projectName);
    return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./presentation/routes');

class ${className}App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan('combined'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    this.app.use('/api', routes);
    
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(\`🚀 ${className} (Clean Architecture) démarré sur le port \${this.port}\`);
    });
  }
}

module.exports = ${className}App;
`;
  }

  getServerJsTemplate(config) {
    const className = this.generateClassName(config.projectName);
    return `const ${className}App = require('./app');

const app = new ${className}App();
app.start();
`;
  }

  getEntityBaseTemplate(config) {
    return `/**
 * Entité de base pour le domaine métier
 */
class BaseEntity {
  constructor(id) {
    if (this.constructor === BaseEntity) {
      throw new Error('BaseEntity est une classe abstraite');
    }
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Valide l'entité
   */
  validate() {
    throw new Error('La méthode validate() doit être implémentée');
  }

  /**
   * Met à jour l'entité
   */
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  /**
   * Convertit l'entité en objet simple
   */
  toJSON() {
    return Object.assign({}, this);
  }
}

module.exports = BaseEntity;
`;
  }

  getUseCaseBaseTemplate(config) {
    return `/**
 * Cas d'usage de base
 */
class BaseUseCase {
  constructor() {
    if (this.constructor === BaseUseCase) {
      throw new Error('BaseUseCase est une classe abstraite');
    }
  }

  /**
   * Exécute le cas d'usage
   */
  async execute(input) {
    throw new Error('La méthode execute() doit être implémentée');
  }

  /**
   * Valide les données d'entrée
   */
  validateInput(input) {
    return { isValid: true, errors: [] };
  }

  /**
   * Gère les erreurs
   */
  handleError(error) {
    console.error('Erreur dans le cas d\'usage:', error);
    throw error;
  }
}

module.exports = BaseUseCase;
`;
  }

  getRepositoryBaseTemplate(config) {
    return `/**
 * Repository de base pour l'accès aux données
 */
class BaseRepository {
  constructor() {
    if (this.constructor === BaseRepository) {
      throw new Error('BaseRepository est une classe abstraite');
    }
  }

  /**
   * Trouve une entité par ID
   */
  async findById(id) {
    throw new Error('La méthode findById() doit être implémentée');
  }

  /**
   * Trouve toutes les entités
   */
  async findAll() {
    throw new Error('La méthode findAll() doit être implémentée');
  }

  /**
   * Sauvegarde une entité
   */
  async save(entity) {
    throw new Error('La méthode save() doit être implémentée');
  }

  /**
   * Supprime une entité
   */
  async delete(id) {
    throw new Error('La méthode delete() doit être implémentée');
  }
}

module.exports = BaseRepository;
`;
  }

  getControllerBaseTemplate(config) {
    return `/**
 * Contrôleur de base pour la présentation
 */
class BaseController {
  /**
   * Réponse de succès
   */
  success(res, data, message = 'Opération réussie', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Réponse d'erreur
   */
  error(res, message = 'Une erreur est survenue', statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Gestionnaire d'erreur asynchrone
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = BaseController;
`;
  }

  getRoutesIndexTemplate(config) {
    return `const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'API ${config.projectName} - Clean Architecture',
    architecture: 'Clean Architecture',
    layers: ['Domain', 'Application', 'Infrastructure', 'Presentation']
  });
});

module.exports = router;
`;
  }
}

module.exports = { CleanArchitecture }; 