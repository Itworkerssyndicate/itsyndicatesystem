// assets/js/modules/theme-manager.js
// مدير الثيمات المتقدم - لكل مستخدم ثيم خاص به

class ThemeManager {
    constructor(currentUser = null) {
        this.currentUser = currentUser;
        this.currentTheme = 'light';
        this.themes = this.loadThemes();
        this.customThemes = new Map();
        this.listeners = [];
        this.init();
    }

    // ===== 1. تحميل الثيمات المتاحة =====
    loadThemes() {
        return {
            light: {
                id: 'light',
                name: 'فاتح',
                icon: 'fa-sun',
                description: 'ثيم فاتح مريح للعين',
                colors: {
                    primary: '#667eea',
                    secondary: '#764ba2',
                    background: '#ffffff',
                    card: '#ffffff',
                    text: '#333333',
                    textSecondary: '#666666',
                    border: '#e0e0e0',
                    hover: '#f8f9fa',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                    info: '#3b82f6'
                },
                fonts: {
                    primary: 'Cairo',
                    secondary: 'Tajawal',
                    size: '16px',
                    scale: 1
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                animations: {
                    enabled: true,
                    speed: '0.3s',
                    type: 'ease',
                    scale: 1
                },
                shadows: {
                    sm: '0 1px 2px rgba(0,0,0,0.05)',
                    md: '0 4px 6px rgba(0,0,0,0.1)',
                    lg: '0 10px 15px rgba(0,0,0,0.1)',
                    xl: '0 20px 25px rgba(0,0,0,0.15)'
                },
                borderRadius: {
                    sm: '4px',
                    md: '8px',
                    lg: '12px',
                    xl: '16px',
                    full: '9999px'
                },
                preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },

            dark: {
                id: 'dark',
                name: 'داكن',
                icon: 'fa-moon',
                description: 'ثيم داكن مثالي ليلاً',
                colors: {
                    primary: '#818cf8',
                    secondary: '#a78bfa',
                    background: '#1a202c',
                    card: '#2d3748',
                    text: '#f7fafc',
                    textSecondary: '#e2e8f0',
                    border: '#4a5568',
                    hover: '#2d3748',
                    success: '#48bb78',
                    warning: '#ed8936',
                    error: '#f56565',
                    info: '#4299e1'
                },
                fonts: {
                    primary: 'Cairo',
                    secondary: 'Tajawal',
                    size: '16px',
                    scale: 1
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                animations: {
                    enabled: true,
                    speed: '0.3s',
                    type: 'ease',
                    scale: 1
                },
                shadows: {
                    sm: '0 1px 2px rgba(0,0,0,0.3)',
                    md: '0 4px 6px rgba(0,0,0,0.4)',
                    lg: '0 10px 15px rgba(0,0,0,0.5)',
                    xl: '0 20px 25px rgba(0,0,0,0.6)'
                },
                borderRadius: {
                    sm: '4px',
                    md: '8px',
                    lg: '12px',
                    xl: '16px',
                    full: '9999px'
                },
                preview: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
            },

            navy: {
                id: 'navy',
                name: 'كحلي',
                icon: 'fa-water',
                description: 'ثيم كحلي أنيق',
                colors: {
                    primary: '#3b82f6',
                    secondary: '#1e3a8a',
                    background: '#0a1929',
                    card: '#1e2a3a',
                    text: '#ffffff',
                    textSecondary: '#e2e8f0',
                    border: '#2d3748',
                    hover: '#1e2a3a',
                    success: '#10b981',
                    warning: '#f97316',
                    error: '#ef4444',
                    info: '#3b82f6'
                },
                fonts: {
                    primary: 'Cairo',
                    secondary: 'Tajawal',
                    size: '16px',
                    scale: 1
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                animations: {
                    enabled: true,
                    speed: '0.3s',
                    type: 'ease',
                    scale: 1
                },
                shadows: {
                    sm: '0 1px 2px rgba(0,0,0,0.3)',
                    md: '0 4px 6px rgba(0,0,0,0.4)',
                    lg: '0 10px 15px rgba(0,0,0,0.5)',
                    xl: '0 20px 25px rgba(0,0,0,0.6)'
                },
                borderRadius: {
                    sm: '4px',
                    md: '8px',
                    lg: '12px',
                    xl: '16px',
                    full: '9999px'
                },
                preview: 'linear-gradient(135deg, #0a1929 0%, #1e3a8a 100%)'
            },

            forest: {
                id: 'forest',
                name: 'غابة',
                icon: 'fa-tree',
                description: 'ثيم أخضر طبيعي',
                colors: {
                    primary: '#10b981',
                    secondary: '#059669',
                    background: '#064e3b',
                    card: '#065f46',
                    text: '#ffffff',
                    textSecondary: '#d1fae5',
                    border: '#047857',
                    hover: '#065f46',
                    success: '#34d399',
                    warning: '#fbbf24',
                    error: '#f87171',
                    info: '#60a5fa'
                },
                fonts: {
                    primary: 'Cairo',
                    secondary: 'Tajawal',
                    size: '16px',
                    scale: 1
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                animations: {
                    enabled: true,
                    speed: '0.3s',
                    type: 'ease',
                    scale: 1
                },
                shadows: {
                    sm: '0 1px 2px rgba(0,0,0,0.3)',
                    md: '0 4px 6px rgba(0,0,0,0.4)',
                    lg: '0 10px 15px rgba(0,0,0,0.5)',
                    xl: '0 20px 25px rgba(0,0,0,0.6)'
                },
                borderRadius: {
                    sm: '4px',
                    md: '8px',
                    lg: '12px',
                    xl: '16px',
                    full: '9999px'
                },
                preview: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)'
            },

            sunset: {
                id: 'sunset',
                name: 'غروب',
                icon: 'fa-sunset',
                description: 'ثيم دافئ بألوان الغروب',
                colors: {
                    primary: '#f97316',
                    secondary: '#dc2626',
                    background: '#7f1d1d',
                    card: '#991b1b',
                    text: '#ffffff',
                    textSecondary: '#fed7aa',
                    border: '#b91c1c',
                    hover: '#991b1b',
                    success: '#34d399',
                    warning: '#fbbf24',
                    error: '#ef4444',
                    info: '#60a5fa'
                },
                fonts: {
                    primary: 'Cairo',
                    secondary: 'Tajawal',
                    size: '16px',
                    scale: 1
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                animations: {
                    enabled: true,
                    speed: '0.3s',
                    type: 'ease',
                    scale: 1
                },
                shadows: {
                    sm: '0 1px 2px rgba(0,0,0,0.3)',
                    md: '0 4px 6px rgba(0,0,0,0.4)',
                    lg: '0 10px 15px rgba(0,0,0,0.5)',
                    xl: '0 20px 25px rgba(0,0,0,0.6)'
                },
                borderRadius: {
                    sm: '4px',
                    md: '8px',
                    lg: '12px',
                    xl: '16px',
                    full: '9999px'
                },
                preview: 'linear-gradient(135deg, #7f1d1d 0%, #f97316 100%)'
            },

            ocean: {
                id: 'ocean',
                name: 'محيط',
                icon: 'fa-water',
                description: 'ثيم أزرق مستوحى من المحيط',
                colors: {
                    primary: '#0ea5e9',
                    secondary: '#0284c7',
                    background: '#0c4a6e',
                    card: '#0369a1',
                    text: '#ffffff',
                    textSecondary: '#bae6fd',
                    border: '#0284c7',
                    hover: '#0369a1',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                    info: '#38bdf8'
                },
                fonts: {
                    primary: 'Cairo',
                    secondary: 'Tajawal',
                    size: '16px',
                    scale: 1
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                animations: {
                    enabled: true,
                    speed: '0.3s',
                    type: 'ease',
                    scale: 1
                },
                shadows: {
                    sm: '0 1px 2px rgba(0,0,0,0.3)',
                    md: '0 4px 6px rgba(0,0,0,0.4)',
                    lg: '0 10px 15px rgba(0,0,0,0.5)',
                    xl: '0 20px 25px rgba(0,0,0,0.6)'
                },
                borderRadius: {
                    sm: '4px',
                    md: '8px',
                    lg: '12px',
                    xl: '16px',
                    full: '9999px'
                },
                preview: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)'
            },

            lavender: {
                id: 'lavender',
                name: 'لافندر',
                icon: 'fa-fan',
                description: 'ثيم هادئ بألوان البنفسج',
                colors: {
                    primary: '#8b5cf6',
                    secondary: '#7c3aed',
                    background: '#2e1065',
                    card: '#4c1d95',
                    text: '#ffffff',
                    textSecondary: '#ddd6fe',
                    border: '#6d28d9',
                    hover: '#4c1d95',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                    info: '#38bdf8'
                },
                fonts: {
                    primary: 'Cairo',
                    secondary: 'Tajawal',
                    size: '16px',
                    scale: 1
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                animations: {
                    enabled: true,
                    speed: '0.3s',
                    type: 'ease',
                    scale: 1
                },
                shadows: {
                    sm: '0 1px 2px rgba(0,0,0,0.3)',
                    md: '0 4px 6px rgba(0,0,0,0.4)',
                    lg: '0 10px 15px rgba(0,0,0,0.5)',
                    xl: '0 20px 25px rgba(0,0,0,0.6)'
                },
                borderRadius: {
                    sm: '4px',
                    md: '8px',
                    lg: '12px',
                    xl: '16px',
                    full: '9999px'
                },
                preview: 'linear-gradient(135deg, #2e1065 0%, #8b5cf6 100%)'
            },

            rose: {
                id: 'rose',
                name: 'وردي',
                icon: 'fa-rose',
                description: 'ثيم رومانسي بألوان الورد',
                colors: {
                    primary: '#ec4899',
                    secondary: '#db2777',
                    background: '#831843',
                    card: '#9d174d',
                    text: '#ffffff',
                    textSecondary: '#fbcfe8',
                    border: '#be185d',
                    hover: '#9d174d',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                    info: '#38bdf8'
                },
                fonts: {
                    primary: 'Cairo',
                    secondary: 'Tajawal',
                    size: '16px',
                    scale: 1
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                animations: {
                    enabled: true,
                    speed: '0.3s',
                    type: 'ease',
                    scale: 1
                },
                shadows: {
                    sm: '0 1px 2px rgba(0,0,0,0.3)',
                    md: '0 4px 6px rgba(0,0,0,0.4)',
                    lg: '0 10px 15px rgba(0,0,0,0.5)',
                    xl: '0 20px 25px rgba(0,0,0,0.6)'
                },
                borderRadius: {
                    sm: '4px',
                    md: '8px',
                    lg: '12px',
                    xl: '16px',
                    full: '9999px'
                },
                preview: 'linear-gradient(135deg, #831843 0%, #ec4899 100%)'
            }
        };
    }

    // ===== 2. تهيئة المدير =====
    async init() {
        await this.loadUserTheme();
        this.setupThemeListener();
        this.injectThemeVariables();
    }

    // ===== 3. تحميل ثيم المستخدم =====
    async loadUserTheme() {
        if (!this.currentUser) {
            // استخدام الثيم الافتراضي
            this.currentTheme = 'light';
            this.applyTheme(this.currentTheme);
            return;
        }

        try {
            // محاولة تحميل الثيم المحفوظ
            const savedTheme = localStorage.getItem(`theme_${this.currentUser.userId}`);
            if (savedTheme && this.themes[savedTheme]) {
                this.currentTheme = savedTheme;
            } else {
                this.currentTheme = 'light';
            }
        } catch (error) {
            console.error('Error loading user theme:', error);
            this.currentTheme = 'light';
        }

        this.applyTheme(this.currentTheme);
    }

    // ===== 4. تطبيق الثيم =====
    applyTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme) return false;

        this.currentTheme = themeId;
        
        // تطبيق متغيرات CSS
        this.applyCSSVariables(theme);
        
        // تحديث البيانات-السمة
        document.documentElement.setAttribute('data-theme', themeId);
        
        // حفظ ثيم المستخدم
        this.saveUserTheme(themeId);
        
        // إشعار المستمعين
        this.notifyListeners(themeId, theme);
        
        return true;
    }

    // ===== 5. تطبيق متغيرات CSS =====
    applyCSSVariables(theme) {
        const root = document.documentElement;

        // تطبيق الألوان
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        // تطبيق الخطوط
        Object.entries(theme.fonts).forEach(([key, value]) => {
            root.style.setProperty(`--font-${key}`, value);
        });

        // تطبيق المسافات
        Object.entries(theme.spacing).forEach(([key, value]) => {
            root.style.setProperty(`--spacing-${key}`, value);
        });

        // تطبيق الظلال
        Object.entries(theme.shadows).forEach(([key, value]) => {
            root.style.setProperty(`--shadow-${key}`, value);
        });

        // تطبيق أنصاف الأقطار
        Object.entries(theme.borderRadius).forEach(([key, value]) => {
            root.style.setProperty(`--radius-${key}`, value);
        });

        // تطبيق سرعة الأنيميشن
        root.style.setProperty('--animation-speed', theme.animations.speed);
        root.style.setProperty('--animation-type', theme.animations.type);
    }

    // ===== 6. حقن متغيرات CSS =====
    injectThemeVariables() {
        const style = document.createElement('style');
        style.id = 'theme-variables';
        style.textContent = `
            :root {
                transition: background-color var(--animation-speed) var(--animation-type),
                            color var(--animation-speed) var(--animation-type),
                            border-color var(--animation-speed) var(--animation-type),
                            box-shadow var(--animation-speed) var(--animation-type);
            }
            
            body {
                background-color: var(--background);
                color: var(--text);
                font-family: var(--font-primary);
                font-size: var(--font-size);
            }
            
            .card {
                background-color: var(--card);
                border-color: var(--border);
            }
            
            .text-primary { color: var(--primary) !important; }
            .text-secondary { color: var(--secondary) !important; }
            .text-success { color: var(--success) !important; }
            .text-warning { color: var(--warning) !important; }
            .text-error { color: var(--error) !important; }
            .text-info { color: var(--info) !important; }
            
            .bg-primary { background-color: var(--primary) !important; }
            .bg-secondary { background-color: var(--secondary) !important; }
            .bg-success { background-color: var(--success) !important; }
            .bg-warning { background-color: var(--warning) !important; }
            .bg-error { background-color: var(--error) !important; }
            .bg-info { background-color: var(--info) !important; }
            
            .border-primary { border-color: var(--primary) !important; }
            .border-secondary { border-color: var(--secondary) !important; }
            .border-success { border-color: var(--success) !important; }
            .border-warning { border-color: var(--warning) !important; }
            .border-error { border-color: var(--error) !important; }
            .border-info { border-color: var(--info) !important; }
            
            .shadow-sm { box-shadow: var(--shadow-sm); }
            .shadow-md { box-shadow: var(--shadow-md); }
            .shadow-lg { box-shadow: var(--shadow-lg); }
            .shadow-xl { box-shadow: var(--shadow-xl); }
            
            .rounded-sm { border-radius: var(--radius-sm); }
            .rounded-md { border-radius: var(--radius-md); }
            .rounded-lg { border-radius: var(--radius-lg); }
            .rounded-xl { border-radius: var(--radius-xl); }
            .rounded-full { border-radius: var(--radius-full); }
            
            .mt-xs { margin-top: var(--spacing-xs); }
            .mt-sm { margin-top: var(--spacing-sm); }
            .mt-md { margin-top: var(--spacing-md); }
            .mt-lg { margin-top: var(--spacing-lg); }
            .mt-xl { margin-top: var(--spacing-xl); }
            .mt-xxl { margin-top: var(--spacing-xxl); }
            
            .mb-xs { margin-bottom: var(--spacing-xs); }
            .mb-sm { margin-bottom: var(--spacing-sm); }
            .mb-md { margin-bottom: var(--spacing-md); }
            .mb-lg { margin-bottom: var(--spacing-lg); }
            .mb-xl { margin-bottom: var(--spacing-xl); }
            .mb-xxl { margin-bottom: var(--spacing-xxl); }
            
            .p-xs { padding: var(--spacing-xs); }
            .p-sm { padding: var(--spacing-sm); }
            .p-md { padding: var(--spacing-md); }
            .p-lg { padding: var(--spacing-lg); }
            .p-xl { padding: var(--spacing-xl); }
            .p-xxl { padding: var(--spacing-xxl); }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .fade-in {
                animation: fadeIn var(--animation-speed) var(--animation-type);
            }
            
            .slide-in {
                animation: slideIn var(--animation-speed) var(--animation-type);
            }
        `;
        document.head.appendChild(style);
    }

    // ===== 7. حفظ ثيم المستخدم =====
    saveUserTheme(themeId) {
        if (!this.currentUser) return;

        try {
            localStorage.setItem(`theme_${this.currentUser.userId}`, themeId);
            
            // حفظ في قاعدة البيانات إذا كان متاحاً
            if (window.database) {
                // حفظ في Firebase
            }
        } catch (error) {
            console.error('Error saving user theme:', error);
        }
    }

    // ===== 8. تغيير الثيم =====
    changeTheme(themeId) {
        if (!this.themes[themeId] && !this.customThemes.has(themeId)) {
            return {
                success: false,
                error: 'الثيم غير موجود'
            };
        }

        const success = this.applyTheme(themeId);
        
        return {
            success,
            theme: this.getTheme(themeId)
        };
    }

    // ===== 9. الحصول على الثيم الحالي =====
    getCurrentTheme() {
        return this.getTheme(this.currentTheme);
    }

    // ===== 10. الحصول على ثيم =====
    getTheme(themeId) {
        return this.themes[themeId] || this.customThemes.get(themeId);
    }

    // ===== 11. الحصول على كل الثيمات =====
    getAllThemes() {
        const themes = { ...this.themes };
        this.customThemes.forEach((theme, id) => {
            themes[id] = theme;
        });
        return themes;
    }

    // ===== 12. إضافة ثيم مخصص =====
    addCustomTheme(themeId, themeData) {
        if (this.themes[themeId] || this.customTheses.has(themeId)) {
            return {
                success: false,
                error: 'الثيم موجود بالفعل'
            };
        }

        this.customThemes.set(themeId, {
            ...themeData,
            id: themeId,
            custom: true
        });

        return {
            success: true,
            theme: this.customThemes.get(themeId)
        };
    }

    // ===== 13. حذف ثيم مخصص =====
    deleteCustomTheme(themeId) {
        if (!this.customThemes.has(themeId)) {
            return {
                success: false,
                error: 'الثيم غير موجود'
            };
        }

        this.customThemes.delete(themeId);
        
        // إذا كان الثيم الحالي هو المحذوف، نعود للثيم الافتراضي
        if (this.currentTheme === themeId) {
            this.changeTheme('light');
        }

        return {
            success: true,
            message: 'تم حذف الثيم بنجاح'
        };
    }

    // ===== 14. تخصيص ثيم =====
    customizeTheme(themeId, customizations) {
        const theme = this.getTheme(themeId);
        if (!theme) {
            return {
                success: false,
                error: 'الثيم غير موجود'
            };
        }

        const customizedTheme = {
            ...theme,
            ...customizations,
            id: `${themeId}_custom_${Date.now()}`,
            parent: themeId,
            custom: true
        };

        this.customThemes.set(customizedTheme.id, customizedTheme);
        
        return {
            success: true,
            theme: customizedTheme
        };
    }

    // ===== 15. تصدير ثيم =====
    exportTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme) return null;

        const exportData = {
            ...theme,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        return exportData;
    }

    // ===== 16. استيراد ثيم =====
    importTheme(themeData) {
        if (!themeData.id || !themeData.name) {
            return {
                success: false,
                error: 'بيانات الثيم غير صالحة'
            };
        }

        if (this.themes[themeData.id] || this.customThemes.has(themeData.id)) {
            // إذا كان الثيم موجوداً، نضيف نسخة
            themeData.id = `${themeData.id}_imported_${Date.now()}`;
        }

        this.customThemes.set(themeData.id, {
            ...themeData,
            imported: true,
            importedAt: new Date().toISOString()
        });

        return {
            success: true,
            theme: this.customThemes.get(themeData.id)
        };
    }

    // ===== 17. إعادة تعيين الثيم =====
    resetTheme() {
        this.changeTheme('light');
        
        return {
            success: true,
            message: 'تم إعادة تعيين الثيم'
        };
    }

    // ===== 18. إضافة مستمع =====
    addListener(callback) {
        this.listeners.push(callback);
    }

    // ===== 19. إزالة مستمع =====
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // ===== 20. إشعار المستمعين =====
    notifyListeners(themeId, theme) {
        this.listeners.forEach(callback => {
            try {
                callback(themeId, theme);
            } catch (error) {
                console.error('Error in theme listener:', error);
            }
        });
    }

    // ===== 21. إعداد مستمع الثيم =====
    setupThemeListener() {
        // الاستماع لتغييرات الثيم من المستخدمين الآخرين
        window.addEventListener('storage', (e) => {
            if (e.key === `theme_${this.currentUser?.userId}`) {
                const newTheme = e.newValue;
                if (newTheme && newTheme !== this.currentTheme) {
                    this.changeTheme(newTheme);
                }
            }
        });
    }

    // ===== 22. معاينة ثيم =====
    previewTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme) return null;

        // تطبيق مؤقت للثيم للمعاينة
        const originalTheme = this.currentTheme;
        this.applyCSSVariables(theme);
        
        return {
            theme,
            revert: () => this.changeTheme(originalTheme)
        };
    }

    // ===== 23. الحصول على إحصائيات الثيمات =====
    getStats() {
        return {
            totalThemes: Object.keys(this.themes).length + this.customThemes.size,
            builtInThemes: Object.keys(this.themes).length,
            customThemes: this.customThemes.size,
            currentTheme: this.currentTheme,
            currentThemeName: this.getCurrentTheme()?.name
        };
    }

    // ===== 24. الحصول على ألوان الثيم الحالي =====
    getCurrentColors() {
        const theme = this.getCurrentTheme();
        return theme?.colors || {};
    }

    // ===== 25. تحديث لون معين =====
    updateColor(colorName, value) {
        const theme = this.getCurrentTheme();
        if (!theme) return false;

        theme.colors[colorName] = value;
        document.documentElement.style.setProperty(`--${colorName}`, value);
        
        return true;
    }

    // ===== 26. إعادة تعيين الألوان =====
    resetColors() {
        const theme = this.getTheme(this.currentTheme);
        if (!theme) return false;

        this.applyCSSVariables(theme);
        return true;
    }

    // ===== 27. تبديل الوضع الداكن/الفاتح =====
    toggleDarkMode() {
        if (this.currentTheme === 'dark') {
            this.changeTheme('light');
        } else {
            this.changeTheme('dark');
        }
    }

    // ===== 28. الحصول على ثيم عشوائي =====
    getRandomTheme() {
        const themes = Object.keys(this.themes);
        const randomIndex = Math.floor(Math.random() * themes.length);
        return themes[randomIndex];
    }

    // ===== 29. تطبيق ثيم عشوائي =====
    applyRandomTheme() {
        const randomTheme = this.getRandomTheme();
        return this.changeTheme(randomTheme);
    }

    // ===== 30. حفظ كل الثيمات =====
    saveAllThemes() {
        const themes = this.getAllThemes();
        
        try {
            localStorage.setItem('all_themes', JSON.stringify(themes));
            return {
                success: true,
                count: Object.keys(themes).length
            };
        } catch (error) {
            console.error('Error saving themes:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ===== 31. تحميل كل الثيمات =====
    loadAllThemes() {
        try {
            const saved = localStorage.getItem('all_themes');
            if (saved) {
                const themes = JSON.parse(saved);
                Object.entries(themes).forEach(([id, theme]) => {
                    if (!this.themes[id]) {
                        this.customThemes.set(id, theme);
                    }
                });
            }
            return {
                success: true,
                count: this.customThemes.size
            };
        } catch (error) {
            console.error('Error loading themes:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ===== 32. مسح الثيمات المخصصة =====
    clearCustomThemes() {
        this.customThemes.clear();
        
        if (this.customThemes.has(this.currentTheme)) {
            this.changeTheme('light');
        }

        return {
            success: true,
            message: 'تم مسح جميع الثيمات المخصصة'
        };
    }

    // ===== 33. دمج ثيمين =====
    mergeThemes(themeId1, themeId2) {
        const theme1 = this.getTheme(themeId1);
        const theme2 = this.getTheme(themeId2);

        if (!theme1 || !theme2) {
            return {
                success: false,
                error: 'أحد الثيمات غير موجود'
            };
        }

        const mergedTheme = {
            id: `merged_${themeId1}_${themeId2}_${Date.now()}`,
            name: `دمج ${theme1.name} و ${theme2.name}`,
            icon: 'fa-magic',
            description: 'ثيم مدمج',
            colors: {
                ...theme1.colors,
                ...theme2.colors,
                primary: theme1.colors.primary,
                secondary: theme2.colors.secondary
            },
            fonts: theme1.fonts,
            spacing: theme1.spacing,
            animations: theme1.animations,
            shadows: theme1.shadows,
            borderRadius: theme1.borderRadius,
            custom: true,
            merged: true,
            mergedFrom: [themeId1, themeId2]
        };

        this.customThemes.set(mergedTheme.id, mergedTheme);

        return {
            success: true,
            theme: mergedTheme
        };
    }
}

export default ThemeManager;
