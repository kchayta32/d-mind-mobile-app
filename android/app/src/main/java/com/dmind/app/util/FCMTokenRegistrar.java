package com.dmind.app.util;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.dmind.app.BuildConfig;
import com.dmind.app.R;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public final class FCMTokenRegistrar {

    private static final String TAG = "FCMTokenRegistrar";
    private static final String PREFS = "dmind_native";
    private static final String KEY_FCM_TOKEN = "fcm_token";

    private FCMTokenRegistrar() {}

    public static void saveToken(Context context, String token) {
        SharedPreferences prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_FCM_TOKEN, token).apply();
    }

    public static String getToken(Context context) {
        SharedPreferences prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        return prefs.getString(KEY_FCM_TOKEN, "");
    }

    public static boolean isEndpointConfigured(Context context) {
        return !BuildConfig.BACKEND_BASE_URL.trim().isEmpty();
    }

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

            String body = "{\"token\":\"" + escape(token) + "\",\"platform\":\"android\",\"userId\":\"anonymous\"}";
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

    private static String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
