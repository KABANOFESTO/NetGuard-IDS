import { BadgeCheck, Eye, Users } from "lucide-react";

const audience = [
  {
    title: "Students and lecturers",
    description:
      "Access the university network with verified credentials while activity is monitored in the background for security and accountability.",
    icon: Users,
  },
  {
    title: "Guests",
    description:
      "Use temporary Wi-Fi with limited permissions so visitors stay connected without opening unnecessary risk to the wider network.",
    icon: BadgeCheck,
  },
  {
    title: "Admin and IT staff",
    description:
      "Receive live alerts, investigate incidents, review reports, and manually allow, restrict, or block suspicious users and devices.",
    icon: Eye,
  },
];

const highlights = [
  "Captures network activity, login behavior, and device identity",
  "Detects unauthorized access and abnormal usage patterns",
  "Supports both automated restriction and manual admin action",
  "Stores logs and reports for operational review and auditing",
];

export default function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">About NetGuard</p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white">
            A security platform designed around how university networks actually work.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-400">
            NetGuard was planned around the University of Kigali case study, where thousands of users, mixed access levels, and continuous connectivity make visibility and fast response essential.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6">
            <p className="text-lg leading-8 text-slate-300">
              The system collects logins, traffic activity, and device details, processes them through authentication and intrusion checks, then outputs alerts, reports, and access-control decisions through a clear admin dashboard.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {audience.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5"
              >
                <Icon className="h-5 w-5 text-sky-300" />
                <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
