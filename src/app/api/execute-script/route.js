import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request) {
    try {
        const { scriptPath } = await request.json();
        
        if (!scriptPath) {
            return NextResponse.json(
                { error: 'Le chemin du script est requis' },
                { status: 400 }
            );
        }

        const { stdout, stderr } = await execAsync(`bash "${scriptPath}"`);
        
        if (stderr) {
            console.warn('Stderr:', stderr);
        }

        return NextResponse.json({ 
            output: stdout,
            error: stderr || null
        });
    } catch (error) {
        console.error('Erreur lors de l\'exécution du script:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de l\'exécution du script' },
            { status: 500 }
        );
    }
} 