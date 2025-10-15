const path = require('path');
const fs = require('fs-extra');

/**
 * Validateur de projet pour vérifier la configuration et les paramètres
 */
class ProjectValidator {
  constructor() {}

  /**
   * Valide la configuration complète du projet
   */
  validateProjectConfig(config) {
    const errors = [];

    // Validation des champs requis
    if (!config.projectName || !config.projectName.trim()) {
      errors.push('Le nom du projet est requis');
    }

    if (!config.description || !config.description.trim()) {
      errors.push('La description du projet est requise');
    }

    if (!config.author || !config.author.trim()) {
      errors.push('L\'auteur du projet est requis');
    }

    // Validation du nom du projet
    if (config.projectName) {
      if (!/^[a-z0-9-]+$/.test(config.projectName)) {
        errors.push('Le nom du projet doit contenir uniquement des lettres minuscules, chiffres et tirets');
      }

      if (config.projectName.length < 3) {
        errors.push('Le nom du projet doit contenir au moins 3 caractères');
      }

      if (config.projectName.length > 50) {
        errors.push('Le nom du projet ne peut pas dépasser 50 caractères');
      }
    }

    // Validation de la description
    if (config.description && config.description.length > 500) {
      errors.push('La description ne peut pas dépasser 500 caractères');
    }

    // Validation du gestionnaire de paquets
    const validPackageManagers = ['npm', 'yarn', 'pnpm'];
    if (!validPackageManagers.includes(config.packageManager)) {
      errors.push(`Le gestionnaire de paquets doit être l'un de: ${validPackageManagers.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new Error(`Erreurs de validation:\n${errors.join('\n')}`);
    }

    return true;
  }

  /**
   * Valide le répertoire de destination
   */
  async validateDirectory(directory) {
    const targetDir = path.resolve(directory);
    
    try {
      // Vérifie si le répertoire existe
      if (await fs.pathExists(targetDir)) {
        // Vérifie si le répertoire est accessible en écriture
        try {
          await fs.access(targetDir, fs.constants.W_OK);
        } catch (error) {
          throw new Error(`Le répertoire '${targetDir}' n'est pas accessible en écriture`);
        }

        // Vérifie le contenu du répertoire
        const contents = await fs.readdir(targetDir);
        if (contents.length > 0) {
          return {
            exists: true,
            isEmpty: false,
            contents,
            path: targetDir
          };
        }
      }

      return {
        exists: false,
        isEmpty: true,
        contents: [],
        path: targetDir
      };

    } catch (error) {
      throw new Error(`Erreur lors de la validation du répertoire: ${error.message}`);
    }
  }

  /**
   * Vérifie si un nom de projet est valide
   */
  validateProjectName(name) {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: 'Le nom du projet est requis' };
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      return { isValid: false, error: 'Le nom du projet ne peut pas être vide' };
    }

    if (trimmedName.length < 3) {
      return { isValid: false, error: 'Le nom du projet doit contenir au moins 3 caractères' };
    }

    if (trimmedName.length > 50) {
      return { isValid: false, error: 'Le nom du projet ne peut pas dépasser 50 caractères' };
    }

    if (!/^[a-z0-9-]+$/.test(trimmedName)) {
      return { isValid: false, error: 'Le nom du projet doit contenir uniquement des lettres minuscules, chiffres et tirets' };
    }

    // Vérification des mots réservés
    const reservedWords = ['node', 'npm', 'yarn', 'pnpm', 'package', 'module', 'test', 'src', 'dist', 'build'];
    if (reservedWords.includes(trimmedName.toLowerCase())) {
      return { isValid: false, error: `'${trimmedName}' est un nom réservé et ne peut pas être utilisé` };
    }

    return { isValid: true, error: null };
  }

  /**
   * Vérifie si une architecture est valide
   */
  validateArchitecture(architecture) {
    const validArchitectures = ['mvc', 'clean', 'hexagonal', 'hexa'];
    
    if (!validArchitectures.includes(architecture)) {
      return {
        isValid: false,
        error: `Architecture '${architecture}' non reconnue. Utilisez: ${validArchitectures.join(', ')}`
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Vérifie le type de projet
   */
  validateProjectType(type) {
    const allowed = ['backend', 'frontend', 'fullstack'];
    return { isValid: allowed.includes((type || '').toLowerCase()), error: `Type de projet invalide. Utilisez: ${allowed.join(', ')}` };
  }

  /**
   * Vérifie la base de données
   */
  validateDatabase(db) {
    const allowed = ['postgres', 'mysql', 'mongodb', 'sqlite', 'none'];
    return { isValid: allowed.includes((db || 'none').toLowerCase()), error: `Base de donnee invalide. Utilisez: ${allowed.join(', ')}` };
  }

  /**
   * Vérifie le framework frontend et l'outil CSS
   */
  validateFrontend({ framework, css }) {
    const fw = ['react', 'vue', 'angular'];
    const cssAllowed = ['tailwind', 'none'];
    const okFw = fw.includes((framework || '').toLowerCase());
    const okCss = cssAllowed.includes((css || 'none').toLowerCase());
    return { isValid: okFw && okCss, error: `Frontend invalide. Framework: ${fw.join(', ')} | CSS: ${cssAllowed.join(', ')}` };
  }

  /**
   * Vérifie les prérequis système
   */
  async checkSystemRequirements() {
    const requirements = [];

    try {
      // Vérification de Node.js
      const nodeVersion = process.version;
      const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (nodeMajor < 16) {
        requirements.push({
          name: 'Node.js',
          required: '>=16.0.0',
          current: nodeVersion,
          status: 'error'
        });
      } else {
        requirements.push({
          name: 'Node.js',
          required: '>=16.0.0',
          current: nodeVersion,
          status: 'ok'
        });
      }

      // Vérification de npm
      try {
        const { execSync } = require('child_process');
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        requirements.push({
          name: 'npm',
          required: '>=6.0.0',
          current: npmVersion,
          status: 'ok'
        });
      } catch (error) {
        requirements.push({
          name: 'npm',
          required: '>=6.0.0',
          current: 'Non installé',
          status: 'error'
        });
      }

    } catch (error) {
      requirements.push({
        name: 'Système',
        required: 'Vérification',
        current: 'Erreur',
        status: 'error',
        details: error.message
      });
    }

    return requirements;
  }

  /**
   * Vérifie si tous les prérequis sont satisfaits
   */
  async areRequirementsMet() {
    const requirements = await this.checkSystemRequirements();
    const errors = requirements.filter(req => req.status === 'error');
    
    return {
      met: errors.length === 0,
      requirements,
      errors
    };
  }
}

module.exports = { ProjectValidator }; 