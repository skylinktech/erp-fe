export type ApiErrorType =
  | 'validation'
  | 'business'
  | 'auth'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'network'
  | 'timeout'
  | 'rate_limit'
  | 'server'
  | 'unknown'

export interface NormalizedApiError {
  type: ApiErrorType
  status: number | null
  code: string | null
  message: string
  fieldErrors: Record<string, string>
  fieldErrorList: Array<{ field: string; message: string }>
  raw: unknown
}

const UNSAFE_PATTERNS = [
  /sqlstate/i,
  /postgresql/i,
  /sqlite/i,
  /mysql/i,
  /violates (foreign key|unique) constraint/i,
  /duplicate key value/i,
  /constraint ["'`]/i,
  /relation ["'`]/i,
  /column ["'`]/i,
  /\bat\s+\S+\s+\(/,
  /node_modules/,
  /\/Users\//,
  /\/app\//,
  /\/var\//,
  /ECONNREFUSED/,
  /ENOTFOUND/,
  /stack trace/i,
  /authorization/i,
  /bearer\s+[a-z0-9._-]+/i,
  /password/i,
  /secret/i,
  /api[_-]?key/i,
]

const OFETCH_STATUS_LINE = /^\[(GET|POST|PUT|PATCH|DELETE)\]\s+.+:\s+\d+/i

const FIELD_LABELS: Record<string, string> = {
  name: 'Nama',
  location: 'Lokasi',
  customerId: 'Customer',
  customer_id: 'Customer',
  siteId: 'Site',
  site_id: 'Site',
  siteName: 'Nama Site',
  site_name: 'Nama Site',
  businessSchemeId: 'Business Scheme',
  siteInvestId: 'Site Investment',
  site_invest_id: 'Site Investment',
  costCenterId: 'Cost Center',
  vendorId: 'Vendor',
  vendor_id: 'Vendor',
  quotationId: 'Quotation',
  salesOrderId: 'Sales Order',
  purchaseOrderId: 'Purchase Order',
  perusahaanId: 'Perusahaan',
  cabangId: 'Cabang',
  departmentId: 'Departemen',
  department_id: 'Departemen',
  siteInvestmentId: 'Site Investment',
  site_investment_id: 'Site Investment',
  type: 'Tipe',
  budgetId: 'Budget',
  budget_id: 'Budget',
  email: 'Email',
  phone: 'Nomor telepon',
  address: 'Alamat',
  date: 'Tanggal',
  dueDate: 'Jatuh Tempo',
  validUntil: 'Valid Until',
  up: 'UP',
  sku: 'Part Number',
  unitId: 'Satuan',
  categoryId: 'Kategori',
  picName: 'Nama PIC',
  penerima: 'Nama Penerima',
  paymentMethod: 'Metode pembayaran',
  paymentDate: 'Tanggal pembayaran',
  description: 'Deskripsi',
  quantity: 'Quantity',
  priceListLineId: 'Price list',
  productId: 'Produk',
  warehouseId: 'Gudang',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function snakeToCamel(value: string): string {
  return value.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

export function isUnsafeErrorMessage(message: string): boolean {
  if (!message) return true
  return UNSAFE_PATTERNS.some((re) => re.test(message))
}

function fallbackFor(type: ApiErrorType, actionFallback: string): string {
  switch (type) {
    case 'validation':
      return 'Mohon periksa kembali data yang belum valid.'
    case 'auth':
      return 'Sesi Anda telah berakhir. Silakan login kembali.'
    case 'forbidden':
      return 'Anda tidak memiliki izin untuk melakukan tindakan ini.'
    case 'not_found':
      return 'Data tidak ditemukan atau mungkin sudah dihapus.'
    case 'conflict':
      return 'Data bentrok dengan data yang sudah ada. Periksa nomor dokumen atau referensi yang digunakan.'
    case 'network':
      return 'Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.'
    case 'timeout':
      return 'Permintaan membutuhkan waktu terlalu lama. Silakan coba kembali. Jangan kirim ulang jika data mungkin sudah tersimpan.'
    case 'rate_limit':
      return 'Terlalu banyak permintaan. Silakan tunggu sebentar lalu coba lagi.'
    case 'server':
      return 'Terjadi gangguan pada server. Silakan coba kembali.'
    default:
      return actionFallback
  }
}

function classify(status: number | null, code: string | null, hasFieldErrors: boolean): ApiErrorType {
  const upper = (code || '').toUpperCase()
  if (upper === 'VALIDATION_ERROR' || hasFieldErrors) return 'validation'
  if (upper === 'NOT_FOUND') return 'not_found'
  if (upper === 'UNAUTHORIZED' || status === 401 || status === 419) return 'auth'
  if (upper === 'FORBIDDEN' || status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 429) return 'rate_limit'
  if (status === 422 || (status === 400 && hasFieldErrors)) return 'validation'
  if (status === 400) return 'business'
  if (status && status >= 500) return 'server'
  if (!status) return 'unknown'
  return 'business'
}

function looksLikeEnvelope(obj: Record<string, unknown>): boolean {
  return 'success' in obj || 'meta' in obj || ('message' in obj && ('data' in obj || 'errors' in obj))
}

function unwrapBody(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) return {}
  if (looksLikeEnvelope(raw)) return raw
  if (isRecord(raw.data) && looksLikeEnvelope(raw.data as Record<string, unknown>)) {
    return raw.data as Record<string, unknown>
  }
  if (isRecord(raw.response) && isRecord((raw.response as any)._data) && looksLikeEnvelope((raw.response as any)._data)) {
    return (raw.response as any)._data as Record<string, unknown>
  }
  if (isRecord(raw.data)) return raw.data as Record<string, unknown>
  return raw
}

function collectErrorSource(body: Record<string, unknown>): unknown {
  if (body.errors != null) return body.errors
  if (isRecord(body.data) && body.data.errors != null) return body.data.errors
  if (Array.isArray(body.data)) return body.data
  return null
}

function humanizeField(field: string): string {
  const base = field.replace(/\[\d+\]/g, '').replace(/\.\d+\./g, '.').replace(/\.\d+$/, '')
  const last = base.split('.').pop() || base
  return FIELD_LABELS[last] || FIELD_LABELS[snakeToCamel(last)] || last
}

function rowIndexFromPath(field: string): number | null {
  const match = field.match(/\.(\d+)\./) || field.match(/\[(\d+)\]/) || field.match(/\.(\d+)$/)
  return match ? Number(match[1]) : null
}

function normalizeFieldKey(field: string): string {
  return snakeToCamel(field.replace(/\[(\d+)\]/g, '.$1'))
}

function pushFieldError(map: Record<string, string>, field: string, message: string) {
  const key = normalizeFieldKey(field)
  if (!map[key]) map[key] = message
  const camelRoot = snakeToCamel(field.split(/[.\[]/)[0] || field)
  if (!map[camelRoot]) map[camelRoot] = message
}

function parseFieldErrors(source: unknown): Array<{ field: string; message: string }> {
  const list: Array<{ field: string; message: string }> = []
  if (!source) return list

  if (Array.isArray(source)) {
    for (const item of source) {
      if (typeof item === 'string') {
        list.push({ field: '', message: item })
        continue
      }
      if (!isRecord(item)) continue
      const field = String(item.field || item.rule || '')
      const message = String(item.message || item.msg || '')
      if (message) list.push({ field, message })
      else {
        for (const [k, v] of Object.entries(item)) {
          if (Array.isArray(v) && v.length) list.push({ field: k, message: String(v[0]) })
          else if (typeof v === 'string') list.push({ field: k, message: v })
        }
      }
    }
    return list
  }

  if (isRecord(source)) {
    for (const [field, value] of Object.entries(source)) {
      if (Array.isArray(value) && value.length) {
        const first = value[0]
        const message = typeof first === 'string' ? first : String((first as any)?.message || first)
        list.push({ field, message })
      } else if (typeof value === 'string') {
        list.push({ field, message: value })
      }
    }
  }
  return list
}

function decorateFieldMessage(field: string, message: string): string {
  if (!field) return message
  const row = rowIndexFromPath(field)
  const label = humanizeField(field)
  const prefix = row != null ? `${label} #${row + 1}` : ''
  if (prefix && !message.toLowerCase().includes(label.toLowerCase())) {
    return `${prefix}: ${message}`
  }
  if (message.startsWith('Field ') || message.includes(` ${field} `) || message.includes(field)) {
    return message.replace(new RegExp(`Field\\s+${field}\\b`, 'i'), label).replace(field, label)
  }
  return message
}

function pickStatus(raw: unknown, explicit?: number | null): number | null {
  if (typeof explicit === 'number') return explicit
  if (!isRecord(raw)) return null
  const status =
    raw.status ??
    raw.statusCode ??
    (isRecord(raw.response) ? (raw.response as any).status : null)
  return typeof status === 'number' ? status : null
}

function pickCode(body: Record<string, unknown>): string | null {
  if (isRecord(body.meta) && body.meta.code != null) return String(body.meta.code)
  if (body.code != null) return String(body.code)
  return null
}

function pickRawMessage(raw: unknown, body: Record<string, unknown>): string {
  const candidates = [
    body.message,
    typeof body.error === 'string' ? body.error : null,
    isRecord(body.data) ? body.data.message : null,
    isRecord(raw) ? raw.message : null,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim() && !OFETCH_STATUS_LINE.test(c)) return c.trim()
  }
  return ''
}

function detectNetwork(raw: unknown, status: number | null): ApiErrorType | null {
  if (status) return null
  const msg = isRecord(raw) && typeof raw.message === 'string' ? raw.message : ''
  if (/timeout|timed?\s*out/i.test(msg)) return 'timeout'
  if (/failed to fetch|networkerror|load failed|err_network|econnrefused|enotfound/i.test(msg)) {
    return 'network'
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'network'
  return null
}

export function normalizeApiError(
  raw: unknown,
  actionFallback = 'Data belum dapat diproses. Silakan coba kembali.'
): NormalizedApiError {
  const body = unwrapBody(raw)
  const status = pickStatus(raw, isRecord(raw) ? (raw as any).__status : null)
  const code = pickCode(body)
  const fieldErrorListRaw = parseFieldErrors(collectErrorSource(body))
  const fieldErrors: Record<string, string> = {}
  const fieldErrorList = fieldErrorListRaw.map((item) => {
    const message = decorateFieldMessage(item.field, item.message)
    if (item.field) pushFieldError(fieldErrors, item.field, message)
    return { field: normalizeFieldKey(item.field), message }
  })

  const networkType = detectNetwork(raw, status)
  const type = networkType || classify(status, code, fieldErrorList.length > 0)

  let message = pickRawMessage(raw, body)
  if (type === 'validation') {
    if (!message || /^validasi gagal\.?$/i.test(message) || /^validation (failed|error)\.?$/i.test(message)) {
      message = fieldErrorList[0]?.message || fallbackFor('validation', actionFallback)
    }
  } else if (!message || isUnsafeErrorMessage(message) || OFETCH_STATUS_LINE.test(message)) {
    message = fallbackFor(type, actionFallback)
  }

  return {
    type,
    status,
    code,
    message,
    fieldErrors,
    fieldErrorList,
    raw,
  }
}

export async function normalizeFailedResponse(
  response: Response,
  actionFallback?: string
): Promise<NormalizedApiError> {
  const data = await response.json().catch(() => ({}))
  return normalizeApiError({ data, status: response.status }, actionFallback)
}

export function getApiErrorMessage(raw: unknown, actionFallback?: string): string {
  return normalizeApiError(raw, actionFallback).message
}

export function firstErrorTab(
  fieldErrors: Record<string, string> | Array<{ field: string; message: string }>,
  tabMap: Record<string, string>
): string | null {
  const fields = Array.isArray(fieldErrors)
    ? fieldErrors.map((e) => e.field)
    : Object.keys(fieldErrors)
  for (const field of fields) {
    const root = field.split('.')[0]
    if (tabMap[field]) return tabMap[field]
    if (tabMap[root]) return tabMap[root]
    const camel = snakeToCamel(root)
    if (tabMap[camel]) return tabMap[camel]
  }
  return null
}

export function toastNormalizedError(err: NormalizedApiError) {
  const toast = useToast()
  const title =
    err.type === 'validation' ? 'Validasi' : err.type === 'forbidden' ? 'Izin ditolak' : 'Error'
  toast.error({
    title,
    message: err.message,
    color: 'red',
    position: 'bottomRight',
    layout: 2,
  })
  return err
}

export function toastApiError(
  raw: unknown,
  actionFallback: string,
  options?: { title?: string }
) {
  const err = normalizeApiError(raw, actionFallback)
  if (options?.title) {
    const toast = useToast()
    toast.error({
      title: options.title,
      message: err.message,
      color: 'red',
      position: 'bottomRight',
      layout: 2,
    })
    return err
  }
  return toastNormalizedError(err)
}

export function formatValidationErrorItem(error: unknown): string {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (isRecord(error) && typeof error.message === 'string') return error.message
  return ''
}

export function applyBackendFieldErrors(
  validationErrors: unknown,
  uiErrors: Record<string, string>
): Array<{ field: string; message: string }> {
  const list = Array.isArray(validationErrors) ? validationErrors : []
  const mapped: Array<{ field: string; message: string }> = []
  for (const item of list) {
    if (!isRecord(item)) continue
    const field = typeof item.field === 'string' ? item.field : ''
    const message = typeof item.message === 'string' ? item.message : ''
    if (!message) continue
    if (field) uiErrors[field] = message
    mapped.push({ field, message })
  }
  return mapped
}

export function routeSaveFailure(
  validationErrors: unknown,
  uiErrors: Record<string, string>,
  tabMap: Record<string, string>,
  goToId: (id: string, opts?: { skipValidation?: boolean }) => unknown
) {
  applyBackendFieldErrors(validationErrors, uiErrors)
  const tab = firstErrorTab(validationErrors as any, tabMap)
  if (tab) void goToId(tab, { skipValidation: true })
}
