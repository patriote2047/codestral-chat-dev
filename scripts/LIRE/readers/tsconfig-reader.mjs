import chalk from 'chalk';

export async function analyzeTsConfig(content) {
    try {
        const config = JSON.parse(content);
        const report = {
            compilerOptions: analyzeCompilerOptions(config.compilerOptions),
            fileInclusion: analyzeFileInclusion(config),
            references: analyzeReferences(config.references),
            extends: analyzeExtends(config.extends),
            watchOptions: analyzeWatchOptions(config.watchOptions)
        };

        return formatReport(report);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE TSCONFIG] ${error.message}`);
    }
}

function analyzeCompilerOptions(options) {
    if (!options) return null;

    return {
        target: {
            value: options.target,
            risk: assessTargetRisk(options.target)
        },
        module: {
            value: options.module,
            implications: getModuleImplications(options.module)
        },
        strict: {
            enabled: options.strict,
            strictOptions: analyzeStrictOptions(options)
        },
        paths: analyzePaths(options.paths),
        libs: analyzeLibs(options.lib),
        security: analyzeSecurityOptions(options),
        optimization: analyzeOptimizationOptions(options)
    };
}

function assessTargetRisk(target) {
    const riskLevels = {
        'es3': 'ÉLEVÉ - Compatibilité ancienne, fonctionnalités modernes non disponibles',
        'es5': 'MOYEN - Bon support mais fonctionnalités limitées',
        'es6': 'FAIBLE - Support moderne avec bonnes fonctionnalités',
        'es2015': 'FAIBLE - Support moderne avec bonnes fonctionnalités',
        'es2016': 'TRÈS FAIBLE - Support moderne avec excellentes fonctionnalités',
        'es2017': 'TRÈS FAIBLE - Support moderne avec excellentes fonctionnalités',
        'es2018': 'TRÈS FAIBLE - Support moderne avec excellentes fonctionnalités',
        'es2019': 'TRÈS FAIBLE - Support moderne avec excellentes fonctionnalités',
        'es2020': 'TRÈS FAIBLE - Support moderne avec excellentes fonctionnalités',
        'esnext': 'MOYEN - Risque de compatibilité avec certains navigateurs'
    };
    return riskLevels[target?.toLowerCase()] || 'NON ÉVALUÉ';
}

function getModuleImplications(moduleType) {
    const implications = {
        'commonjs': 'Compatible Node.js, pas de support natif ES modules',
        'amd': 'Ancien système, principalement pour les navigateurs',
        'umd': 'Compatible navigateur et Node.js, mais bundle plus lourd',
        'es6': 'Support moderne, meilleure optimisation possible',
        'es2015': 'Support moderne, meilleure optimisation possible',
        'es2020': 'Support moderne, meilleure optimisation possible',
        'esnext': 'Dernières fonctionnalités, mais risque de compatibilité'
    };
    return implications[moduleType?.toLowerCase()] || 'NON SPÉCIFIÉ';
}

function analyzeStrictOptions(options) {
    const strictOptions = [
        'strictNullChecks',
        'strictFunctionTypes',
        'strictBindCallApply',
        'strictPropertyInitialization',
        'noImplicitAny',
        'noImplicitThis',
        'useUnknownInCatchVariables'
    ];

    return strictOptions.map(option => ({
        name: option,
        enabled: options[option] === true,
        recommended: true
    }));
}

function analyzePaths(paths) {
    if (!paths) return null;
    return {
        count: Object.keys(paths).length,
        aliases: Object.entries(paths).map(([alias, targets]) => ({
            alias,
            targets: targets,
            risk: targets.some(t => t.includes('..')) ? 'ÉLEVÉ' : 'FAIBLE'
        }))
    };
}

function analyzeLibs(libs) {
    if (!libs) return null;
    const categories = {
        dom: libs.filter(lib => lib.toLowerCase().includes('dom')),
        es: libs.filter(lib => lib.toLowerCase().includes('es')),
        webworker: libs.filter(lib => lib.toLowerCase().includes('webworker')),
        decorators: libs.filter(lib => lib.toLowerCase().includes('decorator')),
        other: libs.filter(lib => !lib.toLowerCase().match(/(dom|es|webworker|decorator)/))
    };

    return {
        total: libs.length,
        categories
    };
}

function analyzeSecurityOptions(options) {
    const securityIssues = [];

    if (options.suppressExcessPropertyErrors) {
        securityIssues.push({
            level: 'HAUTE',
            option: 'suppressExcessPropertyErrors',
            risk: 'Désactive la vérification des propriétés excédentaires'
        });
    }

    if (options.suppressImplicitAnyIndexErrors) {
        securityIssues.push({
            level: 'MOYENNE',
            option: 'suppressImplicitAnyIndexErrors',
            risk: 'Peut masquer des erreurs de typage sur les index'
        });
    }

    if (!options.strict) {
        securityIssues.push({
            level: 'MOYENNE',
            option: 'strict',
            risk: 'Mode strict désactivé, risque de bugs silencieux'
        });
    }

    return securityIssues;
}

function analyzeOptimizationOptions(options) {
    return {
        incremental: options.incremental === true,
        tsBuildInfoFile: options.tsBuildInfoFile,
        composite: options.composite === true,
        skipLibCheck: options.skipLibCheck === true,
        skipDefaultLibCheck: options.skipDefaultLibCheck === true
    };
}

function analyzeFileInclusion(config) {
    return {
        include: config.include || [],
        exclude: config.exclude || [],
        files: config.files || []
    };
}

function analyzeReferences(references) {
    if (!references) return null;
    return references.map(ref => ({
        path: ref.path,
        prepend: ref.prepend || false
    }));
}

function analyzeExtends(extends_) {
    if (!extends_) return null;
    return {
        path: extends_,
        type: categorizeExtends(extends_)
    };
}

function categorizeExtends(extends_) {
    if (extends_.includes('@tsconfig/')) return 'CONFIGURATION COMMUNAUTAIRE';
    if (extends_.includes('./')) return 'CONFIGURATION LOCALE';
    return 'CONFIGURATION EXTERNE';
}

function analyzeWatchOptions(options) {
    if (!options) return null;
    return {
        watchFile: options.watchFile,
        watchDirectory: options.watchDirectory,
        fallbackPolling: options.fallbackPolling,
        synchronousWatchDirectory: options.synchronousWatchDirectory,
        excludeDirectories: options.excludeDirectories
    };
}

function formatReport(report) {
    let output = '';

    // En-tête
    output += chalk.blue('\n🔍 RAPPORT D\'INVESTIGATION - Configuration TypeScript\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    // Section 1: Configuration du Compilateur
    output += chalk.yellow('\n[1] CONFIGURATION DU COMPILATEUR\n');
    if (report.compilerOptions) {
        // Target et Module
        output += chalk.cyan('  ■ Environnement d\'exécution\n');
        output += chalk.gray('    • Target: ') + 
                 chalk.white(report.compilerOptions.target.value) +
                 chalk.red(` (Risque: ${report.compilerOptions.target.risk})\n`);
        output += chalk.gray('    • Module: ') + 
                 chalk.white(report.compilerOptions.module.value) + '\n';
        output += chalk.gray('      └─ Implications: ') + 
                 chalk.white(report.compilerOptions.module.implications) + '\n';

        // Strict Mode
        output += chalk.cyan('\n  ■ Mode Strict\n');
        output += chalk.gray('    • Strict Mode Global: ') + 
                 (report.compilerOptions.strict.enabled ? 
                    chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
        
        report.compilerOptions.strict.strictOptions.forEach(option => {
            output += chalk.gray(`    • ${option.name}: `) + 
                     (option.enabled ? 
                        chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
        });

        // Paths
        if (report.compilerOptions.paths) {
            output += chalk.cyan('\n  ■ Alias de Chemins\n');
            output += chalk.gray(`    • Nombre d'alias: ${report.compilerOptions.paths.count}\n`);
            report.compilerOptions.paths.aliases.forEach(alias => {
                output += chalk.gray(`    • ${alias.alias} → ${alias.targets.join(', ')}`);
                if (alias.risk === 'ÉLEVÉ') {
                    output += chalk.red(' [RISQUE: Chemin relatif externe]\n');
                } else {
                    output += '\n';
                }
            });
        }

        // Libraries
        if (report.compilerOptions.libs) {
            output += chalk.cyan('\n  ■ Bibliothèques\n');
            output += chalk.gray(`    • Total: ${report.compilerOptions.libs.total}\n`);
            Object.entries(report.compilerOptions.libs.categories).forEach(([category, libs]) => {
                if (libs.length > 0) {
                    output += chalk.gray(`    • ${category.toUpperCase()}: ${libs.join(', ')}\n`);
                }
            });
        }
    }

    // Section 2: Inclusion/Exclusion de Fichiers
    output += chalk.yellow('\n[2] GESTION DES FICHIERS\n');
    output += chalk.gray('  • Fichiers inclus: ') + 
             chalk.white(report.fileInclusion.include.join(', ') || 'Aucun') + '\n';
    output += chalk.gray('  • Fichiers exclus: ') + 
             chalk.white(report.fileInclusion.exclude.join(', ') || 'Aucun') + '\n';
    output += chalk.gray('  • Fichiers spécifiques: ') + 
             chalk.white(report.fileInclusion.files.join(', ') || 'Aucun') + '\n';

    // Section 3: Sécurité
    output += chalk.yellow('\n[3] ALERTES DE SÉCURITÉ\n');
    if (report.compilerOptions.security.length > 0) {
        report.compilerOptions.security.forEach(issue => {
            output += chalk.red(`  ⚠️  [${issue.level}] ${issue.option}\n`);
            output += chalk.gray(`     → ${issue.risk}\n`);
        });
    } else {
        output += chalk.green('  ✓ Aucune alerte de sécurité majeure\n');
    }

    // Section 4: Optimisation
    output += chalk.yellow('\n[4] OPTIMISATION\n');
    const opt = report.compilerOptions.optimization;
    Object.entries(opt).forEach(([key, value]) => {
        output += chalk.gray(`  • ${key}: `) + 
                 (value ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
    });

    // Section 5: Configuration Étendue
    if (report.extends) {
        output += chalk.yellow('\n[5] CONFIGURATION ÉTENDUE\n');
        output += chalk.gray('  • Source: ') + chalk.white(report.extends.path) + '\n';
        output += chalk.gray('  • Type: ') + chalk.white(report.extends.type) + '\n';
    }

    output += chalk.gray('\n' + '═'.repeat(70) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
} 