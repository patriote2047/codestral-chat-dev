import chalk from 'chalk';

export async function analyzePackageJson(content) {
    try {
        const pkg = JSON.parse(content);
        const report = {
            header: {
                name: pkg.name,
                version: pkg.version,
                description: pkg.description,
                type: pkg.type,
                author: pkg.author,
                license: pkg.license,
                private: pkg.private
            },
            scripts: analyzeScripts(pkg.scripts || {}),
            dependencies: analyzeDependencies(pkg.dependencies || {}),
            devDependencies: analyzeDependencies(pkg.devDependencies || {}, true),
            security: analyzeSecurityConcerns(pkg)
        };

        return formatReport(report);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE] ${error.message}`);
    }
}

function analyzeScripts(scripts) {
    const categories = {
        development: ['dev', 'start', 'watch'],
        build: ['build', 'compile', 'bundle'],
        test: ['test', 'coverage', 'e2e'],
        lint: ['lint', 'format', 'prettier'],
        clean: ['clean', 'purge', 'clear'],
        deps: ['deps', 'dependencies', 'update'],
        analyze: ['analyze', 'check', 'audit'],
        custom: []
    };

    const categorizedScripts = {};
    const suspiciousPatterns = [
        'rm -rf /',
        'chmod 777',
        'eval',
        'sudo',
        '> /dev/null'
    ];

    for (const [name, cmd] of Object.entries(scripts)) {
        // Détecter la catégorie
        let category = 'custom';
        for (const [cat, patterns] of Object.entries(categories)) {
            if (patterns.some(p => name.includes(p))) {
                category = cat;
                break;
            }
        }

        // Vérifier les commandes suspectes
        const suspicious = suspiciousPatterns.filter(pattern => 
            cmd.toLowerCase().includes(pattern.toLowerCase())
        );

        if (!categorizedScripts[category]) {
            categorizedScripts[category] = [];
        }

        categorizedScripts[category].push({
            name,
            command: cmd,
            suspicious: suspicious.length > 0 ? suspicious : null
        });
    }

    return categorizedScripts;
}

function analyzeDependencies(deps, isDev = false) {
    const analysis = {
        total: Object.keys(deps).length,
        versions: {
            exact: 0,
            caret: 0,
            tilde: 0,
            star: 0
        },
        scoped: 0,
        categories: {},
        outdated: []
    };

    for (const [name, version] of Object.entries(deps)) {
        // Analyser le versionnement
        if (version.startsWith('^')) analysis.versions.caret++;
        else if (version.startsWith('~')) analysis.versions.tilde++;
        else if (version.includes('*')) analysis.versions.star++;
        else analysis.versions.exact++;

        // Compter les packages scopés
        if (name.startsWith('@')) analysis.scoped++;

        // Catégoriser
        const category = categorizeDependency(name, isDev);
        if (!analysis.categories[category]) {
            analysis.categories[category] = [];
        }
        analysis.categories[category].push({ name, version });

        // Vérifier les versions potentiellement problématiques
        if (version === '*' || version === 'latest') {
            analysis.outdated.push({ name, version, reason: 'Version non spécifiée' });
        }
    }

    return analysis;
}

function categorizeDependency(name, isDev) {
    const categories = {
        framework: ['react', 'next', 'vue', 'angular'],
        ui: ['styled-components', 'tailwind', 'material-ui'],
        state: ['redux', 'mobx', 'recoil'],
        testing: ['jest', 'mocha', 'chai', '@testing-library'],
        types: ['@types/'],
        lint: ['eslint', 'prettier', 'tslint'],
        build: ['webpack', 'babel', 'rollup'],
        utils: ['lodash', 'moment', 'date-fns']
    };

    for (const [category, patterns] of Object.entries(categories)) {
        if (patterns.some(p => name.toLowerCase().includes(p.toLowerCase()))) {
            return category;
        }
    }

    return isDev ? 'other-dev' : 'other-prod';
}

function analyzeSecurityConcerns(pkg) {
    const concerns = [];

    // Vérifier les scripts dangereux
    if (pkg.scripts) {
        for (const [name, cmd] of Object.entries(pkg.scripts)) {
            if (cmd.includes('sudo') || cmd.includes('rm -rf /')) {
                concerns.push({
                    type: 'SCRIPT_DANGER',
                    severity: 'HAUTE',
                    detail: `Script '${name}' contient des commandes potentiellement dangereuses`
                });
            }
        }
    }

    // Vérifier les dépendances étoilées
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [name, version] of Object.entries(allDeps)) {
        if (version === '*' || version === 'latest') {
            concerns.push({
                type: 'VERSION_NON_FIXE',
                severity: 'MOYENNE',
                detail: `Dépendance '${name}' utilise une version non fixée (${version})`
            });
        }
    }

    return concerns;
}

function formatReport(report) {
    let output = '';

    // En-tête du rapport
    output += chalk.blue('\n🔍 RAPPORT D\'INVESTIGATION - package.json\n');
    output += chalk.gray('═'.repeat(50) + '\n');

    // Section 1: Identification
    output += chalk.yellow('\n[1] IDENTIFICATION DU PROJET\n');
    output += chalk.gray('  Nom: ') + chalk.white(report.header.name) + '\n';
    output += chalk.gray('  Version: ') + chalk.white(report.header.version) + '\n';
    output += chalk.gray('  Type: ') + chalk.white(report.header.type) + '\n';
    output += chalk.gray('  Description: ') + chalk.white(report.header.description || 'Non spécifiée') + '\n';
    output += chalk.gray('  Auteur: ') + chalk.white(report.header.author || 'Non spécifié') + '\n';
    output += chalk.gray('  License: ') + chalk.white(report.header.license || 'Non spécifiée') + '\n';

    // Section 2: Scripts
    output += chalk.yellow('\n[2] ANALYSE DES SCRIPTS\n');
    for (const [category, scripts] of Object.entries(report.scripts)) {
        output += chalk.cyan(`\n  📁 Catégorie: ${category}\n`);
        scripts.forEach(script => {
            output += chalk.gray(`    • ${script.name}: `) + chalk.white(script.command) + '\n';
            if (script.suspicious) {
                output += chalk.red('      ⚠️  ALERTE: Commandes suspectes détectées\n');
                script.suspicious.forEach(s => {
                    output += chalk.red(`      → ${s}\n`);
                });
            }
        });
    }

    // Section 3: Dépendances de Production
    output += chalk.yellow('\n[3] DÉPENDANCES DE PRODUCTION\n');
    output += formatDependenciesSection(report.dependencies);

    // Section 4: Dépendances de Développement
    output += chalk.yellow('\n[4] DÉPENDANCES DE DÉVELOPPEMENT\n');
    output += formatDependenciesSection(report.devDependencies);

    // Section 5: Alertes de Sécurité
    output += chalk.yellow('\n[5] ALERTES DE SÉCURITÉ\n');
    if (report.security.length > 0) {
        report.security.forEach(concern => {
            output += chalk.red(`  ⚠️  [${concern.severity}] ${concern.type}\n`);
            output += chalk.gray(`     → ${concern.detail}\n`);
        });
    } else {
        output += chalk.green('  ✓ Aucune alerte de sécurité majeure détectée\n');
    }

    output += chalk.gray('\n' + '═'.repeat(50) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
}

function formatDependenciesSection(analysis) {
    let output = '';
    
    // Statistiques générales
    output += chalk.gray(`  Total: ${analysis.total} dépendances\n`);
    output += chalk.gray(`  Packages scopés: ${analysis.scoped}\n`);
    
    // Analyse des versions
    output += chalk.gray('  Versions:\n');
    output += chalk.gray(`    ├─ Exactes: ${analysis.versions.exact}\n`);
    output += chalk.gray(`    ├─ Caret (^): ${analysis.versions.caret}\n`);
    output += chalk.gray(`    ├─ Tilde (~): ${analysis.versions.tilde}\n`);
    output += chalk.gray(`    └─ Étoile (*): ${analysis.versions.star}\n`);

    // Liste par catégorie
    for (const [category, deps] of Object.entries(analysis.categories)) {
        output += chalk.cyan(`\n  📁 ${category} (${deps.length})\n`);
        deps.forEach(dep => {
            output += chalk.gray(`    • ${dep.name}: `) + chalk.white(dep.version) + '\n';
        });
    }

    // Dépendances potentiellement problématiques
    if (analysis.outdated.length > 0) {
        output += chalk.red('\n  ⚠️  Dépendances à risque:\n');
        analysis.outdated.forEach(dep => {
            output += chalk.red(`    • ${dep.name} (${dep.version}): ${dep.reason}\n`);
        });
    }

    return output;
} 