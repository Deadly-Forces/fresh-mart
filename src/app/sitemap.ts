import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/features/blog/data/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://freshmart.com";

  const staticPages = [
    "",
    "/shop",
    "/login",
    "/about",
    "/contact",
    "/faq",
    "/terms",
    "/privacy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Categories
  const categories = [
    "vegetables",
    "fruits",
    "dairy-eggs",
    "bakery",
    "meat-seafood",
    "snacks",
    "beverages",
    "personal-care",
    "household",
    "baby-care",
  ].map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const blogPages = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...getAllBlogPosts().map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(`${post.publishedAt}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];

  return [...staticPages, ...categories, ...blogPages];
}
