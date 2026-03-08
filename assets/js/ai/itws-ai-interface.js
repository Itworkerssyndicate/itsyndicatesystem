// assets/js/ai/itws-ai-interface.js
// ITWS AI - واجهة المستخدم المتقدمة مع تأثيرات بصرية

class ITWSAIInterface {
    constructor(aiCore) {
        this.aiCore = aiCore;
        this.isOpen = false;
        this.isMinimized = false;
        this.currentConversation = null;
        this.messageHistory = [];
        this.typingSpeed = 50; // ملي ثانية لكل حرف
        this.voiceEnabled = this.checkVoiceSupport();
        this.init();
    }

    // ===== 1. تهيئة الواجهة =====
    init() {
        this.createFloatingButton();
        this.createChatWindow();
        this.loadStyles();
        this.setupEventListeners();
    }

    // ===== 2. التحقق من دعم الصوت =====
    checkVoiceSupport() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    // ===== 3. تحميل التنسيقات =====
    loadStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* ===== زر المساعد العائم ===== */
            .ai-floating-button {
                position: fixed;
                bottom: 30px;
                left: 30px;
                width: 70px;
                height: 70px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 30px;
                cursor: pointer;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                z-index: 9999;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 3px solid white;
                animation: ai-float 3s infinite;
            }

            .ai-floating-button:hover {
                transform: scale(1.1) rotate(360deg);
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
            }

            .ai-floating-button .pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(102, 126, 234, 0.5);
                border-radius: 50%;
                animation: ai-pulse 2s infinite;
            }

            .ai-tooltip {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 13px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s;
                margin-bottom: 10px;
                font-family: 'Cairo', sans-serif;
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .ai-floating-button:hover .ai-tooltip {
                opacity: 1;
                visibility: visible;
            }

            /* ===== نافذة المحادثة الرئيسية ===== */
            .ai-chat-window {
                position: fixed;
                bottom: 120px;
                left: 30px;
                width: 400px;
                height: 600px;
                background: var(--bg-card, white);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                display: none;
                flex-direction: column;
                overflow: hidden;
                direction: rtl;
                font-family: 'Cairo', sans-serif;
                border: 2px solid transparent;
                background-image: linear-gradient(var(--bg-card, white), var(--bg-card, white)), 
                                linear-gradient(135deg, #667eea, #764ba2);
                background-origin: border-box;
                background-clip: padding-box, border-box;
                animation: ai-slide-up 0.3s ease;
            }

            .ai-chat-window.open {
                display: flex;
            }

            .ai-chat-window.minimized {
                height: 60px;
                overflow: hidden;
            }

            /* ===== رأس النافذة ===== */
            .ai-chat-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                overflow: hidden;
                cursor: pointer;
            }

            .ai-chat-header::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
                animation: ai-rotate 20s linear infinite;
            }

            .ai-header-info {
                display: flex;
                align-items: center;
                gap: 10px;
                position: relative;
                z-index: 1;
            }

            .ai-avatar {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                backdrop-filter: blur(5px);
                border: 2px solid rgba(255, 255, 255, 0.3);
                animation: ai-bounce 2s infinite;
            }

            .ai-title {
                display: flex;
                flex-direction: column;
            }

            .ai-title h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .ai-status {
                font-size: 11px;
                opacity: 0.9;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .ai-status-dot {
                width: 8px;
                height: 8px;
                background: #4caf50;
                border-radius: 50%;
                animation: ai-pulse 2s infinite;
            }

            .ai-header-actions {
                display: flex;
                align-items: center;
                gap: 10px;
                position: relative;
                z-index: 1;
            }

            .ai-header-btn {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .ai-header-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }

            /* ===== جسم النافذة ===== */
            .ai-chat-body {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: var(--bg-secondary, #f8f9fa);
                scroll-behavior: smooth;
            }

            /* ===== الرسائل ===== */
            .ai-message-wrapper {
                margin-bottom: 20px;
                animation: ai-fade-in 0.3s ease;
            }

            .ai-message {
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }

            .ai-message.user {
                flex-direction: row-reverse;
            }

            .ai-message-avatar {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
                font-size: 14px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }

            .ai-message.ai .ai-message-avatar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .ai-message.user .ai-message-avatar {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            .ai-message-content {
                padding: 12px 16px;
                border-radius: 15px;
                max-width: 80%;
                word-wrap: break-word;
                font-size: 13px;
                line-height: 1.6;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                position: relative;
            }

            .ai-message.ai .ai-message-content {
                background: var(--bg-card, white);
                border: 1px solid var(--border-light, #e0e0e0);
                border-top-right-radius: 0;
            }

            .ai-message.user .ai-message-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-top-left-radius: 0;
            }

            .ai-message-time {
                font-size: 10px;
                color: var(--text-muted, #999);
                margin-top: 5px;
                text-align: left;
            }

            .ai-message.user .ai-message-time {
                color: rgba(255, 255, 255, 0.7);
            }

            /* ===== مؤشر الكتابة ===== */
            .ai-typing-indicator {
                display: flex;
                gap: 5px;
                padding: 15px 20px;
                background: var(--bg-card, white);
                border-radius: 20px;
                width: fit-content;
                margin-bottom: 10px;
                border: 1px solid var(--border-light, #e0e0e0);
            }

            .ai-typing-dot {
                width: 8px;
                height: 8px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                animation: ai-typing 1s infinite ease-in-out;
            }

            .ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }

            /* ===== اقتراحات سريعة ===== */
            .ai-suggestions {
                padding: 15px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                border-top: 1px solid var(--border-light, #e0e0e0);
                background: var(--bg-secondary, #f8f9fa);
            }

            .ai-suggestion-chip {
                padding: 8px 15px;
                background: var(--bg-card, white);
                border: 1px solid #667eea;
                border-radius: 30px;
                font-size: 12px;
                cursor: pointer;
                color: #667eea;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 5px;
                animation: ai-fade-in 0.5s ease;
            }

            .ai-suggestion-chip:hover {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }

            .ai-suggestion-chip i {
                font-size: 12px;
            }

            /* ===== تذييل النافذة ===== */
            .ai-chat-footer {
                padding: 15px;
                border-top: 1px solid var(--border-light, #e0e0e0);
                background: var(--bg-card, white);
            }

            .ai-input-wrapper {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .ai-input-field {
                flex: 1;
                padding: 12px 15px;
                border: 2px solid var(--border-color, #e0e0e0);
                border-radius: 30px;
                outline: none;
                font-family: 'Cairo', sans-serif;
                font-size: 13px;
                transition: all 0.3s;
                background: var(--bg-primary, white);
                color: var(--text-primary, #333);
            }

            .ai-input-field:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .ai-input-field:disabled {
                background: var(--bg-tertiary, #f3f4f6);
                cursor: not-allowed;
            }

            .ai-input-actions {
                display: flex;
                gap: 5px;
            }

            .ai-input-btn {
                width: 45px;
                height: 45px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
            }

            .ai-input-btn:hover:not(:disabled) {
                transform: scale(1.1) rotate(360deg);
            }

            .ai-input-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .ai-input-btn.voice {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            /* ===== قدرات المساعد ===== */
            .ai-capabilities {
                background: rgba(102, 126, 234, 0.1);
                border-radius: 12px;
                padding: 12px;
                margin-bottom: 15px;
                border: 1px solid rgba(102, 126, 234, 0.2);
            }

            .ai-capabilities-title {
                font-size: 12px;
                color: #667eea;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .ai-capabilities-list {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }

            .ai-capability-item {
                background: white;
                padding: 4px 10px;
                border-radius: 15px;
                font-size: 11px;
                color: #667eea;
                border: 1px solid rgba(102, 126, 234, 0.3);
            }

            /* ===== أنيميشنز ===== */
            @keyframes ai-float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }

            @keyframes ai-pulse {
                0% { transform: scale(1); opacity: 0.5; }
                100% { transform: scale(1.5); opacity: 0; }
            }

            @keyframes ai-bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes ai-rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @keyframes ai-slide-up {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes ai-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes ai-typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }

            @keyframes ai-shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }

            /* ===== تصميم متجاوب ===== */
            @media (max-width: 768px) {
                .ai-chat-window {
                    width: 320px;
                    height: 500px;
                    left: 10px;
                    bottom: 100px;
                }

                .ai-floating-button {
                    width: 60px;
                    height: 60px;
                    font-size: 25px;
                    bottom: 20px;
                    left: 20px;
                }
            }

            /* ===== وضع عدم الاتصال ===== */
            .ai-offline {
                text-align: center;
                padding: 20px;
                color: #999;
            }

            .ai-offline i {
                font-size: 40px;
                margin-bottom: 10px;
                color: #ddd;
            }
        `;
        document.head.appendChild(style);
    }

    // ===== 4. إنشاء الزر العائم =====
    createFloatingButton() {
        const button = document.createElement('div');
        button.className = 'ai-floating-button';
        button.id = 'aiFloatingButton';
        button.innerHTML = `
            <div class="pulse"></div>
            <i class="fas fa-robot"></i>
            <span class="ai-tooltip">ITWS AI - المساعد الذكي</span>
        `;
        button.onclick = () => this.toggleChat();
        document.body.appendChild(button);
    }

    // ===== 5. إنشاء نافذة المحادثة =====
    createChatWindow() {
        const chat = document.createElement('div');
        chat.className = 'ai-chat-window';
        chat.id = 'aiChatWindow';
        
        const userInfo = this.aiCore.getUserInfo();
        
        chat.innerHTML = `
            <div class="ai-chat-header" onclick="aiInterface.toggleMinimize()">
                <div class="ai-header-info">
                    <div class="ai-avatar">
                        <i class="fas ${userInfo.icon}"></i>
                    </div>
                    <div class="ai-title">
                        <h4>ITWS AI</h4>
                        <div class="ai-status">
                            <span class="ai-status-dot"></span>
                            <span>${userInfo.name}</span>
                        </div>
                    </div>
                </div>
                <div class="ai-header-actions">
                    <button class="ai-header-btn" onclick="event.stopPropagation(); aiInterface.clearConversation()">
                        <i class="fas fa-redo-alt"></i>
                    </button>
                    <button class="ai-header-btn" onclick="event.stopPropagation(); aiInterface.toggleMinimize()">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="ai-header-btn" onclick="event.stopPropagation(); aiInterface.closeChat()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="ai-chat-body" id="aiChatBody">
                <div class="ai-message-wrapper">
                    <div class="ai-message ai">
                        <div class="ai-message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="ai-message-content">
                            <strong style="color: #667eea;">${userInfo.description}</strong>
                            <div class="ai-capabilities">
                                <div class="ai-capabilities-title">
                                    <i class="fas fa-bolt"></i>
                                    يمكنني مساعدتك في:
                                </div>
                                <div class="ai-capabilities-list">
                                    ${userInfo.capabilities.map(c => 
                                        `<span class="ai-capability-item">${c}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="ai-message-time">
                                ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ai-suggestions" id="aiSuggestions"></div>
            <div class="ai-chat-footer">
                <div class="ai-input-wrapper">
                    <input type="text" class="ai-input-field" id="aiMessageInput" 
                           placeholder="اكتب سؤالك..." 
                           onkeypress="if(event.key === 'Enter') aiInterface.sendMessage()">
                    <div class="ai-input-actions">
                        ${this.voiceEnabled ? `
                            <button class="ai-input-btn voice" onclick="aiInterface.startVoiceInput()" 
                                    title="إدخال صوتي">
                                <i class="fas fa-microphone"></i>
                            </button>
                        ` : ''}
                        <button class="ai-input-btn" onclick="aiInterface.sendMessage()" 
                                title="إرسال" id="aiSendButton">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(chat);
        this.updateSuggestions();
        this.setupVoiceRecognition();
    }

    // ===== 6. إعداد مستمعي الأحداث =====
    setupEventListeners() {
        // إغلاق النافذة بالضغط على ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });

        // منع الإغلاق عند الضغط داخل النافذة
        document.getElementById('aiChatWindow')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // ===== 7. إعداد التعرف على الصوت =====
    setupVoiceRecognition() {
        if (!this.voiceEnabled) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ar-SA';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            document.getElementById('aiMessageInput').value = text;
            this.sendMessage();
        };

        this.recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            this.showToast('❌ فشل التعرف على الصوت', 'error');
        };
    }

    // ===== 8. بدء الإدخال الصوتي =====
    startVoiceInput() {
        if (!this.voiceEnabled) {
            this.showToast('🎤 الإدخال الصوتي غير مدعوم في متصفحك', 'warning');
            return;
        }

        try {
            this.recognition.start();
            this.showToast('🎤 جاري الاستماع...', 'info');
        } catch (error) {
            console.error('Voice input error:', error);
        }
    }

    // ===== 9. تبديل إظهار/إخفاء النافذة =====
    toggleChat() {
        const chat = document.getElementById('aiChatWindow');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            chat.classList.add('open');
            chat.classList.remove('minimized');
            this.isMinimized = false;
            setTimeout(() => document.getElementById('aiMessageInput')?.focus(), 300);
        } else {
            chat.classList.remove('open');
        }
    }

    // ===== 10. تصغير/تكبير النافذة =====
    toggleMinimize() {
        const chat = document.getElementById('aiChatWindow');
        this.isMinimized = !this.isMinimized;
        
        if (this.isMinimized) {
            chat.classList.add('minimized');
        } else {
            chat.classList.remove('minimized');
        }
    }

    // ===== 11. إغلاق النافذة =====
    closeChat() {
        this.isOpen = false;
        this.isMinimized = false;
        document.getElementById('aiChatWindow').classList.remove('open', 'minimized');
    }

    // ===== 12. تحديث الاقتراحات =====
    updateSuggestions() {
        const suggestions = this.aiCore.getSuggestionsForUser(this.aiCore.getUserInfo());
        const container = document.getElementById('aiSuggestions');
        
        if (container) {
            container.innerHTML = suggestions.map(s => 
                `<span class="ai-suggestion-chip" onclick="aiInterface.sendSuggestion('${s}')">
                    <i class="fas fa-bolt"></i>
                    ${s}
                </span>`
            ).join('');
        }
    }

    // ===== 13. إرسال رسالة =====
    async sendMessage() {
        const input = document.getElementById('aiMessageInput');
        const message = input.value.trim();
        
        if (!message) return;

        const sendButton = document.getElementById('aiSendButton');
        sendButton.disabled = true;

        // إضافة رسالة المستخدم
        this.addMessage(message, 'user');
        input.value = '';

        // إظهار مؤشر الكتابة
        this.showTypingIndicator();

        try {
            const response = await this.aiCore.processMessage(message, this.currentConversation);
            
            // إخفاء مؤشر الكتابة
            this.hideTypingIndicator();
            
            if (response.success) {
                this.currentConversation = response.conversationId;
                
                // كتابة الرد حرفاً حرفاً
                await this.typeMessage(response.message, 'ai');

                if (response.suggestions) {
                    this.updateSuggestions();
                }
            } else {
                this.addMessage(response.error, 'ai', true);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('❌ حدث خطأ. يرجى المحاولة مرة أخرى.', 'ai', true);
        } finally {
            sendButton.disabled = false;
        }
    }

    // ===== 14. إضافة رسالة =====
    addMessage(text, sender, isError = false) {
        const chatBody = document.getElementById('aiChatBody');
        const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'ai-message-wrapper';
        messageWrapper.innerHTML = `
            <div class="ai-message ${sender}">
                <div class="ai-message-avatar">
                    <i class="fas ${sender === 'ai' ? 'fa-robot' : 'fa-user'}"></i>
                </div>
                <div class="ai-message-content" ${isError ? 'style="color: #dc3545;"' : ''}>
                    ${this.escapeHtml(text)}
                    <div class="ai-message-time">${time}</div>
                </div>
            </div>
        `;
        
        chatBody.appendChild(messageWrapper);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // ===== 15. كتابة رسالة حرفاً حرفاً =====
    async typeMessage(text, sender) {
        const chatBody = document.getElementById('aiChatBody');
        const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'ai-message-wrapper';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        messageDiv.innerHTML = `
            <div class="ai-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content" id="typingMessage"></div>
        `;
        
        messageWrapper.appendChild(messageDiv);
        chatBody.appendChild(messageWrapper);
        
        const contentDiv = document.getElementById('typingMessage');
        
        // كتابة النص حرفاً حرفاً
        for (let i = 0; i <= text.length; i++) {
            contentDiv.innerHTML = this.escapeHtml(text.substring(0, i)) + 
                                  (i < text.length ? '<span class="ai-typing-cursor">|</span>' : '') +
                                  `<div class="ai-message-time">${time}</div>`;
            await this.sleep(this.typingSpeed);
        }
        
        contentDiv.id = '';
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // ===== 16. إظهار مؤشر الكتابة =====
    showTypingIndicator() {
        const chatBody = document.getElementById('aiChatBody');
        
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.className = 'ai-message-wrapper';
        this.typingIndicator.id = 'typingIndicator';
        this.typingIndicator.innerHTML = `
            <div class="ai-message ai">
                <div class="ai-message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="ai-typing-indicator">
                    <span class="ai-typing-dot"></span>
                    <span class="ai-typing-dot"></span>
                    <span class="ai-typing-dot"></span>
                </div>
            </div>
        `;
        
        chatBody.appendChild(this.typingIndicator);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // ===== 17. إخفاء مؤشر الكتابة =====
    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // ===== 18. إرسال اقتراح =====
    sendSuggestion(text) {
        document.getElementById('aiMessageInput').value = text;
        this.sendMessage();
    }

    // ===== 19. مسح المحادثة =====
    clearConversation() {
        this.currentConversation = null;
        const chatBody = document.getElementById('aiChatBody');
        
        const userInfo = this.aiCore.getUserInfo();
        
        chatBody.innerHTML = `
            <div class="ai-message-wrapper">
                <div class="ai-message ai">
                    <div class="ai-message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="ai-message-content">
                        <strong style="color: #667eea;">${userInfo.description}</strong>
                        <div class="ai-capabilities">
                            <div class="ai-capabilities-title">
                                <i class="fas fa-bolt"></i>
                                يمكنني مساعدتك في:
                            </div>
                            <div class="ai-capabilities-list">
                                ${userInfo.capabilities.map(c => 
                                    `<span class="ai-capability-item">${c}</span>`
                                ).join('')}
                            </div>
                        </div>
                        <div class="ai-message-time">
                            ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showToast('✅ تم مسح المحادثة', 'success');
    }

    // ===== 20. إظهار رسالة منبثقة =====
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `ai-toast ${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
            color: white;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10001;
            animation: slideLeft 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideLeft 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== 21. تنظيف النص =====
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== 22. تأخير =====
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== 23. الحصول على حالة الواجهة =====
    getStatus() {
        return {
            isOpen: this.isOpen,
            isMinimized: this.isMinimized,
            voiceEnabled: this.voiceEnabled,
            messageCount: this.messageHistory.length
        };
    }
}

export default ITWSAIInterface;
