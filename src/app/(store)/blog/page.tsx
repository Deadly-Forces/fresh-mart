import { BookOpen } from "lucide-react";
import { BlogPostGrid } from "@/features/blog/components/BlogPostGrid";
import { getBlogPostSummaries } from "@/features/blog/data/posts";

export default function BlogPage() {
  const posts = getBlogPostSummaries();

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <div className="relative section-gradient py-20 lg:py-24">
        <div className="blob blob-primary w-72 h-72 -top-20 -right-20 animate-pulse-soft" />
        <div className="blob blob-accent w-64 h-64 -bottom-20 -left-20 animate-pulse-soft delay-300" />
        <div className="container mx-auto px-4 max-w-7xl relative text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-4 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/5">
            <BookOpen className="w-3.5 h-3.5" />
            Our Blog
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Fresh{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Ideas
            </span>{" "}
            Blog
          </h1>
          <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto">
            Discover recipes, storage tips, community stories, and everything
            you need to know about fresh food.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-16 lg:py-20">
        <BlogPostGrid posts={posts} />
      </div>
    </div>
  );
}
