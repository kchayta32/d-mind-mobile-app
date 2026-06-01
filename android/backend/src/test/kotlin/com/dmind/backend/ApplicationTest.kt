package com.dmind.backend

import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.TextContent
import io.ktor.server.testing.testApplication
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import java.nio.file.Files

// คลาสสำหรับการเขียน Unit Test เพื่อทดสอบการทำงานของ Ktor Web Server และ Routing ต่างๆ ของระบบแบ็กเอนด์
class ApplicationTest {
    
    // ทดสอบการเรียกใช้งาน Endpoint สำหรับเช็คสถานะการทำงาน (/health) ว่าต้องตอบกลับมาเป็นสถานะปกติ
    @Test
    fun healthReturnsOk() = testApplication {
        application { dmindModule() }

        val response = client.get("/health").bodyAsText()

        assertTrue(response.contains("\"status\":\"ok\""))
        assertTrue(response.contains("\"service\":\"d-mind-backend\""))
    }

    // ทดสอบ Endpoint สำหรับลงทะเบียนโทเค็นอุปกรณ์ใหม่เพื่อพร้อมรับ Push Notification (FCM Register)
    @Test
    fun fcmRegisterAcceptsToken() {
        withGatewayProperties {
            testApplication {
                application { dmindModule() }

                val response = client.post("/fcm/register") {
                    setBody(TextContent("""{"token":"test-token","platform":"android","userId":"user-1","installationId":"install-1"}""", ContentType.Application.Json))
                }

                assertEquals(HttpStatusCode.OK, response.status)
                assertTrue(response.bodyAsText().contains("\"status\":\"registered\""))
            }
        }
    }

    // ตรวจสอบระบบรักษาความปลอดภัยว่าการส่งการแจ้งเตือนออกไปจำเป็นต้องมีรหัสผู้ดูแลระบบ (Admin Token)
    @Test
    fun notificationSendRequiresAdminToken() {
        withGatewayProperties(adminToken = "test-admin") {
            testApplication {
                application { dmindModule() }

                val response = client.post("/notifications/send") {
                    setBody(TextContent("""{"title":"Test","message":"Hello","alertType":"flood","broadcast":true}""", ContentType.Application.Json))
                }

                assertEquals(HttpStatusCode.Unauthorized, response.status)
                assertTrue(response.bodyAsText().contains("\"code\":\"unauthorized\""))
            }
        }
    }

    // ทดสอบว่าข้อมูลโทเค็นอุปกรณ์ที่ถูกลงทะเบียนจะคงอยู่และถูกอ่านขึ้นมาใหม่ได้หลังจากการรีสตาร์ตเซิร์ฟเวอร์
    @Test
    fun notificationSendUsesPersistedRegistryAfterRestart() {
        withGatewayProperties(adminToken = "test-admin") {
            testApplication {
                application { dmindModule() }
                val registerResponse = client.post("/fcm/register") {
                    setBody(TextContent("""{"token":"persisted-token","platform":"android","installationId":"install-1"}""", ContentType.Application.Json))
                }
                assertEquals(HttpStatusCode.OK, registerResponse.status)
            }

            testApplication {
                application { dmindModule() }
                val sendResponse = client.post("/notifications/send") {
                    header("Authorization", "Bearer test-admin")
                    setBody(TextContent("""{"title":"Test","message":"Hello","alertType":"flood","broadcast":true}""", ContentType.Application.Json))
                }

                assertEquals(HttpStatusCode.ServiceUnavailable, sendResponse.status)
                val body = sendResponse.bodyAsText()
                assertTrue(body.contains("\"requested\":1"))
                assertTrue(body.contains("\"configured\":false"))
            }
        }
    }

    // ทดสอบว่าเมื่อยื่นคำขอรายงานเหตุการณ์ที่ไม่ถูกต้อง (เช่น ข้อมูลสั้นเกินไป) ระบบจะต้องแสดงข้อผิดพลาดพร้อมโครงสร้างที่ถูกต้อง
    @Test
    fun invalidReportReturnsStructuredBadRequest() {
        withGatewayProperties {
            testApplication {
                application { dmindModule() }

                val response = client.post("/reports") {
                    setBody(TextContent("""{"type":"flood","title":"x","description":"bad","severityLevel":3}""", ContentType.Application.Json))
                }

                assertEquals(HttpStatusCode.BadRequest, response.status)
                val body = response.bodyAsText()
                assertTrue(body.contains("\"code\":\"bad_request\""))
                assertTrue(body.contains("\"requestId\""))
            }
        }
    }

    // ทดสอบว่าตัวอ่านข้อมูลสภาพแวดล้อมสามารถดึงค่า TMD API Token จาก System Properties ได้ถูกต้อง
    @Test
    fun testTmdApiTokenResolution() {
        val previousToken = System.getProperty("DMIND_TMD_API_TOKEN")
        try {
            System.setProperty("DMIND_TMD_API_TOKEN", "test-tmd-token-123")
            val config = GatewayConfig.fromEnvironment()
            assertEquals("test-tmd-token-123", config.tmdApiToken)
        } finally {
            restoreProperty("DMIND_TMD_API_TOKEN", previousToken)
        }
    }

    // ทดสอบกรณีไม่มีคีย์ใช้งาน TMD API ระบบจะสลับไปดึงข้อมูลสภาพอากาศพยากรณ์จาก Open-Meteo แบบอัตโนมัติ (Fallback)
    @Test
    fun weatherRouteFallsBackToOpenMeteoWhenTokenMissing() {
        val previousTmd = System.getProperty("DMIND_TMD_API_TOKEN")
        val previousTmd2 = System.getProperty("TMD_API_TOKEN")
        System.clearProperty("DMIND_TMD_API_TOKEN")
        System.clearProperty("TMD_API_TOKEN")
        
        val localProps = java.nio.file.Paths.get("local.properties")
        val parentLocalProps = java.nio.file.Paths.get("../local.properties")
        val localPropsBackup = java.nio.file.Paths.get("local.properties.bak")
        val parentLocalPropsBackup = java.nio.file.Paths.get("../local.properties.bak")
        
        val renamedLocal = if (java.nio.file.Files.exists(localProps)) {
            java.nio.file.Files.move(localProps, localPropsBackup, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            true
        } else false
        val renamedParent = if (java.nio.file.Files.exists(parentLocalProps)) {
            java.nio.file.Files.move(parentLocalProps, parentLocalPropsBackup, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            true
        } else false
        
        try {
            testApplication {
                application { dmindModule() }
                val response = client.get("/weather?lat=13.7&lon=100.5")
                assertEquals(HttpStatusCode.OK, response.status)
                val body = response.bodyAsText()
                assertTrue(body.contains("\"status\":\"fallback\""))
                assertTrue(body.contains("Open-Meteo"))
            }
        } finally {
            restoreProperty("DMIND_TMD_API_TOKEN", previousTmd)
            restoreProperty("TMD_API_TOKEN", previousTmd2)
            if (renamedLocal) {
                java.nio.file.Files.move(localPropsBackup, localProps, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            }
            if (renamedParent) {
                java.nio.file.Files.move(parentLocalPropsBackup, parentLocalProps, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            }
        }
    }

    // ทดสอบการพยากรณ์รายชั่วโมงและรายวันว่าข้อมูล Fallback ของ Open-Meteo ได้รับฟิลด์ใหม่ทั้งหมดครบถ้วน
    @Test
    fun weatherRouteOpenMeteoFallbackFields() {
        val previousTmd = System.getProperty("DMIND_TMD_API_TOKEN")
        val previousTmd2 = System.getProperty("TMD_API_TOKEN")
        System.clearProperty("DMIND_TMD_API_TOKEN")
        System.clearProperty("TMD_API_TOKEN")
        
        val localProps = java.nio.file.Paths.get("local.properties")
        val parentLocalProps = java.nio.file.Paths.get("../local.properties")
        val localPropsBackup = java.nio.file.Paths.get("local.properties.bak")
        val parentLocalPropsBackup = java.nio.file.Paths.get("../local.properties.bak")
        
        val renamedLocal = if (java.nio.file.Files.exists(localProps)) {
            java.nio.file.Files.move(localProps, localPropsBackup, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            true
        } else false
        val renamedParent = if (java.nio.file.Files.exists(parentLocalProps)) {
            java.nio.file.Files.move(parentLocalProps, parentLocalPropsBackup, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            true
        } else false
        
        try {
            testApplication {
                application { dmindModule() }
                
                // 1) Test Hourly fields
                val hourlyResponse = client.get("/weather?lat=13.7&lon=100.5&daily=false")
                assertEquals(HttpStatusCode.OK, hourlyResponse.status)
                val hourlyBody = hourlyResponse.bodyAsText()
                assertTrue(hourlyBody.contains("\"status\":\"fallback\""))
                assertTrue(hourlyBody.contains("\"tc\""))
                assertTrue(hourlyBody.contains("\"rh\""))
                assertTrue(hourlyBody.contains("\"slp\""))
                assertTrue(hourlyBody.contains("\"ws925\""))
                assertTrue(hourlyBody.contains("\"cloudlow\""))
                
                // 2) Test Daily fields
                val dailyResponse = client.get("/weather?lat=13.7&lon=100.5&daily=true&duration=3")
                assertEquals(HttpStatusCode.OK, dailyResponse.status)
                val dailyBody = dailyResponse.bodyAsText()
                assertTrue(dailyBody.contains("\"status\":\"fallback\""))
                assertTrue(dailyBody.contains("\"tc_max\""))
                assertTrue(dailyBody.contains("\"tc_min\""))
                assertTrue(dailyBody.contains("\"psfc\""))
                assertTrue(dailyBody.contains("\"ws925\""))
                assertTrue(dailyBody.contains("\"cloudlow\""))
            }
        } finally {
            restoreProperty("DMIND_TMD_API_TOKEN", previousTmd)
            restoreProperty("TMD_API_TOKEN", previousTmd2)
            if (renamedLocal) {
                java.nio.file.Files.move(localPropsBackup, localProps, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            }
            if (renamedParent) {
                java.nio.file.Files.move(parentLocalPropsBackup, parentLocalProps, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            }
        }
    }

    // ทดสอบการเรียกดึงข้อมูลสรุปสิ่งแวดล้อม (Environmental Data) ว่าสามารถเรียกและทำงานได้อย่างถูกต้อง
    @Test
    fun environmentalAnalyticsRouteWorksWithTmdFallback() {
        val previousTmd = System.getProperty("DMIND_TMD_API_TOKEN")
        val previousTmd2 = System.getProperty("TMD_API_TOKEN")
        System.clearProperty("DMIND_TMD_API_TOKEN")
        System.clearProperty("TMD_API_TOKEN")
        
        val localProps = java.nio.file.Paths.get("local.properties")
        val parentLocalProps = java.nio.file.Paths.get("../local.properties")
        val localPropsBackup = java.nio.file.Paths.get("local.properties.bak")
        val parentLocalPropsBackup = java.nio.file.Paths.get("../local.properties.bak")
        
        val renamedLocal = if (java.nio.file.Files.exists(localProps)) {
            java.nio.file.Files.move(localProps, localPropsBackup, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            true
        } else false
        val renamedParent = if (java.nio.file.Files.exists(parentLocalProps)) {
            java.nio.file.Files.move(parentLocalProps, parentLocalPropsBackup, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            true
        } else false
        
        try {
            testApplication {
                application { dmindModule() }
                val response = client.get("/api/analytics/environmental")
                assertEquals(HttpStatusCode.OK, response.status)
                val body = response.bodyAsText()
                assertTrue(body.contains("\"pm25\""))
                assertTrue(body.contains("\"aqi\""))
                assertTrue(body.contains("\"temperature\""))
                assertTrue(body.contains("\"humidity\""))
            }
        } finally {
            restoreProperty("DMIND_TMD_API_TOKEN", previousTmd)
            restoreProperty("TMD_API_TOKEN", previousTmd2)
            if (renamedLocal) {
                java.nio.file.Files.move(localPropsBackup, localProps, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            }
            if (renamedParent) {
                java.nio.file.Files.move(parentLocalPropsBackup, parentLocalProps, java.nio.file.StandardCopyOption.REPLACE_EXISTING)
            }
        }
    }

    // ตรวจสอบความปลอดภัยว่า Endpoint สำหรับประเมินและเตือนภัยด่วน (/alerts/evaluate) ต้องใช้สิทธิ์ผู้ดูแลระบบ
    @Test
    fun alertsEvaluateRequiresAdminToken() {
        withGatewayProperties(adminToken = "test-admin") {
            testApplication {
                application { dmindModule() }

                val response = client.post("/alerts/evaluate") {
                    setBody(TextContent("{}", ContentType.Application.Json))
                }

                assertEquals(HttpStatusCode.Unauthorized, response.status)
                assertTrue(response.bodyAsText().contains("\"code\":\"unauthorized\""))
            }
        }
    }

    // ทดสอบการเรียกสั่งประเมินสภาพอากาศและเตือนภัยฉุกเฉินสำเร็จเมื่อยืนยันสิทธิ์ด้วยโทเค็นแอดมินถูกต้อง
    @Test
    fun alertsEvaluateExecutesSuccessfullyWithAdminToken() {
        withGatewayProperties(adminToken = "test-admin") {
            testApplication {
                application { dmindModule() }

                val response = client.post("/alerts/evaluate?force=true") {
                    header("Authorization", "Bearer test-admin")
                    setBody(TextContent("{}", ContentType.Application.Json))
                }

                assertEquals(HttpStatusCode.OK, response.status)
                val body = response.bodyAsText()
                assertTrue(body.contains("\"status\":\"evaluated\""))
                assertTrue(body.contains("\"detail\""))
            }
        }
    }

    // ฟังก์ชันช่วยเหลือสำหรับจำลองและบันทึกค่าพิกัดโทเค็นอุปกรณ์ระหว่างทำ Unit Test
    private fun withGatewayProperties(
        adminToken: String? = null,
        block: () -> Unit,
    ) {
        val tokenStore = Files.createTempDirectory("dmind-backend-test").resolve("device-tokens.json")
        val previousTokenStore = System.getProperty("DMIND_TOKEN_STORE_PATH")
        val previousAdminToken = System.getProperty("DMIND_ADMIN_TOKEN")
        System.setProperty("DMIND_TOKEN_STORE_PATH", tokenStore.toString())
        if (adminToken == null) {
            System.clearProperty("DMIND_ADMIN_TOKEN")
        } else {
            System.setProperty("DMIND_ADMIN_TOKEN", adminToken)
        }
        try {
            block()
        } finally {
            restoreProperty("DMIND_TOKEN_STORE_PATH", previousTokenStore)
            restoreProperty("DMIND_ADMIN_TOKEN", previousAdminToken)
        }
    }

    // ฟังก์ชันช่วยเหลือสำหรับการคืนค่าคุณสมบัติ System Property เดิมหลังจบขั้นตอนทดสอบ
    private fun restoreProperty(name: String, value: String?) {
        if (value == null) {
            System.clearProperty(name)
        } else {
            System.setProperty(name, value)
        }
    }
}
