// assets/js/modules/auth.js
// نظام المصادقة والصلاحيات المتكامل

import { 
    database, 
    ref, 
    get, 
    update,
    query,
    orderByChild,
    equalTo
} from '../core/firebase-config.js';

import SecurityCore from '../security/security-core.js';
import ITWSAICore from '../ai/itws-ai-core.js';

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.loginAttempts = 0;
        this.maxLoginAttempts = 5;
        this.lockoutTime = 15 * 60 * 1000; // 15 دقيقة
        this.lockoutUntil = null;
        this.securityCore = new SecurityCore();
        this.init();
    }

    init() {
        // التحقق من وجود جلسة سابقة
        this.checkExistingSession();
        
        // مراقبة حالة المصادقة
        this.setupAuthListeners();
    }

    // ===== 1. التحقق من وجود جلسة سابقة =====
    checkExistingSession() {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('✅ تم استعادة الجلسة للمستخدم:', this.currentUser.fullName);
            } catch (error) {
                console.error('❌ خطأ في استعادة الجلسة:', error);
                this.logout();
            }
        }
    }

    // ===== 2. إعداد مستمعي المصادقة =====
    setupAuthListeners() {
        // مراقبة تغييرات الجلسة
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser') {
                if (!e.newValue) {
                    this.currentUser = null;
                    this.redirectToLogin();
                }
            }
        });

        // مراقبة إغلاق المتصفح
        window.addEventListener('beforeunload', () => {
            if (this.currentUser) {
                this.updateUserStatus(false);
            }
        });
    }

    // ===== 3. تسجيل الدخول =====
    async login(username, password, loginData = {}) {
        try {
            // التحقق من القفل
            if (this.isLocked()) {
                return {
                    success: false,
                    error: `تم قفل الحساب مؤقتاً. يرجى الانتظار ${this.getRemainingLockTime()} دقائق`
                };
            }

            // البحث عن المستخدم
            const user = await this.findUser(username, password);
            
            if (!user) {
                this.loginAttempts++;
                await this.handleFailedLogin();
                return {
                    success: false,
                    error: 'اسم المستخدم أو كلمة المرور غير صحيحة'
                };
            }

            // التحقق من حالة الحساب
            if (user.status !== 'active') {
                return {
                    success: false,
                    error: 'هذا الحساب غير نشط. يرجى التواصل مع النقيب العام'
                };
            }

            // تسجيل الدخول الناجح
            this.loginAttempts = 0;
            this.currentUser = user;
            
            // تحديث معلومات المستخدم
            await this.updateUserAfterLogin(user.userId, loginData);

            // حفظ في الجلسة
            sessionStorage.setItem('currentUser', JSON.stringify(user));

            // إشعار النقيب بمحاولة الدخول (إذا كانت من جهاز جديد)
            if (loginData.isNewDevice) {
                await this.notifyPresident(user, loginData);
            }

            return {
                success: true,
                user: user,
                message: 'تم تسجيل الدخول بنجاح'
            };

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'حدث خطأ في تسجيل الدخول'
            };
        }
    }

    // ===== 4. البحث عن المستخدم =====
    async findUser(username, password) {
        try {
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            
            if (!snapshot.exists()) return null;

            const users = snapshot.val();
            
            for (const [id, user] of Object.entries(users)) {
                // البحث بالاسم أو اسم المستخدم
                if (user.fullName === username || user.username === username) {
                    // التحقق من كلمة المرور (الرقم القومي)
                    if (user.password === password || user.nationalId === password) {
                        return {
                            userId: id,
                            ...user
                        };
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error finding user:', error);
            return null;
        }
    }

    // ===== 5. تحديث معلومات المستخدم بعد تسجيل الدخول =====
    async updateUserAfterLogin(userId, loginData) {
        const updates = {
            lastLogin: new Date().toISOString(),
            online: true,
            lastSeen: new Date().toISOString(),
            loginCount: (this.currentUser.loginCount || 0) + 1
        };

        // إضافة معلومات الجهاز إذا كانت متوفرة
        if (loginData.device) {
            updates.lastDevice = loginData.device;
        }

        // إضافة الموقع إذا كان متوفراً
        if (loginData.location) {
            updates.lastLocation = loginData.location;
        }

        // إضافة عنوان IP
        if (loginData.ip) {
            updates.lastIP = loginData.ip;
        }

        await update(ref(database, `users/${userId}`), updates);
    }

    // ===== 6. معالجة محاولة فاشلة =====
    async handleFailedLogin() {
        if (this.loginAttempts >= this.maxLoginAttempts) {
            this.lockoutUntil = Date.now() + this.lockoutTime;
            
            // تسجيل محاولة الاختراق
            await this.logSecurityEvent('multiple_failed_logins', {
                attempts: this.loginAttempts,
                timestamp: new Date().toISOString()
            });

            // إشعار النقيب
            await this.notifyPresident(null, {
                type: 'brute_force_attempt',
                attempts: this.loginAttempts
            });
        }
    }

    // ===== 7. التحقق من القفل =====
    isLocked() {
        if (!this.lockoutUntil) return false;
        return Date.now() < this.lockoutUntil;
    }

    // ===== 8. الحصول على الوقت المتبقي للقفل =====
    getRemainingLockTime() {
        if (!this.lockoutUntil) return 0;
        const remaining = this.lockoutUntil - Date.now();
        return Math.ceil(remaining / 60000); // بالدقائق
    }

    // ===== 9. تسجيل الخروج =====
    async logout() {
        if (this.currentUser) {
            await update(ref(database, `users/${this.currentUser.userId}`), {
                online: false,
                lastSeen: new Date().toISOString()
            });
        }

        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        
        this.redirectToLogin();
    }

    // ===== 10. التوجيه لصفحة تسجيل الدخول =====
    redirectToLogin() {
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }

    // ===== 11. الحصول على المستخدم الحالي =====
    getCurrentUser() {
        return this.currentUser;
    }

    // ===== 12. التحقق من الصلاحية =====
    hasPermission(requiredRole) {
        if (!this.currentUser) return false;

        const roleHierarchy = {
            'guest': 0,
            'member': 50,
            'committee_member': 50,
            'committee_head': 60,
            'branch_manager': 70,
            'governorate_president': 60,
            'governorate_council_member': 50,
            'governorate_agent': 50,
            'secretary_general': 70,
            'treasurer': 70,
            'vice_president_second_manager': 80,
            'secretary_assistant_manager': 80,
            'vice_president_first': 90,
            'president': 100
        };

        const userLevel = roleHierarchy[this.currentUser.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        return userLevel >= requiredLevel;
    }

    // ===== 13. التحقق من صلاحية الوصول للصفحة =====
    checkPageAccess(pageName) {
        if (!this.currentUser) return false;

        const pagePermissions = {
            'dashboard': ['all'],
            'committees': ['president', 'vice_president_first', 'vice_president_second_manager', 'committee_head', 'committee_member'],
            'branches': ['president', 'vice_president_first', 'secretary_assistant_manager', 'governorate_president', 'governorate_agent'],
            'members': ['president', 'vice_president_first'],
            'requests': ['president', 'vice_president_first'],
            'tracking': ['all'],
            'finance': ['president', 'treasurer'],
            'messages': ['all'],
            'profile': ['all'],
            'settings': ['president']
        };

        const allowedRoles = pagePermissions[pageName] || [];
        return allowedRoles.includes('all') || allowedRoles.includes(this.currentUser.role);
    }

    // ===== 14. تحديث حالة المستخدم =====
    async updateUserStatus(online) {
        if (this.currentUser) {
            await update(ref(database, `users/${this.currentUser.userId}`), {
                online: online,
                lastSeen: new Date().toISOString()
            });
        }
    }

    // ===== 15. تغيير كلمة المرور =====
    async changePassword(oldPassword, newPassword) {
        if (!this.currentUser) {
            return {
                success: false,
                error: 'يجب تسجيل الدخول أولاً'
            };
        }

        // التحقق من كلمة المرور القديمة
        if (oldPassword !== this.currentUser.password && 
            oldPassword !== this.currentUser.nationalId) {
            return {
                success: false,
                error: 'كلمة المرور القديمة غير صحيحة'
            };
        }

        // تحديث كلمة المرور
        await update(ref(database, `users/${this.currentUser.userId}`), {
            password: newPassword,
            lastPasswordChange: new Date().toISOString()
        });

        // تحديث الجلسة
        this.currentUser.password = newPassword;
        sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        return {
            success: true,
            message: 'تم تغيير كلمة المرور بنجاح'
        };
    }

    // ===== 16. إخطار النقيب =====
    async notifyPresident(user, data) {
        try {
            const notificationRef = ref(database, 'notifications/president_001');
            await push(notificationRef, {
                type: 'security_alert',
                title: '🔒 تنبيه أمني',
                message: `محاولة دخول مشبوهة من جهاز جديد`,
                data: data,
                timestamp: new Date().toISOString(),
                read: false
            });
        } catch (error) {
            console.error('Error notifying president:', error);
        }
    }

    // ===== 17. تسجيل حدث أمني =====
    async logSecurityEvent(eventType, details) {
        const eventRef = ref(database, 'security_events');
        await push(eventRef, {
            type: eventType,
            details: details,
            userId: this.currentUser?.userId || 'unknown',
            timestamp: new Date().toISOString()
        });
    }

    // ===== 18. الحصول على إحصائيات المستخدم =====
    async getUserStats(userId) {
        try {
            const userRef = ref(database, `users/${userId}`);
            const snapshot = await get(userRef);
            
            if (!snapshot.exists()) return null;

            const user = snapshot.val();
            
            return {
                loginCount: user.loginCount || 0,
                lastLogin: user.lastLogin,
                lastSeen: user.lastSeen,
                online: user.online,
                createdAt: user.createdAt
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return null;
        }
    }

    // ===== 19. البحث عن المستخدمين =====
    async searchUsers(searchTerm) {
        try {
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            
            if (!snapshot.exists()) return [];

            const users = snapshot.val();
            const results = [];

            for (const [id, user] of Object.entries(users)) {
                if (user.fullName?.includes(searchTerm) || 
                    user.username?.includes(searchTerm) ||
                    user.phone?.includes(searchTerm)) {
                    results.push({
                        userId: id,
                        ...user
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    }

    // ===== 20. تفعيل المستخدم =====
    async activateUser(userId) {
        if (!this.hasPermission('president')) {
            return {
                success: false,
                error: 'ليس لديك صلاحية لتفعيل المستخدمين'
            };
        }

        await update(ref(database, `users/${userId}`), {
            status: 'active'
        });

        return {
            success: true,
            message: 'تم تفعيل المستخدم بنجاح'
        };
    }

    // ===== 21. تعطيل المستخدم =====
    async deactivateUser(userId) {
        if (!this.hasPermission('president')) {
            return {
                success: false,
                error: 'ليس لديك صلاحية لتعطيل المستخدمين'
            };
        }

        await update(ref(database, `users/${userId}`), {
            status: 'inactive'
        });

        return {
            success: true,
            message: 'تم تعطيل المستخدم بنجاح'
        };
    }

    // ===== 22. تحديث صلاحيات المستخدم =====
    async updateUserPermissions(userId, permissions) {
        if (!this.hasPermission('president')) {
            return {
                success: false,
                error: 'ليس لديك صلاحية لتحديث الصلاحيات'
            };
        }

        await update(ref(database, `users/${userId}`), {
            permissions: permissions,
            permissionsUpdatedAt: new Date().toISOString()
        });

        return {
            success: true,
            message: 'تم تحديث الصلاحيات بنجاح'
        };
    }

    // ===== 23. الحصول على المستخدمين المتصلين =====
    async getOnlineUsers() {
        try {
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            
            if (!snapshot.exists()) return [];

            const users = snapshot.val();
            const online = [];

            for (const [id, user] of Object.entries(users)) {
                if (user.online) {
                    online.push({
                        userId: id,
                        fullName: user.fullName,
                        role: user.role,
                        lastSeen: user.lastSeen
                    });
                }
            }

            return online;
        } catch (error) {
            console.error('Error getting online users:', error);
            return [];
        }
    }

    // ===== 24. إعادة تعيين كلمة المرور =====
    async resetPassword(userId, newPassword) {
        if (!this.hasPermission('president')) {
            return {
                success: false,
                error: 'ليس لديك صلاحية لإعادة تعيين كلمة المرور'
            };
        }

        await update(ref(database, `users/${userId}`), {
            password: newPassword,
            passwordResetAt: new Date().toISOString(),
            passwordResetBy: this.currentUser.userId
        });

        return {
            success: true,
            message: 'تم إعادة تعيين كلمة المرور بنجاح'
        };
    }

    // ===== 25. تصدير بيانات المستخدمين =====
    async exportUsersData() {
        if (!this.hasPermission('president')) {
            return {
                success: false,
                error: 'ليس لديك صلاحية لتصدير البيانات'
            };
        }

        try {
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            
            if (!snapshot.exists()) return [];

            const users = snapshot.val();
            const exportData = [];

            for (const [id, user] of Object.entries(users)) {
                exportData.push({
                    id: id,
                    fullName: user.fullName,
                    username: user.username,
                    role: user.role,
                    phone: user.phone,
                    email: user.email,
                    governorate: user.governorate,
                    status: user.status,
                    lastLogin: user.lastLogin,
                    loginCount: user.loginCount,
                    createdAt: user.createdAt
                });
            }

            return {
                success: true,
                data: exportData
            };
        } catch (error) {
            console.error('Error exporting users:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// ===== إنشاء وتشغيل نظام المصادقة =====
const authSystem = new AuthSystem();

// ===== جعل النظام متاحاً عالمياً =====
window.authSystem = authSystem;

export default authSystem;
