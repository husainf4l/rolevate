// Global application state
class CVGeneratorApp {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.currentTemplate = 'classic_cv.html';
        this.websocket = null;
        this.isGenerating = false;
        this.messages = [];
        this.currentPdfUrl = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializeWebSocket();
        
        console.log('CV Generator App initialized with session:', this.sessionId);
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    initializeElements() {
        // Chat elements
        this.chatForm = document.getElementById('chat-form');
        this.chatInput = document.getElementById('chat-input');
        this.chatArea = document.getElementById('chat-area');
        this.sendBtn = document.getElementById('send-btn');
        this.charCount = document.getElementById('char-count');

        // Template elements
        this.templateBtns = document.querySelectorAll('.template-btn');
        this.selectedTemplateSpan = document.getElementById('selected-template');

        // Progress elements
        this.progressContainer = document.getElementById('progress-container');
        this.progressBar = document.getElementById('progress-bar');
        this.progressStatus = document.getElementById('progress-status');
        this.progressPercentage = document.getElementById('progress-percentage');
        this.progressMessage = document.getElementById('progress-message');
        this.progressShine = document.getElementById('progress-shine');

        // State elements
        this.readyState = document.getElementById('ready-state');
        this.processingState = document.getElementById('processing-state');
        this.completeState = document.getElementById('complete-state');
        this.errorState = document.getElementById('error-state');

        // Action buttons
        this.previewBtn = document.getElementById('preview-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.retryBtn = document.getElementById('retry-btn');

        // Status elements
        this.statusIndicator = document.getElementById('status-indicator');
        this.statusText = document.getElementById('status-text');
        this.wsIndicator = document.getElementById('ws-indicator');
        this.wsStatus = document.getElementById('ws-status');

        // Modal elements
        this.helpBtn = document.getElementById('help-btn');
        this.helpModal = document.getElementById('help-modal');
        this.closeHelpBtn = document.getElementById('close-help');

        // PDF preview
        this.pdfPreview = document.getElementById('pdf-preview');
    }

    attachEventListeners() {
        // Chat form submission
        this.chatForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
        
        // Character count for chat input
        this.chatInput.addEventListener('input', (e) => {
            this.charCount.textContent = `${e.target.value.length}/1000`;
        });

        // Template switching
        this.templateBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTemplateChange(e));
        });

        // Action buttons
        this.previewBtn.addEventListener('click', () => this.openPdfPreview());
        this.downloadBtn.addEventListener('click', () => this.downloadPdf());
        this.retryBtn.addEventListener('click', () => this.retryGeneration());

        // Help modal
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.closeHelpBtn.addEventListener('click', () => this.hideHelp());
        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal) this.hideHelp();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideHelp();
            if (e.key === 'Enter' && e.ctrlKey) this.chatForm.dispatchEvent(new Event('submit'));
        });
    }

    async handleChatSubmit(e) {
        e.preventDefault();
        
        const message = this.chatInput.value.trim();
        if (!message || this.isGenerating) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.charCount.textContent = '0/1000';

        // Disable input during generation
        this.setGeneratingState(true);

        try {
            // Send message to backend
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    message: message,
                    template: this.currentTemplate,
                    session_id: this.sessionId
                })
            });

            if (!response.ok) throw new Error('Failed to send message');
            
            const data = await response.json();
            
            // Add AI response
            this.addMessage(data.ai_response, 'assistant');
            
            // Start CV generation process
            await this.startCVGeneration(message);

        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('Sorry, there was an error processing your message. Please try again.', 'assistant');
            this.setGeneratingState(false);
            this.showErrorState('Failed to process your request');
        }
    }

    async startCVGeneration(userInput) {
        try {
            // Show progress state
            this.showProcessingState();
            
            // Initialize WebSocket for progress updates
            this.connectWebSocket();

            // Start generation on backend
            const response = await fetch('/api/cv/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    user_input: userInput,
                    template: this.currentTemplate,
                    session_id: this.sessionId
                })
            });

            if (!response.ok) throw new Error('Failed to generate CV');
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.currentPdfUrl = result.pdf_url;
                console.log('✅ CV generation initiated successfully:', result.pdf_filename);
                
                // Add success message to chat
                this.addMessage(`✅ CV generation completed! Your ${result.template.replace('_cv.html', '').replace('_', ' ')} CV is ready.`, 'assistant');
                
                // WebSocket will handle the completion state
                setTimeout(() => {
                    if (this.websocket) {
                        this.websocket.send(JSON.stringify({
                            action: 'start_generation',
                            session_id: this.sessionId
                        }));
                    }
                }, 500);
            } else {
                throw new Error(result.message || 'Generation failed');
            }

        } catch (error) {
            console.error('Error generating CV:', error);
            let errorMessage = 'An unexpected error occurred';
            
            if (error.response) {
                try {
                    const errorData = await error.response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Fallback to generic message
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.showErrorState(errorMessage);
            this.setGeneratingState(false);
        }
    }

    connectWebSocket() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        const wsUrl = `ws://${window.location.host}/ws/progress/${this.sessionId}`;
        console.log('Connecting to WebSocket:', wsUrl);

        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
            console.log('WebSocket connected');
            this.updateConnectionStatus(true, 'Connected');
        };

        this.websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleProgressUpdate(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.websocket.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            this.updateConnectionStatus(false, 'Disconnected');
            
            // Auto-reconnect if not a clean close
            if (event.code !== 1000 && this.isGenerating) {
                setTimeout(() => this.connectWebSocket(), 2000);
            }
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionStatus(false, 'Connection error');
        };
    }

    initializeWebSocket() {
        // Initial connection for session setup
        this.connectWebSocket();
    }

    handleProgressUpdate(data) {
        console.log('Progress update:', data);

        if (data.error) {
            this.showErrorState(data.status || 'An error occurred');
            return;
        }

        // Update progress bar
        if (typeof data.progress === 'number') {
            this.updateProgress(data.progress, data.status || 'Processing...');
        }

        // Handle completion
        if (data.progress >= 100 || data.download_ready) {
            setTimeout(() => {
                this.showCompleteState();
                this.setGeneratingState(false);
                
                if (data.pdf_url && !this.currentPdfUrl) {
                    this.currentPdfUrl = data.pdf_url;
                }
            }, 1000);
        }
    }

    updateProgress(progress, status) {
        const percentage = Math.min(Math.max(progress, 0), 100);
        
        this.progressBar.style.width = `${percentage}%`;
        this.progressPercentage.textContent = `${Math.round(percentage)}%`;
        this.progressStatus.textContent = status;

        // Update progress message
        if (percentage === 100) {
            this.progressMessage.innerHTML = '✅ CV generation completed successfully!';
            this.progressShine.classList.add('hidden');
        } else if (percentage > 0) {
            this.progressMessage.innerHTML = `🔄 ${status}`;
            this.progressShine.classList.remove('hidden');
        } else {
            this.progressMessage.innerHTML = '⏳ Preparing to generate your CV...';
            this.progressShine.classList.add('hidden');
        }

        // Update progress bar color based on completion
        if (percentage >= 100) {
            this.progressBar.className = this.progressBar.className.replace('bg-blue-500', 'bg-green-500');
        }
    }

    handleTemplateChange(e) {
        const button = e.currentTarget;
        const template = button.dataset.template;
        const color = button.dataset.color;

        if (template === this.currentTemplate) return;

        // Update active button
        this.templateBtns.forEach(btn => {
            btn.classList.remove('active');
            // Reset to default styling
            const btnColor = btn.dataset.color;
            btn.className = `template-btn px-5 py-3 rounded-xl font-medium transition-all duration-200 text-sm bg-${btnColor}-50 text-${btnColor}-700 border border-${btnColor}-200 hover:bg-${btnColor}-100 hover:border-${btnColor}-300`;
        });

        // Activate clicked button
        button.classList.add('active');
        button.className = `template-btn active px-5 py-3 rounded-xl font-medium transition-all duration-200 text-sm bg-${color}-500 text-white shadow-lg transform scale-105`;

        // Update state
        this.currentTemplate = template;
        const templateName = template.replace('_cv.html', '').replace('_', ' ');
        this.selectedTemplateSpan.textContent = templateName.charAt(0).toUpperCase() + templateName.slice(1);

        // Send to backend
        this.updateSessionTemplate(template);

        console.log('Template changed to:', template);
    }

    async updateSessionTemplate(template) {
        try {
            await fetch(`/api/session/${this.sessionId}/template`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ template })
            });
        } catch (error) {
            console.error('Error updating template:', error);
        }
    }

    addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;

        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (role === 'user') {
            messageDiv.innerHTML = `
                <div class="max-w-[80%] flex flex-col">
                    <div class="bg-blue-500 text-white px-4 py-3 rounded-2xl rounded-br-md">
                        <p class="text-sm leading-relaxed whitespace-pre-wrap">${this.escapeHtml(content)}</p>
                    </div>
                    <span class="text-xs text-gray-500 mt-1 px-1 text-right">${timestamp}</span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="max-w-[80%] flex items-start space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-robot text-white text-sm"></i>
                    </div>
                    <div class="flex flex-col">
                        <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <p class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">${this.escapeHtml(content)}</p>
                        </div>
                        <span class="text-xs text-gray-500 mt-1 px-1">${timestamp}</span>
                    </div>
                </div>
            `;
        }

        this.chatArea.appendChild(messageDiv);
        this.chatArea.scrollTop = this.chatArea.scrollHeight;

        // Store message
        this.messages.push({ role, content, timestamp });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setGeneratingState(isGenerating) {
        this.isGenerating = isGenerating;
        this.chatInput.disabled = isGenerating;
        this.sendBtn.disabled = isGenerating;
        
        if (isGenerating) {
            this.sendBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i><span>Generating...</span>';
            this.chatInput.placeholder = 'Please wait while your CV is being generated...';
        } else {
            this.sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Send</span>';
            this.chatInput.placeholder = 'Describe your experience, skills, education...';
        }
    }

    showProcessingState() {
        this.hideAllStates();
        this.processingState.classList.remove('hidden');
        this.progressContainer.classList.remove('hidden');
        this.updateProgress(0, 'Initializing...');
    }

    showCompleteState() {
        this.hideAllStates();
        this.completeState.classList.remove('hidden');
        
        if (this.currentPdfUrl) {
            this.pdfPreview.src = this.currentPdfUrl;
        }
    }

    showErrorState(message) {
        this.hideAllStates();
        this.errorState.classList.remove('hidden');
        document.getElementById('error-message').textContent = message;
    }

    showReadyState() {
        this.hideAllStates();
        this.readyState.classList.remove('hidden');
        this.progressContainer.classList.add('hidden');
    }

    hideAllStates() {
        this.readyState.classList.add('hidden');
        this.processingState.classList.add('hidden');
        this.completeState.classList.add('hidden');
        this.errorState.classList.add('hidden');
    }

    updateConnectionStatus(connected, message) {
        this.statusIndicator.className = `w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`;
        this.statusText.textContent = message;
        
        this.wsIndicator.className = `w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`;
        this.wsStatus.textContent = connected ? 'Connected to progress stream' : 'Connecting...';
    }

    openPdfPreview() {
        if (this.currentPdfUrl) {
            window.open(this.currentPdfUrl, '_blank');
        }
    }

    async downloadPdf() {
        if (!this.currentPdfUrl) return;

        try {
            const response = await fetch(this.currentPdfUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `CV_${this.currentTemplate.replace('_cv.html', '')}_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        }
    }

    retryGeneration() {
        this.showReadyState();
        this.setGeneratingState(false);
        this.currentPdfUrl = null;
        
        if (this.websocket) {
            this.websocket.close();
        }
        
        // Focus chat input for retry
        this.chatInput.focus();
    }

    showHelp() {
        this.helpModal.classList.remove('hidden');
    }

    hideHelp() {
        this.helpModal.classList.add('hidden');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cvApp = new CVGeneratorApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden');
    } else {
        console.log('Page visible');
        // Reconnect WebSocket if needed
        if (window.cvApp && window.cvApp.isGenerating && (!window.cvApp.websocket || window.cvApp.websocket.readyState !== WebSocket.OPEN)) {
            window.cvApp.connectWebSocket();
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.cvApp && window.cvApp.websocket) {
        window.cvApp.websocket.close();
    }
});