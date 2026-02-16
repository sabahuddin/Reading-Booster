# Čitaj! - Platforma za unapređenje čitanja

## Overview
A full-stack reading improvement platform inspired by antolin.de. Users read books, take quizzes, earn points, and track progress. Supports multiple user roles: students, teachers, parents, and admins.

## Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + express-session
- **Database:** PostgreSQL with Drizzle ORM
- **Routing:** wouter (frontend), Express (backend)
- **State Management:** TanStack React Query v5

## User Roles
- **Admin** - Full platform management (books, quizzes, users, blog, messages)
- **Teacher (Učitelj)** - View students in their school/class, track progress
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
### Admin: /admin, /admin/knjige, /admin/kvizovi, /admin/korisnici, /admin/blog, /admin/poruke

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

## Language
UI is in Bosnian/Croatian. All user-facing text is in Croatian.
