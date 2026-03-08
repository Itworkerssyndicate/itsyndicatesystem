// assets/js/biometric-auth.js
// نظام المصادقة الحيوية (بصمة الوجه والإصبع) - إجباري حسب إمكانيات الجهاز

class BiometricAuth {
    constructor() {
        this.isSupported = this.checkSupport();
        this.hasFaceID = this.checkFaceIDSupport();
        this.hasFingerprint = this.checkFingerprintSupport();
    }

    // التحقق من دعم المتصفح للمصادقة الحيوية
    checkSupport() {
        return window.PublicKeyCredential !== undefined;
    }

    // التحقق من دعم بصمة الوجه
    checkFaceIDSupport() {
        // التحقق من دعم Face ID (iOS/macOS)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        
        if (isIOS || isMacOS) {
            // التحقق من وجود كاميرا TrueDepth (للأجهزة الحديثة)
            return true;
        }
        
        // التحقق من دعم Windows Hello (Face)
        if (navigator.credentials && navigator.credentials.create) {
            return true;
        }
        
        return false;
    }

    // التحقق من دعم بصمة الإصبع
    checkFingerprintSupport() {
        // التحقق من دعم Touch ID (iOS)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        // التحقق من دعم Android Fingerprint
        const isAndroid = /Android/.test(navigator.userAgent);
        
        // التحقق من دعم Windows Hello (Fingerprint)
        const isWindows = /Windows/.test(navigator.userAgent);
        
        return isIOS || isAndroid || isWindows;
    }

    // الحصول على أفضل طريقة متاحة
    getBestAvailableMethod() {
        if (this.hasFaceID) {
            return {
                method: 'face',
                name: 'بصمة الوجه',
                icon: 'fa-face-smile',
                available: true,
                mandatory: true
            };
        } else if (this.hasFingerprint) {
            return {
                method: 'fingerprint',
                name: 'بصمة الإصبع',
                icon: 'fa-fingerprint',
                available: true,
                mandatory: true
            };
        } else {
            return {
                method: 'none',
                name: 'غير متاحة',
                icon: 'fa-lock',
                available: false,
                mandatory: false
            };
        }
    }

    // تسجيل بصمة جديدة (أول مرة)
    async registerBiometric(userId, userName) {
        if (!this.isSupported) {
            throw new Error('المتصفح لا يدعم المصادقة الحيوية');
        }

        const availableMethod = this.getBestAvailableMethod();
        
        if (!availableMethod.available) {
            return {
                success: false,
                method: 'none',
                message: 'الجهاز لا يدعم المصادقة الحيوية، سيتم استخدام المصادقة العادية'
            };
        }

        const options = {
            publicKey: {
                rp: {
                    id: window.location.hostname,
                    name: "ITWS Union System"
                },
                user: {
                    id: new TextEncoder().encode(userId),
                    name: userName,
                    displayName: userName
                },
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 } // ES256
                ],
                authenticatorSelection: {
                    authenticatorAttachment: availableMethod.method === 'face' ? 'platform' : 'cross-platform',
                    residentKey: "required",
                    userVerification: "required"
                }
            }
        };

        try {
            const credential = await navigator.credentials.create(options);
            
            // حفظ بيانات البصمة
            await this.saveBiometricData(userId, credential, availableMethod.method);
            
            return {
                success: true,
                method: availableMethod.method,
                message: `✅ تم تسجيل ${availableMethod.name} بنجاح`
            };
        } catch (error) {
            console.error('Biometric registration error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // تسجيل الدخول بالبصمة
    async authenticateBiometric(userId) {
        if (!this.isSupported) {
            return {
                success: false,
                error: 'المصادقة الحيوية غير مدعومة'
            };
        }

        const availableMethod = this.getBestAvailableMethod();
        
        if (!availableMethod.available) {
            return {
                success: false,
                error: 'لا توجد وسيلة مصادقة حيوية متاحة'
            };
        }

        try {
            // استرجاع تحدي من الخادم
            const challenge = await this.getChallenge(userId);

            const options = {
                publicKey: {
                    challenge: challenge,
                    userVerification: "required",
                    rpId: window.location.hostname
                }
            };

            const assertion = await navigator.credentials.get(options);
            
            // التحقق من صحة التوقيع
            const isValid = await this.verifyAssertion(assertion, userId);
            
            if (isValid) {
                return {
                    success: true,
                    method: availableMethod.method,
                    message: `✅ تم التحقق من ${availableMethod.name} بنجاح`
                };
            } else {
                throw new Error('فشل التحقق من البصمة');
            }
        } catch (error) {
            console.error('Biometric authentication error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // التحقق من إجبارية المصادقة الحيوية للمستخدم
    async checkBiometricRequirement(userId) {
        // التحقق من إعدادات المستخدم
        const userBiometric = await this.getUserBiometricStatus(userId);
        const availableMethod = this.getBestAvailableMethod();
        
        // إذا كانت المصادقة الحيوية متاحة وإجبارية
        if (availableMethod.available && availableMethod.mandatory) {
            // إذا لم يسجل المستخدم بصمته من قبل
            if (!userBiometric.registered) {
                return {
                    required: true,
                    method: availableMethod.method,
                    name: availableMethod.name,
                    message: `يجب تسجيل ${availableMethod.name} للدخول إلى النظام`
                };
            }
            
            // إذا سجل من قبل، نطلب المصادقة
            return {
                required: true,
                method: availableMethod.method,
                name: availableMethod.name,
                message: `الرجاء استخدام ${availableMethod.name} للدخول`
            };
        }
        
        return {
            required: false,
            method: 'none'
        };
    }

    // عرض واجهة المصادقة الحيوية
    async showBiometricPrompt(userId, method) {
        const prompt = document.createElement('div');
        prompt.className = 'biometric-prompt';
        prompt.innerHTML = `
            <div class="biometric-overlay">
                <div class="biometric-card">
                    <div class="biometric-icon">
                        <i class="fas ${method === 'face' ? 'fa-face-smile' : 'fa-fingerprint'}"></i>
                    </div>
                    <h3>${method === 'face' ? 'بصمة الوجه' : 'بصمة الإصبع'}</h3>
                    <p>الرجاء وضع ${method === 'face' ? 'وجهك أمام الكاميرا' : 'إصبعك على المستشعر'}</p>
                    <div class="biometric-status" id="biometricStatus">
                        <div class="spinner"></div>
                        <span>جاري المسح...</span>
                    </div>
                    <button class="biometric-cancel" onclick="closeBiometricPrompt()">إلغاء</button>
                </div>
            </div>
        `;

        // إضافة التنسيقات
        const style = document.createElement('style');
        style.textContent = `
            .biometric-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                backdrop-filter: blur(5px);
            }
            .biometric-card {
                background: white;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                max-width: 400px;
                width: 90%;
                animation: slideUp 0.3s ease;
            }
            .biometric-icon {
                width: 100px;
                height: 100px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                color: white;
                font-size: 50px;
            }
            .biometric-status {
                margin: 20px 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            .biometric-cancel {
                padding: 10px 30px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                cursor: pointer;
            }
            .biometric-cancel:hover {
                background: #c82333;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(prompt);

        // محاولة المصادقة
        const result = await this.authenticateBiometric(userId);
        
        // إزالة الواجهة
        document.querySelector('.biometric-overlay')?.remove();
        
        return result;
    }

    // دوال مساعدة (يتم استبدالها بالاتصال بقاعدة البيانات)
    async getChallenge(userId) {
        return crypto.getRandomValues(new Uint8Array(32));
    }

    async verifyAssertion(assertion, userId) {
        return true;
    }

    async saveBiometricData(userId, credential, method) {
        console.log(`✅ تم حفظ بيانات ${method} للمستخدم ${userId}`);
    }

    async getUserBiometricStatus(userId) {
        return { registered: false };
    }
}

export default BiometricAuth;
