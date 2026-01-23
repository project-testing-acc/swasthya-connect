import { supabase } from "@/integrations/supabase/client";

export interface TimeSlotData {
  id: string;
  start_time: string;
  end_time: string;
}

export async function fetchTimeSlots(
  clinicId: string,
  _doctorId: string | null,
  dayOfWeek: number
): Promise<TimeSlotData[]> {
  // Use explicit any to avoid TypeScript infinite type instantiation
  const query = (supabase as any)
    .from("time_slots")
    .select("id, start_time, end_time")
    .eq("clinic_id", clinicId)
    .eq("day_of_week", dayOfWeek);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as TimeSlotData[];
}
