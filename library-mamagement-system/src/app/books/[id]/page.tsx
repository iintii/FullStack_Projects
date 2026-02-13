import { getBookById } from "@/src/lib/google-books";
import Header from "@/src/components/Header";
import { auth } from "@/src/auth";
import Link from "next/link";
import { ArrowLeft, Layers, Calendar, User, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import WishlistButton from "@/src/components/WishlistButton";
import BookCover from "@/src/components/BookCover";

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const book = await getBookById(id);

  if (!book) return notFound();

  const info = book.volumeInfo;
  const coverImage = info.imageLinks?.thumbnail || "";

  return (
    // LIGHT MODE: Using white and slate-50 backgrounds with dark text
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header session={session} />

      {/* 1. Cinematic Background Layer (Lightened) */}
      <div className="relative w-full h-[45vh] overflow-hidden bg-slate-100">
        {/* Blurred Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
          style={{ backgroundImage: `url('${coverImage}')` }}
        ></div>
        {/* Light Gradient Overlay - Fades from transparent to the page background color */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/60 to-white"></div>
      </div>

      {/* 2. Floating Content Layer */}
      <div className="container mx-auto px-4 -mt-64 relative z-10 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 px-4 py-2 rounded-full transition-all font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left: The Hero Cover */}
          <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start shrink-0">
            <div className="relative aspect-[2/3] w-64 lg:w-80 shadow-2xl rounded-xl overflow-hidden border border-slate-200 transform hover:scale-[1.01] transition-transform duration-500 bg-white">
              <BookCover url={coverImage} id={book.id} title={info.title} />
            </div>

            {/* Mobile Action Button */}
            <div className="mt-8 w-full max-w-xs lg:hidden">
              <WishlistButton book={book} isLoggedIn={!!session} />
            </div>
          </div>

          {/* Right: The Book Info */}
          <div className="flex-1 text-center lg:text-left space-y-8 pt-4 lg:pt-12">
            {/* Title Block */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {info.categories?.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold uppercase tracking-wider"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <h1 className="text-5xl lg:text-6xl font-serif font-extrabold text-slate-900 leading-tight">
                {info.title}
              </h1>

              <div className="flex flex-col lg:flex-row items-center gap-4 text-xl text-slate-600">
                <span className="flex items-center gap-2">
                  <User size={20} className="text-indigo-500" />
                  {info.authors?.join(", ") || "Unknown Author"}
                </span>
                {info.publishedDate && (
                  <>
                    <span className="hidden lg:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="flex items-center gap-2 opacity-80 font-medium">
                      <Calendar size={18} />{" "}
                      {info.publishedDate.substring(0, 4)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Desktop Action Button */}
            <div className="hidden lg:block">
              <WishlistButton book={book} isLoggedIn={!!session} />
            </div>

            {/* Synopsis / Description Section */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 flex items-center gap-3">
                <BookOpen className="text-indigo-500" /> Synopsis
              </h3>

              {/* High Contrast Text for Description */}
              <div
                className="text-lg text-slate-700 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{
                  __html:
                    info.description ||
                    "<p>No description available for this book.</p>",
                }}
              />

              <div className="mt-8 pt-6 border-t border-slate-200 flex gap-8 text-sm font-mono text-slate-500 font-bold">
                <div className="flex items-center gap-2">
                  <Layers size={16} />{" "}
                  {info.pageCount ? `${info.pageCount} Pages` : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
