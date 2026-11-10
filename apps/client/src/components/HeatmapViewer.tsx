import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { SaliencyMapDto } from '@attention/shared';
import AuthedImage from './AuthedImage';
import { exportHeatmapToPNG } from '../lib/exportHeatmap';

interface HeatmapViewerProps {
  analysisId: string;
  saliency: SaliencyMapDto;
  width: number;
  height: number;
  alt?: string;
}

interface Roi {
  x: number;
  y: number;
  w: number;
  h: number;
  score: number;
  label: string;
  advice: string;
}

// ⚠️ Палитра heatmap — данные, НЕ трогаем. Это визуализация saliency.
function valueToColor(v: number): [number, number, number, number] {
  const stops: Array<[number, [number, number, number]]> = [
    [0.0, [0, 0, 255]],
    [0.3, [0, 255, 255]],
    [0.5, [0, 255, 0]],
    [0.65, [255, 255, 0]],
    [0.8, [255, 128, 0]],
    [1.0, [255, 0, 0]],
  ];
  const clamped = Math.max(0, Math.min(1, v));
  let lo = stops[0]!;
  let hi = stops[stops.length - 1]!;
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i]![0] && clamped <= stops[i + 1]![0]) {
      lo = stops[i]!;
      hi = stops[i + 1]!;
      break;
    }
  }
  const [v0, c0] = lo;
  const [v1, c1] = hi;
  const t = v1 === v0 ? 0 : (clamped - v0) / (v1 - v0);
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
  const alpha = Math.round(255 * Math.pow(clamped, 0.7));
  return [r, g, b, alpha];
}

export default function HeatmapViewer({
  analysisId,
  saliency,
  width,
  height,
  alt = 'Скриншот макета',
}: HeatmapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState(0.7);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Состояние для ROI
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [roi, setRoi] = useState<Roi | null>(null);

  //Состояние загрузки скачивания
  const [downloading, setDownloading] = useState(false);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Рисуем heatmap на canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = saliency.width;
    canvas.height = saliency.height;

    const imgData = ctx.createImageData(saliency.width, saliency.height);
    for (let i = 0; i < saliency.map.length; i++) {
      const v = saliency.map[i] ?? 0;
      const [r, g, b, a] = valueToColor(v);
      const offset = i * 4;
      imgData.data[offset] = r;
      imgData.data[offset + 1] = g;
      imgData.data[offset + 2] = b;
      imgData.data[offset + 3] = a;
    }
    ctx.putImageData(imgData, 0, 0);
  }, [saliency]);

  const getRelativeCoords = (e: MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return {
      x: Math.max(0, Math.min(x, rect.width)),
      y: Math.max(0, Math.min(y, rect.height)),
    };
  };

  const calculateScore = (x: number, y: number, w: number, h: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();

    const scaleX = saliency.width / rect.width;
    const scaleY = saliency.height / rect.height;

    const sx = Math.floor(x * scaleX);
    const sy = Math.floor(y * scaleY);
    const ex = Math.floor((x + w) * scaleX);
    const ey = Math.floor((y + h) * scaleY);

    let sum = 0;
    let count = 0;

    for (let py = sy; py < ey; py++) {
      for (let px = sx; px < ex; px++) {
        if (py >= 0 && py < saliency.height && px >= 0 && px < saliency.width) {
          sum += saliency.map[py * saliency.width + px] ?? 0;
          count++;
        }
      }
    }

    return count > 0 ? (sum / count) * 100 : 0;
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const pos = getRelativeCoords(e);
    setStartPos(pos);
    setCurrentPos(pos);
    setIsDrawing(true);
    setRoi(null);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing) return;
    setCurrentPos(getRelativeCoords(e));
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPos || !currentPos) {
      setIsDrawing(false);
      return;
    }

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    if (w < 10 || h < 10) {
      setIsDrawing(false);
      setStartPos(null);
      setCurrentPos(null);
      return;
    }

    const score = Math.round(calculateScore(x, y, w, h));

    let label = 'Низкая';
    let advice = '';

    if (score >= 75) {
      label = 'Очень высокая';
      advice = '✅ Отличный акцент.';
    } else if (score >= 50) {
      label = 'Высокая';
      advice = '👍 Хорошая заметность.';
    } else if (score >= 25) {
      label = 'Средняя';
      advice = '⚠️ Усильте контраст или размер.';
    } else {
      label = 'Низкая';
      advice = '❌ Элемент упустят из виду. Срочно меняйте!';
    }

    setRoi({ x, y, w, h, score, label, advice });
    setIsDrawing(false);
  };

  const drawRect = () => {
    if (!isDrawing || !startPos || !currentPos) return null;
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    return (
      <div
        className="absolute border-2 border-cream-100/80 bg-cream-100/10 pointer-events-none"
        style={{ left: x, top: y, width: w, height: h }}
      />
    );
  };

  const handleDownload = async () => {
    if (!imgElement || !containerRef.current) return;
    setDownloading(true);
    try {
      await exportHeatmapToPNG({
        image: imgElement,
        saliency,
        opacity,
        filename: alt,
        roi,
        containerRect: containerRef.current.getBoundingClientRect(),
      });
    } catch (err) {
      alert(`Ошибка экспорта: ${(err as Error).message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-cream-500">
        Зажми ЛКМ и выдели область на картинке, чтобы узнать её заметность.
      </div>

      <div
        ref={containerRef}
        className="relative bg-forest-900 rounded-lg overflow-hidden w-full cursor-crosshair select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <AuthedImage
          analysisId={analysisId}
          alt={alt}
          width={width}
          height={height}
          className="block w-full h-auto pointer-events-none"
          onLoad={(img) => {
            setImageLoaded(true);
            setImgElement(img); // <-- сохраняем ссылку на img
          }}
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            opacity: imageLoaded ? opacity : 0,
            imageRendering: 'smooth',
            transition: 'opacity 120ms ease-out',
          }}
        />

        {drawRect()}

        {roi && (
          <div
            className="absolute border-2 border-cream-100 bg-cream-100/15 pointer-events-none"
            style={{ left: roi.x, top: roi.y, width: roi.w, height: roi.h }}
          >
            <div className="absolute -top-12 left-0 bg-forest-900 border border-sage-500/60 text-cream-100 text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap flex flex-col gap-0.5">
              <span className="font-bold text-sand-500">
                {roi.score}/100 — {roi.label}
              </span>
              <span className="text-cream-500">{roi.advice}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        {/* На мобилке текст и цифра на одной строке */}
        <div className="flex justify-between items-center sm:w-40 shrink-0">
          <label htmlFor="heatmap-opacity" className="text-sm text-cream-500">
            Прозрачность heatmap
          </label>
          <span className="text-sm text-cream-100 sm:hidden">{Math.round(opacity * 100)}%</span>
        </div>

        {/* Ползунок */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            id="heatmap-opacity"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="flex-1 min-w-0 accent-sage-500"
          />
          {/* Цифра на десктопе */}
          <span className="text-sm text-cream-100 w-12 text-right hidden sm:block">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      </div>

      {/* Кнопка скачивания */}
      <button
        onClick={handleDownload}
        disabled={downloading || !imgElement}
        className="px-5 py-2.5 rounded-md bg-sand-500 text-forest-950 hover:bg-[#e0d2ba] disabled:opacity-50 transition font-medium text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {downloading ? 'Сохранение...' : 'Скачать PNG'}
      </button>

      <p className="text-xs text-cream-500">
        Оригинал {width}×{height} px · saliency {saliency.width}×{saliency.height} px ·{' '}
        {saliency.map.length.toLocaleString('ru-RU')} точек
      </p>
    </div>
  );
}
