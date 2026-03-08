// assets/js/ai-interface.js
// واجهة المستخدم للتفاعل مع المساعد التقني ITWS AI

import ITWSAIAssistant from './itws-ai-assistant.js';

class AIInterface {
    constructor(currentUser) {
        this.currentUser = currentUser;
        this.ai = new ITWSAIAssistant(currentUser);
        this.isOpen = false;
        this.currentConversation = null;
        this.init();
    }

    async init() {
        const result = await this.ai.initialize();
        if (result.success) {
            this.createChatButton();
            this.createChatWindow();
            console.log('✅ واجهة المساعد جاهزة', result);
        }
    }

    createChatButton() {
        const button = document.createElement('div');
        button.className = 'itws-ai-button';
        button.innerHTML = `
            <div class="ai-pulse"></div>
            <i class="fas fa-robot"></i>
        `;
        button.onclick = () => this.toggleChat();
        document.body.appendChild(button);

        // إضافة التنسيقات
        const style = document.createElement('style');
        style.textContent = `
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
                box-shadow: 0 5px 20px rgba(102,126,234,0.4);
                z-index: 9999;
                transition: all 0.3s;
                animation: aiFloat 3s ease-in-out infinite;
            }

            .itws-ai-button:hover {
                transform: scale(1.1);
                box-shadow: 0 8px 25px rgba(102,126,234,0.6);
            }

            .ai-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(102,126,234,0.5);
                border-radius: 50%;
                animation: aiPulse 2s ease-out infinite;
            }

            @keyframes aiPulse {
                0% {
                    transform: scale(1);
                    opacity: 0.5;
                }
                100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }

            @keyframes aiFloat {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }

            .itws-ai-chat {
                position: fixed;
                bottom: 100px;
                left: 20px;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 10000;
                display: none;
                flex-direction: column;
                overflow: hidden;
                direction: rtl;
                font-family: 'Cairo', sans-serif;
                border: 1px solid #667eea;
            }

            .itws-ai-chat.open {
                display: flex;
                animation: slideUp 0.3s ease;
            }

            .itws-ai-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .itws-ai-header h4 {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 0;
                font-size: 16px;
            }

            .itws-ai-header h4 i {
                font-size: 20px;
            }

            .itws-ai-status {
                font-size: 12px;
                background: rgba(255,255,255,0.2);
                padding: 4px 8px;
                border-radius: 20px;
            }

            .itws-ai-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .itws-ai-close:hover {
                transform: scale(1.2);
            }

            .itws-ai-body {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8f9fa;
            }

            .itws-ai-message {
                margin-bottom: 15px;
                display: flex;
                align-items: flex-start;
                gap: 10px;
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
            }

            .itws-ai-message.ai .itws-ai-avatar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .itws-ai-message.user .itws-ai-avatar {
                background: #ff6b6b;
            }

            .itws-ai-content {
                padding: 10px 15px;
                border-radius: 15px;
                max-width: 80%;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.5;
            }

            .itws-ai-message.ai .itws-ai-content {
                background: white;
                border: 1px solid #e0e0e0;
                border-top-right-radius: 0;
            }

            .itws-ai-message.user .itws-ai-content {
                background: #667eea;
                color: white;
                border-top-left-radius: 0;
            }

            .itws-ai-footer {
                padding: 15px;
                border-top: 1px solid #eee;
                background: white;
                display: flex;
                gap: 10px;
            }

            .itws-ai-footer input {
                flex: 1;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 25px;
                outline: none;
                font-family: 'Cairo', sans-serif;
                font-size: 14px;
                transition: all 0.3s;
            }

            .itws-ai-footer input:focus {
                border-color: #667eea;
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
            }

            .itws-ai-footer button:hover {
                transform: scale(1.1);
            }

            .itws-ai-typing {
                display: flex;
                gap: 5px;
                padding: 15px;
                background: white;
                border-radius: 15px;
                margin-bottom: 15px;
                width: fit-content;
            }

            .itws-ai-typing span {
                width: 8px;
                height: 8px;
                background: #667eea;
                border-radius: 50%;
                animation: typing 1s infinite ease-in-out;
            }

            .itws-ai-typing span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .itws-ai-typing span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                }
                30% {
                    transform: translateY(-10px);
                }
            }

            .itws-ai-suggestions {
                padding: 10px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .itws-ai-suggestion {
                padding: 5px 10px;
                background: #f0f2f5;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s;
                border: 1px solid #e0e0e0;
            }

            .itws-ai-suggestion:hover {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            .itws-ai-permission-badge {
                background: rgba(255,255,255,0.2);
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 11px;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    createChatWindow() {
        const chat = document.createElement('div');
        chat.className = 'itws-ai-chat';
        chat.id = 'itwsAIChat';
        
        const userPerms = this.ai.permissions[this.currentUser.role || this.currentUser.position];
        const commands = this.ai.getUserCommands();
        
        chat.innerHTML = `
            <div class="itws-ai-header">
                <h4>
                    <i class="fas fa-robot"></i>
                    ITWS AI - المساعد التقني
                </h4>
                <div class="itws-ai-status">
                    <i class="fas fa-circle" style="color: #4caf50; font-size: 8px;"></i>
                    متصل
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
                        مرحباً ${this.currentUser.fullName}! أنا ITWS AI المساعد التقني الذكي.<br>
                        <small style="color: #666;">مستوى الصلاحية: ${userPerms?.description || 'مستخدم'}</small>
                        <br><br>
                        <strong>الأوامر المتاحة لك:</strong>
                        <div class="itws-ai-suggestions">
                            ${commands.slice(0, 6).map(cmd => 
                                `<span class="itws-ai-suggestion" onclick="aiInterface.sendSuggestion('${cmd}')">${cmd}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="itws-ai-footer">
                <input type="text" id="aiMessageInput" placeholder="اكتب سؤالك أو طلبك..." onkeypress="if(event.key === 'Enter') aiInterface.sendMessage()">
                <button onclick="aiInterface.sendMessage()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(chat);
    }

    toggleChat() {
        const chat = document.getElementById('itwsAIChat');
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            chat.classList.add('open');
            document.getElementById('aiMessageInput').focus();
        } else {
            chat.classList.remove('open');
        }
    }

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
            // معالجة الرسالة مع المساعد
            const response = await this.ai.processMessage(message, this.currentConversation);
            
            // إزالة مؤشر الكتابة
            document.getElementById(typingId)?.remove();
            
            if (response.success) {
                this.currentConversation = response.conversationId;
                
                // إضافة رد المساعد
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
            } else {
                chatBody.innerHTML += `
                    <div class="itws-ai-message ai">
                        <div class="itws-ai-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="itws-ai-content" style="color: #dc3545;">
                            ⚠️ ${this.escapeHtml(response.error)}
                            ${response.suggestedCommands ? 
                                `<br><br><small>الأوامر المتاحة: ${response.suggestedCommands.join('، ')}</small>` : 
                                ''}
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
                        ⚠️ حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.
                    </div>
                </div>
            `;
        }

        chatBody.scrollTop = chatBody.scrollHeight;
    }

    sendSuggestion(command) {
        document.getElementById('aiMessageInput').value = command;
        this.sendMessage();
    }

    formatResponse(text) {
        // تحويل النص إلى HTML مع الحفاظ على التنسيق
        let formatted = this.escapeHtml(text);
        
        // تحويل العناوين
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // تحويل القوائم
        formatted = formatted.replace(/- (.*?)(?:\n|$)/g, '• $1<br>');
        
        // تحويل الأسطر الجديدة
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// جعل الواجهة متاحة عالمياً
window.aiInterface = null;

// تصدير الواجهة
export default AIInterface;
