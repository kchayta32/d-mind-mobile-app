package com.dmind.app.activity;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.dmind.app.R;

/**
 * Guides the user to allow background execution so disaster monitoring can
 * keep running when Android battery optimization is aggressive.
 */
// หน้าจอสำหรับตั้งค่าการยกเว้นการประหยัดแบตเตอรี่ เพื่อให้ระบบตรวจสอบภัยพิบัติทำงานในเบื้องหลังได้
public class BatteryOptimizationSettingsActivity extends AppCompatActivity {

    // รหัสคำขอสำหรับการขออนุญาตข้ามโหมดประหยัดแบตเตอรี่
    private static final int REQUEST_IGNORE_BATTERY_OPTIMIZATION = 1001;

    // ส่วนแสดงผลข้อความสถานะและปุ่มกดบนหน้าจอ UI
    private TextView statusTextView;
    private Button actionButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_battery_optimization);

        // กำหนดปุ่มและข้อความแสดงสถานะ พร้อมผูกฟังก์ชันการคลิก
        statusTextView = findViewById(R.id.textViewBatteryStatus);
        actionButton = findViewById(R.id.buttonEnableBatteryOptimization);
        actionButton.setOnClickListener(v -> requestBatteryOptimizationBypass());

        // ตรวจสอบสถานะการประหยัดแบตเตอรี่เมื่อสร้างหน้าจอ
        checkBatteryOptimizationStatus();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // ตรวจสอบสถานะการประหยัดแบตเตอรี่อีกครั้งเมื่อผู้ใช้กลับมาที่หน้าจอ
        checkBatteryOptimizationStatus();
    }

    // ฟังก์ชันตรวจสอบสถานะการตั้งค่าประหยัดแบตเตอรี่ของอุปกรณ์
    private void checkBatteryOptimizationStatus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            boolean isIgnoring = powerManager != null && powerManager.isIgnoringBatteryOptimizations(getPackageName());

            // ปรับเปลี่ยนการแสดงผลและคำสั่งบนปุ่มตามสถานะการจำกัดการทำงานเบื้องหลัง
            if (isIgnoring) {
                statusTextView.setText(R.string.battery_optimization_enabled);
                statusTextView.setTextColor(getColor(R.color.successGreen));
                actionButton.setText(R.string.button_disable);
                actionButton.setOnClickListener(v -> openBatteryOptimizationSettings());
            } else {
                statusTextView.setText(R.string.battery_optimization_disabled);
                statusTextView.setTextColor(getColor(R.color.warningOrange));
                actionButton.setText(R.string.button_enable);
                actionButton.setOnClickListener(v -> requestBatteryOptimizationBypass());
            }
        } else {
            // กรณีระบบปฏิบัติการ Android ต่ำกว่าเวอร์ชัน M ที่ยังไม่รองรับระบบประหยัดแบตเตอรี่นี้
            statusTextView.setText(R.string.battery_optimization_not_supported);
            actionButton.setVisibility(View.GONE);
        }
    }

    // ฟังก์ชันร้องขอการยกเว้นการจำกัดพลังงานแบบข้ามหน้าจอ (Direct Request Dialog)
    private void requestBatteryOptimizationBypass() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            Toast.makeText(this, "Battery optimization is not supported on this Android version.", Toast.LENGTH_LONG).show();
            return;
        }

        try {
            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(android.net.Uri.parse("package:" + getPackageName()));
            startActivityForResult(intent, REQUEST_IGNORE_BATTERY_OPTIMIZATION);
        } catch (Exception e) {
            Toast.makeText(this, "Open battery settings and allow background run for D-MIND.", Toast.LENGTH_LONG).show();
            openBatteryOptimizationSettings();
        }
    }

    // ฟังก์ชันเปิดหน้าตั้งค่าการเพิ่มประสิทธิภาพแบตเตอรี่หลักของระบบ
    private void openBatteryOptimizationSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            startActivity(intent);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // ตรวจสอบผลลัพธ์การร้องขอเมื่อกลับมาที่หน้านี้เพื่ออัปเดต UI
        if (requestCode == REQUEST_IGNORE_BATTERY_OPTIMIZATION) {
            checkBatteryOptimizationStatus();
        }
    }
}
