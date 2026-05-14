package com.dmind.app.network

import android.content.Context
import java.util.UUID

object InstallationIdProvider {
    private const val PREFS = "dmind_native"
    private const val KEY_INSTALLATION_ID = "installation_id"

    @JvmStatic
    fun get(context: Context): String {
        val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val existing = prefs.getString(KEY_INSTALLATION_ID, null)
        if (!existing.isNullOrBlank()) return existing

        val created = UUID.randomUUID().toString()
        prefs.edit().putString(KEY_INSTALLATION_ID, created).apply()
        return created
    }
}
