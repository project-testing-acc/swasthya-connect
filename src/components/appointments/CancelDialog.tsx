import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  onSuccess: () => void;
}

export function CancelDialog({ open, onOpenChange, appointment, onSuccess }: CancelDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!appointment) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointment.id);

      if (error) throw error;

      // Send cancellation notification
      await supabase.functions.invoke("send-notification", {
        body: { type: "cancelled", appointmentId: appointment.id },
      });

      toast({
        title: t("appointment.cancelled"),
        description: t("appointment.cancelledDescription"),
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  // Check if cancellation is allowed (at least 2 hours before)
  const appointmentTime = appointment ? new Date(`${appointment.appointment_date}T${appointment.start_time}`) : null;
  const now = new Date();
  const hoursUntilAppointment = appointmentTime ? (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60) : 0;
  const canCancel = hoursUntilAppointment >= 2;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("appointment.cancelAppointment")}</AlertDialogTitle>
          <AlertDialogDescription>
            {canCancel ? (
              t("appointment.cancelConfirmation")
            ) : (
              <span className="text-destructive">
                {t("appointment.cancelTooLate")}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.back")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={!canCancel || cancelling}
            className="bg-destructive hover:bg-destructive/90"
          >
            {cancelling && <LoadingSpinner size="sm" className="mr-2" />}
            {t("appointment.confirmCancel")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
