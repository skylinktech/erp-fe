import { computed, watch, type ComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface PageCrumb {
  label: string
  to?: string
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  settings: 'Settings',
  sales: 'Sales',
  fdr: 'FDR',
  quotation: 'Quotation',
  'sales-order': 'Sales Order',
  'sales-invoice': 'Sales Invoice',
  'surat-jalan': 'Surat Jalan',
  'site-investment': 'Site Investment',
  'sales-pipeline': 'Sales Pipeline',
  customer: 'Customer',
  'order-process': 'Order Processing',
  'legal-tech': 'Legal-Tech Review',
  'customer-verif': 'Customer Verification',
  pks: 'PKS',
  subscription: 'Subscription',
  'service-management': 'Service Management',
  events: 'Events',
  monitoring: 'Monitoring',
  service: 'Service',
  'service-plan': 'Service Plan',
  did: 'DID',
  inventory: 'Inventory',
  product: 'Product',
  stock: 'Stock',
  'stock-in': 'Stock In',
  'stock-out': 'Stock Out',
  'stock-transfer': 'Stock Transfer',
  adjustment: 'Adjustment',
  'purchase-return': 'Purchase Return',
  unit: 'Unit',
  kategori: 'Kategori',
  gudang: 'Gudang',
  'stock-movements': 'Stock Movements',
  'cost-balance': 'Cost Balance',
  valuation: 'Valuation',
  implementation: 'Implementation',
  arf: 'ARF',
  'progress-tracker': 'Progress Tracker',
  operations: 'Operations',
  'work-order-request': 'Work Order Request',
  'request-activation': 'Request Activation',
  'berita-acara': 'Berita Acara',
  purchasing: 'Purchasing',
  'purchase-order': 'Purchase Order',
  'purchase-invoice': 'Purchase Invoice',
  'purchase-request': 'Purchase Request',
  'material-request': 'Material Request',
  vendor: 'Vendor',
  company: 'Company',
  perusahaan: 'Perusahaan',
  site: 'Site',
  cabang: 'Cabang',
  finance: 'Finance',
  invoices: 'Invoice Tagihan',
  'price-list': 'Price List',
  budgets: 'Budgets',
  'cost-center': 'Cost Center',
  expenses: 'Pengeluaran',
  'bank-account': 'Rekening Bank',
  'bank-recon': 'Bank Reconciliation',
  'credit-notes': 'Credit Notes',
  'fiscal-periods': 'Fiscal Periods',
  'payment-request': 'Payment Request',
  reports: 'Reports',
  'trial-balance': 'Trial Balance',
  'profit-loss': 'Profit & Loss',
  'general-ledger': 'General Ledger',
  'cash-flow': 'Cash Flow',
  'balance-sheet': 'Balance Sheet',
  'ar-aging': 'AR Aging',
  'ap-aging': 'AP Aging',
  assets: 'Aset Tetap',
  'ar-receipts': 'Penerimaan Piutang',
  accounts: 'Accounts',
  journals: 'Jurnal Umum',
  'ap-payments': 'Pembayaran ke Vendor',
  billing: 'Billing',
  'billing-adjustments': 'Billing Adjustments',
  'inventory-accounting-reconciliation': 'Inventory Reconciliation',
  'inventory-accounting-events': 'Inventory Accounting Events',
  'accounting-processing-monitor': 'Accounting Monitor',
  'accounting-exceptions': 'Accounting Exceptions',
  grni: 'GRNI',
  nrv: 'NRV',
  'inventory-cogs': 'Inventory COGS',
  ppv: 'PPV',
  hrd: 'HR',
  payroll: 'Payroll',
  runs: 'Payroll Runs',
  payments: 'Payment',
  payslips: 'Payslip',
  configuration: 'Configuration',
  components: 'Salary Components',
  structures: 'Salary Structures',
  profiles: 'Payroll Profiles',
  compensations: 'Compensation',
  periods: 'Payroll Periods',
  'tax-profiles': 'Tax Profiles',
  'bpjs-profiles': 'BPJS Profiles',
  'variable-inputs': 'Variable Input',
  pegawai: 'Pegawai',
  cuti: 'Cuti',
  'struktur-organisasi': 'Struktur Organisasi',
  departemen: 'Departemen',
  kalender: 'Kalender',
  divisi: 'Divisi',
  jabatan: 'Jabatan',
  admin: 'Admin',
  'approval-workflows': 'Approval Workflows',
  'approval-workflow-entities': 'Entity Types',
  user: 'User',
  permissions: 'Permission',
  roles: 'Role',
  role: 'Role',
  dashboards: 'Dashboards',
  'layout-builder': 'Layout Builder',
  'access-request': 'Access Request',
  documentations: 'Documentations',
  'manual-guide': 'Manual Guide',
  form: 'Form',
  detail: 'Detail',
  accounting: 'Accounting',
  pos: 'POS',
  errors: 'Error',
  'tax-masters': 'Tax Master',
  'price-adjustment-requests': 'My Price Requests',
  'import-product': 'Import Product',
  'billing-preparations': 'Billing Preparation',
  'pricing-approval': 'Pricing Approval',
  'menu-group': 'Menu Group',
  'menu-detail': 'Menu Detail',
  'sales-order-detail': 'Sales Order Detail',
  'sales-invoice-detail': 'Sales Invoice Detail',
  'purchase-order-detail': 'Purchase Order Detail',
  'purchase-invoice-detail': 'Purchase Invoice Detail',
  'surat-jalan-detail': 'Surat Jalan Detail',
  'stock-in-detail': 'Stock In Detail',
  'stock-out-detail': 'Stock Out Detail',
  'stock-transfer-detail': 'Stock Transfer Detail',
  'saldo-cuti': 'Saldo Cuti',
  'perjalanan-dinas': 'Perjalanan Dinas',
  lembur: 'Lembur',
  pending: 'Pending Activation',
  'customer-service': 'Customer Service',
  profile: 'Profile',
  widgets: 'Katalog Widget',
  analytics: 'Analytics',
  reconciliation: 'Reconciliation',
  'stock-card': 'Stock Card',
  account: 'Account',
}

function isDynamicSegment(segment: string) {
  if (/^\d+$/.test(segment)) return true
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true
  if (/^[0-9a-f]{16,}$/i.test(segment)) return true
  return false
}

function humanize(segment: string) {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment]
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildCrumbs(route: RouteLocationNormalizedLoaded, pageTitle: string): PageCrumb[] {
  const custom = route.meta.breadcrumb as PageCrumb[] | undefined
  if (custom?.length) return custom

  const segments = route.path.split('/').filter(Boolean)
  const crumbs: PageCrumb[] = []
  let acc = ''

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    acc += `/${segment}`
    const isLast = i === segments.length - 1

    if (isDynamicSegment(segment)) {
      if (isLast) {
        crumbs.push({ label: pageTitle })
      }
      continue
    }

    const label = isLast ? pageTitle : humanize(segment)
    crumbs.push({
      label,
      to: isLast ? undefined : acc,
    })
  }

  if (!crumbs.length) {
    crumbs.push({ label: pageTitle })
  }

  return crumbs
}

export function usePageHeading() {
  const route = useRoute()
  const overrideTitle = useState<string | null>('page-heading-override-title', () => null)

  const hidden = computed(() => Boolean(route.meta.hidePageHeading))

  const title: ComputedRef<string> = computed(() => {
    if (overrideTitle.value) return overrideTitle.value
    if (typeof route.meta.title === 'string' && route.meta.title.trim()) return route.meta.title
    const segments = route.path.split('/').filter((s) => s && !isDynamicSegment(s))
    const last = segments[segments.length - 1]
    return last ? humanize(last) : 'Dashboard'
  })

  const crumbs = computed(() => buildCrumbs(route, title.value))

  function setTitle(value: string | null) {
    overrideTitle.value = value
  }

  watch(
    () => route.path,
    () => {
      overrideTitle.value = null
    },
  )

  return {
    hidden,
    title,
    crumbs,
    setTitle,
  }
}
