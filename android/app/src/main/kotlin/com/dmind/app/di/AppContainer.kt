package com.dmind.app.di

import android.content.Context
import com.dmind.app.data.NativeStatusRepository
import com.dmind.app.data.map.DisasterMapRepository
import com.dmind.app.data.remote.AirQualityRemoteDataSource
import com.dmind.app.data.remote.GistdaRemoteDataSource
import com.dmind.app.data.repository.DefaultDisasterRepository
import com.dmind.app.data.repository.GistdaDisasterRepositoryImpl
import com.dmind.app.data.supabase.SupabaseRepository
import com.dmind.app.domain.repository.DisasterRepository
import com.dmind.app.domain.repository.GistdaDisasterRepository
import com.dmind.app.network.api.GistdaApi
import com.dmind.app.network.BackendRestClient
import com.dmind.app.network.InstallationIdProvider

// คลาสสำหรับจัดการและให้บริการ Dependency Injection (DI) ภายในแอปพลิเคชัน
class AppContainer(context: Context) {
    // ออบเจกต์ Repository จัดการข้อมูลเกี่ยวกับสถานะดั้งเดิม (Native Status) ของเครื่อง
    val nativeStatusRepository = NativeStatusRepository(context)
    // ออบเจกต์ Repository จัดการข้อมูลความปลอดภัยและคุณภาพอากาศทั่วไป
    val disasterRepository: DisasterRepository = DefaultDisasterRepository(
        mapDataSource = DisasterMapRepository(context),
        airQualityDataSource = AirQualityRemoteDataSource(),
    )
    // ออบเจกต์ Repository จัดการข้อมูลภัยพิบัติจาก GISTDA
    val gistdaDisasterRepository: GistdaDisasterRepository = GistdaDisasterRepositoryImpl(
        remoteDataSource = GistdaRemoteDataSource(GistdaApi()),
    )
    // ออบเจกต์ Repository สำหรับจัดการข้อมูลและสื่อสารกับ Supabase/Backend
    val supabaseRepository = SupabaseRepository(
        backendClient = BackendRestClient(installationId = InstallationIdProvider.get(context)),
    )
}
