import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'src/app/components/sections/Header/ProjectPathSearch/project-path.json');

// Fonction pour s'assurer que le fichier existe
async function ensureFile() {
    try {
        await fs.access(CONFIG_FILE);
    } catch {
        await fs.writeFile(CONFIG_FILE, JSON.stringify({ path: '' }));
    }
}

export async function GET() {
    try {
        await ensureFile();
        const data = await fs.readFile(CONFIG_FILE, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        console.error('Erreur lors de la lecture du chemin:', error);
        return NextResponse.json({ path: '' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { path } = await request.json();
        
        if (!path) {
            return NextResponse.json(
                { error: 'Le chemin est requis' },
                { status: 400 }
            );
        }

        await ensureFile();
        await fs.writeFile(CONFIG_FILE, JSON.stringify({ path }));
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du chemin:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la sauvegarde' },
            { status: 500 }
        );
    }
} 