import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { changelogs } from "@/database/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Calendar, GitBranch, FileText } from "lucide-react"; // Swapped Github for GitBranch
import ReactMarkdown from "react-markdown";
import CopyButton from "@/components/CopyButton"; // Imported our new Client Component

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Fetch all changelogs for this specific user, newest first
  const myChangelogs = await db.query.changelogs.findMany({
    where: eq(changelogs.userId, session.user.id),
    orderBy: [desc(changelogs.createdAt)],
  });

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 w-full">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="text-primary" size={28} />
            Saved Changelogs
          </h1>
          <p className="text-base-content/70">
            A history of all your generated release notes.
          </p>
        </div>

        {/* Empty State */}
        {myChangelogs.length === 0 ? (
          <div className="text-center py-20 bg-base-200/50 rounded-2xl border border-dashed border-base-300">
            <h3 className="text-xl font-bold opacity-50 mb-2">No changelogs yet</h3>
            <p className="opacity-50">Generate your first changelog to see it here.</p>
          </div>
        ) : (
          /* Grid of Saved Changelogs */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {myChangelogs.map((log) => (
              <div key={log.id} className="card bg-base-200 border border-base-300 shadow-xl max-h-[500px] flex flex-col">
                
                {/* Card Header */}
                <div className="card-body p-5 flex-none border-b border-base-300 bg-base-300/30">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title text-lg flex items-center gap-2">
                      <GitBranch size={18} /> {/* Using GitBranch safely */}
                      {log.repository}
                    </h2>
                  </div>
                  <p className="text-xs opacity-60 flex items-center gap-1 mt-2">
                    <Calendar size={14} />
                    {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : "Unknown date"}
                  </p>
                </div>

                {/* Card Content (Markdown Preview) */}
                <div className="card-body p-5 overflow-y-auto prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{log.content}</ReactMarkdown>
                </div>
                
                {/* Card Footer with our new Client Component */}
                <div className="card-body p-4 flex-none border-t border-base-300 bg-base-300/30">
                  <div className="card-actions justify-end w-full">
                    <CopyButton text={log.content} />
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}