import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Mail, Construction } from "lucide-react";

export default function WelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("citanje_welcome_seen");
    if (!seen) {
      setOpen(true);
    }
  }, []);

  function handleClose() {
    localStorage.setItem("citanje_welcome_seen", "1");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md" data-testid="dialog-welcome">
        <DialogHeader>
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Construction className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Dobrodošli na Čitanje.ba!
          </DialogTitle>
          <DialogDescription className="sr-only">Informacija o testnoj fazi platforme</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground leading-relaxed">
            Platforma je trenutno u <strong>testnoj fazi</strong> u kojoj aktivno dodajemo knjige i kvizove.
          </p>
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <p className="font-semibold">Poziv na saradnju</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pozivamo profesore bosanskog jezika i književnosti da nam se pridruže u kreiranju sadržaja.
            </p>
            <a
              href="mailto:info@citanje.ba"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary hover:underline"
              data-testid="link-welcome-email"
            >
              <Mail className="h-4 w-4" />
              info@citanje.ba
            </a>
          </div>
        </div>
        <DialogFooter className="sm:justify-center pt-2">
          <Button onClick={handleClose} data-testid="button-welcome-close" className="px-8">
            Razumijem, nastavi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}