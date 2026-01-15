// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    title: string;
    description: string;
    severity: string | number;
    location: string;
    alert_type: string;
    coordinates?: { lat: number; lng: number };
    [key: string]: any;
  };
  schema: string;
  old_record: null | any;
}

interface EmailRequest {
  to?: string;
  type: 'test' | 'alert' | 'webhook';
  alertData?: {
    title: string;
    message: string;
    severity: number;
    location?: string;
  };
  record?: WebhookPayload['record'];
}

// Beautiful HTML email template
const getEmailTemplate = (type: 'test' | 'alert', data?: { title: string; message: string; severity: number; location?: string }) => {
  if (type === 'test') {
    return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>D-MIND - Test Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🔔 D-MIND
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Disaster Monitoring & Intelligent Notification Device
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 24px; font-size: 14px; font-weight: 600;">
                  ✓ ทดสอบการแจ้งเตือนสำเร็จ
                </span>
              </div>
              
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 22px; text-align: center;">
                ระบบแจ้งเตือนทางอีเมลทำงานปกติ
              </h2>
              
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                หากคุณได้รับอีเมลนี้ แสดงว่าระบบแจ้งเตือนภัยพิบัติทางอีเมลของ D-MIND 
                ทำงานได้อย่างถูกต้อง คุณจะได้รับการแจ้งเตือนเมื่อมีเหตุการณ์ภัยพิบัติในพื้นที่ของคุณ
              </p>
              
              <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                  📍 ระบบจะส่งการแจ้งเตือนเมื่อมีภัยพิบัติเกิดขึ้นในรัศมีที่คุณกำหนด
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">
                D-MIND - ระบบเตือนภัยพิบัติอัจฉริยะ
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  // Alert email template
  const severityColors: Record<number, { bg: string; text: string; label: string }> = {
    5: { bg: '#dc2626', text: '#ffffff', label: '🚨 วิกฤติ' },
    4: { bg: '#ea580c', text: '#ffffff', label: '⚠️ รุนแรง' },
    3: { bg: '#ca8a04', text: '#ffffff', label: '⚡ ปานกลาง' },
    2: { bg: '#2563eb', text: '#ffffff', label: 'ℹ️ ต่ำ' },
    1: { bg: '#6b7280', text: '#ffffff', label: '📢 ข้อมูล' },
  };

  const severity = data?.severity || 3;
  const colors = severityColors[severity] || severityColors[3];

  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>D-MIND - แจ้งเตือนภัยพิบัติ</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header with severity color -->
          <tr>
            <td style="background: ${colors.bg}; padding: 32px; text-align: center;">
              <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 24px; font-size: 13px; color: ${colors.text}; margin-bottom: 12px;">
                ${colors.label}
              </span>
              <h1 style="margin: 12px 0 0 0; color: ${colors.text}; font-size: 24px; font-weight: 700;">
                ${data?.title || 'แจ้งเตือนภัยพิบัติ'}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.7;">
                ${data?.message || 'มีเหตุการณ์ภัยพิบัติเกิดขึ้นในพื้นที่ของคุณ กรุณาตรวจสอบและเตรียมความพร้อม'}
              </p>
              
              ${data?.location ? `
              <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #64748b; font-size: 14px;">
                  📍 <strong style="color: #334155;">ตำแหน่ง:</strong> ${data.location}
                </p>
              </div>
              ` : ''}
              
              <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  ⚠️ คำแนะนำ
                </p>
                <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.6;">
                  <li>ติดตามข่าวสารจากแหล่งที่น่าเชื่อถือ</li>
                  <li>เตรียมความพร้อมตามคำแนะนำของหน่วยงานที่เกี่ยวข้อง</li>
                  <li>หากอยู่ในพื้นที่เสี่ยง ควรอพยพตามคำสั่ง</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="https://d-mind.app" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                เปิดแอป D-MIND
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">
                D-MIND - ระบบเตือนภัยพิบัติอัจฉริยะ
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set');
    }

    // Initialize Resend with API key
    const resend = new Resend(resendApiKey);

    const requestData: EmailRequest | WebhookPayload = await req.json();

    // Check if this is a Webhook call (from database trigger)
    // Webhook from Supabase Database Changes usually wraps payload in { type, record, ... }
    if ('record' in requestData && 'table' in requestData) {
      // --- WEBHOOK LOGIC ---
      const record = requestData.record;
      console.log('Received webhook alert:', record.id, record.title);

      // 1. Initialize Supabase Admin Client
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // 2. Map severity string to number
      const SEVERITY_MAP: Record<string, number> = {
        'critical': 5, 'high': 4, 'medium': 3, 'low': 2, 'info': 1
      };

      let alertSeverity = 3;
      if (record.severity) {
        if (typeof record.severity === 'string') {
          alertSeverity = SEVERITY_MAP[record.severity.toLowerCase()] || 3;
        } else {
          alertSeverity = Number(record.severity) || 3;
        }
      }

      // 3. Prepare email content
      const subject = `🚨 D-MIND - ${record.title || 'แจ้งเตือนภัยพิบัติ'}`;
      const htmlContent = getEmailTemplate('alert', {
        title: record.title,
        message: record.description || 'มีเหตุการณ์ภัยพิบัติเกิดขึ้น',
        severity: alertSeverity,
        location: record.location || record.province
      });

      // 4. Fetch all users who have enabled notifications
      const { data: subscribers, error: fetchError } = await supabase
        .from('user_notification_settings')
        .select('email')
        .eq('enabled', true);

      if (fetchError) {
        console.error('Error fetching subscribers:', fetchError);
        return new Response(JSON.stringify({ error: fetchError.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }

      if (!subscribers || subscribers.length === 0) {
        console.log('No subscribers found.');
        return new Response(JSON.stringify({ message: 'No subscribers to notify' }), { headers: { 'Content-Type': 'application/json' } });
      }

      console.log(`Found ${subscribers.length} subscribers.`);

      // 5. Batch Send Emails
      const results = [];
      for (const sub of subscribers) {
        try {
          const { data, error } = await resend.emails.send({
            from: 'D-MIND <onboarding@resend.dev>',
            to: [sub.email],
            subject,
            html: htmlContent,
          });
          results.push({ email: sub.email, success: !error, id: data?.id });
        } catch (e) {
          console.error(`Failed to send to ${sub.email}:`, e);
          results.push({ email: sub.email, success: false, error: e });
        }
      }

      return new Response(
        JSON.stringify({ success: true, sent_count: results.length, details: results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // --- DIRECT CALL LOGIC (Old Logic) ---
      // This is used for "Send Test Email" button from frontend
      const emailReq = requestData as EmailRequest;
      const { to, type = 'test', alertData } = emailReq;

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (to && !emailRegex.test(to)) {
        throw new Error('Invalid email address');
      }

      // Get email subject based on type
      const subject = type === 'test'
        ? '🔔 D-MIND - ทดสอบการแจ้งเตือน'
        : `🚨 D-MIND - ${alertData?.title || 'แจ้งเตือนภัยพิบัติ'}`;

      const htmlContent = getEmailTemplate(type === 'test' ? 'test' : 'alert', alertData);

      // Send email using Resend SDK
      if (to) {
        const { data, error } = await resend.emails.send({
          from: 'D-MIND <onboarding@resend.dev>',
          to: [to],
          subject,
          html: htmlContent,
        });

        if (error) {
          console.error('Resend API error:', error);
          throw new Error(`Failed to send email: ${error.message}`);
        }

        console.log('Email sent successfully:', data);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email sent successfully',
            id: data?.id
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      return new Response(JSON.stringify({ error: 'Missing to address' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
