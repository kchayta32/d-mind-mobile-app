package com.dmind.app.worker;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.BackoffPolicy;
import androidx.work.Constraints;
import androidx.work.ExistingWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.dmind.app.BuildConfig;
import com.dmind.app.R;
import com.dmind.app.database.AlertsCacheDAO;
import com.dmind.app.model.SOSMessage;
import com.dmind.app.util.EmergencyNotificationManager;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.TimeUnit;

// คลาสเวิร์กเกอร์ (Worker) สำหรับจัดการส่งสัญญาณ SOS ที่ค้างอยู่ในคิวแบบเบื้องหลัง (Background Task) ผ่าน WorkManager
public class SOSQueueWorker extends Worker {

    private static final String TAG = "SOSQueueWorker";
    private static final String UNIQUE_WORK_NAME = "dmind_sos_queue_flush";

    // คอนสตรักเตอร์สำหรับกำหนดค่าคอนเท็กซ์และพารามิเตอร์ให้กับเวิร์กเกอร์
    public SOSQueueWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    // เมธอดหลักที่รันงานเบื้องหลังเพื่อดึงข้อมูล SOS ที่ค้างอยู่ในฐานข้อมูลออกมาพยายามส่งออกไปยังเซิร์ฟเวอร์
    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        AlertsCacheDAO dao = new AlertsCacheDAO(context);
        List<SOSMessage> pendingMessages = dao.getPendingSOSMessages();

        if (pendingMessages.isEmpty()) {
            return Result.success();
        }

        String endpoint = BuildConfig.BACKEND_BASE_URL.trim() + "/sos";
        EmergencyNotificationManager emergencyManager = new EmergencyNotificationManager(context);

        if (BuildConfig.BACKEND_BASE_URL.trim().isEmpty()) {
            Log.w(TAG, "SOS endpoint is not configured; keeping messages queued");
            emergencyManager.triggerSOSNotification(
                "SOS pending",
                pendingMessages.size() + " SOS message(s) are queued until the backend endpoint is configured."
            );
            return Result.success();
        }

        int sentCount = 0;
        boolean hadTransientFailure = false;
        for (SOSMessage message : pendingMessages) {
            if (postSOS(endpoint, message)) {
                dao.markSOSAsSent(message.getId());
                sentCount++;
            } else {
                dao.markSOSAsPending(message.getId());
                hadTransientFailure = true;
            }
        }

        if (sentCount > 0) {
            emergencyManager.triggerSOSNotification(
                "SOS sent",
                sentCount + " queued SOS message(s) were sent."
            );
        }

        return hadTransientFailure ? Result.retry() : Result.success();
    }

    // ส่งข้อมูล SOSMessage ไปยังเซิร์ฟเวอร์ Backend ผ่าน HTTP POST
    private boolean postSOS(String endpoint, SOSMessage message) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(endpoint);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);

            byte[] body = message.toJson().getBytes(StandardCharsets.UTF_8);
            try (OutputStream outputStream = connection.getOutputStream()) {
                outputStream.write(body);
            }

            int responseCode = connection.getResponseCode();
            return responseCode >= 200 && responseCode < 300;
        } catch (Exception e) {
            Log.e(TAG, "Failed to post SOS message " + message.getId(), e);
            return false;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    // สั่งให้เวิร์กเกอร์ SOSQueueWorker เริ่มทำงานในคิวระบบ โดยระบุเงื่อนไขต้องเชื่อมต่ออินเทอร์เน็ต (Connected)
    public static void enqueue(Context context) {
        Constraints constraints = new Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build();

        OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(SOSQueueWorker.class)
            .setConstraints(constraints)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build();

        WorkManager.getInstance(context.getApplicationContext()).enqueueUniqueWork(
            UNIQUE_WORK_NAME,
            ExistingWorkPolicy.KEEP,
            request
        );
    }
}
