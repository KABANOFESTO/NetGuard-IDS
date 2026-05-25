"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, UserCog, Users, UserSearch } from "lucide-react";
import { toast } from "sonner";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useToggleUserActiveMutation,
} from "@/lib/redux/slices/AuthSlice";
import { formatNumber, statusTone } from "@/lib/portal/formatters";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useGetAllUsersQuery();
  const [toggleUserActive, { isLoading: toggling }] = useToggleUserActiveMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "Admin" | "Student" | "Lecturer" | "Guest">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const byRole = roleFilter === "All" ? true : user.role === roleFilter;
      const byStatus = statusFilter === "All" ? true : user.status === statusFilter;
      const bySearch =
        searchTerm.trim().length === 0
          ? true
          : `${user.username} ${user.email} ${user.employee_id ?? ""}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
      return byRole && byStatus && bySearch;
    });
  }, [users, roleFilter, statusFilter, searchTerm]);

  const roleBreakdown = {
    students: filteredUsers.filter((user) => user.role === "Student").length,
    lecturers: filteredUsers.filter((user) => user.role === "Lecturer").length,
    guests: filteredUsers.filter((user) => user.role === "Guest").length,
    admins: filteredUsers.filter((user) => user.role === "Admin").length,
    active: filteredUsers.filter((user) => user.status === "Active").length,
    flagged: filteredUsers.filter((user) => user.status === "Inactive").length,
  };

  const handleToggle = async (userId: number) => {
    try {
      const response = await toggleUserActive(userId).unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to change user status."));
    }
  };

  const handleDelete = async (userId: number, username: string) => {
    const confirmed = window.confirm(`Delete user "${username}" permanently? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteUser(userId).unwrap();
      toast.success(response.message || "User deleted successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete this user."));
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
        <StatCard icon={Users} label="Total users" value={formatNumber(filteredUsers.length)} detail={`Students: ${formatNumber(roleBreakdown.students)}, lecturers: ${formatNumber(roleBreakdown.lecturers)}.`} tone="sky" />
        <StatCard icon={BadgeCheck} label="Active accounts" value={formatNumber(roleBreakdown.active)} detail={`Guests registered: ${formatNumber(roleBreakdown.guests)}.`} tone="emerald" />
        <StatCard icon={UserSearch} label="Flagged accounts" value={formatNumber(roleBreakdown.flagged)} detail="Inactive or restricted users that may require review." tone="amber" />
        <StatCard icon={UserCog} label="Admin accounts" value={formatNumber(roleBreakdown.admins)} detail="Privileged users with monitoring and response permissions." tone="violet" />
      </div>

      <Panel title="User directory" description="Live role-aware view of accounts, contact identity, and current access state.">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by username, email, employee ID"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as "All" | "Admin" | "Student" | "Lecturer" | "Guest")}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="All">All roles</option>
            <option value="Admin">Admin</option>
            <option value="Student">Student</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Guest">Guest</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "All" | "Active" | "Inactive")}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="All">All status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {isLoading ? (
          <EmptyState
            title="Loading user directory"
            description="Fetching the latest university account records from the backend."
          />
        ) : filteredUsers.length ? (
          <DataTable
            columns={[
              { key: "user", label: "User" },
              { key: "role", label: "Role" },
              { key: "contact", label: "Contact" },
              { key: "status", label: "Status" },
              { key: "action", label: "Actions" },
            ]}
            rows={filteredUsers.map((user) => ({
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
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(user.id)}
                    disabled={toggling || deleting || !user.can_toggle_active}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {user.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id, user.username)}
                    disabled={deleting || toggling || !user.can_delete}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              ),
            }))}
          />
        ) : (
          <EmptyState
            title="No users found"
            description="No users match the selected filters."
          />
        )}
      </Panel>
    </div>
  );
}
