import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function CookiesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl" data-testid="text-cookies-title">
            Politika kolačića
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Posljednje ažuriranje: Februar 2026.
          </p>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Što su kolačići?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kolačići (cookies) su male tekstualne datoteke koje se pohranjuju na vašem uređaju kada posjetite web stranicu. Koriste se za pamćenje vaših postavki, održavanje prijave i poboljšanje korisničkog iskustva.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">2. Koje kolačiće koristimo</h2>

            <div className="rounded-lg border p-6 space-y-4">
              <h3 className="text-lg font-semibold">2.1 Neophodni kolačići (obavezni)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ovi kolačići su neophodni za funkcioniranje Platforme i ne mogu se isključiti.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 pr-4 text-left font-semibold">Kolačić</th>
                      <th className="py-2 pr-4 text-left font-semibold">Svrha</th>
                      <th className="py-2 text-left font-semibold">Trajanje</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono text-xs">connect.sid</td>
                      <td className="py-2 pr-4">Održavanje korisničke sesije (prijava)</td>
                      <td className="py-2">Do odjave ili 24 sata</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h3 className="text-lg font-semibold">2.2 Funkcionalni kolačići</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ovi kolačići pamte vaše postavke i preferencije za bolje korisničko iskustvo.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 pr-4 text-left font-semibold">Kolačić</th>
                      <th className="py-2 pr-4 text-left font-semibold">Svrha</th>
                      <th className="py-2 text-left font-semibold">Trajanje</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono text-xs">cookie-consent</td>
                      <td className="py-2 pr-4">Pamti vaš izbor o kolačićima</td>
                      <td className="py-2">365 dana</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-mono text-xs">theme</td>
                      <td className="py-2 pr-4">Pamti izbor tamne/svijetle teme</td>
                      <td className="py-2">365 dana</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Kolačići trećih strana</h2>
            <p className="text-muted-foreground leading-relaxed">
              Platforma Čitanje trenutno ne koristi kolačiće trećih strana za praćenje ili oglašavanje. Ne koristimo Google Analytics, Facebook Pixel niti slične alate za praćenje. Ukoliko u budućnosti uvedemo takve alate, ova politika će biti ažurirana i korisnici će biti obaviješteni.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">4. Upravljanje kolačićima</h2>
            <p className="text-muted-foreground leading-relaxed">
              Možete upravljati kolačićima kroz postavke vašeg preglednika:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li><strong>Chrome:</strong> Postavke &gt; Privatnost i sigurnost &gt; Kolačići</li>
              <li><strong>Firefox:</strong> Postavke &gt; Privatnost i sigurnost &gt; Kolačići</li>
              <li><strong>Safari:</strong> Postavke &gt; Privatnost &gt; Kolačići</li>
              <li><strong>Edge:</strong> Postavke &gt; Kolačići i dozvole stranica</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Napomena: Brisanje ili blokiranje neophodnih kolačića može uzrokovati nemogućnost korištenja nekih funkcionalnosti Platforme, uključujući prijavu na korisnički račun.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5. Pristanak</h2>
            <p className="text-muted-foreground leading-relaxed">
              Prilikom prvog posjeta Platformi, prikazat će vam se obavijest o kolačićima. Klikom na "Prihvatam" pristajete na korištenje svih kolačića opisanih u ovoj politici. Možete promijeniti svoj izbor u bilo kojem trenutku brisanjem kolačića u pregledniku.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">6. Izmjene</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zadržavamo pravo izmjene ove Politike kolačića. Promjene stupaju na snagu objavljivanjem na ovoj stranici. Preporučujemo redovno pregledanje ove stranice.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">7. Kontakt</h2>
            <p className="text-muted-foreground leading-relaxed">
              Za sva pitanja vezana za kolačiće i privatnost, obratite nam se putem kontakt forme na Platformi ili na email adresu navedenu na stranici Kontakt.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
