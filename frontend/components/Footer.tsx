import Link from 'next/link';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';

const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Overview', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Contact', href: '#contact' },
];

const outputs = ['Alerts', 'Reports', 'Access control', 'Admin visibility'];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/8 bg-slate-950/55">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.6fr_0.9fr] lg:px-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-300/20 bg-[linear-gradient(135deg,#22c55e,#0ea5e9)] p-2 text-slate-950">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-[family:var(--font-space-grotesk)] text-lg font-semibold text-white">NetGuard</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                University Network Security
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
            A professional landing experience for a campus intrusion monitoring platform that authenticates users, detects suspicious activity, and helps IT teams respond in real time.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Quick links</h3>
          <div className="mt-4 flex flex-col gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Project focus</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {outputs.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-6 space-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-emerald-300" />
              <span>admin@netguard-uok.rw</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-emerald-300" />
              <span>+250 788 000 000</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-emerald-300" />
              <span>University of Kigali case study</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>{year} NetGuard. Designed for real-world academic network security use.</p>
          <p>Monitoring. Detection. Response.</p>
        </div>
      </div>
    </footer>
  );
}
