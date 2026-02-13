import Link from "next/link";
import { signOut } from "@/src/auth";
import { Session } from "next-auth";

export default function Header({ session }: { session: Session | null }) {
  return (
    <div className="navbar bg-base-100/70 backdrop-blur-lg border-b border-white/5 sticky top-0 z-50 px-8">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl text-primary font-bold">
          TomeShelf
        </Link>
      </div>
      <div className="flex-none gap-4">
        {session ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar placeholder"
            >
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span className="text-xs">
                  {session.user?.name?.slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <Link href="/my-profile" className="font-bold">
                  {session.user?.name}
                </Link>
              </li>
              <li>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button type="submit" className="text-error">
                    Logout
                  </button>
                </form>
              </li>
            </ul>
          </div>
        ) : (
          <Link href="/sign-in" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
