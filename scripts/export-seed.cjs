const { Pool } = require('pg');
const fs = require('fs');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  console.log('Exporting genres...');
  const genres = (await client.query('SELECT id, name, slug, sort_order as "sortOrder" FROM genres ORDER BY sort_order')).rows;
  
  console.log('Exporting books...');
  const books = (await client.query(`
    SELECT 
      id, title, author, description, cover_image as "coverImage", content,
      age_group as "ageGroup", genre, reading_difficulty as "readingDifficulty",
      page_count as "pageCount", pdf_url as "pdfUrl", purchase_url as "purchaseUrl",
      times_read as "timesRead", weekly_pick as "weeklyPick", created_at as "createdAt",
      isbn, cobiss_id as "cobissId", publisher, publication_year as "publicationYear",
      publication_city as "publicationCity", available_in_library as "availableInLibrary",
      copies_available as "copiesAvailable", location_in_library as "locationInLibrary",
      recommended_for_grades as "recommendedForGrades", language, book_format as "bookFormat"
    FROM books ORDER BY created_at
  `)).rows;
  
  console.log('Exporting bookGenres...');
  const bookGenres = (await client.query('SELECT id, book_id as "bookId", genre_id as "genreId" FROM book_genres')).rows;
  
  console.log('Exporting quizzes...');
  const quizzes = (await client.query(`
    SELECT 
      id, book_id as "bookId", title, created_at as "createdAt",
      quiz_author as "quizAuthor"
    FROM quizzes ORDER BY created_at
  `)).rows;
  
  console.log('Exporting questions...');
  const questions = (await client.query(`
    SELECT 
      id, quiz_id as "quizId", question_text as "questionText",
      option_a as "optionA", option_b as "optionB", option_c as "optionC", option_d as "optionD",
      correct_answer as "correctAnswer", points
    FROM questions ORDER BY quiz_id
  `)).rows;
  
  const seedData = { genres, books, bookGenres, quizzes, questions };
  
  const stats = {
    genres: genres.length, books: books.length, 
    bookGenres: bookGenres.length, quizzes: quizzes.length, questions: questions.length
  };
  console.log('Stats:', JSON.stringify(stats));
  
  const output = JSON.stringify(seedData);
  fs.writeFileSync('/home/runner/workspace/server/seed-data.json', output);
  console.log(`Written to server/seed-data.json (${(output.length / 1024).toFixed(0)} KB)`);
  
  client.release();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
