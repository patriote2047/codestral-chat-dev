import { useState, useEffect } from 'react';

export const useProjectPath = () => {
    const [projectPath, setProjectPath] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProjectPath = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/save-project-path');
            const data = await response.json();
            setProjectPath(data.path || '');
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement du chemin du projet');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (isMounted) {
                await loadProjectPath();
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        projectPath,
        isLoading,
        error,
        reloadPath: loadProjectPath
    };
}; 