// employee-functions.js

// ======================
// الدوال الأساسية
// ======================

/**
 * تهيئة لوحة تحكم الموظف
 */
function initializeEmployeeDashboard() {
    console.log('تهيئة لوحة تحكم الموظف...');
    
    // تحميل بيانات الموظف من localStorage أو API
    loadEmployeeData();
    
    // تحميل الطلبات والمهام
    loadEmployeeTasks();
    
    // تحديث الإحصائيات
    updateEmployeeStats();
    
    // إعداد المستمعين للأحداث
    setupEmployeeEventListeners();
    
    // بدء التحديثات التلقائية
    startAutoRefresh();
    
    // تسجيل وقت الدخول
    logLoginTime();
}

/**
 * تحميل بيانات الموظف
 */
function loadEmployeeData() {
    try {
        // محاولة الحصول على بيانات الموظف من localStorage
        const savedData = localStorage.getItem('employeeData');
        let employeeData;
        
        if (savedData) {
            employeeData = JSON.parse(savedData);
        } else {
            // بيانات افتراضية للموظف
            employeeData = {
                id: 1,
                name: "أحمد محمد أحمد",
                role: "موظف فرع",
                branch: "عدن",
                department: "تسجيل السفن",
                email: "ahmed.mohamed@maritime.gov.ye",
                phone: "+967712345678",
                hire_date: "2023-01-15",
                avatar: "AM",
                permissions: [
                    "view_requests",
                    "create_requests",
                    "edit_requests",
                    "view_reports"
                ],
                settings: {
                    theme: "light",
                    notifications: true,
                    auto_refresh: true,
                    language: "ar"
                }
            };
            
            // حفظ البيانات في localStorage
            localStorage.setItem('employeeData', JSON.stringify(employeeData));
        }
        
        // تحديث واجهة المستخدم
        updateEmployeeUI(employeeData);
        
        return employeeData;
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات الموظف:', error);
        showError('تعذر تحميل بيانات الموظف');
        return null;
    }
}

/**
 * تحديث واجهة المستخدم ببيانات الموظف
 */
function updateEmployeeUI(employeeData) {
    try {
        // تحديث معلومات الموظف في الشريط العلوي
        const elements = {
            'employeeName': employeeData.name,
            'employeeRole': employeeData.role,
            'currentBranch': `فرع ${employeeData.branch}`,
            'greetingName': employeeData.name.split(' ')[0],
            'footerEmployeeName': employeeData.name
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // تحديث صورة/رمز الملف الشخصي
        updateEmployeeAvatar(employeeData);
        
        // تحديث الإعدادات
        applyEmployeeSettings(employeeData.settings);
        
    } catch (error) {
        console.error('خطأ في تحديث واجهة المستخدم:', error);
    }
}

/**
 * تحديث رمز/صورة الموظف
 */
function updateEmployeeAvatar(employeeData) {
    const avatarElements = document.querySelectorAll('.user-avatar, .employee-avatar, .employee-avatar-large');
    
    avatarElements.forEach(element => {
        // إذا كان هناك صورة، استخدمها
        if (employeeData.photo_url) {
            element.innerHTML = `<img src="${employeeData.photo_url}" alt="${employeeData.name}">`;
        } else {
            // استخدام الأحرف الأولى من الاسم
            const initials = getInitials(employeeData.name);
            element.innerHTML = initials;
        }
    });
}

/**
 * الحصول على الأحرف الأولى من الاسم
 */
function getInitials(name) {
    const names = name.split(' ');
    if (names.length >= 2) {
        return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
}

/**
 * تطبيق إعدادات الموظف
 */
function applyEmployeeSettings(settings) {
    try {
        // تطبيق الثيم
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // تطبيق اللغة
        document.documentElement.lang = settings.language;
        document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
        
        // إعدادات الإشعارات
        if (!settings.notifications) {
            const notificationElements = document.querySelectorAll('.notification-count, .badge');
            notificationElements.forEach(el => el.style.display = 'none');
        }
        
        // حفظ الإعدادات المطبقة
        localStorage.setItem('employeeSettings', JSON.stringify(settings));
        
    } catch (error) {
        console.error('خطأ في تطبيق الإعدادات:', error);
    }
}

/**
 * تسجيل وقت الدخول
 */
function logLoginTime() {
    const loginTime = new Date().toISOString();
    localStorage.setItem('lastLoginTime', loginTime);
    
    // تحديث وقت الدخول الأخير في الشاشة
    const lastLoginElement = document.getElementById('lastLoginTime');
    if (lastLoginElement) {
        lastLoginElement.textContent = formatTime(loginTime);
    }
}

// ======================
// إدارة الطلبات
// ======================

/**
 * تحميل طلبات الموظف
 */
async function loadEmployeeRequests() {
    try {
        showLoading('جاري تحميل الطلبات...');
        
        // في التطبيق الحقيقي: استدعاء API
        // const response = await fetch('/api/employee/requests');
        // const requests = await response.json();
        
        // بيانات تجريبية
        const requests = [
            {
                id: 1,
                request_number: "REQ-2024-00123",
                ship_name: "البحر الأحمر",
                ship_type: "ناقلة بضائع",
                status: "قيد المراجعة",
                date: "2024-03-14",
                priority: "medium",
                assigned_to: "أحمد محمد",
                progress: 60
            },
            {
                id: 2,
                request_number: "REQ-2024-00124",
                ship_name: "اليمن السعيد",
                ship_type: "سفينة صيد",
                status: "مكتمل",
                date: "2024-03-13",
                priority: "low",
                assigned_to: "أحمد محمد",
                progress: 100
            },
            {
                id: 3,
                request_number: "REQ-2024-00125",
                ship_name: "عدن",
                ship_type: "سفينة ركاب",
                status: "قيد المعالجة",
                date: "2024-03-14",
                priority: "high",
                assigned_to: "أحمد محمد",
                progress: 30
            }
        ];
        
        renderRequestsTable(requests);
        updateRequestStats(requests);
        
        hideLoading();
        return requests;
        
    } catch (error) {
        console.error('خطأ في تحميل الطلبات:', error);
        showError('تعذر تحميل الطلبات');
        hideLoading();
        return [];
    }
}

/**
 * عرض جدول الطلبات
 */
function renderRequestsTable(requests) {
    const tbody = document.getElementById('requestsTableBody') || 
                  document.getElementById('recentRequestsBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    requests.forEach(request => {
        const row = createRequestRow(request);
        tbody.appendChild(row);
    });
    
    // تهيئة DataTable إذا كانت موجودة
    if (typeof $.fn.DataTable !== 'undefined' && $('#requestsTable').length) {
        $('#requestsTable').DataTable({
            responsive: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/ar.json'
            },
            pageLength: 10,
            order: [[4, 'desc']]
        });
    }
}

/**
 * إنشاء صف طلب
 */
function createRequestRow(request) {
    const row = document.createElement('tr');
    row.dataset.id = request.id;
    
    const statusClass = getRequestStatusClass(request.status);
    const priorityClass = getPriorityClass(request.priority);
    const priorityText = getPriorityText(request.priority);
    
    row.innerHTML = `
        <td>
            <div class="request-checkbox">
                <input type="checkbox" class="request-select" onchange="toggleRequestSelection(${request.id})">
            </div>
        </td>
        <td>
            <a href="request-details.html?id=${request.id}" class="request-link">
                ${request.request_number}
            </a>
        </td>
        <td>
            <div class="ship-info">
                <div class="ship-icon">
                    <i class="fas fa-ship"></i>
                </div>
                <div class="ship-details">
                    <strong>${request.ship_name}</strong>
                    <small>${request.ship_type}</small>
                </div>
            </div>
        </td>
        <td>
            <span class="priority-badge ${priorityClass}">${priorityText}</span>
        </td>
        <td>
            <span class="status-badge ${statusClass}">${request.status}</span>
        </td>
        <td>${formatDate(request.date)}</td>
        <td>
            <div class="request-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${request.progress}%"></div>
                </div>
                <span>${request.progress}%</span>
            </div>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn-action view" onclick="viewRequest(${request.id})" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action edit" onclick="editRequest(${request.id})" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action process" onclick="processRequest(${request.id})" title="معالجة">
                    <i class="fas fa-cog"></i>
                </button>
                <button class="btn-action print" onclick="printRequest(${request.id})" title="طباعة">
                    <i class="fas fa-print"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

/**
 * تحديث إحصائيات الطلبات
 */
function updateRequestStats(requests) {
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'مكتمل').length;
    const pendingRequests = requests.filter(r => r.status === 'قيد المعالجة' || r.status === 'قيد المراجعة').length;
    const urgentRequests = requests.filter(r => r.priority === 'high' || r.priority === 'urgent').length;
    
    // تحديث العناصر في الواجهة
    const stats = {
        'totalRequests': totalRequests,
        'completedRequests': completedRequests,
        'pendingRequests': pendingRequests,
        'urgentRequests': urgentRequests
    };
    
    Object.entries(stats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // تحديث النسب المئوية
    const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;
    const completionElement = document.getElementById('completionRate');
    if (completionElement) {
        completionElement.textContent = `${completionRate}%`;
        completionElement.style.width = `${completionRate}%`;
    }
}

// ======================
// إدارة المهام
// ======================

/**
 * تحميل مهام الموظف
 */
async function loadEmployeeTasks() {
    try {
        showLoading('جاري تحميل المهام...');
        
        // في التطبيق الحقيقي: استدعاء API
        // const response = await fetch('/api/employee/tasks');
        // const tasks = await response.json();
        
        // بيانات تجريبية
        const tasks = [
            {
                id: 1,
                title: "مراجعة وثائق سفينة 'البحر الأحمر'",
                description: "مراجعة كافة المستندات المقدمة للتسجيل",
                priority: "urgent",
                due_date: "2024-03-15",
                status: "in_progress",
                progress: 60,
                created_by: "مدير الفرع",
                created_at: "2024-03-10",
                request_id: 1
            },
            {
                id: 2,
                title: "تحديث بيانات 5 سفن قديمة",
                description: "تحديث المعلومات في قاعدة البيانات",
                priority: "high",
                due_date: "2024-03-16",
                status: "pending",
                progress: 30,
                created_by: "مدير النظام",
                created_at: "2024-03-08",
                request_id: null
            },
            {
                id: 3,
                title: "إعداد تقرير شهري عن التسجيلات",
                description: "إعداد تقرير شامل عن عمليات التسجيل الشهرية",
                priority: "medium",
                due_date: "2024-03-20",
                status: "not_started",
                progress: 0,
                created_by: "الإدارة",
                created_at: "2024-03-01",
                request_id: null
            }
        ];
        
        renderTasksList(tasks);
        updateTaskStats(tasks);
        
        hideLoading();
        return tasks;
        
    } catch (error) {
        console.error('خطأ في تحميل المهام:', error);
        showError('تعذر تحميل المهام');
        hideLoading();
        return [];
    }
}

/**
 * عرض قائمة المهام
 */
function renderTasksList(tasks) {
    const tasksList = document.getElementById('tasksList') || 
                      document.getElementById('urgentTasksList');
    
    if (!tasksList) return;
    
    tasksList.innerHTML = '';
    
    // ترتيب المهام حسب الأولوية وتاريخ الاستحقاق
    const sortedTasks = sortTasksByPriorityAndDueDate(tasks);
    
    sortedTasks.forEach(task => {
        const taskItem = createTaskItem(task);
        tasksList.appendChild(taskItem);
    });
}

/**
 * إنشاء عنصر مهمة
 */
function createTaskItem(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item ${task.status} priority-${task.priority}`;
    taskElement.dataset.id = task.id;
    
    const priorityText = getPriorityText(task.priority);
    const statusText = getTaskStatusText(task.status);
    const dueDate = formatDate(task.due_date);
    const progressWidth = task.progress + '%';
    
    taskElement.innerHTML = `
        <div class="task-checkbox">
            <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} 
                   onchange="updateTaskStatus(${task.id}, this.checked ? 'completed' : 'in_progress')">
        </div>
        <div class="task-content">
            <div class="task-header">
                <h5 class="task-title">${task.title}</h5>
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">${priorityText}</span>
                    <span class="task-status ${task.status}">${statusText}</span>
                </div>
            </div>
            <p class="task-description">${task.description || 'لا يوجد وصف'}</p>
            <div class="task-details">
                <span class="task-due">
                    <i class="fas fa-calendar"></i>
                    ${dueDate}
                </span>
                <span class="task-assigned">
                    <i class="fas fa-user"></i>
                    ${task.created_by}
                </span>
                ${task.request_id ? `
                <span class="task-request">
                    <i class="fas fa-link"></i>
                    طلب ${task.request_id}
                </span>
                ` : ''}
            </div>
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressWidth}"></div>
                </div>
                <span class="progress-text">${task.progress}% مكتمل</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="btn-task-action" onclick="viewTaskDetails(${task.id})" title="تفاصيل">
                <i class="fas fa-info-circle"></i>
            </button>
            <button class="btn-task-action" onclick="editTask(${task.id})" title="تعديل">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-task-action" onclick="updateTaskProgress(${task.id})" title="تحديث التقدم">
                <i class="fas fa-chart-line"></i>
            </button>
            ${task.status !== 'completed' ? `
            <button class="btn-task-action complete" onclick="completeTask(${task.id})" title="إكمال">
                <i class="fas fa-check"></i>
            </button>
            ` : ''}
        </div>
    `;
    
    return taskElement;
}

/**
 * تحديث إحصائيات المهام
 */
function updateTaskStats(tasks) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const overdueTasks = tasks.filter(t => isTaskOverdue(t)).length;
    
    // تحديث العناصر في الواجهة
    const stats = {
        'totalTasks': totalTasks,
        'completedTasks': completedTasks,
        'pendingTasks': pendingTasks,
        'overdueTasks': overdueTasks
    };
    
    Object.entries(stats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

/**
 * التحقق من تجاوز موعد المهمة
 */
function isTaskOverdue(task) {
    if (task.status === 'completed') return false;
    
    const today = new Date();
    const dueDate = new Date(task.due_date);
    
    return dueDate < today;
}

/**
 * ترتيب المهام حسب الأولوية وتاريخ الاستحقاق
 */
function sortTasksByPriorityAndDueDate(tasks) {
    const priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
    
    return tasks.sort((a, b) => {
        // أولاً: حسب الأولوية
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // ثانياً: حسب تاريخ الاستحقاق
        const dueDateA = new Date(a.due_date);
        const dueDateB = new Date(b.due_date);
        return dueDateA - dueDateB;
    });
}

// ======================
// دوال الإجراءات
// ======================

/**
 * عرض تفاصيل الطلب
 */
function viewRequest(requestId) {
    try {
        // حفظ معرف الطلب المحدد
        sessionStorage.setItem('selectedRequestId', requestId);
        
        // توجيه إلى صفحة تفاصيل الطلب
        window.location.href = `request-details.html?id=${requestId}`;
        
    } catch (error) {
        console.error('خطأ في عرض الطلب:', error);
        showError('تعذر عرض تفاصيل الطلب');
    }
}

/**
 * تعديل الطلب
 */
function editRequest(requestId) {
    try {
        // التحقق من صلاحية التعديل
        const employeeData = loadEmployeeData();
        if (!employeeData.permissions.includes('edit_requests')) {
            showError('ليس لديك صلاحية لتعديل الطلبات');
            return;
        }
        
        // توجيه إلى صفحة تعديل الطلب
        window.location.href = `edit-request.html?id=${requestId}`;
        
    } catch (error) {
        console.error('خطأ في تعديل الطلب:', error);
        showError('تعذر فتح صفحة التعديل');
    }
}

/**
 * معالجة الطلب
 */
async function processRequest(requestId) {
    try {
        if (!confirm('هل تريد معالجة هذا الطلب؟')) return;
        
        showLoading('جاري معالجة الطلب...');
        
        // في التطبيق الحقيقي: استدعاء API
        // const response = await fetch(`/api/requests/${requestId}/process`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' }
        // });
        
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showSuccess('تمت معالجة الطلب بنجاح');
        
        // إعادة تحميل البيانات
        loadEmployeeRequests();
        
    } catch (error) {
        console.error('خطأ في معالجة الطلب:', error);
        showError('تعذر معالجة الطلب');
    } finally {
        hideLoading();
    }
}

/**
 * طباعة الطلب
 */
function printRequest(requestId) {
    try {
        // إنشاء نافذة طباعة
        const printWindow = window.open('', '_blank');
        
        // محتوى الطباعة
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <title>طباعة الطلب ${requestId}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #2c3e50; }
                    .request-info { margin-bottom: 20px; }
                    .section { margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
                    .section h3 { color: #3498db; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
                    .info-row { display: flex; margin-bottom: 10px; }
                    .info-label { font-weight: bold; width: 150px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #7f8c8d; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>طلب تسجيل سفينة</h1>
                    <p>نظام تسجيل السفن - الهيئة العامة للشئون البحرية</p>
                    <p>رقم الطلب: ${requestId}</p>
                    <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-YE')}</p>
                </div>
                <div class="request-info">
                    <p>هذا مستند الطلب رقم ${requestId}</p>
                    <p>الرجاء الرجوع إلى النظام للحصول على التفاصيل الكاملة</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} نظام تسجيل السفن. جميع الحقوق محفوظة.</p>
                    <p>هذا المستند تم إنشاؤه آلياً من النظام</p>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
    } catch (error) {
        console.error('خطأ في طباعة الطلب:', error);
        showError('تعذر طباعة الطلب');
    }
}

/**
 * تحديث حالة المهمة
 */
async function updateTaskStatus(taskId, status) {
    try {
        showLoading('جاري تحديث حالة المهمة...');
        
        // في التطبيق الحقيقي: استدعاء API
        // const response = await fetch(`/api/tasks/${taskId}/status`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ status })
        // });
        
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showSuccess('تم تحديث حالة المهمة بنجاح');
        
        // إعادة تحميل المهام
        loadEmployeeTasks();
        
    } catch (error) {
        console.error('خطأ في تحديث حالة المهمة:', error);
        showError('تعذر تحديث حالة المهمة');
    } finally {
        hideLoading();
    }
}

/**
 * تحديث تقدم المهمة
 */
function updateTaskProgress(taskId) {
    const newProgress = prompt('أدخل نسبة التقدم الجديدة (0-100):');
    
    if (newProgress === null) return;
    
    const progress = parseInt(newProgress);
    
    if (isNaN(progress) || progress < 0 || progress > 100) {
        showError('يرجى إدخال رقم بين 0 و 100');
        return;
    }
    
    try {
        // تحديث المهمة محلياً (في التطبيق الحقيقي: استدعاء API)
        const tasks = JSON.parse(localStorage.getItem('employeeTasks') || '[]');
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].progress = progress;
            if (progress === 100) {
                tasks[taskIndex].status = 'completed';
            }
            
            localStorage.setItem('employeeTasks', JSON.stringify(tasks));
            loadEmployeeTasks();
            
            showSuccess(`تم تحديث تقدم المهمة إلى ${progress}%`);
        }
        
    } catch (error) {
        console.error('خطأ في تحديث تقدم المهمة:', error);
        showError('تعذر تحديث تقدم المهمة');
    }
}

/**
 * إكمال المهمة
 */
async function completeTask(taskId) {
    try {
        if (!confirm('هل تريد إكمال هذه المهمة؟')) return;
        
        showLoading('جاري إكمال المهمة...');
        
        // تحديث حالة المهمة
        await updateTaskStatus(taskId, 'completed');
        
        showSuccess('تم إكمال المهمة بنجاح');
        
    } catch (error) {
        console.error('خطأ في إكمال المهمة:', error);
        showError('تعذر إكمال المهمة');
    }
}

/**
 * إنشاء طلب جديد
 */
function createNewRequest() {
    try {
        // التحقق من الصلاحيات
        const employeeData = loadEmployeeData();
        if (!employeeData.permissions.includes('create_requests')) {
            showError('ليس لديك صلاحية لإنشاء طلبات جديدة');
            return;
        }
        
        // توجيه إلى صفحة إنشاء طلب جديد
        window.location.href = 'new-request.html';
        
    } catch (error) {
        console.error('خطأ في إنشاء طلب جديد:', error);
        showError('تعذر فتح صفحة إنشاء الطلب');
    }
}

// ======================
// التقارير والإحصائيات
// ======================

/**
 * تحميل تقارير الموظف
 */
async function loadEmployeeReports() {
    try {
        showLoading('جاري تحميل التقارير...');
        
        // في التطبيق الحقيقي: استدعاء API
        // const response = await fetch('/api/employee/reports');
        // const reports = await response.json();
        
        // بيانات تجريبية
        const reports = {
            daily: {
                date: new Date().toISOString().split('T')[0],
                requests_received: 7,
                requests_completed: 5,
                avg_processing_time: 2.3,
                completion_rate: 71,
                tasks_completed: 3,
                total_tasks: 5
            },
            weekly: {
                week_start: '2024-03-10',
                week_end: '2024-03-16',
                total_requests: 42,
                completed_requests: 32,
                avg_processing_time: 1.8,
                completion_rate: 76,
                productivity_score: 4.2
            },
            monthly: {
                month: 'مارس 2024',
                total_requests: 147,
                completed_requests: 128,
                avg_processing_time: 1.5,
                completion_rate: 87,
                rating: 4.8
            }
        };
        
        renderReports(reports);
        updateCharts(reports);
        
        hideLoading();
        return reports;
        
    } catch (error) {
        console.error('خطأ في تحميل التقارير:', error);
        showError('تعذر تحميل التقارير');
        hideLoading();
        return null;
    }
}

/**
 * عرض التقارير
 */
function renderReports(reports) {
    // تحديث تقرير اليوم
    const dailyReportElement = document.getElementById('dailyReportContent');
    if (dailyReportElement && reports.daily) {
        dailyReportElement.innerHTML = generateDailyReportHTML(reports.daily);
    }
    
    // تحديث الإحصائيات السريعة
    updateQuickStats(reports);
}

/**
 * إنشاء HTML لتقرير اليوم
 */
function generateDailyReportHTML(dailyReport) {
    return `
        <div class="report-summary">
            <h4>تقرير الأداء اليومي</h4>
            <p class="report-date">${formatDate(dailyReport.date)}</p>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">الطلبات المستلمة:</span>
                    <span class="stat-value">${dailyReport.requests_received}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">الطلبات المكتملة:</span>
                    <span class="stat-value">${dailyReport.requests_completed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">متوسط وقت المعالجة:</span>
                    <span class="stat-value">${dailyReport.avg_processing_time} ساعة</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">معدل الإنجاز:</span>
                    <span class="stat-value ${dailyReport.completion_rate >= 70 ? 'success' : 'warning'}">
                        ${dailyReport.completion_rate}%
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">المهام المكتملة:</span>
                    <span class="stat-value">${dailyReport.tasks_completed}/${dailyReport.total_tasks}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * تحديث الإحصائيات السريعة
 */
function updateQuickStats(reports) {
    const stats = {
        'dailyRequests': reports.daily?.requests_received || 0,
        'dailyCompletionRate': reports.daily?.completion_rate || 0,
        'weeklyProductivity': reports.weekly?.productivity_score || 0,
        'monthlyRating': reports.monthly?.rating || 0
    };
    
    Object.entries(stats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = id.includes('Rate') || id.includes('Rating') ? 
                `${value}%` : value;
        }
    });
}

/**
 * تحديث الرسوم البيانية
 */
function updateCharts(reports) {
    // الرسم البياني اليومي
    updateDailyChart(reports.daily);
    
    // الرسم البياني الأسبوعي
    updateWeeklyChart(reports.weekly);
    
    // الرسم البياني الشهري
    updateMonthlyChart(reports.monthly);
}

/**
 * تحديث الرسم البياني اليومي
 */
function updateDailyChart(dailyData) {
    const ctx = document.getElementById('dailyChart');
    if (!ctx) return;
    
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['طلبات مستلمة', 'طلبات مكتملة', 'مهام مكتملة'],
            datasets: [{
                label: 'أداء اليوم',
                data: [
                    dailyData.requests_received,
                    dailyData.requests_completed,
                    dailyData.tasks_completed
                ],
                backgroundColor: ['#4CAF50', '#2196F3', '#FF9800'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * تحديث الرسم البياني الأسبوعي
 */
function updateWeeklyChart(weeklyData) {
    // تنفيذ مشابه لـ updateDailyChart
}

/**
 * تحديث الرسم البياني الشهري
 */
function updateMonthlyChart(monthlyData) {
    // تنفيذ مشابه لـ updateDailyChart
}

// ======================
// الإشعارات والتنبيهات
// ======================

/**
 * تحميل إشعارات الموظف
 */
async function loadEmployeeNotifications() {
    try {
        // في التطبيق الحقيقي: استدعاء API
        // const response = await fetch('/api/employee/notifications');
        // const notifications = await response.json();
        
        // بيانات تجريبية
        const notifications = [
            {
                id: 1,
                title: "طلب جديد",
                message: "تم استلام طلب تسجيل سفينة جديدة 'البحر الأحمر'",
                type: "info",
                time: "منذ 10 دقائق",
                read: false,
                action_url: "request-details.html?id=1"
            },
            {
                id: 2,
                title: "مهمة عاجلة",
                message: "لديك مهمة عاجلة يجب إكمالها اليوم",
                type: "warning",
                time: "منذ ساعة",
                read: false,
                action_url: "my-tasks.html"
            },
            {
                id: 3,
                title: "تحديث النظام",
                message: "تم تحديث النظام إلى الإصدار 2.1.0",
                type: "success",
                time: "منذ 3 ساعات",
                read: true,
                action_url: "#"
            }
        ];
        
        renderNotifications(notifications);
        updateNotificationBadge(notifications);
        
        return notifications;
        
    } catch (error) {
        console.error('خطأ في تحميل الإشعارات:', error);
        return [];
    }
}

/**
 * عرض الإشعارات
 */
function renderNotifications(notifications) {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    notificationsList.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationItem = createNotificationItem(notification);
        notificationsList.appendChild(notificationItem);
    });
}

/**
 * إنشاء عنصر إشعار
 */
function createNotificationItem(notification) {
    const item = document.createElement('div');
    item.className = `notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`;
    
    const icon = getNotificationIcon(notification.type);
    const timeAgo = notification.time || getTimeAgo(notification.timestamp);
    
    item.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            <h5>${notification.title}</h5>
            <p>${notification.message}</p>
            <span class="notification-time">${timeAgo}</span>
        </div>
        <div class="notification-actions">
            <button class="btn-notification-action" onclick="markNotificationAsRead(${notification.id})" 
                    title="تعليم كمقروء">
                <i class="fas fa-check"></i>
            </button>
            ${notification.action_url ? `
            <button class="btn-notification-action" onclick="openNotificationLink('${notification.action_url}')" 
                    title="فتح">
                <i class="fas fa-external-link-alt"></i>
            </button>
            ` : ''}
        </div>
    `;
    
    return item;
}

/**
 * تحديث شارة الإشعارات
 */
function updateNotificationBadge(notifications) {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-count');
    
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

/**
 * تعليم إشعار كمقروء
 */
async function markNotificationAsRead(notificationId) {
    try {
        // في التطبيق الحقيقي: استدعاء API
        // await fetch(`/api/notifications/${notificationId}/read`, {
        //     method: 'PUT'
        // });
        
        // تحديث محلي
        const notifications = JSON.parse(localStorage.getItem('employeeNotifications') || '[]');
        const notificationIndex = notifications.findIndex(n => n.id === notificationId);
        
        if (notificationIndex !== -1) {
            notifications[notificationIndex].read = true;
            localStorage.setItem('employeeNotifications', JSON.stringify(notifications));
            loadEmployeeNotifications();
        }
        
        showToast('تم تعليم الإشعار كمقروء', 'success');
        
    } catch (error) {
        console.error('خطأ في تعليم الإشعار كمقروء:', error);
        showError('تعذر تحديث حالة الإشعار');
    }
}

/**
 * فتح رابط الإشعار
 */
function openNotificationLink(url) {
    if (url && url !== '#') {
        window.location.href = url;
    }
}

// ======================
// الأدوات المساعدة
// ======================

/**
 * بدء التحديث التلقائي
 */
function startAutoRefresh() {
    // التحقق من إعدادات المستخدم
    const employeeData = loadEmployeeData();
    if (!employeeData.settings.auto_refresh) return;
    
    // تحديث كل 5 دقائق
    setInterval(() => {
        refreshDashboard();
    }, 5 * 60 * 1000);
}

/**
 * تحديث لوحة التحكم
 */
async function refreshDashboard() {
    try {
        showToast('جاري تحديث البيانات...', 'info');
        
        // تحديث كافة البيانات
        await Promise.all([
            loadEmployeeRequests(),
            loadEmployeeTasks(),
            loadEmployeeReports(),
            loadEmployeeNotifications()
        ]);
        
        showToast('تم تحديث البيانات بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في تحديث لوحة التحكم:', error);
        showError('تعذر تحديث البيانات');
    }
}

/**
 * إعداد مستمعي الأحداث
 */
function setupEmployeeEventListeners() {
    // مستمعات لوحة المفاتيح
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // مستمعات النوافذ المنبثقة
    setupModalListeners();
    
    // مستمعات الأزرار الديناميكية
    setupDynamicButtonListeners();
    
    // مستمعات تحديث البيانات
    setupRefreshListeners();
}

/**
 * معالجة اختصارات لوحة المفاتيح
 */
function handleKeyboardShortcuts(e) {
    // Ctrl + N: طلب جديد
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        createNewRequest();
    }
    
    // Ctrl + R: تحديث البيانات
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        refreshDashboard();
    }
    
    // Ctrl + T: مهمة جديدة
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        openQuickTaskModal();
    }
    
    // Ctrl + Q: إغلاق النوافذ المنبثقة
    if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        closeAllModals();
    }
}

/**
 * إعداد مستمعات النوافذ المنبثقة
 */
function setupModalListeners() {
    // إغلاق النوافذ المنبثقة بالنقر خارجها
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // إغلاق النوافذ المنبثقة بمفتاح ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

/**
 * إعداد مستمعات الأزرار الديناميكية
 */
function setupDynamicButtonListeners() {
    // أزرار تحديث البيانات
    document.querySelectorAll('[data-action="refresh"]').forEach(button => {
        button.addEventListener('click', refreshDashboard);
    });
    
    // أزرار إنشاء جديد
    document.querySelectorAll('[data-action="create"]').forEach(button => {
        button.addEventListener('click', createNewRequest);
    });
}

/**
 * إعداد مستمعات تحديث البيانات
 */
function setupRefreshListeners() {
    // تحديث تلقائي عند تركيز النافذة
    window.addEventListener('focus', () => {
        const employeeData = loadEmployeeData();
        if (employeeData.settings.auto_refresh) {
            refreshDashboard();
        }
    });
}

/**
 * عرض/إخفاء القائمة الجانبية
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // حفظ الحالة
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
}

/**
 * حفظ حالة القائمة الجانبية
 */
function saveSidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
}

/**
 * تحميل حالة القائمة الجانبية
 */
function loadSidebarState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }
}

/**
 * تحديث إحصائيات الموظف
 */
function updateEmployeeStats() {
    // تحديث وقت العمل
    updateWorkTime();
    
    // تحديث الإنتاجية
    updateProductivityScore();
    
    // تحديث الترتيب
    updateEmployeeRank();
}

/**
 * تحديث وقت العمل
 */
function updateWorkTime() {
    const loginTime = localStorage.getItem('lastLoginTime');
    if (!loginTime) return;
    
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diffMs = now - loginDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const workTimeElement = document.getElementById('workTime');
    if (workTimeElement) {
        workTimeElement.textContent = `${diffHours} س ${diffMinutes} د`;
    }
}

/**
 * تحديث درجة الإنتاجية
 */
function updateProductivityScore() {
    // حساب درجة الإنتاجية بناءً على الإنجازات
    const completedRequests = parseInt(localStorage.getItem('completedRequests') || '0');
    const completedTasks = parseInt(localStorage.getItem('completedTasks') || '0');
    const totalWorkHours = parseInt(localStorage.getItem('totalWorkHours') || '8');
    
    const productivityScore = Math.min(5, (completedRequests + completedTasks) / totalWorkHours);
    
    const scoreElement = document.getElementById('productivityScore');
    if (scoreElement) {
        scoreElement.textContent = productivityScore.toFixed(1);
        
        // تحديث النجوم
        const starsElement = scoreElement.closest('.rating-stars');
        if (starsElement) {
            starsElement.innerHTML = generateStarsHTML(productivityScore);
        }
    }
}

/**
 * تحديث ترتيب الموظف
 */
function updateEmployeeRank() {
    // في التطبيق الحقيقي: الحصول على الترتيب من الخادم
    const rank = 3; // مثال
    
    const rankElement = document.getElementById('employeeRank');
    if (rankElement) {
        rankElement.textContent = `الترتيب: ${rank}`;
    }
}

// ======================
// دوال المساعدة العامة
// ======================

/**
 * الحصول على فئة حالة الطلب
 */
function getRequestStatusClass(status) {
    const classes = {
        'جديد': 'new',
        'قيد المراجعة': 'warning',
        'قيد المعالجة': 'info',
        'مكتمل': 'success',
        'مرفوض': 'danger'
    };
    return classes[status] || 'secondary';
}

/**
 * الحصول على فئة الأولوية
 */
function getPriorityClass(priority) {
    const classes = {
        'low': 'low',
        'medium': 'medium',
        'high': 'high',
        'urgent': 'urgent'
    };
    return classes[priority] || 'medium';
}

/**
 * الحصول على نص الأولوية
 */
function getPriorityText(priority) {
    const texts = {
        'low': 'منخفضة',
        'medium': 'متوسطة',
        'high': 'عالية',
        'urgent': 'عاجلة'
    };
    return texts[priority] || 'متوسطة';
}

/**
 * الحصول على نص حالة المهمة
 */
function getTaskStatusText(status) {
    const texts = {
        'not_started': 'لم تبدأ',
        'pending': 'معلقة',
        'in_progress': 'قيد التنفيذ',
        'completed': 'مكتملة'
    };
    return texts[status] || status;
}

/**
 * الحصول على أيقونة الإشعار
 */
function getNotificationIcon(type) {
    const icons = {
        'info': 'info-circle',
        'warning': 'exclamation-triangle',
        'success': 'check-circle',
        'danger': 'times-circle'
    };
    return icons[type] || 'bell';
}

/**
 * تنسيق التاريخ
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-YE', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

/**
 * تنسيق الوقت
 */
function formatTime(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ar-YE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

/**
 * حساب الوقت المنقضي
 */
function getTimeAgo(timestamp) {
    if (!timestamp) return 'قبل قليل';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return formatDate(timestamp);
}

/**
 * إنشاء HTML للنجوم
 */
function generateStarsHTML(score) {
    let starsHTML = '';
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHTML += '<i class="far fa-star"></i>';
        }
    }
    
    return starsHTML;
}

/**
 * عرض رسالة نجاح
 */
function showSuccess(message) {
    showToast(message, 'success');
}

/**
 * عرض رسالة خطأ
 */
function showError(message) {
    showToast(message, 'error');
}

/**
 * عرض رسالة تحميل
 */
function showLoading(message = 'جاري التحميل...') {
    const loadingElement = document.getElementById('loadingOverlay');
    if (loadingElement) {
        const messageElement = loadingElement.querySelector('.loading-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        loadingElement.style.display = 'flex';
    }
}

/**
 * إخفاء رسالة التحميل
 */
function hideLoading() {
    const loadingElement = document.getElementById('loadingOverlay');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

/**
 * عرض رسالة عائمة
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * فتح نافذة المهمة السريعة
 */
function openQuickTaskModal() {
    const modal = document.getElementById('quickTaskModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * إغلاق كافة النوافذ المنبثقة
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

/**
 * تسجيل الخروج
 */
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        showLoading('جاري تسجيل الخروج...');
        
        // تسجيل وقت الخروج
        const logoutTime = new Date().toISOString();
        localStorage.setItem('lastLogoutTime', logoutTime);
        
        // حساب وقت العمل
        calculateWorkTime();
        
        // مسح بيانات الجلسة
        sessionStorage.clear();
        
        // في التطبيق الحقيقي: استدعاء API لتسجيل الخروج
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }
}

/**
 * حساب وقت العمل
 */
function calculateWorkTime() {
    const loginTime = localStorage.getItem('lastLoginTime');
    const logoutTime = new Date().toISOString();
    
    if (loginTime) {
        const loginDate = new Date(loginTime);
        const logoutDate = new Date(logoutTime);
        const diffMs = logoutDate - loginDate;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // حفظ وقت العمل اليومي
        const today = new Date().toISOString().split('T')[0];
        const dailyWorkHours = parseFloat(localStorage.getItem(`workHours_${today}`) || '0');
        localStorage.setItem(`workHours_${today}`, (dailyWorkHours + diffHours).toFixed(2));
    }
}

// ======================
// التصدير والدوال العامة
// ======================

// تصدير الدوال الرئيسية للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeEmployeeDashboard,
        loadEmployeeData,
        loadEmployeeRequests,
        loadEmployeeTasks,
        loadEmployeeReports,
        loadEmployeeNotifications,
        createNewRequest,
        viewRequest,
        editRequest,
        processRequest,
        updateTaskStatus,
        refreshDashboard,
        logout
    };
}

// تهيئة لوحة التحكم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من أن المستخدم موظف وليس مسؤولاً
    const userRole = localStorage.getItem('userRole');
    
    if (userRole && userRole === 'admin') {
        // إذا كان مسؤولاً، توجيه إلى لوحة المسؤول
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    // إذا كان موظفاً، تهيئة لوحة التحكم
    initializeEmployeeDashboard();
});