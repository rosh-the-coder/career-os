/**
 * Export Engine — renders CompositionDocument only.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
} from "docx";
import PDFDocument from "pdfkit";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getTheme, type Theme } from "../themes";
import { compositionToMarkdown } from "../composition/compose-document";
import type { CompositionBlock, CompositionDocument } from "../composition/types";

export { compositionToMarkdown } from "../composition/compose-document";

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function twipFromPt(pt: number) {
  return Math.round(pt * 20);
}

function run(text: string, opts: { bold?: boolean; size?: number; color?: string; font?: string } = {}) {
  return new TextRun({
    text,
    bold: opts.bold,
    size: opts.size ?? 20,
    font: opts.font ?? "Calibri",
    color: opts.color,
  });
}

function spacerPara(after: number) {
  return new Paragraph({ spacing: { after }, children: [] });
}

function sectionRulePara(theme: Theme) {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: theme.colors.rule.replace("#", ""), space: 1 },
    },
    spacing: { after: twipFromPt(theme.spacing.dividerGap) },
    children: [],
  });
}

function buildDocxChildren(doc: CompositionDocument, theme: Theme): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  const halfPt = (n: number) => Math.round(n * 2);

  for (const b of doc.blocks) {
    switch (b.kind) {
      case "header":
        out.push(
          new Paragraph({
            spacing: { after: twipFromPt(4) },
            children: [run(b.name.toUpperCase(), { bold: true, size: halfPt(theme.typography.nameSize) })],
          }),
        );
        out.push(
          new Paragraph({
            spacing: { after: twipFromPt(theme.spacing.metadataGap) },
            children: [run(b.professionalTitle, { size: halfPt(theme.typography.titleSize) })],
          }),
        );
        break;
      case "contactRow":
        out.push(
          new Paragraph({
            spacing: { after: twipFromPt(theme.spacing.metadataGap) },
            children: [run(b.text, { size: halfPt(theme.typography.mutedSize) })],
          }),
        );
        break;
      case "linkRow": {
        const children: (TextRun | ExternalHyperlink)[] = [];
        b.links.forEach((l, i) => {
          if (i > 0) children.push(run(" | ", { size: halfPt(theme.typography.mutedSize) }));
          children.push(
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: l.label,
                  size: halfPt(theme.typography.mutedSize),
                  font: "Calibri",
                  color: theme.colors.link.replace("#", ""),
                  underline: {},
                }),
              ],
              link: l.url,
            }),
          );
        });
        out.push(
          new Paragraph({
            spacing: { after: twipFromPt(theme.spacing.headerBottom) },
            children,
          }),
        );
        break;
      }
      case "divider":
        if (b.style === "rule") out.push(sectionRulePara(theme));
        else out.push(spacerPara(twipFromPt(theme.spacing.sectionBefore)));
        break;
      case "verticalSpacer": {
        const map: Record<string, number> = {
          headerBottom: theme.spacing.headerBottom,
          sectionBefore: theme.spacing.sectionBefore,
          sectionAfter: theme.spacing.sectionAfter,
          entryGap: theme.spacing.entryGap,
          dividerGap: theme.spacing.dividerGap,
          small: 4,
        };
        out.push(spacerPara(twipFromPt(map[b.token] ?? 6)));
        break;
      }
      case "sectionHeader":
        out.push(
          new Paragraph({
            spacing: { after: twipFromPt(theme.spacing.sectionAfter) },
            keepNext: true,
            children: [run(b.label, { bold: true, size: halfPt(theme.typography.sectionSize) })],
          }),
        );
        break;
      case "summaryParagraph":
        out.push(
          new Paragraph({
            spacing: { after: twipFromPt(theme.spacing.paragraphGap) },
            children: [run(b.text, { size: halfPt(theme.typography.bodySize) })],
          }),
        );
        break;
      case "skillGroup":
        out.push(
          new Paragraph({
            spacing: { after: twipFromPt(theme.spacing.metadataGap + 2) },
            children: [
              run(`${b.category}: `, { bold: true, size: halfPt(theme.typography.bodySize) }),
              run(b.items.join(", "), { size: halfPt(theme.typography.bodySize) }),
            ],
          }),
        );
        break;
      case "experience":
      case "project": {
        if (theme.layout.useDateColumn && b.kind === "experience") {
          out.push(dateContentTable(theme, b.dateLabel, experienceBodyParas(theme, b, halfPt)));
        } else if (theme.layout.useDateColumn && b.kind === "project") {
          out.push(dateContentTable(theme, b.dateLabel, projectBodyParas(theme, b, halfPt)));
        } else if (b.kind === "experience") {
          out.push(...experienceBodyParas(theme, b, halfPt, true));
        } else {
          out.push(...projectBodyParas(theme, b, halfPt, true));
        }
        break;
      }
      case "education":
        out.push(
          new Paragraph({
            spacing: { after: twipFromPt(theme.spacing.metadataGap) },
            children: [
              run(`${b.dateLabel}  `, { size: halfPt(theme.typography.captionSize), color: theme.colors.muted.replace("#", "") }),
              run(b.line, { size: halfPt(theme.typography.bodySize) }),
            ],
          }),
        );
        for (const d of b.details ?? []) {
          out.push(
            new Paragraph({
              spacing: { after: twipFromPt(theme.spacing.bulletGap) },
              indent: { left: convertInchesToTwip(0.15) },
              children: [run(`• ${d}`, { size: halfPt(theme.typography.captionSize) })],
            }),
          );
        }
        break;
      case "technicalStackGroup":
        out.push(
          new Paragraph({
            spacing: { after: twipFromPt(theme.spacing.metadataGap + 2) },
            children: [
              run(`${b.group}: `, { bold: true, size: halfPt(theme.typography.bodySize) }),
              run(b.items.join(", "), { size: halfPt(theme.typography.bodySize) }),
            ],
          }),
        );
        break;
      case "metricHighlight":
        out.push(
          new Paragraph({
            spacing: { after: twipFromPt(theme.spacing.bulletGap) },
            children: [run(b.text, { bold: true, size: halfPt(theme.typography.bodySize) })],
          }),
        );
        break;
      default:
        break;
    }
  }
  return out;
}

function experienceBodyParas(
  theme: Theme,
  b: Extract<CompositionBlock, { kind: "experience" }>,
  halfPt: (n: number) => number,
  includeDate = false,
): Paragraph[] {
  const out: Paragraph[] = [];
  if (includeDate) {
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.roleGap) },
        keepNext: true,
        children: [run(b.role, { bold: true, size: halfPt(theme.typography.roleSize) })],
      }),
    );
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.metadataGap) },
        children: [
          run([b.company, b.location].filter(Boolean).join(" | "), {
            size: halfPt(theme.typography.companySize),
          }),
        ],
      }),
    );
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.metadataGap) },
        children: [run(b.dateLabel, { size: halfPt(theme.typography.mutedSize), color: theme.colors.muted.replace("#", "") })],
      }),
    );
  } else {
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.roleGap) },
        keepNext: true,
        children: [run(b.role.toUpperCase(), { bold: true, size: halfPt(theme.typography.roleSize) })],
      }),
    );
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.metadataGap) },
        children: [run(b.company, { size: halfPt(theme.typography.companySize) })],
      }),
    );
    if (b.location) {
      out.push(
        new Paragraph({
          spacing: { after: twipFromPt(theme.spacing.metadataGap) },
          children: [run(b.location, { size: halfPt(theme.typography.mutedSize), color: theme.colors.muted.replace("#", "") })],
        }),
      );
    }
  }
  if (b.summary) {
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.paragraphGap) },
        children: [run(b.summary, { size: halfPt(theme.typography.bodySize) })],
      }),
    );
  }
  for (const m of b.metrics ?? []) {
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.bulletGap) },
        indent: { left: convertInchesToTwip(0.12), hanging: convertInchesToTwip(0.12) },
        children: [run(`• ${m}`, { bold: true, size: halfPt(theme.typography.bodySize) })],
      }),
    );
  }
  for (const bullet of b.bullets) {
    if (b.metrics?.includes(bullet)) continue;
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.bulletGap) },
        indent: { left: convertInchesToTwip(0.12), hanging: convertInchesToTwip(0.12) },
        children: [run(`• ${bullet}`, { size: halfPt(theme.typography.bodySize) })],
      }),
    );
  }
  return out;
}

function projectBodyParas(
  theme: Theme,
  b: Extract<CompositionBlock, { kind: "project" }>,
  halfPt: (n: number) => number,
  includeDate = false,
): Paragraph[] {
  const out: Paragraph[] = [];
  out.push(
    new Paragraph({
      spacing: { after: twipFromPt(theme.spacing.roleGap) },
      keepNext: true,
      children: [run(b.name, { bold: true, size: halfPt(theme.typography.roleSize) })],
    }),
  );
  if (includeDate) {
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.metadataGap) },
        children: [run(b.dateLabel, { size: halfPt(theme.typography.mutedSize), color: theme.colors.muted.replace("#", "") })],
      }),
    );
  }
  if (b.role) {
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.metadataGap) },
        children: [run(b.role, { size: halfPt(theme.typography.companySize) })],
      }),
    );
  }
  if (b.summary) {
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.paragraphGap) },
        children: [run(b.summary, { size: halfPt(theme.typography.bodySize) })],
      }),
    );
  }
  for (const m of b.metrics ?? []) {
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.bulletGap) },
        indent: { left: convertInchesToTwip(0.12), hanging: convertInchesToTwip(0.12) },
        children: [run(`• ${m}`, { bold: true, size: halfPt(theme.typography.bodySize) })],
      }),
    );
  }
  for (const bullet of b.bullets) {
    if (b.metrics?.includes(bullet)) continue;
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.bulletGap) },
        indent: { left: convertInchesToTwip(0.12), hanging: convertInchesToTwip(0.12) },
        children: [run(`• ${bullet}`, { size: halfPt(theme.typography.bodySize) })],
      }),
    );
  }
  if (b.technologies?.length) {
    out.push(
      new Paragraph({
        spacing: { after: twipFromPt(theme.spacing.metadataGap) },
        children: [
          run(`Technologies: ${b.technologies.join(", ")}`, {
            size: halfPt(theme.typography.captionSize),
            color: theme.colors.muted.replace("#", ""),
          }),
        ],
      }),
    );
  }
  return out;
}

function dateContentTable(theme: Theme, dateLabel: string, body: Paragraph[]): Table {
  const totalWidth = 9000;
  const dateW = Math.round((theme.layout.dateColumnWidth / (theme.layout.pageWidthPt - theme.layout.marginLeft - theme.layout.marginRight)) * totalWidth);
  const contentW = totalWidth - dateW;
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: [dateW, contentW],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: NO_BORDER,
            width: { size: dateW, type: WidthType.DXA },
            children: [
              new Paragraph({
                spacing: { after: 0 },
                children: [
                  run(dateLabel.replace(/–/g, "—"), {
                    size: Math.round(theme.typography.mutedSize * 2),
                    color: theme.colors.muted.replace("#", ""),
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: NO_BORDER,
            width: { size: contentW, type: WidthType.DXA },
            children: body.length ? body : [new Paragraph({ children: [] })],
          }),
        ],
      }),
    ],
  });
}

export async function exportCompositionDocx(doc: CompositionDocument): Promise<Buffer> {
  const theme = getTheme(doc.themeId);
  const children = buildDocxChildren(doc, theme);
  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: twipFromPt(theme.layout.marginTop),
              bottom: twipFromPt(theme.layout.marginBottom),
              left: twipFromPt(theme.layout.marginLeft),
              right: twipFromPt(theme.layout.marginRight),
            },
          },
        },
        children,
      },
    ],
  });
  return Buffer.from(await Packer.toBuffer(document));
}

export function exportCompositionPdf(doc: CompositionDocument): Promise<{ buffer: Buffer; pageCount: number }> {
  const theme = getTheme(doc.themeId);
  return new Promise((resolve, reject) => {
    try {
      const pdf = new PDFDocument({
        size: "A4",
        margins: {
          top: theme.layout.marginTop,
          bottom: theme.layout.marginBottom,
          left: theme.layout.marginLeft,
          right: theme.layout.marginRight,
        },
        autoFirstPage: true,
      });
      const chunks: Buffer[] = [];
      let pageCount = 1;
      pdf.on("pageAdded", () => {
        pageCount += 1;
      });
      pdf.on("data", (c: Buffer) => chunks.push(c));
      pdf.on("end", () => resolve({ buffer: Buffer.concat(chunks), pageCount }));
      pdf.on("error", reject);

      const contentWidth =
        theme.layout.pageWidthPt - theme.layout.marginLeft - theme.layout.marginRight;
      const dateW = theme.layout.useDateColumn ? theme.layout.dateColumnWidth : 0;
      const gap = theme.layout.useDateColumn ? theme.layout.contentColumnGap : 0;
      const bodyW = contentWidth - dateW - gap;
      const left = theme.layout.marginLeft;
      const bodyX = left + dateW + gap;

      const ensureSpace = (needed: number) => {
        const bottom = theme.layout.pageHeightPt - theme.layout.marginBottom;
        if (pdf.y + needed > bottom) pdf.addPage();
      };

      const writeFull = (text: string, opts: { bold?: boolean; size?: number; color?: string; gap?: number; width?: number; x?: number } = {}) => {
        pdf
          .font(opts.bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(opts.size ?? theme.typography.bodySize)
          .fillColor(opts.color ?? theme.colors.ink);
        if (opts.x != null) pdf.text(text, opts.x, pdf.y, { width: opts.width ?? bodyW, continued: false });
        else pdf.text(text, { width: opts.width ?? contentWidth, continued: false });
        pdf.moveDown(opts.gap ?? 0.15);
      };

      const drawRule = () => {
        const y = pdf.y + 2;
        pdf
          .strokeColor(theme.colors.rule)
          .lineWidth(0.6)
          .moveTo(left, y)
          .lineTo(left + contentWidth, y)
          .stroke();
        pdf.y = y + theme.spacing.dividerGap;
      };

      for (const b of doc.blocks) {
        switch (b.kind) {
          case "header":
            writeFull(b.name.toUpperCase(), { bold: true, size: theme.typography.nameSize, gap: 0.1 });
            writeFull(b.professionalTitle, { size: theme.typography.titleSize, gap: 0.2 });
            break;
          case "contactRow":
            writeFull(b.text, { size: theme.typography.mutedSize, color: theme.colors.muted, gap: 0.1 });
            break;
          case "linkRow": {
            pdf.font("Helvetica").fontSize(theme.typography.mutedSize);
            b.links.forEach((l, i) => {
              if (i > 0) pdf.fillColor(theme.colors.ink).text(" | ", { continued: true, width: contentWidth });
              pdf.fillColor(theme.colors.link).text(l.label, {
                link: l.url,
                underline: true,
                continued: i < b.links.length - 1,
                width: contentWidth,
              });
            });
            pdf.fillColor(theme.colors.ink).text("");
            pdf.moveDown(theme.spacing.headerBottom / 14);
            break;
          }
          case "divider":
            if (b.style === "rule") drawRule();
            else pdf.moveDown(theme.spacing.sectionBefore / 14);
            break;
          case "verticalSpacer": {
            const map: Record<string, number> = {
              headerBottom: theme.spacing.headerBottom,
              sectionBefore: theme.spacing.sectionBefore,
              sectionAfter: theme.spacing.sectionAfter,
              entryGap: theme.spacing.entryGap,
              dividerGap: theme.spacing.dividerGap,
              small: 4,
            };
            pdf.moveDown((map[b.token] ?? 6) / 14);
            break;
          }
          case "sectionHeader":
            ensureSpace(28);
            writeFull(b.label, { bold: true, size: theme.typography.sectionSize, gap: 0.2 });
            break;
          case "summaryParagraph":
            writeFull(b.text, { size: theme.typography.bodySize, gap: 0.35 });
            break;
          case "skillGroup":
            writeFull(`${b.category}: ${b.items.join(", ")}`, { size: theme.typography.bodySize, gap: 0.18 });
            break;
          case "experience": {
            ensureSpace(theme.layout.keepEntryTogetherMinHeight);
            const startY = pdf.y;
            if (theme.layout.useDateColumn) {
              pdf
                .font("Helvetica")
                .fontSize(theme.typography.mutedSize)
                .fillColor(theme.colors.muted)
                .text(b.dateLabel.replace(/–/g, "—"), left, startY, { width: dateW });
              pdf.y = startY;
              pdf.x = bodyX;
              writeFull(b.role.toUpperCase(), { bold: true, size: theme.typography.roleSize, gap: 0.08, width: bodyW, x: bodyX });
              writeFull(b.company, { size: theme.typography.companySize, gap: 0.06, width: bodyW, x: bodyX });
              if (b.location) writeFull(b.location, { size: theme.typography.mutedSize, color: theme.colors.muted, gap: 0.08, width: bodyW, x: bodyX });
              if (b.summary) writeFull(b.summary, { size: theme.typography.bodySize, gap: 0.12, width: bodyW, x: bodyX });
              for (const m of b.metrics ?? []) {
                writeFull(`• ${m}`, { bold: true, size: theme.typography.bodySize, gap: 0.08, width: bodyW, x: bodyX });
              }
              for (const bullet of b.bullets) {
                if (b.metrics?.includes(bullet)) continue;
                writeFull(`• ${bullet}`, { size: theme.typography.bodySize, gap: 0.08, width: bodyW, x: bodyX });
              }
              pdf.x = left;
            } else {
              writeFull(b.role, { bold: true, size: theme.typography.roleSize, gap: 0.08 });
              writeFull([b.company, b.location].filter(Boolean).join(" | "), { size: theme.typography.companySize, gap: 0.06 });
              writeFull(b.dateLabel, { size: theme.typography.mutedSize, color: theme.colors.muted, gap: 0.1 });
              if (b.summary) writeFull(b.summary, { size: theme.typography.bodySize, gap: 0.1 });
              for (const m of b.metrics ?? []) writeFull(`• ${m}`, { bold: true, size: theme.typography.bodySize, gap: 0.08 });
              for (const bullet of b.bullets) {
                if (b.metrics?.includes(bullet)) continue;
                writeFull(`• ${bullet}`, { size: theme.typography.bodySize, gap: 0.08 });
              }
            }
            pdf.moveDown(theme.spacing.entryGap / 18);
            break;
          }
          case "project": {
            ensureSpace(theme.layout.keepEntryTogetherMinHeight);
            const startY = pdf.y;
            if (theme.layout.useDateColumn) {
              pdf
                .font("Helvetica")
                .fontSize(theme.typography.mutedSize)
                .fillColor(theme.colors.muted)
                .text(b.dateLabel.replace(/–/g, "—"), left, startY, { width: dateW });
              pdf.y = startY;
              writeFull(b.name, { bold: true, size: theme.typography.roleSize, gap: 0.08, width: bodyW, x: bodyX });
              if (b.role) writeFull(b.role, { size: theme.typography.companySize, gap: 0.06, width: bodyW, x: bodyX });
              if (b.summary) writeFull(b.summary, { size: theme.typography.bodySize, gap: 0.1, width: bodyW, x: bodyX });
              for (const m of b.metrics ?? []) writeFull(`• ${m}`, { bold: true, size: theme.typography.bodySize, gap: 0.08, width: bodyW, x: bodyX });
              for (const bullet of b.bullets) {
                if (b.metrics?.includes(bullet)) continue;
                writeFull(`• ${bullet}`, { size: theme.typography.bodySize, gap: 0.08, width: bodyW, x: bodyX });
              }
              if (b.technologies?.length) {
                writeFull(`Technologies: ${b.technologies.join(", ")}`, {
                  size: theme.typography.captionSize,
                  color: theme.colors.muted,
                  gap: 0.1,
                  width: bodyW,
                  x: bodyX,
                });
              }
              pdf.x = left;
            } else {
              writeFull(b.name, { bold: true, size: theme.typography.roleSize, gap: 0.08 });
              writeFull(b.dateLabel, { size: theme.typography.mutedSize, color: theme.colors.muted, gap: 0.06 });
              if (b.role) writeFull(b.role, { size: theme.typography.companySize, gap: 0.06 });
              if (b.summary) writeFull(b.summary, { size: theme.typography.bodySize, gap: 0.1 });
              for (const bullet of b.bullets) writeFull(`• ${bullet}`, { size: theme.typography.bodySize, gap: 0.08 });
              if (b.technologies?.length) {
                writeFull(`Technologies: ${b.technologies.join(", ")}`, {
                  size: theme.typography.captionSize,
                  color: theme.colors.muted,
                  gap: 0.1,
                });
              }
            }
            pdf.moveDown(theme.spacing.entryGap / 18);
            break;
          }
          case "education":
            writeFull(`${b.dateLabel}  ${b.line}`, { size: theme.typography.bodySize, gap: 0.1 });
            for (const d of b.details ?? []) writeFull(`• ${d}`, { size: theme.typography.captionSize, gap: 0.06 });
            break;
          case "technicalStackGroup":
            writeFull(`${b.group}: ${b.items.join(", ")}`, { size: theme.typography.bodySize, gap: 0.15 });
            break;
          default:
            break;
        }
      }

      pdf.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateCompositionExports(
  doc: CompositionDocument,
  outDir: string,
  fileBase: string,
): Promise<{ docxPath: string; pdfPath: string | null; markdownPath: string; pageCount?: number; markdown: string }> {
  await mkdir(outDir, { recursive: true });
  const markdown = compositionToMarkdown(doc);
  const docxPath = path.join(outDir, `${fileBase}.docx`);
  const pdfPath = path.join(outDir, `${fileBase}.pdf`);
  const markdownPath = path.join(outDir, `${fileBase}.md`);

  await writeFile(docxPath, await exportCompositionDocx(doc));
  await writeFile(markdownPath, markdown, "utf8");

  let writtenPdf: string | null = pdfPath;
  let pageCount: number | undefined;
  try {
    const built = await exportCompositionPdf(doc);
    await writeFile(pdfPath, built.buffer);
    pageCount = built.pageCount;
  } catch (err) {
    console.warn("[export-v4] PDF skipped:", err instanceof Error ? err.message : err);
    writtenPdf = null;
  }

  return { docxPath, pdfPath: writtenPdf, markdownPath, pageCount, markdown };
}

/** Deterministic visual heuristics on composition + page count */
export function runVisualHeuristics(doc: CompositionDocument, pageCount?: number): string[] {
  const flags: string[] = [];
  const labels = doc.blocks.filter((b) => b.kind === "sectionHeader") as Extract<CompositionBlock, { kind: "sectionHeader" }>[];
  if (!labels.length) flags.push("No section headers");

  let lastWasHeader = false;
  for (const b of doc.blocks) {
    if (b.kind === "sectionHeader") {
      if (lastWasHeader) flags.push(`Adjacent section headers near ${b.label}`);
      lastWasHeader = true;
    } else if (b.kind === "divider" || b.kind === "verticalSpacer") {
      // ok
    } else {
      lastWasHeader = false;
    }
  }

  const lastContent = [...doc.blocks].reverse().find((b) => b.kind === "sectionHeader");
  if (lastContent) {
    const idx = doc.blocks.lastIndexOf(lastContent);
    const after = doc.blocks.slice(idx + 1).filter((b) => !["divider", "verticalSpacer", "whitespace", "pageBreakHint"].includes(b.kind));
    if (!after.length) flags.push("Empty final section heading");
  }

  const experiences = doc.blocks.filter((b) => b.kind === "experience");
  for (const e of experiences) {
    if (e.kind === "experience" && !e.bullets.length && !(e.metrics?.length)) {
      flags.push(`Compressed empty experience: ${e.company}`);
    }
  }

  if (pageCount != null && pageCount !== doc.pageLength) {
    flags.push(`Page count ${pageCount} != requested ${doc.pageLength}`);
  }
  if (pageCount != null && pageCount > doc.pageLength + 1) {
    flags.push("Severe page overflow");
  }

  return flags;
}
