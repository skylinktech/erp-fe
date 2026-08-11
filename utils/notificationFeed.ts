export type NotificationTab = 'inbox' | 'general' | 'archived'

export interface NotificationFeedItem {
  id: number | string
  recipientId: number
  isRead: boolean
  type: string
  event: string
  status: string
  createdAt: string
  createdByName: string
  title: string
  subtitle: string
  categoryLabel: string
  raw: Record<string, unknown>
}

/** Ubah snake_case / kebab-case menjadi Title Case, mis. payment_request → Payment Request */
export function humanizeNotificationLabel(value: string): string {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (!/[_-]/.test(raw) && !/^[a-z0-9]+$/i.test(raw)) return raw
  return raw
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function getNotificationTypeLabel(type: string): string {
  const map: Record<string, string> = {
    stock_in: 'Stock In',
    stock_out: 'Stock Out',
    purchase_order: 'Purchase Order',
    sales_order: 'Sales Order',
    site_investment: 'Site Investment',
    quotation: 'Quotation',
    le_tech_review: 'Legal-Tech',
    subscription: 'Subscription',
    pks: 'PKS',
    purchase_request: 'Purchase Request',
    payment_request: 'Payment Request',
    material_request: 'Material Request Form',
    fdr: 'FDR',
    price_adjustment: 'Price Adjustment',
    arf: 'ARF',
    lembur: 'Lembur',
    cuti: 'Cuti',
    perjalanan_dinas: 'Perjalanan Dinas',
    work_order_request: 'Work Order',
  }
  if (map[type]) return map[type]
  return humanizeNotificationLabel(type) || 'Notifikasi'
}

export function getNotificationEventLabel(event: string): string {
  const map: Record<string, string> = {
    submitted: 'mengajukan',
    approved: 'menyetujui',
    rejected: 'menolak',
    created: 'membuat',
    updated: 'memperbarui',
    approval_step: 'mengirim approval',
  }
  return map[event] || humanizeNotificationLabel(event).toLowerCase() || 'memperbarui'
}

export function getNotificationEventVariant(event: string): 'warning' | 'success' | 'danger' | 'info' {
  switch (event) {
    case 'submitted':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

export function getNotificationEventHint(event: string): string {
  switch (event) {
    case 'submitted':
      return 'Menunggu approval Anda'
    case 'approved':
      return 'Telah disetujui'
    case 'rejected':
      return 'Ditolak'
    default:
      return 'Perlu perhatian'
  }
}

export function getNotificationEventIcon(event: string): string {
  switch (event) {
    case 'submitted':
      return 'ri-time-line'
    case 'approved':
      return 'ri-checkbox-circle-line'
    case 'rejected':
      return 'ri-close-circle-line'
    default:
      return 'ri-notification-3-line'
  }
}

function buildTitle(type: string, payload: Record<string, any>): string {
  switch (type) {
    case 'site_investment':
      return `Site Investment ${payload.siNumber || payload.si_number || payload.id || ''}`.trim()
    case 'quotation':
      return `Quotation ${payload.noQuotation || payload.no_quotation || payload.id || ''}`.trim()
    case 'le_tech_review':
      return `Legal-Tech Review ${payload.noLr || payload.no_lr || payload.id || ''}`.trim()
    case 'subscription':
      return `Subscription ${payload.noSubscription || payload.no_subscription || payload.id || ''}`.trim()
    case 'pks':
      return `PKS ${payload.noPks || payload.no_pks || payload.id || ''}`.trim()
    case 'purchase_request':
      return `PR ${payload.prNumber || payload.pr_number || payload.noPurchaseRequest || payload.id || ''}`.trim()
    case 'purchase_order':
      return `PO ${payload.noPo || payload.no_po || payload.id || ''}`.trim()
    case 'payment_request':
      return `Payment Request ${payload.prqNumber || payload.prq_number || payload.id || ''}`.trim()
    case 'material_request':
      return `MRF ${payload.mrfNumber || payload.mrf_number || payload.id || ''}`.trim()
    case 'fdr':
      return `FDR ${payload.fdrNumber || payload.fdr_number || payload.id || ''}`.trim()
    case 'price_adjustment':
      return `Price Adjustment ${payload.id || ''}`.trim()
    case 'arf':
      return `ARF ${payload.requestNo || payload.request_no || payload.id || ''}`.trim()
    default:
      return String(payload.title || payload.description || payload.note || `${getNotificationTypeLabel(type)} ${payload.id || ''}`).trim()
  }
}

export function mapRecipientToFeedItem(recipient: Record<string, any>): NotificationFeedItem {
  const notification = recipient.notification || {}
  const payload = (notification.payload || {}) as Record<string, any>

  const createdByName =
    payload.requestedByUser?.fullName ||
    payload.requested_by_user?.full_name ||
    payload.createdByUser?.fullName ||
    payload.created_by_user?.full_name ||
    payload.createdByName ||
    payload.createdBy ||
    payload.requestedBy ||
    'Sistem'

  const type = String(notification.type || payload.type || '')
  const event = String(notification.event || payload.event || '')
  const title = buildTitle(type, payload)
  const categoryLabel = getNotificationTypeLabel(type)
  const eventLabel = getNotificationEventLabel(event)

  let subtitle = `${eventLabel} ${title}`.trim()
  if (
    type === 'purchase_order' &&
    event === 'rejected' &&
    (payload.budgetExceeded || payload.budget_exceeded || payload.rejectionReason || payload.rejection_reason)
  ) {
    subtitle =
      payload.rejectionReason ||
      payload.rejection_reason ||
      'Budget untuk departemen ini tidak mencukupi, silakan mengajukan tambahan budget terlebih dahulu'
  }

  return {
    id: recipient.id,
    recipientId: Number(recipient.id),
    isRead: !!(recipient.is_read ?? recipient.isRead),
    type,
    event,
    status: event || String(payload.status || ''),
    createdAt:
      notification.created_at ||
      notification.createdAt ||
      recipient.created_at ||
      recipient.createdAt ||
      new Date().toISOString(),
    createdByName: String(createdByName),
    title,
    subtitle,
    categoryLabel,
    raw: recipient,
  }
}

export function getNotificationNavigationPath(item: NotificationFeedItem): string | null {
  const payload = (item.raw?.notification as { payload?: Record<string, any> } | undefined)?.payload || {}

  switch (item.type) {
    case 'purchase_order':
      return '/purchasing/purchase-order'
    case 'sales_order':
      return '/sales/sales-order'
    case 'site_investment':
      return payload.id ? `/sales/site-investment/detail/${payload.id}` : '/sales/site-investment'
    case 'fdr':
      return payload.id ? `/sales/fdr/detail/${payload.id}` : '/sales/fdr'
    case 'quotation':
      return payload.id ? `/sales/quotation/detail/${payload.id}` : '/sales/quotation'
    case 'price_adjustment':
      return payload.id ? `/sales/price-adjustment-requests` : null
    case 'arf':
      return payload.id ? `/implementation/arf/detail/${payload.id}` : '/implementation/arf'
    case 'purchase_request':
      return '/purchasing/purchase-request'
    case 'payment_request':
      return payload.id ? `/finance/payment-request/detail/${payload.id}` : '/finance/payment-request'
    case 'material_request':
      return payload.id ? `/purchasing/material-request/detail/${payload.id}` : '/purchasing/material-request'
    case 'pks':
      return payload.id ? `/order-process/pks/form/${payload.id}` : '/order-process/pks'
    case 'subscription':
      return payload.id ? `/order-process/subscription/form/${payload.id}` : '/order-process/subscription'
    default:
      return null
  }
}

export function formatNotificationTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Baru saja'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`
  return `${Math.floor(diffInSeconds / 86400)} hari lalu`
}

export function getTabQueryParams(tab: NotificationTab): Record<string, string> {
  switch (tab) {
    case 'inbox':
      return { unreadOnly: 'true' }
    case 'archived':
      return { readOnly: 'true' }
    default:
      return {}
  }
}
