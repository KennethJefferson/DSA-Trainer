"use client";

import { useState, useEffect } from "react";
import { Button, Icon, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  goalType: string;
  targetDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
}

const goalTypeLabels: Record<string, string> = {
  quizzes_completed: "Quizzes Completed",
  xp_earned: "XP Earned",
  streak_days: "Streak Days",
  topic_mastery: "Topic Mastery",
  accuracy_target: "Accuracy Target",
};

const goalTypeIcons: Record<string, string> = {
  quizzes_completed: "quiz",
  xp_earned: "military_tech",
  streak_days: "local_fire_department",
  topic_mastery: "school",
  accuracy_target: "target",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetValue: 10,
    goalType: "quizzes_completed",
    targetDate: "",
  });

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });

      if (response.ok) {
        toast.success("Goal created successfully!");
        setShowCreateModal(false);
        setNewGoal({
          title: "",
          description: "",
          targetValue: 10,
          goalType: "quizzes_completed",
          targetDate: "",
        });
        fetchGoals();
      } else {
        toast.error("Failed to create goal");
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Goal deleted");
        fetchGoals();
      } else {
        toast.error("Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Goal completed!");
        fetchGoals();
      } else {
        toast.error("Failed to complete goal");
      }
    } catch (error) {
      console.error("Error completing goal:", error);
      toast.error("Failed to complete goal");
    }
  };

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Learning Goals</h1>
          <p className="text-text-muted mt-1">Set and track your learning objectives</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icon name="add" className="mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-dark rounded-xl p-5 border border-border-dark">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Icon name="flag" />
            <span className="text-xs font-bold uppercase">Active Goals</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeGoals.length}</p>
        </div>
        <div className="bg-surface-dark rounded-xl p-5 border border-border-dark">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Icon name="check_circle" className="text-success" />
            <span className="text-xs font-bold uppercase">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">{completedGoals.length}</p>
        </div>
        <div className="bg-surface-dark rounded-xl p-5 border border-border-dark">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Icon name="trending_up" className="text-primary" />
            <span className="text-xs font-bold uppercase">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
          </p>
        </div>
        <div className="bg-surface-dark rounded-xl p-5 border border-border-dark">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Icon name="military_tech" className="text-yellow-400" />
            <span className="text-xs font-bold uppercase">XP Earned</span>
          </div>
          <p className="text-2xl font-bold text-white">+{completedGoals.length * 100}</p>
        </div>
      </div>

      {/* Active Goals */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Active Goals</h2>
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
              return (
                <Card key={goal.id} variant="elevated" className="!p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Icon name={goalTypeIcons[goal.goalType] || "flag"} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{goal.title}</h3>
                        <p className="text-xs text-text-muted">{goalTypeLabels[goal.goalType]}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-text-muted hover:text-error transition-colors"
                    >
                      <Icon name="delete" />
                    </button>
                  </div>

                  {goal.description && (
                    <p className="text-sm text-text-muted mb-4">{goal.description}</p>
                  )}

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-muted">Progress</span>
                      <span className="text-white font-medium">
                        {goal.currentValue} / {goal.targetValue}
                      </span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {goal.targetDate && (
                      <span className="text-xs text-text-muted">
                        Due: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    )}
                    {progress >= 100 && (
                      <Button size="sm" onClick={() => handleCompleteGoal(goal.id)}>
                        <Icon name="check" className="mr-1" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card variant="elevated" className="text-center py-12">
            <Icon name="flag" size="xl" className="text-text-muted mb-4 opacity-50" />
            <p className="text-text-muted mb-4">No active goals. Create one to get started!</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Icon name="add" className="mr-2" />
              Create Goal
            </Button>
          </Card>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Completed Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <Card key={goal.id} variant="elevated" className="!p-5 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-success/20 flex items-center justify-center">
                      <Icon name="check_circle" className="text-success" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{goal.title}</h3>
                      <p className="text-xs text-text-muted">
                        Completed {goal.completedAt && new Date(goal.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-success font-medium">+100 XP</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark rounded-2xl p-6 w-full max-w-md border border-border-dark">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New Goal</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-white"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border-dark text-white focus:border-primary focus:outline-none"
                  placeholder="e.g., Complete 10 quizzes this week"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Description (optional)</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border-dark text-white focus:border-primary focus:outline-none"
                  placeholder="Add more details..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-muted block mb-2">Goal Type</label>
                  <select
                    value={newGoal.goalType}
                    onChange={(e) => setNewGoal({ ...newGoal, goalType: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border-dark text-white focus:border-primary focus:outline-none"
                  >
                    {Object.entries(goalTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-muted block mb-2">Target Value</label>
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border-dark text-white focus:border-primary focus:outline-none"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Target Date (optional)</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border-dark text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Goal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
