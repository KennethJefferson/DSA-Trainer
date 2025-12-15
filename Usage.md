# DSA Trainer - Comprehensive Usage Guide

This guide covers everything you need to know about using DSA Trainer, from taking your first quiz to creating complex programming challenges as an administrator.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Dashboard](#user-dashboard)
3. [Taking Quizzes](#taking-quizzes)
4. [Question Types Explained](#question-types-explained)
5. [Courses & Learning Paths](#courses--learning-paths)
6. [Gamification System](#gamification-system)
7. [Leaderboard](#leaderboard)
8. [User Profile & Settings](#user-profile--settings)
9. [Admin Panel Overview](#admin-panel-overview)
10. [Creating Questions](#creating-questions)
11. [Creating Quizzes](#creating-quizzes)
12. [User Management](#user-management)
13. [Import & Export](#import--export)
14. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Creating an Account

1. Navigate to the login page at `/login`
2. Choose one of the following options:
   - **Email/Password**: Click "Sign Up" and enter your details
   - **Google OAuth**: Click "Continue with Google"
   - **GitHub OAuth**: Click "Continue with GitHub"
3. After registration, you'll be redirected to the dashboard

### First-Time Setup

Upon your first login:
1. Complete your profile in Settings
2. Browse available courses to find your learning path
3. Take a diagnostic quiz to assess your current level
4. Set daily learning goals

---

## User Dashboard

The dashboard (`/dashboard`) is your home base, displaying:

### Stats Overview
- **Total XP**: Your accumulated experience points
- **Current Level**: Based on XP thresholds
- **Current Streak**: Consecutive days of activity
- **Quizzes Completed**: Total number of finished quizzes

### Recent Activity
- Latest quiz attempts with scores
- Recent badge unlocks
- Course progress updates

### Quick Actions
- Continue last quiz
- Start recommended quiz
- View leaderboard position

---

## Taking Quizzes

### Starting a Quiz

1. Navigate to **Quizzes** (`/quizzes`) from the sidebar
2. Browse available quizzes or filter by:
   - Difficulty (Beginner, Easy, Medium, Hard, Expert)
   - Topic (Arrays, Trees, Dynamic Programming, etc.)
   - Duration
3. Click on a quiz to view details
4. Click **Start Quiz** to begin

### During a Quiz

#### Timer
- If the quiz has a time limit, a countdown timer appears in the header
- When time runs out, your current answers are auto-submitted

#### Navigation
- Use **Previous** and **Next** buttons to move between questions
- Question indicators show completion status:
  - Gray: Not attempted
  - Blue: Current question
  - Green: Answered
  - Orange: Flagged for review

#### Hints
- Some questions offer hints (displayed as lightbulb icon)
- Using a hint deducts XP from your potential reward
- Hint penalties are cumulative

#### Code Questions
- The Monaco editor supports syntax highlighting
- Use `Ctrl+Enter` to run code
- Test results show expected vs actual output
- Hidden test cases run on submission

### Submitting

1. Click **Submit Quiz** when finished
2. Review your answers if prompted
3. Confirm submission
4. View detailed results

### Results Screen

After submission, you'll see:
- **Score**: Percentage correct
- **XP Earned**: Points gained (minus hint penalties)
- **Time Taken**: Total duration
- **Question Breakdown**: Correct/incorrect status for each question
- **Explanations**: Detailed explanations for each answer

---

## Question Types Explained

DSA Trainer supports 10 different question types to test various skills:

### 1. Multiple Choice (`multiple_choice`)

Select the single correct answer from 2-6 options.

**Example:**
> What is the time complexity of binary search?
> - O(1)
> - O(log n) ✓
> - O(n)
> - O(n²)

**Tips:**
- Read all options before selecting
- Eliminate obviously wrong answers first
- Watch for "all of the above" or "none of the above"

---

### 2. Multi Select (`multi_select`)

Select ALL correct answers. Partial credit may be awarded.

**Example:**
> Which operations are O(1) in a hash table? (Select all that apply)
> - [x] Insert
> - [x] Lookup
> - [ ] Sort
> - [x] Delete

**Scoring:**
- With partial credit: Points based on correct selections
- Without partial credit: Must select exactly the right options

---

### 3. True/False (`true_false`)

Determine if a statement is true or false.

**Example:**
> Statement: A binary search tree always maintains O(log n) height.
> - True
> - False ✓

**Tips:**
- Watch for absolute words like "always," "never," "all"
- Consider edge cases and exceptions

---

### 4. Fill in the Blank (`fill_blank`)

Complete code snippets by filling in missing parts.

**Example:**
```javascript
// Find the maximum element in an array
function findMax(arr) {
  return Math.{{blank1}}(...arr);
}
```
Answer: `max`

**Features:**
- Multiple blanks possible
- Case sensitivity varies by question
- Multiple accepted answers may exist

---

### 5. Drag & Order (`drag_order`)

Arrange items in the correct sequence.

**Example:**
> Arrange the steps of merge sort:
> 1. Divide array into halves
> 2. Recursively sort each half
> 3. Merge sorted halves

**How to Use:**
- Click and drag items to reorder
- Drop in the target position
- All items must be in correct order for full credit

---

### 6. Drag & Match (`drag_match`)

Match items from two columns.

**Example:**
> Match data structures with their best use case:
> - Stack → Undo functionality
> - Queue → BFS traversal
> - Heap → Priority scheduling

**How to Use:**
- Drag items from the left column
- Drop onto matching items in the right column
- Each left item matches exactly one right item

---

### 7. Code Writing (`code_writing`)

Write complete code solutions tested against test cases.

**Example:**
```
Write a function that reverses a string.

function reverseString(str) {
  // Your code here
}

Test Cases:
- reverseString("hello") → "olleh"
- reverseString("") → ""
```

**Features:**
- Monaco editor with syntax highlighting
- Multiple language support (JavaScript, Python, etc.)
- Run button to test against visible cases
- Submit to run hidden test cases
- Time and memory limits

**Tips:**
- Test edge cases (empty input, single element)
- Consider time complexity requirements
- Read constraints carefully

---

### 8. Debugging (`debugging`)

Find and fix bugs in provided code.

**Example:**
```javascript
// Bug: Infinite loop
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n) + fibonacci(n - 1); // Should be fibonacci(n-1) + fibonacci(n-2)
}
```

**How to Use:**
- Identify the bug location
- Edit the code to fix it
- Run tests to verify your fix

**Common Bug Types:**
- Off-by-one errors
- Wrong operator
- Missing base case
- Incorrect variable

---

### 9. Parsons Problem (`parsons`)

Arrange code lines in correct order WITH proper indentation.

**Example:**
```python
def binary_search(arr, target):    # Line 1, Indent 0
    left, right = 0, len(arr) - 1  # Line 2, Indent 1
    while left <= right:           # Line 3, Indent 1
        mid = (left + right) // 2  # Line 4, Indent 2
        if arr[mid] == target:     # Line 5, Indent 2
            return mid             # Line 6, Indent 3
```

**How to Use:**
- Drag lines to correct positions
- Set indentation level for each line
- Both order AND indentation must be correct

---

### 10. Code Blocks (`drag_code_blocks`)

Arrange code blocks (multi-line snippets) in sequence.

**Example:**
> Arrange to implement a queue using two stacks:

Block A:
```javascript
if (this.stack2.length === 0) {
  while (this.stack1.length > 0) {
    this.stack2.push(this.stack1.pop());
  }
}
```

Block B:
```javascript
return this.stack2.pop();
```

**Difference from Parsons:**
- Blocks contain multiple lines
- No indentation adjustment needed
- Focus on logical flow

---

## Courses & Learning Paths

### Browsing Courses

Navigate to **Courses** (`/courses`) to see:
- Course cards with title, description, difficulty
- Progress indicators for enrolled courses
- Topic tags and estimated duration

### Course Structure

Each course contains:
1. **Modules**: Logical groupings of content
2. **Lessons**: Individual learning units within modules
3. **Quizzes**: Assessments at module or course level

### Enrolling in a Course

1. Click on a course card
2. View course details, prerequisites, and syllabus
3. Click **Enroll** to start
4. Begin with the first module

### Course Progress

- Progress bar shows completion percentage
- Checkmarks indicate completed modules
- Resume button takes you to your last position

---

## Gamification System

### Experience Points (XP)

Earn XP through:
- **Completing quizzes**: Base XP × score percentage
- **Correct answers**: Per-question XP rewards
- **Daily streaks**: Bonus XP for consecutive days
- **Badge unlocks**: One-time XP bonuses
- **First-time completions**: Bonus for new quizzes

XP can be reduced by:
- Using hints (configurable penalty)
- Time penalties (if enabled)

### Levels

Levels are calculated from total XP:

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Beginner |
| 2 | 100 | Novice |
| 3 | 300 | Learner |
| 4 | 600 | Student |
| 5 | 1000 | Practitioner |
| 10 | 5000 | Expert |
| 20 | 20000 | Master |
| 50 | 100000 | Grandmaster |

### Badges

Unlock badges for achievements:

**Activity Badges:**
- First Steps: Complete your first quiz
- Quiz Master: Complete 100 quizzes
- Perfectionist: Score 100% on 10 quizzes

**Streak Badges:**
- On Fire: 7-day streak
- Dedicated: 30-day streak
- Unstoppable: 100-day streak

**Topic Badges:**
- Array Expert: Complete 10 array questions
- Tree Hugger: Master tree problems
- DP Dynamo: Solve 20 dynamic programming problems

### Streaks

- Maintain streaks by completing at least one quiz daily
- Streak freezes available (if enabled)
- Losing a streak resets the counter

---

## Leaderboard

### Global Rankings

View top performers at `/leaderboard`:
- Ranked by total XP
- Filter by time period (daily, weekly, monthly, all-time)
- See your position highlighted

### Category Leaderboards

- By topic (Arrays, Trees, etc.)
- By difficulty level
- By quiz completion count

### Privacy

- Display name can be changed in settings
- Option to appear anonymous on leaderboard

---

## User Profile & Settings

### Profile (`/profile`)

View and edit:
- Display name
- Profile picture
- Bio
- Social links

### Statistics

- Total XP and level
- Quiz history
- Average scores by topic
- Time spent learning
- Badge collection

### Settings (`/settings`)

**Account:**
- Email preferences
- Password change
- Connected accounts (OAuth)

**Preferences:**
- Theme (dark/light)
- Default programming language
- Keyboard shortcuts
- Notification settings

**Privacy:**
- Leaderboard visibility
- Profile visibility
- Activity sharing

---

## Admin Panel Overview

Access the admin panel at `/admin` (requires creator, admin, or superadmin role).

### Dashboard

- **System Stats**: Total questions, quizzes, users, attempts
- **Recent Activity**: Latest submissions and creations
- **Quick Actions**: Create question, create quiz, view reports

### Navigation

- **Questions**: Manage question bank
- **Quizzes**: Create and organize quizzes
- **Users**: User management (admin only)
- **Analytics**: Usage statistics (coming soon)

---

## Creating Questions

### Accessing Question Builder

1. Go to Admin Panel → Questions
2. Click **Create Question** or edit existing

### Common Fields (All Types)

| Field | Description | Required |
|-------|-------------|----------|
| Title | Display name (max 200 chars) | Yes |
| Description | Question context | No |
| Type | Question format | Yes |
| Difficulty | beginner/easy/medium/hard/expert | Yes |
| Topics | Array of DSA topics | Yes (at least 1) |
| XP Reward | Points for correct answer (1-1000) | No (default: 10) |
| Time Limit | Seconds allowed (null = unlimited) | No |
| Explanation | Post-answer explanation (markdown) | No |
| Is Public | Visible to users | Yes |

### Adding Hints

1. Click **Add Hint**
2. Enter hint text
3. Set XP penalty (deducted if used)
4. Order hints by difficulty (easier hints first)

### Type-Specific Configuration

#### Multiple Choice

```json
{
  "question": "What is the space complexity of merge sort?",
  "options": [
    { "id": "a", "text": "O(1)", "isCorrect": false },
    { "id": "b", "text": "O(log n)", "isCorrect": false },
    { "id": "c", "text": "O(n)", "isCorrect": true },
    { "id": "d", "text": "O(n²)", "isCorrect": false }
  ],
  "shuffleOptions": true
}
```

#### Multi Select

```json
{
  "question": "Which are stable sorting algorithms?",
  "options": [
    { "id": "a", "text": "Merge Sort", "isCorrect": true },
    { "id": "b", "text": "Quick Sort", "isCorrect": false },
    { "id": "c", "text": "Bubble Sort", "isCorrect": true },
    { "id": "d", "text": "Heap Sort", "isCorrect": false }
  ],
  "shuffleOptions": true,
  "partialCredit": true
}
```

#### Fill in the Blank

Use `{{blank_id}}` syntax for blanks:

```json
{
  "template": "const result = arr.{{method}}((a, b) => a {{operator}} b);",
  "blanks": [
    { "id": "method", "acceptedAnswers": ["reduce"], "caseSensitive": true },
    { "id": "operator", "acceptedAnswers": ["+", "plus"], "caseSensitive": false }
  ],
  "language": "javascript"
}
```

#### Drag & Order

```json
{
  "instruction": "Order the steps of quicksort:",
  "items": [
    { "id": "1", "text": "Choose pivot element", "correctPosition": 0 },
    { "id": "2", "text": "Partition array around pivot", "correctPosition": 1 },
    { "id": "3", "text": "Recursively sort left partition", "correctPosition": 2 },
    { "id": "4", "text": "Recursively sort right partition", "correctPosition": 3 }
  ]
}
```

#### Drag & Match

```json
{
  "instruction": "Match time complexities:",
  "leftItems": [
    { "id": "l1", "text": "Binary Search" },
    { "id": "l2", "text": "Linear Search" },
    { "id": "l3", "text": "Hash Table Lookup" }
  ],
  "rightItems": [
    { "id": "r1", "text": "O(log n)", "matchesLeft": "l1" },
    { "id": "r2", "text": "O(n)", "matchesLeft": "l2" },
    { "id": "r3", "text": "O(1)", "matchesLeft": "l3" }
  ]
}
```

#### Code Writing

```json
{
  "prompt": "Implement a function to find the longest palindromic substring.",
  "starterCode": "function longestPalindrome(s) {\n  // Your code here\n}",
  "language": "javascript",
  "testCases": [
    { "id": "t1", "input": "\"babad\"", "expectedOutput": "\"bab\"", "isHidden": false },
    { "id": "t2", "input": "\"cbbd\"", "expectedOutput": "\"bb\"", "isHidden": false },
    { "id": "t3", "input": "\"a\"", "expectedOutput": "\"a\"", "isHidden": true }
  ],
  "constraints": ["1 <= s.length <= 1000", "s consists of lowercase English letters"]
}
```

#### Debugging

```json
{
  "prompt": "Fix the binary search implementation.",
  "buggyCode": "function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length;\n  while (left < right) {\n    const mid = left + right / 2;\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid;\n    else right = mid;\n  }\n  return -1;\n}",
  "language": "javascript",
  "bugs": [
    { "id": "b1", "description": "right should be arr.length - 1", "line": 3 },
    { "id": "b2", "description": "mid calculation missing Math.floor", "line": 5 },
    { "id": "b3", "description": "left = mid should be left = mid + 1", "line": 7 }
  ],
  "testCases": [
    { "id": "t1", "input": "[1,2,3,4,5], 3", "expectedOutput": "2", "isHidden": false }
  ]
}
```

#### Parsons Problem

```json
{
  "instruction": "Arrange to implement DFS:",
  "language": "javascript",
  "codeLines": [
    { "id": "1", "code": "function dfs(node, visited = new Set()) {", "correctPosition": 0, "correctIndent": 0 },
    { "id": "2", "code": "if (!node || visited.has(node)) return;", "correctPosition": 1, "correctIndent": 1 },
    { "id": "3", "code": "visited.add(node);", "correctPosition": 2, "correctIndent": 1 },
    { "id": "4", "code": "console.log(node.value);", "correctPosition": 3, "correctIndent": 1 },
    { "id": "5", "code": "for (const child of node.children) {", "correctPosition": 4, "correctIndent": 1 },
    { "id": "6", "code": "dfs(child, visited);", "correctPosition": 5, "correctIndent": 2 },
    { "id": "7", "code": "}", "correctPosition": 6, "correctIndent": 1 },
    { "id": "8", "code": "}", "correctPosition": 7, "correctIndent": 0 }
  ]
}
```

### Validation

The question builder validates:
- Required fields are filled
- Options have at least one correct answer (MC/MS)
- Blank IDs match template placeholders
- Test cases have expected outputs
- Code syntax is valid

### Saving

- **Save Draft**: Save without publishing
- **Publish**: Make available to users
- **Preview**: Test the question yourself

---

## Creating Quizzes

### Quiz Builder

Access at Admin Panel → Quizzes → Create Quiz

### Basic Information

| Field | Description |
|-------|-------------|
| Title | Quiz display name |
| Description | Overview and instructions |
| Difficulty | Overall difficulty rating |
| Topics | Topics covered |
| Time Limit | Total time in seconds (optional) |
| Passing Score | Minimum percentage to pass |
| Is Public | Visibility to users |

### Adding Questions

1. **Search Questions**: Filter by type, difficulty, topic
2. **Select Questions**: Click to add to quiz
3. **Reorder**: Drag questions to set order
4. **Remove**: Click X to remove from quiz

### Question Settings

Per-question overrides:
- Custom XP reward
- Custom time limit
- Required vs optional

### Quiz Options

- **Shuffle Questions**: Randomize order per attempt
- **Shuffle Options**: Randomize answer options
- **Show Explanations**: After submission or per question
- **Allow Review**: Let users review answers
- **Max Attempts**: Limit retakes (0 = unlimited)

### Publishing

1. Preview quiz as a user would see it
2. Verify all questions load correctly
3. Click **Publish** to make available

---

## User Management

### User List

Access at Admin Panel → Users (admin/superadmin only)

View all users with:
- Name and email
- Role
- XP and level
- Registration date
- Quiz attempts count

### Filtering & Search

- Search by name or email
- Filter by role
- Sort by various fields

### Role Assignment

1. Find user in list
2. Click role dropdown
3. Select new role:
   - **user**: Standard access
   - **creator**: Can create content
   - **admin**: Full content + user management
   - **superadmin**: Full system access

### Role Hierarchy

A user can only assign roles lower than their own:
- superadmin → can assign any role
- admin → can assign user, creator, admin
- creator → cannot change roles
- user → cannot change roles

---

## Import & Export

### Exporting Questions

1. Go to Admin Panel → Questions
2. Select questions (or select all)
3. Click **Export**
4. Choose format (JSON or CSV)
5. Download file

### Export Format (JSON)

```json
{
  "version": "1.0",
  "exportDate": "2024-01-15T10:30:00Z",
  "questions": [
    {
      "type": "multiple_choice",
      "title": "Big O Notation",
      "difficulty": "easy",
      "topics": ["Time Complexity"],
      "xpReward": 15,
      "content": { ... }
    }
  ]
}
```

### Importing Questions

1. Go to Admin Panel → Questions
2. Click **Import**
3. Select JSON file
4. Review parsed questions
5. Confirm import

### Validation on Import

- Duplicate detection (by title)
- Schema validation
- Required field checks
- Type-specific validation

### Bulk Operations

- **Bulk Delete**: Select multiple → Delete
- **Bulk Update**: Change topics/difficulty for multiple questions
- **Bulk Publish/Unpublish**: Toggle visibility

---

## Tips & Best Practices

### For Learners

1. **Start with Fundamentals**
   - Begin with beginner-level courses
   - Master arrays and strings before trees
   - Build foundation before advanced topics

2. **Use Hints Wisely**
   - Try without hints first
   - Hints are learning tools, not cheats
   - Review explanations after each question

3. **Maintain Streaks**
   - Even one quiz a day helps
   - Consistency beats intensity
   - Use streak freezes sparingly

4. **Review Mistakes**
   - Check explanations for wrong answers
   - Retry failed quizzes after studying
   - Track weak topics in your profile

5. **Code Writing Tips**
   - Read problem constraints carefully
   - Test edge cases before submitting
   - Start with brute force, then optimize

### For Content Creators

1. **Question Quality**
   - Clear, unambiguous wording
   - One correct interpretation
   - Realistic difficulty assessment

2. **Answer Options**
   - Plausible distractors (wrong answers)
   - Avoid "all of the above"
   - Consistent option length

3. **Code Questions**
   - Include edge case tests
   - Clear function signatures
   - Reasonable time limits

4. **Explanations**
   - Explain WHY, not just WHAT
   - Include time/space complexity
   - Link to related concepts

5. **Difficulty Balance**
   - Mix difficulties in quizzes
   - Progressive difficulty in courses
   - Regular difficulty calibration

### For Administrators

1. **User Management**
   - Regular role audits
   - Monitor creator content
   - Handle reports promptly

2. **Content Curation**
   - Review new questions
   - Remove duplicates
   - Maintain topic organization

3. **System Health**
   - Monitor quiz completion rates
   - Track average scores
   - Identify problematic questions

---

## Keyboard Shortcuts

### Global
| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open search |
| `Ctrl + /` | Show shortcuts |
| `Esc` | Close modal |

### Quiz Taking
| Shortcut | Action |
|----------|--------|
| `→` or `N` | Next question |
| `←` or `P` | Previous question |
| `1-9` | Select option (MC) |
| `Space` | Toggle option (MS) |
| `Enter` | Submit answer |
| `H` | Show hint |

### Code Editor
| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Run code |
| `Ctrl + S` | Save draft |
| `Ctrl + /` | Toggle comment |
| `Ctrl + D` | Duplicate line |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |

---

## Troubleshooting

### Quiz Won't Load
- Check internet connection
- Clear browser cache
- Try a different browser
- Contact support if persists

### Code Execution Timeout
- Check for infinite loops
- Optimize algorithm efficiency
- Review time complexity requirements

### Lost Progress
- Progress auto-saves every 30 seconds
- Check quiz history for partial attempts
- Contact admin for recovery

### Login Issues
- Verify email/password
- Check OAuth provider status
- Reset password if needed
- Clear cookies and retry

---

## Support

For additional help:
- **Documentation**: Check this guide and README.md
- **FAQ**: Common questions answered
- **Bug Reports**: Submit via GitHub issues
- **Feature Requests**: Community voting system

---

*Last updated: Phase 4 - Admin & Content Management Complete*
