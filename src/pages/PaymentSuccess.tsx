import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Calendar, Home } from "lucide-react";

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appointmentId = searchParams.get("appointment_id");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !appointmentId) {
        setError("Missing payment information");
        setVerifying(false);
        return;
      }

      try {
        const { data, error: verifyError } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId, appointmentId },
        });

        if (verifyError) {
          throw verifyError;
        }

        if (data.success) {
          setVerified(true);
        } else {
          setError(data.message || "Payment verification failed");
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify payment");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, appointmentId]);

  if (verifying) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">{t("payment.verifying")}</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container py-12 max-w-md mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <div className="text-destructive text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold mb-2">{t("payment.error")}</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate("/appointments")}>
                {t("nav.appointments")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-12 max-w-md mx-auto text-center">
        <Card>
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t("payment.success")}</h1>
            <p className="text-muted-foreground mb-6">
              {t("payment.successDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/appointments")}>
                <Calendar className="h-4 w-4 mr-2" />
                {t("nav.appointments")}
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                <Home className="h-4 w-4 mr-2" />
                {t("nav.home")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
