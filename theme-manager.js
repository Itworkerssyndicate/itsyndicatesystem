// assets/js/theme-manager.js
// نظام إدارة الثيمات لكل مستخدم على حدة

import { database, ref, get, update } from './firebase-config.js';

class ThemeManager {
    constructor(currentUser) {
        this.currentUser = currentUser;
        this.currentTheme = 'light';
        this.availableThemes = [
            { 
                id: 'light', 
                name: 'فاتح', 
                icon: '☀️', 
                preview: 'light',
                colors: {
                    primary: '#667eea',
                    secondary: '#764ba2',
                    bg: '#ffffff',
                    text: '#333333'
                }
            },
            { 
                id: 'dark', 
                name: 'داكن', 
                icon: '🌙', 
                preview: 'dark',
                colors: {
                    primary: '#4299e1',
                    secondary: '#9f7aea',
                    bg: '#1a202c',
                    text: '#f7fafc'
                }
            },
            { 
                id: 'navy', 
                name: 'كحلي', 
                icon: '⚓', 
                preview: 'navy',
                colors: {
                    primary: '#3b82f6',
                    secondary: '#1e3a8a',
                    bg: '#0a1929',
                    text: '#ffffff'
                }
            },
            { 
                id: 'forest', 
                name: 'غابة', 
                icon: '🌲', 
                preview: 'forest',
                colors: {
                    primary: '#10b981',
                    secondary: '#059669',
                    bg: '#064e3b',
                    text: '#ffffff'
                }
            },
            { 
                id: 'sunset', 
                name: 'غروب', 
                icon: '🌅', 
                preview: 'sunset',
                colors: {
                    primary: '#f97316',
                    secondary: '#dc2626',
                    bg: '#7f1d1d',
                    text: '#ffffff'
                }
            }
        ];
        
        this.init();
    }

    async init() {
        await this.loadUserTheme();
        this.setupThemeListener();
    }

    async loadUserTheme() {
        if (!this.currentUser) return;
        
        try {
            const userRef = ref(database, `users/${this.currentUser.userId}/settings/theme`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                this.currentTheme = snapshot.val();
                this.applyTheme(this.currentTheme);
            } else {
                // الثيم الافتراضي
                this.currentTheme = 'light';
                this.applyTheme('light');
            }
        } catch (error) {
            console.error('خطأ في تحميل الثيم:', error);
        }
    }

    applyTheme(themeId) {
        const theme = this.availableThemes.find(t => t.id === themeId);
        if (!theme) return;

        document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
        document.documentElement.style.setProperty('--secondary-color', theme.colors.secondary);
        document.documentElement.style.setProperty('--bg-primary', theme.colors.bg);
        document.documentElement.style.setProperty('--text-primary', theme.colors.text);
        
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('userTheme', themeId);
        this.currentTheme = themeId;
        
        // تحديث الأزرار النشطة
        document.querySelectorAll('.theme-box').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeId);
        });
    }

    async saveUserTheme(themeId) {
        if (!this.currentUser) return;
        
        try {
            await update(ref(database, `users/${this.currentUser.userId}/settings`), {
                theme: themeId,
                updatedAt: new Date().toISOString()
            });
            
            this.applyTheme(themeId);
            this.showNotification('✅ تم تغيير الثيم بنجاح', 'success');
            
            // إغلاق النافذة إذا كانت مفتوحة
            const modal = document.getElementById('themeModal');
            if (modal) modal.classList.remove('active');
            
        } catch (error) {
            console.error('خطأ في حفظ الثيم:', error);
            this.showNotification('❌ حدث خطأ في حفظ الثيم', 'error');
        }
    }

    setupThemeListener() {
        // الاستماع لتغييرات الثيم
        window.addEventListener('storage', (e) => {
            if (e.key === 'userTheme') {
                this.applyTheme(e.newValue);
            }
        });
    }

    renderThemeSelector(container) {
        const selector = document.createElement('div');
        selector.className = 'theme-selector';
        selector.innerHTML = `
            <h3><i class="fas fa-palette"></i> اختر الثيم المناسب لك</h3>
            <div class="themes-grid">
                ${this.availableThemes.map(theme => `
                    <div class="theme-box ${this.currentTheme === theme.id ? 'active' : ''}" 
                         data-theme="${theme.id}"
                         onclick="themeManager.saveUserTheme('${theme.id}')">
                        <div class="theme-preview ${theme.preview}"></div>
                        <div class="theme-name">${theme.icon} ${theme.name}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(selector);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `message-box ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 9999;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

export default ThemeManager;
