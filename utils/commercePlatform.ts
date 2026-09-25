/** Platform icon class for commerce badges (Remix Icon). */
export function commercePlatformIcon(platformCode?: string | null): string {
  const code = String(platformCode || '').toUpperCase()
  if (code.includes('TIKTOK')) return 'ri-tiktok-fill text-dark'
  if (code.includes('SHOPEE')) return 'ri-shopping-bag-fill text-danger'
  if (code.includes('LAZADA')) return 'ri-store-2-fill text-primary'
  if (code.includes('TOKOPEDIA')) return 'ri-store-3-fill text-success'
  if (code.includes('BLIBLI')) return 'ri-shopping-cart-2-fill text-info'
  return 'ri-store-2-line text-secondary'
}

export function commercePlatformLabel(platformCode?: string | null): string {
  const code = String(platformCode || '').toUpperCase()
  if (code.includes('TIKTOK')) return 'TikTok Shop'
  if (code.includes('SHOPEE')) return 'Shopee'
  if (code.includes('LAZADA')) return 'Lazada'
  if (code.includes('TOKOPEDIA')) return 'Tokopedia'
  if (code.includes('BLIBLI')) return 'Blibli'
  return platformCode || 'Marketplace'
}
