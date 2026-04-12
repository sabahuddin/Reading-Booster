# Čitanje.ba — Platforma za unapređenje čitanja

## Overview
"Čitanje.ba" is a full-stack platform designed to promote reading and measure reading comprehension in the Bosnian-Croatian speaking area. Inspired by the antolin.de model, it allows users to read books, solve quizzes, collect points, and track progress. The platform targets schools, libraries, and families, focusing on physical books and integration with school libraries. It supports individual, family, and institutional use with gamification elements like points, badges, leaderboards, and duels.

**Key Capabilities:**
- A library of approximately 2,000 books and 234 quizzes with over 6,000 questions.
- Six user roles: Admin, School Admin, Teacher, Parent, Reader, Student.
- Age-group specific content and scoring (R1/R4/R7/O/A).
- Gamification features: points, 6-level badges, leaderboards, duels, weekly streaks.
- Certificates for completed quizzes.
- A book exchange marketplace for physical books (sale/gift/swap).
- Teacher-managed quiz editor (admin approval required).
- Blog, reading challenges, partner showcases, and PWA support.
- Visit analytics with geolocation and graphical reporting.

## User Preferences
Ne definirano.

## System Architecture

### Design
- **Brand:** "Čitanje" / "Čitanje.ba"
- **Color Scheme:** Primary #FF861C (warm orange), accent HSL(28, 95%, 48%), landing page overlay rgba(210,105,10,0.85), CTA section hsl(28,95%,45%).
- **Font:** Nunito / Comic Neue.
- **Logo:** Prominently displayed in navigation.
- **Book Covers:** Portrait format 2:3.
- **Age Groups:** Each age group (R1, R4, R7, O, A) has a distinct color for visual differentiation.

### Technical Implementation
- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, wouter (routing), TanStack React Query v5 (state management).
- **Backend:** Node.js, Express, express-session.
- **Database:** PostgreSQL with Drizzle ORM.
- **Authentication:** Session-based with `connect-pg-simple`. Passwords are hashed using `crypto scrypt` in `hashHex.saltHex` format.
- **Security:** Rate limiting (API: 100 req/15min; login: 5 attempts/15min), XSS sanitization on all `/api` routes, password validation (min 8 chars, uppercase, number).
- **API Prefix:** All backend routes are prefixed with `/api`.
- **Project Structure:** Clear separation of client, server, and shared directories.
- **User Roles:** Admin, School Admin, Teacher, Parent, Reader, Student, each with specific access and functionalities.

### Feature Specifications
- **Library and Books:** Public library with filters, featured books, recommendations, detailed book pages. Admin CSV bulk import for books and cover uploads.
- **Quizzes:** Interactive, timed quizzes (30s/question), auto-advance, auto-submit. Dynamic scoring based on book age group. AI generation of quizzes (OpenAI) and CSV bulk import of questions. Quizzes are randomized. Passing thresholds: R1 (40%), others (50%). Failed quizzes have a 48h cooldown.
- **Book Rating:** User ratings (1-5 stars) with an upsert system.
- **Social Sharing:** Sharing books on Facebook, Twitter/X, WhatsApp, Instagram, TikTok.
- **Book Exchange Marketplace (`/razmjena`):** Platform for selling, donating, and exchanging physical books, with search, filtering, and user-managed listings, including image uploads and admin moderation.
- **Duel System:** Users challenge opponents with similar scores in goal-based competitions, displaying usernames.
- **Badges:** Automatic system based on total user points, displayed on profiles and leaderboards (levels: Početnik to Maestro).
- **Leaderboard:** Public display of top readers, separated by "Kids" and "Adults," with weekly/monthly/yearly filters.
- **Teacher Dashboard:** Class overview with student point charts and top genres. Student management (creation, deletion, class/name editing), bonus points, inactive students, weekly challenges, parent request approvals.
- **Parent Dashboard:** Child progress overview, creation of up to 3 child accounts, management of child accounts created by parent (password changes, profile deletion).
- **Student Profile:** Fields for name, surname, class, age group. Password managed by teacher or parent.
- **Visit Analytics (`/admin/analitika`):** Automated tracking of page views with IP geolocated and hashed. Admin dashboard displays summary cards, views/quizzes solved charts, hourly activity, top countries, cities, pages, referrers, device types, and daily quiz completions.
- **Partners & Challenges:** Admin CRUD for partners and reading challenges, displayed on the homepage.
- **Registration:** Separate tabs for general and institutional registration, with `ageGroup` field for all users. Institutional registrations await admin approval.
- **Blog:** Admin-managed blog posts with keywords, public display, filtering, comments, and rating system.
- **Notifications:** In-app bell icon for unread notifications related to quizzes, streaks, and recommendations.
- **Bookmarks:** Users can bookmark books, viewable on a dedicated `/bookmarks` page.
- **Certificates:** Printable certificates for each passed quiz, accessible via student/reader dashboards.
- **Classrooms:** Teachers create and manage classroom groups. Students are assigned to classes. School admins can view all classes and move students between them.
- **Teacher Quiz Editing:** Teachers can add 1-5 questions to existing quizzes, which enter a "pending" status for admin approval/rejection. Approved quizzes display the teacher's name.
- **Teacher Quiz Creation:** Teachers can create new quizzes (1-40 questions) for books without a quiz, or create a brand new book + quiz together. Both require admin approval before becoming visible. Pending teacher-created quizzes/books are hidden from students until approved.
- **Admin Quiz Creation Approvals:** New tab in admin approvals page for reviewing teacher-created quizzes (separate from quiz edits). Approve = publish book+quiz; Reject = delete everything.
- **Forgot Password:** Allows users to reset passwords via a token-based system (for admin use, no email service).
- **Weekly Streak:** Automatic tracking of consecutive weeks with a solved quiz, displayed as a banner and generates milestone notifications.
- **Book Recommendations:** "Recommended for you" section displaying 5 unread books from the user's age group.
- **PWA (Progressive Web App):** Configured with manifest.json, icons, and theme colors for installability.
- **Print Buttons:** Functionality to print reports from student, reader, and parent dashboards.
- **Admin User Bulk Operations:** Checkbox for selecting users, bulk deactivate button, and CSV export.

### Critical Implementation Notes
- Production data must never be deleted. Seed loader is additive.
- Authentication hash format: `hashHex.saltHex`.
- Subscription system is currently disabled; all users have unlimited quiz access.
- Quiz questions are randomized and minimum question pools are enforced (R1=15, R4=25, R7/O/A=30).
- Production environment requires execution of `./scripts/delete-short-quizzes.sh` to remove quizzes below standard.

## External Dependencies
- **OpenAI API:** For AI-generated quizzes.
- **GitHub:** For version control.
- **Coolify / Hetzner:** For deployment and PostgreSQL database hosting.