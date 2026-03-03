import { Navbar } from "@/components/layout/Navbar";
import { CategoryStrip } from "@/components/layout/CategoryStrip";
import { Footer } from "@/components/layout/Footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="pt-16">
        <CategoryStrip />
      </div>
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
    </div>
  );
}
