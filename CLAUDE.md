# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DSA Trainer is a gamified learning platform for Data Structures & Algorithms education. The project is currently in the **design/prototype phase** with UI mockups and schema definitions.

## Current State

The codebase contains:
- **UI Mockups** (`_screenshots/`): Static HTML prototypes using Tailwind CSS for Homepage Dashboard, Course Catalog, Quiz View, Quiz Results, User Profile, and Login pages
- **Question Schema** (`__docs/QUESTION_SCHEMA.md`): Complete TypeScript-style schema documentation for 10 question types
- **Question Builder** (`__docs/question-builder.jsx`): React component for creating/editing quiz questions with live validation

## Question System Architecture

### Supported Question Types
| Type | Code | Use Case |
|------|------|----------|
| Multiple Choice | `multiple_choice` | Single correct answer |
| Multi Select | `multi_select` | Multiple correct answers |
| Fill in the Blank | `fill_blank` | Code completion with `{{blank_id}}` placeholders |
| Drag & Drop Order | `drag_order` | Sequence arrangement |
| Drag & Drop Match | `drag_match` | Pair matching |
| Code Blocks | `drag_code_blocks` | Code line arrangement |
| Code Writing | `code_writing` | Full code solutions with test cases |
| Debugging | `debugging` | Bug identification and fixes |
| True/False | `true_false` | Binary questions |
| Parsons Problem | `parsons` | Code reordering with indentation |

### Question Schema Structure
```typescript
interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;                    // max 200 chars
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  topic: string[];                  // at least one required
  xpReward?: number;                // 1-1000, default 10
  timeLimit?: number;               // seconds
  hints?: { id, text, xpPenalty, order }[];
  explanation?: string;             // markdown supported
  content: TypeSpecificContent;
}
```

### XP Reward Guidelines
- Beginner: 5-15 XP
- Easy: 10-25 XP
- Medium: 20-50 XP
- Hard: 40-100 XP
- Expert: 75-200 XP

## Design System

The UI prototypes use a consistent design system:

### Tailwind Configuration
```javascript
colors: {
  "primary": "#7f13ec",
  "primary-hover": "#6b11c7",
  "background-dark": "#121212",
  "surface-dark": "#1e1e24",
  "surface-light": "#2a2a30",
  "text-main": "#f7f6f8",
  "text-muted": "#ad92c9",
}
fontFamily: { "display": ["Lexend", "sans-serif"] }
```

### External Dependencies (from prototypes)
- Tailwind CSS (CDN with forms, container-queries plugins)
- Google Material Symbols icons
- Lexend font family

## Database Schema (Planned)

PostgreSQL schema for questions with GIN indexes on `topic` and `tags` arrays. See `__docs/QUESTION_SCHEMA.md` for full schema including constraints and indexes.

## API Endpoints (Planned)

```
GET/POST   /api/questions           - List/Create questions
GET/PUT/DELETE /api/questions/:id   - Single question CRUD
POST       /api/questions/import    - Bulk import
GET        /api/questions/export    - Bulk export
POST       /api/questions/:id/validate
```

## DSA Topics

Core topics for question categorization:
Arrays, Strings, Linked Lists, Stacks, Queues, Trees, Binary Trees, BST, Heaps, Graphs, Hash Tables, Sorting, Searching, Recursion, Dynamic Programming, Greedy, Backtracking, BFS, DFS, Two Pointers, Sliding Window, Divide and Conquer, Bit Manipulation
