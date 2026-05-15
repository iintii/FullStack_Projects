// Update your imports at the top
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { LogOut, Terminal, History, PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      {/* Navbar */}
      <div className="navbar bg-base-200 border-b border-base-300 px-4 md:px-8">
        <div className="flex-1 gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold mr-4">
            <Terminal size={24} className="text-primary" />
            DevChangelog
          </Link>
          
          {/* NEW: Navigation Links */}
          <div className="hidden md:flex gap-2">
            <Link href="/dashboard" className="btn btn-ghost btn-sm gap-2">
              <PlusCircle size={16} /> New
            </Link>
            <Link href="/dashboard/history" className="btn btn-ghost btn-sm gap-2">
              <History size={16} /> History
            </Link>
          </div>
        </div>
        
        {/* ... Rest of your existing Right Side Navbar code (Avatar & Logout) ... */}
        <div className="flex-none gap-4">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-8 rounded-full border border-base-300">
                <img src={session.user.image || ""} alt={session.user.name || "User"} />
              </div>
            </div>
            <span className="text-sm font-medium hidden md:block">{session.user.name}</span>
          </div>

          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}>
            <button className="btn btn-ghost btn-sm text-error gap-2">
              <LogOut size={16} /> <span className="hidden md:block">Logout</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}