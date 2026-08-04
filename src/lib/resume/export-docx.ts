import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  convertInchesToTwip,
} from "docx";
import PDFDocument from "pdfkit";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { ResumeDraft, ResumeGenerationInput } from "@/lib/ai/types";

export interface ResumeLinkUrls {
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}

export type AtsSectionId =
  | "summary"
  | "skills"
  | "selectedProjects"
  | "experience"
  | "education"
  | "technicalStack";

export interface AtsResumeContent {
  documentTitle: string;
  /** Optional separate title line (V3). If absent, title is embedded in documentTitle. */
  professionalTitle?: string;
  contactLine: string;
  /** Pipe-separated labels for display: LinkedIn | Portfolio | GitHub */
  linksLine: string;
  linkUrls?: ResumeLinkUrls;
  profile: string;
  skills: string[];
  skillGroups?: { category: string; items: string }[];
  sectionOrder?: AtsSectionId[];
  projects: {
    dates: string;
    name: string;
    blurb: string;
    role: string;
    bullets: string[];
    links?: string;
    technologies?: string;
  }[];
  experiences: {
    dates: string;
    title: string;
    company: string;
    location?: string;
    companyBlurb?: string;
    functionalFocus?: string;
    bullets: string[];
  }[];
  education: { dates: string; line: string; details?: string[] }[];
  technicalStack: { group: string; items: string }[];
}

export function buildLinksLine(urls: ResumeLinkUrls): string {
  const parts: string[] = [];
  if (urls.linkedinUrl) parts.push("LinkedIn");
  if (urls.portfolioUrl) parts.push("Portfolio");
  if (urls.githubUrl) parts.push("GitHub");
  return parts.join(" | ");
}

export function parseLinkUrlsFromLine(linksLine: string): ResumeLinkUrls {
  const linkedin = linksLine.match(/LinkedIn\s*\((https?:\/\/[^)]+)\)/i)?.[1];
  const portfolio = linksLine.match(/Portfolio(?:\s+Website)?\s*\((https?:\/\/[^)]+)\)/i)?.[1];
  const github = linksLine.match(/Git(?: )?Hub\s*\((https?:\/\/[^)]+)\)/i)?.[1];
  return {
    linkedinUrl: linkedin,
    portfolioUrl: portfolio,
    githubUrl: github,
  };
}

export function resolveLinkUrls(content: AtsResumeContent): ResumeLinkUrls {
  if (content.linkUrls?.linkedinUrl || content.linkUrls?.portfolioUrl || content.linkUrls?.githubUrl) {
    return content.linkUrls;
  }
  return parseLinkUrlsFromLine(content.linksLine);
}

export function toAtsContent(
  draft: ResumeDraft,
  contact: ResumeGenerationInput["contact"] & { phone?: string },
  profileName: string,
): AtsResumeContent {
  const phone = contact.phone ?? "+353 838501604";
  const linkUrls: ResumeLinkUrls = {
    linkedinUrl: contact.linkedinUrl,
    portfolioUrl: contact.portfolioUrl,
    githubUrl: contact.githubUrl,
  };
  return {
    documentTitle: "ROSHAN NAJAR",
    professionalTitle: profileName,
    contactLine: `County Dublin, Ireland | ${phone} | ${contact.email}`,
    linksLine: buildLinksLine(linkUrls),
    linkUrls,
    profile: draft.summary,
    skills: draft.skills,
    projects: draft.projects.map((p) => ({
      dates: "",
      name: p.name,
      blurb: "",
      role: p.role,
      bullets: p.bullets,
    })),
    experiences: draft.experiences.map((e) => ({
      dates: `${e.startDate} — ${e.endDate ?? "Present"}`,
      title: e.title,
      company: e.company,
      bullets: e.bullets,
    })),
    education: draft.education.map((line) => ({ dates: "", line })),
    technicalStack: [],
    sectionOrder: ["summary", "skills", "experience", "selectedProjects", "education", "technicalStack"],
  };
}

function run(text: string, opts?: { bold?: boolean; size?: number }) {
  return new TextRun({
    text,
    bold: opts?.bold,
    size: opts?.size ?? 20,
    font: "Calibri",
  });
}

function para(
  text: string,
  opts?: { bold?: boolean; size?: number; spacingAfter?: number; spacingBefore?: number; keepNext?: boolean },
) {
  return new Paragraph({
    spacing: {
      before: opts?.spacingBefore ?? 0,
      after: opts?.spacingAfter ?? 80,
    },
    keepNext: opts?.keepNext,
    children: [run(text, { bold: opts?.bold, size: opts?.size })],
  });
}

function bulletPara(text: string) {
  return new Paragraph({
    spacing: { after: 40 },
    indent: { left: convertInchesToTwip(0.2), hanging: convertInchesToTwip(0.15) },
    children: [run(`• ${text}`, { size: 20 })],
  });
}

function sectionHeading(label: string) {
  return para(label, { bold: true, size: 22, spacingBefore: 160, spacingAfter: 80, keepNext: true });
}

function resolveOrder(content: AtsResumeContent): AtsSectionId[] {
  return (
    content.sectionOrder ?? [
      "summary",
      "skills",
      "selectedProjects",
      "experience",
      "education",
      "technicalStack",
    ]
  );
}

function buildHeaderParagraphs(content: AtsResumeContent): Paragraph[] {
  const title = content.professionalTitle;
  const name = content.documentTitle.includes(",")
    ? content.documentTitle.split(",")[0]!.trim()
    : content.documentTitle;
  const role =
    title ??
    (content.documentTitle.includes(",")
      ? content.documentTitle.split(",").slice(1).join(",").trim()
      : undefined);

  const children: Paragraph[] = [
    para(name.toUpperCase(), { bold: true, size: 28, spacingAfter: 40 }),
  ];
  if (role) children.push(para(role, { size: 22, spacingAfter: 80 }));
  children.push(para(content.contactLine, { size: 18, spacingAfter: 40 }));

  // Hyperlink paragraph — never continued into PROFILE
  const urls = resolveLinkUrls(content);
  const linkChildren: (TextRun | ExternalHyperlink)[] = [];
  const linkItems: { label: string; href?: string }[] = [
    { label: "LinkedIn", href: urls.linkedinUrl },
    { label: "Portfolio", href: urls.portfolioUrl },
    { label: "GitHub", href: urls.githubUrl },
  ].filter((i) => i.href);

  linkItems.forEach((item, i) => {
    if (i > 0) linkChildren.push(run(" | ", { size: 18 }));
    linkChildren.push(
      new ExternalHyperlink({
        children: [new TextRun({ text: item.label, size: 18, font: "Calibri", color: "0B57D0", underline: {} })],
        link: item.href!,
      }),
    );
  });

  if (linkChildren.length) {
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: linkChildren,
      }),
    );
  } else if (content.linksLine && !/^LINKS$/i.test(content.linksLine.trim())) {
    children.push(para(content.linksLine.replace(/^LINKS\s+/i, ""), { size: 18, spacingAfter: 160 }));
  }

  return children;
}

function buildProjectParagraphs(content: AtsResumeContent): Paragraph[] {
  const out: Paragraph[] = [sectionHeading("SELECTED PROJECTS")];
  for (const p of content.projects) {
    out.push(titleDateRow(p.name, p.dates, { keepNext: true }));
    if (p.role) out.push(para(p.role, { size: 18, spacingAfter: 40 }));
    if (p.blurb) out.push(para(p.blurb, { size: 18, spacingAfter: 40 }));
    for (const b of p.bullets) out.push(bulletPara(b));
    if (p.technologies) out.push(para(`Technologies: ${p.technologies}`, { size: 18, spacingAfter: 140 }));
    else out.push(para("", { spacingAfter: 120 }));
  }
  return out;
}

function titleDateRow(title: string, dates: string, opts?: { keepNext?: boolean }): Paragraph {
  return new Paragraph({
    spacing: { after: 20 },
    keepNext: opts?.keepNext ?? true,
    tabStops: [{ type: "right", position: convertInchesToTwip(7.0) }],
    children: [
      run(title, { bold: true, size: 20 }),
      ...(dates
        ? [new TextRun({ text: "\t", font: "Calibri", size: 18 }), run(dates, { size: 18 })]
        : []),
    ],
  });
}

function buildExperienceParagraphs(content: AtsResumeContent): Paragraph[] {
  const out: Paragraph[] = [sectionHeading("PROFESSIONAL EXPERIENCE")];
  for (const e of content.experiences) {
    out.push(titleDateRow(e.title, e.dates, { keepNext: true }));
    const companyLine = [e.company, e.location].filter(Boolean).join(" | ");
    if (companyLine) out.push(para(companyLine, { size: 18, spacingAfter: 40 }));
    if (e.companyBlurb) out.push(para(e.companyBlurb, { size: 18, spacingAfter: 40 }));
    if (e.functionalFocus) out.push(para(e.functionalFocus, { size: 18, spacingAfter: 40 }));
    for (const b of e.bullets) out.push(bulletPara(b));
    out.push(para("", { spacingAfter: 100 }));
  }
  return out;
}

function buildSkillsParagraphs(content: AtsResumeContent): Paragraph[] {
  const out: Paragraph[] = [sectionHeading("SKILLS")];
  if (content.skillGroups?.length) {
    for (const g of content.skillGroups) {
      out.push(para(`${g.category}: ${g.items}`, { size: 18, spacingAfter: 40 }));
    }
  } else {
    out.push(para(content.skills.join(" · "), { spacingAfter: 80 }));
  }
  return out;
}

function buildSectionParagraphs(content: AtsResumeContent, section: AtsSectionId): Paragraph[] {
  switch (section) {
    case "summary":
      return [sectionHeading("PROFILE"), para(content.profile, { spacingAfter: 80 })];
    case "skills":
      return buildSkillsParagraphs(content);
    case "selectedProjects":
      return buildProjectParagraphs(content);
    case "experience":
      return buildExperienceParagraphs(content);
    case "education": {
      const out: Paragraph[] = [sectionHeading("EDUCATION")];
      for (const ed of content.education) {
        out.push(para(`${ed.dates ? ed.dates + "  " : ""}${ed.line}`, { spacingAfter: 40 }));
        for (const d of ed.details ?? []) out.push(bulletPara(d));
      }
      return out;
    }
    case "technicalStack": {
      const groups = content.technicalStack.filter((t) => t.items?.trim());
      if (!groups.length) return [];
      const out: Paragraph[] = [sectionHeading("TECHNICAL STACK")];
      for (const t of groups) {
        out.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              run(`${t.group}: `, { bold: true, size: 18 }),
              run(t.items, { size: 18 }),
            ],
          }),
        );
      }
      return out;
    }
  }
}

export async function generateDocxAndPdf(
  content: AtsResumeContent,
  markdown: string,
  outDir: string,
  fileBase: string,
): Promise<{ docxPath: string; pdfPath: string | null; markdownPath: string; pageCount?: number }> {
  await mkdir(outDir, { recursive: true });

  const children: Paragraph[] = [...buildHeaderParagraphs(content)];
  for (const section of resolveOrder(content)) {
    children.push(...buildSectionParagraphs(content, section));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.55),
              bottom: convertInchesToTwip(0.55),
              left: convertInchesToTwip(0.65),
              right: convertInchesToTwip(0.65),
            },
          },
        },
        children,
      },
    ],
  });

  const docxPath = path.join(outDir, `${fileBase}.docx`);
  const pdfPath = path.join(outDir, `${fileBase}.pdf`);
  const markdownPath = path.join(outDir, `${fileBase}.md`);

  const buffer = await Packer.toBuffer(doc);
  await writeFile(docxPath, buffer);
  await writeFile(markdownPath, markdown, "utf8");

  let writtenPdf: string | null = pdfPath;
  let pageCount: number | undefined;
  try {
    const built = await buildAtsPdfBuffer(content);
    await writeFile(pdfPath, built.buffer);
    pageCount = built.pageCount;
  } catch (err) {
    console.warn("[export] PDF skipped:", err instanceof Error ? err.message : err);
    writtenPdf = null;
  }

  return { docxPath, pdfPath: writtenPdf, markdownPath, pageCount };
}

export function buildAtsPdfBuffer(
  content: AtsResumeContent,
): Promise<{ buffer: Buffer; pageCount: number }> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 42, bottom: 42, left: 48, right: 48 },
        autoFirstPage: true,
      });
      const chunks: Buffer[] = [];
      let pageCount = 1;
      doc.on("pageAdded", () => {
        pageCount += 1;
      });
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve({ buffer: Buffer.concat(chunks), pageCount }));
      doc.on("error", reject);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      const ensureSpace = (d: InstanceType<typeof PDFDocument>, needed: number) => {
        const bottom = d.page.height - d.page.margins.bottom;
        if (d.y + needed > bottom) d.addPage();
      };

      const write = (text: string, opts?: { bold?: boolean; size?: number; gap?: number }) => {
        doc
          .font(opts?.bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(opts?.size ?? 10)
          .fillColor("#111111")
          .text(text, { width: pageWidth, continued: false });
        doc.moveDown(opts?.gap ?? 0.3);
      };

      const name = content.documentTitle.includes(",")
        ? content.documentTitle.split(",")[0]!.trim()
        : content.documentTitle;
      const role =
        content.professionalTitle ??
        (content.documentTitle.includes(",")
          ? content.documentTitle.split(",").slice(1).join(",").trim()
          : "");

      write(name.toUpperCase(), { bold: true, size: 14, gap: 0.15 });
      if (role) write(role, { size: 11, gap: 0.25 });
      write(content.contactLine, { size: 9, gap: 0.15 });
      writePdfLinksRow(doc, resolveLinkUrls(content), pageWidth);
      doc.moveDown(0.55);

      const renderSection = (section: AtsSectionId) => {
        switch (section) {
          case "summary":
            write("PROFILE", { bold: true, size: 11, gap: 0.2 });
            write(content.profile, { gap: 0.45 });
            break;
          case "skills":
            write("SKILLS", { bold: true, size: 11, gap: 0.2 });
            if (content.skillGroups?.length) {
              for (const g of content.skillGroups) write(`${g.category}: ${g.items}`, { size: 9, gap: 0.15 });
              doc.moveDown(0.25);
            } else {
              write(content.skills.join(" · "), { gap: 0.45 });
            }
            break;
          case "experience":
            write("PROFESSIONAL EXPERIENCE", { bold: true, size: 11, gap: 0.25 });
            for (const e of content.experiences) {
              ensureSpace(doc, 72);
              const left = doc.page.margins.left;
              const y = doc.y;
              doc.font("Helvetica-Bold").fontSize(10).fillColor("#111111");
              doc.text(e.title, left, y, { width: pageWidth * 0.68, continued: false });
              if (e.dates) {
                doc.font("Helvetica").fontSize(9);
                doc.text(e.dates, left, y, { width: pageWidth, align: "right" });
              }
              doc.x = left;
              doc.y = Math.max(doc.y, y + 12);
              doc.moveDown(0.08);
              write([e.company, e.location].filter(Boolean).join(" | "), { size: 9, gap: 0.12 });
              if (e.companyBlurb) write(e.companyBlurb, { size: 9, gap: 0.12 });
              if (e.functionalFocus) write(e.functionalFocus, { size: 9, gap: 0.12 });
              for (const b of e.bullets) write(`• ${b}`, { size: 9.5, gap: 0.1 });
              doc.moveDown(0.3);
            }
            break;
          case "selectedProjects":
            write("SELECTED PROJECTS", { bold: true, size: 11, gap: 0.25 });
            for (const p of content.projects) {
              ensureSpace(doc, 90);
              const left = doc.page.margins.left;
              const y = doc.y;
              doc.font("Helvetica-Bold").fontSize(10).fillColor("#111111");
              doc.text(p.name, left, y, { width: pageWidth * 0.68, continued: false });
              if (p.dates) {
                doc.font("Helvetica").fontSize(9);
                doc.text(p.dates, left, y, { width: pageWidth, align: "right" });
              }
              doc.x = left;
              doc.y = Math.max(doc.y, y + 12);
              doc.moveDown(0.08);
              if (p.role) write(p.role, { size: 9, gap: 0.1 });
              if (p.blurb) write(p.blurb, { size: 9, gap: 0.1 });
              for (const b of p.bullets) write(`• ${b}`, { size: 9.5, gap: 0.1 });
              if (p.technologies) write(`Technologies: ${p.technologies}`, { size: 9, gap: 0.2 });
              doc.moveDown(0.25);
            }
            break;
          case "education":
            write("EDUCATION", { bold: true, size: 11, gap: 0.2 });
            for (const ed of content.education) {
              write(`${ed.dates ? ed.dates + " " : ""}${ed.line}`, { size: 9.5, gap: 0.1 });
              for (const d of ed.details ?? []) write(`• ${d}`, { size: 9, gap: 0.08 });
            }
            doc.moveDown(0.2);
            break;
          case "technicalStack": {
            const groups = content.technicalStack.filter((t) => t.items?.trim());
            if (!groups.length) break;
            write("TECHNICAL STACK", { bold: true, size: 11, gap: 0.2 });
            for (const t of groups) write(`${t.group}: ${t.items}`, { size: 9, gap: 0.12 });
            break;
          }
        }
      };

      for (const section of resolveOrder(content)) renderSection(section);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/** Clickable LinkedIn | Portfolio | GitHub — never prefixes LINKS, never continues into next heading. */
function writePdfLinksRow(
  doc: InstanceType<typeof PDFDocument>,
  urls: ResumeLinkUrls,
  pageWidth: number,
) {
  const items: { label: string; href: string }[] = [];
  if (urls.linkedinUrl) items.push({ label: "LinkedIn", href: urls.linkedinUrl });
  if (urls.portfolioUrl) items.push({ label: "Portfolio", href: urls.portfolioUrl });
  if (urls.githubUrl) items.push({ label: "GitHub", href: urls.githubUrl });

  doc.font("Helvetica").fontSize(9);
  if (!items.length) return;

  items.forEach((item, i) => {
    if (i > 0) {
      doc.fillColor("#111111").text(" | ", { continued: true, width: pageWidth });
    }
    doc.fillColor("#0B57D0").text(item.label, {
      link: item.href,
      underline: true,
      continued: i < items.length - 1,
      width: pageWidth,
    });
  });
  // Ensure continued run is closed on its own line before PROFILE
  doc.fillColor("#111111").text("");
  doc.moveDown(0.15);
}

/** @deprecated use generateDocxAndPdf */
export async function generateDocx(
  draft: ResumeDraft,
  contact: ResumeGenerationInput["contact"],
  outDir: string,
  fileBase: string,
) {
  const content = toAtsContent(draft, contact, "Candidate");
  return generateDocxAndPdf(content, draft.markdown, outDir, fileBase);
}
