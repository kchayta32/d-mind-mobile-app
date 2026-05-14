package com.dmind.app.network

import com.dmind.app.BuildConfig

object SupabaseConfig {
    val url: String = BuildConfig.SUPABASE_URL.trimEnd('/')
    val anonKey: String = BuildConfig.SUPABASE_ANON_KEY
    val projectId: String = BuildConfig.SUPABASE_PROJECT_ID

    val isConfigured: Boolean
        get() = url.startsWith("https://") && anonKey.isNotBlank()
}
