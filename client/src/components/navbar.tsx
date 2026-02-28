import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, LogOut, LayoutDashboard, Star, AArrowUp, AArrowDown } from "lucide-react";
import { useFontSize } from "@/hooks/use-font-size";
import logoImg from "@assets/logo_citanje_tr_1771366023473.png";
import brandTextImg from "@assets/citanje_1772315189461.png";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { href: "/", label: "Početna" },
  { href: "/biblioteka", label: "Biblioteka" },
  { href: "/razmjena", label: "Razmjena" },
  { href: "/blog", label: "Blog" },
  { href: "/cijene", label: "Cijene" },
  { href: "/vodic", label: "Vodič" },
];

function getDashboardPath(role?: string) {
  switch (role) {
    case "admin": return "/admin";
    case "teacher": return "/ucitelj";
    case "parent": return "/roditelj";
    case "reader": return "/citanje";
    default: return "/ucenik";
  }
}

function getInitials(fullName?: string) {
  return fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";
}

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { increase, decrease, canIncrease, canDecrease } = useFontSize();

  return (
    <nav
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-testid="navbar"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-1">
        <Link href="/" data-testid="link-logo">
          <span className="flex items-center">
            <img src={logoImg} alt="Čitanje logo" className="h-14 w-14" />
            <img src={brandTextImg} alt="Čitanje" className="h-12 object-contain" />
            <span className="text-[10px] font-normal text-muted-foreground self-end mb-0.5">(test faza)</span>
          </span>
        </Link>

        <div className="hidden items-center gap-0 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={`text-base font-semibold px-3 ${
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

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center border rounded-md" data-testid="font-size-controls">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={decrease}
              disabled={!canDecrease}
              title="Smanji font"
              data-testid="button-font-decrease"
            >
              <AArrowDown className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-4 bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={increase}
              disabled={!canIncrease}
              title="Povećaj font"
              data-testid="button-font-increase"
            >
              <AArrowUp className="h-3.5 w-3.5" />
            </Button>
          </div>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                  data-testid="button-user-menu"
                >
                  <Badge variant="secondary" className="gap-1 text-sm no-default-hover-elevate no-default-active-elevate" data-testid="badge-points">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    {user.points ?? 0}
                  </Badge>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm font-semibold">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-3 py-2 text-sm font-medium border-b mb-1">
                  {user.fullName}
                </div>
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
                <Button variant="ghost" className="text-base font-semibold px-3" data-testid="link-login">
                  Prijava
                </Button>
              </Link>
              <Link href="/registracija">
                <Button className="text-base font-semibold" data-testid="link-register">Registracija</Button>
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && user && (
            <Badge variant="secondary" className="gap-1 text-sm no-default-hover-elevate no-default-active-elevate" data-testid="badge-points-mobile">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              {user.points ?? 0}
            </Badge>
          )}
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
                <SheetTitle className="flex items-center text-lg">
                  <img src={logoImg} alt="Čitanje logo" className="h-10 w-10" />
                  <img src={brandTextImg} alt="Čitanje" className="h-9 object-contain" />
                  <span className="text-[10px] font-normal text-muted-foreground">(test faza)</span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
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
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-muted-foreground">Veličina fonta</span>
                  <div className="flex items-center border rounded-md" data-testid="font-size-controls-mobile">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={decrease} disabled={!canDecrease} data-testid="button-font-decrease-mobile">
                      <AArrowDown className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border" />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={increase} disabled={!canIncrease} data-testid="button-font-increase-mobile">
                      <AArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="my-4 border-t" />
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm font-semibold">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-base font-medium">{user.fullName}</span>
                    </div>
                    <div className="my-2 border-t" />
                    <Link href={getDashboardPath(user.role)}>
                      <Button
                        variant="ghost"
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
                        className="w-full justify-start text-base"
                        onClick={() => setMobileOpen(false)}
                        data-testid="link-mobile-login"
                      >
                        Prijava
                      </Button>
                    </Link>
                    <Link href="/registracija">
                      <Button
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
