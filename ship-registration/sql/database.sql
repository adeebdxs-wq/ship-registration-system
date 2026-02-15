-- ========================================
-- نظام تسجيل السفن الإلكتروني
-- قاعدة البيانات - الهيئة العامة للشئون البحرية
-- الإصدار: 1.0 (نسخة تجريبية)
-- ========================================

-- ========================================
-- 1. تمكين الامتدادات الضرورية
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 2. أنواع البيانات المخصصة (ENUMs)
-- ========================================

-- أدوار المستخدمين
CREATE TYPE user_role AS ENUM (
    'admin',                -- مسؤول النظام
    'branch_employee',      -- موظف فرع
    'ship_owner'            -- مالك سفينة
);

-- حالة المستخدم
CREATE TYPE user_status AS ENUM (
    'active',               -- نشط
    'inactive',             -- غير نشط
    'suspended',            -- موقوف
    'pending_verification'  -- بانتظار التحقق
);

-- حالة السفينة
CREATE TYPE ship_status AS ENUM (
    'active',               -- نشط
    'pending',              -- قيد المراجعة
    'expired',              -- منتهي
    'suspended',            -- موقوف
    'deleted'               -- محذوف
);

-- نوع السفينة
CREATE TYPE ship_type AS ENUM (
    'cargo',                -- سفينة شحن
    'tanker',               -- ناقلة نفط
    'container',            -- سفينة حاويات
    'passenger',            -- سفينة ركاب
    'fishing',              -- سفينة صيد
    'yacht',                -- يخت
    'tug',                  -- قاطرة
    'dredger',              -- كراكة
    'research',             -- سفينة أبحاث
    'supply',               -- سفينة إمداد
    'other'                 -- أخرى
);

-- حالة الطلب
CREATE TYPE application_status AS ENUM (
    'draft',                    -- مسودة
    'pending',                  -- قيد المراجعة
    'reviewing',                -- جاري المعالجة
    'approved',                 -- مقبول
    'rejected',                 -- مرفوض
    'rejected_by_employee',     -- مرفوض من موظف
    'ready_for_employee',       -- جاهز للموظف (بعد تعديل المسؤول)
    'certificate_issued',       -- تم إصدار الشهادة
    'completed',                -- مكتمل
    'cancelled'                 -- ملغي
);

-- نوع الطلب
CREATE TYPE application_type AS ENUM (
    'new',                      -- تسجيل جديد
    'renewal',                  -- تجديد
    'transfer',                 -- نقل ملكية
    'amendment',                -- تعديل بيانات
    'cancellation'              -- إلغاء تسجيل
);

-- نوع الشهادة
CREATE TYPE certificate_type AS ENUM (
    'registration',             -- شهادة تسجيل
    'provisional',              -- شهادة مؤقتة
    'safety',                   -- شهادة سلامة
    'seaworthiness',            -- شهادة صلاحية للإبحار
    'insurance',                -- وثيقة تأمين
    'inspection'                -- شهادة فحص
);

-- حالة الشهادة
CREATE TYPE certificate_status AS ENUM (
    'active',                   -- نشط
    'expired',                  -- منتهي
    'revoked',                  -- ملغي
    'suspended'                 -- موقوف
);

-- حالة الدفع
CREATE TYPE payment_status AS ENUM (
    'pending',                  -- بانتظار الدفع
    'pending_review',           -- بانتظار مراجعة سند الدفع
    'paid',                     -- تم الدفع
    'partial',                  -- دفع جزئي
    'refunded',                 -- مسترد
    'cancelled'                 -- ملغي
);

-- طريقة الدفع
CREATE TYPE payment_method AS ENUM (
    'cash',                     -- نقدي
    'bank_transfer',            -- تحويل بنكي
    'credit_card',              -- بطاقة ائتمان
    'check'                     -- شيك
);

-- نوع الوثيقة
CREATE TYPE document_type AS ENUM (
    'ownership',                -- وثيقة ملكية
    'national_id',              -- بطاقة هوية
    'commercial_registry',      -- سجل تجاري
    'tax_card',                 -- بطاقة ضريبية
    'inspection_report',        -- تقرير فحص
    'insurance_policy',         -- وثيقة تأمين
    'technical_specs',          -- المواصفات الفنية
    'previous_certificate',     -- شهادة سابقة
    'payment_receipt'           -- سند دفع
);

-- حالة التحقق من الوثيقة
CREATE TYPE verification_status AS ENUM (
    'pending',                  -- بانتظار التحقق
    'verified',                 -- موثق
    'rejected',                 -- مرفوض
    'expired'                   -- منتهي
);

-- نوع الإشعار
CREATE TYPE notification_type AS ENUM (
    'success',                  -- نجاح
    'error',                    -- خطأ
    'warning',                  -- تحذير
    'info',                     -- معلومات
    'reminder',                 -- تذكير
    'deadline'                  -- موعد نهائي
);

-- فروع الهيئة
CREATE TYPE branch_name AS ENUM (
    'main',                     -- المقر الرئيسي
    'aden',                     -- عدن
    'mukalla',                  -- المكلا
    'hodeidah',                 -- الحديدة
    'salif',                    -- الصليف
    'mocha',                    -- المخا
    'socotra'                   -- سقطرى
);

-- ========================================
-- 3. جدول المستخدمين
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'ship_owner',
    status user_status NOT NULL DEFAULT 'pending_verification',
    
    -- معلومات شخصية
    national_id VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    governorate VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- معلومات للشركات
    company_name VARCHAR(255),
    commercial_registration VARCHAR(50) UNIQUE,
    tax_number VARCHAR(50),
    
    -- معلومات للموظفين فقط
    branch branch_name,
    position VARCHAR(100),
    department VARCHAR(100),
    employee_id VARCHAR(50) UNIQUE,
    
    -- التواريخ
    email_verified_at TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- الصلاحيات والإعدادات
    permissions JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{"language": "ar", "notifications": true}',
    
    -- القيود
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^[0-9]{7,15}$'),
    CONSTRAINT valid_national_id CHECK (national_id IS NULL OR national_id ~* '^[0-9]{10}$')
);

-- ========================================
-- 4. جدول السفن
-- ========================================
CREATE TABLE ships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- المعلومات الأساسية
    ship_name_ar VARCHAR(255) NOT NULL,
    ship_name_en VARCHAR(255),
    imo_number VARCHAR(10) UNIQUE,
    registration_number VARCHAR(50) UNIQUE,
    call_sign VARCHAR(20),
    mmsi VARCHAR(9),
    
    -- التصنيف
    ship_type ship_type NOT NULL,
    ship_category VARCHAR(50),
    flag_state VARCHAR(50) DEFAULT 'اليمن',
    port_of_registry branch_name NOT NULL,
    port_of_origin VARCHAR(100),
    nationality VARCHAR(50) DEFAULT 'يمني',
    
    -- المواصفات الفنية
    gross_tonnage DECIMAL(10,2),
    net_tonnage DECIMAL(10,2),
    deadweight DECIMAL(10,2),
    length_overall DECIMAL(10,2),
    length DECIMAL(10,2),
    beam DECIMAL(10,2),
    width DECIMAL(10,2),
    depth DECIMAL(10,2),
    draft DECIMAL(10,2),
    speed DECIMAL(5,2),
    container_capacity INTEGER,
    passenger_capacity INTEGER,
    crew_capacity INTEGER,
    
    -- معلومات الصنع
    year_built INTEGER,
    builder_name VARCHAR(255),
    building_country VARCHAR(100),
    shipyard VARCHAR(255),
    hull_number VARCHAR(50),
    hull_material VARCHAR(50),
    
    -- التسجيل
    registration_date DATE,
    expiry_date DATE,
    last_renewal_date DATE,
    registration_authority VARCHAR(255) DEFAULT 'الهيئة العامة للشئون البحرية',
    registration_office VARCHAR(255),
    
    -- الحالة
    status ship_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    notes TEXT,
    
    -- التواريخ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- القيود
    CONSTRAINT valid_imo CHECK (imo_number IS NULL OR imo_number ~* '^[0-9]{7}$'),
    CONSTRAINT valid_mmsi CHECK (mmsi IS NULL OR mmsi ~* '^[0-9]{9}$'),
    CONSTRAINT valid_year CHECK (year_built IS NULL OR (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM CURRENT_DATE) + 1)),
    CONSTRAINT valid_tonnage CHECK (gross_tonnage IS NULL OR gross_tonnage > 0)
);

-- ========================================
-- 5. جدول محركات السفن
-- ========================================
CREATE TABLE ship_engines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ship_id UUID NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
    
    engine_number VARCHAR(50),
    engine_type VARCHAR(100),
    engine_manufacturer VARCHAR(255),
    engine_model VARCHAR(100),
    engine_power DECIMAL(10,2),
    engine_power_unit VARCHAR(20) DEFAULT 'حصان',
    engine_year INTEGER,
    cylinder_count INTEGER,
    fuel_type VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_engine_year CHECK (engine_year IS NULL OR engine_year >= 1900)
);

-- ========================================
-- 6. جدول الطلبات
-- ========================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- العلاقات
    owner_id UUID NOT NULL REFERENCES users(id),
    ship_id UUID REFERENCES ships(id),
    assigned_to UUID REFERENCES users(id),
    branch branch_name NOT NULL,
    
    -- معلومات الطلب
    application_type application_type NOT NULL,
    status application_status NOT NULL DEFAULT 'draft',
    submission_date DATE NOT NULL,
    
    -- الرفض والتعديل
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- تعديل المسؤول
    admin_modified_by UUID REFERENCES users(id),
    admin_modified_at TIMESTAMP,
    admin_notes TEXT,
    ready_for_employee_id UUID REFERENCES users(id),
    ready_for_employee_branch branch_name,
    
    -- الشهادة
    certificate_issued_at TIMESTAMP,
    certificate_issued_by UUID REFERENCES users(id),
    certificate_number VARCHAR(100),
    
    -- الإكمال
    completion_date DATE,
    completion_notes TEXT,
    
    -- التواريخ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- القيود
    CONSTRAINT valid_application_number CHECK (application_number ~* '^(REG|REN|TRF|AMD|CAN)-[0-9]{4}-[0-9]{4}$')
);

-- ========================================
-- 7. جدول مراجعات الطلبات
-- ========================================
CREATE TABLE application_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    
    status application_status NOT NULL,
    action_type VARCHAR(50),
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 8. جدول الشهادات
-- ========================================
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    
    -- العلاقات
    ship_id UUID NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id),
    issued_by UUID REFERENCES users(id),
    
    -- معلومات الشهادة
    certificate_type certificate_type NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    issuing_authority VARCHAR(255) NOT NULL,
    
    -- الحالة
    status certificate_status NOT NULL DEFAULT 'active',
    revocation_reason TEXT,
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES users(id),
    
    -- معلومات إضافية
    pdf_url TEXT,
    notes TEXT,
    
    -- التواريخ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_expiry CHECK (expiry_date IS NULL OR expiry_date > issue_date)
);

-- ========================================
-- 9. جدول المستندات
-- ========================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- العلاقات
    owner_id UUID NOT NULL REFERENCES users(id),
    ship_id UUID REFERENCES ships(id),
    application_id UUID REFERENCES applications(id),
    certificate_id UUID REFERENCES certificates(id),
    
    -- معلومات المستند
    document_type document_type NOT NULL,
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(255),
    
    -- الملف
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- التحقق
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- التواريخ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_file_size CHECK (file_size IS NULL OR file_size <= 10485760)
);

-- ========================================
-- 10. جدول المدفوعات
-- ========================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- العلاقات
    owner_id UUID NOT NULL REFERENCES users(id),
    application_id UUID REFERENCES applications(id),
    processed_by UUID REFERENCES users(id),
    
    -- معلومات الدفع
    amount DECIMAL(12,2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_date DATE,
    
    -- معلومات الحوالة
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    transfer_reference VARCHAR(100),
    transfer_date DATE,
    receipt_image TEXT,
    
    -- المراجعة
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    
    -- التواريخ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_amount CHECK (amount > 0)
);

-- ========================================
-- 11. جدول الإشعارات
-- ========================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_role user_role,
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    
    link TEXT,
    link_text VARCHAR(100),
    icon VARCHAR(50),
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- ========================================
-- 12. جدول جلسات المستخدمين
-- ========================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    
    is_active BOOLEAN DEFAULT TRUE
);

-- ========================================
-- 13. جدول سجل النشاطات
-- ========================================
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 14. الفهارس (Indexes)
-- ========================================

-- فهارس المستخدمين
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_branch ON users(branch);
CREATE INDEX idx_users_created_at ON users(created_at);

-- فهارس السفن
CREATE INDEX idx_ships_owner_id ON ships(owner_id);
CREATE INDEX idx_ships_imo_number ON ships(imo_number);
CREATE INDEX idx_ships_registration_number ON ships(registration_number);
CREATE INDEX idx_ships_status ON ships(status);
CREATE INDEX idx_ships_type ON ships(ship_type);
CREATE INDEX idx_ships_expiry_date ON ships(expiry_date);
CREATE INDEX idx_ships_port ON ships(port_of_registry);
CREATE INDEX idx_ships_created_at ON ships(created_at);

-- فهارس الطلبات
CREATE INDEX idx_applications_owner_id ON applications(owner_id);
CREATE INDEX idx_applications_ship_id ON applications(ship_id);
CREATE INDEX idx_applications_assigned_to ON applications(assigned_to);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_type ON applications(application_type);
CREATE INDEX idx_applications_branch ON applications(branch);
CREATE INDEX idx_applications_submission_date ON applications(submission_date);
CREATE INDEX idx_applications_application_number ON applications(application_number);

-- فهارس المستندات
CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_documents_ship_id ON documents(ship_id);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_verification_status ON documents(verification_status);

-- فهارس المدفوعات
CREATE INDEX idx_payments_owner_id ON payments(owner_id);
CREATE INDEX idx_payments_application_id ON payments(application_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- فهارس الإشعارات
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_role ON notifications(user_role);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- فهارس سجل النشاطات
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- ========================================
-- 15. إدراج البيانات الأساسية (نسخة تجريبية - بدون تشفير)
-- ========================================

-- المستخدمين الأساسيين (بكلمات مرور نصية واضحة للتجربة)
INSERT INTO users (id, email, password_hash, full_name, role, status, branch, position, department, employee_id) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@maritime.gov.ye', 'admin123', 'المسؤول الرئيسي', 'admin', 'active', 'main', 'مدير النظام', 'الإدارة العامة', 'ADM-001'),
    ('22222222-2222-2222-2222-222222222222', 'aden@maritime.gov.ye', 'aden123', 'أحمد محمد - موظف عدن', 'branch_employee', 'active', 'aden', 'موظف استقبال', 'خدمة العملاء', 'EMP-AD-001'),
    ('33333333-3333-3333-3333-333333333333', 'mukalla@maritime.gov.ye', 'mukalla123', 'سالم عبدالله - موظف المكلا', 'branch_employee', 'active', 'mukalla', 'موظف استقبال', 'خدمة العملاء', 'EMP-MK-001'),
    ('44444444-4444-4444-4444-444444444444', 'hodeidah@maritime.gov.ye', 'hodeidah123', 'فاطمة علي - موظفة الحديدة', 'branch_employee', 'active', 'hodeidah', 'موظفة استقبال', 'خدمة العملاء', 'EMP-HD-001');

-- ملاك السفن التجريبيين (بكلمات مرور نصية واضحة)
INSERT INTO users (id, email, password_hash, full_name, role, status, national_id, phone, address, city, governorate) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner1@example.com', 'owner123', 'أحمد محمد عبدالله', 'ship_owner', 'active', '1234567890', '777123456', 'شارع 26 سبتمبر', 'عدن', 'عدن'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'company@example.com', 'company123', 'شركة الشحن السريع', 'ship_owner', 'active', NULL, '777789012', 'منطقة الميناء', 'الحديدة', 'الحديدة'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'fisher@example.com', 'fisher123', 'محمد سالم الصياد', 'ship_owner', 'active', '0987654321', '777345678', 'حي الصيادين', 'المكلا', 'حضرموت');

-- ========================================
-- 16. الدوال الأساسية
-- ========================================

-- دالة تحديث وقت التعديل
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- دوال مساعدة لسياسات الأمان (RLS) - مهمة جداً لتجنب الأخطاء
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role
LANGUAGE sql STABLE
AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
    SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION current_user_branch()
RETURNS branch_name
LANGUAGE sql STABLE
AS $$
    SELECT branch FROM users WHERE id = auth.uid();
$$;

-- دالة إنشاء رقم طلب
CREATE OR REPLACE FUNCTION generate_application_number(app_type application_type)
RETURNS VARCHAR(50) AS $$
DECLARE
    year_prefix VARCHAR(4);
    sequence_num VARCHAR(4);
    type_prefix VARCHAR(3);
BEGIN
    year_prefix := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    type_prefix := CASE app_type
        WHEN 'new' THEN 'REG'
        WHEN 'renewal' THEN 'REN'
        WHEN 'transfer' THEN 'TRF'
        WHEN 'amendment' THEN 'AMD'
        WHEN 'cancellation' THEN 'CAN'
        ELSE 'APP'
    END;
    
    sequence_num := LPAD(FLOOR(RANDOM() * 10000)::INT::VARCHAR, 4, '0');
    
    RETURN type_prefix || '-' || year_prefix || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- دالة حساب الرسوم
CREATE OR REPLACE FUNCTION calculate_registration_fees(
    p_tonnage DECIMAL,
    p_ship_type ship_type
)
RETURNS TABLE (
    document_fee DECIMAL,
    survey_fee DECIMAL,
    temp_cert_fee DECIMAL,
    final_cert_fee DECIMAL,
    advance_total DECIMAL,
    full_total DECIMAL
) AS $$
BEGIN
    document_fee := 300;
    survey_fee := CASE WHEN p_tonnage >= 500 THEN 1000 ELSE 0 END;
    temp_cert_fee := p_tonnage * 0.5;
    final_cert_fee := p_tonnage * 1.5;
    advance_total := document_fee + survey_fee;
    full_total := document_fee + survey_fee + temp_cert_fee + final_cert_fee;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 17. التريجرات (Triggers)
-- ========================================

-- تطبيق تريجر التحديث على جميع الجداول
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ships_updated_at BEFORE UPDATE ON ships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- تريجر إنشاء رقم الطلب
CREATE OR REPLACE FUNCTION set_application_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.application_number IS NULL THEN
        NEW.application_number := generate_application_number(NEW.application_type);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_application_number
    BEFORE INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION set_application_number();

-- تريجر تسجيل النشاطات
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_data, new_data)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        row_to_json(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER trg_log_ships AFTER INSERT OR UPDATE OR DELETE ON ships FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER trg_log_applications AFTER INSERT OR UPDATE OR DELETE ON applications FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ========================================
-- 18. سياسات الأمان (RLS)
-- ========================================

-- تفعيل RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسات المستخدمين
CREATE POLICY users_admin_all ON users FOR ALL USING (current_user_role() = 'admin');
CREATE POLICY users_self_view ON users FOR SELECT USING (id = current_user_id());
CREATE POLICY users_self_update ON users FOR UPDATE USING (id = current_user_id());

-- سياسات السفن
CREATE POLICY ships_admin_all ON ships FOR ALL USING (current_user_role() = 'admin');
CREATE POLICY ships_employee_all ON ships FOR ALL USING (current_user_role() = 'branch_employee');
CREATE POLICY ships_owner_all ON ships FOR ALL USING (owner_id = current_user_id());

-- سياسات الطلبات
CREATE POLICY applications_admin_all ON applications FOR ALL USING (current_user_role() = 'admin');
CREATE POLICY applications_employee_all ON applications FOR ALL USING (
    current_user_role() = 'branch_employee' AND 
    (branch = current_user_branch() OR assigned_to = current_user_id() OR ready_for_employee_id = current_user_id())
);
CREATE POLICY applications_owner_all ON applications FOR ALL USING (owner_id = current_user_id());

-- ========================================
-- 19. التسلسلات (Sequences)
-- ========================================

CREATE SEQUENCE seq_application_number START 1 INCREMENT 1;
CREATE SEQUENCE seq_certificate_number START 1 INCREMENT 1;
CREATE SEQUENCE seq_payment_number START 1 INCREMENT 1;

-- ========================================
-- 20. ملاحظات التثبيت
-- ========================================

/*
ملاحظات هامة للنسخة التجريبية:
1. كلمات المرور مخزنة كنص واضح للتجربة (لا تستخدم في الإنتاج)
2. للاستخدام الفعلي، يجب تشفير كلمات المرور باستخدام pgcrypt
3. المستخدمون التجريبيون:
   - المسؤول: admin@maritime.gov.ye / admin123
   - موظف عدن: aden@maritime.gov.ye / aden123
   - موظف المكلا: mukalla@maritime.gov.ye / mukalla123
   - مالك سفينة: owner1@example.com / owner123
   - شركة: company@example.com / company123
   - صياد: fisher@example.com / fisher123
*/