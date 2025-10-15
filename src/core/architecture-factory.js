const { MVCArchitecture } = require('../architectures/mvc-architecture');
const { CleanArchitecture } = require('../architectures/clean-architecture');
const { HexagonalArchitecture } = require('../architectures/hexagonal-architecture');

/**
 * Factory pour créer les instances d'architecture
 * Centralise la logique de création et de gestion des architectures
 */
class ArchitectureFactory {
  constructor() {
    this.architectures = new Map();
    this.registerArchitectures();
  }

  /**
   * Enregistre toutes les architectures disponibles
   */
  registerArchitectures() {
    this.architectures.set('mvc', new MVCArchitecture());
    this.architectures.set('clean', new CleanArchitecture());
    this.architectures.set('hexa', new HexagonalArchitecture());
    this.architectures.set('hexagonal', new HexagonalArchitecture()); // Alias pour compatibilite
  }

  /**
   * Récupère une architecture par son nom
   */
  getArchitecture(name) {
    return this.architectures.get(name.toLowerCase());
  }

  /**
   * Liste toutes les architectures disponibles
   */
  getAvailableArchitectures() {
    return Array.from(this.architectures.keys());
  }

  /**
   * Vérifie si une architecture existe
   */
  hasArchitecture(name) {
    return this.architectures.has(name.toLowerCase());
  }

  /**
   * Récupère les informations sur toutes les architectures
   */
  getArchitectureInfo() {
    const info = [];
    
    for (const [name, architecture] of this.architectures) {
      info.push({
        name,
        displayName: architecture.displayName,
        description: architecture.description,
        features: architecture.features
      });
    }
    
    return info;
  }
}

module.exports = { ArchitectureFactory }; 