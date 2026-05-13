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
public class BatteryOptimizationSettingsActivity extends AppCompatActivity {

    private static final int REQUEST_IGNORE_BATTERY_OPTIMIZATION = 1001;

    private TextView statusTextView;
    private Button actionButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_battery_optimization);

        statusTextView = findViewById(R.id.textViewBatteryStatus);
        actionButton = findViewById(R.id.buttonEnableBatteryOptimization);
        actionButton.setOnClickListener(v -> requestBatteryOptimizationBypass());

        checkBatteryOptimizationStatus();
    }

    @Override
    protected void onResume() {
        super.onResume();
        checkBatteryOptimizationStatus();
    }

    private void checkBatteryOptimizationStatus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            boolean isIgnoring = powerManager != null && powerManager.isIgnoringBatteryOptimizations(getPackageName());

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
            statusTextView.setText(R.string.battery_optimization_not_supported);
            actionButton.setVisibility(View.GONE);
        }
    }

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

    private void openBatteryOptimizationSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            startActivity(intent);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_IGNORE_BATTERY_OPTIMIZATION) {
            checkBatteryOptimizationStatus();
        }
    }
}
