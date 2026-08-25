import { requireOnboarded } from "@/lib/auth/onboarding-gate";

export default async function JobsNewLayout({ children }: { children: React.ReactNode }) {
  await requireOnboarded();
  return children;
}
