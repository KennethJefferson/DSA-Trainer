import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-400 rounded-xl flex items-center justify-center shadow-glow-sm">
            <span className="material-symbols-outlined text-white text-xl">
              school
            </span>
          </div>
          <span className="text-xl font-bold text-white">
            DSA<span className="text-gradient">Trainer</span>
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-text-muted text-sm">
        <p>&copy; {new Date().getFullYear()} DSA Trainer. All rights reserved.</p>
      </footer>
    </div>
  );
}
