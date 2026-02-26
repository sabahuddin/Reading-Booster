import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl" data-testid="text-privacy-title">
            Politika privatnosti
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Posljednje ažuriranje: Februar 2026.
          </p>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Uvod</h2>
            <p className="text-muted-foreground leading-relaxed">
              Izdavačka kuća Ilum (u daljnjem tekstu: "Izdavač") posvećena je zaštiti privatnosti korisnika platforme Čitanje (u daljnjem tekstu: "Platforma"). Ova Politika privatnosti objašnjava koje podatke prikupljamo, kako ih koristimo i koje mjere poduzimamo za njihovu zaštitu.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">2. Koje podatke prikupljamo</h2>
            <p className="text-muted-foreground leading-relaxed">Prikupljamo sljedeće kategorije podataka:</p>
            <h3 className="text-lg font-semibold mt-4">2.1 Podaci o registraciji</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>Korisničko ime</li>
              <li>Ime i prezime</li>
              <li>Email adresa</li>
              <li>Lozinka (pohranjena u šifriranom obliku)</li>
              <li>Korisnička uloga (učenik, učitelj, roditelj, čitalac)</li>
              <li>Starosna skupina</li>
            </ul>
            <h3 className="text-lg font-semibold mt-4">2.2 Podaci o korištenju</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>Rezultati kvizova i bodovi</li>
              <li>Pročitane knjige</li>
              <li>Aktivnost na Platformi (datum i vrijeme prijave)</li>
              <li>Komentari i ocjene na blog postovima</li>
            </ul>
            <h3 className="text-lg font-semibold mt-4">2.3 Tehnički podaci</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>IP adresa</li>
              <li>Tip preglednika i uređaja</li>
              <li>Kolačići sesije</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Kako koristimo podatke</h2>
            <p className="text-muted-foreground leading-relaxed">Vaše podatke koristimo isključivo za:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>Pružanje i poboljšanje usluga Platforme</li>
              <li>Upravljanje korisničkim računom i autentifikaciju</li>
              <li>Praćenje napretka u čitanju i bodovanje</li>
              <li>Prikaz rang-lista i statistika</li>
              <li>Komunikaciju s korisnicima (odgovori na upite, obavijesti)</li>
              <li>Omogućavanje učiteljima praćenje napretka učenika</li>
              <li>Omogućavanje roditeljima uvid u aktivnosti djeteta</li>
              <li>Sigurnost i zaštitu od zloupotrebe</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">4. Zaštita podataka djece</h2>
            <p className="text-muted-foreground leading-relaxed">
              Posebno vodimo računa o zaštiti podataka maloljetnih korisnika:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>Račune za djecu kreiraju učitelji ili roditelji/staratelji.</li>
              <li>Ne prikupljamo više podataka nego što je neophodno za funkcioniranje Platforme.</li>
              <li>Podaci djece nisu javno vidljivi izvan Platforme.</li>
              <li>Na rang-listama se prikazuju samo korisničko ime i bodovi.</li>
              <li>Povezivanje roditelja s djetetom zahtijeva odobrenje učitelja.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5. Dijeljenje podataka</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vaše podatke ne prodajemo, ne iznajmljujemo i ne dijelimo s trećim stranama, osim u sljedećim slučajevima:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>Kada je to zakonski obavezno (sudski nalog, zakonska obaveza).</li>
              <li>Učiteljima — ograničen pristup podacima o napretku učenika u njihovom razredu.</li>
              <li>Roditeljima — pristup podacima o napretku vlastite djece (nakon odobrenja).</li>
              <li>Školskim administratorima — agregirane statistike škole.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">6. Sigurnost podataka</h2>
            <p className="text-muted-foreground leading-relaxed">
              Primjenjujemo tehničke i organizacijske mjere za zaštitu vaših podataka:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>Lozinke se pohranjuju koristeći scrypt kriptografski algoritam.</li>
              <li>Zaštita od brute-force napada (rate limiting).</li>
              <li>Sanitizacija korisničkih unosa (XSS zaštita).</li>
              <li>Sigurne sesije sa enkriptovanim kolačićima.</li>
              <li>Baza podataka zaštićena na serverskoj infrastrukturi.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">7. Vaša prava</h2>
            <p className="text-muted-foreground leading-relaxed">Imate pravo na:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li><strong>Pristup</strong> — Možete zatražiti uvid u podatke koje imamo o vama.</li>
              <li><strong>Ispravku</strong> — Možete zatražiti ispravku netačnih podataka.</li>
              <li><strong>Brisanje</strong> — Možete zatražiti brisanje svog korisničkog računa i podataka.</li>
              <li><strong>Prigovor</strong> — Možete uložiti prigovor na obradu vaših podataka.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Za ostvarivanje ovih prava, obratite nam se putem kontakt forme ili emaila navedenog na stranici Kontakt.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">8. Čuvanje podataka</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vaše podatke čuvamo dok je vaš korisnički račun aktivan ili dok su potrebni za pružanje usluga. Nakon brisanja računa, podaci se trajno uklanjaju u roku od 30 dana, osim ako zakon nalaže duže čuvanje.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">9. Izmjene politike privatnosti</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zadržavamo pravo izmjene ove Politike privatnosti. O značajnim promjenama korisnici će biti obaviješteni putem Platforme. Preporučujemo redovno pregledanje ove stranice.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">10. Kontakt</h2>
            <p className="text-muted-foreground leading-relaxed">
              Za sva pitanja vezana za privatnost i zaštitu podataka, obratite nam se putem kontakt forme na Platformi ili na email adresu navedenu na stranici Kontakt.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
