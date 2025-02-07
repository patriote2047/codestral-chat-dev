# Guide du Développeur - Codyman

## Table des Matières

1. [Architecture du Projet](#architecture-du-projet)
2. [Configuration du Projet](#configuration-du-projet)
3. [Standards de Code](#standards-de-code)
4. [Workflow de Développement](#workflow-de-développement)
5. [Tests et Qualité](#tests-et-qualité)
6. [Déploiement](#déploiement)
7. [Gestion des Erreurs et Logging](#gestion-des-erreurs-et-logging)
8. [Sécurité et Meilleures Pratiques](#sécurité-et-meilleures-pratiques)

## Architecture du Projet

### Structure des Dossiers

```
.
├── src/
│   └── app/
│       ├── api/           # Routes API et endpoints
│       ├── components/    # Composants React réutilisables
│       │   └── sections/  # Sections principales de l'application
│       ├── contexts/      # Contextes React (état global)
│       ├── middleware/    # Middleware Next.js
│       ├── pages/        # Pages de l'application
│       ├── styles/       # Styles CSS/modules
│       └── utils/        # Fonctions utilitaires
├── public/              # Assets statiques
├── scripts/            # Scripts utilitaires
├── __mocks__/         # Mocks pour les tests
└── exemples/          # Exemples de code
```

### Technologies Principales

- **Framework** : Next.js avec App Router
- **Language** : TypeScript/JavaScript
- **Styles** : CSS Modules
- **Tests** : Jest
- **Linting** : ESLint + Prettier
- **Build** : SWC

## Configuration du Projet

### Prérequis

- Node.js (version LTS recommandée)
- npm ou yarn
- Git

### Installation

```bash
# Installation des dépendances
npm install

# Configuration des hooks git
npm run prepare

# Démarrage en développement
npm run dev
```

### Variables d'Environnement

Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Scripts NPM Disponibles

```bash
# Développement
npm run dev          # Démarre le serveur de développement
npm run build        # Build le projet pour la production
npm run start        # Démarre le serveur de production

# Qualité de Code
npm run lint         # Vérifie et corrige le code avec ESLint
npm run format       # Formate le code avec Prettier
npm run type-check   # Vérifie les types TypeScript
npm run validate     # Exécute type-check, lint et format en parallèle

# Tests
npm run test         # Exécute les tests avec couverture

# Maintenance
npm run clean        # Supprime les dossiers de build
npm run clean:all    # Supprime build et node_modules
npm run reinstall    # Réinstalle toutes les dépendances

# Gestion des Dépendances
npm run deps:check   # Vérifie les mises à jour disponibles
npm run deps:update  # Met à jour toutes les dépendances
npm run deps:audit   # Corrige les vulnérabilités
npm run update       # Exécute check, update et audit
```

### Dépendances Principales

- **next** (15.1.6) : Framework React
- **react** (19.0.0) : Bibliothèque UI
- **react-dom** (19.0.0) : Rendu React
- **styled-components** (6.1.14) : Styling CSS-in-JS

### Dépendances de Développement

- **TypeScript** (5.3.3) : Support du typage statique
- **ESLint** (8.56.0) : Linting du code
- **Prettier** (3.4.2) : Formatage du code
- **Jest** (29.7.0) : Framework de test
- **@testing-library/react** (16.2.0) : Tests des composants React
- **npm-check-updates** (16.14.20) : Gestion des mises à jour
- **npm-run-all** (4.1.5) : Exécution parallèle des scripts
- **rimraf** (5.0.10) : Nettoyage des dossiers

## Standards de Code

### Conventions de Nommage

#### Fichiers et Dossiers

- Composants React : `PascalCase.tsx` (ex: `UserProfile.tsx`)
- Modules utilitaires : `camelCase.ts` (ex: `apiUtils.ts`)
- Tests : `*.test.ts` ou `*.test.tsx`
- Styles : `ComponentName.module.css`

#### Composants React

```typescript
// Composant fonctionnel avec TypeScript
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
    return (
        <div>
            {/* JSX */}
        </div>
    );
};

export default ComponentName;
```

#### Hooks Personnalisés

```typescript
// Préfixe 'use' obligatoire
export const useCustomHook = () => {
    // Logic
};
```

#### Fonctions et Variables

- Fonctions : camelCase, verbe + nom (ex: `fetchUserData`)
- Handlers : préfixe 'handle' (ex: `handleSubmit`)
- Constantes : UPPER_SNAKE_CASE
- Variables : camelCase
- Booléens : préfixe is/has/should (ex: `isLoading`)

### Style de Code

#### TypeScript

```typescript
// Interfaces
interface UserProps {
    id: string;
    name: string;
    email?: string; // Optionnel
}

// Types
type Status = 'idle' | 'loading' | 'success' | 'error';
```

#### CSS Modules

```css
/* ComponentName.module.css */
.container {
    /* styles */
}

.buttonPrimary {
    /* styles */
}
```

#### Règles de Formatage (Prettier)

```json
{
    "semi": true, // Point-virgule obligatoire
    "singleQuote": true, // Guillemets simples
    "tabWidth": 4, // Indentation de 4 espaces
    "printWidth": 100, // Longueur maximale des lignes
    "trailingComma": "es5", // Virgule finale (ES5)
    "endOfLine": "auto", // Détection automatique des fins de ligne
    "bracketSpacing": true, // Espaces dans les objets
    "arrowParens": "always", // Parenthèses pour les fonctions fléchées
    "jsxSingleQuote": false, // Guillemets doubles pour JSX
    "jsxBracketSameLine": false // Balise JSX fermante sur nouvelle ligne
}
```

Ces règles sont automatiquement appliquées lors de la sauvegarde des fichiers et lors de l'exécution de `npm run format`.

#### Bonnes Pratiques de Code

1. **Nommage**

    - Utiliser des noms descriptifs et significatifs
    - Éviter les abréviations sauf si elles sont standard
    - Préfixer les booléens avec is/has/should
    - Utiliser PascalCase pour les composants React
    - Utiliser camelCase pour les fonctions et variables

2. **Organisation du Code**

    - Un composant par fichier
    - Imports groupés et ordonnés :
        1. Imports de bibliothèques externes
        2. Imports de composants internes
        3. Imports de styles et assets
    - Exports nommés préférés aux exports par défaut
    - Destructuration des props

3. **Composants React**

    ```typescript
    // Bon exemple
    import React from 'react';
    import { SomeType } from '@/types';
    import styles from './Component.module.css';

    interface ComponentProps {
        data: SomeType;
        onAction: (id: string) => void;
    }

    export const Component: React.FC<ComponentProps> = ({ data, onAction }) => {
        // Logic here
        return (
            <div className={styles.container}>
                {/* JSX here */}
            </div>
        );
    };
    ```

4. **Gestion d'État**

    - Préférer les hooks personnalisés pour la logique réutilisable
    - Utiliser le Context API pour l'état global
    - Éviter la prop drilling
    - Maintenir l'état au niveau le plus bas possible

5. **Performance**
    - Utiliser React.memo pour les composants purement présentationnels
    - Éviter les calculs inutiles dans le rendu
    - Utiliser useMemo et useCallback judicieusement
    - Lazy loading des composants lourds

## Workflow de Développement

### Git Flow

1. Branches principales :

    - `main` : Production
    - `develop` : Développement
    - `feature/*` : Nouvelles fonctionnalités
    - `bugfix/*` : Corrections de bugs
    - `hotfix/*` : Corrections urgentes

2. Convention de Commits :

```
<type>(<scope>): <description>

[corps]

[footer]
```

Types :

- feat: Nouvelle fonctionnalité
- fix: Correction de bug
- docs: Documentation
- style: Formatage
- refactor: Refactorisation
- test: Tests
- chore: Maintenance

### Process de Review

1. Créer une Pull Request
2. Passer les checks automatiques
3. Code review par au moins 1 développeur
4. Tests passés
5. Merge après approbation

## Tests et Qualité

### Tests Unitaires

```typescript
describe('Component/Function', () => {
    it('should do something', () => {
        // Test
    });
});
```

### Tests d'Intégration

- Utilisation de Jest
- Mock des API avec MSW
- Tests e2e avec Cypress (à venir)

### Linting et Formatage

```bash
# Vérification du code
npm run lint

# Formatage automatique
npm run format
```

### Performance

- Utilisation de Lighthouse
- Optimisation des images
- Code splitting automatique
- Lazy loading des composants

## Déploiement

### Environnements

- Development : `dev.example.com`
- Staging : `staging.example.com`
- Production : `example.com`

### Process de Déploiement

1. Tests automatisés
2. Build de production
3. Déploiement sur l'environnement cible
4. Vérifications post-déploiement

### Monitoring

- Logs applicatifs
- Métriques de performance
- Alerting en cas d'erreur

## Bonnes Pratiques

### Sécurité

- Validation des entrées
- Sanitization des données
- Protection CSRF
- Headers de sécurité

### Accessibilité

- Support ARIA
- Tests de contraste
- Navigation au clavier
- Support des lecteurs d'écran

### Performance

- Optimisation des images
- Lazy loading
- Mise en cache
- Code splitting

### Maintenance

- Documentation à jour
- Clean code
- DRY (Don't Repeat Yourself)
- SOLID principles

## Support et Resources

### Documentation Externe

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Contact

- Tech Lead : [email]
- DevOps : [email]
- Support : [email]

## Gestion des Erreurs et Logging

### Structure des Erreurs

```typescript
// Exemple de classe d'erreur personnalisée
class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code: string,
        public timestamp = new Date()
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Utilisation
throw new ApiError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
```

### Hiérarchie des Erreurs

- `ValidationError` : Erreurs de validation des données
- `AuthenticationError` : Erreurs d'authentification
- `AuthorizationError` : Erreurs d'autorisation
- `ApiError` : Erreurs liées aux appels API
- `BusinessError` : Erreurs métier

### Gestion des Erreurs

```typescript
try {
    // Code pouvant générer une erreur
} catch (error) {
    if (error instanceof ApiError) {
        // Gestion spécifique des erreurs API
        logger.error('API Error:', {
            message: error.message,
            status: error.status,
            code: error.code,
            timestamp: error.timestamp,
        });
    } else {
        // Erreurs inattendues
        logger.error('Unexpected Error:', error);
    }
}
```

### Logging

- Utiliser des niveaux de log appropriés :
    - `error` : Erreurs bloquantes
    - `warn` : Avertissements
    - `info` : Informations importantes
    - `debug` : Informations de débogage
    - `trace` : Informations détaillées (développement)

### Bonnes Pratiques de Logging

1. **Structuration**

    ```typescript
    logger.error('Action failed', {
        action: 'createUser',
        userId: user.id,
        error: error.message,
        stack: error.stack,
    });
    ```

2. **Contexte**

    - Toujours inclure des informations de contexte
    - Éviter les informations sensibles
    - Inclure les IDs de corrélation
    - Timestamp automatique

3. **Performance**
    - Logging asynchrone
    - Rotation des logs
    - Nettoyage automatique
    - Agrégation des logs

### Monitoring et Alertes

1. **Métriques Clés**

    - Taux d'erreur
    - Latence des requêtes
    - Utilisation des ressources
    - Taux de succès des opérations

2. **Alertes**
    - Seuils d'erreurs
    - Latence anormale
    - Erreurs critiques
    - Problèmes de sécurité

## Sécurité et Meilleures Pratiques

### Sécurité des Données

1. **Authentification**

    ```typescript
    // Utilisation de JWT avec refresh token
    interface TokenPayload {
        userId: string;
        roles: string[];
        exp: number;
    }

    // Validation du token
    const validateToken = (token: string): TokenPayload => {
        try {
            return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
        } catch (error) {
            throw new AuthenticationError('Invalid token');
        }
    };
    ```

2. **Autorisation**

    ```typescript
    // Middleware de vérification des rôles
    const requireRole = (role: string) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const user = req.user;
            if (!user?.roles.includes(role)) {
                throw new AuthorizationError('Insufficient permissions');
            }
            next();
        };
    };
    ```

3. **Protection des Données**
    - Chiffrement des données sensibles
    - Hachage des mots de passe (bcrypt)
    - Sanitization des entrées utilisateur
    - Validation des données

### Sécurité des API

1. **Rate Limiting**

    ```typescript
    // Configuration du rate limiting
    const rateLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limite par IP
        message: 'Too many requests, please try again later',
    });
    ```

2. **Protection CSRF**

    - Tokens CSRF pour les formulaires
    - Validation de l'origine des requêtes
    - Headers de sécurité appropriés

3. **Validation des Entrées**

    ```typescript
    // Exemple avec Zod
    const UserSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
    });

    // Validation
    const validateUser = (data: unknown) => {
        return UserSchema.parse(data);
    };
    ```

### Meilleures Pratiques de Sécurité

1. **Configuration**

    - Variables d'environnement sécurisées
    - Secrets gérés avec un gestionnaire de secrets
    - Configuration CORS stricte
    - Headers de sécurité HTTP

2. **Code**

    - Pas de secrets dans le code
    - Validation stricte des types
    - Gestion appropriée des erreurs
    - Logging sécurisé

3. **Infrastructure**
    - HTTPS obligatoire
    - Mise à jour régulière des dépendances
    - Scan de vulnérabilités
    - Backups sécurisés

### Audit et Conformité

1. **Logs de Sécurité**

    ```typescript
    // Exemple de log de sécurité
    const logSecurityEvent = (event: SecurityEvent) => {
        logger.security({
            type: event.type,
            user: event.userId,
            action: event.action,
            ip: event.ip,
            timestamp: new Date(),
            details: event.details,
        });
    };
    ```

2. **Monitoring**

    - Détection des intrusions
    - Alertes de sécurité
    - Audit des accès
    - Analyse des logs

3. **Conformité**
    - RGPD/GDPR
    - Normes de sécurité
    - Documentation
    - Procédures d'incident

---

_Dernière mise à jour : [date]_

> Note : Ce document est vivant et sera mis à jour régulièrement pour refléter les évolutions des pratiques de l'équipe.
