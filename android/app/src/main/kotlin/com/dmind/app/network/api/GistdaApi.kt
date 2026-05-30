package com.dmind.app.network.api

import com.dmind.app.BuildConfig
import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaTimeRange
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URLEncoder
import java.net.URL

// ตัวช่วยสร้างพาร์ท API ย่อย (Endpoints) สำหรับข้อมูลและแผนที่ภัยพิบัติของ GISTDA
object GistdaEndpointPaths {
    // คืนค่าพาธของพิกัดดาวเทียมสำหรับตรวจพบจุดความร้อน VIIRS
    fun viirsFeaturePath(timeRange: GistdaTimeRange): String =
        "resources/features/viirs/${timeRange.featureSegment}"

    // คืนค่าพาธข้อมูลพื้นที่น้ำท่วมจากการวิเคราะห์ดาวเทียม
    fun floodFeaturePath(timeRange: GistdaTimeRange): String =
        if (timeRange == GistdaTimeRange.FloodFrequency) {
            "resources/features/flood-freq"
        } else {
            "resources/features/flood/${timeRange.featureSegment}"
        }

    // คืนค่าพาธระบบ WMTS (Web Map Tile Service) สำหรับแสดงพื้นที่น้ำท่วม
    fun floodWmtsPath(timeRange: GistdaTimeRange): String =
        if (timeRange == GistdaTimeRange.FloodFrequency) {
            "resources/maps/flood-freq/wmts"
        } else {
            "resources/maps/flood/${timeRange.floodWmtsSegment}/wmts"
        }

    // คืนค่าพาธระบบ WMS (Web Map Service) สำหรับดึงแผนที่น้ำท่วม
    fun floodWmsPath(timeRange: GistdaTimeRange): String =
        if (timeRange == GistdaTimeRange.FloodFrequency) {
            "resources/maps/flood-freq/wms"
        } else {
            "resources/maps/flood/${timeRange.floodWmtsSegment}/wms"
        }

    // คืนค่าพาธระบบ WMTS ของแผนที่ภาพถ่ายจุดความร้อน VIIRS
    fun viirsWmtsPath(timeRange: GistdaTimeRange): String =
        "resources/maps/viirs/${timeRange.viirsWmtsSegment}/wmts"

    // คืนค่าพาธระบบ WMS ของแผนที่จุดความร้อน VIIRS
    fun viirsWmsPath(timeRange: GistdaTimeRange): String =
        "resources/maps/viirs/${timeRange.viirsWmtsSegment}/wms"

    // คืนค่าพาธ WMTS ของผลิตภัณฑ์ตรวจวัดความชื้นในดิน SMAP
    fun smapWmtsPath(): String = "resources/maps/smap/7days/wmts"

    // คืนค่าพาธ WMS สำหรับผลิตภัณฑ์ตรวจจับภัยแล้งตามประเภทที่ระบุ
    fun droughtWmsPath(product: GistdaDroughtProduct): String = when (product) {
        GistdaDroughtProduct.Smap -> "resources/maps/smap/7days/wms"
        GistdaDroughtProduct.Ndwi -> "resources/maps/ndwi/7days/wms"
        GistdaDroughtProduct.DriPlus -> "resources/maps/dri/7days/wms"
    }

    // คืนค่าพาธแผนที่รูปภาพความแล้งตามระบบ TMS หรือ WMTS
    fun droughtMapPath(product: GistdaDroughtProduct): String = when (product) {
        GistdaDroughtProduct.Smap -> smapWmtsPath()
        GistdaDroughtProduct.Ndwi -> "resources/maps/ndwi/7days/tms"
        GistdaDroughtProduct.DriPlus -> "resources/maps/dri/7days/tms"
    }

    // เลือกใช้พาธ WMTS หรือแผนที่ที่เหมาะสมตามชั้นข้อมูลและขอบเขตช่วงเวลา
    fun wmtsPath(
        type: DisasterLayerType,
        timeRange: GistdaTimeRange,
        droughtProduct: GistdaDroughtProduct = GistdaDroughtProduct.Smap,
    ): String? = when (type) {
        DisasterLayerType.Flood -> floodWmtsPath(timeRange)
        DisasterLayerType.WildfireViirs -> viirsWmtsPath(timeRange)
        DisasterLayerType.DroughtSmap -> droughtMapPath(droughtProduct)
        else -> null
    }

    // รูปแบบการเรียกเก็บพารามิเตอร์แผ่นภาพพิกัด (Tile Scheme)
    fun tileScheme(type: DisasterLayerType, droughtProduct: GistdaDroughtProduct?): String =
        "xyz"
}

// คลาสหลักที่ใช้คุยกับระบบ GISTDA Open API สำหรับดาวน์โหลดพิกัดข้อมูลภัยพิบัติและลิงก์แผนที่รูปภาพ
class GistdaApi(
    private val baseUrl: String = BuildConfig.DMIND_GISTDA_BASE_URL,
    private val apiKey: String = BuildConfig.DMIND_GISTDA_API_KEY,
) {
    // ฟังก์ชันร้องขอพิกัดภูมิศาสตร์และรายละเอียดจุดความร้อนไฟป่า (VIIRS) ในประเทศไทย
    suspend fun getViirsFeatures(
        timeRange: GistdaTimeRange,
        limit: Int,
        offset: Int,
    ): String {
        val country = URLEncoder.encode("ราชอาณาจักรไทย", Charsets.UTF_8.name())
        return getJson(
            path = GistdaEndpointPaths.viirsFeaturePath(timeRange),
            query = "limit=$limit&offset=$offset&ct_tn=$country",
        )
    }

    // ฟังก์ชันร้องขอพิกัดทางภูมิศาสตร์และขนาดของพื้นที่ประสบอุทกภัย (Flood Features)
    suspend fun getFloodFeatures(
        timeRange: GistdaTimeRange,
        limit: Int,
        offset: Int,
    ): String {
        return getJson(
            path = GistdaEndpointPaths.floodFeaturePath(timeRange),
            query = "limit=$limit&offset=$offset",
        )
    }

    // คืนค่าลิงก์ URL สำหรับเรนเดอร์ชั้นแผนที่ WMTS ไทล์ บนคอมโพเนนต์ Maps API
    fun wmtsTileUrl(
        type: DisasterLayerType,
        timeRange: GistdaTimeRange,
        droughtProduct: GistdaDroughtProduct = GistdaDroughtProduct.Smap,
    ): String? {
        val path = GistdaEndpointPaths.wmtsPath(type, timeRange, droughtProduct) ?: return null
        val key = apiKey.trim()
        if (key.isBlank()) return null
        val encodedKey = URLEncoder.encode(key, Charsets.UTF_8.name())
        val extension = if (type == DisasterLayerType.DroughtSmap && droughtProduct != GistdaDroughtProduct.Smap) "" else ".png"
        return "${resourceUrl(path)}/{z}/{x}/{y}$extension?api_key=$encodedKey"
    }

    // เช็คสถานะว่าแอปพลิเคชันมีการใส่คีย์ผ่าน System Config แล้วหรือยัง
    fun hasApiKey(): Boolean = apiKey.isNotBlank()

    // ยิงคำขอเรียก JSON ของ GISTDA API โดยใช้สิทธิ์ผ่าน API Key ใน Header
    private suspend fun getJson(
        path: String,
        query: String,
    ): String {
        val key = apiKey.trim()
        require(key.isNotBlank()) { "ยังไม่ได้ตั้งค่า DMIND_GISTDA_API_KEY" }
        return httpGet(
            url = "${resourceUrl(path)}?$query",
            headers = mapOf(
                "accept" to "application/json",
                "API-Key" to key,
            ),
        )
    }

    // แปลงพาร์ทไอเทมให้เป็น URL ปลายทางปลายพารามิเตอร์แบบเต็ม
    private fun resourceUrl(path: String): String {
        return "${baseUrl.trim().trimEnd('/')}/${path.trimStart('/')}"
    }

    // ฟังก์ชันยิง HTTP Get ใน Thread เบื้องหลังเพื่อรับส่งข้อมูลเครือข่ายอย่างปลอดภัย
    private suspend fun httpGet(
        url: String,
        headers: Map<String, String>,
    ): String = withContext(Dispatchers.IO) {
        val connection = (URL(url).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 15_000
            readTimeout = 20_000
            setRequestProperty("User-Agent", "D-MIND Android native map/2.1")
            headers.forEach { (key, value) -> setRequestProperty(key, value) }
        }

        try {
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
            if (code !in 200..299) {
                throw IllegalStateException("GISTDA HTTP $code: ${body.take(140)}")
            }
            body
        } finally {
            connection.disconnect()
        }
    }
}
