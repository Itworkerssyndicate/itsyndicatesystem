// assets/js/security/security-loader.js
// محمل أنظمة الأمان - يدير تحميل وتفعيل جميع أنظمة الأمان

import SecurityCore from './security-core.js';
import BiometricAuth from './biometric-auth.js';
import TwoFactorAuth from './twofa.js';
import AnomalyDetection from './anomaly-detection.js';
import EncryptionManager from './encryption.js';

class SecurityLoader {
    constructor() {
        this.securityModules = new Map();
        this.loadingStatus = new Map();
        this.init();
    }

    async init() {
        console.log('🔒 جاري تحميل أنظمة الأمان...');
        this.showSecurityLoader();
        
        try {
            // تحميل أنظمة الأمان بالترتيب
            await this.loadCoreSecurity();
            await this.loadBiometricAuth();
            await this.loadTwoFactorAuth();
            await this.loadAnomalyDetection();
            await this.loadEncryption();
            
            this.verifyAllModules();
            this.setupSecurityMonitoring();
            
            console.log('✅ تم تحميل جميع أنظمة الأمان بنجاح');
            this.hideSecurityLoader();
            
        } catch (error) {
            console.error('❌ فشل تحميل بعض أنظمة الأمان:', error);
            this.handleSecurityError(error);
        }
    }

    // ===== 1. تحميل نواة الأمان =====
    async loadCoreSecurity() {
        try {
            this.securityModules.set('core', new SecurityCore());
            this.loadingStatus.set('core', 'loaded');
            console.log('✅ نواة الأمان: تم التحميل');
        } catch (error) {
            this.loadingStatus.set('core', 'failed');
            throw new Error('فشل تحميل نواة الأمان: ' + error.message);
        }
    }

    // ===== 2. تحميل نظام البصمة =====
    async loadBiometricAuth() {
        try {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            this.securityModules.set('biometric', new BiometricAuth(currentUser));
            this.loadingStatus.set('biometric', 'loaded');
            console.log('✅ نظام البصمة: تم التحميل');
        } catch (error) {
            this.loadingStatus.set('biometric', 'failed');
            console.warn('⚠️ نظام البصمة غير متاح:', error.message);
        }
    }

    // ===== 3. تحميل نظام 2FA =====
    async loadTwoFactorAuth() {
        try {
            this.securityModules.set('twofa', new TwoFactorAuth());
            this.loadingStatus.set('twofa', 'loaded');
            console.log('✅ نظام 2FA: تم التحميل');
        } catch (error) {
            this.loadingStatus.set('twofa', 'failed');
            console.warn('⚠️ نظام 2FA غير متاح:', error.message);
        }
    }

    // ===== 4. تحميل نظام كشف الشذوذ =====
    async loadAnomalyDetection() {
        try {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            this.securityModules.set('anomaly', new AnomalyDetection(currentUser.userId));
            this.loadingStatus.set('anomaly', 'loaded');
            console.log('✅ نظام كشف الشذوذ: تم التحميل');
        } catch (error) {
            this.loadingStatus.set('anomaly', 'failed');
            console.warn('⚠️ نظام كشف الشذوذ غير متاح:', error.message);
        }
    }

    // ===== 5. تحميل نظام التشفير =====
    async loadEncryption() {
        try {
            this.securityModules.set('encryption', new EncryptionManager());
            this.loadingStatus.set('encryption', 'loaded');
            console.log('✅ نظام التشفير: تم التحميل');
        } catch (error) {
            this.loadingStatus.set('encryption', 'failed');
            console.warn('⚠️ نظام التشفير غير متاح:', error.message);
        }
    }

    // ===== 6. التحقق من جميع الوحدات =====
    verifyAllModules() {
        const requiredModules = ['core'];
        const optionalModules = ['biometric', 'twofa', 'anomaly', 'encryption'];

        // التحقق من الوحدات الإجبارية
        requiredModules.forEach(module => {
            if (this.loadingStatus.get(module) !== 'loaded') {
                throw new Error(`الوحدة الإجبارية ${module} فشلت في التحميل`);
            }
        });

        // تسجيل حالة الوحدات الاختيارية
        optionalModules.forEach(module => {
            if (this.loadingStatus.get(module) === 'loaded') {
                console.log(`✅ ${module}: نشط`);
            } else {
                console.log(`⚠️ ${module}: غير نشط`);
            }
        });

        // حفظ حالة الأمان في الجلسة
        this.saveSecurityStatus();
    }

    // ===== 7. إعداد مراقبة الأمان =====
    setupSecurityMonitoring() {
        // مراقبة أداء الأمان كل دقيقة
        setInterval(() => {
            this.monitorSecurityPerformance();
        }, 60000);

        // مراقبة محاولات الاختراق
        window.addEventListener('security-violation', (e) => {
            this.handleSecurityViolation(e.detail);
        });

        // مراقبة أخطاء الأمان
        window.addEventListener('error', (e) => {
            if (e.message.includes('Security') || e.message.includes('security')) {
                this.handleSecurityError(e);
            }
        });
    }

    // ===== 8. مراقبة أداء الأمان =====
    monitorSecurityPerformance() {
        const metrics = {
            timestamp: new Date().toISOString(),
            modules: {},
            performance: {}
        };

        // قياس أداء كل وحدة
        this.securityModules.forEach((module, name) => {
            metrics.modules[name] = {
                active: true,
                memory: this.estimateMemoryUsage(module)
            };
        });

        // قياس أداء النظام
        metrics.performance = {
            memory: performance.memory ? performance.memory.usedJSHeapSize : 'unknown',
            loadTime: performance.now()
        };

        console.log('📊 Security Metrics:', metrics);
        
        // حفظ القياسات (سيتم إرسالها للخادم لاحقاً)
        this.saveSecurityMetrics(metrics);
    }

    // ===== 9. معالجة انتهاك أمني =====
    handleSecurityViolation(violation) {
        console.error('🚨 انتهاك أمني:', violation);

        // تسجيل الانتهاك
        const securityEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
        securityEvents.push({
            type: 'violation',
            details: violation,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('security_events', JSON.stringify(securityEvents));

        // إظهار تحذير
        this.showSecurityAlert('🚨 تم اكتشاف انتهاك أمني', 'error');

        // إخطار النقيب إذا كان متصلاً
        this.notifyPresident(violation);
    }

    // ===== 10. معالجة خطأ أمني =====
    handleSecurityError(error) {
        console.error('❌ خطأ أمني:', error);

        // محاولة إعادة تحميل الوحدة المتأثرة
        if (error.message.includes('core')) {
            this.reloadModule('core');
        }

        // إظهار رسالة للمستخدم
        this.showSecurityAlert('حدث خطأ في نظام الأمان، جاري إعادة التشغيل', 'warning');
    }

    // ===== 11. إعادة تحميل وحدة =====
    async reloadModule(moduleName) {
        console.log(`🔄 جاري إعادة تحميل ${moduleName}...`);

        try {
            switch(moduleName) {
                case 'core':
                    this.securityModules.set('core', new SecurityCore());
                    break;
                case 'biometric':
                    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
                    this.securityModules.set('biometric', new BiometricAuth(user));
                    break;
                case 'twofa':
                    this.securityModules.set('twofa', new TwoFactorAuth());
                    break;
                case 'anomaly':
                    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
                    this.securityModules.set('anomaly', new AnomalyDetection(currentUser.userId));
                    break;
                case 'encryption':
                    this.securityModules.set('encryption', new EncryptionManager());
                    break;
            }
            console.log(`✅ ${moduleName}: تم إعادة التحميل بنجاح`);
        } catch (error) {
            console.error(`❌ فشل إعادة تحميل ${moduleName}:`, error);
        }
    }

    // ===== 12. الحصول على وحدة أمان =====
    getSecurityModule(moduleName) {
        return this.securityModules.get(moduleName);
    }

    // ===== 13. التحقق من حالة وحدة =====
    isModuleActive(moduleName) {
        return this.loadingStatus.get(moduleName) === 'loaded';
    }

    // ===== 14. إظهار محمل الأمان =====
    showSecurityLoader() {
        const loader = document.createElement('div');
        loader.id = 'security-loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 999999;
            backdrop-filter: blur(5px);
        `;

        loader.innerHTML = `
            <div style="text-align: center; color: white;">
                <i class="fas fa-shield-alt" style="font-size: 80px; color: #667eea; margin-bottom: 20px; animation: pulse 2s infinite;"></i>
                <h2 style="margin-bottom: 10px;">🔒 جاري تحميل أنظمة الأمان</h2>
                <p style="color: #ccc; margin-bottom: 30px;">يرجى الانتظار...</p>
                <div style="width: 300px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 4px; margin: 0 auto; overflow: hidden;">
                    <div id="security-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 4px; transition: width 0.3s;"></div>
                </div>
                <div id="security-status" style="margin-top: 20px; color: #ccc; font-size: 14px;">جاري التحميل...</div>
            </div>
        `;

        document.body.appendChild(loader);

        // تحريك شريط التقدم
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            document.getElementById('security-progress').style.width = progress + '%';
            
            const statuses = [
                'تحميل نواة الأمان...',
                'تحميل نظام البصمة...',
                'تحميل نظام 2FA...',
                'تحميل نظام كشف الشذوذ...',
                'تحميل نظام التشفير...',
                'اكتمال التحميل ✅'
            ];
            
            document.getElementById('security-status').textContent = statuses[Math.floor(progress / 20) - 1] || 'اكتمال التحميل ✅';

            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 500);
    }

    // ===== 15. إخفاء محمل الأمان =====
    hideSecurityLoader() {
        const loader = document.getElementById('security-loader');
        if (loader) {
            loader.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => loader.remove(), 500);
        }
    }

    // ===== 16. حفظ حالة الأمان =====
    saveSecurityStatus() {
        const status = {
            timestamp: new Date().toISOString(),
            modules: {},
            user: JSON.parse(sessionStorage.getItem('currentUser') || '{}').userId || 'guest'
        };

        this.securityModules.forEach((_, name) => {
            status.modules[name] = this.isModuleActive(name);
        });

        localStorage.setItem('security_status', JSON.stringify(status));
    }

    // ===== 17. تقدير استخدام الذاكرة =====
    estimateMemoryUsage(module) {
        try {
            const moduleSize = JSON.stringify(module).length;
            return `${(moduleSize / 1024).toFixed(2)} KB`;
        } catch {
            return 'unknown';
        }
    }

    // ===== 18. حفظ مقاييس الأمان =====
    saveSecurityMetrics(metrics) {
        const metricsHistory = JSON.parse(localStorage.getItem('security_metrics') || '[]');
        metricsHistory.push(metrics);
        
        // الاحتفاظ بآخر 100 مقياس فقط
        if (metricsHistory.length > 100) {
            metricsHistory.shift();
        }
        
        localStorage.setItem('security_metrics', JSON.stringify(metricsHistory));
    }

    // ===== 19. إخطار النقيب =====
    notifyPresident(violation) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        
        // فقط إذا كان المستخدم الحالي هو النقيب
        if (currentUser.role === 'president') {
            this.showSecurityAlert(`🚨 تنبيه أمني: ${violation.type}`, 'error');
        }

        // هنا سيتم إرسال إشعار للخادم لاحقاً
    }

    // ===== 20. إظهار تنبيه أمان =====
    showSecurityAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `security-alert ${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 999999;
            animation: slideDown 0.3s ease;
            direction: rtl;
            font-family: 'Cairo', sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;

        const colors = {
            info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            success: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
            warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            error: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
        };

        alert.style.background = colors[type] || colors.info;
        alert.innerHTML = `<i class="fas fa-shield-alt"></i> ${message}`;
        document.body.appendChild(alert);

        setTimeout(() => {
            alert.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
}

// ===== إنشاء وتشغيل محمل الأمان =====
const securityLoader = new SecurityLoader();

// ===== إضافة الأنيميشنز =====
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

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

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// ===== تصدير محمل الأمان =====
export default securityLoader;
