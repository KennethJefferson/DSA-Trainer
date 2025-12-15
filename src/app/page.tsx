import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background pointer-events-none" />

      <div className="relative z-10 text-center px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-400 rounded-2xl flex items-center justify-center shadow-glow">
            <span className="material-symbols-outlined text-white text-4xl">school</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          DSA<span className="text-gradient">Trainer</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-text-muted mb-12 max-w-lg mx-auto">
          Master Data Structures & Algorithms through interactive quizzes and gamified learning
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-glow hover:shadow-glow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 bg-surface border border-surface-border text-white font-bold rounded-xl hover:bg-surface-light transition-all"
          >
            Create Account
          </Link>
        </div>

        {/* Features preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="p-6 bg-surface/50 backdrop-blur rounded-xl border border-white/5">
            <span className="material-symbols-outlined text-primary text-3xl mb-3">quiz</span>
            <h3 className="text-white font-semibold mb-2">10+ Question Types</h3>
            <p className="text-text-muted text-sm">Multiple choice, code writing, drag & drop, and more</p>
          </div>
          <div className="p-6 bg-surface/50 backdrop-blur rounded-xl border border-white/5">
            <span className="material-symbols-outlined text-primary text-3xl mb-3">emoji_events</span>
            <h3 className="text-white font-semibold mb-2">Earn XP & Badges</h3>
            <p className="text-text-muted text-sm">Track your progress and compete on leaderboards</p>
          </div>
          <div className="p-6 bg-surface/50 backdrop-blur rounded-xl border border-white/5">
            <span className="material-symbols-outlined text-primary text-3xl mb-3">code</span>
            <h3 className="text-white font-semibold mb-2">Run Real Code</h3>
            <p className="text-text-muted text-sm">Execute and test your solutions in the browser</p>
          </div>
        </div>
      </div>
    </main>
  );
}
