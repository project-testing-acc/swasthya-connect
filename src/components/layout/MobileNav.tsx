import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Search, Calendar, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/search", icon: Search, label: t("nav.search") },
    ...(user
      ? [
          { to: "/appointments", icon: Calendar, label: t("nav.appointments") },
          { to: "/notifications", icon: Bell, label: t("nav.notifications") },
          { to: "/profile", icon: User, label: t("nav.profile") },
        ]
      : [{ to: "/login", icon: User, label: t("auth.login") }]),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "text-primary")}
              />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
