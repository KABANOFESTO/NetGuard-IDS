"use client";

import Link from "next/link";
import { Bell, RefreshCw, Search } from "lucide-react";
import { useState } from "react";

import { getProfilePathForRole } from "@/lib/auth/session";
import { useGetMyDetailsQuery } from "@/lib/redux/slices/AuthSlice";

type RoleNavbarProps = {
  onSearch: (query: string) => void;
  placeholder: string;
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

export default function RoleNavbar({
  onSearch,
  placeholder,
}: RoleNavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { data: userDetails, isFetching, refetch } = useGetMyDetailsQuery({});

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-xl flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            value={searchQuery}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearchQuery(nextValue);
              onSearch(nextValue);
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-600"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown((value) => !value)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                {initialsFromName(userDetails?.username)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {userDetails?.username ?? "NetGuard user"}
                </p>
                <p className="text-xs text-slate-500">
                  {userDetails?.role ?? "Account"}
                </p>
              </div>
            </button>

            {showUserDropdown ? (
              <div className="absolute right-0 mt-3 w-72 rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl">
                <div className="border-b border-slate-100 pb-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {userDetails?.username ?? "User"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {userDetails?.email ?? "No email available"}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {userDetails?.role ?? "Account"}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <Link
                    href={getProfilePathForRole(userDetails?.role)}
                    className="block rounded-2xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    View profile settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    Refresh profile data
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
