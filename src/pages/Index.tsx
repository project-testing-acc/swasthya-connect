import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpecialtyIcon } from "@/components/common/SpecialtyIcon";
import {
  Search,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Shield,
  Calendar,
  CreditCard,
} from "lucide-react";

export default function Index() {
  const { t } = useTranslation();

  const specialties = [
    { key: "general", color: "bg-blue-100 text-blue-700" },
    { key: "dental", color: "bg-pink-100 text-pink-700" },
    { key: "derma", color: "bg-purple-100 text-purple-700" },
    { key: "cardio", color: "bg-red-100 text-red-700" },
    { key: "ortho", color: "bg-orange-100 text-orange-700" },
    { key: "gyno", color: "bg-rose-100 text-rose-700" },
    { key: "pedia", color: "bg-green-100 text-green-700" },
    { key: "eye", color: "bg-cyan-100 text-cyan-700" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Providers",
      description: "All clinics and labs are verified for quality and safety",
    },
    {
      icon: Calendar,
      title: "Instant Booking",
      description: "Book appointments in seconds, no phone calls needed",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Pay via UPI, cards, or net banking with Razorpay",
    },
  ];

  // Demo clinics data
  const demoClinics = [
    {
      id: "1",
      name: "LifeCare Multi-Specialty Clinic",
      specialty: "General",
      address: "Vastrapur, Ahmedabad",
      fee: 500,
      rating: 4.8,
      reviews: 234,
      nextSlot: "Today, 4:30 PM",
      verified: true,
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400",
    },
    {
      id: "2",
      name: "Smile Dental Care",
      specialty: "Dental",
      address: "Navrangpura, Ahmedabad",
      fee: 400,
      rating: 4.6,
      reviews: 156,
      nextSlot: "Today, 5:00 PM",
      verified: true,
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400",
    },
    {
      id: "3",
      name: "HeartCare Cardiology Center",
      specialty: "Cardio",
      address: "Satellite, Ahmedabad",
      fee: 800,
      rating: 4.9,
      reviews: 312,
      nextSlot: "Tomorrow, 10:00 AM",
      verified: true,
      image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400",
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              {t("home.hero.title")}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              {t("home.hero.subtitle")}
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("home.searchPlaceholder")}
                    className="h-12 pl-10 text-base"
                  />
                </div>
                <Button size="lg" className="h-12" asChild>
                  <Link to="/search">
                    {t("common.search")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Popular Specialties */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">
              {t("home.popularSpecialties")}
            </h2>
            <Button variant="ghost" asChild>
              <Link to="/search">
                {t("common.viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {specialties.map((specialty) => (
              <Link
                key={specialty.key}
                to={`/search?specialty=${specialty.key}`}
                className="group"
              >
                <Card className="card-hover text-center">
                  <CardContent className="p-4">
                    <div
                      className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${specialty.color} transition-transform group-hover:scale-110`}
                    >
                      <SpecialtyIcon specialty={specialty.key} size="lg" />
                    </div>
                    <p className="text-sm font-medium">
                      {t(`specialties.${specialty.key}`)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-muted/30 py-12 md:py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Clinics */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">
              {t("home.nearbyClinic")}
            </h2>
            <Button variant="ghost" asChild>
              <Link to="/search">
                {t("common.viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demoClinics.map((clinic) => (
              <Link key={clinic.id} to={`/clinic/${clinic.id}`}>
                <Card className="card-hover overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={clinic.image}
                      alt={clinic.name}
                      className="h-full w-full object-cover"
                    />
                    {clinic.verified && (
                      <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
                        <Shield className="mr-1 h-3 w-3" />
                        {t("clinic.verified")}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{clinic.name}</h3>
                        <p className="text-sm text-muted-foreground">{clinic.specialty}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-medium">{clinic.rating}</span>
                        <span className="text-muted-foreground">
                          ({clinic.reviews})
                        </span>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {clinic.address}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-success">
                        <Clock className="h-4 w-4" />
                        {clinic.nextSlot}
                      </div>
                      <p className="font-semibold">₹{clinic.fee}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary py-16 text-white">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to book your appointment?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of patients who trust Swasthya Slots for their healthcare needs.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/search">
                {t("common.search")} Clinics
                <Search className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              asChild
            >
              <Link to="/signup">{t("auth.signup")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
