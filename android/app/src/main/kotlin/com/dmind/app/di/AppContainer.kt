package com.dmind.app.di

import android.content.Context
import com.dmind.app.data.NativeStatusRepository
import com.dmind.app.data.supabase.SupabaseRepository
import com.dmind.app.network.BackendRestClient
import com.dmind.app.network.InstallationIdProvider

class AppContainer(context: Context) {
    val nativeStatusRepository = NativeStatusRepository(context)
    val supabaseRepository = SupabaseRepository(
        backendClient = BackendRestClient(installationId = InstallationIdProvider.get(context)),
    )
}
