# DSA Gamification - Question Schema Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base Question Schema](#base-question-schema)
3. [Question Types](#question-types)
4. [Validation Rules](#validation-rules)
5. [Import/Export Formats](#importexport-formats)
6. [Example Questions](#example-questions)
7. [Best Practices](#best-practices)

---

## Overview

This document defines the complete question schema for the DSA Gamification platform. Questions support multiple types including multiple choice, fill-in-the-blank, drag-and-drop, code writing, and more.

### Supported Question Types

| Type | Code | Description |
|------|------|-------------|
| Multiple Choice | `multiple_choice` | Single correct answer from options |
| Multi Select | `multi_select` | Multiple correct answers possible |
| Fill in the Blank | `fill_blank` | Complete code/text with missing parts |
| Drag & Drop - Order | `drag_order` | Arrange items in correct sequence |
| Drag & Drop - Match | `drag_match` | Match pairs of items |
| Code Blocks | `drag_code_blocks` | Arrange code blocks to form solution |
| Code Writing | `code_writing` | Write complete code solution |
| Debugging | `debugging` | Find and fix bugs in code |
| True/False | `true_false` | Binary true/false questions |
| Parsons Problem | `parsons` | Reorder code lines with indentation |

---

## Base Question Schema

All questions share these base properties:

```typescript
interface BaseQuestion {
  // Required fields
  id: string;                    // Unique identifier (auto-generated if not provided)
  type: QuestionType;            // One of the supported types
  title: string;                 // Display title (max 200 chars)
  difficulty: Difficulty;        // beginner | easy | medium | hard | expert
  topic: string[];               // At least one topic required
  
  // Optional fields
  description?: string;          // Detailed description (markdown supported)
  tags?: string[];               // Additional categorization tags
  xpReward?: number;             // XP awarded (default: 10, range: 1-1000)
  timeLimit?: number;            // Time limit in seconds (null = no limit)
  hints?: Hint[];                // Progressive hints
  explanation?: string;          // Post-answer explanation (markdown)
  createdBy?: string;            // Creator identifier
  createdAt?: Date;              // Creation timestamp
  isPublic?: boolean;            // Visibility flag (default: false)
  metadata?: Record<string, any>; // Custom metadata
  
  // Type-specific content
  content: TypeSpecificContent;
}

interface Hint {
  id: string;
  text: string;
  xpPenalty: number;             // XP deducted when hint is used
  order: number;                 // Display order (0-indexed)
}

type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
```

### Recommended Topics

```
Arrays, Strings, Linked Lists, Stacks, Queues, Trees, Binary Trees, 
BST, Heaps, Graphs, Hash Tables, Sorting, Searching, Recursion, 
Dynamic Programming, Greedy, Backtracking, BFS, DFS, Two Pointers,
Sliding Window, Divide and Conquer, Bit Manipulation
```

---

## Question Types

### 1. Multiple Choice (`multiple_choice`)

Single correct answer from a list of options.

```typescript
interface MultipleChoiceContent {
  question: string;              // The question text
  options: {
    id: string;
    text: string;                // Option text (can include code)
    isCorrect: boolean;          // Exactly ONE should be true
  }[];
  shuffleOptions: boolean;       // Randomize option order
}
```

**Example:**
```json
{
  "type": "multiple_choice",
  "title": "Binary Search Time Complexity",
  "difficulty": "easy",
  "topic": ["Searching", "Binary Trees"],
  "xpReward": 15,
  "content": {
    "question": "What is the time complexity of binary search on a sorted array?",
    "options": [
      { "id": "a", "text": "O(1)", "isCorrect": false },
      { "id": "b", "text": "O(log n)", "isCorrect": true },
      { "id": "c", "text": "O(n)", "isCorrect": false },
      { "id": "d", "text": "O(n²)", "isCorrect": false }
    ],
    "shuffleOptions": true
  },
  "explanation": "Binary search divides the search space in half with each iteration, resulting in O(log n) time complexity."
}
```

---

### 2. Multi Select (`multi_select`)

Multiple correct answers possible.

```typescript
interface MultiSelectContent {
  question: string;
  instruction?: string;          // e.g., "Select all that apply"
  options: {
    id: string;
    text: string;
    isCorrect: boolean;          // Multiple can be true
  }[];
  shuffleOptions: boolean;
  partialCredit: boolean;        // Award points for partial correctness
}
```

**Example:**
```json
{
  "type": "multi_select",
  "title": "Valid Stack Operations",
  "difficulty": "beginner",
  "topic": ["Stacks"],
  "content": {
    "question": "Which of the following are valid stack operations?",
    "instruction": "Select all that apply",
    "options": [
      { "id": "a", "text": "push()", "isCorrect": true },
      { "id": "b", "text": "pop()", "isCorrect": true },
      { "id": "c", "text": "peek()", "isCorrect": true },
      { "id": "d", "text": "insert(index)", "isCorrect": false },
      { "id": "e", "text": "isEmpty()", "isCorrect": true }
    ],
    "shuffleOptions": true,
    "partialCredit": true
  }
}
```

---

### 3. Fill in the Blank (`fill_blank`)

Complete code or text with missing parts.

```typescript
interface FillBlankContent {
  template: string;              // Text with {{blank_id}} placeholders
  blanks: {
    id: string;                  // Must match placeholder in template
    acceptedAnswers: string[];   // All valid answers
    caseSensitive: boolean;
    placeholder?: string;        // Hint shown in input
  }[];
  language?: string;             // For syntax highlighting
}
```

**Template Syntax:** Use `{{blank_id}}` for blanks.

**Example:**
```json
{
  "type": "fill_blank",
  "title": "Complete the Binary Search",
  "difficulty": "medium",
  "topic": ["Searching", "Arrays"],
  "content": {
    "template": "function binarySearch(arr, target) {\n  let left = {{start}};\n  let right = arr.{{prop}} - 1;\n  \n  while (left {{operator}} right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = {{update}};\n    else right = mid - 1;\n  }\n  return -1;\n}",
    "blanks": [
      { "id": "start", "acceptedAnswers": ["0"], "caseSensitive": false, "placeholder": "initial value" },
      { "id": "prop", "acceptedAnswers": ["length"], "caseSensitive": true, "placeholder": "property" },
      { "id": "operator", "acceptedAnswers": ["<=", "< ="], "caseSensitive": false, "placeholder": "comparison" },
      { "id": "update", "acceptedAnswers": ["mid + 1", "mid+1"], "caseSensitive": false, "placeholder": "new left" }
    ],
    "language": "javascript"
  }
}
```

---

### 4. Drag & Drop - Order (`drag_order`)

Arrange items in the correct sequence.

```typescript
interface DragOrderContent {
  instruction: string;
  items: {
    id: string;
    text: string;
    correctPosition: number;     // 0-indexed position
  }[];
  includeDistractors: boolean;   // Add wrong options
  distractors?: {
    id: string;
    text: string;
  }[];
}
```

**Example:**
```json
{
  "type": "drag_order",
  "title": "QuickSort Steps",
  "difficulty": "medium",
  "topic": ["Sorting"],
  "content": {
    "instruction": "Arrange the QuickSort algorithm steps in the correct order",
    "items": [
      { "id": "s1", "text": "Choose a pivot element", "correctPosition": 0 },
      { "id": "s2", "text": "Partition array around pivot", "correctPosition": 1 },
      { "id": "s3", "text": "Recursively sort left partition", "correctPosition": 2 },
      { "id": "s4", "text": "Recursively sort right partition", "correctPosition": 3 }
    ],
    "includeDistractors": true,
    "distractors": [
      { "id": "d1", "text": "Merge the two sorted halves" },
      { "id": "d2", "text": "Create a new array for output" }
    ]
  }
}
```

---

### 5. Drag & Drop - Match (`drag_match`)

Match pairs of related items.

```typescript
interface DragMatchContent {
  instruction: string;
  leftItems: {
    id: string;
    text: string;
    matchId: string;             // ID of correct right item
  }[];
  rightItems: {
    id: string;
    text: string;
  }[];
  // Extra rightItems without matches act as distractors
}
```

**Example:**
```json
{
  "type": "drag_match",
  "title": "Data Structure Use Cases",
  "difficulty": "easy",
  "topic": ["Arrays", "Stacks", "Queues", "Hash Tables"],
  "content": {
    "instruction": "Match each data structure with its best use case",
    "leftItems": [
      { "id": "l1", "text": "Stack", "matchId": "r1" },
      { "id": "l2", "text": "Queue", "matchId": "r2" },
      { "id": "l3", "text": "Hash Table", "matchId": "r3" },
      { "id": "l4", "text": "Array", "matchId": "r4" }
    ],
    "rightItems": [
      { "id": "r1", "text": "Undo/Redo functionality" },
      { "id": "r2", "text": "Task scheduling (FIFO)" },
      { "id": "r3", "text": "Fast key-value lookups" },
      { "id": "r4", "text": "Storing fixed-size sequential data" },
      { "id": "r5", "text": "Hierarchical data representation" }
    ]
  }
}
```

---

### 6. Code Blocks (`drag_code_blocks`)

Arrange code blocks to form a correct solution.

```typescript
interface DragCodeBlocksContent {
  instruction: string;
  language: string;
  blocks: {
    id: string;
    code: string;
    correctPosition: number;
    indentLevel: number;         // For proper formatting (0 = no indent)
  }[];
  distractorBlocks?: {
    id: string;
    code: string;
  }[];
}
```

**Example:**
```json
{
  "type": "drag_code_blocks",
  "title": "Build a For Loop",
  "difficulty": "beginner",
  "topic": ["Arrays", "Loops"],
  "content": {
    "instruction": "Arrange the code blocks to print all array elements",
    "language": "javascript",
    "blocks": [
      { "id": "b1", "code": "const arr = [1, 2, 3, 4, 5];", "correctPosition": 0, "indentLevel": 0 },
      { "id": "b2", "code": "for (let i = 0; i < arr.length; i++) {", "correctPosition": 1, "indentLevel": 0 },
      { "id": "b3", "code": "console.log(arr[i]);", "correctPosition": 2, "indentLevel": 1 },
      { "id": "b4", "code": "}", "correctPosition": 3, "indentLevel": 0 }
    ],
    "distractorBlocks": [
      { "id": "d1", "code": "for (let i = 1; i <= arr.length; i++) {" },
      { "id": "d2", "code": "console.log(i);" }
    ]
  }
}
```

---

### 7. Code Writing (`code_writing`)

Write complete code solutions with test cases.

```typescript
interface CodeWritingContent {
  prompt: string;                // Problem description
  starterCode: string;           // Initial code template
  language: string;
  testCases: {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;           // Hidden tests prevent hardcoding
    explanation?: string;
  }[];
  constraints?: string[];        // Time/space constraints
  solutionCode?: string;         // Reference solution
  allowedLanguages?: string[];   // If multiple languages supported
}
```

**Example:**
```json
{
  "type": "code_writing",
  "title": "Two Sum",
  "difficulty": "easy",
  "topic": ["Arrays", "Hash Tables"],
  "xpReward": 50,
  "content": {
    "prompt": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.",
    "starterCode": "function twoSum(nums, target) {\n  // Your code here\n}",
    "language": "javascript",
    "testCases": [
      { "id": "t1", "input": "[2,7,11,15], 9", "expectedOutput": "[0,1]", "isHidden": false, "explanation": "nums[0] + nums[1] = 2 + 7 = 9" },
      { "id": "t2", "input": "[3,2,4], 6", "expectedOutput": "[1,2]", "isHidden": false },
      { "id": "t3", "input": "[3,3], 6", "expectedOutput": "[0,1]", "isHidden": true }
    ],
    "constraints": [
      "2 <= nums.length <= 10^4",
      "Only one valid answer exists",
      "Expected: O(n) time complexity"
    ],
    "solutionCode": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}"
  }
}
```

---

### 8. Debugging (`debugging`)

Find and fix bugs in code.

```typescript
interface DebuggingContent {
  prompt: string;
  buggyCode: string;
  language: string;
  bugs: {
    lineNumber: number;
    bugDescription: string;
    correctCode: string;
  }[];
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
}
```

**Example:**
```json
{
  "type": "debugging",
  "title": "Fix the Fibonacci Function",
  "difficulty": "medium",
  "topic": ["Recursion", "Dynamic Programming"],
  "content": {
    "prompt": "This Fibonacci function has bugs. Find and fix them to make it work correctly.",
    "buggyCode": "function fibonacci(n) {\n  if (n <= 0) return 1;\n  if (n === 1) return 1;\n  return fibonacci(n) + fibonacci(n - 1);\n}",
    "language": "javascript",
    "bugs": [
      { "lineNumber": 2, "bugDescription": "Base case should return 0 for n <= 0, or handle n === 0 separately", "correctCode": "if (n <= 0) return 0;" },
      { "lineNumber": 4, "bugDescription": "Recursive call uses n instead of n-1 and n-2", "correctCode": "return fibonacci(n - 1) + fibonacci(n - 2);" }
    ],
    "testCases": [
      { "input": "0", "expectedOutput": "0" },
      { "input": "1", "expectedOutput": "1" },
      { "input": "6", "expectedOutput": "8" },
      { "input": "10", "expectedOutput": "55" }
    ]
  }
}
```

---

### 9. True/False (`true_false`)

Simple binary true/false questions.

```typescript
interface TrueFalseContent {
  statement: string;
  isTrue: boolean;
}
```

**Example:**
```json
{
  "type": "true_false",
  "title": "Queue Data Structure",
  "difficulty": "beginner",
  "topic": ["Queues"],
  "xpReward": 5,
  "content": {
    "statement": "A Queue follows the LIFO (Last In, First Out) principle.",
    "isTrue": false
  },
  "explanation": "A Queue follows FIFO (First In, First Out). LIFO is the principle used by Stacks."
}
```

---

### 10. Parsons Problem (`parsons`)

Reorder scrambled code lines with correct indentation.

```typescript
interface ParsonsContent {
  instruction: string;
  language: string;
  codeLines: {
    id: string;
    code: string;
    correctPosition: number;
    correctIndent: number;       // Indentation level (0, 1, 2, etc.)
  }[];
  // No distractors - focuses on ordering and indentation
}
```

**Example:**
```json
{
  "type": "parsons",
  "title": "Build a Recursive Factorial",
  "difficulty": "easy",
  "topic": ["Recursion"],
  "content": {
    "instruction": "Arrange the code lines to create a working factorial function",
    "language": "python",
    "codeLines": [
      { "id": "l1", "code": "def factorial(n):", "correctPosition": 0, "correctIndent": 0 },
      { "id": "l2", "code": "if n <= 1:", "correctPosition": 1, "correctIndent": 1 },
      { "id": "l3", "code": "return 1", "correctPosition": 2, "correctIndent": 2 },
      { "id": "l4", "code": "return n * factorial(n - 1)", "correctPosition": 3, "correctIndent": 1 }
    ]
  }
}
```

---

## Validation Rules

### Required Fields
- `type` - Must be a valid question type
- `title` - Non-empty, max 200 characters
- `difficulty` - Must be: beginner, easy, medium, hard, or expert
- `topic` - At least one topic required
- `content` - Type-specific content (see above)

### Type-Specific Validation

| Type | Requirements |
|------|--------------|
| `multiple_choice` | At least 2 options, exactly 1 correct |
| `multi_select` | At least 2 options, at least 1 correct |
| `fill_blank` | Template with blanks, each blank defined with answers |
| `drag_order` | At least 2 items |
| `drag_match` | At least 1 left and 1 right item |
| `code_writing` | At least 1 test case, language specified |
| `debugging` | Buggy code provided, at least 1 test case |
| `true_false` | Statement and isTrue value |
| `parsons` | At least 2 code lines |

### Warnings (Non-blocking)
- Missing description
- Missing explanation
- No hints provided
- Very low or very high XP reward

---

## Import/Export Formats

### JSON Format

Single question:
```json
{
  "type": "multiple_choice",
  "title": "...",
  ...
}
```

Multiple questions:
```json
[
  { "type": "multiple_choice", "title": "Q1", ... },
  { "type": "fill_blank", "title": "Q2", ... }
]
```

### CSV Format (Simple Questions Only)

For bulk import of simple question types:

```csv
type,title,difficulty,topics,question,option_a,option_b,option_c,option_d,correct,explanation
multiple_choice,Array Access Time,easy,"Arrays",What is array access time complexity?,O(1),O(n),O(log n),O(n²),a,Arrays provide constant-time access by index.
```

---

## Best Practices

### Writing Good Questions

1. **Clear titles** - Make titles descriptive and searchable
2. **Proper difficulty** - Test questions before assigning difficulty
3. **Good explanations** - Help learners understand WHY, not just WHAT
4. **Progressive hints** - Start vague, get more specific
5. **Relevant distractors** - Wrong answers should be plausible

### XP Reward Guidelines

| Difficulty | Suggested XP Range |
|------------|-------------------|
| Beginner | 5-15 |
| Easy | 10-25 |
| Medium | 20-50 |
| Hard | 40-100 |
| Expert | 75-200 |

### Topic Organization

Create logical learning paths:
```
Fundamentals → Arrays → Strings → Linked Lists
               ↓
            Stacks → Queues → Trees → Graphs
               ↓
            Recursion → Dynamic Programming
```

---

## Database Schema (PostgreSQL)

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) NOT NULL,
  topic TEXT[] NOT NULL,
  tags TEXT[] DEFAULT '{}',
  xp_reward INTEGER DEFAULT 10 CHECK (xp_reward >= 1 AND xp_reward <= 1000),
  time_limit INTEGER CHECK (time_limit IS NULL OR time_limit > 0),
  hints JSONB DEFAULT '[]',
  explanation TEXT,
  content JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  
  CONSTRAINT valid_type CHECK (type IN (
    'multiple_choice', 'multi_select', 'fill_blank', 
    'drag_order', 'drag_match', 'drag_code_blocks',
    'code_writing', 'debugging', 'true_false', 'parsons'
  )),
  CONSTRAINT valid_difficulty CHECK (difficulty IN (
    'beginner', 'easy', 'medium', 'hard', 'expert'
  ))
);

-- Indexes
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_topic ON questions USING GIN(topic);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_questions_public ON questions(is_public) WHERE is_public = true;

-- Full-text search
CREATE INDEX idx_questions_search ON questions 
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

---

## API Endpoints (Suggested)

```
GET    /api/questions              - List questions (with filters)
GET    /api/questions/:id          - Get single question
POST   /api/questions              - Create question
PUT    /api/questions/:id          - Update question
DELETE /api/questions/:id          - Delete question
POST   /api/questions/import       - Bulk import
GET    /api/questions/export       - Bulk export
POST   /api/questions/:id/validate - Validate question
```

---

*Last updated: 2024*
