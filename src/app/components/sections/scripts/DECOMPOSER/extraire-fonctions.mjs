import chalk from 'chalk';
import { lireFichier } from './lire-fichier.mjs';

/**
 * Représente une fonction extraite du code source
 * @typedef {Object} FonctionExtraite
 * @property {string} nom - Nom de la fonction
 * @property {string} contenu - Code source complet de la fonction
 * @property {string[]} dependances - Liste des fonctions appelées par cette fonction
 * @property {string} documentation - Documentation de la fonction
 * @property {boolean} estLogique - Indique si c'est une fonction de logique principale
 */

/**
 * Extrait les fonctions d'un contenu JavaScript
 * @param {string} contenu - Contenu du fichier JavaScript
 * @returns {FonctionExtraite[]} Liste des fonctions extraites
 */
export function extraireFonctions(contenu) {
    const fonctions = [];
    // Regex pour les fonctions avec documentation JSDoc
    const regexJSDoc = /\/\*\*\s*([\s\S]*?)\*\/\s*function\s+(\w+)\s*\(([\s\S]*?)\)\s*{([\s\S]*?)\n}/g;
    // Regex pour les fonctions avec commentaires simples
    const regexSimple = /\/\/\s*(.*?)\s*\n\s*function\s+(\w+)\s*\(([\s\S]*?)\)\s*{([\s\S]*?)\n\s*return[\s\S]*?}\s*;?\s*\n}/g;
    let match;

    // Extraire les fonctions avec documentation JSDoc
    while ((match = regexJSDoc.exec(contenu)) !== null) {
        const documentation = match[1].trim();
        const nomFonction = match[2];
        const parametres = match[3];
        const corps = match[4];
        ajouterFonction(fonctions, documentation, nomFonction, parametres, corps);
    }

    // Extraire les fonctions avec commentaires simples
    while ((match = regexSimple.exec(contenu)) !== null) {
        const documentation = match[1].trim();
        const nomFonction = match[2];
        const parametres = match[3];
        const corps = match[4];
        ajouterFonction(fonctions, documentation, nomFonction, parametres, corps);
    }

    return fonctions;
}

/**
 * Ajoute une fonction à la liste des fonctions extraites
 * @param {FonctionExtraite[]} fonctions - Liste des fonctions
 * @param {string} documentation - Documentation de la fonction
 * @param {string} nomFonction - Nom de la fonction
 * @param {string} parametres - Paramètres de la fonction
 * @param {string} corps - Corps de la fonction
 */
function ajouterFonction(fonctions, documentation, nomFonction, parametres, corps) {
    // Extraire les dépendances (appels à d'autres fonctions)
    const dependances = corps.match(/\b\w+\s*\(/g) || [];
    const nomsDependances = dependances
        .map(dep => dep.replace('(', '').trim())
        .filter(dep => 
            dep !== nomFonction && // Exclure les appels récursifs
            !['Math', 'console', 'process'].includes(dep) // Exclure les objets globaux
        );

    // Déterminer si c'est une fonction de logique principale
    // Une fonction est considérée comme logique si :
    // 1. Elle utilise plusieurs autres fonctions (plus de 2 dépendances)
    // 2. Elle retourne un objet complexe
    // 3. Elle est un exemple d'utilisation ou une fonction de statistiques
    const estLogique = (
        nomsDependances.length > 2 && // Utilise plusieurs fonctions
        (
            nomFonction.includes('Statistiques') || // C'est une fonction de statistiques
            documentation.toLowerCase().includes('exemple') // C'est un exemple d'utilisation
        )
    );

    // Afficher les informations de détection pour le débogage
    console.log(chalk.gray(`\nDétection de fonction logique pour ${nomFonction}:`));
    console.log(chalk.gray(`  - Nombre de dépendances: ${nomsDependances.length}`));
    console.log(chalk.gray(`  - Nom contient 'Statistiques': ${nomFonction.includes('Statistiques')}`));
    console.log(chalk.gray(`  - Documentation contient 'exemple': ${documentation.toLowerCase().includes('exemple')}`));
    console.log(chalk.gray(`  => Est logique: ${estLogique}`));

    fonctions.push({
        nom: nomFonction,
        contenu: `// ${documentation}\nfunction ${nomFonction}(${parametres}) {${corps}}`,
        dependances: [...new Set(nomsDependances)], // Éliminer les doublons
        documentation,
        estLogique
    });
}

/**
 * Affiche les informations sur les fonctions extraites
 * @param {FonctionExtraite[]} fonctions - Liste des fonctions
 */
function afficherInfosFonctions(fonctions) {
    console.log(chalk.blue('\n📊 Fonctions extraites:\n'));
    
    fonctions.forEach((f, i) => {
        console.log(chalk.yellow(`${i + 1}. ${f.nom}`));
        console.log(chalk.gray('   Documentation:'));
        console.log(chalk.gray('   ' + f.documentation.split('\n').join('\n   ')));
        
        if (f.dependances.length > 0) {
            console.log(chalk.gray('   Dépendances:'));
            f.dependances.forEach(dep => {
                console.log(chalk.gray(`   - ${dep}`));
            });
        }
        console.log(chalk.gray('   Est logique: ' + (f.estLogique ? 'Oui' : 'Non')));
        console.log();
    });

    console.log(chalk.blue(`Total: ${fonctions.length} fonctions\n`));
}

// Si le script est exécuté directement
if (process.argv[1] === new URL(import.meta.url).pathname) {
    const filePath = process.argv[2];

    if (!filePath) {
        console.log(chalk.blue('\n📋 Utilisation:\n'));
        console.log(chalk.white('  node extraire-fonctions.mjs <chemin_du_fichier>\n'));
        console.log(chalk.gray('  Le script va:'));
        console.log(chalk.gray('    1. Lire le fichier source'));
        console.log(chalk.gray('    2. Extraire toutes les fonctions'));
        console.log(chalk.gray('    3. Analyser les dépendances'));
        console.log(chalk.gray('    4. Afficher les informations\n'));
        process.exit(0);
    }

    try {
        const contenu = await lireFichier(filePath);
        const fonctions = extraireFonctions(contenu);
        afficherInfosFonctions(fonctions);
    } catch (error) {
        console.error(chalk.red(`\n❌ ${error.message}\n`));
        process.exit(1);
    }
} 