import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get user data from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      xp: true,
      level: true,
      streak: true,
    },
  });

  const userWithRole = {
    ...session.user,
    role: user?.role || "user",
    xp: user?.xp || 0,
    level: user?.level || 1,
    streak: user?.streak || 0,
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={userWithRole} />

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header user={session.user} />
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
