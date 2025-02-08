import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des commentaires par type de fichier
const commentPatterns = {
    js: { single: '//', multi: ['/*', '*/'] },
    jsx: { single: '//', multi: ['/*', '*/'] },
    ts: { single: '//', multi: ['/*', '*/'] },
    tsx: { single: '//', multi: ['/*', '*/'] },
    py: { single: '#', multi: ['"""', '"""'] },
    rb: { single: '#', multi: ['=begin', '=end'] },
    php: { single: '//', multi: ['/*', '*/'] },
    java: { single: '//', multi: ['/*', '*/'] },
    cpp: { single: '//', multi: ['/*', '*/'] },
    cs: { single: '//', multi: ['/*', '*/'] },
    go: { single: '//', multi: ['/*', '*/'] },
    rs: { single: '//', multi: ['/*', '*/'] },
    swift: { single: '//', multi: ['/*', '*/'] },
    kt: { single: '//', multi: ['/*', '*/'] },
    css: { single: null, multi: ['/*', '*/'] },
    scss: { single: '//', multi: ['/*', '*/'] },
    less: { single: '//', multi: ['/*', '*/'] },
    html: { single: null, multi: ['<!--', '-->'] },
    xml: { single: null, multi: ['<!--', '-->'] },
    yaml: { single: '#', multi: null },
    md: { single: null, multi: null },
};

function getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase().slice(1);
    return commentPatterns[ext] ? ext : 'js'; // Par défaut, utiliser js
}

function analyzeLines(content, fileType) {
    const lines = content.split('\n');
    const stats = {
        total: lines.length,
        code: 0,
        comments: 0,
        empty: 0,
        docstrings: 0
    };

    const patterns = commentPatterns[fileType];
    let inMultilineComment = false;
    let multilineStart = null;

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Ligne vide
        if (trimmedLine === '') {
            stats.empty++;
            return;
        }

        // Gestion des commentaires multilignes
        if (patterns.multi) {
            const [startPattern, endPattern] = patterns.multi;

            // Début de commentaire multiligne
            if (!inMultilineComment && trimmedLine.includes(startPattern)) {
                inMultilineComment = true;
                multilineStart = index;
                stats.comments++;
                return;
            }

            // Fin de commentaire multiligne
            if (inMultilineComment && trimmedLine.includes(endPattern)) {
                inMultilineComment = false;
                // Si c'est une docstring (commentaire multiligne juste après la déclaration de fonction/classe)
                if (multilineStart === 0 || (lines[multilineStart - 1] && 
                    (lines[multilineStart - 1].includes('function') || 
                     lines[multilineStart - 1].includes('class')))) {
                    stats.docstrings++;
                }
                stats.comments++;
                return;
            }

            // À l'intérieur d'un commentaire multiligne
            if (inMultilineComment) {
                stats.comments++;
                return;
            }
        }

        // Commentaire sur une seule ligne
        if (patterns.single && trimmedLine.startsWith(patterns.single)) {
            stats.comments++;
            return;
        }

        // Si on arrive ici, c'est une ligne de code
        stats.code++;
    });

    return stats;
}

function formatNumber(num) {
    return num.toString().padStart(6, ' ');
}

function createTableRow(label, value, width) {
    const labelPadding = 25; // Largeur fixe pour les labels
    const valuePadding = width - labelPadding - 4; // -4 pour les marges
    
    const paddedLabel = label.padEnd(labelPadding, ' ');
    const paddedValue = value.toString().padStart(valuePadding, ' ');
    
    return chalk.gray('│ ') + paddedLabel + paddedValue + chalk.gray(' │');
}

function displayStats(stats, fileName) {
    // Convertir les valeurs en chaînes formatées
    const values = {
        total: chalk.blue(formatNumber(stats.total)),
        code: chalk.green(formatNumber(stats.code)),
        comments: chalk.yellow(formatNumber(stats.comments)),
        empty: chalk.gray(formatNumber(stats.empty)),
        docstrings: chalk.magenta(formatNumber(stats.docstrings))
    };

    // Calculer la largeur maximale nécessaire
    const maxValueLength = Math.max(
        ...Object.values(stats).map(v => v.toString().length)
    );
    const tableWidth = Math.max(45, maxValueLength + 30); // 30 pour le label et les marges

    // Créer la ligne horizontale
    const horizontalLine = chalk.gray('├' + '─'.repeat(tableWidth - 2) + '┤');
    const topLine = chalk.gray('┌' + '─'.repeat(tableWidth - 2) + '┐');
    const bottomLine = chalk.gray('└' + '─'.repeat(tableWidth - 2) + '┘');

    // Afficher le titre
    console.log(chalk.blue(`\n📊 Analyse de ${fileName}:\n`));
    
    // Afficher le tableau
    console.log(topLine);
    console.log(createTableRow('Total des lignes:', values.total, tableWidth));
    console.log(horizontalLine);
    console.log(createTableRow('Lignes de code:', values.code, tableWidth));
    console.log(horizontalLine);
    console.log(createTableRow('Lignes de commentaires:', values.comments, tableWidth));
    console.log(horizontalLine);
    console.log(createTableRow('Lignes vides:', values.empty, tableWidth));
    console.log(horizontalLine);
    console.log(createTableRow('Docstrings:', values.docstrings, tableWidth));
    console.log(bottomLine);

    // Calculer et afficher les pourcentages
    const codePercent = (stats.code / stats.total * 100).toFixed(1);
    const commentsPercent = (stats.comments / stats.total * 100).toFixed(1);
    const emptyPercent = (stats.empty / stats.total * 100).toFixed(1);

    // Créer une barre de progression pour chaque type
    function createProgressBar(percent, color) {
        const width = 30;
        const filled = Math.round((percent * width) / 100);
        const empty = width - filled;
        return color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    }

    console.log(chalk.blue('\n📈 Répartition:\n'));
    console.log(chalk.gray('  Code        : ') + createProgressBar(codePercent, chalk.green) + chalk.green(` ${codePercent}%`));
    console.log(chalk.gray('  Commentaires: ') + createProgressBar(commentsPercent, chalk.yellow) + chalk.yellow(` ${commentsPercent}%`));
    console.log(chalk.gray('  Vide        : ') + createProgressBar(emptyPercent, chalk.gray) + chalk.gray(` ${emptyPercent}%`));

    // Afficher l'analyse
    const commentRatio = (stats.comments / stats.code * 100).toFixed(1);
    console.log(chalk.blue('\n💡 Analyse de la documentation:\n'));
    
    // Créer une barre de progression pour le ratio commentaires/code
    const ratioBar = createProgressBar(Math.min(commentRatio, 100), chalk.cyan);
    console.log(chalk.gray('  Ratio commentaires/code: ') + ratioBar + chalk.cyan(` ${commentRatio}%`));

    let qualityMessage = '';
    if (commentRatio < 10) {
        qualityMessage = chalk.red('  ⚠️  Le code pourrait bénéficier de plus de commentaires');
    } else if (commentRatio > 40) {
        qualityMessage = chalk.yellow('  ⚠️  Le code pourrait avoir trop de commentaires');
    } else {
        qualityMessage = chalk.green('  ✅ Bon équilibre entre code et commentaires');
    }
    console.log(qualityMessage + '\n');
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log(chalk.red('\n❌ Veuillez spécifier un fichier à analyser'));
        console.log(chalk.gray('\nUtilisation: node count-lines.mjs <chemin_du_fichier>'));
        process.exit(1);
    }

    const filePath = path.resolve(process.cwd(), args[0]);

    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const fileType = getFileType(filePath);
        const stats = analyzeLines(content, fileType);
        displayStats(stats, path.basename(filePath));
    } catch (error) {
        console.error(chalk.red('\n❌ Erreur:'), error);
        process.exit(1);
    }
}

main(); 