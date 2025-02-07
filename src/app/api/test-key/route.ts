import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            {
                error: "Clé API non trouvée dans les variables d'environnement",
            },
            { status: 500 }
        );
    }

    try {
        console.log('Test de la clé API:', apiKey);

        const requestBody = {
            model: 'codestral-latest',
            messages: [
                {
                    role: 'user',
                    content: 'Test',
                },
            ],
            temperature: 0.1,
            max_tokens: 2000,
        };

        console.log('Corps de la requête:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('https://codestral.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        console.log('Statut de la réponse:', response.status, response.statusText);
        const responseText = await response.text();
        console.log('Réponse brute:', responseText);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                console.error('Erreur de parsing JSON:', e);
            }

            console.error('Erreur API détaillée:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                error: errorData,
            });

            return NextResponse.json(
                {
                    error: 'Erreur API détaillée',
                    status: response.status,
                    statusText: response.statusText,
                    details: errorData,
                    rawResponse: responseText,
                },
                { status: response.status }
            );
        }

        const data = JSON.parse(responseText);
        return NextResponse.json({
            success: true,
            message: 'Clé API valide',
            details: data,
        });
    } catch (error) {
        console.error('Erreur complète:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Erreur inconnue',
                details: error,
            },
            { status: 500 }
        );
    }
}
