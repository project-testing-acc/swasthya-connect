import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DoctorCard } from "@/components/clinic/DoctorCard";
import { useClinic, useClinicDoctors } from "@/hooks/useClinics";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Shield,
  Clock,
  ArrowLeft,
  Users,
  Info,
  Calendar,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function ClinicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: clinic, isLoading: clinicLoading } = useClinic(id || "");
  const { data: doctors, isLoading: doctorsLoading } = useClinicDoctors(id || "");

  const getSpecialtyName = (specialty: Tables<"specialties">) => {
    switch (i18n.language) {
      case "hi":
        return specialty.name_hi;
      case "gu":
        return specialty.name_gu;
      default:
        return specialty.name_en;
    }
  };

  const handleSelectDoctor = (doctor: Tables<"doctors">) => {
    navigate(`/book/${clinic?.id}/${doctor.id}`);
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

  if (!clinic) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Clinic not found</p>
          <Button className="mt-4" onClick={() => navigate("/search")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-muted">
        <img
          src={clinic.image_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200"}
          alt={clinic.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>

      <div className="container -mt-20 relative z-10 pb-8">
        {/* Clinic Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{clinic.name}</h1>
                  {clinic.is_verified && (
                    <Badge className="bg-success text-success-foreground">
                      <Shield className="mr-1 h-3 w-3" />
                      {t("clinic.verified")}
                    </Badge>
                  )}
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(clinic as any).clinic_specialties?.map((cs: any) => (
                    <Badge key={cs.specialties.id} variant="secondary">
                      {getSpecialtyName(cs.specialties)}
                    </Badge>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-warning text-warning" />
                    <span className="font-semibold text-lg">
                      {clinic.average_rating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="text-muted-foreground">
                      ({clinic.total_reviews || 0} {t("clinic.reviews")})
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{clinic.address}, {clinic.city}, {clinic.state} - {clinic.pincode}</span>
                  </div>
                  {clinic.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <a href={`tel:${clinic.phone}`} className="hover:text-primary">
                        {clinic.phone}
                      </a>
                    </div>
                  )}
                  {clinic.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <a href={`mailto:${clinic.email}`} className="hover:text-primary">
                        {clinic.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Fee Card */}
              <Card className="md:w-64 bg-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">{t("clinic.fee")}</p>
                  <p className="text-3xl font-bold text-primary">₹{clinic.consultation_fee}</p>
                  <p className="text-xs text-muted-foreground mt-1">per consultation</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="doctors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="doctors" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t("clinic.doctors")}</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">{t("clinic.about")}</span>
            </TabsTrigger>
            <TabsTrigger value="timings" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">{t("clinic.timings")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctors">
            {doctorsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : doctors && doctors.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onSelectDoctor={handleSelectDoctor}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No doctors available at this clinic.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>{t("clinic.about")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {clinic.description || "No description available for this clinic."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timings">
            <Card>
              <CardHeader>
                <CardTitle>{t("clinic.timings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                    (day) => (
                      <div
                        key={day}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <span className="font-medium">{day}</span>
                        <span className="text-muted-foreground">9:00 AM - 8:00 PM</span>
                      </div>
                    )
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium">Sunday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
