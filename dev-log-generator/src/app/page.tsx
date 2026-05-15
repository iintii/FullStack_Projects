import { Terminal } from "lucide-react";
import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // If already logged in, send them straight to the dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <div className="text-center space-y-4 max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full border border-primary/20">
            <Terminal size={48} className="text-primary" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight text-base-content">
          AI Changelog Generator
        </h1>
        
        <p className="text-xl text-base-content/70">
          Turn your messy Git commits into beautiful, human-readable release notes in seconds.
        </p>
      </div>

      <div className="card w-full max-w-md bg-base-200 shadow-xl mt-8 border border-base-300">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-lg">Connect to continue</h2>
          <p className="text-sm opacity-70 mb-4">We need access to your repositories to fetch commits.</p>
          
          <form
            className="w-full"
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          > {/* Handoff point to Auth.js for oAuth. Signin is imported from "@/auth" */}
            <button type="submit" className="btn btn-neutral w-full gap-3">
              {/* Standard GitHub SVG directly embedded */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
