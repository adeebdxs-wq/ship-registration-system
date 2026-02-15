// ========================================
// ملف: supabase-config.js
// الوصف: تهيئة Supabase للتطبيق بالكامل
// ========================================

// استخدام متغيرات البيئة من Netlify
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

console.log('✅ Supabase initialized');