import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "NetGuard | University Network Intrusion Monitoring",
  description:
    "NetGuard is a university network security platform for monitoring traffic, detecting unauthorized access, and alerting IT staff in real time.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen bg-[#07111d] text-white`}
    >
      <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_36%),linear-gradient(180deg,#07111d_0%,#091827_50%,#07111d_100%)]">
        <Header />
        <main className="pt-28 sm:pt-32">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
