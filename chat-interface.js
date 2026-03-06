// assets/js/chat-interface.js
// واجهة المحادثة مع ChatGPT

import ITWSAI from './itws-ai.js';

class ChatInterface {
    constructor(ai) {
        this.ai = ai;
        this.currentConversation = null;
        this.init();
    }

    init() {
        this.createChatButton();
        this.createChatWindow();
    }

    createChatButton() {
        const button = document.createElement('div');
        button.className = 'chatgpt-toggle';
        button.innerHTML = '<i class="fas fa-comment-dots"></i>';
        button.onclick = () => this.toggleChat();
        document.body.appendChild(button);

        // أضف التنسيقات
        const style = document.createElement('style');
        style.textContent = `
            .chatgpt-toggle {
                position: fixed;
                bottom: 100px;
                left: 20px;
                width: 60px;
                height: 60px;
                background: #10a37f;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 5px 20px rgba(16,163,127,0.3);
                z-index: 999;
                transition: all 0.3s;
            }
            
            .chatgpt-toggle:hover {
                transform: scale(1.1);
            }
            
            .chatgpt-window {
                position: fixed;
                bottom: 180px;
                left: 20px;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 1000;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            
            .chatgpt-header {
                background: #10a37f;
                color: white;
                padding: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .chatgpt-header h4 {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 0;
            }
            
            .chatgpt-body {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background: #f8f9fa;
            }
            
            .chatgpt-footer {
                padding: 15px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
                background: white;
            }
            
            .chatgpt-footer input {
                flex: 1;
                padding: 10px;
                border: 2px solid #e0e0e0;
                border-radius: 20px;
                outline: none;
                font-family: 'Cairo', sans-serif;
            }
            
            .chatgpt-footer input:focus {
                border-color: #10a37f;
            }
            
            .chatgpt-footer button {
                width: 40px;
                height: 40px;
                background: #10a37f;
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .chatgpt-footer button:hover {
                transform: scale(1.1);
            }
            
            .message {
                margin-bottom: 15px;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }
            
            .message.user {
                flex-direction: row-reverse;
            }
            
            .message .avatar {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
            }
            
            .message.ai .avatar {
                background: #10a37f;
            }
            
            .message.user .avatar {
                background: #667eea;
            }
            
            .message .content {
                padding: 10px 15px;
                border-radius: 15px;
                max-width: 80%;
                word-wrap: break-word;
            }
            
            .message.ai .content {
                background: white;
                border: 1px solid #e0e0e0;
            }
            
            .message.user .content {
                background: #667eea;
                color: white;
            }
            
            .typing {
                padding: 10px;
                color: #999;
                font-size: 14px;
            }
            
            .typing i {
                margin-left: 5px;
                animation: pulse 1s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }

    createChatWindow() {
        const window = document.createElement('div');
        window.className = 'chatgpt-window';
        window.id = 'chatgptWindow';
        window.innerHTML = `
            <div class="chatgpt-header">
                <h4>
                    <i class="fas fa-brain"></i>
                    ChatGPT - المساعد الذكي
                </h4>
                <button class="close-chat" onclick="document.getElementById('chatgptWindow').style.display='none'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chatgpt-body" id="chatMessages">
                <div class="message ai">
                    <div class="avatar"><i class="fas fa-robot"></i></div>
                    <div class="content">
                        مرحباً! أنا ChatGPT، المساعد الذكي لنظام النقابة.<br>
                        كيف يمكنني مساعدتك اليوم؟
                    </div>
                </div>
            </div>
            <div class="chatgpt-footer">
                <input type="text" id="chatInput" placeholder="اكتب سؤالك..." onkeypress="if(event.key === 'Enter') sendMessage()">
                <button onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;
        document.body.appendChild(window);

        // ربط الدوال
        window.sendMessage = () => this.sendMessage();
    }

    toggleChat() {
        const window = document.getElementById('chatgptWindow');
        window.style.display = window.style.display === 'none' ? 'flex' : 'none';
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        const messagesDiv = document.getElementById('chatMessages');
        
        // إضافة رسالة المستخدم
        messagesDiv.innerHTML += `
            <div class="message user">
                <div class="avatar"><i class="fas fa-user"></i></div>
                <div class="content">${this.escapeHtml(message)}</div>
            </div>
        `;
        
        input.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // إضافة مؤشر الكتابة
        const typingId = 'typing_' + Date.now();
        messagesDiv.innerHTML += `
            <div class="message ai" id="${typingId}">
                <div class="avatar"><i class="fas fa-robot"></i></div>
                <div class="content typing">
                    <i class="fas fa-circle"></i>
                    <i class="fas fa-circle"></i>
                    <i class="fas fa-circle"></i>
                </div>
            </div>
        `;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            // إرسال إلى AI
            const response = await this.ai.sendToChatGPT(message, this.currentConversation);
            
            // إزالة مؤشر الكتابة
            document.getElementById(typingId)?.remove();
            
            if (response.success) {
                this.currentConversation = response.conversationId;
                
                // إضافة رد AI
                messagesDiv.innerHTML += `
                    <div class="message ai">
                        <div class="avatar"><i class="fas fa-robot"></i></div>
                        <div class="content">${this.escapeHtml(response.message)}</div>
                    </div>
                `;
            } else {
                messagesDiv.innerHTML += `
                    <div class="message ai">
                        <div class="avatar"><i class="fas fa-robot"></i></div>
                        <div class="content" style="color: #dc3545;">
                            ⚠️ ${this.escapeHtml(response.error)}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            document.getElementById(typingId)?.remove();
            messagesDiv.innerHTML += `
                <div class="message ai">
                    <div class="avatar"><i class="fas fa-robot"></i></div>
                    <div class="content" style="color: #dc3545;">
                        ⚠️ حدث خطأ في الاتصال. تأكد من اتصالك بالإنترنت.
                    </div>
                </div>
            `;
        }

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default ChatInterface;
