<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-5">
      <div v-if="!formReady && loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat…</span>
        </div>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <NuxtLink to="/purchasing/material-request" class="text-muted small text-decoration-none">
                Material Request
              </NuxtLink>
              <span class="text-muted small">/</span>
              <span class="text-muted small">{{ pageTitle }}</span>
            </div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
          </div>
          <NuxtLink to="/purchasing/material-request" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i>Kembali
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div class="col-xl-8 col-12">
            <div class="card mrf-form-card shadow-sm border-0">
              <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2 py-3 border-0 bg-transparent">
                <h5 class="card-title mb-0">Form Material Request</h5>
                <span class="text-muted small">Informasi header &amp; daftar item</span>
              </div>
              <div class="card-body pt-0">
                <form @submit.prevent="handleSubmit">
                  <ul class="nav nav-tabs mb-0" role="tablist">
                    <li class="nav-item">
                      <button class="nav-link active" type="button" data-bs-toggle="tab" data-bs-target="#mrf-tab-info">
                        <i class="ri-information-line me-1"></i>Informasi
                      </button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" type="button" data-bs-toggle="tab" data-bs-target="#mrf-tab-items">
                        <i class="ri-box-3-line me-1"></i>
                        Item
                        <span v-if="itemCount" class="badge bg-primary ms-1">{{ itemCount }}</span>
                      </button>
                    </li>
                  </ul>

                  <div class="tab-content pt-4">
                    <div id="mrf-tab-info" class="tab-pane fade show active">
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Site Investment <span class="text-danger">*</span></label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.siteInvestmentId"
                            :options="siteInvestments"
                            :get-option-label="siteInvestLabel"
                            :reduce="(s) => s?.id"
                            searchable
                            clearable
                            placeholder="Pilih Site Investment (approved)"
                            required
                            @search="onSiSearch"
                          />
                          <small class="text-muted">Material request terkait proyek eksternal dari SI yang sudah disetujui.</small>
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tanggal Request</label>
                        <div class="col-sm-9">
                          <input v-model="form.requestDate" type="date" class="form-control" required />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tanggal Dibutuhkan</label>
                        <div class="col-sm-9">
                          <input v-model="form.neededDate" type="date" class="form-control" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Prioritas</label>
                        <div class="col-sm-9">
                          <CustomSelect2 v-model="form.priority" :options="priorityOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable placeholder="Prioritas" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Mata Uang</label>
                        <div class="col-sm-9">
                          <CustomSelect2 v-model="form.currency" :options="currencyOptions" :get-option-label="(o) => o.label" :reduce="(o) => o.value" searchable clearable />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Departemen</label>
                        <div class="col-sm-9">
                          <CustomSelect2 v-model="form.departmentId" :options="departemens" :get-option-label="(d) => d?.nm_departemen || d?.nmDepartemen || ''" :reduce="(d) => d?.id" searchable clearable placeholder="Pilih departemen" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Keperluan / Tujuan</label>
                        <div class="col-sm-9">
                          <textarea v-model="form.purpose" class="form-control" rows="2" placeholder="Contoh: Material instalasi Starlink site Jakarta"></textarea>
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Catatan</label>
                        <div class="col-sm-9">
                          <textarea v-model="form.notes" class="form-control" rows="2" placeholder="Catatan tambahan"></textarea>
                        </div>
                      </div>
                    </div>

                    <div id="mrf-tab-items" class="tab-pane fade">
                      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                        <p class="mb-0 text-muted small">
                          Isi nama material, spesifikasi, qty, satuan, dan harga estimasi. Atau muat item dari Site Investment.
                        </p>
                        <div class="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            :disabled="!form.siteInvestmentId || loadingSiItems"
                            @click="onLoadSiItems"
                          >
                            <span v-if="loadingSiItems" class="spinner-border spinner-border-sm me-1"></span>
                            <i v-else class="ri-download-line me-1"></i>
                            Muat Item dari SI
                          </button>
                          <button type="button" class="btn btn-sm btn-primary" @click="materialRequestStore.addItem()">
                            <i class="ri-add-line me-1"></i>Tambah Item
                          </button>
                        </div>
                      </div>

                      <div v-if="!form.materialRequestItems.length" class="text-center py-5 border rounded text-muted">
                        <i class="ri-inbox-line fs-3 d-block mb-2"></i>
                        Belum ada item. Muat dari SI atau klik <strong>Tambah Item</strong>.
                      </div>

                      <div v-else class="table-responsive border rounded">
                        <table class="table table-sm table-hover mb-0 mrf-items-table">
                          <thead class="table-light">
                            <tr>
                              <th style="width: 40px;">#</th>
                              <th style="min-width: 180px;">Produk Katalog</th>
                              <th>Nama Material</th>
                              <th>Spesifikasi</th>
                              <th style="width: 90px;">Qty</th>
                              <th style="width: 140px;">Satuan</th>
                              <th style="width: 150px;">Harga Estimasi</th>
                              <th style="width: 150px;">Subtotal</th>
                              <th style="width: 48px;"></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(row, idx) in form.materialRequestItems" :key="idx">
                              <td class="text-muted">{{ idx + 1 }}</td>
                              <td>
                                <CustomSelect2
                                  v-model="row.productId"
                                  :options="products"
                                  :get-option-label="productLabel"
                                  :reduce="(p) => p?.id"
                                  searchable
                                  clearable
                                  placeholder="Eksternal / Keduanya"
                                  @update:modelValue="(id) => onProductSelect(idx, id)"
                                />
                              </td>
                              <td>
                                <input v-model="row.productName" type="text" class="form-control form-control-sm" placeholder="Nama material" required />
                              </td>
                              <td>
                                <input v-model="row.specification" type="text" class="form-control form-control-sm" placeholder="Merk, model, detail" />
                              </td>
                              <td>
                                <input
                                  v-model.number="row.qty"
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  class="form-control form-control-sm"
                                  @input="materialRequestStore.onQtyOrPriceChange(idx)"
                                />
                              </td>
                              <td>
                                <CustomSelect2
                                  v-model="row.uomId"
                                  :options="units"
                                  :get-option-label="unitLabel"
                                  :reduce="(u) => u?.id"
                                  searchable
                                  clearable
                                  placeholder="Satuan"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  :value="formatRupiah(row.estimatedPrice)"
                                  placeholder="0"
                                  @input="onPriceInput(idx, $event)"
                                />
                              </td>
                              <td>
                                <input type="text" class="form-control form-control-sm bg-lighter" :value="formatRupiah(row.subtotal)" readonly tabindex="-1" />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  class="btn btn-sm btn-icon btn-text-danger"
                                  title="Hapus item"
                                  @click="materialRequestStore.removeDetail(idx)"
                                >
                                  <i class="ri-delete-bin-7-line"></i>
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div v-if="form.materialRequestItems.length" class="d-flex justify-content-end pt-3 mt-2 border-top">
                        <span class="fw-semibold text-primary fs-5">Total estimasi: {{ formatRupiah(grandTotal) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
                    <NuxtLink to="/purchasing/material-request" class="btn btn-outline-secondary">Batal</NuxtLink>
                    <button type="submit" class="btn btn-primary" :disabled="saving">
                      <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-12">
            <FormPageSidebar
              summary-title="Ringkasan MRF"
              summary-icon="ri-file-list-3-line"
              :summary-rows="summaryRows"
              nav-title="Modul Purchasing"
              :nav-items="moduleNav"
            >
              <template #append>
                <div class="card border-0 bg-label-primary">
                  <div class="card-body small">
                    <strong class="d-flex align-items-center gap-1 mb-2">
                      <i class="ri-lightbulb-line"></i>
                      Tips
                    </strong>
                    <ul class="mb-0 ps-3">
                      <li>Pilih <strong>Site Investment</strong> yang sudah approved sebelum mengisi item.</li>
                      <li>Gunakan <strong>Muat Item dari SI</strong> untuk mengisi material dari daftar SI.</li>
                      <li>Setelah disimpan sebagai draft, submit MRF untuk proses approval.</li>
                    </ul>
                  </div>
                </div>
              </template>
            </FormPageSidebar>
          </div>
        </div>
      </template>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMaterialRequestStore } from '~/stores/material-request'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import FormPageSidebar from '~/components/form/FormPageSidebar.vue'
import { PURCHASING_MODULE_NAV } from '~/constants/purchasing/formNav'
import type { FormPageSummaryRow } from '~/types/form-page'

const route = useRoute()
const materialRequestStore = useMaterialRequestStore()
const formatRupiah = useFormatRupiah()

const { form, isEditMode, loading, saving } = storeToRefs(materialRequestStore)
const formReady = ref(false)
const loadingSiItems = ref(false)
const siteInvestments = ref<any[]>([])
const products = ref<any[]>([])
const departemens = ref<any[]>([])
const units = ref<any[]>([])

const moduleNav = [
  { label: 'Material Request', to: '/purchasing/material-request', icon: 'ri-box-3-line' },
  ...PURCHASING_MODULE_NAV,
]

const grandTotal = computed(() => materialRequestStore.formGrandTotal)
const itemCount = computed(() => form.value?.materialRequestItems?.length ?? 0)

const pageTitle = computed(() => (isEditMode.value ? 'Edit Material Request' : 'Tambah Material Request'))
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Perbarui permintaan material proyek eksternal.'
    : 'Buat permintaan material untuk proyek Site Investment (Starlink, Mikrotik, dll.).'
)

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]
const currencyOptions = [
  { label: 'IDR', value: 'IDR' },
  { label: 'USD', value: 'USD' },
]

function siteInvestLabel(s: any) {
  if (!s) return ''
  const no = s.siNumber || s.si_number || ''
  const name = s.name || ''
  const client = s.customer?.name || ''
  const parts = [no ? `${no}` : null, name || null, client ? `(${client})` : null]
  return parts.filter(Boolean).join(' — ')
}

function unitLabel(u: any) {
  if (!u) return ''
  return u.symbol ? `${u.name} (${u.symbol})` : u.name || ''
}

function productLabel(p: any) {
  if (!p) return ''
  const sku = p.sku ? `${p.sku} — ` : ''
  return `${sku}${p.name || ''}`
}

function onProductSelect(index: number, productId: number | null) {
  const product = products.value.find((p) => Number(p.id) === Number(productId)) ?? null
  materialRequestStore.onProductChange(index, product)
}

function formatDateId(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function findDepartemenName(id: number | null | undefined): string {
  if (!id) return '—'
  const d = departemens.value.find((x) => Number(x.id) === Number(id))
  return d?.nm_departemen || d?.nmDepartemen || '—'
}

function findSiteInvestmentLabel(id: string | null | undefined): string {
  if (!id) return '—'
  const s = siteInvestments.value.find((x) => String(x.id) === String(id))
  return s ? siteInvestLabel(s) : '—'
}

const summaryRows = computed<FormPageSummaryRow[]>(() => {
  const f = form.value
  const priority = priorityOptions.find((p) => p.value === f.priority)?.label ?? f.priority ?? '—'
  return [
    { label: 'Mode', value: isEditMode.value ? 'Edit' : 'Baru' },
    { label: 'Site Investment', value: findSiteInvestmentLabel(f.siteInvestmentId) },
    { label: 'Tgl request', value: formatDateId(f.requestDate) },
    { label: 'Dibutuhkan', value: formatDateId(f.neededDate) },
    { label: 'Prioritas', value: priority },
    { label: 'Departemen', value: findDepartemenName(f.departmentId) },
    { label: 'Mata uang', value: f.currency || 'IDR' },
    { label: 'Jumlah item', value: String(itemCount.value) },
    { label: 'Total estimasi', value: formatRupiah(grandTotal.value) },
  ]
})

function onPriceInput(index: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const row = form.value.materialRequestItems[index]
  if (row) {
    row.estimatedPrice = Number(raw) || 0
    materialRequestStore.onQtyOrPriceChange(index)
  }
}

async function loadSiteInvestments(search = '') {
  try {
    const { $api } = useNuxtApp()
    const url = `${$api.siteInvestment()}?page=1&rows=200&status=approved&search=${encodeURIComponent(search)}&includeDetails=false`
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

function syncFormFromSiteInvestment(siId: string | null) {
  if (!siId) {
    form.value.siteInvestment = null
    form.value.customerId = null
    form.value.siteId = null
    form.value.projectName = ''
    return
  }
  const si = siteInvestments.value.find((x) => String(x.id) === String(siId))
  if (!si) return
  form.value.siteInvestment = si
  form.value.customerId = si.customerId ?? si.customer?.id ?? null
  form.value.siteId = si.siteId ?? si.site?.id ?? null
  form.value.projectName = si.name ?? ''
}

watch(
  () => form.value.siteInvestmentId,
  (siId) => syncFormFromSiteInvestment(siId)
)

async function onLoadSiItems() {
  if (!form.value.siteInvestmentId) return
  loadingSiItems.value = true
  try {
    await materialRequestStore.loadSiteInvestmentItems(form.value.siteInvestmentId)
  } finally {
    loadingSiItems.value = false
  }
}

async function loadMasterData() {
  const { $api } = useNuxtApp()
  const headers = { Accept: 'application/json' }
  const [depRes, unitRes, prodRes] = await Promise.all([
    fetch($api.dataDepartemen(), { headers, credentials: 'include' }),
    fetch(`${$api.unit()}?rows=200`, { headers, credentials: 'include' }),
    fetch($api.dataProduct('external'), { headers, credentials: 'include' }),
  ])
  await loadSiteInvestments()
  if (depRes.ok) {
    const j = await depRes.json()
    departemens.value = Array.isArray(j) ? j : (j.data ?? j)
  }
  if (unitRes.ok) {
    const j = await unitRes.json()
    units.value = j.data ?? (Array.isArray(j) ? j : [])
  }
  if (prodRes.ok) {
    const j = await prodRes.json()
    products.value = Array.isArray(j) ? j : (j.data ?? [])
  }
}

async function handleSubmit() {
  if (!form.value.siteInvestmentId) {
    useToast().error({
      title: 'Validasi',
      message: 'Site Investment wajib dipilih',
      color: 'red',
      position: 'bottomRight',
      layout: 2,
    })
    return
  }
  const ok = await materialRequestStore.saveMaterialRequest()
  if (ok) navigateTo('/purchasing/material-request')
}

onMounted(async () => {
  formReady.value = false
  materialRequestStore.loading = false
  materialRequestStore.saving = false
  try {
    await loadMasterData()
    const id = route.params.id ? String(route.params.id) : null
    if (id) {
      await materialRequestStore.fetchMaterialRequestForEdit(id)
      materialRequestStore.showModal = false
      if (form.value.siteInvestmentId) {
        const si = form.value.siteInvestment
        if (si && !siteInvestments.value.some((s) => String(s.id) === String(si.id))) {
          siteInvestments.value = [si, ...siteInvestments.value]
        }
      }
    } else {
      materialRequestStore.openModal(null)
      materialRequestStore.showModal = false
      materialRequestStore.addItem()
    }
  } finally {
    materialRequestStore.loading = false
    formReady.value = true
  }
})
</script>

<style scoped>
.mrf-form-card {
  border: 1px solid var(--bs-border-color, #e4e6ef);
}

.mrf-items-table .form-control-sm {
  min-width: 0;
}

.bg-lighter {
  background-color: rgba(var(--bs-body-color-rgb, 67, 89, 113), 0.06);
}
</style>
