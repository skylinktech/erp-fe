/**
 * Shared financial report completeness banner state from API payload.
 * Null lines are never attributed to Active Company; PARTIAL means incomplete, not empty.
 */
export function useReportCompleteness(report: Ref<any>) {
  const completeness = computed(() => report.value?.completeness || null)

  const bannerClass = computed(() => {
    const status = completeness.value?.status
    if (status === 'COMPLETE') return 'alert alert-success'
    if (status === 'PARTIAL') return 'alert alert-warning'
    return ''
  })

  const bannerText = computed(() => {
    const c = completeness.value
    if (!c) return ''
    if (c.status === 'COMPLETE') {
      return 'Kelengkapan laporan periode ini: COMPLETE (ownership jurnal konsisten untuk company aktif).'
    }
    if (c.status === 'PARTIAL') {
      const nullN = c.unresolved?.nullCompanyLinesInPeriod ?? 0
      const mixedN = c.unresolved?.mixedOrPartialNullJournalsInPeriod ?? 0
      return `Laporan perusahaan ini berstatus PARTIAL untuk periode terpilih. Null company lines: ${nullN}; jurnal mixed/partial: ${mixedN}. Angka hanya mencakup lines ber-company Active Company — bukan laporan historis lengkap.`
    }
    return `Kelengkapan tidak dapat dipastikan (${c.status}).`
  })

  return { completeness, bannerClass, bannerText }
}
