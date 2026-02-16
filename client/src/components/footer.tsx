import { Link } from "wouter";
import { BookOpen } from "lucide-react";

const platformLinks = [
  { href: "/", label: "Početna" },
  { href: "/blog", label: "Blog" },
  { href: "/cijene", label: "Cijene" },
];

const supportLinks = [
  { href: "/kontakt", label: "Kontakt" },
  { href: "/kontakt", label: "Pomoć" },
  { href: "/kontakt", label: "FAQ" },
];

const legalLinks = [
  { href: "#", label: "Uvjeti korištenja" },
  { href: "#", label: "Privatnost" },
  { href: "#", label: "Kolačići" },
];

export function Footer() {
  return (
    <footer className="border-t bg-card" data-testid="footer">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/">
              <span className="flex items-center gap-2 text-lg font-bold">
                <BookOpen className="h-5 w-5 text-primary" />
                Čitaj!
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Platforma za unapređenje čitanja i učenja za učenike, nastavnike i
              roditelje.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Platforma</h3>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span
                      className="text-sm text-muted-foreground transition-colors"
                      data-testid={`link-footer-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Podrška</h3>
            <ul className="space-y-2">
              {supportLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Pravne informacije</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Čitaj!. Sva prava pridržana.
          </p>
        </div>
      </div>
    </footer>
  );
}
