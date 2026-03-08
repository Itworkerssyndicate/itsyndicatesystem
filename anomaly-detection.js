// assets/js/anomaly-detection.js
// نظام كشف الشذوذ في السلوك - تحليل تلقائي لكل المستخدمين

class AnomalyDetection {
    constructor(userId) {
        this.userId = userId;
        this.behaviorProfile = null;
        this.anomalyThreshold = 0.6; // عتبة الشذوذ
        this.sessionStart = Date.now();
        this.actions = [];
        this.maxActionsPerMinute = 30; // الحد الأقصى للأفعال في الدقيقة
    }

    // بناء ملف سلوكي للمستخدم
    async buildUserProfile() {
        const userData = await this.collectUserBehavior();
        
        this.behaviorProfile = {
            userId: this.userId,
            normalLoginTimes: this.analyzeLoginTimes(userData.logins || []),
            normalLocations: this.analyzeLocations(userData.locations || []),
            normalDevices: this.analyzeDevices(userData.devices || []),
            normalPages: this.analyzePages(userData.pages || []),
            normalActions: this.analyzeActions(userData.actions || []),
            baseline: {
                avgLoginPerDay: this.calculateAverage(userData.logins, 'perDay'),
                avgActionsPerSession: this.calculateAverage(userData.actions, 'perSession'),
                commonHours: this.findCommonHours(userData.logins),
                commonPages: this.findCommonPages(userData.pages),
                typingSpeed: userData.typingSpeed || 300 // متوسط سرعة الكتابة
            }
        };

        // حفظ الملف السلوكي
        await this.saveProfile();
        return this.behaviorProfile;
    }

    // تحليل وقت تسجيل الدخول الحالي
    async analyzeCurrentLogin(loginData) {
        if (!this.behaviorProfile) {
            await this.loadProfile();
        }

        const anomalies = [];
        
        // 1. تحقق من وقت الدخول
        const timeAnomaly = this.detectTimeAnomaly(loginData.timestamp);
        if (timeAnomaly.isAnomaly) {
            anomalies.push({
                type: 'unusual_time',
                score: timeAnomaly.score,
                details: `تسجيل دخول في وقت غير معتاد: ${new Date(loginData.timestamp).toLocaleString('ar-EG')}`
            });
        }

        // 2. تحقق من الموقع الجغرافي
        const locationAnomaly = await this.detectLocationAnomaly(loginData.ip, loginData.location);
        if (locationAnomaly.isAnomaly) {
            anomalies.push({
                type: 'new_location',
                score: locationAnomaly.score,
                details: `تسجيل دخول من موقع جديد: ${loginData.location?.country || 'غير معروف'}`
            });
        }

        // 3. تحقق من الجهاز
        const deviceAnomaly = this.detectDeviceAnomaly(loginData.device);
        if (deviceAnomaly.isAnomaly) {
            anomalies.push({
                type: 'new_device',
                score: deviceAnomaly.score,
                details: `تسجيل دخول من جهاز جديد: ${loginData.device?.userAgent?.substring(0, 50) || 'غير معروف'}`
            });
        }

        // 4. تحقق من عدد المحاولات
        const attemptsAnomaly = await this.detectAttemptsAnomaly(loginData.userId);
        if (attemptsAnomaly.isAnomaly) {
            anomalies.push({
                type: 'multiple_attempts',
                score: attemptsAnomaly.score,
                details: `محاولات دخول متعددة: ${attemptsAnomaly.attempts} محاولة`
            });
        }

        // حساب درجة المخاطر الإجمالية
        const riskScore = this.calculateRiskScore(anomalies);
        
        return {
            isAnomaly: anomalies.length > 0,
            anomalies: anomalies,
            riskScore: riskScore,
            requiresAdditionalVerification: riskScore > this.anomalyThreshold,
            riskLevel: this.getRiskLevel(riskScore)
        };
    }

    // تحليل سلوك المستخدم أثناء الجلسة
    async analyzeSessionBehavior(action) {
        // تسجيل الإجراء
        this.actions.push({
            action: action,
            timestamp: Date.now()
        });

        // تنظيف الإجراءات القديمة (أكثر من دقيقة)
        const now = Date.now();
        this.actions = this.actions.filter(a => now - a.timestamp < 60000);

        // التحقق من سرعة الإجراءات
        if (this.actions.length > this.maxActionsPerMinute) {
            return {
                isAnomaly: true,
                type: 'too_fast',
                score: 0.8,
                details: `سرعة غير طبيعية: ${this.actions.length} إجراء في الدقيقة`
            };
        }

        // التحقق من تسلسل الإجراءات غير المعتاد
        const sequenceAnomaly = this.detectUnusualSequence();
        if (sequenceAnomaly) {
            return sequenceAnomaly;
        }

        return {
            isAnomaly: false,
            score: 0
        };
    }

    // كشف شذوذ الوقت
    detectTimeAnomaly(timestamp) {
        const hour = new Date(timestamp).getHours();
        const normalHours = this.behaviorProfile?.baseline?.commonHours || [9, 10, 11, 12, 13, 14, 15, 16, 17];
        
        let score = 0;
        if (!normalHours.includes(hour)) {
            const distance = Math.min(
                Math.abs(hour - Math.min(...normalHours)),
                Math.abs(hour - Math.max(...normalHours))
            );
            score = Math.min(distance / 12, 0.8);
        }
        
        return {
            isAnomaly: score > 0.4,
            score: score
        };
    }

    // كشف شذوذ الموقع
    async detectLocationAnomaly(ip, location) {
        if (!location && ip) {
            location = await this.getLocationFromIP(ip);
        }
        
        if (!location) return { isAnomaly: false, score: 0 };

        const knownLocations = this.behaviorProfile?.normalLocations || [];
        const isNewLocation = !knownLocations.some(loc => 
            loc.country === location.country && 
            loc.city === location.city
        );

        if (!isNewLocation) return { isAnomaly: false, score: 0 };

        let riskScore = 0.5;
        
        // زيادة الخطورة إذا كان من دولة مختلفة
        if (location.country && location.country !== 'EG') {
            riskScore += 0.3;
        }
        
        return {
            isAnomaly: true,
            score: riskScore
        };
    }

    // كشف شذوذ الجهاز
    detectDeviceAnomaly(device) {
        if (!device) return { isAnomaly: false, score: 0 };

        const knownDevices = this.behaviorProfile?.normalDevices || [];
        const deviceFingerprint = this.generateDeviceFingerprint(device);
        
        const isKnownDevice = knownDevices.some(d => d.fingerprint === deviceFingerprint);

        if (isKnownDevice) return { isAnomaly: false, score: 0 };

        return {
            isAnomaly: true,
            score: 0.6,
            fingerprint: deviceFingerprint
        };
    }

    // كشف شذوذ المحاولات
    async detectAttemptsAnomaly(userId) {
        const attempts = await this.getLoginAttempts(userId, 5); // آخر 5 دقائق
        
        if (attempts.length > 5) {
            return {
                isAnomaly: true,
                score: 0.7,
                attempts: attempts.length
            };
        }
        
        return {
            isAnomaly: false,
            score: 0
        };
    }

    // كشف التسلسل غير المعتاد
    detectUnusualSequence() {
        if (this.actions.length < 5) return null;

        const recentActions = this.actions.slice(-5).map(a => a.action);
        
        // التحقق من تكرار نفس الإجراء
        const uniqueActions = new Set(recentActions);
        if (uniqueActions.size === 1) {
            return {
                isAnomaly: true,
                type: 'repetitive',
                score: 0.5,
                details: `تكرار نفس الإجراء: ${recentActions[0]}`
            };
        }

        return null;
    }

    // حساب درجة المخاطر
    calculateRiskScore(anomalies) {
        if (anomalies.length === 0) return 0;
        
        const weights = {
            unusual_time: 0.25,
            new_location: 0.35,
            new_device: 0.25,
            multiple_attempts: 0.3
        };

        let totalScore = 0;
        anomalies.forEach(a => {
            totalScore += a.score * (weights[a.type] || 0.25);
        });

        return Math.min(totalScore, 1);
    }

    // الحصول على مستوى المخاطر
    getRiskLevel(score) {
        if (score > 0.8) return 'critical';
        if (score > 0.6) return 'high';
        if (score > 0.4) return 'medium';
        if (score > 0.2) return 'low';
        return 'none';
    }

    // معالجة الشذوذ
    async handleAnomaly(anomaly) {
        await this.logAnomaly(anomaly);
        
        switch (anomaly.riskLevel) {
            case 'critical':
                await this.blockUser();
                await this.notifyPresident(anomaly);
                return {
                    action: 'block',
                    message: 'تم حظر الحساب مؤقتاً بسبب نشاط شديد الخطورة'
                };
                
            case 'high':
                await this.require2FA();
                await this.notifyUser(anomaly);
                return {
                    action: 'require_2fa',
                    message: 'يرجى تأكيد هويتك عبر رمز التحقق'
                };
                
            case 'medium':
                await this.requireAdditionalVerification();
                return {
                    action: 'additional_check',
                    message: 'يرجى الإجابة على سؤال الأمان'
                };
                
            default:
                await this.logOnly();
                return {
                    action: 'log_only',
                    message: 'تم تسجيل النشاط'
                };
        }
    }

    // تسجيل الشذوذ
    async logAnomaly(anomaly) {
        console.log('🚨 Anomaly detected:', anomaly);
        
        // حفظ في قاعدة البيانات
        const anomalyData = {
            userId: this.userId,
            ...anomaly,
            timestamp: new Date().toISOString(),
            sessionDuration: Date.now() - this.sessionStart
        };

        // هنا يتم الحفظ في Firebase
        // await push(ref(database, 'anomalies'), anomalyData);
    }

    // إشعار المستخدم
    async notifyUser(anomaly) {
        console.log('📢 Notifying user:', anomaly);
    }

    // إشعار النقيب
    async notifyPresident(anomaly) {
        console.log('⚠️ Notifying president:', anomaly);
    }

    // حظر المستخدم
    async blockUser() {
        console.log('🔒 Blocking user:', this.userId);
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html?blocked=true';
    }

    // طلب 2FA
    async require2FA() {
        console.log('🔐 Requiring 2FA for user:', this.userId);
        // إظهار نافذة 2FA
    }

    // طلب تحقق إضافي
    async requireAdditionalVerification() {
        console.log('❓ Requiring additional verification for user:', this.userId);
    }

    // تسجيل فقط
    async logOnly() {
        console.log('📝 Logging only for user:', this.userId);
    }

    // توليد بصمة الجهاز
    generateDeviceFingerprint(device) {
        const components = [
            device.userAgent,
            device.language,
            device.platform,
            device.screenWidth,
            device.screenHeight,
            device.timezone
        ].filter(Boolean);
        
        return btoa(components.join('|'));
    }

    // الحصول على الموقع من IP
    async getLocationFromIP(ip) {
        // هنا يتم استدعاء API لجلب الموقع
        return null;
    }

    // الحصول على محاولات الدخول
    async getLoginAttempts(userId, minutes) {
        // هنا يتم جلب المحاولات من قاعدة البيانات
        return [];
    }

    // جمع سلوك المستخدم
    async collectUserBehavior() {
        // هنا يتم جلب بيانات المستخدم من قاعدة البيانات
        return {};
    }

    // تحليل أوقات الدخول
    analyzeLoginTimes(logins) {
        return logins;
    }

    // تحليل المواقع
    analyzeLocations(locations) {
        return locations;
    }

    // تحليل الأجهزة
    analyzeDevices(devices) {
        return devices;
    }

    // تحليل الصفحات
    analyzePages(pages) {
        return pages;
    }

    // تحليل الإجراءات
    analyzeActions(actions) {
        return actions;
    }

    // حساب المتوسط
    calculateAverage(data, type) {
        return 0;
    }

    // إيجاد الساعات الشائعة
    findCommonHours(logins) {
        return [9, 10, 11, 12, 13, 14, 15, 16, 17];
    }

    // إيجاد الصفحات الشائعة
    findCommonPages(pages) {
        return ['/dashboard', '/committees', '/branches'];
    }

    // حفظ الملف السلوكي
    async saveProfile() {
        console.log('✅ Profile saved for user:', this.userId);
    }

    // تحميل الملف السلوكي
    async loadProfile() {
        console.log('📂 Loading profile for user:', this.userId);
        this.behaviorProfile = {
            baseline: {
                commonHours: [9, 10, 11, 12, 13, 14, 15, 16, 17]
            }
        };
    }
}

export default AnomalyDetection;
