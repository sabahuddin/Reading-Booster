import { db } from "./db";
import { books } from "@shared/schema";
import { eq } from "drizzle-orm";

function isPlaceholderImage(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.includes("placehold.co")) return true;
  if (url.includes("placeholder")) return true;
  if (url.includes("book-placeholder")) return true;
  return false;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchOpenLibrary(title: string, author: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(title);
    const authorQuery = encodeURIComponent(author.split(",")[0].split("(")[0].trim());
    const url = `https://openlibrary.org/search.json?title=${query}&author=${authorQuery}&limit=3&fields=cover_i,title,author_name`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      for (const doc of data.docs) {
        if (doc.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function searchGoogleBooks(title: string, author: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`intitle:${title} inauthor:${author.split(",")[0].split("(")[0].trim()}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.items) {
      for (const item of data.items) {
        const links = item.volumeInfo?.imageLinks;
        if (links) {
          const imageUrl = links.thumbnail || links.smallThumbnail;
          if (imageUrl) {
            return imageUrl.replace("http://", "https://").replace("&edge=curl", "").replace("zoom=1", "zoom=2");
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

const ENGLISH_TITLE_MAP: Record<string, string> = {
  "Gonič zmajeva": "Kite Runner",
  "Gospodar muha": "Lord of the Flies",
  "Igre gladi": "Hunger Games",
  "Krive su zvijezde": "Fault in our Stars",
  "Bijeli očnjak": "White Fang London",
  "Božićna priča": "A Christmas Carol Dickens",
  "Hiljadu čudesnih sunaca": "Thousand Splendid Suns",
  "Vodič kroz galaksiju za autostopere": "Hitchhikers Guide Galaxy",
  "Vrli novi svijet": "Brave New World",
  "Stepski vuk": "Steppenwolf Hesse",
  "Stranac": "Stranger Camus",
  "Kradljivica knjiga": "Book Thief Zusak",
  "Sjenka i kost": "Shadow and Bone Bardugo",
  "Šest vrana": "Six of Crows Bardugo",
  "Čudo": "Wonder Palacio",
  "Labirint: Nemoguće bjekstvo": "Maze Runner Dashner",
  "Koralina": "Coraline Gaiman",
  "Grimizna kraljica": "Red Queen Aveyard",
  "Pipi Duga Čarapa": "Pippi Longstocking",
  "Čovjek po imenu Ove": "Man Called Ove",
  "Ostrvo s blagom": "Treasure Island",
  "Gulliverova putovanja": "Gullivers Travels",
  "20.000 milja pod morem": "Twenty Thousand Leagues Verne",
  "Tom Sojer": "Tom Sawyer Twain",
  "Pustolovine Huckleberryja Finna": "Huckleberry Finn Twain",
  "Robinzon Kruso": "Robinson Crusoe",
  "Crni ljepotan": "Black Beauty Sewell",
  "Srce od tinte": "Inkheart Funke",
  "Dnevnik Nikki": "Diary Wimpy Kid",
  "Kako izdresirati zmaja": "How to Train Dragon",
  "Kapetan Gaćeša": "Captain Underpants Pilkey",
  "Jantarni dalekozor": "Amber Spyglass Pullman",
  "Sjeverna svjetlost (Zlatni kompas)": "Northern Lights Pullman",
  "Most za Terabitiju": "Bridge to Terabithia",
  "Ljeto kad sam postala lijepa": "Summer I Turned Pretty",
  "Sve, baš sve": "Everything Everything Yoon",
  "Emil i detektivi": "Emil and Detectives Kastner",
  "Škola dobru i zlu": "School Good Evil",
  "Priče za laku noć za mlade buntovnice": "Rebel Girls",
  "Tajni dnevnik Adriana Molea": "Secret diary Adrian Mole",
  "Blizanke": "Twins Kastner",
  "Dječak na vrhu planine": "Boy at top mountain Boyne",
  "Kroz pustinju i prašumu": "Through Desert Sienkiewicz",
  "Lassie se vraća kući": "Lassie Come Home",
  "Svijet po Bobu": "Street Cat named Bob",
  "Moja baka vam se ispričava": "My Grandmother Apologizes Backman",
  "Britt-Marie je bila ovdje": "Britt-Marie Was Here",
  "Mi djeca s kolodvora Zoo": "Christiane F Zoo Station",
  "Loši momci": "Bad Guys Blabey",
  "Grozni Grga": "Horrid Henry Simon",
  "Nikadgrad": "Nevermoor Townsend",
  "Znam zašto ptica u kavezu pjeva": "I Know Why Caged Bird Sings",
  "Smaragdni grad": "Wizard of Oz Baum",
  "Mačak u čizmama": "Puss in Boots",
  "Snjeguljica": "Snow White Brothers Grimm",
  "Crvenkapica": "Little Red Riding Hood",
  "Besmrtnici": "Immortals Noel",
  "Malo drvo": "Little Tree Carter",
  "Apsolutno istinit dnevnik jednog Indijanca s pola radnog vremena": "Absolutely True Diary Part-Time Indian",
  "Bratstvo crnog bodeža": "Black Dagger Brotherhood Ward",
  "Kći čuvara uspomena": "Memory Keepers Daughter Edwards",
  "Lovac na zmajeve": "Kite Runner Hosseini",
  "Priče iz 1001 noći": "Arabian Nights 1001",
  "Zaboravljeni sin": "Forgotten Son Gavran",
  "Zločinci": "Bad Guys Blabey villains",
};

const MANUAL_COVERS: Record<string, string> = {};

async function searchGoogleBooksEnglish(englishTitle: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(englishTitle);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const links = data?.items?.[0]?.volumeInfo?.imageLinks;
    if (links) {
      const imageUrl = links.thumbnail || links.smallThumbnail;
      if (imageUrl) {
        return imageUrl.replace("http://", "https://").replace("&edge=curl", "").replace("zoom=1", "zoom=2");
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchBookCovers() {
  console.log("Fetching book covers...");
  const allBooks = await db.select().from(books);
  const booksNeedingCovers = allBooks.filter(b => isPlaceholderImage(b.coverImage));

  if (booksNeedingCovers.length === 0) {
    console.log("All books already have real covers.");
    return;
  }

  console.log(`Found ${booksNeedingCovers.length} books needing covers.`);
  let updated = 0;
  let failed = 0;

  for (const book of booksNeedingCovers) {
    if (MANUAL_COVERS[book.title]) {
      await db.update(books).set({ coverImage: MANUAL_COVERS[book.title] }).where(eq(books.id, book.id));
      updated++;
      console.log(`  [MANUAL] ${book.title}`);
      continue;
    }

    let coverUrl = await searchOpenLibrary(book.title, book.author);

    if (!coverUrl) {
      await sleep(300);
      coverUrl = await searchGoogleBooks(book.title, book.author);
    }

    if (!coverUrl && ENGLISH_TITLE_MAP[book.title]) {
      await sleep(300);
      coverUrl = await searchGoogleBooksEnglish(ENGLISH_TITLE_MAP[book.title]);
    }

    if (coverUrl) {
      await db.update(books).set({ coverImage: coverUrl }).where(eq(books.id, book.id));
      updated++;
      console.log(`  [OK] ${book.title} -> ${coverUrl.substring(0, 60)}...`);
    } else {
      failed++;
      console.log(`  [MISS] ${book.title} - no cover found`);
    }

    await sleep(500);
  }

  console.log(`Book covers done: ${updated} updated, ${failed} not found.`);
}
