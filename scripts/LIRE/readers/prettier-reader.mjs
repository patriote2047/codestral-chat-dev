import chalk from 'chalk';

export async function analyzePrettierConfig(content) {
    try {
        const config = JSON.parse(content);
        const report = {
            formatting: analyzeFormattingRules(config),
            indentation: analyzeIndentation(config),
            quotes: analyzeQuotes(config),
            jsx: analyzeJSXRules(config),
            compatibility: analyzeCompatibility(config),
            risks: analyzeConfigurationRisks(config)
        };

        return formatReport(report);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE PRETTIER] ${error.message}`);
    }
}

function analyzeFormattingRules(config) {
    return {
        printWidth: {
            value: config.printWidth || 80,
            impact: assessPrintWidthImpact(config.printWidth)
        },
        semi: {
            value: config.semi ?? true,
            description: config.semi ? 'Points-virgules obligatoires' : 'Points-virgules omis'
        },
        trailingComma: {
            value: config.trailingComma || 'none',
            description: getTrailingCommaDescription(config.trailingComma)
        },
        bracketSpacing: config.bracketSpacing ?? true,
        bracketSameLine: config.bracketSameLine ?? false,
        arrowParens: config.arrowParens || 'always'
    };
}

function assessPrintWidthImpact(width) {
    if (!width) return 'STANDARD (80)';
    if (width < 80) return 'COURT - Peut augmenter le nombre de lignes';
    if (width > 120) return 'LONG - Peut réduire la lisibilité';
    return 'OPTIMAL';
}

function getTrailingCommaDescription(value) {
    const descriptions = {
        'none': 'Pas de virgules finales',
        'es5': 'Virgules finales compatibles ES5',
        'all': 'Virgules finales partout où possible'
    };
    return descriptions[value] || 'Configuration personnalisée';
}

function analyzeIndentation(config) {
    return {
        type: config.useTabs ? 'tabs' : 'spaces',
        size: config.tabWidth || 2,
        risks: analyzeIndentationRisks(config)
    };
}

function analyzeIndentationRisks(config) {
    const risks = [];
    
    if (config.useTabs) {
        risks.push({
            level: 'FAIBLE',
            message: 'Les tabulations peuvent être affichées différemment selon l\'éditeur'
        });
    }

    if (config.tabWidth > 4) {
        risks.push({
            level: 'MOYENNE',
            message: 'Une indentation large peut réduire la lisibilité du code'
        });
    }

    return risks;
}

function analyzeQuotes(config) {
    return {
        style: {
            default: config.singleQuote ? 'single' : 'double',
            jsx: config.jsxSingleQuote ? 'single' : 'double'
        },
        consistency: assessQuoteConsistency(config)
    };
}

function assessQuoteConsistency(config) {
    const defaultQuote = config.singleQuote ? 'single' : 'double';
    const jsxQuote = config.jsxSingleQuote ? 'single' : 'double';

    return {
        isConsistent: defaultQuote === jsxQuote,
        recommendation: defaultQuote !== jsxQuote ? 
            'Considérer l\'utilisation du même type de guillemets pour JS et JSX' : 
            'Configuration cohérente'
    };
}

function analyzeJSXRules(config) {
    return {
        bracketSameLine: config.bracketSameLine || false,
        singleQuote: config.jsxSingleQuote || false,
        risks: analyzeJSXRisks(config)
    };
}

function analyzeJSXRisks(config) {
    const risks = [];

    if (config.bracketSameLine) {
        risks.push({
            level: 'FAIBLE',
            message: 'Les balises JSX sur la même ligne peuvent réduire la lisibilité des composants complexes'
        });
    }

    return risks;
}

function analyzeCompatibility(config) {
    const compatibility = {
        editorconfig: config.useEditorconfig !== false,
        plugins: [],
        overrides: Boolean(config.overrides?.length)
    };

    // Détecter les plugins potentiels
    if (config.plugins) {
        compatibility.plugins = Array.isArray(config.plugins) ? 
            config.plugins : [config.plugins];
    }

    return compatibility;
}

function analyzeConfigurationRisks(config) {
    const risks = [];

    if (config.requirePragma) {
        risks.push({
            level: 'MOYENNE',
            type: 'COUVERTURE',
            detail: 'requirePragma limite le formatage aux fichiers avec pragma'
        });
    }

    if (config.endOfLine === 'auto') {
        risks.push({
            level: 'FAIBLE',
            type: 'COHÉRENCE',
            detail: 'endOfLine: auto peut causer des incohérences dans les fins de ligne'
        });
    }

    if (!config.useEditorconfig && config.editorconfig !== false) {
        risks.push({
            level: 'FAIBLE',
            type: 'CONFIGURATION',
            detail: 'Pas de prise en compte explicite de .editorconfig'
        });
    }

    return risks;
}

function formatReport(report) {
    let output = '';

    // En-tête
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Prettier\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    // Section 1: Règles de Formatage
    output += chalk.yellow('\n[1] RÈGLES DE FORMATAGE\n');
    const formatting = report.formatting;
    output += chalk.gray('  • Largeur maximale: ') + 
             chalk.white(`${formatting.printWidth.value} (${formatting.printWidth.impact})\n`);
    output += chalk.gray('  • Points-virgules: ') + 
             chalk.white(formatting.semi.description) + '\n';
    output += chalk.gray('  • Virgules finales: ') + 
             chalk.white(formatting.trailingComma.description) + '\n';
    output += chalk.gray('  • Espaces dans les accolades: ') + 
             (formatting.bracketSpacing ? chalk.green('OUI') : chalk.red('NON')) + '\n';
    output += chalk.gray('  • Parenthèses des fonctions fléchées: ') + 
             chalk.white(formatting.arrowParens) + '\n';

    // Section 2: Indentation
    output += chalk.yellow('\n[2] INDENTATION\n');
    output += chalk.gray('  • Type: ') + 
             chalk.white(report.indentation.type === 'tabs' ? 'Tabulations' : 'Espaces') + '\n';
    output += chalk.gray('  • Taille: ') + 
             chalk.white(report.indentation.size) + '\n';

    if (report.indentation.risks.length > 0) {
        output += chalk.cyan('  ■ Risques\n');
        report.indentation.risks.forEach(risk => {
            output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
        });
    }

    // Section 3: Guillemets
    output += chalk.yellow('\n[3] GUILLEMETS\n');
    output += chalk.gray('  • JavaScript: ') + 
             chalk.white(report.quotes.style.default === 'single' ? 'Simples' : 'Doubles') + '\n';
    output += chalk.gray('  • JSX: ') + 
             chalk.white(report.quotes.style.jsx === 'single' ? 'Simples' : 'Doubles') + '\n';
    
    if (!report.quotes.consistency.isConsistent) {
        output += chalk.yellow(`  ⚠️  ${report.quotes.consistency.recommendation}\n`);
    }

    // Section 4: Configuration JSX
    output += chalk.yellow('\n[4] CONFIGURATION JSX\n');
    output += chalk.gray('  • Balises sur même ligne: ') + 
             (report.jsx.bracketSameLine ? chalk.green('OUI') : chalk.red('NON')) + '\n';

    if (report.jsx.risks.length > 0) {
        output += chalk.cyan('  ■ Risques\n');
        report.jsx.risks.forEach(risk => {
            output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
        });
    }

    // Section 5: Compatibilité
    output += chalk.yellow('\n[5] COMPATIBILITÉ\n');
    output += chalk.gray('  • EditorConfig: ') + 
             (report.compatibility.editorconfig ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
    
    if (report.compatibility.plugins.length > 0) {
        output += chalk.cyan('  ■ Plugins\n');
        report.compatibility.plugins.forEach(plugin => {
            output += chalk.gray(`    • ${plugin}\n`);
        });
    }

    // Section 6: Risques
    if (report.risks.length > 0) {
        output += chalk.yellow('\n[6] ALERTES\n');
        report.risks.forEach(risk => {
            output += chalk.red(`  ⚠️  [${risk.level}] ${risk.type}\n`);
            output += chalk.gray(`     → ${risk.detail}\n`);
        });
    }

    output += chalk.gray('\n' + '═'.repeat(70) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
} 