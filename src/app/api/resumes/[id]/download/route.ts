import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import os from "os";
import { prisma } from "@/lib/db/prisma";
import { generateDocxAndPdf, toAtsContent, type AtsResumeContent } from "@/lib/resume/export-docx";
import type { ResumeDraft } from "@/lib/ai/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const format = new URL(_request.url).searchParams.get("format") ?? "docx";

  const version = await prisma.resumeVersion.findUnique({
    where: { id },
    include: { profile: true, job: true },
  });
  if (!version) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Prefer existing file if present (local /tmp)
  if (format === "docx" && version.docxPath) {
    try {
      const buf = await readFile(version.docxPath);
      return new NextResponse(buf, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${version.fileName ?? "resume"}.docx"`,
        },
      });
    } catch {
      /* regenerate below */
    }
  }

  if (format === "pdf" && version.pdfPath) {
    try {
      const buf = await readFile(version.pdfPath);
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${version.fileName ?? "resume"}.pdf"`,
        },
      });
    } catch {
      /* regenerate below */
    }
  }

  let draft: ResumeDraft;
  let ats: AtsResumeContent | undefined;
  try {
    const parsed = JSON.parse(version.contentJson) as { draft?: ResumeDraft; ats?: AtsResumeContent } & ResumeDraft;
    draft = parsed.draft ?? parsed;
    ats = parsed.ats;
  } catch {
    return NextResponse.json({ error: "Corrupt resume content" }, { status: 500 });
  }

  if (!ats) {
    ats = toAtsContent(
      draft,
      {
        name: "Roshan Najar",
        location: "Dublin, Ireland",
        email: "theonlyroshn@gmail.com",
        phone: "+353 838501604",
        portfolioUrl: "https://theonlyrosh.com/",
        githubUrl: "https://github.com/rosh-the-coder",
        linkedinUrl: "https://www.linkedin.com/in/roshan-najar-0556711b4/",
      },
      version.profile.name,
    );
  }

  const outDir = path.join(os.tmpdir(), "career-os-exports");
  const fileBase = version.fileName ?? `Roshan_Najar_${version.id}`;
  const files = await generateDocxAndPdf(ats, draft.markdown || version.markdown, outDir, fileBase);

  if (format === "pdf") {
    if (!files.pdfPath) {
      return NextResponse.json(
        { error: "PDF unavailable — download DOCX instead" },
        { status: 404 },
      );
    }
    const buf = await readFile(files.pdfPath);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
      },
    });
  }

  const buf = await readFile(files.docxPath);
  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileBase}.docx"`,
    },
  });
}
