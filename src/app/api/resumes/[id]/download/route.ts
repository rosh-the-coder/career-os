import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import os from "os";
import {
  buildAtsPdfBuffer,
  generateDocxAndPdf,
  toAtsContent,
  type AtsResumeContent,
} from "@/lib/resume/export-docx";
import { exportCompositionDocx, exportCompositionPdf } from "@/lib/resume-studio/export";
import type { CompositionDocument } from "@/lib/resume-studio/composition/types";
import type { ResumeDraft } from "@/lib/ai/types";
import { requireOwnedResume } from "@/lib/auth/ownership";
import { slugifyPersonName } from "@/lib/onboarding/defaults";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const format = new URL(_request.url).searchParams.get("format") ?? "docx";

  let version;
  let user;
  try {
    ({ version, user } = await requireOwnedResume(id));
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

  let composition: CompositionDocument | null = null;
  if (version.compositionJson) {
    try {
      composition = JSON.parse(version.compositionJson) as CompositionDocument;
    } catch {
      composition = null;
    }
  }
  if (!composition) {
    try {
      const parsed = JSON.parse(version.contentJson) as { composition?: CompositionDocument };
      composition = parsed.composition ?? null;
    } catch {
      composition = null;
    }
  }

  const fileBase = version.fileName ?? `${slugifyPersonName(user.name)}_${version.id}`;

  if (composition) {
    try {
      if (format === "pdf") {
        const built = await exportCompositionPdf(composition);
        return new NextResponse(new Uint8Array(built.buffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
          },
        });
      }
      const buf = await exportCompositionDocx(composition);
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${fileBase}.docx"`,
        },
      });
    } catch (err) {
      console.error("[download] V4 composition export failed:", err);
    }
  }

  let draft: ResumeDraft;
  let ats: AtsResumeContent | undefined;
  try {
    const parsed = JSON.parse(version.contentJson) as {
      draft?: ResumeDraft;
      ats?: AtsResumeContent;
    } & ResumeDraft;
    draft = parsed.draft ?? parsed;
    ats = parsed.ats;
  } catch {
    return NextResponse.json({ error: "Corrupt resume content" }, { status: 500 });
  }

  const settings = version.user.settings;
  if (!ats) {
    ats = toAtsContent(
      draft,
      {
        name: user.name,
        location: settings?.location || "",
        email: settings?.contactEmail || user.email,
        phone: settings?.phone || "",
        portfolioUrl: settings?.portfolioUrl || "",
        githubUrl: settings?.githubUrl || "",
        linkedinUrl: settings?.linkedinUrl || "",
      },
      version.profile.name,
    );
  }

  if (format === "pdf") {
    try {
      const built = await buildAtsPdfBuffer(ats);
      return new NextResponse(new Uint8Array(built.buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
        },
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `PDF failed: ${detail}` }, { status: 500 });
    }
  }

  try {
    const outDir = path.join(os.tmpdir(), "career-os-exports");
    const files = await generateDocxAndPdf(ats, version.markdown, outDir, fileBase);
    const buf = await readFile(files.docxPath);
    return new NextResponse(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileBase}.docx"`,
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `DOCX failed: ${detail}` }, { status: 500 });
  }
}
