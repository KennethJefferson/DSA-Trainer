export const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice", icon: "list", color: "bg-blue-500" },
  { value: "multi_select", label: "Multi Select", icon: "check_box", color: "bg-indigo-500" },
  { value: "fill_blank", label: "Fill in the Blank", icon: "code", color: "bg-emerald-500" },
  { value: "drag_order", label: "Drag & Drop - Order", icon: "swap_vert", color: "bg-amber-500" },
  { value: "drag_match", label: "Drag & Drop - Match", icon: "link", color: "bg-rose-500" },
  { value: "drag_code_blocks", label: "Code Blocks", icon: "view_agenda", color: "bg-violet-500" },
  { value: "code_writing", label: "Code Writing", icon: "code", color: "bg-cyan-500" },
  { value: "debugging", label: "Debugging", icon: "bug_report", color: "bg-red-500" },
  { value: "true_false", label: "True / False", icon: "toggle_on", color: "bg-teal-500" },
  { value: "parsons", label: "Parsons Problem", icon: "reorder", color: "bg-orange-500" },
] as const;

export const DIFFICULTIES = [
  { value: "beginner", label: "Beginner", color: "bg-green-500" },
  { value: "easy", label: "Easy", color: "bg-lime-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "hard", label: "Hard", color: "bg-orange-500" },
  { value: "expert", label: "Expert", color: "bg-red-500" },
] as const;

export const TOPICS = [
  "Arrays", "Strings", "Linked Lists", "Stacks", "Queues",
  "Trees", "Binary Trees", "BST", "Heaps", "Graphs",
  "Hash Tables", "Sorting", "Searching", "Recursion",
  "Dynamic Programming", "Greedy", "Backtracking", "BFS", "DFS",
  "Two Pointers", "Sliding Window", "Divide and Conquer", "Bit Manipulation"
];

export const LANGUAGES = ["javascript", "python", "java", "cpp", "typescript", "go", "rust"];

export type QuestionType = typeof QUESTION_TYPES[number]["value"];
export type Difficulty = typeof DIFFICULTIES[number]["value"];
