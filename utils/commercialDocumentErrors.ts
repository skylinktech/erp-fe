/**
 * Maps commercial-document / company-context API error codes to Indonesian operator messages.
 */

const MESSAGES: Record<string, string> = {
  DOCUMENT_NOT_ALLOWED_FOR_ACTIVE_FLOW:
    'Dokumen ini tidak tersedia untuk alur bisnis perusahaan aktif. Ganti Active Company atau aktifkan alur yang sesuai.',
  FLOW_BINDING_MISMATCH:
    'Business Case tidak cocok dengan alur yang terikat. Muat ulang dokumen atau pilih kasus yang benar.',
  COMPANY_CONTEXT_MISMATCH:
    'Perusahaan pada permintaan tidak sama dengan Active Company. Periksa konteks perusahaan aktif.',
  COMPANY_CONTEXT_REQUIRED:
    'Pilih Active Company sebelum membuat dokumen komersial.',
}

export function commercialDocumentOperatorMessage(
  code: string | null | undefined,
  fallback?: string | null
): string {
  if (code && MESSAGES[code]) return MESSAGES[code]
  return fallback || 'Permintaan dokumen komersial ditolak.'
}
