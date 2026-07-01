export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
}

export function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return asString(value);
}

export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function asDateString(value: unknown, fallback = ''): string {
  return asString(value, fallback).slice(0, 10);
}

export function asTimestampString(value: unknown, fallback = ''): string {
  return asString(value, fallback);
}

export function normalizeSourceBreakdown(value: unknown): Record<string, number> {
  const raw = typeof value === 'string' ? parseJson(value) : value;
  const record = asRecord(raw);
  return Object.fromEntries(
    Object.entries(record)
      .map(([key, count]) => [key, asNumber(count, 0)] as const)
      .filter(([, count]) => count > 0),
  );
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return {};
  }
}
