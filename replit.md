# Čitanje - Platforma za unapređenje čitanja

## Overview
"Čitanje" is a full-stack platform designed to enhance reading comprehension and engagement for users in the Bosnian-Croatian speaking regions. Inspired by antolin.de, it allows users to read books, solve quizzes, earn points, and track their progress. The platform targets schools, libraries, and families, emphasizing the discovery of physical books and integration with school libraries. It supports general use and includes features for family-based competitions. The project's vision is to foster a love for reading and improve literacy through interactive and engaging methods.

## User Preferences
Not specified.

## System Architecture

### Design
- **Brand:** "Čitanje"
- **Primary Color:** #FF861C (warm orange, child-friendly)
- **Accent Color:** HSL(28, 95%, 48%)
- **Landing Page Overlay:** rgba(210,105,10,0.85)
- **CTA Section:** hsl(28,95%,45%)
- **Font:** Nunito / Comic Neue
- **Logo:** Prominently displayed in navbar.
- **Book Images:** Portrait aspect ratio 2:3.
- **Age Groups:** Each group (R1, R4, R7, O, A) has a distinct color for visual differentiation.

### Technical Implementation
- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, wouter for routing, TanStack React Query v5 for state management.
- **Backend:** Node.js, Express, express-session.
- **Database:** PostgreSQL with Drizzle ORM.
- **Authentication:** Session-based with `connect-pg-simple`. Passwords hashed using `crypto scrypt`.
- **Security:** Rate limiting (100 req/15min for API, 5 login attempts/15min), XSS sanitization on all `/api` routes, password validation (min 8 chars, uppercase, number).
- **API Prefix:** All backend routes are prefixed with `/api`.
- **Project Structure:** Clear separation of client, server, and shared code.
- **User Roles:** Admin, School Admin, Teacher, Parent, Reader, Student, each with specific access and functionalities.
- **Scoring System:** Points awarded based on book's age group, with R1 children exempt from point deductions for incorrect answers.
- **Quiz Mechanics:**
    - Quiz question limits vary by age group (10-20 questions).
    - Questions are randomized from a larger pool for each attempt.
    - Pass thresholds: 40% for R1, 50% for others.
    - Cooldown period (48h) after failed quiz.
    - Timer: 30 seconds per question, auto-advance and auto-submit.

### Feature Specifications
- **Library & Books:** Public library with filters (genre, age, reading difficulty), featured books, recommendations, detailed book pages, CSV bulk import.
- **Quizzes:** Interactive, scored quizzes with quiz author and completion count. AI and CSV bulk import for quiz generation.
- **Book Rating:** Users can rate books (1-5), upsert system for single rating per user per book.
- **Social Share:** Integration for sharing book details on major social media platforms.
- **Book Marketplace:** Public platform `/razmjena` for selling, donating, and exchanging books with filtering and user-managed listings.
- **Duel System:** Users can challenge opponents with similar scores, target-based competition, real-time progress tracking.
- **Badges:** Automatic badge system based on user points with progress display and leaderboard integration.
- **Leaderboard:** Public display of top readers, separated by "Djeca" and "Odrasli" age groups, filterable by period (week/month/year).
- **Teacher Dashboard:** Class overview, top readers, bonus points allocation, inactivity warnings, weekly challenge creation, student account creation, CSV export.
- **Partners:** Admin CRUD for partners with logo upload, displayed on the homepage.
- **Challenges:** Admin CRUD for reading challenges with rewards.
- **Registration:** Separate tabs for general registration and institutional registration, requiring admin approval for institutions. `ageGroup` field for all users.
- **Blog:** Admin-managed blog posts with keywords, public display, filtering, comments, and rating system.

## External Dependencies
- **OpenAI API:** Used for AI-generated quizzes (via Replit AI Integrations or `OPENAI_API_KEY` fallback).
- **GitHub:** For version control.
- **Coolify / Hetzner:** For deployment and PostgreSQL database management.