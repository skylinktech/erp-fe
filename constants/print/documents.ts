import type { PrintWatermarkPolicy } from '~/constants/print/status'

export const PRINT_HEADER_VARIANTS = [
  'standard',
  'company-address',
  'finance',
  'minimal',
] as const

export type PrintHeaderVariant = (typeof PRINT_HEADER_VARIANTS)[number]

export const PRINT_PAPERS = ['A4'] as const
export type PrintPaper = (typeof PRINT_PAPERS)[number]

export const PRINT_ORIENTATIONS = ['portrait', 'landscape'] as const
export type PrintOrientation = (typeof PRINT_ORIENTATIONS)[number]

export const PRINT_DOCUMENT_TYPES = [
  'FDR',
  'QUOTATION',
  'PURCHASE_ORDER',
  'SALES_INVOICE',
  'FINANCE_INVOICE',
  'SURAT_JALAN',
  'STOCK_TRANSFER',
  'BERITA_ACARA',
  'WORK_ORDER_REQUEST',
  'PAYMENT_REQUEST',
  'PURCHASE_REQUEST',
  'MATERIAL_REQUEST',
  'SITE_INVESTMENT',
  'SUBSCRIPTION',
  'CUTI',
  'LEMBUR',
  'PERJALANAN_DINAS',
  'ARF',
  'STRUKTUR_ORGANISASI',
  'PAYSLIP',
] as const

export type PrintDocumentType = (typeof PRINT_DOCUMENT_TYPES)[number]

export interface PrintDocumentPreset {
  title: string
  subtitle?: string
  brandName: string
  footerBrand: string
  headerVariant: PrintHeaderVariant
  paper: PrintPaper
  orientation: PrintOrientation
  showCompanyAddress: boolean
  showNpwp: boolean
  showPageNumber: boolean
  showGeneratedAt: boolean
  notFoundMessage: string
  /** Overrides DEFAULT_WATERMARK_POLICY for this document only. */
  watermarkPolicy?: PrintWatermarkPolicy
}

const STANDARD: Pick<
  PrintDocumentPreset,
  | 'brandName'
  | 'footerBrand'
  | 'headerVariant'
  | 'paper'
  | 'orientation'
  | 'showCompanyAddress'
  | 'showNpwp'
  | 'showPageNumber'
  | 'showGeneratedAt'
> = {
  brandName: 'SKYLINK',
  footerBrand: 'Skylink',
  headerVariant: 'standard',
  paper: 'A4',
  orientation: 'portrait',
  showCompanyAddress: false,
  showNpwp: false,
  showPageNumber: true,
  showGeneratedAt: false,
}

const COMPANY_ADDRESS: typeof STANDARD = {
  ...STANDARD,
  headerVariant: 'company-address',
  showCompanyAddress: true,
  showNpwp: true,
}

export const PRINT_DOCUMENTS: Record<PrintDocumentType, PrintDocumentPreset> = {
  FDR: {
    ...STANDARD,
    title: 'FDR',
    subtitle: 'Form Design Request',
    notFoundMessage: 'FDR tidak ditemukan.',
  },
  QUOTATION: {
    ...STANDARD,
    title: 'QUOTATION',
    notFoundMessage: 'Quotation tidak ditemukan.',
  },
  PURCHASE_ORDER: {
    ...COMPANY_ADDRESS,
    title: 'PURCHASE ORDER',
    notFoundMessage: 'Purchase Order tidak ditemukan.',
  },
  SALES_INVOICE: {
    ...COMPANY_ADDRESS,
    title: 'INVOICE',
    notFoundMessage: 'Invoice tidak ditemukan.',
  },
  FINANCE_INVOICE: {
    ...COMPANY_ADDRESS,
    headerVariant: 'finance',
    showNpwp: false,
    title: 'INVOICE',
    notFoundMessage: 'Invoice tidak ditemukan.',
  },
  SURAT_JALAN: {
    ...COMPANY_ADDRESS,
    title: 'SURAT JALAN',
    notFoundMessage: 'Surat Jalan tidak ditemukan.',
  },
  STOCK_TRANSFER: {
    ...COMPANY_ADDRESS,
    showNpwp: false,
    title: 'BERITA ACARA',
    notFoundMessage: 'Stock Transfer tidak ditemukan.',
  },
  BERITA_ACARA: {
    ...STANDARD,
    title: 'BERITA ACARA PERFORMANSI',
    notFoundMessage: 'Berita Acara tidak ditemukan.',
  },
  WORK_ORDER_REQUEST: {
    ...STANDARD,
    title: 'WORK ORDER REQUEST',
    notFoundMessage: 'Work Order Request tidak ditemukan.',
  },
  PAYMENT_REQUEST: {
    ...STANDARD,
    title: 'PAYMENT REQUEST',
    showGeneratedAt: true,
    notFoundMessage: 'Payment Request tidak ditemukan.',
  },
  PURCHASE_REQUEST: {
    ...STANDARD,
    title: 'PURCHASE REQUEST',
    notFoundMessage: 'Purchase Request tidak ditemukan.',
  },
  MATERIAL_REQUEST: {
    ...STANDARD,
    title: 'MATERIAL REQUEST FORM',
    notFoundMessage: 'Material Request tidak ditemukan.',
  },
  SITE_INVESTMENT: {
    ...STANDARD,
    title: 'SITE INVESTMENT',
    notFoundMessage: 'Site Investment tidak ditemukan.',
  },
  SUBSCRIPTION: {
    ...STANDARD,
    title: 'FORMULIR BERLANGGANAN',
    subtitle: '(Subscription Form)',
    notFoundMessage: 'Form Berlangganan tidak ditemukan.',
  },
  CUTI: {
    ...STANDARD,
    title: 'FORM CUTI / IZIN / SAKIT',
    footerBrand: 'PT Sinergi Innovate Pratama',
    notFoundMessage: 'Data cuti tidak ditemukan.',
  },
  LEMBUR: {
    ...STANDARD,
    title: 'SURAT PERINTAH KERJA LEMBUR',
    subtitle: '(SPKL)',
    footerBrand: 'PT Sinergi Innovate Pratama',
    notFoundMessage: 'Data lembur tidak ditemukan.',
  },
  PERJALANAN_DINAS: {
    ...STANDARD,
    title: 'SURAT PERINTAH PERJALANAN DINAS',
    subtitle: '(SPPD)',
    footerBrand: 'PT Sinergi Innovate Pratama',
    notFoundMessage: 'Data perjalanan dinas tidak ditemukan.',
  },
  ARF: {
    ...STANDARD,
    title: 'ADVANCED REQUEST FORM',
    subtitle: '(ARF)',
    notFoundMessage: 'ARF tidak ditemukan.',
  },
  STRUKTUR_ORGANISASI: {
    ...STANDARD,
    headerVariant: 'minimal',
    orientation: 'landscape',
    title: 'STRUKTUR ORGANISASI',
    notFoundMessage: 'Tidak ada data struktur organisasi untuk filter yang dipilih.',
    watermarkPolicy: {},
  },
  PAYSLIP: {
    ...COMPANY_ADDRESS,
    showNpwp: false,
    title: 'PAYSLIP / SLIP GAJI',
    showGeneratedAt: true,
    notFoundMessage: 'Payslip tidak ditemukan.',
    watermarkPolicy: {},
  },
}

export function getPrintDocumentPreset(
  type: PrintDocumentType
): PrintDocumentPreset {
  return PRINT_DOCUMENTS[type]
}

export function isPrintDocumentType(value: unknown): value is PrintDocumentType {
  return (
    typeof value === 'string' &&
    (PRINT_DOCUMENT_TYPES as readonly string[]).includes(value)
  )
}
