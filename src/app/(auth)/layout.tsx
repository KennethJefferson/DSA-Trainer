import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Hero Section - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/hero/login-hero.jpg"
          alt="Abstract purple geometric 3D shapes"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-background/60 to-background/80" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-400 rounded-xl flex items-center justify-center shadow-glow">
              <span className="material-symbols-outlined text-white text-2xl">
                school
              </span>
            </div>
            <span className="text-2xl font-bold text-white">
              DSA<span className="text-primary-light">Trainer</span>
            </span>
          </Link>

          {/* Hero Text */}
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Master Data Structures & Algorithms
            </h1>
            <p className="text-lg text-white/80">
              Interactive quizzes, personalized learning paths, and real-world coding challenges to level up your skills.
            </p>
          </div>

          {/* Testimonial Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md border border-white/10">
            <div className="flex items-start gap-4">
              <Image
                src="/images/avatars/testimonial-user.jpg"
                alt="Student testimonial"
                width={48}
                height={48}
                className="rounded-full border-2 border-white/20"
              />
              <div className="flex-1">
                <p className="text-white/90 text-sm leading-relaxed mb-3">
                  &ldquo;DSA Trainer completely transformed how I approach coding interviews. The gamified learning kept me motivated, and I landed my dream job at a top tech company!&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">Sarah Chen</span>
                  <span className="text-white/50">•</span>
                  <span className="text-white/60 text-sm">Software Engineer @ Google</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section - Right Side */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header (visible on smaller screens) */}
        <header className="lg:hidden p-6">
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
        <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-text-muted text-sm">
          <p>&copy; {new Date().getFullYear()} DSA Trainer. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
