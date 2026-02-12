/**
 * ملف الدوال الرئيسية المشتركة لنظام تسجيل السفن
 * إصدار 2.1.0
 */

// تهيئة النظام
document.addEventListener('DOMContentLoaded', function() {
    console.log('نظام تسجيل السفن - جاهز للتشغيل');
    initializeSystem();
});

/**
 * تهيئة النظام الأساسية
 */
function initializeSystem() {
    // إضافة حدث لجميع النماذج لمنع الإرسال الافتراضي
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.classList.contains('no-prevent')) {
                e.preventDefault();
                handleFormSubmit(form);
            }
        });
    });
    
    // إدارة القوائم المنسدلة
    initializeSelects();
    
    // إدارة التواريخ
    initializeDatePickers();
    
    // إدارة تحميل الملفات
    initializeFileUploads();
    
    // تحميل البلدان للقوائم الدولية
    loadCountryData();
    
    // التحقق من جلسة المستخدم
    checkUserSession();
}

/**
 * تحميل بيانات البلدان
 */
async function loadCountryData() {
    const countrySelects = document.querySelectorAll('.country-select');
    
    if (countrySelects.length > 0) {
        try {
            // يمكن استبدال هذا بطلب AJAX حقيقي
            const countries = [
                { code: '+967', name: 'اليمن 🇾🇪' },
                { code: '+966', name: 'السعودية 🇸🇦' },
                { code: '+971', name: 'الإمارات 🇦🇪' },
                { code: '+973', name: 'البحرين 🇧🇭' },
                { code: '+974', name: 'قطر 🇶🇦' },
                { code: '+968', name: 'عُمان 🇴🇲' },
                { code: '+965', name: 'الكويت 🇰🇼' },
                { code: '+20', name: 'مصر 🇪🇬' },
                { code: '+962', name: 'الأردن 🇯🇴' },
                { code: '+963', name: 'سوريا 🇸🇾' },
                { code: '+961', name: 'لبنان 🇱🇧' }
            ];
            
            countrySelects.forEach(select => {
                select.innerHTML = '<option value="">اختر رمز الدولة</option>';
                countries.forEach(country => {
                    const option = document.createElement('option');
                    option.value = country.code;
                    option.textContent = `${country.name} (${country.code})`;
                    select.appendChild(option);
                });
            });
        } catch (error) {
            console.error('خطأ في تحميل بيانات البلدان:', error);
        }
    }
}

/**
 * تهيئة القوائم المنسدلة
 */
function initializeSelects() {
    // جعل القوائم المنسدلة أكثر تفاعلية
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            this.classList.add('selected');
            
            // إذا كان هناك حدث مخصص على التغيير
            if (this.dataset.changeHandler) {
                window[this.dataset.changeHandler](this.value);
            }
        });
    });
}

/**
 * تهيئة منتقي التواريخ
 */
function initializeDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // تعيين تاريخ اليوم كقيمة افتراضية إذا لزم الأمر
        if (input.dataset.defaultToday === 'true') {
            const today = new Date().toISOString().split('T')[0];
            input.value = today;
        }
        
        // تحديد الحد الأدنى والحد الأقصى للتاريخ
        if (input.dataset.minDate) {
            input.min = input.dataset.minDate;
        }
        
        if (input.dataset.maxDate) {
            input.max = input.dataset.maxDate;
        }
    });
}

/**
 * تهيئة تحميل الملفات
 */
function initializeFileUploads() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const files = this.files;
            const previewContainer = document.getElementById(this.dataset.previewContainer);
            
            if (previewContainer) {
                previewContainer.innerHTML = '';
                
                Array.from(files).forEach((file, index) => {
                    const fileInfo = document.createElement('div');
                    fileInfo.className = 'file-info';
                    fileInfo.innerHTML = `
                        <i class="fas fa-file"></i>
                        <span>${file.name}</span>
                        <small>(${formatFileSize(file.size)})</small>
                    `;
                    previewContainer.appendChild(fileInfo);
                });
            }
            
            // تحديث حالة المستند
            updateDocumentStatus(this);
        });
    });
}

/**
 * تحديث حالة المستند
 */
function updateDocumentStatus(fileInput) {
    const statusElement = document.querySelector(`[data-document="${fileInput.name}"]`);
    if (statusElement && fileInput.files.length > 0) {
        statusElement.classList.remove('not-uploaded');
        statusElement.classList.add('uploaded');
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i> تم التحميل';
    }
}

/**
 * تنسيق حجم الملف
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * التحقق من جلسة المستخدم
 */
function checkUserSession() {
    // في التطبيق الحقيقي، يتم التحقق من الـ Session أو الـ Token
    const currentPage = window.location.pathname.split('/').pop();
    
    // صفحات تتطلب تسجيل دخول
    const protectedPages = [
        'admin-dashboard.html',
        'branch-employee-dashboard.html',
        'employee-management.html',
        'reports.html'
    ];
    
    if (protectedPages.includes(currentPage)) {
        // محاكاة التحقق من تسجيل الدخول
        const isLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
        
        if (!isLoggedIn) {
            // إذا لم يكن مسجلاً، توجيه لصفحة تسجيل الدخول
            showToast('يجب تسجيل الدخول أولاً', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }
}

/**
 * معالجة إرسال النماذج
 */
function handleFormSubmit(form) {
    // التحقق من صحة النموذج
    if (!validateForm(form)) {
        showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
        return;
    }
    
    // جمع بيانات النموذج
    const formData = new FormData(form);
    const formObject = {};
    
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    
    // عرض رسالة التحميل
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
    submitBtn.disabled = true;
    
    // محاكاة إرسال البيانات (في التطبيق الحقيقي، يتم استخدام fetch أو axios)
    setTimeout(() => {
        // إعادة تعيين الزر
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // معالجة النجاح
        handleFormSuccess(form, formObject);
    }, 2000);
}

/**
 * التحقق من صحة النموذج
 */
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            markFieldError(field, 'هذا الحقل مطلوب');
            isValid = false;
        } else {
            clearFieldError(field);
        }
        
        // تحقق إضافي حسب نوع الحقل
        switch (field.type) {
            case 'email':
                if (!isValidEmail(field.value)) {
                    markFieldError(field, 'البريد الإلكتروني غير صالح');
                    isValid = false;
                }
                break;
                
            case 'tel':
                if (!isValidPhone(field.value)) {
                    markFieldError(field, 'رقم الهاتف غير صالح');
                    isValid = false;
                }
                break;
                
            case 'number':
                if (field.min && parseFloat(field.value) < parseFloat(field.min)) {
                    markFieldError(field, `القيمة يجب أن تكون ${field.min} أو أكثر`);
                    isValid = false;
                }
                if (field.max && parseFloat(field.value) > parseFloat(field.max)) {
                    markFieldError(field, `القيمة يجب أن تكون ${field.max} أو أقل`);
                    isValid = false;
                }
                break;
        }
    });
    
    // التحقق من تطابق كلمات المرور
    const password = form.querySelector('#password');
    const confirmPassword = form.querySelector('#confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        markFieldError(confirmPassword, 'كلمات المرور غير متطابقة');
        isValid = false;
    }
    
    return isValid;
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * التحقق من صحة رقم الهاتف
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
    return phoneRegex.test(phone);
}

/**
 * تعليم حقل به خطأ
 */
function markFieldError(field, message) {
    const fieldContainer = field.closest('.form-group');
    if (fieldContainer) {
        fieldContainer.classList.add('error');
        
        // إزالة رسالة الخطأ القديمة إذا كانت موجودة
        const oldError = fieldContainer.querySelector('.error-message');
        if (oldError) oldError.remove();
        
        // إضافة رسالة الخطأ الجديدة
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        fieldContainer.appendChild(errorMessage);
    }
}

/**
 * مسح رسالة الخطأ من الحقل
 */
function clearFieldError(field) {
    const fieldContainer = field.closest('.form-group');
    if (fieldContainer) {
        fieldContainer.classList.remove('error');
        const errorMessage = fieldContainer.querySelector('.error-message');
        if (errorMessage) errorMessage.remove();
    }
}

/**
 * معالجة نجاح إرسال النموذج
 */
function handleFormSuccess(form, formData) {
    // حسب نوع النموذج
    const formId = form.id || form.className;
    
    switch (formId) {
        case 'login-form':
            handleLoginSuccess(formData);
            break;
            
        case 'registration-form':
            handleRegistrationSuccess(formData);
            break;
            
        case 'ship-form':
            handleShipRegistrationSuccess(formData);
            break;
            
        default:
            showToast('تم حفظ البيانات بنجاح', 'success');
            form.reset();
    }
}

/**
 * معالجة تسجيل الدخول الناجح
 */
function handleLoginSuccess(loginData) {
    // حفظ بيانات جلسة المستخدم
    sessionStorage.setItem('userLoggedIn', 'true');
    sessionStorage.setItem('userRole', loginData.userType || 'employee');
    sessionStorage.setItem('userName', 'أحمد محمد'); // افتراضي
    
    showToast('تم تسجيل الدخول بنجاح', 'success');
    
    // التوجيه حسب نوع المستخدم
    setTimeout(() => {
        if (loginData.userType === 'admin') {
            window.location.href = 'pages/admin-dashboard.html';
        } else if (loginData.userType === 'ship-owner') {
            window.location.href = 'pages/ship-owner-dashboard.html';
        } else {
            window.location.href = 'pages/branch-employee-dashboard.html';
        }
    }, 1500);
}

/**
 * معالجة تسجيل مستخدم جديد
 */
function handleRegistrationSuccess(registrationData) {
    showToast('تم إنشاء الحساب بنجاح، يمكنك الآن تسجيل الدخول', 'success');
    
    setTimeout(() => {
        window.location.href = 'ship-owner-login.html';
    }, 2000);
}

/**
 * معالجة تسجيل سفينة جديدة
 */
function handleShipRegistrationSuccess(shipData) {
    // توليد رقم طلب عشوائي
    const requestId = 'SHIP-' + new Date().getFullYear() + '-' + 
        Math.random().toString(36).substr(2, 9).toUpperCase();
    
    showToast(`تم تقديم طلب تسجيل السفينة بنجاح. رقم الطلب: ${requestId}`, 'success');
    
    // حفظ بيانات الطلب مؤقتاً
    shipData.requestId = requestId;
    shipData.status = 'pending';
    shipData.submissionDate = new Date().toISOString();
    
    localStorage.setItem(requestId, JSON.stringify(shipData));
    
    // توجيه لصفحة الطباعة
    setTimeout(() => {
        window.location.href = `pages/print-application.html?id=${requestId}`;
    }, 2000);
}

/**
 * تسجيل الخروج
 */
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        // مسح بيانات الجلسة
        sessionStorage.removeItem('userLoggedIn');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userName');
        
        showToast('تم تسجيل الخروج بنجاح', 'info');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }
}

/**
 * عرض رسالة عائمة
 */
function showToast(message, type = 'info') {
    // إنصراف إذا كان هناك رسالة حالية
    const existingToast = document.getElementById('global-toast');
    if (existingToast) existingToast.remove();
    
    // إنشاء الرسالة الجديدة
    const toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة للصفحة
    document.body.appendChild(toast);
    
    // إظهار الرسالة
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // إخفاء تلقائي بعد 5 ثواني
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

/**
 * الحصول على الأيقونة المناسبة للرسالة
 */
function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

/**
 * فتح نموذج (modal)
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * إغلاق نموذج
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * تنزيل ملف
 */
function downloadFile(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * طباعة مستند
 */
function printDocument(elementId = 'printable-area') {
    const printContent = document.getElementById(elementId);
    if (!printContent) {
        showToast('لم يتم العثور على محتوى للطباعة', 'error');
        return;
    }
    
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
}

/**
 * نسخ النص للحافظة
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('تم نسخ النص', 'success');
    }).catch(err => {
        console.error('فشل النسخ: ', err);
        showToast('فشل نسخ النص', 'error');
    });
}

/**
 * تنسيق التاريخ العربي
 */
function formatArabicDate(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('ar-YE', options);
}

/**
 * حساب الفرق بين تاريخين
 */
function dateDifference(date1, date2) {
    const diffTime = Math.abs(new Date(date2) - new Date(date1));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * توليد رقم عشوائي
 */
function generateRandomId(prefix = 'ID') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}-${timestamp}-${random}`;
}

// تصدير الدوال للاستخدام العالمي
window.validateForm = validateForm;
window.showToast = showToast;
window.logout = logout;
window.openModal = openModal;
window.closeModal = closeModal;
window.printDocument = printDocument;
window.copyToClipboard = copyToClipboard;