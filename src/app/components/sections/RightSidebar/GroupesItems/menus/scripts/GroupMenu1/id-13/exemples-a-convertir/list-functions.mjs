import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du parser
const parserOptions = {
    sourceType: 'module',
    plugins: [
        'jsx',
        'typescript',
        'decorators',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
    ],
};

// Types de fonctions à rechercher
const functionTypes = {
    FunctionDeclaration: 'Fonction déclarée',
    ArrowFunctionExpression: 'Fonction fléchée',
    FunctionExpression: 'Expression de fonction',
    ClassMethod: 'Méthode de classe',
    ClassPrivateMethod: 'Méthode privée',
};

function extractFunctionInfo(node, code) {
    let name = '';
    let type = functionTypes[node.type] || 'Fonction';
    let params = [];
    let async = false;
    let generator = false;
    let startLine = node.loc?.start?.line || 0;
    let endLine = node.loc?.end?.line || 0;

    // Extraire le nom selon le type de nœud
    if (node.id && node.id.name) {
        name = node.id.name;
    } else if (node.key && node.key.name) {
        name = node.key.name;
    } else if (node.key && node.key.value) {
        name = node.key.value;
    }

    // Extraire les paramètres
    if (node.params) {
        params = node.params.map(param => {
            if (param.type === 'Identifier') {
                return param.name;
            } else if (param.type === 'AssignmentPattern') {
                return `${param.left.name} = ${param.right.value}`;
            }
            return 'param';
        });
    }

    // Vérifier si la fonction est async ou generator
    async = node.async || false;
    generator = node.generator || false;

    return {
        name,
        type,
        params,
        async,
        generator,
        startLine,
        endLine,
    };
}

function traverseNode(node, functions = [], code) {
    if (!node) return functions;

    // Vérifier si le nœud est une fonction
    if (functionTypes[node.type]) {
        const functionInfo = extractFunctionInfo(node, code);
        functions.push(functionInfo);
    }

    // Parcourir récursivement tous les enfants du nœud
    for (const key in node) {
        const child = node[key];
        if (child && typeof child === 'object') {
            if (Array.isArray(child)) {
                child.forEach(item => traverseNode(item, functions, code));
            } else {
                traverseNode(child, functions, code);
            }
        }
    }

    return functions;
}

async function analyzeFunctions(filePath) {
    try {
        // Lire le fichier
        const code = await fs.promises.readFile(filePath, 'utf-8');

        // Parser le code
        const ast = parse(code, parserOptions);

        // Extraire les informations sur les fonctions
        const functions = traverseNode(ast.program, [], code);

        return functions;
    } catch (error) {
        console.error(chalk.red(`Erreur lors de l'analyse de ${filePath}:`), error);
        return [];
    }
}

function displayFunctionInfo(functionInfo) {
    const nameColor = functionInfo.name ? chalk.green : chalk.gray;
    const name = functionInfo.name || '<anonyme>';
    const prefix = functionInfo.async ? 'async ' : '';
    const generator = functionInfo.generator ? '* ' : '';
    const params = functionInfo.params.join(', ');

    console.log(
        chalk.gray('  └─ ') +
        nameColor(`${prefix}${generator}${name}`) +
        chalk.gray(`(${params})`) +
        chalk.blue(` [${functionInfo.type}]`) +
        chalk.gray(` - lignes ${functionInfo.startLine}-${functionInfo.endLine}`)
    );
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log(chalk.red('\n❌ Veuillez spécifier un fichier à analyser'));
        console.log(chalk.gray('\nUtilisation: node list-functions.mjs <chemin_du_fichier>'));
        process.exit(1);
    }

    const filePath = path.resolve(process.cwd(), args[0]);

    try {
        console.log(chalk.blue(`\n🔍 Analyse des fonctions dans ${path.basename(filePath)}:\n`));

        const functions = await analyzeFunctions(filePath);

        if (functions.length === 0) {
            console.log(chalk.yellow('  Aucune fonction trouvée'));
        } else {
            // Grouper par type de fonction
            const groupedFunctions = functions.reduce((acc, func) => {
                acc[func.type] = acc[func.type] || [];
                acc[func.type].push(func);
                return acc;
            }, {});

            // Afficher les fonctions groupées par type
            Object.entries(groupedFunctions).forEach(([type, funcs]) => {
                console.log(chalk.yellow(`\n${type}s:`));
                funcs.forEach(displayFunctionInfo);
            });

            // Afficher les statistiques
            console.log(chalk.blue('\n📊 Résumé:'));
            console.log(chalk.gray('  Nombre total de fonctions: ') + chalk.white(functions.length));
            Object.entries(groupedFunctions).forEach(([type, funcs]) => {
                console.log(chalk.gray(`    ${type}s: `) + chalk.white(funcs.length));
            });
        }

        console.log();
    } catch (error) {
        console.error(chalk.red('\n❌ Erreur:'), error);
        process.exit(1);
    }
}

main(); 