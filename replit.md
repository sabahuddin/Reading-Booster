# Čitanje - Platforma za unapređenje čitanja

## Overview
A full-stack reading improvement platform inspired by antolin.de. Users read books, take quizzes, earn points, and track progress. Supports multiple user roles: students, teachers, parents, and admins.

## Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + express-session
- **Database:** PostgreSQL with Drizzle ORM
- **Routing:** wouter (frontend), Express (backend)
- **State Management:** TanStack React Query v5

## User Roles
- **Admin** - Full platform management (books, quizzes, users, blog, messages, partners, challenges, institutional approvals)
- **Teacher (Učitelj)** - View students, create student accounts (auto-generated credentials), export CSV, track progress
- **Parent (Roditelj)** - View children's progress and quiz results
- **Student (Učenik)** - Browse library, take quizzes, earn points

## Project Structure
```
client/src/
  pages/           - All page components
  components/      - Shared components (navbar, footer, dashboard-layout)
  hooks/           - Custom hooks (use-auth, use-toast, use-mobile)
  lib/             - Utility functions (queryClient, utils)
server/
  index.ts         - Express app setup, session config, auth middleware
  routes.ts        - All API routes
  storage.ts       - Database storage layer (IStorage interface)
  db.ts            - Drizzle database connection
  seed.ts          - Database seeding script
shared/
  schema.ts        - Drizzle schemas and Zod validation
```

## Key Routes
### Public: /, /blog, /cijene, /kontakt, /prijava, /registracija
### Student: /ucenik, /ucenik/biblioteka, /ucenik/knjiga/:id, /ucenik/kviz/:id, /ucenik/rezultati
### Teacher: /ucitelj, /ucitelj/ucenici, /ucitelj/biblioteka
### Parent: /roditelj, /roditelj/djeca
### Admin: /admin, /admin/knjige, /admin/kvizovi, /admin/korisnici, /admin/blog, /admin/poruke, /admin/partneri, /admin/izazovi, /admin/odobrenja

## API Prefix: /api
All backend routes are prefixed with /api. Auth uses session cookies.

## Auth
Session-based auth with connect-pg-simple. Passwords hashed with crypto scrypt.

## Default Test Accounts
- Admin: admin / admin123
- Teacher: ucitelj1 / ucitelj123
- Parent: roditelj1 / roditelj123
- Student: ucenik1 / ucenik123, ucenik2 / ucenik123

## Scoring System
- +1 point per correct answer
- -1 point per wrong answer
- Minimum score per quiz: 0
- Points accumulate on user profile

## New Features
- **Partners (Naši partneri):** Admin CRUD for partners with logo upload, displayed on landing page above footer
- **Challenges (Izazovi):** Admin CRUD for reading challenges with prizes, displayed on landing page
- **Leaderboard:** Public top readers by week/month/year on landing page (/api/leaderboard?period=week|month|year)
- **Institutional Registration:** Three-tab auth page - login, self-registration (student/parent), institutional registration (school/mekteb with role selection, requires admin approval)
- **Teacher Student Creation:** Teachers create student accounts with auto-generated usernames (diacritics-stripped) and passwords
- **CSV Export:** Teachers can export student data as CSV with UTF-8 BOM for Excel compatibility (/api/teacher/export)
- **User fields:** institutionType, institutionRole, approved, maxStudentAccounts, createdByTeacherId

## Database Tables
- users, books, quizzes, questions, quiz_results, blog_posts, contact_messages, partners, challenges

## Language
UI is in Bosnian/Croatian. All user-facing text is in Croatian.
