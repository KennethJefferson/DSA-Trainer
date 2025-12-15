import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@dsatrainer.com" },
    update: {},
    create: {
      email: "admin@dsatrainer.com",
      name: "Admin User",
      password: adminPassword,
      role: "admin",
      xp: 5000,
      level: 10,
      streak: 30,
    },
  });
  console.log("✓ Created admin user:", admin.email);

  // Create test user
  const testPassword = await bcrypt.hash("test123", 10);
  const testUser = await prisma.user.upsert({
    where: { email: "test@dsatrainer.com" },
    update: {},
    create: {
      email: "test@dsatrainer.com",
      name: "Test User",
      password: testPassword,
      role: "user",
      xp: 150,
      level: 2,
      streak: 3,
    },
  });
  console.log("✓ Created test user:", testUser.email);

  // Create badges
  const badges = [
    {
      name: "First Steps",
      description: "Complete your first quiz",
      icon: "celebration",
      category: "achievement",
      criteria: { type: "quizzes_completed", value: 1 },
      xpBonus: 50,
    },
    {
      name: "Quick Learner",
      description: "Earn 100 XP",
      icon: "school",
      category: "xp",
      criteria: { type: "xp", value: 100 },
      xpBonus: 25,
    },
    {
      name: "Streak Master",
      description: "Maintain a 7-day streak",
      icon: "local_fire_department",
      category: "streak",
      criteria: { type: "streak", value: 7 },
      xpBonus: 100,
    },
    {
      name: "Array Expert",
      description: "Complete 10 array questions",
      icon: "data_array",
      category: "topic",
      criteria: { type: "topic_questions", topic: "Arrays", value: 10 },
      xpBonus: 75,
    },
    {
      name: "Algorithm Ace",
      description: "Complete 20 algorithm questions",
      icon: "code",
      category: "topic",
      criteria: { type: "topic_questions", topic: "Algorithms", value: 20 },
      xpBonus: 150,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    });
  }
  console.log(`✓ Created ${badges.length} badges`);

  // Create sample questions
  const questions = [
    // Multiple Choice
    {
      type: "multiple_choice",
      title: "Big O Notation - Binary Search",
      description: "Test your understanding of time complexity for binary search.",
      difficulty: "easy",
      topics: ["Searching", "Binary Trees"],
      xpReward: 15,
      hints: [
        { id: "h1", text: "Binary search divides the search space in half each time", xpPenalty: 5, order: 0 },
      ],
      explanation: "Binary search has O(log n) time complexity because it eliminates half of the remaining elements with each comparison.",
      content: {
        question: "What is the time complexity of binary search?",
        options: [
          { id: "a", text: "O(1)", isCorrect: false },
          { id: "b", text: "O(log n)", isCorrect: true },
          { id: "c", text: "O(n)", isCorrect: false },
          { id: "d", text: "O(n log n)", isCorrect: false },
        ],
        shuffleOptions: true,
      },
      isPublic: true,
    },
    {
      type: "multiple_choice",
      title: "Stack Data Structure",
      description: "Understanding stack operations and use cases.",
      difficulty: "beginner",
      topics: ["Stacks"],
      xpReward: 10,
      hints: [
        { id: "h1", text: "Think about what LIFO means", xpPenalty: 3, order: 0 },
      ],
      explanation: "A stack follows LIFO (Last In, First Out) principle, where the last element added is the first one removed.",
      content: {
        question: "Which principle does a Stack follow?",
        options: [
          { id: "a", text: "FIFO (First In, First Out)", isCorrect: false },
          { id: "b", text: "LIFO (Last In, First Out)", isCorrect: true },
          { id: "c", text: "Random Access", isCorrect: false },
          { id: "d", text: "Priority Based", isCorrect: false },
        ],
        shuffleOptions: true,
      },
      isPublic: true,
    },

    // Multi Select
    {
      type: "multi_select",
      title: "Array Operations",
      description: "Identify operations with O(1) time complexity in arrays.",
      difficulty: "medium",
      topics: ["Arrays"],
      xpReward: 25,
      hints: [
        { id: "h1", text: "Consider which operations need to traverse elements", xpPenalty: 5, order: 0 },
      ],
      explanation: "Access by index and appending to end (amortized) are O(1). Inserting at beginning requires shifting all elements, making it O(n).",
      content: {
        question: "Which array operations have O(1) time complexity?",
        options: [
          { id: "a", text: "Access element by index", isCorrect: true },
          { id: "b", text: "Insert at beginning", isCorrect: false },
          { id: "c", text: "Append to end (amortized)", isCorrect: true },
          { id: "d", text: "Find element by value", isCorrect: false },
        ],
        shuffleOptions: true,
        partialCredit: true,
      },
      isPublic: true,
    },

    // True/False
    {
      type: "true_false",
      title: "Hash Table Collision",
      description: "Understanding hash table fundamentals.",
      difficulty: "beginner",
      topics: ["Hash Tables"],
      xpReward: 10,
      explanation: "Hash tables use hash functions to map keys to indices, but different keys can produce the same hash (collision), which must be handled.",
      content: {
        statement: "In a hash table, two different keys can never hash to the same index.",
        isTrue: false,
      },
      isPublic: true,
    },
    {
      type: "true_false",
      title: "Recursion and Stack",
      description: "Understanding the relationship between recursion and the call stack.",
      difficulty: "easy",
      topics: ["Recursion", "Stacks"],
      xpReward: 15,
      explanation: "Every recursive call pushes a new frame onto the call stack. This is why deep recursion can cause stack overflow.",
      content: {
        statement: "Recursive function calls use the system's call stack.",
        isTrue: true,
      },
      isPublic: true,
    },

    // Fill in the Blank
    {
      type: "fill_blank",
      title: "JavaScript Array Method",
      description: "Complete the code to find an element in an array.",
      difficulty: "easy",
      topics: ["Arrays", "Searching"],
      xpReward: 15,
      hints: [
        { id: "h1", text: "This method returns the index of the element", xpPenalty: 5, order: 0 },
      ],
      explanation: "The indexOf() method returns the first index at which a given element can be found, or -1 if not found.",
      content: {
        template: "const index = arr.{{method}}(target);",
        blanks: [
          { id: "method", acceptedAnswers: ["indexOf", "findIndex"], caseSensitive: true },
        ],
        language: "javascript",
      },
      isPublic: true,
    },

    // Drag Order
    {
      type: "drag_order",
      title: "Bubble Sort Steps",
      description: "Arrange the steps of bubble sort in correct order.",
      difficulty: "medium",
      topics: ["Sorting"],
      xpReward: 20,
      explanation: "Bubble sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
      content: {
        instruction: "Put the bubble sort steps in the correct order:",
        items: [
          { id: "1", text: "Start from the first element", correctPosition: 0 },
          { id: "2", text: "Compare adjacent elements", correctPosition: 1 },
          { id: "3", text: "Swap if left > right", correctPosition: 2 },
          { id: "4", text: "Move to next pair", correctPosition: 3 },
          { id: "5", text: "Repeat until no swaps needed", correctPosition: 4 },
        ],
      },
      isPublic: true,
    },

    // Drag Match
    {
      type: "drag_match",
      title: "Data Structure Time Complexities",
      description: "Match each data structure operation with its time complexity.",
      difficulty: "medium",
      topics: ["Arrays", "Linked Lists", "Hash Tables"],
      xpReward: 25,
      explanation: "Different data structures have different performance characteristics for various operations.",
      content: {
        instruction: "Match each operation with its average time complexity:",
        leftItems: [
          { id: "l1", text: "Array access by index" },
          { id: "l2", text: "Hash table lookup" },
          { id: "l3", text: "Linked list search" },
          { id: "l4", text: "Binary search" },
        ],
        rightItems: [
          { id: "r1", text: "O(1)" },
          { id: "r2", text: "O(1)" },
          { id: "r3", text: "O(n)" },
          { id: "r4", text: "O(log n)" },
        ],
      },
      isPublic: true,
    },

    // Code Writing
    {
      type: "code_writing",
      title: "Reverse an Array",
      description: "Write a function to reverse an array in place.",
      difficulty: "easy",
      topics: ["Arrays", "Two Pointers"],
      xpReward: 30,
      timeLimit: 300,
      hints: [
        { id: "h1", text: "Use two pointers, one at start and one at end", xpPenalty: 10, order: 0 },
        { id: "h2", text: "Swap elements and move pointers towards center", xpPenalty: 10, order: 1 },
      ],
      explanation: "The two-pointer technique allows us to reverse the array in O(n) time and O(1) space by swapping elements from both ends.",
      content: {
        prompt: "Write a function that reverses an array in place. The function should modify the original array and return it.",
        starterCode: "function reverseArray(arr) {\n  // Your code here\n  \n  return arr;\n}",
        language: "javascript",
        testCases: [
          { id: "t1", input: "[1, 2, 3, 4, 5]", expectedOutput: "[5, 4, 3, 2, 1]", isHidden: false },
          { id: "t2", input: "[1]", expectedOutput: "[1]", isHidden: false },
          { id: "t3", input: "[]", expectedOutput: "[]", isHidden: true },
        ],
        constraints: ["Do not use built-in reverse method", "Modify in place with O(1) extra space"],
      },
      isPublic: true,
    },

    // Parsons Problem
    {
      type: "parsons",
      title: "Implement Binary Search",
      description: "Arrange the code lines to create a working binary search function.",
      difficulty: "medium",
      topics: ["Searching", "Binary Trees"],
      xpReward: 30,
      explanation: "Binary search works by repeatedly dividing the search interval in half, comparing the middle element with the target.",
      content: {
        instruction: "Arrange the code lines to implement binary search:",
        language: "javascript",
        codeLines: [
          { id: "1", code: "function binarySearch(arr, target) {", correctPosition: 0, correctIndent: 0 },
          { id: "2", code: "let left = 0, right = arr.length - 1;", correctPosition: 1, correctIndent: 1 },
          { id: "3", code: "while (left <= right) {", correctPosition: 2, correctIndent: 1 },
          { id: "4", code: "const mid = Math.floor((left + right) / 2);", correctPosition: 3, correctIndent: 2 },
          { id: "5", code: "if (arr[mid] === target) return mid;", correctPosition: 4, correctIndent: 2 },
          { id: "6", code: "else if (arr[mid] < target) left = mid + 1;", correctPosition: 5, correctIndent: 2 },
          { id: "7", code: "else right = mid - 1;", correctPosition: 6, correctIndent: 2 },
          { id: "8", code: "}", correctPosition: 7, correctIndent: 1 },
          { id: "9", code: "return -1;", correctPosition: 8, correctIndent: 1 },
          { id: "10", code: "}", correctPosition: 9, correctIndent: 0 },
        ],
      },
      isPublic: true,
    },

    // Debugging
    {
      type: "debugging",
      title: "Fix the Two Sum Function",
      description: "Find and fix the bug in this two sum implementation.",
      difficulty: "medium",
      topics: ["Hash Tables", "Arrays"],
      xpReward: 35,
      hints: [
        { id: "h1", text: "Check what value is being stored in the hash map", xpPenalty: 10, order: 0 },
      ],
      explanation: "The bug is storing the value instead of the index. We need to store indices to return the correct result.",
      content: {
        prompt: "This function should return indices of two numbers that add up to target. Find and fix the bug.",
        buggyCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], nums[i]); // Bug: storing value instead of index
  }
  return [];
}`,
        language: "javascript",
        bugs: [
          { id: "b1", description: "Storing value instead of index", line: 8 },
        ],
        testCases: [
          { id: "t1", input: "[2, 7, 11, 15], 9", expectedOutput: "[0, 1]", isHidden: false },
          { id: "t2", input: "[3, 2, 4], 6", expectedOutput: "[1, 2]", isHidden: false },
        ],
      },
      isPublic: true,
    },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: {
        type: q.type as never,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty as never,
        topics: q.topics,
        xpReward: q.xpReward,
        timeLimit: q.timeLimit || null,
        hints: q.hints || [],
        explanation: q.explanation,
        content: q.content,
        isPublic: q.isPublic,
        createdById: admin.id,
      },
    });
  }
  console.log(`✓ Created ${questions.length} sample questions`);

  // Create a sample quiz
  const createdQuestions = await prisma.question.findMany({
    where: { isPublic: true },
    take: 5,
  });

  const quiz = await prisma.quiz.create({
    data: {
      title: "DSA Fundamentals Quiz",
      description: "Test your knowledge of basic data structures and algorithms concepts.",
      difficulty: "medium",
      topics: ["Arrays", "Stacks", "Searching", "Sorting", "Hash Tables"],
      isPublic: true,
      passingScore: 70,
      timeLimit: 600,
      questions: {
        create: createdQuestions.map((q, index) => ({
          questionId: q.id,
          order: index,
        })),
      },
    },
  });
  console.log(`✓ Created sample quiz: ${quiz.title}`);

  // Create sample course
  const course = await prisma.course.create({
    data: {
      title: "Data Structures Fundamentals",
      description: "Master the essential data structures every developer needs to know.",
      slug: "data-structures-fundamentals",
      topics: ["Arrays", "Linked Lists", "Stacks", "Queues", "Hash Tables"],
      difficulty: "beginner",
      isPublished: true,
      order: 1,
      modules: {
        create: [
          {
            title: "Introduction to Arrays",
            description: "Learn about arrays, the most fundamental data structure.",
            order: 0,
            quizIds: [quiz.id],
          },
          {
            title: "Stacks and Queues",
            description: "Understanding LIFO and FIFO data structures.",
            order: 1,
            quizIds: [],
          },
          {
            title: "Hash Tables",
            description: "Fast lookups with hash-based data structures.",
            order: 2,
            quizIds: [],
          },
        ],
      },
    },
  });
  console.log(`✓ Created sample course: ${course.title}`);

  console.log("\n✅ Database seeding completed!");
  console.log("\n📋 Test Accounts:");
  console.log("  Admin: admin@dsatrainer.com / admin123");
  console.log("  User:  test@dsatrainer.com / test123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
