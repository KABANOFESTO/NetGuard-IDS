"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, Shield, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getAccessToken,
  getDashboardPathForRole,
  getStoredUser,
  persistAuthSession,
} from "@/lib/auth/session";
import { useLoginMutation } from "@/lib/redux/slices/AuthSlice";

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (getAccessToken()) {
      router.replace(getDashboardPathForRole(getStoredUser()?.role));
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await login({ email, password }).unwrap();
      persistAuthSession(response);
      toast.success(`Welcome back, ${response.user.username}.`);
      router.push(getDashboardPathForRole(response.user.role));
    } catch (error: any) {
      const message =
        error?.data?.error ??
        error?.data?.detail ??
        "Unable to sign in. Please check your credentials and try again.";
      toast.error(message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08111f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#0ea5e940,transparent_32%),radial-gradient(circle_at_bottom_right,#fb718540,transparent_30%),linear-gradient(145deg,#08111f,#111f35_52%,#172b45)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <div className="rounded-2xl bg-sky-500/20 p-3 text-sky-200">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-200">NetGuard</p>
                <h1 className="mt-1 text-2xl font-semibold">University Network Defense</h1>
              </div>
            </Link>
          </div>

          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-200">Secure access</p>
            <h2 className="mt-5 text-5xl font-semibold leading-tight text-white">
              Real-time monitoring, intrusion detection, and guided response for campus networks.
            </h2>
            <p className="mt-6 text-base leading-8 text-slate-200">
              Sign in to monitor users, review devices, investigate suspicious behavior, or manage your own network footprint based on your role.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                icon: Wifi,
                title: "Monitor access",
                text: "Track live sessions, logins, and device activity across the university network.",
              },
              {
                icon: Shield,
                title: "Detect threats",
                text: "Surface suspicious usage, repeated failed logins, and unknown devices early.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <Icon className="h-5 w-5 text-sky-200" />
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/95 p-7 shadow-2xl shadow-black/20 backdrop-blur md:p-10">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Welcome back</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                Sign in to NetGuard
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Use your university or guest credentials to access the portal that matches your role.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@university.edu"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link href="/auth/forgot" className="text-sm text-sky-700 hover:text-sky-800">
                    Forgot password?
                  </Link>
                </div>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <LockKeyhole className="h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
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
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-8 rounded-[24px] border border-sky-100 bg-sky-50 px-5 py-4">
              <p className="text-sm text-sky-900">
                Need a student, lecturer, or guest account?{" "}
                <Link href="/auth/signup" className="font-semibold underline decoration-sky-300 underline-offset-4">
                  Create one here
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
