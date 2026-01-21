import {
  Stethoscope,
  Heart,
  Bone,
  Baby,
  Brain,
  Eye,
  Ear,
  Smile,
  Pill,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  general: Stethoscope,
  cardio: Heart,
  ortho: Bone,
  pedia: Baby,
  neuro: Brain,
  eye: Eye,
  ent: Ear,
  dental: Smile,
  derma: Pill,
  gyno: Activity,
};

interface SpecialtyIconProps {
  specialty: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SpecialtyIcon({ specialty, className, size = "md" }: SpecialtyIconProps) {
  const Icon = iconMap[specialty.toLowerCase()] || Stethoscope;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return <Icon className={cn(sizeClasses[size], className)} />;
}
