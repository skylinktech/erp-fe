<template>
  <CetakDocument
    type="PAYSLIP"
    :document-number="slip ? `#${slip.id}` : ''"
    :status="slip?.run?.paymentStatus || slip?.run?.status"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !slip"
  >
    <template v-if="slip">
      <div class="mb-3" style="font-size: 12px">
        <p class="mb-1"><strong>Nama:</strong> {{ slip.snapshot?.employee_name }}</p>
        <p class="mb-1"><strong>NIK:</strong> {{ slip.snapshot?.nik }}</p>
        <p class="mb-1"><strong>Periode:</strong> {{ slip.period?.name }}</p>
        <p class="mb-1"><strong>Departemen:</strong> {{ slip.snapshot?.department }}</p>
      </div>
      <table class="table table-bordered" style="font-size: 12px">
        <thead>
          <tr><th>Pendapatan</th><th class="text-end">Jumlah</th></tr>
        </thead>
        <tbody>
          <tr v-for="l in slip.earnings" :key="'e'+l.id">
            <td>{{ l.componentNameSnapshot || l.component_name_snapshot }}</td>
            <td class="text-end">{{ money(l.amount) }}</td>
          </tr>
        </tbody>
      </table>
      <table class="table table-bordered" style="font-size: 12px">
        <thead>
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
      <table v-if="slip.employerContributions?.length" class="table table-bordered" style="font-size: 12px">
        <thead>
          <tr><th>Kontribusi Perusahaan</th><th class="text-end">Jumlah</th></tr>
        </thead>
        <tbody>
          <tr v-for="l in slip.employerContributions" :key="'c'+l.id">
            <td>{{ l.componentNameSnapshot || l.component_name_snapshot }}</td>
            <td class="text-end">{{ money(l.amount) }}</td>
          </tr>
        </tbody>
      </table>
      <p class="small text-muted mt-3">Kontribusi perusahaan ditampilkan terpisah dan tidak mengurangi THP.</p>
    </template>
  </CetakDocument>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'cetak', middleware: ['auth', 'check-permission'], alias: '/payroll/cetak-payslip' })
const route = useRoute()
const { money } = usePayrollStatus()
const slip = ref<any>(null)
const loading = ref(true)
const error = ref('')
onMounted(async () => {
  try {
    const { $api } = useNuxtApp()
    const { apiFetch } = await import('~/utils/apiFetch')
    const id = String(route.query.id || '')
    try {
      const res = await apiFetch<{ data: any }>($api.payrollMePayslipShow(id), { credentials: 'include' })
      slip.value = res.data
    } catch {
      const res = await apiFetch<{ data: any }>($api.payrollPayslipShow(id), { credentials: 'include' })
      slip.value = res.data
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal memuat payslip'
  } finally {
    loading.value = false
  }
})
</script>
