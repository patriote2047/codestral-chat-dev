import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const { path: scriptPath } = await request.json();
        
        if (!scriptPath) {
            return NextResponse.json({ isValid: false });
        }

        try {
            await fs.access(scriptPath);
            return NextResponse.json({ isValid: true });
        } catch {
            return NextResponse.json({ isValid: false });
        }
    } catch (error) {
        console.error('Erreur lors de la validation du chemin:', error);
        return NextResponse.json({ isValid: false });
    }
} 