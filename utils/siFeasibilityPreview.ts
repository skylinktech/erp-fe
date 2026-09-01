/**
 * Thin SI feasibility preview for UX.
 * Mirrors backend domain rules — authoritative result still comes from API on save/submit.
 * Threshold constant must stay in sync with backend profitability_policy.ts
 */

export const MINIMUM_SITE_INVESTMENT_PROFITABILITY_PERCENT = 15

function toCents(amount) {
  const n = Number(amount ?? 0)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100)
}

function fromCents(cents) {
  return Math.round(cents) / 100
}

function roundMoney(amount) {
  return fromCents(toCents(amount))
}

function addMoney(...amounts) {
  return fromCents(amounts.reduce((sum, a) => sum + toCents(a), 0))
}

export function calculatePeriodAmount(quantity, unitPrice) {
  return roundMoney((Number(quantity) || 0) * (Number(unitPrice) || 0))
}

/**
 * Recurring monthly: period × duration.
 * One-time: period only.
 */
export function calculateContractAmount({
  quantity,
  unitPrice,
  contractDurationMonths,
  chargeKind = 'RECURRING',
  pricingPeriod = 'MONTH',
}) {
  const period = calculatePeriodAmount(quantity, unitPrice)
  if (chargeKind === 'ONE_TIME' || pricingPeriod === 'ONE_TIME') return period
  const duration = Number(contractDurationMonths)
  if (!Number.isFinite(duration) || duration <= 0) return period
  // MONTH (and monthly-normalized) path
  if (pricingPeriod === 'YEAR') {
    return fromCents(Math.round(toCents(period) * (duration / 12)))
  }
  if (pricingPeriod === 'QUARTER') {
    return fromCents(Math.round(toCents(period) * (duration / 3)))
  }
  if (pricingPeriod === 'SEMI_YEAR') {
    return fromCents(Math.round(toCents(period) * (duration / 6)))
  }
  return fromCents(Math.round(toCents(period) * duration))
}

export function evaluateProfitabilityPreview(totalIncome, projectProfit) {
  const threshold = MINIMUM_SITE_INVESTMENT_PROFITABILITY_PERCENT
  const income = Number(totalIncome)
  const profit = Number(projectProfit)
  if (!Number.isFinite(income) || income <= 0 || !Number.isFinite(profit)) {
    return {
      profitabilityPercent: null,
      profitabilityThresholdPercent: threshold,
      profitabilityStatus: 'NOT_CALCULABLE',
      warnings: [],
    }
  }
  const profitabilityPercent = Math.round((profit / income) * 10000) / 100
  if (profitabilityPercent < threshold) {
    return {
      profitabilityPercent,
      profitabilityThresholdPercent: threshold,
      profitabilityStatus: 'BELOW_THRESHOLD',
      warnings: [{ code: 'PROFITABILITY_BELOW_THRESHOLD', severity: 'WARNING' }],
    }
  }
  return {
    profitabilityPercent,
    profitabilityThresholdPercent: threshold,
    profitabilityStatus: 'HEALTHY',
    warnings: [],
  }
}

/**
 * Preview SI feasibility from form lines.
 * Services treated as recurring MONTH unless billingType one_time.
 * Materials/DIDs treated as one-time.
 * Cost uses priceBuy when available on line option.
 */
export function previewSiFeasibility({
  services = [],
  materials = [],
  dids = [],
  marketingFee = 0,
  priceListLinesService = [],
  priceListLinesProduct = [],
  priceListLinesDid = [],
}) {
  const findLine = (cache, id) =>
    (cache || []).find((l) => Number(l.id) === Number(id))

  const mapService = (item) => {
    const line = findLine(priceListLinesService, item.priceListLineId)
    const billingType = line?.billing_type ?? line?.billingType ?? 'recurring'
    const isOneTime = billingType === 'one_time'
    const priceBuy = line?.price_buy ?? line?.priceBuy ?? 0
    const qty = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    const duration = item.contractDurationMonths
    const periodAmount = calculatePeriodAmount(qty, price)
    const contractAmount = calculateContractAmount({
      quantity: qty,
      unitPrice: price,
      contractDurationMonths: duration,
      chargeKind: isOneTime ? 'ONE_TIME' : 'RECURRING',
      pricingPeriod: isOneTime ? 'ONE_TIME' : 'MONTH',
    })
    const costContractAmount = calculateContractAmount({
      quantity: qty,
      unitPrice: Number(priceBuy) || 0,
      contractDurationMonths: duration,
      chargeKind: isOneTime ? 'ONE_TIME' : 'RECURRING',
      pricingPeriod: isOneTime ? 'ONE_TIME' : 'MONTH',
    })
    return { periodAmount, contractAmount, costContractAmount, duration: Number(duration) || null }
  }

  const mapOneTime = (item, cache) => {
    const line = findLine(cache, item.priceListLineId)
    const priceBuy = line?.price_buy ?? line?.priceBuy ?? 0
    const qty = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    const periodAmount = calculatePeriodAmount(qty, price)
    return {
      periodAmount,
      contractAmount: periodAmount,
      costContractAmount: calculatePeriodAmount(qty, Number(priceBuy) || 0),
      duration: null,
    }
  }

  const serviceRows = (services || []).filter((s) => Number(s.priceListLineId) > 0).map(mapService)
  const materialRows = (materials || []).filter((m) => Number(m.priceListLineId) > 0).map((m) => mapOneTime(m, priceListLinesProduct))
  const didRows = (dids || []).filter((d) => Number(d.priceListLineId) > 0).map((d) => mapOneTime(d, priceListLinesDid))

  const fee = Number(marketingFee) || 0
  const incomeContract = addMoney(
    ...serviceRows.map((r) => r.contractAmount),
    ...materialRows.map((r) => r.contractAmount),
    ...didRows.map((r) => r.contractAmount)
  )
  const incomePeriod = addMoney(
    ...serviceRows.map((r) => r.periodAmount),
    ...materialRows.map((r) => r.periodAmount),
    ...didRows.map((r) => r.periodAmount)
  )
  const expensesContract = addMoney(
    ...serviceRows.map((r) => r.costContractAmount),
    ...materialRows.map((r) => r.costContractAmount),
    ...didRows.map((r) => r.costContractAmount),
    fee
  )
  const projectProfit = roundMoney(incomeContract - expensesContract)
  const durations = serviceRows.map((r) => r.duration).filter((d) => d != null && d > 0)
  const contractDurationMonths =
    durations.length === 0
      ? null
      : durations.every((d) => d === durations[0])
        ? durations[0]
        : Math.max(...durations)
  const monthlyGrossMargin =
    contractDurationMonths != null && contractDurationMonths > 0
      ? roundMoney(projectProfit / contractDurationMonths)
      : null
  const profitability = evaluateProfitabilityPreview(incomeContract, projectProfit)

  return {
    contractDurationMonths,
    income: { periodAmount: incomePeriod, contractAmount: incomeContract },
    expenses: { contractAmount: expensesContract },
    projectProfit,
    monthlyGrossMargin,
    serviceContractAmount: addMoney(...serviceRows.map((r) => r.contractAmount)),
    materialContractAmount: addMoney(...materialRows.map((r) => r.contractAmount)),
    didContractAmount: addMoney(...didRows.map((r) => r.contractAmount)),
    marketingFee: fee,
    total: incomeContract,
    grandTotal: addMoney(incomeContract, fee),
    serviceLinePreviews: serviceRows,
    ...profitability,
  }
}
