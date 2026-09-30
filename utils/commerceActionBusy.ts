/**
 * Stable action keys + loading labels for Omnichannel UI.
 * Key shape: `{action}:{targetId}:{companyId}` — avoid one global busy flag.
 */

export type CommerceActionPhase =
  | 'idle'
  | 'running'
  | 'queued'
  | 'processing'
  | 'done'
  | 'error'
  | 'ambiguous'
  | 'unconfirmed'

export type CommerceActionLabelPair = {
  idle: string
  running: string
  queued?: string
  processing?: string
}

/** Default idle/running labels by action kind */
export const COMMERCE_ACTION_LABELS: Record<string, CommerceActionLabelPair> = {
  reload: { idle: 'Muat ulang', running: 'Memuat…' },
  filter: { idle: 'Filter', running: 'Memfilter…' },
  reset: { idle: 'Reset', running: 'Mereset…' },
  sync: { idle: 'Sync', running: 'Menyinkronkan…', queued: 'Dalam antrean', processing: 'Sedang diproses' },
  'sync-shops': {
    idle: 'Sync Shop',
    running: 'Menyinkronkan…',
    queued: 'Dalam antrean',
    processing: 'Sedang diproses',
  },
  'sync-products': {
    idle: 'Sync Produk',
    running: 'Menyinkronkan…',
    queued: 'Dalam antrean',
    processing: 'Sedang diproses',
  },
  'sync-orders': {
    idle: 'Sync Order',
    running: 'Menyinkronkan…',
    queued: 'Dalam antrean',
    processing: 'Sedang diproses',
  },
  'sync-returns': {
    idle: 'Sync Aftersales',
    running: 'Menyinkronkan…',
    queued: 'Dalam antrean',
    processing: 'Sedang diproses',
  },
  test: { idle: 'Test Connection', running: 'Menguji…' },
  validate: { idle: 'Validasi', running: 'Memvalidasi…' },
  preview: { idle: 'Preview', running: 'Memuat preview…' },
  save: { idle: 'Simpan draft', running: 'Menyimpan…' },
  publish: { idle: 'Konfirmasi publish', running: 'Mengantrekan…', queued: 'Dalam antrean', processing: 'Sedang diproses' },
  reconcile: { idle: 'Rekonsiliasi', running: 'Merekonssiliasi…' },
  'refresh-status': { idle: 'Refresh status', running: 'Memuat status…' },
  arrangeShipment: { idle: 'Atur Pengiriman', running: 'Memproses…' },
  confirmHandover: { idle: 'Serah Kurir', running: 'Memproses…' },
  reserveStock: { idle: 'Reservasi', running: 'Memproses…' },
  markPicked: { idle: 'Picking', running: 'Memproses…' },
  markPacked: { idle: 'Packing', running: 'Memproses…' },
  printShippingLabel: { idle: 'Cetak label', running: 'Memuat label…' },
  printPickingList: { idle: 'Picking list', running: 'Membuka…' },
  printPackingList: { idle: 'Packing list', running: 'Membuka…' },
  cancelFulfillOps: { idle: 'Lepas reservation', running: 'Memproses…' },
  cancelOrder: { idle: 'Seller cancel', running: 'Mengirim…' },
  retryAccounting: { idle: 'Retry Accounting', running: 'Memproses…' },
  bulkArrange: { idle: 'Bulk Atur Pengiriman', running: 'Memproses…' },
  connect: { idle: 'Hubungkan TikTok', running: 'Menghubungkan…' },
  savePolicy: { idle: 'Simpan', running: 'Menyimpan…' },
  approveReturn: { idle: 'Approve Return/Refund', running: 'Memproses…' },
  rejectReturn: { idle: 'Reject Return/Refund', running: 'Memproses…' },
  release: { idle: 'Konfirmasi rilis', running: 'Merilis…' },
  openDraft: { idle: 'Buat / buka draft', running: 'Membuka…' },
}

/** Actions that conflict on the same target (disable siblings while one runs). */
export const COMMERCE_TARGET_CONFLICT_ACTIONS = new Set([
  'arrangeShipment',
  'confirmHandover',
  'reserveStock',
  'markPicked',
  'markPacked',
  'cancelFulfillOps',
  'cancelOrder',
  'retryAccounting',
  'printShippingLabel',
  'validate',
  'preview',
  'publish',
  'reconcile',
  'refresh-status',
  'save',
  'sync-products',
  'sync-orders',
  'sync-returns',
  'sync-shops',
  'test',
])

export function commerceActionKey(
  action: string,
  targetId?: string | number | null,
  companyId?: string | number | null
): string {
  return `${String(action)}:${targetId != null && targetId !== '' ? String(targetId) : '_'}:${companyId != null && companyId !== '' ? String(companyId) : '_'}`
}

export function parseCommerceActionKey(key: string): {
  action: string
  targetId: string
  companyId: string
} {
  const parts = String(key || '').split(':')
  return {
    action: parts[0] || '',
    targetId: parts[1] || '_',
    companyId: parts.slice(2).join(':') || '_',
  }
}

export function commerceActionRunningLabel(action: string, fallback = 'Memproses…'): string {
  return COMMERCE_ACTION_LABELS[action]?.running || fallback
}

export function commerceActionIdleLabel(action: string, fallback?: string): string {
  return COMMERCE_ACTION_LABELS[action]?.idle || fallback || action
}

export function commerceActionPhaseLabel(
  action: string,
  phase: CommerceActionPhase,
  fallbackIdle?: string
): string {
  const pair = COMMERCE_ACTION_LABELS[action]
  if (phase === 'running') return pair?.running || 'Memproses…'
  if (phase === 'queued') return pair?.queued || 'Dalam antrean'
  if (phase === 'processing') return pair?.processing || 'Sedang diproses'
  if (phase === 'unconfirmed') return 'Belum terkonfirmasi'
  if (phase === 'ambiguous') return 'Ambigu — cek status'
  if (phase === 'error') return pair?.idle || fallbackIdle || action
  return pair?.idle || fallbackIdle || action
}

export function isTerminalJobStatus(status: string | null | undefined): boolean {
  const s = String(status || '').toUpperCase()
  return ['DONE', 'DEAD', 'CANCELLED', 'FAILED', 'SUCCEEDED', 'COMPLETED'].includes(s)
}

export function mapJobStatusToPhase(status: string | null | undefined): CommerceActionPhase {
  const s = String(status || '').toUpperCase()
  if (s === 'PENDING') return 'queued'
  if (s === 'PROCESSING') return 'processing'
  if (s === 'DONE' || s === 'SUCCEEDED' || s === 'COMPLETED') return 'done'
  if (s === 'DEAD' || s === 'FAILED' || s === 'CANCELLED') return 'error'
  if (s === 'AMBIGUOUS') return 'ambiguous'
  return 'unconfirmed'
}
