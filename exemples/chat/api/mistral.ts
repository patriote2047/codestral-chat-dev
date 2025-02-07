import { Router } from 'express';
import { log } from '../system/commun/logger.js';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface MistralConfig {
    apiKey: string;
    baseURL: string;
    defaultModel: string;
}

interface ChatParams {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
}

interface ChatResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export const MISTRAL_CONFIG: MistralConfig = {
    apiKey: 'lOlala6b3yH6fmfMK3ZlsNj4Ces7SyW4',
    baseURL: 'https://codestral.mistral.ai/v1',
    defaultModel: 'codestral-latest',
};

let client: {
    chat: (params: ChatParams) => Promise<ChatResponse>;
} | null = null;

export function initializeMistralClient(): void {
    const { fetch } = globalThis;
    client = {
        async chat({
            model,
            messages,
            temperature = 0.1,
            maxTokens = 2000,
        }: ChatParams): Promise<ChatResponse> {
            const response = await fetch(`${MISTRAL_CONFIG.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${MISTRAL_CONFIG.apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                }),
            });

            if (!response.ok) {
                throw new Error(`Erreur API Mistral: ${response.statusText}`);
            }

            return await response.json();
        },
    };
}

export async function getMistralClient(): Promise<typeof client> {
    if (!client) {
        initializeMistralClient();
    }
    return client;
}

export interface CodeResponse {
    content: string;
    error?: string;
}

export async function generateCode(
    prompt: string,
    model = MISTRAL_CONFIG.defaultModel
): Promise<CodeResponse> {
    try {
        const mistral = await getMistralClient();
        if (!mistral) {
            throw new Error('Client Mistral non initialisé');
        }

        const messages: ChatMessage[] = [{ role: 'user', content: prompt }];
        const response = await mistral.chat({
            model,
            messages,
            temperature: 0.1,
            maxTokens: 2000,
        });

        return {
            content: response.choices[0]?.message?.content || '',
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: '',
            error: `Erreur lors de la génération du code: ${errorMessage}`,
        };
    }
}

// Router pour l'API Mistral
export const router = Router();

// Test de connexion
router.get('/ping', (req, res) => {
    res.json({ status: 'ok', message: 'API Mistral connectée' });
});

// Génération de code
router.post('/generate', async (req, res) => {
    try {
        const { prompt, model } = req.body;

        if (!prompt) {
            throw new Error('Prompt manquant');
        }

        log('info', `📝 Génération de code: ${prompt.substring(0, 50)}...`);
        const response = await generateCode(prompt, model);

        if (response.error) {
            throw new Error(response.error);
        }

        log('success', '✨ Code généré avec succès');
        res.json(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log('error', `❌ Erreur de génération: ${errorMessage}`);
        res.status(500).json({
            error: errorMessage,
        });
    }
});

// Chat avec Mistral
router.post('/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            throw new Error('Message manquant');
        }

        log('info', '💬 Nouvelle requête chat');

        const mistral = await getMistralClient();
        if (!mistral) {
            throw new Error('Client Mistral non initialisé');
        }

        const messages: ChatMessage[] = [...history, { role: 'user', content: message }];

        const response = await mistral.chat({
            model: MISTRAL_CONFIG.defaultModel,
            messages,
            temperature: 0.7,
            maxTokens: 1000,
        });

        const reply = response.choices[0]?.message?.content || '';

        log('success', '✅ Réponse générée');
        res.json({
            reply,
            history: [...messages, { role: 'assistant', content: reply }],
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log('error', `❌ Erreur chat: ${errorMessage}`);
        res.status(500).json({
            error: errorMessage,
            message: 'Erreur lors de la génération de la réponse',
        });
    }
});
