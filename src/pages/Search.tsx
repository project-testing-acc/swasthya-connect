import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { ClinicCard } from "@/components/clinic/ClinicCard";
import { SearchFilters } from "@/components/clinic/SearchFilters";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useClinics } from "@/hooks/useClinics";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [feeRange, setFeeRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating");

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (specialty && specialty !== "all") params.set("specialty", specialty);
    if (city) params.set("city", city);
    if (sortBy !== "rating") params.set("sort", sortBy);
    setSearchParams(params, { replace: true });
  }, [search, specialty, city, sortBy, setSearchParams]);

  const { data: clinics, isLoading, error } = useClinics({
    search,
    specialty: specialty === "all" ? undefined : specialty,
    city,
    minFee: feeRange[0] > 0 ? feeRange[0] : undefined,
    maxFee: feeRange[1] < 2000 ? feeRange[1] : undefined,
    sortBy: sortBy as "rating" | "fee_low" | "fee_high" | "reviews",
  });

  const handleClearFilters = () => {
    setSearch("");
    setSpecialty("");
    setCity("");
    setFeeRange([0, 2000]);
    setSortBy("rating");
  };

  return (
    <MainLayout>
      <div className="container py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl mb-4">
            {t("home.nearbyClinic")}
          </h1>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("home.searchPlaceholder")}
              className="h-12 pl-10 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <SearchFilters
            specialty={specialty}
            setSpecialty={setSpecialty}
            city={city}
            setCity={setCity}
            feeRange={feeRange}
            setFeeRange={setFeeRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onClearFilters={handleClearFilters}
          />

          {/* Results */}
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{t("common.error")}</p>
              </div>
            ) : clinics && clinics.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {clinics.length} clinic{clinics.length !== 1 ? "s" : ""} found
                </p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {clinics.map((clinic: any) => (
                    <ClinicCard key={clinic.id} clinic={clinic} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No clinics found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
