import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import logoImg from "@assets/logo_citanje_tr_1771366023473.png";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { href: "/", label: "Početna" },
  { href: "/biblioteka", label: "Biblioteka" },
  { href: "/blog", label: "Blog" },
  { href: "/cijene", label: "Cijene" },
  { href: "/vodic", label: "Vodič" },
];

function getDashboardPath(role?: string) {
  switch (role) {
    case "admin": return "/admin";
    case "teacher": return "/ucitelj";
    case "parent": return "/roditelj";
    default: return "/ucenik";
  }
}

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-testid="navbar"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
        <Link href="/" data-testid="link-logo">
          <span className="flex items-center gap-3 text-2xl font-bold">
            <img src={logoImg} alt="Čitanje logo" className="h-20 w-20" />
            Čitanje
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="lg"
                className={`text-base font-semibold ${
                  location === link.href
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className="flex items-center gap-2 text-base"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {user.fullName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-base">{user.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="text-base">
                  <Link href={getDashboardPath(user.role)} data-testid="link-dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => logout.mutate()}
                  data-testid="button-logout"
                  className="text-base"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Odjavi se
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/prijava">
                <Button variant="ghost" size="lg" className="text-base font-semibold" data-testid="link-login">
                  Prijava
                </Button>
              </Link>
              <Link href="/registracija">
                <Button size="lg" className="text-base font-semibold" data-testid="link-register">Registracija</Button>
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <img src={logoImg} alt="Čitanje logo" className="h-10 w-10" />
                  Čitanje
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      size="lg"
                      className={`w-full justify-start text-base ${
                        location === link.href
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                      onClick={() => setMobileOpen(false)}
                      data-testid={`link-mobile-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <div className="my-4 border-t" />
                {isAuthenticated && user ? (
                  <>
                    <Link href={getDashboardPath(user.role)}>
                      <Button
                        variant="ghost"
                        size="lg"
                        className="w-full justify-start text-base"
                        onClick={() => setMobileOpen(false)}
                        data-testid="link-mobile-dashboard"
                      >
                        <LayoutDashboard className="mr-2 h-5 w-5" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full justify-start text-base"
                      onClick={() => {
                        logout.mutate();
                        setMobileOpen(false);
                      }}
                      data-testid="button-mobile-logout"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Odjavi se
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/prijava">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="w-full justify-start text-base"
                        onClick={() => setMobileOpen(false)}
                        data-testid="link-mobile-login"
                      >
                        Prijava
                      </Button>
                    </Link>
                    <Link href="/registracija">
                      <Button
                        size="lg"
                        className="w-full text-base"
                        onClick={() => setMobileOpen(false)}
                        data-testid="link-mobile-register"
                      >
                        Registracija
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
