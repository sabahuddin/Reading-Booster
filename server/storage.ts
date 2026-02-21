import { eq, and, gte, lte, desc, isNull } from "drizzle-orm";
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
  parentChildRequests,
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
}

export const storage = new DatabaseStorage();
