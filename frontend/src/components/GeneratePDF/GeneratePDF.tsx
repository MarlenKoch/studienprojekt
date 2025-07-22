import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable, { HookData } from "jspdf-autotable";
import { toast } from "react-toastify";
import {
  TableData,
  ParagraphString,
  PromptVerzeichnisContent,
  ParagraphsContent,
} from "../../types/TableData";

type ContentJsonType = Partial<PromptVerzeichnisContent & ParagraphsContent>;

function truncateTextToWidth(
  doc: jsPDF,
  text: string,
  maxWidth: number
): string {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let truncated = text;
  while (
    doc.getTextWidth(truncated + "...") > maxWidth &&
    truncated.length > 0
  ) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "...";
}

// === Funktion ===
export const generatePDF = async (
  contentJson: string,
  pdfTitle: string,
  logoUrl: string,
  isPromptVerzeichnis: boolean
) => {
  async function getImgDataUrl(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
  const logoDataUrl = await getImgDataUrl(logoUrl);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  // ===== TITEL & LOGO =====
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const titleMaxWidth = pageWidth - 2 * margin - 100;
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  const splitTitle: string[] = doc.splitTextToSize(
    pdfTitle,
    titleMaxWidth
  ) as string[];
  const titleHeight = splitTitle.length * 24;
  const titleY = 60;
  doc.text(splitTitle, margin, titleY, { maxWidth: titleMaxWidth });

  let logoHeight = 0;
  if (logoDataUrl) {
    const logoY = 20;
    const logoW = 80;
    const logoH = 80;
    doc.addImage(logoDataUrl, "PNG", pageWidth - 120, logoY, logoW, logoH);
    logoHeight = logoY + logoH;
  }
  const topElementBottom = Math.max(titleY + titleHeight, logoHeight);
  const contentStartY = topElementBottom + 30;

  // ==== PARSING (typisiert) ====
  let parsed: ContentJsonType = {};
  try {
    parsed = contentJson ? JSON.parse(contentJson) : {};
  } catch (e) {
    parsed = {};
    toast.error("Ungültiges Format");
    console.error(e);
  }

  if (isPromptVerzeichnis) {
    // === Tabelle ===
    const chatsArr: TableData[] = Array.isArray(parsed.chats)
      ? parsed.chats
      : [];
    if (chatsArr.length === 0) {
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text("Keine KI verwendet", margin, contentStartY + 20);
    } else {
      autoTable(doc, {
        head: [["Nr.", "KI-Modell", "Aufgabe", "Prompt", "Datum"]],
        body: chatsArr.map((row: TableData) => [
          row.id,
          row.aiModel,
          row.task,
          row.prompt ?? "",
          row.timestamp ? new Date(row.timestamp).toLocaleString("de-DE") : "",
        ]),
        startY: contentStartY,
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [95, 106, 114] },
        theme: "striped",
        margin: { left: 30, right: 30, top: 50 },
        didDrawPage: (data: HookData) => {
          if (data.pageNumber > 1) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60);
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 40;
            const titleMaxWidth = pageWidth - 2 * margin;

            // Hier den Titel genau passend kürzen:
            const truncatedTitle = truncateTextToWidth(
              doc,
              pdfTitle,
              titleMaxWidth
            );

            doc.text(truncatedTitle, margin, 40, { maxWidth: titleMaxWidth });
          }
        },
      });
    }
  } else {
    // ==== Paragraphen ====
    const paragraphsArr: ParagraphString[] = Array.isArray(parsed.paragraphs)
      ? parsed.paragraphs
      : [];
    if (paragraphsArr.length > 0) {
      let y = contentStartY;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const usableWidth = pageWidth - 2 * margin;

      paragraphsArr.forEach((para: ParagraphString) => {
        if (!para.content) return;
        const lines: string[] = doc.splitTextToSize(
          para.content,
          usableWidth
        ) as string[];
        lines.forEach((line: string) => {
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 18;
        });
        y += 8;
      });
    }
  }

  doc.save(`${pdfTitle}.pdf`);
};
