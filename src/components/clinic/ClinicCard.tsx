import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Shield, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface ClinicCardProps {
  clinic: Tables<"clinics"> & {
    clinic_specialties?: { specialties: Tables<"specialties"> }[];
  };
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  const { t, i18n } = useTranslation();

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

  return (
    <Link to={`/clinic/${clinic.id}`}>
      <Card className="card-hover overflow-hidden h-full">
        <div className="aspect-video relative">
          <img
            src={clinic.image_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400"}
            alt={clinic.name}
            className="h-full w-full object-cover"
          />
          {clinic.is_verified && (
            <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
              <Shield className="mr-1 h-3 w-3" />
              {t("clinic.verified")}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-1">{clinic.name}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {clinic.clinic_specialties?.slice(0, 2).map((cs) => (
                  <Badge key={cs.specialties.id} variant="secondary" className="text-xs">
                    {getSpecialtyName(cs.specialties)}
                  </Badge>
                ))}
                {(clinic.clinic_specialties?.length || 0) > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{(clinic.clinic_specialties?.length || 0) - 2}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm shrink-0">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-medium">{clinic.average_rating?.toFixed(1) || "N/A"}</span>
              <span className="text-muted-foreground">
                ({clinic.total_reviews || 0})
              </span>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{clinic.address}, {clinic.city}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-success">
              <Clock className="h-4 w-4" />
              {t("clinic.nextSlot")}: Today
            </div>
            <p className="font-semibold">₹{clinic.consultation_fee}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
