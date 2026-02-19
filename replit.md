# Čitanje - Platforma za unapređenje čitanja

## Overview
Full-stack platforma za unapređenje čitanja, inspirisana antolin.de. Korisnici čitaju knjige, rješavaju kvizove, skupljaju bodove i prate napredak. Platforma je namijenjena školama, bibliotekama, mektebima i porodicama na bosansko-hrvatskom govornom području. Naglasak je na otkrivanju fizičkih knjiga i integraciji sa školskim bibliotekama. Platforma je opća sa jakim islamskim modulom i mogućnošću porodičnog takmičenja.

## Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Node.js + Express + express-session
- **Database:** PostgreSQL with Drizzle ORM
- **Routing:** wouter (frontend), Express (backend)
- **State Management:** TanStack React Query v5

## Design
- **Brand:** "Čitanje" (bez uzvičnika)
- **Primarna boja:** #FF861C (HSL 28 100% 55%) — topla narandžasta, child-friendly
- **Accent boja:** HSL(28, 95%, 48%) — malo tamnija varijanta
- **Landing page overlay:** rgba(210,105,10,0.85) — tamnija narandžasta za kontrast na hero sekciji
- **CTA sekcija:** hsl(28,95%,45%)
- **Font:** Nunito / Comic Neue
- **Logo:** Uvećan u navbar-u (h-14 w-14), smanjen padding (py-1)
- **Slike knjiga:** Portrait aspect ratio 2:3 (kao prave knjige)

## Starosne skupine (ageGroup) — za knjige i korisnike
- **M** — Mlađi osnovci (6-10 godina, 1.-4. razred)
- **D** — Stariji osnovci (11-15 godina, 5.-9. razred)
- **O** — Omladina / Young Adult (15-18 godina, srednja škola)
- **A** — Odrasli (18+, roditelji i stariji korisnici)

## Žanrovi (genre)
- **lektira** — Svi obavezni naslovi za osnovne i srednje škole
- **avantura_fantasy** — Dinamične knjige sa jasnom radnjom (Avantura i Fantasy)
- **realisticni_roman** — Priče o stvarnom životu, odrastanju i školi
- **beletristika** — Romani i pripovijetke za odrasle (A) i omladinu (O), omogućava porodično takmičenje
- **bajke_basne** — Klasici namijenjeni prvenstveno kategoriji M
- **zanimljiva_nauka** — Popularno-naučni sadržaji, enciklopedije i zanimljivosti
- **poezija** — Zbirke pjesama za djecu i odrasle
- **islam** — Vjerska literatura, priče o poslanicima, ahlak i historija (za sve uzraste i mektebe)

## User Roles
- **Admin** — Upravljanje cijelom platformom (knjige, kvizovi, korisnici, blog, poruke, partneri, izazovi, institucionalna odobrenja)
- **Učitelj (Teacher) / Muallim** — Pregled učenika, kreiranje učeničkih računa, CSV export, praćenje napretka, bonus bodovi, sedmični izazovi
- **Roditelj (Parent)** — Pregled napretka djece i rezultata kvizova, porodično takmičenje kroz kategoriju A
- **Učenik (Student)** — Pregled biblioteke, rješavanje kvizova, skupljanje bodova

## Project Structure
```
client/src/
  pages/           - Sve stranice
  components/      - Dijeljene komponente (navbar, footer, dashboard-layout)
  hooks/           - Custom hookovi (use-auth, use-toast, use-mobile)
  lib/             - Utility funkcije (queryClient, utils)
server/
  index.ts         - Express app, session config, auth middleware, rate limiting, XSS zaštita
  routes.ts        - Svi API routovi
  storage.ts       - Database storage layer (IStorage interface)
  db.ts            - Drizzle database konekcija
  seed.ts          - Database seeding skripta
shared/
  schema.ts        - Drizzle sheme i Zod validacija
```

## Key Routes
### Javne: /, /biblioteka, /knjiga/:id, /blog, /cijene, /kontakt, /prijava
### Učenik: /ucenik, /ucenik/biblioteka, /ucenik/knjiga/:id, /ucenik/kviz/:id, /ucenik/rezultati
### Učitelj: /ucitelj, /ucitelj/ucenici, /ucitelj/biblioteka
### Roditelj: /roditelj, /roditelj/djeca
### Admin: /admin, /admin/knjige, /admin/kvizovi, /admin/korisnici, /admin/blog, /admin/poruke, /admin/partneri, /admin/izazovi, /admin/odobrenja

## API Prefix: /api
Svi backend routovi su prefiksirani sa /api. Auth koristi session cookies.

## Auth & Sigurnost
- Session-based auth sa connect-pg-simple
- Lozinke hashirane sa crypto scrypt
- Rate limiting: 100 zahtjeva/15min za API, 5 login pokušaja/15min
- XSS sanitizacija na svim /api rutama
- Validacija lozinke: min 8 karaktera, veliko slovo, broj (za nove registracije)
- Trust proxy konfigurisan za deployment

## Default Test Accounts
- Admin: admin / admin123
- Učitelj: ucitelj1 / ucitelj123
- Roditelj: roditelj1 / roditelj123
- Učenik: ucenik1 / ucenik123, ucenik2 / ucenik123

## Scoring System
- +1 bod po tačnom odgovoru
- -1 bod po netačnom odgovoru
- Minimum score po kvizu: 0
- Bodovi se akumuliraju na profilu korisnika

## Features

### Biblioteka i knjige
- Javna biblioteka sa filterima (žanr, dob, težina čitanja, pretraga)
- Prijedlog sedmice i najčitanija knjiga (istaknute kartice)
- Preporuke po žanru ("Čitatelji preporučuju")
- Detaljna stranica knjige sa "Gdje pronaći ovu knjigu?" sekcijom (biblioteka, kupovina, PDF preview)
- Slike knjiga u portrait formatu 2:3
- Informacije: izdavač, ISBN, godina, jezik, format, broj stranica
- CSV bulk import knjiga sa mapiranjem na nove ageGroup (M/D/O/A) i žanrove

### Kvizovi
- Interaktivni kvizovi vezani za knjige
- Bodovanje sa akumulacijom na profilu

### Leaderboard
- Javni top čitači na naslovnoj stranici
- Odvojeni tabovi "Djeca" (M+D+O) i "Odrasli" (A) po ageGroup korisnika
- Filtriranje po periodu: sedmica/mjesec/godina
- API: /api/leaderboard?period=week|month|year, /api/leaderboard/adults?period=week|month|year
- Porodično takmičenje: roditelji (A) se mogu takmičiti kroz Beletristiku i Islam

### Učiteljski dashboard
- Pregled klase: ukupan broj učenika, pročitanih knjiga, prosjek bodova
- Top 5 čitača sa mogućnošću dodjele bonus bodova
- Upozorenja za neaktivne učenike (7+ dana) sa kontaktom roditelja
- Kreiranje sedmičnih izazova (izbor knjige, cilj, opis)
- Kreiranje učeničkih računa (auto-generirani username bez dijakritika i lozinka)
- CSV export podataka učenika (UTF-8 BOM za Excel kompatibilnost)

### Partneri (Naši partneri)
- Admin CRUD za partnere sa upload logotipa
- Prikaz na naslovnoj stranici iznad footera

### Izazovi (Challenges)
- Admin CRUD za čitačke izazove sa nagradama
- Prikaz na naslovnoj stranici

### Registracija
- Tri taba: Prijava, Registracija, Institucija
- Samoregistracija: učenik/roditelj sa izborom starosne skupine (M/D/O/A)
- Institucionalna registracija: škola/mekteb sa izborom uloge, zahtijeva admin odobrenje
- Polje ageGroup (M/D/O/A) za odvajanje na leaderboardu i filtriranje biblioteke

### Blog
- Admin može kreirati i uređivati blog postove sa ključnim riječima (keywords)
- Javni prikaz na /blog sa pretragom po naslovu/sažetku/autoru/ključnim riječima
- Filtriranje po ključnim riječima (badge-ovi)
- Najnoviji tekstovi se prikazuju prvi (sortiranje po publishedAt DESC)
- Komentari na blog postove (prijavljeni korisnici mogu komentarisati, vlasnik/admin može brisati)
- Ocjenjivanje blog postova (1-5 knjižica/BookOpen ikone), upsert sistem
- API: /api/blog/:id/comments (GET/POST/DELETE), /api/blog/:id/rating (GET/POST)

## Database Tables
- users, books, quizzes, questions, quiz_results, blog_posts, blog_comments, blog_ratings, contact_messages, partners, challenges

### Kontakt
- Kontakt forma za poruke
- Admin pregled poruka

### Pretplate (planirano)
- Free / Standard / Full tier
- Stranica sa cijenama (/cijene)

## Database Tables
- users, books, quizzes, questions, quiz_results, blog_posts, contact_messages, partners, challenges

## User Fields
- Standardni: username, password, role, firstName, lastName, email, points, booksRead
- Prošireni: ageGroup (M/D/O/A), institutionType, institutionRole, approved, maxStudentAccounts, createdByTeacherId

## Primjeri mapiranja knjiga
| Naslov | ageGroup | genre |
|--------|----------|-------|
| Ježeva kućica | M | bajke_basne |
| Priče o poslanicima | M | islam |
| Družba Pere Kvržice | D | lektira |
| Hajduk u Beogradu | D | avantura_fantasy |
| Tvrđava | A | beletristika |
| Sira: Životopis Poslanika | A | islam |

## Language
UI je na bosanskom/hrvatskom jeziku. Sav korisnički tekst je na hrvatskom/bosanskom.
