import chalk from 'chalk';

export async function analyzeJestConfig(content) {
    try {
        const config = JSON.parse(content);
        const report = {
            testEnvironment: analyzeTestEnvironment(config.testEnvironment),
            coverage: analyzeCoverage(config),
            testMatch: analyzeTestPatterns(config.testMatch, config.testRegex, config.testPathIgnorePatterns),
            moduleConfig: analyzeModuleConfig(config),
            setupFiles: analyzeSetupFiles(config),
            transform: analyzeTransformations(config.transform),
            nextCompatibility: analyzeNextCompatibility(config),
            performance: analyzePerformance(config),
            security: analyzeSecurityConcerns(config)
        };

        return formatReport(report);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE JEST] ${error.message}`);
    }
}

function analyzeTestEnvironment(env) {
    const environments = {
        'jsdom': {
            type: 'NAVIGATEUR',
            description: 'Émulation du DOM pour les tests front-end',
            implications: 'Adapté aux composants React/Web'
        },
        'node': {
            type: 'SERVEUR',
            description: 'Environnement Node.js natif',
            implications: 'Adapté aux tests backend/API'
        },
        'jsdom-sixteen': {
            type: 'NAVIGATEUR',
            description: 'Version moderne de JSDOM',
            implications: 'Support des dernières fonctionnalités web'
        }
    };

    return {
        name: env,
        ...environments[env] || {
            type: 'PERSONNALISÉ',
            description: 'Environnement personnalisé',
            implications: 'Vérifier la compatibilité'
        }
    };
}

function analyzeCoverage(config) {
    if (!config.collectCoverage && !config.coverageThreshold) return null;

    return {
        enabled: config.collectCoverage || false,
        thresholds: {
            global: config.coverageThreshold?.global || null,
            specific: Object.keys(config.coverageThreshold || {}).filter(key => key !== 'global')
        },
        excludes: config.coveragePathIgnorePatterns || [],
        reporters: config.coverageReporters || [],
        collect: {
            fromSource: config.collectCoverageFromSource || false,
            onlyChanged: config.collectCoverageOnlyFrom ? true : false,
            patterns: config.collectCoverageFrom || []
        },
        directory: config.coverageDirectory || 'coverage',
        provider: config.coverageProvider || 'babel'
    };
}

function analyzeTestPatterns(testMatch, testRegex, ignorePatterns) {
    return {
        patterns: testMatch || [],
        regex: testRegex ? [testRegex] : [],
        ignore: ignorePatterns || [],
        analysis: analyzeTestPatternRisks(testMatch, testRegex, ignorePatterns)
    };
}

function analyzeTestPatternRisks(testMatch, testRegex, ignorePatterns) {
    const risks = [];

    if (testMatch && testRegex) {
        risks.push({
            level: 'MOYENNE',
            message: 'Utilisation simultanée de testMatch et testRegex peut créer de la confusion'
        });
    }

    if (ignorePatterns?.some(pattern => pattern.includes('node_modules'))) {
        risks.push({
            level: 'INFO',
            message: 'Les node_modules sont ignorés par défaut'
        });
    }

    return risks;
}

function analyzeModuleConfig(config) {
    return {
        moduleNameMapper: analyzeModuleMapper(config.moduleNameMapper),
        moduleFileExtensions: config.moduleFileExtensions || [],
        moduleDirectories: config.moduleDirectories || ['node_modules'],
        modulePaths: config.modulePaths || []
    };
}

function analyzeModuleMapper(mapper) {
    if (!mapper) return null;

    return Object.entries(mapper).map(([pattern, target]) => ({
        pattern,
        target,
        type: categorizeMapper(pattern),
        risk: assessMapperRisk(target)
    }));
}

function categorizeMapper(pattern) {
    if (pattern.includes('\\.(css|less|scss|sass)$')) return 'STYLE';
    if (pattern.includes('\\.(jpg|jpeg|png|gif|svg)$')) return 'MEDIA';
    if (pattern.includes('^@/')) return 'ALIAS';
    return 'AUTRE';
}

function assessMapperRisk(target) {
    if (target.includes('..')) return 'ÉLEVÉ';
    if (target === 'identity-obj-proxy') return 'FAIBLE';
    return 'MOYEN';
}

function analyzeSetupFiles(config) {
    const setupFiles = {
        before: config.setupFiles || [],
        afterEnv: config.setupFilesAfterEnv || []
    };

    return {
        ...setupFiles,
        analysis: analyzeSetupRisks(setupFiles)
    };
}

function analyzeSetupRisks(setupFiles) {
    const risks = [];

    if (setupFiles.before.length === 0 && setupFiles.afterEnv.length === 0) {
        risks.push({
            level: 'INFO',
            message: 'Aucun fichier de configuration de test détecté'
        });
    }

    if (setupFiles.before.some(file => file.includes('enzyme'))) {
        risks.push({
            level: 'INFO',
            message: 'Utilisation d\'Enzyme - Considérer @testing-library pour React'
        });
    }

    return risks;
}

function analyzeTransformations(transform) {
    if (!transform) return null;

    const transformers = Object.entries(transform).map(([pattern, transformer]) => {
        let config = transformer;
        let name = transformer;

        if (Array.isArray(transformer)) {
            [name, config] = transformer;
        }

        return {
            pattern,
            transformer: name,
            config: config || {},
            type: categorizeTransformer(name),
            risk: assessTransformerRisk(name, config)
        };
    });

    return {
        transformers,
        analysis: analyzeTransformationRisks(transformers)
    };
}

function categorizeTransformer(name) {
    if (name.includes('babel')) return 'BABEL';
    if (name.includes('ts-jest')) return 'TYPESCRIPT';
    if (name.includes('esbuild')) return 'ESBUILD';
    if (name.includes('swc')) return 'SWC';
    return 'AUTRE';
}

function assessTransformerRisk(name, config) {
    const risks = [];

    if (name.includes('babel')) {
        if (typeof config === 'object' && (!config.presets || !config.presets.length)) {
            risks.push('Aucun preset Babel configuré');
        }
    }

    if (name === 'ts-jest' && typeof config === 'object' && !config.tsconfig) {
        risks.push('Pas de configuration TypeScript spécifiée');
    }

    return risks;
}

function analyzeTransformationRisks(transformers) {
    const risks = [];

    // Vérifier les conflits de transformation
    const patterns = transformers.map(t => t.pattern);
    const duplicates = patterns.filter((pattern, index) => 
        patterns.indexOf(pattern) !== index
    );

    if (duplicates.length > 0) {
        risks.push({
            level: 'HAUTE',
            message: `Motifs de transformation en conflit: ${duplicates.join(', ')}`
        });
    }

    // Vérifier les transformations manquantes importantes
    const hasJsTransform = transformers.some(t => 
        t.pattern.includes('.js') || t.pattern.includes('js')
    );
    const hasTsTransform = transformers.some(t => 
        t.pattern.includes('.ts') || t.pattern.includes('ts')
    );

    if (!hasJsTransform) {
        risks.push({
            level: 'MOYENNE',
            message: 'Aucune transformation JavaScript configurée'
        });
    }

    if (!hasTsTransform) {
        risks.push({
            level: 'INFO',
            message: 'Aucune transformation TypeScript configurée'
        });
    }

    return risks;
}

function analyzeNextCompatibility(config) {
    const issues = [];
    const recommendations = [];

    // Vérifier la configuration de base
    if (config.testEnvironment !== 'jest-environment-jsdom') {
        issues.push({
            level: 'HAUTE',
            message: 'Environnement de test non compatible avec Next.js'
        });
    }

    // Vérifier les transformations
    if (config.transform) {
        const hasNextBabel = Object.values(config.transform)
            .some(t => (Array.isArray(t) ? t[1]?.presets?.includes('next/babel') : false));
        
        if (!hasNextBabel) {
            issues.push({
                level: 'HAUTE',
                message: 'Preset Babel Next.js manquant'
            });
        }
    }

    // Vérifier les mappings de modules
    if (config.moduleNameMapper) {
        const hasStyleMapping = Object.keys(config.moduleNameMapper)
            .some(k => k.includes('\\.(css|less|sass|scss)$'));
        
        if (!hasStyleMapping) {
            recommendations.push({
                level: 'MOYENNE',
                message: 'Ajouter un mapping pour les fichiers de style'
            });
        }
    }

    return { issues, recommendations };
}

function analyzePerformance(config) {
    return {
        maxWorkers: config.maxWorkers,
        timers: {
            fake: config.timers === 'fake',
            modern: config.modern === true
        },
        cache: {
            enabled: config.cache !== false,
            directory: config.cacheDirectory
        },
        bail: config.bail || 0,
        verbose: config.verbose || false
    };
}

function analyzeSecurityConcerns(config) {
    const concerns = [];

    if (config.testTimeout > 10000) {
        concerns.push({
            level: 'FAIBLE',
            type: 'PERFORMANCE',
            detail: 'Timeout de test élevé peut masquer des problèmes de performance'
        });
    }

    if (config.detectOpenHandles === false) {
        concerns.push({
            level: 'MOYENNE',
            type: 'RESSOURCES',
            detail: 'La non-détection des handles ouverts peut causer des fuites mémoire'
        });
    }

    if (config.detectLeaks === false) {
        concerns.push({
            level: 'HAUTE',
            type: 'MÉMOIRE',
            detail: 'La désactivation de la détection des fuites peut masquer des problèmes graves'
        });
    }

    return concerns;
}

function formatReport(report) {
    let output = '';

    // En-tête
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Jest\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    // Section 1: Environnement de Test
    output += chalk.yellow('\n[1] ENVIRONNEMENT DE TEST\n');
    if (report.testEnvironment) {
        output += chalk.gray('  • Type: ') + 
                 chalk.white(report.testEnvironment.type) + '\n';
        output += chalk.gray('  • Environnement: ') + 
                 chalk.white(report.testEnvironment.name) + '\n';
        output += chalk.gray('  • Description: ') + 
                 chalk.white(report.testEnvironment.description) + '\n';
        output += chalk.gray('  • Implications: ') + 
                 chalk.white(report.testEnvironment.implications) + '\n';
    }

    // Section 2: Configuration des Tests
    output += chalk.yellow('\n[2] CONFIGURATION DES TESTS\n');
    if (report.testMatch) {
        if (report.testMatch.patterns.length > 0) {
            output += chalk.cyan('  ■ Patterns de Test\n');
            report.testMatch.patterns.forEach(pattern => {
                output += chalk.gray(`    • ${pattern}\n`);
            });
        }
        if (report.testMatch.ignore.length > 0) {
            output += chalk.cyan('  ■ Patterns Ignorés\n');
            report.testMatch.ignore.forEach(pattern => {
                output += chalk.gray(`    • ${pattern}\n`);
            });
        }
    }

    // Section 3: Modules et Transformations
    output += chalk.yellow('\n[3] MODULES ET TRANSFORMATIONS\n');
    const moduleConfig = report.moduleConfig;
    if (moduleConfig.moduleNameMapper) {
        output += chalk.cyan('  ■ Alias de Modules\n');
        moduleConfig.moduleNameMapper.forEach(mapping => {
            output += chalk.gray(`    • ${mapping.pattern} → ${mapping.target}\n`);
        });
    }

    if (report.transform) {
        output += chalk.cyan('\n  ■ Transformations\n');
        report.transform.transformers.forEach(t => {
            output += chalk.gray(`    • ${t.pattern} → ${t.transformer}\n`);
            if (t.risk.length > 0) {
                t.risk.forEach(risk => {
                    output += chalk.red(`      ⚠️  ${risk}\n`);
                });
            }
        });
    }

    // Section 4: Couverture de Code
    if (report.coverage) {
        output += chalk.yellow('\n[4] COUVERTURE DE CODE\n');
        output += chalk.cyan('  ■ Configuration\n');
        output += chalk.gray('    • Activé: ') + 
                 (report.coverage.enabled ? chalk.green('OUI') : chalk.red('NON')) + '\n';
        output += chalk.gray('    • Répertoire: ') + 
                 chalk.white(report.coverage.directory) + '\n';

        if (report.coverage.thresholds.global) {
            output += chalk.cyan('\n  ■ Seuils de Couverture\n');
            Object.entries(report.coverage.thresholds.global).forEach(([key, value]) => {
                const color = value >= 80 ? chalk.green : value >= 60 ? chalk.yellow : chalk.red;
                output += chalk.gray(`    • ${key}: `) + color(`${value}%\n`);
            });
        }

        if (report.coverage.collect.patterns.length > 0) {
            output += chalk.cyan('\n  ■ Fichiers Inclus\n');
            report.coverage.collect.patterns.forEach(pattern => {
                output += chalk.gray(`    • ${pattern}\n`);
            });
        }
    }

    // Section 5: Compatibilité Next.js
    if (report.nextCompatibility) {
        output += chalk.yellow('\n[5] COMPATIBILITÉ NEXT.JS\n');
        
        if (report.nextCompatibility.issues.length > 0) {
            output += chalk.cyan('  ■ Problèmes\n');
            report.nextCompatibility.issues.forEach(issue => {
                output += chalk.red(`    ⚠️  [${issue.level}] ${issue.message}\n`);
            });
        }

        if (report.nextCompatibility.recommendations.length > 0) {
            output += chalk.cyan('  ■ Recommandations\n');
            report.nextCompatibility.recommendations.forEach(rec => {
                output += chalk.yellow(`    • ${rec.message}\n`);
            });
        }

        if (report.nextCompatibility.issues.length === 0 && 
            report.nextCompatibility.recommendations.length === 0) {
            output += chalk.green('  ✓ Configuration compatible avec Next.js\n');
        }
    }

    // Section 6: Performance
    output += chalk.yellow('\n[6] PERFORMANCE\n');
    const perf = report.performance;
    output += chalk.gray('  • Workers Max: ') + 
             chalk.white(perf.maxWorkers || 'Auto') + '\n';
    output += chalk.gray('  • Cache: ') + 
             (perf.cache.enabled ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
    output += chalk.gray('  • Bail: ') + 
             chalk.white(perf.bail || 'Désactivé') + '\n';

    if (report.security.length > 0) {
        output += chalk.cyan('\n  ■ Alertes de Sécurité\n');
        report.security.forEach(concern => {
            output += chalk.red(`    ⚠️  [${concern.level}] ${concern.type}\n`);
            output += chalk.gray(`       → ${concern.detail}\n`);
        });
    }

    output += chalk.gray('\n' + '═'.repeat(70) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
} 