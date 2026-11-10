import { Injectable } from '@nestjs/common';
import type { SaliencyMapDto } from '@attention/shared';

@Injectable()
export class UxAuditService {
  analyze(saliency: SaliencyMapDto): string {
    const { width, height, map } = saliency;
    const totalPixels = map.length;
    if (totalPixels === 0) return 'Нет данных для анализа.';

    let totalWeight = 0;
    let sumX = 0;
    let sumY = 0;
    let deadZones = 0;
    let topZoneWeight = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const v = map[y * width + x] ?? 0;
        if (v > 0.01) {
          totalWeight += v;
          sumX += x * v;
          sumY += y * v;
        }
        if (v < 0.05) deadZones++;
        if (y < height * 0.2) topZoneWeight += v; // верхние 20% экрана
      }
    }

    const insights: string[] = [];

    if (totalWeight > 0) {
      const centerX = sumX / totalWeight / width; // от 0 до 1
      const centerY = sumY / totalWeight / height;

      // 1. Анализ центра масс
      if (centerX < 0.35) insights.push('⚠️ Внимание смещено влево. Проверьте баланс элементов.');
      else if (centerX > 0.65)
        insights.push('⚠️ Внимание смещено вправо. Проверьте баланс элементов.');

      if (centerY < 0.2)
        insights.push(
          '⚠️ Почти всё внимание наверху. Нижняя часть страницы рискует остаться незамеченной.',
        );
      else if (centerY > 0.75)
        insights.push(
          '⚠️ Основное внимание приковано к низу страницы. Стоит проверить первый экран (Above the Fold).',
        );

      // 2. Анализ верхней зоны (где обычно CTA и навигация)
      const topRatio = topZoneWeight / totalWeight;
      if (topRatio < 0.15)
        insights.push(
          '💡 Верхняя зона (шапка, меню) имеет низкую заметность. Пользователи могут её игнорировать.',
        );
    }

    // 3. Анализ "мертвых зон"
    const deadRatio = deadZones / totalPixels;
    if (deadRatio > 0.6) {
      insights.push(
        '💡 Очень много однородных (пустых) областей. Возможно, стоит добавить акценты или разбить контент.',
      );
    }

    if (insights.length === 0) {
      insights.push(
        '✅ Явных проблем с распределением внимания не обнаружено. Композиция сбалансирована.',
      );
    }

    return insights.join('\n');
  }
}
