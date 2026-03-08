// assets/js/itws-ai-config.js
// ITWS AI - إعدادات المساعد الذكي

const ITWSAIConfig = {
    // إعدادات API
    api: {
        defaultModel: 'gpt-3.5-turbo',
        advancedModel: 'gpt-4-turbo-preview',
        maxTokens: 500,
        temperature: 0.7
    },

    // إعدادات الواجهة
    interface: {
        position: 'bottom-left', // bottom-left, bottom-right
        buttonSize: 55,
        chatWidth: 350,
        chatHeight: 500,
        animation: true
    },

    // إعدادات المحادثة
    conversation: {
        maxMessages: 50,
        saveHistory: true,
        maxHistory: 10
    },

    // إعدادات الصلاحيات
    permissions: {
        president: {
            canModifyCode: true,
            canAddScreens: true,
            canAnalyzeAll: true,
            canEvaluateAll: true,
            canAccessAllData: true
        },
        vice_president_first: {
            canModifyCode: false,
            canAddScreens: false,
            canAnalyzeAll: true,
            canEvaluateAll: false,
            canAccessMostData: true
        },
        default: {
            canModifyCode: false,
            canAddScreens: false,
            canAnalyzeAll: false,
            canEvaluateAll: false,
            canAccessOwnData: true
        }
    },

    // رسائل الترحيب
    welcomeMessages: {
        guest: 'مرحباً! أنا ITWS AI المساعد الذكي. كيف يمكنني مساعدتك في تسجيل الدخول؟',
        president: 'مرحباً سيدي النقيب! أنا تحت أمرك. ماذا تريد أن نعدل اليوم؟',
        vice_president_first: 'مرحباً سيدي النائب الأول. كيف يمكنني مساعدتك في متابعة النظام؟',
        vice_president_second_manager: 'مرحباً سيدي مدير اللجان. أنا جاهز لمساعدتك في إدارة اللجان.',
        secretary_assistant_manager: 'مرحباً سيدي مدير الفروع. أنا جاهز لمساعدتك في إدارة الفروع.',
        secretary_general: 'مرحباً سيدي الأمين العام. كيف يمكنني مساعدتك في التنظيم؟',
        treasurer: 'مرحباً سيدي أمين الصندوق. أنا جاهز لمساعدتك في التحليل المالي.',
        default: 'مرحباً! أنا ITWS AI المساعد الذكي. كيف يمكنني مساعدتك؟'
    },

    // اقتراحات سريعة حسب الدور
    quickSuggestions: {
        guest: [
            'كيف أسجل دخول؟',
            'نسيت كلمة المرور',
            'ليس لدي حساب',
            'مشكلة في تسجيل الدخول'
        ],
        president: [
            'اقترح تحسينات',
            'تحليل أداء اللجان',
            'إضافة شاشة جديدة',
            'تعديل صلاحيات'
        ],
        vice_president_first: [
            'تقرير أداء',
            'إحصائيات عامة',
            'متابعة طلبات',
            'تحليل نشاط'
        ],
        vice_president_second_manager: [
            'تقرير اللجان',
            'تحليل أداء لجنة',
            'اقتراحات تطوير',
            'إحصاءات اللجان'
        ],
        secretary_assistant_manager: [
            'تقرير الفروع',
            'تحليل أداء فرع',
            'اقتراحات تطوير',
            'إحصاءات الفروع'
        ],
        treasurer: [
            'تقرير مالي',
            'تحليل إيرادات',
            'ترشيد مصروفات',
            'توقعات مالية'
        ],
        committee_head: [
            'تقرير لجنتي',
            'تحفيز الأعضاء',
            'متابعة مهام',
            'اقتراحات'
        ],
        committee_member: [
            'زيادة إنتاجيتي',
            'تقديم اقتراح',
            'متابعة مهامي',
            'جدول أعمالي'
        ]
    }
};

export default ITWSAIConfig;
