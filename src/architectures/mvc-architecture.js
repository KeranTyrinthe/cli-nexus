const { BaseArchitecture } = require('../core/base-architecture');
const path = require('path');

/**
 * Architecture MVC (Model-View-Controller)
 * Structure classique et éprouvée pour les applications web
 */
class MVCArchitecture extends BaseArchitecture {
  constructor() {
    super();
    this.name = 'mvc';
    this.displayName = 'MVC (Model-View-Controller)';
    this.description = 'Architecture classique avec séparation claire des responsabilités';
    this.features = [
      'Séparation Models/Views/Controllers',
      'Structure de dossiers claire',
      'Routage Express.js',
      'Gestion des erreurs centralisée'
    ];
  }

  /**
   * Génère la structure MVC complète
   */
  async generate(targetDir, config) {
    this.validateConfig(config);
    
    // Création de la structure des dossiers
    await this.createDirectoryStructure(targetDir);
    
    // Génération des fichiers de base
    await this.generateBaseFiles(targetDir, config);
    
    // Génération des fichiers spécifiques MVC
    await this.generateArchitectureFiles(targetDir, config);
  }

  /**
   * Crée la structure des dossiers MVC
   */
  async createDirectoryStructure(targetDir) {
    const directories = [
      'src/models',
      'src/controllers',
      'src/routes',
      'src/middleware',
      'src/config',
      'src/utils'
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
   * Génère les fichiers spécifiques à l'architecture MVC
   */
  async generateArchitectureFiles(targetDir, config) {
    // Point d'entrée principal
    const appJs = this.getAppJsTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/app.js'), appJs);

    // Serveur
    const serverJs = this.getServerJsTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/server.js'), serverJs);

    // Routes principales
    const routesIndex = this.getRoutesIndexTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/routes/index.js'), routesIndex);

    // Controllers
    const controllerBase = this.getControllerBaseTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/controllers/base.controller.js'), controllerBase);

    // Models
    const modelBase = this.getModelBaseTemplate(config);
    await this.writeFile(path.join(targetDir, 'src/models/base.model.js'), modelBase);
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
      keywords: ["nodejs", "express", "mvc", "api"],
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

## 🏗️ Architecture MVC

Ce projet utilise l'architecture **MVC (Model-View-Controller)** avec Express.js.

### Structure des dossiers

\`\`\`
src/
├── controllers/     # Contrôleurs de l'application
├── models/         # Modèles de données
├── routes/         # Définition des routes
├── middleware/     # Middleware personnalisés
├── utils/          # Utilitaires
└── config/         # Configuration
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

const routes = require('./routes');

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
      console.log(\`🚀 ${className} démarré sur le port \${this.port}\`);
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

  getRoutesIndexTemplate(config) {
    return `const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API ${config.projectName} - Architecture MVC' });
});

module.exports = router;
`;
  }

  getControllerBaseTemplate(config) {
    return `class BaseController {
  success(res, data, message = 'Opération réussie', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  error(res, message = 'Une erreur est survenue', statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = BaseController;
`;
  }

  getModelBaseTemplate(config) {
    return `class BaseModel {
  constructor() {
    if (this.constructor === BaseModel) {
      throw new Error('BaseModel est une classe abstraite');
    }
  }

  validate(data) {
    throw new Error('La méthode validate() doit être implémentée');
  }

  toJSON() {
    return Object.assign({}, this);
  }
}

module.exports = BaseModel;
`;
  }
}

module.exports = { MVCArchitecture }; 