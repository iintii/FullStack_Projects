"use client";

import { BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

interface BookCoverProps {
  url?: string;
  id: string;
  title: string;
}

export default function BookCover({ url, id, title }: BookCoverProps) {
  // Use a key-based approach or reset state when ID changes
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  // Sync state when props change
  useEffect(() => {
    const initialUrl = url?.replace("http://", "https://") || null;
    setImageSrc(initialUrl);
    setHasFailed(false);
  }, [url, id]);

  const handleError = () => {
    if (imageSrc?.includes("content?id=")) {
      setHasFailed(true);
    } else {
      // Fallback Strategy
      const fallbackUrl = `https://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
      setImageSrc(fallbackUrl);
    }
  };

  if (hasFailed || !imageSrc) {
    return (
      <div className="w-full h-full bg-base-300 flex flex-col items-center justify-center text-base-content/30 rounded-lg min-h-[160px] border border-base-content/5">
        <BookOpen size={40} />
        <span className="text-xs mt-2 text-center px-2 font-medium">
          No Cover
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={title}
      className="w-full h-full object-cover rounded-lg shadow-md transition-opacity duration-300"
      onError={handleError}
      referrerPolicy="no-referrer"
      loading="lazy"
    />
  );
}
