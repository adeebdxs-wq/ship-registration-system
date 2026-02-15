// ========================================
// الملف: main.js
// الوصف: الوظائف الرئيسية للنظام
// النظام: نظام تسجيل السفن الإلكتروني
// ========================================

// ===== المتغيرات العامة =====
const App = {
    version: '1.0.0',
    name: 'نظام تسجيل السفن الإلكتروني',
    currentUser: null,
    config: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        currency: 'ريال',
        language: 'ar'
    }
};

// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', function() {
    console.log(`${App.name} - الإصدار ${App.version} جاهز للعمل`);
    initializeApp();
});

function initializeApp() {
    setupGlobalListeners();
    checkSession();
    loadUserPreferences();
}

// ===== إدارة الجلسة =====
function checkSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            App.currentUser = JSON.parse(savedUser);
            updateUIForUser();
        } catch (e) {
            console.error('خطأ في تحميل بيانات المستخدم:', e);
            logout();
        }
    }
}

function updateUIForUser() {
    if (!App.currentUser) return;
    
    // تحديث عناصر واجهة المستخدم
    document.querySelectorAll('.user-name-display').forEach(el => {
        el.textContent = App.currentUser.full_name || App.currentUser.name;
    });
    
    document.querySelectorAll('.user-role-display').forEach(el => {
        el.textContent = getRoleName(App.currentUser.role);
    });
}

// ===== تسجيل الخروج =====
async function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        showLoading('جاري تسجيل الخروج...');
        
        setTimeout(() => {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('loginTime');
            App.currentUser = null;
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ===== الرسائل المنبثقة =====
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== إظهار التحميل =====
function showLoading(message = 'جاري التحميل...') {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        const loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loading);
    } else {
        overlay.querySelector('p').textContent = message;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ===== تنسيق التاريخ =====
function formatDate(date) {
    if (!date) return '---';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateTime(date) {
    if (!date) return '---';
    const d = new Date(date);
    return d.toLocaleString('ar-YE');
}

function formatTimeAgo(date) {
    if (!date) return '---';
    
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 30) {
        return formatDate(date);
    } else if (diffDay > 0) {
        return `منذ ${diffDay} يوم`;
    } else if (diffHour > 0) {
        return `منذ ${diffHour} ساعة`;
    } else if (diffMin > 0) {
        return `منذ ${diffMin} دقيقة`;
    } else {
        return `الآن`;
    }
}

// ===== الحصول على اسم الفرع =====
function getBranchName(branch) {
    const branches = {
        'main': 'المقر الرئيسي',
        'aden': 'عدن',
        'mukalla': 'المكلا',
        'hodeidah': 'الحديدة',
        'salif': 'الصليف',
        'mocha': 'المخا',
        'socotra': 'سقطرى'
    };
    return branches[branch] || branch || 'غير محدد';
}

// ===== الحصول على اسم الدور =====
function getRoleName(role) {
    const roles = {
        'admin': 'مسؤول النظام',
        'branch_employee': 'موظف فرع',
        'inspector': 'مفتش بحري',
        'finance_officer': 'موظف مالي',
        'ship_owner': 'مالك سفينة'
    };
    return roles[role] || role || 'مستخدم';
}

// ===== الحصول على نص الحالة =====
function getStatusText(status) {
    const statusMap = {
        'draft': 'مسودة',
        'pending': 'قيد المراجعة',
        'reviewing': 'جاري المعالجة',
        'approved': 'مقبول',
        'rejected': 'مرفوض',
        'rejected_by_employee': 'مرفوض من موظف',
        'ready_for_employee': 'جاهز للموظف',
        'certificate_issued': 'تم إصدار الشهادة',
        'completed': 'مكتمل',
        'cancelled': 'ملغي',
        'active': 'نشط',
        'expired': 'منتهي',
        'suspended': 'موقوف'
    };
    return statusMap[status] || status;
}

// ===== الحصول على فئة الحالة =====
function getStatusClass(status) {
    const classMap = {
        'draft': 'badge-secondary',
        'pending': 'badge-warning',
        'reviewing': 'badge-info',
        'approved': 'badge-success',
        'rejected': 'badge-danger',
        'rejected_by_employee': 'badge-danger',
        'ready_for_employee': 'badge-success',
        'certificate_issued': 'badge-success',
        'completed': 'badge-success',
        'cancelled': 'badge-secondary',
        'active': 'badge-success',
        'expired': 'badge-danger',
        'suspended': 'badge-warning'
    };
    return classMap[status] || 'badge-secondary';
}

// ===== التحقق من صحة البريد الإلكتروني =====
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== التحقق من صحة رقم الهاتف =====
function isValidPhone(phone) {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone);
}

// ===== التحقق من صحة رقم الهوية =====
function isValidNationalId(id) {
    const re = /^[0-9]{10}$/;
    return re.test(id);
}

// ===== نسخ النص =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('تم النسخ', 'success');
    }).catch(() => {
        showToast('فشل النسخ', 'error');
    });
}

// ===== تحميل تفضيلات المستخدم =====
function loadUserPreferences() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // يمكن إضافة المزيد من التفضيلات هنا
}

// ===== مستمعات الأحداث العامة =====
function setupGlobalListeners() {
    // إغلاق النوافذ المنبثقة عند النقر خارجها
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // إغلاق النوافذ بمفتاح ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
    
    // منع إرسال النماذج الفارغة
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                showToast('يرجى تعبئة جميع الحقول المطلوبة', 'warning');
            }
        });
    });
}

// ===== تصدير الدوال للاستخدام العام =====
window.App = App;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatTimeAgo = formatTimeAgo;
window.getBranchName = getBranchName;
window.getRoleName = getRoleName;
window.getStatusText = getStatusText;
window.getStatusClass = getStatusClass;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
window.isValidNationalId = isValidNationalId;
window.copyToClipboard = copyToClipboard;
window.logout = logout;