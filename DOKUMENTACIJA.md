# Čitanje - Kompletna projektna dokumentacija

## 1. Pregled projekta

**Čitanje** je web platforma za unapređenje čitanja namijenjena tržištima Bosne i Hercegovine i Hrvatske. Inspirirana platformom antolin.de, omogućava korisnicima da čitaju knjige, rješavaju kvizove, skupljaju bodove i prate svoj napredak.

Platforma podržava četiri korisničke uloge (učenici, učitelji, roditelji i administratori) i potpuno je lokalizirana na bosanski/hrvatski jezik.

---

## 2. Tehnički stack

| Komponenta | Tehnologija |
|---|---|
| Frontend | React + TypeScript |
| UI biblioteka | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Baza podataka | PostgreSQL + Drizzle ORM |
| Autentifikacija | express-session + connect-pg-simple |
| Frontend routing | wouter |
| State management | TanStack React Query v5 |
| Ikone | Lucide React |

---

## 3. Korisničke uloge i mogućnosti

### 3.1 Administrator (Admin)
- Potpuno upravljanje platformom
- CRUD operacije za knjige, kvizove, korisnike, blog postove
- Upravljanje kontakt porukama
- Upravljanje partnerima (dodavanje logotipa, adrese, web stranice)
- Upravljanje izazovima čitanja sa nagradama
- Odobravanje institucionalnih registracija (škola/mekteb)
- Pregled statistike platforme (ukupni korisnici, knjige, kvizovi, rezultati)
- CSV bulk import knjiga i kvizova
- Upload naslovnica knjiga, PDF fajlova, logotipova partnera

### 3.2 Učitelj (Teacher)
- Pregled i praćenje učenika
- Kreiranje učeničkih računa sa automatski generiranim korisničkim imenima i lozinkama
- Pregled biblioteke knjiga
- Eksport podataka o učenicima u CSV format (UTF-8 BOM za Excel kompatibilnost)

### 3.3 Roditelj (Parent)
- Pregled napretka djece
- Uvid u rezultate kvizova djece

### 3.4 Učenik (Student)
- Pretraživanje biblioteke knjiga
- Rješavanje kvizova
- Skupljanje bodova
- Pregled vlastitih rezultata

---

## 4. Struktura projekta

```
Čitanje/
├── client/src/
│   ├── pages/                    # Sve stranice aplikacije (28 stranica)
│   │   ├── landing.tsx           # Početna stranica (hero, izazovi, partneri, leaderboard)
│   │   ├── auth-page.tsx         # Prijava / Registracija / Institucionalna registracija
│   │   ├── public-library.tsx    # Javna biblioteka knjiga
│   │   ├── public-book-detail.tsx # Javni detalji knjige
│   │   ├── blog.tsx              # Blog stranica
│   │   ├── pricing.tsx           # Stranica s cijenama pretplata
│   │   ├── contact.tsx           # Kontakt forma
│   │   ├── student-dashboard.tsx # Dashboard za učenike
│   │   ├── library.tsx           # Biblioteka za učenike
│   │   ├── book-detail.tsx       # Detalji knjige (prijavljeni korisnik)
│   │   ├── quiz-page.tsx         # Stranica za rješavanje kviza
│   │   ├── student-results.tsx   # Rezultati učenika
│   │   ├── teacher-dashboard.tsx # Dashboard za učitelje
│   │   ├── teacher-students.tsx  # Upravljanje učenicima
│   │   ├── teacher-library.tsx   # Biblioteka za učitelje
│   │   ├── parent-dashboard.tsx  # Dashboard za roditelje
│   │   ├── parent-children.tsx   # Pregled djece
│   │   ├── admin-dashboard.tsx   # Admin dashboard sa statistikama
│   │   ├── admin-books.tsx       # Upravljanje knjigama + CSV import
│   │   ├── admin-quizzes.tsx     # Upravljanje kvizovima + CSV import
│   │   ├── admin-users.tsx       # Upravljanje korisnicima
│   │   ├── admin-blog.tsx        # Upravljanje blog postovima
│   │   ├── admin-messages.tsx    # Pregled kontakt poruka
│   │   ├── admin-partners.tsx    # Upravljanje partnerima
│   │   ├── admin-challenges.tsx  # Upravljanje izazovima čitanja
│   │   ├── admin-approvals.tsx   # Odobravanje institucionalnih registracija
│   │   └── not-found.tsx         # 404 stranica
│   ├── components/
│   │   ├── navbar.tsx            # Navigacija sa logom
│   │   ├── footer.tsx            # Footer
│   │   ├── dashboard-layout.tsx  # Layout za dashboard stranice
│   │   └── ui/                   # shadcn/ui komponente (50+ komponenti)
│   ├── hooks/
│   │   ├── use-auth.ts           # Autentifikacija hook
│   │   ├── use-toast.ts          # Toast notifikacije
│   │   └── use-mobile.ts         # Detekcija mobilnih uređaja
│   └── lib/
│       ├── queryClient.ts        # TanStack Query konfiguracija
│       └── utils.ts              # Pomoćne funkcije
├── server/
│   ├── index.ts                  # Express server, session konfiguracija
│   ├── routes.ts                 # Svi API endpointi
│   ├── storage.ts                # Database storage layer (IStorage interfejs)
│   ├── db.ts                     # Drizzle database konekcija
│   └── seed.ts                   # Seeding baze podataka
├── shared/
│   └── schema.ts                 # Drizzle sheme i Zod validacija
└── attached_assets/              # Slike i resursi
```

---

## 5. Baza podataka - Tabele i sheme

### 5.1 users (Korisnici)
| Kolona | Tip | Opis |
|---|---|---|
| id | VARCHAR (UUID) | Primarni ključ |
| username | TEXT | Jedinstveno korisničko ime |
| email | TEXT | Jedinstveni email |
| password | TEXT | Hashirana lozinka (crypto scrypt) |
| role | TEXT | student / teacher / parent / admin |
| fullName | TEXT | Puno ime |
| schoolName | TEXT | Naziv škole (opciono) |
| className | TEXT | Razred (opciono) |
| points | INTEGER | Ukupni bodovi (default: 0) |
| parentId | VARCHAR | ID roditelja (za učenike) |
| institutionType | TEXT | school / mekteb |
| institutionRole | TEXT | ucitelj / muallim / bibliotekar / sekretar |
| approved | BOOLEAN | Status odobravanja (za institucije) |
| maxStudentAccounts | INTEGER | Maks. broj učeničkih računa |
| createdByTeacherId | VARCHAR | ID učitelja koji je kreirao račun |
| subscriptionType | TEXT | free / standard / full |
| subscriptionExpiresAt | TIMESTAMP | Datum isteka pretplate |

### 5.2 books (Knjige)
| Kolona | Tip | Opis |
|---|---|---|
| id | VARCHAR (UUID) | Primarni ključ |
| title | TEXT | Naslov knjige |
| author | TEXT | Autor |
| description | TEXT | Opis |
| coverImage | TEXT | URL naslovnice |
| content | TEXT | Sadržaj / opis |
| ageGroup | TEXT | Dobna skupina |
| genre | TEXT | Žanr |
| readingDifficulty | TEXT | lako / srednje / tesko |
| pageCount | INTEGER | Broj stranica |
| pdfUrl | TEXT | URL za PDF preuzimanje |
| purchaseUrl | TEXT | URL za kupovinu |
| timesRead | INTEGER | Broj čitanja |
| weeklyPick | BOOLEAN | Sedmični izbor |
| createdAt | TIMESTAMP | Datum kreiranja |

### 5.3 quizzes (Kvizovi)
| Kolona | Tip | Opis |
|---|---|---|
| id | VARCHAR (UUID) | Primarni ključ |
| bookId | VARCHAR | ID knjige |
| title | TEXT | Naslov kviza |
| createdAt | TIMESTAMP | Datum kreiranja |

### 5.4 questions (Pitanja)
| Kolona | Tip | Opis |
|---|---|---|
| id | VARCHAR (UUID) | Primarni ključ |
| quizId | VARCHAR | ID kviza |
| questionText | TEXT | Tekst pitanja |
| optionA - optionD | TEXT | Opcije odgovora (A-D) |
| correctAnswer | TEXT | Tačan odgovor (a/b/c/d) |
| points | INTEGER | Bodovi za pitanje |

### 5.5 quiz_results (Rezultati kvizova)
| Kolona | Tip | Opis |
|---|---|---|
| id | VARCHAR (UUID) | Primarni ključ |
| userId | VARCHAR | ID korisnika |
| quizId | VARCHAR | ID kviza |
| score | INTEGER | Ukupni rezultat |
| totalQuestions | INTEGER | Ukupan broj pitanja |
| correctAnswers | INTEGER | Broj tačnih odgovora |
| wrongAnswers | INTEGER | Broj netačnih odgovora |
| completedAt | TIMESTAMP | Datum završetka |

### 5.6 blog_posts (Blog postovi)
| Kolona | Tip | Opis |
|---|---|---|
| id | VARCHAR (UUID) | Primarni ključ |
| title | TEXT | Naslov |
| excerpt | TEXT | Kratki izvod |
| content | TEXT | Sadržaj |
| author | TEXT | Autor |
| coverImage | TEXT | URL naslovne slike |
| publishedAt | TIMESTAMP | Datum objave |

### 5.7 contact_messages (Kontakt poruke)
| Kolona | Tip | Opis |
|---|---|---|
| id | VARCHAR (UUID) | Primarni ključ |
| name | TEXT | Ime pošiljaoca |
| email | TEXT | Email |
| subject | TEXT | Predmet |
| message | TEXT | Poruka |
| createdAt | TIMESTAMP | Datum slanja |

### 5.8 partners (Partneri)
| Kolona | Tip | Opis |
|---|---|---|
| id | VARCHAR (UUID) | Primarni ključ |
| name | TEXT | Naziv partnera |
| logoUrl | TEXT | URL logotipa |
| address | TEXT | Adresa |
| websiteUrl | TEXT | Web stranica |
| description | TEXT | Opis |
| sortOrder | INTEGER | Redoslijed prikaza |
| active | BOOLEAN | Aktivan status |
| createdAt | TIMESTAMP | Datum kreiranja |

### 5.9 challenges (Izazovi čitanja)
| Kolona | Tip | Opis |
|---|---|---|
| id | VARCHAR (UUID) | Primarni ključ |
| title | TEXT | Naslov izazova |
| description | TEXT | Opis |
| prizes | TEXT | Nagrade (razdvojene znakom \|) |
| startDate | TIMESTAMP | Datum početka |
| endDate | TIMESTAMP | Datum završetka |
| active | BOOLEAN | Aktivan status |
| createdAt | TIMESTAMP | Datum kreiranja |

---

## 6. API endpointi

### 6.1 Autentifikacija
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| POST | /api/auth/register | Registracija korisnika | Javno |
| POST | /api/auth/login | Prijava | Javno |
| POST | /api/auth/logout | Odjava | Prijavljeni |
| GET | /api/auth/me | Trenutni korisnik | Prijavljeni |

### 6.2 Knjige
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/books | Lista svih knjiga | Javno |
| GET | /api/books/:id | Detalji knjige | Javno |
| POST | /api/books | Kreiranje knjige | Admin |
| PUT | /api/books/:id | Ažuriranje knjige | Admin |
| DELETE | /api/books/:id | Brisanje knjige | Admin |

### 6.3 Kvizovi i pitanja
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/books/:bookId/quizzes | Kvizovi za knjigu | Javno |
| GET | /api/quizzes | Svi kvizovi | Admin |
| GET | /api/quizzes/:id | Detalji kviza | Javno |
| POST | /api/quizzes | Kreiranje kviza | Admin |
| DELETE | /api/quizzes/:id | Brisanje kviza | Admin |
| GET | /api/quizzes/:quizId/questions | Pitanja kviza | Javno |
| POST | /api/questions | Kreiranje pitanja | Admin |
| PUT | /api/questions/:id | Ažuriranje pitanja | Admin |
| DELETE | /api/questions/:id | Brisanje pitanja | Admin |

### 6.4 Rezultati kvizova
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| POST | /api/quiz-results | Slanje rezultata | Prijavljeni |
| GET | /api/quiz-results/my | Moji rezultati | Prijavljeni |
| GET | /api/quiz-results/user/:userId | Rezultati korisnika | Prijavljeni |

### 6.5 Pretplate
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/subscription/status | Status pretplate | Prijavljeni |

### 6.6 Leaderboard
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/leaderboard?period=week\|month\|year | Top čitači | Javno |

### 6.7 Blog
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/blog | Lista blog postova | Javno |
| GET | /api/blog/:id | Detalji posta | Javno |
| POST | /api/blog | Kreiranje posta | Admin |
| PUT | /api/blog/:id | Ažuriranje posta | Admin |
| DELETE | /api/blog/:id | Brisanje posta | Admin |

### 6.8 Kontakt
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| POST | /api/contact | Slanje poruke | Javno |
| GET | /api/contact | Lista poruka | Admin |

### 6.9 Partneri
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/partners | Aktivni partneri | Javno |
| GET | /api/admin/partners | Svi partneri | Admin |
| POST | /api/partners | Kreiranje partnera | Admin |
| PUT | /api/partners/:id | Ažuriranje partnera | Admin |
| DELETE | /api/partners/:id | Brisanje partnera | Admin |

### 6.10 Izazovi čitanja
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/challenges | Aktivni izazovi | Javno |
| GET | /api/admin/challenges | Svi izazovi | Admin |
| POST | /api/challenges | Kreiranje izazova | Admin |
| PUT | /api/challenges/:id | Ažuriranje izazova | Admin |
| DELETE | /api/challenges/:id | Brisanje izazova | Admin |

### 6.11 Admin upravljanje
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/admin/users | Lista korisnika | Admin |
| PUT | /api/admin/users/:id | Ažuriranje korisnika | Admin |
| DELETE | /api/admin/users/:id | Brisanje korisnika | Admin |
| GET | /api/admin/pending-teachers | Učitelji na čekanju | Admin |
| PUT | /api/admin/approve-teacher/:id | Odobravanje učitelja | Admin |
| GET | /api/admin/stats | Statistike platforme | Admin |

### 6.12 Učiteljske funkcije
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/teacher/students | Lista učenika | Učitelj |
| POST | /api/teacher/create-student | Kreiranje učenika | Učitelj |
| GET | /api/teacher/export | CSV eksport učenika | Učitelj |

### 6.13 Roditeljske funkcije
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/parent/children | Lista djece | Roditelj |

### 6.14 CSV Import (Admin)
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| GET | /api/admin/templates/books | Preuzmi CSV template za knjige | Admin |
| GET | /api/admin/templates/quizzes | Preuzmi CSV template za kvizove | Admin |
| POST | /api/admin/import/books | Import knjiga iz CSV-a | Admin |
| POST | /api/admin/import/quizzes | Import kvizova iz CSV-a | Admin |

### 6.15 Upload fajlova
| Metoda | Endpoint | Opis | Pristup |
|---|---|---|---|
| POST | /api/upload/cover | Upload naslovnice knjige | Admin |
| POST | /api/upload/book | Upload PDF fajla knjige | Admin |
| POST | /api/upload/logo | Upload logotipa partnera | Admin |

---

## 7. Sistem bodovanja

- **+1 bod** za svaki tačan odgovor
- **-1 bod** za svaki netačan odgovor
- **Minimum po kvizu:** 0 bodova (ne može ići u minus)
- Bodovi se akumuliraju na korisničkom profilu
- Leaderboard prikazuje top čitače po sedmici, mjesecu i godini

---

## 8. Sistem pretplata

| Plan | Cijena | Mogućnosti |
|---|---|---|
| **Free (Besplatno)** | 0 KM | 3 kviza mjesečno |
| **Standard** | 10 KM/godišnje | Neograničen broj kvizova |
| **Full** | 20 KM/godišnje | Neograničeni kvizovi + pristup takmičenjima |

---

## 9. Registracija i autentifikacija

### 9.1 Vrste registracije
Stranica za autentifikaciju ima tri taba:

1. **Prijava** - za postojeće korisnike (korisničko ime + lozinka)
2. **Registracija** - samoregistracija za učenike i roditelje
3. **Institucionalna registracija** - za škole i mektebe
   - Izbor tipa institucije (škola/mekteb)
   - Izbor uloge (učitelj/muallim/bibliotekar/sekretar)
   - Zahtijeva odobrenje administratora

### 9.2 Kreiranje učeničkih računa od strane učitelja
- Učitelji mogu kreirati račune za učenike
- Automatsko generiranje korisničkog imena (uklanjanje dijakritičkih znakova)
- Automatsko generiranje lozinke
- Učenici se povezuju sa učiteljem koji ih je kreirao

### 9.3 Sigurnost
- Lozinke su hashirane sa `crypto.scrypt`
- Sesije se čuvaju u PostgreSQL bazi (connect-pg-simple)
- Session-based autentifikacija sa HTTP-only kolačićima

---

## 10. Test računi

| Uloga | Korisničko ime | Lozinka |
|---|---|---|
| Admin | admin | admin123 |
| Učitelj | ucitelj1 | ucitelj123 |
| Roditelj | roditelj1 | roditelj123 |
| Učenik 1 | ucenik1 | ucenik123 |
| Učenik 2 | ucenik2 | ucenik123 |

---

## 11. CSV Import/Export sistem

### 11.1 CSV Import (Admin)
- Delimiter: tačka-zarez (;)
- Encoding: UTF-8
- Validacija svake linije sa izvještajem o greškama
- Dostupni template-ovi za preuzimanje

**Template za knjige:**
```
naslov;autor;opis;dobna_skupina;zanr;tezina;broj_stranica;url_naslovnice;pdf_url;url_kupovine
```

**Template za kvizove:**
```
id_knjige;naslov_kviza;tekst_pitanja;opcija_a;opcija_b;opcija_c;opcija_d;tacan_odgovor;bodovi
```

### 11.2 CSV Eksport (Učitelji)
- Eksport podataka o učenicima
- UTF-8 BOM za kompatibilnost sa Excel-om
- Endpoint: GET /api/teacher/export

---

## 12. Dizajn i brending

### 12.1 Vizuelni identitet
- **Naziv:** Čitanje
- **Logo:** Prilagođeni logo sa ikonom knjige
- **Primarna boja:** Topla tamna narandžasta HSL(24°, 85%, 40%)
- **Dark mode varijanta:** HSL(24°, 85%, 45%)
- **Tema:** Topla, prijateljska za djecu

### 12.2 Hero sekcija
- Pozadinska slika sa zatamnjenim narandžastim overlayom
- Rgba overlay: rgba(180, 90, 10, 0.82)
- CTA dugme "Pogledaj knjige" sa bijelim obrubom

### 12.3 Naslovnice knjiga
- Sve knjige koje nemaju postavljenu naslovnicu koriste default pozadinsku sliku
- Konzistentno prikazivanje na svim stranicama (biblioteka, detalji, dashboard)

---

## 13. Javne stranice

| Stranica | URL | Opis |
|---|---|---|
| Početna | / | Hero sekcija, izazovi, leaderboard, partneri |
| Biblioteka | /biblioteka | Javna pretraga i filtriranje knjiga |
| Detalji knjige | /knjiga/:id | Informacije o knjizi, kvizovi |
| Blog | /blog | Lista blog postova |
| Cijene | /cijene | Planovi pretplate |
| Kontakt | /kontakt | Kontakt forma |
| Prijava/Registracija | /prijava, /registracija | Autentifikacija |

---

## 14. Dashboard stranice

### Učenik (/ucenik/*)
| Stranica | URL | Opis |
|---|---|---|
| Dashboard | /ucenik | Pregled bodova i napretka |
| Biblioteka | /ucenik/biblioteka | Pretraga knjiga sa kvizovima |
| Knjiga | /ucenik/knjiga/:id | Detalji knjige + kviz |
| Kviz | /ucenik/kviz/:id | Rješavanje kviza |
| Rezultati | /ucenik/rezultati | Historija rezultata |

### Učitelj (/ucitelj/*)
| Stranica | URL | Opis |
|---|---|---|
| Dashboard | /ucitelj | Pregled statistika |
| Učenici | /ucitelj/ucenici | Lista učenika, kreiranje, CSV eksport |
| Biblioteka | /ucitelj/biblioteka | Pregled knjiga |

### Roditelj (/roditelj/*)
| Stranica | URL | Opis |
|---|---|---|
| Dashboard | /roditelj | Pregled napretka djece |
| Djeca | /roditelj/djeca | Lista djece sa rezultatima |

### Admin (/admin/*)
| Stranica | URL | Opis |
|---|---|---|
| Dashboard | /admin | Statistike platforme (grafikon) |
| Knjige | /admin/knjige | CRUD knjiga + CSV import |
| Kvizovi | /admin/kvizovi | CRUD kvizova + pitanja + CSV import |
| Korisnici | /admin/korisnici | Upravljanje korisnicima |
| Blog | /admin/blog | CRUD blog postova |
| Poruke | /admin/poruke | Pregled kontakt poruka |
| Partneri | /admin/partneri | CRUD partnera |
| Izazovi | /admin/izazovi | CRUD izazova čitanja |
| Odobrenja | /admin/odobrenja | Odobravanje institucionalnih registracija |

---

## 15. Početna stranica - Sekcije

1. **Hero sekcija** - Pozadinska slika sa overlayom, naslov, CTA dugme
2. **Kako funkcioniše** - 3 koraka (Registracija, Čitanje, Rješavanje kviza)
3. **Izazovi čitanja** - Aktivni izazovi sa nagradama i datumima
4. **Top čitači (Leaderboard)** - Tabovi: sedmica/mjesec/godina
5. **Naši partneri** - Logotipi i informacije o partnerima
6. **CTA sekcija** - Poziv na akciju za registraciju
7. **Footer** - Linkovi, kontakt informacije

---

## 16. Pokretanje projekta

```bash
npm run dev
```

Pokreće Express server za backend i Vite dev server za frontend na portu 5000.

---

## 17. Sigurnosne mjere

- Lozinke hashirane sa crypto.scrypt + random salt
- Session-based autentifikacija (HTTP-only cookies)
- Middleware provjere uloga (requireAuth, requireAdmin, requireTeacher)
- Zod validacija svih ulaznih podataka
- Zaštita API endpointa po ulogama
- UUID primarni ključevi za sve tabele

---

*Dokumentacija ažurirana: Februar 2026*
