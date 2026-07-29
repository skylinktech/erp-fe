<template>
  <div v-if="loading" class="text-center p-6">
    <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" fill="transparent" />
    <div class="mt-3 text-muted">Memuat data...</div>
  </div>
  <div v-else-if="error" class="alert alert-danger m-6">{{ error }}</div>
  <div v-else-if="arf" class="p-2 cetak-arf-doc position-relative">
    <button type="button" class="btn btn-primary no-print cetak-arf-print-btn" @click="onPrint">
      <i class="ri-printer-line me-1"></i> Print
    </button>

    <div class="cetak-arf-header">
      <div class="cetak-arf-header-left">
        <div v-if="perusahaan" class="cetak-arf-logo-wrap">
          <img
            :src="getCompanyLogo(perusahaan.logoPerusahaan ?? perusahaan.logo_perusahaan)"
            alt="Logo Perusahaan"
            class="cetak-arf-logo"
            @error="(e) => handleImageError(e, '/img/branding/logo.png')"
          />
        </div>
        <div class="cetak-arf-brand-block">
          <h2 class="cetak-arf-brand mb-0">SKYLINK</h2>
          <p v-if="companyName" class="cetak-arf-company-name mb-0">{{ companyName }}</p>
        </div>
      </div>
      <div class="cetak-arf-header-right">
        <h1 class="cetak-arf-title fw-bold mb-0">ADVANCED REQUEST FORM</h1>
        <p class="cetak-arf-subtitle mb-0">(ARF)</p>
      </div>
    </div>

    <hr class="cetak-arf-hr my-4" />

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

    <div v-if="showSignatureSection" class="signature-section mt-5">
      <h2 class="text-center fw-bold mb-3" style="font-size: 16px">LEMBAR PENGESAHAN</h2>
      <p class="text-center mb-0 mb-3" style="font-size: 12px; max-width: 720px; margin-left: auto; margin-right: auto">
        Dokumen ARF ini telah disetujui dan ditandatangani secara digital.
      </p>
      <MultiSignatureDisplay
        :key="'sig-' + (arf.id ?? '')"
        document-type="arfs"
        :document-id="String(arf.id)"
        title="Verifikasi Digital Dokumen"
        :columns="4"
        :qr-size="96"
      />
    </div>

    <div class="cetak-arf-page-footer">
      <span>{{ requestNo || 'ARF' }} — Skylink</span>
      <span>{{ printedAt }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import { apiFetch } from '~/utils/apiFetch'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'
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
const { getCompanyLogo, handleImageError } = useImageUrl()
const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const arf = ref<Arf | null>(null)
const perusahaan = ref<Record<string, any> | null>(null)

const companyName = computed(
  () => perusahaan.value?.nmPerusahaan ?? perusahaan.value?.nm_perusahaan ?? ''
)
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

function onPrint() {
  window.print()
}

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
.cetak-arf-print-btn {
  position: fixed;
  top: 12px;
  right: 25px;
  z-index: 1000;
}

.cetak-arf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  min-height: 72px;
}

.cetak-arf-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.cetak-arf-logo {
  display: block;
  height: 56px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
}

.cetak-arf-brand {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.cetak-arf-company-name {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.cetak-arf-header-right {
  text-align: right;
  flex-shrink: 0;
  max-width: 48%;
}

.cetak-arf-title {
  font-size: 1.05rem;
  line-height: 1.35;
}

.cetak-arf-subtitle {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.cetak-arf-hr {
  border: none;
  border-top: 1px solid #4275f6;
  opacity: 1;
}

.cetak-arf-section-header {
  background-color: #4275f6;
  color: #fff !important;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
}

.cetak-arf-th {
  background-color: #4275f6 !important;
  color: #fff !important;
  font-weight: 600;
  border-color: #4275f6 !important;
}

.cetak-arf-table thead th {
  background-color: #4275f6 !important;
  color: #fff !important;
}

.cetak-arf-notes {
  border: 1px solid #dee2e6;
  border-top: none;
}

.cetak-arf-page-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 0.5rem;
  font-size: 10px;
  border-top: 1px solid #ccc;
}
</style>

<style>
@media print {
  .no-print {
    display: none !important;
  }

  .alert {
    display: none !important;
  }

  .cetak-arf-doc {
    padding: 0.5rem !important;
    font-size: 12px;
  }

  .cetak-arf-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    page-break-inside: avoid;
  }

  .cetak-arf-logo {
    height: 52px !important;
    max-width: 110px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .cetak-arf-hr {
    border: none !important;
    border-top: 1pt solid #4275f6 !important;
  }

  .cetak-arf-table td,
  .cetak-arf-table th {
    border: 1pt solid #4275f6 !important;
    padding: 6px 8px !important;
  }

  .cetak-arf-section-header,
  .cetak-arf-th,
  .cetak-arf-table thead th {
    background-color: #4275f6 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
