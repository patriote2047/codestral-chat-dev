import { NextRequest } from 'next/server';
import { WebSocketService } from '@/app/services/websocket';

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
};

// Route GET pour vérifier le statut du serveur WebSocket
export async function GET(req: NextRequest) {
    try {
        const wsService = WebSocketService.getInstance();
        const currentStatus = wsService.getStatus();

        // Retourner simplement l'état actuel du serveur
        return new Response(
            JSON.stringify({
                status: currentStatus,
                port: 3001,
                clientsCount: wsService.getConnectedClients(),
                state: currentStatus
            }),
            {
                status: currentStatus === 'error' ? 500 : 200,
                headers: CORS_HEADERS
            }
        );
    } catch (error: unknown) {
        console.error('Erreur lors de la vérification du statut WebSocket:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({
                status: 'Error checking WebSocket status',
                error: errorMessage,
                state: 'error'
            }),
            { 
                status: 500,
                headers: CORS_HEADERS
            }
        );
    }
}

// Route POST pour envoyer des messages via HTTP si nécessaire
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const wsService = WebSocketService.getInstance();

        if (!wsService.isRunning()) {
            return new Response(
                JSON.stringify({ error: 'WebSocket server not initialized' }),
                {
                    status: 503,
                    headers: CORS_HEADERS
                }
            );
        }

        // Broadcast le message à tous les clients connectés
        wsService.broadcast('chat_message', data);

        return new Response(
            JSON.stringify({ success: true }),
            {
                status: 200,
                headers: CORS_HEADERS
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: 'Failed to process message',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: CORS_HEADERS
            }
        );
    }
}

// Route OPTIONS pour gérer les requêtes CORS preflight
export async function OPTIONS(req: NextRequest) {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
    });
}
