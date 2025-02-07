import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

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

        // Créer un nom de fichier unique
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const uploadDir = path.join(process.cwd(), 'temp');
        const filePath = path.join(uploadDir, fileName);

        // Convertir le fichier en buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sauvegarder le fichier
        await writeFile(filePath, buffer);

        return NextResponse.json({ 
            success: true,
            filePath: `temp/${fileName}`
        });
    } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload du fichier' },
            { status: 500 }
        );
    }
} 