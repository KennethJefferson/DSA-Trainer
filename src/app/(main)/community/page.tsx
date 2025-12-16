"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  author: Author;
  _count: {
    comments: number;
  };
  createdAt: string;
}

const categories = [
  { id: "all", label: "All Posts", icon: "forum" },
  { id: "general", label: "General Discussion", icon: "chat" },
  { id: "help", label: "Help & Support", icon: "help" },
  { id: "algorithms", label: "Algorithms", icon: "code" },
  { id: "data-structures", label: "Data Structures", icon: "account_tree" },
  { id: "interview-prep", label: "Interview Prep", icon: "work" },
  { id: "resources", label: "Resources", icon: "library_books" },
];

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
  });

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/community/posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        toast.success("Post created successfully!");
        setShowCreateModal(false);
        setNewPost({ title: "", content: "", category: "general" });
        fetchPosts();
      } else {
        toast.error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/upvote`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(p =>
          p.id === postId ? { ...p, upvotes: data.upvotes } : p
        ));
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Community</h1>
          <p className="text-text-muted mt-1">Connect with fellow learners and share knowledge</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icon name="add" className="mr-2" />
          New Post
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-dark border border-border-dark text-white placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors",
              selectedCategory === cat.id
                ? "bg-primary text-white"
                : "bg-surface-dark text-text-muted hover:bg-surface border border-border-dark"
            )}
          >
            <Icon name={cat.icon} size="sm" />
            <span className="text-sm font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-dark rounded-xl p-4 border border-border-dark">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Icon name="forum" size="sm" />
            <span className="text-xs font-bold uppercase">Total Posts</span>
          </div>
          <p className="text-xl font-bold text-white">{posts.length}</p>
        </div>
        <div className="bg-surface-dark rounded-xl p-4 border border-border-dark">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Icon name="people" size="sm" />
            <span className="text-xs font-bold uppercase">Active Members</span>
          </div>
          <p className="text-xl font-bold text-white">
            {new Set(posts.map(p => p.author.id)).size}
          </p>
        </div>
        <div className="bg-surface-dark rounded-xl p-4 border border-border-dark">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Icon name="chat" size="sm" />
            <span className="text-xs font-bold uppercase">Discussions</span>
          </div>
          <p className="text-xl font-bold text-white">
            {posts.reduce((acc, p) => acc + p._count.comments, 0)}
          </p>
        </div>
        <div className="bg-surface-dark rounded-xl p-4 border border-border-dark">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Icon name="thumb_up" size="sm" />
            <span className="text-xs font-bold uppercase">Total Upvotes</span>
          </div>
          <p className="text-xl font-bold text-white">
            {posts.reduce((acc, p) => acc + p.upvotes, 0)}
          </p>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              variant="elevated"
              className="!p-5 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => router.push(`/community/${post.id}`)}
            >
              <div className="flex gap-4">
                {/* Upvote */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpvote(post.id);
                    }}
                    className="p-2 rounded-lg hover:bg-primary/20 text-text-muted hover:text-primary transition-colors"
                  >
                    <Icon name="arrow_upward" />
                  </button>
                  <span className="text-sm font-bold text-white">{post.upvotes}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-xs font-medium mb-2",
                        post.category === "help" ? "bg-yellow-500/20 text-yellow-400" :
                        post.category === "algorithms" ? "bg-blue-500/20 text-blue-400" :
                        post.category === "data-structures" ? "bg-purple-500/20 text-purple-400" :
                        post.category === "interview-prep" ? "bg-green-500/20 text-green-400" :
                        "bg-surface text-text-muted"
                      )}>
                        {categories.find(c => c.id === post.category)?.label || post.category}
                      </span>
                      <h3 className="font-bold text-white text-lg">{post.title}</h3>
                    </div>
                  </div>

                  <p className="text-text-muted text-sm line-clamp-2 mb-4">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative size-8 rounded-full overflow-hidden bg-surface">
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
                        <span className="text-sm font-medium text-white">
                          {post.author.name || post.author.username || "Anonymous"}
                        </span>
                        <span className="text-xs text-text-muted ml-2">
                          Level {post.author.level}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-text-muted text-sm">
                      <span className="flex items-center gap-1">
                        <Icon name="chat_bubble" size="sm" />
                        {post._count.comments}
                      </span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="elevated" className="text-center py-16">
          <Icon name="forum" size="xl" className="text-text-muted mb-4 opacity-50" />
          <p className="text-text-muted mb-4">No posts yet. Start the conversation!</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Icon name="add" className="mr-2" />
            Create First Post
          </Button>
        </Card>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark rounded-2xl p-6 w-full max-w-lg border border-border-dark">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-white"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border-dark text-white focus:border-primary focus:outline-none"
                  placeholder="What's your question or topic?"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border-dark text-white focus:border-primary focus:outline-none"
                >
                  {categories.filter(c => c.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted block mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border-dark text-white focus:border-primary focus:outline-none"
                  placeholder="Share your thoughts, question, or code..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Post
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
