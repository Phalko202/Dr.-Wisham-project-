/**
 * AI Chat Widget - Floating chat interface for Patient AI Assistant
 * Injects into Vinavi pages and provides conversational interface
 */

class AIChatWidget {
  constructor() {
    this.isOpen = false;
    this.isMinimized = false;
    this.isFullscreen = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.position = { x: null, y: null }; // null means use default CSS position
    this.ai = new PatientAI();
    this.patientDataCollector = new PatientDataCollector();
    // Safely initialize PatientHistoryEngine (may not be loaded yet)
    this.historyEngine = (typeof PatientHistoryEngine !== 'undefined') ? new PatientHistoryEngine() : null;
    this.fullHistoryLoaded = false;
    this.messages = [];
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.attachDragListeners();
    this.observePatientChanges();
    
    // Add welcome message
    this.addMessage('assistant', this.ai.getGreeting());
    
    console.log('[AI Chat Widget] Initialized');
  }

  createWidget() {
    console.log('[AI Chat Widget] Creating widget...');
    
    // Make sure document.body exists
    if (!document.body) {
      console.warn('[AI Chat Widget] document.body not ready, waiting...');
      setTimeout(() => this.createWidget(), 100);
      return;
    }
    
    // Main container
    this.container = document.createElement('div');
    this.container.id = 'hmh-ai-chat-container';
    this.container.innerHTML = `
      <!-- Floating Button - Modern Glassmorphism Style -->
      <div id="hmh-ai-chat-button" class="hmh-ai-btn">
        <div class="hmh-ai-btn-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <div class="hmh-ai-btn-pulse"></div>
        <div class="hmh-ai-btn-label">🤖 AI Assistant</div>
      </div>

      <!-- Chat Window - Modern Glass Design -->
      <div id="hmh-ai-chat-window" class="hmh-ai-window hidden">
        <!-- Header - Gradient with glass effect -->
        <div class="hmh-ai-header">
          <div class="hmh-ai-header-info">
            <div class="hmh-ai-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div class="hmh-ai-header-text">
              <div class="hmh-ai-title">🏥 HMH AI Assistant</div>
              <div class="hmh-ai-subtitle" id="hmh-ai-patient-status">No patient loaded</div>
            </div>
          </div>
          <div class="hmh-ai-header-actions">
            <button class="hmh-ai-header-btn hmh-ai-history-btn" id="hmh-ai-fullhistory-btn" title="Load Full Patient History (All Episodes)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
            <button class="hmh-ai-header-btn" id="hmh-ai-refresh-btn" title="Refresh patient data">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
            <button class="hmh-ai-header-btn" id="hmh-ai-fullscreen-btn" title="Toggle Fullscreen">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="fullscreen-expand-icon">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="fullscreen-collapse-icon" style="display: none;">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            </button>
            <button class="hmh-ai-header-btn" id="hmh-ai-minimize-btn" title="Minimize">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/>
              </svg>
            </button>
            <button class="hmh-ai-header-btn" id="hmh-ai-close-btn" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Quick Actions - Reorganized with Categories -->
        <div class="hmh-ai-quick-actions" id="hmh-ai-quick-actions">
          <div class="hmh-quick-section">
            <span class="hmh-quick-label">📊 Overview</span>
            <div class="hmh-quick-btns">
              <button class="hmh-ai-quick-btn" data-query="patient summary">📋 Summary</button>
              <button class="hmh-ai-quick-btn hmh-ai-quick-btn-accent" data-query="full history">📚 Full History</button>
            </div>
          </div>
          <div class="hmh-quick-section">
            <span class="hmh-quick-label">🏥 Clinical</span>
            <div class="hmh-quick-btns">
              <button class="hmh-ai-quick-btn" data-query="comorbidities">🩺 Conditions</button>
              <button class="hmh-ai-quick-btn" data-query="common diagnoses">📊 Diagnoses</button>
              <button class="hmh-ai-quick-btn" data-query="medications">💊 Meds</button>
            </div>
          </div>
          <div class="hmh-quick-section">
            <span class="hmh-quick-label">🔬 Analysis</span>
            <div class="hmh-quick-btns">
              <button class="hmh-ai-quick-btn" data-query="lab history">🧪 Labs</button>
              <button class="hmh-ai-quick-btn" data-query="risk assessment">⚠️ Risks</button>
              <button class="hmh-ai-quick-btn" data-query="suggest tests">💡 Suggest</button>
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="hmh-ai-messages" id="hmh-ai-messages">
          <!-- Messages will be inserted here -->
        </div>

        <!-- Input Area - Modern Style -->
        <div class="hmh-ai-input-area">
          <div class="hmh-ai-input-container">
            <textarea 
              id="hmh-ai-input" 
              placeholder="Ask me anything about this patient..." 
              rows="1"
              maxlength="500"
            ></textarea>
            <button id="hmh-ai-send-btn" class="hmh-ai-send-btn" title="Send message">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <div class="hmh-ai-input-hint">
            Press Enter to send • Type "help" for commands
          </div>
        </div>
      </div>
    `;

    // Add styles
    this.addStyles();

    // Append to body
    document.body.appendChild(this.container);
    console.log('[AI Chat Widget] Widget appended to body');

    // Get references
    this.chatButton = this.container.querySelector('#hmh-ai-chat-button');
    this.chatWindow = this.container.querySelector('#hmh-ai-chat-window');
    this.messagesContainer = this.container.querySelector('#hmh-ai-messages');
    this.inputField = this.container.querySelector('#hmh-ai-input');
    this.sendButton = this.container.querySelector('#hmh-ai-send-btn');
    this.patientStatus = this.container.querySelector('#hmh-ai-patient-status');
  }

  addStyles() {
    const style = document.createElement('style');
    style.id = 'hmh-ai-chat-styles';
    style.textContent = `
      /* Container - positioned at bottom right, draggable */
      #hmh-ai-chat-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        user-select: none;
      }

      /* Floating Button - Modern Teal Medical Theme */
      .hmh-ai-btn {
        position: relative;
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%);
        border-radius: 18px;
        cursor: grab;
        box-shadow: 
          0 4px 20px rgba(13, 148, 136, 0.4),
          0 8px 32px rgba(20, 184, 166, 0.3),
          inset 0 1px 0 rgba(255,255,255,0.2);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .hmh-ai-btn:active {
        cursor: grabbing;
      }

      .hmh-ai-btn:hover {
        transform: scale(1.08) translateY(-2px);
        box-shadow: 
          0 8px 30px rgba(13, 148, 136, 0.5),
          0 12px 40px rgba(20, 184, 166, 0.4),
          inset 0 1px 0 rgba(255,255,255,0.3);
      }

      .hmh-ai-btn-icon {
        width: 30px;
        height: 30px;
        color: white;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      }

      .hmh-ai-btn-icon svg {
        width: 100%;
        height: 100%;
      }

      .hmh-ai-btn-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(13, 148, 136, 0.4) 0%, rgba(20, 184, 166, 0.4) 100%);
        animation: hmh-pulse 2s ease-out infinite;
      }

      @keyframes hmh-pulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.4); opacity: 0; }
      }

      @keyframes hmhBadgePop {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
      }

      .hmh-ai-btn-label {
        position: absolute;
        right: 74px;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: white;
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        opacity: 0;
        transform: translateX(10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      }

      .hmh-ai-btn:hover .hmh-ai-btn-label {
        opacity: 1;
        transform: translateX(0);
      }

      .hmh-ai-btn-label::after {
        content: '';
        position: absolute;
        right: -6px;
        top: 50%;
        transform: translateY(-50%);
        border: 6px solid transparent;
        border-left-color: #0f172a;
      }

      /* Chat Window - Modern Glass Effect */
      .hmh-ai-window {
        position: absolute;
        bottom: 84px;
        right: 0;
        width: 420px;
        height: 640px;
        max-height: calc(100vh - 120px);
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        box-shadow: 
          0 25px 50px -12px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .hmh-ai-window.hidden {
        opacity: 0;
        transform: translateY(20px) scale(0.92);
        pointer-events: none;
      }

      .hmh-ai-window.minimized {
        height: 64px;
      }

      /* Fullscreen Mode */
      .hmh-ai-window.fullscreen {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
        z-index: 2147483647 !important;
      }

      .hmh-ai-window.fullscreen .hmh-ai-messages {
        max-height: calc(100vh - 200px);
      }

      .hmh-ai-window.fullscreen .hmh-ai-quick-actions {
        padding: 16px 24px;
      }

      .hmh-ai-window.fullscreen .hmh-ai-input-area {
        padding: 16px 24px;
      }

      /* Header - Modern Teal Gradient with Glass */
      .hmh-ai-header {
        background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: white;
        position: relative;
        overflow: hidden;
      }
      
      .hmh-ai-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        pointer-events: none;
      }

      .hmh-ai-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
        z-index: 1;
      }

      .hmh-ai-avatar {
        width: 44px;
        height: 44px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .hmh-ai-avatar svg {
        width: 24px;
        height: 24px;
      }

      .hmh-ai-title {
        font-weight: 700;
        font-size: 16px;
        letter-spacing: -0.3px;
      }

      .hmh-ai-subtitle {
        font-size: 12px;
        opacity: 0.9;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .hmh-ai-header-actions {
        display: flex;
        gap: 6px;
        position: relative;
        z-index: 1;
      }

      .hmh-ai-header-btn {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: all 0.2s;
      }

      .hmh-ai-header-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.1);
      }

      .hmh-ai-header-btn svg {
        width: 16px;
        height: 16px;
      }

      .hmh-ai-history-btn.loading {
        animation: hmh-spin 1s linear infinite;
        background: rgba(255, 200, 0, 0.3);
      }

      .hmh-ai-history-btn.loaded {
        background: rgba(20, 184, 166, 0.5);
      }

      @keyframes hmh-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Quick Actions - Modern Categorized Layout */
      .hmh-ai-quick-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
        border-bottom: 1px solid #e2e8f0;
      }
      
      .hmh-quick-section {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .hmh-quick-label {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        min-width: 70px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .hmh-quick-btns {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .hmh-ai-quick-btn {
        background: white;
        border: 1px solid #e2e8f0;
        padding: 5px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        color: #475569;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04);
      }

      .hmh-ai-quick-btn:hover {
        background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
        border-color: transparent;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
      }

      .hmh-ai-quick-btn-accent {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-color: transparent;
        color: white;
        font-weight: 600;
      }

      .hmh-ai-quick-btn-accent:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }

      .hmh-ai-quick-btn-accent.loading {
        opacity: 0.7;
        pointer-events: none;
        animation: hmh-pulse 1.5s infinite;
      }

      @keyframes hmh-pulse {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }

      /* Messages Area - Modern Glass Effect */
      .hmh-ai-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      }

      .hmh-ai-message {
        max-width: 88%;
        padding: 14px 18px;
        border-radius: 18px;
        font-size: 13px;
        line-height: 1.6;
        animation: hmh-message-in 0.3s ease;
        position: relative;
      }

      @keyframes hmh-message-in {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .hmh-ai-message.user {
        background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 6px;
        box-shadow: 0 4px 14px rgba(13, 148, 136, 0.25);
      }

      .hmh-ai-message.assistant {
        background: white;
        color: #1e293b;
        align-self: flex-start;
        border-bottom-left-radius: 6px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        border: 1px solid rgba(0, 0, 0, 0.04);
      }

      .hmh-ai-message.assistant strong {
        color: #0d9488;
        font-weight: 600;
      }

      .hmh-ai-message-time {
        font-size: 10px;
        opacity: 0.5;
        margin-top: 8px;
        display: block;
      }

      /* Typing indicator */
      .hmh-ai-typing {
        display: flex;
        gap: 4px;
        padding: 16px;
        align-self: flex-start;
      }

      .hmh-ai-typing-dot {
        width: 8px;
        height: 8px;
        background: #14b8a6;
        border-radius: 50%;
        animation: hmh-typing 1.4s infinite;
      }

      .hmh-ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .hmh-ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes hmh-typing {
        0%, 100% { transform: translateY(0); opacity: 0.4; }
        50% { transform: translateY(-6px); opacity: 1; }
      }

      /* Input Area - Modern Style */
      .hmh-ai-input-area {
        padding: 16px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        border-top: 1px solid #e2e8f0;
      }

      .hmh-ai-input-container {
        display: flex;
        gap: 10px;
        align-items: flex-end;
        background: #f1f5f9;
        border-radius: 16px;
        padding: 10px 12px 10px 18px;
        border: 2px solid transparent;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      }

      .hmh-ai-input-container:focus-within {
        border-color: #14b8a6;
        background: white;
        box-shadow: 0 4px 16px rgba(20, 184, 166, 0.15);
      }

      #hmh-ai-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 14px;
        resize: none;
        max-height: 100px;
        font-family: inherit;
        color: #1e293b;
        line-height: 1.5;
      }

      #hmh-ai-input:focus {
        outline: none;
      }

      #hmh-ai-input::placeholder {
        color: #94a3b8;
      }

      .hmh-ai-send-btn {
        width: 40px;
        height: 40px;
        border: none;
        background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .hmh-ai-send-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 4px 16px rgba(13, 148, 136, 0.4);
      }

      .hmh-ai-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .hmh-ai-send-btn svg {
        width: 18px;
        height: 18px;
      }

      .hmh-ai-input-hint {
        font-size: 11px;
        color: #94a3b8;
        text-align: center;
        margin-top: 10px;
      }

      /* Markdown-like formatting in messages */
      .hmh-ai-message.assistant h1,
      .hmh-ai-message.assistant h2,
      .hmh-ai-message.assistant h3 {
        margin: 8px 0 4px 0;
        color: #0d9488;
      }

      .hmh-ai-message.assistant ul,
      .hmh-ai-message.assistant ol {
        margin: 8px 0;
        padding-left: 20px;
      }

      .hmh-ai-message.assistant li {
        margin: 4px 0;
      }

      /* Scrollbar */
      .hmh-ai-messages::-webkit-scrollbar {
        width: 6px;
      }

      .hmh-ai-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .hmh-ai-messages::-webkit-scrollbar-thumb {
        background: #dee2e6;
        border-radius: 3px;
      }

      .hmh-ai-messages::-webkit-scrollbar-thumb:hover {
        background: #adb5bd;
      }

      /* Progress Message Styles */
      .hmh-ai-progress-msg {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
        border: 1px solid #7dd3fc !important;
        padding: 16px !important;
      }
      
      .hmh-progress-content {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      
      .hmh-progress-icon {
        font-size: 24px;
        animation: hmh-spin 1s linear infinite;
      }
      
      .hmh-progress-text {
        font-weight: 600;
        color: #0369a1;
      }
      
      .hmh-progress-bar-container {
        width: 100%;
        height: 8px;
        background: #e0f2fe;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
      }
      
      .hmh-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #0ea5e9, #0284c7);
        border-radius: 4px;
        transition: width 0.3s ease;
      }
      
      .hmh-progress-stats {
        font-size: 12px;
        color: #64748b;
        text-align: center;
      }

      /* Interactive Episodes List */
      .hmh-episodes-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 12px 0;
      }
      
      .hmh-episode-card {
        background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
        border: 1px solid #fcd34d;
        border-radius: 10px;
        padding: 12px;
        transition: all 0.2s ease;
        cursor: pointer;
      }
      
      .hmh-episode-card:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        border-color: #f59e0b;
      }
      
      .hmh-episode-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .hmh-episode-date {
        font-weight: 700;
        color: #92400e;
        font-size: 13px;
      }
      
      .hmh-episode-link {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        border: none;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .hmh-episode-link:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      }
      
      .hmh-episode-diag {
        font-size: 13px;
        color: #1f2937;
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .hmh-episode-doc {
        font-size: 12px;
        color: #6b7280;
      }
      
      .hmh-episode-meds {
        font-size: 11px;
        color: #059669;
        margin-top: 4px;
      }
      
      .hmh-episodes-more {
        font-size: 12px;
        color: #6b7280;
        text-align: center;
        font-style: italic;
        padding: 8px;
      }

      /* Responsive */
      @media (max-width: 480px) {
        .hmh-ai-window {
          width: calc(100vw - 32px);
          right: -8px;
          height: calc(100vh - 150px);
        }
      }
    `;
    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(style);
      });
    }
  }

  attachEventListeners() {
    // Toggle chat window
    this.chatButton.addEventListener('click', () => this.toggleChat());

    // Close button
    this.container.querySelector('#hmh-ai-close-btn').addEventListener('click', () => this.closeChat());

    // Minimize button
    this.container.querySelector('#hmh-ai-minimize-btn').addEventListener('click', () => this.toggleMinimize());

    // Fullscreen toggle button
    this.container.querySelector('#hmh-ai-fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());

    // Refresh patient data
    this.container.querySelector('#hmh-ai-refresh-btn').addEventListener('click', () => this.refreshPatientData());
    
    // Load full patient history
    this.container.querySelector('#hmh-ai-fullhistory-btn').addEventListener('click', () => this.loadFullPatientHistory());

    // Send message
    this.sendButton.addEventListener('click', () => this.sendMessage());

    // Enter to send
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.inputField.addEventListener('input', () => {
      this.inputField.style.height = 'auto';
      this.inputField.style.height = Math.min(this.inputField.scrollHeight, 100) + 'px';
    });

    // Quick action buttons
    this.container.querySelectorAll('.hmh-ai-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        if (query === 'full history') {
          this.loadFullPatientHistory();
        } else {
          this.inputField.value = query;
          this.sendMessage();
        }
      });
    });
  }
  
  /**
   * Load complete patient history from all episodes with progress display
   * @param {boolean} autoLoad - If true, triggered automatically on patient change
   */
  async loadFullPatientHistory(autoLoad = false) {
    const patientId = window.currentPatient?.id || this.ai.patientData?.id;
    
    if (!patientId) {
      if (!autoLoad) this.addMessage('assistant', '⚠️ No patient loaded. Please load a patient first.');
      return;
    }
    
    // Skip if already loaded for this patient
    if (this.fullHistoryLoaded && this.lastLoadedPatientId === patientId) {
      if (!autoLoad) this.addMessage('assistant', '✅ Patient history already loaded. Ask me anything!');
      return;
    }
    
    // Lazy initialize history engine if not available at construction
    if (!this.historyEngine && typeof PatientHistoryEngine !== 'undefined') {
      this.historyEngine = new PatientHistoryEngine();
    }
    
    if (!this.historyEngine) {
      if (!autoLoad) this.addMessage('assistant', '⚠️ History engine not available. Please refresh the page and try again.');
      return;
    }
    
    // Create or update progress message
    const progressMsgId = `progress-${Date.now()}`;
    this.addProgressMessage(progressMsgId, 'Discovering patient episodes...', 0, 0);
    
    // Show loading state on button
    const historyBtn = this.container.querySelector('#hmh-ai-fullhistory-btn');
    if (historyBtn) historyBtn.classList.add('loading');
    
    try {
      // Progress callback for real-time updates
      const onProgress = (current, total, episodeId, stage) => {
        if (stage === 'discovered') {
          this.updateProgressMessage(progressMsgId, `Found ${total} episodes. Loading details...`, 0, total);
        } else if (stage === 'loading') {
          this.updateProgressMessage(progressMsgId, `Loading episode ${current}/${total}...`, current, total);
        } else if (stage === 'complete') {
          this.updateProgressMessage(progressMsgId, `✅ Loaded ${current} episodes successfully!`, current, total);
        }
      };
      
      const profile = await this.historyEngine.fetchCompleteHistory(patientId, onProgress);
      
      if (!profile) {
        this.removeProgressMessage(progressMsgId);
        this.addMessage('assistant', '❌ Could not load patient history. Please try again.');
        if (historyBtn) historyBtn.classList.remove('loading');
        return;
      }
      
      // Remove progress message
      this.removeProgressMessage(progressMsgId);
      
      // Merge full history into AI's patient data
      this.mergeFullHistoryIntoAI(profile);
      this.fullHistoryLoaded = true;
      this.lastLoadedPatientId = patientId;
      
      // Store episodes for interactive display
      this._lastLoadedEpisodes = profile.episodes || [];
      
      // Learn from this patient's data for future suggestions
      await this.learnFromPatientHistory(profile);
      
      // Update button to show loaded state
      if (historyBtn) {
        historyBtn.classList.remove('loading');
        historyBtn.classList.add('loaded');
        historyBtn.title = 'Full history loaded';
      }
      
      // Build comprehensive summary with interactive episodes
      const summary = this.buildFullHistorySummary(profile);
      this.addMessage('assistant', summary);
      
    } catch (error) {
      console.error('[AI Widget] Error loading full history:', error);
      this.removeProgressMessage(progressMsgId);
      this.addMessage('assistant', `❌ Error loading history: ${error.message}`);
      if (historyBtn) historyBtn.classList.remove('loading');
    }
  }
  
  /**
   * Add a progress message with progress bar
   */
  addProgressMessage(id, text, current, total) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'hmh-ai-message assistant hmh-ai-progress-msg';
    messageDiv.id = id;
    
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    
    messageDiv.innerHTML = `
      <div class="hmh-progress-content">
        <div class="hmh-progress-icon">🔄</div>
        <div class="hmh-progress-text">${text}</div>
      </div>
      <div class="hmh-progress-bar-container">
        <div class="hmh-progress-bar" style="width: ${percent}%"></div>
      </div>
      <div class="hmh-progress-stats">${current > 0 ? `${current}/${total} episodes` : 'Initializing...'}</div>
    `;
    
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }
  
  /**
   * Update an existing progress message
   */
  updateProgressMessage(id, text, current, total) {
    const msg = document.getElementById(id);
    if (!msg) return;
    
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    const icon = percent >= 100 ? '✅' : '🔄';
    
    msg.querySelector('.hmh-progress-icon').textContent = icon;
    msg.querySelector('.hmh-progress-text').textContent = text;
    msg.querySelector('.hmh-progress-bar').style.width = `${percent}%`;
    msg.querySelector('.hmh-progress-stats').textContent = `${current}/${total} episodes`;
    
    this.scrollToBottom();
  }
  
  /**
   * Remove a progress message
   */
  removeProgressMessage(id) {
    const msg = document.getElementById(id);
    if (msg) msg.remove();
  }
  
  /**
   * Merge full patient history into AI's data
   */
  mergeFullHistoryIntoAI(profile) {
    if (!this.ai.patientData) {
      this.ai.patientData = {};
    }
    
    // Merge chronic conditions
    this.ai.patientData.chronicConditions = profile.chronicConditions || [];
    
    // Merge all diagnoses as previous diagnoses
    this.ai.patientData.previousDiagnoses = profile.allDiagnoses || [];
    
    // Merge recurrent conditions
    this.ai.patientData.recurrentConditions = profile.recurrentConditions || [];
    
    // Merge all medications ever taken
    this.ai.patientData.allMedications = profile.allMedications || [];
    this.ai.patientData.medicationHistory = profile.medicationHistory || [];
    
    // Merge all complaints
    this.ai.patientData.allComplaints = profile.allComplaints || [];
    
    // Merge all lab tests
    this.ai.patientData.allLabTests = profile.allLabTests || [];
    
    // Store episode history
    this.ai.patientData.episodeHistory = profile.episodes || [];
    
    // Store doctors visited
    this.ai.patientData.doctorsVisited = profile.doctorsVisited || [];
    
    // Store statistics
    this.ai.patientData.historyStats = {
      totalEpisodes: profile.totalEpisodes,
      dateRange: profile.dateRange,
      chronicConditionsCount: profile.chronicConditions?.length || 0,
      uniqueDiagnosesCount: profile.allDiagnoses?.length || 0
    };
    
    console.log('[AI Widget] Full history merged into AI:', {
      chronicConditions: this.ai.patientData.chronicConditions.length,
      allDiagnoses: this.ai.patientData.previousDiagnoses.length,
      episodes: this.ai.patientData.episodeHistory.length
    });
  }
  
  /**
   * Learn from patient history to improve future suggestions
   * Uses LocalMedicalKnowledge to store patterns
   */
  async learnFromPatientHistory(profile) {
    // Use AI's local knowledge system if available
    if (this.ai?.localKnowledge) {
      try {
        await this.ai.localKnowledge.learnFromPatient({
          diagnoses: profile.allDiagnoses || [],
          previousDiagnoses: profile.chronicConditions || [],
          chronicConditions: profile.chronicConditions || [],
          medications: profile.allMedications || [],
          allMedications: profile.allMedications || [],
          labTests: profile.allLabTests || [],
          allLabTests: profile.allLabTests || [],
          complaints: profile.allComplaints || [],
          allComplaints: profile.allComplaints || []
        });
        
        // Reload learned patterns into AI
        await this.ai.loadLearnedPatterns();
        
        console.log('[AI Widget] Learned from patient history');
      } catch (error) {
        console.warn('[AI Widget] Could not learn from patient:', error);
      }
    }
  }
  
  /**
   * Build comprehensive summary from full history
   */
  buildFullHistorySummary(profile) {
    let summary = `✅ **Complete Patient History Loaded**\n\n`;
    
    // Statistics
    summary += `📊 **Overview:**\n`;
    summary += `• Total Episodes: ${profile.totalEpisodes}\n`;
    if (profile.dateRange.from) {
      const from = new Date(profile.dateRange.from).toLocaleDateString();
      const to = new Date(profile.dateRange.to).toLocaleDateString();
      summary += `• Date Range: ${from} - ${to}\n`;
    }
    summary += `• Unique Diagnoses: ${profile.allDiagnoses?.length || 0}\n`;
    summary += `• Medications Used: ${profile.allMedications?.length || 0}\n`;
    
    // Show doctors with specialties
    if (profile.doctorsVisited?.length > 0) {
      summary += `• Doctors Seen: ${profile.doctorsVisited.length}\n`;
      profile.doctorsVisited.slice(0, 3).forEach(doc => {
        const specialty = doc.specialty || doc.specialities?.[0] || doc.professionalType || '';
        summary += `  - ${doc.name}${specialty ? ` (${specialty})` : ''}\n`;
      });
      if (profile.doctorsVisited.length > 3) {
        summary += `  - _...and ${profile.doctorsVisited.length - 3} more_\n`;
      }
    } else {
      summary += `• Doctors Seen: 0\n`;
    }
    summary += '\n';
    
    // Chronic conditions (most important)
    if (profile.chronicConditions?.length > 0) {
      summary += `🔴 **Chronic/Recurring Conditions:**\n`;
      profile.chronicConditions.slice(0, 8).forEach(c => {
        summary += `• **${c.code}** - ${c.name}`;
        if (c.count > 1) summary += ` (${c.count} occurrences)`;
        summary += '\n';
      });
      summary += '\n';
    }
    
    // Recent episodes with clickable links
    if (profile.episodes?.length > 0) {
      summary += `📋 **Recent Episodes:** _(click to open)_\n`;
      summary += `{{EPISODES_LIST}}`;
      summary += '\n';
    }
    
    // All-time medications
    if (profile.allMedications?.length > 0) {
      summary += `💊 **Medications History (${profile.allMedications.length} total):**\n`;
      profile.allMedications.slice(0, 6).forEach(m => {
        summary += `• ${m.name}${m.strength ? ` (${m.strength})` : ''}\n`;
      });
      if (profile.allMedications.length > 6) {
        summary += `• _...and ${profile.allMedications.length - 6} more_\n`;
      }
      summary += '\n';
    }
    
    summary += `💡 _AI now has access to complete patient history. Ask about chronic conditions, patterns, or treatment history!_`;
    
    // Store episodes for interactive display
    this._lastLoadedEpisodes = profile.episodes || [];
    
    return summary;
  }
  
  /**
   * Navigate to a specific episode in Vinavi
   */
  navigateToEpisode(episodeId, patientId) {
    if (!episodeId) return;
    
    // Construct Vinavi episode URL
    const baseUrl = 'https://vinavi.aasandha.mv';
    const episodeUrl = `${baseUrl}/episodes/${episodeId}`;
    
    console.log('[AI Widget] Navigating to episode:', episodeId);
    
    // Open in new tab
    window.open(episodeUrl, '_blank');
  }

  attachDragListeners() {
    // Make the floating button draggable
    this.chatButton.addEventListener('mousedown', (e) => this.startDrag(e));
    this.chatButton.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
    
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
    
    document.addEventListener('mouseup', () => this.endDrag());
    document.addEventListener('touchend', () => this.endDrag());
  }

  startDrag(e) {
    // Prevent dragging if chat is open (clicking to toggle)
    if (this.isOpen) return;
    
    e.preventDefault();
    this.isDragging = true;
    this.chatButton.style.cursor = 'grabbing';
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = this.container.getBoundingClientRect();
    
    this.dragOffset = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    
    // Record start position for click vs drag detection
    this.dragStart = { x: clientX, y: clientY };
  }

  drag(e) {
    if (!this.isDragging) return;
    
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Calculate new position
    let newX = clientX - this.dragOffset.x;
    let newY = clientY - this.dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - this.container.offsetWidth;
    const maxY = window.innerHeight - this.container.offsetHeight;
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    
    // Apply position
    this.container.style.left = newX + 'px';
    this.container.style.top = newY + 'px';
    this.container.style.right = 'auto';
    this.container.style.bottom = 'auto';
    
    this.position = { x: newX, y: newY };
  }

  endDrag() {
    if (!this.isDragging) return;
    
    this.chatButton.style.cursor = 'pointer';
    
    // Check if this was a click (minimal movement) or a drag
    const dragDistance = this.dragStart ? 
      Math.sqrt(Math.pow(this.position.x - this.dragStart.x, 2) + Math.pow(this.position.y - this.dragStart.y, 2)) : 0;
    
    // If barely moved, treat as click and toggle chat
    if (dragDistance < 5) {
      this.toggleChat();
    }
    
    this.isDragging = false;
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.chatWindow.classList.toggle('hidden', !this.isOpen);
    
    if (this.isOpen) {
      this.inputField.focus();
      this.scrollToBottom();
      
      // Try to collect patient data when opening
      this.refreshPatientData();
    }
  }

  closeChat() {
    this.isOpen = false;
    this.chatWindow.classList.add('hidden');
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.chatWindow.classList.toggle('minimized', this.isMinimized);
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    this.chatWindow.classList.toggle('fullscreen', this.isFullscreen);
    
    // Toggle icon visibility
    const fullscreenBtn = this.container.querySelector('#hmh-ai-fullscreen-btn');
    const expandIcon = fullscreenBtn.querySelector('.fullscreen-expand-icon');
    const collapseIcon = fullscreenBtn.querySelector('.fullscreen-collapse-icon');
    
    if (this.isFullscreen) {
      expandIcon.style.display = 'none';
      collapseIcon.style.display = 'block';
      fullscreenBtn.title = 'Exit Fullscreen';
      // Hide the floating button in fullscreen
      this.chatButton.style.display = 'none';
    } else {
      expandIcon.style.display = 'block';
      collapseIcon.style.display = 'none';
      fullscreenBtn.title = 'Toggle Fullscreen';
      // Show the floating button when exiting fullscreen
      this.chatButton.style.display = '';
    }
    
    // Scroll to bottom after transition
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 300);
  }

  async refreshPatientData() {
    this.patientStatus.textContent = 'Loading complete patient history...';
    
    try {
      // First get basic patient data from page/dashboard
      const patientData = await this.patientDataCollector.collectFromPage();
      
      if (patientData && (patientData.id || patientData.name)) {
        const patientId = patientData.id || window.currentPatient?.id;
        
        // Automatically fetch FULL history using PatientHistoryEngine
        if (patientId && !this.fullHistoryLoaded) {
          // Lazy init history engine
          if (!this.historyEngine && typeof PatientHistoryEngine !== 'undefined') {
            this.historyEngine = new PatientHistoryEngine();
          }
          
          if (this.historyEngine) {
            this.patientStatus.textContent = 'Fetching all episodes...';
            
            try {
              const profile = await this.historyEngine.fetchCompleteHistory(patientId);
              
              if (profile) {
                // Merge full history into AI's patient data
                this.mergeFullHistoryIntoAI(profile);
                this.fullHistoryLoaded = true;
                
                // Learn from history
                await this.learnFromPatientHistory(profile);
                
                // Update patient data with full history
                patientData.source = 'api';
                patientData.previousDiagnoses = profile.allDiagnoses || [];
                patientData.chronicConditions = profile.chronicConditions || [];
                patientData.allMedications = profile.allMedications || [];
                patientData.allComplaints = profile.allComplaints || [];
                patientData.totalEpisodes = profile.totalEpisodes || 0;
                patientData.doctorsVisited = profile.doctorsVisited || [];
                
                console.log('[AI Widget] Full history loaded:', {
                  episodes: profile.totalEpisodes,
                  diagnoses: profile.allDiagnoses?.length,
                  medications: profile.allMedications?.length
                });
              }
            } catch (historyError) {
              console.warn('[AI Widget] Could not fetch full history:', historyError);
            }
          }
        }
        
        await this.ai.setPatientData(patientData);
        this.patientStatus.textContent = `${patientData.name || 'Patient'} ${patientData.id ? `(ID: ${patientData.id})` : ''}`;
        
        // Learn from this patient encounter (if local knowledge is available)
        if (this.ai.localKnowledge) {
          await this.ai.learnFromCurrentPatient();
        }
        
        // Build detailed summary message
        const sourceText = this.fullHistoryLoaded ? 'Complete History (All Episodes)' : 
                           (patientData.source === 'api' ? 'Vinavi API' : 
                           (patientData.source === 'dashboard+api' ? 'Dashboard + API' : 'Page scan'));
        
        let summary = `✅ Patient data loaded: **${patientData.name || 'Unknown'}**\n\n`;
        summary += `📊 **Data Source:** ${sourceText}\n`;
        if (patientData.totalEpisodes) {
          summary += `📁 **Total Episodes:** ${patientData.totalEpisodes}\n`;
        }
        summary += '\n';
        
        // Current Episode Diagnoses
        if (patientData.diagnoses && patientData.diagnoses.length > 0) {
          summary += `🏥 **Current Diagnoses (${patientData.diagnoses.length}):**\n`;
          patientData.diagnoses.slice(0, 3).forEach(d => {
            summary += `• ${d.code ? `[${d.code}] ` : ''}${d.name || d}\n`;
          });
          if (patientData.diagnoses.length > 3) summary += `  ...and ${patientData.diagnoses.length - 3} more\n`;
          summary += '\n';
        }
        
        // Previous Diagnoses from history
        if (patientData.previousDiagnoses && patientData.previousDiagnoses.length > 0) {
          summary += `📜 **Previous Diagnoses (${patientData.previousDiagnoses.length}):**\n`;
          patientData.previousDiagnoses.slice(0, 4).forEach(d => {
            summary += `• ${d.code ? `[${d.code}] ` : ''}${d.name || ''}\n`;
          });
          if (patientData.previousDiagnoses.length > 4) summary += `  ...and ${patientData.previousDiagnoses.length - 4} more\n`;
          summary += '\n';
        }
        
        // Complaints - show "No complaints" context for Follow-up
        if (patientData.complaints && patientData.complaints.length > 0) {
          summary += `📝 **Chief Complaints:**\n`;
          patientData.complaints.forEach(c => {
            const content = c.content || c;
            summary += `• ${String(content).substring(0, 100)}${String(content).length > 100 ? '...' : ''}\n`;
          });
          summary += '\n';
        } else if (patientData.diagnoses?.length > 0 || patientData.previousDiagnoses?.length > 0) {
          summary += `📝 **Chief Complaints:** Follow-up consultation (no new complaints recorded)\n\n`;
        }
        
        // Medications
        if (patientData.medications && patientData.medications.length > 0) {
          summary += `💊 **Medications (${patientData.medications.length}):**\n`;
          patientData.medications.slice(0, 4).forEach(m => {
            summary += `• ${m.name}${m.dose ? ` - ${m.dose}` : ''}${m.frequency ? ` (${m.frequency})` : ''}\n`;
          });
          if (patientData.medications.length > 4) summary += `  ...and ${patientData.medications.length - 4} more\n`;
          summary += '\n';
        }
        
        // Medical Advice
        if (patientData.medicalAdvice && patientData.medicalAdvice.length > 0) {
          summary += `📋 **Medical Advice:**\n`;
          patientData.medicalAdvice.forEach(a => {
            const content = a.content || a;
            summary += `• ${String(content).substring(0, 100)}${String(content).length > 100 ? '...' : ''}\n`;
          });
          summary += '\n';
        }
        
        // Clinical Details (examination findings, etc.)
        if (patientData.clinicalDetails && patientData.clinicalDetails.length > 0) {
          summary += `🔬 **Clinical Details:**\n`;
          patientData.clinicalDetails.forEach(c => {
            const content = c.content || c;
            summary += `• ${String(content).substring(0, 100)}${String(content).length > 100 ? '...' : ''}\n`;
          });
          summary += '\n';
        }
        
        // Vitals
        const vitalCount = Object.keys(patientData.vitals || {}).length;
        if (vitalCount > 0) {
          summary += `📈 **Vitals:** ${vitalCount} recorded\n`;
        }
        
        // Visit history with episode count
        const episodeCount = patientData.episodeHistory?.length || 0;
        if (episodeCount > 0) {
          summary += `🗓️ **Past Episodes:** ${episodeCount} (with diagnoses from history)\n`;
        } else if (patientData.visits && patientData.visits.length > 0) {
          summary += `🗓️ **Past Visits:** ${patientData.visits.length}\n`;
        }
        
        // Check if we have limited data (no episode selected)
        const hasLimitedData = !patientData.episodeId && 
                               patientData.diagnoses?.length === 0 && 
                               patientData.medications?.length === 0;
        
        if (hasLimitedData && patientData.totalEpisodes > 0) {
          summary += '\n💡 **Tip:** Select an episode from the list to see full details (diagnoses, medications, notes).';
        }
        
        summary += '\n**Ask me anything about this patient!**';
        
        this.addMessage('assistant', summary);
      } else {
        this.patientStatus.textContent = 'No patient detected';
        this.addMessage('assistant', '⚠️ Could not detect patient data on this page.\n\n**Tips:**\n• Make sure you are on a patient record page\n• Check if you are logged in to Vinavi\n• Try refreshing the page');
      }
    } catch (error) {
      console.error('[AI Chat] Error collecting patient data:', error);
      this.patientStatus.textContent = 'Error loading data';
      this.addMessage('assistant', '❌ Error fetching patient data. Please check your connection and try again.');
    }
  }

  async sendMessage() {
    const message = this.inputField.value.trim();
    if (!message) return;

    // Clear input
    this.inputField.value = '';
    this.inputField.style.height = 'auto';

    // Add user message
    this.addMessage('user', message);

    // Show typing indicator
    this.showTyping();

    // Process with AI
    try {
      const response = await this.ai.processQuery(message);
      this.hideTyping();
      this.addMessage('assistant', response);
    } catch (error) {
      this.hideTyping();
      this.addMessage('assistant', '❌ Sorry, I encountered an error processing your request. Please try again.');
      console.error('[AI Chat] Error:', error);
    }
  }

  addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `hmh-ai-message ${role}`;
    
    // Parse markdown-like formatting
    let formattedContent = this.formatMessage(content);
    
    // Handle interactive episodes list
    if (formattedContent.includes('{{EPISODES_LIST}}') && this._lastLoadedEpisodes?.length > 0) {
      const episodesHtml = this.buildInteractiveEpisodesList(this._lastLoadedEpisodes.slice(0, 8));
      formattedContent = formattedContent.replace('{{EPISODES_LIST}}', episodesHtml);
    } else {
      formattedContent = formattedContent.replace('{{EPISODES_LIST}}', '');
    }
    
    messageDiv.innerHTML = formattedContent;
    
    // Attach click handlers for episode links
    messageDiv.querySelectorAll('.hmh-episode-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const episodeId = link.dataset.episodeId;
        const patientId = link.dataset.patientId;
        this.navigateToEpisode(episodeId, patientId);
      });
    });

    // Add timestamp
    const timeDiv = document.createElement('div');
    timeDiv.className = 'hmh-ai-message-time';
    timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageDiv.appendChild(timeDiv);

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();

    // Store message
    this.messages.push({ role, content, timestamp: Date.now() });
  }
  
  /**
   * Build interactive episodes list with clickable links
   */
  buildInteractiveEpisodesList(episodes) {
    if (!episodes || episodes.length === 0) return '';
    
    let html = '<div class="hmh-episodes-list">';
    
    episodes.forEach(ep => {
      const date = new Date(ep.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const diags = ep.diagnoses?.map(d => d.code || d.name).filter(Boolean).slice(0, 2).join(', ') || 'No diagnosis';
      const doctorName = ep.doctor?.name ? ep.doctor.name.split(' ').slice(0, 2).join(' ') : '';
      const specialty = ep.doctor?.specialty || '';
      const meds = ep.medications?.length || 0;
      
      html += `
        <div class="hmh-episode-card" data-episode-id="${ep.id}">
          <div class="hmh-episode-header">
            <span class="hmh-episode-date">📅 ${date}</span>
            <button class="hmh-episode-link" data-episode-id="${ep.id}" data-patient-id="${ep.patient?.id || ''}" title="Open in Vinavi">
              🔗 Open
            </button>
          </div>
          <div class="hmh-episode-diag">🏥 ${diags}</div>
          ${doctorName ? `<div class="hmh-episode-doc">👨‍⚕️ ${doctorName}${specialty ? ` • ${specialty}` : ''}</div>` : ''}
          ${meds > 0 ? `<div class="hmh-episode-meds">💊 ${meds} medications</div>` : ''}
        </div>
      `;
    });
    
    if (this._lastLoadedEpisodes?.length > 8) {
      html += `<div class="hmh-episodes-more">...and ${this._lastLoadedEpisodes.length - 8} more episodes</div>`;
    }
    
    html += '</div>';
    return html;
  }

  formatMessage(content) {
    // Convert markdown-like syntax to HTML
    return content
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Line breaks
      .replace(/\n/g, '<br>');
  }

  showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'hmh-ai-typing';
    typingDiv.id = 'hmh-ai-typing-indicator';
    typingDiv.innerHTML = `
      <div class="hmh-ai-typing-dot"></div>
      <div class="hmh-ai-typing-dot"></div>
      <div class="hmh-ai-typing-dot"></div>
    `;
    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTyping() {
    const typingIndicator = document.getElementById('hmh-ai-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  observePatientChanges() {
    // Watch for URL changes (SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        console.log('[AI Chat] URL changed, will refresh patient data on next open');
        this.patientStatus.textContent = 'Page changed - click refresh';
      }
    }).observe(document.body, { subtree: true, childList: true });

    // DASHBOARD MONITORING: Watch for window.currentPatient changes
    this.monitorDashboardPatient();
  }

  monitorDashboardPatient() {
    let lastPatientId = null;
    let lastEpisodeId = null;
    
    // Check every 2 seconds for patient changes in dashboard
    setInterval(() => {
      const currentPatientId = window.currentPatient?.id || null;
      const currentEpisodeId = window.currentEpisode?.id || null;
      
      // Detect if patient changed
      if (currentPatientId !== lastPatientId) {
        lastPatientId = currentPatientId;
        
        // Reset full history flag when patient changes
        this.fullHistoryLoaded = false;
        this.lastLoadedPatientId = null;
        
        // Reset history button state
        const historyBtn = this.container?.querySelector('#hmh-ai-fullhistory-btn');
        if (historyBtn) {
          historyBtn.classList.remove('loaded', 'loading');
          historyBtn.title = 'Load Full Patient History (All Episodes)';
        }
        
        if (currentPatientId) {
          const patientName = window.currentPatient?.attributes?.patient_name || 
                              window.currentPatient?.attributes?.name || 'Patient';
          console.log('[AI Chat] Dashboard patient changed:', currentPatientId, patientName);
          this.patientStatus.textContent = `${patientName} (ID: ${currentPatientId})`;
          
          // Show notification on button if chat is closed
          if (!this.isOpen) {
            this.showPatientNotification(patientName);
          }
          
          // Auto-refresh data if chat is open
          if (this.isOpen) {
            this.refreshPatientData();
            // Auto-load full history for the new patient
            setTimeout(() => {
              this.loadFullPatientHistory(true); // true = autoLoad
            }, 500);
          }
        } else {
          this.patientStatus.textContent = 'No patient selected';
        }
      }
      
      // Detect if episode changed
      if (currentEpisodeId !== lastEpisodeId) {
        lastEpisodeId = currentEpisodeId;
        if (currentEpisodeId && this.isOpen) {
          console.log('[AI Chat] Dashboard episode changed:', currentEpisodeId);
          // Refresh data to get episode-specific details (diagnoses, medications, notes)
          // Use a small delay to let window.currentEpisodeIncluded be set
          setTimeout(() => {
            this.addMessage('assistant', '📋 **Episode selected** - Refreshing data...');
            this.refreshPatientData();
          }, 500);
        }
      }
    }, 2000);
  }

  showPatientNotification(patientName) {
    // Add a subtle indicator that new patient data is available
    const btn = this.chatButton;
    if (btn) {
      const existing = btn.querySelector('.hmh-ai-patient-badge');
      if (existing) existing.remove();
      
      const badge = document.createElement('div');
      badge.className = 'hmh-ai-patient-badge';
      badge.textContent = patientName.split(' ')[0]; // First name only
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        left: -8px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        white-space: nowrap;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        animation: hmhBadgePop 0.3s ease;
      `;
      btn.appendChild(badge);
      
      // Remove badge after 5 seconds
      setTimeout(() => badge.remove(), 5000);
    }
  }
}

/**
 * Patient Data Collector - Uses Vinavi API to extract patient information
 * Enhanced version that follows aasandha extension's API patterns
 */
class PatientDataCollector {
  constructor() {
    this.baseUrl = 'https://vinavi.aasandha.mv/api';
    this.cache = {
      patient: null,
      episode: null,
      caseHistory: null,
      lastFetch: null
    };
    
    // DOM selectors as fallback
    this.selectors = {
      patientId: ['[data-patient-id]', '#patient-id', '.patient-id', 'input[name="patient_id"]'],
      patientName: ['[data-patient-name]', '#patient-name', '.patient-name'],
      episodeId: ['[data-episode-id]', '#episode-id', '.episode-id']
    };
  }

  /**
   * Main collection method - tries dashboard data, then API, falls back to DOM scraping
   */
  async collectFromPage() {
    console.log('[PatientDataCollector] Starting data collection...');
    
    // PRIORITY 1: Try to use dashboard cached data directly
    const dashboardData = this.collectFromDashboard();
    if (dashboardData && dashboardData.id) {
      console.log('[PatientDataCollector] Using dashboard data directly');
      
      // Optionally enrich with API call for more details
      try {
        const enrichedData = await this.enrichWithAPI(dashboardData);
        return enrichedData;
      } catch (e) {
        console.log('[PatientDataCollector] Could not enrich with API, using dashboard data as-is');
        return dashboardData;
      }
    }
    
    // PRIORITY 2: Try to extract IDs from URL or page
    const ids = this.extractIdsFromContext();
    
    if (!ids.patientId && !ids.episodeId) {
      console.log('[PatientDataCollector] No patient/episode ID found, trying DOM scrape');
      return this.collectFromDOM();
    }

    try {
      // Fetch patient data via API
      const patientData = await this.fetchPatientDataFromAPI(ids);
      console.log('[PatientDataCollector] API data collected:', patientData);
      return patientData;
    } catch (error) {
      console.error('[PatientDataCollector] API fetch failed, falling back to DOM:', error);
      return this.collectFromDOM();
    }
  }

  /**
   * Extract patient/episode IDs from URL or page context
   */
  extractIdsFromContext() {
    const url = window.location.href;
    const ids = {
      patientId: null,
      episodeId: null,
      nationalId: null
    };

    // PRIORITY 1: Check dashboard global variables (extension dashboard page)
    if (window.currentPatient) {
      ids.patientId = window.currentPatient.id;
      console.log('[PatientDataCollector] Found currentPatient from dashboard:', ids.patientId);
    }
    if (window.currentEpisode) {
      ids.episodeId = window.currentEpisode.id;
      console.log('[PatientDataCollector] Found currentEpisode from dashboard:', ids.episodeId);
    }

    // If we got IDs from dashboard, return early
    if (ids.patientId || ids.episodeId) {
      console.log('[PatientDataCollector] Using dashboard context:', ids);
      return ids;
    }

    // PRIORITY 2: Pattern matching in URL
    // Pattern: /patients/{id}
    const patientMatch = url.match(/patients\/(\d+)/i);
    if (patientMatch) ids.patientId = patientMatch[1];

    // Pattern: /episodes/{id}
    const episodeMatch = url.match(/episodes\/(\d+)/i);
    if (episodeMatch) ids.episodeId = episodeMatch[1];

    // Pattern: ?patient_id=xxx or ?episode_id=xxx
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('patient_id')) ids.patientId = urlParams.get('patient_id');
    if (urlParams.get('episode_id')) ids.episodeId = urlParams.get('episode_id');
    if (urlParams.get('nationalId')) ids.nationalId = urlParams.get('nationalId');

    // PRIORITY 3: Try to find IDs in page state (Vue/React apps often store in data attributes)
    const pageData = this.extractPageState();
    if (pageData) {
      ids.patientId = ids.patientId || pageData.patientId;
      ids.episodeId = ids.episodeId || pageData.episodeId;
    }

    console.log('[PatientDataCollector] Extracted IDs:', ids);
    return ids;
  }

  /**
   * Try to extract state from Vue/React page components
   */
  extractPageState() {
    // Look for Vue app data
    const vueApp = document.querySelector('[data-v-app]') || document.querySelector('#app');
    if (vueApp && vueApp.__vue__) {
      const state = vueApp.__vue__.$data || vueApp.__vue__._data;
      if (state) {
        return {
          patientId: state.patientId || state.patient?.id,
          episodeId: state.episodeId || state.episode?.id
        };
      }
    }

    // Look for data attributes
    const patientEl = document.querySelector('[data-patient-id]');
    const episodeEl = document.querySelector('[data-episode-id]');
    
    return {
      patientId: patientEl?.dataset.patientId,
      episodeId: episodeEl?.dataset.episodeId
    };
  }

  /**
   * Fetch patient data from Vinavi API
   */
  async fetchPatientDataFromAPI(ids) {
    const patientData = {
      id: ids.patientId,
      episodeId: ids.episodeId,
      name: null,
      nationalId: null,
      age: null,
      gender: null,
      dateOfBirth: null,
      address: null,
      conditions: [],
      diagnoses: [],
      medications: [],
      allergies: [],
      labTests: [],
      vitals: {},
      visits: [],
      complaints: [],
      medicalAdvice: [],
      collectedAt: new Date().toISOString(),
      source: 'api'
    };

    // Fetch episode details (includes most data we need)
    if (ids.episodeId) {
      const episodeData = await this.fetchEpisodeDetails(ids.episodeId);
      if (episodeData) {
        this.mergeEpisodeData(patientData, episodeData);
      }
    }

    // Fetch patient details if we have patient ID
    if (ids.patientId) {
      const details = await this.fetchPatientDetails(ids.patientId);
      if (details) {
        patientData.name = details.name_en || details.name_dv || details.name;
        patientData.nationalId = details.national_id || details.nationalId;
        patientData.dateOfBirth = details.dob || details.date_of_birth;
        patientData.gender = details.gender;
        patientData.age = this.calculateAge(patientData.dateOfBirth);
        patientData.address = this.formatAddress(details.address);
      }

      // Fetch case history for past visits
      const caseHistory = await this.fetchCaseHistory(ids.patientId);
      if (caseHistory) {
        patientData.visits = caseHistory;
      }
    }

    return patientData;
  }

  /**
   * Fetch patient details by ID
   */
  async fetchPatientDetails(patientId) {
    if (!patientId) return null;
    try {
      const response = await fetch(
        `${this.baseUrl}/patients/${patientId}?include=address.island.atoll`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      // Don't spam console for expected failures
      if (patientId) console.warn('[PatientDataCollector] fetchPatientDetails failed:', error.message);
      return null;
    }
  }

  /**
   * Fetch full episode details with all includes (comprehensive Aasandha API)
   * This provides complete patient episode data for AI analysis
   */
  async fetchEpisodeDetails(episodeId) {
    try {
      // Use comprehensive include params - same as provided API endpoint
      const includes = [
        'patient',
        'doctor.specialities',
        'prescriptions.medicines.preferred-medicine',
        'prescriptions.medicines.preferred-medicine.category',
        'prescriptions.medicines.preferred-medicine.medicine-extras',
        'prescriptions.medicines.preferred-medicine.generic-medicine',
        'prescriptions.consumables.preferred-consumable',
        'prescriptions.professional',
        'prescriptions.medicines.prescription_extras',
        'requested-services.service.service-professions',
        'requested-services.professional',
        'requested-services.documents',
        'diagnoses.icd-code',
        'diagnoses.professional',
        'vitals',
        'vitals.professional',
        'notes.professional',
        'admission',
        'requested-admission',
        'eev-referrals',
        'current-eev-referral',
        'service-provider'
      ].join(',');

      const response = await fetch(
        `${this.baseUrl}/episodes/${episodeId}?include=${includes}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('[PatientDataCollector] fetchEpisodeDetails error:', error);
      return null;
    }
  }

  /**
   * Fetch patient case history (past visits) with full episode details
   */
  async fetchCaseHistory(patientId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/patients/${patientId}/patient-cases?include=last-episode.diagnoses.icd-code,doctor.specialities`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      const cases = data.data || data;
      const included = data.included || [];
      
      // Build lookup for ICD codes
      const icdLookup = {};
      included.filter(i => i.type === 'icd-codes').forEach(icd => {
        icdLookup[icd.id] = {
          code: icd.attributes?.code,
          name: icd.attributes?.name || icd.attributes?.description
        };
      });
      
      return Array.isArray(cases) ? cases.map(c => {
        const attrs = c.attributes || c;
        const lastEpisode = c.relationships?.['last-episode']?.data;
        const episodeInc = included.find(i => i.type === 'episodes' && i.id === lastEpisode?.id);
        const episodeAttrs = episodeInc?.attributes || {};
        
        // Extract diagnoses from this episode
        const diagRels = episodeInc?.relationships?.diagnoses?.data || [];
        const diagnoses = diagRels.map(diagRef => {
          const diagInc = included.find(i => i.type === 'diagnoses' && i.id === diagRef.id);
          const icdRef = diagInc?.relationships?.['icd-code']?.data;
          const icd = icdLookup[icdRef?.id] || {};
          return {
            code: icd.code || diagInc?.attributes?.code,
            name: icd.name || diagInc?.attributes?.name || diagInc?.attributes?.description
          };
        }).filter(d => d.code || d.name);
        
        return {
          id: c.id,
          episodeId: lastEpisode?.id,
          date: attrs.created_at || episodeAttrs.created_at,
          doctor: attrs.doctor?.name_en || attrs.doctor?.name,
          diagnoses: diagnoses,
          diagnosis: diagnoses[0]?.name || episodeAttrs.diagnosis,
          status: attrs.status || episodeAttrs.status
        };
      }) : [];
    } catch (error) {
      console.error('[PatientDataCollector] fetchCaseHistory error:', error);
      return [];
    }
  }
  
  /**
   * Fetch all patient episodes to get complete history
   */
  async fetchAllPatientEpisodes(patientId) {
    if (!patientId) return [];
    
    try {
      // PRIORITY 1: Use dashboard cached cases if available
      const dashboardCases = window.currentCases || [];
      const dashboardIncluded = window.currentIncluded || [];
      
      if (dashboardCases.length > 0) {
        console.log('[PatientDataCollector] Using dashboard cached cases:', dashboardCases.length);
        return this.extractEpisodesFromDashboardCases(dashboardCases, dashboardIncluded);
      }
      
      // PRIORITY 2: Try API call (may fail from extension context)
      const response = await fetch(
        `${this.baseUrl}/patients/${patientId}/episodes?include=diagnoses.icd-code,notes&sort=-created_at&page[size]=20`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      const episodes = data.data || [];
      const included = data.included || [];
      
      // Build lookup for ICD codes
      const icdLookup = {};
      included.filter(i => i.type === 'icd-codes').forEach(icd => {
        icdLookup[icd.id] = {
          code: icd.attributes?.code,
          name: icd.attributes?.name || icd.attributes?.description
        };
      });
      
      // Process each episode
      return episodes.map(ep => {
        const attrs = ep.attributes || {};
        
        // Get diagnoses
        const diagRels = ep.relationships?.diagnoses?.data || [];
        const diagnoses = diagRels.map(diagRef => {
          const diagInc = included.find(i => i.type === 'diagnoses' && i.id === diagRef.id);
          const icdRef = diagInc?.relationships?.['icd-code']?.data;
          const icd = icdLookup[icdRef?.id] || {};
          return {
            code: icd.code || diagInc?.attributes?.code,
            name: icd.name || diagInc?.attributes?.name || diagInc?.attributes?.description
          };
        }).filter(d => d.code || d.name);
        
        // Get notes (complaints)
        const noteRels = ep.relationships?.notes?.data || [];
        const complaints = [];
        noteRels.forEach(noteRef => {
          const noteInc = included.find(i => (i.type === 'notes' || i.type === 'episode-notes') && i.id === noteRef.id);
          if (noteInc) {
            const noteAttrs = noteInc.attributes || {};
            if (noteAttrs.note_type === 'complains' || noteAttrs.type === 'complains') {
              complaints.push(noteAttrs.notes || noteAttrs.content);
            }
          }
        });
        
        return {
          id: ep.id,
          date: attrs.created_at,
          status: attrs.status,
          diagnoses: diagnoses,
          complaints: complaints.filter(Boolean)
        };
      });
    } catch (error) {
      // Only warn if patientId was provided - otherwise expected
      if (patientId) console.warn('[PatientDataCollector] fetchAllPatientEpisodes failed:', error.message);
      return [];
    }
  }
  
  /**
   * Extract episodes from dashboard cached cases (no API needed)
   */
  extractEpisodesFromDashboardCases(cases, included) {
    const episodes = [];
    
    for (const caseItem of cases) {
      const episodeRef = caseItem.relationships?.['last-episode']?.data;
      const episodeId = episodeRef?.id;
      
      // Find the episode in included data
      const episodeData = included.find(i => i.id === episodeId && i.type === 'episodes');
      if (!episodeData) continue;
      
      const attrs = episodeData.attributes || {};
      const rels = episodeData.relationships || {};
      
      // Get diagnoses from episode relationships
      const diagRefs = rels['diagnoses']?.data || [];
      const diagnoses = [];
      
      (Array.isArray(diagRefs) ? diagRefs : [diagRefs]).forEach(diagRef => {
        if (!diagRef?.id) return;
        const diagInc = included.find(i => i.id === diagRef.id && i.type === 'diagnoses');
        if (diagInc) {
          const icdRef = diagInc.relationships?.['icd-code']?.data;
          const icdInc = icdRef ? included.find(i => i.id === icdRef.id && i.type === 'icd-codes') : null;
          diagnoses.push({
            code: icdInc?.attributes?.code || '',
            name: icdInc?.attributes?.name || diagInc.attributes?.name || ''
          });
        }
      });
      
      // Get notes (complaints) from episode relationships
      const noteRefs = rels['notes']?.data || [];
      const complaints = [];
      
      (Array.isArray(noteRefs) ? noteRefs : [noteRefs]).forEach(noteRef => {
        if (!noteRef?.id) return;
        const noteInc = included.find(i => i.id === noteRef.id && (i.type === 'notes' || i.type === 'episode-notes'));
        if (noteInc) {
          const noteAttrs = noteInc.attributes || {};
          if (noteAttrs.note_type === 'complains' || noteAttrs.type === 'complains') {
            complaints.push(noteAttrs.notes || noteAttrs.content);
          }
        }
      });
      
      episodes.push({
        id: episodeId,
        date: attrs.created_at,
        status: attrs.status,
        diagnoses: diagnoses,
        complaints: complaints.filter(Boolean)
      });
    }
    
    console.log('[PatientDataCollector] Extracted', episodes.length, 'episodes from dashboard cache');
    return episodes;
  }

  /**
   * Merge episode data into patient data structure
   */
  mergeEpisodeData(patientData, episode) {
    // Extract patient info from episode
    if (episode.patient) {
      patientData.id = patientData.id || episode.patient.id;
      patientData.name = episode.patient.name_en || episode.patient.name;
      patientData.nationalId = episode.patient.national_id;
      patientData.dateOfBirth = episode.patient.dob;
      patientData.gender = episode.patient.gender;
      patientData.age = this.calculateAge(patientData.dateOfBirth);
    }

    // Extract diagnoses with ICD codes
    if (episode.diagnoses && Array.isArray(episode.diagnoses)) {
      patientData.diagnoses = episode.diagnoses.map(d => ({
        id: d.id,
        code: d.icd_code?.code || d['icd-code']?.code,
        name: d.icd_code?.description || d['icd-code']?.description || d.description,
        type: d.diagnosis_type,
        isPrimary: d.is_primary
      }));
      patientData.conditions = patientData.diagnoses.map(d => d.name).filter(Boolean);
    }

    // Extract prescriptions/medications
    if (episode.prescriptions && Array.isArray(episode.prescriptions)) {
      episode.prescriptions.forEach(rx => {
        if (rx.medicines && Array.isArray(rx.medicines)) {
          rx.medicines.forEach(med => {
            patientData.medications.push({
              id: med.id,
              name: med.medicine?.name || med.name,
              dose: med.dose,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions,
              quantity: med.quantity
            });
          });
        }
      });
    }

    // Extract notes (complaints, advice, examination)
    if (episode.notes && Array.isArray(episode.notes)) {
      episode.notes.forEach(note => {
        const noteType = (note.note_type || note.type || '').toLowerCase();
        const content = note.note || note.content;
        const professional = note.professional?.name_en || note.professional?.name;

        if (noteType === 'complains' || noteType === 'complaint' || noteType === 'chief_complaint') {
          patientData.complaints.push({
            content: content,
            by: professional,
            date: note.created_at
          });
        } else if (noteType === 'advice' || noteType === 'medical_advice') {
          patientData.medicalAdvice.push({
            content: content,
            by: professional,
            date: note.created_at
          });
        }
      });
    }

    // Extract vitals
    if (episode.vitals && Array.isArray(episode.vitals)) {
      episode.vitals.forEach(v => {
        const vitalType = (v.vital_type || v.type || '').toLowerCase();
        patientData.vitals[vitalType] = {
          value: v.value,
          unit: v.unit,
          recordedAt: v.created_at
        };
      });
    }

    // Extract lab services/tests ordered
    if (episode.services && Array.isArray(episode.services)) {
      episode.services.forEach(s => {
        if (s.service?.department === 'Laboratory' || s.service?.type === 'lab') {
          patientData.labTests.push({
            id: s.id,
            name: s.service?.name || s.name,
            code: s.service?.code,
            status: s.status,
            result: s.result,
            orderedAt: s.created_at
          });
        }
      });
    }
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Format address from API response
   */
  formatAddress(address) {
    if (!address) return null;
    const parts = [];
    if (address.house) parts.push(address.house);
    if (address.road) parts.push(address.road);
    if (address.island?.name_en) parts.push(address.island.name_en);
    if (address.island?.atoll?.name_en) parts.push(address.island.atoll.name_en);
    return parts.join(', ') || null;
  }

  /**
   * Collect patient data directly from dashboard global variables
   */
  collectFromDashboard() {
    console.log('[PatientDataCollector] Checking dashboard globals...');
    
    if (!window.currentPatient) {
      console.log('[PatientDataCollector] No currentPatient in dashboard');
      return null;
    }

    const patient = window.currentPatient;
    const attrs = patient.attributes || {};
    const episode = window.currentEpisode;
    const cases = window.currentCases || [];
    
    // Use currentEpisodeIncluded for detailed episode data (set when episode is selected)
    // Fall back to currentIncluded if not available
    const included = window.currentEpisodeIncluded || window.currentIncluded || [];

    console.log('[PatientDataCollector] Using included data:', {
      episodeIncluded: !!window.currentEpisodeIncluded,
      includedCount: included.length,
      types: [...new Set(included.map(i => i.type))]
    });

    // Calculate age from DOB
    let age = null;
    const dob = attrs.birth_date || attrs.date_of_birth;
    if (dob) {
      try {
        const birth = new Date(dob);
        const today = new Date();
        age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      } catch (_) {}
    }

    const patientData = {
      id: patient.id,
      name: attrs.patient_name || attrs.name || null,
      nationalId: attrs.national_identification || attrs.national_id || null,
      age: age,
      gender: attrs.gender || null,
      dateOfBirth: dob || null,
      phone: attrs.mobile_number || attrs.phone || null,
      address: null,
      conditions: [],
      diagnoses: [],
      medications: [],
      allergies: [],
      labTests: [],
      vitals: {},
      visits: [],
      complaints: [],
      medicalAdvice: [],
      collectedAt: new Date().toISOString(),
      source: 'dashboard'
    };

    // Extract diagnoses from current episode if available
    if (episode) {
      patientData.episodeId = episode.id;
      
      // Get diagnoses - first try ICD codes directly, then from diagnoses relationships
      const icdCodes = included.filter(inc => inc.type === 'icd-codes');
      const diagIncludes = included.filter(inc => inc.type === 'diagnoses');
      
      console.log('[PatientDataCollector] Dashboard data - ICD codes:', icdCodes.length, 'Diagnoses:', diagIncludes.length);
      
      // First add ICD codes directly
      icdCodes.forEach(icd => {
        const icdAttrs = icd.attributes || {};
        const code = icdAttrs.code || '';
        const name = icdAttrs.name || icdAttrs.description || icdAttrs.title || '';
        patientData.diagnoses.push({
          id: icd.id,
          code: code,
          name: name,
          type: 'icd-code'
        });
      });
      
      // Then check diagnoses for any missed codes
      diagIncludes.forEach(diagData => {
        const diagAttrs = diagData.attributes || {};
        const icdCode = diagData.relationships?.['icd-code']?.data;
        const icdInc = included.find(i => i.type === 'icd-codes' && i.id === icdCode?.id);
        
        const code = icdInc?.attributes?.code || diagAttrs.code || '';
        const name = icdInc?.attributes?.name || icdInc?.attributes?.description || 
                     diagAttrs.name || diagAttrs.description || diagAttrs.diagnosis || '';
        
        // Only add if not already present
        if (code && !patientData.diagnoses.some(d => d.code === code)) {
          patientData.diagnoses.push({
            id: diagData.id,
            code: code,
            name: name,
            type: diagAttrs.type
          });
        }
      });

      // Get prescriptions/medications - check prescription-medicines in attributes
      const prescriptions = included.filter(inc => inc.type === 'prescriptions');
      prescriptions.forEach(rx => {
        const rxMeds = rx.attributes?.['prescription-medicines'] || [];
        rxMeds.forEach(med => {
          patientData.medications.push({
            id: med.id,
            name: med.name || med.preferred_medicine?.name,
            genericName: med.preferred_medicine?.generic_medicine?.name,
            dose: med.preferred_medicine?.strength,
            frequency: null,
            duration: null,
            instructions: med.instructions,
            preparation: med.preferred_medicine?.preparation
          });
        });
      });

      // Also check individual medicines in included
      const medicines = included.filter(inc => inc.type === 'medicines');
      medicines.forEach(med => {
        const medAttrs = med.attributes || {};
        // Avoid duplicates
        if (!patientData.medications.some(m => m.name === medAttrs.name)) {
          patientData.medications.push({
            id: med.id,
            name: medAttrs.name,
            genericName: medAttrs.generic_medicine?.name,
            dose: medAttrs.strength,
            preparation: medAttrs.preparation
          });
        }
      });

      // Get notes (complaints, advice, clinical details) - check episode-notes type (as in aasandha)
      const notes = included.filter(inc => inc.type === 'notes' || inc.type === 'episode-notes');
      notes.forEach(note => {
        const noteAttrs = note.attributes || {};
        const noteType = (noteAttrs.note_type || noteAttrs.type || '').toLowerCase();
        const content = noteAttrs.notes || noteAttrs.content || noteAttrs.note;
        
        if (content) {
          if (noteType === 'complains' || noteType === 'complaints' || noteType === 'complaint' || noteType === 'chief_complaint') {
            patientData.complaints.push({
              content: content,
              date: noteAttrs.created_at
            });
          } else if (noteType === 'advice' || noteType === 'medical_advice') {
            patientData.medicalAdvice.push({
              content: content,
              date: noteAttrs.created_at
            });
          } else if (noteType === 'clinical-details' || noteType === 'clinical_details' || noteType === 'examination') {
            // Add clinical details to a new field
            if (!patientData.clinicalDetails) patientData.clinicalDetails = [];
            patientData.clinicalDetails.push({
              content: content,
              date: noteAttrs.created_at
            });
          }
        }
      });

      // Get vitals
      const vitals = included.filter(inc => inc.type === 'vitals');
      vitals.forEach(vital => {
        const vitalAttrs = vital.attributes || {};
        const vitalType = vitalAttrs.type || vitalAttrs.vital_type;
        const vitalValue = vitalAttrs.value || vitalAttrs.vital_value;
        if (vitalType && vitalValue) {
          patientData.vitals[vitalType] = vitalValue;
        }
      });

      // Get requested services (lab tests)
      const services = included.filter(inc => inc.type === 'requested-services');
      services.forEach(svc => {
        const svcAttrs = svc.attributes || {};
        const serviceRel = svc.relationships?.service?.data;
        const serviceInc = included.find(s => s.type === 'services' && s.id === serviceRel?.id);
        
        patientData.labTests.push({
          id: svc.id,
          name: serviceInc?.attributes?.name || svcAttrs.service_name,
          status: svcAttrs.status
        });
      });
    }

    // Count visits from cases
    patientData.visits = cases.map(c => ({
      id: c.id,
      date: c.attributes?.created_at,
      type: c.attributes?.case_type
    }));
    
    // Set total episodes count from cases
    patientData.totalEpisodes = cases.length;

    console.log('[PatientDataCollector] Dashboard data collected:', patientData);
    return patientData;
  }

  /**
   * Enrich dashboard data with additional API calls if needed
   */
  async enrichWithAPI(patientData) {
    // Always try to fetch patient history for complete picture
    const needsEnrichment = 
      patientData.complaints.length === 0 ||
      patientData.diagnoses.length === 0 ||
      patientData.medications.length === 0;

    // Try to fetch full patient history (all episodes)
    if (patientData.id) {
      try {
        console.log('[PatientDataCollector] Fetching complete patient history...');
        const allEpisodes = await this.fetchAllPatientEpisodes(patientData.id);
        
        if (allEpisodes && allEpisodes.length > 0) {
          // Initialize history arrays if not present
          patientData.episodeHistory = patientData.episodeHistory || [];
          patientData.previousDiagnoses = patientData.previousDiagnoses || [];
          
          allEpisodes.forEach((ep, index) => {
            // Skip current episode (first one if sorted by date)
            const isCurrentEpisode = ep.id === patientData.episodeId;
            
            if (!isCurrentEpisode) {
              // Store episode history
              patientData.episodeHistory.push({
                id: ep.id,
                date: ep.date,
                diagnoses: ep.diagnoses,
                complaints: ep.complaints
              });
              
              // Collect previous diagnoses (avoiding duplicates)
              ep.diagnoses.forEach(diag => {
                if (!patientData.previousDiagnoses.some(d => d.code === diag.code)) {
                  patientData.previousDiagnoses.push({
                    ...diag,
                    episodeDate: ep.date,
                    episodeId: ep.id
                  });
                }
              });
            } else {
              // Update current episode data if we got more info
              if (ep.complaints.length > 0 && patientData.complaints.length === 0) {
                patientData.complaints = ep.complaints.map(c => ({ content: c }));
              }
            }
          });
          
          console.log('[PatientDataCollector] Patient history loaded:', {
            episodes: allEpisodes.length,
            previousDiagnoses: patientData.previousDiagnoses.length
          });
        }
      } catch (e) {
        console.log('[PatientDataCollector] Could not fetch patient history:', e);
      }
    }

    // Try to fetch more details from current episode API if needed
    if (needsEnrichment && patientData.episodeId) {
      try {
        console.log('[PatientDataCollector] Fetching full episode details for enrichment...');
        const episodeData = await this.fetchEpisodeDetails(patientData.episodeId);
        if (episodeData && episodeData.included) {
          // Merge the API data into patientData
          this.mergeAPIEpisodeData(patientData, episodeData);
          patientData.source = 'dashboard+api';
        }
      } catch (e) {
        console.log('[PatientDataCollector] Could not enrich episode data:', e);
      }
    }

    return patientData;
  }

  /**
   * Merge full API episode response into patient data
   */
  mergeAPIEpisodeData(patientData, episodeData) {
    const included = episodeData.included || [];
    const episode = episodeData.data;

    console.log('[PatientDataCollector] Merging API data, included types:', 
      [...new Set(included.map(i => i.type))]);

    // Extract notes (complaints, advice) from episode-notes
    const notes = included.filter(inc => inc.type === 'episode-notes' || inc.type === 'notes');
    notes.forEach(note => {
      const noteAttrs = note.attributes || {};
      const noteType = noteAttrs.note_type || noteAttrs.type;
      const content = noteAttrs.notes || noteAttrs.content || noteAttrs.note;
      
      if (content) {
        if (noteType === 'complains' || noteType === 'complaint' || noteType === 'chief_complaint') {
          if (!patientData.complaints.some(c => c.content === content)) {
            patientData.complaints.push({ content, date: noteAttrs.created_at });
          }
        } else if (noteType === 'advice' || noteType === 'medical_advice') {
          if (!patientData.medicalAdvice.some(a => a.content === content)) {
            patientData.medicalAdvice.push({ content, date: noteAttrs.created_at });
          }
        }
      }
    });

    // Extract diagnoses
    const diagnoses = included.filter(inc => inc.type === 'diagnoses');
    const icdCodes = included.filter(inc => inc.type === 'icd-codes');
    
    console.log('[PatientDataCollector] Found diagnoses:', diagnoses.length, 'ICD codes:', icdCodes.length);
    
    if (patientData.diagnoses.length === 0) {
      // First try to get from ICD codes directly
      if (icdCodes.length > 0) {
        icdCodes.forEach(icd => {
          const icdAttrs = icd.attributes || {};
          patientData.diagnoses.push({
            id: icd.id,
            code: icdAttrs.code || '',
            name: icdAttrs.name || icdAttrs.description || icdAttrs.title || '',
            type: 'icd-code'
          });
        });
      }
      
      // Then add from diagnoses (avoiding duplicates)
      diagnoses.forEach(diag => {
        const diagAttrs = diag.attributes || {};
        const icdCodeRef = diag.relationships?.['icd-code']?.data;
        const icdCode = included.find(i => i.type === 'icd-codes' && i.id === icdCodeRef?.id);
        
        const code = icdCode?.attributes?.code || diagAttrs.code || '';
        const name = icdCode?.attributes?.name || icdCode?.attributes?.description || 
                     diagAttrs.name || diagAttrs.description || diagAttrs.diagnosis || '';
        
        // Only add if not already present (by code)
        if (!patientData.diagnoses.some(d => d.code === code)) {
          patientData.diagnoses.push({
            id: diag.id,
            code: code,
            name: name,
            type: diagAttrs.type
          });
        }
      });
    }

    // Extract medications from prescriptions
    const prescriptions = included.filter(inc => inc.type === 'prescriptions');
    if (patientData.medications.length === 0) {
      prescriptions.forEach(rx => {
        const rxMeds = rx.attributes?.['prescription-medicines'] || [];
        rxMeds.forEach(med => {
          patientData.medications.push({
            id: med.id,
            name: med.name || med.preferred_medicine?.name,
            genericName: med.preferred_medicine?.generic_medicine?.name,
            dose: med.preferred_medicine?.strength,
            instructions: med.instructions,
            preparation: med.preferred_medicine?.preparation
          });
        });
      });
    }

    // Extract vitals
    const vitals = included.filter(inc => inc.type === 'vitals');
    vitals.forEach(vital => {
      const vitalAttrs = vital.attributes || {};
      const vitalType = vitalAttrs.type || vitalAttrs.vital_type;
      const vitalValue = vitalAttrs.value || vitalAttrs.vital_value;
      if (vitalType && vitalValue && !patientData.vitals[vitalType]) {
        patientData.vitals[vitalType] = vitalValue;
      }
    });
  }

  /**
   * Fallback: Collect patient data from DOM when API is unavailable
   */
  collectFromDOM() {
    console.log('[PatientDataCollector] Falling back to DOM scraping...');
    
    const patientData = {
      id: null,
      name: null,
      age: null,
      gender: null,
      conditions: [],
      diagnoses: [],
      medications: [],
      allergies: [],
      labTests: [],
      vitals: {},
      visits: [],
      complaints: [],
      medicalAdvice: [],
      collectedAt: new Date().toISOString(),
      source: 'dom'
    };

    try {
      // Try to extract basic info from page
      patientData.id = this.findTextFromDOM(this.selectors.patientId);
      patientData.name = this.findTextFromDOM(this.selectors.patientName);

      // Look for specific sections in the page
      this.extractDiagnosesFromDOM(patientData);
      this.extractMedicationsFromDOM(patientData);
      this.extractVitalsFromDOM(patientData);
      this.extractNotesFromDOM(patientData);

      console.log('[PatientDataCollector] DOM data collected:', patientData);
    } catch (error) {
      console.error('[PatientDataCollector] DOM scraping error:', error);
    }

    return patientData;
  }

  findTextFromDOM(selectors) {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          return element.textContent?.trim() || element.value || element.dataset.value;
        }
      } catch (e) { /* skip invalid selector */ }
    }
    return null;
  }

  extractDiagnosesFromDOM(patientData) {
    const diagSelectors = [
      '.diagnosis-item', '.diagnosis', '[data-diagnosis]',
      '.icd-code', '.condition-item'
    ];
    
    diagSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const text = el.textContent?.trim();
        if (text && !patientData.conditions.includes(text)) {
          patientData.conditions.push(text);
          patientData.diagnoses.push({ name: text });
        }
      });
    });
  }

  extractMedicationsFromDOM(patientData) {
    const medSelectors = [
      '.medication-item', '.prescription-item', '.medicine-item',
      '[data-medication]', '.drug-item'
    ];
    
    medSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        patientData.medications.push({
          name: el.textContent?.trim()
        });
      });
    });
  }

  extractVitalsFromDOM(patientData) {
    const pageText = document.body.textContent || '';
    
    const patterns = {
      bloodPressure: /BP[:\s]*(\d+\/\d+)/i,
      pulse: /(?:Pulse|HR)[:\s]*(\d+)/i,
      temperature: /Temp[:\s]*([\d.]+)/i,
      spo2: /SpO2[:\s]*(\d+)/i,
      weight: /Weight[:\s]*([\d.]+)/i,
      height: /Height[:\s]*([\d.]+)/i
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = pageText.match(pattern);
      if (match) {
        patientData.vitals[key] = { value: match[1] };
      }
    });
  }

  extractNotesFromDOM(patientData) {
    // Look for complaints section
    const complaintHeaders = ['Complaints', 'Chief Complaint', 'Presenting Complaint'];
    complaintHeaders.forEach(header => {
      const el = this.findSectionContent(header);
      if (el) {
        patientData.complaints.push({ content: el });
      }
    });

    // Look for advice section
    const adviceHeaders = ['Advice', 'Medical Advice', 'Instructions'];
    adviceHeaders.forEach(header => {
      const el = this.findSectionContent(header);
      if (el) {
        patientData.medicalAdvice.push({ content: el });
      }
    });
  }

  findSectionContent(headerText) {
    // Try to find a header and get the content after it
    const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .section-title, label, th');
    for (const h of headers) {
      if (h.textContent?.toLowerCase().includes(headerText.toLowerCase())) {
        const next = h.nextElementSibling;
        if (next) return next.textContent?.trim();
      }
    }
    return null;
  }
}

// Initialize when DOM is ready with error handling
function initAIChatWidget() {
  try {
    // Check if we're on the extension dashboard page (not Vinavi website)
    // The widget should ONLY appear on our dashboard, not on Vinavi tabs
    const isExtensionDashboard = window.location.href.includes('chrome-extension://') || 
                                  window.location.href.includes('moz-extension://') ||
                                  document.getElementById('dashboard-container') !== null;
    
    if (!isExtensionDashboard) {
      console.log('[AI Chat Widget] Not on extension dashboard, skipping widget initialization');
      return;
    }
    
    // Check if PatientAI is available
    if (typeof PatientAI === 'undefined') {
      console.error('[AI Chat Widget] PatientAI class not found! Make sure patient-ai.js loads first.');
      return;
    }
    
    // Check if already initialized
    if (window.aiChatWidget) {
      console.log('[AI Chat Widget] Already initialized');
      return;
    }
    
    window.aiChatWidget = new AIChatWidget();
    console.log('[AI Chat Widget] Successfully created widget');
  } catch (error) {
    console.error('[AI Chat Widget] Failed to initialize:', error);
  }
}

// Multiple initialization strategies to ensure it loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAIChatWidget);
} else {
  // DOM already ready, initialize now
  initAIChatWidget();
}

// Also try after a short delay as backup
setTimeout(initAIChatWidget, 1000);

