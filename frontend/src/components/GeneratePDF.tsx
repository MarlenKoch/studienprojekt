import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable, { HookData } from "jspdf-autotable";
import { TableData } from "../types/TableData";

export const generatePDF = async (
  promptsJson: string,
  pdfTitle: string,
  logoUrl: string,
  hasPrompts: boolean
) => {
  // Logo als Base64-Datenurl
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

  // === Seite 1: Großer Titel und Logo oben
  doc.setFontSize(20);
  doc.text(pdfTitle, 40, 60);

  if (logoDataUrl)
    doc.addImage(
      logoDataUrl,
      "PNG",
      doc.internal.pageSize.getWidth() - 120,
      20,
      80,
      80
    );

  if (hasPrompts) {
    const parsed = JSON.parse(promptsJson);
    const promptsArray: TableData[] = Array.isArray(parsed.chats)
      ? parsed.chats
      : [];

    // === Tabelle
    autoTable(doc, {
      head: [["ID", "AI-Modell", "Task", "Prompt", "Zeit"]],
      body: promptsArray.map((row) => [
        row.id,
        row.aiModel,
        row.task,
        row.prompt ?? "",
        row.timestamp ? new Date(row.timestamp).toLocaleString("de-DE") : "",
      ]),
      startY: 120,
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [191, 170, 5] }, ////HIER FARBE ÄNDERNN
      theme: "striped",
      margin: { left: 30, right: 30, top: 50 },
      didDrawPage: (data: HookData) => {
        if (data.pageNumber > 1) {
          doc.setFontSize(12);
          doc.setTextColor(60);
          doc.text(pdfTitle, 40, 40);
        }
      },
    });
  } else {
    doc.setFontSize(18);
    doc.text(promptsJson, 200, 300);
  }

  doc.save(`${pdfTitle}.pdf`);
};
