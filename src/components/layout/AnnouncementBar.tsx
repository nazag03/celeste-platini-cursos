import type { SiteSettingsData } from "@/lib/settings";

export function AnnouncementBar({ settings }: { settings: SiteSettingsData }) {
  if (!settings.announcementIsActive || !settings.announcementText) return null;

  return (
    <div className="bg-cocoa text-cream text-center text-[12px] tracking-[0.12em] py-2.5 px-4">
      <p className="truncate">
        <span aria-hidden className="text-blush mr-2">✦</span>
        {settings.announcementText}
        <span aria-hidden className="text-blush ml-2">✦</span>
      </p>
    </div>
  );
}
