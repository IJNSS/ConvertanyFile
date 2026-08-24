import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload,
  File as FileIcon,
  Download,
  Copy,
  Check,
  X,
  ArrowRight,
  Loader2,
  Image as ImageIcon,
  Database,
  FileText,
  Type,
  Sparkles,
  RotateCcw,
  FileType,
} from 'lucide-react';
import { CONVERTERS, convert, getConverter, type ConverterDef, type ConverterId, type ConvertResult } from '@/lib/converters';

const CATEGORY_META: Record<string, { icon: typeof ImageIcon; color: string }> = {
  Image: { icon: ImageIcon, color: 'text-sky-400' },
  'PDF & Office': { icon: FileType, color: 'text-orange-400' },
  Data: { icon: Database, color: 'text-emerald-400' },
  Document: { icon: FileText, color: 'text-amber-400' },
  Text: { icon: Type, color: 'text-rose-400' },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState<ConverterId | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on cleanup
  useEffect(() => {
    return () => {
      if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl);
      result?.pageDownloads?.forEach((page) => URL.revokeObjectURL(page.previewUrl));
    };
  }, [result]);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setSelected(null);
    setResult(null);
    setError(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onConvert = useCallback(async () => {
    if (!file || !selected) return;
    setConverting(true);
    setError(null);
    setResult(null);
    try {
      const res = await convert(file, selected);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setConverting(false);
    }
  }, [file, selected]);

  const downloadName = (): string => {
    if (!file || !selected) return 'converted';
    const def = getConverter(selected);
    const base = file.name.replace(/\.[^.]+$/, '');
    return `${base}.${def.outputExt}`;
  };

  const downloadBlob = useCallback((blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, []);

  const onDownload = useCallback(() => {
    if (result) downloadBlob(result.blob, downloadName());
  }, [downloadBlob, result]);

  const onDownloadPage = useCallback((blob: Blob, fileName: string) => {
    downloadBlob(blob, fileName);
  }, [downloadBlob]);

  const onCopy = useCallback(async () => {
    if (!result?.previewText) return;
    await navigator.clipboard.writeText(result.previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const reset = useCallback(() => {
    setFile(null);
    setSelected(null);
    setResult(null);
    setError(null);
  }, []);

  const grouped = CONVERTERS.reduce((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {} as Record<string, ConverterDef[]>);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 antialiased">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            Private & in-browser — your files never leave your device
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-white via-sky-200 to-emerald-200 bg-clip-text text-transparent">
              Universal File Converter
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-400">
            Convert images, data formats, documents, PDF & Office files, and text — instantly, right in your browser.
          </p>
        </header>

        {/* Drop zone */}
        {!file && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`group cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 sm:p-16 ${
              dragOver
                ? 'border-sky-400 bg-sky-500/10 scale-[1.02]'
                : 'border-white/15 bg-white/[0.02] hover:border-sky-500/50 hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 transition-transform duration-300 group-hover:scale-110">
              <Upload className="h-7 w-7 text-sky-400" />
            </div>
            <p className="text-lg font-semibold text-white">
              {dragOver ? 'Drop to upload' : 'Drag & drop a file here'}
            </p>
            <p className="mt-1.5 text-sm text-gray-400">
              or <span className="text-sky-400 underline underline-offset-2">browse</span> from your device
            </p>
            <p className="mt-4 text-xs text-gray-500">
              Images · PDF · Word · Excel · PowerPoint · HTML · JSON · CSV · XML · Text
            </p>
          </div>
        )}

        {/* File + converter selection */}
        {file && (
          <div className="space-y-6">
            {/* Source file card */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20">
                  <FileIcon className="h-6 w-6 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{file.name}</p>
                  <p className="text-sm text-gray-400">{formatBytes(file.size)} · {file.type || 'unknown type'}</p>
                </div>
              </div>
              <button
                onClick={reset}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Converter grid */}
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Choose a conversion
              </h2>
              <div className="space-y-5">
                {Object.entries(grouped).map(([category, converters]) => {
                  const meta = CATEGORY_META[category];
                  const Icon = meta.icon;
                  return (
                    <div key={category}>
                      <div className="mb-2.5 flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${meta.color}`} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {category}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {converters.map((c) => {
                          const active = selected === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => { setSelected(c.id); setResult(null); setError(null); }}
                              className={`group relative overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-200 ${
                                active
                                  ? 'border-sky-400 bg-sky-500/15 shadow-lg shadow-sky-500/10'
                                  : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]'
                              }`}
                            >
                              <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-200'}`}>
                                {c.label}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-gray-500">{c.description}</p>
                              {active && (
                                <div className="absolute right-2.5 top-2.5">
                                  <Check className="h-4 w-4 text-sky-400" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Convert button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onConvert}
                disabled={!selected || converting}
                className="group flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {converting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Converting…
                  </>
                ) : (
                  <>
                    Convert
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                <p className="font-medium">Conversion failed</p>
                <p className="mt-1 text-rose-400/80">{error}</p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Result</h3>
                  <div className="flex items-center gap-2">
                    {result.previewText && (
                      <button
                        onClick={onCopy}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    )}
                    <button
                      onClick={onDownload}
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:shadow-lg hover:shadow-sky-500/25"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {result.pageDownloads && result.pageDownloads.length > 1 ? 'Download all' : 'Download'}
                    </button>
                  </div>
                </div>

                {result.pageDownloads && result.pageDownloads.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {result.pageDownloads.map((page) => (
                      <article key={page.page} className="overflow-hidden rounded-xl border border-white/10 bg-[#0d0d14]">
                        <div className="flex min-h-64 items-center justify-center p-4">
                          <img
                            src={page.previewUrl}
                            alt={`Converted page ${page.page}`}
                            className="max-h-80 max-w-full rounded-lg object-contain shadow-2xl"
                          />
                        </div>
                        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                          <span className="text-sm font-medium text-gray-300">Page {page.page}</span>
                          <button
                            onClick={() => onDownloadPage(page.blob, page.fileName)}
                            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:shadow-lg hover:shadow-sky-500/25"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download page
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : result.isImage && result.previewUrl ? (
                  <div className="flex items-center justify-center rounded-xl bg-[#0d0d14] p-4">
                    <img
                      src={result.previewUrl}
                      alt="Converted result"
                      className="max-h-80 max-w-full rounded-lg object-contain"
                    />
                  </div>
                ) : result.blob.type === 'application/pdf' ? (
                  <iframe
                    src={URL.createObjectURL(result.blob)}
                    title="PDF preview"
                    className="h-80 w-full rounded-xl bg-[#0d0d14]"
                  />
                ) : (
                  <pre className="max-h-80 overflow-auto rounded-xl bg-[#0d0d14] p-4 text-xs leading-relaxed text-gray-300">
                    <code>{result.previewText || '(Binary content — use Download to save)'}</code>
                  </pre>
                )}
              </div>
            )}

            {/* Start over link */}
            {(result || error) && (
              <div className="text-center">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Convert another file
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-gray-600">
          All conversions run locally in your browser. Nothing is uploaded.
        </footer>
      </div>
    </div>
  );
}
