/**
 * نظام إدارة تحميل المستندات لنظام تسجيل السفن
 */

class DocumentUploadManager {
    constructor(options = {}) {
        this.options = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/jpg',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            maxFiles: 10,
            uploadEndpoint: '/api/upload',
            ...options
        };
        
        this.uploadQueue = [];
        this.isUploading = false;
        this.uploadedFiles = new Map();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSavedDocuments();
    }
    
    bindEvents() {
        // رفع ملفات متعددة
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[type="file"][multiple]')) {
                this.handleMultipleFiles(e.target);
            } else if (e.target.matches('input[type="file"]')) {
                this.handleSingleFile(e.target);
            }
        });
        
        // سحب وإفلات الملفات
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
        });
        
        // أزرار حذف الملفات
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-file')) {
                const fileId = e.target.closest('.delete-file').dataset.fileId;
                this.deleteFile(fileId);
            }
        });
    }
    
    handleMultipleFiles(input) {
        const files = Array.from(input.files);
        this.validateAndQueueFiles(files, input);
    }
    
    handleSingleFile(input) {
        const file = input.files[0];
        if (file) {
            this.validateAndQueueFiles([file], input);
        }
    }
    
    validateAndQueueFiles(files, input) {
        const validFiles = [];
        const errors = [];
        
        files.forEach((file, index) => {
            // التحقق من حجم الملف
            if (file.size > this.options.maxFileSize) {
                errors.push(`الملف "${file.name}" يتجاوز الحجم المسموح (10MB)`);
                return;
            }
            
            // التحقق من نوع الملف
            if (!this.options.allowedTypes.includes(file.type)) {
                errors.push(`نوع الملف "${file.name}" غير مدعوم`);
                return;
            }
            
            // التحقق من عدد الملفات
            if (this.uploadedFiles.size + validFiles.length >= this.options.maxFiles) {
                errors.push(`تم الوصول إلى الحد الأقصى للملفات (${this.options.maxFiles})`);
                return;
            }
            
            validFiles.push(file);
        });
        
        // عرض الأخطاء إن وجدت
        if (errors.length > 0) {
            this.showUploadErrors(errors);
            input.value = ''; // إعادة تعيين حقل الرفع
        }
        
        // إضافة الملفات الصالحة للقائمة
        if (validFiles.length > 0) {
            this.addFilesToQueue(validFiles, input);
        }
    }
    
    addFilesToQueue(files, input) {
        const fileListId = input.dataset.fileList || 'uploaded-files-list';
        const fileList = document.getElementById(fileListId);
        
        files.forEach(file => {
            const fileId = this.generateFileId();
            const fileItem = this.createFileItem(file, fileId);
            
            // إضافة للقائمة
            if (fileList) {
                fileList.appendChild(fileItem);
            }
            
            // إضافة للقائمة الانتظار
            this.uploadQueue.push({
                id: fileId,
                file: file,
                input: input,
                status: 'pending'
            });
            
            // حفظ مؤقتاً
            this.uploadedFiles.set(fileId, {
                file: file,
                status: 'pending',
                progress: 0
            });
            
            // تحديث حالة المستند
            this.updateDocumentStatus(input, file.name);
        });
        
        // بدء التحميل
        this.processUploadQueue();
    }
    
    createFileItem(file, fileId) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.dataset.fileId = fileId;
        
        const fileTypeIcon = this.getFileTypeIcon(file.type);
        const fileSize = this.formatFileSize(file.size);
        
        item.innerHTML = `
            <div class="file-info">
                <div class="file-icon">${fileTypeIcon}</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
            </div>
            <div class="file-actions">
                <div class="upload-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <span class="progress-text">0%</span>
                </div>
                <button class="delete-file" data-file-id="${fileId}" title="حذف الملف">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        return item;
    }
    
    getFileTypeIcon(fileType) {
        const icons = {
            'application/pdf': '<i class="fas fa-file-pdf pdf-icon"></i>',
            'image/jpeg': '<i class="fas fa-file-image image-icon"></i>',
            'image/png': '<i class="fas fa-file-image image-icon"></i>',
            'image/jpg': '<i class="fas fa-file-image image-icon"></i>',
            'application/msword': '<i class="fas fa-file-word word-icon"></i>',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '<i class="fas fa-file-word word-icon"></i>',
            'default': '<i class="fas fa-file"></i>'
        };
        
        return icons[fileType] || icons.default;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 بايت';
        
        const k = 1024;
        const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    generateFileId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    async processUploadQueue() {
        if (this.isUploading || this.uploadQueue.length === 0) return;
        
        this.isUploading = true;
        
        while (this.uploadQueue.length > 0) {
            const item = this.uploadQueue.shift();
            await this.uploadFile(item);
        }
        
        this.isUploading = false;
    }
    
    async uploadFile(item) {
        const { id, file, input } = item;
        
        // تحديث الحالة لجاري التحميل
        this.updateFileStatus(id, 'uploading', 0);
        
        try {
            // في التطبيق الحقيقي، يتم استخدام fetch أو axios
            // هذه محاكاة للتحميل
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', input.name);
            formData.append('fileId', id);
            
            // محاكاة التقدم
            for (let progress = 10; progress <= 100; progress += 10) {
                await this.delay(200);
                this.updateFileStatus(id, 'uploading', progress);
            }
            
            // محاكاة النجاح
            await this.delay(500);
            this.updateFileStatus(id, 'completed', 100);
            
            // حفظ في localStorage (مؤقت)
            this.saveFileLocally(id, file, input);
            
            showToast(`تم تحميل الملف "${file.name}" بنجاح`, 'success');
            
        } catch (error) {
            console.error('خطأ في تحميل الملف:', error);
            this.updateFileStatus(id, 'failed', 0);
            showToast(`فشل تحميل الملف "${file.name}"`, 'error');
        }
    }
    
    updateFileStatus(fileId, status, progress) {
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (!fileItem) return;
        
        const progressBar = fileItem.querySelector('.progress-fill');
        const progressText = fileItem.querySelector('.progress-text');
        
        if (progressBar && progressText) {
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }
        
        // تحديث حالة العنصر
        fileItem.dataset.status = status;
        
        // تحديث البيانات المحلية
        const fileData = this.uploadedFiles.get(fileId);
        if (fileData) {
            fileData.status = status;
            fileData.progress = progress;
            this.uploadedFiles.set(fileId, fileData);
        }
        
        // إخفاء شريط التقدم عند اكتمال التحميل
        if (status === 'completed' || status === 'failed') {
            setTimeout(() => {
                const progressContainer = fileItem.querySelector('.upload-progress');
                if (progressContainer) {
                    progressContainer.style.opacity = '0';
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                    }, 300);
                }
            }, 1000);
        }
    }
    
    deleteFile(fileId) {
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (!fileItem || !confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
        
        // حذف من الذاكرة المحلية
        this.uploadedFiles.delete(fileId);
        
        // حذف من localStorage
        localStorage.removeItem(`document_${fileId}`);
        
        // حذف من القائمة
        fileItem.style.transform = 'translateX(100%)';
        fileItem.style.opacity = '0';
        
        setTimeout(() => {
            fileItem.remove();
            showToast('تم حذف الملف', 'info');
        }, 300);
        
        // تحديث حالة المستند
        this.updateDocumentStatusAfterDelete();
    }
    
    updateDocumentStatus(input, fileName) {
        const statusElement = document.querySelector(`[data-document="${input.name}"]`);
        if (statusElement) {
            statusElement.classList.remove('not-uploaded');
            statusElement.classList.add('uploaded');
            statusElement.innerHTML = `<i class="fas fa-check-circle"></i> ${fileName}`;
        }
    }
    
    updateDocumentStatusAfterDelete() {
        // تحديث حالة جميع المستندات
        const statusElements = document.querySelectorAll('[data-document]');
        statusElements.forEach(element => {
            const documentName = element.dataset.document;
            const fileInput = document.querySelector(`input[name="${documentName}"]`);
            
            if (fileInput && fileInput.files.length === 0) {
                element.classList.remove('uploaded');
                element.classList.add('not-uploaded');
                element.innerHTML = '<i class="fas fa-times-circle"></i> غير مرفوع';
            }
        });
    }
    
    saveFileLocally(fileId, file, input) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                uploadedAt: new Date().toISOString(),
                documentType: input.name
            };
            
            localStorage.setItem(`document_${fileId}`, JSON.stringify(fileData));
        };
        
        reader.readAsDataURL(file);
    }
    
    loadSavedDocuments() {
        // تحميل المستندات المحفوظة
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('document_')) {
                try {
                    const fileData = JSON.parse(localStorage.getItem(key));
                    this.displaySavedDocument(key.replace('document_', ''), fileData);
                } catch (error) {
                    console.error('خطأ في تحميل الملف المحفوظ:', error);
                }
            }
        }
    }
    
    displaySavedDocument(fileId, fileData) {
        const fileList = document.getElementById('uploaded-files-list');
        if (!fileList) return;
        
        // إنشاء عنصر الملف
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item uploaded';
        fileItem.dataset.fileId = fileId;
        
        const fileTypeIcon = this.getFileTypeIcon(fileData.type);
        const fileSize = this.formatFileSize(fileData.size);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">${fileTypeIcon}</div>
                <div class="file-details">
                    <div class="file-name">${fileData.name}</div>
                    <div class="file-size">${fileSize}</div>
                    <div class="upload-time">${new Date(fileData.uploadedAt).toLocaleString('ar-YE')}</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="view-file" data-file-id="${fileId}" title="معاينة الملف">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="download-file" data-file-id="${fileId}" title="تنزيل الملف">
                    <i class="fas fa-download"></i>
                </button>
                <button class="delete-file" data-file-id="${fileId}" title="حذف الملف">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        fileList.appendChild(fileItem);
        
        // إضافة للملفات المحملة
        this.uploadedFiles.set(fileId, {
            status: 'completed',
            progress: 100
        });
        
        // تحديث حالة المستند
        const statusElement = document.querySelector(`[data-document="${fileData.documentType}"]`);
        if (statusElement) {
            statusElement.classList.remove('not-uploaded');
            statusElement.classList.add('uploaded');
            statusElement.innerHTML = `<i class="fas fa-check-circle"></i> ${fileData.name}`;
        }
    }
    
    // دعم سحب وإفلات الملفات
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.target.closest('.drop-zone').classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.target.closest('.drop-zone').classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = e.target.closest('.drop-zone');
        dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        const fileInput = dropZone.querySelector('input[type="file"]');
        
        if (fileInput && files.length > 0) {
            fileInput.files = files;
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    }
    
    showUploadErrors(errors) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'upload-errors';
        
        errors.forEach(error => {
            const errorItem = document.createElement('div');
            errorItem.className = 'upload-error';
            errorItem.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error}`;
            errorContainer.appendChild(errorItem);
        });
        
        // إضافة للصفحة
        document.body.appendChild(errorContainer);
        
        // إزالة بعد 5 ثواني
        setTimeout(() => {
            errorContainer.classList.add('fade-out');
            setTimeout(() => {
                errorContainer.remove();
            }, 300);
        }, 5000);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // الحصول على جميع الملفات المحملة
    getAllUploadedFiles() {
        return Array.from(this.uploadedFiles.entries()).map(([id, data]) => ({
            id,
            ...data
        }));
    }
    
    // مسح جميع الملفات
    clearAllFiles() {
        if (this.uploadedFiles.size === 0) return;
        
        if (confirm(`هل أنت متأكد من حذف جميع الملفات (${this.uploadedFiles.size} ملف)؟`)) {
            // حذف من localStorage
            this.uploadedFiles.forEach((data, id) => {
                localStorage.removeItem(`document_${id}`);
            });
            
            // حذف من الذاكرة
            this.uploadedFiles.clear();
            
            // حذف من واجهة المستخدم
            const fileItems = document.querySelectorAll('.file-item');
            fileItems.forEach(item => {
                item.style.transform = 'translateX(100%)';
                item.style.opacity = '0';
                setTimeout(() => item.remove(), 300);
            });
            
            // إعادة تعيين حالة المستندات
            const statusElements = document.querySelectorAll('[data-document]');
            statusElements.forEach(element => {
                element.classList.remove('uploaded');
                element.classList.add('not-uploaded');
                element.innerHTML = '<i class="fas fa-times-circle"></i> غير مرفوع';
            });
            
            showToast('تم حذف جميع الملفات', 'info');
        }
    }
}

// تصدير المدير
window.DocumentUploadManager = DocumentUploadManager;

// تهيئة تلقائية
document.addEventListener('DOMContentLoaded', function() {
    // إنشاء مدير تحميل المستندات
    window.documentsManager = new DocumentUploadManager();
    
    // إضافة أزرار معاينة وتنزيل الملفات
    addFileActionHandlers();
});

function addFileActionHandlers() {
    document.addEventListener('click', function(e) {
        // معاينة الملف
        if (e.target.closest('.view-file')) {
            const fileId = e.target.closest('.view-file').dataset.fileId;
            previewFile(fileId);
        }
        
        // تنزيل الملف
        if (e.target.closest('.download-file')) {
            const fileId = e.target.closest('.download-file').dataset.fileId;
            downloadFile(fileId);
        }
    });
}

function previewFile(fileId) {
    const fileData = localStorage.getItem(`document_${fileId}`);
    if (!fileData) {
        showToast('الملف غير موجود', 'error');
        return;
    }
    
    try {
        const data = JSON.parse(fileData);
        
        // إنشاء نافذة معاينة
        const previewModal = document.createElement('div');
        previewModal.className = 'file-preview-modal';
        previewModal.innerHTML = `
            <div class="preview-modal-content">
                <div class="preview-modal-header">
                    <h3>معاينة الملف: ${data.name}</h3>
                    <button class="close-preview">&times;</button>
                </div>
                <div class="preview-modal-body">
                    ${getFilePreviewHTML(data)}
                </div>
                <div class="preview-modal-footer">
                    <button class="btn-download" onclick="downloadFile('${fileId}')">
                        <i class="fas fa-download"></i> تنزيل
                    </button>
                    <button class="btn-close-preview">إغلاق</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(previewModal);
        
        // إضافة أحداث الإغلاق
        const closeBtns = previewModal.querySelectorAll('.close-preview, .btn-close-preview');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                previewModal.classList.add('fade-out');
                setTimeout(() => previewModal.remove(), 300);
            });
        });
        
        // إغلاق بالنقر خارج المحتوى
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.classList.add('fade-out');
                setTimeout(() => previewModal.remove(), 300);
            }
        });
        
    } catch (error) {
        console.error('خطأ في معاينة الملف:', error);
        showToast('لا يمكن معاينة هذا الملف', 'error');
    }
}

function getFilePreviewHTML(fileData) {
    const { type, data, name } = fileData;
    
    if (type.startsWith('image/')) {
        return `<img src="${data}" alt="${name}" class="file-preview-image">`;
    } else if (type === 'application/pdf') {
        return `
            <div class="pdf-preview">
                <iframe src="${data}" class="pdf-viewer"></iframe>
                <div class="pdf-alternative">
                    <p>إذا لم يعرض PDF، يمكنك <a href="${data}" download="${name}">تنزيل الملف</a></p>
                </div>
            </div>
        `;
    } else if (type.includes('word') || type.includes('document')) {
        return `
            <div class="document-preview">
                <div class="document-icon">
                    <i class="fas fa-file-word fa-5x"></i>
                </div>
                <p>للمعاينة الكاملة، يرجى تنزيل الملف وفتحه في برنامج Microsoft Word</p>
                <p><strong>اسم الملف:</strong> ${name}</p>
                <p><strong>الحجم:</strong> ${formatFileSize(fileData.size)}</p>
            </div>
        `;
    } else {
        return `
            <div class="generic-preview">
                <div class="file-icon-large">
                    <i class="fas fa-file fa-5x"></i>
                </div>
                <p>لا تتوفر معاينة لهذا النوع من الملفات</p>
                <p><strong>اسم الملف:</strong> ${name}</p>
                <p><strong>النوع:</strong> ${type}</p>
                <p><strong>الحجم:</strong> ${formatFileSize(fileData.size)}</p>
            </div>
        `;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadFile(fileId) {
    const fileData = localStorage.getItem(`document_${fileId}`);
    if (!fileData) {
        showToast('الملف غير موجود', 'error');
        return;
    }
    
    try {
        const data = JSON.parse(fileData);
        const link = document.createElement('a');
        link.href = data.data;
        link.download = data.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast(`جاري تنزيل الملف: ${data.name}`, 'success');
    } catch (error) {
        console.error('خطأ في تنزيل الملف:', error);
        showToast('فشل تنزيل الملف', 'error');
    }
}

// دالة مساعدة للحصول على قاعدة بيانات المستندات
function getDocumentRequirements() {
    return {
        'national_id': {
            name: 'الهوية الوطنية',
            required: true,
            description: 'صورة واضحة من الجهتين',
            allowedTypes: ['image/jpeg', 'image/png'],
            maxSize: '2MB'
        },
        'commercial_register': {
            name: 'السجل التجاري',
            required: true,
            description: 'ساري المفعول',
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
            maxSize: '5MB'
        },
        'tax_card': {
            name: 'البطاقة الضريبية',
            required: true,
            description: 'سارية المفعول',
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
            maxSize: '5MB'
        },
        'ship_certificate': {
            name: 'شهادة تسجيل السفينة',
            required: true,
            description: 'أصلية أو موثقة',
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
            maxSize: '10MB'
        },
        'safety_certificate': {
            name: 'شهادة السلامة',
            required: true,
            description: 'سارية المفعول',
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
            maxSize: '10MB'
        },
        'insurance_certificate': {
            name: 'شهادة التأمين',
            required: true,
            description: 'سارية المفعول',
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
            maxSize: '5MB'
        },
        'crew_list': {
            name: 'قائمة الطاقم',
            required: true,
            description: 'محدثة ومصدقة',
            allowedTypes: ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            maxSize: '5MB'
        }
    };
}