import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import {
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  RefreshCw,
  FileText,
  AlertCircle,
} from 'lucide-react';

// Configure PDF.js worker using our static asset in /public/assets/pdf.worker.min.mjs
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
}

interface PdfCanvasPageProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  totalPages: number;
  containerWidth: number;
  zoomPercent: number;
  titleAr: string;
  subtitleAr?: string;
  onPageVisible?: (pageNumber: number) => void;
}

const PdfCanvasPage = memo(function PdfCanvasPage({
  pdfDoc,
  pageNumber,
  totalPages,
  containerWidth,
  zoomPercent,
  titleAr,
  subtitleAr,
  onPageVisible,
}: PdfCanvasPageProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pageRendered, setPageRendered] = useState<boolean>(false);
  const [pageError, setPageError] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: Math.min(820, Math.max(300, containerWidth - 24)),
    height: Math.round(Math.min(820, Math.max(300, containerWidth - 24)) * 1.414),
  });

  // Track which page is currently in view during vertical scrolling
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !onPageVisible || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            onPageVisible(pageNumber);
          }
        }
      },
      { threshold: [0.35, 0.65] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber, onPageVisible]);

  // Render the PDF page onto the high-DPI canvas
  useEffect(() => {
    let cancelled = false;
    let activeRenderTask: { cancel: () => void; promise: Promise<void> } | null = null;

    async function renderPage() {
      try {
        setPageError(false);
        const page: PDFPageProxy = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const unscaledViewport = page.getViewport({ scale: 1 });
        const safeContainerWidth = Math.max(280, Math.min(880, containerWidth - 20));
        const fitWidthScale = safeContainerWidth / Math.max(1, unscaledViewport.width);
        const finalCssScale = fitWidthScale * (zoomPercent / 100);
        const cssViewport = page.getViewport({ scale: finalCssScale });

        const cssWidth = Math.round(cssViewport.width);
        const cssHeight = Math.round(cssViewport.height);
        setDimensions({ width: cssWidth, height: cssHeight });

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Render at high device pixel ratio (up to 2.5x) for crisp Arabic text & diagrams
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderViewport = page.getViewport({ scale: finalCssScale * dpr });
        const task = page.render({
          canvasContext: ctx,
          canvas,
          viewport: renderViewport,
        });
        activeRenderTask = task;

        await task.promise;
        if (!cancelled) {
          setPageRendered(true);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const errName = (err as { name?: string })?.name || '';
        if (errName === 'RenderingCancelledException') return;
        setPageError(true);
      }
    }

    void renderPage();

    return () => {
      cancelled = true;
      if (activeRenderTask) {
        try {
          activeRenderTask.cancel();
        } catch {
          // Ignore cancel errors
        }
      }
    };
  }, [pdfDoc, pageNumber, containerWidth, zoomPercent]);

  return (
    <div
      ref={wrapperRef}
      id={`pdf-page-anchor-${pageNumber}`}
      data-testid={`pdf-rendered-page-${pageNumber}`}
      style={{
        width: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
      }}
      className="mx-auto bg-white rounded-xl shadow-[0_14px_38px_rgba(0,0,0,0.5)] border border-[#C6A064]/45 overflow-hidden transition-[width,min-height] duration-150 flex flex-col justify-between relative"
    >
      {/* Top Academic Page Header Strip */}
      <div className="bg-[#FAF6EE] border-b border-[#D8C7A8] px-4 py-2 flex items-center justify-between text-[11px] sm:text-xs text-[#1E293B]">
        <span className="font-bold text-[#101C2B] truncate max-w-[68%]">
          {titleAr}
        </span>
        <span className="font-mono-tabular font-bold text-[#8A6832] shrink-0">
          الصفحة {pageNumber} من {totalPages}
        </span>
      </div>

      {/* Main High-DPI Canvas Area */}
      <div className="relative flex-1 bg-white flex items-center justify-center overflow-hidden">
        {!pageRendered && !pageError && (
          <div className="absolute inset-0 bg-[#FAF7F0] flex flex-col items-center justify-center gap-2.5 p-6 text-center z-10">
            <div className="w-8 h-8 rounded-full border-2 border-[#C6A064]/30 border-t-[#C6A064] animate-spin" />
            <span className="text-xs font-bold text-[#5C5346]">
              جاري تجهيز الصفحة {pageNumber}...
            </span>
          </div>
        )}

        {pageError && (
          <div className="p-8 text-center space-y-2 text-[#1E293B]">
            <FileText className="w-8 h-8 text-[#9E7C44] mx-auto" />
            <p className="text-xs sm:text-sm font-bold">{titleAr}</p>
            {subtitleAr && (
              <p className="text-xs text-[#5C5346]">{subtitleAr}</p>
            )}
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="block mx-auto bg-white select-none"
        />
      </div>

      {/* Bottom Academic Page Footer Strip */}
      <div className="bg-[#FAF6EE] border-t border-[#E2D5BE] px-4 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] text-[#5C5346]">
        <span className="truncate">{subtitleAr || 'الوثيقة الرسمية الكاملة'}</span>
        <span className="font-mono-tabular font-semibold">
          {pageNumber} / {totalPages}
        </span>
      </div>
    </div>
  );
});

export interface AcademicPdfViewerProps {
  pdfBlob?: Blob | null;
  pdfUrl?: string | null;
  loading?: boolean;
  error?: string | null;
  titleAr: string;
  subtitleAr?: string;
  fallbackPageCount?: number;
  onRetry?: () => void;
  onDownload?: () => void;
  compact?: boolean;
}

export const AcademicPdfViewer = memo(function AcademicPdfViewer({
  pdfBlob,
  pdfUrl,
  loading = false,
  error = null,
  titleAr,
  subtitleAr,
  fallbackPageCount = 1,
  onRetry,
  onDownload,
  compact = false,
}: AcademicPdfViewerProps) {
  const viewerWrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(Math.max(1, fallbackPageCount));
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(780);
  const [docLoading, setDocLoading] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState<number>(0);

  // Measure scroll container width responsively so PDF fits mobile & desktop screens cleanly
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const rectWidth = el.clientWidth;
      if (rectWidth > 0) {
        setContainerWidth(rectWidth);
      }
    };

    updateWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => updateWidth());
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, []);

  // Load PDF document via PDF.js from Blob or URL
  useEffect(() => {
    let cancelled = false;
    let loadedDoc: PDFDocumentProxy | null = null;

    async function loadPdfDocument() {
      if (!pdfBlob && !pdfUrl) {
        setPdfDoc(null);
        return;
      }

      setDocLoading(true);
      setDocError(null);

      try {
        let dataBytes: Uint8Array | null = null;

        if (pdfBlob) {
          const buffer = await pdfBlob.arrayBuffer();
          dataBytes = new Uint8Array(buffer);
        } else if (pdfUrl) {
          const response = await fetch(pdfUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const buffer = await response.arrayBuffer();
          dataBytes = new Uint8Array(buffer);
        }

        if (cancelled || !dataBytes) return;

        const loadingTask = pdfjsLib.getDocument({
          data: dataBytes,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/cmaps/',
          cMapPacked: true,
          standardFontDataUrl:
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/standard_fonts/',
        });

        const doc = await loadingTask.promise;
        if (cancelled) {
          void (doc as unknown as { destroy?: () => Promise<void> }).destroy?.();
          return;
        }

        loadedDoc = doc;
        setPdfDoc(doc);
        setNumPages(Math.max(1, doc.numPages));
        setCurrentPage(1);
      } catch (err) {
        if (!cancelled) {
          console.warn('PDF.js render warning:', err);
          setDocError('تعذر تحليل صفحات ملف PDF. يمكنك إعادة المحاولة أو تحميل الملف مباشرة.');
        }
      } finally {
        if (!cancelled) {
          setDocLoading(false);
        }
      }
    }

    void loadPdfDocument();

    return () => {
      cancelled = true;
      if (loadedDoc) {
        void (loadedDoc as unknown as { destroy?: () => Promise<void> }).destroy?.();
      }
    };
  }, [pdfBlob, pdfUrl, reloadCounter]);

  const scrollToPage = useCallback(
    (targetPage: number) => {
      const clamped = Math.max(1, Math.min(numPages, targetPage));
      setCurrentPage(clamped);
      const container = scrollContainerRef.current;
      if (!container) return;
      const pageEl = container.querySelector(`#pdf-page-anchor-${clamped}`);
      if (pageEl && typeof pageEl.scrollIntoView === 'function') {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [numPages]
  );

  const handleToggleFullscreen = async () => {
    const el = viewerWrapperRef.current;
    if (!el) {
      setIsFullscreen((prev) => !prev);
      return;
    }
    try {
      if (!document.fullscreenElement && el.requestFullscreen) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        setIsFullscreen((prev) => !prev);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  const handleRetry = () => {
    setReloadCounter((c) => c + 1);
    onRetry?.();
  };

  const isBusy = loading || docLoading;
  const activeError = error || docError;

  return (
    <div
      ref={viewerWrapperRef}
      className={`rounded-2xl overflow-hidden border-2 border-[#C6A064]/80 bg-[#0D1A2B] shadow-[0_24px_60px_rgba(0,0,0,0.55)] flex flex-col ${
        isFullscreen ? 'fixed inset-2 z-50' : ''
      }`}
    >
      {/* Interactive PDF Control Bar (Page Navigation + Zoom + Fullscreen) */}
      <div className="bg-[#091321] border-b border-[#C6A064]/35 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-[#F5EFE2]">
        {/* Page Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="pdf-prev-page-btn"
            disabled={currentPage <= 1 || isBusy}
            onClick={() => scrollToPage(currentPage - 1)}
            className="px-2.5 py-1.5 rounded-lg bg-[#15253B] hover:bg-[#1E3350] disabled:opacity-40 border border-[#C6A064]/35 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-[#C6A064]" />
            <span>السابقة</span>
          </button>

          <span
            data-testid="pdf-page-indicator"
            className="px-3 py-1 rounded-lg bg-[#101C2B] border border-[#C6A064]/30 text-xs font-mono-tabular font-bold text-[#E5C18A]"
          >
            صفحة {currentPage} من {numPages}
          </span>

          <button
            type="button"
            data-testid="pdf-next-page-btn"
            disabled={currentPage >= numPages || isBusy}
            onClick={() => scrollToPage(currentPage + 1)}
            className="px-2.5 py-1.5 rounded-lg bg-[#15253B] hover:bg-[#1E3350] disabled:opacity-40 border border-[#C6A064]/35 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <span>التالية</span>
            <ChevronLeft className="w-3.5 h-3.5 text-[#C6A064]" />
          </button>
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="pdf-zoom-out-btn"
            aria-label="تصغير العرض"
            disabled={zoomPercent <= 60 || isBusy}
            onClick={() => setZoomPercent((z) => Math.max(60, z - 20))}
            className="p-1.5 rounded-lg bg-[#15253B] hover:bg-[#1E3350] disabled:opacity-40 border border-[#C6A064]/35 text-[#F5EFE2] cursor-pointer transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-[#C6A064]" />
          </button>

          <span
            data-testid="pdf-zoom-indicator"
            className="px-2.5 py-1 rounded-lg bg-[#101C2B] border border-[#C6A064]/30 text-xs font-mono-tabular font-bold text-[#E5C18A] min-w-[54px] text-center"
          >
            {zoomPercent}%
          </span>

          <button
            type="button"
            data-testid="pdf-zoom-in-btn"
            aria-label="تكبير العرض"
            disabled={zoomPercent >= 220 || isBusy}
            onClick={() => setZoomPercent((z) => Math.min(220, z + 20))}
            className="p-1.5 rounded-lg bg-[#15253B] hover:bg-[#1E3350] disabled:opacity-40 border border-[#C6A064]/35 text-[#F5EFE2] cursor-pointer transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-[#C6A064]" />
          </button>

          <button
            type="button"
            data-testid="pdf-zoom-reset-btn"
            aria-label="إعادة ضبط الحجم"
            onClick={() => setZoomPercent(100)}
            className="p-1.5 rounded-lg bg-[#15253B] hover:bg-[#1E3350] border border-[#C6A064]/35 text-[#F5EFE2] cursor-pointer transition-colors"
            title="إعادة ضبط الحجم (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C6A064]" />
          </button>

          <button
            type="button"
            data-testid="pdf-fullscreen-toggle-btn"
            onClick={() => void handleToggleFullscreen()}
            className="px-2.5 py-1.5 rounded-lg bg-[#15253B] hover:bg-[#1E3350] border border-[#C6A064]/35 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#C6A064]" />
                <span className="hidden sm:inline">تصغير</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#C6A064]" />
                <span className="hidden sm:inline">ملء الشاشة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Multi-Page Document Canvas Area */}
      <div
        ref={scrollContainerRef}
        data-testid="pdf-viewer-scroll-container"
        className={`flex-1 bg-[#112036] overflow-auto p-3 sm:p-6 space-y-6 ${
          isFullscreen
            ? 'h-[calc(100vh-110px)]'
            : compact
              ? 'max-h-[68vh] min-h-[420px]'
              : 'max-h-[78vh] min-h-[540px]'
        }`}
      >
        {isBusy ? (
          <div className="py-24 text-center space-y-3 text-[#F5EFE2]">
            <div className="w-11 h-11 rounded-full border-3 border-[#C6A064]/30 border-t-[#C6A064] animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#E5C18A]">
              جاري تحميل وعرض صفحات ملف PDF...
            </p>
            <p className="text-xs text-[#F5EFE2]/65">
              يتم تجهيز الصفحات بدقة عالية للقراءة المباشرة
            </p>
          </div>
        ) : activeError ? (
          <div
            data-testid="pdf-viewer-error-state"
            className="py-16 px-6 max-w-lg mx-auto rounded-2xl bg-[#0A1422] border border-[#C6A064]/45 text-center space-y-4 text-[#F5EFE2]"
          >
            <AlertCircle className="w-10 h-10 text-[#E5C18A] mx-auto" />
            <p className="text-sm sm:text-base font-bold text-[#F5EFE2]">
              {activeError}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 rounded-xl bg-[#15253B] hover:bg-[#1E3350] border border-[#C6A064]/50 text-xs font-bold text-[#E5C18A] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
              {onDownload && (
                <button
                  type="button"
                  onClick={onDownload}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C6A064] to-[#E5C18A] text-[#0B1624] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل ملف PDF</span>
                </button>
              )}
            </div>
          </div>
        ) : pdfDoc ? (
          Array.from({ length: numPages }, (_, idx) => idx + 1).map(
            (pageNumber) => (
              <PdfCanvasPage
                key={pageNumber}
                pdfDoc={pdfDoc}
                pageNumber={pageNumber}
                totalPages={numPages}
                containerWidth={containerWidth}
                zoomPercent={zoomPercent}
                titleAr={titleAr}
                subtitleAr={subtitleAr}
                onPageVisible={setCurrentPage}
              />
            )
          )
        ) : (
          <div className="py-20 text-center text-sm text-[#F5EFE2]/80">
            لا توجد وثيقة PDF متاحة للعرض حالياً.
          </div>
        )}
      </div>
    </div>
  );
});
