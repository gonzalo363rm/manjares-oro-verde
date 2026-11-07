import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { HomeCategoryRailSlider } from "@/components/home/HomeCategoryRailSlider";
import { titleFont } from "@/config/fonts";

type ProductPreview = {
  id: string;
  name: string;
  slug: string;
  images: { publicId: string; version: number }[];
};

type CategoryRail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products: ProductPreview[];
};

type Props = {
  categories: CategoryRail[];
};

export function HomeCategoryRails({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-600">
        Pronto vas a ver acá las categorías del catálogo.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <section key={category.id} className="space-y-3">
          <div className="min-w-0">
            <Link
              href={`/catalogo/${category.slug}`}
              className="group/cat inline-flex max-w-full items-center gap-1.5 text-stone-900 transition-colors hover:text-[var(--primary-hover)]"
            >
              <h3
                className={`${titleFont.className} min-w-0 text-xl font-semibold sm:text-2xl`}
              >
                {category.name}
              </h3>
              <ArrowUpRight
                className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover/cat:translate-x-0.5 group-hover/cat:-translate-y-0.5 sm:size-6"
                aria-hidden
              />
              <span className="sr-only">Ver categoría</span>
            </Link>
            {category.description ? (
              <p className="mt-0.5 line-clamp-2 text-sm text-stone-600">
                {category.description}
              </p>
            ) : null}
          </div>

          <HomeCategoryRailSlider
            categoryName={category.name}
            categorySlug={category.slug}
            products={category.products}
          />
        </section>
      ))}
    </div>
  );
}
