export type ConverterId =
  | 'image-png'
  | 'image-jpeg'
  | 'image-webp'
  | 'image-bmp'
  | 'jpg-to-pdf'
  | 'pdf-to-jpg'
  | 'word-to-pdf'
  | 'pdf-to-word'
  | 'excel-to-pdf'
  | 'pdf-to-excel'
  | 'pptx-to-pdf'
  | 'pdf-to-pptx'
  | 'html-to-pdf'
  | 'pdf-to-pdfa'
  | 'json-to-csv'
  | 'csv-to-json'
  | 'json-to-xml'
  | 'xml-to-json'
  | 'markdown-to-html'
  | 'html-to-markdown'
  | 'encode-base64'
  | 'decode-base64'
  | 'encode-url'
  | 'decode-url';

export type ConverterCategory = 'Image' | 'PDF & Office' | 'Data' | 'Document' | 'Text';

export interface ConverterDef {
  id: ConverterId;
  label: string;
  category: ConverterCategory;
  accept: string[];
  outputExt: string;
  outputMime: string;
  description: string;
}

export const CONVERTERS: ConverterDef[] = [
  { id: 'image-png', label: 'Image → PNG', category: 'Image', accept: ['image/*'], outputExt: 'png', outputMime: 'image/png', description: 'Raster image to PNG' },
  { id: 'image-jpeg', label: 'Image → JPEG', category: 'Image', accept: ['image/*'], outputExt: 'jpg', outputMime: 'image/jpeg', description: 'Raster image to JPEG' },
  { id: 'image-webp', label: 'Image → WebP', category: 'Image', accept: ['image/*'], outputExt: 'webp', outputMime: 'image/webp', description: 'Raster image to WebP' },
  { id: 'image-bmp', label: 'Image → BMP', category: 'Image', accept: ['image/*'], outputExt: 'bmp', outputMime: 'image/bmp', description: 'Raster image to BMP' },
  { id: 'jpg-to-pdf', label: 'JPG → PDF', category: 'PDF & Office', accept: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', '.jpg', '.jpeg', '.png'], outputExt: 'pdf', outputMime: 'application/pdf', description: 'Image to PDF document' },
  { id: 'pdf-to-jpg', label: 'PDF → JPG', category: 'PDF & Office', accept: ['application/pdf', '.pdf'], outputExt: 'zip', outputMime: 'application/zip', description: 'PDF pages to JPG images' },
  { id: 'word-to-pdf', label: 'Word → PDF', category: 'PDF & Office', accept: ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], outputExt: 'pdf', outputMime: 'application/pdf', description: 'Word document to PDF' },
  { id: 'pdf-to-word', label: 'PDF → Word', category: 'PDF & Office', accept: ['application/pdf', '.pdf'], outputExt: 'docx', outputMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', description: 'PDF to Word document' },
  { id: 'excel-to-pdf', label: 'Excel → PDF', category: 'PDF & Office', accept: ['.xlsx', '.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'], outputExt: 'pdf', outputMime: 'application/pdf', description: 'Spreadsheet to PDF' },
  { id: 'pdf-to-excel', label: 'PDF → Excel', category: 'PDF & Office', accept: ['application/pdf', '.pdf'], outputExt: 'xlsx', outputMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'PDF to Excel spreadsheet' },
  { id: 'pptx-to-pdf', label: 'PowerPoint → PDF', category: 'PDF & Office', accept: ['.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'], outputExt: 'pdf', outputMime: 'application/pdf', description: 'Presentation to PDF' },
  { id: 'pdf-to-pptx', label: 'PDF → PowerPoint', category: 'PDF & Office', accept: ['application/pdf', '.pdf'], outputExt: 'pptx', outputMime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', description: 'PDF to presentation' },
  { id: 'html-to-pdf', label: 'HTML → PDF', category: 'PDF & Office', accept: ['.html', '.htm', 'text/html'], outputExt: 'pdf', outputMime: 'application/pdf', description: 'Web page to PDF' },
  { id: 'pdf-to-pdfa', label: 'PDF → PDF/A', category: 'PDF & Office', accept: ['application/pdf', '.pdf'], outputExt: 'pdf', outputMime: 'application/pdf', description: 'PDF to archival PDF/A' },
  { id: 'json-to-csv', label: 'JSON → CSV', category: 'Data', accept: ['.json', 'application/json'], outputExt: 'csv', outputMime: 'text/csv', description: 'Flatten JSON array to CSV' },
  { id: 'csv-to-json', label: 'CSV → JSON', category: 'Data', accept: ['.csv', 'text/csv'], outputExt: 'json', outputMime: 'application/json', description: 'Parse CSV into JSON array' },
  { id: 'json-to-xml', label: 'JSON → XML', category: 'Data', accept: ['.json', 'application/json'], outputExt: 'xml', outputMime: 'application/xml', description: 'Convert JSON object to XML' },
  { id: 'xml-to-json', label: 'XML → JSON', category: 'Data', accept: ['.xml', 'application/xml', 'text/xml'], outputExt: 'json', outputMime: 'application/json', description: 'Parse XML into JSON' },
  { id: 'markdown-to-html', label: 'Markdown → HTML', category: 'Document', accept: ['.md', '.markdown', 'text/markdown'], outputExt: 'html', outputMime: 'text/html', description: 'Render Markdown to HTML' },
  { id: 'html-to-markdown', label: 'HTML → Markdown', category: 'Document', accept: ['.html', '.htm', 'text/html'], outputExt: 'md', outputMime: 'text/markdown', description: 'Simplify HTML to Markdown' },
  { id: 'encode-base64', label: 'Encode Base64', category: 'Text', accept: ['*'], outputExt: 'txt', outputMime: 'text/plain', description: 'Base64-encode file bytes' },
  { id: 'decode-base64', label: 'Decode Base64', category: 'Text', accept: ['.txt', '.b64', 'text/plain'], outputExt: 'bin', outputMime: 'application/octet-stream', description: 'Decode Base64 back to bytes' },
  { id: 'encode-url', label: 'Encode URL', category: 'Text', accept: ['*'], outputExt: 'txt', outputMime: 'text/plain', description: 'URL-encode text content' },
  { id: 'decode-url', label: 'Decode URL', category: 'Text', accept: ['*'], outputExt: 'txt', outputMime: 'text/plain', description: 'URL-decode text content' },
];

export function getConverter(id: ConverterId): ConverterDef {
  const c = CONVERTERS.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown converter: ${id}`);
  return c;
}

export interface PageDownload {
  page: number;
  blob: Blob;
  previewUrl: string;
  fileName: string;
}

export interface ConvertResult {
  blob: Blob;
  previewText?: string;
  previewUrl?: string;
  isImage: boolean;
  pageDownloads?: PageDownload[];
}

// ---------- Image conversion ----------

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not decode image'));
      img.src = url;
    });
  } finally {
    // Revoke after load; the decoded bitmap lives in the element
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

async function convertImage(file: File, mime: string): Promise<ConvertResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), mime, 0.92)
  );
  if (!blob) throw new Error('Conversion failed');
  return {
    blob,
    previewUrl: URL.createObjectURL(blob),
    isImage: true,
  };
}

// ---------- Data conversions ----------

function flattenRow(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v === null || v === undefined) {
      out[key] = '';
    } else if (typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenRow(v as Record<string, unknown>, key));
    } else if (Array.isArray(v)) {
      out[key] = JSON.stringify(v);
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

function jsonToCsv(text: string): string {
  const data = JSON.parse(text);
  const arr: unknown[] = Array.isArray(data) ? data : [data];
  const flatRows = arr.map((r) =>
    typeof r === 'object' && r !== null ? flattenRow(r as Record<string, unknown>) : { value: String(r) }
  );
  const headers = Array.from(
    flatRows.reduce((set, row) => {
      Object.keys(row).forEach((h) => set.add(h));
      return set;
    }, new Set<string>())
  );
  const escape = (s: string) => {
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(',')];
  for (const row of flatRows) {
    lines.push(headers.map((h) => escape(row[h] ?? '')).join(','));
  }
  return lines.join('\n');
}

function csvToJson(text: string): string {
  const rows: string[][] = [];
  let cur = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); rows.push(row); row = []; cur = '';
    } else cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  const trimmed = rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
  if (trimmed.length === 0) return '[]';
  const headers = trimmed[0];
  const out = trimmed.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
    return obj;
  });
  return JSON.stringify(out, null, 2);
}

function jsonToXml(obj: unknown, root = 'root'): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  const build = (val: unknown, name: string): string => {
    const safeName = name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1') || 'item';
    if (val === null || val === undefined) return `<${safeName}/>`;
    if (Array.isArray(val)) {
      return val.map((v) => build(v, safeName)).join('');
    }
    if (typeof val === 'object') {
      const inner = Object.entries(val).map(([k, v]) => build(v, k)).join('');
      return `<${safeName}>${inner}</${safeName}>`;
    }
    return `<${safeName}>${esc(String(val))}</${safeName}>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n${build(obj, root)}`;
}

function xmlToJson(text: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (err) throw new Error('Invalid XML');
  const nodeToObj = (node: Element): unknown => {
    const childEls = Array.from(node.children);
    if (childEls.length === 0) {
      return node.textContent?.trim() || '';
    }
    const obj: Record<string, unknown> = {};
    for (const child of childEls) {
      const val = nodeToObj(child);
      if (obj[child.tagName] !== undefined) {
        if (!Array.isArray(obj[child.tagName])) {
          obj[child.tagName] = [obj[child.tagName]];
        }
        (obj[child.tagName] as unknown[]).push(val);
      } else {
        obj[child.tagName] = val;
      }
    }
    return obj;
  };
  const root = doc.documentElement;
  const result: Record<string, unknown> = {};
  result[root.tagName] = nodeToObj(root);
  return JSON.stringify(result, null, 2);
}

// ---------- Document conversions ----------

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const html: string[] = [];
  let inList = false;
  let inCode = false;
  const closeList = () => { if (inList) { html.push('</ul>'); inList = false; } };
  for (const line of lines) {
    if (line.trim().startsWith('```')) { inCode = !inCode; continue; }
    if (inCode) { html.push(`<pre><code>${escapeHtml(line)}</code></pre>`); continue; }
    if (/^#{1,6}\s/.test(line)) {
      closeList();
      const level = line.match(/^#+/)![0].length;
      const text = line.replace(/^#+\s/, '');
      html.push(`<h${level}>${inline(text)}</h${level}>`);
    } else if (/^[-*]\s/.test(line)) {
      if (!inList) { html.push('<ul>'); inList = true; }
      html.push(`<li>${inline(line.replace(/^[-*]\s/, ''))}</li>`);
    } else if (/^>\s/.test(line)) {
      closeList();
      html.push(`<blockquote>${inline(line.replace(/^>\s/, ''))}</blockquote>`);
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return html.join('\n');
  function inline(s: string): string {
    return escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  }
}

function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const inner = Array.from(el.childNodes).map(walk).join('');
    switch (tag) {
      case 'h1': return `\n# ${inner}\n`;
      case 'h2': return `\n## ${inner}\n`;
      case 'h3': return `\n### ${inner}\n`;
      case 'h4': return `\n#### ${inner}\n`;
      case 'h5': return `\n##### ${inner}\n`;
      case 'h6': return `\n###### ${inner}\n`;
      case 'p': return `\n${inner}\n`;
      case 'strong': case 'b': return `**${inner}**`;
      case 'em': case 'i': return `*${inner}*`;
      case 'code': return `\`${inner}\``;
      case 'pre': return `\n\`\`\`\n${inner}\n\`\`\`\n`;
      case 'a': return `[${inner}](${el.getAttribute('href') || ''})`;
      case 'ul': return `\n${Array.from(el.children).map((li) => `- ${walk(li)}`).join('\n')}\n`;
      case 'ol': return `\n${Array.from(el.children).map((li, i) => `${i + 1}. ${walk(li)}`).join('\n')}\n`;
      case 'blockquote': return `\n> ${inner}\n`;
      case 'br': return '\n';
      default: return inner;
    }
  };
  return walk(doc.body).replace(/\n{3,}/g, '\n\n').trim();
}

// ---------- Text conversions ----------

async function encodeBase64(file: File): Promise<ConvertResult> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const text = btoa(binary);
  return { blob: new Blob([text], { type: 'text/plain' }), previewText: text.slice(0, 5000), isImage: false };
}

async function decodeBase64(file: File): Promise<ConvertResult> {
  const text = await file.text();
  const cleaned = text.replace(/\s/g, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  // Try to detect if it's an image
  const isImage = bytes[0] === 0x89 && bytes[1] === 0x50; // PNG signature
  let previewUrl: string | undefined;
  if (isImage) {
    const blob = new Blob([bytes], { type: 'image/png' });
    previewUrl = URL.createObjectURL(blob);
    return { blob, previewUrl, isImage: true };
  }
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const preview = new TextDecoder().decode(bytes).slice(0, 5000);
  return { blob, previewText: preview, isImage: false };
}

async function encodeUrl(file: File): Promise<ConvertResult> {
  const text = await file.text();
  const encoded = encodeURIComponent(text);
  return { blob: new Blob([encoded], { type: 'text/plain' }), previewText: encoded.slice(0, 5000), isImage: false };
}

async function decodeUrl(file: File): Promise<ConvertResult> {
  const text = await file.text();
  const decoded = decodeURIComponent(text);
  return { blob: new Blob([decoded], { type: 'text/plain' }), previewText: decoded.slice(0, 5000), isImage: false };
}

// ---------- Main dispatch ----------

export async function convert(file: File, id: ConverterId): Promise<ConvertResult> {
  switch (id) {
    case 'image-png': return convertImage(file, 'image/png');
    case 'image-jpeg': return convertImage(file, 'image/jpeg');
    case 'image-webp': return convertImage(file, 'image/webp');
    case 'image-bmp': return convertImage(file, 'image/bmp');
    case 'jpg-to-pdf': {
      const { imageToPdf } = await import('./docConverters');
      return imageToPdf(file);
    }
    case 'pdf-to-jpg': {
      const { pdfToJpg } = await import('./docConverters');
      return pdfToJpg(file);
    }
    case 'word-to-pdf': {
      const { wordToPdf } = await import('./docConverters');
      return wordToPdf(file);
    }
    case 'pdf-to-word': {
      const { pdfToWord } = await import('./docConverters');
      return pdfToWord(file);
    }
    case 'excel-to-pdf': {
      const { excelToPdf } = await import('./docConverters');
      return excelToPdf(file);
    }
    case 'pdf-to-excel': {
      const { pdfToExcel } = await import('./docConverters');
      return pdfToExcel(file);
    }
    case 'pptx-to-pdf': {
      const { pptxToPdf } = await import('./docConverters');
      return pptxToPdf(file);
    }
    case 'pdf-to-pptx': {
      const { pdfToPptx } = await import('./docConverters');
      return pdfToPptx(file);
    }
    case 'html-to-pdf': {
      const { htmlToPdf } = await import('./docConverters');
      return htmlToPdf(file);
    }
    case 'pdf-to-pdfa': {
      const { pdfToPdfA } = await import('./docConverters');
      return pdfToPdfA(file);
    }
    case 'json-to-csv': {
      const text = await file.text();
      const out = jsonToCsv(text);
      return { blob: new Blob([out], { type: 'text/csv' }), previewText: out.slice(0, 5000), isImage: false };
    }
    case 'csv-to-json': {
      const text = await file.text();
      const out = csvToJson(text);
      return { blob: new Blob([out], { type: 'application/json' }), previewText: out, isImage: false };
    }
    case 'json-to-xml': {
      const text = await file.text();
      const out = jsonToXml(JSON.parse(text));
      return { blob: new Blob([out], { type: 'application/xml' }), previewText: out, isImage: false };
    }
    case 'xml-to-json': {
      const text = await file.text();
      const out = xmlToJson(text);
      return { blob: new Blob([out], { type: 'application/json' }), previewText: out, isImage: false };
    }
    case 'markdown-to-html': {
      const text = await file.text();
      const out = markdownToHtml(text);
      return { blob: new Blob([out], { type: 'text/html' }), previewText: out, isImage: false };
    }
    case 'html-to-markdown': {
      const text = await file.text();
      const out = htmlToMarkdown(text);
      return { blob: new Blob([out], { type: 'text/markdown' }), previewText: out, isImage: false };
    }
    case 'encode-base64': return encodeBase64(file);
    case 'decode-base64': return decodeBase64(file);
    case 'encode-url': return encodeUrl(file);
    case 'decode-url': return decodeUrl(file);
  }
}
