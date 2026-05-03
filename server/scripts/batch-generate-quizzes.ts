import { Pool } from "pg";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL!;
const API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY!;
const BASE_URL = process.env.AI_INTEGRATIONS_OPENAI_API_KEY ? (process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined) : undefined;

if (!DATABASE_URL) throw new Error("DATABASE_URL nije postavljen");
if (!API_KEY) throw new Error("OPENAI_API_KEY nije postavljen");

const args = process.argv.slice(2);
function arg(name: string, fallback?: string) {
  const idx = args.findIndex(a => a === `--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return fallback;
  return args[idx + 1];
}

const AGE_GROUP = arg("ageGroup", "R1")!;
const LIMIT = parseInt(arg("limit", "9999")!, 10);
const TARGET_QUESTIONS = parseInt(arg("numQuestions", "30")!, 10);
const NUM_QUESTIONS = TARGET_QUESTIONS + 10; // ask for more to guarantee target after validation
const MODEL = arg("model", "gpt-4o-mini")!;
const DELAY_MS = parseInt(arg("delay", "1500")!, 10);

const AGE_LABELS: Record<string, string> = {
  R1: "djeca 6-9 godina (1.-3. razred)",
  R4: "djeca 10-12 godina (4.-6. razred)",
  R7: "tinejdžeri 13-15 godina (7.-9. razred)",
  O: "srednjoškolci 15-18 godina",
  A: "odrasli 18+",
};

const COMPLEXITY_HINT: Record<string, string> = {
  R1: "Pitanja moraju biti VRLO JEDNOSTAVNA, kratka, sa konkretnim odgovorima koje dijete može lako prepoznati. Koristi jednostavan vokabular.",
  R4: "Pitanja trebaju biti jasna i pristupačna djeci u višim razredima osnovne škole.",
  R7: "Pitanja mogu biti kompleksnija, sa naglaskom na razumijevanje teme i likova.",
  O: "Pitanja trebaju biti analitička i tražiti dublje razumijevanje sadržaja, simbolike i poruke.",
  A: "Pitanja trebaju biti zrela, mogu uključivati interpretaciju i analizu.",
};

const pool = new Pool({ connectionString: DATABASE_URL });
const openai = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });

const PROGRESS_FILE = path.join(process.cwd(), `.local/quiz-gen-progress-${AGE_GROUP}.json`);

interface Progress {
  done: string[];
  failed: { id: string; title: string; error: string }[];
  startedAt: string;
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
  }
  return { done: [], failed: [], startedAt: new Date().toISOString() };
}

function saveProgress(p: Progress) {
  fs.mkdirSync(path.dirname(PROGRESS_FILE), { recursive: true });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function buildPrompt(book: any) {
  return `Generiraj kviz sa TAČNO ${NUM_QUESTIONS} pitanja o knjizi "${book.title}" autora ${book.author}.
${book.description ? `Opis knjige: ${book.description}` : ""}
Ciljana publika: ${AGE_LABELS[AGE_GROUP]}
Žanr: ${book.genre || "opći"}

${COMPLEXITY_HINT[AGE_GROUP]}

VAŽNO — JEZIK:
- Sva pitanja i odgovori MORAJU biti na BOSANSKOM jeziku, ijekavica.
- Koristi: rijeka, dijete, vrijeme, lijepo, mlijeko, čovjek, vjera.
- NIKAKO ne koristi ekavicu (ne: reka, dete, vreme, lepo, mleko, čovek, vera).

STROGA ZABRANA — NE postavljaj pitanja o:
- Autoru knjige (ko je napisao, koji je autor, kada je rođen, itd.)
- Broju stranica, godini izdanja, izdavaču
- Žanru ili kategoriji knjige
- Bilo kojim bibliografskim podacima

Pitanja MORAJU biti o SADRŽAJU knjige: o likovima, radnji, događajima, mjestima, dijalozima, temama, porukama i poukama priče.

VAŽNO — TAČNI ODGOVORI:
- Tačan odgovor MORA biti RAVNOMJERNO RASPOREĐEN između opcija a, b, c i d.
- NIKAKO ne smije tačan odgovor biti uvijek "a" ili dominantno na jednoj poziciji.
- Pokušaj otprilike: ${Math.ceil(NUM_QUESTIONS / 4)} pitanja sa tačnim "a", ${Math.ceil(NUM_QUESTIONS / 4)} sa "b", ${Math.ceil(NUM_QUESTIONS / 4)} sa "c", ${Math.ceil(NUM_QUESTIONS / 4)} sa "d".

Svako pitanje mora imati:
- Tekst pitanja
- 4 opcije odgovora (A, B, C, D) — sve uvjerljive, samo jedna tačna
- correctAnswer: jedan od "a", "b", "c", "d"
- points: 1

Odgovori ISKLJUČIVO u JSON formatu:
{
  "questions": [
    {
      "questionText": "Pitanje?",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctAnswer": "b",
      "points": 1
    }
  ]
}`;
}

function shuffleAnswerPositions(questions: any[]): any[] {
  // Force balanced distribution by randomly permuting options for each question
  return questions.map(q => {
    const opts = [
      { key: "a", text: q.optionA },
      { key: "b", text: q.optionB },
      { key: "c", text: q.optionC },
      { key: "d", text: q.optionD },
    ];
    const correctText = opts.find(o => o.key === q.correctAnswer)?.text;
    if (!correctText) return q;

    // Fisher-Yates shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    const newCorrect = opts.find(o => o.text === correctText)!;
    const positions = ["a", "b", "c", "d"];
    return {
      ...q,
      optionA: opts[0].text,
      optionB: opts[1].text,
      optionC: opts[2].text,
      optionD: opts[3].text,
      correctAnswer: positions[opts.indexOf(newCorrect)],
    };
  });
}

function distributionStats(questions: any[]) {
  const counts: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
  for (const q of questions) counts[q.correctAnswer] = (counts[q.correctAnswer] || 0) + 1;
  return counts;
}

async function generateForBook(book: any) {
  const prompt = buildPrompt(book);
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 8192,
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("AI nije vratio sadržaj");
  const parsed = JSON.parse(content);
  let questions = parsed.questions;
  if (!Array.isArray(questions) || questions.length === 0) throw new Error("Nema pitanja u AI odgovoru");

  // Validate
  questions = questions.filter((q: any) =>
    q.questionText && q.optionA && q.optionB && q.optionC && q.optionD && ["a","b","c","d"].includes(q.correctAnswer)
  );
  if (questions.length < TARGET_QUESTIONS) {
    throw new Error(`Dobiveno samo ${questions.length} validnih pitanja (potrebno ${TARGET_QUESTIONS})`);
  }
  // Trim to target
  questions = questions.slice(0, TARGET_QUESTIONS);

  // Force balanced answer distribution
  questions = shuffleAnswerPositions(questions);
  const stats = distributionStats(questions);
  console.log(`  Distribucija odgovora: a=${stats.a} b=${stats.b} c=${stats.c} d=${stats.d}`);

  // Insert into DB
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const quizRow = await client.query(
      `INSERT INTO quizzes (book_id, title, quiz_author) VALUES ($1, $2, $3) RETURNING id`,
      [book.id, `Kviz: ${book.title}`, "Citanje.ba"]
    );
    const quizId = quizRow.rows[0].id;
    for (const q of questions) {
      await client.query(
        `INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [quizId, q.questionText, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer, q.points || 1]
      );
    }
    await client.query("COMMIT");
    return { quizId, count: questions.length };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function main() {
  console.log(`\n📚 Batch generisanje kvizova`);
  console.log(`   Skupina: ${AGE_GROUP} | Pitanja po kvizu: ${NUM_QUESTIONS} | Model: ${MODEL}`);
  console.log(`   Limit: ${LIMIT} | Pauza: ${DELAY_MS}ms\n`);

  const progress = loadProgress();
  console.log(`Već urađeno (preskačem): ${progress.done.length}\n`);

  const { rows: books } = await pool.query(
    `SELECT b.id, b.title, b.author, b.description, b.genre, b.age_group AS "ageGroup"
     FROM books b LEFT JOIN quizzes q ON q.book_id = b.id
     WHERE q.id IS NULL AND b.age_group = $1
     ORDER BY b.title`,
    [AGE_GROUP]
  );

  const todo = books.filter(b => !progress.done.includes(b.id)).slice(0, LIMIT);
  console.log(`Knjiga za obraditi: ${todo.length} (od ukupno ${books.length} bez kviza)\n`);

  let success = 0, failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < todo.length; i++) {
    const book = todo[i];
    const prefix = `[${i + 1}/${todo.length}]`;
    console.log(`${prefix} "${book.title}" — ${book.author}`);
    try {
      const result = await generateForBook(book);
      progress.done.push(book.id);
      saveProgress(progress);
      success++;
      console.log(`  ✅ ${result.count} pitanja sačuvano`);
    } catch (e: any) {
      failed++;
      progress.failed.push({ id: book.id, title: book.title, error: e.message });
      saveProgress(progress);
      console.error(`  ❌ ${e.message}`);
    }
    if (i < todo.length - 1) await sleep(DELAY_MS);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✨ Završeno za ${elapsed}s | Uspjeh: ${success} | Greške: ${failed}`);
  console.log(`Progress fajl: ${PROGRESS_FILE}\n`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
