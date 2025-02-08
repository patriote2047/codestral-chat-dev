'use client';

export const getProjectPath = async () => {
    try {
        const response = await fetch('/api/project/path');
        if (!response.ok) {
            throw new Error('Impossible de récupérer le chemin du projet');
        }
        const data = await response.json();
        return data.projectPath;
    } catch (error) {
        throw new Error('Impossible de récupérer le chemin du projet. Veuillez sélectionner un projet dans la barre de recherche.');
    }
}; 