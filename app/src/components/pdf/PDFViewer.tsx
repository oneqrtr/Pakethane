import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import type { DocumentDefinition } from '@/types';
import { SOURCE_PDF_PATH } from '@/config/documentPack';

interface PDFViewerProps {
  document?: DocumentDefinition;
  showNavigation?: boolean;
  showZoom?: boolean;
  showDownload?: boolean;
  className?: string;
}

export function PDFViewer({
  document,
  showNavigation = true,
  showZoom = true,
  showDownload = true,
  className = '',
}: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeSize, setIframeSize] = useState({ width: 800, height: 1100 });

  useEffect(() => {
    const updateSize = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = Math.min(800, Math.max(280, rect.width - 32));
      const h = Math.floor(w * (1100 / 800));
      setIframeSize({ width: w, height: h });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (document) {
      setCurrentPage(document.startPage || 1);
      setTotalPages((document.endPage || 1) - (document.startPage || 1) + 1);
    } else {
      setCurrentPage(1);
      setTotalPages(20);
    }
  }, [document]);

  const handlePreviousPage = () => {
    if (document) {
      if (currentPage > (document.startPage || 1)) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleNextPage = () => {
    if (document) {
      if (currentPage < (document.endPage || 1)) {
        setCurrentPage(currentPage + 1);
      }
    } else {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(zoom + 25);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(zoom - 25);
    }
  };

  const handleDownload = () => {
    window.open(SOURCE_PDF_PATH, '_blank');
  };

  const displayPage = document
    ? currentPage - (document.startPage || 1) + 1
    : currentPage;
  const displayTotal = document
    ? (document.endPage || 1) - (document.startPage || 1) + 1
    : totalPages;

  return (
    <div ref={containerRef} className={`flex flex-col bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-white border-b">
        <div className="flex items-center gap-2">
          {showNavigation && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={document ? currentPage <= (document.startPage || 1) : currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[80px] text-center">
                Sayfa {displayPage} / {displayTotal}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={document ? currentPage >= (document.endPage || 1) : currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showZoom && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </>
          )}

          {showDownload && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              title="PDF İndir"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-100 flex items-center justify-center min-h-[250px] sm:min-h-[400px]">
        <div
          className="bg-white shadow-lg transition-transform duration-200"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          <iframe
            src={`${SOURCE_PDF_PATH}#page=${currentPage}`}
            className="border-0 max-w-full"
            style={{
              width: `${iframeSize.width}px`,
              height: `${iframeSize.height}px`,
            }}
            title={document?.title || 'PDF Viewer'}
          />
        </div>
      </div>

      {/* Document Info */}
      {document && (
        <div className="px-4 py-2 bg-white border-t">
          <p className="text-sm font-medium text-gray-900">{document.title}</p>
          <p className="text-xs text-gray-500">{document.description}</p>
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
