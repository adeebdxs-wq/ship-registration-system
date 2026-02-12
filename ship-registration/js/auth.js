// ================================================
// نظام المصادقة - تسجيل الدخول وإدارة الجلسات
// ================================================

// ================================================
// دوال تسجيل الدخول
// ================================================

// تسجيل دخول الموظفين والمسؤولين
async function loginEmployee(email, password, role) {
    try {
        showLoading('جاري تسجيل الدخول...');
        
        // 1. تسجيل الدخول باستخدام Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (authError) throw authError;
        
        // 2. الحصول على بيانات المستخدم من جدول users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        
        if (userError) throw userError;
        
        // 3. التحقق من دور المستخدم
        if (userData.role !== role && role !== 'any') {
            throw new Error('ليس لديك صلاحية الدخول إلى هذه الصفحة');
        }
        
        // 4. تحديث آخر تسجيل دخول
        await supabase
            .from('users')
            .update({ 
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', userData.id);
        
        // 5. تسجيل النشاط
        await logActivity(
            userData.id,
            'LOGIN',
            'users',
            userData.id,
            { method: 'password', role: userData.role }
        );
        
        // 6. حفظ بيانات المستخدم في الجلسة
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        sessionStorage.setItem('accessToken', authData.session.access_token);
        
        hideLoading();
        showSuccess(`مرحباً ${userData.full_name}، تم تسجيل الدخول بنجاح`);
        
        // 7. التوجيه إلى لوحة التحكم المناسبة
        setTimeout(() => {
            redirectToDashboard(userData.role);
        }, 1000);
        
        return { success: true, user: userData };
        
    } catch (error) {
        hideLoading();
        showError(error.message || 'فشل تسجيل الدخول');
        return { success: false, error: error.message };
    }
}

// تسجيل دخول مالك السفينة
async function loginShipOwner(email, password, shipNumber = null) {
    try {
        showLoading('جاري تسجيل الدخول...');
        
        // 1. تسجيل الدخول باستخدام Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (authError) throw authError;
        
        // 2. الحصول على بيانات المستخدم
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        
        if (userError) throw userError;
        
        // 3. التحقق من أن المستخدم مالك سفينة
        if (userData.role !== 'ship_owner') {
            throw new Error('هذا الحساب غير مسجل كمالك سفينة');
        }
        
        // 4. إذا تم إدخال رقم سفينة، تحقق من الملكية
        if (shipNumber) {
            const { data: shipData, error: shipError } = await supabase
                .from('ships')
                .select('id')
                .eq('registration_number', shipNumber)
                .eq('owner_id', userData.id)
                .single();
            
            if (shipError || !shipData) {
                console.warn('رقم السفينة غير مرتبط بهذا المالك');
            }
        }
        
        // 5. تحديث آخر تسجيل دخول
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userData.id);
        
        // 6. حفظ بيانات المستخدم
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        sessionStorage.setItem('accessToken', authData.session.access_token);
        
        hideLoading();
        showSuccess(`مرحباً ${userData.full_name}، تم تسجيل الدخول بنجاح`);
        
        // 7. التوجيه إلى لوحة تحكم المالك
        setTimeout(() => {
            window.location.href = 'ship-owner-dashboard.html';
        }, 1000);
        
        return { success: true, user: userData };
        
    } catch (error) {
        hideLoading();
        showError(error.message || 'فشل تسجيل الدخول');
        return { success: false, error: error.message };
    }
}

// ================================================
// دوال تسجيل الخروج
// ================================================
async function logout() {
    try {
        const user = getCurrentUser();
        
        if (user) {
            // تسجيل نشاط الخروج
            await logActivity(
                user.id,
                'LOGOUT',
                'users',
                user.id,
                { timestamp: new Date().toISOString() }
            );
        }
        
        // تسجيل الخروج من Supabase
        await supabase.auth.signOut();
        
        // مسح بيانات الجلسة
        sessionStorage.clear();
        localStorage.removeItem('supabase.auth.token');
        
        showSuccess('تم تسجيل الخروج بنجاح');
        
        // التوجيه إلى صفحة تسجيل الدخول
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
        
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        // مسح البيانات محلياً حتى لو فشل الاتصال
        sessionStorage.clear();
        window.location.href = '../index.html';
    }
}

// ================================================
// دوال التحقق من الجلسة
// ================================================

// الحصول على المستخدم الحالي
function getCurrentUser() {
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch {
            return null;
        }
    }
    return null;
}

// التحقق من وجود جلسة نشطة
async function checkAuth(requiredRole = null) {
    try {
        // التحقق من الجلسة في Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
            throw new Error('لا توجد جلسة نشطة');
        }
        
        // الحصول على بيانات المستخدم
        const user = getCurrentUser();
        if (!user) {
            throw new Error('بيانات المستخدم غير موجودة');
        }
        
        // التحقق من الصلاحية
        if (requiredRole) {
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            if (!roles.includes(user.role)) {
                throw new Error('ليس لديك صلاحية للوصول إلى هذه الصفحة');
            }
        }
        
        return { success: true, user, session };
        
    } catch (error) {
        console.error('خطأ في التحقق من الجلسة:', error);
        
        // مسح البيانات الفاسدة
        sessionStorage.clear();
        localStorage.removeItem('supabase.auth.token');
        
        return { 
            success: false, 
            error: error.message || 'يرجى تسجيل الدخول مرة أخرى' 
        };
    }
}

// ================================================
// دوال إنشاء الحسابات
// ================================================

// إنشاء حساب جديد لمالك سفينة
async function registerShipOwner(userData) {
    try {
        showLoading('جاري إنشاء الحساب...');
        
        // 1. إنشاء المستخدم في Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    full_name: userData.fullName,
                    role: 'ship_owner'
                }
            }
        });
        
        if (authError) throw authError;
        
        // 2. إضافة المستخدم إلى جدول users
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: userData.email,
                password_hash: 'managed_by_supabase_auth',
                full_name: userData.fullName,
                role: 'ship_owner',
                status: 'pending_verification',
                national_id: userData.nationalId,
                phone: userData.phone,
                address: userData.address,
                created_at: new Date().toISOString(),
                email_verified: false
            })
            .select()
            .single();
        
        if (userError) throw userError;
        
        hideLoading();
        showSuccess('تم إنشاء الحساب بنجاح! يرجى تفعيل البريد الإلكتروني');
        
        return { success: true, user: newUser };
        
    } catch (error) {
        hideLoading();
        showError(error.message || 'فشل إنشاء الحساب');
        return { success: false, error: error.message };
    }
}

// ================================================
// دوال تسجيل النشاط
// ================================================
async function logActivity(userId, action, entityType, entityId, details = {}) {
    try {
        // الحصول على معلومات الجهاز
        const userAgent = navigator.userAgent;
        
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: userId,
                action: action,
                entity_type: entityType,
                entity_id: entityId,
                details: details,
                ip_address: 'client_side',
                user_agent: userAgent,
                created_at: new Date().toISOString()
            });
        
        if (error) console.error('خطأ في تسجيل النشاط:', error);
        
    } catch (error) {
        console.error('خطأ في تسجيل النشاط:', error);
    }
}

// ================================================
// دوال إعادة تعيين كلمة المرور
// ================================================
async function resetPassword(email) {
    try {
        showLoading('جاري إرسال رابط إعادة التعيين...');
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/pages/reset-password.html`,
        });
        
        if (error) throw error;
        
        hideLoading();
        showSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
        
        return { success: true };
        
    } catch (error) {
        hideLoading();
        showError(error.message || 'فشل إرسال رابط إعادة التعيين');
        return { success: false, error: error.message };
    }
}

// ================================================
// دوال التوجيه
// ================================================
function redirectToDashboard(role) {
    switch(role) {
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        case 'branch_employee':
            window.location.href = 'branch-employee-dashboard.html';
            break;
        case 'ship_owner':
            window.location.href = 'ship-owner-dashboard.html';
            break;
        case 'inspector':
            window.location.href = 'inspector-dashboard.html';
            break;
        case 'finance_officer':
            window.location.href = 'finance-dashboard.html';
            break;
        default:
            window.location.href = '../index.html';
    }
}

// ================================================
// تصدير الدوال
// ================================================
window.loginEmployee = loginEmployee;
window.loginShipOwner = loginShipOwner;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.checkAuth = checkAuth;
window.registerShipOwner = registerShipOwner;
window.logActivity = logActivity;
window.resetPassword = resetPassword;
window.redirectToDashboard = redirectToDashboard;