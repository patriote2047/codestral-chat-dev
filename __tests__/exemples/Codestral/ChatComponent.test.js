import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatComponent from './ChatComponent';
import { fetchChatResponse } from './api';

// Mock the API call
jest.mock('./api', () => ({
    fetchChatResponse: jest.fn(),
}));

describe('ChatComponent', () => {
    beforeEach(() => {
        fetchChatResponse.mockClear();
    });

    it('renders without crashing', () => {
        render(<ChatComponent />);
        expect(screen.getByPlaceholder('Écrivez votre message ici...')).toBeInTheDocument();
    });

    it('handles message submission', async () => {
        const mockResponse = { response: 'Test response' };
        fetchChatResponse.mockResolvedValueOnce(mockResponse);

        render(<ChatComponent />);

        const input = screen.getByPlaceholder('Écrivez votre message ici...');
        const testMessage = 'Test message';

        fireEvent.change(input, { target: { value: testMessage } });
        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(fetchChatResponse).toHaveBeenCalledWith(testMessage);
        });
    });

    it('handles Enter key press', async () => {
        const mockResponse = { response: 'Test response' };
        fetchChatResponse.mockResolvedValueOnce(mockResponse);

        render(<ChatComponent />);

        const input = screen.getByPlaceholder('Écrivez votre message ici...');
        const testMessage = 'Test message';

        fireEvent.change(input, { target: { value: testMessage } });
        fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

        await waitFor(() => {
            expect(fetchChatResponse).toHaveBeenCalledWith(testMessage);
        });
    });

    it('displays error message on API failure', async () => {
        fetchChatResponse.mockRejectedValueOnce(new Error('API Error'));

        render(<ChatComponent />);

        const input = screen.getByPlaceholder('Écrivez votre message ici...');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(
                screen.getByText('Désolé, une erreur est survenue. Veuillez réessayer.')
            ).toBeInTheDocument();
        });
    });
});
