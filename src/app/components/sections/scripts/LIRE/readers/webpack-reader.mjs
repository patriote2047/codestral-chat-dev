import chalk from 'chalk';

export async function analyzeWebpackConfig(content) {
    try {
        const config = JSON.parse(content);
        const report = {
            mode: analyzeMode(config.mode),
            entry: analyzeEntry(config.entry),
            output: analyzeOutput(config.output),
            loaders: analyzeLoaders(config.module?.rules || []),
            plugins: analyzePlugins(config.plugins || []),
            optimization: analyzeOptimization(config.optimization),
            devServer: analyzeDevServer(config.devServer),
            resolve: analyzeResolve(config.resolve),
            performance: analyzePerformance(config.performance),
            security: analyzeSecurityConcerns(config)
        };

        return formatReport(report);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE WEBPACK] ${error.message}`);
    }
}

function analyzeMode(mode) {
    return {
        value: mode || 'production',
        implications: getModeImplications(mode)
    };
}

function getModeImplications(mode) {
    const implications = {
        'development': {
            description: 'Mode développement',
            features: [
                'Source maps détaillées',
                'Hot Module Replacement activé',
                'Pas de minification',
                'Variables de développement définies'
            ]
        },
        'production': {
            description: 'Mode production',
            features: [
                'Minification et optimisation',
                'Tree shaking activé',
                'Source maps limitées',
                'Variables de production définies'
            ]
        },
        'none': {
            description: 'Mode manuel',
            features: [
                'Aucune optimisation par défaut',
                'Configuration entièrement manuelle',
                'Contrôle total des optimisations'
            ]
        }
    };
    return implications[mode] || implications['production'];
}

function analyzeEntry(entry) {
    if (!entry) return null;

    const analysis = {
        type: typeof entry === 'string' ? 'simple' : 
              Array.isArray(entry) ? 'multiple' : 
              'complex',
        points: []
    };

    if (typeof entry === 'string') {
        analysis.points.push({ name: 'main', path: entry });
    } else if (Array.isArray(entry)) {
        entry.forEach((path, index) => {
            analysis.points.push({ name: `entry${index + 1}`, path });
        });
    } else if (typeof entry === 'object') {
        Object.entries(entry).forEach(([name, path]) => {
            analysis.points.push({ name, path: path.toString() });
        });
    }

    return analysis;
}

function analyzeOutput(output) {
    if (!output) return null;

    return {
        path: output.path,
        filename: output.filename,
        publicPath: output.publicPath,
        clean: output.clean || false,
        risks: analyzeOutputRisks(output)
    };
}

function analyzeOutputRisks(output) {
    const risks = [];

    if (!output.clean) {
        risks.push({
            level: 'FAIBLE',
            message: 'Le dossier de sortie n\'est pas nettoyé automatiquement'
        });
    }

    if (output.publicPath && !output.publicPath.startsWith('/')) {
        risks.push({
            level: 'MOYENNE',
            message: 'Le chemin public devrait commencer par /'
        });
    }

    return risks;
}

function analyzeLoaders(rules) {
    const categories = {
        scripts: [],
        styles: [],
        assets: [],
        other: []
    };

    rules.forEach(rule => {
        const category = categorizeLoader(rule);
        categories[category].push({
            test: formatRegex(rule.test?.toString()),
            loader: getLoaderName(rule),
            options: rule.options || rule.use?.options || {}
        });
    });

    return {
        categories,
        risks: analyzeLoaderRisks(rules)
    };
}

function categorizeLoader(rule) {
    const test = rule.test?.toString() || '';
    if (test.includes('js') || test.includes('ts')) return 'scripts';
    if (test.includes('css') || test.includes('scss') || test.includes('sass')) return 'styles';
    if (test.includes('png') || test.includes('jpg') || test.includes('svg')) return 'assets';
    return 'other';
}

function getLoaderName(rule) {
    if (rule.loader) return rule.loader;
    if (Array.isArray(rule.use)) {
        return rule.use.map(u => typeof u === 'string' ? u : u.loader).join(', ');
    }
    if (typeof rule.use === 'string') return rule.use;
    if (rule.use?.loader) return rule.use.loader;
    return 'unknown';
}

function formatRegex(str) {
    if (typeof str !== 'string') return str;
    const match = str.match(/^regex\((.*)\)(.*)/);
    if (match) {
        return `/${match[1]}/${match[2] || ''}`;
    }
    return str;
}

function analyzeLoaderRisks(rules) {
    const risks = [];

    const hasSourceMap = rules.some(rule => 
        rule.options?.sourceMap || rule.use?.some?.(u => u.options?.sourceMap)
    );

    if (hasSourceMap) {
        risks.push({
            level: 'MOYENNE',
            message: 'Source maps activées - À désactiver en production'
        });
    }

    return risks;
}

function analyzePlugins(plugins) {
    if (!Array.isArray(plugins)) return { count: 0, list: [] };

    const categorizedPlugins = plugins.map(plugin => ({
        name: plugin.constructor?.name || 'UnknownPlugin',
        category: categorizePlugin(plugin),
        options: extractPluginOptions(plugin)
    }));

    return {
        count: plugins.length,
        categories: groupPluginsByCategory(categorizedPlugins),
        risks: analyzePluginRisks(plugins)
    };
}

function categorizePlugin(plugin) {
    const name = plugin.constructor?.name || '';
    if (name.includes('Html')) return 'html';
    if (name.includes('CSS') || name.includes('Style')) return 'styles';
    if (name.includes('Copy') || name.includes('Assets')) return 'assets';
    if (name.includes('Define') || name.includes('Env')) return 'environment';
    if (name.includes('Terser') || name.includes('Minimize')) return 'optimization';
    return 'other';
}

function extractPluginOptions(plugin) {
    try {
        return plugin.options || {};
    } catch {
        return {};
    }
}

function groupPluginsByCategory(plugins) {
    return plugins.reduce((acc, plugin) => {
        if (!acc[plugin.category]) acc[plugin.category] = [];
        acc[plugin.category].push(plugin);
        return acc;
    }, {});
}

function analyzePluginRisks(plugins) {
    const risks = [];

    const hasMinifier = plugins.some(p => 
        p.constructor?.name?.includes('Terser') || 
        p.constructor?.name?.includes('Minimize')
    );

    if (!hasMinifier) {
        risks.push({
            level: 'MOYENNE',
            message: 'Aucun plugin de minification détecté'
        });
    }

    return risks;
}

function analyzeOptimization(optimization) {
    if (!optimization) return null;

    return {
        minimizer: Boolean(optimization.minimizer?.length),
        splitChunks: analyzeSplitChunks(optimization.splitChunks),
        treeShaking: optimization.usedExports !== false,
        sideEffects: optimization.sideEffects !== false
    };
}

function analyzeSplitChunks(splitChunks) {
    if (!splitChunks) return null;

    return {
        enabled: true,
        chunks: splitChunks.chunks || 'async',
        minSize: splitChunks.minSize,
        maxSize: splitChunks.maxSize,
        cacheGroups: Object.keys(splitChunks.cacheGroups || {})
    };
}

function analyzeDevServer(devServer) {
    if (!devServer) return null;

    return {
        port: devServer.port || 8080,
        hot: devServer.hot !== false,
        https: Boolean(devServer.https),
        proxy: analyzeProxy(devServer.proxy),
        security: analyzeDevServerSecurity(devServer)
    };
}

function analyzeProxy(proxy) {
    if (!proxy) return null;

    return {
        enabled: true,
        targets: Object.keys(proxy)
    };
}

function analyzeDevServerSecurity(devServer) {
    const risks = [];

    if (!devServer.https) {
        risks.push({
            level: 'MOYENNE',
            message: 'HTTPS non activé sur le serveur de développement'
        });
    }

    if (devServer.allowedHosts === '*') {
        risks.push({
            level: 'HAUTE',
            message: 'Tous les hôtes sont autorisés'
        });
    }

    return risks;
}

function analyzeResolve(resolve) {
    if (!resolve) return null;

    return {
        extensions: resolve.extensions || ['.js'],
        alias: Object.keys(resolve.alias || {}),
        modules: resolve.modules || ['node_modules'],
        fallback: Object.keys(resolve.fallback || {})
    };
}

function analyzePerformance(performance) {
    if (!performance) return null;

    return {
        hints: performance.hints || false,
        maxAssetSize: performance.maxAssetSize,
        maxEntrypointSize: performance.maxEntrypointSize
    };
}

function analyzeSecurityConcerns(config) {
    const concerns = [];

    if (config.devtool && config.devtool.includes('eval')) {
        concerns.push({
            level: 'HAUTE',
            type: 'SÉCURITÉ',
            detail: 'Utilisation de eval dans devtool peut présenter des risques de sécurité'
        });
    }

    if (config.mode === 'development' && config.optimization?.minimize) {
        concerns.push({
            level: 'FAIBLE',
            type: 'PERFORMANCE',
            detail: 'Minification activée en mode développement'
        });
    }

    return concerns;
}

function formatReport(report) {
    let output = '';

    // En-tête
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Webpack\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    // Section 1: Mode et Environnement
    output += chalk.yellow('\n[1] MODE ET ENVIRONNEMENT\n');
    output += chalk.gray('  • Mode: ') + chalk.white(report.mode.value) + '\n';
    output += chalk.cyan('  ■ Implications\n');
    report.mode.implications.features.forEach(feature => {
        output += chalk.gray(`    • ${feature}\n`);
    });

    // Section 2: Points d'Entrée
    if (report.entry) {
        output += chalk.yellow('\n[2] POINTS D\'ENTRÉE\n');
        output += chalk.gray('  • Type: ') + chalk.white(report.entry.type) + '\n';
        report.entry.points.forEach(point => {
            output += chalk.gray(`  • ${point.name}: `) + chalk.white(point.path) + '\n';
        });
    }

    // Section 3: Configuration de Sortie
    if (report.output) {
        output += chalk.yellow('\n[3] CONFIGURATION DE SORTIE\n');
        output += chalk.gray('  • Chemin: ') + chalk.white(report.output.path) + '\n';
        output += chalk.gray('  • Nom de fichier: ') + chalk.white(report.output.filename) + '\n';
        output += chalk.gray('  • Nettoyage automatique: ') + 
                 (report.output.clean ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';

        if (report.output.risks.length > 0) {
            output += chalk.cyan('\n  ■ Risques\n');
            report.output.risks.forEach(risk => {
                output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
            });
        }
    }

    // Section 4: Loaders
    if (report.loaders) {
        output += chalk.yellow('\n[4] LOADERS\n');
        Object.entries(report.loaders.categories).forEach(([category, loaders]) => {
            if (loaders.length > 0) {
                output += chalk.cyan(`  ■ ${category}\n`);
                loaders.forEach(loader => {
                    output += chalk.gray(`    • ${loader.test}: `) + 
                             chalk.white(loader.loader) + '\n';
                });
            }
        });

        if (report.loaders.risks.length > 0) {
            output += chalk.cyan('\n  ■ Risques\n');
            report.loaders.risks.forEach(risk => {
                output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
            });
        }
    }

    // Section 5: Plugins
    if (report.plugins && report.plugins.count > 0) {
        output += chalk.yellow('\n[5] PLUGINS\n');
        output += chalk.gray('  • Total: ') + chalk.white(report.plugins.count) + '\n';
        
        Object.entries(report.plugins.categories).forEach(([category, plugins]) => {
            output += chalk.cyan(`  ■ ${category}\n`);
            plugins.forEach(plugin => {
                output += chalk.gray(`    • ${plugin.name}\n`);
            });
        });

        if (report.plugins.risks.length > 0) {
            output += chalk.cyan('\n  ■ Risques\n');
            report.plugins.risks.forEach(risk => {
                output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
            });
        }
    }

    // Section 6: Optimisation
    if (report.optimization) {
        output += chalk.yellow('\n[6] OPTIMISATION\n');
        output += chalk.gray('  • Minification: ') + 
                 (report.optimization.minimizer ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
        output += chalk.gray('  • Tree Shaking: ') + 
                 (report.optimization.treeShaking ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
        
        if (report.optimization.splitChunks) {
            output += chalk.cyan('\n  ■ Split Chunks\n');
            output += chalk.gray('    • Mode: ') + 
                     chalk.white(report.optimization.splitChunks.chunks) + '\n';
            if (report.optimization.splitChunks.cacheGroups.length > 0) {
                output += chalk.gray('    • Groupes de cache: ') + 
                         chalk.white(report.optimization.splitChunks.cacheGroups.join(', ')) + '\n';
            }
        }
    }

    // Section 7: Serveur de Développement
    if (report.devServer) {
        output += chalk.yellow('\n[7] SERVEUR DE DÉVELOPPEMENT\n');
        output += chalk.gray('  • Port: ') + chalk.white(report.devServer.port) + '\n';
        output += chalk.gray('  • Hot Reload: ') + 
                 (report.devServer.hot ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
        output += chalk.gray('  • HTTPS: ') + 
                 (report.devServer.https ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';

        if (report.devServer.security.length > 0) {
            output += chalk.cyan('\n  ■ Risques de Sécurité\n');
            report.devServer.security.forEach(risk => {
                output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
            });
        }
    }

    // Section 8: Performance
    if (report.performance) {
        output += chalk.yellow('\n[8] PERFORMANCE\n');
        output += chalk.gray('  • Alertes: ') + 
                 chalk.white(report.performance.hints || 'Désactivées') + '\n';
        if (report.performance.maxAssetSize) {
            output += chalk.gray('  • Taille max. asset: ') + 
                     chalk.white(`${report.performance.maxAssetSize / 1024}KB`) + '\n';
        }
        if (report.performance.maxEntrypointSize) {
            output += chalk.gray('  • Taille max. entry: ') + 
                     chalk.white(`${report.performance.maxEntrypointSize / 1024}KB`) + '\n';
        }
    }

    // Section 9: Sécurité
    if (report.security.length > 0) {
        output += chalk.yellow('\n[9] ALERTES DE SÉCURITÉ\n');
        report.security.forEach(concern => {
            output += chalk.red(`  ⚠️  [${concern.level}] ${concern.type}\n`);
            output += chalk.gray(`     → ${concern.detail}\n`);
        });
    }

    output += chalk.gray('\n' + '═'.repeat(70) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
} 