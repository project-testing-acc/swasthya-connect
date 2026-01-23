import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "booking_confirmed" | "reminder_24h" | "reminder_2h" | "reminder_10m" | "cancelled" | "rescheduled";
  appointmentId: string;
}

const getEmailTemplate = (
  type: string,
  appointment: any,
  clinic: any,
  doctor: any
) => {
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const appointmentTime = appointment.start_time.slice(0, 5);

  const templates: Record<string, { subject: string; html: string }> = {
    booking_confirmed: {
      subject: `Appointment Confirmed - Token #${appointment.token_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Appointment Confirmed</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
              <h2 style="color: #1e293b; margin-top: 0;">Your Token Number</h2>
              <div style="background: #2563eb; color: white; font-size: 48px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px;">
                ${appointment.token_number}
              </div>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1e293b; margin-top: 0;">Appointment Details</h3>
              <p><strong>Clinic:</strong> ${clinic.name}</p>
              <p><strong>Doctor:</strong> ${doctor?.name || 'Any available doctor'}</p>
              <p><strong>Date:</strong> ${appointmentDate}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
              <p><strong>Type:</strong> ${appointment.type === 'teleconsultation' ? '📹 Teleconsultation' : '🏥 In-Person Visit'}</p>
              <p><strong>Fee:</strong> ₹${appointment.fee}</p>
              ${clinic.address ? `<p><strong>Address:</strong> ${clinic.address}</p>` : ''}
            </div>
            <p style="color: #64748b; font-size: 14px; margin-top: 16px;">
              Please arrive 15 minutes before your scheduled time. If you need to reschedule or cancel, please do so at least 2 hours in advance.
            </p>
          </div>
        </div>
      `,
    },
    reminder_24h: {
      subject: `Reminder: Appointment Tomorrow - Token #${appointment.token_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f59e0b; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">⏰ Appointment Reminder</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 18px; color: #1e293b;">Your appointment is <strong>tomorrow</strong>!</p>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p><strong>Token:</strong> #${appointment.token_number}</p>
              <p><strong>Clinic:</strong> ${clinic.name}</p>
              <p><strong>Doctor:</strong> ${doctor?.name || 'Any available doctor'}</p>
              <p><strong>Date:</strong> ${appointmentDate}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
            </div>
          </div>
        </div>
      `,
    },
    reminder_2h: {
      subject: `2 Hours Until Your Appointment - Token #${appointment.token_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ef4444; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🔔 Appointment in 2 Hours</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 18px; color: #1e293b;">Please prepare for your upcoming appointment.</p>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p><strong>Token:</strong> #${appointment.token_number}</p>
              <p><strong>Clinic:</strong> ${clinic.name}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
              ${clinic.address ? `<p><strong>Address:</strong> ${clinic.address}</p>` : ''}
            </div>
          </div>
        </div>
      `,
    },
    reminder_10m: {
      subject: `Starting Soon! Token #${appointment.token_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🚀 Appointment Starting Soon!</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 18px; color: #1e293b;">Your appointment starts in <strong>10 minutes</strong>!</p>
            <div style="background: #10b981; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px;">
              Token #${appointment.token_number}
            </div>
          </div>
        </div>
      `,
    },
    cancelled: {
      subject: `Appointment Cancelled - ${clinic.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #64748b; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">❌ Appointment Cancelled</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">
            <p>Your appointment has been cancelled.</p>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p><strong>Clinic:</strong> ${clinic.name}</p>
              <p><strong>Original Date:</strong> ${appointmentDate}</p>
              <p><strong>Original Time:</strong> ${appointmentTime}</p>
            </div>
            <p style="margin-top: 16px;">If you'd like to book a new appointment, please visit our app.</p>
          </div>
        </div>
      `,
    },
    rescheduled: {
      subject: `Appointment Rescheduled - New Token #${appointment.token_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #8b5cf6; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">📅 Appointment Rescheduled</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">
            <p>Your appointment has been rescheduled to a new date/time.</p>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p><strong>New Token:</strong> #${appointment.token_number}</p>
              <p><strong>Clinic:</strong> ${clinic.name}</p>
              <p><strong>New Date:</strong> ${appointmentDate}</p>
              <p><strong>New Time:</strong> ${appointmentTime}</p>
            </div>
          </div>
        </div>
      `,
    },
  };

  return templates[type] || templates.booking_confirmed;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, appointmentId }: NotificationRequest = await req.json();

    // Fetch appointment with related data
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from("appointments")
      .select(`
        *,
        clinics(*),
        doctors(*),
        profiles:patient_id(*)
      `)
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error(`Appointment not found: ${appointmentError?.message}`);
    }

    // Get patient email from auth.users
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(
      appointment.patient_id
    );

    if (userError || !userData.user?.email) {
      throw new Error(`User email not found: ${userError?.message}`);
    }

    const patientEmail = userData.user.email;
    const template = getEmailTemplate(type, appointment, appointment.clinics, appointment.doctors);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Swasthya Slots <onboarding@resend.dev>",
      to: [patientEmail],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log notification in database
    await supabaseClient.from("notifications").insert({
      user_id: appointment.patient_id,
      type: type,
      title: template.subject,
      message: `Notification sent for appointment at ${appointment.clinics.name}`,
      data: { appointmentId, emailResponse },
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
