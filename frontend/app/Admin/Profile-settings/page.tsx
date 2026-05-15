"use client";

import { Bell, KeyRound, Shield, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge, InfoList, PageHeader, Panel } from "@/components/portal/PortalUI";
import { useGetMyDetailsQuery, useUpdateProfileMutation } from "@/lib/redux/slices/AuthSlice";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export default function AdminProfileSettingsPage() {
  const { data: user } = useGetMyDetailsQuery({});
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [form, setForm] = useState({
    username: "",
    telephone: "",
    location: "",
    current_password: "",
    new_password: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((current) => ({
      ...current,
      username: user.username ?? "",
      telephone: user.telephone ?? "",
      location: user.location ?? "",
    }));
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await updateProfile(form).unwrap();
      toast.success("Profile updated successfully.");
      setForm((current) => ({ ...current, current_password: "", new_password: "" }));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update profile."));
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin Settings"
        title="Manage your administrator profile and operational security preferences."
        description="Admin settings are high impact because these users can review incidents, change access decisions, and oversee protected systems."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Administrator identity" description="Live profile values used for privileged access validation.">
          <InfoList
            rows={[
              { label: "Administrator", value: user?.username ?? "Loading...", detail: "Primary security operator profile" },
              { label: "Email", value: user?.email ?? "Loading...", detail: "Official admin communications channel" },
              { label: "Role", value: user?.role ?? "Admin", detail: "Privileged response authority", badge: <Badge tone="rose">Privileged</Badge> },
            ]}
          />
        </Panel>

        <Panel title="Profile update" description="Keep contact details and account credentials current.">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="Full name"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
            <input
              value={form.telephone}
              onChange={(event) => setForm((current) => ({ ...current, telephone: event.target.value }))}
              placeholder="Telephone"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
            <input
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Location"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
            <input
              type="password"
              value={form.current_password}
              onChange={(event) => setForm((current) => ({ ...current, current_password: event.target.value }))}
              placeholder="Current password"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
            <input
              type="password"
              value={form.new_password}
              onChange={(event) => setForm((current) => ({ ...current, new_password: event.target.value }))}
              placeholder="New password"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Save changes"}
            </button>
          </form>
        </Panel>
      </div>

      <Panel title="Security preferences">
        <div className="space-y-3">
          {[
            { icon: KeyRound, title: "Strong authentication", text: "Privileged accounts should rotate passwords and avoid shared credentials." },
            { icon: Shield, title: "Sensitive action awareness", text: "Device blocks, alert resolution, and user changes are all recorded in the audit log." },
            { icon: Bell, title: "Critical alert notifications", text: "Dashboard visibility and email notifications support rapid admin response." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Admin trust state">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Privilege review", value: user?.status ?? "Active", tone: "bg-emerald-50 text-emerald-900" },
            { title: "Session policy", value: "Strict", tone: "bg-rose-50 text-rose-900" },
            { title: "Notification mode", value: "Immediate", tone: "bg-sky-50 text-sky-900" },
          ].map((item) => (
            <div key={item.title} className={`rounded-2xl p-5 ${item.tone}`}>
              <div className="flex items-center gap-3">
                <UserCog className="h-5 w-5" />
                <div>
                  <p className="text-sm">{item.title}</p>
                  <p className="mt-1 text-xl font-semibold">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
