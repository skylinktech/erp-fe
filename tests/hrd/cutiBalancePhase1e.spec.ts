import { describe, expect, it } from 'vitest'
import {
  MANUAL_SALDO_COPY,
  allowsManualBalanceProvision,
  annualQuotaLimit,
  requiresBalance,
  resolveCutiTypeBalancePolicy,
} from '~/constants/hrd/cutiBalancePolicy'
import { normalizeApiError } from '~/utils/apiError'
import { enrichCutiBalanceErrorMessage } from '~/utils/cutiBalanceErrors'
import {
  formatReconciliationSuccessMessage,
  formatReconciliationSummaryHtml,
  hasReconciliationWarnings,
} from '~/utils/cutiBersamaReconciliation'

describe('Phase 1E — cuti balance policy UX mirror', () => {
  it('exposes manual saldo copy without auto_prorata wording', () => {
    expect(MANUAL_SALDO_COPY).toContain('manual')
    expect(MANUAL_SALDO_COPY.toLowerCase()).not.toContain('pro-rata')
    expect(MANUAL_SALDO_COPY.toLowerCase()).not.toContain('prorata')
  })

  it('CT max 12, IZ max 2, CB no cap', () => {
    expect(annualQuotaLimit('CT')).toBe(12)
    expect(annualQuotaLimit('IZ')).toBe(2)
    expect(annualQuotaLimit('CB')).toBeNull()
  })

  it('CM/CTB are not provisionable; required/optional/none split', () => {
    expect(allowsManualBalanceProvision('CM')).toBe(false)
    expect(allowsManualBalanceProvision('CTB')).toBe(false)
    expect(allowsManualBalanceProvision('CT')).toBe(true)
    expect(allowsManualBalanceProvision('CS')).toBe(true)
    expect(requiresBalance('CT')).toBe(true)
    expect(requiresBalance('CS')).toBe(false)
    expect(resolveCutiTypeBalancePolicy('CM').consumption).toBe('none')
    expect(resolveCutiTypeBalancePolicy('CTB').consumption).toBe('none')
    expect(resolveCutiTypeBalancePolicy('CS').consumption).toBe('optional')
  })
})

describe('Phase 1E — create/update payload helpers', () => {
  it('create payload sends explicit quota and never auto_prorata', () => {
    const createBody = {
      pegawai_id: 1,
      cuti_type_id: 2,
      tahun: 2026,
      sisa_jatah_cuti: 8,
      cuti_terpakai: 4,
      sisa_cuti_tahun_lalu: 0,
      valid_sampai: '2026-12-31',
    }
    expect(createBody).not.toHaveProperty('auto_prorata')
    expect(createBody.sisa_jatah_cuti).toBe(8)
    expect(createBody.sisa_jatah_cuti + createBody.cuti_terpakai).toBe(12)
  })

  it('edit payload omits identity fields', () => {
    const updateBody = {
      sisa_jatah_cuti: 5,
      cuti_terpakai: 3,
      sisa_cuti_tahun_lalu: 0,
      valid_sampai: '2026-12-31',
    }
    expect(updateBody).not.toHaveProperty('pegawai_id')
    expect(updateBody).not.toHaveProperty('cuti_type_id')
    expect(updateBody).not.toHaveProperty('tahun')
    expect(updateBody).not.toHaveProperty('auto_prorata')
  })

  it('required without balance blocks submit; optional/none do not', () => {
    const requiredMissing = resolveCutiTypeBalancePolicy('CT').consumption === 'required' && !null
    const optionalOk = resolveCutiTypeBalancePolicy('CS').consumption === 'optional'
    const noneOk = resolveCutiTypeBalancePolicy('CM').consumption === 'none'
    expect(requiredMissing).toBe(true)
    expect(optionalOk).toBe(true)
    expect(noneOk).toBe(true)

    const submitBlocked = (policy: string, configured: boolean) =>
      policy === 'required' && !configured
    expect(submitBlocked('required', false)).toBe(true)
    expect(submitBlocked('optional', false)).toBe(false)
    expect(submitBlocked('none', false)).toBe(false)
  })
})

describe('Phase 1E — CT summary empty state + domain errors', () => {
  it('configured:false is valid empty state not a generic error', () => {
    const summary = {
      tahun: 2026,
      configured: false,
      balance: null,
      jatah_tahunan: 0,
      sisa_jatah_cuti: 0,
      cuti_terpakai: 0,
      cuti_bersama_total: 0,
      cuti_pengajuan_terpakai: 0,
      breakdown: [],
    }
    expect(summary.configured).toBe(false)
    expect(summary.balance).toBeNull()
    const emptyMessage = `Saldo Cuti Tahunan tahun ${summary.tahun} belum diatur oleh HR.`
    expect(emptyMessage).toContain('belum diatur')
  })

  it('preserves CUTI_BALANCE domain message instead of generic save failure', () => {
    const err = normalizeApiError(
      {
        status: 422,
        data: {
          success: false,
          message: 'Saldo Cuti Tahunan untuk tahun 2026 belum tersedia. Hubungi HRD.',
          data: { tahun: 2026 },
          meta: { code: 'CUTI_BALANCE_NOT_CONFIGURED' },
        },
      },
      'Gagal menyimpan data'
    )
    expect(err.code).toBe('CUTI_BALANCE_NOT_CONFIGURED')
    expect(err.message).toContain('belum tersedia')
    expect(err.message).not.toBe('Gagal menyimpan data')
  })

  it('enriches consumption floor and insufficient breakdown', () => {
    const floorErr = normalizeApiError(
      {
        status: 422,
        data: {
          message: 'Cuti terpakai tidak boleh lebih kecil dari konsumsi aktual.',
          meta: {
            code: 'CUTI_BALANCE_BELOW_CONSUMED_AMOUNT',
            minimum_cuti_terpakai: 5,
            approved_leave_days: 3,
            cuti_bersama_days: 2,
          },
        },
      },
      'Gagal menyimpan data'
    )
    const enriched = enrichCutiBalanceErrorMessage(floorErr)
    expect(enriched).toContain('Minimum cuti terpakai: 5')

    const insuff = normalizeApiError(
      {
        status: 422,
        data: {
          message: 'Saldo tidak cukup.',
          meta: { code: 'CUTI_BALANCE_INSUFFICIENT', available: 1, required: 3 },
        },
      },
      'Gagal'
    )
    expect(enrichCutiBalanceErrorMessage(insuff)).toContain('Tersedia 1, dibutuhkan 3')
  })

  it('duplicate conflict stays specific', () => {
    const err = normalizeApiError(
      {
        status: 409,
        data: {
          message: 'Tipe cuti pegawai di tahun 2026 sudah ada.',
          meta: { code: 'CUTI_BALANCE_DUPLICATE', tahun: 2026 },
        },
      },
      'Gagal menyimpan data'
    )
    expect(err.type).toBe('conflict')
    expect(enrichCutiBalanceErrorMessage(err)).toBe('Tipe cuti pegawai di tahun 2026 sudah ada.')
  })
})

describe('Phase 1E — Cuti Bersama reconciliation UI helpers', () => {
  it('success without warnings', () => {
    const rec = {
      affected_employee_count: 10,
      total_deducted_days: 10,
      skipped_ineligible_count: 0,
      missing_balance_count: 0,
      insufficient_balance_count: 0,
      skipped_ineligible: [],
      missing_balances: [],
      insufficient_balances: [],
      details_truncated: false,
      detail_limit: 50,
    }
    expect(hasReconciliationWarnings(rec)).toBe(false)
    expect(formatReconciliationSuccessMessage(rec)).toContain('seluruh saldo eligible')
  })

  it('warning summary includes missing / insufficient / ineligible + truncated note', () => {
    const rec = {
      affected_employee_count: 10,
      total_deducted_days: 10,
      skipped_ineligible_count: 2,
      missing_balance_count: 1,
      insufficient_balance_count: 1,
      skipped_ineligible: [
        { pegawai_id: 1, nama: 'A', reason_code: 'EMPLOYEE_FREELANCE' },
      ],
      missing_balances: [
        { pegawai_id: 2, nama: 'B', tahun: 2026, reason_code: 'CUTI_BALANCE_NOT_CONFIGURED' },
      ],
      insufficient_balances: [
        {
          pegawai_id: 3,
          nama: 'C',
          tahun: 2026,
          available: 0,
          required: 1,
          reason_code: 'CUTI_BALANCE_INSUFFICIENT',
        },
      ],
      details_truncated: true,
      detail_limit: 50,
    }
    expect(hasReconciliationWarnings(rec)).toBe(true)
    const html = formatReconciliationSummaryHtml(rec)
    expect(html).toContain('Event berhasil disimpan')
    expect(html).toContain('belum memiliki saldo CT')
    expect(html).toContain('tidak memenuhi syarat')
    expect(html).toContain('saldo tidak cukup')
    expect(html).toContain('tersedia 0, dibutuhkan 1')
    expect(html).toContain('Sebagian detail ditampilkan')
    expect(html).toContain('EMPLOYEE_FREELANCE')
  })
})
