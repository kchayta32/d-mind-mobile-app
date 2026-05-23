package com.dmind.app.util

import android.app.Activity
import android.content.Context
import android.content.res.Configuration
import android.os.Build
import android.os.LocaleList
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalContext
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import java.io.IOException
import java.util.Locale
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

private val Context.localeDataStore by preferencesDataStore(name = "dmind_locale")

val LocalLanguage = staticCompositionLocalOf { LocaleManager.THAI }

/**
 * Manages in-app locale switching for Thai (default) / English.
 * Persists choice in DataStore and applies it via attachBaseContext.
 */
object LocaleManager {
    private val languageKey = stringPreferencesKey("language")
    const val THAI = "th"
    const val ENGLISH = "en"

    fun languageFlow(context: Context): Flow<String> {
        return context.applicationContext.localeDataStore.data
            .catch { error ->
                if (error is IOException) {
                    emit(emptyPreferences())
                } else {
                    throw error
                }
            }
            .map { preferences ->
                preferences[languageKey].toSupportedLanguage()
            }
    }

    /**
     * Returns the persisted language code, defaulting to Thai.
     */
    fun getLanguage(context: Context): String {
        return runBlocking(Dispatchers.IO) {
            try {
                context.applicationContext.localeDataStore.data.first()[languageKey].toSupportedLanguage()
            } catch (_: IOException) {
                THAI
            }
        }
    }

    /**
     * Persists the language code and recreates the activity to apply the change.
     */
    fun setLanguage(activity: Activity, languageCode: String) {
        val nextLanguage = languageCode.toSupportedLanguage()
        if (getLanguage(activity) == nextLanguage) return

        runBlocking(Dispatchers.IO) {
            activity.applicationContext.localeDataStore.edit { preferences ->
                preferences[languageKey] = nextLanguage
            }
        }
        activity.recreate()
    }

    /**
     * Wraps the base context with the selected locale.
     * Call from Activity.attachBaseContext(LocaleManager.wrapContext(base)).
     */
    fun wrapContext(base: Context): Context {
        val language = getLanguage(base)
        val locale = Locale(language)
        Locale.setDefault(locale)

        val config = Configuration(base.resources.configuration)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            config.setLocales(LocaleList(locale))
        } else {
            @Suppress("DEPRECATION")
            config.locale = locale
        }
        config.setLayoutDirection(locale)
        return base.createConfigurationContext(config)
    }

    private fun String?.toSupportedLanguage(): String {
        return when (this) {
            ENGLISH -> ENGLISH
            else -> THAI
        }
    }
}

@Composable
fun LocaleProvider(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val initialLanguage = remember(context) { LocaleManager.getLanguage(context) }
    val language by LocaleManager.languageFlow(context).collectAsState(initial = initialLanguage)

    CompositionLocalProvider(
        LocalLanguage provides language,
        content = content,
    )
}
