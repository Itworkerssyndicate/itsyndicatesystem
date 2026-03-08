// assets/js/ai-config.js
// إعدادات المساعد التقني ITWS AI

const AIConfig = {
    // مفتاح API (يتم تعبئته من قبل المستخدم)
    apiKey: null,
    
    // نموذج GPT المستخدم
    model: 'gpt-4-turbo-preview', // أو 'gpt-3.5-turbo' للنسخة الأسرع
    
    // إعدادات المساعد
    settings: {
        maxTokens: 2000,
        temperature: 0.7,
        enableCodeModification: true,
        enableScreenCreation: true,
        enableAnalysis: true,
        enableEvaluation: true,
        enableSuggestions: true,
        enableBackup: true,
        maxConversations: 100
    },
    
    // حدود الاستخدام
    limits: {
        president: {
            queriesPerDay: 1000,
            codeModificationsPerDay: 100,
            screensPerDay: 50
        },
        vice_president_first: {
            queriesPerDay: 200,
            codeModificationsPerDay: 0,
            screensPerDay: 0
        },
        default: {
            queriesPerDay: 50,
            codeModificationsPerDay: 0,
            screensPerDay: 0
        }
    },
    
    // رسائل الترحيب حسب الدور
    welcomeMessages: {
        president: 'مرحباً سيدي النقيب! أنا ITWS AI تحت أمرك. ماذا تريد أن نعدل أو نطور اليوم؟',
        vice_president_first: 'مرحباً سيدي النائب الأول. كيف يمكنني مساعدتك في متابعة النظام؟',
        vice_president_second_manager: 'مرحباً سيدي مدير اللجان. أنا جاهز لمساعدتك في إدارة اللجان.',
        secretary_assistant_manager: 'مرحباً سيدي مدير الفروع. أنا جاهز لمساعدتك في إدارة الفروع.',
        default: 'مرحباً! أنا ITWS AI المساعد التقني. كيف يمكنني مساعدتك؟'
    }
};

export default AIConfig;
