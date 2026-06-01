package com.dmind.app.ui.screens.guide

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Assistant
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Help
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.components.WatchYellow

@Composable
fun AppGuideScreen(onBackClick: () -> Unit) {
    var activeTab by remember { mutableStateOf("overview") }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            // Header with Brand Gradient
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(
                            listOf(Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFEC4899))
                        )
                    )
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 24.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("คู่มือการใช้งาน", style = MaterialTheme.typography.titleLarge, color = Color.White, fontWeight = FontWeight.Bold)
                        Text("D-MIND Application Guide", style = MaterialTheme.typography.bodySmall, color = Color.White.copy(alpha = 0.7f))
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Tab Pill Row
            TabPillsRow(
                selectedTab = activeTab,
                onTabSelected = { activeTab = it }
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Tab Content
            Box(modifier = Modifier.weight(1f)) {
                when (activeTab) {
                    "overview" -> OverviewTabContent()
                    "features" -> FeaturesTabContent()
                    "tips" -> TipsTabContent()
                }
            }
        }
    }
}

@Composable
private fun TabPillsRow(
    selectedTab: String,
    onTabSelected: (String) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            val tabs = listOf(
                TabItem("overview", "ภาพรวม"),
                TabItem("features", "ฟีเจอร์"),
                TabItem("tips", "เคล็ดลับ")
            )

            tabs.forEach { tab ->
                val selected = selectedTab == tab.id
                val backgroundModifier = if (selected) {
                    Modifier.background(
                        Brush.horizontalGradient(listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))),
                        shape = RoundedCornerShape(12.dp)
                    )
                } else {
                    Modifier
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxSize()
                        .then(backgroundModifier)
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { onTabSelected(tab.id) },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = tab.label,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                        color = if (selected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}

private data class TabItem(val id: String, val label: String)

@Composable
private fun OverviewTabContent() {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item {
            DmindCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(Icons.Default.Info, DmindBlue)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("ยินดีต้อนรับสู่ D-MIND", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "D-MIND คือระบบติดตามภัยพิบัติและแจ้งเตือนอัจฉริยะที่ออกแบบมาเพื่อช่วยเหลือประชาชนในการเฝ้าระวัง เตรียมพร้อม และรับมือกับภัยพิบัติทางธรรมชาติต่างๆ ได้อย่างทันท่วงทีและปลอดภัย",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text("จุดประสงค์หลักของเรา:", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                val goals = listOf(
                    "ติดตามสถานการณ์ภัยพิบัติในประเทศไทยแบบเรียลไทม์",
                    "ระบบแจ้งเตือนภัยล่วงหน้าที่แม่นยำตามพิกัดพื้นที่ของคุณ",
                    "ให้คำแนะนำวิธีปฏิบัติตนและการปฐมพยาบาลเบื้องต้นโดยระบบ AI อัจฉริยะ"
                )
                goals.forEach { goal ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text("• ", fontWeight = FontWeight.Bold, color = DmindBlue)
                        Text(goal, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }

        item {
            Text("วิธีเริ่มต้นใช้งาน", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }

        val steps = listOf(
            StepData("1", "เปิดใช้งานพิกัดและสิทธิ์แจ้งเตือน", "เปิดสิทธิ์ GPS และ Notification ในหน้าตั้งค่า เพื่อให้ระบบเฝ้าระวังและสามารถแจ้งเตือนท่านได้ทันท่วงทีเมื่อมีภัยพิบัติเข้ามาใกล้ตัว"),
            StepData("2", "ตรวจสอบแดชบอร์ดและหน้าแผนที่", "แดชบอร์ดหลักจะสรุปจำนวนภัยพิบัติล่าสุด และแสดงสถานะปัจจุบัน ส่วนหน้าแผนที่แสดงเลเยอร์ข้อมูลแบบรหัสสีเรียลไทม์"),
            StepData("3", "ใช้งานระบบแจ้งเหตุและ AI", "หากต้องการความช่วยเหลือด่วนสามารถกดแจ้ง SOS หรือพิมพ์ปรึกษาอาการและวิธีการรับมือกับ Dr.Mind AI ผู้ช่วยอัจฉริยะได้ตลอดเวลา")
        )

        itemsIndexed(steps) { _, step ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.Top
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(DmindBlue.copy(alpha = 0.1f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(step.number, color = DmindBlue, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(step.title, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(step.desc, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

private data class StepData(val number: String, val title: String, val desc: String)

@Composable
private fun FeaturesTabContent() {
    val features = listOf(
        FeatureData(Icons.Filled.Public, "แผนที่ภัยพิบัติเรียลไทม์", "แสดงตำแหน่งภัยพิบัติ จุดความร้อน VIIRS ปริมาณฝนสะสม และระดับดินถล่มแบบกราฟิกบนแผนที่ MapLibre เชิงพิกัด"),
        FeatureData(Icons.Filled.Notifications, "ระบบแจ้งเตือนล่วงหน้า", "รับข้อความแจ้งเตือนสำคัญทันทีเมื่อตรวจพบว่าพิกัดของท่านอยู่ในพื้นที่ประกาศเตือนภัยพิบัติสีเหลือง ส้ม หรือแดง"),
        FeatureData(Icons.Filled.Assistant, "ผู้ช่วยอัจฉริยะ Dr.Mind", "แชทบอทวิเคราะห์สถานการณ์ ปรึกษาวิธีปฏิบัติตน ค้นหาพื้นที่ปลอดภัย และให้คำแนะนำทางการแพทย์และรับมือฉุกเฉินเบื้องต้น"),
        FeatureData(Icons.Filled.MenuBook, "คู่มือรับมือภัยพิบัติฉุกเฉิน", "รวบรวมข้อมูลแนวทางการปฏิบัติตนเบื้องต้นเมื่อเกิด แผ่นดินไหว น้ำท่วม พายุ หรืออัคคีภัย เพื่อช่วยรักษาความปลอดภัยของตนเอง"),
        FeatureData(Icons.Filled.Shield, "รายงานผู้ประสบภัย (Victim Reports)", "ให้ผู้ใช้ส่งแบบฟอร์มยืนยันความปลอดภัยหรือระบุระดับผลกระทบ พร้อมพิกัด เพื่อส่งต่อการประสานความช่วยเหลือไปยังเจ้าหน้าที่"),
        FeatureData(Icons.Filled.Place, "ค้นหาศูนย์พักพิงใกล้ตัว (Shelter)", "ระบบแสดงตำแหน่งศูนย์พักพิงฉุกเฉิน วัดระยะห่างจากที่อยู่ปัจจุบัน แสดงระดับความหนาแน่นและโทรติดต่อสอบถามได้")
    )

    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        itemsIndexed(features) { _, feature ->
            DmindCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(feature.icon, DmindBlue)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(feature.title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(feature.desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

private data class FeatureData(val icon: ImageVector, val title: String, val desc: String)

@Composable
private fun TipsTabContent() {
    val tips = listOf(
        TipData("การใช้งานแผนที่อัจฉริยะ", "ใช้นิ้วหุบและขยายเพื่อซูมแผนที่ และเลือกเปิด/ปิดเลเยอร์สถานี ข้อมูลVIIRS หรือข้อมูลฝนได้ที่ปุ่มมุมขวาของหน้าจอแผนที่", WatchYellow),
        TipData("ปรึกษา Dr.Mind AI ให้ได้ผลลัพธ์ที่ดี", "ถามคำถามสั้นๆ ชัดเจนและระบุประเภทภัยหรืออาการ เช่น 'น้ำท่วมควรกทำอย่างไร' หรือ 'แผลน้ำร้อนลวกปฐมพยาบาลอย่างไร' เพื่อรับคำแนะนำการรักษาที่ตรงจุด", SafeGreen),
        TipData("เปิดการแจ้งเตือนและการทำงานเบื้องหลัง", "ในหน้าการตั้งค่าแอปพลิเคชัน โปรดทำการยกเว้นการประหยัดแบตเตอรี่ (Battery Bypass) เพื่อรับข่าวสารแจ้งเตือนสำคัญได้ทันเวลาแม้ยามหน้าจอปิดอยู่", DmindBlue),
        TipData("การกดขอความช่วยเหลือ SOS", "กด SOS ค้างไว้ในหน้าหลักเมื่อต้องการความช่วยเหลือฉุกเฉินด่วนที่สุด ระบบจะส่งพิกัดความละเอียดสูง GPS ไปยังศูนย์ประสานงานกู้ชีพทันที", CriticalRed)
    )

    val faqs = listOf(
        FaqData("แอปพลิเคชัน D-MIND ใช้งานได้ฟรีหรือไม่?", "แอปพลิเคชันนี้เปิดให้ใช้งานได้ฟรีโดยไม่มีค่าใช้จ่ายใดๆ ทั้งสิ้น พัฒนาขึ้นมาภายใต้โครงการช่วยเหลือประชาชนเพื่อความปลอดภัยและบรรเทาสาธารณภัยพิบัติของประเทศ"),
        FaqData("ข้อมูลสภาพอากาศและภัยพิบัติอัปเดตบ่อยแค่ไหน?", "ข้อมูลสภาพอากาศจะอัปเดตทุกชั่วโมงจากกรมอุตุนิยมวิทยา ข้อมูลจุดความร้อน VIIRS อัปเดตทุก 6-12 ชั่วโมง และข้อมูลปริมาณน้ำฝนอัปเดตต่อเนื่องทุกๆ 5-15 นาที ตามรอบการส่งสัญญาณของอุปกรณ์ตรวจวัด")
    )

    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Lightbulb, contentDescription = null, tint = WatchYellow, modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("เคล็ดลับการใช้งานสำคัญ", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }
        }

        itemsIndexed(tips) { _, tip ->
            DmindCard(contentPadding = PaddingValues(0.dp)) {
                Row(modifier = Modifier.fillMaxWidth().height(IntrinsicSize.Min)) {
                    // Left color accent bar
                    Box(
                        modifier = Modifier
                            .width(6.dp)
                            .fillMaxSize()
                            .background(tip.accentColor)
                    )
                    
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(tip.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = tip.accentColor)
                        Text(tip.desc, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Help, contentDescription = null, tint = DmindBlue, modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("คำถามที่พบบ่อย (FAQ)", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }
        }

        itemsIndexed(faqs) { _, faq ->
            DmindCard {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Q: ${faq.question}", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurface)
                    Text("A: ${faq.answer}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

private data class TipData(val title: String, val desc: String, val accentColor: Color)
private data class FaqData(val question: String, val answer: String)
