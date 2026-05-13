"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User, X, type LucideIcon, LogOut } from "lucide-react";
import { useState } from "react";

import { clearAuthSession } from "@/lib/auth/session";
import { useGetMyDetailsQuery } from "@/lib/redux/slices/AuthSlice";

type SidebarItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type RoleSidebarProps = {
  items: SidebarItem[];
  accentClassName: string;
};

function initialsFromName(name?: string | null) {
  if (!name) {
    return "NG";
  }

  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function RoleSidebar({
  items,
  accentClassName,
}: RoleSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const { data: userDetails, isLoading, refetch } = useGetMyDetailsQuery({});

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/auth");
  };

  return (
    <div className="fixed z-[1000] h-screen w-[72%] md:w-64">
      <button
        onClick={() => setIsMobileOpen((value) => !value)}
        className="fixed right-2 top-4 z-50 rounded-md bg-slate-900 p-2 text-white md:hidden"
        aria-label="Toggle Menu"
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav
        className={`inset-y-0 left-0 flex h-full w-full flex-col justify-between bg-[#1f2940] transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                NetGuard
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                University Network Security
              </h2>
            </div>

            {isLoading ? (
              <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="h-4 w-24 rounded bg-white/10" />
                <div className="mt-2 h-3 w-16 rounded bg-white/10" />
              </div>
            ) : userDetails ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold text-white ${accentClassName}`}
                  >
                    {initialsFromName(userDetails.username)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {userDetails.username}
                    </p>
                    <p className="truncate text-xs text-slate-300">
                      {userDetails.role} account
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => refetch()}
                className="flex w-full items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-left text-slate-200"
              >
                <User size={18} />
                <span className="text-sm">Retry loading profile</span>
              </button>
            )}
          </div>

          <div className="flex-1 px-3 py-5">
            <ul className="space-y-1.5">
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <li key={item.title}>
                    <Link
                      href={item.url}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                        active
                          ? "bg-white text-slate-900"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => setConfirmingLogout(true)}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {confirmingLogout ? (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Logout from NetGuard?</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              You will need to sign in again to continue monitoring or using the network portal.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmingLogout(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
