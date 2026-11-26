import { MobileMenu } from "@/components/layout/MobileMenu";
import { AccountLink } from "@/components/layout/AccountLink";
import { NavLinks } from "@/components/layout/NavLinks";
import { Wordmark } from "@/components/layout/Wordmark";
import { LinkButton } from "@/components/ui/Button";
import type { SiteSettingsData } from "@/lib/settings";

export function Header({ settings }: { settings: SiteSettingsData }) {
  return (
    <header className="sticky top-0 z-50 bg-cream/85 backdrop-blur-md border-b border-cocoa/[0.07]">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10 h-[72px] lg:h-20 flex items-center justify-between gap-6">
        <Wordmark brandName={settings.brandName} />

        <nav aria-label="Principal" className="hidden xl:flex items-center gap-6">
          <NavLinks />
        </nav>

        <div className="hidden xl:flex items-center gap-5">
          <AccountLink />
          <LinkButton href="/cursos-online" size="sm" className="px-5">
            Ver cursos
          </LinkButton>
        </div>

        <MobileMenu instagramUrl={settings.instagramUrl} brandName={settings.brandName} />
      </div>
    </header>
  );
}
