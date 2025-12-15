import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DSA Trainer - Master Data Structures & Algorithms",
    template: "%s | DSA Trainer",
  },
  description:
    "A gamified platform to practice Data Structures and Algorithms with interactive quizzes, code challenges, and progress tracking.",
  keywords: [
    "DSA",
    "Data Structures",
    "Algorithms",
    "Quiz",
    "Coding Practice",
    "Interview Prep",
    "LeetCode",
    "Programming",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-display antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
