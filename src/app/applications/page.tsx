import { ApplicationsTracker } from "@/components/applications-tracker";
import { PageHeader } from "@/components/ui";
import { listTrackerRows } from "@/lib/applications/service";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const rows = await listTrackerRows();

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Notion-style tracker — editable tags, drag-to-reorder, filters. Mark applied on a job page to auto-fill a row."
      />
      <ApplicationsTracker initialRows={rows} />
    </div>
  );
}
