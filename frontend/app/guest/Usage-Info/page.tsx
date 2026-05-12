import { BarChart3, Clock3, Download, Upload } from "lucide-react";
import { InfoList, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";

export default function GuestUsageInfoPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Guest Usage"
        title="See how your temporary session is being used."
        description="Guest usage visibility helps visitors understand their limits while giving the university a safer temporary-access model."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BarChart3} label="Total usage" value="842 MB" detail="Combined browsing and media traffic today." />
        <StatCard icon={Clock3} label="Session duration" value="3h 18m" detail="Time elapsed since the guest session began." tone="sky" />
        <StatCard icon={Download} label="Download" value="731 MB" detail="Public web and document retrieval traffic." tone="emerald" />
        <StatCard icon={Upload} label="Upload" value="111 MB" detail="Messaging, forms, and small cloud sync actions." tone="violet" />
      </div>

      <Panel title="Usage breakdown" description="A simple summary of how the guest account is using the network.">
        <InfoList
          rows={[
            {
              label: "Top category",
              value: "Web browsing",
              detail: "Most traffic comes from general internet access and external websites.",
            },
            {
              label: "Streaming controls",
              value: "Limited quality allowance",
              detail: "Heavy bandwidth services may be deprioritized during peak academic hours.",
            },
            {
              label: "Restricted access",
              value: "Internal systems blocked",
              detail: "Administrative, research, and protected university services remain inaccessible.",
            },
          ]}
        />
      </Panel>
    </div>
  );
}
