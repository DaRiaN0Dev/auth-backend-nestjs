const DURATION_PATTERN = /^(\d+)([smhd])$/i;

export function durationToMs(value: string): number {
  const normalized = value.trim().toLowerCase();
  const match = DURATION_PATTERN.exec(normalized);

  if (!match) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const unitToMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitToMs[unit];
}
