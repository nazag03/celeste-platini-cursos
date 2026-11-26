import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import type { SiteSettingsData } from "@/lib/settings";


function HeroTitle({ text }: { text: string }) {
  const i = text.indexOf(",");
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i + 1)}{" "}
      <em className="italic font-normal text-cocoa-light [box-decoration-break:clone] bg-[linear-gradient(var(--color-blush),var(--color-blush))] bg-no-repeat bg-[length:100%_0.3em] bg-[position:0_88%]">
        {text.slice(i + 1).trim()}
      </em>
    </>
  );
}


function RotatingSeal() {
  return (
    <div className="absolute -left-6 bottom-10 sm:-left-10 lg:-left-14 h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-cocoa text-cream grid place-items-center shadow-xl shadow-cocoa/20">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_22s_linear_infinite]" aria-hidden>
        <defs>
          <path id="seal-circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-current" style={{ fontSize: "8px", letterSpacing: "0.22em" }}>
          <textPath href="#seal-circle">CURSOS ONLINE · PASTELERÍA · </textPath>
        </text>
      </svg>
      <span className="font-brand text-3xl leading-none text-blush" aria-hidden>
        CP
      </span>
    </div>
  );
}

export function Hero({ settings }: { settings: SiteSettingsData }) {
  const title = "Aprendé pastelería, a tu ritmo y desde tu casa";

  return (
    <section className="relative overflow-hidden grain">
      
      <div aria-hidden className="pointer-events-none absolute -top-32 right-[-10%] h-[42rem] w-[42rem] rounded-full bg-blush/45 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-[-12rem] left-[-8rem] h-[26rem] w-[26rem] rounded-full bg-blush/25 blur-3xl" />

      <div className="relative mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10 grid lg:grid-cols-12 gap-14 lg:gap-10 items-center pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="lg:col-span-6 xl:col-span-6 order-2 lg:order-1">
          <p className="rise inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-cocoa/70">
            <span aria-hidden className="h-px w-10 bg-blush-deep" />
            {settings.location ?? "San Francisco, Córdoba"}
          </p>
          <h1 className="rise rise-delay-1 font-display text-[2.9rem] sm:text-6xl xl:text-[5.2rem] leading-[0.98] text-cocoa mt-6 max-w-xl">
            <HeroTitle text={title} />
          </h1>
          <p className="rise rise-delay-2 mt-8 text-base sm:text-lg text-ink/70 max-w-md leading-relaxed">
            Cursos online de pastelería con Celeste Platini. Pagás con Mercado Pago y
            accedés al material al instante.
          </p>
          <div className="rise rise-delay-3 mt-10 flex flex-wrap items-center gap-4">
            <LinkButton href="/cursos-online" size="lg">
              Ver cursos online
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </LinkButton>
            <LinkButton href="/sobre-celeste" variant="secondary" size="lg">
              Conocer a Celeste
            </LinkButton>
          </div>

          <dl className="rise rise-delay-3 mt-14 grid grid-cols-3 max-w-md border-t border-cocoa/10 pt-6 text-cocoa">
            {[
              ["Online", "desde tu casa"],
              ["A tu ritmo", "sin horarios"],
              ["Acceso", "inmediato"],
            ].map(([a, b]) => (
              <div key={a} className="pr-4">
                <dt className="font-brand text-[1.7rem] leading-none">{a}</dt>
                <dd className="mt-1.5 text-xs text-ink/55 tracking-wide">{b}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-6 xl:col-span-5 xl:col-start-8 order-1 lg:order-2 relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 arch border border-blush-deep/60" />
          <div className="rise relative aspect-[4/5] arch overflow-hidden bg-blush shadow-2xl shadow-cocoa/15">
            {settings.heroImageUrl ? (
              <Image
                src={settings.heroImageUrl}
                alt="Creación de pastelería de Celeste Platini"
                fill
                priority
                quality={95}
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover object-top"
              />
            ) : (
              <PlaceholderImage label="Fotografía principal pendiente de carga" tone="rose" className="absolute inset-0" />
            )}
          </div>
          <RotatingSeal />
        </div>
      </div>
    </section>
  );
}
