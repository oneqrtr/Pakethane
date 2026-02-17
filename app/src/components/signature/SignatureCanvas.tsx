import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

interface SignatureCanvasProps {
  onChange?: (signatureData: string | null) => void;
  width?: number;
  height?: number;
  className?: string;
}

export function SignatureCanvas({
  onChange,
  width: propWidth,
  height: propHeight,
  className = '',
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: propWidth ?? 400, height: propHeight ?? 150 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (propWidth && propHeight) {
      setDimensions({ width: propWidth, height: propHeight });
      return;
    }
    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width) || 400;
      const h = Math.floor(w * 0.375) || 150;
      setDimensions({ width: w, height: h });
    };
    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [propWidth, propHeight]);

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const ctx = getCanvasContext();
      if (!ctx) return;

      setIsDrawing(true);
      ctx.beginPath();

      const { offsetX, offsetY } = getCoordinates(e);
      ctx.moveTo(offsetX, offsetY);
    },
    [getCanvasContext]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const ctx = getCanvasContext();
      if (!ctx) return;

      const { offsetX, offsetY } = getCoordinates(e);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    },
    [isDrawing, getCanvasContext]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    const ctx = getCanvasContext();
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
    setHasSignature(true);

    const canvas = canvasRef.current;
    if (canvas && onChange) {
      const signatureData = canvas.toDataURL('image/png');
      onChange(signatureData);
    }
  }, [isDrawing, getCanvasContext, onChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);

    if (onChange) {
      onChange(null);
    }
  }, [getCanvasContext, onChange]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { offsetX: number; offsetY: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
      };
    } else {
      return {
        offsetX: (e as React.MouseEvent).nativeEvent.offsetX,
        offsetY: (e as React.MouseEvent).nativeEvent.offsetY,
      };
    }
  };

  useEffect(() => {
    const ctx = getCanvasContext();
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [getCanvasContext]);

  return (
    <div ref={containerRef} className={`flex flex-col gap-3 w-full ${className}`}>
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white w-full">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="signature-canvas w-full touch-none"
          style={{ cursor: 'crosshair' }}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm">
              İmzanızı buraya çizin
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          disabled={!hasSignature}
          className="flex items-center gap-2"
        >
          <Eraser className="h-4 w-4" />
          Temizle
        </Button>
      </div>
    </div>
  );
}

export default SignatureCanvas;
