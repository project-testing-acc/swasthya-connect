import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { RescheduleDialog } from "@/components/appointments/RescheduleDialog";
import { CancelDialog } from "@/components/appointments/CancelDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Search,
  LogIn,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type AppointmentStatus = Tables<"appointments">["status"];

const statusColors: Record<AppointmentStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  no_show: "bg-muted text-muted-foreground",
};

export default function Appointments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [rescheduleAppointment, setRescheduleAppointment] = useState<any>(null);
  const [cancelAppointment, setCancelAppointment] = useState<any>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          clinics(*),
          doctors(*)
        `)
        .eq("patient_id", user.id)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const upcomingAppointments = appointments?.filter(
    (apt) => new Date(apt.appointment_date) >= new Date() && apt.status !== "cancelled"
  ) || [];

  const pastAppointments = appointments?.filter(
    (apt) => new Date(apt.appointment_date) < new Date() || apt.status === "cancelled"
  ) || [];

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <div className="max-w-md mx-auto">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">{t("nav.appointments")}</h1>
            <p className="text-muted-foreground mb-6">
              Please login to view and manage your appointments.
            </p>
            <Button onClick={() => navigate("/login")}>
              <LogIn className="mr-2 h-4 w-4" />
              {t("auth.login")}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{appointment.clinics?.name}</h3>
              <Badge className={statusColors[appointment.status as AppointmentStatus]}>
                {t(`appointment.${appointment.status}`)}
              </Badge>
            </div>
            {appointment.doctors && (
              <p className="text-sm text-muted-foreground">
                {appointment.doctors.name}
              </p>
            )}
          </div>
          {appointment.token_number && (
            <div className="text-center px-3 py-1 bg-primary/10 rounded">
              <p className="text-xs text-muted-foreground">Token</p>
              <p className="text-xl font-bold text-primary">
                {appointment.token_number}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(appointment.appointment_date), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(
                new Date(`2000-01-01T${appointment.start_time}`),
                "h:mm a"
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {appointment.type === "teleconsultation" ? (
              <Video className="h-4 w-4" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span>
              {appointment.type === "teleconsultation"
                ? t("booking.teleconsult")
                : t("booking.inPerson")}
            </span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            ₹{appointment.fee}
          </div>
        </div>

        {appointment.status === "pending" && (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setRescheduleAppointment(appointment)}>
              {t("appointment.reschedule")}
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => setCancelAppointment(appointment)}>
              {t("appointment.cancelAppointment")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">{t("nav.appointments")}</h1>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              {t("appointment.upcoming")} ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              {t("appointment.past")} ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {t("appointment.noAppointments")}
                </p>
                <Button onClick={() => navigate("/search")}>
                  <Search className="mr-2 h-4 w-4" />
                  Find a Clinic
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : pastAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No past appointments found.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <RescheduleDialog
          open={!!rescheduleAppointment}
          onOpenChange={(open) => !open && setRescheduleAppointment(null)}
          appointment={rescheduleAppointment}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["appointments"] })}
        />

        <CancelDialog
          open={!!cancelAppointment}
          onOpenChange={(open) => !open && setCancelAppointment(null)}
          appointment={cancelAppointment}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["appointments"] })}
        />
      </div>
    </MainLayout>
  );
}
