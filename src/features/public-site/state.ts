import "server-only";

import { prisma } from "@/lib/prisma";

const PUBLIC_DISCOVERY_STATE_ID = "public-discovery";

export async function getPublicHomepageLastChangedAt() {
  const state = await prisma.publicDiscoveryState.findUnique({
    where: {
      id: PUBLIC_DISCOVERY_STATE_ID
    },
    select: {
      homepageLastChangedAt: true
    }
  });

  return state?.homepageLastChangedAt ?? null;
}

export async function recordPublicHomepageChange() {
  const homepageLastChangedAt = new Date();
  const state = await prisma.publicDiscoveryState.upsert({
    where: {
      id: PUBLIC_DISCOVERY_STATE_ID
    },
    update: {
      homepageLastChangedAt
    },
    create: {
      id: PUBLIC_DISCOVERY_STATE_ID,
      homepageLastChangedAt
    },
    select: {
      homepageLastChangedAt: true
    }
  });

  return state.homepageLastChangedAt;
}
