// assets/js/security-core.js
// نواة الأمان الأساسية - يتم تحميلها في كل الصفحات

class SecurityCore {
    constructor() {
        this.init();
    }

    init() {
        this.preventRightClick();
        this.preventDevTools();
        this.preventKeyboardShortcuts();
        this.preventCopyPaste();
        this.addSecurityHeaders();
        this.detectInspect();
        this.preventScreenshot();
        this.addWatermark();
    }

    // منع الكليك اليمين
    preventRightClick() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showSecurityAlert('🚫 القائمة محجوزة للنظام');
            return false;
        });
    }

    // منع أدوات المطورين بشكل متقدم
    preventDevTools() {
        // منع F12 وجميع اختصارات أدوات المطورين
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'U') ||
                (e.ctrlKey && e.key === 'S') ||
                (e.ctrlKey && e.key === 'P')) {
                e.preventDefault();
                this.showSecurityAlert('🚫 هذه الميزة غير متاحة');
                return false;
            }
        });

        // كشف فتح أدوات المطورين
        let devToolsOpen = false;
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function() {
                devToolsOpen = true;
                document.body.innerHTML = `
                    <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f8d7da; color:#721c24; font-family: 'Cairo', sans-serif; padding:20px;">
                        <i class="fas fa-shield-alt" style="font-size:80px; margin-bottom:20px;"></i>
                        <h1 style="font-size:32px; margin-bottom:10px;">🚫 تم إغلاق النظام</h1>
                        <p style="font-size:18px;">لأسباب أمنية، تم إنهاء الجلسة</p>
                        <button onclick="location.reload()" style="margin-top:20px; padding:10px 30px; background:#721c24; color:white; border:none; border-radius:5px; font-size:16px; cursor:pointer;">إعادة تحميل الصفحة</button>
                    </div>
                `;
            }
        });
        
        setInterval(() => {
            console.log(element);
        }, 1000);
    }

    // منع اختصارات لوحة المفاتيح
    preventKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault();
                this.showSecurityAlert('🚫 اختصار غير مسموح');
                return false;
            }
            
            if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                this.showSecurityAlert('🚫 اختصار غير مسموح');
                return false;
            }
        });
    }

    // منع النسخ واللصق
    preventCopyPaste() {
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.showSecurityAlert('📋 النسخ غير مسموح');
        });

        document.addEventListener('cut', (e) => {
            e.preventDefault();
        });

        document.addEventListener('paste', (e) => {
            e.preventDefault();
            this.showSecurityAlert('📋 اللصق غير مسموح');
        });

        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
            return false;
        });

        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });
    }

    // منع تصوير الشاشة
    preventScreenshot() {
        document.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen' || e.key.includes('Print')) {
                this.showSecurityAlert('📸 التصوير غير مسموح');
                return false;
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'PrintScreen') {
                e.preventDefault();
                this.showSecurityAlert('📸 التصوير غير مسموح');
                return false;
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.showSecurityAlert('👀 تم تسجيل محاولة تصوير');
            }
        });
    }

    // إضافة علامة مائية ديناميكية
    addWatermark() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        const watermark = document.createElement('div');
        watermark.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            opacity: 0.1;
            font-size: 12px;
            color: #000;
            pointer-events: none;
            z-index: 9999;
            transform: rotate(-45deg);
            white-space: nowrap;
            user-select: none;
        `;
        watermark.textContent = `${currentUser.fullName || currentUser.username || 'زائر'} - ${new Date().toLocaleDateString('ar-EG')}`;
        document.body.appendChild(watermark);
    }

    // إضافة رؤوس أمان
    addSecurityHeaders() {
        let meta = document.createElement('meta');
        meta.httpEquiv = "Content-Security-Policy";
        meta.content = "default-src 'self'; script-src 'self' https://www.gstatic.com https://cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com;";
        document.head.appendChild(meta);

        meta = document.createElement('meta');
        meta.httpEquiv = "X-Frame-Options";
        meta.content = "DENY";
        document.head.appendChild(meta);

        meta = document.createElement('meta');
        meta.httpEquiv = "X-Content-Type-Options";
        meta.content = "nosniff";
        document.head.appendChild(meta);

        meta = document.createElement('meta');
        meta.httpEquiv = "Referrer-Policy";
        meta.content = "strict-origin-when-cross-origin";
        document.head.appendChild(meta);
    }

    // كشف محاولات الاختراق
    detectInspect() {
        let devToolsOpen = false;
        const threshold = 160;
        
        setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                if (!devToolsOpen) {
                    devToolsOpen = true;
                    this.showSecurityAlert('🚫 تم اكتشاف أدوات المطورين');
                }
            } else {
                devToolsOpen = false;
            }
        }, 1000);
    }

    // عرض رسالة أمان
    showSecurityAlert(message) {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #dc3545;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-family: 'Cairo', sans-serif;
            font-size: 14px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideDown 0.3s ease;
            direction: rtl;
        `;
        alert.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translate(-50%, -20px);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}

// إنشاء وتشغيل نظام الأمان تلقائياً
const securityCore = new SecurityCore();

export default SecurityCore;
