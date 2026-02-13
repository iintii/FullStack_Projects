"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/src/lib/actions/auth";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUp, null); //run server action after submission
  // state holds whatever your signUp function returns. If signUp returns { error: "User exists" }, then state.error automatically becomes "User exists". You use this to render the red alert box: {state?.error && ...}
  //formaction is the function you attach to the form's onSubmit. When the form is submitted, it calls formAction, which in turn calls signUp on the server with the form data.

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-base-100 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-bold text-center text-primary">
        Join Library
      </h1>

      <form action={formAction} className="space-y-4">
        {/* Full Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Full Name</span>
          </label>
          <input
            name="fullName"
            type="text"
            placeholder="John Doe"
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* University ID */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">University ID</span>
          </label>
          <input
            name="universityId"
            type="text"
            placeholder="123456"
            className="input input-bordered w-full"
            required
          />
        </div>

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
          {isPending ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/sign-in" className="link link-primary">
          Sign in
        </Link>
      </div>
    </div>
  );
}
