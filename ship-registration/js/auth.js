// ========================================
// الملف: auth.js
// الوصف: إدارة المصادقة والصلاحيات
// النظام: نظام تسجيل السفن الإلكتروني
// ========================================

// ===== تكوين Supabase =====
// يجب استبدال هذه القيم بمشروعك الفعلي
const SUPABASE_URL = 'https://jswzallmawmjypimixbb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LRAvXJd5qHXdHo7jWRF49Q_ruw8kTmt';

// إنشاء عميل Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// ===== بيانات المستخدمين التجريبية (للتطوير) =====
const demoUsers = {
    // المسؤول
    admin: {
        id: 'admin-001',
        email: 'admin@maritime.gov.ye',
        password: 'admin123',
        full_name: 'المسؤول الرئيسي',
        role: 'admin',
        branch: 'main',
        position: 'مدير النظام',
        department: 'الإدارة العامة',
        avatar: null
    },
    // موظف فرع عدن
    aden: {
        id: 'emp-001',
        email: 'aden@maritime.gov.ye',
        password: 'aden123',
        full_name: 'أحمد محمد - موظف فرع عدن',
        role: 'branch_employee',
        branch: 'aden',
        position: 'موظف استقبال',
        department: 'خدمة العملاء',
        avatar: null
    },
    // موظف فرع المكلا
    mukalla: {
        id: 'emp-002',
        email: 'mukalla@maritime.gov.ye',
        password: 'mukalla123',
        full_name: 'سالم عبدالله - موظف فرع المكلا',
        role: 'branch_employee',
        branch: 'mukalla',
        position: 'موظف استقبال',
        department: 'خدمة العملاء',
        avatar: null
    },
    // مالك سفينة 1
    owner1: {
        id: 'own-001',
        email: 'owner1@example.com',
        password: 'owner123',
        full_name: 'أحمد محمد - مالك سفينة',
        role: 'ship_owner',
        national_id: '1234567890',
        phone: '777123456',
        address: 'شارع 26 سبتمبر',
        city: 'عدن',
        governorate: 'عدن',
        avatar: null
    },
    // شركة شحن
    company1: {
        id: 'own-002',
        email: 'company@example.com',
        password: 'company123',
        full_name: 'شركة الشحن السريع',
        role: 'ship_owner',
        commercial_registration: 'CR-2024-001',
        tax_number: 'TX-123456',
        phone: '777789012',
        address: 'منطقة الميناء',
        city: 'الحديدة',
        governorate: 'الحديدة',
        avatar: null
    }
};

// ===== تسجيل الدخول =====
async function login(email, password, role = null) {
    try {
        showLoading('جاري تسجيل الدخول...');
        
        // محاكاة التحقق من البيانات (للتطوير)
        // في الإنتاج، استخدم: await supabase.auth.signInWithPassword({ email, password })
        
        let user = null;
        
        // البحث في المستخدمين التجريبيين
        for (const key in demoUsers) {
            if (demoUsers[key].email === email && demoUsers[key].password === password) {
                user = { ...demoUsers[key] };
                delete user.password; // إزالة كلمة المرور من البيانات المحفوظة
                break;
            }
        }
        
        if (!user) {
            hideLoading();
            showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
            return null;
        }
        
        // التحقق من الدور إذا كان محدداً
        if (role && user.role !== role) {
            hideLoading();
            showToast('ليس لديك صلاحية الدخول إلى هذه الصفحة', 'error');
            return null;
        }
        
        // حفظ بيانات المستخدم
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('loginTime', new Date().toISOString());
        
        // تسجيل آخر دخول
        user.last_login = new Date().toISOString();
        
        showToast('تم تسجيل الدخول بنجاح', 'success');
        
        return user;
        
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showToast('حدث خطأ في تسجيل الدخول', 'error');
        return null;
    } finally {
        hideLoading();
    }
}

// ===== تسجيل الخروج =====
async function logout() {
    try {
        showLoading('جاري تسجيل الخروج...');
        
        // تسجيل الخروج من Supabase (في الإنتاج)
        // await supabase.auth.signOut();
        
        // مسح البيانات المحلية
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loginTime');
        sessionStorage.clear();
        
        showToast('تم تسجيل الخروج بنجاح', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        showToast('حدث خطأ في تسجيل الخروج', 'error');
    } finally {
        hideLoading();
    }
}

// ===== التحقق من الجلسة =====
async function checkAuth(requiredRole = null) {
    try {
        // في الإنتاج، استخدم:
        // const { data: { session } } = await supabase.auth.getSession()
        
        const savedUser = localStorage.getItem('currentUser');
        
        if (!savedUser) {
            redirectToLogin();
            return null;
        }
        
        const user = JSON.parse(savedUser);
        
        // التحقق من الدور المطلوب
        if (requiredRole && user.role !== requiredRole) {
            showToast('ليس لديك صلاحية الوصول إلى هذه الصفحة', 'error');
            setTimeout(() => {
                redirectToDashboard(user.role);
            }, 2000);
            return null;
        }
        
        return user;
        
    } catch (error) {
        console.error('خطأ في التحقق من الجلسة:', error);
        redirectToLogin();
        return null;
    }
}

// ===== التوجيه إلى لوحة التحكم المناسبة =====
function redirectToDashboard(role) {
    const dashboardMap = {
        'admin': 'admin-dashboard.html',
        'branch_employee': 'branch-employee-dashboard.html',
        'inspector': 'inspector-dashboard.html',
        'finance_officer': 'finance-dashboard.html',
        'ship_owner': 'ship-owner-dashboard.html'
    };
    
    const url = dashboardMap[role] || 'index.html';
    window.location.href = url;
}

// ===== التوجيه إلى صفحة تسجيل الدخول =====
function redirectToLogin() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage.includes('admin')) {
        window.location.href = 'login.html';
    } else if (currentPage.includes('owner')) {
        window.location.href = 'ship-owner-login.html';
    } else {
        window.location.href = 'index.html';
    }
}

// ===== إنشاء مستخدم جديد =====
async function register(userData) {
    try {
        showLoading('جاري إنشاء الحساب...');
        
        // في الإنتاج، استخدم:
        // const { data, error } = await supabase.auth.signUp({
        //     email: userData.email,
        //     password: userData.password,
        //     options: { data: userData }
        // })
        
        // محاكاة إنشاء حساب
        const newUser = {
            id: `user-${Date.now()}`,
            ...userData,
            created_at: new Date().toISOString()
        };
        
        delete newUser.password;
        
        showToast('تم إنشاء الحساب بنجاح', 'success');
        return newUser;
        
    } catch (error) {
        console.error('خطأ في إنشاء الحساب:', error);
        showToast('حدث خطأ في إنشاء الحساب', 'error');
        return null;
    } finally {
        hideLoading();
    }
}

// ===== تغيير كلمة المرور =====
async function changePassword(oldPassword, newPassword) {
    try {
        showLoading('جاري تغيير كلمة المرور...');
        
        // في الإنتاج، استخدم:
        // const { error } = await supabase.auth.updateUser({ password: newPassword })
        
        // محاكاة تغيير كلمة المرور
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showToast('تم تغيير كلمة المرور بنجاح', 'success');
        return true;
        
    } catch (error) {
        console.error('خطأ في تغيير كلمة المرور:', error);
        showToast('حدث خطأ في تغيير كلمة المرور', 'error');
        return false;
    } finally {
        hideLoading();
    }
}

// ===== إعادة تعيين كلمة المرور =====
async function resetPassword(email) {
    try {
        showLoading('جاري إرسال رابط إعادة التعيين...');
        
        // في الإنتاج، استخدم:
        // const { error } = await supabase.auth.resetPasswordForEmail(email)
        
        // محاكاة إرسال البريد
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني', 'success');
        return true;
        
    } catch (error) {
        console.error('خطأ في إعادة تعيين كلمة المرور:', error);
        showToast('حدث خطأ في إعادة تعيين كلمة المرور', 'error');
        return false;
    } finally {
        hideLoading();
    }
}

// ===== الحصول على المستخدم الحالي =====
function getCurrentUser() {
    try {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    } catch {
        return null;
    }
}

// ===== التحقق من الصلاحية =====
function hasPermission(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    
    if (requiredRole === 'any') return true;
    if (user.role === 'admin') return true; // المسؤول لديه كل الصلاحيات
    
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
}

// ===== تسجيل الدخول بحساب تجريبي (للتطوير) =====
function loginWithDemo(demoKey) {
    const demoUser = demoUsers[demoKey];
    if (demoUser) {
        const user = { ...demoUser };
        delete user.password;
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('loginTime', new Date().toISOString());
        
        redirectToDashboard(user.role);
    }
}

// ===== تصدير الدوال =====
window.auth = {
    login,
    logout,
    checkAuth,
    register,
    changePassword,
    resetPassword,
    getCurrentUser,
    hasPermission,
    loginWithDemo
};

window.supabase = supabase;
window.demoUsers = demoUsers;