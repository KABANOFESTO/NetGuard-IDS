"use client";

import { Bell, KeyRound, Lock, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge, InfoList, PageHeader, Panel } from "@/components/portal/PortalUI";
import { useGetMyDetailsQuery, useUpdateProfileMutation } from "@/lib/redux/slices/AuthSlice";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export default function StudentProfileSettingsPage() {
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
        eyebrow="Student Settings"
        title="Update personal details and control your security preferences."
        description="These settings affect how your account interacts with NetGuard, especially device trust, account protection, and student notifications."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Profile details" description="Basic information used for identity and access validation.">
          <InfoList
            rows={[
              { label: "Full name", value: user?.username ?? "Loading...", detail: "Account holder" },
              { label: "University email", value: user?.email ?? "Loading...", detail: "Primary sign-in address" },
              { label: "Role", value: user?.role ?? "Student", detail: "Campus network access profile", badge: <Badge tone="sky">{user?.status ?? "Active"}</Badge> },
            ]}
          />
        </Panel>

        <Panel title="Update settings" description="Keep your contact details and password current.">
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

      <Panel title="Security controls">
        <div className="space-y-3">
          {[
            { icon: KeyRound, title: "Password rotation", text: "Refresh your password whenever you suspect unusual activity or shared access risk." },
            { icon: Lock, title: "Device awareness", text: "Keep an eye on which devices appear in your monitored device list." },
            { icon: Bell, title: "Alert visibility", text: "Student notices are derived from your own suspicious or restricted network activity." },
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

      <Panel title="Account status" description="Identity and network trust signals currently applied to your profile.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Identity", value: user?.status ?? "Verified", tone: "bg-emerald-50 text-emerald-900" },
            { title: "Device trust", value: "Tracked", tone: "bg-sky-50 text-sky-900" },
            { title: "Restrictions", value: user?.status === "Inactive" ? "Possible" : "None", tone: "bg-slate-100 text-slate-900" },
          ].map((item) => (
            <div key={item.title} className={`rounded-2xl p-5 ${item.tone}`}>
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5" />
                <div>
                  <p className="text-sm">{item.title}</p>
                  <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
