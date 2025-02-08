import chalk from 'chalk';

export async function analyzeTranspilationConfig(content, type = 'swc') {
    try {
        const config = JSON.parse(content);
        const report = {
            type,
            parser: analyzeParser(config, type),
            transform: analyzeTransform(config, type),
            optimization: analyzeOptimization(config, type),
            modules: analyzeModules(config, type),
            targets: analyzeTargets(config, type),
            security: analyzeSecurityConcerns(config, type)
        };

        return formatReport(report);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE ${type.toUpperCase()}] ${error.message}`);
    }
}

function analyzeParser(config, type) {
    if (type === 'swc') {
        const parser = config.jsc?.parser || {};
        return {
            syntax: parser.syntax || 'ecmascript',
            features: {
                jsx: parser.jsx || false,
                tsx: parser.tsx || false,
                decorators: parser.decorators || false,
                dynamicImport: parser.dynamicImport || false
            },
            risks: analyzeParserRisks(parser)
        };
    } else {
        // Configuration Babel
        const presets = config.presets || [];
        const plugins = config.plugins || [];
        return {
            presets: presets.map(preset => ({
                name: Array.isArray(preset) ? preset[0] : preset,
                options: Array.isArray(preset) ? preset[1] : {}
            })),
            plugins: plugins.map(plugin => ({
                name: Array.isArray(plugin) ? plugin[0] : plugin,
                options: Array.isArray(plugin) ? plugin[1] : {}
            })),
            risks: analyzeBabelPresetRisks(presets, plugins)
        };
    }
}

function analyzeParserRisks(parser) {
    const risks = [];

    if (parser.decorators && !parser.decoratorsBeforeExport) {
        risks.push({
            level: 'MOYENNE',
            message: 'Les décorateurs après export peuvent causer des problèmes de compatibilité'
        });
    }

    if (parser.syntax === 'typescript' && !parser.tsx) {
        risks.push({
            level: 'FAIBLE',
            message: 'Support TSX désactivé avec la syntaxe TypeScript'
        });
    }

    return risks;
}

function analyzeBabelPresetRisks(presets, plugins) {
    const risks = [];

    // Vérifier les presets conflictuels
    const hasEnv = presets.some(p => (Array.isArray(p) ? p[0] : p).includes('@babel/preset-env'));
    const hasTs = presets.some(p => (Array.isArray(p) ? p[0] : p).includes('@babel/preset-typescript'));
    
    if (hasEnv && hasTs) {
        risks.push({
            level: 'FAIBLE',
            message: 'Utilisation simultanée de preset-env et preset-typescript peut être redondante'
        });
    }

    return risks;
}

function analyzeTransform(config, type) {
    if (type === 'swc') {
        const transform = config.jsc?.transform || {};
        return {
            react: {
                runtime: transform.react?.runtime || 'classic',
                development: transform.react?.development || false,
                refresh: transform.react?.refresh || false
            },
            constModules: transform.constModules || false,
            optimizer: transform.optimizer || {}
        };
    } else {
        // Configuration Babel
        return {
            plugins: config.plugins || [],
            assumptions: config.assumptions || {}
        };
    }
}

function analyzeOptimization(config, type) {
    if (type === 'swc') {
        return {
            minify: config.minify || false,
            mangle: config.jsc?.minify?.mangle || false,
            compress: config.jsc?.minify?.compress || false,
            sourceMap: config.sourceMaps || false
        };
    } else {
        return {
            minify: false, // Babel ne gère pas la minification directement
            sourceMap: config.sourceMaps || false,
            compact: config.compact || false
        };
    }
}

function analyzeModules(config, type) {
    if (type === 'swc') {
        const moduleConfig = config.module || {};
        return {
            type: moduleConfig.type || 'es6',
            strict: moduleConfig.strict || false,
            noInterop: moduleConfig.noInterop || false,
            ignoreDynamic: moduleConfig.ignoreDynamic || false
        };
    } else {
        return {
            type: config.modules || 'auto',
            loose: config.loose || false,
            ignoreDynamic: false
        };
    }
}

function analyzeTargets(config, type) {
    if (type === 'swc') {
        return {
            target: config.jsc?.target || 'es5',
            loose: config.jsc?.loose || false,
            environment: 'browser'
        };
    } else {
        const targets = config.targets || {};
        return {
            browsers: targets.browsers || [],
            node: targets.node || 'current',
            environment: targets.esmodules ? 'module' : 'script'
        };
    }
}

function analyzeSecurityConcerns(config, type) {
    const concerns = [];

    if (type === 'swc') {
        if (config.jsc?.parser?.dynamicImport) {
            concerns.push({
                level: 'MOYENNE',
                type: 'SÉCURITÉ',
                detail: 'Les imports dynamiques peuvent présenter des risques de sécurité si non contrôlés'
            });
        }

        if (config.sourceMaps && !config.minify) {
            concerns.push({
                level: 'FAIBLE',
                type: 'EXPOSITION',
                detail: 'Source maps exposées sans minification'
            });
        }
    } else {
        if (config.compact === false) {
            concerns.push({
                level: 'FAIBLE',
                type: 'TAILLE',
                detail: 'La désactivation de la compaction peut augmenter la taille du bundle'
            });
        }
    }

    return concerns;
}

function formatReport(report) {
    let output = '';

    // En-tête
    output += chalk.blue(`\n🔍 RAPPORT D'ANALYSE - Configuration ${report.type.toUpperCase()}\n`);
    output += chalk.gray('═'.repeat(70) + '\n');

    // Section 1: Parser
    output += chalk.yellow('\n[1] CONFIGURATION DU PARSER\n');
    if (report.type === 'swc') {
        output += chalk.gray('  • Syntaxe: ') + chalk.white(report.parser.syntax) + '\n';
        output += chalk.cyan('  ■ Fonctionnalités\n');
        Object.entries(report.parser.features).forEach(([feature, enabled]) => {
            output += chalk.gray(`    • ${feature}: `) + 
                     (enabled ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
        });
    } else {
        output += chalk.cyan('  ■ Presets\n');
        report.parser.presets.forEach(preset => {
            output += chalk.gray(`    • ${preset.name}\n`);
            if (Object.keys(preset.options).length > 0) {
                output += chalk.gray('      Options: ') + 
                         chalk.white(JSON.stringify(preset.options)) + '\n';
            }
        });
    }

    if (report.parser.risks.length > 0) {
        output += chalk.cyan('\n  ■ Risques Détectés\n');
        report.parser.risks.forEach(risk => {
            output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
        });
    }

    // Section 2: Transformation
    output += chalk.yellow('\n[2] TRANSFORMATION\n');
    if (report.type === 'swc') {
        output += chalk.cyan('  ■ Configuration React\n');
        Object.entries(report.transform.react).forEach(([key, value]) => {
            output += chalk.gray(`    • ${key}: `) + chalk.white(value) + '\n';
        });
    } else {
        output += chalk.gray('  • Plugins: ') + 
                 chalk.white(report.transform.plugins.length) + '\n';
    }

    // Section 3: Optimisation
    output += chalk.yellow('\n[3] OPTIMISATION\n');
    Object.entries(report.optimization).forEach(([key, value]) => {
        output += chalk.gray(`  • ${key}: `) + 
                 (value ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
    });

    // Section 4: Modules
    output += chalk.yellow('\n[4] CONFIGURATION DES MODULES\n');
    Object.entries(report.modules).forEach(([key, value]) => {
        output += chalk.gray(`  • ${key}: `) + chalk.white(value) + '\n';
    });

    // Section 5: Cibles
    output += chalk.yellow('\n[5] CIBLES\n');
    Object.entries(report.targets).forEach(([key, value]) => {
        output += chalk.gray(`  • ${key}: `) + chalk.white(value) + '\n';
    });

    // Section 6: Sécurité
    if (report.security.length > 0) {
        output += chalk.yellow('\n[6] ALERTES DE SÉCURITÉ\n');
        report.security.forEach(concern => {
            output += chalk.red(`  ⚠️  [${concern.level}] ${concern.type}\n`);
            output += chalk.gray(`     → ${concern.detail}\n`);
        });
    }

    output += chalk.gray('\n' + '═'.repeat(70) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
} 