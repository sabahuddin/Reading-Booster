import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm shadow-lg"
      data-testid="cookie-banner"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Cookie className="h-5 w-5 shrink-0 text-primary" />
          <p>
            Koristimo kolačiće za funkcioniranje stranice i poboljšanje korisničkog iskustva.{" "}
            <Link href="/kolacici">
              <span className="underline hover:text-foreground">Saznaj više</span>
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            data-testid="button-cookie-decline"
          >
            Odbij
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            data-testid="button-cookie-accept"
          >
            Prihvatam
          </Button>
        </div>
      </div>
    </div>
  );
}
