import { auth } from "@/src/auth";
import Header from "@/src/components/Header";
import SearchSection from "@/src/components/SearchSection";
import Link from "next/link";
import { Compass } from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-base-100 font-sans relative overflow-x-hidden">
      <Header session={session} />

      {/* 1. Ambient Background Glows */}
      {/* These creates that "Cinematic" lighting effect behind the text */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-base-100/50 backdrop-blur-md text-xs font-medium uppercase tracking-wider text-base-content/60">
            <Compass size={14} /> Discover your next read
          </div>

          <h1 className="text-6xl md:text-8xl font-serif font-bold text-base-content leading-tight tracking-tight drop-shadow-lg">
            Find Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Next Adventure
            </span>
          </h1>

          <p className="text-xl text-base-content/60 font-light leading-relaxed max-w-2xl mx-auto">
            Search millions of books, curate your personal library, and track
            your reading journey in a beautiful, distraction-free space.
          </p>
        </div>

        {/* Search Section Wrapper */}
        <div className="bg-base-200/30 backdrop-blur-xl border border-white/10 p-2 md:p-8 rounded-3xl shadow-2xl">
          <SearchSection />
        </div>

        {/* Footer / Call to Action */}
        {!session && (
          <div className="text-center mt-20">
            <p className="text-base-content/40 text-sm mb-4">
              Join TomeShelf to track your progress
            </p>
            <Link href="/sign-up" className="btn btn-outline btn-wide">
              Create Free Account
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
