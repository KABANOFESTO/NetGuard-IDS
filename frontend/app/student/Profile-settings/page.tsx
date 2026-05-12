import { Bell, KeyRound, Lock, UserRound } from "lucide-react";
import { Badge, InfoList, PageHeader, Panel } from "@/components/portal/PortalUI";

export default function StudentProfileSettingsPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Student Settings"
        title="Update personal details and control your security preferences."
        description="These settings affect how your account interacts with NetGuard, especially device trust, account protection, and student notifications."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Profile details" description="Basic information used for student identity and access validation.">
          <InfoList
            rows={[
              { label: "Full name", value: "Claude Uwase", detail: "Student account holder" },
              { label: "University email", value: "claude.uwase@uok.ac.rw", detail: "Primary sign-in address" },
              { label: "Role", value: "Student", detail: "Campus network access profile", badge: <Badge tone="sky">Active</Badge> },
            ]}
          />
        </Panel>

        <Panel title="Security controls" description="Settings related to account protection and network access integrity.">
          <div className="space-y-3">
            {[
              { icon: KeyRound, title: "Password rotation", text: "Last changed 18 days ago. Recommended renewal every 90 days." },
              { icon: Lock, title: "Multi-step verification", text: "Enabled for student portal access from new devices." },
              { icon: Bell, title: "Alert notifications", text: "Receive advisories when login issues or new-device activity is detected." },
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

      <Panel title="Account status" description="Identity and network trust signals currently applied to your profile.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Identity", value: "Verified", tone: "bg-emerald-50 text-emerald-900" },
            { title: "Device trust", value: "Healthy", tone: "bg-sky-50 text-sky-900" },
            { title: "Restrictions", value: "None", tone: "bg-slate-100 text-slate-900" },
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
