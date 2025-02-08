import path from 'path';

export const getScriptPath = (projectPath, scriptRelativePath) => {
    if (!projectPath) {
        throw new Error('Le chemin du projet n\'est pas défini');
    }
    return path.join(projectPath, scriptRelativePath);
};

export const validateScriptPath = async (scriptPath) => {
    try {
        const response = await fetch('/api/validate-path', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: scriptPath }),
        });
        
        const data = await response.json();
        return data.isValid;
    } catch (error) {
        console.error('Erreur lors de la validation du chemin:', error);
        return false;
    }
}; 