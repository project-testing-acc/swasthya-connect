import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, RotateCcw, Home } from "lucide-react";

export default function PaymentCancelled() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointment_id");

  return (
    <MainLayout>
      <div className="container py-12 max-w-md mx-auto text-center">
        <Card>
          <CardContent className="pt-6">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t("payment.cancelled")}</h1>
            <p className="text-muted-foreground mb-6">
              {t("payment.cancelledDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {appointmentId && (
                <Button onClick={() => navigate(`/book/${appointmentId}`)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t("payment.tryAgain")}
                </Button>
              )}
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
