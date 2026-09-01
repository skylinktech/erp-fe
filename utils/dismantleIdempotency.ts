const intentKeys = new Map<string, string>()

function randomKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `dism-${crypto.randomUUID()}`
  }
  return `dism-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

/** Reuse the same key for one user intent (retry-safe). */
export function getDismantleIdempotencyKey(intent: string): string {
  const existing = intentKeys.get(intent)
  if (existing) return existing
  const key = randomKey()
  intentKeys.set(intent, key)
  return key
}

export function clearDismantleIdempotencyKey(intent: string): void {
  intentKeys.delete(intent)
}

export function resetDismantleIdempotencyKeys(): void {
  intentKeys.clear()
}
