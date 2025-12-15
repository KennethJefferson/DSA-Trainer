"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QuizProvider, QuizContainer } from "@/components/quiz";
import { Card, Icon, Button } from "@/components/ui";
import Link from "next/link";

// Demo questions for testing the quiz engine
const demoQuestions = [
  {
    id: "q1",
    type: "multiple_choice",
    title: "Binary Search Time Complexity",
    difficulty: "easy",
    xpReward: 15,
    hints: [
      { id: "h1", text: "Think about how the search space changes with each iteration.", xpPenalty: 3, order: 0 },
      { id: "h2", text: "The algorithm divides the search space in half each time.", xpPenalty: 5, order: 1 },
    ],
    explanation: "Binary search divides the search space in half with each iteration, resulting in O(log n) time complexity.",
    content: {
      question: "What is the time complexity of binary search on a sorted array?",
      options: [
        { id: "a", text: "O(1)", isCorrect: false },
        { id: "b", text: "O(log n)", isCorrect: true },
        { id: "c", text: "O(n)", isCorrect: false },
        { id: "d", text: "O(n²)", isCorrect: false },
      ],
      shuffleOptions: true,
    },
  },
  {
    id: "q2",
    type: "true_false",
    title: "Queue Data Structure",
    difficulty: "beginner",
    xpReward: 10,
    explanation: "A Queue follows FIFO (First In, First Out). LIFO is the principle used by Stacks.",
    content: {
      statement: "A Queue follows the LIFO (Last In, First Out) principle.",
      isTrue: false,
    },
  },
  {
    id: "q3",
    type: "multi_select",
    title: "Valid Stack Operations",
    difficulty: "beginner",
    xpReward: 15,
    explanation: "push(), pop(), peek(), and isEmpty() are standard stack operations. insert(index) is not a valid stack operation as stacks only allow access at the top.",
    content: {
      question: "Which of the following are valid stack operations?",
      instruction: "Select all that apply",
      options: [
        { id: "a", text: "push()", isCorrect: true },
        { id: "b", text: "pop()", isCorrect: true },
        { id: "c", text: "peek()", isCorrect: true },
        { id: "d", text: "insert(index)", isCorrect: false },
        { id: "e", text: "isEmpty()", isCorrect: true },
      ],
      shuffleOptions: true,
      partialCredit: true,
    },
  },
  {
    id: "q4",
    type: "drag_order",
    title: "QuickSort Steps",
    difficulty: "medium",
    xpReward: 25,
    explanation: "QuickSort works by choosing a pivot, partitioning around it, then recursively sorting the partitions.",
    content: {
      instruction: "Arrange the QuickSort algorithm steps in the correct order",
      items: [
        { id: "s1", text: "Choose a pivot element", correctPosition: 0 },
        { id: "s2", text: "Partition array around pivot", correctPosition: 1 },
        { id: "s3", text: "Recursively sort left partition", correctPosition: 2 },
        { id: "s4", text: "Recursively sort right partition", correctPosition: 3 },
      ],
      includeDistractors: false,
    },
  },
  {
    id: "q5",
    type: "fill_blank",
    title: "Complete the Binary Search",
    difficulty: "medium",
    xpReward: 30,
    explanation: "Binary search requires initializing left to 0, using array length, comparing with <=, and updating left to mid + 1.",
    content: {
      template: "function binarySearch(arr, target) {\n  let left = {{start}};\n  let right = arr.{{prop}} - 1;\n  \n  while (left {{op}} right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = {{update}};\n    else right = mid - 1;\n  }\n  return -1;\n}",
      blanks: [
        { id: "start", acceptedAnswers: ["0"], caseSensitive: false, placeholder: "initial" },
        { id: "prop", acceptedAnswers: ["length"], caseSensitive: true, placeholder: "property" },
        { id: "op", acceptedAnswers: ["<="], caseSensitive: false, placeholder: "compare" },
        { id: "update", acceptedAnswers: ["mid + 1", "mid+1"], caseSensitive: false, placeholder: "new left" },
      ],
      language: "javascript",
    },
  },
];

export default function QuizPage() {
  const params = useParams();
  const quizId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [quizData, setQuizData] = useState<{
    title: string;
    questions: typeof demoQuestions;
    timeLimit?: number;
  } | null>(null);

  useEffect(() => {
    // Simulate loading quiz data
    // In a real app, this would fetch from API
    const timer = setTimeout(() => {
      setQuizData({
        title: "DSA Fundamentals Quiz",
        questions: demoQuestions,
        timeLimit: 600, // 10 minutes
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <Card variant="elevated" className="max-w-md mx-auto text-center">
        <Icon name="error" size="xl" className="text-error mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Quiz Not Found</h2>
        <p className="text-text-muted mb-4">
          The quiz you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/quizzes">
          <Button variant="secondary">Browse Quizzes</Button>
        </Link>
      </Card>
    );
  }

  return (
    <QuizProvider
      quizId={quizId}
      questions={quizData.questions}
      timeLimit={quizData.timeLimit}
    >
      <QuizContainer />
    </QuizProvider>
  );
}
