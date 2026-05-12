import { BadgeCheck, UserCog, Users, UserSearch } from "lucide-react";
import { Badge, DataTable, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="User Management"
        title="Review user roles, identity state, and network access behavior."
        description="This page aligns with the authentication and role-identification goals of NetGuard. It helps the admin team understand who is accessing the network and whether their behavior is normal."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value="5,000+" detail="Students, lecturers, guests, and administrators." tone="sky" />
        <StatCard icon={BadgeCheck} label="Verified accounts" value="4,917" detail="Users matching expected identity records." tone="emerald" />
        <StatCard icon={UserSearch} label="Accounts flagged" value="23" detail="Users with unusual access or repeated failures." tone="amber" />
        <StatCard icon={UserCog} label="Admins online" value="6" detail="Privileged users currently logged in." tone="violet" />
      </div>

      <Panel title="User directory snapshot" description="A role-aware view of current user state.">
        <DataTable
          columns={[
            { key: "user", label: "User" },
            { key: "role", label: "Role" },
            { key: "access", label: "Access pattern" },
            { key: "status", label: "Status" },
          ]}
          rows={[
            {
              user: "Alice Mukamana",
              role: "Student",
              access: "Normal daily academic usage",
              status: <Badge tone="emerald">Healthy</Badge>,
            },
            {
              user: "Jean Bosco",
              role: "Guest",
              access: "Attempted restricted service access",
              status: <Badge tone="amber">Limited</Badge>,
            },
            {
              user: "Network Ops",
              role: "Admin",
              access: "Repeated failed sign-ins from unfamiliar device",
              status: <Badge tone="rose">Investigate</Badge>,
            },
          ]}
        />
      </Panel>
    </div>
  );
}
