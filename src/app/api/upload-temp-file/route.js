import { writeFile, mkdir } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'Aucun fichier n\'a été fourni' },
                { status: 400 }
            );
        }

        // Créer le dossier temp s'il n'existe pas
        const tempDir = path.join(process.cwd(), 'temp');
        if (!existsSync(tempDir)) {
            await mkdir(tempDir);
        }

        // Créer un nom de fichier unique
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const filePath = path.join(tempDir, fileName);

        // Convertir le fichier en buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sauvegarder le fichier
        await writeFile(filePath, buffer);

        // Retourner le chemin relatif
        return NextResponse.json({ 
            success: true,
            tempPath: path.join('temp', fileName)
        });
    } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload du fichier' },
            { status: 500 }
        );
    }
} 