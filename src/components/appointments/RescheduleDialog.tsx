import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchTimeSlots, TimeSlotData } from "@/lib/slots";

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: string;
    clinic_id: string;
    doctor_id: string | null;
  };
  onSuccess: () => void;
}

export function RescheduleDialog({ open, onOpenChange, appointment, onSuccess }: RescheduleDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [rescheduling, setRescheduling] = useState(false);

  const dayOfWeek = selectedDate ? selectedDate.getDay() : -1;

  const { data: slots = [], isLoading: slotsLoading } = useQuery<TimeSlotData[]>({
    queryKey: ["time-slots-reschedule", appointment?.clinic_id, appointment?.doctor_id, dayOfWeek],
    queryFn: () => fetchTimeSlots(appointment.clinic_id, appointment.doctor_id, dayOfWeek),
    enabled: !!selectedDate && !!appointment && open && dayOfWeek >= 0,
  });

  const handleReschedule = async () => {
    if (!selectedDate || !selectedSlot || !appointment) return;

    setRescheduling(true);
    try {
      const slot = slots.find((s) => s.id === selectedSlot);
      if (!slot) throw new Error("Slot not found");

      const { error } = await supabase
        .from("appointments")
        .update({
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: slot.start_time,
          end_time: slot.end_time,
          status: "pending" as const,
        })
        .eq("id", appointment.id);

      if (error) throw error;

      // Send rescheduled notification
      try {
        await supabase.functions.invoke("send-notification", {
          body: { type: "rescheduled", appointmentId: appointment.id },
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }

      toast({
        title: t("appointment.rescheduled"),
        description: t("appointment.rescheduledDescription"),
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRescheduling(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("appointment.reschedule")}</DialogTitle>
          <DialogDescription>{t("appointment.rescheduleDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium mb-2">{t("booking.selectDate")}</p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < today}
              className="rounded-md border"
            />
          </div>

          {selectedDate && (
            <div>
              <p className="text-sm font-medium mb-2">{t("booking.selectTime")}</p>
              {slotsLoading ? (
                <LoadingSpinner size="sm" />
              ) : slots.length > 0 ? (
                <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("booking.selectSlot")} />
                  </SelectTrigger>
                  <SelectContent>
                    {slots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">{t("booking.noSlotsAvailable")}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleReschedule} disabled={!selectedDate || !selectedSlot || rescheduling}>
            {rescheduling && <LoadingSpinner size="sm" className="mr-2" />}
            {t("appointment.confirmReschedule")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
