"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import {
  formatBlogDate,
  type BlogPostSummary,
} from "@/features/blog/data/posts";

const POSTS_PER_BATCH = 4;

interface BlogPostGridProps {
  posts: BlogPostSummary[];
}

export function BlogPostGrid({ posts }: BlogPostGridProps) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(POSTS_PER_BATCH, posts.length),
  );
  const visiblePosts = useMemo(
    () => posts.slice(0, visibleCount),
    [posts, visibleCount],
  );
  const hasMorePosts = visibleCount < posts.length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {visiblePosts.map((post) => (
          <article
            key={post.slug}
            className="group bg-card border border-border/50 rounded-3xl overflow-hidden hover:border-primary/20 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
          >
            <div className={`h-2 bg-gradient-to-r ${post.gradient}`} />
            <Link
              href={`/blog/${post.slug}`}
              className="p-6 sm:p-8 flex flex-col h-full"
            >
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary/10 to-emerald-500/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4 border border-primary/10">
                  {post.category}
                </span>
                <h2 className="text-xl lg:text-2xl font-bold group-hover:text-primary transition-colors leading-tight mb-3">
                  {post.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm">
                  {post.excerpt}
                </p>
              </div>
              <div className="mt-auto pt-6 border-t border-border/40 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatBlogDate(post.publishedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="text-xs font-medium">{post.readTime}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {posts.length > POSTS_PER_BATCH && (
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + POSTS_PER_BATCH, posts.length),
              )
            }
            disabled={!hasMorePosts}
            className="h-12 px-8 rounded-xl font-medium bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/15 text-primary hover:shadow-soft hover:border-primary/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {hasMorePosts ? "Load More Articles" : "All Articles Loaded"}
          </button>
        </div>
      )}
    </>
  );
}
