import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  budgetSourceDisplay,
  budgetSourceLabel,
  budgetSourcePath,
} from '~/utils/budgetSourceRoutes'

const pageSrc = readFileSync(
  fileURLToPath(new URL('../../pages/finance/budgets/index.vue', import.meta.url)),
  'utf8'
)
const detailSrc = readFileSync(
  fileURLToPath(new URL('../../pages/finance/budgets/detail/[id].vue', import.meta.url)),
  'utf8'
)
const middlewareSrc = readFileSync(
  fileURLToPath(new URL('../../middleware/check-permission.ts', import.meta.url)),
  'utf8'
)

describe('budgetSourceRoutes', () => {
  it('maps known reference types to the correct detail routes', () => {
    expect(budgetSourcePath('purchase_order', '123')).toBe(
      '/purchasing/purchase-order-detail?id=123'
    )
    expect(budgetSourcePath('purchase_invoice', '456')).toBe(
      '/purchasing/purchase-invoice-detail?id=456'
    )
    expect(budgetSourcePath('purchase_request', '789')).toBe(
      '/purchasing/purchase-request/detail/789'
    )
  })

  it('returns null for missing type or id', () => {
    expect(budgetSourcePath(null, '123')).toBeNull()
    expect(budgetSourcePath('purchase_order', null)).toBeNull()
    expect(budgetSourcePath('unknown_type', '123')).toBeNull()
  })

  it('labels known and unknown/absent reference types', () => {
    expect(budgetSourceLabel('purchase_order')).toBe('Purchase Order')
    expect(budgetSourceLabel('purchase_invoice')).toBe('Purchase Invoice')
    expect(budgetSourceLabel('purchase_request')).toBe('Purchase Request')
    expect(budgetSourceLabel(null)).toBe('Manual / lainnya')
    expect(budgetSourceLabel('some_future_type')).toBe('some_future_type')
  })

  it('never falls back to a raw UUID as the document number', () => {
    const display = budgetSourceDisplay({
      type: 'purchase_order',
      number: null,
      link: '/purchasing/purchase-order-detail?id=uuid-123',
    })
    expect(display.number).toBe('—')
    expect(display.number).not.toMatch(/uuid/)
  })

  it('uses the backend-provided number and link when available', () => {
    const display = budgetSourceDisplay({
      type: 'purchase_invoice',
      number: 'INV-0001',
      link: '/purchasing/purchase-invoice-detail?id=abc',
    })
    expect(display.label).toBe('Purchase Invoice')
    expect(display.number).toBe('INV-0001')
    expect(display.link).toBe('/purchasing/purchase-invoice-detail?id=abc')
  })

  it('renders a manual/other placeholder when no source document exists', () => {
    expect(budgetSourceDisplay(null)).toEqual({
      label: 'Manual / lainnya',
      number: '—',
      link: null,
    })
  })
})

describe('budget detail history page contract', () => {
  it('renders history on the detail page, not in the create/edit modal', () => {
    expect(detailSrc).toContain('<BudgetHistoryTab')
    expect(detailSrc).toContain('DetailPageHeader')
    expect(pageSrc).not.toContain('<BudgetHistoryTab')
    expect(pageSrc).not.toContain("id: 'history'")
    expect(pageSrc).not.toContain('openHistoryModal')
    expect(pageSrc).not.toContain('viewMode')
  })

  it('links list rows to the detail route', () => {
    expect(pageSrc).toContain('/finance/budgets/detail/${slotProps.data.id}')
    expect(pageSrc).toContain('Detail')
  })

  it('allows detail routes through budget permissions middleware', () => {
    expect(middlewareSrc).toContain('/^\\/finance\\/budgets/')
    expect(middlewareSrc).toContain("'/finance/budgets': 'view_budget'")
  })
})
