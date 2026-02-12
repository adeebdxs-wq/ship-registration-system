/**
 * وظائف لوحات التحكم لنظام تسجيل السفن
 */

// كائن إدارة لوحة التحكم
const DashboardManager = {
    currentUser: null,
    notifications: [],
    pendingTasks: [],
    
    init: function() {
        this.loadUserData();
        this.loadNotifications();
        this.loadPendingTasks();
        this.setupEventListeners();
        this.updateDashboardStats();
        this.startAutoRefresh();
    },
    
    loadUserData: function() {
        // تحميل بيانات المستخدم من localStorage أو API
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
            id: 'EMP001',
            name: 'أحمد محمد',
            role: 'موظف فرع',
            branch: 'ميناء الحديدة',
            department: 'استقبال الطلبات',
            email: 'ahmed@port-hodeidah.ye',
            phone: '+967712345678',
            avatar: null,
            permissions: ['view_requests', 'review_requests', 'update_status']
        };
        
        this.updateUserDisplay();
    },
    
    updateUserDisplay: function() {
        // تحديث عرض معلومات المستخدم
        const userElements = {
            userName: '.user-name',
            userRole: '.user-role',
            userBranch: '.user-branch',
            userAvatar: '.user-avatar'
        };
        
        for (const [key, selector] of Object.entries(userElements)) {
            const element = document.querySelector(selector);
            if (element) {
                if (key === 'userAvatar') {
                    if (this.currentUser.avatar) {
                        element.innerHTML = `<img src="${this.currentUser.avatar}" alt="صورة المستخدم">`;
                    } else {
                        element.innerHTML = '<i class="fas fa-user"></i>';
                    }
                } else {
                    element.textContent = this.currentUser[key] || this.currentUser[key.replace('user', '').toLowerCase()];
                }
            }
        }
    },
    
    loadNotifications: function() {
        // تحميل الإشعارات
        this.notifications = JSON.parse(localStorage.getItem('userNotifications')) || [
            {
                id: 1,
                title: 'طلب جديد',
                message: 'تم استلام طلب تسجيل سفينة جديدة #SHIP-2024-019',
                type: 'info',
                read: false,
                time: 'منذ 15 دقيقة',
                action: { type: 'view_request', data: 'SHIP-2024-019' }
            },
            {
                id: 2,
                title: 'تذكير',
                message: 'طلب #SHIP-2024-015 على وشك التأخير',
                type: 'warning',
                read: false,
                time: 'منذ ساعة',
                action: { type: 'review_request', data: 'SHIP-2024-015' }
            },
            {
                id: 3,
                title: 'تحديث حالة',
                message: 'تم قبول طلبك #SHIP-2024-014',
                type: 'success',
                read: true,
                time: 'منذ ساعتين',
                action: { type: 'view_request', data: 'SHIP-2024-014' }
            }
        ];
        
        this.updateNotificationBadge();
        this.renderNotifications();
    },
    
    
    updateNotificationBadge: function() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badgeElements = document.querySelectorAll('.notification-badge, .badge[data-notification-count]');
        
        badgeElements.forEach(badge => {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        });
    },
    
    renderNotifications: function() {
        const container = document.getElementById('notifications-container');
        if (!container) return;
        
        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon ${notification.type}">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">${notification.time}</span>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? `
                        <button class="btn-mark-read" onclick="DashboardManager.markAsRead(${notification.id})">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-delete-notification" onclick="DashboardManager.deleteNotification(${notification.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات جديدة</p>
                </div>
            `;
        }
    },
    
    getNotificationIcon: function(type) {
        const icons = {
            'info': 'info-circle',
            'warning': 'exclamation-triangle',
            'success': 'check-circle',
            'error': 'exclamation-circle'
        };
        return icons[type] || 'bell';
    },
    
    markAsRead: function(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationBadge();
            this.renderNotifications();
            showToast('تم تعيين الإشعار كمقروء', 'success');
        }
    },
    
    markAllAsRead: function() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.saveNotifications();
        this.updateNotificationBadge();
        this.renderNotifications();
        showToast('تم تعيين جميع الإشعارات كمقروءة', 'success');
    },
    
    deleteNotification: function(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.saveNotifications();
        this.updateNotificationBadge();
        this.renderNotifications();
        showToast('تم حذف الإشعار', 'info');
    },
    
    clearAllNotifications: function() {
        if (this.notifications.length === 0) return;
        
        if (confirm(`هل أنت متأكد من حذف جميع الإشعارات (${this.notifications.length} إشعار)؟`)) {
            this.notifications = [];
            this.saveNotifications();
            this.updateNotificationBadge();
            this.renderNotifications();
            showToast('تم حذف جميع الإشعارات', 'info');
        }
    },
    
    saveNotifications: function() {
        localStorage.setItem('userNotifications', JSON.stringify(this.notifications));
    },
    
    loadPendingTasks: function() {
        // تحميل المهام المعلقة
        this.pendingTasks = JSON.parse(localStorage.getItem('pendingTasks')) || [
            {
                id: 'TASK001',
                title: 'مراجعة طلب تسجيل سفينة',
                description: 'طلب #SHIP-2024-015 يحتاج مراجعة المستندات',
                priority: 'high',
                dueDate: '2024-03-15',
                assignedBy: 'مدير القسم',
                status: 'pending'
            },
            {
                id: 'TASK002',
                title: 'متابعة طلب مستندات ناقصة',
                description: 'طلب #SHIP-2024-012 يحتاج شهادة تأمين إضافية',
                priority: 'medium',
                dueDate: '2024-03-16',
                assignedBy: 'المشرف',
                status: 'in_progress'
            },
            {
                id: 'TASK003',
                title: 'إعداد تقرير شهري',
                description: 'تقرير نشاطات شهر مارس 2024',
                priority: 'low',
                dueDate: '2024-03-20',
                assignedBy: 'المدير العام',
                status: 'pending'
            }
        ];
        
        this.renderPendingTasks();
    },
    
    renderPendingTasks: function() {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        container.innerHTML = this.pendingTasks.map(task => `
            <div class="task-item ${task.priority}" data-id="${task.id}">
                <div class="task-checkbox">
                    <input type="checkbox" id="task-${task.id}" ${task.status === 'completed' ? 'checked' : ''}
                           onchange="DashboardManager.toggleTaskStatus('${task.id}', this.checked)">
                    <label for="task-${task.id}"></label>
                </div>
                <div class="task-content">
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">
                            <i class="fas fa-flag"></i> ${this.getPriorityText(task.priority)}
                        </span>
                        <span class="task-due-date">
                            <i class="fas fa-calendar"></i> ${task.dueDate}
                        </span>
                        <span class="task-assigned">
                            <i class="fas fa-user"></i> ${task.assignedBy}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-task-action" onclick="DashboardManager.viewTaskDetails('${task.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-task-action" onclick="DashboardManager.editTask('${task.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        if (this.pendingTasks.length === 0) {
            container.innerHTML = `
                <div class="no-tasks">
                    <i class="fas fa-check-circle"></i>
                    <p>لا توجد مهام معلقة</p>
                </div>
            `;
        }
    },
    
    getPriorityText: function(priority) {
        const priorities = {
            'high': 'عاجل',
            'medium': 'متوسط',
            'low': 'عادي'
        };
        return priorities[priority] || priority;
    },
    
    toggleTaskStatus: function(taskId, completed) {
        const task = this.pendingTasks.find(t => t.id === taskId);
        if (task) {
            task.status = completed ? 'completed' : 'pending';
            this.saveTasks();
            this.renderPendingTasks();
            
            if (completed) {
                showToast('تم إكمال المهمة', 'success');
            }
        }
    },
    
    viewTaskDetails: function(taskId) {
        const task = this.pendingTasks.find(t => t.id === taskId);
        if (task) {
            this.showTaskModal(task);
        }
    },
    
    showTaskModal: function(task) {
        const modal = document.createElement('div');
        modal.className = 'modal task-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تفاصيل المهمة</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="task-details">
                        <div class="detail-row">
                            <label>عنوان المهمة:</label>
                            <span>${task.title}</span>
                        </div>
                        <div class="detail-row">
                            <label>الوصف:</label>
                            <p>${task.description}</p>
                        </div>
                        <div class="detail-row">
                            <label>الأولوية:</label>
                            <span class="priority-badge ${task.priority}">${this.getPriorityText(task.priority)}</span>
                        </div>
                        <div class="detail-row">
                            <label>تاريخ الاستحقاق:</label>
                            <span>${task.dueDate}</span>
                        </div>
                        <div class="detail-row">
                            <label>تم تعيينها بواسطة:</label>
                            <span>${task.assignedBy}</span>
                        </div>
                        <div class="detail-row">
                            <label>الحالة:</label>
                            <span class="status-badge ${task.status}">${this.getStatusText(task.status)}</span>
                        </div>
                        <div class="detail-row">
                            <label>تاريخ الإنشاء:</label>
                            <span>${task.createdAt || 'غير محدد'}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        إغلاق
                    </button>
                    ${task.status !== 'completed' ? `
                        <button class="btn-complete" onclick="DashboardManager.completeTask('${task.id}')">
                            <i class="fas fa-check"></i> إكمال المهمة
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    getStatusText: function(status) {
        const statuses = {
            'pending': 'قيد الانتظار',
            'in_progress': 'قيد التنفيذ',
            'completed': 'مكتمل'
        };
        return statuses[status] || status;
    },
    
    completeTask: function(taskId) {
        this.toggleTaskStatus(taskId, true);
        document.querySelector('.task-modal')?.remove();
    },
    
    editTask: function(taskId) {
        const task = this.pendingTasks.find(t => t.id === taskId);
        if (task) {
            this.showEditTaskModal(task);
        }
    },
    
    showEditTaskModal: function(task) {
        const modal = document.createElement('div');
        modal.className = 'modal edit-task-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تعديل المهمة</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editTaskForm">
                        <div class="form-group">
                            <label>عنوان المهمة:</label>
                            <input type="text" name="title" value="${task.title}" required>
                        </div>
                        <div class="form-group">
                            <label>الوصف:</label>
                            <textarea name="description" rows="3">${task.description}</textarea>
                        </div>
                        <div class="form-group">
                            <label>الأولوية:</label>
                            <select name="priority">
                                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>عادي</option>
                                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>متوسط</option>
                                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>عاجل</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>تاريخ الاستحقاق:</label>
                            <input type="date" name="dueDate" value="${task.dueDate}">
                        </div>
                        <div class="form-group">
                            <label>الحالة:</label>
                            <select name="status">
                                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>قيد التنفيذ</option>
                                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-save" onclick="DashboardManager.saveTaskChanges('${task.id}')">
                        <i class="fas fa-save"></i> حفظ التغييرات
                    </button>
                    <button class="btn-cancel" onclick="this.parentElement.parentElement.parentElement.remove()">
                        إلغاء
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    saveTaskChanges: function(taskId) {
        const form = document.getElementById('editTaskForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const updatedTask = Object.fromEntries(formData);
        
        const taskIndex = this.pendingTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.pendingTasks[taskIndex] = {
                ...this.pendingTasks[taskIndex],
                ...updatedTask
            };
            
            this.saveTasks();
            this.renderPendingTasks();
            document.querySelector('.edit-task-modal')?.remove();
            showToast('تم حفظ التغييرات', 'success');
        }
    },
    
    saveTasks: function() {
        localStorage.setItem('pendingTasks', JSON.stringify(this.pendingTasks));
    },
    
    setupEventListeners: function() {
        // حدث تحديث البيانات
        document.addEventListener('click', function(e) {
            if (e.target.closest('[data-action="refresh"]')) {
                DashboardManager.refreshDashboard();
            }
        });
        
        // حدث تصفية البيانات
        const filterInputs = document.querySelectorAll('.filter-input');
        filterInputs.forEach(input => {
            input.addEventListener('input', function() {
                DashboardManager.filterData(this.dataset.filter, this.value);
            });
        });
        
        // حدث تصدير البيانات
        document.addEventListener('click', function(e) {
            if (e.target.closest('[data-export]')) {
                const format = e.target.closest('[data-export]').dataset.export;
                DashboardManager.exportData(format);
            }
        });
    },
    
    refreshDashboard: function() {
        showToast('جاري تحديث البيانات...', 'info');
        
        // محاكاة تحديث البيانات
        setTimeout(() => {
            this.loadNotifications();
            this.loadPendingTasks();
            this.updateDashboardStats();
            showToast('تم تحديث البيانات', 'success');
        }, 1000);
    },
    
    filterData: function(filterType, value) {
        // تطبيق التصفية حسب النوع
        switch (filterType) {
            case 'requests':
                this.filterRequests(value);
                break;
            case 'tasks':
                this.filterTasks(value);
                break;
            case 'notifications':
                this.filterNotifications(value);
                break;
        }
    },
    
    filterRequests: function(searchTerm) {
        const rows = document.querySelectorAll('.request-row');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const search = searchTerm.toLowerCase();
            row.style.display = text.includes(search) ? '' : 'none';
        });
    },
    
    filterTasks: function(status) {
        const tasks = document.querySelectorAll('.task-item');
        tasks.forEach(task => {
            if (status === 'all') {
                task.style.display = '';
            } else {
                const taskStatus = task.dataset.status || 'pending';
                task.style.display = taskStatus === status ? '' : 'none';
            }
        });
    },
    
    filterNotifications: function(type) {
        const notifications = document.querySelectorAll('.notification-item');
        notifications.forEach(notification => {
            if (type === 'all') {
                notification.style.display = '';
            } else {
                const notificationType = notification.querySelector('.notification-icon').className.includes(type);
                notification.style.display = notificationType ? '' : 'none';
            }
        });
    },
    
    exportData: function(format) {
        let data, filename, mimeType;
        
        switch (format) {
            case 'csv':
                data = this.generateCSV();
                filename = 'dashboard-data.csv';
                mimeType = 'text/csv';
                break;
                
            case 'excel':
                data = this.generateExcel();
                filename = 'dashboard-data.xlsx';
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
                
            case 'pdf':
                this.generatePDF();
                return;
                
            default:
                showToast('صيغة التصدير غير مدعومة', 'error');
                return;
        }
        
        // تنزيل الملف
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast(`تم تصدير البيانات بصيغة ${format.toUpperCase()}`, 'success');
    },
    
    generateCSV: function() {
        // توليد بيانات CSV مبسطة
        const headers = ['المهمة', 'الأولوية', 'تاريخ الاستحقاق', 'الحالة'];
        const rows = this.pendingTasks.map(task => [
            task.title,
            this.getPriorityText(task.priority),
            task.dueDate,
            this.getStatusText(task.status)
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    },
    
    generateExcel: function() {
        // في التطبيق الحقيقي، يتم استخدام مكتبة مثل SheetJS
        return this.generateCSV(); // مبسط
    },
    
    generatePDF: function() {
        // في التطبيق الحقيقي، يتم استخدام مكتبة مثل jsPDF
        showToast('جاري إنشاء ملف PDF...', 'info');
        setTimeout(() => {
            showToast('تم إنشاء ملف PDF', 'success');
        }, 2000);
    },
    
    updateDashboardStats: function() {
        // تحديث الإحصائيات
        const stats = this.calculateStats();
        
        // تحديث عناصر الإحصائيات
        for (const [key, value] of Object.entries(stats)) {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                element.textContent = value;
            }
        }
        
        // تحديث الرسوم البيانية
        this.updateCharts(stats);
    },
    
    calculateStats: function() {
        return {
            totalRequests: 45,
            pendingRequests: 12,
            approvedRequests: 28,
            rejectedRequests: 5,
            avgProcessingTime: '1.5 يوم',
            completionRate: '85%',
            monthlyGrowth: '+12%'
        };
    },
    
    updateCharts: function(stats) {
        // تحديث الرسوم البيانية
        const charts = document.querySelectorAll('.chart-container');
        
        charts.forEach(chart => {
            const ctx = chart.querySelector('canvas');
            if (ctx) {
                this.renderChart(ctx, stats);
            }
        });
    },
    
    renderChart: function(canvas, stats) {
        // محاكاة عرض الرسم البياني
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // هنا يمكن إضافة كود Chart.js الحقيقي
        console.log('تحديث الرسم البياني مع البيانات:', stats);
    },
    
    startAutoRefresh: function() {
        // التحديث التلقائي كل 5 دقائق
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.refreshDashboard();
            }
        }, 5 * 60 * 1000);
    },
    
    // إدارة الطلبات
    loadRequests: function(filter = 'all') {
        // تحميل الطلبات حسب التصفية
        const requests = JSON.parse(localStorage.getItem('shipRequests')) || [];
        
        switch (filter) {
            case 'pending':
                return requests.filter(r => r.status === 'pending');
            case 'approved':
                return requests.filter(r => r.status === 'approved');
            case 'rejected':
                return requests.filter(r => r.status === 'rejected');
            default:
                return requests;
        }
    },
    
    updateRequestStatus: function(requestId, status, notes = '') {
        const requests = JSON.parse(localStorage.getItem('shipRequests')) || [];
        const requestIndex = requests.findIndex(r => r.id === requestId);
        
        if (requestIndex !== -1) {
            requests[requestIndex].status = status;
            requests[requestIndex].updatedAt = new Date().toISOString();
            requests[requestIndex].updatedBy = this.currentUser.name;
            
            if (notes) {
                requests[requestIndex].notes = notes;
            }
            
            localStorage.setItem('shipRequests', JSON.stringify(requests));
            
            // إضافة إشعار
            this.addNotification({
                title: 'تحديث حالة الطلب',
                message: `تم تحديث حالة الطلب #${requestId} إلى "${status}"`,
                type: 'info'
            });
            
            showToast('تم تحديث حالة الطلب', 'success');
            return true;
        }
        
        return false;
    },
    
    addNotification: function(notification) {
        const newNotification = {
            id: Date.now(),
            read: false,
            time: 'الآن',
            ...notification
        };
        
        this.notifications.unshift(newNotification);
        this.saveNotifications();
        this.updateNotificationBadge();
        this.renderNotifications();
    },
    
    // البحث المتقدم
    advancedSearch: function(criteria) {
        const requests = this.loadRequests();
        
        return requests.filter(request => {
            let matches = true;
            
            if (criteria.searchTerm) {
                const searchFields = [
                    request.id,
                    request.shipName,
                    request.ownerName,
                    request.imoNumber
                ].join(' ').toLowerCase();
                
                matches = matches && searchFields.includes(criteria.searchTerm.toLowerCase());
            }
            
            if (criteria.status && criteria.status !== 'all') {
                matches = matches && request.status === criteria.status;
            }
            
            if (criteria.dateFrom) {
                matches = matches && new Date(request.submissionDate) >= new Date(criteria.dateFrom);
            }
            
            if (criteria.dateTo) {
                matches = matches && new Date(request.submissionDate) <= new Date(criteria.dateTo);
            }
            
            if (criteria.shipType && criteria.shipType !== 'all') {
                matches = matches && request.shipType === criteria.shipType;
            }
            
            return matches;
        });
    },
    
    // توليد تقرير
    generateReport: function(reportType, period) {
        showToast(`جاري إنشاء تقرير ${reportType}...`, 'info');
        
        // محاكاة إنشاء التقرير
        setTimeout(() => {
            const reportData = this.getReportData(reportType, period);
            this.showReportModal(reportData);
        }, 1500);
    },
    
    getReportData: function(reportType, period) {
        // بيانات تقرير مبسطة
        return {
            title: `تقرير ${reportType} - ${period}`,
            generatedAt: new Date().toLocaleString('ar-YE'),
            data: {
                إجمالي_الطلبات: 45,
                مقبولة: 28,
                مرفوضة: 5,
                قيد_المراجعة: 12,
                متوسط_وقت_المعالجة: '1.5 يوم',
                معدل_الإنجاز: '85%'
            },
            summary: 'أداء جيد مع تحسن في وقت المعالجة'
        };
    },
    
    showReportModal: function(reportData) {
        const modal = document.createElement('div');
        modal.className = 'modal report-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${reportData.title}</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="report-info">
                        <p><strong>تاريخ الإنشاء:</strong> ${reportData.generatedAt}</p>
                    </div>
                    <div class="report-data">
                        ${Object.entries(reportData.data).map(([key, value]) => `
                            <div class="report-item">
                                <span class="report-label">${key}:</span>
                                <span class="report-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="report-summary">
                        <h4>ملخص التقرير:</h4>
                        <p>${reportData.summary}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-print" onclick="printDocument('report-content')">
                        <i class="fas fa-print"></i> طباعة
                    </button>
                    <button class="btn-download" onclick="DashboardManager.downloadReport('${reportData.title}')">
                        <i class="fas fa-download"></i> تنزيل
                    </button>
                    <button class="btn-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        إغلاق
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    downloadReport: function(reportTitle) {
        showToast('جاري تنزيل التقرير...', 'info');
        setTimeout(() => {
            showToast('تم تنزيل التقرير', 'success');
        }, 1000);
    }
};

// تهيئة لوحة التحكم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.dashboard-container')) {
        DashboardManager.init();
    }
});
// وظائف لوحات التحكم مع Firebase

// دالة تحميل الطلبات للوحة المسؤول
async function loadAdminApplications() {
    try {
      const applicationsRef = db.collection('shipApplications');
      const snapshot = await applicationsRef
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      
      const applications = [];
      snapshot.forEach(doc => {
        applications.push({ id: doc.id, ...doc.data() });
      });
      
      updateApplicationsTable(applications);
      updateStats(applications);
    } catch (error) {
      console.error('خطأ في تحميل الطلبات:', error);
    }
  }
  
  // دالة تحديث حالة الطلب
  async function updateApplicationStatus(applicationId, newStatus, notes = '') {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      await db.collection('shipApplications').doc(applicationId).update({
        status: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid,
        notes: notes,
        history: firebase.firestore.FieldValue.arrayUnion({
          status: newStatus,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: user.name || user.email,
          notes: notes
        })
      });
      
      // إرسال إشعار للمستخدم
      await sendNotification(applicationId, newStatus);
      
      return { success: true };
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
      throw error;
    }
  }
  
  // دالة تحميل موظفي الفرع
  async function loadBranchEmployees(branchId) {
    try {
      const usersRef = db.collection('users');
      let query = usersRef.where('role', '==', 'employee');
      
      if (branchId && branchId !== 'all') {
        query = query.where('branch', '==', branchId);
      }
      
      const snapshot = await query.get();
      const employees = [];
      
      snapshot.forEach(doc => {
        employees.push({ id: doc.id, ...doc.data() });
      });
      
      renderEmployeesTable(employees);
    } catch (error) {
      console.error('خطأ في تحميل الموظفين:', error);
    }
  }
  
  // دالة إنشاء تقرير
  async function generateReport(reportType, filters) {
    try {
      let query = db.collection('shipApplications');
      
      // تطبيق الفلاتر
      if (filters.startDate && filters.endDate) {
        query = query.where('createdAt', '>=', new Date(filters.startDate))
                    .where('createdAt', '<=', new Date(filters.endDate));
      }
      
      if (filters.status && filters.status !== 'all') {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters.branch && filters.branch !== 'all') {
        query = query.where('branch', '==', filters.branch);
      }
      
      const snapshot = await query.get();
      const data = [];
      
      snapshot.forEach(doc => {
        data.push(doc.data());
      });
      
      // تحليل البيانات حسب نوع التقرير
      const reportData = analyzeData(data, reportType);
      
      // حفظ التقرير في قاعدة البيانات
      const reportRef = await db.collection('reports').add({
        type: reportType,
        filters: filters,
        data: reportData,
        generatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        generatedBy: JSON.parse(localStorage.getItem('user')).uid,
        period: {
          start: filters.startDate,
          end: filters.endDate
        }
      });
      
      return { 
        success: true, 
        reportId: reportRef.id,
        data: reportData
      };
    } catch (error) {
      console.error('خطأ في إنشاء التقرير:', error);
      throw error;
    }
  }

// تصدير المدير للاستخدام العام
window.DashboardManager = DashboardManager;