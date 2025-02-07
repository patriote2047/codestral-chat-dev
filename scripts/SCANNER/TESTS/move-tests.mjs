import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TEST_DIR = '__tests__';
const ROOT_DIR = process.cwd();

const config = {
    testDir: TEST_DIR,
    // Patterns de recherche simplifiés
    testPatterns: [
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}'
    ],
    // Exclusions
    excludePatterns: [
        '**/node_modules/**',
        `${TEST_DIR}/**`, // Exclure les fichiers déjà dans __tests__
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**'
    ]
};

async function findExistingTests() {
    // Rechercher depuis la racine du projet
    const patterns = config.testPatterns.map(pattern => 
        path.join('.', pattern).replace(/\\/g, '/')
    );
    
    const files = glob.sync(patterns, {
        ignore: config.excludePatterns,
        absolute: true,
        windowsPathsNoEscape: true,
        cwd: ROOT_DIR
    });

    return files.map(file => path.normalize(file));
}

async function moveTestFile(testFile) {
    // Obtenir le chemin relatif à partir de la racine
    const relativePath = path.relative(ROOT_DIR, testFile);
    
    // Si le fichier est dans un dossier __tests__ local, ajuster le chemin
    const pathParts = relativePath.split(path.sep);
    const testsIndex = pathParts.indexOf('__tests__');
    let adjustedPath = relativePath;
    
    if (testsIndex !== -1) {
        // Retirer '__tests__' du chemin
        pathParts.splice(testsIndex, 1);
        adjustedPath = pathParts.join(path.sep);
    }
    
    // Construire le chemin de destination dans __tests__
    const targetPath = path.join(ROOT_DIR, config.testDir, adjustedPath);
    const targetDir = path.dirname(targetPath);

    try {
        // Créer le répertoire de destination s'il n'existe pas
        await fs.promises.mkdir(targetDir, { recursive: true });

        // Vérifier si le fichier existe déjà à la destination
        const fileExists = await fs.promises.access(targetPath)
            .then(() => true)
            .catch(() => false);

        if (fileExists) {
            console.log(chalk.yellow(`⚠️  Le fichier existe déjà: ${adjustedPath}`));
            return false;
        }

        // Déplacer le fichier
        await fs.promises.rename(testFile, targetPath);

        console.log(chalk.green(`✓ Déplacé: ${relativePath} → ${path.relative(ROOT_DIR, targetPath)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`✗ Erreur lors du déplacement de ${relativePath}:`), error);
        return false;
    }
}

async function moveTests() {
    console.log(chalk.blue('\n🔍 Recherche des fichiers de test dans tout le projet...\n'));

    const testFiles = await findExistingTests();

    if (testFiles.length === 0) {
        console.log(chalk.yellow('Aucun fichier de test trouvé.\n'));
        return;
    }

    console.log(chalk.blue(`📦 Déplacement de ${testFiles.length} fichiers de test vers ${config.testDir}...\n`));
    
    // Trier les fichiers par chemin pour un affichage plus clair
    const sortedTestFiles = testFiles.sort();

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const testFile of sortedTestFiles) {
        const success = await moveTestFile(testFile);
        if (success) {
            successCount++;
        } else if (testFile.includes(config.testDir)) {
            skippedCount++;
        } else {
            errorCount++;
        }
    }

    console.log(chalk.blue('\n📊 Résumé:'));
    console.log(chalk.green(`✓ ${successCount} fichiers déplacés avec succès`));
    if (skippedCount > 0) {
        console.log(chalk.yellow(`⚠️  ${skippedCount} fichiers ignorés (déjà dans ${config.testDir})`));
    }
    if (errorCount > 0) {
        console.log(chalk.red(`✗ ${errorCount} erreurs`));
    }
    console.log('\n');
}

// Exécuter le déplacement
moveTests().catch(error => {
    console.error(chalk.red('Erreur fatale:'), error);
    process.exit(1);
}); 