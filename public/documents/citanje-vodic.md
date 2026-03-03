# Čitanje.ba — Vodič za korisnike

Čitanje.ba je platforma za unapređenje čitanja namijenjena školama, bibliotekama i porodicama na bosansko-hrvatskom govornom području. Naglasak je na otkrivanju fizičkih knjiga, učenju kroz kvizove i praćenju napretka čitanja.

---

## Sadržaj

1. [Javne stranice (bez prijave)](#javne-stranice)
2. [Registracija i prijava](#registracija-i-prijava)
3. [Učenik](#ucenik)
4. [Čitalac](#citalac)
5. [Učitelj](#ucitelj)
6. [Roditelj](#roditelj)
7. [Školski administrator](#skolski-administrator)
8. [Biblioteka i knjige](#biblioteka-i-knjige)
9. [Kvizovi](#kvizovi)
10. [Sistem bodovanja i značke](#sistem-bodovanja-i-znacke)
11. [Leaderboard (rang-lista)](#leaderboard)
12. [Blog](#blog)
13. [Razmjena knjiga](#razmjena-knjiga)
14. [Pretplate i cijene](#pretplate-i-cijene)
15. [Pristupačnost i dijeljenje](#pristupacnost-i-dijeljenje)
16. [Sigurnost](#sigurnost)

---

## Javne stranice

Stranice dostupne svima, bez prijave:

### Naslovnica (/)
- Pregled platforme sa sekcijama: Mnogo knjiga, Zabavni kvizovi, Prati napredak, Zajedno učimo
- Javni leaderboard — top čitači (djeca i odrasli) sa filterom po periodu (sedmica, mjesec, godina)
- Aktivni izazovi sa nagradama i rokovima
- Partneri platforme (logotipi i linkovi)
- Sekcija za doprinos (sponzorstvo, dijeljenje)

### Biblioteka (/biblioteka)
- Pretraživanje knjiga po naslovu i autoru
- Filtriranje po žanru, starosnoj skupini, težini čitanja i jeziku
- Tri taba: Biblioteka (puni katalog), Čitaoci preporučuju (po popularnosti), Prijedlog sedmice
- Svaka knjiga prikazuje naslovnicu, naslov, autora, starosnu skupinu i oznaku PDF ako je dostupan

### Detalji knjige (/knjiga/:id)
- Naslovnica, naslov, autor, opis, broj stranica, jezik
- Starosna skupina i žanrovi kao oznake
- Ocjena knjige (prosječna ocjena i broj ocjena)
- Dijeljenje na društvenim mrežama
- PDF pregled (ako postoji)
- Informacija o kvizu — neprijavljeni korisnici vide poruku "Prijavi se za kviz"

### Blog (/blog)
- Pretraživanje po naslovu, sažetku, autoru i ključnim riječima
- Filtriranje po tagovima
- Čitanje kompletnih članaka

### Razmjena knjiga (/razmjena)
- Pregledanje oglasa za prodaju, poklon i razmjenu knjiga
- Filtriranje po tipu oglasa i gradu
- Kontakt podaci (telefon) vidljivi svima

### Cijene (/cijene)
- Pregled dostupnih paketa: Besplatni, Pro, Porodični, Škole

### Kontakt (/kontakt)
- Kontakt forma za slanje poruka timu

---

## Registracija i prijava

Registracija se vrši na stranici /prijava sa tri taba:

### Prijava
- Korisničko ime i lozinka
- Zaštita od brute-force napada (limit pokušaja)

### Registracija (fizička lica)
- Izbor uloge: Čitalac ili Roditelj
- Obavezna polja: ime i prezime, korisničko ime, email, lozinka
- Izbor starosne skupine: R1 (od 1. razreda), R4 (od 4. razreda), R7 (od 7. razreda), O (omladina), A (odrasli)
- Matematička captcha zaštita od botova
- Lozinka: minimalno 8 karaktera, veliko slovo, broj

### Institucija (škole)
- Registracija kao škola sa izborom uloge (učitelj, bibliotekar, sekretar)
- Zahtijeva odobrenje administratora prije pristupa

---

## Učenik

**Dashboard:** /ucenik

Učenik je školski korisnik kreiran od strane učitelja ili školskog administratora.

### Mogućnosti
- **Pregled statistika:** Ukupni bodovi, broj riješenih kvizova, prosječna tačnost, najbolji rezultat
- **Biblioteka** (/ucenik/biblioteka): Pristup svim knjigama sa filterima po žanru i starosnoj skupini
- **Detalji knjige** (/ucenik/knjiga/:id): Pregled podataka o knjizi, pokretanje kviza, PDF pregled
- **Kvizovi** (/ucenik/kviz/:id): Rješavanje kvizova za pročitane knjige — bodovi se sakupljaju na profilu
- **Rezultati** (/ucenik/rezultati): Pregled svih riješenih kvizova sa detaljima (tačni/netačni odgovori, bodovi)
- **Značke:** Automatski sistem nagrada na osnovu bodova — prikazuje se na dashboardu sa progress barom do sljedeće značke
- **Leaderboard:** Pozicija na globalnoj, školskoj i razrednoj rang-listi
- **Izazovi:** Učešće u aktivnim izazovima (sedmični, globalni)

### Ograničenja
- Besplatni korisnici imaju limit od 3 kviza; nakon toga potrebna pretplata
- Pauza od 30 minuta između dva pokušaja kviza
- Potrebno je 50% tačnih odgovora da bi kviz bio položen i bodovi dodijeljeni

---

## Čitalac

**Dashboard:** /citanje

Čitalac je nezavisni korisnik koji se sam registruje — nije vezan za školu.

### Mogućnosti
- Sve što ima učenik: biblioteka, kvizovi, značke, rezultati
- **Globalni rang** na leaderboardu (nema razredni/školski rang)
- **Pretplata:** Free / Pro sistem — Free korisnici imaju limit kvizova, Pro imaju neograničen pristup
- **Pro stranica** (/citanje/pro): Informacije o nadogradnji paketa
- Ako je povezan sa roditeljem, može vidjeti porodični pregled

---

## Učitelj

**Dashboard:** /ucitelj

Učitelj je kreiran od školskog administratora ili administratora platforme.

### Pregled klase
- Ukupan broj učenika, pročitanih knjiga, prosjek bodova
- Top 5 čitača u razredu
- Upozorenja za neaktivne učenike (7+ dana bez aktivnosti) — sa kontaktom roditelja

### Upravljanje učenicima (/ucitelj/ucenici)
- Lista svih učenika sa bodovima, brojem kvizova i zadnjom aktivnošću
- **Kreiranje učeničkih računa:** Automatski generirano korisničko ime (bez dijakritika) i sigurna lozinka
- **CSV export:** Preuzimanje podataka o učenicima u Excel formatu (UTF-8 BOM za pravilne dijakritike)
- Praćenje individualnog napretka svakog učenika

### Bonus bodovi
- Dodjela bonus bodova učenicima za vannastavne aktivnosti čitanja
- Razlog za bonus bodove se bilježi

### Sedmični izazovi
- Kreiranje izazova za razred: izbor knjige, cilj, opis, bonus bodovi
- Praćenje ispunjenosti izazova

### Zahtjevi roditelja
- Odobravanje ili odbijanje zahtjeva roditelja za povezivanje sa djetetovim računom

### Biblioteka (/ucitelj/biblioteka)
- Pregled knjiga i kvizova
- Analitika po žanrovima i bodovima

---

## Roditelj

**Dashboard:** /roditelj

Roditelj se registruje sam i može pratiti napredak svoje djece.

### Kreiranje računa za djecu
- Kreiranje do 3 učenička profila sa automatski generiranim korisničkim imenom i lozinkom
- Kreiranje 1 čitalac Pro profila za članove porodice

### Povezivanje sa školskim računom
- Slanje zahtjeva za povezivanje sa postojećim školskim računom djeteta (unosi korisničko ime učenika)
- Učitelj odobrava zahtjev — nakon toga roditelj vidi napredak djeteta

### Pregled djece (/roditelj/djeca)
- Pregled bodova, broja kvizova i rezultata za svako dijete
- Detaljna statistika: tačnost, nedavna aktivnost
- Porodično takmičenje kroz kategoriju Odrasli (A) na leaderboardu

---

## Školski administrator

**Dashboard:** /skola

Školski administrator se registruje preko institucionalnog taba i zahtijeva odobrenje.

### Upravljanje školom
- Pregled statistika škole: ukupno učitelja, učenika, kvizova, prosječni bodovi
- Top 10 učenika u školi
- Statistike po razredima

### Upravljanje učiteljima (/skola/ucitelji)
- Kreiranje učiteljskih računa (limit: maxTeacherAccounts)
- Brisanje učiteljskih računa
- Dodjela razreda učiteljima
- Pregled broja učenika po učitelju

---

## Biblioteka i knjige

### Katalog
- Preko 1.900 knjiga u bazi sa naslovnicama
- Knjige pokrivaju sve starosne skupine od 1. razreda do odraslih
- Više od 20 žanrova: Lektira, Avantura i Fantasy, Roman, Beletristika, Bajke i Basne, Zanimljiva nauka, Poezija, Islam i drugi

### Starosne skupine
| Oznaka | Opis | Dob |
|--------|------|-----|
| R1 | Od 1. razreda | 6-9 godina (1.-3. razred) |
| R4 | Od 4. razreda | 10-12 godina (4.-6. razred) |
| R7 | Od 7. razreda | 13-15 godina (7.-9. razred) |
| O | Omladina / Young Adult | 15-18 godina (srednja škola) |
| A | Odrasli | 18+ (roditelji i stariji) |

### Naslovnice knjiga
- Svaka knjiga ima naslovnicu u portrait formatu (2:3, kao prava knjiga)
- Knjige bez naslovnice dobijaju automatski generiranu grafiku u boji odgovarajuće starosne skupine:
  - R1: žuto-narandžasta
  - R4: zelena
  - R7: plava
  - O: ljubičasta
  - A: crvena

### Informacije o knjizi
- Naslov, autor, opis, starosna skupina, žanrovi
- Izdavač, ISBN, godina izdanja, grad izdanja
- Jezik, format, broj stranica
- Dostupnost u biblioteci, COBISS ID
- PDF pregled (za knjige koje imaju digitalno izdanje)
- "Knjigu potražite u školskoj ili gradskoj biblioteci" — naglasak na fizičkim knjigama

### Ocjena knjige
- Ocjena od 1 do 5 pomoću ikona knjige (BookOpen)
- Svaki prijavljeni korisnik može ocijeniti knjigu jednom (upsert sistem — ažurira se pri novom glasanju)
- Prikazuje se prosječna ocjena i ukupan broj ocjena

---

## Kvizovi

### Kako funkcionišu
1. Učenik/čitalac pronađe knjigu u biblioteci
2. Pročita fizičku ili PDF verziju knjige
3. Na stranici knjige klikne "Pokreni kviz"
4. Rješava pitanja sa višestrukim izborom (A, B, C, D)
5. Na kraju dobija rezultat i bodove

### Timer
- 30 sekundi po pitanju
- Vizualni odbrojavanje sa promjenom boje (zeleno → crveno ispod 5 sekundi)
- Ako istekne vrijeme, automatski prelazi na sljedeće pitanje
- Na posljednjem pitanju, automatski predaje kviz

### Random pitanja (zaštita od prepisivanja)
- Ako kviz ima više od 20 pitanja, svaki učenik dobija nasumičnih 20
- Svaki put drugačiji redoslijed i set pitanja
- Sprječava prepisivanje između učenika

### Prolaz i bodovi
- Potrebno je minimalno **50% tačnih odgovora** za prolaz
- Ako učenik ne položi, bodovi se ne dodaju i knjiga se ne računa kao pročitana
- Pauza od **30 minuta** između dva pokušaja kviza

### Autor kviza
- Svaki kviz može imati zabilježenog autora (ime učitelja ili "Citanje.ba" za AI generirane)
- Prikazuje se na stranici kviza

### Broj završavanja
- Na stranici kviza prikazuje se koliko puta je kviz do sada urađen

### AI generacija kviza
- Administrator može generirati kviz pomoću AI-a (OpenAI GPT-4o)
- AI generira 20 pitanja na osnovu naslova, autora, opisa i starosne skupine knjige
- Autor automatski postavljen na "Citanje.ba"

### CSV import kvizova
- Format: bookTitle;questionText;optionA;optionB;optionC;optionD;correctAnswer
- Separator: tačka-zarez (;)
- Ako kviz za tu knjigu već postoji, pitanja se dodaju na postojeći

### Ograničenja pretplate
- Besplatni korisnici: 3 kviza ukupno
- Standard pretplata: neograničen broj kvizova
- Full pretplata: sve iz Standard + takmičenja i izvlačenja

---

## Sistem bodovanja i značke

### Bodovi po pitanju (zavise od starosne skupine knjige)

| Starosna skupina | Bodovi po tačnom odgovoru |
|------------------|--------------------------|
| R1 (Od 1. razreda) | 1 bod |
| R4 (Od 4. razreda) | 3 boda |
| R7 (Od 7. razreda) | 5 bodova |
| O (Omladina) | 7 bodova |
| A (Odrasli) | 10 bodova |

- Netačni odgovori ne oduzimaju bodove
- Bodovi se dodjeljuju samo ako je kviz položen (50%+ tačnosti)
- Bonus bodovi: učitelj može dodjeliti bonus bodove za vannastavne aktivnosti

### Značke

Automatski sistem nagrada na osnovu ukupnih bodova:

| Značka | Ikona | Potrebno bodova |
|--------|-------|-----------------|
| Početnik | Klica (Sprout) | 0 |
| Čitalac | Knjiga (BookOpen) | 100 |
| Knjigoljubac | Biblioteka (Library) | 500 |
| Znalac | Diploma (GraduationCap) | 1.000 |
| Stručnjak | Zvijezda (Star) | 2.000 |
| Maestro | Kruna (Crown) | 5.000 |

- Značka se prikazuje na dashboardu sa progress barom do sljedeće značke
- Emoji značke uz ime na leaderboardu
- Kompaktni prikaz u sidebar-u dashboarda

---

## Leaderboard

### Rang-lista (naslovnica i dashboardi)
- Dva odvojena taba: **Djeca** (R1 + R4 + R7 + O) i **Odrasli** (A)
- Filtriranje po periodu: sedmica, mjesec, godina
- Prikazuje: poziciju, korisničko ime, ime, značku i bodove
- Roditelji se mogu takmičiti u kategoriji Odrasli

### Nivoi ranga
- Globalni rang (svi korisnici)
- Školski rang (po školi)
- Razredni rang (po razredu)

---

## Blog

### Za sve korisnike
- Pretraživanje po naslovu, sažetku, autoru i ključnim riječima
- Filtriranje po ključnim riječima (tag oznake)
- Najnoviji tekstovi prikazani prvi
- Svaki post ima naslovnicu, sažetak i potpuni sadržaj

### Za prijavljene korisnike
- Komentarisanje blog postova
- Ocjenjivanje postova (1-5 sa BookOpen ikonama)
- Brisanje vlastitih komentara

---

## Razmjena knjiga

Javna stranica /razmjena za zajednicu čitatelja.

### Tipovi oglasa
- **Prodajem** — sa cijenom
- **Poklanjam** — besplatno
- **Razmjenjujem** — knjiga za knjigu

### Objava oglasa (prijavljeni korisnici)
- Naslov knjige, autor, grad, tip oglasa, cijena (opcionalno), kontakt telefon, opis
- Vlasnik može obrisati svoj oglas

### Pretraga i filtriranje
- Filtriranje po tipu (prodajem/poklanjam/razmjenjujem)
- Filtriranje po gradu

---

## Pretplate i cijene

### Besplatni paket (Čitalac)
- 3 besplatna kviza
- Pristup biblioteci i pretraživanju
- Osnovna statistika

### Standard (10 KM/godišnje)
- Neograničen broj kvizova
- Pristup svim knjigama
- Detaljne statistike

### Full (20 KM/godišnje)
- Sve iz Standard paketa
- Učešće u takmičenjima
- Učešće u izvlačenjima nagrada

### Porodični paket
- Pristup za cijelu porodicu
- Praćenje napretka djece
- Porodično takmičenje

### Školski paket
- Upravljanje razredom
- Kreiranje učeničkih računa
- CSV export i analitika

---

## Pristupačnost i dijeljenje

### Veličina teksta
- Dugmad za povećanje/smanjenje fonta u navigaciji
- Tri nivoa veličine teksta za prilagođavanje čitljivosti

### Dijeljenje na društvenim mrežama
Svaka knjiga i blog post se mogu podijeliti na:
- Facebook
- WhatsApp
- Viber
- Instagram
- TikTok
- X (Twitter)
- Kopiraj link

---

## Sigurnost

- Session-based autentifikacija sa PostgreSQL skladištenjem sesija
- Lozinke hashirane kriptografskim algoritmom (scrypt)
- Rate limiting: 500 zahtjeva / 15 minuta za API, 20 pokušaja prijave / 15 minuta
- XSS sanitizacija na svim API rutama
- Validacija lozinke: minimalno 8 karaktera, veliko slovo, broj
- Matematička captcha na registraciji
- 30-minutni cooldown između kvizova (zaštita od spama)
- Random pitanja iz većeg seta (zaštita od prepisivanja)

---

*Čitanje.ba — Platforma za unapređenje čitanja*
*citanje.ba*
