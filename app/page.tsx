import { ExoPulseDashboard } from "@/components/exopulse-dashboard";
import { LandingHero } from "@/components/landing-hero";
import { ResearchPlatformSections } from "@/components/research-platform-sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getExoplanetDataset } from "@/lib/exoplanet-data";

export default function Page() {
  const dataset = getExoplanetDataset();

  return (
    <>
      <SiteHeader />
      <main>
        <LandingHero />
        <ResearchPlatformSections />
        <ExoPulseDashboard dataset={dataset} />
      </main>
      <SiteFooter />
    </>
  );
}