import { getPrimaryUser } from "@/lib/auth/user";
import { prisma } from "@/lib/db/prisma";

/** Discover daily cap — guests default to Settings.maxDiscoversPerDay. */
export async function assertDiscoverAllowed() {
  const user = await getPrimaryUser();
  const max = user.settings?.maxDiscoversPerDay ?? 3;
  const dayKey = new Date().toISOString().slice(0, 10);

  let count = user.discoverCountDay;
  if (user.discoverDayKey !== dayKey) {
    count = 0;
  }

  if (!user.isOperator && count >= max) {
    throw new Error(
      `Daily Discover limit reached (${max}/day). Add your own keys and try again tomorrow, or ask the operator to raise your cap.`,
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      discoverDayKey: dayKey,
      discoverCountDay: count + 1,
      lastDiscoverAt: new Date(),
    },
  });

  return user;
}
