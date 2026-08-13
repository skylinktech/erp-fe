import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { storeToRefs } from 'pinia'
import { usePerusahaanStore, type Perusahaan } from '~/stores/perusahaan'
import { useImageUrl } from '~/composables/useImageUrl'

export interface CompanyPrintProfile {
  id: number | string | null
  companyName: string
  logo: string | null
  logoUrl: string
  address: string
  phone: string
  email: string
  website: string
  npwp: string
  bankName: string
  accountNumber: string
}

export type CompanyPrintSource = Record<string, unknown> | Perusahaan | null | undefined

function pickString(source: CompanyPrintSource, keys: string[]): string {
  if (!source) return ''
  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key]
    if (value == null) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

export function normalizeCompanyPrintProfile(
  source: CompanyPrintSource,
  getCompanyLogo: (path: string | null | undefined) => string
): CompanyPrintProfile | null {
  if (!source) return null

  const logo = pickString(source, ['logoPerusahaan', 'logo_perusahaan', 'logo']) || null
  const companyName = pickString(source, ['nmPerusahaan', 'nm_perusahaan', 'companyName', 'name'])

  return {
    id: ((source as Record<string, unknown>).id as number | string | null) ?? null,
    companyName,
    logo,
    logoUrl: getCompanyLogo(logo),
    address: pickString(source, ['alamatPerusahaan', 'alamat_perusahaan', 'address']),
    phone: pickString(source, ['tlpPerusahaan', 'tlp_perusahaan', 'phone']),
    email: pickString(source, ['emailPerusahaan', 'email_perusahaan', 'email']),
    website: pickString(source, ['websitePerusahaan', 'website_perusahaan', 'website']),
    npwp: pickString(source, ['npwpPerusahaan', 'npwp_perusahaan', 'npwp']),
    bankName: pickString(source, ['namaBankPerusahaan', 'nama_bank_perusahaan', 'bankName']),
    accountNumber: pickString(source, [
      'nomorRekeningPerusahaan',
      'nomor_rekening_perusahaan',
      'accountNumber',
    ]),
  }
}

function hasUsablePrintSource(source: CompanyPrintSource): boolean {
  if (!source) return false
  return Boolean(
    pickString(source, ['nmPerusahaan', 'nm_perusahaan', 'companyName', 'name']) ||
      pickString(source, ['logoPerusahaan', 'logo_perusahaan', 'logo'])
  )
}

let companyProfileInflight: Promise<void> | null = null

/**
 * Central company identity for print pages.
 * Prefer document-embedded company; otherwise reuse the existing perusahaan store.
 * Store list is shared via Pinia; concurrent mounts share one in-flight request.
 */
export function useCompanyPrintProfile(
  source?: MaybeRefOrGetter<CompanyPrintSource>
): {
  profile: ComputedRef<CompanyPrintProfile | null>
  ensureCompanyProfile: () => Promise<void>
} {
  const perusahaanStore = usePerusahaanStore()
  const { perusahaans } = storeToRefs(perusahaanStore)
  const { getCompanyLogo } = useImageUrl()

  const profile = computed(() => {
    const fromDocument = normalizeCompanyPrintProfile(toValue(source), getCompanyLogo)
    if (fromDocument && (fromDocument.companyName || fromDocument.logo)) {
      return fromDocument
    }

    const fallback = perusahaans.value?.[0] ?? null
    return normalizeCompanyPrintProfile(fallback, getCompanyLogo)
  })

  async function ensureCompanyProfile() {
    if (hasUsablePrintSource(toValue(source))) return
    if (perusahaans.value && perusahaans.value.length > 0) return
    if (!companyProfileInflight) {
      companyProfileInflight = perusahaanStore.fetchPerusahaans().finally(() => {
        companyProfileInflight = null
      })
    }
    try {
      await companyProfileInflight
    } catch {
      // Print pages still render without company identity.
    }
  }

  return { profile, ensureCompanyProfile }
}
