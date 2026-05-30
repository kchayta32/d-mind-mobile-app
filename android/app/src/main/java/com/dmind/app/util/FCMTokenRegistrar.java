package com.dmind.app.util;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.dmind.app.BuildConfig;
import com.dmind.app.R;
import com.dmind.app.network.InstallationIdProvider;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

// คลาสยูทิลิตี้สำหรับจัดการและลงทะเบียน FCM Token กับเซิร์ฟเวอร์ระบบเบื้องหลัง
public final class FCMTokenRegistrar {

    private static final String TAG = "FCMTokenRegistrar";
    private static final String PREFS = "dmind_native";
    private static final String KEY_FCM_TOKEN = "fcm_token";

    // คอนสตรักเตอร์แบบไพรเวท เพื่อป้องกันการสร้างอินสแตนซ์ของคลาสยูทิลิตี้นี้
    private FCMTokenRegistrar() {}

    // บันทึก FCM Token ลงใน SharedPreferences ของแอปภายในเครื่อง
    public static void saveToken(Context context, String token) {
        SharedPreferences prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_FCM_TOKEN, token).apply();
    }

    // ดึงค่า FCM Token ที่บันทึกไว้ใน SharedPreferences ของแอปออกมาใช้งาน
    public static String getToken(Context context) {
        SharedPreferences prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        return prefs.getString(KEY_FCM_TOKEN, "");
    }

    // ตรวจสอบว่ามีการกำหนดค่า URL ของ Backend Endpoint สำหรับลงทะเบียน Token ไว้หรือไม่
    public static boolean isEndpointConfigured(Context context) {
        return !BuildConfig.BACKEND_BASE_URL.trim().isEmpty();
    }

    // สั่งบันทึก FCM Token และส่งข้อมูลลงทะเบียนไปยังเซิร์ฟเวอร์ Backend (ถ้ามีการตั้งค่า URL ไว้)
    public static boolean registerTokenIfConfigured(Context context, String token) {
        saveToken(context, token);
        if (BuildConfig.BACKEND_BASE_URL.trim().isEmpty()) {
            Log.i(TAG, "FCM token endpoint is not configured; token saved locally only");
            return false;
        }
        String endpoint = BuildConfig.BACKEND_BASE_URL.trim() + "/fcm/register";

        HttpURLConnection connection = null;
        try {
            URL url = new URL(endpoint);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);

            String installationId = InstallationIdProvider.get(context);
            String body = "{\"token\":\"" + escape(token) +
                "\",\"platform\":\"android\",\"userId\":\"" + escape(installationId) +
                "\",\"installationId\":\"" + escape(installationId) + "\"}";
            try (OutputStream outputStream = connection.getOutputStream()) {
                outputStream.write(body.getBytes(StandardCharsets.UTF_8));
            }

            int responseCode = connection.getResponseCode();
            return responseCode >= 200 && responseCode < 300;
        } catch (Exception e) {
            Log.e(TAG, "Failed to register FCM token", e);
            return false;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    // ฟังก์ชันหลีกเลี่ยงอักขระพิเศษ (Escape String) เพื่อนำข้อมูลไปประกอบในรูปแบบ JSON Payload ได้อย่างปลอดภัย
    private static String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
