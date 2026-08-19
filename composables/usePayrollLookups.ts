export interface PayrollSelectOption {
  label: string
  value: number | string
}

export function usePayrollLookups() {
  const pegawaiOptions = ref<PayrollSelectOption[]>([])
  const bankAccountOptions = ref<PayrollSelectOption[]>([])
  const perusahaanOptions = ref<PayrollSelectOption[]>([])

  async function fetchPegawaiOptions() {
    const { $api } = useNuxtApp()
    try {
      const res = await fetch($api.dataPegawai(), { credentials: 'include' })
      const json = await res.json()
      const list = json?.data ?? json ?? []
      pegawaiOptions.value = (Array.isArray(list) ? list : []).map((p: Record<string, unknown>) => ({
        value: Number(p.id_pegawai ?? p.idPegawai ?? p.id),
        label: `${p.nm_pegawai ?? p.nmPegawai ?? '-'} (${p.nik_pegawai ?? p.nikPegawai ?? p.id_pegawai ?? ''})`,
      }))
    } catch {
      pegawaiOptions.value = []
    }
  }

  async function fetchBankAccounts() {
    const { $api } = useNuxtApp()
    try {
      const res = await fetch(`${$api.bankAccounts()}?limit=200`, { credentials: 'include' })
      const json = await res.json()
      const list = json?.data ?? json ?? []
      bankAccountOptions.value = (Array.isArray(list) ? list : []).map((a: Record<string, unknown>) => ({
        value: String(a.id),
        label: String(a.name || a.accountName || a.account_name || a.bankName || a.id),
      }))
    } catch {
      bankAccountOptions.value = []
    }
  }

  async function fetchPerusahaanOptions() {
    const { $api } = useNuxtApp()
    try {
      const res = await fetch($api.dataPerusahaan(), { credentials: 'include' })
      const json = await res.json()
      const list = json?.data ?? json ?? []
      perusahaanOptions.value = (Array.isArray(list) ? list : []).map((p: Record<string, unknown>) => ({
        value: Number(p.id),
        label: String(p.nmPerusahaan || p.nm_perusahaan || p.name || p.id),
      }))
    } catch {
      perusahaanOptions.value = []
    }
  }

  return {
    pegawaiOptions,
    bankAccountOptions,
    perusahaanOptions,
    fetchPegawaiOptions,
    fetchBankAccounts,
    fetchPerusahaanOptions,
  }
}
