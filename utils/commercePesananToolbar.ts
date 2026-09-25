/**
 * Toolbar actions for Omnichannel list filter cards — pure capability map (no fetch).
 * Write/download features stay disabled until real APIs exist (anti-fake UI).
 */

export type CommerceListToolbarAction = {
  key: string
  label: string
  icon?: string
  enabled: boolean
  reason: string
}

/** @deprecated Use CommerceListToolbarAction */
export type CommercePesananToolbarAction = CommerceListToolbarAction

const READONLY = 'Belum diaktifkan di SkyFlow (fase read-only).'

export const PESANAN_ARCHIVED_ACTION: CommerceListToolbarAction = {
  key: 'archived',
  label: 'Pesanan Diarsipkan',
  icon: 'ri-archive-line',
  enabled: false,
  reason: `Pesanan Diarsipkan — ${READONLY}`,
}

export const PESANAN_EMAIL_ACTION: CommerceListToolbarAction = {
  key: 'emailNotify',
  label: 'Email Notifikasi',
  icon: 'ri-mail-line',
  enabled: false,
  reason: `Email Notifikasi — ${READONLY}`,
}

export const PESANAN_DOWNLOAD_ACTIONS: CommerceListToolbarAction[] = [
  {
    key: 'downloadOrders',
    label: 'Unduh Pesanan',
    enabled: false,
    reason: `Unduh Pesanan — ${READONLY}`,
  },
  {
    key: 'downloadScanReport',
    label: 'Unduh Laporan Scan Paket',
    enabled: false,
    reason: `Unduh Laporan Scan Paket — ${READONLY}`,
  },
  {
    key: 'downloadMatchReport',
    label: 'Unduh Laporan Cocokkan Pesanan',
    enabled: false,
    reason: `Unduh Laporan Cocokkan Pesanan — ${READONLY}`,
  },
]

export const PENGEMBALIAN_ARCHIVED_ACTION: CommerceListToolbarAction = {
  key: 'archived',
  label: 'Pengembalian Diarsipkan',
  icon: 'ri-archive-line',
  enabled: false,
  reason: `Pengembalian Diarsipkan — ${READONLY}`,
}

export const PENGEMBALIAN_EMAIL_ACTION: CommerceListToolbarAction = {
  key: 'emailNotify',
  label: 'Email Notifikasi',
  icon: 'ri-mail-line',
  enabled: false,
  reason: `Email Notifikasi — ${READONLY}`,
}

export const PENGEMBALIAN_DOWNLOAD_ACTIONS: CommerceListToolbarAction[] = [
  {
    key: 'downloadReturns',
    label: 'Unduh Pengembalian',
    enabled: false,
    reason: `Unduh Pengembalian — ${READONLY}`,
  },
  {
    key: 'downloadReturnsReport',
    label: 'Unduh Laporan Aftersales',
    enabled: false,
    reason: `Unduh Laporan Aftersales — ${READONLY}`,
  },
]
