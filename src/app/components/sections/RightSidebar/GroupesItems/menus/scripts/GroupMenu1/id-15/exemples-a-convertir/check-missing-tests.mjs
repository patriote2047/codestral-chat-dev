import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Codes ANSI pour la coloration
const colors = {
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    gray: '\x1b[90m',
    reset: '\x1b[0m'
};

// Configuration
const config = {
    srcDir: 'src',
    testDir: '__tests__',
    patterns: ['**/*.{js,jsx,ts,tsx}'],
    excludePatterns: [
        '**/node_modules/**',
        '**/*.d.ts',
        '**/types/**',
        '**/index.{js,ts}',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        '**/jest.config.*',
        '**/next.config.*',
    ],
};

function findSourceFiles() {
    return glob.sync(config.patterns, {
        cwd: path.join(process.cwd(), config.srcDir),
        ignore: config.excludePatterns,
        absolute: true,
    });
}

function hasCorrespondingTest(sourceFile) {
    const fileName = path.basename(sourceFile);
    const fileNameWithoutExt = fileName.replace(/\.[^.]+$/, '');
    const relativePath = path.relative(path.join(process.cwd(), config.srcDir), sourceFile);
    const relativeDir = path.dirname(relativePath);

    // Chemins possibles pour les tests
    const possibleTestPaths = [
        // Dans le même dossier avec .test ou .spec
        path.join(process.cwd(), config.srcDir, relativeDir, `${fileNameWithoutExt}.test.{js,jsx,ts,tsx}`),
        path.join(process.cwd(), config.srcDir, relativeDir, `${fileNameWithoutExt}.spec.{js,jsx,ts,tsx}`),
        // Dans le dossier __tests__ correspondant
        path.join(process.cwd(), config.srcDir, relativeDir, '__tests__', `${fileNameWithoutExt}.test.{js,jsx,ts,tsx}`),
        path.join(process.cwd(), config.srcDir, relativeDir, '__tests__', `${fileNameWithoutExt}.spec.{js,jsx,ts,tsx}`),
        // Dans le dossier __tests__ à la racine
        path.join(process.cwd(), config.testDir, relativeDir, `${fileNameWithoutExt}.test.{js,jsx,ts,tsx}`),
        path.join(process.cwd(), config.testDir, relativeDir, `${fileNameWithoutExt}.spec.{js,jsx,ts,tsx}`),
    ];

    // Vérifier si au moins un des chemins possibles existe
    return possibleTestPaths.some(testPath => {
        const matches = glob.sync(testPath);
        return matches.length > 0;
    });
}

function generateTestTemplate(sourceFile) {
    const fileName = path.basename(sourceFile);
    const fileNameWithoutExt = fileName.replace(/\.[^.]+$/, '');
    const relativePath = path.relative(path.join(process.cwd(), config.srcDir), sourceFile);
    const importPath = path.join('../'.repeat(relativePath.split('/').length - 1), relativePath);

    return `import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ${fileNameWithoutExt} from '${importPath}';

describe('${fileNameWithoutExt}', () => {
    it('should be defined', () => {
        expect(${fileNameWithoutExt}).toBeDefined();
    });

    // TODO: Ajouter plus de tests ici
});`;
}

function checkMissingTests() {
    console.log(`${colors.blue}\n🔍 Recherche des fichiers sans tests...\n${colors.reset}`);

    const sourceFiles = findSourceFiles();
    const filesWithoutTests = sourceFiles.filter(file => !hasCorrespondingTest(file));

    if (filesWithoutTests.length === 0) {
        console.log(`${colors.green}✅ Tous les fichiers ont des tests correspondants!\n${colors.reset}`);
        return;
    }

    console.log(`${colors.yellow}⚠️  ${filesWithoutTests.length} fichiers sans tests détectés:\n${colors.reset}`);

    filesWithoutTests.forEach(file => {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`${colors.yellow}   📝 ${relativePath}${colors.reset}`);
        
        // Suggérer le chemin du fichier de test
        const suggestedTestPath = path.join(
            config.testDir,
            path.relative(config.srcDir, relativePath).replace(/\.[^.]+$/, '.test.tsx')
        );
        console.log(`${colors.gray}      → Créer le test dans: ${suggestedTestPath}\n${colors.reset}`);
    });

    console.log(`${colors.blue}\n💡 Suggestion de structure pour les nouveaux tests:\n${colors.reset}`);
    console.log(`${colors.gray}${generateTestTemplate(filesWithoutTests[0])}${colors.reset}\n`);
}

// Exécuter la vérification
checkMissingTests(); 