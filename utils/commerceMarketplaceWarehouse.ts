export type MarketplaceWarehouseOption = {
  id: string
  name: string
  type?: string | null
  subType?: string | null
  effectStatus?: string | null
  isDefault?: boolean | null
  usable?: boolean
}

function typeTag(type?: string | null): string | null {
  const t = String(type || '').toUpperCase()
  if (t === 'RETURN_WAREHOUSE' || t === '2') return 'Retur'
  return null
}

function statusTag(status?: string | null): string | null {
  const s = String(status || '').toUpperCase()
  if (!s) return null
  if (s === 'ENABLED' || s === 'AVAILABLE' || s === 'EFFECTIVE' || s === '0' || s === '1') return null
  return 'Tidak aktif'
}

export function marketplaceWarehouseOptionLabel(w: MarketplaceWarehouseOption): string {
  const name = String(w.name || w.id || '').trim() || w.id
  const tags = [w.isDefault ? 'Utama' : null, typeTag(w.type), statusTag(w.effectStatus)].filter(
    Boolean
  ) as string[]
  return tags.length ? `${name} (${tags.join(' · ')})` : name
}

export function withCurrentWarehouseOption(
  options: MarketplaceWarehouseOption[],
  currentId: string | null | undefined
): MarketplaceWarehouseOption[] {
  const id = String(currentId || '').trim()
  if (!id) return options
  if (options.some((o) => o.id === id)) return options
  return [{ id, name: `ID ${id}`, usable: false }, ...options]
}

/** Live Seller Center name for a mapped marketplace warehouse id. */
export function marketplaceWarehouseNameById(
  options: MarketplaceWarehouseOption[] | null | undefined,
  externalId: string | null | undefined
): string | null {
  const id = String(externalId || '').trim()
  if (!id) return null
  const found = (options || []).find((o) => String(o.id) === id)
  if (!found) return null
  const name = String(found.name || '').trim()
  return name || null
}
