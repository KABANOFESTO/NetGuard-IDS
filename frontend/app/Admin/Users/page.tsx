"use client";

import { BadgeCheck, UserCog, Users, UserSearch } from "lucide-react";
import { toast } from "sonner";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import {
  useGetAllUsersQuery,
  useToggleUserActiveMutation,
} from "@/lib/redux/slices/AuthSlice";
import { formatNumber, statusTone } from "@/lib/portal/formatters";

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useGetAllUsersQuery();
  const [toggleUserActive, { isLoading: toggling }] = useToggleUserActiveMutation();

  const roleBreakdown = {
    students: users.filter((user) => user.role === "Student").length,
    lecturers: users.filter((user) => user.role === "Lecturer").length,
    guests: users.filter((user) => user.role === "Guest").length,
    admins: users.filter((user) => user.role === "Admin").length,
    active: users.filter((user) => user.status === "Active").length,
    flagged: users.filter((user) => user.status === "Inactive").length,
  };

  const handleToggle = async (userId: number) => {
    try {
      const response = await toggleUserActive(userId).unwrap();
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error?.data?.error ?? "Unable to change user status.");
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="User Management"
        title="Review role assignments, account state, and access readiness."
        description="This page supports the authentication and role-identification goals of NetGuard by giving administrators a clear, live directory of who can access the network and what state each account is in."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={formatNumber(users.length)} detail={`Students: ${formatNumber(roleBreakdown.students)}, lecturers: ${formatNumber(roleBreakdown.lecturers)}.`} tone="sky" />
        <StatCard icon={BadgeCheck} label="Active accounts" value={formatNumber(roleBreakdown.active)} detail={`Guests registered: ${formatNumber(roleBreakdown.guests)}.`} tone="emerald" />
        <StatCard icon={UserSearch} label="Flagged accounts" value={formatNumber(roleBreakdown.flagged)} detail="Inactive or restricted users that may require review." tone="amber" />
        <StatCard icon={UserCog} label="Admin accounts" value={formatNumber(roleBreakdown.admins)} detail="Privileged users with monitoring and response permissions." tone="violet" />
      </div>

      <Panel title="User directory" description="Live role-aware view of accounts, contact identity, and current access state.">
        {isLoading ? (
          <EmptyState
            title="Loading user directory"
            description="Fetching the latest university account records from the backend."
          />
        ) : users.length ? (
          <DataTable
            columns={[
              { key: "user", label: "User" },
              { key: "role", label: "Role" },
              { key: "contact", label: "Contact" },
              { key: "status", label: "Status" },
              { key: "action", label: "Action" },
            ]}
            rows={users.map((user) => ({
              user: (
                <div>
                  <p className="font-medium text-slate-900">{user.username}</p>
                  <p className="text-xs text-slate-500">ID #{user.id}</p>
                </div>
              ),
              role: user.role,
              contact: (
                <div>
                  <p>{user.email}</p>
                  <p className="text-xs text-slate-500">{user.telephone || user.location || "No extra profile details"}</p>
                </div>
              ),
              status: <Badge tone={statusTone(user.status)}>{user.status}</Badge>,
              action: (
                <button
                  type="button"
                  onClick={() => handleToggle(user.id)}
                  disabled={toggling || user.role === "Admin"}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {user.status === "Active" ? "Deactivate" : "Activate"}
                </button>
              ),
            }))}
          />
        ) : (
          <EmptyState
            title="No users found"
            description="The backend did not return any user accounts yet."
          />
        )}
      </Panel>
    </div>
  );
}
