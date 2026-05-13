package com.dmind.app.network

import com.dmind.app.BuildConfig

object BackendConfig {
    val baseUrl: String = BuildConfig.BACKEND_BASE_URL.trimEnd('/')
}
