# Čitanje.ba — Platforma za unapređenje čitanja

## Overview
"Čitanje.ba" je full-stack platforma dizajnirana za podsticanje čitanja i mjerenje čitalačke kompetencije na bosansko-hrvatskom govornom području. Inspirirana antolin.de modelom, omogućava korisnicima da čitaju knjige, rješavaju kvizove, sakupljaju bodove i prate napredak. Platforma cilja škole, biblioteke i porodice, s fokusom na fizičke knjige i integraciju s školskim bibliotekama. Podržava individualno, porodično i institucionalno korišćenje uz elemente gamifikacije: bodovi, značke, rang-liste i dvoboji.

## User Preferences
Ne definirano.

## System Architecture

### Design
- **Brand:** "Čitanje" / "Čitanje.ba"
- **Primary Color:** #FF861C (topla naranča, prilagođena djeci)
- **Accent Color:** HSL(28, 95%, 48%)
- **Landing Page Overlay:** rgba(210,105,10,0.85)
- **CTA Section:** hsl(28,95%,45%)
- **Font:** Nunito / Comic Neue
- **Logo:** Prominentno prikazano u navigaciji.
- **Naslovnice knjiga:** Portretni format 2:3.
- **Starosne grupe:** Svaka grupa (R1, R4, R7, O, A) ima posebnu boju za vizualnu razliku.

### Technical Implementation
- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, wouter (routing), TanStack React Query v5 (state management).
- **Backend:** Node.js, Express, express-session.
- **Database:** PostgreSQL s Drizzle ORM.
- **Autentifikacija:** Session-based s `connect-pg-simple`. Lozinke hashirane s `crypto scrypt`. Format: `hashHex.saltHex` (tačka kao separator).
- **Sigurnost:** Rate limiting (100 req/15min za API, 5 login pokušaja/15min), XSS sanitizacija na svim `/api` rutama, validacija lozinke (min 8 znakova, veliko slovo, broj).
- **API Prefix:** Sve backend rute imaju prefiks `/api`.
- **Struktura projekta:** Jasno razdvojeni client, server i shared direktorij.
- **Korisničke uloge:** Admin, School Admin, Teacher, Parent, Reader, Student — svaka s posebnim pristupom i funkcionalnostima.

### User Roles & Access
| Uloga | Opis | Posebnosti |
|-------|------|------------|
| Admin | Superadmin | Pun pristup svemu |
| School Admin | Direktor škole | Odobrava nastavnike, pregled škole |
| Teacher | Nastavnik | Kreira učenike, prati razred |
| Parent | Roditelj | Kreira do 3 djece, prati napredak |
| Reader (Čitalac) | Opći korisnik 18+ | Samostalna registracija |
| Student | Učenik | Dobija karticu od učitelja |

### Scoring System
- Bodovi po tačnom odgovoru zavise od starosne skupine knjige:
  - R1 (1.-3. razred): **2 boda/pitanju**
  - R4 (4.-6. razred): **3 boda/pitanju**
  - R7 (7.-9. razred): **5 bodova/pitanju**
  - O (Omladina 15-18): **7 bodova/pitanju**
  - A (Odrasli 18+): **10 bodova/pitanju**
- Netačni odgovori **oduzimaju bodove za R4+** — formula: `max(0, tačni - netačni) × bodovi_po_pitanju`
- **R1 djeca (6-9 god): BEZ oduzimanja bodova** — samo `tačni × bodovi_po_pitanju`
- Minimalan score je uvijek 0
- Bodovi se akumuliraju na profilu korisnika

### Quiz Question Limits (po starosnoj skupini)
| Grupa | Prikazuje | Pool (min. u bazi) |
|-------|-----------|---------------------|
| R1 | 10 pitanja | 15 ukupno |
| R4 | 15 pitanja | 25 ukupno |
| R7 | 20 pitanja | 30 ukupno |
| O | 20 pitanja | 30 ukupno |
| A | 20 pitanja | 30 ukupno |
- Pitanja se **randomizuju** pri svakom pokušaju → različit set svaki put

### Quiz Pass Thresholds
- R1: **40%** tačnih za prolaz
- R4, R7, O, A: **50%** tačnih za prolaz
- **Pali kviz → 48h cooldown**, zatim novi pokušaj s novim random setom pitanja
- **Položen kviz → ne može se ponavljati**
- Pre-check eligibility: `/api/quizzes/:id/eligibility` vraća `canTake: true/false` s razlogom i preostalim vremenom

### Book Filtering by Age Group (za učenike/čitaoce)
| Starosna grupa korisnika | Vidi knjige |
|--------------------------|-------------|
| R1 | R1 + R4 |
| R4 | R4 + R7 |
| R7 | R7 + O |
| O | O + A |
| A | O + A |
- Admini, učitelji, roditelji vide SVE knjige

## Feature Specifications

### Biblioteka i knjige
- Javna biblioteka s filterima (žanr, starosna dob, težina čitanja)
- Istaknute knjige, preporuke, detaljne stranice knjiga
- CSV masovni uvoz knjiga (admin)
- Naslovnice: upload putem admin panela

### Kvizovi
- Interaktivni kvizovi s timerom (30s/pitanje), auto-advance, auto-submit
- Prikaz broja completiona i autora kviza
- AI generisanje kvizova (OpenAI) — individualno i bulk
- CSV masovni uvoz pitanja
- Bodovi se određuju dinamički iz `book.ageGroup`, ne iz `question.points`

### Ocjenjivanje knjiga
- Korisnici ocjenjuju knjige (1-5 zvjezdica s BookOpen ikonicama)
- Upsert sistem — jedan glas po korisniku po knjizi
- Prikazano na stranici knjige, iznad socijalnog dijeljenja

### Socijalno dijeljenje
- Dijeljenje knjiga na: Facebook, Twitter/X, WhatsApp, Instagram, TikTok
- LinkedIn i Telegram uklonjeni

### Berza knjiga (`/razmjena`)
- Javna platforma za prodaju, doniranje i razmjenu fizičkih knjiga
- Filtriranje i pretraga
- Korisnici upravljaju vlastitim oglasima

### Duel sistem
- Korisnici izazivaju protivnike sa sličnim bodovima
- Takmičenje zasnovano na ciljevima, praćenje u realnom vremenu
- Prikazuje **korisničko ime** (username), ne puno ime

### Značke (Badges)
- Automatski sistem baziran na ukupnim bodovima korisnika
- Prikazano na profilu i listi rang-tablice
- Nivoi: Početnik → Čitalac → Knjigoljubac → Znalac → Stručnjak → Maestro

### Rang-lista (Leaderboard)
- Javni prikaz top čitalaca
- Odvojeno: "Djeca" i "Odrasli"
- Filtri: sedmica / mjesec / godina

### Učiteljski dashboard
- Pregled razreda s grafikonima:
  - Bar chart — **svi** učenici sortirani po bodovima (puna širina)
  - Pie chart — top 10 žanrova + "Ostali žanrovi", legenda desno
- Upravljanje učenicima: kreiranje, brisanje, **uređivanje razreda i imena**
- Bonus bodovi, neaktivni učenici, sedmični izazov
- Odobravanje roditeljskih zahtjeva za linkovanje

### Roditeljski dashboard
- Pregled napretka djece
- Kreiranje do 3 dječija računa
- **Upravljanje djecom koja je roditelj kreirao** (ne školski učenici):
  - Promjena lozinke djeteta
  - Brisanje profila djeteta (s potvrdom)
  - Korisničko ime se ne može mijenjati

### Profil učenika
- Polja: ime i prezime, razred (className), starosna grupa
- Razred unosi učiteljica ili roditelj
- Lozinka: samo učiteljica ili roditelj mogu mijenjati (učenici dobivaju kartice)

### Partneri
- Admin CRUD za partnere s upload loga
- Prikazano na homepage-u

### Izazovi (Challenges)
- Admin CRUD za čitalačke izazove s nagradama
- Prikazano na homepage-u

### Registracija
- Odvojeni tabovi: opća registracija i institucionalna
- Institucije čekaju odobrenje admina
- `ageGroup` polje za sve korisnike

### Blog
- Admin-managed blog postovi s ključnim riječima
- Javni prikaz, filtriranje, komentari i sistem ocjenjivanja

## Critical Implementation Notes
- **NIKAD ne brisati produkcijske podatke**. Seed loader je samo-additive.
- **Produkcija:** admin/admin123 | URL: citanje.ba | ~1996 knjiga
- **Docker/Coolify Volume:** `/data/citanje/uploads` → `/app/uploads`
- **Hash format:** `hashHex.saltHex` (tačka separator) — NIJE `salt:hash`
- **Subscription system:** TRENUTNO ONEMOGUĆEN — svi korisnici imaju neograničen pristup kvizovima. `canTakeQuiz` uvijek `true`.
- **Quiz hook ordering:** `questionsToUse` useMemo MORA biti definiran PRIJE svih useCallback koji ga koriste (production minifikacija uzrokuje TDZ grešku).
- **Duel:** prikazuje `username`, NE `fullName`

## External Dependencies
- **OpenAI API:** Za AI-generisane kvizove (via Replit AI Integrations ili `OPENAI_API_KEY` fallback).
- **GitHub:** Za version control.
- **Coolify / Hetzner:** Za deployment i PostgreSQL bazu.

## Default Test Accounts (Development)
- Admin: admin / admin123
- Učitelj: ucitelj1 / ucitelj123
- Roditelj: roditelj1 / roditelj123
- Učenik: ucenik1 / ucenik123, ucenik2 / ucenik123, ucenik3 / ucenik123 (36 bodova, ageGroup: R1)
