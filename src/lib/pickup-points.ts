import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

async function fetchActivePickupPoints() {
  return prisma.pickupPoint.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      address: true,
      description: true,
      mapEmbedUrl: true,
    },
  });
}

export const getActivePickupPoints = unstable_cache(
  fetchActivePickupPoints,
  ["active-pickup-points"],
  { tags: ["pickup-points"], revalidate: 3600 }
);
