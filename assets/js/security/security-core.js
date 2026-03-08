// assets/js/security/security-core.js
// نواة الأمان الأساسية - تطبق أعلى معايير السيبر سيكيوريتي

class SecurityCore {
    constructor() {
        this.isSecure = true;
        this.blockedKeys = [
            'F12', 'PrintScreen', 'PrtScn', 'Print',
            'Tab', 'Escape', 'ContextMenu'
        ];
        this.devToolsOpen = false;
        this.sessionStart = Date.now();
        this.maxSessionTime = 30 * 60 * 1000; // 30 دقيقة
        this.inactivityTimeout = 15 * 60 * 1000; // 15 دقيقة
        this.lastActivity = Date.now();
        this.init();
    }

    init() {
        this.preventScreenshot();
        this.preventCopyPaste();
        this.preventDevTools();
        this.preventInspect();
        this.addWatermark();
        this.addSecurityHeaders();
        this.trackUserActivity();
        this.preventSessionHijacking();
        this.preventXSS();
        this.preventCSRF();
        this.secureLocalStorage();
        this.monitorNetworkRequests();
    }

    // ===== 1. منع التصوير بكل الطرق =====
    preventScreenshot() {
        // منع Print Screen
        document.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen' || e.key.includes('Print')) {
                this.blockAction('محاولة تصوير الشاشة');
                this.showSecurityAlert('📸 التصوير غير مسموح به');
                return false;
            }
        });

        // منع Alt + PrtScn
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'PrintScreen') {
                e.preventDefault();
                e.stopPropagation();
                this.blockAction('محاولة تصوير باستخدام Alt+PrtScn');
                this.showSecurityAlert('📸 التصوير غير مسموح');
                return false;
            }
        });

        // منع تسجيل الشاشة
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
            navigator.mediaDevices.getDisplayMedia = function() {
                SecurityCore.prototype.blockAction('محاولة تسجيل الشاشة');
                throw new Error('❌ تسجيل الشاشة غير مسموح');
            };
        }

        // كشف عند مغادرة التطبيق (قد يكون تصوير)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.logSecurityEvent('app_hidden', 'ربما محاولة تصوير');
            }
        });

        // حماية Canvas من التصوير
        this.protectCanvas();
    }

    protectCanvas() {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        const originalToBlob = HTMLCanvasElement.prototype.toBlob;

        HTMLCanvasElement.prototype.toDataURL = function() {
            SecurityCore.prototype.blockAction('محاولة تصوير Canvas');
            return originalToDataURL.call(this);
        };

        HTMLCanvasElement.prototype.toBlob = function() {
            SecurityCore.prototype.blockAction('محاولة تصوير Canvas');
            return originalToBlob.call(this);
        };
    }

    // ===== 2. منع النسخ واللصق والتحديد =====
    preventCopyPaste() {
        // منع النسخ
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.blockAction('محاولة نسخ');
            this.showSecurityAlert('📋 النسخ غير مسموح');
        });

        // منع القص
        document.addEventListener('cut', (e) => {
            e.preventDefault();
            this.blockAction('محاولة قص');
        });

        // منع اللصق
        document.addEventListener('paste', (e) => {
            e.preventDefault();
            this.blockAction('محاولة لصق');
            this.showSecurityAlert('📋 اللصق غير مسموح');
        });

        // منع تحديد النص
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
            return false;
        });

        // منع السحب
        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });

        // منع الإفلات
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            return false;
        });

        // منع قائمة اليمين
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.blockAction('محاولة فتح قائمة اليمين');
            this.showSecurityAlert('🛡️ القائمة محجوزة للنظام');
            return false;
        });

        // منع التحديد عبر CSS
        const style = document.createElement('style');
        style.textContent = `
            * {
                user-select: none !important;
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
            }
            input, textarea {
                user-select: text !important;
                -webkit-user-select: text !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ===== 3. منع أدوات المطورين =====
    preventDevTools() {
        // منع F12 وجميع اختصارات أدوات المطورين
        document.addEventListener('keydown', (e) => {
            // منع F12
            if (e.key === 'F12') {
                e.preventDefault();
                this.blockAction('محاولة فتح أدوات المطورين (F12)');
                this.showSecurityAlert('🔧 أدوات المطورين معطلة');
                return false;
            }

            // منع Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                this.blockAction('محاولة فتح أدوات المطورين (Ctrl+Shift+I)');
                return false;
            }

            // منع Ctrl+Shift+J
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                this.blockAction('محاولة فتح أدوات المطورين (Ctrl+Shift+J)');
                return false;
            }

            // منع Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.blockAction('محاولة فتح أدوات المطورين (Ctrl+Shift+C)');
                return false;
            }

            // منع Ctrl+U (عرض المصدر)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                this.blockAction('محاولة عرض المصدر (Ctrl+U)');
                this.showSecurityAlert('🔧 عرض المصدر غير مسموح');
                return false;
            }

            // منع Ctrl+S (حفظ الصفحة)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.blockAction('محاولة حفظ الصفحة (Ctrl+S)');
                return false;
            }

            // منع Ctrl+P (طباعة)
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.blockAction('محاولة طباعة (Ctrl+P)');
                this.showSecurityAlert('🖨️ استخدم زر الطباعة المخصص');
                return false;
            }

            // منع Ctrl+Shift+P (طباعة)
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                return false;
            }
        });

        // كشف فتح أدوات المطورين عبر تغيير الأبعاد
        setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;

            if (widthThreshold || heightThreshold) {
                if (!this.devToolsOpen) {
                    this.devToolsOpen = true;
                    this.blockAction('تم اكتشاف أدوات المطورين مفتوحة');
                    this.handleDevToolsOpen();
                }
            } else {
                this.devToolsOpen = false;
            }
        }, 1000);

        // كشف فتح أدوات المطورين عبر debugger
        setInterval(() => {
            const start = performance.now();
            debugger;
            const end = performance.now();
            
            if (end - start > 100) {
                this.blockAction('محاولة استخدام debugger');
                this.handleDevToolsOpen();
            }
        }, 1000);
    }

    handleDevToolsOpen() {
        // تسجيل المحاولة
        this.logSecurityEvent('dev_tools_opened', 'تم فتح أدوات المطورين');
        
        // إظهار رسالة تحذير
        this.showSecurityAlert('🚫 تم اكتشاف أدوات المطورين. سيتم إغلاق النظام.');
        
        // إنهاء الجلسة
        setTimeout(() => {
            this.terminateSession();
        }, 2000);
    }

    // ===== 4. منع فحص العناصر =====
    preventInspect() {
        // منع النقر باليمين على العناصر
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // تعطيل خاصية Inspect Element في المتصفح
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J')) {
                e.preventDefault();
                return false;
            }
        });
    }

    // ===== 5. إضافة علامة مائية ديناميكية =====
    addWatermark() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        const watermark = document.createElement('div');
        watermark.className = 'security-watermark';
        watermark.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            opacity: 0.15;
            font-size: 12px;
            color: var(--text-primary);
            pointer-events: none;
            z-index: 9999;
            transform: rotate(-45deg);
            white-space: nowrap;
            user-select: none;
            font-family: monospace;
        `;
        watermark.textContent = `${currentUser.fullName || currentUser.username || 'زائر'} | ${new Date().toLocaleDateString('ar-EG')} | ${window.location.hostname}`;
        document.body.appendChild(watermark);

        // تحديث العلامة المائية كل دقيقة
        setInterval(() => {
            watermark.textContent = `${currentUser.fullName || currentUser.username || 'زائر'} | ${new Date().toLocaleDateString('ar-EG')} | ${window.location.hostname}`;
        }, 60000);
    }

    // ===== 6. إضافة رؤوس أمان =====
    addSecurityHeaders() {
        // CSP (Content Security Policy)
        let meta = document.createElement('meta');
        meta.httpEquiv = "Content-Security-Policy";
        meta.content = `
            default-src 'self';
            script-src 'self' https://www.gstatic.com https://cdnjs.cloudflare.com 'unsafe-inline' 'unsafe-eval';
            style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline';
            font-src 'self' https://fonts.gstatic.com;
            img-src 'self' data: https: blob:;
            connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com;
            frame-src 'none';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
        `.replace(/\s+/g, ' ').trim();
        document.head.appendChild(meta);

        // X-Frame-Options (منع التضمين في iframe)
        meta = document.createElement('meta');
        meta.httpEquiv = "X-Frame-Options";
        meta.content = "DENY";
        document.head.appendChild(meta);

        // X-Content-Type-Options
        meta = document.createElement('meta');
        meta.httpEquiv = "X-Content-Type-Options";
        meta.content = "nosniff";
        document.head.appendChild(meta);

        // Referrer-Policy
        meta = document.createElement('meta');
        meta.httpEquiv = "Referrer-Policy";
        meta.content = "strict-origin-when-cross-origin";
        document.head.appendChild(meta);

        // Permissions-Policy
        meta = document.createElement('meta');
        meta.httpEquiv = "Permissions-Policy";
        meta.content = "geolocation=(self), microphone=(), camera=(), payment=(), usb=()";
        document.head.appendChild(meta);
    }

    // ===== 7. تتبع نشاط المستخدم =====
    trackUserActivity() {
        // تحديث آخر نشاط عند أي تفاعل
        ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            });
        });

        // مراقبة انتهاء الجلسة
        setInterval(() => {
            const now = Date.now();
            
            // التحقق من مدة الجلسة
            if (now - this.sessionStart > this.maxSessionTime) {
                this.blockAction('انتهت مدة الجلسة القصوى');
                this.terminateSession('انتهت مدة الجلسة، يرجى تسجيل الدخول مرة أخرى');
            }

            // التحقق من عدم النشاط
            if (now - this.lastActivity > this.inactivityTimeout) {
                this.blockAction('انتهت مدة عدم النشاط');
                this.terminateSession('انتهت مدة عدم النشاط، يرجى تسجيل الدخول مرة أخرى');
            }
        }, 60000); // كل دقيقة
    }

    // ===== 8. منع اختطاف الجلسة =====
    preventSessionHijacking() {
        // تخزين بصمة الجهاز
        const deviceFingerprint = this.generateDeviceFingerprint();
        sessionStorage.setItem('device_fingerprint', deviceFingerprint);

        // التحقق من بصمة الجهاز عند كل طلب
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const fingerprint = sessionStorage.getItem('device_fingerprint');
            if (fingerprint !== deviceFingerprint) {
                SecurityCore.prototype.blockAction('تغيير بصمة الجهاز');
                SecurityCore.prototype.terminateSession('تم اكتشاف نشاط مشبوه');
            }
            return originalFetch.apply(this, args);
        };
    }

    generateDeviceFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            navigator.platform,
            screen.colorDepth,
            screen.width,
            screen.height,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency,
            navigator.deviceMemory
        ];
        return btoa(components.join('|'));
    }

    // ===== 9. منع XSS =====
    preventXSS() {
        // تنظيف أي إدخال من المستخدم
        const sanitizeInput = (input) => {
            return input.replace(/[&<>"']/g, function(match) {
                const entities = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                };
                return entities[match];
            });
        };

        // تطبيق على جميع الإدخالات
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                e.target.value = sanitizeInput(e.target.value);
            }
        });

        // حماية innerHTML
        const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        Object.defineProperty(Element.prototype, 'innerHTML', {
            get: function() {
                return originalInnerHTML.get.call(this);
            },
            set: function(value) {
                const sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                return originalInnerHTML.set.call(this, sanitized);
            }
        });
    }

    // ===== 10. منع CSRF =====
    preventCSRF() {
        // توليد توكن CSRF
        const generateCSRFToken = () => {
            return btoa(Date.now() + Math.random().toString(36));
        };

        // تخزين التوكن في الجلسة
        const csrfToken = generateCSRFToken();
        sessionStorage.setItem('csrf_token', csrfToken);

        // إضافة التوكن لجميع طلبات POST
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (options.method && options.method.toUpperCase() === 'POST') {
                const token = sessionStorage.getItem('csrf_token');
                options.headers = {
                    ...options.headers,
                    'X-CSRF-Token': token
                };
            }
            return originalFetch.call(this, url, options);
        };
    }

    // ===== 11. تأمين التخزين المحلي =====
    secureLocalStorage() {
        // تشفير البيانات قبل التخزين
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            try {
                const encrypted = btoa(encodeURIComponent(value));
                originalSetItem.call(this, key, encrypted);
            } catch (e) {
                SecurityCore.prototype.blockAction('خطأ في تخزين البيانات');
            }
        };

        // فك تشفير البيانات عند القراءة
        const originalGetItem = localStorage.getItem;
        localStorage.getItem = function(key) {
            try {
                const value = originalGetItem.call(this, key);
                if (value) {
                    return decodeURIComponent(atob(value));
                }
                return null;
            } catch (e) {
                return null;
            }
        };

        // مسح التخزين عند إغلاق المتصفح
        window.addEventListener('beforeunload', () => {
            sessionStorage.clear();
        });
    }

    // ===== 12. مراقبة طلبات الشبكة =====
    monitorNetworkRequests() {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            
            // منع الوصول لمواقع غير مصرح بها
            const blockedDomains = ['hacker.com', 'evil.com', 'malware.com'];
            if (blockedDomains.some(domain => url.includes(domain))) {
                SecurityCore.prototype.blockAction('محاولة الوصول لموقع محظور');
                throw new Error('🚫 وصول ممنوع');
            }

            return originalFetch.apply(this, args);
        };
    }

    // ===== 13. إنهاء الجلسة =====
    terminateSession(message = 'تم إنهاء الجلسة لأسباب أمنية') {
        // تسجيل انتهاء الجلسة
        this.logSecurityEvent('session_terminated', message);

        // مسح البيانات
        sessionStorage.clear();
        localStorage.clear();

        // إظهار رسالة
        this.showSecurityAlert(`🔒 ${message}`);

        // إعادة التوجيه لصفحة تسجيل الدخول
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    // ===== 14. تسجيل الأحداث الأمنية =====
    logSecurityEvent(type, details) {
        const event = {
            type,
            details,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            fingerprint: this.generateDeviceFingerprint()
        };

        console.warn('🔒 Security Event:', event);

        // هنا سيتم إرسال الحدث للخادم لاحقاً
        // هذا مؤقتاً
        const events = JSON.parse(localStorage.getItem('security_events') || '[]');
        events.push(event);
        localStorage.setItem('security_events', JSON.stringify(events.slice(-50)));
    }

    // ===== 15. منع الإجراء =====
    blockAction(reason) {
        this.logSecurityEvent('blocked_action', reason);
    }

    // ===== 16. عرض رسالة أمان =====
    showSecurityAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'security-alert';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-family: 'Cairo', sans-serif;
            font-size: 14px;
            font-weight: 600;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
            animation: securityAlert 0.3s ease;
            direction: rtl;
            border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(5px);
        `;

        // إضافة الأنيميشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes securityAlert {
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

        alert.innerHTML = `<i class="fas fa-shield-alt"></i> ${message}`;
        document.body.appendChild(alert);

        setTimeout(() => {
            alert.style.animation = 'securityAlert 0.3s ease reverse';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }

    // ===== 17. التحقق من الصلاحية =====
    checkPermission(requiredRole) {
        const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        const roleHierarchy = {
            'guest': 0,
            'member': 50,
            'committee_head': 60,
            'branch_manager': 70,
            'vice_president': 90,
            'president': 100
        };

        return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    }

    // ===== 18. تنظيف الذاكرة =====
    cleanup() {
        // إزالة المستمعين
        // هذا سيتم تنفيذه عند الحاجة
    }
}

// تشغيل نظام الأمان فوراً
const securityCore = new SecurityCore();

// تصدير للاستخدام في ملفات أخرى
export default SecurityCore;
