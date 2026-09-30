/**
 * Pure helpers for composing TikTok product_attributes draft values.
 */

export type ProductAttributeValue = { id?: string; name: string }

export type ProductAttributeSelection = {
  id: string
  values: ProductAttributeValue[]
}

export type CategoryAttributeOption = {
  id: string
  name: string
  isMandatory: boolean
  isMultipleSelection?: boolean
  isCustomizable?: boolean
  values: Array<{ id: string; name: string }>
}

/**
 * Upsert one attribute selection into the draft productAttributes array.
 * Empty values remove the attribute (so mandatory validation can re-fire).
 */
export function upsertProductAttribute(
  current: ProductAttributeSelection[] | null | undefined,
  attributeId: string,
  values: ProductAttributeValue[]
): ProductAttributeSelection[] {
  const id = String(attributeId || '').trim()
  const list = Array.isArray(current) ? current.filter((a) => String(a?.id || '').trim() !== id) : []
  const cleaned = (values || [])
    .map((v) => ({
      id: v.id != null && String(v.id).trim() ? String(v.id).trim() : undefined,
      name: String(v.name || '').trim(),
    }))
    .filter((v) => v.name)
  if (!id || !cleaned.length) return list
  return [...list, { id, values: cleaned }]
}

export function getSelectedValueIds(
  current: ProductAttributeSelection[] | null | undefined,
  attributeId: string
): string[] {
  const row = (current || []).find((a) => String(a.id) === String(attributeId))
  if (!row?.values?.length) return []
  return row.values.map((v) => String(v.id || v.name || '')).filter(Boolean)
}

export function getSelectedCustomName(
  current: ProductAttributeSelection[] | null | undefined,
  attributeId: string
): string {
  const row = (current || []).find((a) => String(a.id) === String(attributeId))
  if (!row?.values?.length) return ''
  // Prefer free-text name when no option id
  const custom = row.values.find((v) => !v.id)
  return custom?.name || row.values[0]?.name || ''
}
