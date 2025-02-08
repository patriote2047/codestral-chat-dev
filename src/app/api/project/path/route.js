import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const jsonPath = path.join(process.cwd(), 'src', 'app', 'components', 'sections', 'Header', 'ProjectPathSearch', 'project-path.json');
        const jsonContent = fs.readFileSync(jsonPath, 'utf8');
        const { projectPath } = JSON.parse(jsonContent);
        
        return NextResponse.json({ projectPath });
    } catch (error) {
        return NextResponse.json(
            { error: 'Impossible de récupérer le chemin du projet' },
            { status: 500 }
        );
    }
} 