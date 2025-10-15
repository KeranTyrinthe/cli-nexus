/**
 * Classe de base abstraite pour toutes les architectures
 * Définit l'interface commune et les méthodes abstraites
 */
class BaseArchitecture {
  constructor() {
    if (this.constructor === BaseArchitecture) {
      throw new Error('BaseArchitecture est une classe abstraite et ne peut pas être instanciée directement');
    }
    
    this.name = '';
    this.displayName = '';
    this.description = '';
    this.features = [];
  }

  /**
   * Méthode abstraite : génère la structure de l'architecture
   * Doit être implémentée par chaque architecture
   */
  async generate(targetDir, config) {
    throw new Error('La méthode generate() doit être implémentée par la classe fille');
  }

  /**
   * Méthode abstraite : crée la structure des dossiers
   * Doit être implémentée par chaque architecture
   */
  async createDirectoryStructure(targetDir) {
    throw new Error('La méthode createDirectoryStructure() doit être implémentée par la classe fille');
  }

  /**
   * Méthode abstraite : génère les fichiers de base
   * Doit être implémentée par chaque architecture
   */
  async generateBaseFiles(targetDir, config) {
    throw new Error('La méthode generateBaseFiles() doit être implémentée par la classe fille');
  }

  /**
   * Méthode abstraite : génère les fichiers spécifiques à l'architecture
   * Doit être implémentée par chaque architecture
   */
  async generateArchitectureFiles(targetDir, config) {
    throw new Error('La méthode generateArchitectureFiles() doit être implémentée par la classe fille');
  }

  /**
   * Méthode utilitaire : crée un dossier et ses parents si nécessaire
   */
  async ensureDirectory(dirPath) {
    const fs = require('fs-extra');
    await fs.ensureDir(dirPath);
  }

  /**
   * Méthode utilitaire : écrit un fichier avec gestion d'erreur
   */
  async writeFile(filePath, content) {
    const fs = require('fs-extra');
    try {
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Erreur lors de l'écriture du fichier ${filePath}: ${error.message}`);
    }
  }

  /**
   * Méthode utilitaire : copie un fichier template
   */
  async copyTemplate(templatePath, targetPath) {
    const fs = require('fs-extra');
    try {
      await fs.copy(templatePath, targetPath);
    } catch (error) {
      throw new Error(`Erreur lors de la copie du template ${templatePath}: ${error.message}`);
    }
  }

  /**
   * Méthode utilitaire : remplace les variables dans un template
   */
  replaceTemplateVariables(template, variables) {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  /**
   * Méthode utilitaire : valide la configuration du projet
   */
  validateConfig(config) {
    const required = ['projectName', 'description', 'author'];
    
    for (const field of required) {
      if (!config[field] || !config[field].trim()) {
        throw new Error(`Le champ '${field}' est requis dans la configuration`);
      }
    }
    
    return true;
  }

  /**
   * Méthode utilitaire : génère un nom de classe à partir du nom du projet
   */
  generateClassName(projectName) {
    return projectName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Méthode utilitaire : génère un nom de variable à partir du nom du projet
   */
  generateVariableName(projectName) {
    return projectName
      .split('-')
      .map((word, index) => 
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
  }
}

module.exports = { BaseArchitecture }; 