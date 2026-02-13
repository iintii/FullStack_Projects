import Link from "next/link";

// Define strict type for the prop based on our schema
interface BookProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
  coverColor: string;
  availableCopies: number;
  totalCopies: number;
}

export default function BookCard({ book }: { book: BookProps }) {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-200 border border-base-200">
      <figure className="px-4 pt-4 bg-base-200 h-64 flex items-center justify-center">
        {/* We use a simple img tag for now to avoid Next.js Image config setup for external URLs just yet */}
        <img
          src={book.coverUrl}
          alt={book.title}
          className="rounded-xl h-56 w-auto object-cover shadow-lg"
          style={{ borderColor: book.coverColor }}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-lg">
          {book.title}
          <div className="badge badge-secondary badge-outline text-xs">
            {book.genre}
          </div>
        </h2>
        <p className="text-sm text-gray-500">by {book.author}</p>

        <div className="flex justify-between items-center mt-4">
          <div
            className={`badge ${isAvailable ? "badge-success" : "badge-error"} gap-2`}
          >
            {book.availableCopies} / {book.totalCopies} Available
          </div>
          <Link href={`/books/${book.id}`} className="btn btn-primary btn-sm">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
