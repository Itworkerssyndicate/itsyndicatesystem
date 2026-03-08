// assets/js/ai/itws-ai-config.js
// ITWS AI - إعدادات المساعد المتقدمة

const ITWSAIConfig = {
    // ===== 1. إعدادات API =====
    api: {
        defaultModel: 'gpt-3.5-turbo',
        advancedModel: 'gpt-4-turbo-preview',
        maxTokens: 2000,
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.3,
        presencePenalty: 0.3,
        timeout: 30000, // 30 ثانية
        retryAttempts: 3,
        retryDelay: 1000 // ثانية واحدة
    },

    // ===== 2. إعدادات الواجهة =====
    interface: {
        position: 'bottom-left', // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
        buttonSize: 70,
        chatWidth: 400,
        chatHeight: 600,
        animation: true,
        animationSpeed: 0.3,
        showSuggestions: true,
        showCapabilities: true,
        showTypingIndicator: true,
        typingSpeed: 50, // ملي ثانية لكل حرف
        enableVoiceInput: true,
        enableMinimize: true,
        enableClear: true,
        maxMessages: 100,
        theme: 'auto', // 'light', 'dark', 'auto'
        borderRadius: 20,
        shadowIntensity: 'medium' // 'low', 'medium', 'high'
    },

    // ===== 3. إعدادات المحادثة =====
    conversation: {
        maxMessages: 50,
        saveHistory: true,
        maxHistory: 100,
        historyExpiry: 30, // أيام
        contextWindow: 10, // عدد الرسائل المحفوظة للسياق
        enableContext: true,
        enableLearning: true,
        enablePersonalization: true,
        defaultLanguage: 'ar',
        supportedLanguages: ['ar', 'en']
    },

    // ===== 4. إعدادات الصلاحيات =====
    permissions: {
        // مستويات الصلاحيات
        levels: {
            guest: 0,
            member: 50,
            committee_member: 50,
            committee_head: 60,
            branch_manager: 70,
            treasurer: 70,
            secretary_general: 75,
            vice_president_second_manager: 80,
            secretary_assistant_manager: 80,
            vice_president_first: 90,
            president: 100
        },

        // حدود الاستخدام اليومي
        dailyLimits: {
            guest: 10,
            committee_member: 100,
            committee_head: 150,
            branch_manager: 150,
            treasurer: 150,
            secretary_general: 200,
            vice_president_second_manager: 250,
            secretary_assistant_manager: 250,
            vice_president_first: 500,
            president: 1000
        },

        // أوامر ممنوعة للمستخدمين العاديين
        restrictedCommands: [
            'modify_system',
            'add_screen',
            'modify_code',
            'edit_permissions',
            'manage_users',
            'delete_user',
            'backup_system',
            'restore_system'
        ]
    },

    // ===== 5. إعدادات التعلم =====
    learning: {
        enabled: true,
        learningRate: 0.1,
        minInteractionsForLearning: 10,
        savePatterns: true,
        analyzeSentiment: true,
        detectIntent: true,
        extractEntities: true,
        personalizeResponses: true,
        feedbackEnabled: true
    },

    // ===== 6. إعدادات الذاكرة =====
    memory: {
        shortTerm: {
            enabled: true,
            size: 50,
            expiry: 3600 // ثانية
        },
        longTerm: {
            enabled: true,
            size: 1000,
            expiry: 2592000 // 30 يوم
        },
        cacheEnabled: true,
        cacheSize: 100,
        cacheExpiry: 3600 // ساعة
    },

    // ===== 7. إعدادات الأمان =====
    security: {
        requireAuth: true,
        encryptMessages: true,
        sanitizeInput: true,
        validateOutput: true,
        maxMessageLength: 5000,
        blockProfanity: true,
        blockSensitiveData: true,
        rateLimiting: {
            enabled: true,
            maxRequestsPerMinute: 30,
            maxRequestsPerHour: 500,
            maxRequestsPerDay: 1000
        },
        ipWhitelist: [],
        ipBlacklist: []
    },

    // ===== 8. إعدادات الصوت =====
    voice: {
        enabled: true,
        recognition: {
            language: 'ar-SA',
            continuous: false,
            interimResults: false,
            maxAlternatives: 1
        },
        synthesis: {
            language: 'ar-SA',
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            voice: 'default'
        }
    },

    // ===== 9. إعدادات المظهر =====
    themes: {
        light: {
            primary: '#667eea',
            secondary: '#764ba2',
            background: '#ffffff',
            card: '#ffffff',
            text: '#333333',
            textSecondary: '#666666',
            border: '#e0e0e0',
            shadow: 'rgba(0,0,0,0.1)',
            userMessage: '#667eea',
            aiMessage: '#f8f9fa',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        },
        dark: {
            primary: '#818cf8',
            secondary: '#a78bfa',
            background: '#1a202c',
            card: '#2d3748',
            text: '#f7fafc',
            textSecondary: '#e2e8f0',
            border: '#4a5568',
            shadow: 'rgba(0,0,0,0.3)',
            userMessage: '#818cf8',
            aiMessage: '#2d3748',
            success: '#48bb78',
            warning: '#ed8936',
            error: '#f56565',
            info: '#4299e1'
        },
        navy: {
            primary: '#3b82f6',
            secondary: '#1e3a8a',
            background: '#0a1929',
            card: '#1e2a3a',
            text: '#ffffff',
            textSecondary: '#e0e0e0',
            border: '#2d3a4f',
            shadow: 'rgba(0,0,0,0.4)',
            userMessage: '#3b82f6',
            aiMessage: '#1e2a3a',
            success: '#10b981',
            warning: '#f97316',
            error: '#ef4444',
            info: '#3b82f6'
        },
        forest: {
            primary: '#10b981',
            secondary: '#059669',
            background: '#064e3b',
            card: '#065f46',
            text: '#ffffff',
            textSecondary: '#d1fae5',
            border: '#047857',
            shadow: 'rgba(0,0,0,0.3)',
            userMessage: '#10b981',
            aiMessage: '#065f46',
            success: '#34d399',
            warning: '#fbbf24',
            error: '#f87171',
            info: '#60a5fa'
        },
        sunset: {
            primary: '#f97316',
            secondary: '#dc2626',
            background: '#7f1d1d',
            card: '#991b1b',
            text: '#ffffff',
            textSecondary: '#fed7aa',
            border: '#b91c1c',
            shadow: 'rgba(0,0,0,0.3)',
            userMessage: '#f97316',
            aiMessage: '#991b1b',
            success: '#34d399',
            warning: '#fbbf24',
            error: '#ef4444',
            info: '#60a5fa'
        }
    },

    // ===== 10. إعدادات الردود الافتراضية =====
    defaultResponses: {
        welcome: {
            guest: 'مرحباً! أنا ITWS AI المساعد الذكي. كيف يمكنني مساعدتك في تسجيل الدخول أو استعادة كلمة المرور؟',
            member: 'مرحباً! كيف يمكنني مساعدتك في مهامك اليوم؟',
            president: 'مرحباً سيدي النقيب! أنا تحت أمرك. ماذا تريد أن نعدل أو نطور اليوم؟',
            default: 'مرحباً! أنا ITWS AI المساعد الذكي. كيف يمكنني مساعدتك؟'
        },
        error: {
            notFound: 'عذراً، لم أتمكن من العثور على إجابة لسؤالك. هل يمكنك إعادة صياغته؟',
            permission: 'عذراً، ليس لديك صلاحية لتنفيذ هذا الأمر.',
            limit: 'عذراً، تجاوزت الحد اليومي للاستعلامات. يرجى المحاولة غداً.',
            timeout: 'عذراً، استغرق الطلب وقتاً طويلاً. يرجى المحاولة مرة أخرى.',
            generic: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.'
        },
        suggestions: {
            guest: [
                'كيف أسجل دخول؟',
                'نسيت كلمة المرور',
                'ليس لدي حساب',
                'مشكلة في تسجيل الدخول'
            ],
            member: [
                'مهامي اليوم',
                'جدول اجتماعاتي',
                'تقديم تقرير',
                'مساعدة في عمل'
            ],
            president: [
                'تقرير أداء اللجان',
                'تحليل نشاط الفروع',
                'إضافة شاشة جديدة',
                'تعديل صلاحيات'
            ]
        }
    },

    // ===== 11. إعدادات التكامل =====
    integrations: {
        firebase: {
            enabled: true,
            realtime: true,
            offline: true
        },
        openAI: {
            enabled: true,
            fallbackOnError: true,
            cacheResponses: true
        },
        whatsapp: {
            enabled: true,
            otp: true,
            notifications: true
        },
        email: {
            enabled: true,
            notifications: true,
            reports: true
        }
    },

    // ===== 12. إعدادات السجلات =====
    logging: {
        enabled: true,
        level: 'info', // 'debug', 'info', 'warn', 'error'
        saveToLocal: true,
        saveToServer: true,
        maxLogEntries: 1000,
        logUserActions: true,
        logErrors: true,
        logPerformance: true
    },

    // ===== 13. إعدادات الأداء =====
    performance: {
        lazyLoad: true,
        prefetch: true,
        cacheSize: 50,
        maxConcurrentRequests: 5,
        requestTimeout: 10000,
        retryOnFailure: true,
        optimizeForMobile: true,
        debounceTime: 300,
        throttleTime: 100
    },

    // ===== 14. إعدادات المطور =====
    developer: {
        debugMode: false,
        showLogs: false,
        simulateDelay: false,
        delayTime: 1000,
        mockResponses: false,
        validateInput: true,
        validateOutput: true
    },

    // ===== 15. إعدادات النسخ الاحتياطي =====
    backup: {
        autoBackup: true,
        backupInterval: 86400, // يوم
        maxBackups: 7,
        backupOnExit: true,
        encryptBackup: true,
        compressBackup: true
    },

    // ===== 16. قوالب الردود =====
    responseTemplates: {
        success: '✅ {message}',
        error: '❌ {message}',
        warning: '⚠️ {message}',
        info: 'ℹ️ {message}',
        loading: '⏳ {message}'
    },

    // ===== 17. كلمات ممنوعة =====
    profanityList: [
        'كلمة1', 'كلمة2', 'كلمة3' // سيتم إضافة القائمة الكاملة لاحقاً
    ],

    // ===== 18. بيانات حساسة =====
    sensitiveDataPatterns: [
        '\\d{14}', // الرقم القومي
        '\\d{11}', // رقم الهاتف
        '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', // البريد الإلكتروني
        '\\d{16}', // رقم البطاقة
        '\\d{3,4}' // CVV
    ],

    // ===== 19. إعدادات التصدير =====
    export: {
        formats: ['json', 'csv', 'pdf', 'txt'],
        maxExportSize: 10485760, // 10MB
        compressExports: true,
        encryptExports: true
    },

    // ===== 20. إعدادات الاستيراد =====
    import: {
        maxFileSize: 5242880, // 5MB
        allowedFormats: ['json', 'csv', 'txt'],
        validateData: true,
        sanitizeData: true
    },

    // ===== 21. إعدادات الإشعارات =====
    notifications: {
        enabled: true,
        sound: true,
        vibration: true,
        desktop: true,
        mobile: true,
        duration: 5000,
        position: 'top-right'
    },

    // ===== 22. إعدادات الاختصارات =====
    shortcuts: {
        enabled: true,
        toggleChat: 'Ctrl+Space',
        minimizeChat: 'Ctrl+M',
        clearChat: 'Ctrl+Shift+C',
        focusInput: 'Ctrl+L',
        voiceInput: 'Ctrl+V'
    },

    // ===== 23. إعدادات النسخة =====
    version: {
        number: '2.0.0',
        build: '20240308',
        environment: 'production', // 'development', 'staging', 'production'
        lastUpdate: '2024-03-08'
    },

    // ===== 24. إعدادات إضافية =====
    features: {
        enableCodeExecution: false, // للنقيب فقط
        enableScreenCapture: false,
        enableFileUpload: true,
        enableFileDownload: true,
        enableImageGeneration: false,
        enableVoiceCall: false,
        enableVideoCall: false
    },

    // ===== 25. دوال مساعدة =====
    helpers: {
        // الحصول على إعدادات معينة
        get: function(key) {
            return key.split('.').reduce((obj, i) => obj?.[i], this);
        },

        // تحديث إعدادات
        set: function(key, value) {
            const keys = key.split('.');
            const lastKey = keys.pop();
            const obj = keys.reduce((obj, i) => obj[i] = obj[i] || {}, this);
            obj[lastKey] = value;
            return true;
        },

        // دمج إعدادات
        merge: function(newConfig) {
            Object.assign(this, newConfig);
            return this;
        },

        // إعادة تعيين الإعدادات
        reset: function() {
            // لا يمكن تنفيذها هنا لأنها ستمسح الإعدادات
            // سيتم تنفيذها في ملف منفصل
        },

        // التحقق من وجود إعداد
        has: function(key) {
            try {
                return !!key.split('.').reduce((obj, i) => obj[i], this);
            } catch {
                return false;
            }
        },

        // الحصول على كل المفاتيح
        keys: function() {
            return Object.keys(this).filter(k => !['helpers', 'get', 'set', 'merge', 'reset', 'has', 'keys'].includes(k));
        },

        // تصدير الإعدادات
        export: function() {
            return JSON.parse(JSON.stringify(this));
        }
    }
};

// إضافة دوال المساعدة إلى الكائن
Object.assign(ITWSAIConfig, ITWSAIConfig.helpers);

export default ITWSAIConfig;
