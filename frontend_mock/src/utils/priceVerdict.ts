import type { Verdict } from '@/src/api/apiTypes';

type VerdictCopyPart = 'title' | 'message';

export function getPriceVerdict(quotedPrice: number, fairLow: number, fairHigh: number): Verdict {
  if (quotedPrice <= fairLow) {
    return 'CHEAP';
  }
  if (quotedPrice <= fairHigh) {
    return 'FAIR';
  }
  if (quotedPrice <= fairHigh * 1.2) {
    return 'EXPENSIVE';
  }
  return 'VERY_EXPENSIVE';
}

export function getOverFairHighPercent(quotedPrice: number, fairHigh: number): number {
  if (quotedPrice <= fairHigh) {
    return 0;
  }
  return Number((((quotedPrice - fairHigh) * 100) / fairHigh).toFixed(2));
}

export function getVerdictI18nKey(verdict: Verdict, part: VerdictCopyPart): string {
  return `verdict.${verdictKeySegment(verdict)}.${part}`;
}

export function getVerdictMessage(verdict: Verdict): string {
  switch (verdict) {
    case 'CHEAP':
      return '좋은 가격입니다. 품질만 확인해 보세요.';
    case 'FAIR':
      return '현재 시세 범위 안에 있습니다.';
    case 'EXPENSIVE':
      return '조금 높은 편입니다. 중앙값 근처로 흥정해 보세요.';
    case 'VERY_EXPENSIVE':
      return '상당히 높은 편입니다. 다른 가게와 비교해 보세요.';
  }
}

function verdictKeySegment(verdict: Verdict): string {
  switch (verdict) {
    case 'CHEAP':
      return 'cheap';
    case 'FAIR':
      return 'fair';
    case 'EXPENSIVE':
      return 'expensive';
    case 'VERY_EXPENSIVE':
      return 'veryExpensive';
  }
}
