"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  createBlankApplicationAction,
  deleteApplicationAction,
  patchApplicationAction,
  reorderApplicationsAction,
} from "@/app/actions";
import {
  colorForNextAction,
  colorForStatus,
  formatDateLong,
  formatSalaryDisplay,
  monthsBetween,
  NEXT_ACTION_TAGS,
  parseSalaryNumber,
  STATUS_TAGS,
  TAG_PILL_CLASS,
  type TrackerRow,
} from "@/lib/applications/constants";
import { cn } from "@/lib/utils";

type Props = { initialRows: TrackerRow[] };

type FilterState = {
  q: string;
  status: string; // "" | tag id
  nextAction: string;
};

export function ApplicationsTracker({ initialRows }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [filter, setFilter] = useState<FilterState>({ q: "", status: "", nextAction: "" });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [openTagCell, setOpenTagCell] = useState<{ id: string; field: "status" | "next" } | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter.status && !r.statusTags.some((t) => t === filter.status)) return false;
      if (filter.nextAction && !r.nextActions.some((t) => t === filter.nextAction)) return false;
      if (!q) return true;
      const blob = [
        r.company,
        r.position,
        r.location,
        r.contact,
        r.website,
        r.workSetting,
        ...r.statusTags,
        ...r.nextActions,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, filter]);

  const footer = useMemo(() => {
    const dates = filtered
      .map((r) => (r.applicationDate ? new Date(r.applicationDate) : null))
      .filter((d): d is Date => !!d && !Number.isNaN(d.getTime()));
    const salaries = filtered
      .map((r) => parseSalaryNumber(r.salaryAsked))
      .filter((n): n is number => n != null);
    return {
      count: filtered.length,
      rangeMonths:
        dates.length >= 2
          ? monthsBetween(
              new Date(Math.min(...dates.map((d) => d.getTime()))),
              new Date(Math.max(...dates.map((d) => d.getTime()))),
            )
          : null,
      maxSalary: salaries.length ? Math.max(...salaries) : null,
    };
  }, [filtered]);

  function patchLocal(id: string, patch: Partial<TrackerRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function save(id: string, patch: Parameters<typeof patchApplicationAction>[1]) {
    setError(null);
    startTransition(async () => {
      const res = await patchApplicationAction(id, patch);
      if (!res.ok) setError(res.error ?? "Save failed");
    });
  }

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const from = rows.findIndex((r) => r.id === dragId);
    const to = rows.findIndex((r) => r.id === targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    const next = [...rows];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    const withOrder = next.map((r, i) => ({ ...r, sortOrder: i + 1 }));
    setRows(withOrder);
    setDragId(null);
    startTransition(async () => {
      const res = await reorderApplicationsAction(withOrder.map((r) => r.id));
      if (!res.ok) setError(res.error ?? "Reorder failed");
    });
  }

  function addRow() {
    setError(null);
    startTransition(async () => {
      const res = await createBlankApplicationAction();
      if (!res.ok || !res.row) {
        setError(res.error ?? "Create failed");
        return;
      }
      setRows((prev) => [...prev, res.row!]);
    });
  }

  function removeRow(id: string) {
    if (!confirm("Delete this application row?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    startTransition(async () => {
      const res = await deleteApplicationAction(id);
      if (!res.ok) setError(res.error ?? "Delete failed");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            Applications History
          </span>
          {pending ? <span className="text-xs text-ink-faint">Saving…</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={filter.q}
            onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
            placeholder="Search…"
            className="w-40 rounded-md border border-line bg-canvas px-2.5 py-1.5 text-sm placeholder:text-ink-faint"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            className="rounded-md border border-line bg-canvas px-2 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_TAGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id}
              </option>
            ))}
          </select>
          <select
            value={filter.nextAction}
            onChange={(e) => setFilter((f) => ({ ...f, nextAction: e.target.value }))}
            className="rounded-md border border-line bg-canvas px-2 py-1.5 text-sm"
          >
            <option value="">All next actions</option>
            {NEXT_ACTION_TAGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addRow}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-canvas hover:bg-accent-dim"
          >
            + New
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-line bg-panel/60">
        <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wider text-ink-faint">
              <th className="w-8 px-2 py-2" />
              <Th>Company</Th>
              <Th>Position</Th>
              <Th>Status</Th>
              <Th>Application Date</Th>
              <Th>Salary</Th>
              <Th>Next Action</Th>
              <Th>Website</Th>
              <Th>Contact</Th>
              <Th>Reference Link</Th>
              <Th>Location</Th>
              <Th>Setting</Th>
              <Th>CV</Th>
              <th className="w-10 px-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                draggable
                onDragStart={() => onDragStart(row.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(row.id)}
                className={cn(
                  "border-b border-line/80 hover:bg-panel-2/40",
                  dragId === row.id && "opacity-50",
                )}
              >
                <td className="cursor-grab px-2 text-ink-faint active:cursor-grabbing" title="Drag to reorder">
                  ⋮⋮
                </td>
                <td className="px-2 py-1.5">
                  <EditableText
                    value={row.company}
                    onCommit={(v) => {
                      patchLocal(row.id, { company: v });
                      save(row.id, { companyName: v });
                    }}
                    className="font-medium"
                    linkHref={row.jobId ? `/jobs/${row.jobId}` : undefined}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableText
                    value={row.position}
                    onCommit={(v) => {
                      patchLocal(row.id, { position: v });
                      save(row.id, { positionTitle: v });
                    }}
                  />
                </td>
                <td className="relative px-2 py-1.5">
                  <TagCell
                    tags={row.statusTags}
                    palette="status"
                    open={openTagCell?.id === row.id && openTagCell.field === "status"}
                    onToggle={() =>
                      setOpenTagCell((cur) =>
                        cur?.id === row.id && cur.field === "status"
                          ? null
                          : { id: row.id, field: "status" },
                      )
                    }
                    onChange={(tags) => {
                      patchLocal(row.id, { statusTags: tags });
                      save(row.id, { statusTags: tags });
                    }}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="date"
                    value={row.applicationDate ?? ""}
                    onChange={(e) => {
                      const v = e.target.value || null;
                      patchLocal(row.id, { applicationDate: v });
                      save(row.id, { submittedAt: v });
                    }}
                    className="w-[9.5rem] rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-line focus:border-accent focus:outline-none"
                    title={formatDateLong(row.applicationDate)}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableText
                    value={row.salaryAsked ?? ""}
                    placeholder="€60,000"
                    display={row.salaryAsked ? formatSalaryDisplay(row.salaryAsked) : ""}
                    onCommit={(v) => {
                      patchLocal(row.id, { salaryAsked: v || null });
                      save(row.id, { salaryAsked: v || null });
                    }}
                  />
                </td>
                <td className="relative px-2 py-1.5">
                  <TagCell
                    tags={row.nextActions}
                    palette="next"
                    open={openTagCell?.id === row.id && openTagCell.field === "next"}
                    onToggle={() =>
                      setOpenTagCell((cur) =>
                        cur?.id === row.id && cur.field === "next"
                          ? null
                          : { id: row.id, field: "next" },
                      )
                    }
                    onChange={(tags) => {
                      patchLocal(row.id, { nextActions: tags });
                      save(row.id, { nextActions: tags });
                    }}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableLink
                    value={row.website ?? ""}
                    onCommit={(v) => {
                      patchLocal(row.id, { website: v || null });
                      save(row.id, { website: v || null });
                    }}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableText
                    value={row.contact ?? ""}
                    onCommit={(v) => {
                      patchLocal(row.id, { contact: v || null });
                      save(row.id, { recruiterName: v || null });
                    }}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableLink
                    value={row.referenceLink ?? ""}
                    onCommit={(v) => {
                      patchLocal(row.id, { referenceLink: v || null });
                      save(row.id, { referenceLink: v || null });
                    }}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableText
                    value={row.location ?? ""}
                    onCommit={(v) => {
                      patchLocal(row.id, { location: v || null });
                      save(row.id, { locationApplied: v || null });
                    }}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <EditableText
                    value={row.workSetting ?? ""}
                    placeholder="Hybrid / Remote"
                    onCommit={(v) => {
                      patchLocal(row.id, { workSetting: v || null });
                      save(row.id, { workSetting: v || null });
                    }}
                  />
                </td>
                <td className="px-2 py-1.5 text-xs text-ink-muted">
                  {row.resumeVersionId ? (
                    <Link href="/resume-studio" className="text-accent hover:underline">
                      {row.resumeFileName ?? "CV"}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-ink-faint hover:text-danger"
                    title="Delete"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={14} className="px-4 py-10 text-center text-sm text-ink-muted">
                  No applications yet. Click <strong className="text-ink">+ New</strong>, or from a
                  job page use <strong className="text-ink">Mark applied</strong> to auto-fill a row.
                </td>
              </tr>
            ) : null}
          </tbody>
          <tfoot>
            <tr className="border-t border-line font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              <td className="px-2 py-2" />
              <td className="px-2 py-2">Count {footer.count}</td>
              <td colSpan={2} />
              <td className="px-2 py-2">
                {footer.rangeMonths != null ? `Range ${footer.rangeMonths} months` : "—"}
              </td>
              <td className="px-2 py-2">
                {footer.maxSalary != null ? `Max €${footer.maxSalary.toLocaleString("en-IE")}` : "—"}
              </td>
              <td colSpan={8} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-2 py-2 font-medium">{children}</th>;
}

function EditableText({
  value,
  onCommit,
  placeholder,
  display,
  className,
  linkHref,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  display?: string;
  className?: string;
  linkHref?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  if (editing) {
    return (
      <input
        ref={ref}
        autoFocus
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onCommit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="w-full min-w-[7rem] rounded border border-accent bg-canvas px-1 py-0.5 outline-none"
      />
    );
  }

  const shown = display || value || placeholder || "—";
  return (
    <button
      type="button"
      className={cn(
        "block w-full truncate rounded px-1 py-0.5 text-left hover:bg-panel-2",
        !value && "text-ink-faint",
        className,
      )}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
    >
      {linkHref && value ? (
        <Link
          href={linkHref}
          className="text-ink hover:text-accent"
          onClick={(e) => e.stopPropagation()}
        >
          {shown}
        </Link>
      ) : (
        shown
      )}
    </button>
  );
}

function EditableLink({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        placeholder="https://…"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onCommit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="w-full min-w-[8rem] rounded border border-accent bg-canvas px-1 py-0.5 outline-none"
      />
    );
  }

  const href = value && !/^https?:\/\//i.test(value) ? `https://${value}` : value;
  const label = value
    ? value.replace(/^https?:\/\//i, "").replace(/\/$/, "").slice(0, 28)
    : "—";

  return (
    <div className="flex min-w-[7rem] items-center gap-1 truncate px-1">
      {value ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="truncate text-accent hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {label}
        </a>
      ) : (
        <span className="text-ink-faint">—</span>
      )}
      <button
        type="button"
        className="shrink-0 text-[10px] text-ink-faint hover:text-ink"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
      >
        edit
      </button>
    </div>
  );
}

function TagCell({
  tags,
  palette,
  open,
  onToggle,
  onChange,
}: {
  tags: string[];
  palette: "status" | "next";
  open: boolean;
  onToggle: () => void;
  onChange: (tags: string[]) => void;
}) {
  const [createText, setCreateText] = useState("");
  const options: string[] =
    palette === "status" ? STATUS_TAGS.map((t) => t.id) : NEXT_ACTION_TAGS.map((t) => t.id);
  const colorFn = palette === "status" ? colorForStatus : colorForNextAction;

  function toggleTag(tag: string) {
    if (tags.includes(tag)) onChange(tags.filter((t) => t !== tag));
    else onChange([...tags, tag]);
  }

  function createTag() {
    const t = createText.trim();
    if (!t) return;
    if (!tags.includes(t)) onChange([...tags, t]);
    setCreateText("");
  }

  return (
    <div className="relative min-w-[8rem]">
      <button type="button" onClick={onToggle} className="flex w-full flex-wrap gap-1 rounded px-0.5 py-0.5 text-left hover:bg-panel-2">
        {tags.length ? (
          tags.map((t) => (
            <span
              key={t}
              className={cn(
                "inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium",
                TAG_PILL_CLASS[colorFn(t)],
              )}
            >
              {t}
            </span>
          ))
        ) : (
          <span className="text-ink-faint">—</span>
        )}
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-line bg-panel-2 p-2 shadow-xl">
          <div className="mb-2 flex flex-wrap gap-1 border-b border-line pb-2">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]",
                  TAG_PILL_CLASS[colorFn(t)],
                )}
              >
                {t}
                <span aria-hidden>×</span>
              </button>
            ))}
            <input
              value={createText}
              onChange={(e) => setCreateText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  createTag();
                }
              }}
              placeholder="Select or create…"
              className="min-w-[4rem] flex-1 bg-transparent text-xs outline-none placeholder:text-ink-faint"
            />
          </div>
          <p className="mb-1 text-[10px] text-ink-faint">Select an option or create one</p>
          <ul className="max-h-48 space-y-0.5 overflow-y-auto">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => toggleTag(opt)}
                  className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-xs hover:bg-panel"
                >
                  <span className="text-ink-faint">⋮⋮</span>
                  <span className={cn("rounded px-1.5 py-0.5", TAG_PILL_CLASS[colorFn(opt)])}>
                    {opt}
                  </span>
                  {tags.includes(opt) ? <span className="ml-auto text-accent">✓</span> : null}
                </button>
              </li>
            ))}
          </ul>
          {createText.trim() && !options.includes(createText.trim()) ? (
            <button
              type="button"
              onClick={createTag}
              className="mt-2 w-full rounded border border-line px-2 py-1 text-left text-xs hover:bg-panel"
            >
              Create “{createText.trim()}”
            </button>
          ) : null}
          <button
            type="button"
            onClick={onToggle}
            className="mt-2 w-full text-[10px] text-ink-faint hover:text-ink"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
