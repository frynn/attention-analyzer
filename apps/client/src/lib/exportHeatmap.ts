import type { SaliencyMapDto } from '@attention/shared';

// Повторяем палитру из HeatmapViewer
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

interface ExportOptions {
  image: HTMLImageElement;
  saliency: SaliencyMapDto;
  opacity: number;
  filename: string;
  roi?: {
    x: number;
    y: number;
    w: number;
    h: number;
    score: number;
    label: string;
    advice: string;
  } | null;
  containerRect: DOMRect;
}

export async function exportHeatmapToPNG({
  image,
  saliency,
  opacity,
  filename,
  roi,
  containerRect,
}: ExportOptions): Promise<void> {
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Не удалось создать canvas');

  // 1. Рисуем оригинальное изображение
  ctx.drawImage(image, 0, 0, width, height);

  // 2. Готовим heatmap на отдельном временном canvas
  const hmCanvas = document.createElement('canvas');
  hmCanvas.width = saliency.width;
  hmCanvas.height = saliency.height;
  const hmCtx = hmCanvas.getContext('2d');
  if (hmCtx) {
    const imgData = hmCtx.createImageData(saliency.width, saliency.height);
    for (let i = 0; i < saliency.map.length; i++) {
      const v = saliency.map[i] ?? 0;
      const [r, g, b, a] = valueToColor(v);
      const offset = i * 4;
      imgData.data[offset] = r;
      imgData.data[offset + 1] = g;
      imgData.data[offset + 2] = b;
      imgData.data[offset + 3] = a;
    }
    hmCtx.putImageData(imgData, 0, 0);

    // 3. Накладываем heatmap на основное изображение с учетом прозрачности
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(hmCanvas, 0, 0, width, height);
    ctx.restore();
  }

  // 4. Рисуем ROI, если он есть
  if (roi) {
    // Пересчитываем координаты из DOM в оригинальные размеры картинки
    const scaleX = width / containerRect.width;
    const scaleY = height / containerRect.height;
    const rx = roi.x * scaleX;
    const ry = roi.y * scaleY;
    const rw = roi.w * scaleX;
    const rh = roi.h * scaleY;

    // Рамка
    ctx.strokeStyle = '#e8ede9';
    ctx.lineWidth = Math.max(4, width * 0.002);
    ctx.strokeRect(rx, ry, rw, rh);

    // Подложка для плашки
    const fontSize = Math.max(24, width * 0.012);
    ctx.font = `bold ${fontSize}px sans-serif`;
    const text1 = `${roi.score}/100 — ${roi.label}`;

    ctx.font = `${fontSize * 0.7}px sans-serif`;
    const text2 = roi.advice;

    const textWidth = Math.max(ctx.measureText(text1).width, ctx.measureText(text2).width);
    const padding = fontSize * 0.8;
    const boxH = fontSize * 2.5;

    const boxX = rx;
    const boxY = Math.max(0, ry - boxH - 10); // Над рамкой, но не выше картинки

    // Фон плашки
    ctx.fillStyle = 'rgba(22, 29, 25, 0.95)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, textWidth + padding * 2, boxH, 8);
    ctx.fill();

    // Обводка плашки
    ctx.strokeStyle = '#a3c1ad';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Текст
    ctx.fillStyle = '#d4c5b0';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillText(text1, boxX + padding, boxY + fontSize * 1.2);

    ctx.fillStyle = '#8a9a91';
    ctx.font = `${fontSize * 0.7}px sans-serif`;
    ctx.fillText(text2, boxX + padding, boxY + fontSize * 2.2);
  }

  // 5. Добавляем водяной знак / футер
  const footerH = Math.max(60, height * 0.05);
  ctx.fillStyle = 'rgba(14, 19, 17, 0.85)';
  ctx.fillRect(0, height - footerH, width, footerH);

  const footerFontSize = Math.max(16, width * 0.008);
  ctx.fillStyle = '#8a9a91';
  ctx.font = `${footerFontSize}px sans-serif`;
  ctx.fillText(
    `Attention Analyzer · ${filename}`,
    width * 0.02,
    height - footerH / 2 + footerFontSize / 3,
  );

  const dateStr = new Date().toLocaleDateString('ru-RU');
  ctx.textAlign = 'right';
  ctx.fillText(
    `Сгенерировано: ${dateStr}`,
    width * 0.98,
    height - footerH / 2 + footerFontSize / 3,
  );
  ctx.textAlign = 'left';

  // 6. Скачиваем
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Не удалось сгенерировать PNG'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attention-analysis-${filename.replace(/\.[^.]+$/, '')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}
