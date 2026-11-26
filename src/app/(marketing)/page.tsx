import { getSiteSettings } from "@/lib/settings";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { AcademySection } from "@/components/home/AcademySection";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTA } from "@/components/home/FinalCTA";

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Hero settings={settings} />
      <Marquee />
      <AcademySection />
      <Testimonials />
      <FAQSection />
      <FinalCTA settings={settings} />
    </>
  );
}
