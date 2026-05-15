import { fetchRepos, fetchCommits } from "@/lib/actions/github";
import Link from "next/link";
import { GitCommit } from "lucide-react";
import ChangelogGenerator from "@/components/ChangeLogGenerator";

type SearchParams = Promise<{ repo?: string }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedParams = await searchParams;
  const selectedRepo = resolvedParams.repo;

  const reposPromise = fetchRepos();
  const commitsPromise = selectedRepo
    ? fetchCommits(selectedRepo)
    : Promise.resolve([] as any[]);

  const [repos, commits] = await Promise.all([reposPromise, commitsPromise]);

  return (
    <div className="flex w-full h-[calc(100vh-4rem)]">
      {/* Left Sidebar: Repository List */}
      <aside className="w-72 bg-base-200/50 border-r border-base-300 overflow-y-auto hidden md:block">
        <div className="p-4 sticky top-0 bg-base-200/90 backdrop-blur-sm z-10 border-b border-base-300">
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-60">
            Your Repositories
          </h2>
        </div>

        <ul className="menu w-full p-2 gap-1">
          {repos.map((repo: any) => {
            const isSelected = selectedRepo === repo.full_name;

            return (
              <li key={repo.id}>
                <Link
                  href={`/dashboard?repo=${repo.full_name}`}
                  className={isSelected ? "active font-medium" : ""}
                >
                  <span className="truncate">{repo.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Right Content Area: Commits */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {!selectedRepo ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <GitCommit size={64} className="opacity-20" />
            <h3 className="text-xl font-bold">Select a repository</h3>
            <p>Choose a repo from the sidebar to view its commits.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Repo Header + AI Generator */}
            <div className="bg-base-200 p-6 rounded-2xl border border-base-300 shadow-sm space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{selectedRepo}</h1>
                <p className="text-sm opacity-70">Showing latest 20 commits</p>
              </div>

              <ChangelogGenerator commits={commits} repo={selectedRepo} />
            </div>

            {/* Commits List */}
            <div className="space-y-4">
              {commits.map((item: any) => (
                <div
                  key={item.sha}
                  className="card bg-base-100 border border-base-300 shadow-sm"
                >
                  <div className="card-body p-4 flex-row gap-4 items-start">
                    <div className="mt-1 opacity-50">
                      <GitCommit size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base-content whitespace-pre-wrap break-words leading-tight">
                        {item.commit.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs opacity-60">
                        <span className="flex items-center gap-1">
                          <img
                            src={item.author?.avatar_url || "https://github.com/ghost.png"}
                            className="w-4 h-4 rounded-full"
                            alt="author"
                          />
                          {item.commit.author.name}
                        </span>

                        <span>•</span>
                        <span>
                          {new Date(item.commit.author.date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="font-mono">
                          {item.sha.substring(0, 7)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}