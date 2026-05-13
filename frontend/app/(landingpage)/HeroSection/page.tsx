import Link from "next/link";
import { ArrowRight, BellRing, Cpu, ShieldCheck } from "lucide-react";


const pillars = [
  {
    icon: ShieldCheck,
    title: "Role-based access control",
    description:
      "Students, lecturers, guests, and administrators are validated before access is granted.",
  },
  {
    icon: Cpu,
    title: "Real-time intrusion intelligence",
    description:
      "The platform watches logins, devices, traffic, and abnormal behavior as incidents develop.",
  },
  {
    icon: BellRing,
    title: "Immediate operational response",
    description:
      "Alerts reach the admin dashboard fast so suspicious users or devices can be restricted quickly.",
  },
];


export default function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="netguard-grid absolute inset-0 opacity-40" />
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 pb-20 pt-14 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Detect unauthorized access before it disrupts the campus network.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              NetGuard is a university network monitoring platform built for real-world operations. It authenticates users, identifies devices, watches live traffic, detects suspicious behavior, and gives IT staff a clear response path from alert to action.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22c55e,#0ea5e9)] px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(14,165,233,0.18)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                Explore More
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:border-emerald-300/35 hover:bg-white/10"
              >
                Contact project team
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* <img
              src="/assets/hero-image.png"
              alt="Illustration of NetGuard's monitoring dashboard with alert notifications and network activity graphs."
              className="w-full rounded-3xl border border-white/8 bg-white/[0.04] object-cover shadow-lg backdrop-blur-sm"
            />
            <div className="absolute inset-0 rounded-3xl border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm text-slate-300">
              <h2 className="mb-2 text-lg font-semibold text-white">Live Threat Lanes</h2>
              <div className="space-y-2">
                {threatLanes.map(([threat, severity, color]) => (
                  <div key={threat} className={`flex items-center justify-between rounded-md px-3 py-2 ${color}`}>
                    <span>{threat}</span>
                    <span className="ml-4 inline-flex h-6 items-center rounded-full bg-white/20 px-2 text-xs font-medium text-white">{severity}</span>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm">
              <div className="inline-flex rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-3 text-emerald-200">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
