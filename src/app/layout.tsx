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
      <head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Lexend font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols Outlined */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-display antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
