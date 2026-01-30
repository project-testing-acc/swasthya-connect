import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Menu, User, Calendar, LogOut, Bell } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="hidden font-bold text-xl sm:inline-block">
            {t("common.appName")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav.home")}
          </Link>
          <Link
            to="/search"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav.search")}
          </Link>
          {user && (
            <Link
              to="/appointments"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("nav.appointments")}
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {user ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.full_name ? getInitials(profile.full_name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {t("nav.profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/appointments" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t("nav.appointments")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("auth.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link to="/login">{t("auth.login")}</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">{t("auth.signup")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <nav className="flex flex-col gap-4 pt-8">
                <Link
                  to="/"
                  className="text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.home")}
                </Link>
                <Link
                  to="/search"
                  className="text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.search")}
                </Link>
                {user && (
                  <Link
                    to="/appointments"
                    className="text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.appointments")}
                  </Link>
                )}
                {!user && (
                  <div className="flex flex-col gap-2 pt-4">
                    <Button asChild variant="outline">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        {t("auth.login")}
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        {t("auth.signup")}
                      </Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
