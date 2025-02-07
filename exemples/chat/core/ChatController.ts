import { ChatModel } from './ChatModel';
import { ChatConfig, ChatState, ChatMessage } from './types';

export class ChatController {
    private model: ChatModel;
    private input: HTMLTextAreaElement | null = null;
    private button: HTMLButtonElement | null = null;
    private container: HTMLElement | null = null;

    constructor(containerId: string, config?: ChatConfig) {
        this.model = new ChatModel(config);
        this.container = document.getElementById(containerId);

        if (!this.container) {
            throw new Error(`Conteneur avec l'ID "${containerId}" non trouvé`);
        }

        this.initialize();
    }

    private initialize(): void {
        // Créer l'interface
        this.createInterface();

        // Attacher les gestionnaires d'événements
        this.setupEventListeners();

        // S'abonner aux événements du modèle
        this.model.on('message:sent', (message) => this.displayMessage(message));
        this.model.on('message:received', (message) => this.displayMessage(message));
        this.model.on('error', (error) => this.displayError(error.message));
        this.model.on('state:change', (state) => this.updateUIState(state));
    }

    private createInterface(): void {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-container">
                <textarea 
                    id="chat-input"
                    placeholder="Écrivez votre message..."
                    rows="1"
                ></textarea>
                <button id="send-button">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        this.input = this.container.querySelector('#chat-input');
        this.button = this.container.querySelector('#send-button');
    }

    private setupEventListeners(): void {
        if (!this.input || !this.button) return;

        // Gestion de l'envoi avec Entrée
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize du textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = this.input.scrollHeight + 'px';
        });

        // Envoi avec le bouton
        this.button.addEventListener('click', () => this.sendMessage());
    }

    private async sendMessage(): Promise<void> {
        if (!this.input || this.model.getState().isProcessing) return;

        const message = this.input.value.trim();
        if (!message) return;

        try {
            await this.model.sendMessage(message);
            this.input.value = '';
            this.input.style.height = 'auto';
        } catch (error) {
            console.error("Erreur lors de l'envoi:", error);
        }
    }

    private displayMessage(message: ChatMessage): void {
        const messagesContainer = this.container?.querySelector('#chat-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}`;
        messageElement.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-timestamp">
                ${message.timestamp?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    private displayError(message: string): void {
        this.displayMessage({
            role: 'system',
            content: `Erreur: ${message}`,
            timestamp: new Date(),
        });
    }

    private updateUIState(state: ChatState): void {
        if (!this.input || !this.button) return;

        this.input.disabled = state.isProcessing;
        this.button.disabled = state.isProcessing;

        if (!state.isProcessing) {
            this.input.focus();
        }
    }

    public destroy(): void {
        this.model.clear();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
