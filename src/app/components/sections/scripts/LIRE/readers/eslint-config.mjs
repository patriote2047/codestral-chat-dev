import chalk from 'chalk';

export async function analyzeEslintConfig(content) {
    try {
        const config = JSON.parse(content);
        const report = {
            extends: analyzeExtends(config.extends),
            plugins: analyzePlugins(config.plugins),
            rules: analyzeRules(config.rules),
            env: analyzeEnvironment(config.env),
            parser: analyzeParser(config.parser),
            parserOptions: analyzeParserOptions(config.parserOptions),
            settings: analyzeSettings(config.settings)
        };

        return formatReport(report);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE ESLINT] ${error.message}`);
    }
}

function analyzeExtends(extends_) {
    if (!extends_) return { count: 0, configs: [] };
    const configs = Array.isArray(extends_) ? extends_ : [extends_];
    return {
        count: configs.length,
        configs: configs.map(config => ({
            name: config,
            type: categorizeConfig(config)
        }))
    };
}

function categorizeConfig(config) {
    if (config.includes('airbnb')) return 'style-guide';
    if (config.includes('prettier')) return 'formatting';
    if (config.includes('typescript')) return 'typescript';
    if (config.includes('react')) return 'react';
    if (config.includes('next')) return 'next.js';
    return 'other';
}

function analyzePlugins(plugins) {
    if (!plugins) return { count: 0, list: [] };
    return {
        count: plugins.length,
        list: plugins.map(plugin => ({
            name: plugin,
            purpose: getPluginPurpose(plugin)
        }))
    };
}

function getPluginPurpose(plugin) {
    const purposes = {
        'react': 'Support de React',
        'react-hooks': 'Règles pour les Hooks React',
        'prettier': 'Intégration avec Prettier',
        '@typescript-eslint': 'Support de TypeScript',
        'import': 'Gestion des imports',
        'jsx-a11y': 'Accessibilité',
        'testing-library': 'Tests avec Testing Library'
    };
    return purposes[plugin] || 'Non spécifié';
}

function analyzeRules(rules) {
    if (!rules) return { count: 0, categories: {} };
    
    const categories = {
        error: [],
        warning: [],
        disabled: [],
        custom: []
    };

    for (const [rule, config] of Object.entries(rules)) {
        const severity = Array.isArray(config) ? config[0] : config;
        switch (severity) {
            case 2:
            case 'error':
                categories.error.push({ rule, config });
                break;
            case 1:
            case 'warn':
                categories.warning.push({ rule, config });
                break;
            case 0:
            case 'off':
                categories.disabled.push({ rule, config });
                break;
            default:
                categories.custom.push({ rule, config });
        }
    }

    return {
        count: Object.keys(rules).length,
        categories
    };
}

function analyzeEnvironment(env) {
    if (!env) return { enabled: [] };
    return {
        enabled: Object.entries(env)
            .filter(([, enabled]) => enabled)
            .map(([name]) => name)
    };
}

function analyzeParser(parser) {
    if (!parser) return null;
    const knownParsers = {
        '@typescript-eslint/parser': 'Parser TypeScript officiel',
        '@babel/eslint-parser': 'Parser Babel',
        'espree': 'Parser ESLint par défaut'
    };
    return {
        name: parser,
        description: knownParsers[parser] || 'Parser personnalisé'
    };
}

function analyzeParserOptions(options) {
    if (!options) return null;
    return {
        ecmaVersion: options.ecmaVersion,
        sourceType: options.sourceType,
        ecmaFeatures: options.ecmaFeatures,
        project: options.project
    };
}

function analyzeSettings(settings) {
    if (!settings) return null;
    return settings;
}

function formatReport(report) {
    let output = '';

    // En-tête
    output += chalk.blue('\n🔍 RAPPORT D\'INVESTIGATION - Configuration ESLint\n');
    output += chalk.gray('═'.repeat(60) + '\n');

    // Section 1: Configurations étendues
    output += chalk.yellow('\n[1] CONFIGURATIONS ÉTENDUES\n');
    if (report.extends.count > 0) {
        output += chalk.gray(`  Total: ${report.extends.count} configurations\n`);
        report.extends.configs.forEach(config => {
            output += chalk.gray(`  • ${config.name} `) + 
                     chalk.cyan(`(${config.type})\n`);
        });
    } else {
        output += chalk.gray('  Aucune configuration étendue\n');
    }

    // Section 2: Plugins
    output += chalk.yellow('\n[2] PLUGINS\n');
    if (report.plugins.count > 0) {
        output += chalk.gray(`  Total: ${report.plugins.count} plugins\n`);
        report.plugins.list.forEach(plugin => {
            output += chalk.gray(`  • ${plugin.name}: `) + 
                     chalk.white(plugin.purpose) + '\n';
        });
    } else {
        output += chalk.gray('  Aucun plugin installé\n');
    }

    // Section 3: Règles
    output += chalk.yellow('\n[3] RÈGLES\n');
    if (report.rules.count > 0) {
        output += chalk.gray(`  Total: ${report.rules.count} règles\n\n`);
        
        output += chalk.red(`  Erreurs (${report.rules.categories.error.length}):\n`);
        report.rules.categories.error.forEach(({rule}) => {
            output += chalk.gray(`    • ${rule}\n`);
        });

        output += chalk.yellow(`\n  Avertissements (${report.rules.categories.warning.length}):\n`);
        report.rules.categories.warning.forEach(({rule}) => {
            output += chalk.gray(`    • ${rule}\n`);
        });

        output += chalk.gray(`\n  Règles désactivées (${report.rules.categories.disabled.length}):\n`);
        report.rules.categories.disabled.forEach(({rule}) => {
            output += chalk.gray(`    • ${rule}\n`);
        });
    } else {
        output += chalk.gray('  Aucune règle configurée\n');
    }

    // Section 4: Environnement
    output += chalk.yellow('\n[4] ENVIRONNEMENT\n');
    if (report.env.enabled.length > 0) {
        report.env.enabled.forEach(env => {
            output += chalk.gray(`  • ${env}\n`);
        });
    } else {
        output += chalk.gray('  Aucun environnement spécifié\n');
    }

    // Section 5: Parser
    output += chalk.yellow('\n[5] PARSER\n');
    if (report.parser) {
        output += chalk.gray(`  Nom: `) + chalk.white(report.parser.name) + '\n';
        output += chalk.gray(`  Description: `) + chalk.white(report.parser.description) + '\n';
    } else {
        output += chalk.gray('  Parser par défaut (Espree)\n');
    }

    // Section 6: Options du Parser
    if (report.parserOptions) {
        output += chalk.yellow('\n[6] OPTIONS DU PARSER\n');
        if (report.parserOptions.ecmaVersion) {
            output += chalk.gray(`  Version ECMAScript: `) + 
                     chalk.white(report.parserOptions.ecmaVersion) + '\n';
        }
        if (report.parserOptions.sourceType) {
            output += chalk.gray(`  Type de source: `) + 
                     chalk.white(report.parserOptions.sourceType) + '\n';
        }
        if (report.parserOptions.project) {
            output += chalk.gray(`  Projet TypeScript: `) + 
                     chalk.white(report.parserOptions.project) + '\n';
        }
    }

    output += chalk.gray('\n' + '═'.repeat(60) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
} 