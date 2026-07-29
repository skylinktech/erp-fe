import type { FormPageNavItem } from '~/types/form-page'

/** Navigasi modul Purchasing untuk sidebar form. */
export const PURCHASING_MODULE_NAV: FormPageNavItem[] = [
  { label: 'Purchase Request', to: '/purchasing/purchase-request', icon: 'ri-file-list-3-line' },
  { label: 'Material Request Form', to: '/purchasing/material-request', icon: 'ri-box-3-line' },
  { label: 'Purchase Order', to: '/purchasing/purchase-order', icon: 'ri-shopping-cart-line' },
  { label: 'Purchase Invoice', to: '/purchasing/purchase-invoice', icon: 'ri-bill-line' },
  { label: 'Vendor', to: '/purchasing/vendor', icon: 'ri-store-2-line' },
]
