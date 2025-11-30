// SUPABASE CONFIGURATION
// GANTI INI DENGAN CREDENTIALS SUPABASE KAMU!

const SUPABASE_CONFIG = {
    // Project URL dari Supabase Dashboard > Settings > API
    url: 'https://wyhgzzvmuzgtdgqtnwpt.supabase.co',
    
    // Anon Public Key dari Supabase Dashboard > Settings > API
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aGd6enZtdXpndGRncXRud3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjE5NTUsImV4cCI6MjA3OTkzNzk1NX0.tbT7XfAwu1lRqVzh0emFnfQAuRSbBtPCcUS60FujObU'
};

// Jangan diubah! Ini untuk inisialisasi Supabase Client
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);