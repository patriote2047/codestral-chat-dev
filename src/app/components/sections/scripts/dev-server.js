const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');

// Configuration
const config = {
    maxRetries: 3,
    retryDelay: 2000,
    port: 3000,
    wsPort: 3001,
};

let nextProcess = null;
let retryCount = 0;

// Fonction pour vérifier si un port est utilisé
function checkPort(port) {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(true);
            }
        });
        server.once('listening', () => {
            server.close();
            resolve(false);
        });
        server.listen(port);
    });
}

// Fonction pour tuer le processus sur un port
async function killProcessOnPort(port) {
    return new Promise((resolve, reject) => {
        const command =
            process.platform === 'win32'
                ? `netstat -ano | findstr :${port}`
                : `lsof -i :${port} -t`;

        exec(command, async (error, stdout) => {
            if (error) {
                console.log(`Aucun processus trouvé sur le port ${port}`);
                resolve();
                return;
            }

            try {
                if (process.platform === 'win32') {
                    // Sur Windows, extraire le PID de la dernière colonne
                    const pid = stdout.split('\n')[0].split(' ').filter(Boolean).pop();
                    if (pid) {
                        await new Promise((resolve) => exec(`taskkill /F /PID ${pid}`, resolve));
                        console.log(`✅ Processus ${pid} sur le port ${port} terminé`);
                    }
                } else {
                    // Sur Unix, le PID est déjà isolé
                    const pid = stdout.trim();
                    if (pid) {
                        await new Promise((resolve) => exec(`kill -9 ${pid}`, resolve));
                        console.log(`✅ Processus ${pid} sur le port ${port} terminé`);
                    }
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
}

// Fonction pour vérifier et libérer les ports
async function ensurePortsAvailable() {
    const ports = [config.port, config.wsPort];

    for (const port of ports) {
        const isUsed = await checkPort(port);
        if (isUsed) {
            console.log(`\n🔄 Port ${port} occupé, tentative de libération...`);
            await killProcessOnPort(port);
            // Attendre un peu que le port soit vraiment libéré
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}

// Fonction pour vérifier le statut du WebSocket
function checkWebSocketStatus() {
    const options = {
        hostname: 'localhost',
        port: config.port,
        path: '/api/chat',
        method: 'GET',
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const status = JSON.parse(data);
                console.log('\n📡 WebSocket Status:');
                console.log(`   Port: ${status.port}`);
                console.log(`   Clients connectés: ${status.clientsCount}`);
                console.log(`   Status: ${status.status}\n`);
            } catch (error) {
                console.error('\n❌ Erreur lors de la vérification du WebSocket:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('\n❌ WebSocket non accessible:', error.message);
    });

    req.end();
}

async function startServer() {
    console.log('\n🚀 Démarrage du serveur de développement...\n');

    try {
        // S'assurer que les ports sont disponibles
        await ensurePortsAvailable();

        // Définir les variables d'environnement
        const env = {
            ...process.env,
            NODE_OPTIONS: '--trace-warnings',
            PORT: config.port.toString(),
            WS_PORT: config.wsPort.toString(),
            NEXT_TELEMETRY_DISABLED: '1',
        };

        // Démarrer le processus Next.js
        nextProcess = spawn('npm', ['run', 'dev'], {
            env,
            stdio: 'inherit',
            shell: true,
        });

        // Vérifier le statut du WebSocket après le démarrage
        setTimeout(checkWebSocketStatus, 5000);
        // Vérifier périodiquement le statut du WebSocket
        const wsCheckInterval = setInterval(checkWebSocketStatus, 30000);

        // Gérer les événements du processus
        nextProcess.on('error', (error) => {
            console.error('\n❌ Erreur lors du démarrage du serveur:', error);
            clearInterval(wsCheckInterval);
            handleServerError();
        });

        nextProcess.on('exit', (code, signal) => {
            clearInterval(wsCheckInterval);
            if (code !== 0 && signal !== 'SIGTERM') {
                console.error(`\n❌ Le serveur s'est arrêté avec le code: ${code}`);
                handleServerError();
            } else {
                console.log('\n👋 Serveur arrêté proprement');
                process.exit(0);
            }
        });
    } catch (error) {
        console.error('\n❌ Erreur lors du démarrage:', error);
        handleServerError();
    }
}

function handleServerError() {
    if (retryCount < config.maxRetries) {
        retryCount++;
        console.log(
            `\n🔄 Tentative de redémarrage (${retryCount}/${config.maxRetries}) dans ${config.retryDelay / 1000}s...`
        );
        setTimeout(() => startServer(), config.retryDelay);
    } else {
        console.error('\n❌ Nombre maximum de tentatives atteint. Arrêt du serveur.');
        process.exit(1);
    }
}

// Gérer l'arrêt propre
function handleShutdown() {
    if (nextProcess) {
        console.log('\n🛑 Arrêt du serveur...');
        nextProcess.kill('SIGTERM');
    }
}

// Intercepter les signaux d'arrêt
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
process.on('SIGHUP', handleShutdown);

// Démarrer le serveur
startServer().catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
});
