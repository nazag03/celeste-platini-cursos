const ITEMS = [
  "Cursos online",
  "Pastelería artesanal",
  "A tu ritmo",
  "Desde tu casa",
  "Técnicas paso a paso",
  "Acceso inmediato",
];


export function Marquee() {
  const row = (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="font-display italic text-2xl sm:text-3xl px-7 sm:px-10 whitespace-nowrap">{item}</span>
          <span className="text-blush-deep text-lg">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div aria-hidden className="marquee overflow-hidden bg-cocoa text-cream py-5 sm:py-6 select-none">
      <div className="marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}
