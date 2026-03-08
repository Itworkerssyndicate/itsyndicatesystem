// assets/js/security-config.js
// إعدادات نظام الأمان

const SecurityConfig = {
    // إعدادات عامة
    general: {
        sessionTimeout: 30, // دقيقة
        maxLoginAttempts: 5,
        lockoutDuration: 15, // دقيقة
        requireBiometric: true,
        require2FAOnAnomaly: true
    },

    // إعدادات المصادقة الحيوية
    biometric: {
        face: {
            enabled: true,
            mandatory: true,
            threshold: 0.7,
            livenessDetection: true
        },
        fingerprint: {
            enabled: true,
            mandatory: true,
            threshold: 0.8
        }
    },

    // إعدادات 2FA
    twoFA: {
        enabled: true,
        methods: ['sms', 'whatsapp', 'email'],
        codeLength: 6,
        codeExpiry: 300, // 5 دقائق
        maxAttempts: 3
    },

    // إعدادات كشف الشذوذ
    anomaly: {
        enabled: true,
        threshold: 0.6,
        maxActionsPerMinute: 30,
        analyzeLocation: true,
        analyzeTime: true,
        analyzeDevice: true,
        analyzeSpeed: true,
        analyzeSequence: true
    },

    // إعدادات التشفير
    encryption: {
        algorithm: 'AES-GCM',
        keyLength: 256,
        iterations: 100000,
        hash: 'SHA-256',
        enableFileEncryption: true
    },

    // إعدادات المراقبة
    monitoring: {
        logAllActions: true,
        logAnomalies: true,
        notifyPresidentOnCritical: true,
        heartbeatInterval: 5000, // 5 ثواني
        maxSessionDuration: 30 * 60 * 1000 // 30 دقيقة
    },

    // قائمة الصفحات المحمية
    protectedPages: [
        '/dashboard',
        '/committees',
        '/branches',
        '/members',
        '/tracking',
        '/finance',
        '/settings',
        '/profile'
    ],

    // مستويات الأمان للمستخدمين
    userSecurityLevels: {
        president: {
            level: 'critical',
            require2FA: true,
            requireBiometric: true,
            monitorIntensity: 'high'
        },
        vice_president_first: {
            level: 'high',
            require2FA: true,
            requireBiometric: true,
            monitorIntensity: 'high'
        },
        vice_president_second_manager: {
            level: 'high',
            require2FA: true,
            requireBiometric: true,
            monitorIntensity: 'high'
        },
        secretary_assistant_manager: {
            level: 'high',
            require2FA: true,
            requireBiometric: true,
            monitorIntensity: 'high'
        },
        treasurer: {
            level: 'high',
            require2FA: true,
            requireBiometric: true,
            monitorIntensity: 'high'
        },
        committee_head: {
            level: 'medium',
            require2FA: false,
            requireBiometric: true,
            monitorIntensity: 'medium'
        },
        committee_member: {
            level: 'medium',
            require2FA: false,
            requireBiometric: true,
            monitorIntensity: 'medium'
        },
        governorate_president: {
            level: 'medium',
            require2FA: false,
            requireBiometric: true,
            monitorIntensity: 'medium'
        },
        governorate_council_member: {
            level: 'low',
            require2FA: false,
            requireBiometric: true,
            monitorIntensity: 'low'
        },
        governorate_agent: {
            level: 'low',
            require2FA: false,
            requireBiometric: true,
            monitorIntensity: 'low'
        }
    }
};

export default SecurityConfig;
