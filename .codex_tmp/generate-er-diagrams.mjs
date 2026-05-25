import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = dirname(fileURLToPath(import.meta.url));
mkdirSync(outDir, { recursive: true });

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fieldLines(fields) {
  return fields
    .map((field) => `<text class="field" x="18" y="${field.y}">${esc(field.text)}</text>`)
    .join("\n");
}

function table(entity) {
  const rowGap = entity.rowGap ?? 24;
  const fields = entity.fields.map((text, index) => ({
    text,
    y: (entity.headerHeight ?? 58) + 30 + index * rowGap,
  }));
  return `
  <g class="entity ${entity.kind ?? "neutral"}" transform="translate(${entity.x},${entity.y})">
    <rect class="entity-bg" width="${entity.w}" height="${entity.h}" rx="8"/>
    <rect class="entity-head" width="${entity.w}" height="${entity.headerHeight ?? 58}" rx="8"/>
    <path class="head-cut" d="M0 ${entity.headerHeight ?? 58} H${entity.w}"/>
    <text class="entity-title" x="${entity.w / 2}" y="26" text-anchor="middle">${esc(entity.title)}</text>
    <text class="entity-subtitle" x="${entity.w / 2}" y="48" text-anchor="middle">${esc(entity.subtitle ?? "")}</text>
    ${fieldLines(fields)}
  </g>`;
}

function groupBox(group) {
  return `
  <g class="group">
    <rect x="${group.x}" y="${group.y}" width="${group.w}" height="${group.h}" rx="14"/>
    <text class="group-label" x="${group.x + 18}" y="${group.y + 30}">${esc(group.label)}</text>
  </g>`;
}

function relation(rel) {
  const cls = ["relation", rel.kind ?? "solid", rel.dashed ? "dashed" : ""].join(" ");
  const path = rel.path ?? `M${rel.x1} ${rel.y1} L${rel.x2} ${rel.y2}`;
  const label = rel.label
    ? `<text class="rel-label" x="${rel.lx}" y="${rel.ly}" text-anchor="${rel.anchor ?? "middle"}">${esc(rel.label)}</text>`
    : "";
  return `
  <g>
    <path class="${cls}" d="${path}"/>
    ${label}
  </g>`;
}

function note(note) {
  const lines = note.lines.map((line, index) =>
    `<text class="note-line" x="${note.x + 18}" y="${note.y + 44 + index * 22}">${esc(line)}</text>`
  ).join("\n");
  return `
  <g class="note">
    <rect x="${note.x}" y="${note.y}" width="${note.w}" height="${note.h}" rx="8"/>
    <text class="note-title" x="${note.x + 18}" y="${note.y + 24}">${esc(note.title)}</text>
    ${lines}
  </g>`;
}

function render({ title, subtitle, width = 1600, height = 1100, groups = [], entities, relations = [], notes = [] }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .bg { fill: #f7f9fc; }
      .page-title { font: 700 38px Arial, Helvetica, sans-serif; fill: #111827; }
      .page-subtitle { font: 18px Arial, Helvetica, sans-serif; fill: #536171; }
      .group rect { fill: #eef2f7; stroke: #cbd5e1; stroke-width: 1.4; }
      .group-label { font: 700 18px Arial, Helvetica, sans-serif; fill: #334155; }
      .entity-bg { fill: #ffffff; stroke-width: 2.4; }
      .entity-head { stroke-width: 0; }
      .head-cut { stroke: rgba(17,24,39,.18); stroke-width: 1.2; }
      .entity-title { font: 700 19px Arial, Helvetica, sans-serif; fill: #111827; }
      .entity-subtitle { font: 13px Arial, Helvetica, sans-serif; fill: #4b5563; }
      .field { font: 15px Consolas, "Courier New", monospace; fill: #1f2937; }
      .core .entity-bg { stroke: #2563eb; }
      .core .entity-head { fill: #dbeafe; }
      .active .entity-bg { stroke: #059669; }
      .active .entity-head { fill: #d1fae5; }
      .remote .entity-bg { stroke: #7c3aed; }
      .remote .entity-head { fill: #ede9fe; }
      .event .entity-bg { stroke: #ea580c; }
      .event .entity-head { fill: #ffedd5; }
      .support .entity-bg { stroke: #0f766e; }
      .support .entity-head { fill: #ccfbf1; }
      .external .entity-bg { stroke: #64748b; }
      .external .entity-head { fill: #e2e8f0; }
      .relation { fill: none; stroke: #334155; stroke-width: 2.2; marker-end: url(#arrow); }
      .relation.solid { stroke: #334155; }
      .relation.logic { stroke: #0f766e; marker-end: url(#arrow-teal); }
      .relation.remote { stroke: #7c3aed; marker-end: url(#arrow-purple); }
      .relation.event { stroke: #ea580c; marker-end: url(#arrow-orange); }
      .relation.dashed { stroke-dasharray: 8 8; }
      .rel-label { font: 700 14px Arial, Helvetica, sans-serif; fill: #111827; paint-order: stroke; stroke: #f7f9fc; stroke-width: 5px; stroke-linejoin: round; }
      .note rect { fill: #fff7ed; stroke: #fdba74; stroke-width: 1.8; }
      .note-title { font: 700 17px Arial, Helvetica, sans-serif; fill: #9a3412; }
      .note-line { font: 14px Arial, Helvetica, sans-serif; fill: #7c2d12; }
    </style>
    <marker id="arrow" markerWidth="11" markerHeight="11" refX="9" refY="5.5" orient="auto">
      <path d="M1,1 L10,5.5 L1,10 Z" fill="#334155"/>
    </marker>
    <marker id="arrow-teal" markerWidth="11" markerHeight="11" refX="9" refY="5.5" orient="auto">
      <path d="M1,1 L10,5.5 L1,10 Z" fill="#0f766e"/>
    </marker>
    <marker id="arrow-purple" markerWidth="11" markerHeight="11" refX="9" refY="5.5" orient="auto">
      <path d="M1,1 L10,5.5 L1,10 Z" fill="#7c3aed"/>
    </marker>
    <marker id="arrow-orange" markerWidth="11" markerHeight="11" refX="9" refY="5.5" orient="auto">
      <path d="M1,1 L10,5.5 L1,10 Z" fill="#ea580c"/>
    </marker>
  </defs>
  <rect class="bg" width="${width}" height="${height}"/>
  <text class="page-title" x="${width / 2}" y="54" text-anchor="middle">${esc(title)}</text>
  <text class="page-subtitle" x="${width / 2}" y="84" text-anchor="middle">${esc(subtitle)}</text>
  ${groups.map(groupBox).join("\n")}
  ${relations.map(relation).join("\n")}
  ${entities.map(table).join("\n")}
  ${notes.map(note).join("\n")}
</svg>`;
}

const diagrams = [
  {
    file: "er-v1-room-local.svg",
    title: "V1 - Android Room ERD (Declared Local Schema)",
    subtitle: "Source: DMindRoomDatabase.kt, @Database version 1. No explicit Room foreign keys are declared.",
    groups: [
      { x: 54, y: 120, w: 1492, h: 790, label: "Room database: DMindRoomDatabase" },
    ],
    entities: [
      {
        x: 110, y: 190, w: 330, h: 300, kind: "core", title: "alerts", subtitle: "AlertEntity",
        fields: [
          "[PK] id: Long AUTOINCREMENT",
          "type: String",
          "level: String",
          "title: String",
          "message: String",
          "timestamp: Long",
          "isRead: Boolean = false",
          "DAO: latestAlerts()",
        ],
      },
      {
        x: 635, y: 190, w: 360, h: 330, kind: "core", title: "sos_queue", subtitle: "SosQueueEntity",
        fields: [
          "[PK] id: Long AUTOINCREMENT",
          "userId: String",
          "latitude: Double",
          "longitude: Double",
          "batteryLevel: Int",
          "message: String",
          "status: String = pending",
          "createdAt: Long",
          "sentAt: Long?",
          "DAO: pendingMessages()",
        ],
      },
      {
        x: 1120, y: 190, w: 360, h: 330, kind: "core", title: "danger_zones", subtitle: "DangerZoneEntity",
        fields: [
          "[PK] id: Long",
          "name: String",
          "type: String",
          "alertTitle: String",
          "alertMessage: String",
          "polygonJson: String",
          "createdAt: Long",
          "expiresAt: Long",
          "isEnabled: Boolean = true",
          "DAO: activeZones()",
        ],
      },
      {
        x: 635, y: 650, w: 360, h: 240, kind: "core", title: "location_history", subtitle: "LocationHistoryEntity",
        fields: [
          "[PK] id: Long AUTOINCREMENT",
          "latitude: Double",
          "longitude: Double",
          "accuracy: Float",
          "timestamp: Long",
          "DAO: latest(limit)",
        ],
      },
    ],
    relations: [
      { x1: 815, y1: 650, x2: 1300, y2: 520, lx: 1120, ly: 610, label: "geospatial match only", dashed: true, kind: "logic" },
      { x1: 635, y1: 350, x2: 440, y2: 350, lx: 538, ly: 335, label: "independent local records", dashed: true },
    ],
    notes: [
      {
        x: 92, y: 952, w: 1410, h: 84, title: "Read from code",
        lines: [
          "The Room schema is present but AppContainer does not instantiate it in the inspected code path.",
          "Relationships are intentionally shown as dashed because the entities define no @ForeignKey constraints.",
        ],
      },
    ],
  },
  {
    file: "er-v2-active-sqlite-cache.svg",
    title: "V2 - Active Android SQLite Cache ERD",
    subtitle: "Source: AlertsCacheDAO.java. This SQLiteOpenHelper is used by services/workers at runtime.",
    groups: [
      { x: 54, y: 118, w: 1492, h: 804, label: "SQLite database: dmind_alerts.db" },
    ],
    entities: [
      {
        x: 98, y: 185, w: 370, h: 330, kind: "active", title: "danger_zones", subtitle: "geofenced disaster areas",
        fields: [
          "[PK] zone_id: INTEGER",
          "zone_name: TEXT",
          "zone_type: TEXT",
          "alert_title: TEXT",
          "alert_message: TEXT",
          "polygon_vertices: TEXT",
          "created_at: INTEGER",
          "expiry_time: INTEGER",
          "is_enabled: INTEGER DEFAULT 1",
        ],
      },
      {
        x: 610, y: 185, w: 370, h: 330, kind: "active", title: "sos_queue", subtitle: "offline emergency queue",
        fields: [
          "[PK] sos_id: INTEGER AUTOINCREMENT",
          "user_id: TEXT",
          "latitude: REAL",
          "longitude: REAL",
          "battery_level: INTEGER",
          "message: TEXT",
          "status: TEXT DEFAULT pending",
          "created_at: INTEGER",
          "sent_at: INTEGER",
        ],
      },
      {
        x: 1118, y: 185, w: 370, h: 305, kind: "active", title: "alerts_cache", subtitle: "received alert history",
        fields: [
          "[PK] alert_id: INTEGER AUTOINCREMENT",
          "alert_type: TEXT",
          "alert_level: TEXT",
          "alert_message: TEXT",
          "alert_title: TEXT",
          "is_read: INTEGER DEFAULT 0",
          "timestamp: INTEGER",
        ],
      },
      {
        x: 354, y: 645, w: 370, h: 260, kind: "active", title: "location_history", subtitle: "device path",
        fields: [
          "[PK] loc_id: INTEGER AUTOINCREMENT",
          "latitude: REAL",
          "longitude: REAL",
          "timestamp: INTEGER",
          "accuracy: REAL",
          "[FK?] zone_id: INTEGER",
        ],
      },
      {
        x: 880, y: 645, w: 370, h: 220, kind: "event", title: "backend /sos", subtitle: "network endpoint",
        fields: [
          "payload from SOSMessage.toJson()",
          "sent by SOSQueueWorker",
          "success -> status = sent",
          "failure -> status = pending",
        ],
      },
    ],
    relations: [
      { x1: 520, y1: 645, x2: 270, y2: 515, lx: 360, ly: 590, label: "zone_id -> zone_id (inferred)", dashed: true, kind: "logic" },
      { x1: 795, y1: 515, x2: 1045, y2: 645, lx: 944, ly: 590, label: "0..N queued posts", kind: "event" },
      { x1: 468, y1: 350, x2: 610, y2: 350, lx: 538, ly: 335, label: "same coordinates", dashed: true },
      { x1: 980, y1: 350, x2: 1118, y2: 350, lx: 1049, ly: 335, label: "emergency context", dashed: true },
    ],
    notes: [
      {
        x: 96, y: 962, w: 1410, h: 84, title: "Important distinction",
        lines: [
          "The column location_history.zone_id exists, but the CREATE TABLE statement does not add an actual FOREIGN KEY constraint.",
          "Room has similar table names, but this DAO is the one referenced by BackgroundLocationService, GeofenceMonitorService, SOSQueueWorker, and NativeStatusRepository.",
        ],
      },
    ],
  },
  {
    file: "er-v3-supabase-mobile.svg",
    title: "V3 - Supabase ERD Used By Android",
    subtitle: "Tables and views touched by SupabaseRepository, BackendRestClient, FCMTokenRegistrar, and migrations.",
    width: 1800,
    height: 1320,
    groups: [
      { x: 48, y: 118, w: 1688, h: 1012, label: "Remote PostgreSQL / Supabase schema" },
      { x: 70, y: 756, w: 1644, h: 350, label: "Android AI/chat context and auxiliary reads" },
    ],
    entities: [
      {
        x: 82, y: 180, w: 250, h: 190, kind: "external", title: "auth.users", subtitle: "Supabase Auth",
        fields: [
          "[PK] id: UUID",
          "email, metadata, ...",
          "external to migrations",
        ],
      },
      {
        x: 410, y: 164, w: 330, h: 310, kind: "remote", title: "incident_reports", subtitle: "user reports",
        fields: [
          "[PK] id: UUID",
          "type, title, description",
          "location: TEXT",
          "coordinates: JSONB",
          "severity_level: INTEGER",
          "contact_info: TEXT",
          "image_urls: TEXT[]",
          "status, is_verified",
          "created_at, updated_at",
        ],
      },
      {
        x: 820, y: 164, w: 330, h: 280, kind: "remote", title: "damage_assessments", subtitle: "AI image assessment",
        fields: [
          "[PK] id: UUID",
          "[FK] incident_id: UUID?",
          "image_url: TEXT",
          "assessment_result: JSONB",
          "damage_level: TEXT",
          "confidence_score: DECIMAL",
          "processing_status: TEXT",
          "processed_at, created_at",
        ],
      },
      {
        x: 1240, y: 164, w: 330, h: 250, kind: "remote", title: "incident_reports_public", subtitle: "public-safe view",
        fields: [
          "id, type, title",
          "description, location",
          "severity_level",
          "status, is_verified",
          "created_at",
          "omits contact_info",
        ],
      },
      {
        x: 410, y: 550, w: 330, h: 300, kind: "event", title: "realtime_alerts", subtitle: "active disaster alerts",
        fields: [
          "[PK] id: UUID",
          "alert_type: TEXT",
          "title, message",
          "coordinates: JSON",
          "severity_level: INTEGER",
          "radius_km: NUMERIC",
          "is_active: BOOLEAN",
          "created_at, expires_at",
        ],
      },
      {
        x: 820, y: 550, w: 330, h: 270, kind: "event", title: "notifications", subtitle: "notification history",
        fields: [
          "[PK] id: UUID",
          "[FK] user_id: UUID?",
          "title, message, type",
          "severity_level: INTEGER",
          "delivery_methods: JSONB",
          "location_data: JSONB",
          "read_at, delivered_at",
          "created_at, updated_at",
        ],
      },
      {
        x: 1240, y: 516, w: 330, h: 250, kind: "support", title: "device_push_tokens", subtitle: "backend FCM registry",
        fields: [
          "[PK] id: UUID",
          "token: TEXT UNIQUE",
          "[FK] user_id: UUID?",
          "user_id_text: TEXT",
          "installation_id: TEXT",
          "platform: TEXT",
          "is_active: BOOLEAN",
        ],
      },
      {
        x: 82, y: 506, w: 250, h: 238, kind: "support", title: "user_notification_settings", subtitle: "preferences",
        fields: [
          "[PK] id: UUID",
          "[FK] user_id: UUID?",
          "email: TEXT UNIQUE",
          "enabled: BOOLEAN",
          "latitude, longitude",
          "radius_km: INTEGER",
        ],
      },
      {
        x: 96, y: 820, w: 280, h: 230, kind: "remote", title: "victim_reports", subtitle: "rescue reports",
        fields: [
          "[PK] id: UUID",
          "name, contact",
          "description",
          "coordinates: JSON",
          "status: TEXT",
          "created_at, updated_at",
        ],
      },
      {
        x: 442, y: 890, w: 280, h: 230, kind: "remote", title: "satisfaction_surveys", subtitle: "feedback",
        fields: [
          "[PK] id: UUID",
          "overall_rating",
          "feature ratings",
          "most_useful_feature",
          "suggestions",
          "would_recommend",
        ],
      },
      {
        x: 790, y: 890, w: 280, h: 190, kind: "support", title: "documents", subtitle: "AI context",
        fields: [
          "[PK] id: number",
          "content: TEXT",
          "metadata: JSON",
          "embedding: vector/text",
        ],
      },
      {
        x: 1138, y: 890, w: 280, h: 210, kind: "support", title: "from_rain_sensor", subtitle: "sensor feed",
        fields: [
          "[PK] id: number",
          "humidity: number",
          "is_raining: boolean",
          "latitude, longitude",
          "created_at, inserted_at",
        ],
      },
      {
        x: 1484, y: 850, w: 220, h: 190, kind: "external", title: "storage buckets", subtitle: "public files",
        fields: [
          "incident-images",
          "damage-assessment-images",
          "object path -> public URL",
        ],
      },
    ],
    relations: [
      { x1: 740, y1: 310, x2: 820, y2: 305, lx: 780, ly: 292, label: "1:N FK", kind: "remote" },
      { x1: 740, y1: 235, x2: 1240, y2: 240, lx: 990, ly: 222, label: "view of", dashed: true, kind: "remote" },
      { x1: 332, y1: 236, x2: 410, y2: 236, lx: 370, ly: 220, label: "public view", dashed: true },
      { x1: 332, y1: 600, x2: 410, y2: 650, lx: 370, ly: 616, label: "nearby users", dashed: true, kind: "logic" },
      { x1: 332, y1: 278, x2: 820, y2: 620, lx: 620, ly: 500, label: "user_id optional", dashed: true },
      { x1: 332, y1: 300, x2: 1240, y2: 590, lx: 1030, ly: 480, label: "user_id optional", dashed: true },
      { x1: 740, y1: 695, x2: 820, y2: 685, lx: 780, ly: 668, label: "logical feed", dashed: true, kind: "event" },
      { x1: 1150, y1: 690, x2: 1240, y2: 640, lx: 1194, ly: 650, label: "push targets", dashed: true, kind: "logic" },
      { x1: 572, y1: 474, x2: 1585, y2: 850, lx: 1170, ly: 830, label: "image_urls", dashed: true, kind: "logic" },
      { x1: 985, y1: 444, x2: 1585, y2: 850, lx: 1310, ly: 630, label: "image_url", dashed: true, kind: "logic" },
      { x1: 930, y1: 820, x2: 930, y2: 890, lx: 975, ly: 858, label: "AI prompt reads", dashed: true, kind: "logic" },
      { x1: 560, y1: 850, x2: 560, y2: 890, lx: 608, ly: 875, label: "feedback", dashed: true },
    ],
    notes: [
      {
        x: 96, y: 1180, w: 1540, h: 76, title: "Scope",
        lines: [
          "Only remote tables/views touched by Android-facing code are shown here; the broader web app schema has additional tables.",
          "Dashed arrows are logical reads/writes from code where the database has no declared FK.",
        ],
      },
    ],
  },
  {
    file: "er-v4-incident-damage-flow.svg",
    title: "V4 - Incident, Damage Assessment, and Public Reporting ERD",
    subtitle: "Focused ER slice for reports submitted from Android screens and AI damage assessment.",
    width: 1700,
    height: 1120,
    groups: [
      { x: 60, y: 118, w: 1580, h: 786, label: "Reporting and assessment workflow" },
    ],
    entities: [
      {
        x: 110, y: 200, w: 380, h: 350, kind: "remote", title: "incident_reports", subtitle: "primary incident entity",
        fields: [
          "[PK] id: UUID",
          "type: TEXT",
          "title: TEXT",
          "description: TEXT",
          "location: TEXT?",
          "coordinates: JSONB?",
          "severity_level: INTEGER",
          "contact_info: TEXT?",
          "image_urls: TEXT[]",
          "status: TEXT",
          "is_verified: BOOLEAN",
          "created_at, updated_at",
        ],
      },
      {
        x: 645, y: 200, w: 390, h: 350, kind: "event", title: "damage_assessments", subtitle: "image analysis result",
        fields: [
          "[PK] id: UUID",
          "[FK] incident_id: UUID?",
          "image_url: TEXT",
          "original_filename: TEXT?",
          "assessment_result: JSONB",
          "damage_level: TEXT",
          "confidence_score: DECIMAL",
          "detected_categories: TEXT[]",
          "estimated_cost: DECIMAL",
          "processing_status: TEXT",
          "error_message, processed_at",
        ],
      },
      {
        x: 1180, y: 200, w: 360, h: 260, kind: "support", title: "storage.objects", subtitle: "public image URLs",
        fields: [
          "[PK] id: UUID/object id",
          "bucket_id",
          "name/path",
          "incident-images",
          "damage-assessment-images",
          "public URL stored in tables",
        ],
      },
      {
        x: 170, y: 660, w: 330, h: 220, kind: "remote", title: "incident_reports_public", subtitle: "safe read view",
        fields: [
          "id, type, title",
          "description, location",
          "severity_level",
          "status, is_verified",
          "created_at",
          "no contact_info",
        ],
      },
      {
        x: 620, y: 660, w: 330, h: 230, kind: "remote", title: "victim_reports", subtitle: "emergency victim info",
        fields: [
          "[PK] id: UUID",
          "name: TEXT",
          "contact: TEXT?",
          "description: TEXT?",
          "coordinates: JSON",
          "status: TEXT",
          "created_at, updated_at",
        ],
      },
      {
        x: 1070, y: 660, w: 330, h: 230, kind: "support", title: "satisfaction_surveys", subtitle: "post-use feedback",
        fields: [
          "[PK] id: UUID",
          "overall_rating",
          "UI/map/alert ratings",
          "emergency_info_rating",
          "ai_assistant_rating",
          "suggestions",
          "created_at, updated_at",
        ],
      },
    ],
    relations: [
      { x1: 490, y1: 360, x2: 645, y2: 360, lx: 566, ly: 342, label: "1:N damage_assessments.incident_id", kind: "remote" },
      { x1: 490, y1: 285, x2: 1180, y2: 285, lx: 840, ly: 268, label: "image_urls[]", dashed: true, kind: "logic" },
      { x1: 1035, y1: 350, x2: 1180, y2: 350, lx: 1108, ly: 333, label: "image_url", dashed: true, kind: "logic" },
      { x1: 300, y1: 550, x2: 300, y2: 660, lx: 352, ly: 612, label: "public view", dashed: true, kind: "remote" },
      { x1: 950, y1: 550, x2: 780, y2: 660, lx: 870, ly: 620, label: "separate report type", dashed: true },
      { x1: 950, y1: 550, x2: 1220, y2: 660, lx: 1100, ly: 615, label: "UX feedback", dashed: true },
    ],
    notes: [
      {
        x: 116, y: 956, w: 1450, h: 84, title: "Android repository behavior",
        lines: [
          "submitIncidentReport writes incident_reports directly unless BackendRestClient is configured, in which case the backend writes it.",
          "invokeDamageAssessment creates a pending damage_assessments row, then calls the analyze-damage Edge Function with the assessment id and image URL.",
        ],
      },
    ],
  },
  {
    file: "er-v5-full-android-data-ecosystem.svg",
    title: "V5 - Full Android Data Ecosystem ERD",
    subtitle: "End-to-end view: local Android persistence, backend gateway, Supabase, push notifications, AI context, and external feeds.",
    width: 1900,
    height: 1220,
    groups: [
      { x: 54, y: 118, w: 470, h: 914, label: "Android device" },
      { x: 588, y: 118, w: 500, h: 914, label: "Backend / app services" },
      { x: 1150, y: 118, w: 680, h: 914, label: "Supabase and external data" },
    ],
    entities: [
      {
        x: 96, y: 176, w: 380, h: 230, kind: "active", title: "dmind_alerts.db", subtitle: "AlertsCacheDAO SQLite",
        fields: [
          "danger_zones",
          "sos_queue",
          "alerts_cache",
          "location_history",
          "used by services/workers",
        ],
      },
      {
        x: 96, y: 468, w: 380, h: 210, kind: "core", title: "DMindRoomDatabase", subtitle: "declared Room schema",
        fields: [
          "alerts",
          "sos_queue",
          "danger_zones",
          "location_history",
          "not wired in AppContainer",
        ],
      },
      {
        x: 96, y: 748, w: 380, h: 200, kind: "support", title: "SharedPreferences dmind_native", subtitle: "small local state",
        fields: [
          "installation_id",
          "fcm_token",
          "created/read by providers",
          "not relational",
        ],
      },
      {
        x: 636, y: 176, w: 400, h: 250, kind: "event", title: "Android backend gateway", subtitle: "Ktor endpoints",
        fields: [
          "POST /reports",
          "POST /media/incident-images",
          "POST /sos",
          "POST /fcm/register",
          "POST /notifications/send",
          "GET /api/analytics/*",
        ],
      },
      {
        x: 636, y: 496, w: 400, h: 230, kind: "support", title: "DeviceTokenRegistry", subtitle: "backend token store",
        fields: [
          "token",
          "platform",
          "userId / installationId",
          "local JSON fallback",
          "syncs to device_push_tokens",
        ],
      },
      {
        x: 636, y: 800, w: 400, h: 190, kind: "external", title: "FCM HTTP v1", subtitle: "push transport",
        fields: [
          "target device token",
          "notification payload",
          "data payload",
          "delivery result",
        ],
      },
      {
        x: 1196, y: 176, w: 280, h: 250, kind: "remote", title: "reports schema", subtitle: "Supabase",
        fields: [
          "incident_reports",
          "incident_reports_public",
          "damage_assessments",
          "victim_reports",
          "satisfaction_surveys",
          "storage buckets",
        ],
      },
      {
        x: 1510, y: 176, w: 280, h: 250, kind: "event", title: "alerts schema", subtitle: "Supabase",
        fields: [
          "realtime_alerts",
          "notifications",
          "user_notification_settings",
          "device_push_tokens",
          "user_locations",
          "analytics_data",
        ],
      },
      {
        x: 1196, y: 512, w: 280, h: 230, kind: "support", title: "AI context tables", subtitle: "Supabase reads",
        fields: [
          "documents",
          "from_rain_sensor",
          "realtime_alerts",
          "incident_reports_public",
          "notifications",
        ],
      },
      {
        x: 1510, y: 512, w: 280, h: 260, kind: "external", title: "external hazard feeds", subtitle: "remote APIs",
        fields: [
          "GISTDA VIIRS/flood",
          "TMD weather",
          "USGS earthquakes",
          "Air GISTDA PM2.5",
          "OpenStreetMap search",
          "mapped to domain models",
        ],
      },
      {
        x: 1196, y: 830, w: 594, h: 150, kind: "support", title: "Android domain/UI models", subtitle: "not persisted as relational tables",
        fields: [
          "DisasterEvent, MonitoringStation, WeatherSnapshot, DisasterPoint, FloodArea, ViirsHotspot",
          "DTOs parse network JSON; repositories map them to UI state and analytics cards.",
        ],
        rowGap: 28,
      },
    ],
    relations: [
      { x1: 476, y1: 294, x2: 636, y2: 290, lx: 556, ly: 272, label: "SOS flush", kind: "event" },
      { x1: 476, y1: 850, x2: 636, y2: 610, lx: 578, ly: 728, label: "fcm token + installation_id", kind: "logic" },
      { x1: 836, y1: 426, x2: 1336, y2: 176, lx: 1060, ly: 260, label: "/reports + media", kind: "remote" },
      { x1: 1036, y1: 610, x2: 1510, y2: 304, lx: 1320, ly: 456, label: "sync tokens", kind: "remote" },
      { x1: 836, y1: 726, x2: 836, y2: 800, lx: 884, ly: 770, label: "send push", kind: "event" },
      { x1: 636, y1: 875, x2: 476, y2: 850, lx: 560, ly: 890, label: "FCM data message", dashed: true, kind: "event" },
      { x1: 1476, y1: 310, x2: 1510, y2: 310, lx: 1494, ly: 292, label: "alerts drive notices", dashed: true, kind: "event" },
      { x1: 1510, y1: 650, x2: 1476, y2: 650, lx: 1492, ly: 632, label: "map points", kind: "logic" },
      { x1: 1336, y1: 426, x2: 1336, y2: 512, lx: 1395, ly: 475, label: "AI chat reads", dashed: true, kind: "logic" },
      { x1: 1510, y1: 706, x2: 1510, y2: 830, lx: 1565, ly: 795, label: "DTO -> domain", dashed: true },
      { x1: 1336, y1: 742, x2: 1336, y2: 830, lx: 1392, ly: 795, label: "context -> UI", dashed: true },
      { x1: 476, y1: 566, x2: 636, y2: 300, lx: 556, ly: 468, label: "future/local Room", dashed: true },
    ],
    notes: [
      {
        x: 96, y: 1080, w: 1610, h: 82, title: "How to read this version",
        lines: [
          "This is an architectural ER-style map. The detailed physical schemas are split into V1, V2, and V3.",
          "The active Android local persistence path is AlertsCacheDAO SQLite; Room appears to be declared for a cleaner schema but is not currently injected.",
        ],
      },
    ],
  },
  {
    file: "er-v6-normalized-conceptual-system.svg",
    title: "V6 - Normalized Conceptual ERD",
    subtitle: "A cleaned conceptual model of the database system derived from Android, backend, and Supabase schema usage.",
    width: 1800,
    height: 1200,
    groups: [
      { x: 48, y: 120, w: 410, h: 900, label: "Identity and preferences" },
      { x: 500, y: 120, w: 500, h: 900, label: "Disaster events and reports" },
      { x: 1040, y: 120, w: 700, h: 900, label: "Notification, knowledge, analytics" },
    ],
    entities: [
      {
        x: 88, y: 180, w: 330, h: 220, kind: "external", title: "user_identity", subtitle: "auth.users or installation_id",
        fields: [
          "[PK] user_id / installation_id",
          "email or anonymous local id",
          "created by auth or app install",
          "logical parent for mobile data",
        ],
      },
      {
        x: 88, y: 460, w: 330, h: 210, kind: "support", title: "user_role", subtitle: "user_roles",
        fields: [
          "[PK] id",
          "[FK*] user_id",
          "role: admin | responder | user",
          "assigned_at, assigned_by",
          "is_active",
        ],
      },
      {
        x: 88, y: 740, w: 330, h: 230, kind: "support", title: "user_notification_profile", subtitle: "settings + location",
        fields: [
          "[PK] profile_id",
          "[FK*] user_id",
          "email / enabled",
          "coordinates or preferred area",
          "radius_km",
          "severity threshold",
        ],
      },
      {
        x: 548, y: 170, w: 380, h: 320, kind: "event", title: "disaster_alert", subtitle: "realtime_alerts",
        fields: [
          "[PK] alert_id",
          "alert_type",
          "title, message",
          "coordinates",
          "radius_km",
          "severity_level",
          "active window",
          "verified_by / verified_at",
        ],
      },
      {
        x: 548, y: 560, w: 380, h: 330, kind: "remote", title: "incident_report", subtitle: "incident_reports",
        fields: [
          "[PK] incident_id",
          "[FK*] reporter_id",
          "type, title, description",
          "location / coordinates",
          "severity_level",
          "contact_info",
          "status, is_verified",
          "created_at, updated_at",
        ],
      },
      {
        x: 1088, y: 170, w: 300, h: 270, kind: "event", title: "notification", subtitle: "notifications",
        fields: [
          "[PK] notification_id",
          "[FK*] user_id",
          "[FK*] alert_id",
          "title, message, type",
          "severity_level",
          "read_at, delivered_at",
        ],
      },
      {
        x: 1440, y: 170, w: 260, h: 270, kind: "support", title: "device_endpoint", subtitle: "device_push_tokens",
        fields: [
          "[PK] token_id",
          "[FK*] user_id",
          "token UNIQUE",
          "platform",
          "installation_id",
          "is_active",
        ],
      },
      {
        x: 1088, y: 510, w: 300, h: 270, kind: "remote", title: "damage_assessment", subtitle: "damage_assessments",
        fields: [
          "[PK] assessment_id",
          "[FK] incident_id",
          "image_url",
          "damage_level",
          "confidence_score",
          "processing_status",
          "assessment_result",
        ],
      },
      {
        x: 1440, y: 510, w: 260, h: 240, kind: "support", title: "media_object", subtitle: "storage.objects",
        fields: [
          "[PK] object_id/path",
          "bucket_id",
          "public_url",
          "content_type",
          "linked by URL",
        ],
      },
      {
        x: 1088, y: 835, w: 300, h: 210, kind: "support", title: "knowledge_item", subtitle: "documents / articles",
        fields: [
          "[PK] id",
          "title or content",
          "metadata",
          "embedding",
          "used by AI chat",
        ],
      },
      {
        x: 1440, y: 835, w: 260, h: 210, kind: "support", title: "metric_or_survey", subtitle: "analytics + surveys",
        fields: [
          "[PK] id",
          "metric_name/value",
          "ratings",
          "suggestions",
          "date_recorded",
        ],
      },
    ],
    relations: [
      { x1: 253, y1: 400, x2: 253, y2: 460, lx: 300, ly: 435, label: "1:N roles", dashed: true, kind: "logic" },
      { x1: 253, y1: 400, x2: 253, y2: 740, lx: 310, ly: 612, label: "1:N profiles", dashed: true, kind: "logic" },
      { x1: 418, y1: 280, x2: 548, y2: 680, lx: 490, ly: 498, label: "1:N reports", dashed: true, kind: "logic" },
      { x1: 418, y1: 845, x2: 548, y2: 330, lx: 492, ly: 590, label: "nearby match", dashed: true, kind: "logic" },
      { x1: 928, y1: 330, x2: 1088, y2: 300, lx: 1010, ly: 298, label: "1:N notices", dashed: true, kind: "event" },
      { x1: 1388, y1: 300, x2: 1440, y2: 300, lx: 1414, ly: 282, label: "sent to", dashed: true, kind: "logic" },
      { x1: 928, y1: 710, x2: 1088, y2: 645, lx: 1010, ly: 660, label: "1:N FK", kind: "remote" },
      { x1: 928, y1: 635, x2: 1440, y2: 620, lx: 1185, ly: 602, label: "image_urls", dashed: true, kind: "logic" },
      { x1: 1388, y1: 645, x2: 1440, y2: 640, lx: 1416, ly: 625, label: "image_url", dashed: true, kind: "logic" },
      { x1: 738, y1: 890, x2: 1440, y2: 940, lx: 1110, ly: 930, label: "aggregated into metrics", dashed: true, kind: "logic" },
      { x1: 1238, y1: 835, x2: 1238, y2: 780, lx: 1300, ly: 812, label: "AI context", dashed: true, kind: "logic" },
    ],
    notes: [
      {
        x: 92, y: 1070, w: 1580, h: 76, title: "Legend",
        lines: [
          "Solid relation = explicit physical FK found in migrations/types. Dashed relation = logical relation inferred from Android/backend code.",
          "[FK*] marks a recommended conceptual FK even when the inspected physical table currently stores only an optional id or JSON field.",
        ],
      },
    ],
  },
  {
    file: "er-v7-security-notification-physical.svg",
    title: "V7 - Security and Notification Physical ERD",
    subtitle: "Focused database view for roles, notification preferences, device tokens, alert delivery, and analytics.",
    width: 1800,
    height: 1160,
    groups: [
      { x: 52, y: 120, w: 520, h: 820, label: "Access control and user targets" },
      { x: 620, y: 120, w: 520, h: 820, label: "Alert generation and delivery" },
      { x: 1190, y: 120, w: 520, h: 820, label: "Functions, policies, and derived data" },
    ],
    entities: [
      {
        x: 100, y: 175, w: 380, h: 210, kind: "external", title: "auth.users", subtitle: "Supabase Auth",
        fields: [
          "[PK] id: UUID",
          "authenticated principal",
          "referenced by several tables",
          "nullable for anonymous/mobile flows",
        ],
      },
      {
        x: 100, y: 455, w: 380, h: 235, kind: "support", title: "user_roles", subtitle: "RBAC",
        fields: [
          "[PK] id: UUID",
          "user_id: UUID",
          "role: app_role enum",
          "assigned_by: UUID?",
          "assigned_at",
          "is_active",
          "UNIQUE(user_id, role)",
        ],
      },
      {
        x: 100, y: 760, w: 380, h: 210, kind: "support", title: "user_notification_settings", subtitle: "server preferences",
        fields: [
          "[PK] id: UUID",
          "[FK] user_id: UUID?",
          "email UNIQUE",
          "enabled",
          "latitude, longitude",
          "radius_km",
        ],
      },
      {
        x: 668, y: 170, w: 380, h: 310, kind: "event", title: "realtime_alerts", subtitle: "alert source",
        fields: [
          "[PK] id: UUID",
          "alert_type",
          "coordinates: JSON",
          "radius_km",
          "severity_level",
          "is_active",
          "created_by / verified_by",
          "expires_at",
        ],
      },
      {
        x: 668, y: 552, w: 380, h: 260, kind: "event", title: "notifications", subtitle: "history table",
        fields: [
          "[PK] id: UUID",
          "[FK] user_id: UUID?",
          "title, message, type",
          "severity_level",
          "delivery_methods: JSONB",
          "location_data: JSONB",
          "read_at / delivered_at",
        ],
      },
      {
        x: 668, y: 865, w: 380, h: 210, kind: "event", title: "alert_deliveries", subtitle: "typed relation exists",
        fields: [
          "[PK] id: UUID",
          "[FK] alert_id -> realtime_alerts.id",
          "user_id",
          "delivery_method",
          "delivery_status",
          "read_at / delivered_at",
        ],
      },
      {
        x: 1238, y: 170, w: 380, h: 250, kind: "support", title: "device_push_tokens", subtitle: "FCM targets",
        fields: [
          "[PK] id: UUID",
          "token UNIQUE",
          "[FK] user_id: UUID?",
          "user_id_text",
          "installation_id",
          "platform",
          "is_active",
        ],
      },
      {
        x: 1238, y: 486, w: 380, h: 230, kind: "support", title: "user_locations", subtitle: "nearby-user search",
        fields: [
          "[PK] id: UUID",
          "[FK] user_id: UUID?",
          "coordinates: JSONB",
          "location_name",
          "is_active",
          "created_at, updated_at",
        ],
      },
      {
        x: 1238, y: 785, w: 380, h: 230, kind: "support", title: "analytics_data", subtitle: "derived statistics",
        fields: [
          "[PK] id: UUID",
          "metric_name",
          "metric_value",
          "metric_type",
          "date_recorded",
          "location_data, metadata",
        ],
      },
    ],
    relations: [
      { x1: 290, y1: 385, x2: 290, y2: 455, lx: 340, ly: 428, label: "1:N roles", dashed: true },
      { x1: 290, y1: 690, x2: 290, y2: 760, lx: 340, ly: 730, label: "1:N settings", kind: "remote" },
      { x1: 480, y1: 275, x2: 1238, y2: 270, lx: 860, ly: 252, label: "1:N device tokens", dashed: true, kind: "logic" },
      { x1: 480, y1: 310, x2: 1238, y2: 590, lx: 1000, ly: 465, label: "1:N active locations", dashed: true, kind: "logic" },
      { x1: 1048, y1: 330, x2: 1238, y2: 600, lx: 1145, ly: 470, label: "get_nearby_users()", dashed: true, kind: "logic" },
      { x1: 1048, y1: 610, x2: 1238, y2: 300, lx: 1120, ly: 430, label: "target tokens", dashed: true, kind: "logic" },
      { x1: 858, y1: 480, x2: 858, y2: 552, lx: 910, ly: 520, label: "creates history", dashed: true, kind: "event" },
      { x1: 858, y1: 480, x2: 858, y2: 865, lx: 910, ly: 812, label: "1:N explicit FK", kind: "event" },
      { x1: 1048, y1: 335, x2: 1238, y2: 885, lx: 1150, ly: 720, label: "update_analytics_stats()", dashed: true, kind: "logic" },
      { x1: 480, y1: 560, x2: 668, y2: 640, lx: 575, ly: 585, label: "authorization gates", dashed: true },
    ],
    notes: [
      {
        x: 110, y: 1010, w: 1530, h: 76, title: "Security reading",
        lines: [
          "RBAC is enforced by user_has_role() and user_is_emergency_authorized(); notification tables are gated by RLS policies and backend service-role writes.",
          "alert_deliveries appears in generated Supabase types with a physical FK to realtime_alerts even though Android mostly reads notifications directly.",
        ],
      },
    ],
  },
];

for (const diagram of diagrams) {
  const svg = render(diagram);
  writeFileSync(join(outDir, diagram.file), svg, "utf8");
}

console.log(diagrams.map((diagram) => join(outDir, diagram.file)).join("\n"));
