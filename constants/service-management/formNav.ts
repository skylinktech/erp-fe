import type { FormPageNavItem } from '~/types/form-page'

/** Navigasi modul Service Management. */
export const SERVICE_MANAGEMENT_NAV: FormPageNavItem[] = [
  {
    label: 'Customer Service',
    to: '/service-management/customer-service',
    icon: 'ri-customer-service-2-line',
  },
  { label: 'Pending', to: '/service-management/pending', icon: 'ri-time-line' },
  { label: 'Events', to: '/service-management/events', icon: 'ri-history-line' },
  { label: 'Monitoring', to: '/service-management/monitoring', icon: 'ri-pulse-line' },
]
