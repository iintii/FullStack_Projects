import { auth } from "@/src/auth";
import { db } from "@/src/database/drizzle";
import { books, wishlist, users } from "@/src/database/schema";
import { eq, desc } from "drizzle-orm";
import Header from "@/src/components/Header";
import { redirect } from "next/navigation";
import Link from "next/link";

import BookActions from "@/src/components/BookActions";
import BookCover from "@/src/components/BookCover"; // Ensure this is imported
import IdCard from "@/src/components/IDCard";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const myBooks = await db
    .select({
      bookId: wishlist.bookId,
      status: wishlist.status,
      rating: wishlist.rating,
      addedAt: wishlist.addedAt,
      title: books.title,
      author: books.author,
      coverUrl: books.coverUrl,
    })
    .from(wishlist)
    .innerJoin(books, eq(wishlist.bookId, books.id))
    .where(eq(wishlist.userId, session.user.id))
    .orderBy(desc(wishlist.addedAt));

  // Calculate stats
  const totalBooks = myBooks.length;
  const completedBooks = myBooks.filter((b) => b.status === "completed").length;
  const readingBooks = myBooks.filter((b) => b.status === "reading").length;

  return (
    <main className="min-h-screen bg-base-100 font-sans selection:bg-primary selection:text-primary-content">
      <Header session={session} />

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Profile Header Stats */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-base-content mb-2">
              My Library
            </h1>
            <p className="text-base-content/60">
              Welcome back, {session.user.name}
            </p>
          </div>
          <div className="flex gap-4 md:ml-auto">
            <div className="stats shadow bg-base-200/50 border border-white/5">
              <div className="stat place-items-center px-6">
                <div className="stat-title text-xs uppercase tracking-wider opacity-60">
                  Total
                </div>
                <div className="stat-value text-primary text-2xl">
                  {totalBooks}
                </div>
              </div>
              <div className="stat place-items-center px-6">
                <div className="stat-title text-xs uppercase tracking-wider opacity-60">
                  Read
                </div>
                <div className="stat-value text-secondary text-2xl">
                  {completedBooks}
                </div>
              </div>
              <div className="stat place-items-center px-6">
                <div className="stat-title text-xs uppercase tracking-wider opacity-60">
                  Reading
                </div>
                <div className="stat-value text-accent text-2xl">
                  {readingBooks}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Sidebar: ID Card */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <IdCard currentCard={user.universityCard} />
            </div>
          </div>

          {/* Right Content: Bookshelf */}
          <div className="lg:col-span-9 space-y-6">
            {/* Section Title */}
            <div className="flex items-center gap-4 pb-2 border-b border-base-content/10">
              <h2 className="text-xl font-bold uppercase tracking-widest text-base-content/70">
                Recent Additions
              </h2>
            </div>

            {myBooks.length === 0 ? (
              <div className="hero bg-base-200/50 rounded-3xl border border-dashed border-base-content/20 p-12">
                <div className="hero-content text-center">
                  <div className="max-w-md">
                    <h3 className="text-2xl font-bold opacity-50 mb-4">
                      Your shelf is empty
                    </h3>
                    <Link href="/" className="btn btn-primary btn-outline">
                      Discover Your First Book
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myBooks.map((item) => (
                  <div
                    key={item.bookId}
                    className="card md:card-side bg-base-200/40 hover:bg-base-200 transition-all duration-300 border border-white/5 group"
                  >
                    {/* Cover Image */}
                    <figure className="relative w-full md:w-48 h-64 md:h-auto overflow-hidden">
                      {/* Gradient overlay for text contrast on mobile */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:hidden z-10" />
                      <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-500">
                        <BookCover
                          url={item.coverUrl || ""}
                          id={item.bookId}
                          title={item.title}
                        />
                      </div>
                      {/* Floating Badge on Image */}
                      <div className="absolute top-2 left-2 z-20">
                        <div
                          className={`badge ${item.status === "completed" ? "badge-success" : item.status === "reading" ? "badge-warning" : "badge-neutral"} badge-sm uppercase font-bold tracking-wider shadow-lg`}
                        >
                          {item.status?.replace(/_/g, " ")}
                        </div>
                      </div>
                    </figure>

                    {/* Card Content */}
                    <div className="card-body p-6 md:w-2/3 justify-between">
                      <div>
                        <Link
                          href={`/books/${item.bookId}`}
                          className="hover:underline decoration-primary underline-offset-4"
                        >
                          <h3 className="card-title text-2xl font-serif font-bold text-base-content mb-1 leading-tight">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-base-content/60 font-medium">
                          {item.author}
                        </p>

                        <div className="text-xs text-base-content/40 mt-3 font-mono">
                          Added:{" "}
                          {item.addedAt
                            ? new Date(item.addedAt).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>

                      {/* Interactive Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-6 pt-6 border-t border-base-content/5">
                        {/* Rating Component */}
                        <div className="w-full sm:w-auto">
                          <BookActions
                            bookId={item.bookId}
                            initialStatus={item.status || "want_to_read"}
                            initialRating={item.rating}
                          />
                        </div>

                        <Link
                          href={`/books/${item.bookId}`}
                          className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
