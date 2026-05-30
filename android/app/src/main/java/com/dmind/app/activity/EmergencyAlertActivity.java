package com.dmind.app.activity;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.dmind.app.R;

import java.util.Timer;
import java.util.TimerTask;

/**
 * Full-screen lock-screen alert for critical disaster notifications.
 */
// หน้าจอกลางแจ้งแสดงข้อมูลแจ้งเตือนเหตุฉุกเฉินแบบเต็มหน้าจอ (แสดงแม้ตอนล็อกหน้าจอ)
public class EmergencyAlertActivity extends AppCompatActivity {

    // คีย์ข้อมูลสำหรับส่งค่าผ่าน Intent
    public static final String EXTRA_ALERT_TITLE = "alert_title";
    public static final String EXTRA_ALERT_MESSAGE = "alert_message";
    public static final String EXTRA_ALERT_TYPE = "alert_type";
    public static final String EXTRA_ALERT_RADIUS = "alert_radius";

    // ตัวแปรอ้างอิง UI elements สำหรับแสดงรายละเอียด
    private TextView titleView;
    private TextView messageView;
    private TextView countdownView;
    private Timer countdownTimer;
    private int countdownSeconds = 30;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        // กำหนดธีมพิเศษสำหรับการแจ้งเตือนฉุกเฉิน
        setTheme(R.style.AppTheme_EmergencyAlert);
        super.onCreate(savedInstanceState);

        // กำหนดให้แสดงผลเต็มหน้าจอและปลุกหน้าจอให้สว่างแม้ล็อกอยู่
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );

        setContentView(R.layout.activity_emergency_alert);

        titleView = findViewById(R.id.alertTitle);
        messageView = findViewById(R.id.alertMessage);
        countdownView = findViewById(R.id.countdownTimer);

        // ดึงข้อมูลแจ้งเตือนฉุกเฉินจาก Intent
        String alertTitle = getIntent().getStringExtra(EXTRA_ALERT_TITLE);
        String alertMessage = getIntent().getStringExtra(EXTRA_ALERT_MESSAGE);
        String alertType = getIntent().getStringExtra(EXTRA_ALERT_TYPE);

        titleView.setText(alertTitle != null ? alertTitle : "Emergency Disaster Alert");
        messageView.setText(alertMessage != null ? alertMessage : "You are in a danger zone. Seek safety immediately.");
        
        // กำหนดสีพื้นหลังและสีอักษรตามประเภทของภัยพิบัติ
        setAlertColors(alertType);
        
        // เริ่มการนับเวลาถอยหลัง
        startCountdown();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // กำหนดหน้าจอให้สว่างอยู่เสมอขณะแสดงผล
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @Override
    protected void onPause() {
        super.onPause();
        // ล้างสถานะรักษาความสว่างหน้าจอเมื่อออกจากกิจกรรม
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @Override
    protected void onDestroy() {
        // หยุดการทำงานตัวนับเวลาก่อนทำลาย Activity
        stopCountdown();
        super.onDestroy();
    }

    // กำหนดสีพื้นหลังของหน้าจอตามประเภทภัยพิบัติ
    private void setAlertColors(String type) {
        int backgroundColor = Color.parseColor("#8B0000");

        if (type != null) {
            switch (type.toLowerCase()) {
                case "tsunami":
                    backgroundColor = Color.parseColor("#DC143C");
                    break;
                case "flood":
                case "flooding":
                    backgroundColor = Color.parseColor("#00008B");
                    break;
                case "earthquake":
                    backgroundColor = Color.parseColor("#8B4513");
                    break;
                case "landslide":
                    backgroundColor = Color.parseColor("#CD853F");
                    break;
                case "storm":
                    backgroundColor = Color.parseColor("#4169E1");
                    break;
                default:
                    break;
            }
        }

        findViewById(R.id.alertRoot).setBackgroundColor(backgroundColor);
        titleView.setTextColor(Color.WHITE);
        messageView.setTextColor(Color.WHITE);
        countdownView.setTextColor(Color.YELLOW);
    }

    // เริ่มทำงานตัวนับถอยหลังโดยอัปเดต UI ทุก 1 วินาที
    private void startCountdown() {
        countdownTimer = new Timer();
        countdownTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                runOnUiThread(() -> {
                    if (countdownSeconds > 0) {
                        countdownView.setText(countdownSeconds + " seconds");
                        countdownSeconds--;
                    } else {
                        countdownView.setText("Evacuate now");
                    }
                });
            }
        }, 0, 1000);
    }

    // ยกเลิกการทำงานของตัวนับเวลาถอยหลัง
    private void stopCountdown() {
        if (countdownTimer != null) {
            countdownTimer.cancel();
            countdownTimer = null;
        }
    }

    // จัดการเมื่อผู้ใช้กดปุ่มรับทราบการแจ้งเตือน
    public void onAcknowledgmentClick(View view) {
        stopAlarm();
        stopCountdown();
        finish();
    }

    // ปิดเสียงสัญญาณเตือนและบันทึกการรับทราบ
    private void stopAlarm() {
        System.out.println("EmergencyAlertActivity: User acknowledged alert");
    }

    // ตรวจสอบว่าหน้าจอยังเตือนอยู่และยังไม่หมดเวลาหรือไม่
    public boolean isAlertActive() {
        return countdownSeconds > 0;
    }

    // ร้องขอให้ผู้ใช้กดปุ่มรับทราบทันทีโดยเปลี่ยนข้อความบนจอ
    public void requestAcknowledgment() {
        countdownView.post(() -> {
            countdownView.setText("Acknowledge immediately");
            countdownView.setTextColor(Color.YELLOW);
        });
    }

    @Override
    @SuppressLint("MissingSuperCall")
    public void onBackPressed() {
        // เมื่อกดปุ่มย้อนกลับให้บังคับให้รับทราบการแจ้งเตือน
        requestAcknowledgment();
    }
}
