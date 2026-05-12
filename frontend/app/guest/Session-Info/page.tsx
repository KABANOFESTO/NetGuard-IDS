import { CalendarClock, MapPin, ShieldCheck, Wifi } from "lucide-react";
import { Badge, DataTable, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";

export default function GuestSessionInfoPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Guest Session"
        title="View the details of your temporary access session."
        description="Guest sessions are monitored to protect the university network while still giving visitors practical internet access."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Wifi} label="Session state" value="Running" detail="Access remains active under guest policy." tone="emerald" />
        <StatCard icon={CalendarClock} label="Expiry window" value="12 hours" detail="Provisioned as a same-day guest session." tone="amber" />
        <StatCard icon={ShieldCheck} label="Security posture" value="Contained" detail="Session stays inside the guest network segment." tone="sky" />
      </div>

      <Panel title="Session record" description="Important details about your current and recent guest connections.">
        <DataTable
          columns={[
            { key: "session", label: "Session" },
            { key: "location", label: "Location" },
            { key: "started", label: "Started" },
            { key: "status", label: "Status" },
          ]}
          rows={[
            {
              session: "Visitor Wi-Fi Access",
              location: "Reception Lobby",
              started: "Today, 08:00 AM",
              status: <Badge tone="emerald">Active</Badge>,
            },
            {
              session: "Short reconnect",
              location: "Conference Hall",
              started: "Today, 10:32 AM",
              status: <Badge tone="sky">Tracked</Badge>,
            },
          ]}
        />
      </Panel>

      <Panel title="Coverage notes">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <MapPin className="h-5 w-5 text-sky-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Access zone</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Guest accounts are contained to reception, conference, and public campus areas where temporary access is expected.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Monitoring</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              NetGuard still tracks basic usage, session timing, and suspicious behavior even on restricted visitor access.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
