import { requireCreator } from "@/lib/auth-utils";
import { AdminSidebar } from "@/components/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCreator();

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar user={user} />

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
