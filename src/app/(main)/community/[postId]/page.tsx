"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button, Icon, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

interface Author {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  level: number;
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  author: Author;
  comments: Comment[];
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  general: "General Discussion",
  help: "Help & Support",
  algorithms: "Algorithms",
  "data-structures": "Data Structures",
  "interview-prep": "Interview Prep",
  resources: "Resources",
};

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/community/posts/${resolvedParams.postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
      } else {
        toast.error("Post not found");
        router.push("/community");
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [resolvedParams.postId]);

  const handleUpvote = async () => {
    if (!post) return;
    try {
      const response = await fetch(`/api/community/posts/${post.id}/upvote`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setPost({ ...post, upvotes: data.upvotes });
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        toast.success("Comment added!");
        setNewComment("");
        fetchPost();
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Post not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto w-full space-y-6">
      {/* Back Link */}
      <Link
        href="/community"
        className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors"
      >
        <Icon name="arrow_back" />
        Back to Community
      </Link>

      {/* Post */}
      <Card variant="elevated" className="!p-6">
        <div className="flex gap-6">
          {/* Upvote Column */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleUpvote}
              className="p-3 rounded-xl hover:bg-primary/20 text-text-muted hover:text-primary transition-colors"
            >
              <Icon name="arrow_upward" size="lg" />
            </button>
            <span className="text-xl font-bold text-white">{post.upvotes}</span>
            <button className="p-3 rounded-xl hover:bg-surface text-text-muted transition-colors">
              <Icon name="arrow_downward" size="lg" />
            </button>
          </div>

          {/* Content Column */}
          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            <span className={cn(
              "inline-block px-3 py-1 rounded-full text-xs font-medium mb-3",
              post.category === "help" ? "bg-yellow-500/20 text-yellow-400" :
              post.category === "algorithms" ? "bg-blue-500/20 text-blue-400" :
              post.category === "data-structures" ? "bg-purple-500/20 text-purple-400" :
              post.category === "interview-prep" ? "bg-green-500/20 text-green-400" :
              "bg-surface text-text-muted"
            )}>
              {categoryLabels[post.category] || post.category}
            </span>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>

            {/* Author Info */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-dark">
              <div className="relative size-10 rounded-full overflow-hidden bg-surface">
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Icon name="person" className="text-text-muted" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {post.author.name || post.author.username || "Anonymous"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                    Level {post.author.level}
                  </span>
                </div>
                <span className="text-sm text-text-muted">{formatDate(post.createdAt)}</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <p className="text-text-main whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border-dark">
              <button className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
                <Icon name="share" />
                <span className="text-sm">Share</span>
              </button>
              <button className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
                <Icon name="bookmark" />
                <span className="text-sm">Save</span>
              </button>
              <button className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
                <Icon name="flag" />
                <span className="text-sm">Report</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Icon name="chat_bubble" />
          Comments ({post.comments.length})
        </h2>

        {/* Add Comment */}
        <Card variant="elevated" className="!p-4">
          <form onSubmit={handleComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 rounded-xl bg-background border border-border-dark text-white placeholder:text-text-muted focus:border-primary focus:outline-none resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <Button type="submit" disabled={!newComment.trim() || submitting}>
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Comments List */}
        {post.comments.length > 0 ? (
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <Card key={comment.id} variant="elevated" className="!p-4">
                <div className="flex gap-3">
                  <div className="relative size-9 rounded-full overflow-hidden bg-surface flex-shrink-0">
                    {comment.author.image ? (
                      <Image
                        src={comment.author.image}
                        alt={comment.author.name || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Icon name="person" className="text-text-muted text-sm" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">
                        {comment.author.name || comment.author.username || "Anonymous"}
                      </span>
                      <span className="text-xs text-text-muted">
                        Level {comment.author.level}
                      </span>
                      <span className="text-xs text-text-muted">
                        · {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-text-main text-sm whitespace-pre-wrap">{comment.content}</p>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-4 mt-2">
                      <button className="flex items-center gap-1 text-text-muted hover:text-primary text-xs transition-colors">
                        <Icon name="thumb_up" size="sm" />
                        Like
                      </button>
                      <button className="flex items-center gap-1 text-text-muted hover:text-white text-xs transition-colors">
                        <Icon name="reply" size="sm" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="elevated" className="!p-8 text-center">
            <Icon name="chat_bubble" size="xl" className="text-text-muted mb-3 opacity-50" />
            <p className="text-text-muted">No comments yet. Be the first to share your thoughts!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
