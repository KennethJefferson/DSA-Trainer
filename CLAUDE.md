# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DSA Trainer is a **fully-featured gamified learning platform** for Data Structures & Algorithms education built with Next.js 14, TypeScript, Prisma, and Tailwind CSS. The application includes user authentication, a complete quiz engine with 10 question types, code execution capabilities, gamification features (XP, levels, streaks, badges), and a full admin panel for content management.

## Development Status

**Phases Completed:**
- ✅ Phase 1: Core Infrastructure (Database, Auth, UI Components, Pages)
- ✅ Phase 2: Quiz Engine & Question Components (10 question types)
- ✅ Phase 3: Code Execution, Leaderboard, Courses, User Stats
- ✅ Phase 4: Admin Panel & Content Management
- ✅ Phase 5: Build Verification & Bug Fixes
- ✅ Phase 6: UI Redesign & New Features (Daily Challenges, Goals, Community Forum)

**Current State:** Build passes - All features implemented and tested

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js (Credentials + OAuth)
- **Styling:** Tailwind CSS with custom design system
- **Code Editor:** Monaco Editor
- **Drag & Drop:** DND Kit
- **Code Execution:** Judge0 CE API
- **Notifications:** Sonner (toast)

## Project Structure

```
src/
├── app/
│   ├── (admin)/           # Admin panel (role-protected)
│   │   └── admin/
│   │       ├── questions/  # Question CRUD + builder
│   │       ├── quizzes/    # Quiz management
│   │       └── users/      # User management (admin only)
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Two-column login with hero
│   │   └── register/
│   ├── (main)/            # Main app (auth-protected)
│   │   ├── dashboard/     # User dashboard with stats & activity
│   │   ├── courses/       # Course catalog with image cards
│   │   ├── quizzes/       # Quiz browser
│   │   ├── quiz/[id]/     # Quiz player with timer & question map
│   │   ├── leaderboard/   # Rankings
│   │   ├── profile/       # User profile with heatmap & badges
│   │   ├── goals/         # Learning goals management
│   │   ├── community/     # Community forum
│   │   └── settings/      # User settings
│   └── api/               # API routes
│       ├── auth/          # NextAuth + registration
│       ├── questions/     # Question CRUD
│       ├── quizzes/       # Quiz CRUD + submission
│       ├── courses/       # Course endpoints
│       ├── execute/       # Code execution proxy
│       ├── leaderboard/   # Ranking data
│       ├── daily-challenge/  # Daily challenge endpoints
│       ├── goals/         # Learning goals CRUD
│       ├── community/     # Forum posts & comments
│       └── admin/         # Admin-only endpoints
├── components/
│   ├── admin/             # Admin panel components
│   │   └── question-builder/  # Question form & validation
│   ├── dashboard/         # Sidebar, Header, StatCard, DailyChallengeWidget
│   ├── profile/           # ProfileSidebar, ActivityHeatmap, BadgeGrid
│   ├── questions/         # 10 question type components
│   ├── quiz/              # QuizTimer, QuestionMap, QuizContainer
│   ├── providers/         # Context providers
│   └── ui/                # Base UI components
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── auth-utils.ts      # Role-based authorization
│   ├── prisma.ts          # Database client
│   ├── cn.ts              # Class name utility
│   ├── services/
│   │   └── judge0.ts      # Code execution service
│   └── validations/
│       └── question.ts    # Zod schemas
└── types/
    └── next-auth.d.ts     # Type augmentations
```

## Database Schema

### Models (Prisma)
- **User** - Authentication, profile, gamification (XP, level, streak), role
- **Account/Session** - NextAuth OAuth
- **Question** - All 10 question types with JSON content
- **Quiz** - Question collections with settings
- **QuizQuestion** - Quiz-question relationships with ordering
- **QuizAttempt** - User quiz attempts and results
- **QuestionAttempt** - Individual answer tracking
- **UserProgress** - Stats, topic mastery, daily activity
- **Badge/UserBadge** - Achievement system
- **Course/Module** - Learning paths
- **DailyChallenge** - Daily quiz challenges with participation tracking
- **DailyChallengeParticipation** - User participation in daily challenges
- **LearningGoal** - User-defined learning goals with progress tracking
- **ForumPost** - Community forum posts with categories and upvotes
- **ForumComment** - Comments on forum posts

### User Roles
```typescript
enum UserRole {
  user        // Default - can take quizzes
  creator     // Can create/edit questions and quizzes
  admin       // Can manage users + all creator permissions
  superadmin  // Full system access
}
```

## Question Types

| Type | Code | Component | Features |
|------|------|-----------|----------|
| Multiple Choice | `multiple_choice` | `multiple-choice.tsx` | Single answer, shuffle options |
| Multi Select | `multi_select` | `multi-select.tsx` | Multiple answers, partial credit |
| Fill in Blank | `fill_blank` | `fill-blank.tsx` | Code templates with `{{blank}}` placeholders |
| Drag Order | `drag_order` | `drag-order.tsx` | Sortable list, distractors |
| Drag Match | `drag_match` | `drag-match.tsx` | Pair matching |
| Code Blocks | `drag_code_blocks` | `drag-code-blocks.tsx` | Code arrangement with indentation |
| Code Writing | `code_writing` | `code-writing.tsx` | Monaco editor, test cases, Judge0 execution |
| Debugging | `debugging` | `debugging.tsx` | Bug identification, hints |
| True/False | `true_false` | `true-false.tsx` | Binary selection |
| Parsons | `parsons` | `parsons.tsx` | Code reordering + indentation |

## API Endpoints

### Public
```
POST   /api/auth/register           # User registration
GET    /api/auth/[...nextauth]      # NextAuth handlers
```

### Authenticated
```
GET    /api/questions               # List questions (with filters)
POST   /api/questions               # Create question (creator+)
GET    /api/questions/:id           # Get question
PUT    /api/questions/:id           # Update question (creator+)
DELETE /api/questions/:id           # Delete question (creator+)

GET    /api/quizzes                 # List quizzes
POST   /api/quizzes                 # Create quiz (creator+)
GET    /api/quizzes/:id             # Get quiz with questions
DELETE /api/quizzes/:id             # Delete quiz (creator+)
POST   /api/quizzes/:id/submit      # Submit quiz answers

GET    /api/courses                 # List courses
GET    /api/courses/:slug           # Get course with modules

POST   /api/execute                 # Run code (Judge0 proxy)
GET    /api/leaderboard             # Get rankings
GET    /api/users/:id/stats         # Get user statistics

# Daily Challenges
GET    /api/daily-challenge         # Get today's challenge
POST   /api/daily-challenge         # Create challenge (admin)
POST   /api/daily-challenge/participate  # Complete challenge (+50 XP)

# Learning Goals
GET    /api/goals                   # List user's goals
POST   /api/goals                   # Create goal
GET    /api/goals/:id               # Get goal
PATCH  /api/goals/:id               # Update goal (+100 XP on completion)
DELETE /api/goals/:id               # Delete goal

# Community Forum
GET    /api/community/posts         # List posts (paginated, filterable)
POST   /api/community/posts         # Create post
GET    /api/community/posts/:id     # Get post with comments
PATCH  /api/community/posts/:id     # Update post (author/admin)
DELETE /api/community/posts/:id     # Delete post (author/admin)
POST   /api/community/posts/:id/comments  # Add comment
POST   /api/community/posts/:id/upvote    # Upvote post
```

### Admin Only
```
GET    /api/admin/users             # List all users
PATCH  /api/admin/users/:id         # Update user role
POST   /api/daily-challenge         # Create daily challenge
```

## Design System

### Colors (Tailwind)
```javascript
colors: {
  primary: "#7f13ec",
  "primary-hover": "#6b11c7",
  background: "#121212",
  "surface-dark": "#1e1e24",
  "surface": "#252530",
  "surface-light": "#2a2a30",
  "surface-border": "#ffffff10",
  "text-main": "#f7f6f8",
  "text-muted": "#ad92c9",
}
```

### Typography
- Font: Lexend (Google Fonts, weights 300-900)
- Icons: Material Symbols Outlined (variable font with FILL support)
- Font loading: Via `<link>` tags in layout.tsx with preconnect for performance

### Icon Usage
```tsx
// Outline icon
<Icon name="dashboard" />

// Filled icon
<Icon name="star" filled />

// With size
<Icon name="settings" size="lg" />
```

### UI Components
- `Button` - Variants: primary, secondary, outline, ghost, danger
- `Input` - With labels, icons, error states
- `Card` - Variants: default, elevated, bordered
- `Icon` - Material Symbols wrapper with sizes

## Common Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed sample data
npm run db:studio        # Open Prisma Studio

# Required Environment Variables
DATABASE_URL             # PostgreSQL connection string
NEXTAUTH_SECRET          # Random secret for NextAuth
NEXTAUTH_URL             # App URL (http://localhost:3000)
GOOGLE_CLIENT_ID         # Optional: Google OAuth
GOOGLE_CLIENT_SECRET     # Optional: Google OAuth
GITHUB_CLIENT_ID         # Optional: GitHub OAuth
GITHUB_CLIENT_SECRET     # Optional: GitHub OAuth
JUDGE0_API_URL           # Optional: Judge0 CE API URL
JUDGE0_API_KEY           # Optional: Judge0 API key
```

## Test Accounts (after seeding)

```
Admin:  admin@dsatrainer.com / admin123
User:   test@dsatrainer.com / test123
```

## Key Implementation Details

### Quiz Engine Flow
1. Quiz loaded with questions from API
2. `QuizProvider` manages state (answers, time, hints)
3. `QuestionRenderer` dispatches to appropriate component
4. User submits → API grades all answers
5. Results page shows score breakdown

### Code Execution
- Uses Judge0 CE API for code execution
- Supports: JavaScript, Python, Java, C++, TypeScript, Go, Rust
- Demo mode fallback if Judge0 not configured
- Async polling for long-running code

### Role-Based Access
- `requireAuth()` - Any authenticated user
- `requireCreator()` - Creator, admin, or superadmin
- `requireAdmin()` - Admin or superadmin only
- Sidebar shows admin link only for authorized users

## DSA Topics

Core topics for question categorization:
Arrays, Strings, Linked Lists, Stacks, Queues, Trees, Binary Trees, BST, Heaps, Graphs, Hash Tables, Sorting, Searching, Recursion, Dynamic Programming, Greedy, Backtracking, BFS, DFS, Two Pointers, Sliding Window, Divide and Conquer, Bit Manipulation

## XP Reward Guidelines

| Difficulty | XP Range |
|------------|----------|
| Beginner | 5-15 XP |
| Easy | 10-25 XP |
| Medium | 20-50 XP |
| Hard | 40-100 XP |
| Expert | 75-200 XP |

## File Statistics

- **Total Source Files:** 100+
- **React Components:** 40+
- **API Routes:** 28
- **Prisma Models:** 17

## Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Create environment file
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed database (optional)
npm run db:seed

# 6. Start development server
npm run dev
```

## Known Issues Fixed (Phase 5)

- ESLint `@typescript-eslint/no-unused-vars` rule removed (not installed)
- Login page wrapped in Suspense for `useSearchParams()` compatibility
- Quiz hints renamed `useHint` → `revealHint` to avoid React hooks naming conflict
- Course API routes rewritten to use `quizIds` array instead of relations
- Type assertions added for Prisma JSON fields

## Phase 6 UI Redesign (2025-12-16)

### Pages Redesigned
- **Login** - Two-column layout with hero image and testimonial
- **Dashboard** - Stats cards, study activity chart, daily challenge widget, course cards
- **Course Catalog** - Hero section, filter pills, image-based course cards
- **Profile** - Sidebar layout, GitHub-style activity heatmap, badge grid, tabbed content
- **Quiz View** - Two-column layout with timer card and question map navigation
- **Quiz Results** - Circular progress score, performance trend chart, expandable question review

### New Features Added
- **Daily Challenges** - Daily quiz challenges with +50 XP bonus, participant tracking
- **Learning Goals** - Create and track learning objectives with +100 XP on completion
- **Community Forum** - Discussion forum with categories, upvoting, and comments

### New Components
- `ProfileSidebar`, `ActivityHeatmap`, `BadgeGrid`, `ProfileTabs`
- `QuizTimer`, `QuestionMap`
- `DailyChallengeWidget`

### Navigation Updates
- Root URL (`/`) now redirects directly to `/login`
- Sidebar updated with Community and Goals navigation items
