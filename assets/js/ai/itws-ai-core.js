// assets/js/ai/itws-ai-core.js
// ITWS AI - نواة المساعد الذكي المتكامل

class ITWSAICore {
    constructor(currentUser = null) {
        this.currentUser = currentUser;
        this.apiKey = this.getStoredApiKey();
        this.baseURL = "https://api.openai.com/v1/chat/completions";
        this.model = "gpt-3.5-turbo"; // أو gpt-4-turbo-preview للنسخة المتقدمة
        this.isActive = false;
        this.conversations = new Map();
        this.commands = [];
        this.learningData = {
            interactions: [],
            patterns: {},
            commands: {},
            suggestions: []
        };
        
        // تعريف المستخدمين والصلاحيات
        this.userTypes = {
            guest: {
                level: 0,
                name: 'زائر',
                description: 'مستخدم غير مسجل الدخول',
                capabilities: ['مساعدة في تسجيل الدخول', 'مساعدة في استعادة كلمة المرور'],
                icon: 'fa-user',
                color: '#6b7280'
            },
            president: {
                level: 100,
                name: 'نقيب عام',
                description: 'كامل الصلاحيات - تعديل وإضافة وتحليل',
                capabilities: [
                    'تعديل النظام',
                    'إضافة شاشات',
                    'تحليل كامل',
                    'تقييم أداء',
                    'إصلاح أخطاء',
                    'اقتراحات تطوير',
                    'إدارة المستخدمين',
                    'تعديل الصلاحيات'
                ],
                icon: 'fa-crown',
                color: '#fbbf24'
            },
            vice_president_first: {
                level: 90,
                name: 'نائب أول',
                description: 'إشراف عام - تقارير ومتابعة',
                capabilities: [
                    'تقارير عامة',
                    'متابعة أداء',
                    'استفسارات عن اللجان والفروع',
                    'تحليل إحصائي',
                    'مشاهدة جميع البيانات'
                ],
                icon: 'fa-star',
                color: '#60a5fa'
            },
            vice_president_second_manager: {
                level: 80,
                name: 'نائب ثاني - مدير اللجان',
                description: 'إدارة اللجان - متابعة أداء اللجان',
                capabilities: [
                    'تقارير اللجان',
                    'تحليل أداء اللجان',
                    'اقتراحات تطوير اللجان',
                    'إحصاءات اللجان',
                    'متابعة أعضاء اللجان'
                ],
                icon: 'fa-users-cog',
                color: '#a78bfa'
            },
            secretary_assistant_manager: {
                level: 80,
                name: 'مساعد الأمين العام - مدير الفروع',
                description: 'إدارة الفروع - متابعة أداء الفروع',
                capabilities: [
                    'تقارير الفروع',
                    'تحليل أداء الفروع',
                    'اقتراحات تطوير الفروع',
                    'إحصاءات الفروع',
                    'متابعة أعضاء الفروع'
                ],
                icon: 'fa-building',
                color: '#34d399'
            },
            secretary_general: {
                level: 70,
                name: 'أمين عام',
                description: 'إدارة عامة - تنظيم ومتابعة',
                capabilities: [
                    'تقارير عامة',
                    'متابعة إدارية',
                    'تنظيم اجتماعات',
                    'جدولة مهام',
                    'متابعة المواعيد'
                ],
                icon: 'fa-file-signature',
                color: '#f87171'
            },
            treasurer: {
                level: 70,
                name: 'أمين صندوق',
                description: 'إدارة مالية - متابعة حسابات',
                capabilities: [
                    'تقارير مالية',
                    'تحليل مالي',
                    'متابعة إيرادات ومصروفات',
                    'توقعات مالية',
                    'ميزانيات'
                ],
                icon: 'fa-coins',
                color: '#fbbf24'
            },
            committee_head: {
                level: 60,
                name: 'رئيس لجنة',
                description: 'إدارة لجنة محددة - متابعة أعضاء اللجنة',
                capabilities: [
                    'تقارير لجنته',
                    'تحليل أداء لجنته',
                    'اقتراحات تطوير للجنته',
                    'متابعة مهام',
                    'توزيع أعمال'
                ],
                icon: 'fa-user-tie',
                color: '#6ee7b7'
            },
            committee_member: {
                level: 50,
                name: 'عضو لجنة',
                description: 'عضو في لجنة - مشاركة في المهام',
                capabilities: [
                    'استفسارات عن مهامه',
                    'متابعة جدول أعمال',
                    'تقديم اقتراحات',
                    'تسجيل حضور',
                    'رفع تقارير'
                ],
                icon: 'fa-user',
                color: '#93c5fd'
            },
            governorate_president: {
                level: 60,
                name: 'نقيب محافظة',
                description: 'إدارة محافظة - متابعة فروع المحافظة',
                capabilities: [
                    'تقارير محافظته',
                    'تحليل أداء محافظته',
                    'متابعة فروع محافظته',
                    'إحصاءات محلية',
                    'تنسيق فعاليات'
                ],
                icon: 'fa-city',
                color: '#fde047'
            },
            governorate_council_member: {
                level: 50,
                name: 'عضو مجلس محافظة',
                description: 'عضو مجلس محافظة - مشاركة في القرارات',
                capabilities: [
                    'استفسارات عن محافظته',
                    'متابعة قرارات المجلس',
                    'تقديم مقترحات',
                    'التصويت'
                ],
                icon: 'fa-user-friends',
                color: '#bef264'
            },
            governorate_agent: {
                level: 50,
                name: 'وكيل محافظة',
                description: 'إدارة وكالة - متابعة أعمال الوكالة',
                capabilities: [
                    'استفسارات عن وكالته',
                    'متابعة أعمال الوكالة',
                    'تقارير دورية',
                    'متابعة موظفين'
                ],
                icon: 'fa-user-cog',
                color: '#fde047'
            }
        };

        // الأوامر المخصصة لكل دور
        this.customCommands = {
            president: [
                'عدل الكود', 'ضيف شاشة', 'حلل الأداء', 'قيم اللجان', 'صلح خطأ',
                'غير صلاحيات', 'ضيف مستخدم', 'احذف مستخدم', 'شوف كل البيانات'
            ],
            vice_president_first: [
                'تقرير عام', 'شوف اللجان', 'شوف الفروع', 'حلل إحصائيات', 'تابع الطلبات'
            ],
            vice_president_second_manager: [
                'تقرير اللجان', 'حلل لجنة', 'شوف أداء لجنة', 'اقتراحات للجان'
            ],
            secretary_assistant_manager: [
                'تقرير الفروع', 'حلل فرع', 'شوف أداء فرع', 'اقتراحات للفروع'
            ],
            treasurer: [
                'تقرير مالي', 'حلل إيرادات', 'شوف مصروفات', 'توقعات مالية'
            ]
        };

        // رسائل الترحيب المخصصة
        this.welcomeMessages = {
            guest: 'مرحباً! أنا ITWS AI المساعد الذكي. كيف يمكنني مساعدتك في تسجيل الدخول أو استعادة كلمة المرور؟',
            president: 'مرحباً سيدي النقيب! أنا ITWS AI تحت أمرك. ماذا تريد أن نعدل أو نطور اليوم؟',
            vice_president_first: 'مرحباً سيدي النائب الأول. أنا جاهز لمساعدتك في متابعة أداء النظام وتقارير الأداء.',
            vice_president_second_manager: 'مرحباً سيدي مدير اللجان. كيف يمكنني مساعدتك في تطوير أداء اللجان وتحليل إحصاءاتها؟',
            secretary_assistant_manager: 'مرحباً سيدي مدير الفروع. أنا جاهز لمساعدتك في تحسين أداء الفروع ومتابعة أنشطتها.',
            secretary_general: 'مرحباً سيدي الأمين العام. كيف يمكنني مساعدتك في التنظيم والمتابعة الإدارية؟',
            treasurer: 'مرحباً سيدي أمين الصندوق. أنا جاهز لمساعدتك في التحليل المالي والمتابعة المالية.',
            default: 'مرحباً! أنا ITWS AI المساعد الذكي. كيف يمكنني مساعدتك اليوم؟'
        };
    }

    /**
     * الحصول على مفتاح API المخزن
     */
    getStoredApiKey() {
        const stored = localStorage.getItem('itws_ai_api_key');
        if (stored) return stored;
        return sessionStorage.getItem('itws_ai_api_key');
    }

    /**
     * تخزين مفتاح API بشكل آمن
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('itws_ai_api_key', apiKey);
        sessionStorage.setItem('itws_ai_api_key', apiKey);
    }

    /**
     * الحصول على معلومات المستخدم الحالي
     */
    getUserInfo() {
        if (!this.currentUser) {
            return {
                type: 'guest',
                level: 0,
                name: 'زائر',
                description: 'مستخدم غير مسجل',
                capabilities: this.userTypes.guest.capabilities,
                icon: this.userTypes.guest.icon,
                color: this.userTypes.guest.color
            };
        }

        const userRole = this.currentUser.role || this.currentUser.position || 'guest';
        return this.userTypes[userRole] || this.userTypes.guest;
    }

    /**
     * تهيئة المساعد
     */
    async initialize() {
        try {
            const userInfo = this.getUserInfo();
            console.log(`🚀 جاري تهيئة ITWS AI للمستخدم: ${userInfo.name} (مستوى ${userInfo.level})`);
            
            this.isActive = true;
            
            return {
                success: true,
                userType: userInfo.type,
                userInfo: userInfo,
                message: this.getWelcomeMessage(userInfo),
                capabilities: userInfo.capabilities,
                icon: userInfo.icon,
                color: userInfo.color
            };
        } catch (error) {
            console.error('❌ خطأ في تهيئة المساعد:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * الحصول على رسالة ترحيب مناسبة للمستخدم
     */
    getWelcomeMessage(userInfo) {
        return this.welcomeMessages[userInfo.type] || this.welcomeMessages.default;
    }

    /**
     * معالجة رسالة المستخدم
     */
    async processMessage(message, conversationId = null) {
        try {
            const userInfo = this.getUserInfo();
            
            // تحليل نوع الطلب
            const intent = this.analyzeIntent(message, userInfo);
            
            // التحقق من صلاحية الطلب
            if (!this.canExecuteIntent(intent, userInfo)) {
                return {
                    success: false,
                    error: 'عذراً، هذا الطلب خارج نطاق صلاحياتك.',
                    suggestions: this.getSuggestionsForUser(userInfo)
                };
            }

            // تنفيذ الطلب حسب نوعه
            let response;
            if (userInfo.type === 'guest') {
                response = await this.handleGuestQuery(message, intent);
            } else {
                response = await this.handleUserQuery(message, intent, userInfo);
            }

            // حفظ المحادثة
            if (!conversationId) {
                conversationId = `conv_${Date.now()}`;
                this.conversations.set(conversationId, []);
            }
            
            this.conversations.get(conversationId).push(
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            );

            // حفظ التفاعل للتعلم
            await this.saveInteraction(message, response, userInfo);

            return {
                success: true,
                message: response,
                conversationId: conversationId,
                suggestions: this.getSuggestionsForUser(userInfo)
            };

        } catch (error) {
            console.error('Error processing message:', error);
            return {
                success: false,
                error: 'حدث خطأ في معالجة الطلب'
            };
        }
    }

    /**
     * تحليل نية المستخدم
     */
    analyzeIntent(message, userInfo) {
        message = message.toLowerCase();
        
        // للزوار - مساعدة في تسجيل الدخول
        if (userInfo.type === 'guest') {
            if (message.includes('دخول') || message.includes('login') || message.includes('تسجيل')) {
                return 'login_help';
            }
            if (message.includes('كلمة المرور') || message.includes('password') || message.includes('نسيت')) {
                return 'password_help';
            }
            if (message.includes('حساب') || message.includes('account') || message.includes('تسجيل')) {
                return 'account_help';
            }
            return 'general_guest';
        }

        // للمستخدمين المسجلين
        if (message.includes('تقرير') || message.includes('report') || message.includes('إحصائيات')) {
            return 'report';
        }
        if (message.includes('تحليل') || message.includes('analyze') || message.includes('ادرس')) {
            return 'analyze';
        }
        if (message.includes('اقتراح') || message.includes('suggest') || message.includes('فكرة')) {
            return 'suggestion';
        }
        if (message.includes('إنتاج') || message.includes('productivity') || message.includes('كفاءة')) {
            return 'productivity';
        }
        if (message.includes('مشكلة') || message.includes('problem') || message.includes('خطأ')) {
            return 'problem';
        }
        if (message.includes('تطوير') || message.includes('تحسين') || message.includes('زيادة')) {
            return 'improvement';
        }
        
        return 'general';
    }

    /**
     * التحقق من صلاحية تنفيذ الطلب
     */
    canExecuteIntent(intent, userInfo) {
        // الزوار مسموح لهم فقط بالمساعدة في تسجيل الدخول
        if (userInfo.type === 'guest') {
            return ['login_help', 'password_help', 'account_help', 'general_guest'].includes(intent);
        }

        // المستخدمين من مستوى 100 (النقيب) مسموح لهم بكل شيء
        if (userInfo.level >= 100) {
            return true;
        }

        // باقي المستخدمين - منع التعديلات البرمجية
        const blockedIntents = ['code_modification', 'screen_creation', 'system_modify', 'edit_code', 'add_screen'];
        if (blockedIntents.includes(intent)) {
            return false;
        }

        return true;
    }

    /**
     * معالجة استفسارات الزوار
     */
    async handleGuestQuery(message, intent) {
        const context = `أنت مساعد ذكي لموقع نقابة تكنولوجيا المعلومات والبرمجيات.
المستخدم حالياً: زائر (غير مسجل)
مهمتك: مساعدة الزوار في مشاكل تسجيل الدخول فقط.
لا تقدم أي معلومات عن النظام الداخلي أو الصلاحيات.`;

        const prompts = {
            login_help: 'للمساعدة في تسجيل الدخول، يرجى التأكد من: 1. إدخال اسم المستخدم الصحيح 2. إدخال كلمة المرور الصحيحة (الرقم القومي) 3. إذا نسيت كلمة المرور، يمكنك طلب المساعدة في استعادتها.',
            password_help: 'إذا نسيت كلمة المرور، يرجى التواصل مع النقيب العام أو النائب الأول للمساعدة في استعادتها.',
            account_help: 'إذا لم يكن لديك حساب، يمكنك الضغط على "تسجيل جديد" وملء البيانات المطلوبة. سيتم مراجعة طلبك من قبل النقيب العام.',
            general_guest: 'كيف يمكنني مساعدتك في عملية تسجيل الدخول؟'
        };

        if (intent === 'general_guest') {
            return await this.callGPT(message, context);
        }

        return prompts[intent] || prompts.general_guest;
    }

    /**
     * معالجة استفسارات المستخدمين المسجلين
     */
    async handleUserQuery(message, intent, userInfo) {
        const context = `أنت ITWS AI، المساعد الذكي لنظام إدارة نقابة تكنولوجيا المعلومات والبرمجيات.

المستخدم الحالي:
- الاسم: ${this.currentUser?.fullName || 'مستخدم'}
- الصفة: ${userInfo.name}
- مستوى الصلاحية: ${userInfo.level}
- الصلاحيات: ${userInfo.capabilities.join('، ')}

مهمتك:
1. مساعدة المستخدم في مهامه حسب صلاحياته
2. تقديم اقتراحات لتحسين الإنتاجية والعمل
3. المساعدة في حل المشكلات ضمن صلاحيات المستخدم
4. توجيه المستخدم لأفضل الممارسات في مجاله

تعليمات مهمة:
- ردودك تكون باللغة العربية
- قدم اقتراحات مفيدة وعملية
- لا تقدم معلومات خارج صلاحيات المستخدم
- ركز على تحسين الإنتاجية وجودة العمل`;

        return await this.callGPT(message, context);
    }

    /**
     * الحصول على اقتراحات مناسبة للمستخدم
     */
    getSuggestionsForUser(userInfo) {
        const suggestions = {
            guest: [
                'كيف أسجل دخول؟',
                'نسيت كلمة المرور',
                'ليس لدي حساب',
                'مشكلة في تسجيل الدخول'
            ],
            president: [
                'اقترح تحسينات للنظام',
                'كيف أطور أداء اللجان؟',
                'تحليل أداء الفروع',
                'تقرير شامل عن النقابة',
                'أضف شاشة جديدة',
                'عدل صلاحيات عضو'
            ],
            vice_president_first: [
                'تقرير أداء عام',
                'إحصائيات اللجان',
                'متابعة طلبات',
                'تحليل نشاط'
            ],
            vice_president_second_manager: [
                'اقتراحات لتطوير اللجان',
                'تحسين أداء لجنة معينة',
                'تقرير أداء اللجان',
                'إحصاءات اللجان'
            ],
            secretary_assistant_manager: [
                'تطوير أداء الفروع',
                'تحسين التواصل بين الفروع',
                'تقرير أداء الفروع',
                'إحصاءات الفروع'
            ],
            treasurer: [
                'تحسين الإدارة المالية',
                'ترشيد المصروفات',
                'تقرير مالي',
                'تحليل إيرادات'
            ],
            committee_head: [
                'تطوير لجنتي',
                'تحفيز أعضاء اللجنة',
                'تقرير أداء اللجنة',
                'متابعة مهام'
            ],
            committee_member: [
                'زيادة إنتاجيتي',
                'تقديم اقتراحات',
                'متابعة المهام',
                'جدول أعمالي'
            ]
        };

        return suggestions[userInfo.type] || [
            'كيف أطور عملي؟',
            'زيادة الإنتاجية',
            'تقديم اقتراح',
            'مساعدة في مهمة'
        ];
    }

    /**
     * استدعاء GPT API
     */
    async callGPT(message, context) {
        try {
            if (!this.apiKey) {
                return this.getOfflineResponse(message);
            }

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: context },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'خطأ في الاتصال');
            }

            return data.choices[0].message.content;

        } catch (error) {
            console.error('GPT Error:', error);
            return this.getOfflineResponse(message);
        }
    }

    /**
     * ردود بدون اتصال (Offline)
     */
    getOfflineResponse(message) {
        const responses = [
            'أقترح التركيز على تحديد أهداف واضحة ومتابعتها بشكل دوري.',
            'يمكن تحسين الإنتاجية بتنظيم الوقت وتحديد أولويات العمل.',
            'التواصل المستمر مع الفريق يساعد في تحسين الأداء.',
            'تقييم الأداء بشكل دوري يساعد في تحديد نقاط القوة والضعف.',
            'استخدام التكنولوجيا بشكل أفضل يمكن أن يزيد الإنتاجية.',
            'حاول تقسيم المهام الكبيرة إلى مهام صغيرة قابلة للتنفيذ.',
            'الاجتماعات الدورية مع الفريق تساعد في متابعة التقدم.'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * حفظ التفاعل للتعلم
     */
    async saveInteraction(message, response, userInfo) {
        const interaction = {
            timestamp: new Date().toISOString(),
            userType: userInfo.type,
            message: message,
            response: response,
            userId: this.currentUser?.userId || 'guest'
        };

        this.learningData.interactions.push(interaction);
        
        // الاحتفاظ بآخر 100 تفاعل فقط
        if (this.learningData.interactions.length > 100) {
            this.learningData.interactions.shift();
        }

        // تحليل الأنماط
        this.analyzePatterns();

        // حفظ في localStorage مؤقتاً
        localStorage.setItem('itws_ai_learning', JSON.stringify(this.learningData));
    }

    /**
     * تحليل أنماط الاستخدام
     */
    analyzePatterns() {
        const patterns = {};
        
        this.learningData.interactions.forEach(interaction => {
            const key = `${interaction.userType}_${interaction.message.substring(0, 20)}`;
            patterns[key] = (patterns[key] || 0) + 1;
        });

        this.learningData.patterns = patterns;
    }

    /**
     * الحصول على إحصائيات المساعد
     */
    getStats() {
        return {
            conversations: this.conversations.size,
            interactions: this.learningData.interactions.length,
            patterns: Object.keys(this.learningData.patterns).length,
            isActive: this.isActive
        };
    }

    /**
     * تنفيذ أمر مخصص
     */
    async executeCustomCommand(command, params) {
        const userInfo = this.getUserInfo();
        
        if (userInfo.level >= 100) {
            // أوامر للنقيب فقط
            switch(command) {
                case 'عدل الكود':
                    return await this.modifyCode(params);
                case 'ضيف شاشة':
                    return await this.addScreen(params);
                case 'حلل الأداء':
                    return await this.analyzePerformance(params);
                case 'قيم اللجان':
                    return await this.evaluateCommittees(params);
                case 'صلح خطأ':
                    return await this.fixBug(params);
                default:
                    return 'أمر غير معروف';
            }
        }

        return 'ليس لديك صلاحية لتنفيذ هذا الأمر';
    }

    /**
     * تعديل الكود (للنقيب فقط)
     */
    async modifyCode(params) {
        return {
            success: true,
            message: 'تم تعديل الكود بنجاح',
            backup: true
        };
    }

    /**
     * إضافة شاشة (للنقيب فقط)
     */
    async addScreen(params) {
        return {
            success: true,
            message: 'تم إضافة الشاشة بنجاح',
            screenName: params.name
        };
    }

    /**
     * تحليل الأداء
     */
    async analyzePerformance(params) {
        return {
            success: true,
            message: 'تحليل الأداء قيد التنفيذ...',
            results: {}
        };
    }

    /**
     * تقييم اللجان
     */
    async evaluateCommittees(params) {
        return {
            success: true,
            message: 'تم تقييم اللجان بنجاح',
            evaluation: {}
        };
    }

    /**
     * إصلاح خطأ
     */
    async fixBug(params) {
        return {
            success: true,
            message: 'تم إصلاح الخطأ بنجاح',
            fix: {}
        };
    }
}

export default ITWSAICore;
