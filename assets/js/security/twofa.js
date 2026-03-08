// assets/js/security/twofa.js
// نظام التحقق بخطوتين (2FA) - تلقائي عند الاشتباه

class TwoFactorAuth {
    constructor() {
        this.verificationCodes = new Map();
        this.attempts = new Map();
        this.lockedUsers = new Map();
        this.maxAttempts = 3;
        this.codeExpiry = 5 * 60 * 1000; // 5 دقائق
        this.codeLength = 6;
        
        // طرق التحقق المتاحة
        this.methods = {
            whatsapp: {
                name: 'واتساب',
                icon: 'fa-brands fa-whatsapp',
                enabled: true,
                priority: 1
            },
            sms: {
                name: 'رسالة نصية',
                icon: 'fa-solid fa-sms',
                enabled: true,
                priority: 2
            },
            email: {
                name: 'بريد إلكتروني',
                icon: 'fa-solid fa-envelope',
                enabled: true,
                priority: 3
            }
        };
    }

    // ===== 1. طلب رمز تحقق =====
    async requestCode(userId, method = 'whatsapp', contactInfo = null) {
        try {
            // التحقق من قفل المستخدم
            if (this.isUserLocked(userId)) {
                return {
                    success: false,
                    error: `تم قفل حسابك مؤقتاً. يرجى الانتظار ${this.getRemainingLockTime(userId)} دقائق`
                };
            }

            // التحقق من صحة الطريقة
            if (!this.methods[method] || !this.methods[method].enabled) {
                return {
                    success: false,
                    error: 'طريقة التحقق غير متاحة'
                };
            }

            // توليد رمز عشوائي
            const code = this.generateCode();
            const expiresAt = Date.now() + this.codeExpiry;

            // حفظ الرمز
            this.verificationCodes.set(userId, {
                code,
                expiresAt,
                attempts: 0,
                method,
                contactInfo
            });

            // إرسال الرمز حسب الطريقة
            const sendResult = await this.sendCode(method, contactInfo, code);

            if (!sendResult.success) {
                throw new Error(sendResult.error);
            }

            return {
                success: true,
                message: `تم إرسال رمز التحقق إلى ${this.methods[method].name}`,
                expiresIn: this.codeExpiry / 1000
            };

        } catch (error) {
            console.error('Error requesting 2FA code:', error);
            return {
                success: false,
                error: 'فشل إرسال رمز التحقق'
            };
        }
    }

    // ===== 2. التحقق من الرمز =====
    async verifyCode(userId, userCode) {
        try {
            // التحقق من وجود رمز
            const data = this.verificationCodes.get(userId);
            
            if (!data) {
                return {
                    success: false,
                    error: 'لم يتم طلب رمز تحقق. يرجى طلب رمز جديد'
                };
            }

            // التحقق من عدد المحاولات
            if (data.attempts >= this.maxAttempts) {
                this.lockUser(userId);
                this.verificationCodes.delete(userId);
                return {
                    success: false,
                    error: 'تجاوزت الحد الأقصى من المحاولات. تم قفل حسابك مؤقتاً'
                };
            }

            // التحقق من انتهاء الصلاحية
            if (Date.now() > data.expiresAt) {
                this.verificationCodes.delete(userId);
                return {
                    success: false,
                    error: 'انتهت صلاحية الرمز. يرجى طلب رمز جديد'
                };
            }

            // التحقق من الرمز
            if (data.code !== userCode) {
                data.attempts++;
                return {
                    success: false,
                    error: 'رمز غير صحيح',
                    attemptsLeft: this.maxAttempts - data.attempts
                };
            }

            // نجاح التحقق
            this.verificationCodes.delete(userId);
            
            // تسجيل التحقق الناجح
            await this.logSuccessfulVerification(userId, data.method);

            return {
                success: true,
                message: '✅ تم التحقق بنجاح'
            };

        } catch (error) {
            console.error('Error verifying 2FA code:', error);
            return {
                success: false,
                error: 'حدث خطأ في التحقق'
            };
        }
    }

    // ===== 3. إرسال الرمز =====
    async sendCode(method, contactInfo, code) {
        // محاكاة إرسال الرمز - في الواقع سيتم استدعاء API حقيقي
        console.log(`📱 [${method.toUpperCase()}] رمز التحقق: ${code} (تم إرساله إلى ${contactInfo})`);

        // هنا سيتم إضافة الكود الفعلي للإرسال:
        // - WhatsApp API
        // - SMS Gateway
        // - Email Service

        return {
            success: true,
            message: 'تم الإرسال'
        };
    }

    // ===== 4. توليد رمز عشوائي =====
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // ===== 5. قفل المستخدم =====
    lockUser(userId) {
        const lockUntil = Date.now() + (15 * 60 * 1000); // 15 دقيقة
        this.lockedUsers.set(userId, lockUntil);
        
        // تسجيل حدث القفل
        this.logSecurityEvent('user_locked', {
            userId,
            lockUntil: new Date(lockUntil).toISOString()
        });
    }

    // ===== 6. التحقق من قفل المستخدم =====
    isUserLocked(userId) {
        const lockUntil = this.lockedUsers.get(userId);
        if (!lockUntil) return false;
        
        if (Date.now() > lockUntil) {
            this.lockedUsers.delete(userId);
            return false;
        }
        
        return true;
    }

    // ===== 7. الحصول على الوقت المتبقي للقفل =====
    getRemainingLockTime(userId) {
        const lockUntil = this.lockedUsers.get(userId);
        if (!lockUntil) return 0;
        
        const remaining = lockUntil - Date.now();
        return Math.ceil(remaining / 60000); // بالدقائق
    }

    // ===== 8. التحقق من الحاجة إلى 2FA =====
    async check2FARequirement(loginData) {
        const {
            ip,
            location,
            device,
            time,
            userId
        } = loginData;

        let riskScore = 0;
        const reasons = [];

        // 1. تحقق من الموقع الجديد
        if (this.isNewLocation(ip, userId)) {
            riskScore += 0.3;
            reasons.push('موقع جديد');
        }

        // 2. تحقق من الجهاز الجديد
        if (this.isNewDevice(device, userId)) {
            riskScore += 0.3;
            reasons.push('جهاز جديد');
        }

        // 3. تحقق من الوقت غير المعتاد
        if (this.isUnusualTime(time, userId)) {
            riskScore += 0.2;
            reasons.push('وقت غير معتاد');
        }

        // 4. تحقق من محاولات سابقة
        if (this.hasPreviousAttempts(userId)) {
            riskScore += 0.2;
            reasons.push('محاولات سابقة فاشلة');
        }

        // 5. تحقق من سرعة الكتابة (للذكاء الاصطناعي)
        if (loginData.typingSpeed && this.isUnusualTypingSpeed(loginData.typingSpeed, userId)) {
            riskScore += 0.2;
            reasons.push('سرعة كتابة غير معتادة');
        }

        // 6. تحقق من نمط التصفح
        if (loginData.browsingPattern && this.isUnusualPattern(loginData.browsingPattern, userId)) {
            riskScore += 0.1;
            reasons.push('نمط تصفح غير معتاد');
        }

        return {
            required: riskScore > 0.5,
            riskScore: Math.min(riskScore, 1),
            reasons: reasons,
            level: this.getRiskLevel(riskScore),
            suggestedMethods: this.getSuggestedMethods(riskScore)
        };
    }

    // ===== 9. الحصول على مستوى المخاطر =====
    getRiskLevel(score) {
        if (score > 0.8) return 'critical';
        if (score > 0.6) return 'high';
        if (score > 0.4) return 'medium';
        if (score > 0.2) return 'low';
        return 'none';
    }

    // ===== 10. الحصول على الطرق المقترحة =====
    getSuggestedMethods(score) {
        const methods = [];
        
        if (score > 0.8) {
            methods.push('whatsapp', 'sms', 'email'); // كل الطرق
        } else if (score > 0.6) {
            methods.push('whatsapp', 'sms'); // طريقتين
        } else {
            methods.push('whatsapp'); // طريقة واحدة
        }

        return methods;
    }

    // ===== 11. تحليل الموقع الجديد =====
    isNewLocation(ip, userId) {
        // هنا يتم التحقق من قاعدة بيانات المواقع السابقة
        // هذا مؤقتاً نرجع true عشوائياً
        return Math.random() > 0.7;
    }

    // ===== 12. تحليل الجهاز الجديد =====
    isNewDevice(device, userId) {
        // هنا يتم التحقق من قاعدة بيانات الأجهزة السابقة
        return Math.random() > 0.7;
    }

    // ===== 13. تحليل الوقت غير المعتاد =====
    isUnusualTime(time, userId) {
        if (!time) return false;
        const hour = new Date(time).getHours();
        // الوقت غير المعتاد: 12 صباحاً - 6 صباحاً
        return hour < 6 || hour > 22;
    }

    // ===== 14. تحقق من محاولات سابقة =====
    hasPreviousAttempts(userId) {
        const attempts = this.attempts.get(userId) || 0;
        return attempts > 2;
    }

    // ===== 15. تحليل سرعة الكتابة =====
    isUnusualTypingSpeed(speed, userId) {
        // سرعة الكتابة الطبيعية: 200-400 حرف في الدقيقة
        return speed < 100 || speed > 600;
    }

    // ===== 16. تحليل نمط التصفح =====
    isUnusualPattern(pattern, userId) {
        return pattern && pattern.confidence < 0.5;
    }

    // ===== 17. عرض واجهة 2FA =====
    show2FAPrompt(phoneNumber, email, riskLevel = 'medium') {
        return new Promise((resolve) => {
            const prompt = document.createElement('div');
            prompt.className = 'twofa-prompt';
            
            const methods = this.getOrderedMethods(riskLevel);
            
            prompt.innerHTML = `
                <div class="twofa-overlay">
                    <div class="twofa-card">
                        <div class="twofa-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h3>🔐 التحقق بخطوتين</h3>
                        <p class="twofa-risk ${riskLevel}">
                            <i class="fas ${this.getRiskIcon(riskLevel)}"></i>
                            ${this.getRiskMessage(riskLevel)}
                        </p>
                        <div class="twofa-methods">
                            ${methods.map(method => `
                                <button class="twofa-method" onclick="select2FAMethod('${method.id}')">
                                    <i class="fas ${method.icon}"></i>
                                    <span>${method.name}</span>
                                    <small>${method.description}</small>
                                </button>
                            `).join('')}
                        </div>
                        <div class="twofa-input" id="twofaInput" style="display: none;">
                            <input type="text" 
                                   id="verificationCode" 
                                   maxlength="${this.codeLength}" 
                                   placeholder="أدخل الرمز المكون من ${this.codeLength} أرقام"
                                   autocomplete="off">
                            <div class="twofa-timer" id="twofaTimer">05:00</div>
                            <button class="twofa-verify" onclick="verify2FACode()">
                                <i class="fas fa-check"></i>
                                تحقق
                            </button>
                            <button class="twofa-resend" onclick="resend2FACode()">
                                <i class="fas fa-redo"></i>
                                إعادة إرسال
                            </button>
                        </div>
                        <button class="twofa-cancel" onclick="cancel2FA()">إلغاء</button>
                    </div>
                </div>
            `;

            // إضافة التنسيقات
            const style = document.createElement('style');
            style.textContent = `
                .twofa-overlay {
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
                    animation: fadeIn 0.3s ease;
                }
                .twofa-card {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                    animation: slideUp 0.3s ease;
                }
                .twofa-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: white;
                    font-size: 30px;
                    animation: pulse 2s infinite;
                }
                .twofa-risk {
                    padding: 10px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    font-size: 14px;
                }
                .twofa-risk.critical {
                    background: #fee2e2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }
                .twofa-risk.high {
                    background: #fff3cd;
                    color: #d97706;
                    border: 1px solid #fde68a;
                }
                .twofa-risk.medium {
                    background: #e0f2fe;
                    color: #0284c7;
                    border: 1px solid #bae6fd;
                }
                .twofa-risk.low {
                    background: #dcfce7;
                    color: #16a34a;
                    border: 1px solid #bbf7d0;
                }
                .twofa-methods {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .twofa-method {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: right;
                }
                .twofa-method:hover {
                    border-color: #667eea;
                    background: #f8f9fa;
                    transform: scale(1.02);
                }
                .twofa-method i {
                    font-size: 24px;
                    color: #667eea;
                    width: 30px;
                }
                .twofa-method span {
                    font-weight: 600;
                    flex: 1;
                }
                .twofa-method small {
                    color: #6b7280;
                    font-size: 12px;
                }
                .twofa-input {
                    margin-top: 20px;
                }
                .twofa-input input {
                    width: 100%;
                    padding: 15px;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 24px;
                    text-align: center;
                    letter-spacing: 8px;
                    margin-bottom: 10px;
                    font-family: monospace;
                }
                .twofa-input input:focus {
                    border-color: #667eea;
                    outline: none;
                }
                .twofa-timer {
                    font-size: 20px;
                    font-family: monospace;
                    color: #6b7280;
                    margin-bottom: 10px;
                }
                .twofa-verify {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    cursor: pointer;
                    margin-bottom: 10px;
                }
                .twofa-resend {
                    width: 100%;
                    padding: 10px;
                    background: transparent;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    color: #6b7280;
                    cursor: pointer;
                    margin-bottom: 10px;
                }
                .twofa-cancel {
                    padding: 10px 30px;
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    width: 100%;
                }
            `;

            document.head.appendChild(style);
            document.body.appendChild(prompt);

            // دوال عالمية مؤقتة
            window.selected2FAMethod = null;
            window.select2FAMethod = (method) => {
                window.selected2FAMethod = method;
                document.querySelector('.twofa-methods').style.display = 'none';
                document.getElementById('twofaInput').style.display = 'block';
                this.startTimer(300); // 5 دقائق
                resolve({ method, action: 'proceed' });
            };

            window.cancel2FA = () => {
                prompt.remove();
                resolve({ action: 'cancel' });
            };
        });
    }

    // ===== 18. الحصول على الطرق مرتبة حسب الأولوية =====
    getOrderedMethods(riskLevel) {
        const methods = Object.entries(this.methods)
            .filter(([_, m]) => m.enabled)
            .map(([id, m]) => ({ id, ...m }));

        if (riskLevel === 'critical') {
            return methods; // كل الطرق
        } else if (riskLevel === 'high') {
            return methods.filter(m => m.priority <= 2); // أهم طريقتين
        } else {
            return methods.filter(m => m.priority === 1); // أهم طريقة فقط
        }
    }

    // ===== 19. الحصول على أيقونة المخاطر =====
    getRiskIcon(level) {
        const icons = {
            critical: 'fa-exclamation-triangle',
            high: 'fa-exclamation-circle',
            medium: 'fa-info-circle',
            low: 'fa-check-circle',
            none: 'fa-shield-alt'
        };
        return icons[level] || icons.none;
    }

    // ===== 20. الحصول على رسالة المخاطر =====
    getRiskMessage(level) {
        const messages = {
            critical: 'نشاط شديد الخطورة! يرجى تأكيد هويتك فوراً',
            high: 'نشاط غير معتاد، يرجى التحقق',
            medium: 'نشاط مشبوه، يرجى التأكيد',
            low: 'تحقق إضافي للسلامة',
            none: 'تحقق عادي'
        };
        return messages[level] || messages.none;
    }

    // ===== 21. بدء عداد الوقت =====
    startTimer(duration) {
        const timer = document.getElementById('twofaTimer');
        let timeLeft = duration;
        
        const interval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(interval);
                timer.textContent = 'انتهى الوقت';
            }
            
            timeLeft--;
        }, 1000);
    }

    // ===== 22. تسجيل تحقق ناجح =====
    async logSuccessfulVerification(userId, method) {
        console.log(`✅ 2FA successful for user ${userId} using ${method}`);
        
        // هنا يتم حفظ سجل التحقق في قاعدة البيانات
    }

    // ===== 23. تسجيل حدث أمني =====
    logSecurityEvent(type, details) {
        console.warn(`🔒 Security Event: ${type}`, details);
        
        // هنا يتم حفظ الحدث في قاعدة البيانات
    }

    // ===== 24. الحصول على إحصائيات 2FA =====
    getStats() {
        return {
            activeCodes: this.verificationCodes.size,
            lockedUsers: this.lockedUsers.size,
            methods: Object.values(this.methods).filter(m => m.enabled).length,
            maxAttempts: this.maxAttempts
        };
    }
}

export default TwoFactorAuth;
