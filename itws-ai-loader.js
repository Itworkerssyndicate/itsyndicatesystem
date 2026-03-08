// assets/js/itws-ai-loader.js
// ITWS AI - محمل المساعد الذكي

import ITWSAIInterface from './itws-ai-interface.js';

class ITWSAILoader {
    constructor() {
        this.aiInterface = null;
        this.init();
    }

    init() {
        // انتظار تحميل الصفحة
        document.addEventListener('DOMContentLoaded', () => {
            this.loadAI();
        });
    }

    loadAI() {
        try {
            // الحصول على المستخدم الحالي
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            
            // تهيئة واجهة المساعد
            this.aiInterface = new ITWSAIInterface(currentUser);
            
            // جعله متاحاً عالمياً
            window.aiInterface = this.aiInterface;
            
            console.log('✅ ITWS AI loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load ITWS AI:', error);
            
            // إنشاء واجهة بديلة في حالة الفشل
            window.aiInterface = {
                toggleChat: function() {
                    alert('ITWS AI: جاري تحميل المساعد... يرجى المحاولة مرة أخرى');
                }
            };
        }
    }

    getAI() {
        return this.aiInterface;
    }
}

// إنشاء وتشغيل محمل المساعد
const aiLoader = new ITWSAILoader();

export default aiLoader;
