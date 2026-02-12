// ================================================
// API السفن - جميع العمليات المتعلقة بالسفن
// ================================================

// دالة توليد رقم طلب فريد
async function generateApplicationNumber() {
    try {
        const { data, error } = await supabase
            .rpc('generate_application_number');
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('خطأ في توليد رقم الطلب:', error);
        // إنشاء رقم بديل إذا فشلت الدالة
        return `APP-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    }
}

// دالة توليد رقم تسجيل سفينة فريد
async function generateShipRegistrationNumber(port) {
    try {
        const { data, error } = await supabase
            .rpc('generate_ship_registration_number', { p_port: port });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('خطأ في توليد رقم التسجيل:', error);
        return `SHIP-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    }
}

// دالة الحصول على قائمة سفن المالك
async function getOwnerShips(ownerId) {
    try {
        const { data, error } = await supabase
            .from('ships')
            .select(`
                *,
                applications (
                    id,
                    application_number,
                    status,
                    submission_date
                )
            `)
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, ships: data };
        
    } catch (error) {
        console.error('خطأ في جلب السفن:', error);
        return { success: false, error: error.message };
    }
}

// دالة الحصول على تفاصيل سفينة محددة
async function getShipDetails(shipId) {
    try {
        const { data, error } = await supabase
            .from('ships')
            .select(`
                *,
                owner:owner_id (id, full_name, email, phone),
                applications (
                    id,
                    application_number,
                    status,
                    submission_date,
                    rejection_reason,
                    reviewer_notes
                ),
                certificates (*),
                documents (*),
                inspections (*)
            `)
            .eq('id', shipId)
            .single();
        
        if (error) throw error;
        return { success: true, ship: data };
        
    } catch (error) {
        console.error('خطأ في جلب تفاصيل السفينة:', error);
        return { success: false, error: error.message };
    }
}

// دالة تحديث بيانات السفينة
async function updateShip(shipId, updateData) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('يرجى تسجيل الدخول');
        
        const { data, error } = await supabase
            .from('ships')
            .update({
                ...updateData,
                updated_by: user.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', shipId)
            .select()
            .single();
        
        if (error) throw error;
        
        // تسجيل النشاط
        await logActivity(
            user.id,
            'UPDATE_SHIP',
            'ships',
            shipId,
            { updates: updateData }
        );
        
        return { success: true, ship: data };
        
    } catch (error) {
        console.error('خطأ في تحديث السفينة:', error);
        return { success: false, error: error.message };
    }
}

// دالة الحصول على طلبات المالك
async function getOwnerApplications(ownerId, status = null) {
    try {
        let query = supabase
            .from('applications')
            .select(`
                *,
                ship:ships (ship_name_ar, registration_number)
            `)
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        
        if (status) {
            query = query.eq('status', status);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return { success: true, applications: data };
        
    } catch (error) {
        console.error('خطأ في جلب الطلبات:', error);
        return { success: false, error: error.message };
    }
}

// دالة البحث عن السفن
async function searchShips(searchTerm) {
    try {
        const { data, error } = await supabase
            .from('ships')
            .select('*')
            .textSearch('search_vector', searchTerm, {
                config: 'arabic'
            })
            .limit(20);
        
        if (error) throw error;
        return { success: true, ships: data };
        
    } catch (error) {
        console.error('خطأ في البحث عن السفن:', error);
        return { success: false, error: error.message };
    }
}

// دالة الحصول على إحصائيات المالك
async function getOwnerStatistics(ownerId) {
    try {
        // إجمالي السفن
        const { count: totalShips, error: shipsError } = await supabase
            .from('ships')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId);
        
        // السفن النشطة
        const { count: activeShips, error: activeError } = await supabase
            .from('ships')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .eq('status', 'active');
        
        // الطلبات قيد المعالجة
        const { count: pendingApplications, error: pendingError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', ownerId)
            .in('status', ['pending', 'reviewing']);
        
        // الشهادات المنتهية
        const { count: expiredCertificates, error: certError } = await supabase
            .from('certificates')
            .select('*, ships!inner(owner_id)', { count: 'exact', head: true })
            .eq('ships.owner_id', ownerId)
            .eq('status', 'expired');
        
        if (shipsError || activeError || pendingError || certError) {
            throw new Error('فشل في جلب الإحصائيات');
        }
        
        return {
            success: true,
            statistics: {
                totalShips: totalShips || 0,
                activeShips: activeShips || 0,
                pendingApplications: pendingApplications || 0,
                expiredCertificates: expiredCertificates || 0
            }
        };
        
    } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
        return { success: false, error: error.message };
    }
}

// تصدير الدوال
window.generateApplicationNumber = generateApplicationNumber;
window.generateShipRegistrationNumber = generateShipRegistrationNumber;
window.getOwnerShips = getOwnerShips;
window.getShipDetails = getShipDetails;
window.updateShip = updateShip;
window.getOwnerApplications = getOwnerApplications;
window.searchShips = searchShips;
window.getOwnerStatistics = getOwnerStatistics;