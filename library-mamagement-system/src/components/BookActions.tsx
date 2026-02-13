"use client";

import { updateBookProgress } from "@/src/lib/actions/wishlist";
import { useState, useTransition, useEffect } from "react";

interface BookActionsProps {
  bookId: string;
  initialStatus: string;
  initialRating: number | null;
}

export default function BookActions({
  bookId,
  initialStatus,
  initialRating,
}: BookActionsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [rating, setRating] = useState<string | number>(initialRating || "");
  const [isPending, startTransition] = useTransition();

  // Handle Status Change
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    const numericRating =
      typeof rating === "string" ? parseFloat(rating) : rating;

    // Wrap in async and await so the return type of the arrow function is Promise<void>
    startTransition(async () => {
      await updateBookProgress(bookId, newStatus, numericRating || 0);
    });
  };

  // Handle Rating Change (On Blur/Enter to save database writes)
  const handleRateSubmit = () => {
    let num = parseFloat(rating.toString());

    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 10) num = 10;

    num = Math.round(num * 100) / 100;

    setRating(num || "");

    // Wrap in async and await here as well
    startTransition(async () => {
      await updateBookProgress(bookId, status, num);
    });
  };

  return (
    <div className="flex flex-col gap-2 min-w-[140px]">
      {/* 1. Status Dropdown */}
      <select
        className="select select-bordered select-xs w-full max-w-xs"
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isPending}
      >
        <option value="want_to_read">Want to Read</option>
        <option value="reading">Currently Reading</option>
        <option value="completed">Completed</option>
      </select>

      {/* 2. Decimal Score Input (Only show if not 'Want to Read') */}
      {status !== "want_to_read" && (
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs font-bold opacity-70">Score:</span>
          <input
            type="number"
            min="1"
            max="10"
            step="0.01" // Allows 8.55, 9.99
            placeholder="-"
            className="input input-xs input-bordered w-16 text-center font-mono"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            onBlur={handleRateSubmit} // Save when user clicks away
            onKeyDown={(e) => e.key === "Enter" && handleRateSubmit()} // Save on Enter
            disabled={isPending}
          />
          <span className="text-xs opacity-50">/10</span>
        </div>
      )}
    </div>
  );
}
