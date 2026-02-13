"use client";

import { signInWithCredentials } from "@/src/lib/actions/auth";
import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    signInWithCredentials,
    null,
  );

  // Watch for success state to redirect
  useEffect(() => {
    if (state?.success) {
      router.push("/"); // Redirect to home/dashboard
      router.refresh(); // Ensure session cookies are recognized
    }
  }, [state?.success, router]);

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-base-100 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-bold text-center text-primary">
        Welcome Back
      </h1>

      <form action={formAction} className="space-y-4">
        {/* Email */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            name="email"
            type="email"
            placeholder="john@university.edu"
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Password */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Error Message */}
        {state?.error && (
          <div className="alert alert-error text-sm py-2">
            <span>{state.error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary w-full mt-4"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="text-center text-sm">
        New here?{" "}
        <Link href="/sign-up" className="link link-primary">
          Create an account
        </Link>
      </div>
    </div>
  );
}
