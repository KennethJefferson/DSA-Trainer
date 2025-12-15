"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin";
import { Card, CardContent, Button, Input, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  xp: number;
  level: number;
  streak: number;
  createdAt: string;
  _count?: {
    quizAttempts: number;
    questions: number;
  };
}

const ROLES = ["user", "creator", "admin", "superadmin"];

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      params.set("limit", "100");

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      toast.success("Role updated");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="min-h-full">
      <AdminHeader
        title="Users"
        description={`${users.length} registered users`}
      />

      <div className="p-8">
        {/* Filters */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Icon name="search" size="sm" />}
                className="flex-1"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-surface border border-white/10 text-white"
              >
                <option value="">All Roles</option>
                {ROLES.map((role) => (
                  <option key={role} value={role} className="capitalize">
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card variant="elevated">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left text-sm font-medium text-text-muted">User</th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">Role</th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">XP / Level</th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">Streak</th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">Activity</th>
                  <th className="p-4 text-left text-sm font-medium text-text-muted">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <Icon name="progress_activity" className="animate-spin text-text-muted" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <Icon name="group" size="xl" className="text-text-muted mb-2 opacity-50" />
                      <p className="text-text-muted">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name || "User"}
                              className="size-10 rounded-full"
                            />
                          ) : (
                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Icon name="person" className="text-primary" size="sm" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{user.name || "Anonymous"}</p>
                            <p className="text-xs text-text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium border-none focus:ring-2 focus:ring-primary",
                            user.role === "superadmin" && "bg-purple-500/20 text-purple-400",
                            user.role === "admin" && "bg-red-500/20 text-red-400",
                            user.role === "creator" && "bg-blue-500/20 text-blue-400",
                            user.role === "user" && "bg-gray-500/20 text-gray-400"
                          )}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role} className="capitalize bg-surface-dark">
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">{user.xp.toLocaleString()} XP</p>
                        <p className="text-xs text-text-muted">Level {user.level}</p>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-orange-400">
                          <Icon name="local_fire_department" size="sm" />
                          {user.streak}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                        {user._count?.quizAttempts || 0} quizzes
                        <br />
                        {user._count?.questions || 0} questions
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
