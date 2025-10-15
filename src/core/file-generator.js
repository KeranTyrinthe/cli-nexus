const fs = require('fs-extra');
const path = require('path');

/**
 * Générateur de fichiers pour la structure de base des projets
 */
class FileGenerator {
  constructor() {}

  /**
   * Crée la structure de base du projet
   */
  async createProjectStructure(targetDir, config) {
    try {
      // Création du répertoire racine
      await fs.ensureDir(targetDir);
      
      // Création des dossiers de base
      const baseDirs = [
        'src',
        'public',
        'tests',
        'docs',
        'logs',
        'scripts'
      ];

      for (const dir of baseDirs) {
        await fs.ensureDir(path.join(targetDir, dir));
      }

      // Création des sous-dossiers publics
      const publicDirs = ['css', 'js', 'images'];
      for (const dir of publicDirs) {
        await fs.ensureDir(path.join(targetDir, 'public', dir));
      }

      // Création des sous-dossiers de tests
      const testDirs = ['unit', 'integration', 'e2e'];
      for (const dir of testDirs) {
        await fs.ensureDir(path.join(targetDir, 'tests', dir));
      }

      console.log('✅ Structure de base créée avec succès');
      
    } catch (error) {
      throw new Error(`Erreur lors de la création de la structure: ${error.message}`);
    }
  }

  /**
   * Crée un fichier avec gestion d'erreur
   */
  async createFile(filePath, content) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Erreur lors de la création du fichier ${filePath}: ${error.message}`);
    }
  }

  /**
   * Copie un fichier template
   */
  async copyTemplate(templatePath, targetPath) {
    try {
      await fs.ensureDir(path.dirname(targetPath));
      await fs.copy(templatePath, targetPath);
    } catch (error) {
      throw new Error(`Erreur lors de la copie du template: ${error.message}`);
    }
  }

  /**
   * Vérifie si un fichier existe
   */
  async fileExists(filePath) {
    return await fs.pathExists(filePath);
  }

  /**
   * Lit le contenu d'un fichier
   */
  async readFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Erreur lors de la lecture du fichier ${filePath}: ${error.message}`);
    }
  }
}

module.exports = { FileGenerator }; 