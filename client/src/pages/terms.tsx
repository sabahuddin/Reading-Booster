import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl" data-testid="text-terms-title">
            Uvjeti korištenja
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Posljednje ažuriranje: Februar 2026.
          </p>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Opći uvjeti</h2>
            <p className="text-muted-foreground leading-relaxed">
              Korištenjem platforme Čitanje (u daljnjem tekstu: "Platforma"), prihvaćate ove Uvjete korištenja u cijelosti. Platforma je u vlasništvu Izdavačke kuće Ilum (u daljnjem tekstu: "Izdavač"). Ako se ne slažete s bilo kojim dijelom ovih uvjeta, molimo vas da ne koristite Platformu.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">2. Opis usluge</h2>
            <p className="text-muted-foreground leading-relaxed">
              Platforma Čitanje je interaktivna edukativna platforma namijenjena podsticanju čitanja kod djece, mladih i odraslih. Platforma omogućava pregled digitalne biblioteke, rješavanje kvizova vezanih za pročitane knjige, skupljanje bodova, praćenje napretka i učestvovanje u čitalačkim izazovima.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Registracija i korisnički račun</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>Za korištenje većine funkcionalnosti Platforme potrebna je registracija.</li>
              <li>Korisnik je dužan pružiti tačne i potpune podatke prilikom registracije.</li>
              <li>Korisnik je odgovoran za čuvanje povjerljivosti svoje lozinke i korisničkog imena.</li>
              <li>Za korisnike mlađe od 16 godina, registraciju vrši učitelj ili roditelj/staratelj.</li>
              <li>Izdavač zadržava pravo da odbije ili ukine korisnički račun bez obrazloženja.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">4. Korištenje Platforme</h2>
            <p className="text-muted-foreground leading-relaxed">Korisnici se obavezuju da će:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>Koristiti Platformu u skladu sa zakonom i ovim uvjetima.</li>
              <li>Ne zloupotrebljavati Platformu za bilo kakvu nezakonitu ili štetnu aktivnost.</li>
              <li>Ne pokušavati neovlašteno pristupiti tuđim korisničkim računima ili podacima.</li>
              <li>Ne ometati rad Platforme tehničkim ili drugim sredstvima.</li>
              <li>Poštovati autorska prava na sadržaj objavljen na Platformi.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5. Intelektualno vlasništvo</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sav sadržaj na Platformi, uključujući tekstove, slike, logotipe, kvizove, dizajn i softver, zaštićen je autorskim pravima i pravima intelektualnog vlasništva. Nije dozvoljeno kopiranje, distribucija ili modifikacija sadržaja bez prethodne pisane suglasnosti Izdavača.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">6. Bodovi i nagrade</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>Bodovi skupljeni na Platformi nemaju novčanu vrijednost i ne mogu se zamijeniti za novac.</li>
              <li>Izdavač zadržava pravo promjene sistema bodovanja u bilo kojem trenutku.</li>
              <li>Nagrade u okviru čitalačkih izazova su podložne raspoloživosti i mogu se promijeniti bez prethodne najave.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">7. Pretplate i plaćanja</h2>
            <p className="text-muted-foreground leading-relaxed">
              Platforma nudi besplatni i plaćene nivoe korištenja. Detalji o cijenama i uslugama dostupni su na stranici Cijene. Izdavač zadržava pravo promjene cijena uz prethodnu obavijest korisnicima. Plaćene pretplate se mogu otkazati u skladu sa uslovima navedenim prilikom kupovine.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">8. Ograničenje odgovornosti</h2>
            <p className="text-muted-foreground leading-relaxed">
              Platforma se pruža "kakva jest" bez garancija bilo koje vrste. Izdavač ne garantuje neprekidan ili bezgrešan rad Platforme. Izdavač nije odgovoran za bilo kakvu štetu nastalu korištenjem ili nemogućnošću korištenja Platforme, u mjeri u kojoj to zakon dozvoljava.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">9. Izmjene uvjeta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Izdavač zadržava pravo izmjene ovih Uvjeta korištenja u bilo kojem trenutku. O značajnim promjenama korisnici će biti obaviješteni putem Platforme ili emaila. Nastavak korištenja Platforme nakon objave izmjena smatra se prihvaćanjem novih uvjeta.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">10. Raskid</h2>
            <p className="text-muted-foreground leading-relaxed">
              Korisnik može u svakom trenutku zatražiti brisanje svog korisničkog računa slanjem zahtjeva putem kontakt forme ili emaila. Izdavač zadržava pravo da suspenduje ili obriše korisnički račun u slučaju kršenja ovih uvjeta.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">11. Kontakt</h2>
            <p className="text-muted-foreground leading-relaxed">
              Za sva pitanja vezana za ove Uvjete korištenja, obratite nam se putem kontakt forme na Platformi ili na email adresu navedenu na stranici Kontakt.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
