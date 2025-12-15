import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export type UserRole = "user" | "creator" | "admin" | "superadmin";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  creator: 1,
  admin: 2,
  superadmin: 3,
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      xp: true,
      level: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(minimumRole: UserRole) {
  const user = await requireAuth();

  const userRoleLevel = ROLE_HIERARCHY[user.role as UserRole] ?? 0;
  const requiredRoleLevel = ROLE_HIERARCHY[minimumRole];

  if (userRoleLevel < requiredRoleLevel) {
    redirect("/dashboard?error=unauthorized");
  }

  return user;
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireCreator() {
  return requireRole("creator");
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canManageQuestions(userRole: UserRole): boolean {
  return hasRole(userRole, "creator");
}

export function canManageUsers(userRole: UserRole): boolean {
  return hasRole(userRole, "admin");
}

export function canAccessAdmin(userRole: UserRole): boolean {
  return hasRole(userRole, "creator");
}
