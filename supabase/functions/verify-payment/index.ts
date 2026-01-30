import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { sessionId, appointmentId } = await req.json();
    logStep("Request received", { sessionId, appointmentId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { status: session.payment_status });

    if (session.payment_status === "paid") {
      // Get appointment to find user_id
      const { data: appointmentData, error: fetchError } = await supabaseClient
        .from("appointments")
        .select("patient_id")
        .eq("id", appointmentId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch appointment: ${fetchError.message}`);
      }

      // Update appointment status
      const { error: appointmentError } = await supabaseClient
        .from("appointments")
        .update({ status: "confirmed" })
        .eq("id", appointmentId);

      if (appointmentError) {
        throw new Error(`Failed to update appointment: ${appointmentError.message}`);
      }
      logStep("Appointment updated to confirmed");

      // Create payment record using correct column names
      const { error: paymentError } = await supabaseClient
        .from("payments")
        .insert({
          user_id: appointmentData.patient_id,
          appointment_id: appointmentId,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase() || "INR",
          status: "success",
          gateway: "stripe",
          metadata: {
            stripe_session_id: sessionId,
            stripe_payment_intent: session.payment_intent,
          },
        });

      if (paymentError) {
        logStep("Warning: Failed to create payment record", { error: paymentError.message });
      } else {
        logStep("Payment record created");
      }

      // Trigger confirmation notification
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            type: "booking_confirmed",
            appointmentId,
          }),
        });
        logStep("Confirmation notification triggered");
      } catch (notifError) {
        logStep("Warning: Failed to send notification", { error: notifError });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        status: "paid",
        message: "Payment verified and appointment confirmed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        status: session.payment_status,
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
