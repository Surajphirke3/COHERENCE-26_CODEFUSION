// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/contexts/toast-context";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        addToast("Invalid credentials", "error");
        return;
      }

      addToast("Welcome back!", "success");
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl || "/campaigns");
    } catch {
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-white">Welcome back</h2>
      <p className="mb-6 text-sm text-brand-400">
        Sign in to your Chronos account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-brand-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full rounded-lg border border-white/10 bg-brand-800/50 px-3.5 py-2.5 text-sm text-white placeholder-brand-500 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-brand-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-white/10 bg-brand-800/50 px-3.5 py-2.5 text-sm text-white placeholder-brand-500 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-accent-400 hover:text-accent-300 transition"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
