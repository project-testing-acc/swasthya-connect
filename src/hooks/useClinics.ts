import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Clinic = Tables<"clinics"> & {
  specialties?: { specialty: Tables<"specialties"> }[];
  doctors?: Tables<"doctors">[];
};

export type ClinicWithSpecialties = Clinic & {
  clinic_specialties: { specialties: Tables<"specialties"> }[];
};

interface UseClinicsParams {
  search?: string;
  specialty?: string;
  city?: string;
  minFee?: number;
  maxFee?: number;
  sortBy?: "rating" | "fee_low" | "fee_high" | "reviews";
}

export function useClinics(params: UseClinicsParams = {}) {
  return useQuery({
    queryKey: ["clinics", params],
    queryFn: async () => {
      let query = supabase
        .from("clinics")
        .select(`
          *,
          clinic_specialties(
            specialties(*)
          )
        `)
        .eq("is_active", true);

      // Search filter
      if (params.search) {
        query = query.or(
          `name.ilike.%${params.search}%,address.ilike.%${params.search}%,city.ilike.%${params.search}%`
        );
      }

      // City filter
      if (params.city) {
        query = query.ilike("city", `%${params.city}%`);
      }

      // Fee range filter
      if (params.minFee !== undefined) {
        query = query.gte("consultation_fee", params.minFee);
      }
      if (params.maxFee !== undefined) {
        query = query.lte("consultation_fee", params.maxFee);
      }

      // Sorting
      switch (params.sortBy) {
        case "rating":
          query = query.order("average_rating", { ascending: false });
          break;
        case "fee_low":
          query = query.order("consultation_fee", { ascending: true });
          break;
        case "fee_high":
          query = query.order("consultation_fee", { ascending: false });
          break;
        case "reviews":
          query = query.order("total_reviews", { ascending: false });
          break;
        default:
          query = query.order("average_rating", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by specialty if provided
      let clinics = data || [];
      if (params.specialty) {
        clinics = clinics.filter((clinic: any) =>
          clinic.clinic_specialties?.some(
            (cs: any) =>
              cs.specialties?.name_en?.toLowerCase().includes(params.specialty!.toLowerCase()) ||
              cs.specialties?.icon?.toLowerCase() === params.specialty!.toLowerCase()
          )
        );
      }

      return clinics;
    },
  });
}

export function useClinic(id: string) {
  return useQuery({
    queryKey: ["clinic", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinics")
        .select(`
          *,
          clinic_specialties(
            specialties(*)
          ),
          doctors(*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useSpecialties() {
  return useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialties")
        .select("*")
        .order("name_en");

      if (error) throw error;
      return data;
    },
  });
}

export function useDoctorTimeSlots(doctorId: string, date?: Date) {
  return useQuery({
    queryKey: ["time-slots", doctorId, date?.toISOString()],
    queryFn: async () => {
      if (!date) return [];

      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("doctor_id", doctorId)
        .eq("day_of_week", dayOfWeek)
        .eq("is_active", true)
        .order("start_time");

      if (error) throw error;
      return data || [];
    },
    enabled: !!doctorId && !!date,
  });
}

export function useClinicDoctors(clinicId: string) {
  return useQuery({
    queryKey: ["doctors", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!clinicId,
  });
}
