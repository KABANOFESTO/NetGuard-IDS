import { Bell, Clock3, Shield, UserRound } from "lucide-react";
import { Badge, InfoList, PageHeader, Panel } from "@/components/portal/PortalUI";

export default function GuestProfileSettingsPage() {
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
              { label: "Name", value: "Visitor Account", detail: "Provisioned by campus reception" },
              { label: "Contact email", value: "guest.visitor@example.com", detail: "Used for temporary access confirmation" },
              { label: "Role", value: "Guest", detail: "Restricted network role", badge: <Badge tone="amber">Temporary</Badge> },
            ]}
          />
        </Panel>

        <Panel title="Session preferences" description="Guest-specific controls and visibility options.">
          <div className="space-y-3">
            {[
              { icon: Clock3, title: "Auto-expiry", text: "Temporary sessions close automatically when the allowed access window ends." },
              { icon: Bell, title: "Session reminders", text: "Warnings can be shown as the remaining connection window becomes short." },
              { icon: Shield, title: "Restricted privileges", text: "Guest access remains isolated from protected university systems." },
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
      </div>

      <Panel title="Guest account status">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Identity", value: "Verified at issuance", tone: "bg-sky-50 text-sky-900" },
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
