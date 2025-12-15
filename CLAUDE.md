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

**Current State:** Ready for testing

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
│   │   ├── login/
│   │   └── register/
│   ├── (main)/            # Main app (auth-protected)
│   │   ├── dashboard/     # User dashboard
│   │   ├── courses/       # Course catalog & detail
│   │   ├── quizzes/       # Quiz browser
│   │   ├── quiz/[id]/     # Quiz player & results
│   │   ├── leaderboard/   # Rankings
│   │   ├── profile/       # User profile
│   │   └── settings/      # User settings
│   └── api/               # API routes
│       ├── auth/          # NextAuth + registration
│       ├── questions/     # Question CRUD
│       ├── quizzes/       # Quiz CRUD + submission
│       ├── courses/       # Course endpoints
│       ├── execute/       # Code execution proxy
│       ├── leaderboard/   # Ranking data
│       └── admin/         # Admin-only endpoints
├── components/
│   ├── admin/             # Admin panel components
│   │   └── question-builder/  # Question form & validation
│   ├── dashboard/         # Sidebar, Header, StatCard
│   ├── questions/         # 10 question type components
│   ├── quiz/              # Quiz engine components
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
```

### Admin Only
```
GET    /api/admin/users             # List all users
PATCH  /api/admin/users/:id         # Update user role
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
- Font: Lexend (Google Fonts)
- Icons: Material Symbols (rounded, weight 400)

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

- **Total Source Files:** 83
- **React Components:** 29
- **API Routes:** 18
- **Prisma Models:** 12
