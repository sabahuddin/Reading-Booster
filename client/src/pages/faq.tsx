import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, HelpCircle } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const faqs = [
  {
    question: "Zašto Čitanje?",
    answer: "U digitalnom dobu, motivacija za čitanje fizičkih knjiga opada. Naša platforma koristi elemente igre (gamification) kako bi čitanje ponovo postalo uzbudljiva avantura za djecu i mlade."
  },
  {
    question: "Treba li nam ovo?",
    answer: "Da, jer čitanje razvija empatiju, vokabular i kritičko razmišljanje. Čitanje.ba premošćuje jaz između ekrana i papira, čineći svaku pročitanu stranicu vrijednom bodova i priznanja."
  },
  {
    question: "Koji je cilj?",
    answer: "Naš cilj je stvoriti zajednicu čitalaca, povezati škole, biblioteke i porodice, te kroz pozitivno takmičenje podići nivo pismenosti i ljubavi prema knjizi na našem govornom području."
  },
  {
    question: "Kako to uraditi?",
    answer: "Jednostavno: odaberi knjigu iz biblioteke, pročitaj je u fizičkom formatu, vrati se na platformu da riješiš kviz, osvoji bodove i prati svoj rang na tabeli najboljih čitalaca!"
  }
];

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center mb-16"
          >
            <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Često postavljana pitanja</h1>
            <p className="text-xl text-muted-foreground">
              Sve što trebate znati o platformi Čitanje na jednom mjestu.
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                variants={fadeIn}
              >
                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-3 flex items-center gap-2">
                      <ChevronRight className="w-5 h-5" />
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-8 rounded-2xl bg-primary/5 border-2 border-primary/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Imate još pitanja?</h2>
            <p className="text-muted-foreground mb-6">
              Naš tim je tu da vam pomogne. Kontaktirajte nas direktno i odgovorićemo u najkraćem roku.
            </p>
            <Button size="lg" asChild>
              <Link href="/kontakt">Pošalji upit</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
