import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Calendar } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface DoctorCardProps {
  doctor: Tables<"doctors">;
  onSelectDoctor: (doctor: Tables<"doctors">) => void;
}

export function DoctorCard({ doctor, onSelectDoctor }: DoctorCardProps) {
  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={doctor.image_url || undefined} alt={doctor.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{doctor.name}</h3>
            {doctor.qualification && (
              <p className="text-sm text-muted-foreground">{doctor.qualification}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {doctor.experience_years && doctor.experience_years > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {doctor.experience_years} yrs exp
                </Badge>
              )}
              {doctor.consultation_duration && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {doctor.consultation_duration} min
                </Badge>
              )}
            </div>
          </div>
        </div>

        {doctor.bio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {doctor.bio}
          </p>
        )}

        <Button className="w-full mt-4" onClick={() => onSelectDoctor(doctor)}>
          <Calendar className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  );
}
