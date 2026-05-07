import {
  Activity,
  AlertTriangle,
  Blocks,
  ChartNoAxesCombined,
  CheckCircle2,
  Database,
  LockKeyhole,
  Network,
  UserCog,
  Wifi,
} from "lucide-react";

const featureCards = [
  {
    icon: LockKeyhole,
    title: "Authentication and role validation",
    copy:
      "Allow users to log in, validate their credentials, and identify whether they are students, lecturers, guests, or administrators.",
  },
  {
    icon: Wifi,
    title: "Device identification",
    copy:
      "Capture IP and MAC address data, compare it against known devices, and flag unregistered endpoints on the network.",
  },
  {
    icon: Activity,
    title: "Real-time monitoring",
    copy:
      "Track login attempts, user activity, and data usage continuously so the system can react the moment risk appears.",
  },
  {
    icon: AlertTriangle,
    title: "Intrusion detection",
    copy:
      "Detect invalid login attempts, suspicious behavior, access to restricted areas, and abnormal usage patterns automatically.",
  },
  {
    icon: Database,
    title: "Logging and reporting",
    copy:
      "Store activity logs, intrusion records, and reports in the database for analysis, review, and operational reporting.",
  },
  {
    icon: UserCog,
    title: "Admin dashboard",
    copy:
      "Present alerts, user management, reports, and response controls in one dashboard built for the IT team.",
  },
];

const architecture = [
  {
    icon: Network,
    title: "Data collection layer",
    copy: "Collects network traffic, login activity, and device information from the university environment.",
  },
  {
    icon: Blocks,
    title: "Detection engine",
    copy: "Analyzes both known attack patterns and abnormal behavior that may indicate an intrusion.",
  },
  {
    icon: Database,
    title: "Secure database",
    copy: "Stores user information, logs, alerts, and historical reports for later review.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Admin interface",
    copy: "Shows real-time alerts, reports, and operational tools for monitoring and response.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Input and collection",
    text: "Users connect, submit credentials, and generate device and traffic data that the system captures in real time.",
  },
  {
    step: "02",
    title: "Analysis and detection",
    text: "The engine validates identity, checks behavior, and detects suspicious actions such as repeated failed logins or unknown devices.",
  },
  {
    step: "03",
    title: "Output and response",
    text: "Admins receive alerts, reports are stored, and access can be granted, denied, or restricted based on policy.",
  },
];

export default function FeaturesSection() {
  return (
    <>
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">Features</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
              The operational features behind monitoring, detection, and response.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-400">
            This section translates your requirements into a real product story, so users can understand not just what the project is, but how it helps an IT team work better.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map(({ icon: Icon, title, copy }) => (
            <article
              key={title}
              className="group rounded-[28px] border border-white/8 bg-white/[0.03] p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-emerald-300/20"
            >
              <div className="inline-flex rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-emerald-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(6,12,24,0.86),rgba(8,17,29,0.96))] p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Architecture</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
              Four layers working together from data capture to admin decision.
            </h2>
            <div className="mt-8 space-y-4">
              {architecture.map(({ icon: Icon, title, copy }) => (
                <div key={title} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-3 text-emerald-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-400">{copy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/8 bg-white/[0.04] p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">Workflow</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
              A simple three-stage flow from input to secure output.
            </h2>
            <div className="mt-10 space-y-5">
              {workflow.map(({ step, title, text }) => (
                <div key={step} className="rounded-[24px] border border-white/8 bg-slate-950/45 p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl font-semibold tracking-[-0.05em] text-white/85">{step}</div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-400">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] border border-emerald-300/15 bg-emerald-400/10 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-200" />
                <p className="text-sm leading-7 text-emerald-50/90">
                  In normal conditions, access is allowed. During suspicious activity, the system flags the event, alerts the admin, and supports blocking or restriction immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
