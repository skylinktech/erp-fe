<template>
  <CetakDocument
    type="PAYSLIP"
    :document-number="slip ? `#${slip.id}` : ''"
    :status="slip?.run?.paymentStatus || slip?.run?.status"
    :company="slip?.perusahaan"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !slip"
    show-number-under-title
  >
    <template v-if="slip">
      <div class="mb-4 payslip-employee-info" style="font-size: 12px">
        <p class="mb-1"><strong>Nama:</strong> {{ slip.snapshot?.employee_name }}</p>
        <p class="mb-1"><strong>NIK:</strong> {{ slip.snapshot?.nik }}</p>
        <p class="mb-1"><strong>Periode:</strong> {{ slip.period?.name }}</p>
        <p class="mb-0"><strong>Departemen:</strong> {{ slip.snapshot?.department }}</p>
      </div>

      <div class="table-responsive mb-4">
        <table class="table table-bordered cetak-payslip-table m-0" style="font-size: 12px">
          <thead class="table-dark table-head-white">
            <tr><th>Pendapatan</th><th class="text-end">Jumlah</th></tr>
          </thead>
          <tbody>
            <tr v-for="l in slip.earnings" :key="'e'+l.id">
              <td>{{ l.componentNameSnapshot || l.component_name_snapshot }}</td>
              <td class="text-end">{{ money(l.amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-responsive mb-4">
        <table class="table table-bordered cetak-payslip-table m-0" style="font-size: 12px">
          <thead class="table-dark table-head-white">
            <tr><th>Potongan</th><th class="text-end">Jumlah</th></tr>
          </thead>
          <tbody>
            <tr v-for="l in slip.deductions" :key="'d'+l.id">
              <td>{{ l.componentNameSnapshot || l.component_name_snapshot }}</td>
              <td class="text-end">({{ money(l.amount) }})</td>
            </tr>
            <tr>
              <th>Take Home Pay</th>
              <th class="text-end">{{ money(slip.netPay) }}</th>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="slip.employerContributions?.length" class="table-responsive mb-4">
        <table class="table table-bordered cetak-payslip-table m-0" style="font-size: 12px">
          <thead class="table-dark table-head-white">
            <tr><th>Kontribusi Perusahaan</th><th class="text-end">Jumlah</th></tr>
          </thead>
          <tbody>
            <tr v-for="l in slip.employerContributions" :key="'c'+l.id">
              <td>{{ l.componentNameSnapshot || l.component_name_snapshot }}</td>
              <td class="text-end">{{ money(l.amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="small text-muted mb-0">Kontribusi perusahaan ditampilkan terpisah dan tidak mengurangi THP.</p>
    </template>
  </CetakDocument>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'cetak', middleware: ['auth', 'check-permission'], alias: '/payroll/cetak-payslip' })
const route = useRoute()
const { money } = usePayrollStatus()
const { canViewAllPayslip } = usePayrollPermissions()
const slip = ref<any>(null)
const loading = ref(true)
const error = ref('')
onMounted(async () => {
  try {
    const { $api } = useNuxtApp()
    const { apiFetch } = await import('~/utils/apiFetch')
    const id = String(route.query.id || '')
    if (!id) {
      error.value = 'Payslip tidak ditemukan'
      return
    }
    const fetchOpts = { credentials: 'include' as const, skip403Redirect: true }
    const urls = canViewAllPayslip.value
      ? [$api.payrollPayslipShow(id), $api.payrollMePayslipShow(id)]
      : [$api.payrollMePayslipShow(id), $api.payrollPayslipShow(id)]
    let lastError: any = null
    for (const url of urls) {
      try {
        const res = await apiFetch<{ data: any }>(url, fetchOpts)
        slip.value = res.data
        lastError = null
        break
      } catch (e) {
        lastError = e
      }
    }
    if (lastError) {
      error.value = lastError?.data?.message || lastError?.message || 'Gagal memuat payslip'
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal memuat payslip'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.payslip-employee-info {
  margin-top: 0.25rem;
}

.table-responsive.mb-4 {
  margin-bottom: 1.25rem !important;
}

.cetak-payslip-table {
  width: 100%;
}
</style>
