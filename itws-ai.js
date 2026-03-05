// assets/js/itws-ai.js

/**
 * ITWS AI - المساعد الذكي لنظام إدارة النقابة
 * هذا المساعد لديه صلاحية التعديل على الكود وإضافة شاشات جديدة
 * لا يمكن لأحد استخدامه إلا النقيب العام فقط
 */

class ITWSAI {
    constructor(database, currentUser) {
        this.database = database;
        this.currentUser = currentUser;
        this.isActive = false;
        this.learningData = {};
        this.codeTemplates = {
            screen: this.getScreenTemplate(),
            component: this.getComponentTemplate(),
            function: this.getFunctionTemplate()
        };
    }

    // التحقق من صلاحية النقيب العام فقط
    checkPermission() {
        if (!this.currentUser || this.currentUser.role !== 'president') {
            throw new Error('⚠️ هذا المساعد متاح فقط للنقيب العام');
        }
        return true;
    }

    // تهيئة المساعد
    async initialize() {
        try {
            this.checkPermission();
            
            console.log('🚀 ITWS AI جاري التهيئة...');
            
            // تحميل البيانات السابقة
            await this.loadLearningData();
            
            // تفعيل المستمعين
            this.activateListeners();
            
            this.isActive = true;
            
            // تسجيل التفعيل
            await this.logAction('ITWS AI تم تفعيل', 'system');
            
            console.log('✅ ITWS AI جاهز للعمل');
            
            return {
                success: true,
                message: 'ITWS AI جاهز للعمل',
                capabilities: this.getCapabilities()
            };
        } catch (error) {
            console.error('❌ خطأ في تهيئة ITWS AI:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // قدرات المساعد
    getCapabilities() {
        return {
            canModifyCode: true,
            canAddScreens: true,
            canModifyDatabase: true,
            canAnalyzeData: true,
            canGenerateReports: true,
            canHelpUsers: true,
            canManageSystem: true,
            canLearn: true,
            canSuggest: true,
            canTrackIssues: true
        };
    }

    // قالب إضافة شاشة جديدة
    getScreenTemplate() {
        return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{SCREEN_TITLE}} - ITWS Union</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        {{STYLES}}
    </style>
</head>
<body>
    <!-- الشريط الجانبي -->
    <div class="sidebar">
        <!-- يتم نسخ الشريط الجانبي من dashboard.html -->
    </div>

    <!-- المحتوى الرئيسي -->
    <div class="main-content">
        <div class="top-bar">
            <div class="page-title">
                <h2>{{SCREEN_TITLE}}</h2>
                <p>{{SCREEN_DESCRIPTION}}</p>
            </div>
        </div>

        <!-- محتوى الشاشة -->
        <div class="content-card">
            {{SCREEN_CONTENT}}
        </div>
    </div>

    <!-- ITWS AI -->
    <div class="ai-toggle" onclick="toggleAIChat()">
        <div class="pulse"></div>
        <i class="fas fa-robot"></i>
    </div>

    <script type="module">
        {{SCRIPTS}}
    </script>
</body>
</html>`;
    }

    // طلب تعديل برمجي
    async requestCodeChange(request) {
        try {
            this.checkPermission();
            
            const changeRequest = {
                id: `change_${Date.now()}`,
                type: request.type, // 'add_screen', 'modify_code', 'fix_bug', 'add_feature'
                title: request.title,
                description: request.description,
                files: request.files || [],
                changes: request.changes || {},
                requestedBy: this.currentUser.userId,
                requestedAt: new Date().toISOString(),
                status: 'pending',
                priority: request.priority || 'medium'
            };

            // حفظ الطلب
            const requestsRef = ref(this.database, 'itws_ai/code_requests');
            await push(requestsRef, changeRequest);

            // معالجة الطلب حسب النوع
            let result;
            switch(request.type) {
                case 'add_screen':
                    result = await this.addNewScreen(request);
                    break;
                case 'modify_code':
                    result = await this.modifyCode(request);
                    break;
                case 'fix_bug':
                    result = await this.fixBug(request);
                    break;
                case 'add_feature':
                    result = await this.addFeature(request);
                    break;
                default:
                    result = await this.processGeneralRequest(request);
            }

            // تحديث حالة الطلب
            await update(ref(database, `itws_ai/code_requests/${changeRequest.id}`), {
                status: 'completed',
                result: result,
                completedAt: new Date().toISOString()
            });

            return {
                success: true,
                requestId: changeRequest.id,
                result: result
            };

        } catch (error) {
            console.error('خطأ في طلب التعديل:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // إضافة شاشة جديدة
    async addNewScreen(screenConfig) {
        try {
            this.checkPermission();
            
            const {
                screenName,
                screenTitle,
                screenDescription,
                screenContent,
                permissions = ['president']
            } = screenConfig;

            // إنشاء ملف HTML جديد
            const fileName = `${screenName.toLowerCase().replace(/\s+/g, '_')}.html`;
            
            // تجهيز محتوى الشاشة
            const screenHTML = this.codeTemplates.screen
                .replace('{{SCREEN_TITLE}}', screenTitle)
                .replace('{{SCREEN_DESCRIPTION}}', screenDescription)
                .replace('{{SCREEN_CONTENT}}', screenContent)
                .replace('{{STYLES}}', this.generateStyles(screenConfig))
                .replace('{{SCRIPTS}}', this.generateScripts(screenConfig));

            // حفظ الشاشة في قاعدة البيانات
            const screensRef = ref(this.database, 'itws_ai/generated_screens');
            await push(screensRef, {
                fileName: fileName,
                title: screenTitle,
                description: screenDescription,
                content: screenHTML,
                permissions: permissions,
                createdBy: this.currentUser.userId,
                createdAt: new Date().toISOString(),
                active: true
            });

            // تحديث القائمة في dashboard
            await this.updateMenuWithNewScreen(fileName, screenTitle, permissions);

            return {
                success: true,
                fileName: fileName,
                message: `✅ تم إنشاء الشاشة ${screenTitle} بنجاح`,
                url: fileName
            };

        } catch (error) {
            console.error('خطأ في إضافة شاشة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // تعديل الكود الموجود
    async modifyCode(modification) {
        try {
            this.checkPermission();
            
            const {
                targetFile,
                modifications,
                reason
            } = modification;

            // حفظ نسخة احتياطية قبل التعديل
            await this.backupFile(targetFile);

            // تطبيق التعديلات
            const result = await this.applyCodeModifications(targetFile, modifications);

            // تسجيل التعديل
            await this.logAction('code_modification', {
                file: targetFile,
                modifications: modifications,
                reason: reason,
                result: result
            });

            return {
                success: true,
                message: `✅ تم تعديل ${targetFile} بنجاح`,
                result: result
            };

        } catch (error) {
            console.error('خطأ في تعديل الكود:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // إصلاح الأخطاء
    async fixBug(bugReport) {
        try {
            this.checkPermission();
            
            const {
                bugId,
                description,
                location,
                solution
            } = bugReport;

            // تحليل الخطأ
            const analysis = await this.analyzeBug(bugReport);

            // إصلاح الخطأ
            const fix = await this.applyBugFix(analysis);

            // اختبار الإصلاح
            const testResult = await this.testFix(fix);

            return {
                success: testResult.passed,
                analysis: analysis,
                fix: fix,
                testResult: testResult,
                message: testResult.passed ? '✅ تم إصلاح الخطأ' : '⚠️ يحتاج لمزيد من التعديل'
            };

        } catch (error) {
            console.error('خطأ في إصلاح البق:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // إضافة ميزة جديدة
    async addFeature(feature) {
        try {
            this.checkPermission();
            
            const {
                featureName,
                featureType, // 'component', 'function', 'integration'
                requirements,
                implementation
            } = feature;

            // إنشاء الميزة
            const newFeature = await this.createFeature(feature);

            // دمجها مع النظام
            await this.integrateFeature(newFeature);

            // تحديث الوثائق
            await this.updateDocumentation(featureName, newFeature);

            return {
                success: true,
                featureId: newFeature.id,
                message: `✅ تم إضافة الميزة ${featureName} بنجاح`
            };

        } catch (error) {
            console.error('خطأ في إضافة ميزة:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // مساعدة المستخدمين
    async helpUser(userId, question) {
        try {
            // تحليل سؤال المستخدم
            const analysis = await this.analyzeQuestion(question);
            
            // البحث في قاعدة المعرفة
            const knowledge = await this.searchKnowledge(analysis);
            
            // توليد الإجابة
            const answer = await this.generateAnswer(analysis, knowledge);
            
            // توجيه المستخدم
            if (analysis.requiresAction) {
                await this.guideUser(userId, analysis.action);
            }

            // حفظ التفاعل للتعلم
            await this.saveInteraction(userId, question, answer);

            return {
                answer: answer,
                suggestedActions: analysis.suggestedActions,
                resources: knowledge.resources
            };

        } catch (error) {
            console.error('خطأ في مساعدة المستخدم:', error);
            return {
                error: 'عذراً، حدث خطأ في معالجة سؤالك'
            };
        }
    }

    // تحليل البيانات والتقارير
    async analyzeData(dataType, period) {
        try {
            this.checkPermission();
            
            // جمع البيانات
            const data = await this.collectData(dataType, period);
            
            // تحليل البيانات
            const analysis = {
                summary: await this.generateSummary(data),
                trends: await this.analyzeTrends(data),
                insights: await this.generateInsights(data),
                predictions: await this.makePredictions(data),
                recommendations: await this.generateRecommendations(data)
            };

            // إنشاء تقرير
            const report = await this.createReport(analysis);

            return {
                analysis: analysis,
                report: report,
                downloadable: await this.exportReport(report)
            };

        } catch (error) {
            console.error('خطأ في تحليل البيانات:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // إنشاء تقارير ذكية
    async generateIntelligentReport(reportConfig) {
        try {
            const {
                type, // 'committee', 'branch', 'member', 'system'
                targetId,
                includeCharts = true,
                includePredictions = true
            } = reportConfig;

            // جمع البيانات المطلوبة
            const data = await this.collectReportData(type, targetId);
            
            // تحليل الأداء
            const performance = await this.analyzePerformance(data);
            
            // إنشاء التقرير
            const report = {
                title: `تقرير ${type} - ${new Date().toLocaleDateString('ar-EG')}`,
                generatedAt: new Date().toISOString(),
                generatedBy: 'ITWS AI',
                summary: performance.summary,
                metrics: performance.metrics,
                achievements: performance.achievements,
                challenges: performance.challenges,
                recommendations: performance.recommendations
            };

            // إضافة التنبؤات
            if (includePredictions) {
                report.predictions = await this.generatePredictions(data);
            }

            // إضافة الرسوم البيانية
            if (includeCharts) {
                report.charts = await this.generateCharts(data);
            }

            return report;

        } catch (error) {
            console.error('خطأ في إنشاء التقرير:', error);
            return null;
        }
    }

    // نظام تتبع الطلبات
    async trackRequest(requestData) {
        try {
            const tracking = {
                id: `track_${Date.now()}`,
                type: requestData.type,
                from: requestData.from,
                to: requestData.to,
                content: requestData.content,
                status: 'pending',
                history: [{
                    status: 'created',
                    timestamp: new Date().toISOString(),
                    by: requestData.from
                }],
                attachments: requestData.attachments || [],
                priority: requestData.priority || 'normal',
                deadline: requestData.deadline || null,
                tags: requestData.tags || []
            };

            // حفظ في قاعدة التتبع
            const trackingRef = ref(this.database, 'tracking');
            await push(trackingRef, tracking);

            // إشعار الجهة المستلمة
            await this.notifyRecipient(tracking);

            return tracking;

        } catch (error) {
            console.error('خطأ في تتبع الطلب:', error);
            return null;
        }
    }

    // التعلم الذاتي
    async learnFromInteractions() {
        try {
            // تحليل التفاعلات السابقة
            const interactions = await this.getRecentInteractions();
            
            // استخراج الأنماط
            const patterns = this.extractPatterns(interactions);
            
            // تحسين الاستجابات
            await this.improveResponses(patterns);
            
            // تحديث قاعدة المعرفة
            await this.updateKnowledgeBase(patterns);

            return {
                learned: patterns.length,
                improvements: patterns.map(p => p.improvement)
            };

        } catch (error) {
            console.error('خطأ في التعلم:', error);
            return null;
        }
    }

    // دوال مساعدة خاصة
    async backupFile(fileName) {
        // إنشاء نسخة احتياطية
        const backupRef = ref(this.database, `itws_ai/backups/${Date.now()}_${fileName}`);
        const fileContent = await this.getFileContent(fileName);
        await set(backupRef, {
            fileName: fileName,
            content: fileContent,
            backedUpAt: new Date().toISOString(),
            backedUpBy: this.currentUser.userId
        });
    }

    async logAction(action, details) {
        const logRef = ref(this.database, 'itws_ai/logs');
        await push(logRef, {
            action: action,
            details: details,
            userId: this.currentUser?.userId,
            timestamp: new Date().toISOString()
        });
    }

    async loadLearningData() {
        const learningRef = ref(this.database, 'itws_ai/learning');
        const snapshot = await get(learningRef);
        if (snapshot.exists()) {
            this.learningData = snapshot.val();
        }
    }

    activateListeners() {
        // مستمع للطلبات الجديدة
        const requestsRef = ref(this.database, 'itws_ai/requests');
        onValue(requestsRef, (snapshot) => {
            const requests = snapshot.val();
            if (requests) {
                this.processNewRequests(requests);
            }
        });

        // مستمع للاقتراحات
        const suggestionsRef = ref(this.database, 'suggestions');
        onValue(suggestionsRef, (snapshot) => {
            const suggestions = snapshot.val();
            if (suggestions) {
                this.analyzeSuggestions(suggestions);
            }
        });
    }

    generateStyles(config) {
        // توليد CSS حسب الطلب
        return `
            .content-card {
                background: white;
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                margin-top: 20px;
            }
            ${config.customStyles || ''}
        `;
    }

    generateScripts(config) {
        // توليد JavaScript حسب الطلب
        return `
            import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
            import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
            
            const firebaseConfig = {
                apiKey: "AIzaSyCaPhRG_1c7Rsu5Ss_MUNqsE18Ky_nyEAA",
                authDomain: "itws-system.firebaseapp.com",
                databaseURL: "https://itws-system-default-rtdb.firebaseio.com",
                projectId: "itws-system",
                storageBucket: "itws-system.firebasestorage.app",
                messagingSenderId: "770452248691",
                appId: "1:770452248691:web:0e94e65e01298b398bb206",
                measurementId: "G-8V5WSYEX0B"
            };
            
            const app = initializeApp(firebaseConfig);
            const database = getDatabase(app);
            
            ${config.customScripts || ''}
        `;
    }

    async updateMenuWithNewScreen(fileName, screenTitle, permissions) {
        // تحديث قائمة dashboard
        const menuRef = ref(this.database, 'system/menu_items');
        await push(menuRef, {
            title: screenTitle,
            url: fileName,
            icon: 'fas fa-file',
            permissions: permissions,
            order: Date.now()
        });
    }
}

// تصدير المساعد
export default ITWSAI;
