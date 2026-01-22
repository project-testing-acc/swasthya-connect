import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, addDays, isSameDay } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useClinic, useDoctorTimeSlots } from "@/hooks/useClinics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  MapPin,
  CheckCircle2,
} from "lucide-react";

type AppointmentType = "in_person" | "teleconsultation";

export default function BookAppointment() {
  const { clinicId, doctorId } = useParams<{ clinicId: string; doctorId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("in_person");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [tokenNumber, setTokenNumber] = useState<number | null>(null);

  const { data: clinic, isLoading: clinicLoading } = useClinic(clinicId || "");
  const { data: timeSlots, isLoading: slotsLoading } = useDoctorTimeSlots(
    doctorId || "",
    selectedDate
  );

  const doctor = useMemo(() => {
    if (!clinic) return null;
    return (clinic as any).doctors?.find((d: any) => d.id === doctorId);
  }, [clinic, doctorId]);

  // Generate individual time slots from ranges
  const availableSlots = useMemo(() => {
    if (!timeSlots || !doctor) return [];

    const slots: { time: string; display: string }[] = [];
    const duration = doctor.consultation_duration || 15;

    timeSlots.forEach((slot) => {
      const [startHour, startMin] = slot.start_time.split(":").map(Number);
      const [endHour, endMin] = slot.end_time.split(":").map(Number);

      let currentHour = startHour;
      let currentMin = startMin;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin < endMin)
      ) {
        const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin
          .toString()
          .padStart(2, "0")}`;
        const displayTime = format(
          new Date(2000, 0, 1, currentHour, currentMin),
          "h:mm a"
        );
        slots.push({ time: timeStr, display: displayTime });

        currentMin += duration;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }
    });

    return slots;
  }, [timeSlots, doctor]);

  const handleBookAppointment = async () => {
    if (!user) {
      toast.error("Please login to book an appointment");
      navigate("/login", { state: { from: `/book/${clinicId}/${doctorId}` } });
      return;
    }

    if (!selectedDate || !selectedSlot || !clinic || !doctor) {
      toast.error("Please select a date and time slot");
      return;
    }

    setIsBooking(true);

    try {
      // Calculate end time
      const duration = doctor.consultation_duration || 15;
      const [hour, min] = selectedSlot.split(":").map(Number);
      const endMin = min + duration;
      const endHour = hour + Math.floor(endMin / 60);
      const endTime = `${endHour.toString().padStart(2, "0")}:${(endMin % 60)
        .toString()
        .padStart(2, "0")}`;

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          patient_id: user.id,
          clinic_id: clinicId!,
          doctor_id: doctorId!,
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: selectedSlot,
          end_time: endTime,
          type: appointmentType,
          fee: clinic.consultation_fee,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      setTokenNumber(data.token_number);
      setBookingSuccess(true);
      toast.success(t("booking.bookingConfirmed"));
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  if (clinicLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!clinic || !doctor) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Clinic or doctor not found</p>
          <Button className="mt-4" onClick={() => navigate("/search")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (bookingSuccess) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t("booking.bookingConfirmed")}</h1>
              <p className="text-muted-foreground mb-6">
                Your appointment has been successfully booked.
              </p>

              {tokenNumber && (
                <div className="bg-primary/10 rounded-lg p-6 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("booking.tokenNumber")}
                  </p>
                  <p className="text-5xl font-bold text-primary">{tokenNumber}</p>
                </div>
              )}

              <div className="text-left space-y-3 mb-6 p-4 bg-muted/50 rounded-lg">
                <p className="font-medium">{t("booking.appointmentDetails")}</p>
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{availableSlots.find(s => s.time === selectedSlot)?.display}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{doctor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{clinic.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/appointments")}>
                  View My Appointments
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Doctor Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{doctor.name}</h2>
                    <p className="text-sm text-muted-foreground">{doctor.qualification}</p>
                    <p className="text-sm text-muted-foreground">{clinic.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {t("booking.selectDate")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Slot Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t("booking.selectTime")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {slotsLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedSlot === slot.time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSlot(slot.time)}
                        className="w-full"
                      >
                        {slot.display}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    {t("booking.noSlotsAvailable")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Appointment Type */}
            <Card>
              <CardHeader>
                <CardTitle>{t("booking.selectType")}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={appointmentType}
                  onValueChange={(value) => setAppointmentType(value as AppointmentType)}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="in_person"
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      appointmentType === "in_person"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="in_person" id="in_person" className="sr-only" />
                    <MapPin className="h-8 w-8 text-primary" />
                    <span className="font-medium">{t("booking.inPerson")}</span>
                  </Label>
                  <Label
                    htmlFor="teleconsultation"
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      appointmentType === "teleconsultation"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="teleconsultation" id="teleconsultation" className="sr-only" />
                    <Video className="h-8 w-8 text-primary" />
                    <span className="font-medium">{t("booking.teleconsult")}</span>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:sticky lg:top-4 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor</span>
                    <span className="font-medium">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clinic</span>
                    <span className="font-medium line-clamp-1">{clinic.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {selectedDate ? format(selectedDate, "MMM d, yyyy") : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">
                      {selectedSlot
                        ? availableSlots.find((s) => s.time === selectedSlot)?.display
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">
                      {appointmentType === "in_person" ? t("booking.inPerson") : t("booking.teleconsult")}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t("clinic.fee")}</span>
                    <span className="text-primary">₹{clinic.consultation_fee}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!selectedDate || !selectedSlot || isBooking}
                  onClick={handleBookAppointment}
                >
                  {isBooking ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Booking...
                    </>
                  ) : (
                    t("booking.confirmBooking")
                  )}
                </Button>

                {!user && (
                  <p className="text-sm text-center text-muted-foreground">
                    You'll need to login to complete the booking
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
