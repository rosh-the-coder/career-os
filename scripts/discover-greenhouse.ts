#!/usr/bin/env tsx
import { runJobDiscovery } from "../src/lib/jobs/discover";
import { prisma } from "../src/lib/db/prisma";

async function main() {
  const result = await runJobDiscovery();
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
