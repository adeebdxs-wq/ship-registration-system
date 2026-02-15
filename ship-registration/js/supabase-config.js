// ================================================
// ملف الاتصال بـ Supabase - نظام تسجيل السفن
// ================================================

// إنشاء اتصال Supabase
const supabaseUrl = 'https://your-project-id.supabase.co'; // ⚠️ استبدل هذا برابط مشروعك
const supabaseAnonKey = 'your-anon-key'; // ⚠️ استبدل هذا بالمفتاح العام

// تهيئة عميل Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// حفظ في النطاق العام
window.supabase = supabase;
window.API_BASE_URL = supabaseUrl;

// ================================================
// دوال المساعدة العامة
// ================================================

// دالة عرض رسائل الخطأ
function showError(message, container = null) {
    console.error('خطأ:', message);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.style.cssText = `
        background-color: #fee2e2;
        color: #991b1b;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        border-right: 4px solid #dc2626;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    if (container) {
        container.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    } else {
        alert(message);
    }
}

// دالة عرض رسائل النجاح
function showSuccess(message, container = null) {
    console.log('نجاح:', message);
    
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.style.cssText = `
        background-color: #dcfce7;
        color: #166534;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        border-right: 4px solid #16a34a;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    if (container) {
        container.prepend(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    } else {
        alert(message);
    }
}

// دالة عرض رسائل التحميل
function showLoading(message = 'جاري التحميل...') {
    const loadingDiv = document.getElementById('global-loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
        loadingDiv.querySelector('p').textContent = message;
    } else {
        // إنشاء عنصر تحميل إذا لم يكن موجوداً
        const div = document.createElement('div');
        div.id = 'global-loading';
        div.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        div.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 16px;
                text-align: center;
                min-width: 300px;
                box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
            ">
                <div style="font-size: 48px; color: #2c7be5; margin-bottom: 16px;">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p style="font-size: 18px; color: #1e293b; margin: 0;">${message}</p>
            </div>
        `;
        document.body.appendChild(div);
    }
}

// دالة إخفاء رسالة التحميل
function hideLoading() {
    const loadingDiv = document.getElementById('global-loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// دالة تنسيق التاريخ
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// دالة تنسيق التاريخ العربي
function formatDateArabic(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ar-YE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// دالة تنسيق المبلغ
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-YE', {
        style: 'currency',
        currency: 'YER',
        minimumFractionDigits: 0
    }).format(amount);
}

// تصدير الدوال للاستخدام
window.formatDate = formatDate;
window.formatDateArabic = formatDateArabic;
window.formatCurrency = formatCurrency;
window.showError = showError;
window.showSuccess = showSuccess;
window.showLoading = showLoading;
window.hideLoading = hideLoading;