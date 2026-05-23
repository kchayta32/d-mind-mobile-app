package com.dmind.app.network

import com.dmind.app.BuildConfig

object ThaiLlmConfig {
    val baseUrl: String = BuildConfig.DMIND_THAI_LLM_BASE_URL.trimEnd('/')
    val apiKey: String = BuildConfig.DMIND_THAI_LLM_API_KEY
    val model: String = BuildConfig.DMIND_THAI_LLM_MODEL.ifBlank { "typhoon-s-thaillm-8b-instruct" }

    val isConfigured: Boolean
        get() = (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) && apiKey.isNotBlank()
}
