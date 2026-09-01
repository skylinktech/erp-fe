<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <FormPageHeader
        :title="isEditMode ? 'Edit Work Order Request' : 'Buat Work Order Request'"
        :subtitle="isEditMode ? `No. ${currentNo}` : 'Formulir Pengajuan Penugasan Teknisi'"
        back-href="/operations/work-order-request"
      />

      <div v-if="pageLoading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Memuat data...</p>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="row g-4">
          <!-- Informasi Site -->
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-transparent border-0 px-5 py-4">
                <h5 class="card-title mb-0">
                  <i class="ri-map-pin-2-line me-2 text-primary"></i>Informasi Site
                </h5>
              </div>
              <hr class="mx-5 my-0" style="border-width:2px">
              <div class="card-body px-5 pt-4 pb-5">
                <div class="row g-3">

                  <div class="col-md-6">
                    <label class="form-label">Tanggal Request <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" v-model="form.requestDate" required />
                  </div>

                  <!-- Site Investment selector -->
                  <div class="col-6">
                    <label class="form-label">
                      Site Investment (SI)
                      <span class="ms-1 text-muted small">— pilih untuk autofill data site &amp; client</span>
                    </label>
                    <CustomSelect2
                      v-model="form.siteInvestmentId"
                      :options="siteInvestments"
                      :get-option-label="siteInvestLabel"
                      :reduce="s => s.id"
                      searchable
                      clearable
                      placeholder="Cari SI / nama project..."
                      @search="onSiSearch"
                      @update:modelValue="onSiChange"
                    />
                    <!-- Info card ketika SI dipilih -->
                    <div v-if="selectedSi" class="alert alert-light border mt-2 py-2 px-3 d-flex align-items-start gap-2" style="font-size:13px">
                      <i class="ri-information-line text-primary mt-1"></i>
                      <div>
                        <strong>{{ selectedSi.siNumber || selectedSi.si_number }}</strong> — {{ selectedSi.name }}
                        <span v-if="selectedSi.customer?.name" class="ms-2 text-muted">| {{ selectedSi.customer.name }}</span>
                        <span v-if="selectedSi.location" class="ms-2 text-muted">| {{ selectedSi.location }}</span>
                        <div class="text-muted mt-1" style="font-size:11px">Data site, client, dan lokasi sudah diisi otomatis dari SI ini.</div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Nama Site / Project</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.siteName"
                      placeholder="Nama site atau project"
                      :class="{ 'border-primary': !!form.siteInvestmentId }"
                    />
                    <small v-if="form.siteInvestmentId" class="text-primary">
                      <i class="ri-magic-line me-1"></i>Diisi dari SI — dapat diubah manual
                    </small>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Perusahaan / Client</label>
                    <CustomSelect2
                      v-model="form.clientId"
                      :options="customerOptions"
                      :get-option-label="o => o.label"
                      :reduce="o => o.value"
                      searchable
                      clearable
                      placeholder="Pilih client..."
                      :class="{ 'border-primary': !!form.siteInvestmentId && siFilledClient }"
                      @search="searchCustomers"
                    />
                    <small v-if="form.siteInvestmentId && siFilledClient" class="text-primary">
                      <i class="ri-magic-line me-1"></i>Diisi dari SI — dapat diubah manual
                    </small>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Lokasi</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.location"
                      placeholder="Alamat / kota lokasi"
                      :class="{ 'border-primary': !!form.siteInvestmentId && siFilledLocation }"
                    />
                    <small v-if="form.siteInvestmentId && siFilledLocation" class="text-primary">
                      <i class="ri-magic-line me-1"></i>Diisi dari SI — dapat diubah manual
                    </small>
                  </div>

                  <div class="col-md-3">
                    <label class="form-label">PIC Lokasi</label>
                    <input type="text" class="form-control" v-model="form.picName" placeholder="Nama PIC di lokasi" />
                  </div>

                  <div class="col-md-3">
                    <label class="form-label">No. HP PIC</label>
                    <input type="tel" class="form-control" v-model="form.picPhone" placeholder="08xxxxxxxx" />
                  </div>

                </div>
              </div>
            </div>
          </div>

          <!-- Detail Pekerjaan -->
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-transparent border-0 px-5 py-4">
                <h5 class="card-title mb-0">
                  <i class="ri-tools-line me-2 text-primary"></i>Detail Pekerjaan
                </h5>
              </div>
              <hr class="mx-5 my-0" style="border-width:2px">
              <div class="card-body px-5 pt-4 pb-5">
                <div class="row g-3">

                  <div class="col-md-6">
                    <label class="form-label">Jenis Pekerjaan <span class="text-danger">*</span></label>
                    <CustomSelect2
                      v-model="form.jobType"
                      :options="jobTypeOptions"
                      :get-option-label="o => o.label"
                      :reduce="o => o.value"
                      placeholder="Pilih jenis pekerjaan"
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Tingkat Urgency <span class="text-danger">*</span></label>
                    <CustomSelect2
                      v-model="form.urgencyLevel"
                      :options="urgencyOptions"
                      :get-option-label="o => o.label"
                      :reduce="o => o.value"
                      placeholder="Pilih urgency"
                    />
                    <small v-if="form.urgencyLevel" class="mt-1 d-block">
                      <span :class="['badge', urgencyBadgeClass(form.urgencyLevel)]">{{ urgencyDesc(form.urgencyLevel) }}</span>
                    </small>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Target Pelaksanaan</label>
                    <input type="date" class="form-control" v-model="form.targetDate" />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Estimasi Durasi</label>
                    <input type="text" class="form-control" v-model="form.estimatedDuration" placeholder="Contoh: 4 jam, 2 hari" />
                  </div>

                  <div class="col-12">
                    <label class="form-label">Deskripsi Pekerjaan</label>
                    <textarea class="form-control" rows="3" v-model="form.jobDescription" placeholder="Jelaskan pekerjaan yang akan dilakukan..."></textarea>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Indikasi Gangguan</label>
                    <textarea class="form-control" rows="3" v-model="form.faultIndication" placeholder="Uraikan indikasi gangguan yang terjadi (jika ada)..."></textarea>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Catatan Tambahan</label>
                    <textarea class="form-control" rows="2" v-model="form.notes" placeholder="Catatan lain yang relevan..."></textarea>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="col-12">
            <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <NuxtLink to="/operations/work-order-request" class="btn btn-outline-secondary">Batal</NuxtLink>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="ri-save-line me-1"></i>
                {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Draft' }}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useWorkOrderRequestStore,
  getWorkOrderRequestNo,
  URGENCY_BADGE_CLASS,
} from '~/stores/work-order-request'
import type { WorkOrderJobType, WorkOrderUrgencyLevel } from '~/stores/work-order-request'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { apiFetch } from '~/utils/apiFetch'

const route = useRoute()
const store = useWorkOrderRequestStore()
const { saving } = storeToRefs(store)

const pageLoading = ref(false)
const isEditMode = computed(() => !!route.params.id)
const currentNo = ref('')

// ──────────────────────────────────────────────
// Site Investment state
// ──────────────────────────────────────────────
const siteInvestments = ref<any[]>([])
const selectedSi = ref<any>(null)
const siFilledClient = ref(false)
const siFilledLocation = ref(false)

// ──────────────────────────────────────────────
// Customer options for select
// ──────────────────────────────────────────────
const customerOptions = ref<{ label: string; value: number }[]>([])

// ──────────────────────────────────────────────
// Local form state (mirrors store.form for the page)
// ──────────────────────────────────────────────
const form = ref({
  requestDate: new Date().toISOString().slice(0, 10),
  siteInvestmentId: null as string | null,
  siteName: '',
  clientId: null as number | null,
  location: '',
  picName: '',
  picPhone: '',
  jobType: 'pm' as WorkOrderJobType,
  jobDescription: '',
  faultIndication: '',
  urgencyLevel: 'medium' as WorkOrderUrgencyLevel,
  targetDate: '',
  estimatedDuration: '',
  notes: '',
  attachment: null as string | null,
})

// ──────────────────────────────────────────────
// Static options
// ──────────────────────────────────────────────
const jobTypeOptions = [
  { label: 'PM – Preventive Maintenance', value: 'pm' },
  { label: 'CM – Corrective Maintenance', value: 'cm' },
  { label: 'Relokasi / Moving Perangkat', value: 'relocation' },
]

const urgencyOptions = [
  { label: 'High (Penanganan ≤ 1×24 jam)', value: 'high' },
  { label: 'Medium (Penanganan 2–3 hari kerja)', value: 'medium' },
  { label: 'Low (Penanganan > 3 hari kerja)', value: 'low' },
]

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function urgencyBadgeClass(level: WorkOrderUrgencyLevel): string {
  return URGENCY_BADGE_CLASS[level] ?? 'bg-label-secondary'
}

function urgencyDesc(level: WorkOrderUrgencyLevel): string {
  const map: Record<WorkOrderUrgencyLevel, string> = {
    high: 'Penanganan ≤ 1×24 jam',
    medium: 'Penanganan 2–3 hari kerja',
    low: 'Penanganan > 3 hari kerja',
  }
  return map[level] ?? ''
}

function siteInvestLabel(s: any): string {
  if (!s) return ''
  const no = s.siNumber || s.si_number || ''
  const name = s.name || ''
  const client = s.customer?.name || ''
  const parts = [no ? `${no}` : null, name || null, client ? `(${client})` : null]
  return parts.filter(Boolean).join(' — ')
}

// ──────────────────────────────────────────────
// Site Investment: load list & autofill on select
// ──────────────────────────────────────────────
async function loadSiteInvestments(search = '') {
  try {
    const { $api } = useNuxtApp()
    const url = `${($api as any).siteInvestment()}?page=1&rows=200&status=approved&search=${encodeURIComponent(search)}&includeDetails=false`
    const res = await fetch(url, { headers: { Accept: 'application/json' }, credentials: 'include' })
    const json = await res.json()
    const list = json?.data ?? json ?? []
    siteInvestments.value = Array.isArray(list) ? list : []
  } catch {
    siteInvestments.value = []
  }
}

function onSiSearch(query: string) {
  if (query.length >= 1) loadSiteInvestments(query)
}

/** Called whenever the SI select value changes. Autofill siteName, clientId, location. */
function onSiChange(newId: string | null) {
  if (!newId) {
    // User cleared the SI — reset flags but keep manual values
    selectedSi.value = null
    siFilledClient.value = false
    siFilledLocation.value = false
    return
  }

  const si = siteInvestments.value.find((s) => s.id === newId)
  if (!si) return

  selectedSi.value = si

  // Auto-fill Site Name
  form.value.siteName = si.name || ''

  // Auto-fill Location
  if (si.location) {
    form.value.location = si.location
    siFilledLocation.value = true
  }

  // Auto-fill Client
  const clientId = si.customerId ?? si.customer_id ?? si.customer?.id ?? null
  if (clientId) {
    form.value.clientId = Number(clientId)
    siFilledClient.value = true
    // Ensure customer appears in the options list
    const clientName = si.customer?.name ?? `Customer #${clientId}`
    const exists = customerOptions.value.find((o) => o.value === Number(clientId))
    if (!exists) customerOptions.value.push({ label: clientName, value: Number(clientId) })
  }
}

// ──────────────────────────────────────────────
// Customer search
// ──────────────────────────────────────────────
async function searchCustomers(query: string) {
  if (!query || query.length < 1) return
  try {
    const { $api } = useNuxtApp()
    const url = `${($api as any).customers()}?search=${encodeURIComponent(query)}&rows=20`
    const res = await apiFetch<any>(url, { credentials: 'include' })
    const list = res?.data ?? res ?? []
    customerOptions.value = (Array.isArray(list) ? list : []).map((c: any) => ({
      label: c.name,
      value: c.id,
    }))
  } catch {}
}

async function loadCustomerById(id: number) {
  try {
    const { $api } = useNuxtApp()
    const res = await apiFetch<any>(`${($api as any).customers()}/${id}`, { credentials: 'include' })
    const c = res?.data ?? res
    if (c?.id) {
      const exists = customerOptions.value.find((o) => o.value === c.id)
      if (!exists) customerOptions.value.push({ label: c.name, value: c.id })
    }
  } catch {}
}

/** Re-hydrate selectedSi info card from a known siteInvestmentId (edit mode). */
async function loadSiById(id: string) {
  // First try from already-loaded list
  let si = siteInvestments.value.find((s) => s.id === id)
  if (!si) {
    try {
      const { $api } = useNuxtApp()
      const res = await apiFetch<any>(`${($api as any).siteInvestmentShow(id)}`, { credentials: 'include' })
      si = res?.data ?? res
      if (si) siteInvestments.value.push(si)
    } catch {}
  }
  if (si) selectedSi.value = si
}

// ──────────────────────────────────────────────
// Edit mode: load existing WOR data
// ──────────────────────────────────────────────
async function loadForEdit(id: string) {
  pageLoading.value = true
  try {
    await store.getWorkOrderRequestDetails(id)
    const raw = store.workOrderRequest
    if (!raw) return
    currentNo.value = getWorkOrderRequestNo(raw)

    form.value = {
      requestDate: (raw.requestDate ?? raw.request_date ?? '').toString().slice(0, 10),
      siteInvestmentId: raw.siteInvestmentId ?? raw.site_investment_id ?? null,
      siteName: raw.siteName ?? raw.site_name ?? '',
      clientId: raw.clientId ?? raw.client_id ?? null,
      location: raw.location ?? '',
      picName: raw.picName ?? raw.pic_name ?? '',
      picPhone: raw.picPhone ?? raw.pic_phone ?? '',
      jobType: (raw.jobType ?? raw.job_type ?? 'pm') as WorkOrderJobType,
      jobDescription: raw.jobDescription ?? raw.job_description ?? '',
      faultIndication: raw.faultIndication ?? raw.fault_indication ?? '',
      urgencyLevel: (raw.urgencyLevel ?? raw.urgency_level ?? 'medium') as WorkOrderUrgencyLevel,
      targetDate: (raw.targetDate ?? raw.target_date ?? '').toString().slice(0, 10),
      estimatedDuration: raw.estimatedDuration ?? raw.estimated_duration ?? '',
      notes: raw.notes ?? '',
      attachment: raw.attachment ?? null,
    }

    // Hydrate customer option
    if (form.value.clientId) await loadCustomerById(form.value.clientId)

    // Hydrate SI info card
    if (form.value.siteInvestmentId) {
      // Prefer the already-preloaded siteInvestment from the WOR response
      const siFromRaw = (raw as any).siteInvestment ?? null
      if (siFromRaw) {
        selectedSi.value = siFromRaw
        if (!siteInvestments.value.find((s) => s.id === siFromRaw.id)) {
          siteInvestments.value.push(siFromRaw)
        }
      } else {
        await loadSiById(form.value.siteInvestmentId)
      }
      // Mark as SI-filled (but user may have overridden manually — we just show the hint)
      siFilledClient.value = !!(form.value.clientId)
      siFilledLocation.value = !!(form.value.location)
    }
  } finally {
    pageLoading.value = false
  }
}

// ──────────────────────────────────────────────
// Submit
// ──────────────────────────────────────────────
async function handleSubmit() {
  const existingId = isEditMode.value ? Number(route.params.id) : null
  store.openForm(existingId ? { ...(store.workOrderRequest as any), id: existingId } : null)
  Object.assign(store.form, {
    ...(existingId ? { id: existingId } : {}),
    ...form.value,
  })
  const result = await store.saveWorkOrderRequest()
  if (result) {
    const newId = typeof result === 'number' ? result : existingId
    if (newId) {
      await navigateTo(`/operations/work-order-request/detail/${newId}`)
    } else {
      await navigateTo('/operations/work-order-request')
    }
  }
}

// ──────────────────────────────────────────────
// Lifecycle
// ──────────────────────────────────────────────
onMounted(async () => {
  // Load SI list eagerly (top 200 sorted by latest)
  await loadSiteInvestments()

  if (isEditMode.value) {
    await loadForEdit(String(route.params.id))
  }
})

definePageMeta({
  hidePageHeading: true, layout: 'default', middleware: ['auth', 'check-permission'], title: 'Work Order Request Form' })
</script>
