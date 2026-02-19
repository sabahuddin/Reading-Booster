import { db } from "./db";
import { quizzes, questions } from "@shared/schema";

interface QuizData {
  bookId: string;
  title: string;
  questions: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: "a" | "b" | "c" | "d";
  }[];
}

const allQuizzes: QuizData[] = [
  {
    bookId: "9d5d5253-e591-41e1-babe-d75307978f47",
    title: "Kviz: 1984",
    questions: [
      { questionText: "Ko je autor romana 1984?", optionA: "George Orwell", optionB: "Aldous Huxley", optionC: "Ray Bradbury", optionD: "Franz Kafka", correctAnswer: "a" },
      { questionText: "Kako se zove totalitarna partija u romanu?", optionA: "Narodna partija", optionB: "Engsoc", optionC: "Komunistička partija", optionD: "Demokratska unija", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak romana?", optionA: "John Smith", optionB: "Big Brother", optionC: "Winston Smith", optionD: "O'Brien", correctAnswer: "c" },
      { questionText: "Šta predstavlja 'Veliki Brat' u romanu?", optionA: "Porodični autoritet", optionB: "Školski sistem", optionC: "Vojnog vođu", optionD: "Sveprisutnu državnu kontrolu", correctAnswer: "d" },
      { questionText: "U kojoj državi se odvija radnja romana?", optionA: "Oceanija", optionB: "Eurazija", optionC: "Istočna Azija", optionD: "Američka unija", correctAnswer: "a" },
    ],
  },
  {
    bookId: "3f89e0b6-6ddf-445c-bea9-266496a7d28e",
    title: "Kviz: 20.000 milja pod morem",
    questions: [
      { questionText: "Ko je autor romana '20.000 milja pod morem'?", optionA: "H. G. Wells", optionB: "Jules Verne", optionC: "Robert Louis Stevenson", optionD: "Daniel Defoe", correctAnswer: "b" },
      { questionText: "Kako se zove podmornica u romanu?", optionA: "Posejdon", optionB: "Atlantis", optionC: "Nautilus", optionD: "Neptun", correctAnswer: "c" },
      { questionText: "Kako se zove kapetan podmornice?", optionA: "Kapetan Ahab", optionB: "Kapetan Hook", optionC: "Kapetan Flint", optionD: "Kapetan Nemo", correctAnswer: "d" },
      { questionText: "Ko je pripovijedač priče?", optionA: "Profesor Aronnax", optionB: "Ned Land", optionC: "Conseil", optionD: "Kapetan Nemo", correctAnswer: "a" },
      { questionText: "Čime se Ned Land bavi na brodu?", optionA: "Kuvar je", optionB: "Harpundžija je", optionC: "Navigator je", optionD: "Liječnik je", correctAnswer: "b" },
    ],
  },
  {
    bookId: "c536bc65-1a29-48a4-b7a2-165418a89cda",
    title: "Kviz: Afrička djetinjstva",
    questions: [
      { questionText: "O čemu govori knjiga 'Afrička djetinjstva'?", optionA: "O životinjama Afrike", optionB: "O geografiji Afrike", optionC: "O odrastanju djece u Africi", optionD: "O afričkoj historiji", correctAnswer: "c" },
      { questionText: "Koliko autora je doprinijelo ovoj knjizi?", optionA: "Jedan", optionB: "Dva", optionC: "Tri", optionD: "Više (grupa autora)", correctAnswer: "d" },
      { questionText: "Koji žanr najbolje opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Realistični roman", optionC: "Bajka", optionD: "Poezija", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
      { questionText: "Šta čitatelji mogu naučiti iz ove knjige?", optionA: "Kako kuhati afričku hranu", optionB: "Kako putovati u Afriku", optionC: "O različitim kulturama i iskustvima odrastanja", optionD: "O afričkoj politici", correctAnswer: "c" },
    ],
  },
  {
    bookId: "062f463f-ad9a-413d-86cd-1c4b9798c721",
    title: "Kviz: Apsolutno istinit dnevnik jednog Indijanca",
    questions: [
      { questionText: "Ko je autor ove knjige?", optionA: "John Green", optionB: "Sherman Alexie", optionC: "Mark Twain", optionD: "J.D. Salinger", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Junior", optionB: "Tommy", optionC: "Billy", optionD: "Charlie", correctAnswer: "a" },
      { questionText: "Gdje živi glavni junak na početku priče?", optionA: "U gradu", optionB: "Na farmi", optionC: "U indijanskom rezervatu", optionD: "Na brodu", correctAnswer: "c" },
      { questionText: "Zašto Junior mijenja školu?", optionA: "Zbog kazne", optionB: "Želi bolji život i obrazovanje", optionC: "Roditelji se sele", optionD: "Škola je zatvorena", correctAnswer: "b" },
      { questionText: "Koji format ima ova knjiga?", optionA: "Poezija", optionB: "Drama", optionC: "Dnevnik sa crtežima", optionD: "Enciklopedija", correctAnswer: "c" },
    ],
  },
  {
    bookId: "b44e316c-0e51-4104-af84-3027323f8432",
    title: "Kviz: Artemis Fowl",
    questions: [
      { questionText: "Ko je autor knjige 'Artemis Fowl'?", optionA: "Rick Riordan", optionB: "Eoin Colfer", optionC: "J.K. Rowling", optionD: "Philip Pullman", correctAnswer: "b" },
      { questionText: "Šta je Artemis Fowl?", optionA: "Čarobnjak", optionB: "Vilenjak", optionC: "Genijalni maloljetni kriminalac", optionD: "Detektiv", correctAnswer: "c" },
      { questionText: "Koja bića Artemis pokušava nadmudriti?", optionA: "Zmajeve", optionB: "Vilenjake i vilinski narod", optionC: "Vampire", optionD: "Vještice", correctAnswer: "b" },
      { questionText: "Kako se zove vilinska kapetanica?", optionA: "Holly Short", optionB: "Tinker Bell", optionC: "Luna Silver", optionD: "Ivy Green", correctAnswer: "a" },
      { questionText: "Šta Artemis želi ukrasti od vilenjaka?", optionA: "Čarobni štap", optionB: "Knjigu čarolija", optionC: "Zlato", optionD: "Nevidljivi ogrtač", correctAnswer: "c" },
    ],
  },
  {
    bookId: "6fe7bf0d-6589-41ed-a790-cef69dcfdddc",
    title: "Kviz: Besmrtnici",
    questions: [
      { questionText: "Ko je autor knjige 'Besmrtnici'?", optionA: "Stephenie Meyer", optionB: "Alyson Noel", optionC: "Cassandra Clare", optionD: "Leigh Bardugo", correctAnswer: "b" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Bella", optionB: "Clary", optionC: "Ever Bloom", optionD: "Tris", correctAnswer: "c" },
      { questionText: "Šta Ever može vidjeti nakon nesreće?", optionA: "Budućnost", optionB: "Aure i duhove", optionC: "Nevidljive ljude", optionD: "Prošlost", correctAnswer: "b" },
      { questionText: "Kako se zove momak u koga se Ever zaljubi?", optionA: "Edward", optionB: "Jacob", optionC: "Damen Auguste", optionD: "Jace", correctAnswer: "c" },
      { questionText: "Koji žanr najbolje opisuje ovu knjigu?", optionA: "Horor", optionB: "Kriminalistički roman", optionC: "Paranormalna romansa", optionD: "Historijski roman", correctAnswer: "c" },
    ],
  },
  {
    bookId: "ba736bb0-624d-42f2-9e64-bb9e76072928",
    title: "Kviz: Bijeli jelen",
    questions: [
      { questionText: "Ko je autor djela 'Bijeli jelen'?", optionA: "Branko Ćopić", optionB: "Vladimir Nazor", optionC: "Ivo Andrić", optionD: "Mato Lovrak", correctAnswer: "b" },
      { questionText: "Šta bijeli jelen simbolizira u djelu?", optionA: "Snagu", optionB: "Ljepotu i slobodu prirode", optionC: "Rat", optionD: "Zimu", correctAnswer: "b" },
      { questionText: "U kakvom okruženju se odvija priča?", optionA: "U gradu", optionB: "Na moru", optionC: "U šumi i planini", optionD: "U pustinji", correctAnswer: "c" },
      { questionText: "Koji je žanr ovog djela?", optionA: "Bajka", optionB: "Lektira", optionC: "Fantasy", optionD: "Naučna fantastika", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je djelo namijenjeno?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
    ],
  },
  {
    bookId: "6de2205f-288a-4e7c-97b6-5230a67617bc",
    title: "Kviz: Bijeli očnjak",
    questions: [
      { questionText: "Ko je autor romana 'Bijeli očnjak'?", optionA: "Mark Twain", optionB: "Jack London", optionC: "Ernest Hemingway", optionD: "Daniel Defoe", correctAnswer: "b" },
      { questionText: "Šta je Bijeli očnjak?", optionA: "Medvjed", optionB: "Mješanac vuka i psa", optionC: "Tigar", optionD: "Orao", correctAnswer: "b" },
      { questionText: "Gdje se odvija radnja romana?", optionA: "U Africi", optionB: "U Australiji", optionC: "Na Aljasci / Yukonu", optionD: "U Evropi", correctAnswer: "c" },
      { questionText: "Kakav je život Bijeli očnjak imao na početku?", optionA: "Udoban kućni život", optionB: "Divlji život u prirodi", optionC: "Život u cirkusu", optionD: "Život na farmi", correctAnswer: "b" },
      { questionText: "Šta Bijeli očnjak na kraju pronalazi?", optionA: "Slobodu u divljini", optionB: "Ljubav i dom kod dobrog vlasnika", optionC: "Čopor vukova", optionD: "Put nazad u šumu", correctAnswer: "b" },
    ],
  },
  {
    bookId: "59a1c5f9-b64c-49a2-8e3c-f9ab82465a90",
    title: "Kviz: Bilješke jedne gimnazijalke",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Nadežda Milenković", optionB: "Ana Frank", optionC: "Sue Townsend", optionD: "Jenny Han", correctAnswer: "a" },
      { questionText: "U kakvom formatu je napisana knjiga?", optionA: "Roman", optionB: "Dnevnik", optionC: "Drama", optionD: "Poezija", correctAnswer: "b" },
      { questionText: "O čemu govori knjiga?", optionA: "O ratu", optionB: "O putovanju", optionC: "O životu i problemima jedne gimnazijalke", optionD: "O sportu", correctAnswer: "c" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "c" },
      { questionText: "Koji žanr najbolje opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Realistični roman", optionC: "Bajka", optionD: "Naučna fantastika", correctAnswer: "b" },
    ],
  },
  {
    bookId: "3ca6868c-3bf0-4f30-bb94-fc09206046b8",
    title: "Kviz: Blizanke",
    questions: [
      { questionText: "Ko je autor knjige 'Blizanke'?", optionA: "Astrid Lindgren", optionB: "Erich Kästner", optionC: "Roald Dahl", optionD: "Enid Blyton", correctAnswer: "b" },
      { questionText: "Šta saznaju glavne junakinje o sebi?", optionA: "Da su princeze", optionB: "Da su blizanke razdvojene na rođenju", optionC: "Da imaju magične moći", optionD: "Da su usvojene", correctAnswer: "b" },
      { questionText: "Gdje se blizanke prvi put susreću?", optionA: "U školi", optionB: "Na ljetnom kampu", optionC: "U parku", optionD: "Na putovanju", correctAnswer: "b" },
      { questionText: "Šta blizanke odluče uraditi?", optionA: "Pobjeći od kuće", optionB: "Zamijeniti uloge", optionC: "Otputovati zajedno", optionD: "Ništa", correctAnswer: "b" },
      { questionText: "Šta je glavni cilj blizanki?", optionA: "Postati slavne", optionB: "Ponovo spojiti roditelje", optionC: "Osvojiti takmičenje", optionD: "Pronaći blago", correctAnswer: "b" },
    ],
  },
  {
    bookId: "278f2526-9ffb-4233-afe0-c524b8324f84",
    title: "Kviz: Bosonogi i nebo",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Branislav Crnčević", optionB: "Branko Ćopić", optionC: "Mato Lovrak", optionD: "Ivan Kušan", correctAnswer: "a" },
      { questionText: "O čemu govori knjiga?", optionA: "O životu na selu", optionB: "O djetinjstvu i odrastanju", optionC: "O putovanju u svemir", optionD: "O životinjama", correctAnswer: "b" },
      { questionText: "Šta naslov 'Bosonogi i nebo' simbolizira?", optionA: "Bogatsvo", optionB: "Siromaštvo i slobodu djetinjstva", optionC: "Letenje", optionD: "Nogomet", correctAnswer: "b" },
      { questionText: "Koji žanr najbolje opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Lektira", optionC: "Bajka", optionD: "Naučna fantastika", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
    ],
  },
  {
    bookId: "d8c9d110-24db-429e-9d97-f585e76a08ea",
    title: "Kviz: Božićna priča",
    questions: [
      { questionText: "Ko je autor 'Božićne priče'?", optionA: "Oscar Wilde", optionB: "Charles Dickens", optionC: "H. C. Andersen", optionD: "Braća Grimm", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Oliver Twist", optionB: "Bob Cratchit", optionC: "Ebenezer Scrooge", optionD: "Tiny Tim", correctAnswer: "c" },
      { questionText: "Koliko duhova posjeti Scroogea?", optionA: "Jedan", optionB: "Dva", optionC: "Tri", optionD: "Četiri", correctAnswer: "c" },
      { questionText: "Kakav je Scrooge na početku priče?", optionA: "Velikodušan", optionB: "Škrt i sebičan", optionC: "Veseo", optionD: "Tužan", correctAnswer: "b" },
      { questionText: "Šta se dogodi sa Scroogeom na kraju?", optionA: "Ostaje isti", optionB: "Postaje još gori", optionC: "Mijenja se i postaje darežljiv", optionD: "Odlazi daleko", correctAnswer: "c" },
    ],
  },
  {
    bookId: "a6dba02c-d962-4ee4-aaf2-00a9e405295b",
    title: "Kviz: Bratstvo crnog bodeža",
    questions: [
      { questionText: "Ko je autor serijala?", optionA: "Stephenie Meyer", optionB: "J. R. Ward", optionC: "Anne Rice", optionD: "Bram Stoker", correctAnswer: "b" },
      { questionText: "O kakvim bićima govori knjiga?", optionA: "Vukodlacima", optionB: "Vilenjacima", optionC: "Vampirima ratnicima", optionD: "Čarobnjacima", correctAnswer: "c" },
      { questionText: "Šta je 'Bratstvo crnog bodeža'?", optionA: "Grupa detektiva", optionB: "Elitna grupa vampirskih ratnika", optionC: "Školsko društvo", optionD: "Piratska posada", correctAnswer: "b" },
      { questionText: "Koji žanr najbolje opisuje ovu knjigu?", optionA: "Komedija", optionB: "Historijski roman", optionC: "Paranormalna romansa / urban fantasy", optionD: "Kriminalistički roman", correctAnswer: "c" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "d" },
    ],
  },
  {
    bookId: "08dd1159-92af-4d9b-8014-90cac8fb5ec7",
    title: "Kviz: Braća Lavlje Srce",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Astrid Lindgren", optionB: "Roald Dahl", optionC: "C. S. Lewis", optionD: "J. R. R. Tolkien", correctAnswer: "a" },
      { questionText: "Kako se zovu dva brata u priči?", optionA: "Tom i Jerry", optionB: "Jonatani i Karl (Skorpan)", optionC: "Hans i Gretel", optionD: "Peter i Edmund", correctAnswer: "b" },
      { questionText: "Kuda braća odlaze nakon smrti?", optionA: "Na nebesa", optionB: "U Nangijalu", optionC: "U Narniju", optionD: "U raj", correctAnswer: "b" },
      { questionText: "Protiv koga se braća bore u Nangijali?", optionA: "Zmaja", optionB: "Tiranina Tengila", optionC: "Vještica", optionD: "Pirata", correctAnswer: "b" },
      { questionText: "Koja je glavna tema knjige?", optionA: "Ljubav prema životinjama", optionB: "Hrabrost, smrt i bratska ljubav", optionC: "Putovanja", optionD: "Škola i prijateljstvo", correctAnswer: "b" },
    ],
  },
  {
    bookId: "ec5f3d5c-ddef-4727-b3fc-13712153858e",
    title: "Kviz: Britt-Marie je bila ovdje",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Fredrik Backman", optionB: "Stieg Larsson", optionC: "Jonas Jonasson", optionD: "Henning Mankell", correctAnswer: "a" },
      { questionText: "Šta Britt-Marie odluči uraditi nakon rastave?", optionA: "Otputovati u inostranstvo", optionB: "Početi novi život u malom gradu", optionC: "Vratiti se roditeljima", optionD: "Pisati knjigu", correctAnswer: "b" },
      { questionText: "Čime se Britt-Marie počne baviti u novom mjestu?", optionA: "Kuhanjem", optionB: "Vrtlarstvom", optionC: "Treniranjem dječijeg fudbalskog tima", optionD: "Učiteljstvom", correctAnswer: "c" },
      { questionText: "Kakva je Britt-Marie na početku?", optionA: "Opuštena i vesela", optionB: "Pedantna i rigidna", optionC: "Avanturistička", optionD: "Stidljiva", correctAnswer: "b" },
      { questionText: "Šta Britt-Marie nauči kroz priču?", optionA: "Da kuha", optionB: "Da vozi auto", optionC: "Da život može biti lijep i nepredvidiv", optionD: "Da igra šah", correctAnswer: "c" },
    ],
  },
  {
    bookId: "758c4c44-550b-4677-ba5a-e033827860ad",
    title: "Kviz: Bum i Tras",
    questions: [
      { questionText: "Ko je autor knjige 'Bum i Tras'?", optionA: "Roald Dahl", optionB: "Antoine Bello", optionC: "Astrid Lindgren", optionD: "Enid Blyton", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
      { questionText: "Koji žanr najbolje opisuje ovu knjigu?", optionA: "Lektira", optionB: "Bajka", optionC: "Avantura i fantasy", optionD: "Poezija", correctAnswer: "c" },
      { questionText: "Šta naslov 'Bum i Tras' sugeriše?", optionA: "Mirnu priču", optionB: "Akciju i zabavu", optionC: "Tužnu priču", optionD: "Historijski događaj", correctAnswer: "b" },
      { questionText: "Kakvi su likovi Bum i Tras?", optionA: "Tihi i mirni", optionB: "Zločesti", optionC: "Zabavni i dinamični", optionD: "Tužni", correctAnswer: "c" },
    ],
  },
  {
    bookId: "ed3b8cb7-08d9-4c64-ae96-4a1d5dbbd062",
    title: "Kviz: Carevo novo odijelo",
    questions: [
      { questionText: "Ko je autor bajke 'Carevo novo odijelo'?", optionA: "Braća Grimm", optionB: "Charles Perrault", optionC: "H. C. Andersen", optionD: "Oscar Wilde", correctAnswer: "c" },
      { questionText: "Šta prevaranti tvrde da šiju za cara?", optionA: "Najskuplje odijelo", optionB: "Nevidljivo odijelo koje glupi ne mogu vidjeti", optionC: "Zlatno odijelo", optionD: "Čarobni ogrtač", correctAnswer: "b" },
      { questionText: "Ko na kraju kaže istinu?", optionA: "Ministar", optionB: "Carica", optionC: "Dijete", optionD: "Vojnik", correctAnswer: "c" },
      { questionText: "Zašto niko od odraslih ne govori istinu?", optionA: "Boje se izgledati glupo", optionB: "Ne vide cara", optionC: "Zaista vide odijelo", optionD: "Ne žele uvrijediti cara", correctAnswer: "a" },
      { questionText: "Koja je pouka bajke?", optionA: "Treba biti bogat", optionB: "Treba biti hrabar i govoriti istinu", optionC: "Treba slušati starije", optionD: "Treba se lijepo oblačiti", correctAnswer: "b" },
    ],
  },
  {
    bookId: "576b0016-f060-4f2e-8b17-9f54ce34ae1d",
    title: "Kviz: Charlie i tvornica čokolade",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Roald Dahl", optionB: "Enid Blyton", optionC: "C. S. Lewis", optionD: "J. K. Rowling", correctAnswer: "a" },
      { questionText: "Kako se zove vlasnik tvornice čokolade?", optionA: "Mr. Bean", optionB: "Willy Wonka", optionC: "Charlie Bucket", optionD: "Augustus Gloop", correctAnswer: "b" },
      { questionText: "Koliko zlatnih karata je skriveno u čokoladama?", optionA: "Tri", optionB: "Četiri", optionC: "Pet", optionD: "Sedam", correctAnswer: "c" },
      { questionText: "Ko radi u tvornici?", optionA: "Roboti", optionB: "Oompa-Loompe", optionC: "Vilenjaci", optionD: "Djeca", correctAnswer: "b" },
      { questionText: "Šta Charlie dobije na kraju?", optionA: "Zlato", optionB: "Čokoladu", optionC: "Cijelu tvornicu čokolade", optionD: "Kartu za putovanje", correctAnswer: "c" },
    ],
  },
  {
    bookId: "4c4a99d9-92d8-4d77-9b21-ade6049a3041",
    title: "Kviz: Crni ljepotan",
    questions: [
      { questionText: "Ko je autor knjige 'Crni ljepotan'?", optionA: "Anna Sewell", optionB: "Jack London", optionC: "Rudyard Kipling", optionD: "James Herriot", correctAnswer: "a" },
      { questionText: "O kakvoj životinji govori knjiga?", optionA: "O psu", optionB: "O konju", optionC: "O mački", optionD: "O jelenu", correctAnswer: "b" },
      { questionText: "Ko priča priču u knjizi?", optionA: "Vlasnik konja", optionB: "Dijete", optionC: "Sam konj (Crni ljepotan)", optionD: "Veterinar", correctAnswer: "c" },
      { questionText: "Šta knjiga prikazuje o postupanju prema životinjama?", optionA: "Da su životinje sretne", optionB: "Okrutnost i dobrotu prema konjima", optionC: "Život na farmi", optionD: "Život u divljini", correctAnswer: "b" },
      { questionText: "Kakav kraj ima priča?", optionA: "Tužan", optionB: "Sretan - Crni ljepotan pronalazi dobar dom", optionC: "Otvoren", optionD: "Tragičan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "1b5dc6d5-bedf-4a64-9b2c-f4991e528619",
    title: "Kviz: Crvenkapica",
    questions: [
      { questionText: "Ko je napisao bajku 'Crvenkapica'?", optionA: "H. C. Andersen", optionB: "Charles Perrault / Braća Grimm", optionC: "Oscar Wilde", optionD: "Carlo Collodi", correctAnswer: "b" },
      { questionText: "Zašto Crvenkapica ide u šumu?", optionA: "Da se igra", optionB: "Da bere cvijeće", optionC: "Da posjeti bolesnu baku", optionD: "Da ide u školu", correctAnswer: "c" },
      { questionText: "Ko se pretvara da je baka?", optionA: "Lovac", optionB: "Vuk", optionC: "Lisica", optionD: "Medvjed", correctAnswer: "b" },
      { questionText: "Ko spašava Crvenkapicu i baku?", optionA: "Princ", optionB: "Otac", optionC: "Lovac", optionD: "Susjed", correctAnswer: "c" },
      { questionText: "Koja je pouka bajke?", optionA: "Treba jesti povrće", optionB: "Ne treba razgovarati s neznancima", optionC: "Treba rano spavati", optionD: "Treba biti jak", correctAnswer: "b" },
    ],
  },
  {
    bookId: "591bdcdc-5eb8-452f-b4ce-29cd67e2c747",
    title: "Kviz: Demian",
    questions: [
      { questionText: "Ko je autor romana 'Demian'?", optionA: "Franz Kafka", optionB: "Thomas Mann", optionC: "Hermann Hesse", optionD: "Albert Camus", correctAnswer: "c" },
      { questionText: "Kako se zove glavni junak?", optionA: "Emil Sinclair", optionB: "Karl Sinclair", optionC: "Hans Sinclair", optionD: "Franz Sinclair", correctAnswer: "a" },
      { questionText: "Ko je Demian u romanu?", optionA: "Učitelj", optionB: "Tajanstveni prijatelj i mentor", optionC: "Brat", optionD: "Neprijatelj", correctAnswer: "b" },
      { questionText: "Koja je glavna tema romana?", optionA: "Ljubavna priča", optionB: "Potraga za identitetom i samospoznajom", optionC: "Ratna priča", optionD: "Avantura", correctAnswer: "b" },
      { questionText: "Koji simbol je važan u romanu?", optionA: "Zvijezda", optionB: "Ptica koja se rađa iz jajeta", optionC: "Drvo", optionD: "More", correctAnswer: "b" },
    ],
  },
  {
    bookId: "dd511435-1d42-46de-8a2f-435ce4976787",
    title: "Kviz: Divergent",
    questions: [
      { questionText: "Ko je autor serijala 'Divergent'?", optionA: "Suzanne Collins", optionB: "Veronica Roth", optionC: "James Dashner", optionD: "Leigh Bardugo", correctAnswer: "b" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Katniss", optionB: "Hermiona", optionC: "Tris Prior", optionD: "Clary Fray", correctAnswer: "c" },
      { questionText: "Na koliko frakcija je podijeljeno društvo?", optionA: "Tri", optionB: "Četiri", optionC: "Pet", optionD: "Šest", correctAnswer: "c" },
      { questionText: "Šta znači biti 'divergentan'?", optionA: "Biti sljedbenik", optionB: "Pripadati jednoj frakciji", optionC: "Ne uklapati se ni u jednu frakciju", optionD: "Biti vođa", correctAnswer: "c" },
      { questionText: "Koju frakciju Tris izabere?", optionA: "Eruditu", optionB: "Abnegaciju", optionC: "Prijateljstvo", optionD: "Neustrašivost (Dauntless)", correctAnswer: "d" },
    ],
  },
  {
    bookId: "934dd0f4-ccab-49d5-a00d-b178a31757d7",
    title: "Kviz: Djevojčica iz Afganistana",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Khaled Hosseini", optionB: "Deborah Ellis", optionC: "Malala Yousafzai", optionD: "Nadia Murad", correctAnswer: "b" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Malala", optionB: "Parvana", optionC: "Aisha", optionD: "Fatima", correctAnswer: "b" },
      { questionText: "Zašto se Parvana pretvara da je dječak?", optionA: "Jer voli to", optionB: "Da bi mogla raditi i hraniti porodicu", optionC: "Da bi išla u školu", optionD: "Da bi se igrala", correctAnswer: "b" },
      { questionText: "U kojem periodu se odvija priča?", optionA: "U doba mira", optionB: "Za vrijeme vladavine talibana", optionC: "U budućnosti", optionD: "U prošlom vijeku", correctAnswer: "b" },
      { questionText: "Koja je glavna tema knjige?", optionA: "Putovanje", optionB: "Hrabrost i prava žena", optionC: "Sport", optionD: "Škola", correctAnswer: "b" },
    ],
  },
  {
    bookId: "86e5939a-59ff-44b8-a0d5-672086e496d3",
    title: "Kviz: Djevojčica s ibrikom",
    questions: [
      { questionText: "Ko je autor priče?", optionA: "Branko Ćopić", optionB: "Mato Lovrak", optionC: "Ivan Kušan", optionD: "Ahmet Hromadžić", correctAnswer: "a" },
      { questionText: "Šta djevojčica nosi u priči?", optionA: "Korpu", optionB: "Ibrik", optionC: "Torbu", optionD: "Kantu", correctAnswer: "b" },
      { questionText: "U kakvom okruženju se odvija priča?", optionA: "U gradu", optionB: "Na selu", optionC: "Na moru", optionD: "U šumi", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je priča namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
      { questionText: "Kakav ton ima ova priča?", optionA: "Strašan", optionB: "Topao i dječiji", optionC: "Tužan", optionD: "Sarkastičan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "6167c001-5298-460b-bf38-688cf4a6f772",
    title: "Kviz: Dječak na vrhu planine",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "John Boyne", optionB: "Markus Zusak", optionC: "Morris Gleitzman", optionD: "Michael Morpurgo", correctAnswer: "a" },
      { questionText: "U kojem periodu se odvija radnja?", optionA: "U sadašnjosti", optionB: "Za vrijeme Drugog svjetskog rata", optionC: "U budućnosti", optionD: "U srednjem vijeku", correctAnswer: "b" },
      { questionText: "Gdje dječak živi na početku priče?", optionA: "U gradu", optionB: "Na planini kod tetke", optionC: "U školi", optionD: "Na farmi", correctAnswer: "b" },
      { questionText: "Šta dječak otkriva o svojoj teti?", optionA: "Da je čarobnica", optionB: "Da skriva tajnu o ratu", optionC: "Da je kraljica", optionD: "Da je glumica", correctAnswer: "b" },
      { questionText: "Koja je glavna tema knjige?", optionA: "Avantura", optionB: "Hrabrost i moralne dileme u ratu", optionC: "Sport", optionD: "Putovanje", correctAnswer: "b" },
    ],
  },
  {
    bookId: "aff10a34-af76-4873-bbf9-98d1eb4e1a06",
    title: "Kviz: Dječak u prugastoj pidžami",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "John Boyne", optionB: "Markus Zusak", optionC: "Morris Gleitzman", optionD: "R.J. Palacio", correctAnswer: "a" },
      { questionText: "Kako se zove glavni junak?", optionA: "Hans", optionB: "Fritz", optionC: "Bruno", optionD: "Karl", correctAnswer: "c" },
      { questionText: "Kuda se Brunova porodica seli?", optionA: "U London", optionB: "Blizu koncentracionog logora", optionC: "Na selo", optionD: "U Ameriku", correctAnswer: "b" },
      { questionText: "S kim se Bruno sprijatelji?", optionA: "S komšijom", optionB: "S dječakom iza ograde - Shmuelom", optionC: "S učiteljem", optionD: "S vojnikom", correctAnswer: "b" },
      { questionText: "U kom periodu se odvija radnja?", optionA: "Prvi svjetski rat", optionB: "Drugi svjetski rat / Holokaust", optionC: "Hladni rat", optionD: "Sadašnjost", correctAnswer: "b" },
    ],
  },
  {
    bookId: "d0f04e86-aad1-4aab-af58-b33003b49674",
    title: "Kviz: Dnevnik Ane Frank",
    questions: [
      { questionText: "Ko je napisala dnevnik?", optionA: "Ana Frank", optionB: "Anne Brontë", optionC: "Anne Shirley", optionD: "Anna Karenina", correctAnswer: "a" },
      { questionText: "Zašto se Ana skrivala?", optionA: "Igrala je igru", optionB: "Bježala je od škole", optionC: "Bila je Židovka za vrijeme nacističke okupacije", optionD: "Bila je špijun", correctAnswer: "c" },
      { questionText: "Gdje se Ana skrivala?", optionA: "U podrumu", optionB: "U tajnom dijelu kuće (Achterhuis)", optionC: "U šumi", optionD: "U školi", correctAnswer: "b" },
      { questionText: "Kako je Ana nazvala svoj dnevnik?", optionA: "Moj prijatelju", optionB: "Dragi dnevniče", optionC: "Kitty", optionD: "Diary", correctAnswer: "c" },
      { questionText: "U kojem gradu se Ana skrivala?", optionA: "Berlin", optionB: "Pariz", optionC: "Amsterdam", optionD: "London", correctAnswer: "c" },
    ],
  },
  {
    bookId: "dc27516c-e2da-4640-9185-6a436f3f5b38",
    title: "Kviz: Dnevnik Nikki",
    questions: [
      { questionText: "Ko je autor serijala 'Dnevnik Nikki'?", optionA: "Jeff Kinney", optionB: "Rachel Renée Russell", optionC: "Roald Dahl", optionD: "Judy Blume", correctAnswer: "b" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Nikki Maxwell", optionB: "Nikki Brown", optionC: "Nikki Smith", optionD: "Nikki Jones", correctAnswer: "a" },
      { questionText: "U kakvom formatu je knjiga?", optionA: "Roman", optionB: "Dnevnik s ilustracijama", optionC: "Strip", optionD: "Enciklopedija", correctAnswer: "b" },
      { questionText: "O čemu govori knjiga?", optionA: "O avanturama u šumi", optionB: "O životu u školi i odrastanju", optionC: "O putovanjima", optionD: "O životinjama", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
    ],
  },
  {
    bookId: "9b33fba0-e82e-41eb-98c5-4fa0c881273e",
    title: "Kviz: Dnevnik šonjavca",
    questions: [
      { questionText: "Ko je autor serijala 'Dnevnik šonjavca'?", optionA: "Jeff Kinney", optionB: "Roald Dahl", optionC: "R.L. Stine", optionD: "Rick Riordan", correctAnswer: "a" },
      { questionText: "Kako se zove glavni junak?", optionA: "Greg Heffley", optionB: "Tom Sawyer", optionC: "Charlie Bucket", optionD: "Neville", correctAnswer: "a" },
      { questionText: "Ko je Gregov najbolji prijatelj?", optionA: "Fregley", optionB: "Rowley Jefferson", optionC: "Manny", optionD: "Rodrick", correctAnswer: "b" },
      { questionText: "U kakvom formatu je knjiga?", optionA: "Roman", optionB: "Dnevnik sa strip-crtežima", optionC: "Poezija", optionD: "Drama", correctAnswer: "b" },
      { questionText: "Koji je Gregov najveći problem u školi?", optionA: "Loše ocjene", optionB: "Preživjeti srednju školu i biti popularan", optionC: "Strogi učitelji", optionD: "Previše domaćih zadataka", correctAnswer: "b" },
    ],
  },
  {
    bookId: "b0d9ca73-ba01-4884-8b09-dd957f9c8165",
    title: "Kviz: Doktor Dolittle",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Roald Dahl", optionB: "Hugh Lofting", optionC: "Rudyard Kipling", optionD: "Enid Blyton", correctAnswer: "b" },
      { questionText: "Šta doktor Dolittle može da radi?", optionA: "Leti", optionB: "Razgovara sa životinjama", optionC: "Nestane", optionD: "Čita misli", correctAnswer: "b" },
      { questionText: "Ko nauči doktora da govori sa životinjama?", optionA: "Mačka", optionB: "Pas", optionC: "Papagaj Polynesia", optionD: "Majmun", correctAnswer: "c" },
      { questionText: "Koje je doktorovo pravo zanimanje?", optionA: "Veterinar", optionB: "Liječnik za ljude koji postaje veterinar", optionC: "Učitelj", optionD: "Naučnik", correctAnswer: "b" },
      { questionText: "Kuda doktor putuje da pomogne životinjama?", optionA: "U Ameriku", optionB: "U Afriku", optionC: "U Aziju", optionD: "U Australiju", correctAnswer: "b" },
    ],
  },
  {
    bookId: "015c6f97-d1bc-4123-8546-67646c8c7120",
    title: "Kviz: Drakula",
    questions: [
      { questionText: "Ko je autor romana 'Drakula'?", optionA: "Mary Shelley", optionB: "Bram Stoker", optionC: "Edgar Allan Poe", optionD: "H. P. Lovecraft", correctAnswer: "b" },
      { questionText: "Gdje živi grof Drakula?", optionA: "U Engleskoj", optionB: "U Francuskoj", optionC: "U Transilvaniji", optionD: "U Italiji", correctAnswer: "c" },
      { questionText: "Ko dolazi u posjetu Drakuli na početku romana?", optionA: "Van Helsing", optionB: "Jonathan Harker", optionC: "Mina Murray", optionD: "Lucy Westenra", correctAnswer: "b" },
      { questionText: "Ko vodi borbu protiv Drakule?", optionA: "Sherlock Holmes", optionB: "Profesor Van Helsing", optionC: "Inspektor Lestrade", optionD: "Doktor Watson", correctAnswer: "b" },
      { questionText: "Šta je Drakula?", optionA: "Vukodlak", optionB: "Duh", optionC: "Vampir", optionD: "Čarobnjak", correctAnswer: "c" },
    ],
  },
  {
    bookId: "ca326eaa-1bb2-448d-8ac6-d9ff1cea747f",
    title: "Kviz: Družba Pere Kvržice",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Mato Lovrak", optionB: "Branko Ćopić", optionC: "Ivan Kušan", optionD: "Ivana Brlić-Mažuranić", correctAnswer: "a" },
      { questionText: "Ko je vođa družbe?", optionA: "Pero Kvržica", optionB: "Marko", optionC: "Ivan", optionD: "Stipe", correctAnswer: "a" },
      { questionText: "Šta družba odluči uraditi?", optionA: "Ići na izlet", optionB: "Popraviti staru vodenicu (mlin)", optionC: "Igrati nogomet", optionD: "Sagraditi kuću", correctAnswer: "b" },
      { questionText: "Kakav je Pero Kvržica?", optionA: "Stidljiv i tih", optionB: "Hrabar i snalažljiv vođa", optionC: "Zločest", optionD: "Lijen", correctAnswer: "b" },
      { questionText: "Koja je glavna tema knjige?", optionA: "Ljubav", optionB: "Prijateljstvo, zajedništvo i rad", optionC: "Rat", optionD: "Putovanje", correctAnswer: "b" },
    ],
  },
  {
    bookId: "cf4f237a-a6b4-4f52-816b-7fd00622d9c0",
    title: "Kviz: Duh u močvari",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Ivan Kušan", optionB: "Ante Gardaš", optionC: "Milivoj Matošec", optionD: "Mato Lovrak", correctAnswer: "b" },
      { questionText: "Kakav žanr je ova knjiga?", optionA: "Ljubavni roman", optionB: "Avanturistički / mystery", optionC: "Biografija", optionD: "Poezija", correctAnswer: "b" },
      { questionText: "Gdje se odvija radnja?", optionA: "U gradu", optionB: "U šumi blizu močvare", optionC: "Na moru", optionD: "U planini", correctAnswer: "b" },
      { questionText: "Šta djeca istražuju u priči?", optionA: "Stari zamak", optionB: "Tajnu duha u močvari", optionC: "Podzemne tunele", optionD: "Otok", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
    ],
  },
  {
    bookId: "94f8b28a-78f5-4f9a-b17d-6b63a3c0c522",
    title: "Kviz: Eleanor i Park",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "John Green", optionB: "Rainbow Rowell", optionC: "Jenny Han", optionD: "Nicola Yoon", correctAnswer: "b" },
      { questionText: "Gdje se Eleanor i Park prvi put upoznaju?", optionA: "U školi", optionB: "U školskom autobusu", optionC: "U parku", optionD: "Na zabavi", correctAnswer: "b" },
      { questionText: "Šta Eleanor i Park prvo dijele?", optionA: "Hranu", optionB: "Stripove i muziku", optionC: "Knjige", optionD: "Igrice", correctAnswer: "b" },
      { questionText: "Kakav život Eleanor ima kod kuće?", optionA: "Sretan", optionB: "Težak, s nasilnim očuhom", optionC: "Bogat", optionD: "Normalan", correctAnswer: "b" },
      { questionText: "Koja je glavna tema knjige?", optionA: "Avantura", optionB: "Prva ljubav i prihvatanje razlika", optionC: "Škola", optionD: "Putovanje", correctAnswer: "b" },
    ],
  },
  {
    bookId: "9b1a3641-d87d-4355-8ff6-cf726e37ffaf",
    title: "Kviz: Emil i detektivi",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Erich Kästner", optionB: "Astrid Lindgren", optionC: "Roald Dahl", optionD: "Enid Blyton", correctAnswer: "a" },
      { questionText: "Šta se desi Emilu u vozu?", optionA: "Izgubi se", optionB: "Ukradu mu novac", optionC: "Zaspi i promijeni voz", optionD: "Upozna prijatelja", correctAnswer: "b" },
      { questionText: "Kako Emil pokušava uhvatiti lopova?", optionA: "Sam", optionB: "Uz pomoć policije", optionC: "Uz pomoć grupe djece - detektiva", optionD: "Uz pomoć roditelja", correctAnswer: "c" },
      { questionText: "U kojem gradu se odvija avantura?", optionA: "Minhenu", optionB: "Berlinu", optionC: "Beču", optionD: "Hamburgu", correctAnswer: "b" },
      { questionText: "Koja je pouka priče?", optionA: "Ne treba putovati", optionB: "Zajedništvo i hrabrost pobjeđuju", optionC: "Treba izbjegavati ljude", optionD: "Novac nije važan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "ba14904a-a7e5-41fc-9b42-600b20bf991c",
    title: "Kviz: Eragon",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Christopher Paolini", optionB: "J.R.R. Tolkien", optionC: "Rick Riordan", optionD: "Philip Pullman", correctAnswer: "a" },
      { questionText: "Šta Eragon pronađe u šumi?", optionA: "Mač", optionB: "Zmajevo jaje", optionC: "Blago", optionD: "Knjigu čarolija", correctAnswer: "b" },
      { questionText: "Kako se zove Eragonov zmaj?", optionA: "Smaug", optionB: "Toothless", optionC: "Saphira", optionD: "Draco", correctAnswer: "c" },
      { questionText: "Šta Eragon postaje?", optionA: "Kralj", optionB: "Zmajski jahač", optionC: "Čarobnjak", optionD: "Vojnik", correctAnswer: "b" },
      { questionText: "Kako se zove zli kralj u knjizi?", optionA: "Sauron", optionB: "Galbatorix", optionC: "Voldemort", optionD: "Saruman", correctAnswer: "b" },
    ],
  },
  {
    bookId: "53f5e7d9-7e89-4d49-84ba-d1677c81c435",
    title: "Kviz: Fahrenheit 451",
    questions: [
      { questionText: "Ko je autor romana?", optionA: "George Orwell", optionB: "Aldous Huxley", optionC: "Ray Bradbury", optionD: "Isaac Asimov", correctAnswer: "c" },
      { questionText: "Šta predstavlja broj 451 u naslovu?", optionA: "Broj kuće", optionB: "Temperaturu na kojoj papir gori", optionC: "Godinu", optionD: "Broj stranica", correctAnswer: "b" },
      { questionText: "Čime se bavi glavni junak Guy Montag?", optionA: "Piše knjige", optionB: "Spašava knjige", optionC: "Spaljuje knjige", optionD: "Prodaje knjige", correctAnswer: "c" },
      { questionText: "Šta je zabranjeno u društvu iz romana?", optionA: "Muzika", optionB: "Čitanje knjiga", optionC: "Putovanje", optionD: "Razgovor", correctAnswer: "b" },
      { questionText: "Šta Montag shvati tokom priče?", optionA: "Da voli svoj posao", optionB: "Da su knjige važne i da ih treba sačuvati", optionC: "Da treba bježati iz grada", optionD: "Da treba biti vatrogasac", correctAnswer: "b" },
    ],
  },
  {
    bookId: "ad07923b-bcf6-42d6-8b10-386e92b21999",
    title: "Kviz: Frankenstein",
    questions: [
      { questionText: "Ko je autor romana?", optionA: "Bram Stoker", optionB: "Mary Shelley", optionC: "Edgar Allan Poe", optionD: "H. G. Wells", correctAnswer: "b" },
      { questionText: "Ko je Victor Frankenstein?", optionA: "Čudovište", optionB: "Naučnik koji stvara čudovište", optionC: "Detektiv", optionD: "Liječnik", correctAnswer: "b" },
      { questionText: "Od čega Victor stvara svoje stvorenje?", optionA: "Od gline", optionB: "Od dijelova mrtvih tijela", optionC: "Od metala", optionD: "Od drveta", correctAnswer: "b" },
      { questionText: "Šta čudovište želi od svog stvoritelja?", optionA: "Zlato", optionB: "Moć", optionC: "Prihvatanje i društvo", optionD: "Slobodu", correctAnswer: "c" },
      { questionText: "Koja je glavna tema romana?", optionA: "Ljubav", optionB: "Opasnost nekontrolisane nauke i odgovornost", optionC: "Putovanje", optionD: "Prijateljstvo", correctAnswer: "b" },
    ],
  },
  {
    bookId: "c7369cf4-ded7-4216-b51a-de47b46e5ba9",
    title: "Kviz: Gonič zmajeva",
    questions: [
      { questionText: "Ko je autor romana?", optionA: "Khaled Hosseini", optionB: "Orhan Pamuk", optionC: "Salman Rushdie", optionD: "Ivo Andrić", correctAnswer: "a" },
      { questionText: "U kojoj zemlji se odvija radnja?", optionA: "Iran", optionB: "Irak", optionC: "Afganistan", optionD: "Pakistan", correctAnswer: "c" },
      { questionText: "Kako se zove glavni junak?", optionA: "Hassan", optionB: "Amir", optionC: "Sohrab", optionD: "Ali", correctAnswer: "b" },
      { questionText: "Šta je 'gonjenje zmajeva' u knjizi?", optionA: "Lov na zmajeve", optionB: "Takmičenje u puštanju zmajeva od papira", optionC: "Igra na kompjuteru", optionD: "Narodna priča", correctAnswer: "b" },
      { questionText: "Ko je Hassan za Amira?", optionA: "Brat", optionB: "Učitelj", optionC: "Sluga i najbolji prijatelj", optionD: "Neprijatelj", correctAnswer: "c" },
    ],
  },
  {
    bookId: "ed33d8c8-ac8a-4aed-876d-333991bc6d4b",
    title: "Kviz: Gospodar muha",
    questions: [
      { questionText: "Ko je autor romana?", optionA: "George Orwell", optionB: "William Golding", optionC: "Aldous Huxley", optionD: "Joseph Conrad", correctAnswer: "b" },
      { questionText: "Šta se desi dječacima na početku?", optionA: "Odu na izlet", optionB: "Nasukaju se na pustom ostrvu", optionC: "Izgube se u šumi", optionD: "Bježe iz škole", correctAnswer: "b" },
      { questionText: "Ko postaje vođa na početku?", optionA: "Jack", optionB: "Roger", optionC: "Ralph", optionD: "Simon", correctAnswer: "c" },
      { questionText: "Šta predstavlja 'Gospodar muha'?", optionA: "Insekt", optionB: "Svinjsku glavu na kolcu - simbol zla", optionC: "Kralja", optionD: "Brod", correctAnswer: "b" },
      { questionText: "Koja je glavna tema romana?", optionA: "Prijateljstvo", optionB: "Ljudska priroda i sklonost ka nasilju", optionC: "Preživljavanje u prirodi", optionD: "Ljubav", correctAnswer: "b" },
    ],
  },
  {
    bookId: "6eb6b58b-2d07-4b19-95e6-d4b622406242",
    title: "Kviz: Gospodar prstenova",
    questions: [
      { questionText: "Ko je autor?", optionA: "C.S. Lewis", optionB: "J.R.R. Tolkien", optionC: "George R.R. Martin", optionD: "Terry Pratchett", correctAnswer: "b" },
      { questionText: "Kako se zove hobit koji nosi Prsten?", optionA: "Bilbo", optionB: "Sam", optionC: "Frodo", optionD: "Pippin", correctAnswer: "c" },
      { questionText: "Šta treba uraditi s Prstenom?", optionA: "Sakriti ga", optionB: "Uništiti ga u vatri Planine sudbine", optionC: "Dati ga Gandalfu", optionD: "Prodati ga", correctAnswer: "b" },
      { questionText: "Ko je Gandalf?", optionA: "Vilenjak", optionB: "Čarobnjak", optionC: "Hobit", optionD: "Patuljak", correctAnswer: "b" },
      { questionText: "Kako se zove mračni gospodar koji želi Prsten?", optionA: "Saruman", optionB: "Gollum", optionC: "Sauron", optionD: "Morgoth", correctAnswer: "c" },
    ],
  },
  {
    bookId: "a17242de-a971-42c2-92c0-57c2f798e3fd",
    title: "Kviz: Gregov dnevnik",
    questions: [
      { questionText: "Ko je autor serijala?", optionA: "Jeff Kinney", optionB: "Roald Dahl", optionC: "R.L. Stine", optionD: "Rick Riordan", correctAnswer: "a" },
      { questionText: "Kako se zove glavni junak?", optionA: "Greg Smith", optionB: "Greg Heffley", optionC: "Greg Wilson", optionD: "Greg Brown", correctAnswer: "b" },
      { questionText: "U kakvom formatu je knjiga napisana?", optionA: "Klasični roman", optionB: "Dnevnik sa ilustracijama", optionC: "Strip", optionD: "Enciklopedija", correctAnswer: "b" },
      { questionText: "Ko je Gregov stariji brat?", optionA: "Manny", optionB: "Rodrick", optionC: "Frank", optionD: "Rowley", correctAnswer: "b" },
      { questionText: "Šta Greg pokušava u školi?", optionA: "Biti najbolji učenik", optionB: "Preživjeti i postati popularan", optionC: "Pobjeći iz škole", optionD: "Postati sportaš", correctAnswer: "b" },
    ],
  },
  {
    bookId: "10eace79-699b-4ce8-a5f3-566110ab3b55",
    title: "Kviz: Grimizna kraljica",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Leigh Bardugo", optionB: "Victoria Aveyard", optionC: "Sarah J. Maas", optionD: "Veronica Roth", correctAnswer: "b" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Celaena", optionB: "Mare Barrow", optionC: "Tris", optionD: "Katniss", correctAnswer: "b" },
      { questionText: "Kako je društvo podijeljeno u knjizi?", optionA: "Po godinama", optionB: "Po boji krvi - Srebrni i Crveni", optionC: "Po zanimanju", optionD: "Po visini", correctAnswer: "b" },
      { questionText: "Šta otkriva Mare o sebi?", optionA: "Da je princeza", optionB: "Da ima moći iako je Crvena", optionC: "Da je robot", optionD: "Da može letjeti", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Komedija", optionB: "Distopija / fantasy", optionC: "Biografija", optionD: "Historijski roman", correctAnswer: "b" },
    ],
  },
  {
    bookId: "89e7e9fc-eb00-4bec-8ce4-737cf09ea722",
    title: "Kviz: Grimizni dvorac",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Orhan Pamuk", optionB: "Ivo Andrić", optionC: "Meša Selimović", optionD: "Khaled Hosseini", correctAnswer: "a" },
      { questionText: "Gdje se odvija radnja romana?", optionA: "U Bosni", optionB: "U Turskoj", optionC: "U Iranu", optionD: "U Egiptu", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Beletristika / historijski roman", optionC: "Naučna fantastika", optionD: "Kriminalistički roman", correctAnswer: "b" },
      { questionText: "Da li je Orhan Pamuk dobitnik Nobelove nagrade?", optionA: "Da", optionB: "Ne", optionC: "Nominiran je ali nije dobio", optionD: "Dobio je Pulitzerovu nagradu", correctAnswer: "a" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "d" },
    ],
  },
  {
    bookId: "94d9f2e0-e260-4217-9f31-3873d6e5be9a",
    title: "Kviz: Grozni Grga",
    questions: [
      { questionText: "Ko je autor serijala?", optionA: "Roald Dahl", optionB: "Francesca Simon", optionC: "Jeff Kinney", optionD: "Enid Blyton", correctAnswer: "b" },
      { questionText: "Kakav je Grozni Grga?", optionA: "Miran i poslušan", optionB: "Nestašan i tvrdoglav", optionC: "Tih i stidljiv", optionD: "Marljiv i vrijedan", correctAnswer: "b" },
      { questionText: "Ko je Grgin brat?", optionA: "Savršeni Petar", optionB: "Pametni Marko", optionC: "Dobri Ivan", optionD: "Mirni Luka", correctAnswer: "a" },
      { questionText: "Kakav je odnos između braće?", optionA: "Jako se slažu", optionB: "Suprotstavljeni su - Grga je nestašan, Petar savršen", optionC: "Ne poznaju se", optionD: "Blizanci su", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
    ],
  },
  {
    bookId: "6789b8df-bbc7-4961-b178-550dce1d53dd",
    title: "Kviz: Grozni Grga i prokleto prokleto prvenstvo",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Francesca Simon", optionB: "Roald Dahl", optionC: "Jeff Kinney", optionD: "David Walliams", correctAnswer: "a" },
      { questionText: "O čemu se radi u ovom dijelu serijala?", optionA: "O školi", optionB: "O takmičenju / prvenstvu", optionC: "O putovanju", optionD: "O rođendanu", correctAnswer: "b" },
      { questionText: "Kakav je Grga na takmičenju?", optionA: "Fer i pošten", optionB: "Nestašan i pokušava varati", optionC: "Dosadan", optionD: "Plačljiv", correctAnswer: "b" },
      { questionText: "Ko je Grgin rival?", optionA: "Savršeni Petar", optionB: "Učiteljica", optionC: "Mama", optionD: "Susjed", correctAnswer: "a" },
      { questionText: "Koja je pouka priče?", optionA: "Pobjeđivanje je najvažnije", optionB: "Važno je učestvovati i biti fer", optionC: "Treba varati", optionD: "Treba biti savršen", correctAnswer: "b" },
    ],
  },
  {
    bookId: "feaaf570-a50e-4867-8caa-2c1bdf86e8f6",
    title: "Kviz: Gulliverova putovanja",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Daniel Defoe", optionB: "Jonathan Swift", optionC: "Jules Verne", optionD: "Mark Twain", correctAnswer: "b" },
      { questionText: "Kako se zovu sitni ljudi koje Gulliver posjeti?", optionA: "Patuljci", optionB: "Liliputanci", optionC: "Hobiti", optionD: "Vilenjaci", correctAnswer: "b" },
      { questionText: "Kako se zove zemlja divova?", optionA: "Gigantija", optionB: "Brobdingnag", optionC: "Narnija", optionD: "Gondor", correctAnswer: "b" },
      { questionText: "Čime se Gulliver bavi?", optionA: "Učitelj je", optionB: "Brodski liječnik", optionC: "Vojnik", optionD: "Pomorac", correctAnswer: "b" },
      { questionText: "Šta je knjiga zapravo?", optionA: "Prosta avantura", optionB: "Satira na ljudsko društvo", optionC: "Biografija", optionD: "Udžbenik geografije", correctAnswer: "b" },
    ],
  },
  {
    bookId: "72691bc2-7f6d-4de8-9acc-9f60998187a6",
    title: "Kviz: Hajduci",
    questions: [
      { questionText: "Ko je autor drame 'Hajduci'?", optionA: "Branislav Nušić", optionB: "Branko Ćopić", optionC: "Ivo Andrić", optionD: "Petar Kočić", correctAnswer: "a" },
      { questionText: "Kakva je ova knjiga po žanru?", optionA: "Roman", optionB: "Komedija / drama", optionC: "Poezija", optionD: "Bajka", correctAnswer: "b" },
      { questionText: "O čemu govori djelo?", optionA: "O pravim hajducima", optionB: "O dječijoj igri i mašti", optionC: "O ratu", optionD: "O putovanju", correctAnswer: "b" },
      { questionText: "Kakvi su likovi u djelu?", optionA: "Ozbiljni", optionB: "Komični i zabavni", optionC: "Tužni", optionD: "Strašni", correctAnswer: "b" },
      { questionText: "Ko je Branislav Nušić?", optionA: "Pjesnik", optionB: "Srpski komediograf i dramatičar", optionC: "Romanopisac", optionD: "Slikar", correctAnswer: "b" },
    ],
  },
  {
    bookId: "53c6b3f1-77e0-4d74-b95d-f7d1f811a8f8",
    title: "Kviz: Harry Potter",
    questions: [
      { questionText: "Ko je autor serijala Harry Potter?", optionA: "C.S. Lewis", optionB: "J.K. Rowling", optionC: "J.R.R. Tolkien", optionD: "Rick Riordan", correctAnswer: "b" },
      { questionText: "Kako se zove škola čarobnjaštva?", optionA: "Beauxbatons", optionB: "Durmstrang", optionC: "Hogwarts", optionD: "Ilvermorny", correctAnswer: "c" },
      { questionText: "Koji je Harryjev dom u školi?", optionA: "Slytherin", optionB: "Ravenclaw", optionC: "Hufflepuff", optionD: "Gryffindor", correctAnswer: "d" },
      { questionText: "Ko je glavni negativac?", optionA: "Draco Malfoy", optionB: "Severus Snape", optionC: "Lord Voldemort", optionD: "Bellatrix", correctAnswer: "c" },
      { questionText: "Ko su Harrijevi najbolji prijatelji?", optionA: "Neville i Luna", optionB: "Ron i Hermiona", optionC: "Fred i George", optionD: "Draco i Goyle", correctAnswer: "b" },
    ],
  },
  {
    bookId: "83ce7c29-e1ba-4fe1-bcec-28ae9338f27b",
    title: "Kviz: Heidi",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Johanna Spyri", optionB: "Astrid Lindgren", optionC: "Enid Blyton", optionD: "Frances Hodgson Burnett", correctAnswer: "a" },
      { questionText: "Gdje Heidi živi sa djedom?", optionA: "Na moru", optionB: "U gradu", optionC: "Na Alpama / u planini", optionD: "U šumi", correctAnswer: "c" },
      { questionText: "S kim se Heidi sprijatelji u planini?", optionA: "Sa lovcem", optionB: "Sa Peterom pastirom", optionC: "Sa učiteljem", optionD: "Sa medvjedom", correctAnswer: "b" },
      { questionText: "Kuda Heidi bude poslana?", optionA: "U školu na selu", optionB: "U grad Frankfurt kod bogate porodice", optionC: "Na more", optionD: "U drugu zemlju", correctAnswer: "b" },
      { questionText: "Šta Heidi najviše nedostaje u gradu?", optionA: "Hrana", optionB: "Planine, djed i sloboda", optionC: "Škola", optionD: "Igračke", correctAnswer: "b" },
    ],
  },
  {
    bookId: "3d11fce3-7964-4ea7-aec5-e7b092893754",
    title: "Kviz: Hiljadu čudesnih sunaca",
    questions: [
      { questionText: "Ko je autor romana?", optionA: "Orhan Pamuk", optionB: "Khaled Hosseini", optionC: "Salman Rushdie", optionD: "Ivo Andrić", correctAnswer: "b" },
      { questionText: "U kojoj zemlji se odvija radnja?", optionA: "Iran", optionB: "Irak", optionC: "Afganistan", optionD: "Pakistan", correctAnswer: "c" },
      { questionText: "Kako se zovu dvije glavne junakinje?", optionA: "Ana i Marija", optionB: "Mariam i Laila", optionC: "Fatima i Aisha", optionD: "Sara i Hana", correctAnswer: "b" },
      { questionText: "Šta povezuje Mariam i Lailu?", optionA: "Sestrinstvo", optionB: "Dijele istog muža", optionC: "Škola", optionD: "Posao", correctAnswer: "b" },
      { questionText: "Koja je glavna tema romana?", optionA: "Putovanje", optionB: "Snaga žena u teškim okolnostima", optionC: "Sport", optionD: "Politika", correctAnswer: "b" },
    ],
  },
  {
    bookId: "40bfd6c5-58a2-4063-bbf4-1bad7b1ca351",
    title: "Kviz: Hobit",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "C.S. Lewis", optionB: "J.R.R. Tolkien", optionC: "George R.R. Martin", optionD: "Terry Pratchett", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Frodo Baggins", optionB: "Bilbo Baggins", optionC: "Sam Gamgee", optionD: "Aragorn", correctAnswer: "b" },
      { questionText: "Ko pozove Bilba na avanturu?", optionA: "Elrond", optionB: "Gandalf", optionC: "Thorin", optionD: "Sauron", correctAnswer: "b" },
      { questionText: "Koji je cilj putovanja?", optionA: "Uništiti prsten", optionB: "Vratiti blago od zmaja Smauga", optionC: "Pronaći čarobni mač", optionD: "Spasiti princeze", correctAnswer: "b" },
      { questionText: "Šta Bilbo pronađe u pećini?", optionA: "Blago", optionB: "Čarobni prsten", optionC: "Mač", optionD: "Mapu", correctAnswer: "b" },
    ],
  },
  {
    bookId: "8eb55b58-da45-4c43-a12e-1c8304d8a921",
    title: "Kviz: Igra anđela",
    questions: [
      { questionText: "Ko je autor romana?", optionA: "Carlos Ruiz Zafón", optionB: "Gabriel García Márquez", optionC: "Paulo Coelho", optionD: "Isabel Allende", correctAnswer: "a" },
      { questionText: "U kojem gradu se odvija radnja?", optionA: "Madrid", optionB: "Barcelona", optionC: "Rim", optionD: "Pariz", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Daniel Sempere", optionB: "David Martín", optionC: "Carlos", optionD: "Fernando", correctAnswer: "b" },
      { questionText: "Čime se David bavi?", optionA: "Slikarstvom", optionB: "Pisanjem", optionC: "Muzikom", optionD: "Glumom", correctAnswer: "b" },
      { questionText: "Koji je žanr ove knjige?", optionA: "Komedija", optionB: "Gothički misterij", optionC: "Biografija", optionD: "Naučna fantastika", correctAnswer: "b" },
    ],
  },
  {
    bookId: "8813b1ef-a078-416f-a332-2afb21d36325",
    title: "Kviz: Igre gladi",
    questions: [
      { questionText: "Ko je autor serijala?", optionA: "Veronica Roth", optionB: "Suzanne Collins", optionC: "James Dashner", optionD: "Rick Riordan", correctAnswer: "b" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Tris", optionB: "Mare", optionC: "Katniss Everdeen", optionD: "Clary", correctAnswer: "c" },
      { questionText: "Šta su 'Igre gladi'?", optionA: "Kulinarski show", optionB: "Takmičenje na smrt između djece iz distrikata", optionC: "Sportsko takmičenje", optionD: "Video igra", correctAnswer: "b" },
      { questionText: "Kako se zove zemlja u kojoj se odvija radnja?", optionA: "Utopija", optionB: "Distopija", optionC: "Panem", optionD: "Galaksija", correctAnswer: "c" },
      { questionText: "Za koga se Katniss dobrovoljno prijavi?", optionA: "Za sebe", optionB: "Za svoju sestru Prim", optionC: "Za majku", optionD: "Za prijateljicu", correctAnswer: "b" },
    ],
  },
  {
    bookId: "759a00bd-a4dd-4b42-a5bd-563cc0b2d55c",
    title: "Kviz: Izabrane pripovijetke",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ivo Andrić", optionB: "Ćamil Sijarić", optionC: "Isak Samokovlija", optionD: "Meša Selimović", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Roman", optionB: "Zbirka pripovijedaka", optionC: "Drama", optionD: "Poezija", correctAnswer: "b" },
      { questionText: "O čemu najčešće govore Sijarićeve pripovijetke?", optionA: "O gradu", optionB: "O životu u Bosni, prirodi i ljudima", optionC: "O putovanjima", optionD: "O tehnologiji", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je djelo namijenjeno?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "c" },
      { questionText: "Kakav stil pisanja ima Sijarić?", optionA: "Moderan i urbani", optionB: "Lirski i poetičan", optionC: "Komičan", optionD: "Naučni", correctAnswer: "b" },
    ],
  },
  {
    bookId: "61a240d4-9383-4ca6-a52c-bc395ccec439",
    title: "Kviz: Jantarni dalekozor",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "C.S. Lewis", optionB: "Philip Pullman", optionC: "J.R.R. Tolkien", optionD: "Ursula K. Le Guin", correctAnswer: "b" },
      { questionText: "Koji je ovo dio trilogije 'His Dark Materials'?", optionA: "Prvi", optionB: "Drugi", optionC: "Treći", optionD: "Četvrti", correctAnswer: "c" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Lucy", optionB: "Lyra", optionC: "Tris", optionD: "Hermiona", correctAnswer: "b" },
      { questionText: "Šta je 'jantarni dalekozor' u knjizi?", optionA: "Čarobni predmet za gledanje čestica Prašine", optionB: "Teleskop", optionC: "Dragulj", optionD: "Kompas", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Komedija", optionB: "Fantasy", optionC: "Biografija", optionD: "Historijski roman", correctAnswer: "b" },
    ],
  },
  {
    bookId: "0d20e0eb-0257-4148-b588-b0abd827fe74",
    title: "Kviz: Jazavac pred sudom",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ivo Andrić", optionB: "Petar Kočić", optionC: "Branislav Nušić", optionD: "Meša Selimović", correctAnswer: "b" },
      { questionText: "Ko je David Štrbac?", optionA: "Sudija", optionB: "Seljak koji tuži jazavca", optionC: "Učitelj", optionD: "Vojnik", correctAnswer: "b" },
      { questionText: "Zašto David tuži jazavca?", optionA: "Jer ga je ugrizao", optionB: "Jer mu je uništio usjeve", optionC: "Jer je bučan", optionD: "Jer je opasan", correctAnswer: "b" },
      { questionText: "Šta djelo zapravo kritikuje?", optionA: "Životinje", optionB: "Austrougarsku birokratiju i vlast", optionC: "Školu", optionD: "Porodicu", correctAnswer: "b" },
      { questionText: "Koji je žanr djela?", optionA: "Poezija", optionB: "Satirična pripovijetka", optionC: "Roman", optionD: "Bajka", correctAnswer: "b" },
    ],
  },
  {
    bookId: "830f4d51-91de-4e44-9920-c67f56e3d5b9",
    title: "Kviz: Kako izdresirati zmaja",
    questions: [
      { questionText: "Ko je autor serijala?", optionA: "Christopher Paolini", optionB: "Cressida Cowell", optionC: "Rick Riordan", optionD: "J.K. Rowling", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Eragon", optionB: "Hiccup (Štucko)", optionC: "Toothless", optionD: "Draco", correctAnswer: "b" },
      { questionText: "Kako se zove Hiccupov zmaj?", optionA: "Saphira", optionB: "Smaug", optionC: "Toothless (Bezub)", optionD: "Norbert", correctAnswer: "c" },
      { questionText: "Čime se Vikingov sin mora dokazati?", optionA: "Lovom", optionB: "Dresiranjem zmaja", optionC: "Borbom", optionD: "Plivanjem", correctAnswer: "b" },
      { questionText: "Koja je pouka priče?", optionA: "Snaga je najvažnija", optionB: "Pamet i dobrota pobjeđuju grubost", optionC: "Treba biti grub", optionD: "Zmajevi su opasni", correctAnswer: "b" },
    ],
  },
  {
    bookId: "44cc7e7f-aa24-4a5d-9540-d60bcb10c7e3",
    title: "Kviz: Kameni spavač",
    questions: [
      { questionText: "Ko je autor zbirke?", optionA: "Ivo Andrić", optionB: "Mak Dizdar", optionC: "Meša Selimović", optionD: "Skender Kulenović", correctAnswer: "b" },
      { questionText: "O čemu govori 'Kameni spavač'?", optionA: "O modernom životu", optionB: "O bosanskim stećcima i srednjovjekovnoj Bosni", optionC: "O putovanjima", optionD: "O životinjama", correctAnswer: "b" },
      { questionText: "Šta su stećci?", optionA: "Zgrade", optionB: "Srednjovjekovni nadgrobni spomenici", optionC: "Mostovi", optionD: "Tvrđave", correctAnswer: "b" },
      { questionText: "Koji je žanr ovog djela?", optionA: "Roman", optionB: "Poezija", optionC: "Drama", optionD: "Bajka", correctAnswer: "b" },
      { questionText: "Koji narod je vezan za stećke?", optionA: "Rimljani", optionB: "Bogumili / srednjovjekovni Bosanci", optionC: "Osmanlije", optionD: "Austrijanci", correctAnswer: "b" },
    ],
  },
  {
    bookId: "7d6bc6ac-9a7a-4fcd-8c3c-bd696acaa1c8",
    title: "Kviz: Kapetan Gaćeša",
    questions: [
      { questionText: "Ko je autor serijala?", optionA: "Jeff Kinney", optionB: "Dav Pilkey", optionC: "Roald Dahl", optionD: "R.L. Stine", correctAnswer: "b" },
      { questionText: "Ko je Kapetan Gaćeša?", optionA: "Pravi superjunak", optionB: "Stripovski junak kojeg stvaraju dva dječaka", optionC: "Učitelj", optionD: "Pirat", correctAnswer: "b" },
      { questionText: "Kako se zovu dječaci koji ga stvaraju?", optionA: "Tom i Jerry", optionB: "George i Harold", optionC: "Fred i Barney", optionD: "Bill i Ted", correctAnswer: "b" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Ozbiljan", optionB: "Humorističan i šaljiv", optionC: "Strašan", optionD: "Tužan", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
    ],
  },
  {
    bookId: "2fce293e-b5c0-4d09-ae4e-542d097649b5",
    title: "Kviz: Kišni gubavac",
    questions: [
      { questionText: "Ko je autor?", optionA: "Alija Dubočanin", optionB: "Branko Ćopić", optionC: "Ahmet Hromadžić", optionD: "Mato Lovrak", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Fantasy", optionB: "Lektira", optionC: "Naučna fantastika", optionD: "Biografija", correctAnswer: "b" },
      { questionText: "Za koga je djelo namijenjeno?", optionA: "Mlađe osnovce", optionB: "Starije osnovce", optionC: "Omladinu", optionD: "Odrasle", correctAnswer: "b" },
      { questionText: "O čemu govori djelo?", optionA: "O životinjama", optionB: "O djetinjstvu i životu na selu", optionC: "O gradu", optionD: "O putovanju", correctAnswer: "b" },
      { questionText: "Kakav ton ima djelo?", optionA: "Komičan", optionB: "Topao i nostalgičan", optionC: "Strašan", optionD: "Satiričan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "1b61ba7b-e07f-4e35-9cdc-619ff9ea85da",
    title: "Kviz: Knjiga o groblju",
    questions: [
      { questionText: "Ko je autor?", optionA: "Neil Gaiman", optionB: "Philip Pullman", optionC: "Terry Pratchett", optionD: "Roald Dahl", correctAnswer: "a" },
      { questionText: "Gdje živi dječak Bod (Nobody)?", optionA: "U kući", optionB: "Na groblju, odgajan od duhova", optionC: "U šumi", optionD: "U školi", correctAnswer: "b" },
      { questionText: "Zašto Bod živi na groblju?", optionA: "Voli duhove", optionB: "Porodica mu je ubijena i duhovi ga usvoje", optionC: "Igra se", optionD: "Kažnjen je", correctAnswer: "b" },
      { questionText: "Ko štiti Boda na groblju?", optionA: "Policija", optionB: "Silas, njegov staratelj", optionC: "Roditelji", optionD: "Učitelj", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Komedija", optionB: "Gotička fantazija", optionC: "Biografija", optionD: "Naučna fantastika", correctAnswer: "b" },
    ],
  },
  {
    bookId: "666a2ca6-c05a-441c-bece-252bde3cecfc",
    title: "Kviz: Koko u Parizu",
    questions: [
      { questionText: "Ko je autor knjige?", optionA: "Ivan Kušan", optionB: "Mato Lovrak", optionC: "Ante Gardaš", optionD: "Milivoj Matošec", correctAnswer: "a" },
      { questionText: "Ko je Koko?", optionA: "Pas", optionB: "Dječak detektiv", optionC: "Mačak", optionD: "Robot", correctAnswer: "b" },
      { questionText: "Kuda Koko putuje u ovoj knjizi?", optionA: "U London", optionB: "U Pariz", optionC: "U Berlin", optionD: "U Rim", correctAnswer: "b" },
      { questionText: "Šta Koko radi u Parizu?", optionA: "Odmara se", optionB: "Istražuje misterij", optionC: "Uči francuski", optionD: "Gleda muzeje", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Ljubavni roman", optionB: "Dječiji kriminalistički / avanturistički roman", optionC: "Biografija", optionD: "Poezija", correctAnswer: "b" },
    ],
  },
  {
    bookId: "b0e07f97-95b2-41e0-9497-124957d1c120",
    title: "Kviz: Koralina",
    questions: [
      { questionText: "Ko je autor?", optionA: "Neil Gaiman", optionB: "Roald Dahl", optionC: "Philip Pullman", optionD: "C.S. Lewis", correctAnswer: "a" },
      { questionText: "Šta Koralina pronađe u svom novom domu?", optionA: "Blago", optionB: "Vrata koja vode u drugi svijet", optionC: "Duhove", optionD: "Tajni tunel", correctAnswer: "b" },
      { questionText: "Ko živi u drugom svijetu?", optionA: "Vilenjaci", optionB: "Druga mama s dugmićima umjesto očiju", optionC: "Roboti", optionD: "Životinje", correctAnswer: "b" },
      { questionText: "Šta 'Druga mama' želi od Koraline?", optionA: "Da joj pomogne", optionB: "Da Koralina ostane zauvijek i prihvati dugmiće za oči", optionC: "Da spava", optionD: "Da se igra", correctAnswer: "b" },
      { questionText: "Kako Koralina spašava sebe i roditelje?", optionA: "Bježi", optionB: "Hrabrošću i lukavošću", optionC: "Traži pomoć", optionD: "Čeka", correctAnswer: "b" },
    ],
  },
  {
    bookId: "b1bd9cbb-814b-40c4-a5b2-722b00a6c08a",
    title: "Kviz: Kradljivica knjiga",
    questions: [
      { questionText: "Ko je autor?", optionA: "John Boyne", optionB: "Markus Zusak", optionC: "Morris Gleitzman", optionD: "Michael Morpurgo", correctAnswer: "b" },
      { questionText: "Ko pripovijeda priču?", optionA: "Liesel", optionB: "Hans", optionC: "Smrt", optionD: "Max", correctAnswer: "c" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Ana", optionB: "Liesel Meminger", optionC: "Greta", optionD: "Rosa", correctAnswer: "b" },
      { questionText: "U kojem periodu se odvija radnja?", optionA: "Prvi svjetski rat", optionB: "Drugi svjetski rat, nacistička Njemačka", optionC: "Hladni rat", optionD: "Sadašnjost", correctAnswer: "b" },
      { questionText: "Šta Liesel krade?", optionA: "Hranu", optionB: "Novac", optionC: "Knjige", optionD: "Odjeću", correctAnswer: "c" },
    ],
  },
  {
    bookId: "00f7fa0d-1eca-4ca4-9ce8-ffc7772a6146",
    title: "Kviz: Kraljica iz dvorišta",
    questions: [
      { questionText: "Ko je autor?", optionA: "Bisera Alikadić", optionB: "Branko Ćopić", optionC: "Ahmet Hromadžić", optionD: "Ivana Brlić-Mažuranić", correctAnswer: "a" },
      { questionText: "O čemu govori knjiga?", optionA: "O ratu", optionB: "O djetinjstvu i igri u dvorištu", optionC: "O putovanju", optionD: "O životinjama", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Lektira", optionC: "Naučna fantastika", optionD: "Biografija", correctAnswer: "b" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Strašan", optionB: "Topao i dječiji", optionC: "Satiričan", optionD: "Tužan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "2fc9ad05-de87-4ec9-98bf-2bb500d2c831",
    title: "Kviz: Krive su zvijezde",
    questions: [
      { questionText: "Ko je autor?", optionA: "Rainbow Rowell", optionB: "John Green", optionC: "Nicola Yoon", optionD: "Jenny Han", correctAnswer: "b" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Alaska", optionB: "Hazel Grace Lancaster", optionC: "Margo", optionD: "Eleanor", correctAnswer: "b" },
      { questionText: "Od čega boluje Hazel?", optionA: "Grip", optionB: "Rak", optionC: "Alergija", optionD: "Nije bolesna", correctAnswer: "b" },
      { questionText: "Kako se zove momak u koga se Hazel zaljubi?", optionA: "John", optionB: "Isaac", optionC: "Augustus Waters", optionD: "Peter", correctAnswer: "c" },
      { questionText: "Kuda Hazel i Augustus putuju?", optionA: "U London", optionB: "U Amsterdam", optionC: "U Pariz", optionD: "U Rim", correctAnswer: "b" },
    ],
  },
  {
    bookId: "4ee6556f-4a07-4de2-ab96-96d92b6d5d19",
    title: "Kviz: Kronike iz Narnije",
    questions: [
      { questionText: "Ko je autor?", optionA: "J.R.R. Tolkien", optionB: "C.S. Lewis", optionC: "Philip Pullman", optionD: "Rick Riordan", correctAnswer: "b" },
      { questionText: "Kako djeca ulaze u Narniju?", optionA: "Kroz vrata", optionB: "Kroz ormar", optionC: "Kroz prozor", optionD: "Kroz ogledalo", correctAnswer: "b" },
      { questionText: "Ko je Aslan?", optionA: "Vuk", optionB: "Lav, zaštitnik Narnije", optionC: "Čarobnjak", optionD: "Patuljak", correctAnswer: "b" },
      { questionText: "Ko je negativka u prvoj knjizi?", optionA: "Zla maćeha", optionB: "Bijela vještica", optionC: "Crna kraljica", optionD: "Mračna vila", correctAnswer: "b" },
      { questionText: "Koliko knjiga ima serijal?", optionA: "Pet", optionB: "Šest", optionC: "Sedam", optionD: "Osam", correctAnswer: "c" },
    ],
  },
  {
    bookId: "6984435a-53f2-4725-8f61-9b989ebc049e",
    title: "Kviz: Kroz pustinju i prašumu",
    questions: [
      { questionText: "Ko je autor?", optionA: "Jules Verne", optionB: "Henryk Sienkiewicz", optionC: "Daniel Defoe", optionD: "R.L. Stevenson", correctAnswer: "b" },
      { questionText: "Kako se zovu dva mlada junaka?", optionA: "Tom i Huck", optionB: "Staś i Nel", optionC: "Peter i Edmund", optionD: "Emil i Karl", correctAnswer: "b" },
      { questionText: "Gdje se odvija radnja?", optionA: "U Evropi", optionB: "U Africi", optionC: "U Aziji", optionD: "U Americi", correctAnswer: "b" },
      { questionText: "Šta se desi djeci na početku?", optionA: "Idu na izlet", optionB: "Bivaju oteti", optionC: "Bježe od kuće", optionD: "Putuju brodom", correctAnswer: "b" },
      { questionText: "Kako se djeca snalaze u divljini?", optionA: "Čekaju pomoć", optionB: "Hrabrošću i snalažljivošću", optionC: "Koriste magiju", optionD: "Pozivaju vojsku", correctAnswer: "b" },
    ],
  },
  {
    bookId: "ea4d6671-8010-429f-941c-c0996b85fd5e",
    title: "Kviz: Kula",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ivo Andrić", optionB: "Zija Dizdarević", optionC: "Meša Selimović", optionD: "Petar Kočić", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Fantasy", optionB: "Lektira", optionC: "Naučna fantastika", optionD: "Biografija", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je djelo namijenjeno?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "c" },
      { questionText: "Šta 'Kula' simbolizira u djelu?", optionA: "Bogatsvo", optionB: "Moć i otpor", optionC: "Ljepotu", optionD: "Slobodu", correctAnswer: "b" },
      { questionText: "Kakav stil pisanja ima Dizdarević?", optionA: "Komičan", optionB: "Lirski i emotivan", optionC: "Satiričan", optionD: "Naučni", correctAnswer: "b" },
    ],
  },
  {
    bookId: "dd5fa1a4-db48-44fb-acbe-f83695a5c86f",
    title: "Kviz: Kći čuvara uspomena",
    questions: [
      { questionText: "Ko je autor?", optionA: "Kim Edwards", optionB: "Jodi Picoult", optionC: "Nicholas Sparks", optionD: "Khaled Hosseini", correctAnswer: "a" },
      { questionText: "Šta doktor učini sa svojom kćerkom?", optionA: "Pošalje je u školu", optionB: "Da je na usvajanje jer ima Downov sindrom", optionC: "Odvede je na putovanje", optionD: "Sakrije je", correctAnswer: "b" },
      { questionText: "Šta čuva tajnu tokom cijelog romana?", optionA: "Liječnik koji je dao kćer", optionB: "Medicinska sestra", optionC: "Otac", optionD: "Susjed", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Porodična drama / beletristika", optionC: "Naučna fantastika", optionD: "Kriminalistički roman", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Avantura", optionB: "Tajne, porodica i posljedice odluka", optionC: "Sport", optionD: "Putovanje", correctAnswer: "b" },
    ],
  },
  {
    bookId: "a6a0bb58-6efa-49fa-878c-fd60308061f0",
    title: "Kviz: Labirint: Nemoguće bjekstvo",
    questions: [
      { questionText: "Ko je autor?", optionA: "Suzanne Collins", optionB: "James Dashner", optionC: "Veronica Roth", optionD: "Rick Riordan", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Peeta", optionB: "Thomas", optionC: "Newt", optionD: "Minho", correctAnswer: "b" },
      { questionText: "Gdje se Thomas probudi na početku?", optionA: "U školi", optionB: "U Gladu - zatvorenoj zajednici okruženoj labirintom", optionC: "U gradu", optionD: "Na otoku", correctAnswer: "b" },
      { questionText: "Šta se krije u labirintu?", optionA: "Blago", optionB: "Griever - opasna stvorenja", optionC: "Zmajevi", optionD: "Roboti", correctAnswer: "b" },
      { questionText: "Šta Thomas pokušava da uradi?", optionA: "Ostati u Gladu", optionB: "Pobjeći iz labirinta", optionC: "Sagraditi grad", optionD: "Pronaći blago", correctAnswer: "b" },
    ],
  },
  {
    bookId: "f30ddf40-449e-493e-b0d3-5deb5bf45ae1",
    title: "Kviz: Lassie se vraća kući",
    questions: [
      { questionText: "Ko je autor?", optionA: "Jack London", optionB: "Eric Knight", optionC: "Anna Sewell", optionD: "Rudyard Kipling", correctAnswer: "b" },
      { questionText: "Šta je Lassie?", optionA: "Mačka", optionB: "Koli - pastirski pas", optionC: "Konj", optionD: "Zec", correctAnswer: "b" },
      { questionText: "Zašto Lassie biva razdvojena od Joe-a?", optionA: "Izgubi se", optionB: "Porodica je siromašna i proda je", optionC: "Pobjegne", optionD: "Ukradu je", correctAnswer: "b" },
      { questionText: "Šta Lassie učini?", optionA: "Ostane kod novog vlasnika", optionB: "Pređe stotine kilometara da se vrati Joeu", optionC: "Pobjegne u šumu", optionD: "Nađe novog prijatelja", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Avantura", optionB: "Odanost i ljubav između psa i vlasnika", optionC: "Putovanje", optionD: "Sport", correctAnswer: "b" },
    ],
  },
  {
    bookId: "8f8f5189-bc93-40c3-9895-58cc941ec91d",
    title: "Kviz: Ljeto kad sam postala lijepa",
    questions: [
      { questionText: "Ko je autor?", optionA: "Rainbow Rowell", optionB: "Jenny Han", optionC: "John Green", optionD: "Nicola Yoon", correctAnswer: "b" },
      { questionText: "Gdje Belly provodi ljeta?", optionA: "Na planini", optionB: "U kući na plaži (Cousins Beach)", optionC: "U gradu", optionD: "Na selu", correctAnswer: "b" },
      { questionText: "Između koja dva momka Belly bira?", optionA: "Tom i Jerry", optionB: "Conrad i Jeremiah", optionC: "Peter i John", optionD: "Alex i Sam", correctAnswer: "b" },
      { questionText: "O čemu govori knjiga?", optionA: "O školi", optionB: "O odrastanju, prvoj ljubavi i ljetu", optionC: "O sportu", optionD: "O putovanju", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Realistični roman / YA romansa", optionC: "Horor", optionD: "Naučna fantastika", correctAnswer: "b" },
    ],
  },
  {
    bookId: "cee58267-a1b7-4245-ad7f-352da8814efb",
    title: "Kviz: Lovac na zmajeve",
    questions: [
      { questionText: "Ko je autor?", optionA: "Khaled Hosseini", optionB: "Orhan Pamuk", optionC: "Salman Rushdie", optionD: "Carlos Ruiz Zafón", correctAnswer: "a" },
      { questionText: "Šta je 'Lovac na zmajeve' zapravo?", optionA: "Lov na stvarne zmajeve", optionB: "Metafora za trčanje za zmajem od papira", optionC: "Video igra", optionD: "Narodna priča", correctAnswer: "b" },
      { questionText: "U kojoj zemlji se odvija radnja?", optionA: "Iran", optionB: "Afganistan", optionC: "Pakistan", optionD: "Irak", correctAnswer: "b" },
      { questionText: "Ko je Amir?", optionA: "Siromašni dječak", optionB: "Sin bogatog čovjeka iz Kabula", optionC: "Vojnik", optionD: "Učitelj", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Putovanje", optionB: "Krivnja, iskupljenje i prijateljstvo", optionC: "Sport", optionD: "Škola", correctAnswer: "b" },
    ],
  },
  {
    bookId: "41b75d95-9760-4218-bce3-7e9b364ec23e",
    title: "Kviz: Lovac u žitu",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ernest Hemingway", optionB: "J.D. Salinger", optionC: "F. Scott Fitzgerald", optionD: "Mark Twain", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Jay Gatsby", optionB: "Holden Caulfield", optionC: "Nick Carraway", optionD: "Tom Sawyer", correctAnswer: "b" },
      { questionText: "Šta Holden misli o društvu?", optionA: "Voli sve ljude", optionB: "Smatra ga lažnim i licemjernim", optionC: "Želi biti dio njega", optionD: "Ne razmišlja o tome", correctAnswer: "b" },
      { questionText: "Koji je Holdenov san vezan za naslov?", optionA: "Da bude lovac", optionB: "Da spasi djecu koja trče prema litici u žitnom polju", optionC: "Da živi na farmi", optionD: "Da putuje svijetom", correctAnswer: "b" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Veseo", optionB: "Melanholičan i buntovan", optionC: "Avanturističan", optionD: "Romantičan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "c222c28f-14da-4471-8920-adb2e2d8f820",
    title: "Kviz: Loši momci",
    questions: [
      { questionText: "Ko je autor?", optionA: "Dav Pilkey", optionB: "Aaron Blabey", optionC: "Jeff Kinney", optionD: "Roald Dahl", correctAnswer: "b" },
      { questionText: "Ko su 'Loši momci'?", optionA: "Ljudi", optionB: "Životinje koje žele postati dobre", optionC: "Roboti", optionD: "Čudovišta", correctAnswer: "b" },
      { questionText: "Ko je vođa grupe?", optionA: "Zmija", optionB: "Gospodin Vuk", optionC: "Piranja", optionD: "Pauk", correctAnswer: "b" },
      { questionText: "U kakvom formatu je knjiga?", optionA: "Roman", optionB: "Ilustrirana knjiga / skoro kao strip", optionC: "Poezija", optionD: "Enciklopedija", correctAnswer: "b" },
      { questionText: "Koja je pouka knjige?", optionA: "Treba biti loš", optionB: "Svi zaslužuju drugu šansu i mogu se promijeniti", optionC: "Životinje ne mogu biti dobre", optionD: "Treba izbjegavati ljude", correctAnswer: "b" },
    ],
  },
  {
    bookId: "67b9cfb7-fdf5-4ddc-9de7-746cc48addf7",
    title: "Kviz: Magareće godine",
    questions: [
      { questionText: "Ko je autor?", optionA: "Branko Ćopić", optionB: "Mato Lovrak", optionC: "Ivan Kušan", optionD: "Ahmet Hromadžić", correctAnswer: "a" },
      { questionText: "O čemu govori knjiga?", optionA: "O magarcu", optionB: "O djetinjstvu i nestašlucima u selu", optionC: "O školi u gradu", optionD: "O ratu", correctAnswer: "b" },
      { questionText: "Šta 'magareće godine' simbolizira?", optionA: "Starost", optionB: "Bezbrižno djetinjstvo", optionC: "Teške godine", optionD: "Školske godine", correctAnswer: "b" },
      { questionText: "Kakav humor koristi Ćopić?", optionA: "Ironičan", optionB: "Topao, narodni humor", optionC: "Crn humor", optionD: "Bez humora", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Lektira / autobiografska proza", optionC: "Naučna fantastika", optionD: "Drama", correctAnswer: "b" },
    ],
  },
  {
    bookId: "390d00a9-52df-45ef-ad6b-96f199657b90",
    title: "Kviz: Mali knez",
    questions: [
      { questionText: "Ko je autor?", optionA: "Mato Lovrak", optionB: "Branko Ćopić", optionC: "Ivan Kušan", optionD: "Ivana Brlić-Mažuranić", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Lektira", optionC: "Bajka", optionD: "Biografija", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
      { questionText: "O čemu govori knjiga?", optionA: "O životu na selu", optionB: "O dječijoj družini i njihovim avanturama", optionC: "O gradu", optionD: "O životinjama", correctAnswer: "b" },
      { questionText: "Kakav je stil Lovrakovih knjiga?", optionA: "Strašan", optionB: "Realistički, o djeci i njihovom svijetu", optionC: "Fantasy", optionD: "Satiričan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "c987ebe6-75b9-4262-9ae7-7b824a745b3e",
    title: "Kviz: Malo drvo",
    questions: [
      { questionText: "Ko je autor?", optionA: "Forrest Carter", optionB: "Jack London", optionC: "Mark Twain", optionD: "Sherman Alexie", correctAnswer: "a" },
      { questionText: "Ko je 'Malo drvo'?", optionA: "Drvo u šumi", optionB: "Nadimak indijanskog dječaka", optionC: "Ime životinje", optionD: "Ime grada", correctAnswer: "b" },
      { questionText: "Kod koga Mali drvo živi?", optionA: "Kod roditelja", optionB: "Kod djedova i baka Cherokee Indijanaca", optionC: "U školi", optionD: "Sam", correctAnswer: "b" },
      { questionText: "Šta Mali drvo uči od djedova?", optionA: "Matematiku", optionB: "Put Cherokee naroda - mudrost i prirodu", optionC: "Čitanje", optionD: "Vožnju", correctAnswer: "b" },
      { questionText: "Koja je glavna tema knjige?", optionA: "Sport", optionB: "Priroda, tradicija i odrastanje", optionC: "Škola", optionD: "Tehnologija", correctAnswer: "b" },
    ],
  },
  {
    bookId: "4e4a277a-8299-45ca-a6aa-82931348f924",
    title: "Kviz: Marina",
    questions: [
      { questionText: "Ko je autor?", optionA: "Carlos Ruiz Zafón", optionB: "Gabriel García Márquez", optionC: "Paulo Coelho", optionD: "Isabel Allende", correctAnswer: "a" },
      { questionText: "U kojem gradu se odvija radnja?", optionA: "Madrid", optionB: "Barcelona", optionC: "Lisabon", optionD: "Pariz", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Daniel", optionB: "Óscar Drai", optionC: "David", optionD: "Carlos", correctAnswer: "b" },
      { questionText: "Šta Oscar i Marina istražuju?", optionA: "Školu", optionB: "Misteriju starog naučnika i njegovih stvorenja", optionC: "Blago", optionD: "Stari grad", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Komedija", optionB: "Gotički misterij / horor", optionC: "Romantika", optionD: "Biografija", correctAnswer: "b" },
    ],
  },
  {
    bookId: "7aa75797-e835-412a-aa13-dc60dc1ee799",
    title: "Kviz: Matilda",
    questions: [
      { questionText: "Ko je autor?", optionA: "Roald Dahl", optionB: "Enid Blyton", optionC: "Astrid Lindgren", optionD: "C.S. Lewis", correctAnswer: "a" },
      { questionText: "Šta Matilda može da radi?", optionA: "Leti", optionB: "Pomjera stvari mislima (telekineza)", optionC: "Nestane", optionD: "Razgovara sa životinjama", correctAnswer: "b" },
      { questionText: "Kako se zove zla direktorica?", optionA: "Gospođa Honey", optionB: "Gospođa Trunchbull", optionC: "Gospođa Smith", optionD: "Gospođa Wilson", correctAnswer: "b" },
      { questionText: "Ko je Matildina omiljena učiteljica?", optionA: "Gospođa Trunchbull", optionB: "Gospođa Honey", optionC: "Gospođa Brown", optionD: "Gospođa White", correctAnswer: "b" },
      { questionText: "Kakvi su Matildini roditelji?", optionA: "Brižni i pažljivi", optionB: "Nemarni i ne cijene njenu inteligenciju", optionC: "Strogi ali pravedni", optionD: "Učitelji", correctAnswer: "b" },
    ],
  },
  {
    bookId: "94680ee7-7e4f-4e22-aff4-5209d6c63ec6",
    title: "Kviz: Mačak u čizmama",
    questions: [
      { questionText: "Ko je autor bajke?", optionA: "Braća Grimm", optionB: "Charles Perrault", optionC: "H. C. Andersen", optionD: "Oscar Wilde", correctAnswer: "b" },
      { questionText: "Šta mačak traži od svog vlasnika?", optionA: "Hranu", optionB: "Čizme i vreću", optionC: "Kuću", optionD: "Novac", correctAnswer: "b" },
      { questionText: "Kako mačak pomaže svom vlasniku?", optionA: "Lovi miševe", optionB: "Lukavošću ga predstavlja kao markiza", optionC: "Radi na farmi", optionD: "Čuva kuću", correctAnswer: "b" },
      { questionText: "S kim se mačak bori na kraju?", optionA: "Vukom", optionB: "Divom/čarobnjakom koji se pretvara u miša", optionC: "Kraljem", optionD: "Zmajem", correctAnswer: "b" },
      { questionText: "Koja je pouka bajke?", optionA: "Treba biti bogat", optionB: "Pamet i snalažljivost pobjeđuju", optionC: "Treba imati mačku", optionD: "Treba biti jak", correctAnswer: "b" },
    ],
  },
  {
    bookId: "218f352a-0b5e-43f4-9b6a-399bf8c55568",
    title: "Kviz: Medin rođendan",
    questions: [
      { questionText: "Ko je autor?", optionA: "Zehra Hubijar", optionB: "Ahmet Hromadžić", optionC: "Bisera Alikadić", optionD: "Ivana Brlić-Mažuranić", correctAnswer: "a" },
      { questionText: "O čemu govori priča?", optionA: "O školi", optionB: "O proslavi Medinog rođendana", optionC: "O putovanju", optionD: "O životinjama", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Bajke i basne", optionC: "Naučna fantastika", optionD: "Drama", correctAnswer: "b" },
      { questionText: "Kakav ton ima priča?", optionA: "Strašan", optionB: "Veseo i topao", optionC: "Tužan", optionD: "Satiričan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "af0f4749-6f23-4d6d-af1a-205f1be55864",
    title: "Kviz: Metamorfoza",
    questions: [
      { questionText: "Ko je autor?", optionA: "Albert Camus", optionB: "Franz Kafka", optionC: "Hermann Hesse", optionD: "Thomas Mann", correctAnswer: "b" },
      { questionText: "U šta se Gregor Samsa pretvori?", optionA: "U pticu", optionB: "U ogromnog insekta", optionC: "U miša", optionD: "U zmiju", correctAnswer: "b" },
      { questionText: "Kako porodica reaguje na Gregorovu transformaciju?", optionA: "Pomažu mu", optionB: "S gadenjem i odbacivanjem", optionC: "Vesele se", optionD: "Ne primjećuju", correctAnswer: "b" },
      { questionText: "Čime se Gregor bavio prije transformacije?", optionA: "Bio je student", optionB: "Bio je trgovački putnik", optionC: "Bio je učitelj", optionD: "Bio je liječnik", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Ljubav", optionB: "Otuđenost, odbačenost i apsurd", optionC: "Putovanje", optionD: "Prijateljstvo", correctAnswer: "b" },
    ],
  },
  {
    bookId: "c55ddba0-4bc4-4735-a181-8207b01d3859",
    title: "Kviz: Mi djeca s kolodvora Zoo",
    questions: [
      { questionText: "Ko je autor?", optionA: "Christiane F.", optionB: "Anne Frank", optionC: "Nadežda Milenković", optionD: "Sue Townsend", correctAnswer: "a" },
      { questionText: "O čemu govori knjiga?", optionA: "O školi", optionB: "O ovisnosti o drogama među mladima", optionC: "O putovanju", optionD: "O životinjama", correctAnswer: "b" },
      { questionText: "U kojem gradu se odvija radnja?", optionA: "London", optionB: "Berlin", optionC: "Pariz", optionD: "Beč", correctAnswer: "b" },
      { questionText: "Da li je priča zasnovana na istinitom događaju?", optionA: "Da", optionB: "Ne", optionC: "Djelomično", optionD: "Nije poznato", correctAnswer: "a" },
      { questionText: "Koja je glavna poruka knjige?", optionA: "Droge su zabavne", optionB: "Opasnost ovisnosti i važnost prevencije", optionC: "Treba putovati", optionD: "Treba biti hrabar", correctAnswer: "b" },
    ],
  },
  {
    bookId: "4ab48c1b-8e96-4840-94d6-c37e801091d9",
    title: "Kviz: Miševi i ljudi",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ernest Hemingway", optionB: "John Steinbeck", optionC: "F. Scott Fitzgerald", optionD: "William Faulkner", correctAnswer: "b" },
      { questionText: "Kako se zovu dva glavna lika?", optionA: "Tom i Jerry", optionB: "George i Lennie", optionC: "Jack i Jim", optionD: "Bill i Bob", correctAnswer: "b" },
      { questionText: "Šta Lennie voli da radi?", optionA: "Čita", optionB: "Miluje mekane stvari", optionC: "Pjeva", optionD: "Crta", correctAnswer: "b" },
      { questionText: "O čemu George i Lennie sanjaju?", optionA: "O putovanju", optionB: "O vlastitoj farmi sa zečevima", optionC: "O školi", optionD: "O gradu", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Avantura", optionB: "Prijateljstvo, snovi i surovost života", optionC: "Ljubav", optionD: "Sport", correctAnswer: "b" },
    ],
  },
  {
    bookId: "4374c907-1345-4889-a29b-6d0ea55b027e",
    title: "Kviz: Moja baka vam se ispričava",
    questions: [
      { questionText: "Ko je autor?", optionA: "Fredrik Backman", optionB: "Stieg Larsson", optionC: "Jonas Jonasson", optionD: "Astrid Lindgren", correctAnswer: "a" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Sara", optionB: "Elsa", optionC: "Anna", optionD: "Ida", correctAnswer: "b" },
      { questionText: "Koliko godina ima Elsa?", optionA: "Pet", optionB: "Sedam", optionC: "Deset", optionD: "Dvanaest", correctAnswer: "b" },
      { questionText: "Šta Elsa naslijedi od bake?", optionA: "Novac", optionB: "Pisma isprike za dostavu susjedima", optionC: "Kuću", optionD: "Knjige", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Avantura", optionB: "Oproštaj, mašta i razumijevanje drugih", optionC: "Škola", optionD: "Sport", correctAnswer: "b" },
    ],
  },
  {
    bookId: "be10d251-1e51-4f0b-ae97-cea4eb540ef6",
    title: "Kviz: Moji su roditelji vanzemaljci",
    questions: [
      { questionText: "Ko je autor?", optionA: "Grupa autora", optionB: "Roald Dahl", optionC: "Jeff Kinney", optionD: "Dav Pilkey", correctAnswer: "a" },
      { questionText: "O čemu govori knjiga?", optionA: "O školi", optionB: "O djetetu koje misli da su mu roditelji vanzemaljci", optionC: "O putovanju u svemir", optionD: "O životinjama", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Lektira", optionB: "Avantura i fantasy", optionC: "Biografija", optionD: "Poezija", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Strašan", optionB: "Humorističan i zabavan", optionC: "Tužan", optionD: "Ozbiljan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "111ce87a-3f00-48e8-b27a-34c2cb0efbeb",
    title: "Kviz: Most u magli",
    questions: [
      { questionText: "Ko je autor?", optionA: "Alija Dubočanin", optionB: "Ivo Andrić", optionC: "Branko Ćopić", optionD: "Meša Selimović", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Fantasy", optionB: "Lektira", optionC: "Naučna fantastika", optionD: "Drama", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je djelo namijenjeno?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
      { questionText: "O čemu govori djelo?", optionA: "O gradu", optionB: "O životu u Bosni i odrastanju", optionC: "O putovanju", optionD: "O sportu", correctAnswer: "b" },
      { questionText: "Šta 'most u magli' simbolizira?", optionA: "Bogatsvo", optionB: "Nesigurnost i prolaznost", optionC: "Snagu", optionD: "Ljubav", correctAnswer: "b" },
    ],
  },
  {
    bookId: "08b14890-291a-4872-9484-3931ea92082a",
    title: "Kviz: Most za Terabitiju",
    questions: [
      { questionText: "Ko je autor?", optionA: "Katherine Paterson", optionB: "Astrid Lindgren", optionC: "Roald Dahl", optionD: "Frances Hodgson Burnett", correctAnswer: "a" },
      { questionText: "Kako se zove imaginarno kraljevstvo?", optionA: "Narnija", optionB: "Terabitija", optionC: "Hogwarts", optionD: "Nangijala", correctAnswer: "b" },
      { questionText: "Ko stvara Terabitiju?", optionA: "Učiteljica", optionB: "Jess i Leslie", optionC: "Roditelji", optionD: "Šumski duhovi", correctAnswer: "b" },
      { questionText: "Šta Terabitija predstavlja za djecu?", optionA: "Školu", optionB: "Mjesto bijega i prijateljstva", optionC: "Park", optionD: "Stadion", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Avantura", optionB: "Prijateljstvo, mašta i gubitak", optionC: "Sport", optionD: "Škola", correctAnswer: "b" },
    ],
  },
  {
    bookId: "531f964c-5298-4bbd-b3d4-f0e45751b2ee",
    title: "Kviz: Nikadgrad",
    questions: [
      { questionText: "Ko je autor?", optionA: "Jessica Townsend", optionB: "J.K. Rowling", optionC: "Rick Riordan", optionD: "Neil Gaiman", correctAnswer: "a" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Luna", optionB: "Morrigan Crow", optionC: "Hermiona", optionD: "Lyra", correctAnswer: "b" },
      { questionText: "Šta je posebno kod Morrigan?", optionA: "Može letjeti", optionB: "Prokleta je i treba joj patron za ulazak u Nikadgrad", optionC: "Može razgovarati sa životinjama", optionD: "Ima čarobni štap", correctAnswer: "b" },
      { questionText: "Šta je Nikadgrad?", optionA: "Obični grad", optionB: "Čarobni grad pun čuda", optionC: "Škola", optionD: "Šuma", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Komedija", optionB: "Fantasy / avantura", optionC: "Biografija", optionD: "Historijski roman", correctAnswer: "b" },
    ],
  },
  {
    bookId: "30eaac96-847d-422d-80f2-57640715fc2e",
    title: "Kviz: Oliver Twist",
    questions: [
      { questionText: "Ko je autor?", optionA: "Charles Dickens", optionB: "Mark Twain", optionC: "Oscar Wilde", optionD: "Jules Verne", correctAnswer: "a" },
      { questionText: "Gdje Oliver odrasta?", optionA: "U školi", optionB: "U sirotištu", optionC: "Na farmi", optionD: "Kod bake", correctAnswer: "b" },
      { questionText: "Ko vodi bandu maloljetnih lopova?", optionA: "Bill Sikes", optionB: "Fagin", optionC: "Nancy", optionD: "Oliver", correctAnswer: "b" },
      { questionText: "Šta Oliver traži od kuhara u sirotištu?", optionA: "Vodu", optionB: "Još kaše (hrane)", optionC: "Kruh", optionD: "Mlijeko", correctAnswer: "b" },
      { questionText: "Kakav kraj ima priča za Olivera?", optionA: "Ostaje siromašan", optionB: "Pronalazi porodicu i sretan dom", optionC: "Postaje lopov", optionD: "Bježi iz zemlje", correctAnswer: "b" },
    ],
  },
  {
    bookId: "ba061688-83a9-4379-bd86-3ade3c66e4f0",
    title: "Kviz: Orlovi rano lete",
    questions: [
      { questionText: "Ko je autor?", optionA: "Branko Ćopić", optionB: "Mato Lovrak", optionC: "Ivan Kušan", optionD: "Ivana Brlić-Mažuranić", correctAnswer: "a" },
      { questionText: "O čemu govori knjiga?", optionA: "O životinjama", optionB: "O djetinjstvu djece u Bosanskoj Krajini", optionC: "O gradu", optionD: "O školi", correctAnswer: "b" },
      { questionText: "Kakav ton ima djelo?", optionA: "Tužan", optionB: "Topao, humoran i nostalgičan", optionC: "Strašan", optionD: "Satiričan", correctAnswer: "b" },
      { questionText: "U kom periodu se odvija radnja?", optionA: "U sadašnjosti", optionB: "Pred Drugi svjetski rat", optionC: "U srednjem vijeku", optionD: "U budućnosti", correctAnswer: "b" },
      { questionText: "Šta 'orlovi' simboliziraju?", optionA: "Ptice", optionB: "Hrabru djecu koja rano sazrijevaju", optionC: "Vojnike", optionD: "Učitelje", correctAnswer: "b" },
    ],
  },
  {
    bookId: "59155894-d54d-4d42-b9fe-0da85dfb01b5",
    title: "Kviz: Ostrvo s blagom",
    questions: [
      { questionText: "Ko je autor?", optionA: "Robert Louis Stevenson", optionB: "Daniel Defoe", optionC: "Jules Verne", optionD: "Mark Twain", correctAnswer: "a" },
      { questionText: "Kako se zove glavni junak?", optionA: "Robinson", optionB: "Jim Hawkins", optionC: "Kapetan Flint", optionD: "Ben Gunn", correctAnswer: "b" },
      { questionText: "Šta Jim pronađe u gostionici?", optionA: "Zlato", optionB: "Mapu blaga", optionC: "Kompas", optionD: "Mač", correctAnswer: "b" },
      { questionText: "Ko je Long John Silver?", optionA: "Kapetan broda", optionB: "Kuvar na brodu i piratski vođa", optionC: "Jimin otac", optionD: "Guverner", correctAnswer: "b" },
      { questionText: "Šta Jim i prijatelji traže?", optionA: "Novu zemlju", optionB: "Zakopano piratsko blago", optionC: "Izgubljeni brod", optionD: "Potopljeni grad", correctAnswer: "b" },
    ],
  },
  {
    bookId: "504b2209-a550-46e5-b931-056d524f3434",
    title: "Kviz: Pad kuće Usher",
    questions: [
      { questionText: "Ko je autor?", optionA: "Edgar Allan Poe", optionB: "Mary Shelley", optionC: "Bram Stoker", optionD: "H.P. Lovecraft", correctAnswer: "a" },
      { questionText: "Kakav je ton priče?", optionA: "Veseo", optionB: "Mračan i jeziv (gotski)", optionC: "Romantičan", optionD: "Komičan", correctAnswer: "b" },
      { questionText: "Šta se desi s kućom Usher?", optionA: "Bude obnovljena", optionB: "Sruši se / propadne", optionC: "Bude prodata", optionD: "Bude sagrađena ponovo", correctAnswer: "b" },
      { questionText: "Šta Roderick Usher pati od?", optionA: "Ljubavi", optionB: "Straha i bolesti", optionC: "Dosade", optionD: "Siromaštva", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Komedija", optionB: "Gotski horor", optionC: "Romantika", optionD: "Naučna fantastika", correctAnswer: "b" },
    ],
  },
  {
    bookId: "15feee58-a6ee-449a-8594-38bf43382986",
    title: "Kviz: Papirni gradovi",
    questions: [
      { questionText: "Ko je autor?", optionA: "John Green", optionB: "Rainbow Rowell", optionC: "Jenny Han", optionD: "Nicola Yoon", correctAnswer: "a" },
      { questionText: "Kako se zove glavni junak?", optionA: "Augustus", optionB: "Quentin (Q)", optionC: "Hazel", optionD: "Miles", correctAnswer: "b" },
      { questionText: "Ko je Margo Roth Spiegelman?", optionA: "Quentinova sestra", optionB: "Tajanstvena djevojka u koju je Q zaljubljen", optionC: "Učiteljica", optionD: "Novinarka", correctAnswer: "b" },
      { questionText: "Šta Margo učini jedne noći?", optionA: "Ode na putovanje", optionB: "Nestane nakon noći avantura", optionC: "Bježi u drugu zemlju", optionD: "Skriva se u školi", correctAnswer: "b" },
      { questionText: "Šta Q radi kada Margo nestane?", optionA: "Zaboravi je", optionB: "Traži tragove da je pronađe", optionC: "Zove policiju", optionD: "Ide na odmor", correctAnswer: "b" },
    ],
  },
  {
    bookId: "bd011081-94c8-44ae-be22-0e1802f27b34",
    title: "Kviz: Pas čovjek",
    questions: [
      { questionText: "Ko je autor?", optionA: "Dav Pilkey", optionB: "Jeff Kinney", optionC: "Aaron Blabey", optionD: "Roald Dahl", correctAnswer: "a" },
      { questionText: "Ko je Pas čovjek?", optionA: "Pravi pas", optionB: "Pola pas, pola čovjek - superjunak policajac", optionC: "Robot", optionD: "Čovjek u kostimu", correctAnswer: "b" },
      { questionText: "Ko je negativac u knjizi?", optionA: "Zli vuk", optionB: "Petey - zli mačak", optionC: "Lopov", optionD: "Robot", correctAnswer: "b" },
      { questionText: "U kakvom formatu je knjiga?", optionA: "Roman", optionB: "Strip / ilustrirana knjiga", optionC: "Poezija", optionD: "Enciklopedija", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
    ],
  },
  {
    bookId: "41faa32b-6ea2-4170-a85a-65b8736c7dc1",
    title: "Kviz: Patuljak vam priča",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ahmet Hromadžić", optionB: "Branko Ćopić", optionC: "Ivana Brlić-Mažuranić", optionD: "Mato Lovrak", correctAnswer: "a" },
      { questionText: "Ko priča priče u knjizi?", optionA: "Vuk", optionB: "Patuljak", optionC: "Vila", optionD: "Djed", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Roman", optionB: "Bajke i basne", optionC: "Drama", optionD: "Biografija", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
      { questionText: "Kakav ton imaju priče?", optionA: "Strašan", optionB: "Čaroban i poučan", optionC: "Satiričan", optionD: "Tužan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "81f57ebb-a3a3-4268-9aac-6bcd1173a99c",
    title: "Kviz: Pepeljuga",
    questions: [
      { questionText: "Ko je autor bajke?", optionA: "Braća Grimm", optionB: "Charles Perrault", optionC: "H. C. Andersen", optionD: "Oscar Wilde", correctAnswer: "b" },
      { questionText: "Šta Pepeljuga gubi na balu?", optionA: "Narukvicu", optionB: "Staklenu cipelicu", optionC: "Ogrlicu", optionD: "Prsten", correctAnswer: "b" },
      { questionText: "Ko pomaže Pepeljugi da ode na bal?", optionA: "Maćeha", optionB: "Kuma vila", optionC: "Sestra", optionD: "Princ", correctAnswer: "b" },
      { questionText: "Od čega se pravi kočija?", optionA: "Od drveta", optionB: "Od bundeve", optionC: "Od zlata", optionD: "Od stakla", correctAnswer: "b" },
      { questionText: "Šta se desi u ponoć?", optionA: "Bal završi", optionB: "Čarolija nestane", optionC: "Princ odlazi", optionD: "Kiša padne", correctAnswer: "b" },
    ],
  },
  {
    bookId: "75f5dd39-c989-4585-94bb-1ef34246e0e7",
    title: "Kviz: Percy Jackson",
    questions: [
      { questionText: "Ko je autor?", optionA: "J.K. Rowling", optionB: "Rick Riordan", optionC: "C.S. Lewis", optionD: "Christopher Paolini", correctAnswer: "b" },
      { questionText: "Ko je Percyjev otac?", optionA: "Zeus", optionB: "Posejdon", optionC: "Hades", optionD: "Ares", correctAnswer: "b" },
      { questionText: "Kako se zove kamp za polubogove?", optionA: "Hogwarts", optionB: "Kamp polumjesec", optionC: "Narnija", optionD: "Olimp", correctAnswer: "b" },
      { questionText: "Šta je Percy?", optionA: "Čarobnjak", optionB: "Polubog (demigod)", optionC: "Vilenjak", optionD: "Robot", correctAnswer: "b" },
      { questionText: "Na kojoj mitologiji je serijal zasnovan?", optionA: "Nordijskoj", optionB: "Grčkoj", optionC: "Egipatskoj", optionD: "Rimskoj", correctAnswer: "b" },
    ],
  },
  {
    bookId: "d20ecc90-b482-4d6f-ae99-37fb0d154987",
    title: "Kviz: Pet prijatelja",
    questions: [
      { questionText: "Ko je autor?", optionA: "Enid Blyton", optionB: "Roald Dahl", optionC: "Astrid Lindgren", optionD: "C.S. Lewis", correctAnswer: "a" },
      { questionText: "Koliko članova ima grupa 'Pet prijatelja'?", optionA: "Tri", optionB: "Četiri djece i jedan pas", optionC: "Pet djece", optionD: "Šest", correctAnswer: "b" },
      { questionText: "Kako se zove pas u grupi?", optionA: "Rex", optionB: "Timmy", optionC: "Buddy", optionD: "Max", correctAnswer: "b" },
      { questionText: "Šta 'Pet prijatelja' rade u knjigama?", optionA: "Uče", optionB: "Rješavaju misterije i doživljavaju avanture", optionC: "Igraju sport", optionD: "Putuju svijetom", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje serijal?", optionA: "Fantasy", optionB: "Dječiji avanturistički / mystery", optionC: "Bajka", optionD: "Naučna fantastika", correctAnswer: "b" },
    ],
  },
  {
    bookId: "edad5fef-1c50-4d83-bbfa-473f45733470",
    title: "Kviz: Pinokio",
    questions: [
      { questionText: "Ko je autor?", optionA: "Carlo Collodi", optionB: "Charles Perrault", optionC: "Braća Grimm", optionD: "H. C. Andersen", correctAnswer: "a" },
      { questionText: "Od čega je Pinokio napravljen?", optionA: "Od gline", optionB: "Od drveta", optionC: "Od metala", optionD: "Od stakla", correctAnswer: "b" },
      { questionText: "Šta se desi kad Pinokio laže?", optionA: "Pocrveni", optionB: "Nos mu naraste", optionC: "Uši mu rastu", optionD: "Nestane", correctAnswer: "b" },
      { questionText: "Ko je stvorio Pinokija?", optionA: "Vila", optionB: "Gepetto", optionC: "Čarobnjak", optionD: "Naučnik", correctAnswer: "b" },
      { questionText: "Šta Pinokio želi postati?", optionA: "Čarobnjak", optionB: "Pravi dječak", optionC: "Kralj", optionD: "Robot", correctAnswer: "b" },
    ],
  },
  {
    bookId: "f5a05b24-36a6-4c6c-a0ee-302359bd2fec",
    title: "Kviz: Pipi Duga Čarapa",
    questions: [
      { questionText: "Ko je autor?", optionA: "Astrid Lindgren", optionB: "Enid Blyton", optionC: "Roald Dahl", optionD: "C.S. Lewis", correctAnswer: "a" },
      { questionText: "Kako se zove Pipina kuća?", optionA: "Vila Vilekula", optionB: "Crvena kuća", optionC: "Bijela vila", optionD: "Zelena koliba", correctAnswer: "a" },
      { questionText: "S kim Pipi živi?", optionA: "S roditeljima", optionB: "Sama, s konjem i majmunom", optionC: "S bakom", optionD: "S bratom", correctAnswer: "b" },
      { questionText: "Kakva je Pipi?", optionA: "Tiha i mirna", optionB: "Nevjerovatno jaka, hrabra i zabavna", optionC: "Plašljiva", optionD: "Dosadna", correctAnswer: "b" },
      { questionText: "Ko su Pipini susjedi i prijatelji?", optionA: "Petar i Ana", optionB: "Tommy i Annika", optionC: "Hans i Greta", optionD: "Emil i Ida", correctAnswer: "b" },
    ],
  },
  {
    bookId: "3043ad64-2e80-4bf3-b043-9834787729dd",
    title: "Kviz: Pjesme (Nasiha Kapidžić-Hadžić)",
    questions: [
      { questionText: "Ko je autor ove zbirke?", optionA: "Mak Dizdar", optionB: "Nasiha Kapidžić-Hadžić", optionC: "Skender Kulenović", optionD: "Branko Ćopić", correctAnswer: "b" },
      { questionText: "Za koga su pjesme namijenjene?", optionA: "Odrasle", optionB: "Za djecu", optionC: "Za studente", optionD: "Za naučnike", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Roman", optionB: "Poezija", optionC: "Drama", optionD: "Bajka", correctAnswer: "b" },
      { questionText: "O čemu pjesme najčešće govore?", optionA: "O politici", optionB: "O prirodi, djetinjstvu i ljepotama života", optionC: "O ratu", optionD: "O tehnologiji", correctAnswer: "b" },
      { questionText: "Kakav ton imaju ove pjesme?", optionA: "Mračan", optionB: "Vedar, topao i nježan", optionC: "Satiričan", optionD: "Tužan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "1ae7fbc7-8171-46ee-9d01-619f0bf322df",
    title: "Kviz: Plavi vjetar",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ivica Vanja Rorić", optionB: "Branko Ćopić", optionC: "Mato Lovrak", optionD: "Ivan Kušan", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Lektira", optionC: "Naučna fantastika", optionD: "Biografija", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
      { questionText: "Šta 'plavi vjetar' može simbolizirati?", optionA: "Zimu", optionB: "Slobodu i djetinjstvo", optionC: "Oluju", optionD: "Tugu", correctAnswer: "b" },
      { questionText: "O čemu govori djelo?", optionA: "O politici", optionB: "O odrastanju i prirodi", optionC: "O sportu", optionD: "O tehnologiji", correctAnswer: "b" },
    ],
  },
  {
    bookId: "53d54fa7-3c00-43dc-bda7-a1811cc0744d",
    title: "Kviz: Pollyanna",
    questions: [
      { questionText: "Ko je autor?", optionA: "Frances Hodgson Burnett", optionB: "Eleanor H. Porter", optionC: "Louisa May Alcott", optionD: "Lucy Maud Montgomery", correctAnswer: "b" },
      { questionText: "Kakvu igru Pollyanna igra?", optionA: "Igru skrivanja", optionB: "Igru radosti (pronalazi nešto dobro u svemu)", optionC: "Igru kartama", optionD: "Igru pogađanja", correctAnswer: "b" },
      { questionText: "Kod koga Pollyanna živi?", optionA: "Kod roditelja", optionB: "Kod stroge tetke Polly", optionC: "Kod bake", optionD: "Kod prijatelja", correctAnswer: "b" },
      { questionText: "Kakav uticaj Pollyanna ima na ljude oko sebe?", optionA: "Negativan", optionB: "Pozitivan - čini ih sretnijima", optionC: "Nikakav", optionD: "Zbunjujući", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Tuga", optionB: "Optimizam i moć pozitivnog razmišljanja", optionC: "Avantura", optionD: "Sport", correctAnswer: "b" },
    ],
  },
  {
    bookId: "c725c71b-d99a-45e0-8002-95ea970ece39",
    title: "Kviz: Pripovijetke (Isak Samokovlija)",
    questions: [
      { questionText: "Ko je autor?", optionA: "Isak Samokovlija", optionB: "Ivo Andrić", optionC: "Ćamil Sijarić", optionD: "Meša Selimović", correctAnswer: "a" },
      { questionText: "O čemu najčešće govore Samokovlijine pripovijetke?", optionA: "O putovanjima", optionB: "O životu siromašnih i malih ljudi u BiH", optionC: "O sportu", optionD: "O tehnologiji", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Roman", optionB: "Zbirka pripovijedaka / lektira", optionC: "Drama", optionD: "Poezija", correctAnswer: "b" },
      { questionText: "Kakav stil pisanja ima Samokovlija?", optionA: "Satiričan", optionB: "Realistički i emotivan", optionC: "Fantastičan", optionD: "Komičan", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je djelo namijenjeno?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "c" },
    ],
  },
  {
    bookId: "046aa391-0c05-4457-b4f7-b3bace906033",
    title: "Kviz: Priče iz 1001 noći",
    questions: [
      { questionText: "Kako se zove pripovijedačica?", optionA: "Fatima", optionB: "Šeherezada", optionC: "Aisha", optionD: "Laila", correctAnswer: "b" },
      { questionText: "Zašto Šeherezada priča priče?", optionA: "Iz dosade", optionB: "Da spasi svoj život", optionC: "Da zabavi djecu", optionD: "Da zaspi", correctAnswer: "b" },
      { questionText: "Koji poznati lik je dio ovih priča?", optionA: "Robin Hood", optionB: "Aladin", optionC: "Peter Pan", optionD: "Pinochio", correctAnswer: "b" },
      { questionText: "Iz koje kulture potiču ove priče?", optionA: "Evropske", optionB: "Arapske / istočnjačke", optionC: "Kineske", optionD: "Afričke", correctAnswer: "b" },
      { questionText: "Koliko noći Šeherezada priča?", optionA: "100", optionB: "1001", optionC: "365", optionD: "500", correctAnswer: "b" },
    ],
  },
  {
    bookId: "58c0026c-1588-45b5-933f-686bfdc9b55a",
    title: "Kviz: Priče za laku noć za mlade buntovnice",
    questions: [
      { questionText: "Ko su autori?", optionA: "Grupa anonimnih autora", optionB: "Elena Favilli i Francesca Cavallo", optionC: "J.K. Rowling", optionD: "Malala Yousafzai", correctAnswer: "b" },
      { questionText: "O kome govore priče?", optionA: "O izmišljenim likovima", optionB: "O stvarnim ženama koje su promijenile svijet", optionC: "O životinjama", optionD: "O bajkama", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Bajka", optionB: "Popularna nauka / biografija", optionC: "Fantasy", optionD: "Poezija", correctAnswer: "b" },
      { questionText: "Koja je poruka knjige?", optionA: "Djevojke ne mogu ništa", optionB: "Svaka djevojka može promijeniti svijet", optionC: "Treba biti tiha", optionD: "Treba slušati starije", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
    ],
  },
  {
    bookId: "7ad8bd7e-8636-4571-894f-c3d2d01ea7a9",
    title: "Kviz: Proces",
    questions: [
      { questionText: "Ko je autor?", optionA: "Albert Camus", optionB: "Franz Kafka", optionC: "Hermann Hesse", optionD: "Fjodor Dostojevski", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Gregor Samsa", optionB: "Josef K.", optionC: "Karl Rossmann", optionD: "Georg Bendemann", correctAnswer: "b" },
      { questionText: "Šta se desi Josefu K. na početku?", optionA: "Dobije posao", optionB: "Bude uhapšen bez razloga", optionC: "Pobijedi na sudu", optionD: "Ode na putovanje", correctAnswer: "b" },
      { questionText: "Da li Josef ikada sazna zašto je uhapšen?", optionA: "Da", optionB: "Ne", optionC: "Djelomično", optionD: "Na kraju romana", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Ljubav", optionB: "Apsurd birokratije i bespomoćnost pojedinca", optionC: "Putovanje", optionD: "Prijateljstvo", correctAnswer: "b" },
    ],
  },
  {
    bookId: "bf5d7eb9-b6f2-4657-8a7f-6d35907a8cbe",
    title: "Kviz: Prosjak Luka",
    questions: [
      { questionText: "Ko je autor?", optionA: "August Šenoa", optionB: "Mato Lovrak", optionC: "Ivana Brlić-Mažuranić", optionD: "Ivan Kušan", correctAnswer: "a" },
      { questionText: "Ko je Prosjak Luka?", optionA: "Bogataš", optionB: "Siromašni seljak / prosjak", optionC: "Učitelj", optionD: "Vojnik", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Fantasy", optionB: "Lektira / socijalna priča", optionC: "Naučna fantastika", optionD: "Biografija", correctAnswer: "b" },
      { questionText: "Šta djelo prikazuje?", optionA: "Bogatsvo", optionB: "Socijalnu nepravdu i siromaštvo", optionC: "Putovanje", optionD: "Ratovanje", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je djelo namijenjeno?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
    ],
  },
  {
    bookId: "61d08b99-cc54-4d46-96bb-d85d4b8a9485",
    title: "Kviz: Pustolovine Huckleberryja Finna",
    questions: [
      { questionText: "Ko je autor?", optionA: "Mark Twain", optionB: "Charles Dickens", optionC: "Daniel Defoe", optionD: "Jules Verne", correctAnswer: "a" },
      { questionText: "Ko je Huck Finnov drug na putovanju?", optionA: "Tom Sawyer", optionB: "Jim, odbjegli rob", optionC: "Kapetan", optionD: "Učitelj", correctAnswer: "b" },
      { questionText: "Čime Huck i Jim putuju?", optionA: "Konjima", optionB: "Splavom niz rijeku Mississippi", optionC: "Brodom", optionD: "Pješice", correctAnswer: "b" },
      { questionText: "Zašto Huck bježi od kuće?", optionA: "Dosadilo mu je", optionB: "Bježi od nasilnog oca", optionC: "Ide u školu", optionD: "Traži blago", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Škola", optionB: "Sloboda, prijateljstvo i borba protiv nepravde", optionC: "Sport", optionD: "Ljubav", correctAnswer: "b" },
    ],
  },
  {
    bookId: "1f35075f-f199-4145-bb56-c54b0c6c02a9",
    title: "Kviz: Put oko svijeta u 80 dana",
    questions: [
      { questionText: "Ko je autor?", optionA: "Jules Verne", optionB: "H.G. Wells", optionC: "Daniel Defoe", optionD: "Jonathan Swift", correctAnswer: "a" },
      { questionText: "Kako se zove glavni junak?", optionA: "Kapetan Nemo", optionB: "Phileas Fogg", optionC: "Passepartout", optionD: "Robinson", correctAnswer: "b" },
      { questionText: "Zašto Fogg putuje oko svijeta?", optionA: "Iz dosade", optionB: "Zbog opklade da to može učiniti za 80 dana", optionC: "Bježi od policije", optionD: "Traži blago", correctAnswer: "b" },
      { questionText: "Ko je Foggov sluga?", optionA: "Sam", optionB: "Passepartout", optionC: "Jim", optionD: "Conseil", correctAnswer: "b" },
      { questionText: "Da li Fogg uspije u opkladi?", optionA: "Ne", optionB: "Da, u posljednji trenutak", optionC: "Odustane", optionD: "Kasni jedan dan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "f29520f4-f845-4768-934e-672b1a2e3740",
    title: "Kviz: Put u središte Zemlje",
    questions: [
      { questionText: "Ko je autor?", optionA: "Jules Verne", optionB: "H.G. Wells", optionC: "Arthur Conan Doyle", optionD: "Edgar Rice Burroughs", correctAnswer: "a" },
      { questionText: "Šta profesor Lidenbrock pronađe?", optionA: "Blago", optionB: "Stari rukopis koji opisuje put u središte Zemlje", optionC: "Mapu", optionD: "Fosil", correctAnswer: "b" },
      { questionText: "Kroz šta junaci ulaze u Zemlju?", optionA: "Tunel", optionB: "Krater vulkana na Islandu", optionC: "Pećinu", optionD: "Rudnik", correctAnswer: "b" },
      { questionText: "Šta pronalaze pod zemljom?", optionA: "Zlato", optionB: "Podzemni ocean i prahistorijska bića", optionC: "Grad", optionD: "Ništa", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Ljubavni roman", optionB: "Naučna fantastika / avantura", optionC: "Biografija", optionD: "Komedija", correctAnswer: "b" },
    ],
  },
  {
    bookId: "14f450da-f3bb-4fc2-ad5c-44dd4a396877",
    title: "Kviz: Robinzon Kruso",
    questions: [
      { questionText: "Ko je autor?", optionA: "Daniel Defoe", optionB: "Robert Louis Stevenson", optionC: "Jules Verne", optionD: "Mark Twain", correctAnswer: "a" },
      { questionText: "Šta se desi Robinzonu?", optionA: "Pobijedi u ratu", optionB: "Brodolom ga ostavi na pustom ostrvu", optionC: "Izgubi se u šumi", optionD: "Bude zarobljen", correctAnswer: "b" },
      { questionText: "Koliko dugo Robinzon živi na ostrvu?", optionA: "Godinu dana", optionB: "Pet godina", optionC: "Oko 28 godina", optionD: "Mjesec dana", correctAnswer: "c" },
      { questionText: "Kako se zove Robinzonov prijatelj na ostrvu?", optionA: "Nedjelja", optionB: "Petak", optionC: "Srijeda", optionD: "Ponedjeljak", correctAnswer: "b" },
      { questionText: "Šta Robinzon nauči na ostrvu?", optionA: "Da pliva", optionB: "Da preživi koristeći snalažljivost", optionC: "Da leti", optionD: "Da razgovara sa životinjama", correctAnswer: "b" },
    ],
  },
  {
    bookId: "62aa0823-9880-432e-8032-a6e48ca24259",
    title: "Kviz: Romeo i Julija",
    questions: [
      { questionText: "Ko je autor?", optionA: "William Shakespeare", optionB: "Charles Dickens", optionC: "Oscar Wilde", optionD: "George Bernard Shaw", correctAnswer: "a" },
      { questionText: "Koji je odnos između porodica Montague i Capulet?", optionA: "Prijatelji su", optionB: "Zavađene su", optionC: "Rodbina su", optionD: "Poslovni partneri", correctAnswer: "b" },
      { questionText: "Gdje se Romeo i Julija upoznaju?", optionA: "U školi", optionB: "Na balu kod Capuleta", optionC: "Na ulici", optionD: "U crkvi", correctAnswer: "b" },
      { questionText: "Koji grad je pozornica drame?", optionA: "Rim", optionB: "Verona", optionC: "Venecija", optionD: "Firenca", correctAnswer: "b" },
      { questionText: "Kakav kraj ima drama?", optionA: "Sretan", optionB: "Tragičan - oboje umiru", optionC: "Otvoren", optionD: "Komičan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "af376542-d90f-44bb-9f00-dd284e106631",
    title: "Kviz: Ružno pače",
    questions: [
      { questionText: "Ko je autor?", optionA: "Braća Grimm", optionB: "H. C. Andersen", optionC: "Charles Perrault", optionD: "Oscar Wilde", correctAnswer: "b" },
      { questionText: "Zašto je pače 'ružno'?", optionA: "Jer je bolesno", optionB: "Jer je drugačije od ostale pačadi", optionC: "Jer je prljavo", optionD: "Jer je malo", correctAnswer: "b" },
      { questionText: "Šta se desi s pačetom na kraju?", optionA: "Ostane ružno", optionB: "Izraste u prekrasnog labuda", optionC: "Pobjegne", optionD: "Nestane", correctAnswer: "b" },
      { questionText: "Koja je pouka bajke?", optionA: "Treba biti lijep", optionB: "Ne treba suditi po vanjštini, svako ima svoju ljepotu", optionC: "Treba se uklopiti", optionD: "Treba biti jak", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je bajka namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
    ],
  },
  {
    bookId: "0ff7ff43-d6bb-4463-8fcf-7c52b2bd02cf",
    title: "Kviz: Saga o čuvarima",
    questions: [
      { questionText: "Ko je autor?", optionA: "Rick Riordan", optionB: "Kathryn Lasky", optionC: "J.K. Rowling", optionD: "Christopher Paolini", correctAnswer: "b" },
      { questionText: "O kakvim likovima govori serijal?", optionA: "O ljudima", optionB: "O sovama", optionC: "O zmajovima", optionD: "O vukovima", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Harry", optionB: "Soren", optionC: "Eragon", optionD: "Percy", correctAnswer: "b" },
      { questionText: "Šta čuvari čuvaju?", optionA: "Blago", optionB: "Mir i pravdu u svijetu sova", optionC: "Šumu", optionD: "Grad", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje serijal?", optionA: "Komedija", optionB: "Fantasy / avantura", optionC: "Biografija", optionD: "Historijski roman", correctAnswer: "b" },
    ],
  },
  {
    bookId: "c442efe2-cbe9-4c80-a87f-33bb3a9bc5e7",
    title: "Kviz: Sidarta",
    questions: [
      { questionText: "Ko je autor?", optionA: "Franz Kafka", optionB: "Hermann Hesse", optionC: "Thomas Mann", optionD: "Albert Camus", correctAnswer: "b" },
      { questionText: "O čemu govori roman?", optionA: "O ratu", optionB: "O duhovnom putovanju i potrazi za smislom života", optionC: "O ljubavi", optionD: "O školi", correctAnswer: "b" },
      { questionText: "U kojoj kulturi se odvija radnja?", optionA: "Evropskoj", optionB: "Indijskoj / budističkoj", optionC: "Afričkoj", optionD: "Američkoj", correctAnswer: "b" },
      { questionText: "Šta Sidarta traži?", optionA: "Blago", optionB: "Prosvjetljenje i unutarnji mir", optionC: "Moć", optionD: "Slavu", correctAnswer: "b" },
      { questionText: "Šta rijeka simbolizira u romanu?", optionA: "Opasnost", optionB: "Tok života i mudrost", optionC: "Granica", optionD: "Smrt", correctAnswer: "b" },
    ],
  },
  {
    bookId: "33d198bc-d20c-41a5-9026-e5da9a20ccd5",
    title: "Kviz: Sjaj u očima",
    questions: [
      { questionText: "Ko je autor?", optionA: "Nicholas Sparks", optionB: "John Green", optionC: "Jodi Picoult", optionD: "Danielle Steel", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Romantični roman", optionC: "Horor", optionD: "Kriminalistički roman", correctAnswer: "b" },
      { questionText: "O čemu najčešće pišu romani Nicholasa Sparksa?", optionA: "O avanturama", optionB: "O ljubavi i ljudskim odnosima", optionC: "O sportu", optionD: "O ratu", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "d" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Komičan", optionB: "Emotivan i romantičan", optionC: "Satiričan", optionD: "Strašan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "9b88e178-b72d-4a9d-aa5d-e0aa8945d977",
    title: "Kviz: Sjena vjetra",
    questions: [
      { questionText: "Ko je autor?", optionA: "Carlos Ruiz Zafón", optionB: "Gabriel García Márquez", optionC: "Paulo Coelho", optionD: "Isabel Allende", correctAnswer: "a" },
      { questionText: "Kako se zove glavni junak?", optionA: "David", optionB: "Daniel Sempere", optionC: "Oscar", optionD: "Carlos", correctAnswer: "b" },
      { questionText: "Šta Daniel pronađe na 'Groblju zaboravljenih knjiga'?", optionA: "Staru mapu", optionB: "Knjigu koja mu promijeni život", optionC: "Blago", optionD: "Tajni prolaz", correctAnswer: "b" },
      { questionText: "U kojem gradu se odvija radnja?", optionA: "Madrid", optionB: "Barcelona", optionC: "Lisabon", optionD: "Pariz", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Komedija", optionB: "Gotički misterij / literarni triler", optionC: "Biografija", optionD: "Naučna fantastika", correctAnswer: "b" },
    ],
  },
  {
    bookId: "722be5f3-15c3-4688-b816-e9606ac2d81b",
    title: "Kviz: Sjenka i kost",
    questions: [
      { questionText: "Ko je autor?", optionA: "Victoria Aveyard", optionB: "Leigh Bardugo", optionC: "Sarah J. Maas", optionD: "Veronica Roth", correctAnswer: "b" },
      { questionText: "U kakvom svijetu se odvija radnja?", optionA: "U našem svijetu", optionB: "U Ravki - svijetu inspirisanom Rusijom", optionC: "U budućnosti", optionD: "U svemiru", correctAnswer: "b" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Inej", optionB: "Alina Starkov", optionC: "Nina", optionD: "Genya", correctAnswer: "b" },
      { questionText: "Šta Alina otkriva o sebi?", optionA: "Da je princeza", optionB: "Da je Grisha - da ima moć prizivanja sunčeve svjetlosti", optionC: "Da je robot", optionD: "Da može letjeti", correctAnswer: "b" },
      { questionText: "Ko je Darkling?", optionA: "Alinín brat", optionB: "Moćni Grisha i antagonist", optionC: "Kralj", optionD: "Učitelj", correctAnswer: "b" },
    ],
  },
  {
    bookId: "b1704527-c43f-4724-b5eb-c765530d783d",
    title: "Kviz: Sjeverna svjetlost (Zlatni kompas)",
    questions: [
      { questionText: "Ko je autor?", optionA: "C.S. Lewis", optionB: "Philip Pullman", optionC: "J.R.R. Tolkien", optionD: "Rick Riordan", correctAnswer: "b" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Lucy", optionB: "Lyra Belacqua", optionC: "Hermiona", optionD: "Tris", correctAnswer: "b" },
      { questionText: "Šta je alethiometer (zlatni kompas)?", optionA: "Sat", optionB: "Instrument koji govori istinu", optionC: "Kompas za navigaciju", optionD: "Čarobni prsten", correctAnswer: "b" },
      { questionText: "Šta su daemoni u ovom svijetu?", optionA: "Zli duhovi", optionB: "Životinjska manifestacija duše svake osobe", optionC: "Kućni ljubimci", optionD: "Roboti", correctAnswer: "b" },
      { questionText: "Kako se zove Lyrin daemon?", optionA: "Aslan", optionB: "Pantalaimon", optionC: "Stelmaria", optionD: "Kirjava", correctAnswer: "b" },
    ],
  },
  {
    bookId: "bcd1d5e9-1fcd-4017-97de-dafbf187ee29",
    title: "Kviz: Slika Doriana Graya",
    questions: [
      { questionText: "Ko je autor?", optionA: "Oscar Wilde", optionB: "Charles Dickens", optionC: "Bram Stoker", optionD: "Jane Austen", correctAnswer: "a" },
      { questionText: "Šta se dešava sa Dorianovim portretom?", optionA: "Nestaje", optionB: "Stari umjesto njega", optionC: "Sjaji", optionD: "Govori", correctAnswer: "b" },
      { questionText: "Šta Dorian želi?", optionA: "Bogatsvo", optionB: "Vječnu mladost i ljepotu", optionC: "Moć", optionD: "Slavu", correctAnswer: "b" },
      { questionText: "Ko utiče na Doriana negativno?", optionA: "Basil", optionB: "Lord Henry", optionC: "Sibyl", optionD: "Njegov otac", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Ljubav", optionB: "Narcizam, moral i posljedice hedonizma", optionC: "Putovanje", optionD: "Prijateljstvo", correctAnswer: "b" },
    ],
  },
  {
    bookId: "925a2d7b-7a45-4abc-ade4-a234dba6f247",
    title: "Kviz: Smaragdni grad",
    questions: [
      { questionText: "Ko je autor?", optionA: "L. Frank Baum", optionB: "C.S. Lewis", optionC: "J.M. Barrie", optionD: "Carlo Collodi", correctAnswer: "a" },
      { questionText: "Kako se zove djevojčica koja putuje u Oz?", optionA: "Alice", optionB: "Dorothy", optionC: "Wendy", optionD: "Gretel", correctAnswer: "b" },
      { questionText: "Ko su Dorothyni saputnici?", optionA: "Pas, mačka i ptica", optionB: "Strašilo, Limeni čovjek i Kukavni lav", optionC: "Tri patuljka", optionD: "Dva vilenjaka", correctAnswer: "b" },
      { questionText: "Šta Dorothy želi?", optionA: "Blago", optionB: "Vratiti se kući", optionC: "Postati kraljica", optionD: "Letjeti", correctAnswer: "b" },
      { questionText: "Koji je grad u zemlji Oz?", optionA: "Zlatni grad", optionB: "Smaragdni grad", optionC: "Dijamantni grad", optionD: "Srebrni grad", correctAnswer: "b" },
    ],
  },
  {
    bookId: "3fb71dfb-860b-4e4b-b31c-45986fe446be",
    title: "Kviz: Smogovci",
    questions: [
      { questionText: "Ko je autor?", optionA: "Hrvoje Hitrec", optionB: "Ivan Kušan", optionC: "Mato Lovrak", optionD: "Ante Gardaš", correctAnswer: "a" },
      { questionText: "Ko su 'Smogovci'?", optionA: "Sportski tim", optionB: "Grupa dječaka iz Zagreba", optionC: "Životinje", optionD: "Roboti", correctAnswer: "b" },
      { questionText: "U kojem gradu se odvija radnja?", optionA: "Sarajevo", optionB: "Zagreb", optionC: "Beograd", optionD: "Ljubljana", correctAnswer: "b" },
      { questionText: "O čemu govori knjiga?", optionA: "O ratu", optionB: "O svakodnevnom životu, prijateljstvu i nestašlucima", optionC: "O putovanju", optionD: "O sportu", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Realistični dječji roman", optionC: "Bajka", optionD: "Naučna fantastika", correctAnswer: "b" },
    ],
  },
  {
    bookId: "928c8df0-ddf7-4815-8f03-20c0af5465b0",
    title: "Kviz: Snjeguljica",
    questions: [
      { questionText: "Ko je napisao bajku?", optionA: "H. C. Andersen", optionB: "Braća Grimm", optionC: "Charles Perrault", optionD: "Oscar Wilde", correctAnswer: "b" },
      { questionText: "Koliko patuljaka živi sa Snjeguljicom?", optionA: "Pet", optionB: "Šest", optionC: "Sedam", optionD: "Osam", correctAnswer: "c" },
      { questionText: "Čime zla kraljica truje Snjeguljicu?", optionA: "Vodom", optionB: "Otrovnom jabukom", optionC: "Kolačem", optionD: "Čajem", correctAnswer: "b" },
      { questionText: "Ko spasi Snjeguljicu?", optionA: "Patuljci", optionB: "Princ", optionC: "Lovac", optionD: "Vila", correctAnswer: "b" },
      { questionText: "Šta zla kraljica stalno pita ogledalo?", optionA: "Koliko je sat", optionB: "Ko je najljepša na svijetu", optionC: "Gdje je Snjeguljica", optionD: "Kako da postane mlađa", correctAnswer: "b" },
    ],
  },
  {
    bookId: "09beddf0-a3e5-4e78-9ebb-d17f7e5a6679",
    title: "Kviz: Srce od tinte",
    questions: [
      { questionText: "Ko je autor?", optionA: "Cornelia Funke", optionB: "J.K. Rowling", optionC: "Neil Gaiman", optionD: "Philip Pullman", correctAnswer: "a" },
      { questionText: "Šta može Meggijev otac Mo?", optionA: "Letjeti", optionB: "Čitanjem naglas oživjeti likove iz knjiga", optionC: "Nestati", optionD: "Razgovarati sa životinjama", correctAnswer: "b" },
      { questionText: "Koji lik izlazi iz knjige?", optionA: "Gandalf", optionB: "Capricorn", optionC: "Voldemort", optionD: "Sauron", correctAnswer: "b" },
      { questionText: "Šta se desi kad lik izađe iz knjige?", optionA: "Ništa", optionB: "Neko iz stvarnog svijeta ulazi u knjigu", optionC: "Knjiga nestane", optionD: "Svijet se mijenja", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Putovanje", optionB: "Moć riječi i priča", optionC: "Sport", optionD: "Škola", correctAnswer: "b" },
    ],
  },
  {
    bookId: "1dcec37b-aa72-4f4a-912f-2304270f7b23",
    title: "Kviz: Srebrna česma",
    questions: [
      { questionText: "Ko je autor?", optionA: "Šimo Ešić", optionB: "Alija Dubočanin", optionC: "Branko Ćopić", optionD: "Ahmet Hromadžić", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Fantasy", optionB: "Lektira", optionC: "Naučna fantastika", optionD: "Biografija", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je djelo namijenjeno?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
      { questionText: "O čemu govori djelo?", optionA: "O gradu", optionB: "O životu u Bosni i odrastanju", optionC: "O putovanju", optionD: "O sportu", correctAnswer: "b" },
      { questionText: "Šta 'srebrna česma' simbolizira?", optionA: "Bogatsvo", optionB: "Čistoću i izvor života", optionC: "Moć", optionD: "Tugu", correctAnswer: "b" },
    ],
  },
  {
    bookId: "84e0fa7a-0e73-4937-9143-2994d7b60fa9",
    title: "Kviz: Sretni princ",
    questions: [
      { questionText: "Ko je autor?", optionA: "Oscar Wilde", optionB: "H. C. Andersen", optionC: "Charles Perrault", optionD: "Braća Grimm", correctAnswer: "a" },
      { questionText: "Ko je Sretni princ?", optionA: "Živi princ", optionB: "Kip princa ukrašen dragim kamenjem", optionC: "Lutka", optionD: "Duh", correctAnswer: "b" },
      { questionText: "Ko pomaže princu dijeliti blago siromašnima?", optionA: "Golub", optionB: "Lastavica", optionC: "Orao", optionD: "Vrabac", correctAnswer: "b" },
      { questionText: "Šta princ želi učiniti za ljude?", optionA: "Vladati njima", optionB: "Pomoći siromašnima dajući im svoje dragulje", optionC: "Zabaviti ih", optionD: "Učiti ih", correctAnswer: "b" },
      { questionText: "Koja je pouka bajke?", optionA: "Bogatsvo je najvažnije", optionB: "Nesebičnost i dobrota su prave vrijednosti", optionC: "Treba čuvati blago", optionD: "Treba biti sretan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "334fca16-5dec-4294-9267-757f2af61b4b",
    title: "Kviz: Starac i more",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ernest Hemingway", optionB: "Herman Melville", optionC: "Jack London", optionD: "John Steinbeck", correctAnswer: "a" },
      { questionText: "Kako se zove starac?", optionA: "Pedro", optionB: "Santiago", optionC: "Juan", optionD: "Carlos", correctAnswer: "b" },
      { questionText: "Šta Santiago ulovi?", optionA: "Kitova", optionB: "Ogromnog marlina", optionC: "Morskog psa", optionD: "Hobotnica", correctAnswer: "b" },
      { questionText: "Koliko dana Santiago nije ništa ulovio?", optionA: "40", optionB: "84", optionC: "100", optionD: "30", correctAnswer: "b" },
      { questionText: "Koja je glavna poruka?", optionA: "Treba odustati", optionB: "Čovjek može biti uništen ali ne i poražen", optionC: "Treba izbjegavati rizik", optionD: "More je opasno", correctAnswer: "b" },
    ],
  },
  {
    bookId: "bb5b67db-2899-4141-beea-1aa6dadd4b67",
    title: "Kviz: Stepski vuk",
    questions: [
      { questionText: "Ko je autor?", optionA: "Franz Kafka", optionB: "Hermann Hesse", optionC: "Thomas Mann", optionD: "Albert Camus", correctAnswer: "b" },
      { questionText: "Kako se zove glavni junak?", optionA: "Emil Sinclair", optionB: "Harry Haller", optionC: "Sidarta", optionD: "Narcis", correctAnswer: "b" },
      { questionText: "Šta 'stepski vuk' predstavlja?", optionA: "Pravu životinju", optionB: "Harryjevu divlju, usamljenu stranu", optionC: "Njegovu porodicu", optionD: "Grad", correctAnswer: "b" },
      { questionText: "Kakav je Harry na početku romana?", optionA: "Sretan", optionB: "Usamljen i razočaran životom", optionC: "Avanturističan", optionD: "Bogat", correctAnswer: "b" },
      { questionText: "Šta je 'Magično kazalište' u romanu?", optionA: "Pravo pozorište", optionB: "Mjesto samospoznaje i fantazije", optionC: "Cirkus", optionD: "Škola", correctAnswer: "b" },
    ],
  },
  {
    bookId: "76322499-e279-4181-be9a-88da7610d708",
    title: "Kviz: Sto godina samoće",
    questions: [
      { questionText: "Ko je autor?", optionA: "Isabel Allende", optionB: "Gabriel García Márquez", optionC: "Paulo Coelho", optionD: "Jorge Luis Borges", correctAnswer: "b" },
      { questionText: "Kako se zove porodica u centru romana?", optionA: "García", optionB: "Buendía", optionC: "Márquez", optionD: "Morales", correctAnswer: "b" },
      { questionText: "Kako se zove grad koji osnuje porodica?", optionA: "El Dorado", optionB: "Macondo", optionC: "Buenos Aires", optionD: "Bogota", correctAnswer: "b" },
      { questionText: "Koji literarni stil koristi autor?", optionA: "Realizam", optionB: "Magijski realizam", optionC: "Naturalizam", optionD: "Romantizam", correctAnswer: "b" },
      { questionText: "Koliko generacija prati roman?", optionA: "Tri", optionB: "Sedam", optionC: "Pet", optionD: "Deset", correctAnswer: "b" },
    ],
  },
  {
    bookId: "502536fb-f660-4d67-8580-3d6526c7a4ff",
    title: "Kviz: Strah u Ulici lipa",
    questions: [
      { questionText: "Ko je autor?", optionA: "Milivoj Matošec", optionB: "Ivan Kušan", optionC: "Ante Gardaš", optionD: "Mato Lovrak", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Ljubavni roman", optionB: "Dječji avanturistički / mystery", optionC: "Biografija", optionD: "Poezija", correctAnswer: "b" },
      { questionText: "Šta djeca istražuju?", optionA: "Školu", optionB: "Misteriozne događaje u svojoj ulici", optionC: "Šumu", optionD: "More", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je knjiga namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Tužan", optionB: "Napeta i uzbudljiva", optionC: "Satiričan", optionD: "Romantičan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "d06f8edc-4e5d-433e-9cf5-8d2a87b1512a",
    title: "Kviz: Stranac",
    questions: [
      { questionText: "Ko je autor?", optionA: "Albert Camus", optionB: "Jean-Paul Sartre", optionC: "Franz Kafka", optionD: "Hermann Hesse", correctAnswer: "a" },
      { questionText: "Kako se zove glavni junak?", optionA: "Jean", optionB: "Meursault", optionC: "Pierre", optionD: "Jacques", correctAnswer: "b" },
      { questionText: "Kako Meursault reaguje na smrt majke?", optionA: "Plače", optionB: "Ravnodušno", optionC: "Bijesno", optionD: "Sretan je", correctAnswer: "b" },
      { questionText: "Šta Meursault učini na plaži?", optionA: "Pliva", optionB: "Ubije Arapina", optionC: "Spava", optionD: "Čita", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Ljubav", optionB: "Apsurd ljudskog postojanja", optionC: "Putovanje", optionD: "Prijateljstvo", correctAnswer: "b" },
    ],
  },
  {
    bookId: "6e489a25-3482-47a7-a34b-1f80a33dbcc3",
    title: "Kviz: Sumnjivo lice",
    questions: [
      { questionText: "Ko je autor?", optionA: "Branislav Nušić", optionB: "Ivo Andrić", optionC: "Meša Selimović", optionD: "Petar Kočić", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Tragedija", optionB: "Komedija", optionC: "Roman", optionD: "Poezija", correctAnswer: "b" },
      { questionText: "Šta je 'sumnjivo lice' u djelu?", optionA: "Kriminalac", optionB: "Osoba pogrešno optužena ili osumnjičena", optionC: "Špijun", optionD: "Političar", correctAnswer: "b" },
      { questionText: "Šta djelo ismijava?", optionA: "Školu", optionB: "Birokratiju i policijsku vlast", optionC: "Porodicu", optionD: "Sport", correctAnswer: "b" },
      { questionText: "Kakav humor koristi Nušić?", optionA: "Crni", optionB: "Satiričan i duhovit", optionC: "Apsurdan", optionD: "Bez humora", correctAnswer: "b" },
    ],
  },
  {
    bookId: "97bf2c59-9244-42bf-b974-63af0bff2e02",
    title: "Kviz: Sumrak saga",
    questions: [
      { questionText: "Ko je autor?", optionA: "Stephenie Meyer", optionB: "Alyson Noel", optionC: "Cassandra Clare", optionD: "Richelle Mead", correctAnswer: "a" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Ever", optionB: "Bella Swan", optionC: "Clary", optionD: "Rose", correctAnswer: "b" },
      { questionText: "Šta je Edward Cullen?", optionA: "Vukodlak", optionB: "Vampir", optionC: "Čarobnjak", optionD: "Anđeo", correctAnswer: "b" },
      { questionText: "Ko je Jacob Black?", optionA: "Vampir", optionB: "Vukodlak", optionC: "Čovjek", optionD: "Vilenjak", correctAnswer: "b" },
      { questionText: "Koliko knjiga ima serijal?", optionA: "Tri", optionB: "Četiri", optionC: "Pet", optionD: "Šest", correctAnswer: "b" },
    ],
  },
  {
    bookId: "74eaeba6-7908-40a5-9f4a-08617a33c7de",
    title: "Kviz: Sunčani kristali",
    questions: [
      { questionText: "Ko je autor?", optionA: "Advan Hozić", optionB: "Alija Dubočanin", optionC: "Šimo Ešić", optionD: "Branko Ćopić", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Fantasy", optionB: "Lektira", optionC: "Naučna fantastika", optionD: "Drama", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je djelo namijenjeno?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
      { questionText: "O čemu govori djelo?", optionA: "O gradu", optionB: "O djetinjstvu, ljepoti života i prirodi", optionC: "O ratu", optionD: "O sportu", correctAnswer: "b" },
      { questionText: "Šta 'sunčani kristali' simboliziraju?", optionA: "Blago", optionB: "Ljepotu i radost djetinjstva", optionC: "Moć", optionD: "Tugu", correctAnswer: "b" },
    ],
  },
  {
    bookId: "279152b3-ff61-4a9d-bac5-d27549c737c8",
    title: "Kviz: Sve, baš sve",
    questions: [
      { questionText: "Ko je autor?", optionA: "Rainbow Rowell", optionB: "Nicola Yoon", optionC: "Jenny Han", optionD: "John Green", correctAnswer: "b" },
      { questionText: "Zašto Maddy ne može izaći iz kuće?", optionA: "Kažnjena je", optionB: "Ima rijetku bolest (SCID) zbog koje je alergična na sve", optionC: "Nema prijatelje", optionD: "Boji se", correctAnswer: "b" },
      { questionText: "Ko je Olly?", optionA: "Liječnik", optionB: "Novi susjed u koga se Maddy zaljubi", optionC: "Brat", optionD: "Učitelj", correctAnswer: "b" },
      { questionText: "Šta Maddy odluči učiniti?", optionA: "Ostati kod kuće", optionB: "Riskirati i izaći u svijet", optionC: "Promijeniti liječnika", optionD: "Pisati knjigu", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Sport", optionB: "Ljubav, sloboda i rizik", optionC: "Škola", optionD: "Putovanje", correctAnswer: "b" },
    ],
  },
  {
    bookId: "10fa3f22-d202-41cd-94c4-f848eb571e45",
    title: "Kviz: Svijet po Bobu",
    questions: [
      { questionText: "Ko je autor?", optionA: "James Bowen", optionB: "Eric Knight", optionC: "Anna Sewell", optionD: "Jack London", correctAnswer: "a" },
      { questionText: "Ko je Bob?", optionA: "Pas", optionB: "Riđi ulični mačak", optionC: "Papagaj", optionD: "Zec", correctAnswer: "b" },
      { questionText: "Da li je priča zasnovana na istinitom događaju?", optionA: "Da", optionB: "Ne", optionC: "Djelomično", optionD: "Nije poznato", correctAnswer: "a" },
      { questionText: "Kako Bob pomaže Jamesu?", optionA: "Donosi mu hranu", optionB: "Daje mu razlog da se promijeni i živi bolje", optionC: "Čuva ga", optionD: "Zarađuje novac", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Avantura", optionB: "Prijateljstvo između čovjeka i životinje, iskupljenje", optionC: "Sport", optionD: "Škola", correctAnswer: "b" },
    ],
  },
  {
    bookId: "73bc5de6-b55d-4f89-9d60-139a896438c3",
    title: "Kviz: Tajna mračnog podruma",
    questions: [
      { questionText: "Ko je autor?", optionA: "Enid Blyton", optionB: "Roald Dahl", optionC: "Ante Gardaš", optionD: "Astrid Lindgren", correctAnswer: "a" },
      { questionText: "Šta djeca istražuju?", optionA: "Šumu", optionB: "Mračni podrum pun tajni", optionC: "Školu", optionD: "More", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Poezija", optionB: "Dječji avanturistički / mystery", optionC: "Biografija", optionD: "Drama", correctAnswer: "b" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Tužan", optionB: "Napeta i uzbudljiva", optionC: "Romantičan", optionD: "Satiričan", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
    ],
  },
  {
    bookId: "6a6c7ad1-6e83-4c3a-bda6-3e2ec9ba8fa7",
    title: "Kviz: Tajni dnevnik Adriana Molea",
    questions: [
      { questionText: "Ko je autor?", optionA: "Sue Townsend", optionB: "Jeff Kinney", optionC: "Roald Dahl", optionD: "Judy Blume", correctAnswer: "a" },
      { questionText: "Koliko godina ima Adrian na početku?", optionA: "11", optionB: "13 i 3/4", optionC: "15", optionD: "10", correctAnswer: "b" },
      { questionText: "U kakvom formatu je knjiga?", optionA: "Roman", optionB: "Dnevnik", optionC: "Strip", optionD: "Drama", correctAnswer: "b" },
      { questionText: "O čemu Adrian piše?", optionA: "O putovanjima", optionB: "O tinejdžerskim problemima, školi i porodici", optionC: "O sportu", optionD: "O životinjama", correctAnswer: "b" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Tužan", optionB: "Humorističan i ironičan", optionC: "Strašan", optionD: "Romantičan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "244875a1-f01c-440c-9dbf-ad3ec3710bde",
    title: "Kviz: Tajni vrt",
    questions: [
      { questionText: "Ko je autor?", optionA: "Frances Hodgson Burnett", optionB: "Johanna Spyri", optionC: "Louisa May Alcott", optionD: "Astrid Lindgren", correctAnswer: "a" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Sara", optionB: "Mary Lennox", optionC: "Heidi", optionD: "Pollyanna", correctAnswer: "b" },
      { questionText: "Šta Mary pronađe na imanju?", optionA: "Blago", optionB: "Zaključani, zaboravljeni vrt", optionC: "Tajni tunel", optionD: "Staru kuću", correctAnswer: "b" },
      { questionText: "Šta se desi kad Mary obnovi vrt?", optionA: "Ništa", optionB: "Vrt oživljava, a Mary i Colin postaju zdraviji i sretniji", optionC: "Vrt se zatvori", optionD: "Porodica se seli", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Putovanje", optionB: "Iscjeljujuća moć prirode i prijateljstva", optionC: "Sport", optionD: "Škola", correctAnswer: "b" },
    ],
  },
  {
    bookId: "4ffdbba3-45a9-470c-87e9-ffbe05b47452",
    title: "Kviz: Tiha rijeka djetinjstva",
    questions: [
      { questionText: "Ko je autor?", optionA: "Alija Dubočanin", optionB: "Branko Ćopić", optionC: "Šimo Ešić", optionD: "Ahmet Hromadžić", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovo djelo?", optionA: "Fantasy", optionB: "Lektira", optionC: "Naučna fantastika", optionD: "Drama", correctAnswer: "b" },
      { questionText: "O čemu govori djelo?", optionA: "O gradu", optionB: "O djetinjstvu i odrastanju uz rijeku", optionC: "O ratu", optionD: "O sportu", correctAnswer: "b" },
      { questionText: "Šta rijeka simbolizira u djelu?", optionA: "Opasnost", optionB: "Tok djetinjstva i sjećanja", optionC: "Bogatsvo", optionD: "Moć", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je djelo namijenjeno?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
    ],
  },
  {
    bookId: "c0b6be54-7edd-49d7-947a-1e094141bfda",
    title: "Kviz: Tom Sojer",
    questions: [
      { questionText: "Ko je autor?", optionA: "Mark Twain", optionB: "Charles Dickens", optionC: "Daniel Defoe", optionD: "Jules Verne", correctAnswer: "a" },
      { questionText: "Gdje Tom živi?", optionA: "U New Yorku", optionB: "U malom gradiću na rijeci Mississippi", optionC: "U Londonu", optionD: "U Parizu", correctAnswer: "b" },
      { questionText: "Ko je Tomov najbolji prijatelj?", optionA: "Sid", optionB: "Huckleberry Finn", optionC: "Joe Harper", optionD: "Injun Joe", correctAnswer: "b" },
      { questionText: "Šta Tom radi s ogradom koju treba ofarbati?", optionA: "Sam je farba", optionB: "Nagovori drugu djecu da je farbaju za njega", optionC: "Pobjegne", optionD: "Plati nekoga", correctAnswer: "b" },
      { questionText: "Šta Tom i Huck pronalaze u pećini?", optionA: "Životinje", optionB: "Zakopano blago", optionC: "Izlaz", optionD: "Stare kosti", correctAnswer: "b" },
    ],
  },
  {
    bookId: "a9e5f03a-9555-4b11-b943-b04d921f715c",
    title: "Kviz: Ubiti pticu rugalicu",
    questions: [
      { questionText: "Ko je autor?", optionA: "Harper Lee", optionB: "Mark Twain", optionC: "John Steinbeck", optionD: "Ernest Hemingway", correctAnswer: "a" },
      { questionText: "Kako se zove otac glavnih junaka?", optionA: "Bob Ewell", optionB: "Atticus Finch", optionC: "Tom Robinson", optionD: "Boo Radley", correctAnswer: "b" },
      { questionText: "Koga Atticus brani na sudu?", optionA: "Svog sina", optionB: "Toma Robinsona, crnca lažno optuženog za silovanje", optionC: "Svoju kćer", optionD: "Susjeda", correctAnswer: "b" },
      { questionText: "Kako se zove kćer pripovijedačica?", optionA: "Jem", optionB: "Scout", optionC: "Dill", optionD: "Miss Maudie", correctAnswer: "b" },
      { questionText: "Šta 'ubiti pticu rugalicu' simbolizira?", optionA: "Lov", optionB: "Uništiti nevinost i dobrotu", optionC: "Pobjedu", optionD: "Slobodu", correctAnswer: "b" },
    ],
  },
  {
    bookId: "04266ba2-63e3-4c58-95a2-d10dd0f9f5c4",
    title: "Kviz: Umorstva u ulici Morgue",
    questions: [
      { questionText: "Ko je autor?", optionA: "Edgar Allan Poe", optionB: "Arthur Conan Doyle", optionC: "Agatha Christie", optionD: "Bram Stoker", correctAnswer: "a" },
      { questionText: "Ko je detektiv u priči?", optionA: "Sherlock Holmes", optionB: "C. Auguste Dupin", optionC: "Hercule Poirot", optionD: "Philip Marlowe", correctAnswer: "b" },
      { questionText: "Ova priča se smatra prvom detektivskom pričom u historiji. Da ili ne?", optionA: "Da", optionB: "Ne", optionC: "Možda", optionD: "Nije poznato", correctAnswer: "a" },
      { questionText: "Šta se desi u ulici Morgue?", optionA: "Pljačka", optionB: "Brutalno ubistvo", optionC: "Nestanak", optionD: "Požar", correctAnswer: "b" },
      { questionText: "Kakav ton ima priča?", optionA: "Veseo", optionB: "Mračan i misteriozan", optionC: "Romantičan", optionD: "Komičan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "b8a9f917-657a-4d55-89ec-6e45d5d16516",
    title: "Kviz: Uzbuna na Zelenom Vrhu",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ivan Kušan", optionB: "Mato Lovrak", optionC: "Ante Gardaš", optionD: "Branko Ćopić", correctAnswer: "a" },
      { questionText: "Ko su glavni junaci?", optionA: "Odrasli", optionB: "Grupa dječaka iz Zelenog Vrha", optionC: "Učitelji", optionD: "Životinje", correctAnswer: "b" },
      { questionText: "Šta djeca istražuju?", optionA: "Šumu", optionB: "Sumnjive događaje u svom kraju", optionC: "Školu", optionD: "More", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Dječji kriminalistički / avanturistički roman", optionC: "Bajka", optionD: "Biografija", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
    ],
  },
  {
    bookId: "32670268-6f82-40c7-9472-14644d687eaa",
    title: "Kviz: Veliki Gatsby",
    questions: [
      { questionText: "Ko je autor?", optionA: "F. Scott Fitzgerald", optionB: "Ernest Hemingway", optionC: "J.D. Salinger", optionD: "John Steinbeck", correctAnswer: "a" },
      { questionText: "Kako se zove pripovijedač?", optionA: "Jay Gatsby", optionB: "Nick Carraway", optionC: "Tom Buchanan", optionD: "Jordan Baker", correctAnswer: "b" },
      { questionText: "Koga Gatsby voli?", optionA: "Jordan", optionB: "Daisy Buchanan", optionC: "Myrtle", optionD: "Catherine", correctAnswer: "b" },
      { questionText: "U kojem periodu se odvija radnja?", optionA: "1950-ih", optionB: "1920-ih (Jazz doba)", optionC: "1940-ih", optionD: "1900-ih", correctAnswer: "b" },
      { questionText: "Šta zeleno svjetlo na doku simbolizira?", optionA: "Bogatsvo", optionB: "Gatsbyjev nedostižni san i nadu", optionC: "Opasnost", optionD: "Slobodu", correctAnswer: "b" },
    ],
  },
  {
    bookId: "fef8489a-5694-4e65-b4a1-2d461246568f",
    title: "Kviz: Veliki dobroćudni džin",
    questions: [
      { questionText: "Ko je autor?", optionA: "Roald Dahl", optionB: "Enid Blyton", optionC: "C.S. Lewis", optionD: "Astrid Lindgren", correctAnswer: "a" },
      { questionText: "Kako se zove djevojčica u priči?", optionA: "Matilda", optionB: "Sophie", optionC: "Alice", optionD: "Mary", correctAnswer: "b" },
      { questionText: "Šta VDD (Veliki dobroćudni džin) radi?", optionA: "Jede ljude", optionB: "Puše snove djeci", optionC: "Gradi kuće", optionD: "Lovi životinje", correctAnswer: "b" },
      { questionText: "Po čemu se VDD razlikuje od ostalih divova?", optionA: "Veći je", optionB: "Ne jede ljude i dobar je", optionC: "Brži je", optionD: "Ljepši je", correctAnswer: "b" },
      { questionText: "Kome Sophie i VDD traže pomoć?", optionA: "Policiji", optionB: "Kraljici Engleske", optionC: "Vojsci", optionD: "Drugim divovima", correctAnswer: "b" },
    ],
  },
  {
    bookId: "912c28b0-533b-4b56-9b08-57f468242973",
    title: "Kviz: Vjetar u vrbama",
    questions: [
      { questionText: "Ko je autor?", optionA: "Kenneth Grahame", optionB: "Beatrix Potter", optionC: "A.A. Milne", optionD: "Rudyard Kipling", correctAnswer: "a" },
      { questionText: "Ko su glavni likovi?", optionA: "Ljudi", optionB: "Životinje: Krtica, Vodena voluharica, Žaba i Jazavac", optionC: "Roboti", optionD: "Vilenjaci", correctAnswer: "b" },
      { questionText: "Kakav je gospodin Žaba?", optionA: "Tih i skroman", optionB: "Hvalisav, bogat i sklon avanturama", optionC: "Tužan", optionD: "Zao", correctAnswer: "b" },
      { questionText: "Gdje se odvija priča?", optionA: "U gradu", optionB: "Uz rijeku i u engleskoj prirodi", optionC: "U pustinji", optionD: "Na moru", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Škola", optionB: "Prijateljstvo, priroda i dom", optionC: "Sport", optionD: "Tehnologija", correctAnswer: "b" },
    ],
  },
  {
    bookId: "db1ea6a7-f488-49ab-89ac-2360a6997f7c",
    title: "Kviz: Vodič kroz galaksiju za autostopere",
    questions: [
      { questionText: "Ko je autor?", optionA: "Douglas Adams", optionB: "Isaac Asimov", optionC: "Arthur C. Clarke", optionD: "Ray Bradbury", correctAnswer: "a" },
      { questionText: "Šta se desi sa Zemljom na početku?", optionA: "Poplave je", optionB: "Bude uništena za gradnju međugalaktičkog autoputa", optionC: "Zamrzne se", optionD: "Nestane", correctAnswer: "b" },
      { questionText: "Koji je 'odgovor na sve'?", optionA: "Ljubav", optionB: "42", optionC: "100", optionD: "0", correctAnswer: "b" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Ozbiljan", optionB: "Satiričan i humorističan", optionC: "Tužan", optionD: "Romantičan", correctAnswer: "b" },
      { questionText: "Šta nikada ne treba zaboraviti ponijeti?", optionA: "Hranu", optionB: "Peškir", optionC: "Kompas", optionD: "Novac", correctAnswer: "b" },
    ],
  },
  {
    bookId: "3993391f-b9db-419b-9d16-e9f8f3535fe1",
    title: "Kviz: Vrli novi svijet",
    questions: [
      { questionText: "Ko je autor?", optionA: "George Orwell", optionB: "Aldous Huxley", optionC: "Ray Bradbury", optionD: "Philip K. Dick", correctAnswer: "b" },
      { questionText: "Kako se kontrolira društvo u romanu?", optionA: "Nasiljem", optionB: "Zadovoljstvom, drogom (soma) i genetskim inženjeringom", optionC: "Zakonima", optionD: "Religijom", correctAnswer: "b" },
      { questionText: "U kakve kaste je društvo podijeljeno?", optionA: "Bogate i siromašne", optionB: "Alfa, Beta, Gama, Delta, Epsilon", optionC: "Vojnike i civile", optionD: "Radnike i vlasnike", correctAnswer: "b" },
      { questionText: "Ko je 'divljak' u romanu?", optionA: "Robot", optionB: "John, čovjek odrastao izvan civilizacije", optionC: "Životinja", optionD: "Alien", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Ljubav", optionB: "Opasnost od kontrole kroz zadovoljstvo i konformizam", optionC: "Putovanje", optionD: "Prijateljstvo", correctAnswer: "b" },
    ],
  },
  {
    bookId: "f32ccb0d-3b76-4554-839f-b17ed16d0cd1",
    title: "Kviz: Warrior Cats (Ratnički mačci)",
    questions: [
      { questionText: "Ko je autor?", optionA: "Rick Riordan", optionB: "Erin Hunter", optionC: "Kathryn Lasky", optionD: "Cressida Cowell", correctAnswer: "b" },
      { questionText: "O kakvim likovima govori serijal?", optionA: "O psima", optionB: "O divljim mačkama organiziranim u klanove", optionC: "O vukovima", optionD: "O pticama", correctAnswer: "b" },
      { questionText: "Koliko klanova postoji?", optionA: "Dva", optionB: "Tri", optionC: "Četiri", optionD: "Pet", correctAnswer: "c" },
      { questionText: "Kako se zove prvi glavni junak?", optionA: "Greystripe", optionB: "Firestar (Rusty)", optionC: "Bluestar", optionD: "Tigerclaw", correctAnswer: "b" },
      { questionText: "Šta je 'Ratnički kodeks'?", optionA: "Igra", optionB: "Skup pravila po kojima mačji klanovi žive", optionC: "Knjiga", optionD: "Mapa", correctAnswer: "b" },
    ],
  },
  {
    bookId: "0b29e63f-78bb-47ba-8b13-823965c321a5",
    title: "Kviz: Zaboravljeni sin",
    questions: [
      { questionText: "Ko je autor?", optionA: "Miro Gavran", optionB: "Ivan Kušan", optionC: "Mato Lovrak", optionD: "Branko Ćopić", correctAnswer: "a" },
      { questionText: "O čemu govori knjiga?", optionA: "O sportu", optionB: "O dječaku koji se osjeća zanemarenim u porodici", optionC: "O putovanju", optionD: "O životinjama", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Fantasy", optionB: "Realistični roman", optionC: "Bajka", optionD: "Naučna fantastika", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Avantura", optionB: "Porodični odnosi i osjećaj pripadnosti", optionC: "Sport", optionD: "Škola", correctAnswer: "b" },
    ],
  },
  {
    bookId: "51dfb306-ca92-4744-b7d5-d494007578fc",
    title: "Kviz: Zabranjena vrata",
    questions: [
      { questionText: "Ko je autor?", optionA: "Zlatko Krilić", optionB: "Ivan Kušan", optionC: "Ante Gardaš", optionD: "Mato Lovrak", correctAnswer: "a" },
      { questionText: "Šta djeca istražuju?", optionA: "Šumu", optionB: "Misteriozna zabranjena vrata", optionC: "Školu", optionD: "More", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Poezija", optionB: "Avantura i fantasy", optionC: "Biografija", optionD: "Drama", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "b" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Tužan", optionB: "Napeta i uzbudljiva", optionC: "Satiričan", optionD: "Romantičan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "8330a336-fed7-40c0-854f-b8b1ed8418e7",
    title: "Kviz: Zelena šuma",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ahmet Hromadžić", optionB: "Branko Ćopić", optionC: "Ivana Brlić-Mažuranić", optionD: "Mato Lovrak", correctAnswer: "a" },
      { questionText: "O čemu govori knjiga?", optionA: "O gradu", optionB: "O šumi i njenim čudesima", optionC: "O školi", optionD: "O sportu", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Roman", optionB: "Bajke i basne", optionC: "Drama", optionD: "Biografija", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Strašan", optionB: "Čaroban i poučan", optionC: "Satiričan", optionD: "Tužan", correctAnswer: "b" },
    ],
  },
  {
    bookId: "8b34b907-8e26-4987-9622-d9c071c8075d",
    title: "Kviz: Zlatarovo zlato",
    questions: [
      { questionText: "Ko je autor?", optionA: "August Šenoa", optionB: "Ivo Andrić", optionC: "Mato Lovrak", optionD: "Meša Selimović", correctAnswer: "a" },
      { questionText: "Kako se zove zlatareva kći?", optionA: "Ana", optionB: "Dora Krupićeva", optionC: "Marija", optionD: "Jelena", correctAnswer: "b" },
      { questionText: "U kojem gradu se odvija radnja?", optionA: "Sarajevo", optionB: "Zagreb (Grič i Kaptol)", optionC: "Dubrovnik", optionD: "Split", correctAnswer: "b" },
      { questionText: "U kom periodu se odvija radnja?", optionA: "U sadašnjosti", optionB: "U srednjem vijeku", optionC: "U 20. vijeku", optionD: "U budućnosti", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Putovanje", optionB: "Ljubav, političke intrige i borba za pravdu", optionC: "Sport", optionD: "Škola", correctAnswer: "b" },
    ],
  },
  {
    bookId: "9fa54e66-eaf4-4379-b980-37de2976c8c3",
    title: "Kviz: Zločinci",
    questions: [
      { questionText: "Ko je autor?", optionA: "Aaron Blabey", optionB: "Dav Pilkey", optionC: "Jeff Kinney", optionD: "Roald Dahl", correctAnswer: "a" },
      { questionText: "Ko su 'Zločinci'?", optionA: "Ljudi", optionB: "Životinje koje žele postati dobre", optionC: "Roboti", optionD: "Čudovišta", correctAnswer: "b" },
      { questionText: "U kakvom formatu je knjiga?", optionA: "Roman", optionB: "Ilustrirana knjiga", optionC: "Poezija", optionD: "Enciklopedija", correctAnswer: "b" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Strašan", optionB: "Humorističan", optionC: "Tužan", optionD: "Romantičan", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "a" },
    ],
  },
  {
    bookId: "c8bea633-b288-4852-bf66-e08a8b1dbc1a",
    title: "Kviz: Znam zašto ptica u kavezu pjeva",
    questions: [
      { questionText: "Ko je autor?", optionA: "Maya Angelou", optionB: "Toni Morrison", optionC: "Alice Walker", optionD: "Harper Lee", correctAnswer: "a" },
      { questionText: "Da li je ovo autobiografija?", optionA: "Da", optionB: "Ne", optionC: "Djelomično", optionD: "Nije poznato", correctAnswer: "a" },
      { questionText: "O čemu govori knjiga?", optionA: "O pticama", optionB: "O odrastanju Afroamerikanke na segregiranom Jugu", optionC: "O putovanju", optionD: "O školi", correctAnswer: "b" },
      { questionText: "Kakav ton ima knjiga?", optionA: "Komičan", optionB: "Emotivan, poetičan i hrabar", optionC: "Satiričan", optionD: "Romantičan", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Sport", optionB: "Rasizam, identitet i snaga ljudskog duha", optionC: "Putovanje", optionD: "Ljubav", correctAnswer: "b" },
    ],
  },
  {
    bookId: "ec9aa078-0270-4aef-ac81-aa4ed67696e3",
    title: "Kviz: Zov divljine",
    questions: [
      { questionText: "Ko je autor?", optionA: "Jack London", optionB: "Mark Twain", optionC: "Ernest Hemingway", optionD: "Daniel Defoe", correctAnswer: "a" },
      { questionText: "Ko je Buck?", optionA: "Čovjek", optionB: "Veliki pas (mješanac)", optionC: "Vuk", optionD: "Medvjed", correctAnswer: "b" },
      { questionText: "Odakle Buck biva ukraden?", optionA: "Iz šume", optionB: "Iz udobnog doma u Kaliforniji", optionC: "Sa farme", optionD: "Iz zoološkog vrta", correctAnswer: "b" },
      { questionText: "Kuda Buck biva odveden?", optionA: "U Afriku", optionB: "Na Aljasku / Yukon za vuču saonica", optionC: "U cirkus", optionD: "U grad", correctAnswer: "b" },
      { questionText: "Šta Buck na kraju odabere?", optionA: "Vratiti se kući", optionB: "Život u divljini kao vođa čopora", optionC: "Ostati s ljudima", optionD: "Život na farmi", correctAnswer: "b" },
    ],
  },
  {
    bookId: "907a4661-5097-4076-a57b-b156d1731236",
    title: "Kviz: Zvjezdana prašina",
    questions: [
      { questionText: "Ko je autor?", optionA: "Neil Gaiman", optionB: "Terry Pratchett", optionC: "Philip Pullman", optionD: "C.S. Lewis", correctAnswer: "a" },
      { questionText: "Šta Tristran obećava djevojci?", optionA: "Cvijeće", optionB: "Da će joj donijeti palu zvijezdu", optionC: "Zlato", optionD: "Prsten", correctAnswer: "b" },
      { questionText: "Šta zvijezda zapravo je?", optionA: "Kamen", optionB: "Djevojka po imenu Yvaine", optionC: "Dragulj", optionD: "Čarobni predmet", correctAnswer: "b" },
      { questionText: "Gdje se odvija magični dio priče?", optionA: "U stvarnom svijetu", optionB: "U zemlji Stormhold iza zida", optionC: "Na nebu", optionD: "Pod morem", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Komedija", optionB: "Fantasy romansa", optionC: "Biografija", optionD: "Historijski roman", correctAnswer: "b" },
    ],
  },
  {
    bookId: "c420114a-875f-4753-8733-524b8aa4e9b4",
    title: "Kviz: Čovjek po imenu Ove",
    questions: [
      { questionText: "Ko je autor?", optionA: "Fredrik Backman", optionB: "Stieg Larsson", optionC: "Jonas Jonasson", optionD: "Henning Mankell", correctAnswer: "a" },
      { questionText: "Kakav je Ove na početku?", optionA: "Veseo", optionB: "Mrzovoljni usamljeni starčić", optionC: "Avanturistički", optionD: "Romantičan", correctAnswer: "b" },
      { questionText: "Šta Ove radi svako jutro?", optionA: "Trči", optionB: "Patrolira susjedstvom i provjerava pravila", optionC: "Čita novine", optionD: "Kuha", correctAnswer: "b" },
      { questionText: "Ko promijeni Oveov život?", optionA: "Pas", optionB: "Nova susjeda Parvaneh i njena porodica", optionC: "Stari prijatelj", optionD: "Liječnik", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Putovanje", optionB: "Prijateljstvo može promijeniti i najtvrdoglavijeg čovjeka", optionC: "Sport", optionD: "Škola", correctAnswer: "b" },
    ],
  },
  {
    bookId: "33d2e74a-6045-4fa2-9a51-71798c80f567",
    title: "Kviz: Čudesne zvijeri",
    questions: [
      { questionText: "Ko je autor?", optionA: "J.K. Rowling", optionB: "Rick Riordan", optionC: "C.S. Lewis", optionD: "Neil Gaiman", correctAnswer: "a" },
      { questionText: "Kako se zove glavni junak?", optionA: "Harry Potter", optionB: "Newt Scamander", optionC: "Albus Dumbledore", optionD: "Draco Malfoy", correctAnswer: "b" },
      { questionText: "Šta je Newt po zanimanju?", optionA: "Učitelj", optionB: "Magizoolog (proučava čarobne životinje)", optionC: "Auror", optionD: "Čuvar", correctAnswer: "b" },
      { questionText: "U kom gradu se odvija radnja filma?", optionA: "London", optionB: "New York", optionC: "Pariz", optionD: "Berlin", correctAnswer: "b" },
      { questionText: "Koja je veza s Harry Potterom?", optionA: "Nastavak", optionB: "Dio istog čarobnjačkog svijeta, ali raniji period", optionC: "Nema veze", optionD: "Remake", correctAnswer: "b" },
    ],
  },
  {
    bookId: "8132ef04-faa7-4043-8fa4-9845d0c012f2",
    title: "Kviz: Čudo",
    questions: [
      { questionText: "Ko je autor?", optionA: "R.J. Palacio", optionB: "John Green", optionC: "Rainbow Rowell", optionD: "Jenny Han", correctAnswer: "a" },
      { questionText: "Kako se zove glavni junak?", optionA: "Jack", optionB: "August (Auggie) Pullman", optionC: "Julian", optionD: "Will", correctAnswer: "b" },
      { questionText: "Šta je posebno kod Auggieja?", optionA: "Jako je pametan", optionB: "Ima deformitet lica", optionC: "Može letjeti", optionD: "Jako je visok", correctAnswer: "b" },
      { questionText: "Šta Auggie radi prvi put u životu?", optionA: "Putuje", optionB: "Ide u školu", optionC: "Pliva", optionD: "Vozi bicikl", correctAnswer: "b" },
      { questionText: "Koja je glavna poruka knjige?", optionA: "Ljepota je najvažnija", optionB: "Budi ljubazan jer svi vode neku bitku", optionC: "Treba biti jak", optionD: "Treba izbjegavati ljude", correctAnswer: "b" },
    ],
  },
  {
    bookId: "751221cb-c9b2-4953-b752-86aa4627259d",
    title: "Kviz: Čudnovate zgode šegrta Hlapića",
    questions: [
      { questionText: "Ko je autor?", optionA: "Ivana Brlić-Mažuranić", optionB: "Mato Lovrak", optionC: "Branko Ćopić", optionD: "Ivan Kušan", correctAnswer: "a" },
      { questionText: "Ko je Hlapić?", optionA: "Učitelj", optionB: "Mali postolarski šegrt", optionC: "Vojnik", optionD: "Princ", correctAnswer: "b" },
      { questionText: "Zašto Hlapić pobjegne od majstora?", optionA: "Dosadilo mu je", optionB: "Jer je majstor bio okrutan prema njemu", optionC: "Želi vidjeti svijet", optionD: "Neko ga pozove", correctAnswer: "b" },
      { questionText: "S kim Hlapić putuje?", optionA: "S majstorom", optionB: "S djevojčicom Gitom", optionC: "Sam", optionD: "S grupom djece", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Škola", optionB: "Pravda, dobrota i hrabrost", optionC: "Putovanje u svemir", optionD: "Sport", correctAnswer: "b" },
    ],
  },
  {
    bookId: "b4f1daed-8c6e-4468-948f-1988ce2b1e97",
    title: "Kviz: Čudesna sudbina Caspara Lullabyja",
    questions: [
      { questionText: "Ko je autor?", optionA: "Zoran Živković", optionB: "Ivo Andrić", optionC: "Meša Selimović", optionD: "Danilo Kiš", correctAnswer: "a" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Realistični roman", optionB: "Fantastična beletristika", optionC: "Biografija", optionD: "Drama", correctAnswer: "b" },
      { questionText: "O čemu govori knjiga?", optionA: "O sportu", optionB: "O neobičnoj sudbini i čudesnim događajima", optionC: "O školi", optionD: "O putovanju", correctAnswer: "b" },
      { questionText: "Za koju starosnu skupinu je namijenjena?", optionA: "Mlađi osnovci", optionB: "Stariji osnovci", optionC: "Omladina", optionD: "Odrasli", correctAnswer: "d" },
      { questionText: "Kakav stil pisanja ima Zoran Živković?", optionA: "Realističan", optionB: "Fantastičan i poetičan", optionC: "Satiričan", optionD: "Naučni", correctAnswer: "b" },
    ],
  },
  {
    bookId: "94ee4bc4-7e9d-4aa6-b762-b5ef497d43fb",
    title: "Kviz: Derviš i smrt (dopuna)",
    questions: [
      { questionText: "Kako se zove glavni junak?", optionA: "Ahmed Nurudin", optionB: "Hasan", optionC: "Mehmed", optionD: "Ibrahim", correctAnswer: "a" },
      { questionText: "Koji je Nurudinov položaj?", optionA: "Vojnik", optionB: "Šejh derviškog reda", optionC: "Sudija", optionD: "Učitelj", correctAnswer: "b" },
      { questionText: "Šta pokreće radnju romana?", optionA: "Rat", optionB: "Nestanak Nurudinovog brata", optionC: "Putovanje", optionD: "Svadba", correctAnswer: "b" },
      { questionText: "U kojem periodu se odvija radnja?", optionA: "U sadašnjosti", optionB: "U osmanskom periodu", optionC: "U srednjem vijeku", optionD: "U budućnosti", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Ljubav", optionB: "Sukob između vlasti i savjesti, pravde i moći", optionC: "Sport", optionD: "Putovanje", correctAnswer: "b" },
    ],
  },
  {
    bookId: "c2975d1f-11c1-43f2-a950-44966c818d6e",
    title: "Kviz: Životinjska farma",
    questions: [
      { questionText: "Ko je autor?", optionA: "George Orwell", optionB: "Aldous Huxley", optionC: "Ray Bradbury", optionD: "William Golding", correctAnswer: "a" },
      { questionText: "Ko predvodi pobunu životinja?", optionA: "Konji", optionB: "Svinje", optionC: "Psi", optionD: "Kokoške", correctAnswer: "b" },
      { questionText: "Kako se zove svinja koja postaje diktator?", optionA: "Snowball", optionB: "Napoleon", optionC: "Old Major", optionD: "Squealer", correctAnswer: "b" },
      { questionText: "Koji je najpoznatiji slogan životinja?", optionA: "Sloboda za sve!", optionB: "Svi su jednaki, ali neki su jednakiji od drugih", optionC: "Život je lijep", optionD: "Rad je sve", correctAnswer: "b" },
      { questionText: "Šta knjiga zapravo kritikuje?", optionA: "Životinje", optionB: "Totalitarizam i korupciju vlasti", optionC: "Farmerstvo", optionD: "Školu", correctAnswer: "b" },
    ],
  },
  {
    bookId: "b05916f5-5678-4fe2-b0c6-2a4d70ee3a90",
    title: "Kviz: Šest vrana",
    questions: [
      { questionText: "Ko je autor?", optionA: "Leigh Bardugo", optionB: "Victoria Aveyard", optionC: "Sarah J. Maas", optionD: "Veronica Roth", correctAnswer: "a" },
      { questionText: "Koliko članova ima grupa?", optionA: "Pet", optionB: "Šest", optionC: "Sedam", optionD: "Osam", correctAnswer: "b" },
      { questionText: "Ko je vođa grupe?", optionA: "Inej", optionB: "Kaz Brekker", optionC: "Jesper", optionD: "Nina", correctAnswer: "b" },
      { questionText: "Šta grupa treba da uradi?", optionA: "Spasi princeze", optionB: "Izvrši nemoguću pljačku", optionC: "Pobijedi zmaja", optionD: "Pronađe blago", correctAnswer: "b" },
      { questionText: "U kakvom svijetu se odvija radnja?", optionA: "U našem svijetu", optionB: "U Grishaverse - svijetu inspirisanom Holandijom", optionC: "U svemiru", optionD: "U budućnosti", correctAnswer: "b" },
    ],
  },
  {
    bookId: "bd542657-1f84-4d68-8932-89537c669d3a",
    title: "Kviz: Čudesni nož",
    questions: [
      { questionText: "Ko je autor?", optionA: "C.S. Lewis", optionB: "Philip Pullman", optionC: "J.R.R. Tolkien", optionD: "Neil Gaiman", correctAnswer: "b" },
      { questionText: "Koji je ovo dio trilogije?", optionA: "Prvi", optionB: "Drugi", optionC: "Treći", optionD: "Četvrti", correctAnswer: "b" },
      { questionText: "Šta 'čudesni nož' može?", optionA: "Sjeći drvo", optionB: "Otvarati prolaze između svjetova", optionC: "Letjeti", optionD: "Govoriti", correctAnswer: "b" },
      { questionText: "Kako se zove novi glavni junak u ovom dijelu?", optionA: "Roger", optionB: "Will Parry", optionC: "Lee", optionD: "John", correctAnswer: "b" },
      { questionText: "Koji žanr opisuje ovu knjigu?", optionA: "Komedija", optionB: "Fantasy", optionC: "Biografija", optionD: "Historijski roman", correctAnswer: "b" },
    ],
  },
  {
    bookId: "0bb30c0f-79b6-4885-874b-237492ff2e1a",
    title: "Kviz: Škola dobru i zlu",
    questions: [
      { questionText: "Ko je autor?", optionA: "Soman Chainani", optionB: "Rick Riordan", optionC: "J.K. Rowling", optionD: "C.S. Lewis", correctAnswer: "a" },
      { questionText: "Kako se zove glavna junakinja?", optionA: "Agatha", optionB: "Sophie", optionC: "Obje (Sophie i Agatha)", optionD: "Hester", correctAnswer: "c" },
      { questionText: "Šta se desi sa Sophie i Agathom?", optionA: "Idu u normalnu školu", optionB: "Bivaju poslane u Školu za dobro i zlo, ali u pogrešne škole", optionC: "Putuju svijetom", optionD: "Postaju princeze", correctAnswer: "b" },
      { questionText: "Šta škola obučava?", optionA: "Matematiku", optionB: "Djecu da postanu junaci ili negativci iz bajki", optionC: "Sport", optionD: "Muziku", correctAnswer: "b" },
      { questionText: "Koja je glavna tema?", optionA: "Putovanje", optionB: "Prijateljstvo, identitet i šta znači biti dobar ili zao", optionC: "Sport", optionD: "Škola", correctAnswer: "b" },
    ],
  },
];

async function seedQuizzes() {
  console.log(`Seeding ${allQuizzes.length} quizzes...`);
  let quizCount = 0;
  let questionCount = 0;

  for (const quizData of allQuizzes) {
    try {
      const [quiz] = await db
        .insert(quizzes)
        .values({
          bookId: quizData.bookId,
          title: quizData.title,
        })
        .returning();

      quizCount++;

      for (const q of quizData.questions) {
        await db.insert(questions).values({
          quizId: quiz.id,
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          points: 1,
        });
        questionCount++;
      }
    } catch (err: any) {
      console.error(`Error seeding quiz for book ${quizData.bookId}: ${err.message}`);
    }
  }

  console.log(`Done! Created ${quizCount} quizzes with ${questionCount} questions.`);
  process.exit(0);
}

seedQuizzes();
