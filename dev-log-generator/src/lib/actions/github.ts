import { db } from "@/database/drizzle";
import { accounts } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

async function getGithubToken() {
    /* Await session obj from auth config then validate user sesh id */
    const session = await auth(); 
    if (!session?.user?.id) throw new Error("Unauthorized");

    /* Check if acc id matches sesh id and if provider is github. The obj holds the first row found with the bool match */
    const account = await db.query.accounts.findFirst({
        where: and(
            eq(accounts.userId, session.user.id),
            eq(accounts.provider, "github")
        )
    })

    /* the account row will contain a col called access_token */
    if (!account?.access_token) throw new Error("No GitHub token found");
    return account.access_token;
        
}

/* export makes it available for use elsewhere */
export async function fetchRepos(){
    const token = await getGithubToken();
    /* fetch repos from current acc */
    const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
    
    cache: "no-store", 
  });

  if (!res.ok) throw new Error("Failed to fetch repos");
  return res.json();
}

export async function fetchCommits(repoFullName: string) {
  const token = await getGithubToken();
  
  // Fetch the last 20 commits
  const res = await fetch(`https://api.github.com/repos/${repoFullName}/commits?per_page=20`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch commits");
  return res.json();
}