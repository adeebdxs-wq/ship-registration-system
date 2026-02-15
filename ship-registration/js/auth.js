// ========================================
// ملف: auth.js
// الوصف: إدارة المصادقة والصلاحيات
// ========================================

// ✅ لا يوجد تعريف لـ supabase هنا - نستخدمه من supabase-config.js

// بيانات المستخدمين التجريبية
const demoUsers = {
    admin: {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@maritime.gov.ye',
        password: 'admin123',
        full_name: 'المسؤول الرئيسي',
        role: 'admin',
        branch: 'main',
        position: 'مدير النظام',
        department: 'الإدارة العامة',
        employee_id: 'ADM-001'
    },
    aden: {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'aden@maritime.gov.ye',
        password: 'aden123',
        full_name: 'أحمد محمد - موظف عدن',
        role: 'branch_employee',
        branch: 'aden',
        position: 'موظف استقبال',
        department: 'خدمة العملاء',
        employee_id: 'EMP-AD-001'
    },
    owner1: {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        email: 'owner1@example.com',
        password: 'owner123',
        full_name: 'أحمد محمد عبدالله',
        role: 'ship_owner',
        national_id: '1234567890',
        phone: '777123456'
    }
};

// دالة تسجيل الدخول
async function login(email, password) {
    try {
        // البحث في المستخدمين التجريبيين
        let user = null;
        for (const key in demoUsers) {
            if (demoUsers[key].email === email && demoUsers[key].password === password) {
                user = { ...demoUsers[key] };
                delete user.password;
                break;
            }
        }
        
        if (!user) {
            showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
            return null;
        }
        
        // حفظ في localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('loginTime', new Date().toISOString());
        
        return user;
        
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showToast('حدث خطأ في تسجيل الدخول', 'error');
        return null;
    }
}

// دالة تسجيل الخروج
async function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    window.location.href = '/index.html';
}

// دالة التحقق من الجلسة
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// دالة التحقق من الصلاحية
function hasPermission(requiredRole) {
    const user = checkAuth();
    if (!user) return false;
    if (requiredRole === 'any') return true;
    if (user.role === 'admin') return true;
    return user.role === requiredRole;
}

// تصدير الدوال
window.auth = {
    login,
    logout,
    checkAuth,
    hasPermission
};
