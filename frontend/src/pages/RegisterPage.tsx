import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(10, "Password must contain at least 10 characters.")
    .max(72, "Password cannot exceed 72 characters."),
  acceptTerms: z.boolean().refine((value) => value, {
    message: "You must accept the terms to continue.",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: createAccount } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError("");

    try {
      await createAccount({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Your account has been created. Please log in.",
        },
      });
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Get started with PayFlow. It only takes a few minutes."
      footer={
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="fullName"
          label="Full name"
          type="text"
          placeholder="Enter your full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2 text-xs leading-5 text-slate-500">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-emerald-600"
              {...register("acceptTerms")}
            />
            <span>I agree to the terms of service and privacy policy.</span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>
          )}
        </div>

        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold shadow-lg shadow-emerald-600/15 hover:bg-emerald-700"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
          {!isSubmitting && <ArrowRight size={18} />}
        </Button>
      </form>
    </AuthLayout>
  );
}
