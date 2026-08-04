"use client";

import type { CompositionBlock, CompositionDocument } from "@/lib/resume-studio/composition/types";
import { getTheme } from "@/lib/resume-studio/themes";

export function CompositionPreview({ document }: { document: CompositionDocument }) {
  const theme = getTheme(document.themeId);
  const useCol = theme.layout.useDateColumn;

  return (
    <div
      className="mx-auto bg-white text-black shadow-sm"
      style={{
        width: "100%",
        maxWidth: 720,
        padding: `${theme.layout.marginTop / 2}px ${theme.layout.marginLeft / 2}px`,
        fontFamily: "ui-sans-serif, system-ui, Helvetica, Arial, sans-serif",
        color: theme.colors.ink,
        fontSize: theme.typography.bodySize,
        lineHeight: 1.35,
      }}
    >
      {document.blocks.map((b, i) => (
        <BlockView key={i} block={b} useDateColumn={useCol} themeColors={theme.colors} />
      ))}
    </div>
  );
}

function BlockView({
  block,
  useDateColumn,
  themeColors,
}: {
  block: CompositionBlock;
  useDateColumn: boolean;
  themeColors: { ink: string; muted: string; rule: string; link: string };
}) {
  switch (block.kind) {
    case "header":
      return (
        <div className="mb-1">
          <div className="text-[16px] font-bold tracking-wide uppercase">{block.name}</div>
          <div className="text-[11px]">{block.professionalTitle}</div>
        </div>
      );
    case "contactRow":
      return <div className="text-[9px] text-neutral-600">{block.text}</div>;
    case "linkRow":
      return (
        <div className="mb-3 text-[9px]">
          {block.links.map((l, i) => (
            <span key={l.url}>
              {i > 0 ? " | " : ""}
              <a href={l.url} className="underline" style={{ color: themeColors.link }}>
                {l.label}
              </a>
            </span>
          ))}
        </div>
      );
    case "divider":
      return block.style === "rule" ? (
        <hr className="my-2 border-0 border-t" style={{ borderColor: themeColors.rule }} />
      ) : (
        <div className="h-3" />
      );
    case "verticalSpacer":
      return <div style={{ height: block.token === "entryGap" ? 12 : block.token === "headerBottom" ? 10 : 6 }} />;
    case "sectionHeader":
      return <div className="mt-2 text-[10.5px] font-bold tracking-wide">{block.label}</div>;
    case "summaryParagraph":
      return <p className="mb-2 text-[9.5px] leading-snug">{block.text}</p>;
    case "skillGroup":
      return (
        <p className="mb-1 text-[9.5px]">
          <span className="font-semibold">{block.category}: </span>
          {block.items.join(", ")}
        </p>
      );
    case "experience":
      return (
        <div className={`mb-3 ${useDateColumn ? "grid grid-cols-[88px_1fr] gap-3" : ""}`}>
          {useDateColumn ? (
            <div className="text-[8.5px] text-neutral-500">{block.dateLabel.replace(/–/g, "—")}</div>
          ) : null}
          <div>
            <div className="text-[10.5px] font-bold uppercase">{block.role}</div>
            <div className="text-[9.5px]">{block.company}</div>
            {block.location ? <div className="text-[8.5px] text-neutral-500">{block.location}</div> : null}
            {!useDateColumn ? <div className="text-[8.5px] text-neutral-500">{block.dateLabel}</div> : null}
            {block.summary ? <p className="mt-1 text-[9.5px]">{block.summary}</p> : null}
            <ul className="mt-1 space-y-0.5 pl-0 text-[9.5px]">
              {(block.metrics ?? []).map((m) => (
                <li key={m} className="font-semibold">
                  • {m}
                </li>
              ))}
              {block.bullets
                .filter((x) => !block.metrics?.includes(x))
                .map((x) => (
                  <li key={x}>• {x}</li>
                ))}
            </ul>
          </div>
        </div>
      );
    case "project":
      return (
        <div className={`mb-3 ${useDateColumn ? "grid grid-cols-[88px_1fr] gap-3" : ""}`}>
          {useDateColumn ? (
            <div className="text-[8.5px] text-neutral-500">{block.dateLabel.replace(/–/g, "—")}</div>
          ) : null}
          <div>
            <div className="text-[10.5px] font-bold">{block.name}</div>
            {block.role ? <div className="text-[9.5px]">{block.role}</div> : null}
            {!useDateColumn ? <div className="text-[8.5px] text-neutral-500">{block.dateLabel}</div> : null}
            {block.summary ? <p className="mt-1 text-[9.5px]">{block.summary}</p> : null}
            <ul className="mt-1 space-y-0.5 text-[9.5px]">
              {block.bullets.map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
            {block.technologies?.length ? (
              <p className="mt-1 text-[8.5px] text-neutral-500">Technologies: {block.technologies.join(", ")}</p>
            ) : null}
          </div>
        </div>
      );
    case "education":
      return (
        <div className="mb-1 text-[9.5px]">
          <span className="text-neutral-500">{block.dateLabel} </span>
          {block.line}
          {block.details?.map((d) => (
            <div key={d} className="pl-2 text-[8.5px]">
              • {d}
            </div>
          ))}
        </div>
      );
    case "technicalStackGroup":
      return (
        <p className="mb-1 text-[9.5px]">
          <span className="font-semibold">{block.group}: </span>
          {block.items.join(", ")}
        </p>
      );
    default:
      return null;
  }
}
