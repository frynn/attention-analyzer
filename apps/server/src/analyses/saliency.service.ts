import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import type { SaliencyMapDto } from '@attention/shared';

const TARGET_LONG_EDGE = 256;
const WEIGHT_CONTRAST = 0.4;
const WEIGHT_EDGES = 0.4;
const WEIGHT_COLOR = 0.2;

@Injectable()
export class SaliencyService {
  async compute(imagePath: string): Promise<SaliencyMapDto> {
    const result = await sharp(imagePath)
      .resize({ width: TARGET_LONG_EDGE, height: TARGET_LONG_EDGE, fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true })
      .catch(() => {
        throw new BadRequestException('Не удалось обработать изображение');
      });

    const data = result.data;
    const width = result.info.width;
    const height = result.info.height;
    const channels = result.info.channels; // 3 или 4 (RGBA)

    const pixels = new Float32Array(width * height);
    const colorfulness = new Float32Array(width * height);

    // 1. Извлекаем яркость и цветовую насыщенность
    for (let i = 0; i < width * height; i++) {
      const r = data[i * channels] ?? 0;
      const g = data[i * channels + 1] ?? 0;
      const b = data[i * channels + 2] ?? 0;

      // Luminance (стандартная формула)
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      pixels[i] = lum;

      // Colorfulness (насыщенность): max - min
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      colorfulness[i] = (max - min) / 255;
    }

    // 2. Локальный контраст (разница с блюром)
    const blurredLum = boxBlur(pixels, width, height, 4);
    const contrast = new Float32Array(pixels.length);
    for (let i = 0; i < pixels.length; i++) {
      contrast[i] = Math.abs((pixels[i] ?? 0) - (blurredLum[i] ?? 0));
    }
    normalizePercentile(contrast, 0.95);

    // 3. Границы (Sobel)
    const edges = sobelMagnitude(pixels, width, height);
    normalizePercentile(edges, 0.95);

    // 4. Комбинируем
    const combined = new Float32Array(pixels.length);
    for (let i = 0; i < pixels.length; i++) {
      combined[i] =
        WEIGHT_CONTRAST * (contrast[i] ?? 0) +
        WEIGHT_EDGES * (edges[i] ?? 0) +
        WEIGHT_COLOR * (colorfulness[i] ?? 0);
    }

    // 5. Сглаживаем для получения мягких «пятен»
    const smoothed = boxBlur(combined, width, height, 6);

    // 6. Нормализуем по 95-му перцентилю (отсекаем шум)
    normalizePercentile(smoothed, 0.95);

    // 7. Гамма-коррекция (0.5) — сильно поднимает середину
    for (let i = 0; i < smoothed.length; i++) {
      smoothed[i] = Math.pow(smoothed[i] ?? 0, 0.5);
    }

    // Диагностика
    let hot = 0;
    for (let i = 0; i < smoothed.length; i++) {
      if ((smoothed[i] ?? 0) > 0.6) hot++;
    }
    console.log('[Saliency]', {
      size: `${width}×${height}`,
      hotPixels: hot,
      total: smoothed.length,
    });

    return {
      width,
      height,
      map: Array.from(smoothed, (v) => Math.round(v * 10000) / 10000),
    };
  }
}

function boxBlur(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  const dst = new Float32Array(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
            sum += src[ny * w + nx] ?? 0;
            count++;
          }
        }
      }
      dst[y * w + x] = sum / count;
    }
  }
  return dst;
}

function sobelMagnitude(src: Float32Array, w: number, h: number): Float32Array {
  const dst = new Float32Array(src.length);
  const Kx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const Ky = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0;
      let gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const v = src[(y + ky) * w + (x + kx)] ?? 0;
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += v * (Kx[ki] ?? 0);
          gy += v * (Ky[ki] ?? 0);
        }
      }
      dst[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return dst;
}

function normalizePercentile(arr: Float32Array, percentile: number): void {
  if (arr.length === 0) return;
  const sorted = Array.from(arr).sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * percentile));
  const cutoff = sorted[idx] ?? 0.01; // Защита от деления на 0
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Math.min(1, (arr[i] ?? 0) / cutoff);
  }
}
