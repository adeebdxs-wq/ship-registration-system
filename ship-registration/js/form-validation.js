/**
 * نظام التحقق من صحة النماذج لنظام تسجيل السفن
 */

class FormValidator {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.options = {
            realTimeValidation: true,
            showErrors: true,
            scrollToError: true,
            ...options
        };
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        // إضافة أحداث التحقق
        if (this.options.realTimeValidation) {
            this.addRealTimeValidation();
        }
        
        // إضافة حدث الإرسال
        this.form.addEventListener('submit', (e) => {
            if (!this.validateAll()) {
                e.preventDefault();
                this.showFormErrors();
            }
        });
    }
    
    addRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // التحقق عند فقدان التركيز
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            // التحقق أثناء الكتابة (لحقول معينة)
            if (input.type === 'email' || input.type === 'password') {
                input.addEventListener('input', () => {
                    this.validateField(input);
                });
            }
        });
    }
    
    validateAll() {
        let isValid = true;
        const fields = this.form.querySelectorAll('[data-validation]');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const rules = field.dataset.validation ? field.dataset.validation.split('|') : [];
        let isValid = true;
        let errorMessage = '';
        
        // التحقق من الحقول المطلوبة
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = field.dataset.requiredMessage || 'هذا الحقل مطلوب';
        }
        
        // تطبيق القواعد المخصصة
        rules.forEach(rule => {
            const [ruleName, ruleValue] = rule.split(':');
            
            switch (ruleName) {
                case 'email':
                    if (!this.isValidEmail(field.value)) {
                        isValid = false;
                        errorMessage = 'البريد الإلكتروني غير صالح';
                    }
                    break;
                    
                case 'phone':
                    if (!this.isValidPhone(field.value)) {
                        isValid = false;
                        errorMessage = 'رقم الهاتف غير صالح';
                    }
                    break;
                    
                case 'min':
                    if (parseInt(field.value) < parseInt(ruleValue)) {
                        isValid = false;
                        errorMessage = `القيمة يجب أن تكون ${ruleValue} أو أكثر`;
                    }
                    break;
                    
                case 'max':
                    if (parseInt(field.value) > parseInt(ruleValue)) {
                        isValid = false;
                        errorMessage = `القيمة يجب أن تكون ${ruleValue} أو أقل`;
                    }
                    break;
                    
                case 'minlength':
                    if (field.value.length < parseInt(ruleValue)) {
                        isValid = false;
                        errorMessage = `الحد الأدنى للأحرف: ${ruleValue}`;
                    }
                    break;
                    
                case 'maxlength':
                    if (field.value.length > parseInt(ruleValue)) {
                        isValid = false;
                        errorMessage = `الحد الأقصى للأحرف: ${ruleValue}`;
                    }
                    break;
                    
                case 'numeric':
                    if (!/^\d+$/.test(field.value)) {
                        isValid = false;
                        errorMessage = 'يجب إدخال أرقام فقط';
                    }
                    break;
                    
                case 'alpha':
                    if (!/^[ء-ي\s]+$/.test(field.value)) {
                        isValid = false;
                        errorMessage = 'يجب إدخال أحرف عربية فقط';
                    }
                    break;
                    
                case 'alphanumeric':
                    if (!/^[ء-ي0-9\s]+$/.test(field.value)) {
                        isValid = false;
                        errorMessage = 'يجب إدخال أحرف عربية وأرقام فقط';
                    }
                    break;
                    
                case 'regex':
                    const regex = new RegExp(ruleValue);
                    if (!regex.test(field.value)) {
                        isValid = false;
                        errorMessage = 'التنسيق غير صحيح';
                    }
                    break;
            }
        });
        
        // التحقق من IMO الخاص بالسفن
        if (field.name === 'imo_number' && field.value) {
            if (!this.isValidIMO(field.value)) {
                isValid = false;
                errorMessage = 'رقم IMO غير صالح';
            }
        }
        
        // التحقق من التواريخ
        if (field.type === 'date' && field.value) {
            if (!this.isValidDate(field.value)) {
                isValid = false;
                errorMessage = 'التاريخ غير صالح';
            }
        }
        
        // عرض أو إخفاء الخطأ
        this.setFieldError(field, isValid, errorMessage);
        
        return isValid;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
        return phoneRegex.test(phone);
    }
    
    isValidIMO(imo) {
        // رقم IMO يجب أن يكون 7 أرقام
        const imoRegex = /^\d{7}$/;
        return imoRegex.test(imo);
    }
    
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
    
    setFieldError(field, isValid, message = '') {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        // إزالة رسائل الخطأ السابقة
        const existingError = formGroup.querySelector('.validation-error');
        if (existingError) existingError.remove();
        
        // إزالة حالة الخطأ السابقة
        formGroup.classList.remove('has-error');
        formGroup.classList.remove('has-success');
        
        if (!isValid) {
            // إضافة حالة خطأ
            formGroup.classList.add('has-error');
            
            // إضافة رسالة الخطأ
            if (this.options.showErrors && message) {
                const errorElement = document.createElement('div');
                errorElement.className = 'validation-error';
                errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
                formGroup.appendChild(errorElement);
            }
            
            // التمرير للخطأ
            if (this.options.scrollToError) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            // إضافة حالة نجاح
            formGroup.classList.add('has-success');
        }
    }
    
    showFormErrors() {
        const firstErrorField = this.form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstErrorField) {
            firstErrorField.focus();
            showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
        }
    }
    
    resetValidation() {
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('has-error');
            group.classList.remove('has-success');
            const errors = group.querySelectorAll('.validation-error');
            errors.forEach(error => error.remove());
        });
    }
}

// دوال التحقق المساعدة
const ValidationHelpers = {
    // التحقق من رقم الهوية
    validateNationalId: function(id) {
        if (!id || id.length !== 9) return false;
        
        // خوارزمية التحقق من رقم الهوية (مثال)
        const weights = [2, 1, 2, 1, 2, 1, 2, 1];
        let sum = 0;
        
        for (let i = 0; i < 8; i++) {
            let digit = parseInt(id.charAt(i)) * weights[i];
            if (digit > 9) digit = digit - 9;
            sum += digit;
        }
        
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit === parseInt(id.charAt(8));
    },
    
    // التحقق من رقم الرخصة
    validateLicenseNumber: function(license) {
        const licenseRegex = /^[A-Z0-9]{6,12}$/;
        return licenseRegex.test(license);
    },
    
    // التحقق من رقم السفينة
    validateShipNumber: function(shipNumber) {
        const shipRegex = /^[A-Z]{2,4}\d{4,8}$/;
        return shipRegex.test(shipNumber);
    },
    
    // التحقق من حجم السفينة
    validateShipTonnage: function(tonnage) {
        const ton = parseFloat(tonnage);
        return !isNaN(ton) && ton > 0 && ton <= 500000;
    },
    
    // التحقق من عدد الطاقم
    validateCrewCount: function(count) {
        const crew = parseInt(count);
        return !isNaN(crew) && crew > 0 && crew <= 1000;
    },
    
    // التحقق من تاريخ الصلاحية
    validateExpiryDate: function(dateString) {
        const expiryDate = new Date(dateString);
        const today = new Date();
        return expiryDate > today;
    }
};

// تصدير للاستخدام العام
window.FormValidator = FormValidator;
window.ValidationHelpers = ValidationHelpers;

// تهيئة تلقائية للأشكال
document.addEventListener('DOMContentLoaded', function() {
    // العثور على جميع النماذج التي تحتاج تحقق
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        const formId = form.id || `form-${Math.random().toString(36).substr(2, 9)}`;
        if (!form.id) form.id = formId;
        
        new FormValidator(formId, {
            realTimeValidation: true,
            scrollToError: true
        });
    });
    
    // إضافة أحداث التحقق الخاصة ببعض الحقول
    addCustomValidationEvents();
});

function addCustomValidationEvents() {
    // التحقق من تطابق كلمات المرور
    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
        const confirmField = document.querySelector(`input[name="${field.name}_confirmation"]`);
        
        if (confirmField) {
            confirmField.addEventListener('input', function() {
                validatePasswordMatch(field, this);
            });
        }
    });
    
    // التحقق من رقم IMO
    const imoFields = document.querySelectorAll('input[name="imo_number"]');
    imoFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateIMO(this);
        });
    });
    
    // التحقق من التواريخ
    const dateFields = document.querySelectorAll('input[type="date"]');
    dateFields.forEach(field => {
        field.addEventListener('change', function() {
            validateDate(this);
        });
    });
}

function validatePasswordMatch(passwordField, confirmField) {
    const formGroup = confirmField.closest('.form-group');
    
    if (passwordField.value !== confirmField.value) {
        showFieldError(confirmField, 'كلمات المرور غير متطابقة');
    } else {
        clearFieldError(confirmField);
    }
}

function validateIMO(field) {
    const value = field.value.trim();
    
    if (value && !/^\d{7}$/.test(value)) {
        showFieldError(field, 'رقم IMO يجب أن يكون 7 أرقام');
    } else {
        clearFieldError(field);
    }
}

function validateDate(field) {
    const value = field.value;
    
    if (value) {
        const date = new Date(value);
        const today = new Date();
        
        if (isNaN(date.getTime())) {
            showFieldError(field, 'التاريخ غير صالح');
        } else if (field.dataset.futureOnly === 'true' && date <= today) {
            showFieldError(field, 'يجب أن يكون تاريخ مستقبلي');
        } else if (field.dataset.pastOnly === 'true' && date >= today) {
            showFieldError(field, 'يجب أن يكون تاريخ ماضي');
        } else {
            clearFieldError(field);
        }
    }
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('has-error');
    
    // إزالة رسالة الخطأ القديمة
    const oldError = formGroup.querySelector('.field-error');
    if (oldError) oldError.remove();
    
    // إضافة رسالة الخطأ الجديدة
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    formGroup.appendChild(errorElement);
    
    // إضافة نمط للحقل
    field.style.borderColor = '#f44336';
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove('has-error');
    
    // إزالة رسالة الخطأ
    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) errorElement.remove();
    
    // إعادة تعيين نمط الحقل
    field.style.borderColor = '';
}