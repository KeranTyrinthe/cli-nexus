const { BaseArchitecture } = require('../core/base-architecture');
const path = require('path');



class HexagonalArchitecture extends BaseArchitecture {
  constructor() {
    super();
    this.name = 'hexagonal';
    this.displayName = 'Hexagonal Architecture';
    this.description = 'Architecture modulaire avec ports et adapters pour une forte modularité';
    this.features = [
      'Séparation Ports/Adapters',
      'Indépendance des frameworks',
      'Testabilité élevée',
      'Modularité forte'
    ];
  }

  /**
   * Génère la structure Hexagonale complète
   */
  async generate(targetDir, config) {
    this.validateConfig(config);
    
    // Création de la structure des dossiers
    await this.createDirectoryStructure(targetDir);
    
    // Génération des fichiers de base
    await this.generateBaseFiles(targetDir, config);
    
    // Génération des fichiers spécifiques Hexagonale
    await this.generateArchitectureFiles(targetDir, config);
  }

  /**
   * Crée la structure des dossiers Hexagonale
   */
  async createDirectoryStructure(targetDir) {
    const directories = [
      'src/domain/entities',
      'src/domain/services',
      'src/domain/ports',
      'src/application/use-cases',
      'src/application/ports',
      'src/infrastructure/adapters/primary',
      'src/infrastructure/adapters/secondary',
      'src/infrastructure/config',
      'src/infrastructure/database',
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
   * Génère les fichiers spécifiques à l'architecture Hexagonale
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

    // Port de base
    const portBase = this.getPortBaseTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/domain/ports/base.port.js'), portBase);

    // Use Case de base
    const useCaseBase = this.getUseCaseBaseTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/application/use-cases/base.use-case.js'), useCaseBase);

    // Adapter primaire de base
    const primaryAdapterBase = this.getPrimaryAdapterBaseTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/infrastructure/adapters/primary/base.adapter.js'), primaryAdapterBase);

    // Adapter secondaire de base
    const secondaryAdapterBase = this.getSecondaryAdapterBaseTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/infrastructure/adapters/secondary/base.adapter.js'), secondaryAdapterBase);

    // Routes principales
    const routesIndex = this.getRoutesIndexTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/infrastructure/adapters/primary/routes.js'), routesIndex);
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
      keywords: ["nodejs", "hexagonal-architecture", "ports-adapters", "api"],
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

## 🏗️ Architecture Hexagonale

Ce projet utilise **Hexagonal Architecture (Ports & Adapters)** pour une forte modularité.

### Structure des dossiers

\`\`\`
src/
├── domain/           # Entités et services métier
├── application/      # Cas d'usage et ports
├── infrastructure/   # Adapters (primaire et secondaire)
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

const routes = require('./infrastructure/adapters/primary/routes');

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
      console.log(\`🚀 ${className} (Hexagonal Architecture) démarré sur le port \${this.port}\`);
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

  getPortBaseTemplate(config) {
    return `/**
 * Port de base pour l'architecture hexagonale
 */
class BasePort {
  constructor() {
    if (this.constructor === BasePort) {
      throw new Error('BasePort est une classe abstraite');
    }
  }

  /**
   * Exécute l'opération du port
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
}

module.exports = BasePort;
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

  getPrimaryAdapterBaseTemplate(config) {
    return `/**
 * Adapter primaire de base (entrée)
 */
class BasePrimaryAdapter {
  constructor() {
    if (this.constructor === BasePrimaryAdapter) {
      throw new Error('BasePrimaryAdapter est une classe abstraite');
    }
  }

  /**
   * Traite la requête entrante
   */
  async handleRequest(req, res) {
    throw new Error('La méthode handleRequest() doit être implémentée');
  }

  /**
   * Valide les données de la requête
   */
  validateRequest(req) {
    return { isValid: true, errors: [] };
  }

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
}

module.exports = BasePrimaryAdapter;
`;
  }

  getSecondaryAdapterBaseTemplate(config) {
    return `/**
 * Adapter secondaire de base (sortie)
 */
class BaseSecondaryAdapter {
  constructor() {
    if (this.constructor === BaseSecondaryAdapter) {
      throw new Error('BaseSecondaryAdapter est une classe abstraite');
    }
  }

  /**
   * Exécute l'opération de l'adapter
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
    console.error('Erreur dans l\'adapter secondaire:', error);
    throw error;
  }
}

module.exports = BaseSecondaryAdapter;
`;
  }

  getRoutesIndexTemplate(config) {
    return `const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'API ${config.projectName} - Hexagonal Architecture',
    architecture: 'Hexagonal Architecture',
    concept: 'Ports & Adapters',
    adapters: ['Primary (Entrée)', 'Secondary (Sortie)']
  });
});

module.exports = router;
`;
  }
}

module.exports = { HexagonalArchitecture }; 