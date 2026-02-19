import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "teacher", "parent", "admin", "school", "reader"] }).notNull().default("student"),
  fullName: text("full_name").notNull(),
  schoolName: text("school_name"),
  className: text("class_name"),
  points: integer("points").notNull().default(0),
  parentId: varchar("parent_id"),
  institutionType: text("institution_type", { enum: ["school"] }),
  institutionRole: text("institution_role", { enum: ["ucitelj", "bibliotekar", "sekretar"] }),
  approved: boolean("approved").default(false),
  maxStudentAccounts: integer("max_student_accounts").default(0),
  createdByTeacherId: varchar("created_by_teacher_id"),
  subscriptionType: text("subscription_type", { enum: ["free", "standard", "full"] }).notNull().default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  ageGroup: text("age_group").default("R1"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  points: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image").notNull(),
  content: text("content").notNull(),
  ageGroup: text("age_group").notNull(),
  genre: text("genre").notNull().default("lektira"),
  readingDifficulty: text("reading_difficulty", { enum: ["lako", "srednje", "tesko"] }).notNull().default("srednje"),
  pageCount: integer("page_count").notNull(),
  pdfUrl: text("pdf_url"),
  purchaseUrl: text("purchase_url"),
  timesRead: integer("times_read").notNull().default(0),
  weeklyPick: boolean("weekly_pick").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isbn: varchar("isbn", { length: 13 }),
  cobissId: text("cobiss_id"),
  publisher: text("publisher"),
  publicationYear: integer("publication_year"),
  publicationCity: text("publication_city"),
  availableInLibrary: boolean("available_in_library").default(false),
  copiesAvailable: integer("copies_available").default(0),
  locationInLibrary: text("location_in_library"),
  recommendedForGrades: text("recommended_for_grades").array(),
  language: text("language").default("bosanski"),
  bookFormat: text("book_format"),
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  timesRead: true,
});
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull(),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: text("correct_answer", { enum: ["a", "b", "c", "d"] }).notNull(),
  points: integer("points").notNull().default(1),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export const quizResults = pgTable("quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  quizId: varchar("quiz_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  wrongAnswers: integer("wrong_answers").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
  completedAt: true,
});
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  coverImage: text("cover_image").notNull(),
  keywords: text("keywords").array().default(sql`'{}'::text[]`),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
});
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export const blogComments = pgTable("blog_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBlogCommentSchema = createInsertSchema(blogComments).omit({
  id: true,
  createdAt: true,
});
export type InsertBlogComment = z.infer<typeof insertBlogCommentSchema>;
export type BlogComment = typeof blogComments.$inferSelect;

export const blogRatings = pgTable("blog_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBlogRatingSchema = createInsertSchema(blogRatings).omit({
  id: true,
  createdAt: true,
});
export type InsertBlogRating = z.infer<typeof insertBlogRatingSchema>;
export type BlogRating = typeof blogRatings.$inferSelect;

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  address: text("address"),
  websiteUrl: text("website_url"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
});
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  prizes: text("prizes").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export const bonusPoints = pgTable("bonus_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  teacherId: varchar("teacher_id").notNull(),
  points: integer("points").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBonusPointsSchema = createInsertSchema(bonusPoints).omit({
  id: true,
  createdAt: true,
});
export type InsertBonusPoints = z.infer<typeof insertBonusPointsSchema>;
export type BonusPoints = typeof bonusPoints.$inferSelect;

export const bookRecommendations = pgTable("book_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  bookId: varchar("book_id").notNull(),
  message: text("message"),
  priority: text("priority").default("normal"),
  createdAt: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});

export const insertBookRecommendationSchema = createInsertSchema(bookRecommendations).omit({
  id: true,
  createdAt: true,
});
export type InsertBookRecommendation = z.infer<typeof insertBookRecommendationSchema>;
export type BookRecommendation = typeof bookRecommendations.$inferSelect;

export const classChallenges = pgTable("class_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull(),
  className: text("class_name").notNull(),
  bookId: varchar("book_id"),
  challengeType: text("challenge_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  bonusPoints: integer("bonus_points").default(10),
  description: text("description"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClassChallengeSchema = createInsertSchema(classChallenges).omit({
  id: true,
  createdAt: true,
});
export type InsertClassChallenge = z.infer<typeof insertClassChallengeSchema>;
export type ClassChallenge = typeof classChallenges.$inferSelect;

export const bookBorrowings = pgTable("book_borrowings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  bookId: varchar("book_id").notNull(),
  librarianId: varchar("librarian_id"),
  borrowedAt: timestamp("borrowed_at").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  returnedAt: timestamp("returned_at"),
  overdue: boolean("overdue").default(false),
});

export const insertBookBorrowingSchema = createInsertSchema(bookBorrowings).omit({
  id: true,
  borrowedAt: true,
});
export type InsertBookBorrowing = z.infer<typeof insertBookBorrowingSchema>;
export type BookBorrowing = typeof bookBorrowings.$inferSelect;

export const genres = pgTable("genres", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertGenreSchema = createInsertSchema(genres).omit({
  id: true,
});
export type InsertGenre = z.infer<typeof insertGenreSchema>;
export type Genre = typeof genres.$inferSelect;

export const bookGenres = pgTable("book_genres", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull(),
  genreId: varchar("genre_id").notNull(),
});

export const insertBookGenreSchema = createInsertSchema(bookGenres).omit({
  id: true,
});
export type InsertBookGenre = z.infer<typeof insertBookGenreSchema>;
export type BookGenre = typeof bookGenres.$inferSelect;
