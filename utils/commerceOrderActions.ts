/**
 * Order card footer action descriptors — pure helpers, no fetch.
 * Backend `actions` map is the source of truth for enabled/reason (anti-fake UI).
 */

export type CommerceActionState = {
  enabled?: boolean
  reason?: string | null
}

export type CommerceOrderActionsMap = {
  chatBuyer?: CommerceActionState
  printDocs?: CommerceActionState
  printPickingList?: CommerceActionState
  printPackingList?: CommerceActionState
  printInvoice?: CommerceActionState
  printShippingLabel?: CommerceActionState
  arrangeShipment?: CommerceActionState
  confirmHandover?: CommerceActionState
  retryAccounting?: CommerceActionState
  reserveStock?: CommerceActionState
  markPicked?: CommerceActionState
  markPacked?: CommerceActionState
  cancelFulfillOps?: CommerceActionState
  cancelOrder?: CommerceActionState
  editOrder?: CommerceActionState
  matchOrder?: CommerceActionState
  bulkSelect?: CommerceActionState
  [key: string]: CommerceActionState | undefined
}

export type CommerceFooterDocStep = {
  key: string
  label: string
  enabled: boolean
  reason: string
}

export type CommerceFooterMenuItem = {
  key: string
  label: string
  icon?: string
  danger?: boolean
  disabled: boolean
  reason: string
}

const READONLY = 'Belum diaktifkan di SkyFlow.'

function state(
  actions: CommerceOrderActionsMap | null | undefined,
  key: string,
  fallbackReason: string
): { enabled: boolean; reason: string } {
  const a = actions?.[key]
  return {
    enabled: Boolean(a?.enabled),
    reason: String(a?.reason || fallbackReason),
  }
}

/** Document workflow pills shown between secondary and primary actions. */
export function resolveOrderDocumentSteps(
  actions?: CommerceOrderActionsMap | null
): CommerceFooterDocStep[] {
  const printFallback =
    actions?.printDocs?.reason || 'Cetak dokumen fulfillment belum diaktifkan.'
  return [
    {
      key: 'printPickingList',
      label: 'Picking List',
      ...state(actions, 'printPickingList', printFallback),
    },
    {
      key: 'printPackingList',
      label: 'Packing List',
      ...state(actions, 'printPackingList', printFallback),
    },
    {
      key: 'printShippingLabel',
      label: 'Label',
      ...state(actions, 'printShippingLabel', printFallback),
    },
    {
      key: 'printInvoice',
      label: 'Invoice',
      ...state(actions, 'printInvoice', printFallback),
    },
  ]
}

export function resolveOrderPrintMenu(
  actions?: CommerceOrderActionsMap | null
): CommerceFooterMenuItem[] {
  return resolveOrderDocumentSteps(actions).map((s) => ({
    key: s.key,
    label: s.label,
    icon: 'ri-printer-line',
    disabled: !s.enabled,
    reason: s.reason,
  }))
}

export function resolveOrderMoreMenu(
  actions?: CommerceOrderActionsMap | null
): CommerceFooterMenuItem[] {
  return [
    {
      key: 'reserveStock',
      label: 'Reservasi Stok',
      icon: 'ri-lock-line',
      ...(() => {
        const s = state(actions, 'reserveStock', `Reservasi — ${READONLY}`)
        return { disabled: !s.enabled, reason: s.reason }
      })(),
    },
    {
      key: 'markPicked',
      label: 'Tandai Picking',
      ...(() => {
        const s = state(actions, 'markPicked', `Picking — ${READONLY}`)
        return { disabled: !s.enabled, reason: s.reason }
      })(),
    },
    {
      key: 'markPacked',
      label: 'Tandai Packing',
      ...(() => {
        const s = state(actions, 'markPacked', `Packing — ${READONLY}`)
        return { disabled: !s.enabled, reason: s.reason }
      })(),
    },
    {
      key: 'confirmHandover',
      label: 'Konfirmasi Serah Kurir',
      icon: 'ri-truck-line',
      ...(() => {
        const s = state(actions, 'confirmHandover', `Handover — ${READONLY}`)
        return { disabled: !s.enabled, reason: s.reason }
      })(),
    },
    {
      key: 'retryAccounting',
      label: 'Retry Accounting (GL)',
      icon: 'ri-refresh-line',
      ...(() => {
        const s = state(
          actions,
          'retryAccounting',
          'Retry GL hanya setelah handover — tidak mengulang stok/valuasi.'
        )
        return { disabled: !s.enabled, reason: s.reason }
      })(),
    },
    {
      key: 'cancelFulfillOps',
      label: 'Lepas Reservation Lokal',
      danger: true,
      ...(() => {
        const s = state(
          actions,
          'cancelFulfillOps',
          'Lepas reservation lokal (bukan cancel TikTok).'
        )
        return { disabled: !s.enabled, reason: s.reason }
      })(),
    },
    {
      key: 'cancelOrder',
      label: 'Batalkan Pesanan (TikTok)',
      danger: true,
      ...(() => {
        const s = state(
          actions,
          'cancelOrder',
          'Seller cancel TikTok — butuh scope return_refund + alasan resmi.'
        )
        return { disabled: !s.enabled, reason: s.reason }
      })(),
    },
    {
      key: 'editOrder',
      label: 'Ubah Pesanan',
      ...(() => {
        const s = state(actions, 'editOrder', `Ubah Pesanan — ${READONLY}`)
        return { disabled: !s.enabled, reason: s.reason }
      })(),
    },
  ]
}

export function resolveChatBuyer(actions?: CommerceOrderActionsMap | null) {
  return state(actions, 'chatBuyer', 'Chat Pembeli belum dihubungkan di SkyFlow.')
}

export function resolveArrangeShipment(actions?: CommerceOrderActionsMap | null) {
  return state(
    actions,
    'arrangeShipment',
    'Atur Pengiriman belum tersedia untuk pesanan ini.'
  )
}

export function resolveConfirmHandover(actions?: CommerceOrderActionsMap | null) {
  return state(
    actions,
    'confirmHandover',
    'Konfirmasi serah kurir belum tersedia.'
  )
}
