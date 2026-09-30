/* OdiwommaHome customer auth helper */
window.OdiwommaAuth = {
  async client(){
    if(!window.supabase || !window.ODIWOMMA_SUPABASE_URL || !window.ODIWOMMA_SUPABASE_KEY) return null;
    return window.supabase.createClient(window.ODIWOMMA_SUPABASE_URL,window.ODIWOMMA_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  }
};