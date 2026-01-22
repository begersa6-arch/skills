import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import {
  Briefcase,
  Building2,
  MessageSquare,
  User,
  LogOut,
  Search,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut, user } = useAuth();
  const location = useLocation();

  const isEmployer = profile?.role === "employer";

  const seekerNavItems = [
    { href: "/discover", icon: Briefcase, label: "Discover" },
    { href: "/companies", icon: Building2, label: "Companies" },
    { href: "/applications", icon: Search, label: "Applications" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const employerNavItems = [
    { href: "/employer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/employer/jobs", icon: Briefcase, label: "Jobs" },
    { href: "/employer/messages", icon: MessageCircle, label: "Messages" },
    { href: "/employer/company", icon: Building2, label: "Company" },
  ];

  const navItems = isEmployer ? employerNavItems : seekerNavItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to={isEmployer ? "/employer/dashboard" : "/discover"}>
            <Logo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/feedback">
              <Button variant="ghost" size="sm">
                Feedback
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center gap-1 py-2 rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
