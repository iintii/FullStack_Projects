"use client";

import { Image, upload } from "@imagekit/next";
import { useRef, useState } from "react";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

interface FileUploadProps {
  onSuccess: (filePath: string) => void;
}

export default function FileUpload({ onSuccess }: FileUploadProps) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [path, setPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authenticator = async () => {
    try {
      const response = await fetch("/api/imagekit/auth");
      if (!response.ok) throw new Error("Auth failed");
      const data = await response.json();
      return data;
    } catch (e) {
      throw new Error(`Authentication request failed: ${e}`);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      
      if (!publicKey) {
        throw new Error("Public key is not configured");
      }

      const auth = await authenticator();
      
      const uploadResponse = await upload({
        file,
        fileName: file.name,
        publicKey,
        signature: auth.signature,
        token: auth.token,
        expire: auth.expire,
        folder: auth.folder,
        onProgress: (event: ProgressEvent) => {
          if (event.total > 0) {
            const p = Math.round((event.loaded / event.total) * 100);
            setProgress(p);
          }
        },
      });

      if (uploadResponse.filePath) {
        setPath(uploadResponse.filePath);
        onSuccess(uploadResponse.filePath);
        setProgress(0);
      } else {
        throw new Error("Upload failed: no file path returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <div className="form-control w-full max-w-xs">
      {/* Hidden File Input */}
      <input
        ref={uploadRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Custom UI Trigger */}
      <button
        className="btn btn-outline btn-primary w-full"
        onClick={(e) => {
          e.preventDefault();
          uploadRef.current?.click();
        }}
      >
        {progress > 0 && progress < 100 ? (
          <span className="loading loading-spinner"></span>
        ) : (
          "Upload ID Card"
        )}
      </button>

      {progress > 0 && progress < 100 && (
        <progress
          className="progress progress-primary w-full mt-2"
          value={progress}
          max="100"
        ></progress>
      )}

      {path && (
        <div className="mt-4">
          <p className="text-success text-sm mb-2">Upload Complete!</p>
          <div className="avatar">
            <div className="w-24 rounded">
              <Image
                src={path}
                width={200}
                height={200}
                alt="Uploaded ID"
              />
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}
