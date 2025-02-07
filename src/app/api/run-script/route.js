import { exec } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request) {
    try {
        const { script, args = [] } = await request.json();

        // Construire le chemin absolu vers le script
        const scriptPath = path.join(process.cwd(), 'scripts', script);
        
        // Construire la commande avec les arguments
        const command = `node "${scriptPath}" ${args.join(' ')}`;
        
        console.log('Exécution de la commande:', command);
        
        // Exécuter le script
        const { stdout, stderr } = await execAsync(command);

        if (stderr) {
            console.error('Erreur stderr:', stderr);
            return NextResponse.json({ error: stderr }, { status: 500 });
        }

        return NextResponse.json({ output: stdout });
    } catch (error) {
        console.error('Erreur d\'exécution:', error);
        return NextResponse.json({ 
            error: error.message,
            details: error.stack
        }, { status: 500 });
    }
} 