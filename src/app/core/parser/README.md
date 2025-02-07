# Core Parser Module

Le Parser est un composant central (core) de Codyman qui fournit des capacités d'analyse syntaxique de code pour JavaScript et TypeScript. Il est utilisé par plusieurs parties de l'application pour l'analyse de code, la génération de suggestions, et plus encore.

## Utilisation

```typescript
import { parseCode } from '@/app/core/parser';

// Exemple simple
const code = 'function add(a: number, b: number) { return a + b; }';
const ast = parseCode(code);

// Avec options
const ast = parseCode(code, {
    language: 'typescript',
    sourceType: 'module',
});
```

## API

### `parseCode(code: string, options?: ParserOptions): AST`

Fonction principale pour parser du code source en AST.

#### Options

```typescript
interface ParserOptions {
    language?: 'javascript' | 'typescript';
    sourceType?: 'module' | 'script';
    plugins?: string[];
}
```

#### Retour

```typescript
interface AST {
    type: 'Program';
    body: ASTNode[];
    language?: string;
    loc: Location;
}
```

## Utilisé par

Le parser est utilisé par plusieurs composants de Codyman :

1. **Interface Utilisateur**

    - Analyse en temps réel du code
    - Affichage des suggestions et erreurs

2. **Moteur IA**

    - Analyse du code pour la compréhension
    - Génération de suggestions

3. **Système de Collaboration**
    - Analyse du code pour les revues
    - Partage de connaissances

## Exemples d'Utilisation

### 1. Analyse Simple

```typescript
import { parseCode } from '@/app/core/parser';

const code = `
const x = 42;
function test() {
    return x + 1;
}
`;

const ast = parseCode(code);
console.log(ast.body[0].type); // 'VariableDeclaration'
```

### 2. Analyse TypeScript

```typescript
const code = `
interface User {
    id: number;
    name: string;
}
`;

const ast = parseCode(code, { language: 'typescript' });
console.log(ast.body[0].type); // 'TSInterfaceDeclaration'
```

### 3. Gestion des Erreurs

```typescript
try {
    const ast = parseCode('const x =;'); // Syntaxe invalide
} catch (error) {
    console.error('Erreur de parsing:', error.message);
}
```

## Tests

Les tests sont disponibles dans le dossier `__tests__` et peuvent être exécutés avec :

```bash
npm test src/app/core/parser
```

## Maintenance

Le parser utilise [@babel/parser](https://babeljs.io/docs/babel-parser) en interne et expose une API simplifiée et standardisée pour Codyman.

### Ajout de Fonctionnalités

Pour ajouter de nouvelles fonctionnalités au parser :

1. Ajouter les tests dans `__tests__/astParser.test.ts`
2. Implémenter la fonctionnalité dans `astParser.ts`
3. Mettre à jour la documentation si nécessaire
4. Vérifier que tous les tests passent

## Bonnes Pratiques

1. **Performance**

    - Le parser est utilisé fréquemment, optimiser les performances
    - Éviter les transformations inutiles de l'AST

2. **Gestion des Erreurs**

    - Toujours fournir des messages d'erreur clairs
    - Gérer les cas limites (code vide, syntaxe invalide)

3. **Compatibilité**
    - Maintenir la compatibilité avec JS et TS
    - Supporter les dernières fonctionnalités ECMAScript
