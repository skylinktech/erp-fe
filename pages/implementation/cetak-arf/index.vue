<template>
  <CetakDocument
    type="ARF"
    :document-number="requestNo || ''"
    :status="arf?.status"
    :company="perusahaan"
    :generated-at="printedAt"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !arf"
  >
    <template v-if="arf">
    <div class="d-flex justify-content-between mb-3" style="font-size: 12px">
      <div>
        <p class="mb-1"><strong>No. ARF :</strong> {{ requestNo || '—' }}</p>
        <p class="mb-1"><strong>Tanggal Pengajuan :</strong> {{ formatDate(arf.requestDate ?? arf.request_date) }}</p>
        <p class="mb-1"><strong>Pemohon :</strong> {{ requesterName }}</p>
        <p class="mb-1"><strong>Departemen :</strong> {{ departmentName }}</p>
        <p class="mb-1"><strong>Tipe :</strong> {{ typeLabel }}</p>
      </div>
      <div class="text-end">
        <p class="mb-1"><strong>Status :</strong> {{ statusLabel }}</p>
        <p class="mb-1"><strong>Site Investment :</strong> {{ siteInvestmentLabel }}</p>
        <p v-if="customerName" class="mb-1"><strong>Customer :</strong> {{ customerName }}</p>
        <p class="mb-1"><strong>Total :</strong> {{ formatRupiahNum(grandTotal) }}</p>
        <p class="mb-1"><strong>Mata Uang :</strong> {{ arf.currency || 'IDR' }}</p>
      </div>
    </div>

    <div class="cetak-arf-section-header">Rincian Item Budget</div>
    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-arf-table m-0" style="font-size: 12px">
        <thead>
          <tr>
            <th class="cetak-arf-th text-center" style="width: 36px">No</th>
            <th class="cetak-arf-th">Budget / Deskripsi</th>
            <th class="cetak-arf-th text-center" style="width: 60px">Qty</th>
            <th class="cetak-arf-th text-center" style="width: 70px">Satuan</th>
            <th class="cetak-arf-th text-end" style="width: 110px">Harga Satuan</th>
            <th class="cetak-arf-th text-end" style="width: 120px">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in itemRows" :key="item.id ?? idx">
            <td class="text-center">{{ idx + 1 }}</td>
            <td>
              <div>{{ itemBudgetLabel(item) }}</div>
              <small v-if="item.notes" class="text-muted">{{ item.notes }}</small>
            </td>
            <td class="text-center">{{ Number(item.qty) || 0 }}</td>
            <td class="text-center">{{ item.unit || '—' }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(item.unitPrice ?? item.unit_price) || 0) }}</td>
            <td class="text-end">{{ formatRupiahNum(Number(item.subtotal) || 0) }}</td>
          </tr>
          <tr v-if="itemRows.length" class="fw-bold">
            <td colspan="5" class="text-end">Subtotal Item</td>
            <td class="text-end">{{ formatRupiahNum(itemsTotal) }}</td>
          </tr>
          <tr v-if="!itemRows.length">
            <td colspan="6" class="text-center py-3 text-muted">Tidak ada item budget</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="employeeRows.length" class="mb-4">
      <div class="cetak-arf-section-header">Rincian Pegawai & Gaji</div>
      <div class="table-responsive">
        <table class="table table-bordered cetak-arf-table m-0" style="font-size: 12px">
          <thead>
            <tr>
              <th class="cetak-arf-th text-center" style="width: 36px">No</th>
              <th class="cetak-arf-th">Nama Pegawai</th>
              <th class="cetak-arf-th text-center" style="width: 120px">NIK</th>
              <th class="cetak-arf-th text-end" style="width: 140px">Gaji / Upah</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in employeeRows" :key="row.pegawaiId ?? row.pegawai_id ?? idx">
              <td class="text-center">{{ idx + 1 }}</td>
              <td>{{ employeeName(row) }}</td>
              <td class="text-center">{{ employeeNik(row) }}</td>
              <td class="text-end">{{ formatRupiahNum(Number(row.salaryAmount ?? row.salary_amount) || 0) }}</td>
            </tr>
            <tr class="fw-bold">
              <td colspan="3" class="text-end">Subtotal Gaji</td>
              <td class="text-end">{{ formatRupiahNum(employeesTotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="table-responsive mb-4">
      <table class="table table-bordered cetak-arf-table m-0" style="font-size: 12px">
        <tbody>
          <tr class="fw-bold cetak-arf-grand-total">
            <td class="text-end" style="width: 80%">Grand Total (Item + Gaji)</td>
            <td class="text-end">{{ formatRupiahNum(grandTotal) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="arf.notes" class="mb-4">
      <div class="cetak-arf-section-header">Catatan</div>
      <div class="cetak-arf-notes p-3" style="font-size: 12px; white-space: pre-wrap">{{ arf.notes }}</div>
    </div>

    <div
      v-if="arf.status === 'rejected' && (arf.rejectionReason || arf.rejectReason)"
      class="alert alert-danger py-2 mb-4"
      style="font-size: 12px"
    >
      <strong>Alasan Penolakan:</strong> {{ arf.rejectionReason || arf.rejectReason }}
    </div>

    <CetakSignature
      v-if="showSignatureSection"
      :key="'sig-' + (arf.id ?? '')"
      heading="LEMBAR PENGESAHAN"
      caption="Dokumen ARF ini telah disetujui dan ditandatangani secara digital."
      document-type="arfs"
      :document-id="String(arf.id)"
      :columns="4"
      :qr-size="96"
    />
    </template>
  </CetakDocument>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { apiFetch } from '~/utils/apiFetch'
import {
  getArfRequestNo,
  getArfItemsList,
  getArfEmployeesList,
  getArfItemsTotal,
  getArfEmployeesTotal,
  getArfTotal,
  ARF_TYPE_OPTIONS,
  type Arf,
  type ArfItemForm,
  type ArfEmployeeForm,
} from '~/stores/arf'

definePageMeta({ layout: 'cetak', middleware: ['auth', 'check-permission'] })

const { setDetailTitle } = useDynamicTitle()
const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const arf = ref<Arf | null>(null)
const perusahaan = ref<Record<string, any> | null>(null)

const requestNo = computed(() => getArfRequestNo(arf.value))
const itemRows = computed(() => getArfItemsList(arf.value))
const employeeRows = computed(() => getArfEmployeesList(arf.value))
const itemsTotal = computed(() => getArfItemsTotal(arf.value))
const employeesTotal = computed(() => getArfEmployeesTotal(arf.value))
const grandTotal = computed(() => getArfTotal(arf.value))
const printedAt = computed(() => new Date().toLocaleString('id-ID'))
const showSignatureSection = computed(() => arf.value?.status === 'approved' || arf.value?.status === 'completed')

const requesterName = computed(
  () =>
    arf.value?.requestedByUser?.fullName ??
    arf.value?.requestedByUser?.full_name ??
    arf.value?.createdByUser?.fullName ??
    arf.value?.createdByUser?.full_name ??
    '—'
)

const departmentName = computed(
  () => arf.value?.department?.nmDepartemen ?? arf.value?.department?.nm_departemen ?? '—'
)

const typeLabel = computed(() => {
  const t = arf.value?.type
  const found = ARF_TYPE_OPTIONS.find((o) => o.value === t)
  return found?.label ?? (t ? String(t) : '—')
})

const statusLabel = computed(() => {
  const s = arf.value?.status
  const map: Record<string, string> = {
    draft: 'Draft',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
  }
  return s ? (map[s] ?? s) : '—'
})

const siteInvestmentLabel = computed(() => {
  const si = arf.value?.siteInvestment
  if (!si) return '—'
  const no = si.siNumber ?? si.si_number ?? ''
  const name = si.name ?? ''
  return [no, name].filter(Boolean).join(' — ') || '—'
})

const customerName = computed(() => {
  const c = (arf.value?.siteInvestment as any)?.customer
  return c?.name ?? null
})

function formatDate(v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRupiahNum(val: number) {
  if (!Number.isFinite(val)) return '—'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(
    Math.round(val)
  )
}

function itemBudgetLabel(item: ArfItemForm) {
  const budget = item.budget
  const code = budget?.budgetCode ?? budget?.budget_code
  const name = budget?.budgetName ?? budget?.budget_name
  const budgetPart = [code, name].filter(Boolean).join(' — ')
  if (budgetPart && item.description) return `${budgetPart} — ${item.description}`
  return budgetPart || item.description || '—'
}

function employeeName(row: ArfEmployeeForm) {
  return row.pegawai?.nmPegawai ?? row.pegawai?.nm_pegawai ?? '—'
}

function employeeNik(row: ArfEmployeeForm) {
  return row.pegawai?.nikPegawai ?? row.pegawai?.nik_pegawai ?? '—'
}

onMounted(async () => {
  const id = route.query.id
  if (!id) {
    error.value = 'Parameter id wajib.'
    loading.value = false
    return
  }

  const { $api } = useNuxtApp()
  try {
    const res = await apiFetch<{
      data: {
        arf: Arf
        perusahaan: Record<string, any> | null
      }
    }>($api.arfCetak(id), { credentials: 'include' })

    arf.value = res.data?.arf ?? null
    perusahaan.value = res.data?.perusahaan ?? null

    if (arf.value) {
      setDetailTitle('Cetak ARF', getArfRequestNo(arf.value), false)
    } else {
      error.value = 'Data tidak ditemukan.'
    }
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat cetak ARF.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.cetak-arf-section-header {
  background-color: var(--print-table-header, #3b4056);
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
}

.cetak-arf-th {
  background-color: var(--print-table-header, #3b4056) !important;
  color: #fff !important;
  font-weight: 600;
  border-color: transparent !important;
}

.cetak-arf-table thead th {
  background-color: var(--print-table-header, #3b4056) !important;
  color: #fff !important;
}

.cetak-arf-notes {
  border: 1px solid var(--print-table-outline, #e5e7eb);
  border-top: none;
  border-radius: 0 0 var(--print-table-radius, 10px) var(--print-table-radius, 10px);
}
</style>
