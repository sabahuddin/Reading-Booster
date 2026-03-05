import { eq, and, gte, lte, desc, isNull, or, ne, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  books,
  quizzes,
  questions,
  quizResults,
  blogPosts,
  blogComments,
  blogRatings,
  contactMessages,
  partners,
  challenges,
  bonusPoints,
  bookRecommendations,
  classChallenges,
  bookBorrowings,
  genres,
  bookGenres,
  deletedItems,
  parentChildRequests,
  pageViews,
  type PageView,
  type User,
  type InsertUser,
  type Book,
  type InsertBook,
  type Quiz,
  type InsertQuiz,
  type Question,
  type InsertQuestion,
  type QuizResult,
  type InsertQuizResult,
  type BlogPost,
  type InsertBlogPost,
  type BlogComment,
  type InsertBlogComment,
  type BlogRating,
  type InsertBlogRating,
  type ContactMessage,
  type InsertContactMessage,
  type Partner,
  type InsertPartner,
  type Challenge,
  type InsertChallenge,
  type Genre,
  type InsertGenre,
  type BookGenre,
  type InsertBookGenre,
  type ParentChildRequest,
  type InsertParentChildRequest,
  type BookRating,
  type InsertBookRating,
  bookRatings,
  bookListings,
  type BookListing,
  type InsertBookListing,
  duels,
  type Duel,
  type InsertDuel,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(id: string, points: number): Promise<User | undefined>;
  getStudentsBySchoolAndClass(schoolName: string, className: string): Promise<User[]>;
  getUsersBySchoolName(schoolName: string): Promise<User[]>;
  getChildrenByParentId(parentId: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getStudentsByTeacherId(teacherId: string): Promise<User[]>;
  getPendingTeachers(): Promise<User[]>;

  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, data: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: string): Promise<void>;
  incrementTimesRead(id: string): Promise<void>;

  getQuizzesByBookId(bookId: string): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  deleteQuiz(id: string): Promise<void>;
  getAllQuizzes(): Promise<Quiz[]>;

  getQuestionsByQuizId(quizId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
  updateQuestion(id: string, data: Partial<InsertQuestion>): Promise<Question | undefined>;

  getQuizResultsByUserId(userId: string): Promise<QuizResult[]>;
  getQuizResultsCountByUserId(userId: string): Promise<number>;
  deleteQuizResultsByUserId(userId: string): Promise<void>;
  deleteQuizResultByUserAndQuiz(userId: string, quizId: string): Promise<void>;
  createQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getQuizResultByUserAndQuiz(userId: string, quizId: string): Promise<QuizResult | undefined>;
  getTopReadersSince(since: Date, limit?: number): Promise<Array<{ userId: string; username: string; fullName: string; totalScore: number }>>;

  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<void>;

  getCommentsByPostId(postId: string): Promise<(BlogComment & { userName: string })[]>;
  createBlogComment(comment: InsertBlogComment): Promise<BlogComment>;
  deleteBlogComment(id: string): Promise<void>;

  getRatingsByPostId(postId: string): Promise<BlogRating[]>;
  getUserRating(postId: string, userId: string): Promise<BlogRating | undefined>;
  upsertBlogRating(rating: InsertBlogRating): Promise<BlogRating>;
  getAverageRating(postId: string): Promise<{ average: number; count: number }>;

  getBookRatingsByBookId(bookId: string): Promise<BookRating[]>;
  getUserBookRating(bookId: string, userId: string): Promise<BookRating | undefined>;
  upsertBookRating(rating: InsertBookRating): Promise<BookRating>;
  getAverageBookRating(bookId: string): Promise<{ average: number; count: number }>;

  getQuizCompletionCount(quizId: string): Promise<number>;

  createContactMessage(msg: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;

  getAllPartners(): Promise<Partner[]>;
  getActivePartners(): Promise<Partner[]>;
  getPartner(id: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, data: Partial<InsertPartner>): Promise<Partner | undefined>;
  deletePartner(id: string): Promise<void>;

  getAllChallenges(): Promise<Challenge[]>;
  getActiveChallenges(): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: string, data: Partial<InsertChallenge>): Promise<Challenge | undefined>;
  deleteChallenge(id: string): Promise<void>;

  createBonusPoints(data: any): Promise<any>;
  getBonusPointsForStudent(studentId: string): Promise<any[]>;
  createBookRecommendation(data: any): Promise<any>;
  getRecommendationsForUser(userId: string): Promise<any[]>;
  markRecommendationAsRead(recommendationId: string): Promise<void>;
  createClassChallenge(data: any): Promise<any>;
  getActiveChallengesForClass(className: string): Promise<any[]>;
  updateClassChallenge(id: string, data: any): Promise<any>;
  getLastQuizResultForUser(userId: string): Promise<any | null>;
  getLeaderboard(startDate: Date, ageGroup?: string): Promise<any[]>;
  createBookBorrowing(data: any): Promise<any>;
  getActiveBorrowings(librarianId?: string): Promise<any[]>;
  returnBook(borrowingId: string): Promise<void>;

  getAllGenres(): Promise<Genre[]>;
  getGenre(id: string): Promise<Genre | undefined>;
  getGenreBySlug(slug: string): Promise<Genre | undefined>;
  createGenre(genre: InsertGenre): Promise<Genre>;
  updateGenre(id: string, data: Partial<InsertGenre>): Promise<Genre | undefined>;
  deleteGenre(id: string): Promise<void>;

  getBookGenres(bookId: string): Promise<Genre[]>;
  setBookGenres(bookId: string, genreIds: string[]): Promise<void>;
  getBooksByGenreId(genreId: string): Promise<Book[]>;

  createParentChildRequest(request: InsertParentChildRequest): Promise<ParentChildRequest>;
  getParentChildRequestsByTeacherId(teacherId: string): Promise<ParentChildRequest[]>;
  getParentChildRequestsByParentId(parentId: string): Promise<ParentChildRequest[]>;
  getParentChildRequest(id: string): Promise<ParentChildRequest | undefined>;
  updateParentChildRequestStatus(id: string, status: string): Promise<ParentChildRequest | undefined>;
  getPendingParentRequestForStudent(parentId: string, studentId: string): Promise<ParentChildRequest | undefined>;

  getTeachersBySchoolAdminId(schoolAdminId: string): Promise<User[]>;
  getPendingSchoolAdmins(): Promise<User[]>;

  getAllBookListings(): Promise<BookListing[]>;
  getBookListingsByUserId(userId: string): Promise<BookListing[]>;
  createBookListing(listing: InsertBookListing): Promise<BookListing>;
  deleteBookListing(id: string): Promise<void>;
  updateBookListing(id: string, data: Partial<InsertBookListing>): Promise<BookListing | undefined>;

  createDuel(duel: InsertDuel): Promise<Duel>;
  getDuel(id: string): Promise<Duel | undefined>;
  getDuelsByUserId(userId: string): Promise<Duel[]>;
  getActiveDuelForUser(userId: string): Promise<Duel | undefined>;
  getPendingDuelsForUser(userId: string): Promise<Duel[]>;
  updateDuelStatus(id: string, status: string, winnerId?: string): Promise<Duel | undefined>;
  findDuelOpponent(userId: string, pointsRange: number): Promise<User | undefined>;
  incrementDuelWins(userId: string): Promise<void>;

  logPageView(data: { path: string; ipHash?: string; country?: string; countryCode?: string; city?: string; userAgent?: string; referrer?: string; userId?: string }): Promise<void>;
  getAnalyticsSummary(): Promise<{ today: number; week: number; month: number; total: number; uniqueToday: number; uniqueMonth: number }>;
  getPageViewsByDay(days: number): Promise<{ date: string; views: number; unique: number }[]>;
  getTopPages(limit: number): Promise<{ path: string; views: number }[]>;
  getTopCountries(limit: number): Promise<{ country: string; countryCode: string; views: number }[]>;
  getTopCities(limit: number): Promise<{ city: string; country: string; countryCode: string; views: number }[]>;
  getViewsByHour(): Promise<{ hour: number; views: number }[]>;
  getDeviceBreakdown(): Promise<{ device: string; views: number }[]>;
  getTopReferrers(limit: number): Promise<{ referrer: string; views: number }[]>;
  getQuizCompletionsByDay(days: number): Promise<{ date: string; completions: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUserPoints(id: string, points: number): Promise<User | undefined> {
    const [updated] = await db.update(users).set({ points }).where(eq(users.id, id)).returning();
    return updated;
  }

  async getStudentsBySchoolAndClass(schoolName: string, className: string): Promise<User[]> {
    return db.select().from(users).where(
      and(eq(users.schoolName, schoolName), eq(users.className, className), eq(users.role, "student"))
    );
  }

  async getUsersBySchoolName(schoolName: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.schoolName, schoolName));
  }

  async getChildrenByParentId(parentId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.parentId, parentId));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getStudentsByTeacherId(teacherId: string): Promise<User[]> {
    return db.select().from(users).where(
      and(eq(users.createdByTeacherId, teacherId), eq(users.role, "student"))
    );
  }

  async getPendingTeachers(): Promise<User[]> {
    return db.select().from(users).where(
      and(eq(users.role, "teacher"), eq(users.approved, false))
    );
  }

  async getAllBooks(): Promise<Book[]> {
    return db.select().from(books);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [created] = await db.insert(books).values(book).returning();
    return created;
  }

  async updateBook(id: string, data: Partial<InsertBook>): Promise<Book | undefined> {
    const [updated] = await db.update(books).set(data).where(eq(books.id, id)).returning();
    return updated;
  }

  async deleteBook(id: string): Promise<void> {
    await db.insert(deletedItems).values({ itemType: "book", itemId: id });
    await db.delete(books).where(eq(books.id, id));
  }

  async incrementTimesRead(id: string): Promise<void> {
    const book = await this.getBook(id);
    if (book) {
      await db.update(books).set({ timesRead: book.timesRead + 1 }).where(eq(books.id, id));
    }
  }

  async getQuizzesByBookId(bookId: string): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.bookId, bookId));
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [created] = await db.insert(quizzes).values(quiz).returning();
    return created;
  }

  async deleteQuiz(id: string): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return db.select().from(quizzes);
  }

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    return db.select().from(questions).where(eq(questions.quizId, quizId));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [created] = await db.insert(questions).values(question).returning();
    return created;
  }

  async deleteQuestion(id: string): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  async updateQuestion(id: string, data: Partial<InsertQuestion>): Promise<Question | undefined> {
    const [updated] = await db.update(questions).set(data).where(eq(questions.id, id)).returning();
    return updated;
  }

  async getQuizResultsByUserId(userId: string): Promise<QuizResult[]> {
    return db.select().from(quizResults).where(eq(quizResults.userId, userId));
  }

  async deleteQuizResultsByUserId(userId: string): Promise<void> {
    await db.delete(quizResults).where(eq(quizResults.userId, userId));
  }

  async getQuizResultsCountByUserId(userId: string): Promise<number> {
    const results = await db.select().from(quizResults).where(eq(quizResults.userId, userId));
    return results.length;
  }

  async createQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const [created] = await db.insert(quizResults).values(result).returning();
    return created;
  }

  async deleteQuizResultByUserAndQuiz(userId: string, quizId: string): Promise<void> {
    await db.delete(quizResults).where(
      and(eq(quizResults.userId, userId), eq(quizResults.quizId, quizId))
    );
  }

  async getQuizResultByUserAndQuiz(userId: string, quizId: string): Promise<QuizResult | undefined> {
    const [result] = await db.select().from(quizResults).where(
      and(eq(quizResults.userId, userId), eq(quizResults.quizId, quizId))
    );
    return result;
  }

  async getTopReadersSince(since: Date, limit: number = 10): Promise<Array<{ userId: string; username: string; fullName: string; totalScore: number }>> {
    const results = await db.select().from(quizResults).where(gte(quizResults.completedAt, since));
    const scoreMap = new Map<string, number>();
    for (const r of results) {
      scoreMap.set(r.userId, (scoreMap.get(r.userId) || 0) + r.score);
    }
    const sorted = Array.from(scoreMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
    const topReaders: Array<{ userId: string; username: string; fullName: string; totalScore: number }> = [];
    for (const [userId, totalScore] of sorted) {
      const user = await this.getUser(userId);
      if (user) {
        topReaders.push({ userId, username: user.username, fullName: user.fullName, totalScore });
      }
    }
    return topReaders;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [created] = await db.insert(blogPosts).values(post).returning();
    return created;
  }

  async updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updated] = await db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).returning();
    return updated;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogComments).where(eq(blogComments.postId, id));
    await db.delete(blogRatings).where(eq(blogRatings.postId, id));
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getCommentsByPostId(postId: string): Promise<(BlogComment & { userName: string })[]> {
    const comments = await db.select().from(blogComments).where(eq(blogComments.postId, postId)).orderBy(desc(blogComments.createdAt));
    const enriched = await Promise.all(comments.map(async (c) => {
      const [user] = await db.select().from(users).where(eq(users.id, c.userId));
      return { ...c, userName: user?.fullName || "Nepoznat korisnik" };
    }));
    return enriched;
  }

  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> {
    const [created] = await db.insert(blogComments).values(comment).returning();
    return created;
  }

  async deleteBlogComment(id: string): Promise<void> {
    await db.delete(blogComments).where(eq(blogComments.id, id));
  }

  async getRatingsByPostId(postId: string): Promise<BlogRating[]> {
    return db.select().from(blogRatings).where(eq(blogRatings.postId, postId));
  }

  async getUserRating(postId: string, userId: string): Promise<BlogRating | undefined> {
    const [rating] = await db.select().from(blogRatings).where(and(eq(blogRatings.postId, postId), eq(blogRatings.userId, userId)));
    return rating;
  }

  async upsertBlogRating(rating: InsertBlogRating): Promise<BlogRating> {
    const existing = await this.getUserRating(rating.postId, rating.userId);
    if (existing) {
      const [updated] = await db.update(blogRatings).set({ rating: rating.rating }).where(eq(blogRatings.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(blogRatings).values(rating).returning();
    return created;
  }

  async getAverageRating(postId: string): Promise<{ average: number; count: number }> {
    const ratings = await this.getRatingsByPostId(postId);
    if (ratings.length === 0) return { average: 0, count: 0 };
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / ratings.length, count: ratings.length };
  }

  async getBookRatingsByBookId(bookId: string): Promise<BookRating[]> {
    return db.select().from(bookRatings).where(eq(bookRatings.bookId, bookId));
  }

  async getUserBookRating(bookId: string, userId: string): Promise<BookRating | undefined> {
    const [rating] = await db.select().from(bookRatings).where(and(eq(bookRatings.bookId, bookId), eq(bookRatings.userId, userId)));
    return rating;
  }

  async upsertBookRating(rating: InsertBookRating): Promise<BookRating> {
    const existing = await this.getUserBookRating(rating.bookId, rating.userId);
    if (existing) {
      const [updated] = await db.update(bookRatings).set({ rating: rating.rating }).where(eq(bookRatings.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(bookRatings).values(rating).returning();
    return created;
  }

  async getAverageBookRating(bookId: string): Promise<{ average: number; count: number }> {
    const ratings = await this.getBookRatingsByBookId(bookId);
    if (ratings.length === 0) return { average: 0, count: 0 };
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / ratings.length, count: ratings.length };
  }

  async getQuizCompletionCount(quizId: string): Promise<number> {
    const results = await db.select().from(quizResults).where(eq(quizResults.quizId, quizId));
    return results.length;
  }

  async createContactMessage(msg: InsertContactMessage): Promise<ContactMessage> {
    const [created] = await db.insert(contactMessages).values(msg).returning();
    return created;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages);
  }

  async getAllPartners(): Promise<Partner[]> {
    return db.select().from(partners).orderBy(partners.sortOrder);
  }

  async getActivePartners(): Promise<Partner[]> {
    return db.select().from(partners).where(eq(partners.active, true)).orderBy(partners.sortOrder);
  }

  async getPartner(id: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [created] = await db.insert(partners).values(partner).returning();
    return created;
  }

  async updatePartner(id: string, data: Partial<InsertPartner>): Promise<Partner | undefined> {
    const [updated] = await db.update(partners).set(data).where(eq(partners.id, id)).returning();
    return updated;
  }

  async deletePartner(id: string): Promise<void> {
    await db.delete(partners).where(eq(partners.id, id));
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return db.select().from(challenges).orderBy(desc(challenges.createdAt));
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    return db.select().from(challenges).where(eq(challenges.active, true)).orderBy(desc(challenges.createdAt));
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [created] = await db.insert(challenges).values(challenge).returning();
    return created;
  }

  async updateChallenge(id: string, data: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const [updated] = await db.update(challenges).set(data).where(eq(challenges.id, id)).returning();
    return updated;
  }

  async deleteChallenge(id: string): Promise<void> {
    await db.delete(challenges).where(eq(challenges.id, id));
  }

  async createBonusPoints(data: any) {
    const [result] = await db.insert(bonusPoints).values(data).returning();
    return result;
  }

  async getBonusPointsForStudent(studentId: string) {
    return await db
      .select()
      .from(bonusPoints)
      .where(eq(bonusPoints.studentId, studentId))
      .orderBy(desc(bonusPoints.createdAt));
  }

  async createBookRecommendation(data: any) {
    const [result] = await db.insert(bookRecommendations).values(data).returning();
    return result;
  }

  async getRecommendationsForUser(userId: string) {
    return await db
      .select({
        id: bookRecommendations.id,
        message: bookRecommendations.message,
        priority: bookRecommendations.priority,
        read: bookRecommendations.read,
        createdAt: bookRecommendations.createdAt,
        book: books,
        fromUser: {
          id: users.id,
          fullName: users.fullName,
          role: users.role,
        },
      })
      .from(bookRecommendations)
      .leftJoin(books, eq(bookRecommendations.bookId, books.id))
      .leftJoin(users, eq(bookRecommendations.fromUserId, users.id))
      .where(eq(bookRecommendations.toUserId, userId))
      .orderBy(desc(bookRecommendations.createdAt));
  }

  async markRecommendationAsRead(recommendationId: string) {
    await db
      .update(bookRecommendations)
      .set({ read: true })
      .where(eq(bookRecommendations.id, recommendationId));
  }

  async createClassChallenge(data: any) {
    const [result] = await db.insert(classChallenges).values(data).returning();
    return result;
  }

  async getActiveChallengesForClass(className: string) {
    const now = new Date();
    return await db
      .select({
        challenge: classChallenges,
        book: books,
      })
      .from(classChallenges)
      .leftJoin(books, eq(classChallenges.bookId, books.id))
      .where(
        and(
          eq(classChallenges.className, className),
          eq(classChallenges.active, true),
          lte(classChallenges.startDate, now),
          gte(classChallenges.endDate, now)
        )
      )
      .orderBy(desc(classChallenges.createdAt));
  }

  async updateClassChallenge(id: string, data: any) {
    const [result] = await db
      .update(classChallenges)
      .set(data)
      .where(eq(classChallenges.id, id))
      .returning();
    return result;
  }

  async getLastQuizResultForUser(userId: string) {
    const [result] = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.completedAt))
      .limit(1);
    return result || null;
  }

  async getLeaderboard(startDate: Date, ageGroup?: string) {
    const conditions: any[] = [gte(quizResults.completedAt, startDate)];

    const results = await db.select().from(quizResults).where(and(...conditions));
    const scoreMap = new Map<string, number>();
    for (const r of results) {
      scoreMap.set(r.userId, (scoreMap.get(r.userId) || 0) + r.score);
    }
    const sorted = Array.from(scoreMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const leaderboard: any[] = [];
    for (const [userId, totalScore] of sorted) {
      const user = await this.getUser(userId);
      if (user) {
        if (ageGroup) {
          const allowedGroups = ageGroup.split(",");
          if (!allowedGroups.includes(user.ageGroup || "R1")) continue;
        }
        leaderboard.push({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          className: user.className,
          points: totalScore,
          ageGroup: user.ageGroup,
        });
        if (leaderboard.length >= 10) break;
      }
    }
    return leaderboard;
  }

  async createBookBorrowing(data: any) {
    const [result] = await db.insert(bookBorrowings).values(data).returning();
    return result;
  }

  async getActiveBorrowings(librarianId?: string) {
    const conditions: any[] = [isNull(bookBorrowings.returnedAt)];

    if (librarianId) {
      conditions.push(eq(bookBorrowings.librarianId, librarianId));
    }

    const results = await db
      .select({
        borrowing: bookBorrowings,
        student: {
          id: users.id,
          fullName: users.fullName,
          className: users.className,
        },
        book: books,
      })
      .from(bookBorrowings)
      .leftJoin(users, eq(bookBorrowings.studentId, users.id))
      .leftJoin(books, eq(bookBorrowings.bookId, books.id))
      .where(and(...conditions))
      .orderBy(desc(bookBorrowings.borrowedAt));

    return results;
  }

  async returnBook(borrowingId: string) {
    await db
      .update(bookBorrowings)
      .set({ returnedAt: new Date() })
      .where(eq(bookBorrowings.id, borrowingId));
  }

  async getAllGenres(): Promise<Genre[]> {
    return db.select().from(genres).orderBy(genres.sortOrder);
  }

  async getGenre(id: string): Promise<Genre | undefined> {
    const [genre] = await db.select().from(genres).where(eq(genres.id, id));
    return genre;
  }

  async getGenreBySlug(slug: string): Promise<Genre | undefined> {
    const [genre] = await db.select().from(genres).where(eq(genres.slug, slug));
    return genre;
  }

  async createGenre(genre: InsertGenre): Promise<Genre> {
    const [created] = await db.insert(genres).values(genre).returning();
    return created;
  }

  async updateGenre(id: string, data: Partial<InsertGenre>): Promise<Genre | undefined> {
    const [updated] = await db.update(genres).set(data).where(eq(genres.id, id)).returning();
    return updated;
  }

  async deleteGenre(id: string): Promise<void> {
    await db.delete(bookGenres).where(eq(bookGenres.genreId, id));
    await db.delete(genres).where(eq(genres.id, id));
  }

  async getBookGenres(bookId: string): Promise<Genre[]> {
    const bgs = await db.select().from(bookGenres).where(eq(bookGenres.bookId, bookId));
    if (bgs.length === 0) return [];
    const genreList: Genre[] = [];
    for (const bg of bgs) {
      const [g] = await db.select().from(genres).where(eq(genres.id, bg.genreId));
      if (g) genreList.push(g);
    }
    return genreList;
  }

  async setBookGenres(bookId: string, genreIds: string[]): Promise<void> {
    await db.delete(bookGenres).where(eq(bookGenres.bookId, bookId));
    if (genreIds.length > 0) {
      await db.insert(bookGenres).values(genreIds.map(genreId => ({ bookId, genreId })));
    }
  }

  async getBooksByGenreId(genreId: string): Promise<Book[]> {
    const bgs = await db.select().from(bookGenres).where(eq(bookGenres.genreId, genreId));
    const bookList: Book[] = [];
    for (const bg of bgs) {
      const [book] = await db.select().from(books).where(eq(books.id, bg.bookId));
      if (book) bookList.push(book);
    }
    return bookList;
  }

  async createParentChildRequest(request: InsertParentChildRequest): Promise<ParentChildRequest> {
    const [created] = await db.insert(parentChildRequests).values(request).returning();
    return created;
  }

  async getParentChildRequestsByTeacherId(teacherId: string): Promise<ParentChildRequest[]> {
    return db.select().from(parentChildRequests).where(eq(parentChildRequests.teacherId, teacherId));
  }

  async getParentChildRequestsByParentId(parentId: string): Promise<ParentChildRequest[]> {
    return db.select().from(parentChildRequests).where(eq(parentChildRequests.parentId, parentId));
  }

  async getParentChildRequest(id: string): Promise<ParentChildRequest | undefined> {
    const [request] = await db.select().from(parentChildRequests).where(eq(parentChildRequests.id, id));
    return request;
  }

  async updateParentChildRequestStatus(id: string, status: string): Promise<ParentChildRequest | undefined> {
    const [updated] = await db.update(parentChildRequests).set({ status } as any).where(eq(parentChildRequests.id, id)).returning();
    return updated;
  }

  async getPendingParentRequestForStudent(parentId: string, studentId: string): Promise<ParentChildRequest | undefined> {
    const [request] = await db.select().from(parentChildRequests).where(
      and(
        eq(parentChildRequests.parentId, parentId),
        eq(parentChildRequests.studentId, studentId),
        eq(parentChildRequests.status, "pending")
      )
    );
    return request;
  }

  async getTeachersBySchoolAdminId(schoolAdminId: string): Promise<User[]> {
    return db.select().from(users).where(
      and(eq(users.createdBySchoolAdminId, schoolAdminId), eq(users.role, "teacher"))
    );
  }

  async getPendingSchoolAdmins(): Promise<User[]> {
    return db.select().from(users).where(
      and(eq(users.role, "school_admin"), eq(users.approved, false))
    );
  }

  async getAllBookListings(): Promise<BookListing[]> {
    return db.select().from(bookListings).where(eq(bookListings.active, true)).orderBy(desc(bookListings.createdAt));
  }

  async getBookListingsByUserId(userId: string): Promise<BookListing[]> {
    return db.select().from(bookListings).where(eq(bookListings.userId, userId)).orderBy(desc(bookListings.createdAt));
  }

  async createBookListing(listing: InsertBookListing): Promise<BookListing> {
    const [created] = await db.insert(bookListings).values(listing).returning();
    return created;
  }

  async deleteBookListing(id: string): Promise<void> {
    await db.delete(bookListings).where(eq(bookListings.id, id));
  }

  async updateBookListing(id: string, data: Partial<InsertBookListing>): Promise<BookListing | undefined> {
    const [updated] = await db.update(bookListings).set(data).where(eq(bookListings.id, id)).returning();
    return updated;
  }

  async createDuel(duel: InsertDuel): Promise<Duel> {
    const [created] = await db.insert(duels).values(duel).returning();
    return created;
  }

  async getDuel(id: string): Promise<Duel | undefined> {
    const [duel] = await db.select().from(duels).where(eq(duels.id, id));
    return duel;
  }

  async getDuelsByUserId(userId: string): Promise<Duel[]> {
    return db.select().from(duels).where(
      or(eq(duels.challengerId, userId), eq(duels.opponentId, userId))
    ).orderBy(desc(duels.createdAt));
  }

  async getActiveDuelForUser(userId: string): Promise<Duel | undefined> {
    const [duel] = await db.select().from(duels).where(
      and(
        or(eq(duels.challengerId, userId), eq(duels.opponentId, userId)),
        or(eq(duels.status, "active"), eq(duels.status, "pending"))
      )
    );
    return duel;
  }

  async getPendingDuelsForUser(userId: string): Promise<Duel[]> {
    return db.select().from(duels).where(
      and(eq(duels.opponentId, userId), eq(duels.status, "pending"))
    ).orderBy(desc(duels.createdAt));
  }

  async updateDuelStatus(id: string, status: string, winnerId?: string): Promise<Duel | undefined> {
    const updateData: any = { status };
    if (winnerId) updateData.winnerId = winnerId;
    const [updated] = await db.update(duels).set(updateData).where(eq(duels.id, id)).returning();
    return updated;
  }

  async findDuelOpponent(userId: string, pointsRange: number): Promise<User | undefined> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) return undefined;
    const minPoints = Math.max(0, (currentUser.points ?? 0) - pointsRange);
    const maxPoints = (currentUser.points ?? 0) + pointsRange;

    const activeDuelUserIds = await db.select({ id: duels.challengerId }).from(duels).where(
      or(eq(duels.status, "active"), eq(duels.status, "pending"))
    );
    const activeDuelOpponentIds = await db.select({ id: duels.opponentId }).from(duels).where(
      or(eq(duels.status, "active"), eq(duels.status, "pending"))
    );
    const busyIds = new Set([
      userId,
      ...activeDuelUserIds.map(r => r.id),
      ...activeDuelOpponentIds.map(r => r.id),
    ]);

    const candidates = await db.select().from(users).where(
      and(
        ne(users.id, userId),
        gte(users.points, minPoints),
        lte(users.points, maxPoints),
        or(eq(users.role, "student"), eq(users.role, "reader"))
      )
    );

    const available = candidates.filter(c => !busyIds.has(c.id));
    if (available.length === 0) return undefined;
    return available[Math.floor(Math.random() * available.length)];
  }

  async incrementDuelWins(userId: string): Promise<void> {
    await db.update(users).set({ duelWins: sql`COALESCE(${users.duelWins}, 0) + 1` }).where(eq(users.id, userId));
  }

  async logPageView(data: { path: string; ipHash?: string; country?: string; countryCode?: string; city?: string; userAgent?: string; referrer?: string; userId?: string }): Promise<void> {
    await db.insert(pageViews).values({
      path: data.path,
      ipHash: data.ipHash,
      country: data.country,
      countryCode: data.countryCode,
      city: data.city,
      userAgent: data.userAgent,
      referrer: data.referrer,
      userId: data.userId,
    });
  }

  async getAnalyticsSummary(): Promise<{ today: number; week: number; month: number; total: number; uniqueToday: number; uniqueMonth: number }> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(pageViews).where(gte(pageViews.visitedAt, startOfToday));
    const [weekResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(pageViews).where(gte(pageViews.visitedAt, startOfWeek));
    const [monthResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(pageViews).where(gte(pageViews.visitedAt, startOfMonth));
    const [totalResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(pageViews);
    const [uniqueTodayResult] = await db.select({ count: sql<number>`COUNT(DISTINCT ip_hash)` }).from(pageViews).where(gte(pageViews.visitedAt, startOfToday));
    const [uniqueMonthResult] = await db.select({ count: sql<number>`COUNT(DISTINCT ip_hash)` }).from(pageViews).where(gte(pageViews.visitedAt, startOfMonth));

    return {
      today: Number(todayResult?.count || 0),
      week: Number(weekResult?.count || 0),
      month: Number(monthResult?.count || 0),
      total: Number(totalResult?.count || 0),
      uniqueToday: Number(uniqueTodayResult?.count || 0),
      uniqueMonth: Number(uniqueMonthResult?.count || 0),
    };
  }

  async getPageViewsByDay(days: number): Promise<{ date: string; views: number; unique: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await db.execute(sql`
      SELECT 
        DATE(visited_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT ip_hash) as unique
      FROM page_views
      WHERE visited_at >= ${since.toISOString()}
      GROUP BY DATE(visited_at)
      ORDER BY date ASC
    `);

    return (rows.rows as any[]).map(r => ({
      date: r.date,
      views: Number(r.views),
      unique: Number(r.unique),
    }));
  }

  async getTopPages(limit: number): Promise<{ path: string; views: number }[]> {
    const rows = await db.execute(sql`
      SELECT path, COUNT(*) as views
      FROM page_views
      GROUP BY path
      ORDER BY views DESC
      LIMIT ${limit}
    `);

    return (rows.rows as any[]).map(r => ({
      path: r.path,
      views: Number(r.views),
    }));
  }

  async getTopCountries(limit: number): Promise<{ country: string; countryCode: string; views: number }[]> {
    const rows = await db.execute(sql`
      SELECT country, country_code as "countryCode", COUNT(*) as views
      FROM page_views
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country, country_code
      ORDER BY views DESC
      LIMIT ${limit}
    `);

    return (rows.rows as any[]).map(r => ({
      country: r.country || 'Nepoznato',
      countryCode: r.countryCode || '',
      views: Number(r.views),
    }));
  }

  async getTopCities(limit: number): Promise<{ city: string; country: string; countryCode: string; views: number }[]> {
    const rows = await db.execute(sql`
      SELECT city, country, country_code as "countryCode", COUNT(*) as views
      FROM page_views
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city, country, country_code
      ORDER BY views DESC
      LIMIT ${limit}
    `);
    return (rows.rows as any[]).map(r => ({
      city: r.city || 'Nepoznato',
      country: r.country || '',
      countryCode: r.countryCode || '',
      views: Number(r.views),
    }));
  }

  async getViewsByHour(): Promise<{ hour: number; views: number }[]> {
    const rows = await db.execute(sql`
      SELECT EXTRACT(HOUR FROM visited_at) as hour, COUNT(*) as views
      FROM page_views
      GROUP BY EXTRACT(HOUR FROM visited_at)
      ORDER BY hour ASC
    `);
    const result: { hour: number; views: number }[] = [];
    const map = new Map((rows.rows as any[]).map(r => [Number(r.hour), Number(r.views)]));
    for (let h = 0; h < 24; h++) {
      result.push({ hour: h, views: map.get(h) || 0 });
    }
    return result;
  }

  async getDeviceBreakdown(): Promise<{ device: string; views: number }[]> {
    const rows = await db.execute(sql`
      SELECT user_agent, COUNT(*) as views
      FROM page_views
      WHERE user_agent IS NOT NULL AND user_agent != ''
      GROUP BY user_agent
    `);
    const counts: Record<string, number> = { Mobilni: 0, Desktop: 0, Tablet: 0, Nepoznato: 0 };
    for (const r of rows.rows as any[]) {
      const ua = (r.user_agent || '').toLowerCase();
      const n = Number(r.views);
      if (ua.includes('tablet') || ua.includes('ipad')) {
        counts['Tablet'] += n;
      } else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('samsung')) {
        counts['Mobilni'] += n;
      } else if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') || ua.includes('firefox') || ua.includes('edge')) {
        counts['Desktop'] += n;
      } else {
        counts['Nepoznato'] += n;
      }
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([device, views]) => ({ device, views }))
      .sort((a, b) => b.views - a.views);
  }

  async getTopReferrers(limit: number): Promise<{ referrer: string; views: number }[]> {
    const rows = await db.execute(sql`
      SELECT referrer, COUNT(*) as views
      FROM page_views
      WHERE referrer IS NOT NULL AND referrer != ''
      GROUP BY referrer
      ORDER BY views DESC
      LIMIT ${limit}
    `);
    return (rows.rows as any[]).map(r => {
      let ref = r.referrer || '';
      try {
        const u = new URL(ref);
        ref = u.hostname.replace(/^www\./, '');
      } catch {}
      return { referrer: ref, views: Number(r.views) };
    });
  }

  async getQuizCompletionsByDay(days: number): Promise<{ date: string; completions: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await db.execute(sql`
      SELECT DATE(completed_at) as date, COUNT(*) as completions
      FROM quiz_results
      WHERE completed_at >= ${since.toISOString()}
      GROUP BY DATE(completed_at)
      ORDER BY date ASC
    `);
    return (rows.rows as any[]).map(r => ({
      date: r.date,
      completions: Number(r.completions),
    }));
  }
}

export const storage = new DatabaseStorage();
