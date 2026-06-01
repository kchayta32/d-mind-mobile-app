package com.dmind.app.ui.screens.tools

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.components.StatusPill

// หน้าจอแสดงเบอร์โทรศัพท์ฉุกเฉินและการโทรติดต่อหน่วยงานต่างๆ
@Composable
fun EmergencyContactsScreen() {
    val context = LocalContext.current
    val contacts = listOf(
        EmergencyContact(stringResource(R.string.contact_police), "191", stringResource(R.string.contact_police_desc)),
        EmergencyContact(stringResource(R.string.contact_medical), "1669", stringResource(R.string.contact_medical_desc)),
        EmergencyContact(stringResource(R.string.contact_disaster), "1784", stringResource(R.string.contact_disaster_desc)),
        EmergencyContact(stringResource(R.string.contact_fire), "199", stringResource(R.string.contact_fire_desc)),
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ScreenHeader(
                stringResource(R.string.emergency_contacts_title),
                stringResource(R.string.emergency_contacts_subtitle),
                Icons.Filled.Phone,
            )
        }
        items(contacts) { contact ->
            DmindCard(
                modifier = Modifier
                    .padding(horizontal = 18.dp)
                    .clickable {
                        context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${contact.phone}")))
                    },
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(Icons.Filled.Phone, CriticalRed)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(contact.name, fontWeight = FontWeight.Bold)
                        Text(contact.description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    }
                    StatusPill(contact.phone, CriticalRed)
                }
            }
        }
    }
}

private data class EmergencyContact(
    val name: String,
    val phone: String,
    val description: String,
)
