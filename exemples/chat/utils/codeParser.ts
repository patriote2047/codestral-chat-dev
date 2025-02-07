export interface ParsedCode {
    code: string;
    language?: string;
    error?: string;
}

export function extractCodeBlock(content: string): ParsedCode {
    try {
        const codeBlockRegex = /```(?:(\w+)\n)?([\s\S]*?)```/;
        const match = content.match(codeBlockRegex);

        if (!match) {
            return {
                code: content.trim(),
                error: 'Aucun bloc de code trouvé, utilisation du contenu brut',
            };
        }

        const [, language, code] = match;
        return {
            code: code.trim(),
            language: language?.toLowerCase(),
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            code: '',
            error: `Erreur lors de l'extraction du code: ${errorMessage}`,
        };
    }
}

export function formatCode(code: string): string {
    // TODO: Implémenter le formatage du code selon le langage
    // Pour l'instant, on retourne juste le code nettoyé
    return code.trim();
}

export function validateCode(code: string): string | null {
    // TODO: Implémenter la validation du code selon le langage
    // Pour l'instant, on vérifie juste si le code n'est pas vide
    if (!code.trim()) {
        return 'Le code généré est vide';
    }
    return null;
}
