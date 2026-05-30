package com.dmind.app.ui.navigation

import androidx.annotation.StringRes
import com.dmind.app.R

// เส้นทางการนำทางของแอปพลิเคชัน (Navigation Routes) พร้อมทรัพยากรข้อความเมนูหลัก
enum class AppRoute(
    @StringRes val labelResId: Int,
) {
    Dashboard(R.string.nav_home),
    Map(R.string.nav_map),
    Alerts(R.string.nav_alerts),
    Report(R.string.nav_report),
    Stations(R.string.nav_stations),
    Chatbot(R.string.nav_chatbot),
    Settings(R.string.nav_settings),
    Contacts(R.string.nav_emergency),
    Manual(R.string.nav_manual),
    Weather(R.string.nav_weather_hourly),
    WeeklyWeather(R.string.nav_weather_weekly),
    Damage(R.string.nav_damage),
    VictimReports(R.string.nav_victim_reports),
    SatisfactionSurvey(R.string.nav_satisfaction_survey),
    Analytics(R.string.nav_analytics),
}
