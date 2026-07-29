import type { FormPageNavItem } from '~/types/form-page'

/** Navigasi modul Finance untuk sidebar form. */
export const FINANCE_MODULE_NAV: FormPageNavItem[] = [
  { label: 'Invoices', to: '/finance/invoices', icon: 'ri-bill-line' },
  { label: 'Payment Request', to: '/finance/payment-request', icon: 'ri-hand-coin-line' },
  { label: 'Billing Adjustments', to: '/finance/billing-adjustments', icon: 'ri-swap-line' },
  { label: 'Billing Preparations', to: '/finance/billing-preparations', icon: 'ri-file-list-3-line' },
  { label: 'Pricing Approval', to: '/finance/pricing-approval', icon: 'ri-price-tag-3-line' },
  { label: 'Tax Master', to: '/finance/tax-masters', icon: 'ri-percent-line' },
]
