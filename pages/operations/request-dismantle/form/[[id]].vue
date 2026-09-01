<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 class="mb-1">{{ pageTitle }}</h4>
          <PageBreadcrumb class="mt-1" :current-label="pageTitle" />
          <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
        </div>
        <NuxtLink to="/operations/request-dismantle" class="btn btn-outline-secondary btn-sm">
          <i class="ri-arrow-left-line me-1"></i> Kembali
        </NuxtLink>
      </div>

      <div v-if="pageLoading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <form v-else ref="formRoot" @submit.prevent="onFinalSubmit">
        <ul class="nav nav-pills flex-wrap gap-2 mb-4">
          <li v-for="(step, idx) in steps" :key="step.id" class="nav-item">
            <button
              type="button"
              class="nav-link"
              :class="{ active: currentIndex === idx }"
              @click="goToStep(idx)"
            >
              {{ idx + 1 }}. {{ step.label }}
            </button>
          </li>
        </ul>

        <div v-show="currentStep?.id === 'info'" data-step-id="info" id="info" class="card mb-4">
          <div class="card-body p-4 row g-3">
            <div class="col-md-4">
              <label class="form-label">Tanggal Request <span class="text-danger">*</span></label>
              <input v-model="form.requestDate" type="date" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Tanggal Efektif Terminasi <span class="text-danger">*</span></label>
              <input v-model="form.requestedEffectiveTerminationAt" type="datetime-local" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Tipe Terminasi <span class="text-danger">*</span></label>
              <select v-model="form.terminationType" class="form-select" required>
                <option v-for="o in terminationOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Customer <span class="text-danger">*</span></label>
              <CustomSelect2
                v-model="form.customerId"
                :options="customerOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                :disabled="scopeLocked"
                @search="searchCustomers"
                @open="onCustomerDropdownOpen"
                @update:modelValue="onCustomerChange"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label">Site <span class="text-danger">*</span></label>
              <CustomSelect2
                v-model="form.siteId"
                :options="siteOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                :disabled="scopeLocked"
                @search="searchSites"
                @open="onSiteDropdownOpen"
                @update:modelValue="onSiteChange"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
              <CustomSelect2
                v-model="form.perusahaanId"
                :options="perusahaanOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                @search="searchPerusahaan"
                @open="onPerusahaanDropdownOpen"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label">Reason Code</label>
              <input v-model="form.reasonCode" class="form-control" />
            </div>
            <div class="col-md-8">
              <label class="form-label">Alasan</label>
              <input v-model="form.reason" class="form-control" />
            </div>
            <div class="col-12">
              <label class="form-label">Catatan</label>
              <textarea v-model="form.notes" class="form-control" rows="2"></textarea>
            </div>
          </div>
        </div>

        <div v-show="currentStep?.id === 'services'" data-step-id="services" id="services" class="card mb-4">
          <div class="card-body p-4">
            <p class="text-muted">Pilih service instance dari customer + site yang sama.</p>
            <button
              type="button"
              class="btn btn-outline-primary btn-sm mb-3"
              :disabled="!form.customerId || !form.siteId || loadingEligibleServices"
              @click="loadEligibleServices"
            >
              <span v-if="loadingEligibleServices" class="spinner-border spinner-border-sm me-1"></span>
              Muat Layanan
            </button>
            <div
              v-if="servicesEmptyMessage"
              class="alert alert-warning py-2 mb-3"
              role="status"
            >
              {{ servicesEmptyMessage }}
            </div>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th></th>
                    <th>No. Service</th>
                    <th>Nama</th>
                    <th>Status</th>
                    <th>Site</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="si in eligibleServices" :key="si.id">
                    <td>
                      <input
                        type="checkbox"
                        :value="si.id"
                        :checked="form.selectedServiceInstanceIds.includes(si.id)"
                        @change="toggleService(si)"
                      />
                    </td>
                    <td>{{ si.serviceNumber || si.service_number }}</td>
                    <td>{{ si.serviceName || si.service_name }}</td>
                    <td>{{ si.status }}</td>
                    <td>{{ si.siteId || si.site_id }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-show="currentStep?.id === 'equipment'" data-step-id="equipment" id="equipment" class="card mb-4">
          <div class="card-body p-4">
            <div v-if="selected?.services?.length">
              <div v-for="svc in selected.services" :key="svc.id" class="mb-3">
                <h6>{{ svc.serviceNumber }} — {{ svc.serviceName }}</h6>
                <ul class="mb-0">
                  <li v-for="eq in svc.equipments" :key="eq.id">
                    {{ eq.equipmentNo }} / {{ eq.serialNumber || '—' }}
                    <span class="badge bg-label-secondary ms-1">{{ eq.ownershipType }}</span>
                    <span v-if="!eq.ownershipVerifiedAt" class="badge bg-label-danger ms-1">Unverified</span>
                  </li>
                </ul>
              </div>
            </div>
            <p v-else class="mb-0 text-muted">Simpan draft setelah memilih layanan untuk melihat equipment snapshot.</p>
          </div>
        </div>

        <div v-show="currentStep?.id === 'billing'" data-step-id="billing" id="billing" class="card mb-4">
          <div class="card-body p-4">
            <div v-for="(line, idx) in form.serviceLines" :key="line.serviceInstanceId" class="border rounded p-3 mb-3">
              <div class="fw-medium mb-2">Service {{ line.serviceInstanceId }}</div>
              <div class="row g-2">
                <div class="col-md-4">
                  <label class="form-label">Billing Cutoff <span class="text-danger">*</span></label>
                  <select v-model="form.serviceLines[idx].billingCutoffPolicy" class="form-select">
                    <option v-for="o in billingOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Effective Termination</label>
                  <input v-model="form.serviceLines[idx].effectiveTerminationAt" type="datetime-local" class="form-control" />
                </div>
                <div class="col-md-4 d-flex align-items-end gap-3">
                  <label class="form-check">
                    <input v-model="form.serviceLines[idx].prorateEnabled" type="checkbox" class="form-check-input" />
                    Prorate
                  </label>
                  <label class="form-check">
                    <input v-model="form.serviceLines[idx].earlyTermination" type="checkbox" class="form-check-input" />
                    Early termination
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-show="currentStep?.id === 'schedule'" data-step-id="schedule" id="schedule" class="card mb-4">
          <div class="card-body p-4 row g-3">
            <div class="col-md-6">
              <label class="form-label">Warehouse Tujuan</label>
              <CustomSelect2
                v-model="form.destinationWarehouseId"
                :options="warehouseOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                clearable
                @search="searchWarehouses"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Jadwal (informasi draft)</label>
              <input v-model="form.scheduledAt" type="datetime-local" class="form-control" />
              <small class="text-muted">Field jadwal disimpan pada draft; transisi scheduled via backend unblock/start.</small>
            </div>
          </div>
        </div>

        <div v-show="currentStep?.id === 'review'" data-step-id="review" id="review" class="card mb-4">
          <div class="card-body p-4">
            <DismantleReadinessPanel :readiness="readiness" :loading="readinessLoading" title="Submit readiness" />
            <div class="card bg-label-secondary">
              <div class="card-body">
                <div><strong>Customer/Site:</strong> {{ form.customerId }} / {{ form.siteId }}</div>
                <div><strong>Layanan:</strong> {{ form.serviceLines.length }}</div>
                <div><strong>Tipe:</strong> {{ form.terminationType }}</div>
              </div>
            </div>
            <div class="alert alert-warning mt-3 mb-0">
              <i class="ri-information-line me-1"></i>
              Upload attachment belum tersedia — menunggu contract backend.
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between flex-wrap gap-2">
          <button type="button" class="btn btn-outline-secondary" :disabled="isFirstStep" @click="prevStep">Back</button>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-primary" :disabled="savingDraft" @click="saveDraft">
              <span v-if="savingDraft" class="spinner-border spinner-border-sm me-1"></span>
              Save Draft
            </button>
            <button v-if="!isLastStep" type="button" class="btn btn-primary" @click="nextStep">Next</button>
            <button v-else type="submit" class="btn btn-success" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import { useRequestDismantleStore } from '~/stores/request-dismantle'
import { apiFetch } from '~/utils/apiFetch'
import { BILLING_CUTOFF_OPTIONS, TERMINATION_TYPE_OPTIONS } from '~/utils/dismantleLabels'
import { unwrapApiArray } from '~/utils/dismantleAdapter'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import DismantleReadinessPanel from '~/components/dismantle/DismantleReadinessPanel.vue'
import type { DismantleServiceLineInput } from '~/types/operations/dismantle'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})

const route = useRoute()
const { $api } = useNuxtApp()
const store = useRequestDismantleStore()
const { form, savingDraft, submitting, selected, readiness, readinessLoading } = storeToRefs(store)

const isEditMode = computed(() => !!route.params.id)
const pageTitle = computed(() =>
  isEditMode.value ? 'Edit Request Dismantle' : 'Buat Request Dismantle'
)
const pageSubtitle = computed(() =>
  isEditMode.value ? 'Ubah data Request Dismantle' : 'Buat data Request Dismantle baru'
)

const pageLoading = ref(false)
const formRoot = ref<HTMLElement | null>(null)
const eligibleServices = ref<Record<string, unknown>[]>([])
const loadingEligibleServices = ref(false)
const servicesEmptyMessage = ref<string | null>(null)
const customerOptions = ref<{ label: string; value: number }[]>([])
const siteOptions = ref<{ label: string; value: number }[]>([])
const perusahaanOptions = ref<{ label: string; value: number }[]>([])
const warehouseOptions = ref<{ label: string; value: number }[]>([])

const scopeLocked = computed(() => isEditMode.value && (form.value.serviceLines?.length ?? 0) > 0)

const steps = [
  { id: 'info', label: 'Informasi' },
  { id: 'services', label: 'Layanan' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'billing', label: 'Billing' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'review', label: 'Review' },
]

const { currentIndex, currentStep, isFirstStep, isLastStep, next: nextStep, previous: prevStep, goTo: goToStep } = useTabbedFormNavigation({
  steps,
  formRoot,
})

const terminationOptions = TERMINATION_TYPE_OPTIONS
const billingOptions = BILLING_CUTOFF_OPTIONS

function toggleService(si: Record<string, unknown>) {
  const id = String(si.id)
  const idx = form.value.selectedServiceInstanceIds.indexOf(id)
  if (idx >= 0) {
    form.value.selectedServiceInstanceIds.splice(idx, 1)
    form.value.serviceLines = form.value.serviceLines.filter((l) => l.serviceInstanceId !== id)
  } else {
    form.value.selectedServiceInstanceIds.push(id)
    const line: DismantleServiceLineInput = {
      serviceInstanceId: id,
      billingCutoffPolicy: 'EFFECTIVE_DATE',
      prorateEnabled: false,
      earlyTermination: false,
      effectiveTerminationAt: form.value.requestedEffectiveTerminationAt,
    }
    form.value.serviceLines.push(line)
  }
}

function matchesSearch(label: string, term: string) {
  if (!term) return true
  return label.toLowerCase().includes(term.toLowerCase())
}

async function searchCustomers(term: string) {
  try {
    const res = await apiFetch(`${$api.dataCustomer()}?search=${encodeURIComponent(term || '')}`)
    customerOptions.value = unwrapApiArray<{ id: number; name: string }>(res)
      .filter((c) => matchesSearch(c.name ?? '', term))
      .map((c) => ({ label: c.name, value: c.id }))
  } catch (e) {
    console.warn('Gagal memuat customer:', e)
    customerOptions.value = []
  }
}

async function searchSites(term: string) {
  try {
    const res = await apiFetch(
      `${$api.sites()}?search=${encodeURIComponent(term || '')}&rows=50&forSelect=true`,
    )
    siteOptions.value = unwrapApiArray<{ id: number; name: string }>(res)
      .filter((s) => matchesSearch(s.name ?? '', term))
      .map((s) => ({
        label: s.name,
        value: s.id,
      }))
  } catch (e) {
    console.warn('Gagal memuat site:', e)
    siteOptions.value = []
  }
}

async function searchPerusahaan(term: string) {
  try {
    const res = await apiFetch($api.dataPerusahaan())
    perusahaanOptions.value = unwrapApiArray<{ id: number; nmPerusahaan?: string; nm_perusahaan?: string }>(res)
      .filter((p) => matchesSearch(p.nmPerusahaan ?? p.nm_perusahaan ?? '', term))
      .map((p) => ({
        label: p.nmPerusahaan ?? p.nm_perusahaan ?? String(p.id),
        value: p.id,
      }))
  } catch (e) {
    console.warn('Gagal memuat perusahaan:', e)
    perusahaanOptions.value = []
  }
}

async function loadLookupOptions() {
  await Promise.all([searchCustomers(''), searchSites(''), searchPerusahaan('')])
}

function onCustomerDropdownOpen() {
  if (!customerOptions.value.length) void searchCustomers('')
}

function onSiteDropdownOpen() {
  if (!siteOptions.value.length) void searchSites('')
}

function onPerusahaanDropdownOpen() {
  if (!perusahaanOptions.value.length) void searchPerusahaan('')
}

function ensureSelectedLookupOptions() {
  const req = selected.value
  if (!req) return
  if (req.customerId && req.customer) {
    const exists = customerOptions.value.some((o) => o.value === req.customerId)
    if (!exists) {
      customerOptions.value.push({ label: req.customer.name, value: req.customerId })
    }
  }
  if (req.siteId && req.site) {
    const exists = siteOptions.value.some((o) => o.value === req.siteId)
    if (!exists) {
      siteOptions.value.push({ label: req.site.name, value: req.siteId })
    }
  }
  if (req.perusahaanId) {
    const exists = perusahaanOptions.value.some((o) => o.value === req.perusahaanId)
    if (!exists) {
      perusahaanOptions.value.push({
        label: `Perusahaan #${req.perusahaanId}`,
        value: req.perusahaanId,
      })
    }
  }
}

async function searchWarehouses(term: string) {
  const res = await apiFetch($api.dataWarehouse())
  warehouseOptions.value = unwrapApiArray<{ id: number; name: string }>(res)
    .filter((w) => matchesSearch(w.name ?? '', term))
    .map((w) => ({ label: w.name, value: w.id }))
}

function optionLabel(options: { label: string; value: number }[], id: number | null | undefined): string {
  if (id == null) return '—'
  return options.find((o) => o.value === id)?.label ?? `#${id}`
}

async function onCustomerChange() {
  form.value.siteId = null
  eligibleServices.value = []
  servicesEmptyMessage.value = null
}

function onSiteChange() {
  eligibleServices.value = []
  servicesEmptyMessage.value = null
}

async function loadEligibleServices() {
  if (!form.value.customerId || !form.value.siteId) return
  loadingEligibleServices.value = true
  servicesEmptyMessage.value = null
  try {
    const res = await apiFetch<{ data: Record<string, unknown>[] }>(
      $api.customerServiceInstances(form.value.customerId)
    )
    const all = unwrapApiArray<Record<string, unknown>>(res)
    eligibleServices.value = all.filter(
      (si) => Number(si.siteId ?? si.site_id) === Number(form.value.siteId)
    )
    if (!eligibleServices.value.length) {
      const customerName = optionLabel(customerOptions.value, form.value.customerId)
      const siteName = optionLabel(siteOptions.value, form.value.siteId)
      servicesEmptyMessage.value = `Data layanan tidak ditemukan untuk customer ${customerName} pada site ${siteName}`
    }
  } catch (e) {
    eligibleServices.value = []
    const customerName = optionLabel(customerOptions.value, form.value.customerId)
    const siteName = optionLabel(siteOptions.value, form.value.siteId)
    servicesEmptyMessage.value = `Gagal memuat layanan untuk customer ${customerName} pada site ${siteName}`
    console.warn('Gagal memuat layanan:', e)
  } finally {
    loadingEligibleServices.value = false
  }
}

async function saveDraft() {
  const id = await store.saveDraft()
  if (id) await store.fetchDetail(id)
}

async function onFinalSubmit() {
  const id = await store.saveDraft()
  if (!id) return
  const ok = await store.submitRequest(id)
  if (ok) await navigateTo(`/operations/request-dismantle/detail/${id}`)
}

onMounted(async () => {
  store.resetForm()
  pageLoading.value = true
  try {
    await loadLookupOptions()
    if (isEditMode.value) {
      await store.fetchDetail(String(route.params.id))
      ensureSelectedLookupOptions()
    }
  } finally {
    pageLoading.value = false
  }
})
</script>
