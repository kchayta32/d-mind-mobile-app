package com.dmind.app.model;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.util.Locale;

// ทดสอบว่า payload ของ SOSMessage ตรงกับ SosRequest ของ backend และไม่ขึ้นกับ Locale ของเครื่อง
public class SOSMessageTest {

    private Locale previousLocale;

    @Before
    public void setUp() {
        previousLocale = Locale.getDefault();
    }

    @After
    public void tearDown() {
        Locale.setDefault(previousLocale);
    }

    private SOSMessage sampleMessage() {
        SOSMessage message = new SOSMessage();
        message.setId(7);
        message.setUserId("install-123");
        message.setLatitude(13.7563);
        message.setLongitude(100.5018);
        message.setBatteryLevel(42);
        message.setMessage("ต้องการความช่วยเหลือ \"ด่วน\"\nชั้น 2");
        message.setStatus("pending");
        message.setCreatedAt(1_700_000_000_000L);
        return message;
    }

    // ชื่อฟิลด์ต้องตรงกับ SosRequest(userId, latitude, longitude, batteryLevel, message) ที่ backend รับ
    @Test
    public void toJson_usesBackendSosRequestFieldNames() throws Exception {
        JSONObject json = new JSONObject(sampleMessage().toJson());

        assertEquals("install-123", json.getString("userId"));
        assertEquals(13.7563, json.getDouble("latitude"), 0.000001);
        assertEquals(100.5018, json.getDouble("longitude"), 0.000001);
        assertEquals(42, json.getInt("batteryLevel"));
        assertEquals("7", json.getString("id"));
        assertEquals("ต้องการความช่วยเหลือ \"ด่วน\"\nชั้น 2", json.getString("message"));
    }

    // ทศนิยมต้องเป็น '.' เสมอแม้ Locale ของเครื่องใช้ ',' (เช่น de_DE) มิฉะนั้น JSON จะพัง
    @Test
    public void toJson_isValidJsonUnderCommaDecimalLocale() throws Exception {
        Locale.setDefault(Locale.GERMANY);

        String raw = sampleMessage().toJson();
        JSONObject json = new JSONObject(raw);

        assertEquals(13.7563, json.getDouble("latitude"), 0.000001);
        assertTrue(raw.contains("13.7563"));
    }

    // userId ว่างต้องถูกแทนด้วย "anonymous" เพื่อให้ backend รับได้
    @Test
    public void toJson_defaultsMissingUserIdToAnonymous() throws Exception {
        SOSMessage message = sampleMessage();
        message.setUserId(null);

        JSONObject json = new JSONObject(message.toJson());

        assertEquals("anonymous", json.getString("userId"));
    }

    // fromJson ต้องอ่านค่ากลับได้จาก payload ที่ toJson สร้าง
    @Test
    public void fromJson_roundTripsCoreFields() {
        SOSMessage original = sampleMessage();
        SOSMessage parsed = SOSMessage.fromJson(original.toJson());

        assertEquals(original.getId(), parsed.getId());
        assertEquals(original.getUserId(), parsed.getUserId());
        assertEquals(original.getLatitude(), parsed.getLatitude(), 0.000001);
        assertEquals(original.getLongitude(), parsed.getLongitude(), 0.000001);
        assertEquals(original.getBatteryLevel(), parsed.getBatteryLevel());
        assertEquals(original.getMessage(), parsed.getMessage());
        assertEquals(original.getCreatedAt(), parsed.getCreatedAt());
    }
}
