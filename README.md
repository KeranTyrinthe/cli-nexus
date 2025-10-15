<<<<<<< HEAD
# Nexus CLI v2

> **CLI pour generer instantanement des projets Backend, Frontend ou Fullstack avec architectures professionnelles**

Nexus évoque le point de connexion entre les développeurs et les architectures backend. C'est un nom fort, simple, et adaptable à une vision plus large dans le futur.

## Fonctionnalites

- **Types de projets**: Backend, Frontend, Fullstack
- **Selection des stacks**: React/Vue/Angular, Tailwind (optionnel), Node, DB (Postgres/MySQL/MongoDB/SQLite)
- **3 Architectures backend**: MVC, Clean Architecture, Hexagonal
- **Generation instantanee** de projets complets et structures
- **Mode interactif** ou **direct** avec flags
- **.env et .env.example** generes automatiquement

## Installation

```bash
npm install -g cli-nexus
```

## Utilisation

### Mode interactif (recommandé)

```bash
nexus-cli
```

### Mode direct (v2) avec type et stacks

```bash
nexus-cli --type=fullstack --frontend=react --css=tailwind --backend=node --database=mysql --model=mvc
```

### Options disponibles

```bash
nexus-cli --help

Options:
  -t, --type <type>           Type de projet (backend, frontend, fullstack)
      --frontend <framework>  Frontend (react, vue, angular)
      --css <tool>            Outil CSS (tailwind, none)
      --backend <runtime>     Backend (node)
      --database <db>         Base de donnee (postgres, mysql, mongodb, sqlite, none)
  -m, --model <architecture>  Architecture backend (mvc, clean, hexa)
  -d, --directory <path>      Répertoire de destination (optionnel)
  -y, --yes                   Mode non-interactif (optionnel)
      --no-install            Ne pas installer les dependances automatiquement
      --force                 Forcer la generation dans un repertoire non vide
  -v, --verbose               Mode verbeux
  -h, --help                  Affiche l'aide
  -V, --version               Affiche la version
```

## Architectures disponibles

### 1. MVC (Model-View-Controller)
- **Structure classique** et eprouvee
- **Separation claire** des responsabilites
- **Routage Express.js** preconfigure
- **Gestion des erreurs** centralisee

```
src/
├── models/          # Modèles de données
├── controllers/     # Contrôleurs de l'application
├── routes/          # Définition des routes
├── middleware/      # Middleware personnalisés
├── utils/           # Utilitaires
└── config/          # Configuration
```

### 2. Clean Architecture
- **Organisation en couches** metier
- **Independance des frameworks**
- **Testabilite elevee**
- **Inversion de dependances**

```
src/
├── domain/          # Entités et services métier
├── application/     # Cas d'usage et services applicatifs
├── infrastructure/  # Implémentations techniques
├── presentation/    # Contrôleurs, routes, middleware
└── shared/          # Utilitaires et erreurs partagées
```

### 3. Hexagonal Architecture
- **Ports et adapters** pour modularite
- **Independance des frameworks**
- **Testabilite elevee**
- **Modularite forte**

```
src/
├── domain/          # Entités et services métier
├── application/     # Cas d'usage et ports
├── infrastructure/  # Adapters (primaire et secondaire)
└── shared/          # Utilitaires et erreurs partagées
```

## Prerequis

- **Node.js** >= 16.0.0
- **npm** >= 6.0.0

## Structure generee

Chaque projet généré inclut :

- **Structure de dossiers** complete selon l'architecture
- **Fichiers de base** (package.json, README.md, .gitignore)
- **Classes de base** avec methodes communes
- **Configuration Express.js** avec middleware de securite
- **Scripts NPM** (start, dev, test)
- **Dependances** essentielles preconfigurees
- **Documentation** specifique a l'architecture

## Exemples d'utilisation

### Créer un projet MVC
```bash
nexus-cli --model=mvc --directory=mon-api-mvc
```

### Créer un projet Clean Architecture
```bash
nexus-cli --model=clean --directory=mon-api-clean
```

### Creer un projet Hexagonal
```bash
nexus-cli --model=hexa --directory=mon-api-hex
```

### Mode interactif complet
```bash
nexus-cli --directory=mon-projet
# Suivez les prompts pour configurer votre projet
```

## Demarrage rapide

1. **Installez Nexus CLI**
   ```bash
   npm install -g cli-nexus
   ```

2. **Générez votre projet**
   ```bash
   nexus-cli --model=mvc --directory=mon-api
   ```

3. **Naviguez vers votre projet**
   ```bash
   cd mon-api
   ```

4. **Installez les dépendances**
   ```bash
   npm install
   ```

5. **Démarrez en développement**
   ```bash
   npm run dev
   ```
 
6. **Testez votre API**
   ```bash
   curl http://localhost:3000/api
   curl http://localhost:3000/health
   ```

## Tests

```bash
npm test
```

## Documentation

Chaque projet généré inclut un README.md détaillé avec :
- Description de l'architecture utilisée
- Structure des dossiers
- Instructions d'installation et de démarrage
- Exemples d'utilisation

## Roadmap

- [ ] Support de frameworks additionnels (Fastify, Koa)
- [ ] Templates de base de données (MongoDB, PostgreSQL, MySQL)
- [ ] Intégration de tests automatisés
- [ ] Support de TypeScript
- [ ] Templates de déploiement (Docker, Kubernetes)
- [ ] Interface web pour la configuration

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des fonctionnalités
- Soumettre des pull requests
- Améliorer la documentation

## Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

**Keran** - CLI pour générer instantanément des projets Node.js avec architecture professionnelle

---

## Merci d'utiliser Nexus CLI !

=======
# cli-nexus
CLI pour générer instantanément des projets Backend, Frontend ou Fullstack avec des architectures professionnelles
>>>>>>> e5d42c84079e6035e37dba08ebe98957c00e4820
