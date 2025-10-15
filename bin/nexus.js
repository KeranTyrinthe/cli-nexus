#!/usr/bin/env node

/**
 * Nexus CLI - Generateur de projets Node.js avec architecture professionnelle
 * 
 * Usage:
 *   nexus-cli                    # Mode interactif
 *   nexus-cli --model=mvc       # Generation directe MVC
 *   nexus-cli --model=clean     # Generation directe Clean Architecture
 *   nexus-cli --model=hexa      # Generation directe Hexagonal
 *   nexus-cli --help            # Aide
 */

const { Command } = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');
const { NexusCLI } = require('../src/core/nexus-cli');
const pkg = require('../package.json');

// Configuration du programme principal
const program = new Command();

// Affichage du banner Nexus
console.log(chalk.blue(figlet.textSync('NEXUS', { horizontalLayout: 'full' })));
console.log(chalk.gray('CLI pour generer des projets Backend, Frontend ou Fullstack avec architectures professionnelles\n'));

// Configuration des options
program
  .name('nexus-cli')
  .description('Generateur de projets fullstack (backend, frontend ou fullstack) avec architectures professionnelles')
  .version(pkg.version)
  // v1 compat
  .option('-m, --model <architecture>', 'Architecture a generer (mvc, clean, hexa)')
  // v2 options
  .option('-t, --type <type>', 'Type de projet (backend, frontend, fullstack)')
  .option('--frontend <framework>', 'Framework frontend (react, vue, angular)')
  .option('--css <tool>', 'Outil CSS (tailwind, none)', 'none')
  .option('--frontend-architecture <fa>', 'Architecture frontend (default, mvc, clean, hexa)', 'default')
  .option('--backend <runtime>', 'Backend runtime (node)', 'node')
  .option('--database <db>', 'Base de donnee (postgres, mysql, mongodb, sqlite, none)', 'none')
  .option('-d, --directory <path>', 'Répertoire de destination (défaut: ./)')
  .option('-y, --yes', 'Répondre oui à toutes les questions')
  .option('--no-install', 'Ne pas installer les dependances automatiquement')
  .option('--force', 'Forcer la generation dans un repertoire non vide')
  .option('-v, --verbose', 'Mode verbeux');

// Action principale
program.action(async (options) => {
  try {
    const cli = new NexusCLI();
    // Sanitize options: ignore defaults for v2 flags unless user explicitly provided them
    const v2Flags = ['type', 'frontend', 'css', 'backend', 'database'];
    const sanitized = { ...options };
    for (const flag of v2Flags) {
      const source = program.getOptionValueSource(flag);
      if (source !== 'cli' && flag in sanitized) {
        delete sanitized[flag];
      }
    }
    await cli.execute(sanitized);
  } catch (error) {
    console.error(chalk.red('Erreur:'), error.message);
    if (options.verbose) {
      console.error(chalk.gray('Stack trace:'), error.stack);
    }
    process.exit(1);
  }
});

// Gestion des erreurs globales
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Promesse rejetee non geree:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Exception non capturee:'), error.message);
  process.exit(1);
});

// Parse des arguments
program.parse();