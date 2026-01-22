import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";
import { useSpecialties } from "@/hooks/useClinics";

interface SearchFiltersProps {
  specialty: string;
  setSpecialty: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  feeRange: [number, number];
  setFeeRange: (value: [number, number]) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  onClearFilters: () => void;
}

export function SearchFilters({
  specialty,
  setSpecialty,
  city,
  setCity,
  feeRange,
  setFeeRange,
  sortBy,
  setSortBy,
  onClearFilters,
}: SearchFiltersProps) {
  const { t, i18n } = useTranslation();
  const { data: specialties } = useSpecialties();

  const getSpecialtyName = (spec: any) => {
    switch (i18n.language) {
      case "hi":
        return spec.name_hi;
      case "gu":
        return spec.name_gu;
      default:
        return spec.name_en;
    }
  };

  const hasActiveFilters = specialty || city || feeRange[0] > 0 || feeRange[1] < 2000 || sortBy !== "rating";

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Specialty Filter */}
      <div className="space-y-2">
        <Label>Specialty</Label>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger>
            <SelectValue placeholder="All Specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {specialties?.map((spec) => (
              <SelectItem key={spec.id} value={spec.icon || spec.name_en}>
                {getSpecialtyName(spec)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City Filter */}
      <div className="space-y-2">
        <Label>City</Label>
        <Input
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {/* Fee Range */}
      <div className="space-y-4">
        <Label>Consultation Fee: ₹{feeRange[0]} - ₹{feeRange[1]}</Label>
        <Slider
          value={feeRange}
          onValueChange={(value) => setFeeRange(value as [number, number])}
          min={0}
          max={2000}
          step={50}
          className="w-full"
        />
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="fee_low">Fee: Low to High</SelectItem>
            <SelectItem value="fee_high">Fee: High to Low</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={onClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Filters</h3>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  Active
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your search results
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
