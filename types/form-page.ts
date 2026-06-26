/** Item navigasi modul di sidebar halaman form create/edit. */
export interface FormPageNavItem {
  label: string
  to: string
  icon: string
}

/** Baris ringkasan di sidebar (label + nilai). */
export interface FormPageSummaryRow {
  label: string
  value: string
}
