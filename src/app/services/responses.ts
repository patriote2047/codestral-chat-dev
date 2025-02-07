export interface ResponsePattern {
    pattern: RegExp;
    response: string;
}

export interface ResponseCategory {
    patterns: ResponsePattern[];
    defaultResponse: string;
}

export const responses: { [key: string]: ResponseCategory } = {
    help: {
        patterns: [
            {
                pattern: /comment (?:peux|pouvez)(?:-tu|-vous)? m'aider/i,
                response:
                    'Je peux vous aider de plusieurs façons :\n' +
                    '1. Assistance en programmation et débogage\n' +
                    '2. Conseils sur les bonnes pratiques de développement\n' +
                    '3. Aide à la conception de solutions\n' +
                    '4. Support technique sur vos projets\n\n' +
                    "Quel type d'aide vous intéresse ?",
            },
            {
                pattern: /que (?:peux|pouvez)(?:-tu|-vous)? faire/i,
                response:
                    "En tant qu'assistant de développement, je peux :\n" +
                    '- Vous aider à résoudre des problèmes de code\n' +
                    '- Suggérer des améliorations pour votre code\n' +
                    '- Expliquer des concepts de programmation\n' +
                    '- Vous guider dans vos choix techniques\n\n' +
                    'Sur quel aspect souhaitez-vous travailler ?',
            },
            {
                pattern: /^(?:comment|aide|aidez|aider)/i,
                response:
                    'Je suis là pour vous aider. Pouvez-vous me décrire plus précisément votre besoin ?\n' +
                    'Par exemple :\n' +
                    '- Un problème de code à résoudre\n' +
                    '- Une question sur une technologie\n' +
                    "- Un besoin d'amélioration de code",
            },
        ],
        defaultResponse:
            'Je suis votre assistant de développement. Je peux vous aider dans tous les aspects de votre projet : programmation, débogage, conception, bonnes pratiques. Quelle est votre problématique ?',
    },

    identity: {
        patterns: [
            {
                pattern: /qui (?:es-tu|es tu|êtes-vous|êtes vous)/i,
                response:
                    'Je suis Codestral, votre assistant IA spécialisé dans le développement. Je suis conçu pour vous aider à améliorer votre code et résoudre vos défis techniques.',
            },
        ],
        defaultResponse:
            'Je suis Codestral, votre assistant de développement personnel. Je suis là pour vous aider à réussir vos projets.',
    },

    greeting: {
        patterns: [
            {
                pattern: /^(?:bonjour|salut|hello|hey|hi|coucou)/i,
                response:
                    "Bonjour ! Je suis Codestral, votre assistant de développement. Comment puis-je vous aider aujourd'hui ?",
            },
        ],
        defaultResponse:
            "Bonjour ! Comment puis-je vous assister dans votre développement aujourd'hui ?",
    },

    thanks: {
        patterns: [
            {
                pattern: /merci|thanks|thx|ty/i,
                response:
                    "Je vous en prie ! C'est un plaisir de vous aider. N'hésitez pas si vous avez d'autres questions.",
            },
        ],
        defaultResponse:
            "Je vous en prie ! N'hésitez pas à me solliciter pour toute autre question.",
    },

    goodbye: {
        patterns: [
            {
                pattern: /au revoir|bye|à \+|a \+|ciao|adieu/i,
                response:
                    "Au revoir ! N'hésitez pas à revenir si vous avez besoin d'aide pour vos projets de développement.",
            },
        ],
        defaultResponse: 'Au revoir ! Bonne continuation dans vos développements !',
    },

    error: {
        patterns: [
            {
                pattern: /erreur|bug|problème|problem|issue/i,
                response:
                    'Je vois que vous rencontrez un problème. Pour mieux vous aider, pourriez-vous :\n' +
                    "1. Décrire précisément l'erreur\n" +
                    '2. Partager le code concerné\n' +
                    '3. Indiquer le comportement attendu',
            },
            {
                pattern: /ne (?:marche|fonctionne) pas/i,
                response:
                    "Pour résoudre ce problème, j'aurai besoin de plus d'informations :\n" +
                    '- Que se passe-t-il exactement ?\n' +
                    "- Avez-vous des messages d'erreur ?\n" +
                    '- Quel est le comportement attendu ?',
            },
        ],
        defaultResponse:
            "Pour résoudre votre problème, j'aurai besoin de plus de détails. Pouvez-vous me décrire la situation plus précisément ?",
    },
};

export function findResponse(message: string): string {
    // Nettoyer le message
    const cleanMessage = message.trim().toLowerCase();

    // Analyser le contexte du message
    const context = analyzeMessageContext(cleanMessage);

    // Parcourir toutes les catégories
    for (const [category, responseCategory] of Object.entries(responses)) {
        // Si la catégorie correspond au contexte
        if (category === context) {
            // Vérifier les patterns spécifiques
            for (const pattern of responseCategory.patterns) {
                if (pattern.pattern.test(cleanMessage)) {
                    return pattern.response;
                }
            }
            // Si aucun pattern spécifique ne correspond, utiliser la réponse par défaut de la catégorie
            return responseCategory.defaultResponse;
        }
    }

    // Si aucune catégorie ne correspond, analyser le type de message
    if (cleanMessage.includes('?')) {
        if (cleanMessage.includes('aide') || cleanMessage.includes('aider')) {
            return responses.help.defaultResponse;
        }
        return responses.help.patterns[0].response;
    }

    // Réponse par défaut générale
    return responses.help.defaultResponse;
}

function analyzeMessageContext(message: string): string {
    // Détection des questions d'identité
    if (message.match(/qui (?:es-tu|es tu|êtes-vous|êtes vous)/)) {
        return 'identity';
    }

    // Détection des questions de capacité
    if (message.match(/que (?:peux|pouvez)(?:-tu|-vous)? faire/)) {
        return 'help';
    }

    // Détection des salutations
    if (message.match(/^(?:bonjour|salut|hello|hey|hi|coucou)/)) {
        return 'greeting';
    }

    // Détection des remerciements
    if (message.match(/merci|thanks|thx|ty/)) {
        return 'thanks';
    }

    // Détection des au revoir
    if (message.match(/au revoir|bye|à \+|a \+|ciao|adieu/)) {
        return 'goodbye';
    }

    // Détection des questions d'aide
    if (message.match(/^(?:comment|aide|aidez|aider|peux-tu|pouvez-vous)/)) {
        return 'help';
    }

    // Détection des erreurs
    if (message.match(/(?:erreur|bug|problème|problem|issue|ne (?:marche|fonctionne) pas)/)) {
        return 'error';
    }

    // Par défaut, considérer comme une demande d'aide
    return 'help';
}
