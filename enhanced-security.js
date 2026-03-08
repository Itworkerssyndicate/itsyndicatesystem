// assets/js/enhanced-security.js
// نظام الأمان المتكامل - يجمع كل الأنظمة الأمنية

import SecurityCore from './security-core.js';
import BiometricAuth from './biometric-auth.js';
import TwoFactorAuth from './2fa.js';
import AnomalyDetection from './anomaly-detection.js';
import LocalEncryption from './encryption.js';

class EnhancedSecurity {
    constructor(currentUser = null) {
        this.currentUser = currentUser;
        this.securityCore = new SecurityCore();
        this.biometric = new BiometricAuth();
        this.twoFA = new TwoFactorAuth();
        this.anomaly = currentUser ? new AnomalyDetection(currentUser.userId) : null;
        this.encryption = new LocalEncryption();
        
        this.userKey = null;
        this.sessionId = this.generateSessionId();
        
        this.init();
    }

    async init() {
        console.log('🔒 Initializing Enhanced Security System...');
        
        // بناء الملف السلوكي للمستخدم إذا كان مسجلاً
        if (this.currentUser && this.anomaly) {
            await this.anomaly.buildUserProfile();
        }
        
        // توليد مفتاح جلسة
        this.sessionKey = await this.encryption.generateKey();
        
        // بدء مراقبة الجلسة
        this.startSessionMonitoring();
    }

    // تسجيل الدخول المتقدم
    async advancedLogin(username, password, loginData) {
        try {
            // 1. التحقق الأساسي من Firebase
            const basicAuth = await this.basicAuthentication(username, password);
            if (!basicAuth.success) {
                return basicAuth;
            }

            this.currentUser = basicAuth.user;
            this.anomaly = new AnomalyDetection(this.currentUser.userId);

            // 2. تحليل سلوكي
            const behavior = await this.anomaly.analyzeCurrentLogin(loginData);
            
            // 3. التحقق من المصادقة الحيوية الإجبارية
            const biometricRequirement = await this.biometric.checkBiometricRequirement(this.currentUser.userId);
            
            if (biometricRequirement.required) {
                const biometricResult = await this.biometric.showBiometricPrompt(
                    this.currentUser.userId,
                    biometricRequirement.method
                );
                
                if (!biometricResult.success) {
                    return {
                        success: false,
                        error: 'فشل المصادقة الحيوية'
                    };
                }
            }

            // 4. إذا كان هناك شذوذ، طلب 2FA
            if (behavior.isAnomaly && behavior.requiresAdditionalVerification) {
                const response = await this.anomaly.handleAnomaly(behavior);
                
                if (response.action === 'require_2fa') {
                    // طلب 2FA
                    const twoFAResult = await this.handle2FA(this.currentUser);
                    if (!twoFAResult.success) {
                        return twoFAResult;
                    }
                } else if (response.action === 'block') {
                    return {
                        success: false,
                        error: response.message
                    };
                }
            }

            // 5. توليد مفتاح المستخدم
            this.userKey = await this.encryption.generateUserKey(
                password,
                this.currentUser.userId
            );

            // 6. تسجيل الجلسة
            await this.logSession();

            return {
                success: true,
                user: this.currentUser,
                requires2FA: false,
                sessionId: this.sessionId,
                message: 'تم تسجيل الدخول بنجاح'
            };

        } catch (error) {
            console.error('Advanced login error:', error);
            return {
                success: false,
                error: 'حدث خطأ في تسجيل الدخول'
            };
        }
    }

    // التحقق الأساسي
    async basicAuthentication(username, password) {
        // هنا يتم الاتصال بـ Firebase
        // هذا مجرد مثال
        if (username === 'المهندس / محمود جميل' && password === '30010250202679') {
            return {
                success: true,
                user: {
                    userId: 'president_001',
                    fullName: 'محمود جميل',
                    role: 'president',
                    phone: '01234567890',
                    email: 'president@itws.org'
                }
            };
        }
        
        return {
            success: false,
            error: 'بيانات الدخول غير صحيحة'
        };
    }

    // معالجة 2FA
    async handle2FA(user) {
        return new Promise((resolve) => {
            this.twoFA.show2FAPrompt(user.phone, user.email);
            
            // هنا يتم انتظار إدخال المستخدم
            window.verify2FACode = async (code) => {
                const result = await this.twoFA.verifyCode(user.phone, code);
                resolve(result);
            };
            
            window.close2FAPrompt = () => {
                resolve({
                    success: false,
                    error: 'تم إلغاء التحقق'
                });
            };
        });
    }

    // تسجيل الجلسة
    async logSession() {
        const sessionData = {
            sessionId: this.sessionId,
            userId: this.currentUser?.userId,
            startTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        // حفظ في قاعدة البيانات
        console.log('📝 Session logged:', sessionData);
    }

    // بدء مراقبة الجلسة
    startSessionMonitoring() {
        // مراقبة كل 5 ثواني
        setInterval(async () => {
            if (this.currentUser && this.anomaly) {
                // تسجيل نشاط المستخدم
                const action = {
                    type: 'heartbeat',
                    page: window.location.pathname
                };
                
                const anomaly = await this.anomaly.analyzeSessionBehavior(action);
                
                if (anomaly.isAnomaly) {
                    await this.anomaly.handleAnomaly(anomaly);
                }
            }
        }, 5000);
    }

    // تشفير بيانات المستخدم
    async encryptUserData(data) {
        if (!this.userKey) {
            throw new Error('المستخدم غير مسجل الدخول');
        }
        
        return await this.encryption.encryptData(data, this.userKey);
    }

    // فك تشفير بيانات المستخدم
    async decryptUserData(encryptedData) {
        if (!this.userKey) {
            throw new Error('المستخدم غير مسجل الدخول');
        }
        
        return await this.encryption.decryptData(encryptedData, this.userKey);
    }

    // تخزين آمن في localStorage
    async secureStore(key, value) {
        if (!this.userKey) {
            throw new Error('المستخدم غير مسجل الدخول');
        }
        
        return await this.encryption.secureStore(key, value, this.userKey);
    }

    // استرجاع آمن من localStorage
    async secureRetrieve(key) {
        if (!this.userKey) {
            throw new Error('المستخدم غير مسجل الدخول');
        }
        
        return await this.encryption.secureRetrieve(key, this.userKey);
    }

    // تسجيل الخروج الآمن
    async secureLogout() {
        // تسجيل انتهاء الجلسة
        await this.logSessionEnd();
        
        // مسح البيانات
        this.currentUser = null;
        this.userKey = null;
        this.sessionKey = null;
        
        // مسح التخزين المحلي الآمن
        localStorage.clear();
        sessionStorage.clear();
        
        // توجيه لصفحة الدخول
        window.location.href = 'index.html';
    }

    // تسجيل انتهاء الجلسة
    async logSessionEnd() {
        console.log('👋 Session ended:', this.sessionId);
    }

    // توليد معرف جلسة
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // التحقق من صلاحية الجلسة
    async validateSession() {
        if (!this.currentUser || !this.sessionKey) {
            return false;
        }
        
        // التحقق من مدة الجلسة (30 دقيقة كحد أقصى)
        const sessionStart = localStorage.getItem('sessionStart');
        if (sessionStart) {
            const duration = Date.now() - parseInt(sessionStart);
            if (duration > 30 * 60 * 1000) {
                await this.secureLogout();
                return false;
            }
        }
        
        return true;
    }
}

export default EnhancedSecurity;
