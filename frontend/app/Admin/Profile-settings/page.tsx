import { Bell, KeyRound, Shield, UserCog } from "lucide-react";
import { Badge, InfoList, PageHeader, Panel } from "@/components/portal/PortalUI";

export default function AdminProfileSettingsPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin Settings"
        title="Manage the administrator profile and operational security preferences."
        description="Admin settings are higher-impact because these users can review incidents, change access decisions, and oversee protected systems."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Administrator identity" description="Core profile values used for privileged access validation.">
          <InfoList
            rows={[
              { label: "Administrator", value: "Network Operations Lead", detail: "Primary IT security operator" },
              { label: "Email", value: "netops@uok.ac.rw", detail: "Official admin communications channel" },
              { label: "Role", value: "Admin", detail: "Privileged response authority", badge: <Badge tone="rose">Privileged</Badge> },
            ]}
          />
        </Panel>

        <Panel title="Security preferences" description="Important protections applied to privileged accounts.">
          <div className="space-y-3">
            {[
              { icon: KeyRound, title: "Strong authentication", text: "High-trust credentials and regular password rotation are enforced for admin access." },
              { icon: Shield, title: "Sensitive action confirmation", text: "High-risk response actions should require additional review or confirmation." },
              { icon: Bell, title: "Critical alert notifications", text: "Immediate dashboard visibility is required for severe intrusion events." },
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
      </div>

      <Panel title="Admin trust state">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Privilege review", value: "Up to date", tone: "bg-emerald-50 text-emerald-900" },
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
