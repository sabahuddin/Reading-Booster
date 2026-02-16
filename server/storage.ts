import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  books,
  quizzes,
  questions,
  quizResults,
  blogPosts,
  contactMessages,
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
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(id: string, points: number): Promise<User | undefined>;
  getStudentsBySchoolAndClass(schoolName: string, className: string): Promise<User[]>;
  getChildrenByParentId(parentId: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

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
  createQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getQuizResultByUserAndQuiz(userId: string, quizId: string): Promise<QuizResult | undefined>;

  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<void>;

  createContactMessage(msg: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
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

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts);
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
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async createContactMessage(msg: InsertContactMessage): Promise<ContactMessage> {
    const [created] = await db.insert(contactMessages).values(msg).returning();
    return created;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages);
  }
}

export const storage = new DatabaseStorage();
