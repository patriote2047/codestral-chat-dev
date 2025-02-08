import chalk from 'chalk';

export async function analyzeNextConfig(content) {
    try {
        // Essayer de parser le JSON, sinon créer un objet à partir de la chaîne
        let config;
        try {
            config = JSON.parse(content);
        } catch (e) {
            // Évaluer la chaîne de manière sécurisée
            config = eval('(' + content + ')');
        }

        const report = {
            compiler: analyzeCompiler(config.compiler),
            experimental: analyzeExperimental(config.experimental),
            headers: analyzeHeaders(config.headers),
            rewrites: analyzeRewrites(config.rewrites),
            security: analyzeSecurityConfig(config),
            performance: analyzePerformanceConfig(config),
            optimization: analyzeOptimization(config)
        };

        return formatReport(report);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE NEXT.JS] ${error.message}`);
    }
}

function analyzeCompiler(compiler) {
    if (!compiler) return null;

    return {
        options: {
            styledComponents: compiler.styledComponents || false,
            emotion: compiler.emotion || false,
            reactRemoveProperties: compiler.reactRemoveProperties || false,
            removeConsole: compiler.removeConsole || false
        },
        optimization: {
            minify: !compiler.ignoreBuildErrors,
            sourceMap: compiler.sourceMap !== false
        }
    };
}

function analyzeExperimental(experimental) {
    if (!experimental) return null;

    const features = Object.entries(experimental).map(([feature, enabled]) => ({
        name: feature,
        enabled,
        risk: assessExperimentalRisk(feature)
    }));

    return {
        features,
        analysis: analyzeExperimentalRisks(features)
    };
}

function assessExperimentalRisk(feature) {
    const riskLevels = {
        'serverActions': 'HAUTE',
        'appDir': 'MOYENNE',
        'serverComponents': 'MOYENNE',
        'runtime': 'HAUTE'
    };

    return riskLevels[feature] || 'FAIBLE';
}

function analyzeExperimentalRisks(features) {
    const risks = [];
    const highRiskFeatures = features.filter(f => f.risk === 'HAUTE' && f.enabled);

    if (highRiskFeatures.length > 0) {
        risks.push({
            level: 'HAUTE',
            message: `Fonctionnalités expérimentales à risque activées: ${highRiskFeatures.map(f => f.name).join(', ')}`
        });
    }

    return risks;
}

function analyzeHeaders(headers) {
    if (!headers) return null;

    return {
        count: typeof headers === 'function' ? 'Dynamique' : Array.isArray(headers) ? headers.length : 0,
        security: analyzeSecurityHeaders(headers),
        cors: analyzeCorsHeaders(headers)
    };
}

function analyzeSecurityHeaders(headers) {
    const securityHeaders = [
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy'
    ];

    const implemented = new Set();
    const missing = new Set(securityHeaders);

    if (Array.isArray(headers)) {
        headers.forEach(header => {
            header.headers?.forEach(h => {
                const headerName = h.key.toLowerCase();
                securityHeaders.forEach(sh => {
                    if (headerName === sh.toLowerCase()) {
                        implemented.add(sh);
                        missing.delete(sh);
                    }
                });
            });
        });
    }

    return {
        implemented: Array.from(implemented),
        missing: Array.from(missing)
    };
}

function analyzeCorsHeaders(headers) {
    if (!headers || !Array.isArray(headers)) return null;

    const corsHeaders = headers.filter(header => 
        header.headers?.some(h => 
            h.key.toLowerCase().includes('access-control')
        )
    );

    return {
        enabled: corsHeaders.length > 0,
        config: corsHeaders
    };
}

function analyzeRewrites(rewrites) {
    if (!rewrites) return null;

    const isFunction = typeof rewrites === 'function';
    const rules = Array.isArray(rewrites) ? rewrites : [];

    return {
        type: isFunction ? 'Dynamique' : 'Statique',
        count: isFunction ? 'Dynamique' : rules.length,
        analysis: analyzeRewriteRisks(rules)
    };
}

function analyzeRewriteRisks(rules) {
    const risks = [];

    if (!Array.isArray(rules)) return risks;

    const hasWildcards = rules.some(rule => 
        rule.source?.includes('*') || rule.destination?.includes('*')
    );

    if (hasWildcards) {
        risks.push({
            level: 'MOYENNE',
            message: 'Utilisation de wildcards dans les règles de réécriture peut impacter les performances'
        });
    }

    const hasExternalRedirects = rules.some(rule => 
        rule.destination?.startsWith('http') || rule.destination?.startsWith('//')
    );

    if (hasExternalRedirects) {
        risks.push({
            level: 'HAUTE',
            message: 'Redirections vers des domaines externes détectées'
        });
    }

    return risks;
}

function analyzeSecurityConfig(config) {
    const concerns = [];

    if (config.poweredByHeader !== false) {
        concerns.push({
            level: 'MOYENNE',
            type: 'EXPOSITION',
            detail: 'L\'en-tête X-Powered-By expose des informations sur le serveur'
        });
    }

    if (config.compress === false) {
        concerns.push({
            level: 'FAIBLE',
            type: 'PERFORMANCE',
            detail: 'La compression est désactivée'
        });
    }

    return concerns;
}

function analyzePerformanceConfig(config) {
    return {
        compression: config.compress !== false,
        imageOptimization: config.images !== false,
        incrementalStaticRegeneration: {
            enabled: config.revalidate !== undefined || config.isr !== false,
            interval: config.revalidate
        },
        staticPageGeneration: config.staticPageGeneration !== false,
        swcMinify: config.swcMinify !== false
    };
}

function analyzeOptimization(config) {
    return {
        minification: {
            enabled: config.swcMinify !== false,
            type: config.swcMinify === false ? 'Terser' : 'SWC'
        },
        moduleScoping: config.optimizeCss || false,
        reactRemoveProperties: config.compiler?.reactRemoveProperties || false,
        removeConsole: config.compiler?.removeConsole || false
    };
}

function formatReport(report) {
    let output = '';

    // En-tête
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Next.js\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    // Section 1: Compilateur
    if (report.compiler) {
        output += chalk.yellow('\n[1] CONFIGURATION DU COMPILATEUR\n');
        output += chalk.cyan('  ■ Options\n');
        Object.entries(report.compiler.options).forEach(([key, value]) => {
            output += chalk.gray(`    • ${key}: `) + 
                     (value ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
        });

        output += chalk.cyan('\n  ■ Optimisation\n');
        Object.entries(report.compiler.optimization).forEach(([key, value]) => {
            output += chalk.gray(`    • ${key}: `) + 
                     (value ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
        });
    }

    // Section 2: Fonctionnalités Expérimentales
    if (report.experimental?.features.length > 0) {
        output += chalk.yellow('\n[2] FONCTIONNALITÉS EXPÉRIMENTALES\n');
        report.experimental.features.forEach(feature => {
            const statusColor = feature.enabled ? 
                (feature.risk === 'HAUTE' ? chalk.red : chalk.yellow) : 
                chalk.gray;
            output += statusColor(`  • ${feature.name}: ${feature.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
            if (feature.enabled) {
                output += chalk.red(` [Risque: ${feature.risk}]\n`);
            } else {
                output += '\n';
            }
        });

        if (report.experimental.analysis.length > 0) {
            output += chalk.cyan('\n  ■ Alertes\n');
            report.experimental.analysis.forEach(risk => {
                output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
            });
        }
    }

    // Section 3: En-têtes HTTP
    if (report.headers) {
        output += chalk.yellow('\n[3] CONFIGURATION DES EN-TÊTES\n');
        output += chalk.gray('  • Nombre de règles: ') + 
                 chalk.white(report.headers.count) + '\n';

        if (report.headers.security.implemented.length > 0) {
            output += chalk.cyan('\n  ■ En-têtes de Sécurité Implémentés\n');
            report.headers.security.implemented.forEach(header => {
                output += chalk.green(`    ✓ ${header}\n`);
            });
        }

        if (report.headers.security.missing.length > 0) {
            output += chalk.cyan('\n  ■ En-têtes de Sécurité Manquants\n');
            report.headers.security.missing.forEach(header => {
                output += chalk.red(`    ✗ ${header}\n`);
            });
        }

        if (report.headers.cors) {
            output += chalk.cyan('\n  ■ Configuration CORS\n');
            output += chalk.gray('    • Activé: ') + 
                     (report.headers.cors.enabled ? 
                        chalk.green('OUI') : chalk.red('NON')) + '\n';
        }
    }

    // Section 4: Règles de Réécriture
    if (report.rewrites) {
        output += chalk.yellow('\n[4] RÈGLES DE RÉÉCRITURE\n');
        output += chalk.gray('  • Type: ') + chalk.white(report.rewrites.type) + '\n';
        output += chalk.gray('  • Nombre de règles: ') + 
                 chalk.white(report.rewrites.count) + '\n';

        if (report.rewrites.analysis.length > 0) {
            output += chalk.cyan('\n  ■ Risques Détectés\n');
            report.rewrites.analysis.forEach(risk => {
                output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
            });
        }
    }

    // Section 5: Performance
    output += chalk.yellow('\n[5] PERFORMANCE\n');
    const perf = report.performance;
    output += chalk.gray('  • Compression: ') + 
             (perf.compression ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
    output += chalk.gray('  • Optimisation des images: ') + 
             (perf.imageOptimization ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
    output += chalk.gray('  • Minification SWC: ') + 
             (perf.swcMinify ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';

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