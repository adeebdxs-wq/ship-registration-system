// ========================================
// الملف: dashboard-functions.js
// الوصف: وظائف لوحات التحكم
// النظام: نظام تسجيل السفن الإلكتروني
// ========================================

// ===== إظهار وإخفاء الأقسام =====
function showSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('[id$="Section"]').forEach(section => {
        section.style.display = 'none';
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // تحديث القائمة الجانبية
    document.querySelectorAll('.menu-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[onclick*="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// ===== تحميل الإحصائيات =====
async function loadDashboardStats() {
    try {
        // محاكاة تحميل البيانات
        // في الإنتاج، استخدم API حقيقي
        
        const stats = {
            totalShips: 1248,
            activeShips: 1156,
            pendingApplications: 42,
            rejectedApplications: 18,
            totalApplications: 156,
            expiringShips: 24
        };
        
        // تحديث العناصر
        document.querySelectorAll('[id$="Stat"]').forEach(el => {
            const statName = el.id.replace('Stat', '');
            if (stats[statName] !== undefined) {
                el.textContent = stats[statName];
            }
        });
        
        return stats;
        
    } catch (error) {
        console.error('خطأ في تحميل الإحصائيات:', error);
        showToast('فشل تحميل الإحصائيات', 'error');
    }
}

// ===== تحميل الطلبات =====
async function loadApplications(filters = {}) {
    try {
        showLoading('جاري تحميل الطلبات...');
        
        // محاكاة تحميل الطلبات
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const applications = [
            {
                id: 'app-001',
                number: 'REG-2025-0001',
                shipName: 'البحر الأحمر',
                owner: 'شركة الشحن الوطنية',
                submissionDate: '2025-01-15',
                branch: 'aden',
                status: 'pending',
                assignedTo: 'أحمد محمد'
            },
            {
                id: 'app-002',
                number: 'REG-2025-0002',
                shipName: 'النفطية 1',
                owner: 'شركة النفط اليمنية',
                submissionDate: '2025-01-20',
                branch: 'hodeidah',
                status: 'reviewing',
                assignedTo: 'سالم عبدالله'
            },
            {
                id: 'app-003',
                number: 'REG-2025-0003',
                shipName: 'اليمن السعيد',
                owner: 'شركة النقل البحري',
                submissionDate: '2025-01-22',
                branch: 'mukalla',
                status: 'approved',
                assignedTo: 'فاطمة علي'
            }
        ];
        
        hideLoading();
        return applications;
        
    } catch (error) {
        console.error('خطأ في تحميل الطلبات:', error);
        hideLoading();
        showToast('فشل تحميل الطلبات', 'error');
        return [];
    }
}

// ===== تحميل السفن =====
async function loadShips(filters = {}) {
    try {
        showLoading('جاري تحميل السفن...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const ships = [
            {
                id: 'ship-001',
                name: 'البحر الأحمر',
                registrationNumber: 'SHIP-2024-001',
                type: 'cargo',
                tonnage: 12500,
                owner: 'شركة الشحن الوطنية',
                registrationDate: '2024-01-15',
                expiryDate: '2025-01-15',
                status: 'active'
            },
            {
                id: 'ship-002',
                name: 'النفطية 1',
                registrationNumber: 'SHIP-2024-002',
                type: 'tanker',
                tonnage: 45000,
                owner: 'شركة النفط اليمنية',
                registrationDate: '2024-02-20',
                expiryDate: '2025-02-20',
                status: 'active'
            },
            {
                id: 'ship-003',
                name: 'اليمن السعيد',
                registrationNumber: 'SHIP-2024-003',
                type: 'passenger',
                tonnage: 8500,
                owner: 'شركة النقل البحري',
                registrationDate: '2024-03-10',
                expiryDate: '2025-03-10',
                status: 'active'
            }
        ];
        
        hideLoading();
        return ships;
        
    } catch (error) {
        console.error('خطأ في تحميل السفن:', error);
        hideLoading();
        showToast('فشل تحميل السفن', 'error');
        return [];
    }
}

// ===== تحميل الموظفين =====
async function loadEmployees(filters = {}) {
    try {
        showLoading('جاري تحميل الموظفين...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const employees = [
            {
                id: 'emp-001',
                name: 'أحمد محمد',
                email: 'ahmed@maritime.gov.ye',
                branch: 'aden',
                department: 'استقبال الطلبات',
                position: 'موظف استقبال',
                status: 'active',
                requestsCount: 156
            },
            {
                id: 'emp-002',
                name: 'سالم عبدالله',
                email: 'salem@maritime.gov.ye',
                branch: 'mukalla',
                department: 'مراجعة المستندات',
                position: 'مراجع',
                status: 'active',
                requestsCount: 142
            },
            {
                id: 'emp-003',
                name: 'فاطمة علي',
                email: 'fatma@maritime.gov.ye',
                branch: 'hodeidah',
                department: 'التسجيل',
                position: 'موظف تسجيل',
                status: 'active',
                requestsCount: 128
            }
        ];
        
        hideLoading();
        return employees;
        
    } catch (error) {
        console.error('خطأ في تحميل الموظفين:', error);
        hideLoading();
        showToast('فشل تحميل الموظفين', 'error');
        return [];
    }
}

// ===== تحميل الإشعارات =====
async function loadNotifications() {
    try {
        showLoading('جاري تحميل الإشعارات...');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const notifications = [
            {
                id: 'not-001',
                title: 'طلب جديد',
                message: 'تم استلام طلب تسجيل جديد للسفينة "البحر الأحمر"',
                type: 'info',
                created_at: new Date().toISOString(),
                is_read: false
            },
            {
                id: 'not-002',
                title: 'تمت الموافقة',
                message: 'تمت الموافقة على طلب تسجيل السفينة "النفطية 1"',
                type: 'success',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                is_read: true
            },
            {
                id: 'not-003',
                title: 'شهادة على وشك الانتهاء',
                message: 'سفينة "اليمن السعيد" ستنتهي شهادتها بعد 30 يوم',
                type: 'warning',
                created_at: new Date(Date.now() - 172800000).toISOString(),
                is_read: false
            }
        ];
        
        hideLoading();
        return notifications;
        
    } catch (error) {
        console.error('خطأ في تحميل الإشعارات:', error);
        hideLoading();
        return [];
    }
}

// ===== تحديث الإشعارات =====
function updateNotificationsBadge() {
    const unreadCount = document.querySelectorAll('.notification-unread').length;
    document.querySelectorAll('[id$="NotificationsCount"]').forEach(el => {
        el.textContent = unreadCount;
        el.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    });
}

// ===== البحث =====
function searchItems(searchTerm, items, fields) {
    if (!searchTerm) return items;
    
    searchTerm = searchTerm.toLowerCase();
    
    return items.filter(item => {
        return fields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(searchTerm);
        });
    });
}

// ===== التصفية =====
function filterItems(items, filters) {
    return items.filter(item => {
        for (const key in filters) {
            if (filters[key] && filters[key] !== 'all' && item[key] !== filters[key]) {
                return false;
            }
        }
        return true;
    });
}

// ===== التصدير إلى Excel =====
function exportToExcel(data, filename) {
    // محاكاة التصدير
    showToast(`جاري تصدير ${filename}...`, 'info');
    
    setTimeout(() => {
        showToast(`تم تصدير ${filename} بنجاح`, 'success');
    }, 1500);
}

// ===== التصدير إلى PDF =====
function exportToPDF(data, filename) {
    showToast(`جاري تصدير ${filename}...`, 'info');
    
    setTimeout(() => {
        showToast(`تم تصدير ${filename} بنجاح`, 'success');
    }, 1500);
}

// ===== طباعة =====
function printReport(title) {
    showToast(`جاري تجهيز ${title} للطباعة...`, 'info');
    
    setTimeout(() => {
        window.print();
    }, 1000);
}

// ===== تصدير الدوال =====
window.dashboard = {
    showSection,
    loadDashboardStats,
    loadApplications,
    loadShips,
    loadEmployees,
    loadNotifications,
    updateNotificationsBadge,
    searchItems,
    filterItems,
    exportToExcel,
    exportToPDF,
    printReport
};