export type PriceListLineRow = Record<string, unknown>

export function getLinePriceListId(line: PriceListLineRow | null | undefined): number | null {
  if (!line) return null
  const id = line.price_list_id ?? line.priceListId ?? line.price_list?.id ?? line.priceList?.id
  return id != null && id !== '' ? Number(id) : null
}

export function normalizePriceListLine(
  line: PriceListLineRow,
  fallbackPriceListId?: number | null,
  fallbackPriceListName?: string | null,
): PriceListLineRow {
  if (!line) return line
  const plId = getLinePriceListId(line) ?? (fallbackPriceListId != null ? Number(fallbackPriceListId) : null)
  const plName =
    (line.price_list as { name?: string } | undefined)?.name
    ?? (line.priceList as { name?: string } | undefined)?.name
    ?? fallbackPriceListName
    ?? undefined
  return {
    ...line,
    price_list_id: plId,
    priceListId: plId,
    price_list: plId
      ? {
          id: plId,
          name: plName ?? `Price List #${plId}`,
        }
      : line.price_list ?? line.priceList ?? null,
  }
}

export function mergePriceListLine(
  cache: PriceListLineRow[],
  fullLine: PriceListLineRow,
  fallbackPriceListId?: number | null,
  fallbackPriceListName?: string | null,
) {
  if (!fullLine?.id) return
  const normalized = normalizePriceListLine(fullLine, fallbackPriceListId, fallbackPriceListName)
  const idx = cache.findIndex((x) => Number(x.id) === Number(normalized.id))
  if (idx >= 0) cache[idx] = { ...cache[idx], ...normalized }
  else cache.push(normalized)
}

export function parsePriceListLinesResponse(data: unknown): PriceListLineRow[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: PriceListLineRow[] }).data
  }
  return []
}

export function getDidLineLabel(line: PriceListLineRow | null | undefined): string {
  if (!line) return '—'
  const did = line.did as { code?: string; name?: string } | undefined
  const didPart = did
    ? `${did.code || ''} - ${did.name || ''}`.trim() || `Line #${line.id}`
    : `Line #${line.id}`
  const cat = line.category_did ?? line.categoryDid
  const catStr = cat ? ` (${String(cat).split(',')[0].trim()})` : ''
  return didPart + catStr
}

export function filterLinesByPriceListId(lines: PriceListLineRow[], priceListId: number | null | undefined) {
  const plId = Number(priceListId)
  if (!plId) return lines
  return lines.filter((line) => getLinePriceListId(line) === plId)
}
