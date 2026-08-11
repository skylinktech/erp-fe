import type { FormPageNavItem } from '~/types/form-page'

/** Navigasi modul Finance untuk sidebar form. */
export const FINANCE_MODULE_NAV: FormPageNavItem[] = [
  { label: 'Invoices', to: '/finance/invoices', icon: 'ri-bill-line' },
  { label: 'Credit Notes', to: '/finance/credit-notes', icon: 'ri-file-reduce-line' },
  { label: 'Payment Request', to: '/finance/payment-request', icon: 'ri-hand-coin-line' },
  { label: 'AR Receipts', to: '/finance/ar-receipts', icon: 'ri-wallet-3-line' },
  { label: 'AP Payments', to: '/finance/ap-payments', icon: 'ri-money-dollar-circle-line' },
  { label: 'AR Aging', to: '/finance/reports/ar-aging', icon: 'ri-time-line' },
  { label: 'AP Aging', to: '/finance/reports/ap-aging', icon: 'ri-history-line' },
  { label: 'Trial Balance', to: '/finance/reports/trial-balance', icon: 'ri-scales-3-line' },
  { label: 'Profit & Loss', to: '/finance/reports/profit-loss', icon: 'ri-line-chart-line' },
  { label: 'Balance Sheet', to: '/finance/reports/balance-sheet', icon: 'ri-file-chart-line' },
  { label: 'Cash Flow', to: '/finance/reports/cash-flow', icon: 'ri-funds-line' },
  { label: 'General Ledger', to: '/finance/reports/general-ledger', icon: 'ri-book-open-line' },
  { label: 'Bank Reconciliation', to: '/finance/bank-recon', icon: 'ri-bank-line' },
  { label: 'Fiscal Periods', to: '/finance/fiscal-periods', icon: 'ri-calendar-check-line' },
  { label: 'Journals', to: '/finance/journals', icon: 'ri-book-2-line' },
  { label: 'Billing Adjustments', to: '/finance/billing-adjustments', icon: 'ri-swap-line' },
  { label: 'Billing Preparations', to: '/finance/billing-preparations', icon: 'ri-file-list-3-line' },
  { label: 'Pricing Approval', to: '/finance/pricing-approval', icon: 'ri-price-tag-3-line' },
  { label: 'Tax Master', to: '/finance/tax-masters', icon: 'ri-percent-line' },
]
