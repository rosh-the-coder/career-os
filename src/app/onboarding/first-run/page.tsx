import { requireOnboarded } from "@/lib/auth/onboarding-gate";
import { FirstRunGuide } from "@/components/onboarding/first-run-guide";

export const dynamic = "force-dynamic";

export default async function FirstRunPage() {
  await requireOnboarded();
  return <FirstRunGuide />;
}
