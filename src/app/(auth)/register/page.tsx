// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/contexts/toast-context";

const RegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    workspaceName: z
      .string()
      .min(2, "Workspace name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          workspaceName: data.workspaceName,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        addToast(result.error || "Registration failed", "error");
        return;
      }

      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        addToast("Account created. Please sign in to continue.", "warning");
        router.push("/login");
        return;
      }

      addToast("Account created! Let's get you set up.", "success");
      router.push("/onboarding");
    } catch {
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-white/10 bg-brand-800/50 px-3.5 py-2.5 text-sm text-white placeholder-brand-500 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500";

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-white">
        Create your account
      </h2>
      <p className="mb-6 text-sm text-brand-400">
        Get started with Chronos in seconds
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-brand-300"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            className={inputClasses}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-danger-500">
              {errors.name.message}
            </p>
          )}
        </div>

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
            className={inputClasses}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Workspace name */}
        <div>
          <label
            htmlFor="workspaceName"
            className="mb-1.5 block text-sm font-medium text-brand-300"
          >
            Workspace name
          </label>
          <input
            id="workspaceName"
            type="text"
            placeholder="Acme Corp"
            className={inputClasses}
            {...register("workspaceName")}
          />
          {errors.workspaceName && (
            <p className="mt-1 text-xs text-danger-500">
              {errors.workspaceName.message}
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
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClasses}
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-brand-300"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClasses}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-danger-500">
              {errors.confirmPassword.message}
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
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-accent-400 hover:text-accent-300 transition"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
