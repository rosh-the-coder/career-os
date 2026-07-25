import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from "docx";
import PDFDocument from "pdfkit";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { ResumeDraft, ResumeGenerationInput } from "@/lib/ai/types";

export interface AtsResumeContent {
  documentTitle: string;
  contactLine: string;
  linksLine: string;
  profile: string;
  skills: string[];
  projects: {
    dates: string;
    name: string;
    blurb: string;
    role: string;
    bullets: string[];
    links?: string;
  }[];
  experiences: {
    dates: string;
    title: string;
    company: string;
    location?: string;
    companyBlurb?: string;
    bullets: string[];
  }[];
  education: { dates: string; line: string; details?: string[] }[];
  technicalStack: { group: string; items: string }[];
}

export function toAtsContent(
  draft: ResumeDraft,
  contact: ResumeGenerationInput["contact"] & { phone?: string },
  profileName: string,
): AtsResumeContent {
  const phone = contact.phone ?? "+353 838501604";
  return {
    documentTitle: `ROSHAN NAJAR, ${profileName}`,
    contactLine: `County Dublin, Ireland, ${phone}, ${contact.email}`,
    linksLine: `LINKS LinkedIn, Portfolio Website (${contact.portfolioUrl}), Github (${contact.githubUrl})`,
    profile: draft.summary,
    skills: draft.skills,
    projects: draft.projects.map((p) => ({
      dates: "",
      name: p.name,
      blurb: "",
      role: p.role,
      bullets: p.bullets,
      links: "[Website LINK] [Show-reel LINK] [Project Report]",
    })),
    experiences: draft.experiences.map((e) => ({
      dates: `${e.startDate} — ${e.endDate ?? "Present"}`,
      title: e.title,
      company: e.company,
      bullets: e.bullets,
    })),
    education: draft.education.map((line) => ({ dates: "", line })),
    technicalStack: [
      {
        group: "Design Tools",
        items: "Figma, Adobe Creative Cloud (Photoshop, After Effects, Premiere Pro), Framer",
      },
      {
        group: "Frontend Development",
        items: "HTML, CSS, JavaScript, TypeScript, React, Next.js, Tailwind CSS, Three.js, GSAP, Motion.dev",
      },
      {
        group: "Backend & Data",
        items: "Firebase, REST APIs, JSON, Node.js, Python, Streamlit, Vercel",
      },
      {
        group: "AI & Automation",
        items: "Cursor, ChatGPT, Gemini, Playwright, Apify, prompt engineering, human-in-the-loop workflows",
      },
      {
        group: "Immersive Design",
        items: "Unity + C#, WebGL, AR/VR interaction",
      },
    ],
  };
}

function docParagraph(text: string, opts?: { bold?: boolean; size?: number; spacingAfter?: number }) {
  return new Paragraph({
    spacing: { after: opts?.spacingAfter ?? 100 },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        size: opts?.size ?? 20,
        font: "Calibri",
      }),
    ],
  });
}

export async function generateDocxAndPdf(
  content: AtsResumeContent,
  markdown: string,
  outDir: string,
  fileBase: string,
): Promise<{ docxPath: string; pdfPath: string | null; markdownPath: string }> {
  await mkdir(outDir, { recursive: true });

  const children: Paragraph[] = [
    docParagraph(content.documentTitle, { bold: true, size: 28, spacingAfter: 60 }),
    docParagraph(content.contactLine, { size: 18, spacingAfter: 40 }),
    docParagraph(content.linksLine, { size: 18, spacingAfter: 160 }),
    docParagraph("PROFILE", { bold: true, size: 22 }),
    docParagraph(content.profile, { spacingAfter: 160 }),
    docParagraph("SKILLS", { bold: true, size: 22 }),
    docParagraph(content.skills.join(" · "), { spacingAfter: 160 }),
    docParagraph("SELECTED PROJECTS", { bold: true, size: 22 }),
  ];

  for (const p of content.projects) {
    children.push(docParagraph(`${p.dates ? p.dates + "  " : ""}${p.name}`, { bold: true, spacingAfter: 40 }));
    if (p.blurb) children.push(docParagraph(p.blurb, { size: 18, spacingAfter: 40 }));
    if (p.links) children.push(docParagraph(p.links, { size: 18, spacingAfter: 40 }));
    children.push(docParagraph(`Role: ${p.role}`, { size: 18, spacingAfter: 60 }));
    for (const b of p.bullets) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          indent: { left: convertInchesToTwip(0.15) },
          children: [new TextRun({ text: `• ${b}`, size: 20, font: "Calibri" })],
        }),
      );
    }
    children.push(docParagraph("", { spacingAfter: 80 }));
  }

  children.push(docParagraph("PROFESSIONAL EXPERIENCE", { bold: true, size: 22, spacingAfter: 120 }));
  for (const e of content.experiences) {
    children.push(
      docParagraph(`${e.dates}  ${e.title}, ${e.company}${e.location ? ` — ${e.location}` : ""}`, {
        bold: true,
        spacingAfter: 40,
      }),
    );
    if (e.companyBlurb) children.push(docParagraph(e.companyBlurb, { size: 18, spacingAfter: 60 }));
    for (const b of e.bullets) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          indent: { left: convertInchesToTwip(0.15) },
          children: [new TextRun({ text: `• ${b}`, size: 20, font: "Calibri" })],
        }),
      );
    }
    children.push(docParagraph("", { spacingAfter: 80 }));
  }

  children.push(docParagraph("EDUCATION", { bold: true, size: 22, spacingAfter: 100 }));
  for (const ed of content.education) {
    children.push(docParagraph(`${ed.dates ? ed.dates + "  " : ""}${ed.line}`, { spacingAfter: 40 }));
    for (const d of ed.details ?? []) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: convertInchesToTwip(0.15) },
          children: [new TextRun({ text: `• ${d}`, size: 18, font: "Calibri" })],
        }),
      );
    }
  }

  children.push(docParagraph("TECHNICAL STACK", { bold: true, size: 22, spacingAfter: 80 }));
  for (const t of content.technicalStack) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `${t.group}: `, bold: true, size: 18, font: "Calibri" }),
          new TextRun({ text: t.items, size: 18, font: "Calibri" }),
        ],
      }),
    );
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

  // PDF is nice-to-have — never fail the whole pack if PDFKit chokes
  let writtenPdf: string | null = pdfPath;
  try {
    const pdfBuf = await buildAtsPdfBuffer(content);
    await writeFile(pdfPath, pdfBuf);
  } catch (err) {
    console.warn("[export] PDF skipped:", err instanceof Error ? err.message : err);
    writtenPdf = null;
  }

  return { docxPath, pdfPath: writtenPdf, markdownPath };
}

function buildAtsPdfBuffer(content: AtsResumeContent): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 48, right: 48 },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const write = (text: string, opts?: { bold?: boolean; size?: number; gap?: number }) => {
      doc
        .font(opts?.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(opts?.size ?? 10)
        .fillColor("#111")
        .text(text, { width: doc.page.width - 96 });
      doc.moveDown(opts?.gap ?? 0.35);
    };

    write(content.documentTitle, { bold: true, size: 14, gap: 0.2 });
    write(content.contactLine, { size: 9, gap: 0.15 });
    write(content.linksLine, { size: 9, gap: 0.6 });
    write("PROFILE", { bold: true, size: 11 });
    write(content.profile, { gap: 0.55 });
    write("SKILLS", { bold: true, size: 11 });
    write(content.skills.join(" · "), { gap: 0.55 });
    write("SELECTED PROJECTS", { bold: true, size: 11 });
    for (const p of content.projects) {
      write(`${p.dates ? p.dates + "  " : ""}${p.name}`, { bold: true, gap: 0.15 });
      if (p.blurb) write(p.blurb, { size: 9, gap: 0.12 });
      if (p.links) write(p.links, { size: 9, gap: 0.1 });
      write(`Role: ${p.role}`, { size: 9, gap: 0.15 });
      for (const b of p.bullets) write(`• ${b}`, { size: 9.5, gap: 0.12 });
      doc.moveDown(0.25);
    }
    write("PROFESSIONAL EXPERIENCE", { bold: true, size: 11 });
    for (const e of content.experiences) {
      write(
        `${e.dates}  ${e.title}, ${e.company}${e.location ? ` — ${e.location}` : ""}`,
        { bold: true, gap: 0.15 },
      );
      if (e.companyBlurb) write(e.companyBlurb, { size: 9, gap: 0.12 });
      for (const b of e.bullets) write(`• ${b}`, { size: 9.5, gap: 0.12 });
      doc.moveDown(0.2);
    }
    write("EDUCATION", { bold: true, size: 11 });
    for (const ed of content.education) write(`${ed.dates ? ed.dates + " " : ""}${ed.line}`, { size: 9.5 });
    doc.moveDown(0.3);
    write("TECHNICAL STACK", { bold: true, size: 11 });
    for (const t of content.technicalStack) write(`${t.group}: ${t.items}`, { size: 9, gap: 0.12 });

    doc.end();
  });
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
