package com.dmind.app.di

import android.content.Context
import com.dmind.app.data.NativeStatusRepository

class AppContainer(context: Context) {
    val nativeStatusRepository = NativeStatusRepository(context)
}
