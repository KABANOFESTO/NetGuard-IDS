"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useGetMyDetailsQuery } from "@/lib/redux/slices/AuthSlice";
import type { UserRole } from "@/lib/redux/types/netguard";
import { clearAuthSession, getAccessToken, getDashboardPathForRole } from "@/lib/auth/session";

export function useRoleGuard(allowedRoles: UserRole[]) {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
  }, []);

  const query = useGetMyDetailsQuery(
    hasToken ? {} : undefined,
    { skip: !hasToken }
  );

  useEffect(() => {
    if (!hasToken) {
      router.replace("/auth");
    }
  }, [hasToken, router]);

  useEffect(() => {
    if (!query.isSuccess) {
      return;
    }

    if (!allowedRoles.includes(query.data.role)) {
      router.replace(getDashboardPathForRole(query.data.role));
    }
  }, [allowedRoles, query.data, query.isSuccess, router]);

  useEffect(() => {
    if (!query.isError) {
      return;
    }

    clearAuthSession();
    router.replace("/auth");
  }, [query.isError, router]);

  return {
    ...query,
    isAuthorized:
      query.isSuccess && allowedRoles.includes(query.data.role),
  };
}
