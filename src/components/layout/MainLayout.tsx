import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

interface MainLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export function MainLayout({ children, showMobileNav = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={showMobileNav ? "pb-20 md:pb-0" : ""}>
        {children}
      </main>
      {showMobileNav && <MobileNav />}
    </div>
  );
}
