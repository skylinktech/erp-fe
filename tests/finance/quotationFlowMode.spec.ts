import { describe, expect, it } from 'vitest'
import { productDocumentOffer, productDownstreamHidden, productOffer, productPriceLocked, quotationLineName, quotationSavePlan } from '../../utils/quotationFlowMode'

const offer = {
  code: 'PRODUCT_QUOTATION',
  flowVersionId: 9,
  siteInvestmentApplicability: 'NOT_APPLICABLE' as const,
  pricingMode: 'QUOTATION_PRODUCT_LINES',
  downstream: 'NOT_SUPPORTED',
  companies: [{ id: 3, name: 'Produk' }],
}

describe('Product quotation form mode', () => {
  it('P6B4-21 ISP save still requires Site Investment and Site', () => {
    const plan = quotationSavePlan({
      flowCode: null,
      customerId: 1,
      hasProductLine: true,
    })
    expect(plan.mode).toBe('isp')
    expect(plan.errors).toContain('Site Investment harus dipilih')
    expect(plan.errors).toContain('Site harus dipilih')
  })

  it('P6B4-22 product save does not ask for Site Investment or Site', () => {
    const plan = quotationSavePlan({
      flowCode: 'PRODUCT_QUOTATION',
      businessCaseId: 'case-1',
      customerId: 1,
      hasProductLine: true,
    })
    expect(plan.mode).toBe('product')
    expect(plan.errors).toEqual([])
  })

  it('P6B4-23 product mode appears only for an eligible API offer', () => {
    expect(productOffer([])).toBeNull()
    expect(productOffer([{ ...offer, companies: [] }])).toBeNull()
    expect(productOffer([offer])?.flowVersionId).toBe(9)
    expect(productOffer([{ ...offer, code: 'RETAIL_DIRECT_SALE' }])).toBeNull()
    const retailPlan = quotationSavePlan({
      flowCode: 'RETAIL_DIRECT_SALE',
      customerId: 1,
      hasProductLine: true,
    })
    expect(retailPlan.mode).toBe('unsupported')
    expect(retailPlan.errors[0]).toMatch(/belum tersedia/i)
  })

  it('P6B4-24 approved quotation cannot be saved', () => {
    const plan = quotationSavePlan({
      flowCode: 'PRODUCT_QUOTATION',
      status: 'approved',
      businessCaseId: 'case-1',
      customerId: 1,
      hasProductLine: true,
    })
    expect(plan.errors[0]).toMatch(/approved/i)
  })

  it('P6B5-26 detail uses the historical product name', () => {
    expect(quotationLineName({
      productNameSnapshot: 'OLD NAME',
      product: { name: 'NEW NAME' },
    })).toBe('OLD NAME')
    expect(quotationLineName({ product: { name: 'ISP NAME' } })).toBe('ISP NAME')
  })

  it('P6B6-31 through P6B6-35 product price is locked and the PDF action is explicit', () => {
    expect(productPriceLocked('PRODUCT_QUOTATION')).toBe(true)
    expect(productPriceLocked(null)).toBe(false)
    expect(productDocumentOffer({ status: 'approved', lines: [{ productNameSnapshot: 'LAMA' }] })?.endpoint).toBe('product-document')
    expect(productDocumentOffer({ status: 'approved', lines: [{ product: { name: 'HIDUP' } } as any] })).toBeNull()
    expect(productDocumentOffer({ status: 'draft', lines: [{ productNameSnapshot: 'LAMA' }] })?.label).toBe('Pratinjau PDF')
  })

  it('P6B4-25 and P6B4-26 a product quotation hides downstream actions', () => {
    expect(productDownstreamHidden('PRODUCT_QUOTATION', null)).toBe(true)
    expect(productDownstreamHidden(null, 'si-1')).toBe(false)
  })
})
