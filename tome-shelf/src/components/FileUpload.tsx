"use client";

import { IKImage, IKUpload, ImageKitProvider } from "@imagekit/next";
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

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <div className="form-control w-full max-w-xs">
        {/* Hidden Actual Input handled by SDK */}
        <IKUpload
          ref={uploadRef}
          onError={(err) => setError(err.message)}
          onSuccess={(res) => {
            setPath(res.filePath);
            onSuccess(res.filePath);
            setProgress(0);
          }}
          onUploadProgress={(evt) => {
            const p = Math.round((evt.loaded / evt.total) * 100);
            setProgress(p);
          }}
          className="hidden"
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
                <IKImage
                  path={path}
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
    </ImageKitProvider>
  );
}
