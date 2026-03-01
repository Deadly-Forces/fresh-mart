import { Cookie } from "lucide-react";

export default function CookiePolicyPage() {
    return (
        <div>
            {/* Hero */}
            <section className="relative section-gradient overflow-hidden py-14 md:py-20">
                <div className="blob blob-primary w-72 h-72 -top-20 -left-20" />
                <div className="blob blob-accent w-56 h-56 -bottom-16 -right-16" />
                <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20 mb-5">
                        <Cookie className="w-7 h-7" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">Cookie <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Policy</span></h1>
                    <p className="text-muted-foreground">Last updated: October 24, 2023</p>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-4xl py-12">
            <div className="rounded-2xl border border-border/50 bg-background/70 backdrop-blur-sm p-8 md:p-12 shadow-soft">
            <div className="prose prose-slate max-w-none text-muted-foreground prose-headings:text-foreground prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                <h2>1. What Are Cookies?</h2>
                <p>
                    A cookie is a small piece of data (text file) that a website – when visited by a user – asks your browser to store on your device in order to remember information about you, such as your language preference or login information.
                </p>

                <h2>2. How We Use Cookies</h2>
                <p>
                    We use cookies and other tracking technologies for the following purposes:
                </p>
                <ul>
                    <li>Assisting you in navigation and making your visit more personalized.</li>
                    <li>Assisting in registration to our events, login, and your ability to provide feedback.</li>
                    <li>Analyzing your use of our products, services, or applications to help us improve the experience.</li>
                    <li>Assisting with our promotional and marketing efforts.</li>
                </ul>

                <h2>3. Types of Cookies We Use</h2>
                <p>
                    <strong>Strictly Necessary Cookies:</strong> These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site.<br />
                    <strong>Performance Cookies:</strong> These cookies collect information about how you use a website, like which pages you visited and which links you clicked on. None of this information can be used to identify you.<br />
                    <strong>Functionality Cookies:</strong> These cookies allow our website to remember choices you make (such as your user name, language or the region you are in) and provide enhanced, more personal features.<br />
                    <strong>Targeting Cookies:</strong> These are cookies used to deliver advertisements more relevant to you and your interests.
                </p>

                <h2>4. Managing Your Cookie Preferences</h2>
                <p>
                    You can restrict, block or delete the cookies from our website, or any other website, by using your browser. Each browser is different, so check the "Help" menu of your particular browser (or your mobile phone's handset manual) to learn how to change your cookie preferences.
                </p>

                <h2>5. Changes to This Policy</h2>
                <p>
                    We may update this policy from time to time to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please revisit this policy regularly to stay informed about our use of cookies and related technologies.
                </p>
            </div>
            </div>
            </div>
        </div>
    );
}
