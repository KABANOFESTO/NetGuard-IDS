'use client';

import Link from 'next/link';
import { Shield, X, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Home', href: '#home', id: 'home' },
  { label: 'Overview', href: '#about', id: 'about' },
  { label: 'Features', href: '#features', id: 'features' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.25, 0.5, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    setMenuOpen(false);
    setActiveSection(targetId);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div
        className={`mx-auto max-w-7xl rounded-full border transition-all duration-300 ${
          isScrolled
            ? 'border-white/12 bg-slate-950/75 shadow-[0_20px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl'
            : 'border-white/10 bg-slate-950/45 backdrop-blur-lg'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3 lg:px-7">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left"
            aria-label="Scroll to top"
          >
            <div className="rounded-2xl border border-emerald-300/20 bg-[linear-gradient(135deg,#22c55e,#0ea5e9)] p-2 text-slate-950 shadow-[0_10px_30px_rgba(14,165,233,0.22)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="font-[family:var(--font-space-grotesk)] text-base font-semibold tracking-[-0.03em] text-white">
                NetGuard
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Campus Intrusion Monitoring
              </p>
            </div>
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map(({ label, href, id }) => {
              const isActive = activeSection === id;
              return (
                <a
                  key={id}
                  href={href}
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavClick(id);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="#about"
              className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
            >
              View overview
            </Link>
            <Link
              href="#contact"
              className="rounded-full bg-[linear-gradient(135deg,#22c55e,#0ea5e9)] px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
            >
              Contact IT use case
            </Link>
          </div>

          <button
            className="inline-flex rounded-xl border border-white/12 bg-white/5 p-2 text-slate-200 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 px-5 pb-5 pt-3 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map(({ label, href, id }) => {
                const isActive = activeSection === id;
                return (
                  <a
                    key={id}
                    href={href}
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavClick(id);
                    }}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {label}
                  </a>
                );
              })}
              <Link
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-2xl bg-[linear-gradient(135deg,#22c55e,#0ea5e9)] px-4 py-3 text-center text-sm font-semibold text-slate-950"
              >
                Contact IT use case
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
