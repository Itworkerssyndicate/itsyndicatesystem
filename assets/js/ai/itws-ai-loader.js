// assets/js/ai/itws-ai-loader.js
// ITWS AI - محمل المساعد الذكي مع واجهة المستخدم

import ITWSAICore from './itws-ai-core.js';

class ITWSAILoader {
    constructor() {
        this.aiCore = null;
        this.isOpen = false;
        this.currentConversation = null;
        this.userInfo = null;
        this.init();
    }

    async init() {
        try {
            // الحصول على المستخدم الحالي
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
            
            // تهيئة نواة المساعد
            this.aiCore = new ITWSAICore(currentUser);
            const initResult = await this.aiCore.initialize();
            
            if (initResult.success) {
                this.userInfo = initResult.userInfo;
                this.createChatButton();
                this.createChatWindow();
                this.loadStyles();
                console.log('✅ ITWS AI جاهز للعمل', initResult);
            } else {
                console.error('❌ فشل تهيئة ITWS AI:', initResult.error);
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل ITWS AI:', error);
            this.createFallbackButton();
        }
    }

    // ===== 1. تحميل التنسيقات =====
    loadStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* ===== زر المساعد ===== */
            .itws-ai-button {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                z-index: 9999;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 2px solid white;
                animation: ai-pulse 2s infinite;
            }

            .itws-ai-button:hover {
                transform: scale(1.1) rotate(360deg);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }

            .itws-ai-tooltip {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s;
                margin-bottom: 10px;
                font-family: 'Cairo', sans-serif;
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .itws-ai-button:hover .itws-ai-tooltip {
                opacity: 1;
                visibility: visible;
            }

            /* ===== نافذة المحادثة ===== */
            .itws-ai-chat {
                position: fixed;
                bottom: 100px;
                left: 20px;
                width: 380px;
                height: 550px;
                background: var(--bg-card, white);
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
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

            .itws-ai-chat.open {
                display: flex;
            }

            /* ===== رأس النافذة ===== */
            .itws-ai-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                overflow: hidden;
            }

            .itws-ai-header::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
                animation: ai-rotate 20s linear infinite;
            }

            .itws-ai-header h4 {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0;
                font-size: 16px;
                position: relative;
                z-index: 1;
            }

            .itws-ai-header h4 i {
                font-size: 20px;
                animation: ai-bounce 2s infinite;
            }

            .itws-ai-user-badge {
                background: rgba(255, 255, 255, 0.2);
                padding: 4px 12px;
                border-radius: 30px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                position: relative;
                z-index: 1;
                animation: ai-glow 2s infinite;
            }

            .itws-ai-user-badge i {
                font-size: 12px;
            }

            .itws-ai-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                position: relative;
                z-index: 1;
            }

            .itws-ai-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }

            /* ===== جسم النافذة ===== */
            .itws-ai-body {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: var(--bg-secondary, #f8f9fa);
            }

            /* ===== الرسائل ===== */
            .itws-ai-message {
                margin-bottom: 15px;
                display: flex;
                align-items: flex-start;
                gap: 10px;
                animation: ai-fade-in 0.3s ease;
            }

            .itws-ai-message.user {
                flex-direction: row-reverse;
            }

            .itws-ai-avatar {
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

            .itws-ai-message.ai .itws-ai-avatar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                animation: ai-float 3s infinite;
            }

            .itws-ai-message.user .itws-ai-avatar {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            .itws-ai-content {
                padding: 10px 15px;
                border-radius: 15px;
                max-width: 80%;
                word-wrap: break-word;
                font-size: 13px;
                line-height: 1.6;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            .itws-ai-message.ai .itws-ai-content {
                background: var(--bg-card, white);
                border: 1px solid var(--border-light, #e0e0e0);
                border-top-right-radius: 0;
                animation: ai-slide-right 0.3s ease;
            }

            .itws-ai-message.user .itws-ai-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-top-left-radius: 0;
                animation: ai-slide-left 0.3s ease;
            }

            /* ===== مؤشر الكتابة ===== */
            .itws-ai-typing {
                display: flex;
                gap: 5px;
                padding: 15px;
                background: var(--bg-card, white);
                border-radius: 20px;
                width: fit-content;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            .itws-ai-typing span {
                width: 8px;
                height: 8px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                animation: ai-typing 1s infinite ease-in-out;
            }

            .itws-ai-typing span:nth-child(2) { animation-delay: 0.2s; }
            .itws-ai-typing span:nth-child(3) { animation-delay: 0.4s; }

            /* ===== الاقتراحات ===== */
            .itws-ai-suggestions {
                padding: 10px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                border-top: 1px solid var(--border-light, #e0e0e0);
                background: var(--bg-secondary, #f8f9fa);
            }

            .itws-ai-suggestion {
                padding: 6px 12px;
                background: var(--bg-card, white);
                border: 1px solid #667eea;
                border-radius: 30px;
                font-size: 11px;
                cursor: pointer;
                color: #667eea;
                transition: all 0.3s;
                animation: ai-fade-in 0.5s ease;
            }

            .itws-ai-suggestion:hover {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                transform: scale(1.05);
                box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
            }

            /* ===== تذييل النافذة ===== */
            .itws-ai-footer {
                padding: 15px;
                border-top: 1px solid var(--border-light, #e0e0e0);
                background: var(--bg-card, white);
                display: flex;
                gap: 10px;
            }

            .itws-ai-footer input {
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

            .itws-ai-footer input:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .itws-ai-footer button {
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

            .itws-ai-footer button:hover {
                transform: scale(1.1) rotate(360deg);
            }

            /* ===== قدرات المساعد ===== */
            .itws-ai-capabilities {
                font-size: 11px;
                color: var(--text-muted, #666);
                margin-top: 8px;
                padding: 8px;
                background: rgba(102, 126, 234, 0.1);
                border-radius: 10px;
                line-height: 1.8;
            }

            /* ===== أنيميشنز ===== */
            @keyframes ai-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            @keyframes ai-float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
                100% { transform: translateY(0px); }
            }

            @keyframes ai-bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }

            @keyframes ai-rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @keyframes ai-glow {
                0% { box-shadow: 0 0 5px rgba(255,255,255,0.5); }
                50% { box-shadow: 0 0 15px rgba(255,255,255,0.8); }
                100% { box-shadow: 0 0 5px rgba(255,255,255,0.5); }
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

            @keyframes ai-slide-right {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes ai-slide-left {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
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

            /* ===== تصميم متجاوب ===== */
            @media (max-width: 768px) {
                .itws-ai-chat {
                    width: 320px;
                    height: 500px;
                    left: 10px;
                    bottom: 80px;
                }

                .itws-ai-button {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                    bottom: 15px;
                    left: 15px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== 2. إنشاء زر المساعد =====
    createChatButton() {
        const button = document.createElement('div');
        button.className = 'itws-ai-button';
        button.id = 'itwsAIButton';
        button.innerHTML = `
            <i class="fas fa-robot"></i>
            <span class="itws-ai-tooltip">ITWS AI - المساعد الذكي</span>
        `;
        button.onclick = () => this.toggleChat();
        document.body.appendChild(button);
    }

    // ===== 3. إنشاء نافذة المحادثة =====
    createChatWindow() {
        const chat = document.createElement('div');
        chat.className = 'itws-ai-chat';
        chat.id = 'itwsAIChat';
        
        chat.innerHTML = `
            <div class="itws-ai-header">
                <h4>
                    <i class="fas fa-robot"></i>
                    ITWS AI
                </h4>
                <div class="itws-ai-user-badge">
                    <i class="fas ${this.userInfo.icon}"></i>
                    ${this.userInfo.name}
                </div>
                <button class="itws-ai-close" onclick="document.getElementById('itwsAIChat').classList.remove('open')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="itws-ai-body" id="aiChatBody">
                <div class="itws-ai-message ai">
                    <div class="itws-ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="itws-ai-content">
                        <strong style="color: #667eea;">${this.userInfo.description}</strong>
                        <div class="itws-ai-capabilities">
                            <small>✨ يمكنني مساعدتك في:</small><br>
                            ${this.userInfo.capabilities.map(c => `• ${c}`).join('<br>')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="itws-ai-suggestions" id="aiSuggestions"></div>
            <div class="itws-ai-footer">
                <input type="text" id="aiMessageInput" placeholder="اكتب سؤالك..." onkeypress="if(event.key === 'Enter') aiInterface.sendMessage()">
                <button onclick="aiInterface.sendMessage()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(chat);
        this.updateSuggestions();
    }

    // ===== 4. تحديث الاقتراحات =====
    updateSuggestions() {
        const suggestions = this.aiCore.getSuggestionsForUser(this.userInfo);
        const container = document.getElementById('aiSuggestions');
        if (container) {
            container.innerHTML = suggestions.map(s => 
                `<span class="itws-ai-suggestion" onclick="aiInterface.sendSuggestion('${s}')">${s}</span>`
            ).join('');
        }
    }

    // ===== 5. تبديل إظهار/إخفاء النافذة =====
    toggleChat() {
        const chat = document.getElementById('itwsAIChat');
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            chat.classList.add('open');
            setTimeout(() => document.getElementById('aiMessageInput')?.focus(), 300);
        } else {
            chat.classList.remove('open');
        }
    }

    // ===== 6. إرسال رسالة =====
    async sendMessage() {
        const input = document.getElementById('aiMessageInput');
        const message = input.value.trim();
        
        if (!message) return;

        const chatBody = document.getElementById('aiChatBody');
        
        // إضافة رسالة المستخدم
        chatBody.innerHTML += `
            <div class="itws-ai-message user">
                <div class="itws-ai-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="itws-ai-content">
                    ${this.escapeHtml(message)}
                </div>
            </div>
        `;
        
        input.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        // إضافة مؤشر الكتابة
        const typingId = 'typing_' + Date.now();
        chatBody.innerHTML += `
            <div class="itws-ai-message ai" id="${typingId}">
                <div class="itws-ai-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="itws-ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            const response = await this.aiCore.processMessage(message, this.currentConversation);
            
            document.getElementById(typingId)?.remove();
            
            if (response.success) {
                this.currentConversation = response.conversationId;
                
                chatBody.innerHTML += `
                    <div class="itws-ai-message ai">
                        <div class="itws-ai-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="itws-ai-content">
                            ${this.formatResponse(response.message)}
                        </div>
                    </div>
                `;

                if (response.suggestions) {
                    this.updateSuggestions();
                }
            } else {
                chatBody.innerHTML += `
                    <div class="itws-ai-message ai">
                        <div class="itws-ai-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="itws-ai-content" style="color: #dc3545;">
                            ⚠️ ${this.escapeHtml(response.error)}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            document.getElementById(typingId)?.remove();
            chatBody.innerHTML += `
                <div class="itws-ai-message ai">
                    <div class="itws-ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="itws-ai-content" style="color: #dc3545;">
                        ⚠️ حدث خطأ. يرجى المحاولة مرة أخرى.
                    </div>
                </div>
            `;
        }

        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // ===== 7. إرسال اقتراح =====
    sendSuggestion(text) {
        document.getElementById('aiMessageInput').value = text;
        this.sendMessage();
    }

    // ===== 8. تنسيق الرد =====
    formatResponse(text) {
        let formatted = this.escapeHtml(text);
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/- (.*?)(?:\n|$)/g, '• $1<br>');
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }

    // ===== 9. تنظيف النص =====
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== 10. إنشاء زر احتياطي =====
    createFallbackButton() {
        const button = document.createElement('div');
        button.className = 'itws-ai-button';
        button.innerHTML = `
            <i class="fas fa-robot"></i>
            <span class="itws-ai-tooltip">ITWS AI - غير متاح</span>
        `;
        button.onclick = () => alert('ITWS AI غير متاح حالياً. يرجى المحاولة لاحقاً.');
        document.body.appendChild(button);
    }

    // ===== 11. الحصول على حالة المساعد =====
    getStatus() {
        return {
            isActive: this.aiCore?.isActive || false,
            userType: this.userInfo?.type || 'unknown',
            conversationCount: this.aiCore?.conversations.size || 0
        };
    }

    // ===== 12. إعادة تعيين المحادثة =====
    resetConversation() {
        this.currentConversation = null;
        const chatBody = document.getElementById('aiChatBody');
        if (chatBody) {
            chatBody.innerHTML = `
                <div class="itws-ai-message ai">
                    <div class="itws-ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="itws-ai-content">
                        <strong style="color: #667eea;">${this.userInfo.description}</strong>
                        <div class="itws-ai-capabilities">
                            <small>✨ يمكنني مساعدتك في:</small><br>
                            ${this.userInfo.capabilities.map(c => `• ${c}`).join('<br>')}
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// ===== إنشاء وتشغيل محمل المساعد =====
const aiInterface = new ITWSAILoader();

// ===== جعل الواجهة متاحة عالمياً =====
window.aiInterface = aiInterface;

export default aiInterface;
