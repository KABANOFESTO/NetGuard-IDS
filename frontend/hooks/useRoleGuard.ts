"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useGetAccessContextQuery } from "@/lib/redux/slices/AuthSlice";
import type { UserRole } from "@/lib/redux/types/netguard";
import { clearAuthSession, getAccessToken, getDashboardPathForRole } from "@/lib/auth/session";

export function useRoleGuard(allowedRoles: UserRole[]) {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsInitialized(true);
  }, []);

  const query = useGetAccessContextQuery(
    hasToken ? {} : undefined,
    { skip: !isInitialized || !hasToken }
  );

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!hasToken) {
      router.replace("/auth");
    }
  }, [hasToken, isInitialized, router]);

  useEffect(() => {
    if (!query.isSuccess) {
      return;
    }

    const userRole = query.data?.user.role;

    if (query.data?.blocked) {
      clearAuthSession();
      router.replace("/auth");
      return;
    }

    if (userRole && !allowedRoles.includes(userRole)) {
      router.replace(getDashboardPathForRole(userRole));
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
    isLoading: !isInitialized || query.isLoading || query.isFetching,
    isAuthorized:
      query.isSuccess &&
      !query.data?.blocked &&
      !!query.data?.user.role &&
      allowedRoles.includes(query.data.user.role),
  };
}
