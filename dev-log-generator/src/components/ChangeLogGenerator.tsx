"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Sparkles, Loader2, Save, FileText, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { saveChangelog } from "@/lib/actions/changelog";

type Commit = {
  sha: string;
  commit: {
    message: string;
  };
};

export default function ChangelogGenerator({
  commits,
  repo,
}: {
  commits: Commit[];
  repo: string;
}) {
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/generate",
    streamProtocol: "text",
    onError: (err) => {
      console.error("Stream Error:", err);
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const handleSave = async () => {
    if (!completion || !repo) return;

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const result = await saveChangelog(repo, completion);

      if (result?.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Save Error:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    setSaveStatus("idle");

    const commitData = commits
      .map((item) => `- [${item.sha.substring(0, 7)}] ${item.commit.message}`)
      .join("\n");

    await complete(commitData);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-200 p-6 rounded-2xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Commit History</h1>
          <p className="text-sm opacity-70">
            Showing latest {commits.length} commits
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || commits.length === 0}
          className="btn btn-primary gap-2 shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {isLoading ? "Generating..." : "Generate Changelog"}
        </button>
      </div>

      {(completion || isLoading) && (
        <div className="card bg-base-200/50 border border-primary/20 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>

          <div className="card-body">
            <div className="flex items-center gap-2 mb-4 text-primary font-bold border-b border-base-300 pb-4">
              <FileText size={20} />
              <h2>AI Generated Changelog</h2>
            </div>

            <div className="prose prose-sm md:prose-base max-w-none">
              {completion ? (
                <ReactMarkdown>{completion}</ReactMarkdown>
              ) : (
                <div className="flex items-center gap-3 text-base-content/50">
                  <span className="loading loading-dots loading-md"></span>
                  Reading commits and writing changelog...
                </div>
              )}
            </div>

            {!isLoading && completion && (
              <div className="card-actions justify-end mt-6 pt-4 border-t border-base-300 items-center gap-3">
                {saveStatus === "error" && (
                  <span className="text-error text-sm">Failed to save</span>
                )}

                {saveStatus === "success" && (
                  <span className="text-success text-sm flex items-center gap-1">
                    <Check size={16} />
                    Saved!
                  </span>
                )}

                <button
                  onClick={handleSave}
                  disabled={isSaving || saveStatus === "success"}
                  className={`btn btn-sm gap-2 ${
                    saveStatus === "success"
                      ? "btn-success text-white"
                      : "btn-outline"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving
                    ? "Saving..."
                    : saveStatus === "success"
                    ? "Saved"
                    : "Save to Database"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}