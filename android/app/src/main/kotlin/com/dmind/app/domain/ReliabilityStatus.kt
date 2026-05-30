package com.dmind.app.domain

// คลาสเก็บข้อมูลสถานะความพร้อมและความเสถียรของฟังก์ชันสำคัญในแอปพลิเคชัน (ความพร้อมของระบบ)
data class ReliabilityStatus(
    // ตรวจสอบว่าได้รับการอนุญาตการเข้าถึงตำแหน่งที่ตั้ง (Location Permission) หรือไม่
    val locationGranted: Boolean,
    // ตรวจสอบว่าได้รับการอนุญาตการเข้าถึงตำแหน่งเบื้องหลัง (Background Location Permission) หรือไม่
    val backgroundLocationGranted: Boolean,
    // ตรวจสอบว่าได้รับการอนุญาตการแจ้งเตือน (Notification Permission) หรือไม่
    val notificationGranted: Boolean,
    // ตรวจสอบว่าปิดการปรับแต่งแบตเตอรี่ (Ignore Battery Optimizations) สำหรับแอปนี้แล้วหรือไม่
    val batteryIgnoring: Boolean,
    // ตรวจสอบว่าสามารถเข้าถึงหรือข้ามโหมดห้ามรบกวน (Do Not Disturb) ได้หรือไม่
    val dndGranted: Boolean,
    // ตรวจสอบว่าระบบเฝ้าระวังหรือตรวจสอบความปลอดภัยทำงานอยู่หรือไม่
    val monitoring: Boolean,
    // จำนวนรายงาน SOS ที่ค้างอยู่ในคิวและยังไม่ได้ส่งสำเร็จ
    val pendingSOSCount: Int,
    // ตรวจสอบว่ามีการกำหนดค่าที่อยู่เซิร์ฟเวอร์ (Endpoint) สำหรับส่งสัญญาณ SOS ไว้หรือไม่
    val sosEndpointConfigured: Boolean,
    // ตรวจสอบว่ามีการกำหนดค่าที่อยู่เซิร์ฟเวอร์สำหรับส่ง FCM Token หรือไม่
    val fcmTokenEndpointConfigured: Boolean,
    // ตรวจสอบว่ามี FCM Token สำหรับใช้งานบนเครื่องแล้วหรือไม่
    val fcmTokenAvailable: Boolean,
)
