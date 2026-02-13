//displays the raw data from Google Books. It handles missing covers
import { GoogleBookVolume } from "@/src/lib/types";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function BookSearchResult({ book }: { book: GoogleBookVolume }) {
  const info = book.volumeInfo;
  const image = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-200 h-full">
      <figure className="px-4 pt-4 bg-base-200 h-64 flex items-center justify-center relative group">
        {image ? (
          <img
            src={image}
            alt={info.title}
            className="rounded-lg h-56 w-auto object-cover shadow-md group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-56 w-40 bg-base-300 rounded-lg flex flex-col items-center justify-center text-base-content/30">
            <BookOpen size={40} />
            <span className="text-xs mt-2">No Cover</span>
          </div>
        )}
      </figure>
      <div className="card-body p-5">
        <h2
          className="card-title text-lg leading-tight line-clamp-2"
          title={info.title}
        >
          {info.title}
        </h2>
        <p className="text-sm text-primary font-medium">
          {info.authors?.slice(0, 2).join(", ") || "Unknown Author"}
        </p>

        <div className="flex justify-between items-end mt-4">
          <span className="text-xs opacity-50">
            {info.publishedDate?.substring(0, 4) || "N/A"}
          </span>
          {/* We will add the 'Add to Wishlist' button here in the next phase */}
          <Link
            href={`/books/${book.id}`}
            className="btn btn-sm btn-outline btn-primary"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
