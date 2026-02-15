// ================================================
// نظام الإشعارات الفورية - Supabase Realtime
// ================================================

class NotificationSystem {
    constructor(supabase, currentUser) {
        this.supabase = supabase;
        this.currentUser = currentUser;
        this.subscriptions = [];
        this.notificationCallbacks = [];
        this.unreadCount = 0;
    }

    // ================================================
    // تهيئة نظام الإشعارات
    // ================================================
    async initialize() {
        if (!this.currentUser) {
            console.error('المستخدم غير مسجل الدخول');
            return;
        }

        // تحميل الإشعارات السابقة
        await this.loadNotifications();

        // الاشتراك في الإشعارات الجديدة
        this.subscribeToNotifications();

        // تحديث عداد الإشعارات كل دقيقة
        setInterval(() => this.updateUnreadCount(), 60000);

        // تحديث حالة الإشعارات عند عودة الصفحة
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadNotifications();
            }
        });
    }

    // ================================================
    // تحميل الإشعارات
    // ================================================
    async loadNotifications(limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from('notifications')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            this.notifications = data || [];
            this.unreadCount = this.notifications.filter(n => !n.is_read).length;

            // استدعاء الدوال المسجلة
            this.notificationCallbacks.forEach(callback => {
                callback(this.notifications, this.unreadCount);
            });

            return this.notifications;

        } catch (error) {
            console.error('خطأ في تحميل الإشعارات:', error);
            return [];
        }
    }

    // ================================================
    // الاشتراك في الإشعارات المباشرة
    // ================================================
    subscribeToNotifications() {
        const subscription = this.supabase
            .channel('notifications-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${this.currentUser.id}`
                },
                (payload) => this.handleNewNotification(payload.new)
            )
            .subscribe();

        this.subscriptions.push(subscription);
    }

    // ================================================
    // معالجة الإشعار الجديد
    // ================================================
    handleNewNotification(notification) {
        // إضافة الإشعار إلى القائمة
        this.notifications.unshift(notification);
        this.unreadCount++;

        // استدعاء الدوال المسجلة
        this.notificationCallbacks.forEach(callback => {
            callback(this.notifications, this.unreadCount);
        });

        // عرض إشعار منبثق
        this.showNotificationPopup(notification);

        // تشغيل صوت التنبيه
        this.playNotificationSound();

        // تحديث عنوان الصفحة
        this.updatePageTitle();

        // إرسال إشعار متصفح (إذا كان مسموحاً)
        this.sendBrowserNotification(notification);
    }

    // ================================================
    // عرض إشعار منبثق
    // ================================================
    showNotificationPopup(notification) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            padding: 16px 24px;
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 9999;
            animation: slideDown 0.3s ease;
            border-right: 4px solid ${this.getNotificationColor(notification.type)};
            max-width: 400px;
            direction: rtl;
        `;

        toast.innerHTML = `
            <div style="width: 40px; height: 40px; background: ${this.getNotificationColor(notification.type)}20; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${this.getNotificationColor(notification.type)};">
                <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700; margin-bottom: 5px;">${notification.title || 'إشعار جديد'}</div>
                <div style="color: #64748b; font-size: 0.9rem;">${notification.message || ''}</div>
                <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 5px;">${this.formatTime(notification.created_at)}</div>
            </div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #94a3b8; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(toast);

        // إزالة الإشعار بعد 5 ثواني
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // ================================================
    // تشغيل صوت التنبيه
    // ================================================
    playNotificationSound() {
        // التحقق من تفضيلات المستخدم للصوت
        const soundEnabled = localStorage.getItem('notification_sound') !== 'false';
        
        if (soundEnabled) {
            try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(e => console.log('تعذر تشغيل الصوت:', e));
            } catch (error) {
                console.log('متصفحك لا يدعم تشغيل الصوت');
            }
        }
    }

    // ================================================
    // إرسال إشعار متصفح
    // ================================================
    async sendBrowserNotification(notification) {
        if (!('Notification' in window)) {
            return;
        }

        // طلب الإذن إذا لم يُمنح بعد
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }

        // إرسال الإشعار إذا كان مسموحاً
        if (Notification.permission === 'granted') {
            try {
                const browserNotification = new Notification(notification.title || 'نظام تسجيل السفن', {
                    body: notification.message,
                    icon: '/icons/notification-icon.png',
                    badge: '/icons/badge-icon.png',
                    tag: notification.id,
                    renotify: true,
                    silent: false,
                    data: {
                        url: notification.link || '/dashboard',
                        id: notification.id
                    }
                });

                browserNotification.onclick = function(event) {
                    event.preventDefault();
                    window.focus();
                    if (this.data.url) {
                        window.location.href = this.data.url;
                    }
                    this.close();
                };

                // إغلاق الإشعار تلقائياً بعد 5 ثواني
                setTimeout(() => browserNotification.close(), 5000);

            } catch (error) {
                console.error('خطأ في إرسال إشعار المتصفح:', error);
            }
        }
    }

    // ================================================
    // تحديث عنوان الصفحة بعدد الإشعارات
    // ================================================
    updatePageTitle() {
        const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
        if (this.unreadCount > 0) {
            document.title = `(${this.unreadCount}) ${originalTitle}`;
        } else {
            document.title = originalTitle;
        }
    }

    // ================================================
    // تحديث عداد الإشعارات
    // ================================================
    async updateUnreadCount() {
        try {
            const { count, error } = await this.supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.currentUser.id)
                .eq('is_read', false);

            if (error) throw error;

            this.unreadCount = count || 0;
            this.updatePageTitle();

            return this.unreadCount;

        } catch (error) {
            console.error('خطأ في تحديث عداد الإشعارات:', error);
            return 0;
        }
    }

    // ================================================
    // تسجيل دالة استدعاء للتغييرات
    // ================================================
    onNotification(callback) {
        this.notificationCallbacks.push(callback);
        
        // استدعاء الدالة فوراً بالبيانات الحالية
        if (this.notifications) {
            callback(this.notifications, this.unreadCount);
        }

        // إرجاع دالة لإلغاء التسجيل
        return () => {
            this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
        };
    }

    // ================================================
    // تحديث حالة الإشعار كمقروء
    // ================================================
    async markAsRead(notificationId) {
        try {
            const { error } = await this.supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('id', notificationId);

            if (error) throw error;

            // تحديث الحالة محلياً
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.is_read = true;
                notification.read_at = new Date().toISOString();
            }

            // تحديث العداد
            this.unreadCount = this.notifications.filter(n => !n.is_read).length;
            this.updatePageTitle();

            return true;

        } catch (error) {
            console.error('خطأ في تحديث حالة الإشعار:', error);
            return false;
        }
    }

    // ================================================
    // تحديث جميع الإشعارات كمقروءة
    // ================================================
    async markAllAsRead() {
        try {
            const { error } = await this.supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('user_id', this.currentUser.id)
                .eq('is_read', false);

            if (error) throw error;

            // تحديث الحالة محلياً
            this.notifications.forEach(notification => {
                notification.is_read = true;
                notification.read_at = new Date().toISOString();
            });

            // تحديث العداد
            this.unreadCount = 0;
            this.updatePageTitle();

            return true;

        } catch (error) {
            console.error('خطأ في تحديث جميع الإشعارات:', error);
            return false;
        }
    }

    // ================================================
    // حذف إشعار
    // ================================================
    async deleteNotification(notificationId) {
        try {
            const { error } = await this.supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            // إزالة من القائمة المحلية
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            
            // تحديث العداد
            this.unreadCount = this.notifications.filter(n => !n.is_read).length;
            this.updatePageTitle();

            return true;

        } catch (error) {
            console.error('خطأ في حذف الإشعار:', error);
            return false;
        }
    }

    // ================================================
    // حذف جميع الإشعارات
    // ================================================
    async deleteAllNotifications() {
        try {
            const { error } = await this.supabase
                .from('notifications')
                .delete()
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            // تحديث القائمة المحلية
            this.notifications = [];
            this.unreadCount = 0;
            this.updatePageTitle();

            return true;

        } catch (error) {
            console.error('خطأ في حذف جميع الإشعارات:', error);
            return false;
        }
    }

    // ================================================
    // إعدادات الإشعارات
    // ================================================
    async updateSettings(settings) {
        try {
            const { error } = await this.supabase
                .from('notification_settings')
                .upsert({
                    user_id: this.currentUser.id,
                    ...settings,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            // حفظ الإعدادات محلياً
            Object.keys(settings).forEach(key => {
                localStorage.setItem(`notification_${key}`, settings[key]);
            });

            return true;

        } catch (error) {
            console.error('خطأ في تحديث إعدادات الإشعارات:', error);
            return false;
        }
    }

    // ================================================
    // دوال مساعدة
    // ================================================
    getNotificationColor(type) {
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8',
            'reminder': '#1e4b7a',
            'deadline': '#dc3545',
            'payment': '#28a745',
            'update': '#1e4b7a'
        };
        return colors[type] || '#1e4b7a';
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle',
            'reminder': 'fa-bell',
            'deadline': 'fa-clock',
            'payment': 'fa-credit-card',
            'update': 'fa-sync-alt'
        };
        return icons[type] || 'fa-bell';
    }

    formatTime(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) {
            return 'الآن';
        } else if (diffMin < 60) {
            return `منذ ${diffMin} دقيقة`;
        } else if (diffHour < 24) {
            return `منذ ${diffHour} ساعة`;
        } else if (diffDay < 7) {
            return `منذ ${diffDay} يوم`;
        } else {
            return date.toLocaleDateString('ar-YE');
        }
    }

    // ================================================
    // إنشاء إشعار جديد (للمسؤولين)
    // ================================================
    async createNotification(userId, title, message, type = 'info', link = null) {
        try {
            const { data, error } = await this.supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    title: title,
                    message: message,
                    type: type,
                    link: link,
                    is_read: false,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            return data;

        } catch (error) {
            console.error('خطأ في إنشاء الإشعار:', error);
            return null;
        }
    }

    // ================================================
    // إنشاء إشعارات جماعية
    // ================================================
    async createBulkNotifications(userIds, title, message, type = 'info', link = null) {
        try {
            const notifications = userIds.map(userId => ({
                user_id: userId,
                title: title,
                message: message,
                type: type,
                link: link,
                is_read: false,
                created_at: new Date().toISOString()
            }));

            const { data, error } = await this.supabase
                .from('notifications')
                .insert(notifications)
                .select();

            if (error) throw error;

            return data;

        } catch (error) {
            console.error('خطأ في إنشاء الإشعارات الجماعية:', error);
            return [];
        }
    }

    // ================================================
    // تنظيف الاشتراكات
    // ================================================
    unsubscribe() {
        this.subscriptions.forEach(subscription => {
            this.supabase.removeChannel(subscription);
        });
        this.subscriptions = [];
        this.notificationCallbacks = [];
    }
}

// ================================================
// تصدير النظام
// ================================================
export default NotificationSystem;