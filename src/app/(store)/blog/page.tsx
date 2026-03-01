import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";

export default function BlogPage() {
    const posts = [
        {
            title: "5 Easy Weeknight Dinners Using Fresh Vegetables",
            excerpt: "Learn how to transform your fresh produce into delicious, quick meals the whole family will love.",
            author: "Chef Sarah",
            date: "Oct 12, 2023",
            category: "Recipes",
            gradient: "from-emerald-500/10 to-green-500/5"
        },
        {
            title: "The Ultimate Guide to Storing Fresh Fruit",
            excerpt: "Stop throwing away spoiled fruit! Follow these simple tips to keep your berries, apples, and bananas fresh for longer.",
            author: "FreshMart Team",
            date: "Oct 05, 2023",
            category: "Tips & Tricks",
            gradient: "from-blue-500/10 to-cyan-500/5"
        },
        {
            title: "Meet the Farmer: Greenfield Orchards",
            excerpt: "We visit one of our top local suppliers to see exactly where your morning apples come from and how they are grown.",
            author: "Community Reporter",
            date: "Sep 28, 2023",
            category: "Community",
            gradient: "from-amber-500/10 to-orange-500/5"
        },
        {
            title: "Healthy Snacking Alternatives for Kids",
            excerpt: "Swap out processed snacks for these nutritious, tasty options that kids won't even realize are healthy.",
            author: "Nutritionist Emma",
            date: "Sep 20, 2023",
            category: "Health",
            gradient: "from-purple-500/10 to-pink-500/5"
        }
    ];

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
                        Fresh <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Ideas</span> Blog
                    </h1>
                    <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto">
                        Discover recipes, storage tips, community stories, and everything you need to know about fresh food.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {posts.map((post, i) => (
                        <article key={i} className="group bg-card border border-border/50 rounded-3xl overflow-hidden hover:border-primary/20 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full">
                            {/* Gradient header strip */}
                            <div className={`h-2 bg-gradient-to-r ${post.gradient}`} />
                            <div className="p-6 sm:p-8 flex flex-col h-full">
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
                                <div className="mt-auto pt-6 border-t border-border/40 flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            <span>{post.author}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{post.date}</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-14 text-center">
                    <button className="h-12 px-8 rounded-xl font-medium bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/15 text-primary hover:shadow-soft hover:border-primary/30 transition-all duration-300">
                        Load More Articles
                    </button>
                </div>
            </div>
        </div>
    );
}
