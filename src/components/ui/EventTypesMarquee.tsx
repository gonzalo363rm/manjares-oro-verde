const EVENTS = [
  "Cumpleaños",
  "Casamientos",
  "Bautismos",
  "Empresariales",
  "Baby shower",
  "15 años",
  "Aniversarios",
];

export function EventTypesMarquee() {
  const items = [...EVENTS, ...EVENTS];

  return (
    <div className="event-marquee relative overflow-hidden border-y border-orange-100/80 bg-white/70 py-3">
      <div className="marquee-track gap-8 px-4 text-sm font-medium tracking-wide text-gray-600 uppercase">
        {items.map((label, i) => (
          <span key={`${label}-${i}`} className="inline-flex items-center gap-8">
            <span>{label}</span>
            <span className="text-amber-700" aria-hidden>
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
