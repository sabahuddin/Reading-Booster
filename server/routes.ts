import type { Express } from "express";
import { createServer, type Server } from "http";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import multer from "multer";
import express from "express";
import { storage } from "./storage";
import { requireAuth, requireAdmin, requireTeacher } from "./index";
import {
  insertUserSchema,
  insertBookSchema,
  insertQuizSchema,
  insertQuestionSchema,
  insertQuizResultSchema,
  insertBlogPostSchema,
  insertContactMessageSchema,
  insertPartnerSchema,
  insertChallengeSchema,
} from "@shared/schema";

const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(path.join(uploadsDir, "covers"), { recursive: true });
fs.mkdirSync(path.join(uploadsDir, "books"), { recursive: true });
fs.mkdirSync(path.join(uploadsDir, "logos"), { recursive: true });

const coverStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(uploadsDir, "covers")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`);
  },
});

const bookFileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(uploadsDir, "books")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`);
  },
});

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(uploadsDir, "logos")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`);
  },
});

const uploadCover = multer({ storage: coverStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Samo slike su dozvoljene"));
}});

const uploadBookFile = multer({ storage: bookFileStorage, limits: { fileSize: 50 * 1024 * 1024 } });

const uploadLogo = multer({ storage: logoStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Samo slike su dozvoljene"));
}});

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return buf.toString("hex") === hashed;
}

function generateUsername(fullName: string): string {
  const parts = fullName.toLowerCase().trim().split(/\s+/);
  const base = parts
    .map(p => p.replace(/[čćžšđ]/g, (c) => ({ č: "c", ć: "c", ž: "z", š: "s", đ: "dj" }[c] || c)).replace(/[^a-z]/g, ""))
    .join(".");
  const num = Math.floor(10 + Math.random() * 90);
  return `${base}${num}`;
}

function generatePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 8; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use("/uploads", express.static(uploadsDir));

  // ==================== UPLOAD ROUTES ====================

  app.post("/api/upload/cover", requireAdmin, uploadCover.single("cover"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Datoteka nije poslana" });
    }
    const url = `/uploads/covers/${req.file.filename}`;
    return res.json({ url });
  });

  app.post("/api/upload/book", requireAdmin, uploadBookFile.single("book"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Datoteka nije poslana" });
    }
    const url = `/uploads/books/${req.file.filename}`;
    return res.json({ url });
  });

  app.post("/api/upload/logo", requireAdmin, uploadLogo.single("logo"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Datoteka nije poslana" });
    }
    const url = `/uploads/logos/${req.file.filename}`;
    return res.json({ url });
  });

  // ==================== AUTH ROUTES ====================

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }

      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(parsed.data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const isInstitutional = parsed.data.institutionType && parsed.data.institutionRole;

      const hashedPassword = await hashPassword(parsed.data.password);
      const userData: any = {
        ...parsed.data,
        password: hashedPassword,
        role: isInstitutional ? "teacher" : parsed.data.role,
        approved: isInstitutional ? false : undefined,
      };

      const user = await storage.createUser(userData);

      if (!isInstitutional) {
        req.session.userId = user.id;
        req.session.userRole = user.role;
      }

      const { password, ...userWithoutPassword } = user;

      if (isInstitutional) {
        return res.status(201).json({ ...userWithoutPassword, pendingApproval: true });
      }

      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.role === "teacher" && user.institutionType && user.approved === false) {
        return res.status(403).json({ message: "Vaš račun čeka odobrenje administratora." });
      }

      const valid = await comparePasswords(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });

  // ==================== BOOKS ROUTES ====================

  app.get("/api/books", async (_req, res) => {
    try {
      const allBooks = await storage.getAllBooks();
      return res.json(allBooks);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id as string);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      return res.json(book);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/books", requireAdmin, async (req, res) => {
    try {
      const parsed = insertBookSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const book = await storage.createBook(parsed.data);
      return res.status(201).json(book);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/books/:id", requireAdmin, async (req, res) => {
    try {
      const book = await storage.updateBook(req.params.id as string, req.body);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      return res.json(book);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/books/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteBook(req.params.id as string);
      return res.json({ message: "Book deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== QUIZ ROUTES ====================

  app.get("/api/books/:bookId/quizzes", async (req, res) => {
    try {
      const quizzesList = await storage.getQuizzesByBookId(req.params.bookId as string);
      return res.json(quizzesList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quizzes", requireAdmin, async (_req, res) => {
    try {
      const allQuizzes = await storage.getAllQuizzes();
      return res.json(allQuizzes);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id as string);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      const questionsList = await storage.getQuestionsByQuizId(quiz.id);
      return res.json({ ...quiz, questions: questionsList });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quizzes", requireAdmin, async (req, res) => {
    try {
      const parsed = insertQuizSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const quiz = await storage.createQuiz(parsed.data);
      return res.status(201).json(quiz);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/quizzes/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteQuiz(req.params.id as string);
      return res.json({ message: "Quiz deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== QUESTIONS ROUTES ====================

  app.get("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const questionsList = await storage.getQuestionsByQuizId(req.params.quizId as string);
      return res.json(questionsList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/questions", requireAdmin, async (req, res) => {
    try {
      const parsed = insertQuestionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const question = await storage.createQuestion(parsed.data);
      return res.status(201).json(question);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/questions/:id", requireAdmin, async (req, res) => {
    try {
      const question = await storage.updateQuestion(req.params.id as string, req.body);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      return res.json(question);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/questions/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteQuestion(req.params.id as string);
      return res.json({ message: "Question deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== QUIZ RESULTS ROUTES ====================

  app.post("/api/quiz-results", requireAuth, async (req, res) => {
    try {
      const { quizId, answers } = req.body;
      if (!quizId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "quizId and answers array are required" });
      }

      const userId = req.session.userId!;

      const existingResult = await storage.getQuizResultByUserAndQuiz(userId, quizId);
      if (existingResult) {
        return res.status(400).json({ message: "You have already taken this quiz" });
      }

      const questionsList = await storage.getQuestionsByQuizId(quizId);
      if (questionsList.length === 0) {
        return res.status(404).json({ message: "No questions found for this quiz" });
      }

      let correctCount = 0;
      let wrongCount = 0;

      for (const answer of answers) {
        const question = questionsList.find((q) => q.id === answer.questionId);
        if (question) {
          if (answer.selectedAnswer === question.correctAnswer) {
            correctCount++;
          } else {
            wrongCount++;
          }
        }
      }

      let score = correctCount - wrongCount;
      if (score < 0) score = 0;

      const result = await storage.createQuizResult({
        userId,
        quizId,
        score,
        totalQuestions: questionsList.length,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
      });

      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUserPoints(userId, user.points + score);
      }

      const quiz = await storage.getQuiz(quizId);
      if (quiz) {
        await storage.incrementTimesRead(quiz.bookId);
      }

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quiz-results/my", requireAuth, async (req, res) => {
    try {
      const results = await storage.getQuizResultsByUserId(req.session.userId!);
      return res.json(results);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quiz-results/user/:userId", requireAuth, async (req, res) => {
    try {
      const role = req.session.userRole;
      if (role === "parent") {
        const children = await storage.getChildrenByParentId(req.session.userId!);
        const isChild = children.some((c) => c.id === req.params.userId);
        if (!isChild) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (role !== "teacher" && role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const results = await storage.getQuizResultsByUserId(req.params.userId as string);
      return res.json(results);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== LEADERBOARD ROUTES ====================

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const period = (req.query.period as string) || "week";
      const now = new Date();
      let since: Date;

      if (period === "year") {
        since = new Date(now.getFullYear(), 0, 1);
      } else if (period === "month") {
        since = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        const dayOfWeek = now.getDay();
        since = new Date(now);
        since.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        since.setHours(0, 0, 0, 0);
      }

      const topReaders = await storage.getTopReadersSince(since, 10);
      return res.json(topReaders);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== BLOG ROUTES ====================

  app.get("/api/blog", async (_req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      return res.json(posts);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id as string);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      return res.json(post);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog", requireAdmin, async (req, res) => {
    try {
      const parsed = insertBlogPostSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const post = await storage.createBlogPost(parsed.data);
      return res.status(201).json(post);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/blog/:id", requireAdmin, async (req, res) => {
    try {
      const post = await storage.updateBlogPost(req.params.id as string, req.body);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      return res.json(post);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/blog/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id as string);
      return res.json({ message: "Blog post deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== CONTACT ROUTES ====================

  app.post("/api/contact", async (req, res) => {
    try {
      const parsed = insertContactMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const msg = await storage.createContactMessage(parsed.data);
      return res.status(201).json(msg);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/contact", requireAdmin, async (_req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      return res.json(messages);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== PARTNERS ROUTES ====================

  app.get("/api/partners", async (_req, res) => {
    try {
      const partnersList = await storage.getActivePartners();
      return res.json(partnersList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/partners", requireAdmin, async (_req, res) => {
    try {
      const partnersList = await storage.getAllPartners();
      return res.json(partnersList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/partners", requireAdmin, async (req, res) => {
    try {
      const parsed = insertPartnerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const partner = await storage.createPartner(parsed.data);
      return res.status(201).json(partner);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/partners/:id", requireAdmin, async (req, res) => {
    try {
      const partner = await storage.updatePartner(req.params.id as string, req.body);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      return res.json(partner);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/partners/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deletePartner(req.params.id as string);
      return res.json({ message: "Partner deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== CHALLENGES ROUTES ====================

  app.get("/api/challenges", async (_req, res) => {
    try {
      const challengesList = await storage.getActiveChallenges();
      return res.json(challengesList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/challenges", requireAdmin, async (_req, res) => {
    try {
      const challengesList = await storage.getAllChallenges();
      return res.json(challengesList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/challenges", requireAdmin, async (req, res) => {
    try {
      const parsed = insertChallengeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const challenge = await storage.createChallenge(parsed.data);
      return res.status(201).json(challenge);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/challenges/:id", requireAdmin, async (req, res) => {
    try {
      const challenge = await storage.updateChallenge(req.params.id as string, req.body);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      return res.json(challenge);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/challenges/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteChallenge(req.params.id as string);
      return res.json({ message: "Challenge deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== ADMIN ROUTES ====================

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(({ password, ...u }) => u);
      return res.json(usersWithoutPasswords);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/pending-teachers", requireAdmin, async (_req, res) => {
    try {
      const pending = await storage.getPendingTeachers();
      const withoutPasswords = pending.map(({ password, ...u }) => u);
      return res.json(withoutPasswords);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/approve-teacher/:id", requireAdmin, async (req, res) => {
    try {
      const { maxStudentAccounts } = req.body;
      const user = await storage.updateUser(req.params.id as string, {
        approved: true,
        maxStudentAccounts: maxStudentAccounts || 30,
      } as any);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }
      const user = await storage.updateUser(req.params.id as string, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id as string);
      return res.json({ message: "User deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const [allUsers, allBooks, allQuizzes, allMessages] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllBooks(),
        storage.getAllQuizzes(),
        storage.getAllContactMessages(),
      ]);
      return res.json({
        totalUsers: allUsers.length,
        totalBooks: allBooks.length,
        totalQuizzes: allQuizzes.length,
        totalMessages: allMessages.length,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== TEACHER ROUTES ====================

  app.get("/api/teacher/students", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const teacher = await storage.getUser(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const createdStudents = await storage.getStudentsByTeacherId(teacherId);

      let classStudents: any[] = [];
      if (teacher.schoolName && teacher.className) {
        classStudents = await storage.getStudentsBySchoolAndClass(teacher.schoolName, teacher.className);
      }

      const allStudentIds = new Set<string>();
      const allStudents: any[] = [];
      for (const s of [...createdStudents, ...classStudents]) {
        if (!allStudentIds.has(s.id)) {
          allStudentIds.add(s.id);
          const { password, ...rest } = s;
          allStudents.push(rest);
        }
      }

      return res.json(allStudents);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/teacher/create-student", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const teacher = await storage.getUser(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      if (teacher.institutionType && teacher.approved !== true) {
        return res.status(403).json({ message: "Vaš račun nije odobren." });
      }

      const currentStudents = await storage.getStudentsByTeacherId(teacherId);
      if (teacher.maxStudentAccounts && currentStudents.length >= teacher.maxStudentAccounts) {
        return res.status(400).json({ message: `Dostigli ste maksimalan broj učeničkih računa (${teacher.maxStudentAccounts}).` });
      }

      const { fullName } = req.body;
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({ message: "Ime i prezime je obavezno." });
      }

      let username = generateUsername(fullName);
      let attempts = 0;
      while (await storage.getUserByUsername(username) && attempts < 10) {
        username = generateUsername(fullName);
        attempts++;
      }

      const plainPassword = generatePassword();
      const hashedPw = await hashPassword(plainPassword);

      const student = await storage.createUser({
        username,
        email: `${username}@citaj.ba`,
        password: hashedPw,
        role: "student",
        fullName: fullName.trim(),
        schoolName: teacher.schoolName,
        className: teacher.className,
        createdByTeacherId: teacherId,
      });

      const { password, ...studentData } = student;
      return res.status(201).json({ ...studentData, generatedPassword: plainPassword });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/teacher/export", requireTeacher, async (req, res) => {
    try {
      const teacherId = req.session.userId!;
      const students = await storage.getStudentsByTeacherId(teacherId);

      let csv = "Ime i prezime,Korisničko ime,Škola,Razred,Bodovi\n";
      for (const s of students) {
        csv += `"${s.fullName}","${s.username}","${s.schoolName || ""}","${s.className || ""}",${s.points}\n`;
      }

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=ucenici.csv");
      return res.send("\uFEFF" + csv);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // ==================== PARENT ROUTES ====================

  app.get("/api/parent/children", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }
      const children = await storage.getChildrenByParentId(req.session.userId!);
      const childrenWithoutPasswords = children.map(({ password, ...c }) => c);
      return res.json(childrenWithoutPasswords);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
