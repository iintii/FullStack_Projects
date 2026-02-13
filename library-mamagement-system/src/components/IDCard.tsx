"use client";

import FileUpload from "./FileUpload";
import { IKImage } from "imagekitio-next";
import { updateUniversityCard } from "@/src/lib/actions/user";
import { useState } from "react";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

export default function IdCard({ currentCard }: { currentCard: string }) {
  const [card, setCard] = useState(currentCard);

  const handleUploadSuccess = async (filePath: string) => {
    setCard(filePath);
    await updateUniversityCard(filePath);
  };

  const hasValidCard = card && card !== "/placeholder-card.png";

  return (
    <div className="card bg-base-200/30 backdrop-blur-md shadow-xl border border-white/5 h-full">
      <div className="card-body items-center text-center">
        <h2 className="card-title mb-4">University ID</h2>

        {/* 1. Display Card (if valid) */}
        {hasValidCard ? (
          <div className="flex flex-col gap-2 mb-6">
            <div className="avatar">
              <div className="w-48 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-2">
                <IKImage
                  urlEndpoint={urlEndpoint}
                  path={card}
                  width={300}
                  height={200}
                  alt="University ID"
                />
              </div>
            </div>
            <div className="badge badge-success gap-2 mx-auto">
              ✓ Verified Student
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            <p className="text-sm opacity-50">No ID uploaded yet</p>
          </div>
        )}

        {/* 2. Upload Button (Always Visible) */}
        <div className="w-full mt-auto">
          <div className="divider text-xs opacity-50">
            {hasValidCard ? "Update Card" : "Action Required"}
          </div>
          <FileUpload onSuccess={handleUploadSuccess} />
          {hasValidCard && (
            <p className="text-xs text-base-content/50 mt-2">
              Uploading a new file will replace the current one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
