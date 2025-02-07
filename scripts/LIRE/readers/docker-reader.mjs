import chalk from 'chalk';

export async function analyzeDockerfile(content) {
    try {
        const analysis = {
            baseImage: analyzeBaseImage(content),
            stages: analyzeStages(content),
            commands: analyzeCommands(content),
            security: analyzeSecurityIssues(content),
            bestPractices: analyzeBestPractices(content),
            volumes: analyzeVolumes(content),
            ports: analyzePorts(content),
            env: analyzeEnvironmentVariables(content)
        };

        return formatDockerfileReport(analysis);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE DOCKERFILE] ${error.message}`);
    }
}

export async function analyzeDockerCompose(content) {
    try {
        const config = parseYaml(content);
        const analysis = {
            version: config.version,
            services: analyzeServices(config.services || {}),
            networks: analyzeNetworks(config.networks || {}),
            volumes: analyzeComposeVolumes(config.volumes || {}),
            security: analyzeComposeSecurityIssues(config),
            dependencies: analyzeServiceDependencies(config.services || {})
        };

        return formatComposeReport(analysis);
    } catch (error) {
        throw new Error(`[ERREUR D'ANALYSE DOCKER-COMPOSE] ${error.message}`);
    }
}

function parseYaml(content) {
    // Simple parser YAML pour docker-compose
    const lines = content.split('\n');
    const config = { services: {} };
    let currentSection = null;
    let currentService = null;
    let currentIndent = 0;

    lines.forEach(line => {
        const trimmedLine = line.trimEnd();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;

        const indent = line.search(/\S/);
        const [key, ...valueParts] = trimmedLine.trim().split(':');
        const value = valueParts.join(':').trim();

        if (indent === 0) {
            currentSection = key;
            config[key] = {};
            currentService = null;
        } else if (indent === 2 && currentSection === 'services') {
            currentService = key;
            config.services[key] = {};
        } else if (currentService && indent === 4) {
            config.services[currentService][key] = value;
        } else if (currentSection && indent === 2) {
            config[currentSection][key] = value;
        }
    });

    return config;
}

function analyzeBaseImage(content) {
    const fromMatch = content.match(/^FROM\s+([^\s]+)(?:\s+AS\s+([^\s]+))?/m);
    if (!fromMatch) return null;

    return {
        image: fromMatch[1],
        alias: fromMatch[2] || null,
        risks: analyzeBaseImageRisks(fromMatch[1])
    };
}

function analyzeBaseImageRisks(image) {
    const risks = [];

    if (image.includes(':latest')) {
        risks.push({
            level: 'HAUTE',
            message: 'Utilisation du tag "latest" peut causer des problèmes de reproductibilité'
        });
    }

    if (!image.includes(':')) {
        risks.push({
            level: 'HAUTE',
            message: 'Aucun tag spécifié pour l\'image de base'
        });
    }

    if (image.startsWith('ubuntu') || image.startsWith('debian')) {
        risks.push({
            level: 'MOYENNE',
            message: 'Les images complètes de distribution sont volumineuses, préférer des images slim'
        });
    }

    return risks;
}

function analyzeStages(content) {
    const stages = [];
    const stageRegex = /^FROM\s+([^\s]+)(?:\s+AS\s+([^\s]+))?/gm;
    let match;

    while ((match = stageRegex.exec(content)) !== null) {
        stages.push({
            image: match[1],
            name: match[2] || null
        });
    }

    return {
        count: stages.length,
        details: stages,
        isMultiStage: stages.length > 1
    };
}

function analyzeCommands(content) {
    const commands = {
        run: [],
        copy: [],
        add: [],
        env: [],
        other: []
    };

    const lines = content.split('\n');
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;

        if (trimmedLine.startsWith('RUN ')) {
            commands.run.push(analyzeSingleCommand('RUN', trimmedLine));
        } else if (trimmedLine.startsWith('COPY ')) {
            commands.copy.push(analyzeSingleCommand('COPY', trimmedLine));
        } else if (trimmedLine.startsWith('ADD ')) {
            commands.add.push(analyzeSingleCommand('ADD', trimmedLine));
        } else if (trimmedLine.startsWith('ENV ')) {
            commands.env.push(analyzeSingleCommand('ENV', trimmedLine));
        } else if (trimmedLine.match(/^[A-Z]+\s/)) {
            commands.other.push(trimmedLine);
        }
    });

    return commands;
}

function analyzeSingleCommand(type, line) {
    const command = line.substring(type.length).trim();
    const risks = [];

    switch (type) {
        case 'RUN':
            if (command.includes('apt-get') && !command.includes('rm -rf /var/lib/apt/lists/*')) {
                risks.push({
                    level: 'MOYENNE',
                    message: 'Cache APT non nettoyé après installation'
                });
            }
            if (command.includes('curl') && !command.includes('curl -fsSL')) {
                risks.push({
                    level: 'FAIBLE',
                    message: 'Utiliser curl avec -fsSL pour une meilleure gestion des erreurs'
                });
            }
            break;
        case 'ADD':
            risks.push({
                level: 'MOYENNE',
                message: 'Préférer COPY à ADD sauf pour les archives/URLs'
            });
            break;
        case 'COPY':
            if (command.includes('..')) {
                risks.push({
                    level: 'HAUTE',
                    message: 'Copie de fichiers en dehors du contexte de build'
                });
            }
            break;
    }

    return { command, risks };
}

function analyzeSecurityIssues(content) {
    const issues = [];

    // Vérifier les utilisateurs root
    if (!content.includes('USER ')) {
        issues.push({
            level: 'HAUTE',
            type: 'SECURITE',
            detail: 'Aucun utilisateur non-root défini'
        });
    }

    // Vérifier les permissions sensibles
    if (content.includes('chmod 777')) {
        issues.push({
            level: 'HAUTE',
            type: 'PERMISSIONS',
            detail: 'Permissions 777 détectées'
        });
    }

    // Vérifier les secrets en clair
    const secretPatterns = [
        /password\s*=\s*['"][^'"]+['"]/, 
        /api[_-]?key\s*=\s*['"][^'"]+['"]/, 
        /secret\s*=\s*['"][^'"]+['"]/
    ];

    secretPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            issues.push({
                level: 'CRITIQUE',
                type: 'SECRETS',
                detail: 'Secrets potentiellement exposés dans le Dockerfile'
            });
        }
    });

    return issues;
}

function analyzeBestPractices(content) {
    const practices = [];

    // Vérifier l'ordre des commandes (optimisation du cache)
    if (content.includes('COPY . .') && content.match(/^(RUN|ADD)/m)) {
        practices.push({
            type: 'CACHE',
            message: 'Copier les dépendances avant le code source pour optimiser le cache'
        });
    }

    // Vérifier la présence de HEALTHCHECK
    if (!content.includes('HEALTHCHECK')) {
        practices.push({
            type: 'MONITORING',
            message: 'Aucun HEALTHCHECK défini'
        });
    }

    // Vérifier les versions des paquets
    if (content.includes('apt-get install') && !content.includes('apt-get install -y --no-install-recommends')) {
        practices.push({
            type: 'OPTIMISATION',
            message: 'Utiliser --no-install-recommends avec apt-get install'
        });
    }

    return practices;
}

function analyzeVolumes(content) {
    const volumes = [];
    const volumeRegex = /^VOLUME\s+(.+)/gm;
    let match;

    while ((match = volumeRegex.exec(content)) !== null) {
        const volumePath = match[1].trim();
        volumes.push({
            path: volumePath,
            risks: analyzeVolumeRisks(volumePath)
        });
    }

    return volumes;
}

function analyzeVolumeRisks(volume) {
    const risks = [];

    if (volume.includes('/tmp')) {
        risks.push({
            level: 'MOYENNE',
            message: 'Volume temporaire peut causer des problèmes de performance'
        });
    }

    if (volume.startsWith('/')) {
        risks.push({
            level: 'FAIBLE',
            message: 'Chemin absolu peut causer des problèmes de portabilité'
        });
    }

    return risks;
}

function analyzePorts(content) {
    const ports = [];
    const portRegex = /^EXPOSE\s+(\d+)(?:\/(?:tcp|udp))?/gm;
    let match;

    while ((match = portRegex.exec(content)) !== null) {
        ports.push({
            number: parseInt(match[1]),
            protocol: match[2] || 'tcp',
            risks: analyzePortRisks(parseInt(match[1]))
        });
    }

    return ports;
}

function analyzePortRisks(port) {
    const risks = [];

    if (port < 1024) {
        risks.push({
            level: 'MOYENNE',
            message: 'Port privilégié nécessite des droits root'
        });
    }

    const commonPorts = {
        80: 'HTTP',
        443: 'HTTPS',
        22: 'SSH',
        3306: 'MySQL',
        5432: 'PostgreSQL',
        27017: 'MongoDB'
    };

    if (commonPorts[port]) {
        risks.push({
            level: 'INFO',
            message: `Port standard ${commonPorts[port]}`
        });
    }

    return risks;
}

function analyzeEnvironmentVariables(content) {
    const envVars = [];
    const envRegex = /^ENV\s+([A-Z_]+[A-Z0-9_]*)\s*=?\s*(.+)?/gm;
    let match;

    while ((match = envRegex.exec(content)) !== null) {
        envVars.push({
            name: match[1],
            value: match[2] || null,
            risks: analyzeEnvVarRisks(match[1], match[2])
        });
    }

    return envVars;
}

function analyzeEnvVarRisks(name, value) {
    const risks = [];

    const sensitivePatterns = [
        'PASSWORD',
        'SECRET',
        'KEY',
        'TOKEN',
        'CREDENTIAL'
    ];

    if (sensitivePatterns.some(pattern => name.includes(pattern))) {
        risks.push({
            level: 'HAUTE',
            message: 'Variable sensible définie dans le Dockerfile'
        });
    }

    if (value && value.length > 100) {
        risks.push({
            level: 'FAIBLE',
            message: 'Valeur de variable très longue'
        });
    }

    return risks;
}

function analyzeServices(services) {
    const analysis = {
        count: Object.keys(services).length,
        details: []
    };

    for (const [name, config] of Object.entries(services)) {
        analysis.details.push({
            name,
            image: config.image,
            ports: config.ports,
            volumes: config.volumes,
            environment: config.environment,
            depends_on: config.depends_on,
            risks: analyzeServiceRisks(config)
        });
    }

    return analysis;
}

function analyzeServiceRisks(config) {
    const risks = [];

    if (config.privileged === true) {
        risks.push({
            level: 'CRITIQUE',
            message: 'Mode privilégié activé'
        });
    }

    if (config.ports && config.ports.some(p => p.includes(':0:'))) {
        risks.push({
            level: 'HAUTE',
            message: 'Port mapping dynamique détecté'
        });
    }

    return risks;
}

function analyzeNetworks(networks) {
    return {
        count: Object.keys(networks).length,
        details: Object.entries(networks).map(([name, config]) => ({
            name,
            driver: config.driver || 'bridge',
            external: config.external || false,
            risks: analyzeNetworkRisks(config)
        }))
    };
}

function analyzeNetworkRisks(config) {
    const risks = [];

    if (config.driver === 'host') {
        risks.push({
            level: 'HAUTE',
            message: 'Network mode host peut exposer le conteneur'
        });
    }

    return risks;
}

function analyzeComposeVolumes(volumes) {
    return {
        count: Object.keys(volumes).length,
        details: Object.entries(volumes).map(([name, config]) => ({
            name,
            driver: config.driver || 'local',
            external: config.external || false,
            risks: analyzeComposeVolumeRisks(config)
        }))
    };
}

function analyzeComposeVolumeRisks(config) {
    const risks = [];

    if (config.driver === 'local' && !config.driver_opts) {
        risks.push({
            level: 'FAIBLE',
            message: 'Volume local sans options spécifiques'
        });
    }

    return risks;
}

function analyzeComposeSecurityIssues(config) {
    const issues = [];

    // Vérifier les services privilégiés
    for (const [service, conf] of Object.entries(config.services || {})) {
        if (conf.privileged) {
            issues.push({
                level: 'CRITIQUE',
                type: 'PRIVILEGE',
                detail: `Service ${service} en mode privilégié`
            });
        }
    }

    // Vérifier les montages sensibles
    const sensitiveMounts = ['/proc', '/sys', '/var/run/docker.sock'];
    for (const [service, conf] of Object.entries(config.services || {})) {
        if (conf.volumes) {
            conf.volumes.forEach(volume => {
                if (sensitiveMounts.some(mount => volume.includes(mount))) {
                    issues.push({
                        level: 'HAUTE',
                        type: 'VOLUME',
                        detail: `Service ${service} monte un chemin sensible: ${volume}`
                    });
                }
            });
        }
    }

    return issues;
}

function analyzeServiceDependencies(services) {
    const dependencies = {};
    
    for (const [service, config] of Object.entries(services)) {
        if (config.depends_on) {
            dependencies[service] = {
                depends_on: Array.isArray(config.depends_on) ? config.depends_on : Object.keys(config.depends_on),
                circular: false
            };
        }
    }

    // Détecter les dépendances circulaires
    for (const service in dependencies) {
        const visited = new Set();
        const checkCircular = (current) => {
            if (visited.has(current)) {
                dependencies[service].circular = true;
                return;
            }
            visited.add(current);
            const deps = dependencies[current]?.depends_on || [];
            deps.forEach(dep => checkCircular(dep));
            visited.delete(current);
        };
        checkCircular(service);
    }

    return dependencies;
}

function formatDockerfileReport(analysis) {
    let output = '';

    // En-tête
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Dockerfile\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    // Section 1: Image de Base
    output += chalk.yellow('\n[1] IMAGE DE BASE\n');
    if (analysis.baseImage) {
        output += chalk.gray('  • Image: ') + chalk.white(analysis.baseImage.image) + '\n';
        if (analysis.baseImage.alias) {
            output += chalk.gray('  • Alias: ') + chalk.white(analysis.baseImage.alias) + '\n';
        }
        if (analysis.baseImage.risks.length > 0) {
            output += chalk.cyan('\n  ■ Risques\n');
            analysis.baseImage.risks.forEach(risk => {
                output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
            });
        }
    } else {
        output += chalk.gray('  Image de base non trouvée\n');
    }

    // Section 2: Stages
    output += chalk.yellow('\n[2] STAGES\n');
    output += chalk.gray(`  • Nombre de stages: ${analysis.stages.count}\n`);
    if (analysis.stages.isMultiStage) {
        output += chalk.gray('  • Build multi-stage: ') + chalk.green('OUI') + '\n';
        analysis.stages.details.forEach((stage, index) => {
            output += chalk.cyan(`\n  ■ Stage ${index + 1}\n`);
            output += chalk.gray('    • Image: ') + chalk.white(stage.image) + '\n';
            if (stage.name) {
                output += chalk.gray('    • Nom: ') + chalk.white(stage.name) + '\n';
            }
        });
    }

    // Section 3: Commandes
    output += chalk.yellow('\n[3] COMMANDES\n');
    
    if (analysis.commands.run.length > 0) {
        output += chalk.cyan('\n  ■ Commandes RUN\n');
        analysis.commands.run.forEach(cmd => {
            output += chalk.gray(`  • ${cmd.command}\n`);
            if (cmd.risks.length > 0) {
                cmd.risks.forEach(risk => {
                    output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
                });
            }
        });
    }

    if (analysis.commands.copy.length > 0) {
        output += chalk.cyan('\n  ■ Commandes COPY\n');
        analysis.commands.copy.forEach(cmd => {
            output += chalk.gray(`  • ${cmd.command}\n`);
            if (cmd.risks.length > 0) {
                cmd.risks.forEach(risk => {
                    output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
                });
            }
        });
    }

    // Section 4: Volumes
    if (analysis.volumes.length > 0) {
        output += chalk.yellow('\n[4] VOLUMES\n');
        analysis.volumes.forEach(volume => {
            output += chalk.gray(`  • ${volume.path}\n`);
            if (volume.risks.length > 0) {
                volume.risks.forEach(risk => {
                    output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
                });
            }
        });
    }

    // Section 5: Ports
    if (analysis.ports.length > 0) {
        output += chalk.yellow('\n[5] PORTS EXPOSÉS\n');
        analysis.ports.forEach(port => {
            output += chalk.gray(`  • ${port.number}/${port.protocol}\n`);
            if (port.risks.length > 0) {
                port.risks.forEach(risk => {
                    output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
                });
            }
        });
    }

    // Section 6: Variables d'Environnement
    if (analysis.env.length > 0) {
        output += chalk.yellow('\n[6] VARIABLES D\'ENVIRONNEMENT\n');
        analysis.env.forEach(env => {
            output += chalk.gray(`  • ${env.name}`);
            if (env.value) {
                output += chalk.gray(` = ${env.value}`);
            }
            output += '\n';
            if (env.risks.length > 0) {
                env.risks.forEach(risk => {
                    output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
                });
            }
        });
    }

    // Section 7: Bonnes Pratiques
    if (analysis.bestPractices.length > 0) {
        output += chalk.yellow('\n[7] BONNES PRATIQUES\n');
        analysis.bestPractices.forEach(practice => {
            output += chalk.yellow(`  ℹ️  [${practice.type}] ${practice.message}\n`);
        });
    }

    // Section 8: Sécurité
    if (analysis.security.length > 0) {
        output += chalk.yellow('\n[8] ALERTES DE SÉCURITÉ\n');
        analysis.security.forEach(issue => {
            output += chalk.red(`  ⚠️  [${issue.level}] ${issue.type}\n`);
            output += chalk.gray(`     → ${issue.detail}\n`);
        });
    }

    output += chalk.gray('\n' + '═'.repeat(70) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
}

function formatComposeReport(analysis) {
    let output = '';

    // En-tête
    output += chalk.blue('\n🔍 RAPPORT D\'ANALYSE - Docker Compose\n');
    output += chalk.gray('═'.repeat(70) + '\n');

    // Section 1: Version et Vue d'ensemble
    output += chalk.yellow('\n[1] INFORMATIONS GÉNÉRALES\n');
    output += chalk.gray('  • Version: ') + chalk.white(analysis.version) + '\n';
    output += chalk.gray('  • Services: ') + chalk.white(analysis.services.count) + '\n';
    output += chalk.gray('  • Networks: ') + chalk.white(analysis.networks.count) + '\n';
    output += chalk.gray('  • Volumes: ') + chalk.white(analysis.volumes.count) + '\n';

    // Section 2: Services
    output += chalk.yellow('\n[2] SERVICES\n');
    analysis.services.details.forEach(service => {
        output += chalk.cyan(`\n  ■ ${service.name}\n`);
        output += chalk.gray('    • Image: ') + chalk.white(service.image) + '\n';
        
        if (service.ports) {
            output += chalk.gray('    • Ports: ') + chalk.white(service.ports.join(', ')) + '\n';
        }
        
        if (service.volumes) {
            output += chalk.gray('    • Volumes: ') + chalk.white(service.volumes.join(', ')) + '\n';
        }
        
        if (service.depends_on) {
            output += chalk.gray('    • Dépend de: ') + chalk.white(service.depends_on.join(', ')) + '\n';
        }

        if (service.risks.length > 0) {
            service.risks.forEach(risk => {
                output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
            });
        }
    });

    // Section 3: Networks
    if (analysis.networks.count > 0) {
        output += chalk.yellow('\n[3] RÉSEAUX\n');
        analysis.networks.details.forEach(network => {
            output += chalk.cyan(`\n  ■ ${network.name}\n`);
            output += chalk.gray('    • Driver: ') + chalk.white(network.driver) + '\n';
            output += chalk.gray('    • Externe: ') + 
                     (network.external ? chalk.green('OUI') : chalk.red('NON')) + '\n';
            
            if (network.risks.length > 0) {
                network.risks.forEach(risk => {
                    output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
                });
            }
        });
    }

    // Section 4: Volumes
    if (analysis.volumes.count > 0) {
        output += chalk.yellow('\n[4] VOLUMES\n');
        analysis.volumes.details.forEach(volume => {
            output += chalk.cyan(`\n  ■ ${volume.name}\n`);
            output += chalk.gray('    • Driver: ') + chalk.white(volume.driver) + '\n';
            output += chalk.gray('    • Externe: ') + 
                     (volume.external ? chalk.green('OUI') : chalk.red('NON')) + '\n';
            
            if (volume.risks.length > 0) {
                volume.risks.forEach(risk => {
                    output += chalk.red(`    ⚠️  [${risk.level}] ${risk.message}\n`);
                });
            }
        });
    }

    // Section 5: Dépendances
    if (Object.keys(analysis.dependencies).length > 0) {
        output += chalk.yellow('\n[5] DÉPENDANCES\n');
        for (const [service, deps] of Object.entries(analysis.dependencies)) {
            output += chalk.cyan(`\n  ■ ${service}\n`);
            output += chalk.gray('    • Dépend de: ') + 
                     chalk.white(deps.depends_on.join(', ')) + '\n';
            
            if (deps.circular) {
                output += chalk.red('    ⚠️  [HAUTE] Dépendance circulaire détectée\n');
            }
        }
    }

    // Section 6: Sécurité
    if (analysis.security.length > 0) {
        output += chalk.yellow('\n[6] ALERTES DE SÉCURITÉ\n');
        analysis.security.forEach(issue => {
            output += chalk.red(`  ⚠️  [${issue.level}] ${issue.type}\n`);
            output += chalk.gray(`     → ${issue.detail}\n`);
        });
    }

    output += chalk.gray('\n' + '═'.repeat(70) + '\n');
    output += chalk.blue('FIN DU RAPPORT\n');

    return output;
} 