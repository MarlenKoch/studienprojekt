import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { HookData } from "jspdf-autotable";
import { TableData } from "../types/TableData";

export const generatePDF = async (
  promptsJson: string,
  pdfTitle: string,
  logoUrl: string // <-- Logo als Bild-URL
) => {
  const parsed = JSON.parse(promptsJson);
  const promptsArray: TableData[] = Array.isArray(parsed.chats)
    ? parsed.chats
    : [];
  // Logo als Base64-Datenurl laden (geht für PNG/JPG)
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

  // Titel
  doc.setFontSize(20);
  doc.text(pdfTitle, 40, 60);

  // Logo oben rechts
  if (logoDataUrl)
    doc.addImage(
      logoDataUrl,
      "PNG",
      doc.internal.pageSize.getWidth() - 120,
      20,
      80,
      80
    );

  console.log(promptsArray);
  // Autotable für PDF (Seitenumbruch, Spaltenbreiten etc. automatisch)
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
    headStyles: { fillColor: [79, 140, 255] },
    theme: "striped",
    margin: { left: 30, right: 30 },
    didDrawPage: (data: HookData) => {
      if (data.pageNumber !== 1) {
        doc.setFontSize(16);
        doc.setTextColor(40);
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
      }
    },
  });

  doc.save(`${pdfTitle}.pdf`);
};
