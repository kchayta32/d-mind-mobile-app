package com.dmind.app.util

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast

// ตัวช่วยเปิดแอปภายนอก (โทรศัพท์ / แผนที่ / เบราว์เซอร์) อย่างปลอดภัย
// เพราะ context.startActivity() จะโยน ActivityNotFoundException และทำให้แอปแครช
// บนอุปกรณ์ที่ไม่มีแอปรองรับ (เช่น แท็บเล็ตไม่มี dialer หรือไม่มี Google Maps)
object ExternalIntents {
    private const val TAG = "ExternalIntents"

    // เปิด Intent ที่ระบุ คืนค่า true เมื่อเปิดได้ และ false เมื่อไม่มีแอปรองรับ
    fun launch(context: Context, intent: Intent, fallbackMessage: String? = null): Boolean {
        return try {
            context.startActivity(intent)
            true
        } catch (e: ActivityNotFoundException) {
            Log.w(TAG, "No activity found to handle ${intent.action} ${intent.dataString}", e)
            fallbackMessage?.let { Toast.makeText(context, it, Toast.LENGTH_SHORT).show() }
            false
        } catch (e: SecurityException) {
            Log.w(TAG, "Not allowed to start ${intent.action} ${intent.dataString}", e)
            fallbackMessage?.let { Toast.makeText(context, it, Toast.LENGTH_SHORT).show() }
            false
        }
    }

    // เปิดหน้าโทรออกพร้อมหมายเลข (ไม่ต้องใช้สิทธิ์ CALL_PHONE)
    fun dial(context: Context, phoneNumber: String): Boolean =
        launch(
            context,
            Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phoneNumber")),
            fallbackMessage = "ไม่พบแอปโทรศัพท์บนอุปกรณ์นี้ กรุณาโทร $phoneNumber ด้วยตนเอง",
        )

    // เปิดการนำทางไปยังพิกัด โดยลอง Google Maps ก่อน แล้วค่อยถอยไปใช้ geo: และเว็บตามลำดับ
    fun navigateTo(context: Context, latitude: Double, longitude: Double): Boolean {
        val candidates = listOf(
            Intent(Intent.ACTION_VIEW, Uri.parse("google.navigation:q=$latitude,$longitude")),
            Intent(Intent.ACTION_VIEW, Uri.parse("geo:$latitude,$longitude?q=$latitude,$longitude")),
            Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://www.google.com/maps/dir/?api=1&destination=$latitude,$longitude"),
            ),
        )
        for (intent in candidates) {
            if (launch(context, intent)) return true
        }
        Toast.makeText(context, "ไม่พบแอปแผนที่หรือเบราว์เซอร์สำหรับเปิดการนำทาง", Toast.LENGTH_SHORT).show()
        return false
    }

    // เปิดลิงก์ URL ในเบราว์เซอร์/แอปที่รองรับ
    fun openUrl(context: Context, url: String): Boolean =
        launch(
            context,
            Intent(Intent.ACTION_VIEW, Uri.parse(url)),
            fallbackMessage = "ไม่พบแอปสำหรับเปิดลิงก์นี้",
        )
}
