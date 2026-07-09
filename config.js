// ============================================================
// Supabase 連線設定
// 請到你的 Supabase 專案後台 → Settings → API
// 把 Project URL 跟 anon public key 貼到下面兩個變數
// ============================================================
const SUPABASE_URL = "https://ukyuvsbhyrrqpsdqrgof.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QczZLJsS2zsh3WrjKGbGBw_tslLPQ63";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
