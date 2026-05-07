import AboutSection from "@/app/(landingpage)/About/page";
import ContactSection from "@/app/(landingpage)/Contact/page";
import FeaturesSection from "@/app/(landingpage)/Features/page";
import HeroSection from "@/app/(landingpage)/HeroSection/page";

export default function LandingPage() {
  return (
    <div className="netguard-shell">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ContactSection />
    </div>
  );
}
