import { titleFont } from "@/config/fonts";

export type PickupPointCard = {
  id: string;
  name: string;
  address: string;
  description: string;
  mapEmbedUrl: string;
};

type Props = {
  points: PickupPointCard[];
};

export function PickupPointsSection({ points }: Props) {
  if (points.length === 0) return null;

  return (
    <section id="puntos-retiro" className="page-gutter py-10 sm:py-14">
      <div className="mb-6 max-w-2xl">
        <h2 className={`${titleFont.className} text-2xl font-semibold`}>
          ¿Estás pensando en retirar?
        </h2>
        <p className="mt-1.5 text-sm text-stone-600">
          Estos son nuestros puntos de retiro.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {points.map((point) => (
          <article
            key={point.id}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="relative aspect-[4/3] bg-stone-100 sm:aspect-[16/10]">
              <iframe
                title={`Mapa: ${point.name}`}
                src={point.mapEmbedUrl}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="space-y-1 px-4 py-3">
              <h3 className="font-semibold text-stone-900">{point.name}</h3>
              {point.address ? (
                <p className="text-sm text-stone-600">{point.address}</p>
              ) : null}
              {point.description ? (
                <p className="text-sm leading-snug text-stone-500">
                  {point.description}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
