// assets/js/notifications.js
// نظام الإشعارات المتقدم مع التتبع

import { database, ref, push, update, get, onValue, query, orderByChild, equalTo } from './firebase-config.js';

class NotificationSystem {
    constructor(currentUser) {
        this.currentUser = currentUser;
        this.notifications = [];
        this.unreadCount = 0;
        this.listeners = [];
        this.init();
    }

    init() {
        this.loadNotifications();
        this.setupRealtimeListener();
    }

    // تحميل الإشعارات
    async loadNotifications() {
        if (!this.currentUser) return;
        
        const notificationsRef = ref(database, `notifications/${this.currentUser.userId}`);
        onValue(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
                this.notifications = Object.entries(snapshot.val()).map(([id, data]) => ({
                    id,
                    ...data
                }));
                this.unreadCount = this.notifications.filter(n => !n.read).length;
                this.updateBadge();
                this.notifyListeners();
            }
        });
    }

    // إعداد المستمع المباشر
    setupRealtimeListener() {
        if (!this.currentUser) return;
        
        const newNotificationsRef = query(
            ref(database, `notifications/${this.currentUser.userId}`),
            orderByChild('timestamp')
        );
        
        onValue(newNotificationsRef, (snapshot) => {
            this.loadNotifications();
        });
    }

    // إنشاء إشعار جديد
    async createNotification(notification) {
        try {
            const {
                userId,
                type,
                title,
                message,
                link,
                senderId,
                senderName,
                priority = 'normal',
                metadata = {}
            } = notification;

            const notificationData = {
                type,
                title,
                message,
                link: link || '#',
                senderId: senderId || this.currentUser?.userId,
                senderName: senderName || this.currentUser?.fullName,
                priority,
                metadata,
                read: false,
                seen: false,
                timestamp: new Date().toISOString(),
                trackingNumber: await this.generateTrackingNumber('NOT')
            };

            const notificationRef = ref(database, `notifications/${userId}`);
            const newNotificationRef = push(notificationRef);
            await set(newNotificationRef, notificationData);

            // تسجيل النشاط
            await this.logNotificationActivity(notificationData, newNotificationRef.key);

            return {
                success: true,
                notificationId: newNotificationRef.key
            };

        } catch (error) {
            console.error('Error creating notification:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // إنشاء إشعار لمجموعة من المستخدمين
    async broadcastNotification(notification, userIds) {
        const results = [];
        for (const userId of userIds) {
            const result = await this.createNotification({
                ...notification,
                userId
            });
            results.push(result);
        }
        return results;
    }

    // إنشاء إشعار لكل أعضاء لجنة
    async notifyCommittee(committeeId, notification) {
        try {
            // جلب أعضاء اللجنة
            const committeeRef = ref(database, `committees/${committeeId}/members`);
            const snapshot = await get(committeeRef);
            
            if (snapshot.exists()) {
                const members = Object.keys(snapshot.val());
                return await this.broadcastNotification(notification, members);
            }
            
            return [];
        } catch (error) {
            console.error('Error notifying committee:', error);
            return [];
        }
    }

    // إنشاء إشعار لكل أعضاء فرع
    async notifyBranch(branchId, notification) {
        try {
            const branchRef = ref(database, `branches/${branchId}/members`);
            const snapshot = await get(branchRef);
            
            if (snapshot.exists()) {
                const members = Object.keys(snapshot.val());
                return await this.broadcastNotification(notification, members);
            }
            
            return [];
        } catch (error) {
            console.error('Error notifying branch:', error);
            return [];
        }
    }

    // تحديث حالة الإشعار (مقروء)
    async markAsRead(notificationId) {
        if (!this.currentUser) return;
        
        try {
            await update(ref(database, `notifications/${this.currentUser.userId}/${notificationId}`), {
                read: true,
                readAt: new Date().toISOString()
            });
            
            this.unreadCount--;
            this.updateBadge();
            
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // تحديث حالة الإشعار (مشاهَد)
    async markAsSeen(notificationId) {
        if (!this.currentUser) return;
        
        try {
            await update(ref(database, `notifications/${this.currentUser.userId}/${notificationId}`), {
                seen: true,
                seenAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error marking notification as seen:', error);
        }
    }

    // تحديث كل الإشعارات كمقروءة
    async markAllAsRead() {
        if (!this.currentUser) return;
        
        const updates = {};
        this.notifications.forEach(notification => {
            if (!notification.read) {
                updates[`notifications/${this.currentUser.userId}/${notification.id}/read`] = true;
                updates[`notifications/${this.currentUser.userId}/${notification.id}/readAt`] = new Date().toISOString();
            }
        });
        
        if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
            this.unreadCount = 0;
            this.updateBadge();
        }
    }

    // حذف إشعار
    async deleteNotification(notificationId) {
        if (!this.currentUser) return;
        
        try {
            await remove(ref(database, `notifications/${this.currentUser.userId}/${notificationId}`));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    // تحديث عداد الإشعارات في الواجهة
    updateBadge() {
        const badge = document.getElementById('notificationCount');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }
    }

    // إضافة مستمع
    addListener(callback) {
        this.listeners.push(callback);
    }

    // إشعار المستمعين
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.notifications, this.unreadCount));
    }

    // توليد رقم تتبع للإشعار
    async generateTrackingNumber(prefix) {
        const year = new Date().getFullYear();
        const counterRef = ref(database, `counters/${prefix}_${year}`);
        const snapshot = await get(counterRef);
        const currentCount = snapshot.exists() ? snapshot.val() : 0;
        const newCount = currentCount + 1;
        await set(counterRef, newCount);
        
        const paddedNumber = newCount.toString().padStart(4, '0');
        return `${prefix}-${paddedNumber}-${year}`;
    }

    // تسجيل نشاط الإشعار
    async logNotificationActivity(notification, notificationId) {
        const activityRef = ref(database, 'activities');
        await push(activityRef, {
            type: 'notification',
            title: 'إشعار جديد',
            description: `تم إرسال إشعار: ${notification.title}`,
            icon: 'fa-bell',
            userId: notification.userId,
            notificationId,
            timestamp: new Date().toISOString()
        });
    }

    // الحصول على الإشعارات غير المقروءة
    getUnreadNotifications() {
        return this.notifications.filter(n => !n.read);
    }

    // الحصول على الإشعارات حسب النوع
    getNotificationsByType(type) {
        return this.notifications.filter(n => n.type === type);
    }

    // الحصول على الإشعارات حسب الأولوية
    getNotificationsByPriority(priority) {
        return this.notifications.filter(n => n.priority === priority);
    }

    // عرض الإشعارات في الواجهة
    renderNotifications(container) {
        if (!container) return;
        
        container.innerHTML = this.notifications
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(notification => `
                <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
                     data-id="${notification.id}"
                     onclick="window.location.href='${notification.link}'">
                    <div class="notification-icon ${notification.priority}">
                        <i class="fas ${this.getIconForType(notification.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notification.title}</h4>
                        <p>${notification.message}</p>
                        <div class="notification-meta">
                            <span class="notification-time">
                                ${this.formatTime(notification.timestamp)}
                            </span>
                            <span class="notification-sender">
                                من: ${notification.senderName}
                            </span>
                        </div>
                    </div>
                    ${!notification.read ? '<span class="unread-dot"></span>' : ''}
                </div>
            `).join('') || '<p class="no-notifications">لا توجد إشعارات</p>';
    }

    // الحصول على أيقونة حسب نوع الإشعار
    getIconForType(type) {
        const icons = {
            request: 'fa-file-alt',
            tracking: 'fa-exchange-alt',
            message: 'fa-envelope',
            vote: 'fa-check-circle',
            evaluation: 'fa-star',
            attendance: 'fa-clock',
            system: 'fa-cog',
            warning: 'fa-exclamation-triangle',
            success: 'fa-check-circle'
        };
        return icons[type] || 'fa-bell';
    }

    // تنسيق الوقت
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;
        
        return date.toLocaleDateString('ar-EG');
    }
}

export default NotificationSystem;
