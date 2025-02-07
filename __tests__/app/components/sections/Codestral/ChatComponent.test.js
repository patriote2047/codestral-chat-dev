import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatComponent from './ChatComponent';
import { fetchChatResponse } from './api';
import { AuthenticationError } from './errors';
import styles from './ChatComponent.module.css';

// Mock the API call
jest.mock('./api', () => ({
    fetchChatResponse: jest.fn(),
}));

// Mock the CSS module
jest.mock('./ChatComponent.module.css', () => ({
    chatContainer: 'chatContainer',
    message: 'message',
    userMessage: 'userMessage',
    botMessage: 'botMessage',
    errorMessage: 'errorMessage',
    statusDot: 'statusDot',
    loading: 'loading',
}));

describe('ChatComponent', () => {
    beforeEach(() => {
        fetchChatResponse.mockClear();
    });

    it('renders without crashing', () => {
        render(<ChatComponent />);
        expect(screen.getByPlaceholderText('Écrivez votre message...')).toBeInTheDocument();
        expect(screen.getByText('Codestral Chat')).toBeInTheDocument();
        expect(screen.getByText('Actif')).toBeInTheDocument();
    });

    it('handles message submission', async () => {
        const mockResponse = { response: 'Test response' };
        fetchChatResponse.mockResolvedValueOnce(mockResponse);

        render(<ChatComponent />);

        const input = screen.getByPlaceholderText('Écrivez votre message...');
        const testMessage = 'Test message';

        fireEvent.change(input, { target: { value: testMessage } });
        fireEvent.submit(screen.getByTestId('chat-form'));

        await waitFor(() => {
            expect(fetchChatResponse).toHaveBeenCalledWith(testMessage);
            expect(screen.getByText(testMessage)).toBeInTheDocument();
            expect(screen.getByText(mockResponse.response)).toBeInTheDocument();
        });

        // Vérifier que l'input est vidé après l'envoi
        expect(input.value).toBe('');
    });

    it('handles Enter key press for submission', async () => {
        const mockResponse = { response: 'Test response' };
        fetchChatResponse.mockResolvedValueOnce(mockResponse);

        render(<ChatComponent />);

        const input = screen.getByPlaceholderText('Écrivez votre message...');
        const testMessage = 'Test message';

        fireEvent.change(input, { target: { value: testMessage } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(fetchChatResponse).toHaveBeenCalledWith(testMessage);
        });
    });

    it('does not submit on Shift+Enter', async () => {
        render(<ChatComponent />);

        const input = screen.getByPlaceholderText('Écrivez votre message...');
        const testMessage = 'Test message';

        fireEvent.change(input, { target: { value: testMessage } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });

        expect(fetchChatResponse).not.toHaveBeenCalled();
    });

    it('displays error message on API failure', async () => {
        fetchChatResponse.mockRejectedValueOnce(new Error('API Error'));

        render(<ChatComponent />);

        const input = screen.getByPlaceholderText('Écrivez votre message...');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.submit(screen.getByTestId('chat-form'));

        await waitFor(() => {
            expect(
                screen.getByText('Désolé, une erreur est survenue. Veuillez réessayer.')
            ).toBeInTheDocument();
        });
    });

    it('does not submit empty messages', async () => {
        render(<ChatComponent />);

        const input = screen.getByPlaceholderText('Écrivez votre message...');
        fireEvent.change(input, { target: { value: '   ' } });
        fireEvent.submit(screen.getByTestId('chat-form'));

        expect(fetchChatResponse).not.toHaveBeenCalled();
    });

    it('displays messages in the correct order', async () => {
        const mockResponses = [{ response: 'First response' }, { response: 'Second response' }];
        fetchChatResponse
            .mockResolvedValueOnce(mockResponses[0])
            .mockResolvedValueOnce(mockResponses[1]);

        render(<ChatComponent />);
        const input = screen.getByPlaceholderText('Écrivez votre message...');

        // Premier message
        fireEvent.change(input, { target: { value: 'First message' } });
        fireEvent.submit(screen.getByTestId('chat-form'));

        await waitFor(() => {
            expect(screen.getByText('First message')).toBeInTheDocument();
            expect(screen.getByText('First response')).toBeInTheDocument();
        });

        // Deuxième message
        fireEvent.change(input, { target: { value: 'Second message' } });
        fireEvent.submit(screen.getByTestId('chat-form'));

        await waitFor(() => {
            const messages = screen.getAllByText(/message|response/);
            expect(messages).toHaveLength(4);
            expect(messages[0].textContent).toBe('First message');
            expect(messages[1].textContent).toBe('First response');
            expect(messages[2].textContent).toBe('Second message');
            expect(messages[3].textContent).toBe('Second response');
        });
    });

    it('devrait afficher le voyant vert quand le chat est prêt', () => {
        render(<ChatComponent />);
        const statusDot = screen.getByTestId('status-dot');
        expect(statusDot).toHaveClass(styles.statusDot);
        expect(statusDot).not.toHaveClass(styles.loading);
    });

    it('devrait afficher le voyant orange pendant le chargement', async () => {
        // Simuler une réponse lente de l'API
        const mockResponse = { response: 'Test response' };
        let resolvePromise;
        const responsePromise = new Promise((resolve) => {
            resolvePromise = () => resolve(mockResponse);
        });

        fetchChatResponse.mockImplementation(() => responsePromise);

        render(<ChatComponent />);

        // Envoyer un message
        const input = screen.getByPlaceholderText('Écrivez votre message...');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.submit(screen.getByTestId('chat-form'));

        // Vérifier que le voyant est orange pendant le chargement
        const statusDot = screen.getByTestId('status-dot');
        expect(statusDot).toHaveClass(styles.loading);

        // Résoudre la promesse pour simuler la fin du chargement
        resolvePromise();

        // Attendre que le voyant redevienne vert
        await waitFor(
            () => {
                expect(statusDot).not.toHaveClass(styles.loading);
            },
            { timeout: 2000 }
        );
    });

    it("devrait gérer correctement une erreur d'authentification", async () => {
        // Simuler une erreur d'authentification
        fetchChatResponse.mockRejectedValue(new AuthenticationError('Invalid API key provided'));

        render(<ChatComponent />);

        // Envoyer un message
        const input = screen.getByPlaceholderText('Écrivez votre message...');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.submit(screen.getByTestId('chat-form'));

        // Vérifier que l'erreur est affichée
        await waitFor(() => {
            expect(
                screen.getByText("Erreur d'authentification. Veuillez vérifier votre clé API.")
            ).toBeInTheDocument();
        });

        // Vérifier que le voyant revient au vert
        const statusDot = screen.getByTestId('status-dot');
        expect(statusDot).not.toHaveClass(styles.loading);
    });
});
