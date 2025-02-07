'use client';

import { ValidationError } from './errors';
import { withTimeout, handleHttpError } from './utils';

const API_URL = '/api/chat';

export async function fetchChatResponse(message) {
    validateMessage(message);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'user',
                    content: message,
                },
            ],
        }),
    };

    try {
        const response = await fetch(API_URL, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur API');
        }

        const data = await response.json();
        return {
            response: data.choices[0].message.content,
        };
    } catch (error) {
        console.error("Erreur lors de l'appel API:", error);
        throw error;
    }
}

// Fonction pour valider le message
function validateMessage(message) {
    if (!message || typeof message !== 'string') {
        throw new ValidationError('Le message doit être une chaîne de caractères non vide');
    }
    if (message.length > 4096) {
        throw new ValidationError('Le message ne doit pas dépasser 4096 caractères');
    }
}
