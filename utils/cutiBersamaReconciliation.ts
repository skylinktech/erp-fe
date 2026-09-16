export type CutiBersamaReconciliationReport = {
  affected_employee_count: number
  total_deducted_days: number
  skipped_ineligible_count: number
  missing_balance_count: number
  insufficient_balance_count: number
  skipped_ineligible: Array<{ pegawai_id: number; nama: string; reason_code: string }>
  missing_balances: Array<{ pegawai_id: number; nama: string; tahun: number; reason_code: string }>
  insufficient_balances: Array<{
    pegawai_id: number
    nama: string
    tahun: number
    available: number
    required: number
    reason_code: string
  }>
  details_truncated: boolean
  detail_limit: number
}

export function hasReconciliationWarnings(rec: CutiBersamaReconciliationReport | null | undefined): boolean {
  if (!rec) return false
  return (
    Number(rec.skipped_ineligible_count || 0) > 0 ||
    Number(rec.missing_balance_count || 0) > 0 ||
    Number(rec.insufficient_balance_count || 0) > 0
  )
}

export function formatReconciliationSummaryHtml(rec: CutiBersamaReconciliationReport): string {
  const lines: string[] = [
    '<p>Event berhasil disimpan.</p>',
    `<p><strong>${rec.affected_employee_count}</strong> pegawai berhasil diproses` +
      (rec.total_deducted_days
        ? ` (${rec.total_deducted_days} hari dipotong).`
        : '.') +
      '</p>',
  ]

  if (rec.skipped_ineligible_count > 0) {
    lines.push(
      `<p><strong>${rec.skipped_ineligible_count}</strong> pegawai tidak memenuhi syarat.</p>`
    )
  }
  if (rec.missing_balance_count > 0) {
    lines.push(
      `<p><strong>${rec.missing_balance_count}</strong> pegawai belum memiliki saldo CT.</p>`
    )
  }
  if (rec.insufficient_balance_count > 0) {
    lines.push(
      `<p><strong>${rec.insufficient_balance_count}</strong> pegawai memiliki saldo tidak cukup.</p>`
    )
  }

  const detailBlocks: string[] = []

  if (rec.skipped_ineligible?.length) {
    const items = rec.skipped_ineligible
      .map((r) => `<li>${escapeHtml(r.nama)} — ${escapeHtml(r.reason_code)}</li>`)
      .join('')
    detailBlocks.push(`<p class="mb-1"><strong>Tidak memenuhi syarat</strong></p><ul>${items}</ul>`)
  }

  if (rec.missing_balances?.length) {
    const items = rec.missing_balances
      .map((r) => `<li>${escapeHtml(r.nama)} — tahun ${r.tahun}</li>`)
      .join('')
    detailBlocks.push(`<p class="mb-1"><strong>Belum ada saldo CT</strong></p><ul>${items}</ul>`)
  }

  if (rec.insufficient_balances?.length) {
    const items = rec.insufficient_balances
      .map(
        (r) =>
          `<li>${escapeHtml(r.nama)} — tersedia ${r.available}, dibutuhkan ${r.required} (tahun ${r.tahun})</li>`
      )
      .join('')
    detailBlocks.push(`<p class="mb-1"><strong>Saldo tidak cukup</strong></p><ul>${items}</ul>`)
  }

  if (detailBlocks.length) {
    lines.push('<hr/>', ...detailBlocks)
  }

  if (rec.details_truncated) {
    lines.push(
      `<p class="text-muted small">Sebagian detail ditampilkan (batas ${rec.detail_limit} per kategori). Total per kategori tetap sesuai ringkasan.</p>`
    )
  }

  return lines.join('')
}

export function formatReconciliationSuccessMessage(rec: CutiBersamaReconciliationReport): string {
  return (
    'Event Cuti Bersama berhasil disimpan dan seluruh saldo eligible telah diperbarui' +
    (rec.affected_employee_count
      ? ` (${rec.affected_employee_count} pegawai, ${rec.total_deducted_days} hari).`
      : '.')
  )
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
