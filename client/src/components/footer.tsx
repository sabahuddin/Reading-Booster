import { Link } from "wouter";
import { BookOpen } from "lucide-react";

const platformLinks = [
  { href: "/", label: "Početna" },
  { href: "/blog", label: "Blog" },
  { href: "/cijene", label: "Cijene" },
];

const supportLinks = [
  { href: "/kontakt", label: "Kontakt" },
  { href: "/vodic", label: "Vodič" },
  { href: "/faq", label: "FAQ" },
];

const legalLinks = [
  { href: "#", label: "Uvjeti korištenja" },
  { href: "#", label: "Privatnost" },
  { href: "#", label: "Kolačići" },
];

export function Footer() {
  return (
    <footer className="border-t bg-card" data-testid="footer">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 col-span-2 lg:col-span-1">
            <Link href="/">
              <span className="flex items-center gap-2 text-xl font-bold">
                <BookOpen className="h-6 w-6 text-primary" />
                Čitanje
              </span>
            </Link>
            <p className="text-base text-muted-foreground">
              Platforma za unapređenje čitanja i učenja za učenike, nastavnike i
              roditelje.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold">Platforma</h3>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span
                      className="text-base text-muted-foreground transition-colors"
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
            <h3 className="mb-4 text-base font-semibold">Podrška</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href}>
                    <span className="text-base text-muted-foreground transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold">Pravne informacije</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-base text-muted-foreground transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-base text-muted-foreground">
            &copy; {new Date().getFullYear()} Čitanje. Sva prava pridržana.
          </p>
        </div>
      </div>
    </footer>
  );
}
