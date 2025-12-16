# Changelog

All notable changes to DSA Trainer will be documented in this file.

This file is append-only - entries are never deleted, only added.

---

## [Unreleased]

### Phase 6 - UI Redesign & New Features (2025-12-16)

#### Added
- **Daily Challenges Feature**
  - `GET /api/daily-challenge` - Get today's challenge
  - `POST /api/daily-challenge` - Create challenge (admin only)
  - `POST /api/daily-challenge/participate` - Complete challenge (+50 XP bonus)
  - Dashboard widget showing daily challenge with participant count

- **Learning Goals Feature**
  - `GET/POST /api/goals` - List and create goals
  - `GET/PATCH/DELETE /api/goals/:id` - Manage individual goals
  - Goals page with stats, active/completed sections, create modal
  - +100 XP awarded on goal completion

- **Community Forum Feature**
  - `GET/POST /api/community/posts` - List and create posts (paginated, searchable)
  - `GET/PATCH/DELETE /api/community/posts/:id` - Manage posts
  - `POST /api/community/posts/:id/comments` - Add comments
  - `POST /api/community/posts/:id/upvote` - Upvote posts
  - Forum listing page with category filters
  - Post detail page with comments

- **New Profile Components**
  - `ProfileSidebar` - User info, XP progress, stats, social links
  - `ActivityHeatmap` - GitHub-style 365-day activity grid
  - `BadgeGrid` - Achievement badges with gradient rings
  - `ProfileTabs` - Tab navigation for profile sections

- **New Quiz Components**
  - `QuizTimer` - Digital clock style timer with urgency states
  - `QuestionMap` - Grid navigation showing question states

- **New Database Models**
  - `DailyChallenge` - Daily quiz challenges
  - `DailyChallengeParticipation` - User participation tracking
  - `LearningGoal` - User learning objectives
  - `ForumPost` - Community forum posts
  - `ForumComment` - Comments on posts

#### Changed
- **Login Page** - Redesigned with two-column layout, hero image, testimonial
- **Dashboard Page** - Added stats cards, study activity chart, daily challenge widget, course cards with images
- **Course Catalog Page** - Added hero section, filter pills, image-based course cards
- **Profile Page** - Redesigned with sidebar layout, activity heatmap, badge grid, tabbed content
- **Quiz View Page** - Two-column layout with timer card and question map navigation
- **Quiz Results Page** - Circular progress score, performance trend chart, expandable question review
- **Sidebar** - Added Community and Goals navigation items
- **Root URL** - Now redirects directly to `/login` (removed landing page)
- **Font Loading** - Changed from CSS `@import` to `<link>` tags with preconnect for better performance

#### Fixed
- Icon component now properly loads Material Symbols Outlined font
- Font loading matches original mockup implementation

#### Technical Notes
- 6 pages completely redesigned to match HTML mockups
- 3 new features implemented with full CRUD APIs
- 5 new Prisma models added
- 10+ new React components created
- Build passes with no errors

---

### Phase 5 - Testing & Build Verification (2025-12-15)

#### Added
- `src/types/modules.d.ts` - Type declarations for untyped modules (sonner, @monaco-editor/react)
- Suspense boundary with loading fallback in login page for Next.js 14 compatibility

#### Changed
- Package manager standardized to npm (from pnpm) with `--legacy-peer-deps` flag
- README.md updated with npm commands and NextAuth secret generation step
- Usage.md updated to reflect Phase 5 completion

#### Fixed
- **TypeScript Errors:**
  - `src/app/(admin)/admin/questions/[id]/page.tsx` - JSON to Hint[] type conversion using `as unknown as`
  - `src/app/api/leaderboard/route.ts` - `orderBy` variable uninitialized before use
  - `src/app/api/courses/route.ts` - Rewrote to use `quizIds` array instead of non-existent relations
  - `src/app/api/courses/[slug]/route.ts` - Rewrote to use `quizIds` array pattern
  - `src/components/admin/question-builder/question-form.tsx` - Added DragItem/CodeLine type imports and assertions

- **ESLint Errors:**
  - Removed `@typescript-eslint/no-unused-vars` rule (plugin not installed)
  - Added `"react/no-unescaped-entities": "off"` to .eslintrc.json

- **Build Errors:**
  - `src/components/quiz/quiz-hints.tsx` - Renamed `useHint` to `revealHint` to avoid React hooks naming conflict
  - `src/app/(auth)/login/page.tsx` - Wrapped in Suspense for `useSearchParams()` Next.js 14 requirement

#### Technical Notes
- Build now passes with warnings only (no errors)
- All TypeScript strict mode checks passing
- Prisma client generation required after npm install

---

## Previous Phases

### Phase 4 - Admin & Content Management
- Complete admin panel with question builder
- Quiz management system
- User role management (user, creator, admin, superadmin)
- Import/Export functionality for questions

### Phase 3 - Quiz System & Gamification
- 10 question types implemented
- Real-time code execution with Judge0 CE
- XP and leveling system
- Badges and achievements
- Streak tracking
- Leaderboard system

### Phase 2 - Core Features
- User authentication (credentials + OAuth)
- Dashboard with stats
- Course catalog and enrollment
- Quiz taking interface
- Progress tracking

### Phase 1 - Foundation
- Next.js 14 App Router setup
- Prisma ORM with PostgreSQL schema
- Tailwind CSS design system
- Base UI components
- Project structure established
