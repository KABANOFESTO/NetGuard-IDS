"use client";

import { Bell, Clock3, Shield, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge, InfoList, PageHeader, Panel } from "@/components/portal/PortalUI";
import { useGetMyDetailsQuery, useUpdateProfileMutation } from "@/lib/redux/slices/AuthSlice";

export default function GuestProfileSettingsPage() {
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
    } catch (error: any) {
      toast.error(error?.data?.current_password?.[0] ?? error?.data?.new_password?.[0] ?? "Unable to update profile.");
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Guest Settings"
        title="Review your temporary access profile and guest-session rules."
        description="Guest settings are intentionally simpler than student or admin settings, focusing on session identity, validity, and communication."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Guest identity" description="Details associated with your temporary session.">
          <InfoList
            rows={[
              { label: "Name", value: user?.username ?? "Loading...", detail: "Temporary access account holder" },
              { label: "Contact email", value: user?.email ?? "Loading...", detail: "Used for guest account confirmation" },
              { label: "Role", value: user?.role ?? "Guest", detail: "Restricted network role", badge: <Badge tone="amber">{user?.status ?? "Temporary"}</Badge> },
            ]}
          />
        </Panel>

        <Panel title="Update guest profile" description="Keep guest identity details current while the session is active.">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} placeholder="Full name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" />
            <input value={form.telephone} onChange={(event) => setForm((current) => ({ ...current, telephone: event.target.value }))} placeholder="Telephone" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" />
            <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" />
            <input type="password" value={form.current_password} onChange={(event) => setForm((current) => ({ ...current, current_password: event.target.value }))} placeholder="Current password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" />
            <input type="password" value={form.new_password} onChange={(event) => setForm((current) => ({ ...current, new_password: event.target.value }))} placeholder="New password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" />
            <button type="submit" disabled={isLoading} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
              {isLoading ? "Saving..." : "Save changes"}
            </button>
          </form>
        </Panel>
      </div>

      <Panel title="Session preferences" description="Guest-specific controls and visibility options.">
        <div className="space-y-3">
          {[
            { icon: Clock3, title: "Auto-expiry awareness", text: "Temporary sessions remain time-bound and may close automatically based on policy." },
            { icon: Bell, title: "Session reminders", text: "Warnings can appear when the session is close to expiry or restricted activity is detected." },
            { icon: Shield, title: "Restricted privileges", text: "Guest access stays isolated from protected university systems." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
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

      <Panel title="Guest account status">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Identity", value: user?.status ?? "Verified", tone: "bg-sky-50 text-sky-900" },
            { title: "Privilege level", value: "Limited", tone: "bg-amber-50 text-amber-900" },
            { title: "Network segment", value: "Guest zone", tone: "bg-emerald-50 text-emerald-900" },
          ].map((item) => (
            <div key={item.title} className={`rounded-2xl p-5 ${item.tone}`}>
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5" />
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
