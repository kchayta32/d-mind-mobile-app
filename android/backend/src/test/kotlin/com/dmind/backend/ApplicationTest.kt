package com.dmind.backend

import io.ktor.client.request.get
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

class ApplicationTest {
    @Test
    fun healthReturnsOk() = testApplication {
        application { dmindModule() }

        val response = client.get("/health").bodyAsText()

        assertTrue(response.contains("\"status\":\"ok\""))
        assertTrue(response.contains("\"service\":\"d-mind-backend\""))
    }

    @Test
    fun fcmRegisterAcceptsToken() = testApplication {
        application { dmindModule() }

        val response = client.post("/fcm/register") {
            setBody(TextContent("""{"token":"test-token","platform":"android","userId":"user-1"}""", ContentType.Application.Json))
        }

        assertEquals(HttpStatusCode.OK, response.status)
        assertTrue(response.bodyAsText().contains("\"accepted\":true"))
    }

    @Test
    fun notificationSendRequiresTarget() = testApplication {
        application { dmindModule() }

        val response = client.post("/notifications/send") {
            setBody(TextContent("""{"title":"Test","message":"Hello","alertType":"flood"}""", ContentType.Application.Json))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
    }
}
