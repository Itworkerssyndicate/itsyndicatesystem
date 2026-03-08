// assets/js/security/anomaly-detection.js
// نظام كشف الشذوذ والسلوك غير المعتاد - تحليل ذكي لكل المستخدمين

class AnomalyDetection {
    constructor(userId = null) {
        this.userId = userId;
        this.behaviorProfile = null;
        this.anomalyThreshold = 0.6; // عتبة الشذوذ
        this.sessionStart = Date.now();
        this.actions = [];
        this.maxActionsPerMinute = 30;
        this.typingSpeedHistory = [];
        this.mouseMovements = [];
        this.pageTransitions = [];
        this.learningRate = 0.1; // معدل التعلم
        
        // أنماط السلوك الطبيعي
        this.normalPatterns = {
            typingSpeed: { min: 200, max: 400 }, // حرف في الدقيقة
            mouseSpeed: { min: 100, max: 800 }, // بكسل في الثانية
            clickInterval: { min: 500, max: 5000 }, // ملي ثانية
            pageStayDuration: { min: 10, max: 600 }, // ثانية
            actionsPerMinute: { min: 5, max: 25 }
        };

        this.init();
    }

    // ===== 1. تهيئة النظام =====
    async init() {
        await this.buildUserProfile();
        this.startMonitoring();
    }

    // ===== 2. بناء ملف سلوكي للمستخدم =====
    async buildUserProfile() {
        // جلب بيانات المستخدم السابقة
        const userData = await this.getUserHistoricalData();
        
        this.behaviorProfile = {
            userId: this.userId,
            normalLoginTimes: this.analyzeLoginTimes(userData.logins || []),
            normalLocations: this.analyzeLocations(userData.locations || []),
            normalDevices: this.analyzeDevices(userData.devices || []),
            normalPages: this.analyzePages(userData.pages || []),
            normalActions: this.analyzeActions(userData.actions || []),
            normalTypingSpeed: this.analyzeTypingSpeed(userData.typingHistory || []),
            normalMousePatterns: this.analyzeMousePatterns(userData.mouseMovements || []),
            baseline: {
                avgLoginPerDay: this.calculateAverage(userData.logins, 'perDay'),
                avgActionsPerSession: this.calculateAverage(userData.actions, 'perSession'),
                commonHours: this.findCommonHours(userData.logins),
                commonPages: this.findCommonPages(userData.pages),
                commonLocations: this.findCommonLocations(userData.locations),
                commonDevices: this.findCommonDevices(userData.devices),
                typingProfile: this.buildTypingProfile(userData.typingHistory),
                mouseProfile: this.buildMouseProfile(userData.mouseMovements)
            },
            lastUpdated: new Date().toISOString()
        };

        await this.saveProfile();
        return this.behaviorProfile;
    }

    // ===== 3. بدء المراقبة =====
    startMonitoring() {
        // مراقبة حركة الماوس
        this.trackMouseMovement();
        
        // مراقبة سرعة الكتابة
        this.trackTypingSpeed();
        
        // مراقبة التنقل بين الصفحات
        this.trackPageTransitions();
        
        // مراقبة سرعة الإجراءات
        setInterval(() => this.checkActionSpeed(), 5000);
        
        // مراقبة وقت الجلسة
        setInterval(() => this.checkSessionDuration(), 60000);
    }

    // ===== 4. مراقبة حركة الماوس =====
    trackMouseMovement() {
        let lastMove = Date.now();
        let positions = [];

        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            const timeDiff = now - lastMove;
            
            if (timeDiff > 50) { // كل 50ms
                positions.push({
                    x: e.clientX,
                    y: e.clientY,
                    time: now
                });
                
                lastMove = now;
            }
            
            // حفظ آخر 100 حركة
            if (positions.length > 100) {
                positions.shift();
            }
        });

        // تحليل حركة الماوس كل 10 ثواني
        setInterval(() => {
            if (positions.length > 10) {
                const analysis = this.analyzeMouseMovements(positions);
                this.mouseMovements.push(analysis);
                
                if (analysis.isAnomaly) {
                    this.detectAnomaly({
                        type: 'mouse_pattern',
                        score: analysis.score,
                        details: 'نمط حركة ماوس غير معتاد'
                    });
                }
            }
        }, 10000);
    }

    // ===== 5. تحليل حركة الماوس =====
    analyzeMouseMovements(positions) {
        let totalDistance = 0;
        let speeds = [];
        
        for (let i = 1; i < positions.length; i++) {
            const distance = Math.sqrt(
                Math.pow(positions[i].x - positions[i-1].x, 2) +
                Math.pow(positions[i].y - positions[i-1].y, 2)
            );
            totalDistance += distance;
            
            const timeDiff = positions[i].time - positions[i-1].time;
            const speed = distance / (timeDiff / 1000); // بكسل في الثانية
            speeds.push(speed);
        }

        const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        
        // التحقق من الشذوذ
        const normalSpeed = this.behaviorProfile?.baseline?.mouseProfile?.avgSpeed || 300;
        const speedDiff = Math.abs(avgSpeed - normalSpeed) / normalSpeed;
        
        return {
            avgSpeed,
            totalDistance,
            positions: positions.length,
            score: Math.min(speedDiff, 1),
            isAnomaly: speedDiff > 0.5
        };
    }

    // ===== 6. مراقبة سرعة الكتابة =====
    trackTypingSpeed() {
        let keystrokes = [];
        let lastKeyTime = Date.now();

        document.addEventListener('keydown', (e) => {
            if (e.key.length === 1) { // أحرف فقط
                const now = Date.now();
                const timeDiff = now - lastKeyTime;
                
                keystrokes.push({
                    key: e.key,
                    time: now,
                    interval: timeDiff
                });
                
                lastKeyTime = now;
                
                // حفظ آخر 50 ضغطة
                if (keystrokes.length > 50) {
                    keystrokes.shift();
                }
            }
        });

        // تحليل سرعة الكتابة كل 30 ثانية
        setInterval(() => {
            if (keystrokes.length > 10) {
                const analysis = this.analyzeTypingSpeed(keystrokes);
                this.typingSpeedHistory.push(analysis);
                
                if (analysis.isAnomaly) {
                    this.detectAnomaly({
                        type: 'typing_speed',
                        score: analysis.score,
                        details: 'سرعة كتابة غير معتادة'
                    });
                }
            }
        }, 30000);
    }

    // ===== 7. تحليل سرعة الكتابة =====
    analyzeTypingSpeed(keystrokes) {
        const intervals = keystrokes.map(k => k.interval).filter(i => i > 0);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const speed = 60000 / avgInterval; // حرف في الدقيقة
        
        // التحقق من الشذوذ
        const normalSpeed = this.behaviorProfile?.baseline?.typingProfile?.avgSpeed || 300;
        const speedDiff = Math.abs(speed - normalSpeed) / normalSpeed;
        
        return {
            speed,
            avgInterval,
            keystrokes: keystrokes.length,
            score: Math.min(speedDiff, 1),
            isAnomaly: speedDiff > 0.5
        };
    }

    // ===== 8. مراقبة التنقل بين الصفحات =====
    trackPageTransitions() {
        let currentPage = window.location.pathname;
        let startTime = Date.now();

        // مراقبة تغيير الصفحة
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const transition = {
                    from: currentPage,
                    to: new URL(link.href).pathname,
                    duration: (Date.now() - startTime) / 1000, // بالثواني
                    time: new Date().toISOString()
                };
                
                this.pageTransitions.push(transition);
                
                // تحليل نمط التنقل
                this.analyzePageTransition(transition);
                
                currentPage = transition.to;
                startTime = Date.now();
            }
        });
    }

    // ===== 9. تحليل نمط التنقل =====
    analyzePageTransition(transition) {
        const commonPages = this.behaviorProfile?.baseline?.commonPages || [];
        
        // التحقق من الصفحات غير المعتادة
        if (!commonPages.includes(transition.to) && commonPages.length > 0) {
            this.detectAnomaly({
                type: 'unusual_page',
                score: 0.5,
                details: `زيارة صفحة غير معتادة: ${transition.to}`
            });
        }

        // التحقق من سرعة التنقل
        if (transition.duration < 5) {
            this.detectAnomaly({
                type: 'fast_navigation',
                score: 0.3,
                details: 'تنقل سريع جداً بين الصفحات'
            });
        }
    }

    // ===== 10. تحليل وقت تسجيل الدخول الحالي =====
    async analyzeCurrentLogin(loginData) {
        if (!this.behaviorProfile) {
            await this.buildUserProfile();
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
                details: `تسجيل دخول من جهاز جديد`
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

    // ===== 11. كشف شذوذ الوقت =====
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

    // ===== 12. كشف شذوذ الموقع =====
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
        
        if (location.country && location.country !== 'EG') {
            riskScore += 0.3;
        }
        
        return {
            isAnomaly: true,
            score: riskScore
        };
    }

    // ===== 13. كشف شذوذ الجهاز =====
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

    // ===== 14. كشف شذوذ المحاولات =====
    async detectAttemptsAnomaly(userId) {
        const attempts = await this.getLoginAttempts(userId, 5);
        
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

    // ===== 15. تحليل سلوك الجلسة =====
    analyzeSessionBehavior(action) {
        this.actions.push({
            action: action,
            timestamp: Date.now()
        });

        // تنظيف الإجراءات القديمة
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

        // التحقق من تكرار الإجراءات
        const repetitive = this.detectRepetitiveActions();
        if (repetitive.isAnomaly) {
            return repetitive;
        }

        return {
            isAnomaly: false,
            score: 0
        };
    }

    // ===== 16. كشف الإجراءات المتكررة =====
    detectRepetitiveActions() {
        if (this.actions.length < 10) return { isAnomaly: false, score: 0 };

        const recentActions = this.actions.slice(-10);
        const uniqueActions = new Set(recentActions.map(a => a.action));
        
        if (uniqueActions.size === 1) {
            return {
                isAnomaly: true,
                type: 'repetitive',
                score: 0.5,
                details: `تكرار نفس الإجراء 10 مرات`
            };
        }

        return { isAnomaly: false, score: 0 };
    }

    // ===== 17. حساب درجة المخاطر =====
    calculateRiskScore(anomalies) {
        if (anomalies.length === 0) return 0;
        
        const weights = {
            unusual_time: 0.25,
            new_location: 0.35,
            new_device: 0.25,
            multiple_attempts: 0.3,
            too_fast: 0.3,
            repetitive: 0.2,
            typing_speed: 0.2,
            mouse_pattern: 0.2,
            unusual_page: 0.15,
            fast_navigation: 0.15
        };

        let totalScore = 0;
        anomalies.forEach(a => {
            totalScore += a.score * (weights[a.type] || 0.2);
        });

        return Math.min(totalScore, 1);
    }

    // ===== 18. الحصول على مستوى المخاطر =====
    getRiskLevel(score) {
        if (score > 0.8) return 'critical';
        if (score > 0.6) return 'high';
        if (score > 0.4) return 'medium';
        if (score > 0.2) return 'low';
        return 'none';
    }

    // ===== 19. كشف الشذوذ =====
    async detectAnomaly(anomaly) {
        console.warn('🚨 Anomaly detected:', anomaly);
        
        // حساب المخاطر الإجمالية
        const riskScore = anomaly.score;
        const riskLevel = this.getRiskLevel(riskScore);
        
        const fullAnomaly = {
            ...anomaly,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            riskScore,
            riskLevel,
            sessionDuration: (Date.now() - this.sessionStart) / 1000
        };

        // تسجيل الشذوذ
        await this.logAnomaly(fullAnomaly);

        // اتخاذ الإجراء المناسب حسب مستوى الخطر
        return await this.handleAnomaly(fullAnomaly);
    }

    // ===== 20. معالجة الشذوذ =====
    async handleAnomaly(anomaly) {
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

    // ===== 21. تسجيل الشذوذ =====
    async logAnomaly(anomaly) {
        // حفظ في localStorage مؤقتاً
        const anomalies = JSON.parse(localStorage.getItem('anomalies') || '[]');
        anomalies.push(anomaly);
        
        // الاحتفاظ بآخر 100 شذوذ فقط
        if (anomalies.length > 100) {
            anomalies.shift();
        }
        
        localStorage.setItem('anomalies', JSON.stringify(anomalies));
        
        // هنا يتم الإرسال للخادم لاحقاً
        console.log('📝 Anomaly logged:', anomaly);
    }

    // ===== 22. إشعار المستخدم =====
    async notifyUser(anomaly) {
        const notification = {
            type: 'security_alert',
            title: '🔒 تنبيه أمني',
            message: `تم اكتشاف نشاط غير معتاد: ${anomaly.details}`,
            timestamp: new Date().toISOString()
        };

        // عرض إشعار للمستخدم
        if (window.utils) {
            utils.showToast(notification.message, 'warning');
        }
    }

    // ===== 23. إشعار النقيب =====
    async notifyPresident(anomaly) {
        console.log('👑 Notifying president:', anomaly);
        
        // هنا يتم إرسال إشعار للنقيب
        // يمكن استخدام نظام الإشعارات
    }

    // ===== 24. حظر المستخدم =====
    async blockUser() {
        console.log('🔒 Blocking user:', this.userId);
        
        // مسح الجلسة
        sessionStorage.removeItem('currentUser');
        
        // توجيه لصفحة الدخول مع رسالة
        window.location.href = 'index.html?blocked=true';
    }

    // ===== 25. طلب 2FA =====
    async require2FA() {
        console.log('🔐 Requiring 2FA for user:', this.userId);
        
        // هنا يتم استدعاء نظام 2FA
        if (window.twoFA) {
            await window.twoFA.show2FAPrompt();
        }
    }

    // ===== 26. دوال مساعدة =====
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

    async getLocationFromIP(ip) {
        // هنا يتم استدعاء API لجلب الموقع من IP
        return null;
    }

    async getLoginAttempts(userId, minutes) {
        // هنا يتم جلب المحاولات من قاعدة البيانات
        return [];
    }

    async getUserHistoricalData() {
        // هنا يتم جلب البيانات التاريخية للمستخدم
        return {};
    }

    analyzeLoginTimes(logins) { return logins; }
    analyzeLocations(locations) { return locations; }
    analyzeDevices(devices) { return devices; }
    analyzePages(pages) { return pages; }
    analyzeActions(actions) { return actions; }
    analyzeTypingSpeed(history) { return { avgSpeed: 300 }; }
    analyzeMousePatterns(movements) { return { avgSpeed: 300 }; }

    calculateAverage(data, type) { return 0; }
    findCommonHours(logins) { return [9, 10, 11, 12, 13, 14, 15, 16, 17]; }
    findCommonPages(pages) { return ['/dashboard', '/committees', '/branches']; }
    findCommonLocations(locations) { return []; }
    findCommonDevices(devices) { return []; }

    buildTypingProfile(history) {
        return {
            avgSpeed: 300,
            patterns: []
        };
    }

    buildMouseProfile(movements) {
        return {
            avgSpeed: 300,
            patterns: []
        };
    }

    async saveProfile() {
        console.log('✅ Profile saved for user:', this.userId);
        localStorage.setItem(`profile_${this.userId}`, JSON.stringify(this.behaviorProfile));
    }

    async logOnly() {
        console.log('📝 Logging only');
    }

    checkActionSpeed() {
        // يتم تنفيذها في startMonitoring
    }

    checkSessionDuration() {
        const duration = (Date.now() - this.sessionStart) / 1000 / 60; // بالدقائق
        
        if (duration > 120) { // أكثر من ساعتين
            this.detectAnomaly({
                type: 'long_session',
                score: 0.3,
                details: 'جلسة طويلة غير معتادة'
            });
        }
    }

    // ===== 27. الحصول على إحصائيات =====
    getStats() {
        return {
            actionsTracked: this.actions.length,
            typingSamples: this.typingSpeedHistory.length,
            mouseSamples: this.mouseMovements.length,
            pageTransitions: this.pageTransitions.length,
            sessionDuration: (Date.now() - this.sessionStart) / 1000,
            profileExists: !!this.behaviorProfile
        };
    }

    // ===== 28. إعادة تعيين =====
    reset() {
        this.actions = [];
        this.typingSpeedHistory = [];
        this.mouseMovements = [];
        this.pageTransitions = [];
        this.sessionStart = Date.now();
    }
}

export default AnomalyDetection;
