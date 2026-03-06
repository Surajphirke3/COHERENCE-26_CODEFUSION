// src/app/(auth)/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/contexts/toast-context";
import Link from "next/link";

/* ──────────────────────── Schemas ──────────────────────── */

const SmtpSchema = z.object({
  provider: z.enum(["gmail", "custom"]),
  host: z.string().optional(),
  port: z.coerce.number().min(1).max(65535).optional(),
  user: z.string().optional(),
  pass: z.string().optional(),
  from: z.string().optional(),
});

const SafetySchema = z.object({
  dailyLimit: z.coerce.number().min(1).max(500),
  timeWindowStart: z.coerce.number().min(0).max(23),
  timeWindowEnd: z.coerce.number().min(0).max(23),
  pauseOnBounceRate: z.coerce.number().min(1).max(100),
});

type SmtpFormData = z.infer<typeof SmtpSchema>;
type SafetyFormData = z.infer<typeof SafetySchema>;

/* ──────────────────────── Steps ──────────────────────── */

const STEPS = [
  { label: "Email Provider", number: 1 },
  { label: "Safety Config", number: 2 },
  { label: "Done", number: 3 },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [smtpData, setSmtpData] = useState<SmtpFormData | null>(null);
  const [safetyData, setSafetyData] = useState<SafetyFormData | null>(null);

  return (
    <div>
      {/* Skip link */}
      <div className="mb-4 flex justify-end">
        <Link
          href="/"
          className="text-xs text-brand-500 hover:text-brand-300 transition"
        >
          Skip setup →
        </Link>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((s) => (
          <div key={s.number} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                step >= s.number
                  ? "bg-accent-500 text-white"
                  : "bg-brand-800 text-brand-500"
              }`}
            >
              {s.number}
            </div>
            {s.number < STEPS.length && (
              <div
                className={`h-0.5 w-8 rounded transition ${
                  step > s.number ? "bg-accent-500" : "bg-brand-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="mb-6 text-center text-sm text-brand-400">
        Step {step} of {STEPS.length} — {STEPS[step - 1].label}
      </p>

      {/* Step content */}
      {step === 1 && (
        <Step1EmailProvider
          onNext={(data) => {
            setSmtpData(data);
            setStep(2);
          }}
          onSkip={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2SafetyConfig
          onNext={(data) => {
            setSafetyData(data);
            setStep(3);
          }}
          addToast={addToast}
        />
      )}

      {step === 3 && (
        <Step3Done
          smtpData={smtpData}
          safetyData={safetyData}
          onGoToDashboard={() => router.push("/")}
        />
      )}
    </div>
  );
}

/* ──────────────── Step 1: Email Provider Setup ──────────────── */

function Step1EmailProvider({
  onNext,
  onSkip,
}: {
  onNext: (data: SmtpFormData) => void;
  onSkip: () => void;
}) {
  const { addToast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SmtpFormData>({
    resolver: zodResolver(SmtpSchema),
    defaultValues: {
      provider: "custom",
      host: "smtp.gmail.com",
      port: 587,
      user: "",
      pass: "",
      from: "",
    },
  });

  const provider = watch("provider");

  async function handleTestConnection() {
    setIsTesting(true);
    try {
      const res = await fetch("/api/ai/personalize", { method: "POST" });
      if (res.ok) {
        addToast("Connection test passed!", "success");
      } else {
        addToast("Connection test failed — you can fix this later.", "warning");
      }
    } catch {
      addToast("Could not test connection right now.", "warning");
    } finally {
      setIsTesting(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-white/10 bg-brand-800/50 px-3.5 py-2.5 text-sm text-white placeholder-brand-500 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500";

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      {/* Provider select */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-300">
          Provider
        </label>
        <select className={inputClasses} {...register("provider")}>
          <option value="gmail">Gmail OAuth (stub)</option>
          <option value="custom">Custom SMTP</option>
        </select>
      </div>

      {provider === "custom" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-300">
                Host
              </label>
              <input
                className={inputClasses}
                placeholder="smtp.gmail.com"
                {...register("host")}
              />
              {errors.host && (
                <p className="mt-1 text-xs text-danger-500">
                  {errors.host.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-300">
                Port
              </label>
              <input
                type="number"
                className={inputClasses}
                placeholder="587"
                {...register("port")}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-300">
              Username
            </label>
            <input
              className={inputClasses}
              placeholder="you@company.com"
              {...register("user")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-300">
              Password
            </label>
            <input
              type="password"
              className={inputClasses}
              placeholder="••••••••"
              {...register("pass")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-300">
              From Address
            </label>
            <input
              className={inputClasses}
              placeholder="OutreachAI <you@company.com>"
              {...register("from")}
            />
          </div>
        </>
      )}

      {/* Test connection */}
      <button
        type="button"
        onClick={handleTestConnection}
        disabled={isTesting}
        className="w-full rounded-lg border border-white/10 bg-brand-800 px-4 py-2 text-sm font-medium text-brand-300 transition hover:bg-brand-700 disabled:opacity-50"
      >
        {isTesting ? "Testing…" : "Test Connection"}
      </button>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-brand-400 transition hover:bg-brand-800"
        >
          Skip for now
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

/* ──────────────── Step 2: Safety Config ──────────────── */

function Step2SafetyConfig({
  onNext,
  addToast,
}: {
  onNext: (data: SafetyFormData) => void;
  addToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SafetyFormData>({
    resolver: zodResolver(SafetySchema),
    defaultValues: {
      dailyLimit: 80,
      timeWindowStart: 9,
      timeWindowEnd: 18,
      pauseOnBounceRate: 5,
    },
  });

  const dailyLimit = watch("dailyLimit");

  async function onSubmit(data: SafetyFormData) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/safety", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        addToast("Failed to save safety settings", "warning");
      }
    } catch {
      // Non-critical — user can update later
    } finally {
      setIsSubmitting(false);
      onNext(data);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-white/10 bg-brand-800/50 px-3.5 py-2.5 text-sm text-white placeholder-brand-500 outline-none transition focus:border-accent-500 focus:ring-1 focus:ring-accent-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Daily send limit */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-300">
          Daily send limit: <span className="text-accent-400">{dailyLimit}</span>
        </label>
        <input
          type="range"
          min="1"
          max="500"
          className="w-full accent-accent-500"
          {...register("dailyLimit")}
        />
        {errors.dailyLimit && (
          <p className="mt-1 text-xs text-danger-500">
            {errors.dailyLimit.message}
          </p>
        )}
      </div>

      {/* Time window */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-300">
            Start hour
          </label>
          <select className={inputClasses} {...register("timeWindowStart")}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-300">
            End hour
          </label>
          <select className={inputClasses} {...register("timeWindowEnd")}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pause-on-bounce-rate */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-300">
          Pause on bounce rate (%)
        </label>
        <input
          type="number"
          className={inputClasses}
          placeholder="5"
          {...register("pauseOnBounceRate")}
        />
        {errors.pauseOnBounceRate && (
          <p className="mt-1 text-xs text-danger-500">
            {errors.pauseOnBounceRate.message}
          </p>
        )}
      </div>

      {/* Tip */}
      <div className="rounded-lg border border-accent-500/20 bg-accent-500/5 p-3">
        <p className="text-xs text-accent-300">
          💡 <strong>Tip:</strong> Keeping limits conservative improves
          deliverability and protects your sender reputation.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-50"
      >
        {isSubmitting ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}

/* ──────────────── Step 3: Done ──────────────── */

function Step3Done({
  smtpData,
  safetyData,
  onGoToDashboard,
}: {
  smtpData: SmtpFormData | null;
  safetyData: SafetyFormData | null;
  onGoToDashboard: () => void;
}) {
  return (
    <div className="space-y-4 text-center">
      {/* Checkmark icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-success"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-white">You&apos;re all set!</h3>
      <p className="text-sm text-brand-400">
        Your workspace is configured and ready to go.
      </p>

      {/* Summary card */}
      <div className="rounded-lg border border-white/10 bg-brand-800/50 p-4 text-left text-sm">
        <h4 className="mb-2 font-medium text-brand-300">Configuration summary</h4>
        <ul className="space-y-1 text-brand-400">
          <li>
            📧 Email provider:{" "}
            <span className="text-white">
              {smtpData?.provider === "gmail" ? "Gmail OAuth" : smtpData?.host || "Not configured"}
            </span>
          </li>
          <li>
            📊 Daily limit:{" "}
            <span className="text-white">{safetyData?.dailyLimit ?? 80} emails</span>
          </li>
          <li>
            🕐 Time window:{" "}
            <span className="text-white">
              {(safetyData?.timeWindowStart ?? 9).toString().padStart(2, "0")}:00 –{" "}
              {(safetyData?.timeWindowEnd ?? 18).toString().padStart(2, "0")}:00
            </span>
          </li>
          <li>
            🛡️ Pause on bounce:{" "}
            <span className="text-white">{safetyData?.pauseOnBounceRate ?? 5}%</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onGoToDashboard}
        className="w-full rounded-lg bg-accent-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-600"
      >
        Go to Dashboard →
      </button>
    </div>
  );
}
