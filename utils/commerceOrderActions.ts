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
  arrangeShipment?: CommerceActionState
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

const READONLY = 'Belum diaktifkan di SkyFlow (fase read-only).'

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
    actions?.printDocs?.reason ||
    'Cetak dokumen fulfillment belum diaktifkan (read-only).'
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
      key: 'cancelOrder',
      label: 'Batalkan Pesanan',
      danger: true,
      ...(() => {
        const s = state(actions, 'cancelOrder', `Batalkan Pesanan — ${READONLY}`)
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
    'Atur Pengiriman / fulfill write-path UNSUPPORTED pada fase ini.'
  )
}
