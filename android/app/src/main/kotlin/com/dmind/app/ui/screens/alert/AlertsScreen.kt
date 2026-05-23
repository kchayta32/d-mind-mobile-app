package com.dmind.app.ui.screens.alert

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.data.supabase.NotificationRecord
import com.dmind.app.data.supabase.RealtimeAlertRecord
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.EmptyState
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.ui.viewmodel.AlertsUiState

@Composable
fun AlertsScreen(
    state: AlertsUiState,
    onRefresh: () -> Unit,
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
                title = stringResource(R.string.alerts_title),
                subtitle = stringResource(R.string.alerts_subtitle),
                icon = Icons.Filled.Notifications,
                trailing = {
                    IconButton(onClick = onRefresh) {
                        Icon(Icons.Filled.Refresh, contentDescription = stringResource(R.string.btn_refresh))
                    }
                },
            )
        }

        if (state.isLoading) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    CircularProgressIndicator()
                    Text(stringResource(R.string.loading_alerts), modifier = Modifier.padding(top = 12.dp))
                }
            }
        }

        state.errorMessage?.let { message ->
            item {
                DmindCard(Modifier.padding(horizontal = 18.dp)) {
                    Text(stringResource(R.string.alert_data_unavailable), fontWeight = FontWeight.Bold)
                    Text(message, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                }
            }
        }

        item {
            Text(
                stringResource(R.string.active_alerts),
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 20.dp),
            )
        }

        if (state.alerts.isEmpty() && !state.isLoading) {
            item {
                EmptyState(
                    title = stringResource(R.string.no_active_alerts),
                    message = stringResource(R.string.no_active_alerts_message),
                    icon = Icons.Filled.Notifications,
                )
            }
        } else {
            items(state.alerts, key = { it.id }) { alert ->
                AlertCard(alert = alert, modifier = Modifier.padding(horizontal = 18.dp))
            }
        }

        item {
            Text(
                stringResource(R.string.notification_history),
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .padding(horizontal = 20.dp)
                    .padding(top = 8.dp),
            )
        }

        if (state.notifications.isEmpty() && !state.isLoading) {
            item {
                EmptyState(
                    title = stringResource(R.string.no_notifications),
                    message = stringResource(R.string.no_notifications_message),
                    icon = Icons.Filled.Notifications,
                )
            }
        } else {
            items(state.notifications, key = { it.id }) { notification ->
                NotificationCard(notification = notification, modifier = Modifier.padding(horizontal = 18.dp))
            }
        }
    }
}

@Composable
private fun AlertCard(
    alert: RealtimeAlertRecord,
    modifier: Modifier = Modifier,
) {
    val color = if (alert.severityLevel >= 4) CriticalRed else AffectedOrange
    DmindCard(modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconBubble(Icons.Filled.Warning, color)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(alert.title, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(alert.message, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, maxLines = 2)
            }
            StatusPill("S${alert.severityLevel}", color)
        }
        Text(
            stringResource(R.string.alert_radius_format, alert.radiusKm.toInt(), alert.createdAt ?: stringResource(R.string.label_latest)),
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun NotificationCard(
    notification: NotificationRecord,
    modifier: Modifier = Modifier,
) {
    DmindCard(modifier = modifier, contentPadding = PaddingValues(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconBubble(Icons.Filled.Notifications, DmindBlue, Modifier.size(38.dp))
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(notification.title, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(notification.message, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, maxLines = 2)
            }
            StatusPill(
                if (notification.readAt == null) stringResource(R.string.status_new) else stringResource(R.string.status_read),
                DmindBlue,
            )
        }
    }
}
