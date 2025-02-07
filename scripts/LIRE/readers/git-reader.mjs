import chalk from 'chalk';

export async function analyzeGitConfig(content) {
    try {
        const config = parseGitConfig(content);
        const report = {
            core: analyzeCoreSettings(config.core),
            remote: analyzeRemotes(config.remote),
            branch: analyzeBranches(config.branch),
            hooks: analyzeHooks(config.hooks),
            security: analyzeSecuritySettings(config),
            user: analyzeUserSettings(config.user)
        };

        return formatReport(report);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE GIT] ${error.message}`);
    }
}

function parseGitConfig(content) {
    const config = {};
    let currentSection = null;
    let currentSubSection = null;

    content.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;

        // Détecter les sections
        const sectionMatch = line.match(/^\[(.*?)\]$/);
        if (sectionMatch) {
            const section = sectionMatch[1];
            if (section.includes('.')) {
                const [main, sub] = section.split('.');
                if (!config[main]) config[main] = {};
                if (!config[main][sub]) config[main][sub] = {};
                currentSection = main;
                currentSubSection = sub;
            } else {
                if (!config[section]) config[section] = {};
                currentSection = section;
                currentSubSection = null;
            }
            return;
        }

        // Traiter les paramètres
        const paramMatch = line.match(/^(\w+)\s*=\s*(.*)$/);
        if (paramMatch && currentSection) {
            const [, key, value] = paramMatch;
            if (currentSubSection) {
                config[currentSection][currentSubSection][key] = value;
            } else {
                config[currentSection][key] = value;
            }
        }
    });

    return config;
}

function analyzeCoreSettings(core = {}) {
    const analysis = {
        settings: {},
        recommendations: []
    };

    // Analyser les paramètres principaux
    if (core.autocrlf) {
        analysis.settings.autocrlf = {
            value: core.autocrlf,
            description: getAutocrlfDescription(core.autocrlf)
        };
    }

    if (core.filemode) {
        analysis.settings.filemode = {
            value: core.filemode,
            description: "Gestion des permissions de fichiers"
        };
    }

    if (core.bare) {
        analysis.settings.bare = {
            value: core.bare,
            description: "Dépôt sans copie de travail"
        };
    }

    // Vérifier les paramètres de sécurité
    if (!core.fsmonitor) {
        analysis.recommendations.push({
            level: "SUGGESTION",
            message: "Activer fsmonitor peut améliorer les performances"
        });
    }

    if (!core.precomposeunicode) {
        analysis.recommendations.push({
            level: "SUGGESTION",
            message: "Configurer precomposeunicode pour une meilleure gestion Unicode"
        });
    }

    return analysis;
}

function getAutocrlfDescription(value) {
    const descriptions = {
        'true': 'Conversion CRLF en LF à la réception',
        'false': 'Pas de conversion automatique',
        'input': 'Conversion en LF à la réception uniquement'
    };
    return descriptions[value] || 'Configuration personnalisée';
}

function analyzeRemotes(remotes = {}) {
    const analysis = {
        count: Object.keys(remotes).length,
        details: []
    };

    for (const [name, config] of Object.entries(remotes)) {
        analysis.details.push({
            name,
            url: config.url,
            fetch: config.fetch,
            push: config.push,
            security: analyzeRemoteSecurity(config)
        });
    }

    return analysis;
}

function analyzeRemoteSecurity(config) {
    const risks = [];

    if (config.url?.includes('http://')) {
        risks.push({
            level: "HAUTE",
            message: "Utilisation de HTTP non sécurisé"
        });
    }

    return risks;
}

function analyzeBranches(branches = {}) {
    return {
        count: Object.keys(branches).length,
        details: Object.entries(branches).map(([name, config]) => ({
            name,
            remote: config.remote,
            merge: config.merge,
            rebase: config.rebase === 'true'
        }))
    };
}

function analyzeHooks(hooks = {}) {
    const analysis = {
        active: [],
        recommendations: []
    };

    // Liste des hooks recommandés
    const recommendedHooks = [
        'pre-commit',
        'pre-push',
        'commit-msg',
        'pre-rebase'
    ];

    if (hooks) {
        Object.keys(hooks).forEach(hook => {
            analysis.active.push({
                name: hook,
                path: hooks[hook]
            });
        });
    }

    // Vérifier les hooks manquants
    recommendedHooks.forEach(hook => {
        if (!hooks || !hooks[hook]) {
            analysis.recommendations.push({
                level: "SUGGESTION",
                hook,
                message: `Le hook ${hook} est recommandé pour améliorer la qualité du code`
            });
        }
    });

    return analysis;
}

function analyzeSecuritySettings(config) {
    const concerns = [];

    // Vérifier les paramètres de sécurité critiques
    if (config.http?.sslVerify === 'false') {
        concerns.push({
            level: "HAUTE",
            type: "SSL_VERIFY",
            detail: "La vérification SSL est désactivée"
        });
    }

    if (config.core?.sharedRepository === 'group' || config.core?.sharedRepository === 'all') {
        concerns.push({
            level: "MOYENNE",
            type: "PERMISSIONS",
            detail: "Permissions de dépôt partagées potentiellement trop permissives"
        });
    }

    return concerns;
}

function analyzeUserSettings(user = {}) {
    return {
        name: user.name || null,
        email: user.email || null,
        signingkey: user.signingkey || null
    };
}

function formatReport(report) {
    let output = '';

    // En-tête
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Configuration Git\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    // Section 1: Paramètres Core
    output += chalk.yellow('\n[1] PARAMÈTRES PRINCIPAUX\n');
    if (Object.keys(report.core.settings).length > 0) {
        for (const [key, setting] of Object.entries(report.core.settings)) {
            output += chalk.gray(`  • ${key}: `) + 
                     chalk.white(setting.value) + '\n';
            if (setting.description) {
                output += chalk.gray(`    └─ ${setting.description}\n`);
            }
        }
    } else {
        output += chalk.gray('  Aucun paramètre core spécifié\n');
    }

    if (report.core.recommendations.length > 0) {
        output += chalk.cyan('\n  ■ Recommandations\n');
        report.core.recommendations.forEach(rec => {
            output += chalk.yellow(`    ℹ️  ${rec.message}\n`);
        });
    }

    // Section 2: Dépôts Distants
    output += chalk.yellow('\n[2] DÉPÔTS DISTANTS\n');
    if (report.remote.count > 0) {
        output += chalk.gray(`  Total: ${report.remote.count} dépôt(s)\n`);
        report.remote.details.forEach(remote => {
            output += chalk.cyan(`\n  ■ ${remote.name}\n`);
            output += chalk.gray('    • URL: ') + chalk.white(remote.url) + '\n';
            if (remote.fetch) {
                output += chalk.gray('    • Fetch: ') + chalk.white(remote.fetch) + '\n';
            }
            if (remote.security.length > 0) {
                remote.security.forEach(risk => {
                    output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
                });
            }
        });
    } else {
        output += chalk.gray('  Aucun dépôt distant configuré\n');
    }

    // Section 3: Branches
    output += chalk.yellow('\n[3] BRANCHES\n');
    if (report.branch.count > 0) {
        output += chalk.gray(`  Total: ${report.branch.count} branche(s)\n`);
        report.branch.details.forEach(branch => {
            output += chalk.cyan(`\n  ■ ${branch.name}\n`);
            if (branch.remote) {
                output += chalk.gray('    • Remote: ') + chalk.white(branch.remote) + '\n';
            }
            if (branch.merge) {
                output += chalk.gray('    • Merge: ') + chalk.white(branch.merge) + '\n';
            }
            output += chalk.gray('    • Rebase: ') + 
                     (branch.rebase ? chalk.green('ACTIVÉ') : chalk.red('DÉSACTIVÉ')) + '\n';
        });
    } else {
        output += chalk.gray('  Aucune branche configurée\n');
    }

    // Section 4: Hooks
    output += chalk.yellow('\n[4] HOOKS\n');
    if (report.hooks.active.length > 0) {
        output += chalk.gray(`  Hooks actifs: ${report.hooks.active.length}\n`);
        report.hooks.active.forEach(hook => {
            output += chalk.gray(`  • ${hook.name}: `) + chalk.white(hook.path) + '\n';
        });
    } else {
        output += chalk.gray('  Aucun hook configuré\n');
    }

    if (report.hooks.recommendations.length > 0) {
        output += chalk.cyan('\n  ■ Hooks Recommandés\n');
        report.hooks.recommendations.forEach(rec => {
            output += chalk.yellow(`    ℹ️  ${rec.message}\n`);
        });
    }

    // Section 5: Utilisateur
    output += chalk.yellow('\n[5] CONFIGURATION UTILISATEUR\n');
    if (report.user.name || report.user.email) {
        if (report.user.name) {
            output += chalk.gray('  • Nom: ') + chalk.white(report.user.name) + '\n';
        }
        if (report.user.email) {
            output += chalk.gray('  • Email: ') + chalk.white(report.user.email) + '\n';
        }
        if (report.user.signingkey) {
            output += chalk.gray('  • Clé de signature: ') + chalk.white(report.user.signingkey) + '\n';
        }
    } else {
        output += chalk.gray('  Aucune information utilisateur configurée\n');
    }

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