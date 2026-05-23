package com.dmind.app.ui.screens.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.domain.ReliabilityStatus
import com.dmind.app.network.BackendConfig
import com.dmind.app.network.SupabaseConfig
import com.dmind.app.network.ThaiLlmConfig
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.util.LocaleManager

import androidx.compose.material.icons.filled.Star
import androidx.compose.foundation.clickable

@Composable
fun SettingsScreen(
    status: ReliabilityStatus,
    darkTheme: Boolean,
    currentLanguage: String,
    onToggleDarkTheme: () -> Unit,
    onChangeLanguage: (String) -> Unit,
    onRequestLocation: () -> Unit,
    onRequestNotifications: () -> Unit,
    onOpenBatterySettings: () -> Unit,
    onOpenDndSettings: () -> Unit,
    onRefreshFcm: () -> Unit,
    onOpenSatisfactionSurvey: () -> Unit,
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ScreenHeader(
                title = stringResource(R.string.settings_title),
                subtitle = stringResource(R.string.settings_subtitle),
                icon = Icons.Filled.Settings,
            )
        }

        // Language Selector
        item {
            DmindCard(Modifier.padding(horizontal = 18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(Icons.Filled.Language, DmindBlue)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(stringResource(R.string.settings_language), fontWeight = FontWeight.Bold)
                        Text(stringResource(R.string.settings_language_subtitle), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    }
                }
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(
                        selected = currentLanguage == LocaleManager.THAI,
                        onClick = { onChangeLanguage(LocaleManager.THAI) },
                        label = { Text(stringResource(R.string.language_thai)) },
                    )
                    FilterChip(
                        selected = currentLanguage == LocaleManager.ENGLISH,
                        onClick = { onChangeLanguage(LocaleManager.ENGLISH) },
                        label = { Text(stringResource(R.string.language_english)) },
                    )
                }
            }
        }

        // Theme Toggle
        item {
            DmindCard(Modifier.padding(horizontal = 18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(if (darkTheme) Icons.Filled.DarkMode else Icons.Filled.WbSunny, DmindBlue)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(stringResource(R.string.settings_theme), fontWeight = FontWeight.Bold)
                        Text(
                            if (darkTheme) stringResource(R.string.dark_mode) else stringResource(R.string.light_mode),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp,
                        )
                    }
                    Switch(checked = darkTheme, onCheckedChange = { onToggleDarkTheme() })
                }
            }
        }

        // Satisfaction Survey Card
        item {
            DmindCard(Modifier.padding(horizontal = 18.dp).clickable { onOpenSatisfactionSurvey() }) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(Icons.Filled.Star, DmindBlue)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(stringResource(R.string.nav_satisfaction_survey), fontWeight = FontWeight.Bold)
                        Text(stringResource(R.string.survey_screen_subtitle), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    }
                    Text("›", fontSize = 28.sp, fontWeight = FontWeight.Light, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }

        // Reliability Checklist
        item {
            DmindCard(Modifier.padding(horizontal = 18.dp)) {
                Text(stringResource(R.string.reliability_checklist), fontWeight = FontWeight.Bold)
                PermissionRow(stringResource(R.string.permission_location), status.locationGranted, Icons.Filled.LocationOn, onRequestLocation)
                PermissionRow(stringResource(R.string.permission_notification), status.notificationGranted, Icons.Filled.Notifications, onRequestNotifications)
                PermissionRow(stringResource(R.string.permission_battery), status.batteryIgnoring, Icons.Filled.Security, onOpenBatterySettings)
                PermissionRow(stringResource(R.string.permission_dnd), status.dndGranted, Icons.Filled.Security, onOpenDndSettings)
                PermissionRow(stringResource(R.string.permission_fcm), status.fcmTokenAvailable, Icons.Filled.Notifications, onRefreshFcm)
            }
        }

        // Configuration
        item {
            DmindCard(Modifier.padding(horizontal = 18.dp)) {
                Text(stringResource(R.string.settings_configuration), fontWeight = FontWeight.Bold)
                ConfigRow(stringResource(R.string.config_backend), BackendConfig.baseUrl)
                ConfigRow(stringResource(R.string.config_supabase_project), SupabaseConfig.projectId.ifBlank { stringResource(R.string.config_not_configured) })
                ConfigRow(stringResource(R.string.config_supabase_url), if (SupabaseConfig.isConfigured) stringResource(R.string.config_configured) else stringResource(R.string.config_not_configured))
                ConfigRow(stringResource(R.string.config_drmind_model), ThaiLlmConfig.model)
                ConfigRow(stringResource(R.string.config_thai_llm), if (ThaiLlmConfig.isConfigured) stringResource(R.string.config_configured) else stringResource(R.string.config_not_configured))
                Text(
                    stringResource(R.string.config_note),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp,
                )
            }
        }
    }
}

@Composable
private fun PermissionRow(
    label: String,
    ready: Boolean,
    icon: ImageVector,
    onClick: () -> Unit,
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        IconBubble(icon, if (ready) SafeGreen else AffectedOrange)
        Spacer(Modifier.width(10.dp))
        Text(label, modifier = Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
        StatusPill(
            if (ready) stringResource(R.string.status_ready) else stringResource(R.string.status_setup),
            if (ready) SafeGreen else AffectedOrange,
        )
        Spacer(Modifier.width(8.dp))
        Button(onClick = onClick, contentPadding = PaddingValues(horizontal = 12.dp)) {
            Text(if (ready) stringResource(R.string.btn_open) else stringResource(R.string.btn_fix))
        }
    }
}

@Composable
private fun ConfigRow(
    label: String,
    value: String,
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(label, modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, fontWeight = FontWeight.SemiBold, maxLines = 1)
    }
}
