import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import type { SaliencyMapDto } from '@attention/shared';

const TARGET_LONG_EDGE = 128;
const WEIGHT_LUMINANCE = 0.15;
const WEIGHT_CONTRAST = 0.35;
const WEIGHT_EDGES = 0.5;

@Injectable()
export class SaliencyService {
  async compute(imagePath: string): Promise<SaliencyMapDto> {
    let data: Buffer;
    let info: sharp.OutputInfo;

    try {
      const result = await sharp(imagePath)
        .resize({ width: TARGET_LONG_EDGE, height: TARGET_LONG_EDGE, fit: 'inside' })
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });
      data = result.data;
      info = result.info;
    } catch {
      throw new BadRequestException('Не удалось обработать изображение');
    }

    const { width, height } = info;
    const pixels = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) pixels[i] = data[i] / 255;

    const blurred = boxBlur(pixels, width, height, 3);
    const contrast = new Float32Array(pixels.length);
    for (let i = 0; i < pixels.length; i++) {
      contrast[i] = Math.abs(pixels[i] - blurred[i]);
    }
    normalize(contrast);

    const edges = sobelMagnitude(pixels, width, height);
    normalize(edges);

    const combined = new Float32Array(pixels.length);
    let maxVal = 0;
    for (let i = 0; i < pixels.length; i++) {
      combined[i] =
        WEIGHT_LUMINANCE * pixels[i] + WEIGHT_CONTRAST * contrast[i] + WEIGHT_EDGES * edges[i];
      if (combined[i] > maxVal) maxVal = combined[i];
    }
    if (maxVal > 0) {
      for (let i = 0; i < combined.length; i++) combined[i] /= maxVal;
    }

    const smoothed = boxBlur(combined, width, height, 4);

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
            sum += src[ny * w + nx];
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
          const v = src[(y + ky) * w + (x + kx)];
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += v * Kx[ki];
          gy += v * Ky[ki];
        }
      }
      dst[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return dst;
}

function normalize(arr: Float32Array): void {
  let maxVal = 0;
  for (let i = 0; i < arr.length; i++) if (arr[i] > maxVal) maxVal = arr[i];
  if (maxVal > 0) for (let i = 0; i < arr.length; i++) arr[i] /= maxVal;
}
