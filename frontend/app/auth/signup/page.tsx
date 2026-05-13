"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Shield, User2, Wifi } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useRegisterMutation } from "@/lib/redux/slices/AuthSlice";

const signupRoles = [
  { value: "Student", label: "Student" },
  { value: "Lecturer", label: "Lecturer" },
  { value: "Guest", label: "Guest" },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Student" as "Student" | "Lecturer" | "Guest",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await register(form).unwrap();
      toast.success("Account created successfully. You can sign in now.");
      router.push("/auth");
    } catch (error: any) {
      const payload = error?.data;
      const message =
        typeof payload === "string"
          ? payload
          : payload?.email?.[0] ??
            payload?.password?.[0] ??
            payload?.detail ??
            "Unable to create your account right now.";
      toast.error(message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08111f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#0ea5e940,transparent_32%),radial-gradient(circle_at_bottom_right,#34d39935,transparent_30%),linear-gradient(145deg,#08111f,#111f35_52%,#172b45)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1fr_1fr]">
        <section className="hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="inline-flex items-center gap-3 text-white">
            <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-200">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">NetGuard Access</p>
              <h1 className="mt-1 text-2xl font-semibold">Create a monitored account</h1>
            </div>
          </Link>

          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-200">Role-aware onboarding</p>
            <h2 className="mt-5 text-5xl font-semibold leading-tight text-white">
              Register for safe university access with the role that fits how you use the network.
            </h2>
            <p className="mt-6 text-base leading-8 text-slate-200">
              Students and lecturers get monitored academic access. Guests receive time-bound restricted connectivity. Admin accounts remain controlled separately by IT staff.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                icon: Wifi,
                title: "Safer onboarding",
                text: "Every account is tied to a role so monitoring and access control make sense from day one.",
              },
              {
                icon: User2,
                title: "Clear permissions",
                text: "Students, lecturers, and guests each land in a portal designed for their allowed visibility.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <Icon className="h-5 w-5 text-emerald-200" />
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/95 p-7 shadow-2xl shadow-black/20 backdrop-blur md:p-10">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Create account</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                Sign up for NetGuard
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Choose the role that matches your network access needs. Admin accounts are provisioned separately by IT staff.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Full name
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <User2 className="h-4 w-4 text-slate-400" />
                  <input
                    id="username"
                    required
                    value={form.username}
                    onChange={(event) => handleChange("username", event.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    placeholder="name@university.edu"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(event) => handleChange("role", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  {signupRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(event) => handleChange("password", event.target.value)}
                    placeholder="Create a strong password"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-slate-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-8 rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4">
              <p className="text-sm text-emerald-900">
                Already have credentials?{" "}
                <Link href="/auth" className="font-semibold underline decoration-emerald-300 underline-offset-4">
                  Return to sign in
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
