"use client";

import { addToLibrary } from "@/src/lib/actions/wishlist";
import { GoogleBookVolume } from "@/src/lib/types";
import { useState, useTransition } from "react";
import { Bookmark, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  book: GoogleBookVolume;
  isLoggedIn: boolean;
}

export default function WishlistButton({
  book,
  isLoggedIn,
}: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const router = useRouter();

  const handleAdd = () => {
    // 1. Session Check: Redirect if not logged in
    if (!isLoggedIn) {
      // Append callbackUrl so the user returns here after signing in
      router.push(`/sign-in?callbackUrl=/books/${book.id}`);
      return;
    }

    // 2. Logic for logged-in users
    startTransition(async () => {
      const result = await addToLibrary(book);
      if (result.success) {
        setStatus("success");
        router.refresh();
      } else {
        setStatus("error");
        // Reset error state after 2 seconds
        setTimeout(() => setStatus("idle"), 2000);
      }
    });
  };

  // Success State UI
  if (status === "success") {
    return (
      <button className="btn btn-success btn-lg gap-2 cursor-default w-full md:w-auto">
        <Check size={20} /> Added to Library
      </button>
    );
  }

  // Default / Pending / Error State UI
  return (
    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
      {status === "error" && (
        <span className="text-error text-sm font-bold">
          Already in library!
        </span>
      )}
      <button
        onClick={handleAdd}
        disabled={isPending}
        className="btn btn-primary btn-lg gap-2 w-full md:w-auto"
      >
        {isPending ? (
          <span className="loading loading-spinner"></span>
        ) : (
          <>
            <Bookmark size={20} /> Add to Library
          </>
        )}
      </button>
    </div>
  );
}
