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

class ApplicationTest {
    @Test
    fun healthReturnsOk() = testApplication {
        application { dmindModule() }

        val response = client.get("/health").bodyAsText()

        assertTrue(response.contains("\"status\":\"ok\""))
        assertTrue(response.contains("\"service\":\"d-mind-backend\""))
    }

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

    private fun restoreProperty(name: String, value: String?) {
        if (value == null) {
            System.clearProperty(name)
        } else {
            System.setProperty(name, value)
        }
    }
}
