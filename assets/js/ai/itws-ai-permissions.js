// assets/js/ai/itws-ai-permissions.js
// ITWS AI - نظام الصلاحيات المتقدم للمساعد الذكي

class ITWSAIPermissions {
    constructor() {
        // تعريف المستويات والصلاحيات
        this.roles = {
            guest: {
                level: 0,
                name: 'زائر',
                description: 'مستخدم غير مسجل',
                color: '#6b7280',
                icon: 'fa-user',
                capabilities: [
                    'login_help',
                    'password_recovery',
                    'basic_info'
                ],
                limitations: [
                    'no_system_access',
                    'no_user_data',
                    'no_internal_info'
                ],
                maxQueriesPerDay: 10,
                allowedPages: ['index.html']
            },

            committee_member: {
                level: 50,
                name: 'عضو لجنة',
                description: 'عضو في لجنة',
                color: '#60a5fa',
                icon: 'fa-user',
                capabilities: [
                    'view_own_committee',
                    'submit_reports',
                    'view_tasks',
                    'view_attendance',
                    'send_suggestions'
                ],
                limitations: [
                    'cannot_edit_others',
                    'cannot_view_finance',
                    'cannot_manage_users'
                ],
                maxQueriesPerDay: 100,
                allowedPages: ['dashboard', 'committees', 'profile', 'attendance']
            },

            committee_head: {
                level: 60,
                name: 'رئيس لجنة',
                description: 'رئيس لجنة',
                color: '#34d399',
                icon: 'fa-user-tie',
                capabilities: [
                    'manage_own_committee',
                    'approve_reports',
                    'assign_tasks',
                    'view_member_stats',
                    'generate_committee_reports',
                    'manage_committee_members'
                ],
                limitations: [
                    'cannot_view_other_committees',
                    'cannot_manage_branches',
                    'cannot_access_finance'
                ],
                maxQueriesPerDay: 150,
                allowedPages: ['dashboard', 'committees', 'members', 'reports', 'profile']
            },

            branch_manager: {
                level: 70,
                name: 'مدير فرع',
                description: 'مدير فرع',
                color: '#f87171',
                icon: 'fa-building',
                capabilities: [
                    'manage_own_branch',
                    'view_branch_stats',
                    'generate_branch_reports',
                    'manage_branch_members',
                    'track_attendance',
                    'view_branch_finance'
                ],
                limitations: [
                    'cannot_manage_committees',
                    'cannot_view_other_branches',
                    'cannot_modify_system'
                ],
                maxQueriesPerDay: 150,
                allowedPages: ['dashboard', 'branches', 'members', 'attendance', 'reports']
            },

            treasurer: {
                level: 70,
                name: 'أمين صندوق',
                description: 'أمين صندوق',
                color: '#fbbf24',
                icon: 'fa-coins',
                capabilities: [
                    'view_all_finance',
                    'manage_transactions',
                    'generate_financial_reports',
                    'track_budgets',
                    'view_expenses',
                    'manage_treasury'
                ],
                limitations: [
                    'cannot_manage_users',
                    'cannot_modify_committees',
                    'cannot_edit_branches'
                ],
                maxQueriesPerDay: 150,
                allowedPages: ['dashboard', 'finance', 'reports', 'profile']
            },

            secretary_general: {
                level: 75,
                name: 'أمين عام',
                description: 'أمين عام',
                color: '#a78bfa',
                icon: 'fa-file-signature',
                capabilities: [
                    'manage_meetings',
                    'manage_documents',
                    'view_all_activities',
                    'generate_general_reports',
                    'manage_correspondence',
                    'track_progress'
                ],
                limitations: [
                    'cannot_modify_finance',
                    'cannot_manage_users',
                    'cannot_edit_system'
                ],
                maxQueriesPerDay: 200,
                allowedPages: ['dashboard', 'meetings', 'documents', 'reports', 'profile']
            },

            vice_president_second_manager: {
                level: 80,
                name: 'نائب ثاني - مدير اللجان',
                description: 'مدير جميع اللجان',
                color: '#f472b6',
                icon: 'fa-users-cog',
                capabilities: [
                    'manage_all_committees',
                    'view_committee_stats',
                    'generate_committee_reports',
                    'evaluate_committees',
                    'manage_committee_heads',
                    'approve_committee_decisions'
                ],
                limitations: [
                    'cannot_manage_branches',
                    'cannot_modify_finance',
                    'cannot_edit_system'
                ],
                maxQueriesPerDay: 250,
                allowedPages: ['dashboard', 'committees', 'members', 'reports', 'evaluations']
            },

            secretary_assistant_manager: {
                level: 80,
                name: 'مساعد الأمين العام - مدير الفروع',
                description: 'مدير جميع الفروع',
                color: '#fb923c',
                icon: 'fa-building',
                capabilities: [
                    'manage_all_branches',
                    'view_branch_stats',
                    'generate_branch_reports',
                    'evaluate_branches',
                    'manage_branch_managers',
                    'track_branch_performance'
                ],
                limitations: [
                    'cannot_manage_committees',
                    'cannot_modify_finance',
                    'cannot_edit_system'
                ],
                maxQueriesPerDay: 250,
                allowedPages: ['dashboard', 'branches', 'members', 'reports', 'evaluations']
            },

            vice_president_first: {
                level: 90,
                name: 'نائب أول',
                description: 'النائب الأول',
                color: '#60a5fa',
                icon: 'fa-star',
                capabilities: [
                    'view_all_data',
                    'generate_any_report',
                    'manage_committees',
                    'manage_branches',
                    'view_finance',
                    'track_all_activities',
                    'approve_requests',
                    'manage_meetings'
                ],
                limitations: [
                    'cannot_modify_system',
                    'cannot_manage_users',
                    'cannot_edit_permissions'
                ],
                maxQueriesPerDay: 500,
                allowedPages: ['dashboard', 'committees', 'branches', 'members', 'finance', 'reports']
            },

            president: {
                level: 100,
                name: 'نقيب عام',
                description: 'النقيب العام',
                color: '#fbbf24',
                icon: 'fa-crown',
                capabilities: [
                    'all', // كل الصلاحيات
                    'modify_system',
                    'manage_users',
                    'edit_permissions',
                    'add_screens',
                    'modify_code',
                    'view_analytics',
                    'export_all_data',
                    'manage_security',
                    'configure_system'
                ],
                limitations: [],
                maxQueriesPerDay: 1000,
                allowedPages: ['all']
            }
        };

        // تعريف الصلاحيات المتاحة
        this.permissions = {
            // صلاحيات المشاهدة
            view_own_committee: 'مشاهدة لجنته',
            view_other_committees: 'مشاهدة لجان أخرى',
            view_own_branch: 'مشاهدة فرعه',
            view_other_branches: 'مشاهدة فروع أخرى',
            view_member_stats: 'مشاهدة إحصائيات الأعضاء',
            view_finance: 'مشاهدة المالية',
            view_all_data: 'مشاهدة كل البيانات',

            // صلاحيات الإدارة
            manage_own_committee: 'إدارة لجنته',
            manage_all_committees: 'إدارة كل اللجان',
            manage_own_branch: 'إدارة فرعه',
            manage_all_branches: 'إدارة كل الفروع',
            manage_users: 'إدارة المستخدمين',
            manage_finance: 'إدارة المالية',
            manage_security: 'إدارة الأمان',

            // صلاحيات التقارير
            generate_committee_reports: 'توليد تقارير اللجان',
            generate_branch_reports: 'توليد تقارير الفروع',
            generate_financial_reports: 'توليد تقارير مالية',
            generate_general_reports: 'توليد تقارير عامة',

            // صلاحيات التقييم
            evaluate_committees: 'تقييم اللجان',
            evaluate_branches: 'تقييم الفروع',
            evaluate_members: 'تقييم الأعضاء',

            // صلاحيات الموافقة
            approve_reports: 'الموافقة على التقارير',
            approve_requests: 'الموافقة على الطلبات',
            approve_decisions: 'الموافقة على القرارات',

            // صلاحيات النظام
            modify_system: 'تعديل النظام',
            add_screens: 'إضافة شاشات',
            modify_code: 'تعديل الكود',
            configure_system: 'تكوين النظام',

            // صلاحيات متقدمة
            export_data: 'تصدير البيانات',
            import_data: 'استيراد البيانات',
            backup_system: 'نسخ احتياطي',
            restore_system: 'استعادة النظام',

            // صلاحيات المستخدمين
            create_users: 'إنشاء مستخدمين',
            edit_users: 'تعديل مستخدمين',
            delete_users: 'حذف مستخدمين',
            change_passwords: 'تغيير كلمات المرور',
            edit_permissions: 'تعديل الصلاحيات',

            // صلاحيات إضافية
            send_messages: 'إرسال رسائل',
            broadcast: 'بث إشعارات',
            manage_meetings: 'إدارة اجتماعات',
            manage_documents: 'إدارة مستندات',
            track_attendance: 'تتبع حضور'
        };

        // تعريف القيود
        this.restrictions = {
            maxQueriesPerDay: 'الحد الأقصى للاستعلامات اليومية',
            maxFileUploadSize: 'الحد الأقصى لحجم الملفات',
            allowedIpRanges: 'نطاقات IP المسموحة',
            allowedTimeRange: 'النطاق الزمني المسموح',
            require2FA: 'يتطلب التحقق بخطوتين',
            requireBiometric: 'يتطلب بصمة'
        };
    }

    // ===== 1. الحصول على صلاحيات المستخدم =====
    getUserPermissions(user) {
        if (!user || !user.role) {
            return this.roles.guest;
        }

        return this.roles[user.role] || this.roles.guest;
    }

    // ===== 2. التحقق من صلاحية محددة =====
    hasPermission(user, permission) {
        const role = this.getUserPermissions(user);
        
        if (!role) return false;
        
        // النقيب له كل الصلاحيات
        if (role.level === 100 || role.capabilities.includes('all')) {
            return true;
        }

        return role.capabilities.includes(permission);
    }

    // ===== 3. التحقق من صلاحية متعددة =====
    hasAllPermissions(user, permissions) {
        return permissions.every(permission => this.hasPermission(user, permission));
    }

    // ===== 4. التحقق من أي صلاحية =====
    hasAnyPermission(user, permissions) {
        return permissions.some(permission => this.hasPermission(user, permission));
    }

    // ===== 5. التحقق من الوصول للصفحة =====
    canAccessPage(user, page) {
        const role = this.getUserPermissions(user);
        
        if (!role) return false;

        if (role.allowedPages.includes('all')) {
            return true;
        }

        return role.allowedPages.includes(page);
    }

    // ===== 6. التحقق من إمكانية تنفيذ أمر =====
    canExecuteCommand(user, command) {
        // أوامر النقيب الخاصة
        if (command.startsWith('ai_') && user?.role === 'president') {
            return true;
        }

        // أوامر عامة
        const publicCommands = ['help', 'status', 'info'];
        if (publicCommands.includes(command)) {
            return true;
        }

        return this.hasPermission(user, `execute_${command}`);
    }

    // ===== 7. الحصول على قائمة الأوامر المسموحة =====
    getAllowedCommands(user) {
        const role = this.getUserPermissions(user);
        
        if (!role) return ['help', 'status'];

        if (role.level === 100) {
            return ['all']; // كل الأوامر
        }

        // أوامر حسب الصلاحيات
        const commands = [];
        
        if (role.capabilities.includes('view_own_committee')) {
            commands.push('view_committee', 'committee_status');
        }
        
        if (role.capabilities.includes('generate_reports')) {
            commands.push('generate_report', 'export_data');
        }
        
        if (role.capabilities.includes('manage_users')) {
            commands.push('manage_users', 'edit_user');
        }

        return commands;
    }

    // ===== 8. التحقق من حد الاستعلامات =====
    async checkQueryLimit(user) {
        const role = this.getUserPermissions(user);
        
        if (!role) return { allowed: false, remaining: 0 };

        // الحصول على عدد استعلامات اليوم
        const today = new Date().toDateString();
        const queriesKey = `queries_${user?.userId}_${today}`;
        const queries = parseInt(localStorage.getItem(queriesKey) || '0');

        if (queries >= role.maxQueriesPerDay) {
            return {
                allowed: false,
                remaining: 0,
                limit: role.maxQueriesPerDay
            };
        }

        return {
            allowed: true,
            remaining: role.maxQueriesPerDay - queries,
            limit: role.maxQueriesPerDay
        };
    }

    // ===== 9. تسجيل استعلام =====
    async logQuery(user) {
        if (!user) return;

        const today = new Date().toDateString();
        const queriesKey = `queries_${user.userId}_${today}`;
        const queries = parseInt(localStorage.getItem(queriesKey) || '0');
        
        localStorage.setItem(queriesKey, (queries + 1).toString());
    }

    // ===== 10. الحصول على قيود المستخدم =====
    getUserRestrictions(user) {
        const role = this.getUserPermissions(user);
        
        return {
            maxQueriesPerDay: role.maxQueriesPerDay,
            allowedPages: role.allowedPages,
            limitations: role.limitations
        };
    }

    // ===== 11. التحقق من صلاحية تعديل البيانات =====
    canModifyData(user, dataType, dataOwner) {
        // النقيب يعدل أي شيء
        if (user?.role === 'president') return true;

        // مدير اللجان يعدل بيانات لجنته فقط
        if (user?.role === 'vice_president_second_manager' && dataType === 'committee') {
            return dataOwner === 'all';
        }

        // مدير الفروع يعدل بيانات فرعه فقط
        if (user?.role === 'secretary_assistant_manager' && dataType === 'branch') {
            return dataOwner === 'all';
        }

        // رئيس لجنة يعدل بيانات لجنته فقط
        if (user?.role === 'committee_head' && dataType === 'committee') {
            return dataOwner === user.committeeId;
        }

        // مدير فرع يعدل بيانات فرعه فقط
        if (user?.role === 'branch_manager' && dataType === 'branch') {
            return dataOwner === user.branchId;
        }

        // الأعضاء العاديين لا يعدلون بيانات غيرهم
        return dataOwner === user?.userId;
    }

    // ===== 12. الحصول على مستوى المستخدم =====
    getUserLevel(user) {
        const role = this.getUserPermissions(user);
        return role.level;
    }

    // ===== 13. مقارنة مستويين =====
    compareLevels(user1, user2) {
        const level1 = this.getUserLevel(user1);
        const level2 = this.getUserLevel(user2);

        if (level1 > level2) return 1;
        if (level1 < level2) return -1;
        return 0;
    }

    // ===== 14. الحصول على المستخدمين الأعلى =====
    getHigherUsers(currentUser, allUsers) {
        const currentLevel = this.getUserLevel(currentUser);
        
        return allUsers.filter(user => 
            this.getUserLevel(user) > currentLevel
        );
    }

    // ===== 15. الحصول على المستخدمين الأقل =====
    getLowerUsers(currentUser, allUsers) {
        const currentLevel = this.getUserLevel(currentUser);
        
        return allUsers.filter(user => 
            this.getUserLevel(user) < currentLevel
        );
    }

    // ===== 16. الحصول على المستخدمين المتساوين =====
    getEqualUsers(currentUser, allUsers) {
        const currentLevel = this.getUserLevel(currentUser);
        
        return allUsers.filter(user => 
            this.getUserLevel(user) === currentLevel
        );
    }

    // ===== 17. التحقق من صلاحية مشاهدة مستخدم =====
    canViewUser(viewer, target) {
        // النقيب يرى الكل
        if (viewer?.role === 'president') return true;

        // النائب الأول يرى الكل
        if (viewer?.role === 'vice_president_first') return true;

        // مدير اللجان يرى كل أعضاء اللجان
        if (viewer?.role === 'vice_president_second_manager') {
            return target.role?.includes('committee');
        }

        // مدير الفروع يرى كل أعضاء الفروع
        if (viewer?.role === 'secretary_assistant_manager') {
            return target.role?.includes('branch') || target.role?.includes('governorate');
        }

        // رئيس لجنة يرى أعضاء لجنته فقط
        if (viewer?.role === 'committee_head') {
            return target.committeeId === viewer.committeeId;
        }

        // مدير فرع يرى أعضاء فرعه فقط
        if (viewer?.role === 'branch_manager') {
            return target.branchId === viewer.branchId;
        }

        // الأعضاء العاديين يرون أنفسهم فقط
        return target.userId === viewer?.userId;
    }

    // ===== 18. الحصول على قائمة المستخدمين المسموح مشاهدتهم =====
    getViewableUsers(viewer, allUsers) {
        return allUsers.filter(user => this.canViewUser(viewer, user));
    }

    // ===== 19. التحقق من صلاحية تعديل مستخدم =====
    canEditUser(editor, target) {
        // لا يمكن تعديل نفسك
        if (editor?.userId === target?.userId) return false;

        // النقيب يعدل الكل
        if (editor?.role === 'president') return true;

        // النائب الأول يعدل من هم أقل منه
        if (editor?.role === 'vice_president_first') {
            return this.getUserLevel(target) < 90;
        }

        // مدير اللجان يعدل أعضاء اللجان فقط
        if (editor?.role === 'vice_president_second_manager') {
            return target.role?.includes('committee') && 
                   this.getUserLevel(target) < 80;
        }

        // مدير الفروع يعدل أعضاء الفروع فقط
        if (editor?.role === 'secretary_assistant_manager') {
            return target.role?.includes('branch') && 
                   this.getUserLevel(target) < 80;
        }

        // لا يمكن التعديل للأدوار الأخرى
        return false;
    }

    // ===== 20. الحصول على قائمة المستخدمين المسموح تعديلهم =====
    getEditableUsers(editor, allUsers) {
        return allUsers.filter(user => this.canEditUser(editor, user));
    }

    // ===== 21. الحصول على وصف الصلاحية =====
    getPermissionDescription(permission) {
        return this.permissions[permission] || permission;
    }

    // ===== 22. الحصول على كل الصلاحيات =====
    getAllPermissions() {
        return this.permissions;
    }

    // ===== 23. الحصول على كل الأدوار =====
    getAllRoles() {
        return this.roles;
    }

    // ===== 24. الحصول على دور معين =====
    getRole(roleName) {
        return this.roles[roleName];
    }

    // ===== 25. إضافة دور جديد (للنقيب فقط) =====
    addRole(roleName, roleData) {
        if (this.roles[roleName]) {
            return {
                success: false,
                error: 'الدور موجود بالفعل'
            };
        }

        this.roles[roleName] = roleData;
        
        return {
            success: true,
            message: `تم إضافة الدور ${roleName} بنجاح`
        };
    }

    // ===== 26. تحديث دور (للنقيب فقط) =====
    updateRole(roleName, roleData) {
        if (!this.roles[roleName]) {
            return {
                success: false,
                error: 'الدور غير موجود'
            };
        }

        this.roles[roleName] = {
            ...this.roles[roleName],
            ...roleData
        };
        
        return {
            success: true,
            message: `تم تحديث الدور ${roleName} بنجاح`
        };
    }

    // ===== 27. حذف دور (للنقيب فقط) =====
    deleteRole(roleName) {
        if (roleName === 'president') {
            return {
                success: false,
                error: 'لا يمكن حذف دور النقيب'
            };
        }

        if (!this.roles[roleName]) {
            return {
                success: false,
                error: 'الدور غير موجود'
            };
        }

        delete this.roles[roleName];
        
        return {
            success: true,
            message: `تم حذف الدور ${roleName} بنجاح`
        };
    }

    // ===== 28. الحصول على إحصائيات الصلاحيات =====
    getStats() {
        return {
            totalRoles: Object.keys(this.roles).length,
            totalPermissions: Object.keys(this.permissions).length,
            roles: Object.keys(this.roles),
            highestLevel: 100,
            lowestLevel: 0
        };
    }

    // ===== 29. تصدير نظام الصلاحيات =====
    exportPermissions() {
        return {
            roles: this.roles,
            permissions: this.permissions,
            exportedAt: new Date().toISOString()
        };
    }

    // ===== 30. استيراد نظام الصلاحيات (للنقيب فقط) =====
    importPermissions(data) {
        if (data.roles) {
            this.roles = { ...this.roles, ...data.roles };
        }
        
        if (data.permissions) {
            this.permissions = { ...this.permissions, ...data.permissions };
        }

        return {
            success: true,
            message: 'تم استيراد نظام الصلاحيات بنجاح'
        };
    }
}

export default ITWSAIPermissions;
