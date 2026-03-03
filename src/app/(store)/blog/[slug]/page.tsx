import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock3, User } from "lucide-react";
import {
  formatBlogDate,
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostSummaries,
} from "@/features/blog/data/posts";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | FreshMart Blog",
      description: "This FreshMart Blog article could not be found.",
    };
  }

  return {
    title: `${post.title} | FreshMart Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getBlogPostSummaries()
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="overflow-hidden">
      <div className="relative section-gradient py-16 lg:py-20">
        <div className="blob blob-primary w-72 h-72 -top-20 -right-20 animate-pulse-soft" />
        <div className="blob blob-accent w-64 h-64 -bottom-20 -left-20 animate-pulse-soft delay-300" />
        <div className="container mx-auto px-4 max-w-5xl relative">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-4 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/5">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              {post.title}
            </h1>
            <p className="text-muted-foreground text-lg lg:text-xl leading-relaxed mb-6">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatBlogDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      <article className="container mx-auto px-4 max-w-5xl py-14 lg:py-16">
        <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-10 lg:p-12 space-y-10">
          {post.sections.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-muted-foreground leading-relaxed text-base lg:text-lg"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-2 pl-5">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="text-muted-foreground list-disc"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-14 lg:mt-16">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                More From FreshMart Blog
              </h2>
              <Link
                href="/blog"
                className="text-primary font-medium text-sm hover:underline"
              >
                View all articles
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="group bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/20 hover:shadow-card-hover transition-all duration-300"
                >
                  <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-[11px] font-semibold uppercase rounded-full mb-3 border border-primary/10">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {item.excerpt}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-primary text-sm font-medium">
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
