import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Lecture du chemin du projet depuis le fichier JSON
        const jsonPath = path.join(process.cwd(), 'src', 'app', 'components', 'sections', 'Header', 'ProjectPathSearch', 'project-path.json');
        console.log('Lecture du fichier de configuration:', jsonPath);
        
        const jsonContent = await fs.readFile(jsonPath, 'utf-8');
        console.log('Contenu du fichier de configuration:', jsonContent);
        
        const config = JSON.parse(jsonContent);
        const selectedPath = config.path || config.projectPath;
        console.log('Chemin sélectionné:', selectedPath);

        if (!selectedPath) {
            return NextResponse.json(
                { error: 'Aucun projet sélectionné' },
                { status: 400 }
            );
        }

        // Lecture du package.json dans le chemin sélectionné
        const packageJsonPath = path.join(selectedPath, 'package.json');
        console.log('Tentative de lecture du package.json:', packageJsonPath);
        
        try {
            await fs.access(packageJsonPath);
        } catch (error) {
            console.error('Erreur d\'accès au package.json:', error);
            return NextResponse.json(
                { error: 'Aucun fichier package.json trouvé dans le projet' },
                { status: 404 }
            );
        }

        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
        console.log('Contenu du package.json:', packageJsonContent);
        
        const packageJson = JSON.parse(packageJsonContent);
        console.log('Scripts et dépendances trouvés:', {
            scripts: packageJson.scripts,
            dependencies: packageJson.dependencies,
            devDependencies: packageJson.devDependencies
        });

        return NextResponse.json({
            projectName: selectedPath,
            projectPath: selectedPath,
            scripts: packageJson.scripts || {},
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {}
        });
    } catch (error) {
        console.error('Erreur lors de la lecture des scripts:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la lecture des scripts' },
            { status: 500 }
        );
    }
} 