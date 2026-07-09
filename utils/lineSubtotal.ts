export function lineSubtotal(item: { quantity?: number | null; price?: number | null } | null | undefined): number {
  return (Number(item?.quantity) || 0) * (Number(item?.price) || 0)
}
