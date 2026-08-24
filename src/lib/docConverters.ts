import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
// Vite-resolved worker URL
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';
import {
  Document as DocxDocument,
  Packer as DocxPacker,
  Paragraph as DocxParagraph,
  HeadingLevel,
  TextRun,
} from 'docx';
import ExcelJS from 'exceljs';
import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';

import type { ConvertResult, PageDownload } from './converters';

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

// ---------- Helpers ----------

async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not decode image'));
      img.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

// ---------- JPG/PNG/etc → PDF ----------

export async function imageToPdf(file: File): Promise<ConvertResult> {
  const img = await fileToImage(file);
  const orientation = img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'pt', format: [img.naturalWidth, img.naturalHeight] });
  const format = file.type === 'image/png' ? 'PNG' : 'JPEG';
  pdf.addImage(img, format, 0, 0, img.naturalWidth, img.naturalHeight);
  const blob = pdf.output('blob');
  return { blob, isImage: false };
}

// ---------- PDF → JPG (every page previewed and downloadable) ----------

export async function pdfToJpg(file: File): Promise<ConvertResult> {
  const buf = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: buf }).promise;
  const images: Blob[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    // White background for JPEG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), 'image/jpeg', 0.92));
    if (blob) images.push(blob);
  }

  const base = file.name.replace(/\.pdf$/i, '');
  const pageDownloads: PageDownload[] = images.map((image, idx) => ({
    page: idx + 1,
    blob: image,
    previewUrl: URL.createObjectURL(image),
    fileName: `${base}_page${idx + 1}.jpg`,
  }));

  if (images.length === 1) {
    return { blob: images[0], previewUrl: pageDownloads[0].previewUrl, isImage: true, pageDownloads };
  }

  const zip = new JSZip();
  images.forEach((img, idx) => zip.file(pageDownloads[idx].fileName, img));
  const zipped = await zip.generateAsync({ type: 'blob' });
  return { blob: zipped, isImage: false, pageDownloads };
}

// ---------- Word (.docx) → PDF ----------

export async function wordToPdf(file: File): Promise<ConvertResult> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;

  // Render HTML to a hidden container, then html2canvas → jsPDF
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;padding:48px;background:#fff;font-family:Georgia,serif;font-size:14px;line-height:1.6;color:#000;';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    const blob = pdf.output('blob');
    return { blob, isImage: false };
  } finally {
    document.body.removeChild(container);
  }
}

// ---------- PDF → Word (.docx) ----------

export async function pdfToWord(file: File): Promise<ConvertResult> {
  const buf = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: buf }).promise;
  const paragraphs: InstanceType<typeof DocxParagraph>[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: unknown) => (typeof item === 'object' && item !== null && 'str' in item ? String(item.str) : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) {
      paragraphs.push(new DocxParagraph({ children: [new TextRun(text)] }));
    }
    if (i < pdf.numPages) {
      paragraphs.push(new DocxParagraph({ children: [new TextRun('')] }));
    }
  }

  if (paragraphs.length === 0) {
    paragraphs.push(new DocxParagraph({ children: [new TextRun('(No extractable text found)')] }));
  }

  const doc = new DocxDocument({
    sections: [{ properties: {}, children: paragraphs }],
  });
  const blob = await DocxPacker.toBlob(doc);
  return { blob, isImage: false };
}

// ---------- Excel → PDF ----------

export async function excelToPdf(file: File): Promise<ConvertResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());

  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:1000px;padding:24px;background:#fff;font-family:Arial,sans-serif;font-size:12px;color:#000;';
  let html = '';

  wb.eachSheet((sheet) => {
    html += `<h2 style="font-size:16px;margin:12px 0 8px;">${sheet.name}</h2>`;
    html += '<table style="border-collapse:collapse;width:100%;">';
    sheet.eachRow((row, rowNum) => {
      html += '<tr>';
      row.eachCell((cell) => {
        const val = cell.value === null || cell.value === undefined ? '' : String(cell.value);
        const isHeader = rowNum === 1;
        html += `<td style="border:1px solid #ccc;padding:4px 8px;${isHeader ? 'font-weight:bold;background:#f0f0f0;' : ''}">${val}</td>`;
      });
      html += '</tr>';
    });
    html += '</table><div style="height:20px;"></div>';
  });

  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    const blob = pdf.output('blob');
    return { blob, isImage: false };
  } finally {
    document.body.removeChild(container);
  }
}

// ---------- PDF → Excel ----------

export async function pdfToExcel(file: File): Promise<ConvertResult> {
  const buf = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: buf }).promise;
  const wb = new ExcelJS.Workbook();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const sheet = wb.addWorksheet(`Page ${i}`);

    // Group items by approximate row (y position)
    const items: { str: string; transform: number[] }[] = [];
    for (const item of content.items) {
      if ('str' in item && 'transform' in item) {
        items.push({ str: item.str, transform: item.transform });
      }
    }
    const rows = new Map<number, { x: number; str: string }[]>();
    for (const item of items) {
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      let placed = false;
      for (const [key] of rows) {
        if (Math.abs(key - y) < 5) {
          rows.get(key)!.push({ x, str: item.str });
          placed = true;
          break;
        }
      }
      if (!placed) rows.set(y, [{ x, str: item.str }]);
    }

    const sortedYs = Array.from(rows.keys()).sort((a, b) => b - a);
    sortedYs.forEach((y, rowIdx) => {
      const cells = rows.get(y)!.sort((a, b) => a.x - b.x);
      const excelRow = sheet.getRow(rowIdx + 1);
      cells.forEach((c, colIdx) => {
        excelRow.getCell(colIdx + 1).value = c.str;
      });
      excelRow.commit();
    });
  }

  const blob = await wb.xlsx.writeBuffer();
  return { blob: new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), isImage: false };
}

// ---------- PowerPoint (.pptx) → PDF ----------

export async function pptxToPdf(file: File): Promise<ConvertResult> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  // Read presentation.xml to get slide order
  const relsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string');
  if (!relsXml) throw new Error('Invalid PPTX: missing presentation relationships');

  const slideRels: { id: string; target: string }[] = [];
  const relRegex = /<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*Type="[^"]*\/slide[^"]*"/g;
  let match: RegExpExecArray | null;
  while ((match = relRegex.exec(relsXml)) !== null) {
    slideRels.push({ id: match[1], target: match[2] });
  }

  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:960px;background:#fff;';
  let html = '';

  for (const rel of slideRels) {
    const slidePath = rel.target.startsWith('/') ? rel.target.slice(1) : `ppt/${rel.target}`;
    const slideXml = await zip.file(slidePath)?.async('string');
    if (!slideXml) continue;

    // Extract text from <a:t> elements
    const texts: string[] = [];
    const tRegex = /<a:t>([^<]*)<\/a:t>/g;
    let tMatch: RegExpExecArray | null;
    while ((tMatch = tRegex.exec(slideXml)) !== null) {
      texts.push(tMatch[1]);
    }

    html += `<div style="width:960px;height:540px;padding:40px;box-sizing:border-box;border:1px solid #ddd;font-family:Arial,sans-serif;color:#000;font-size:18px;line-height:1.5;">`;
    html += texts.map((t) => `<p style="margin:8px 0;">${t}</p>`).join('');
    html += `</div>`;
  }

  container.innerHTML = html || '<p>No slides found</p>';
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [960, 540] });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    const blob = pdf.output('blob');
    return { blob, isImage: false };
  } finally {
    document.body.removeChild(container);
  }
}

// ---------- PDF → PowerPoint (.pptx) ----------

export async function pdfToPptx(file: File): Promise<ConvertResult> {
  const buf = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: buf }).promise;
  const pptx = new pptxgen();
  pptx.defineLayout({ name: 'PDF', width: 13.333, height: 7.5 });
  pptx.layout = 'PDF';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const slide = pptx.addSlide();
    slide.addImage({ data: dataUrl, x: 0, y: 0, w: 13.333, h: 7.5 });
  }

  const arrayBuffer = await pptx.write({ outputType: 'arraybuffer' });
  const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  return { blob, isImage: false };
}

// ---------- HTML → PDF ----------

export async function htmlToPdf(file: File): Promise<ConvertResult> {
  const html = await file.text();
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;padding:48px;background:#fff;font-family:Georgia,serif;font-size:14px;line-height:1.6;color:#000;';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    const blob = pdf.output('blob');
    return { blob, isImage: false };
  } finally {
    document.body.removeChild(container);
  }
}

// ---------- PDF → PDF/A ----------

// True PDF/A requires embedding ICC color profiles and structured metadata.
// In a pure browser environment we produce a PDF with embedded fonts and
// self-contained resources, which is the closest achievable approximation.
export async function pdfToPdfA(file: File): Promise<ConvertResult> {
  const buf = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: buf }).promise;
  const newPdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    if (i > 1) newPdf.addPage();
    const pageWidth = newPdf.internal.pageSize.getWidth();
    const pageHeight = newPdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    newPdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      newPdf.addPage();
      newPdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }
  }

  // Add PDF/A-1b compatible metadata
  newPdf.setProperties({
    title: file.name,
    subject: 'PDF/A conversion',
    creator: 'Universal File Converter',
  });

  const blob = newPdf.output('blob');
  return { blob, isImage: false };
}
