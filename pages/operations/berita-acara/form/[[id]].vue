<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex align-items-center gap-3 mb-4">
        <NuxtLink to="/operations/berita-acara" class="btn btn-outline-secondary btn-sm">
          <i class="ri-arrow-left-line me-1"></i> Kembali
        </NuxtLink>
        <div>
          <h4 class="mb-0">{{ isEditMode ? 'Edit Berita Acara' : 'Buat Berita Acara' }}</h4>
          <PageBreadcrumb class="mt-1" :current-label="isEditMode ? 'Edit Berita Acara' : 'Buat Berita Acara'" />
          <small class="text-muted">{{ isEditMode ? `No. ${currentNo}` : 'Formulir Berita Acara Performansi' }}</small>
        </div>
      </div>

      <div v-if="pageLoading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Memuat data...</p>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="row g-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-transparent border-0 px-5 py-4">
                <h5 class="card-title mb-0">
                  <i class="ri-file-text-line me-2 text-primary"></i>Informasi Berita Acara
                </h5>
              </div>
              <hr class="mx-5 my-0" style="border-width:2px">
              <div class="card-body px-5 pt-4 pb-5">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Customer <span class="text-danger">*</span></label>
                    <CustomSelect2
                      v-model="form.customerId"
                      :options="customerOptions"
                      :get-option-label="o => o.label"
                      :reduce="o => o.value"
                      searchable
                      clearable
                      placeholder="Pilih customer..."
                      @search="searchCustomers"
                    />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Tanggal BA <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" v-model="form.documentDate" required />
                  </div>


                  <div class="col-md-4">
                    <label class="form-label">Nomor Kontrak</label>
                    <input type="text" class="form-control" v-model="form.contractNo" placeholder="Contoh: 18653" />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Periode Mulai <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" v-model="form.periodStart" required />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Periode Selesai <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" v-model="form.periodEnd" required />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Partner / Penyedia</label>
                    <input type="text" class="form-control" v-model="form.partnerName" placeholder="SKYLINK" />
                  </div>

                  <div class="col-md-12">
                    <label class="form-label">Catatan / SLA</label>
                    <input type="text" class="form-control" v-model="form.notes" placeholder="Contoh: SLA 99%" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="card">
              <div class="card-header bg-transparent border-0 px-5 py-4 d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  <i class="ri-table-line me-2 text-primary"></i>Data Performansi
                </h5>
                <button type="button" class="btn btn-sm btn-outline-primary" @click="addItem">
                  <i class="ri-add-line me-1"></i>Tambah Baris
                </button>
              </div>
              <hr class="mx-5 my-0" style="border-width:2px">
              <div class="card-body px-5 pt-4 pb-5">
                <div class="table-responsive">
                  <table class="table table-bordered align-middle mb-0">
                    <thead>
                      <tr>
                        <th style="width:3rem">No</th>
                        <th style="min-width:10rem">PID <span class="text-danger">*</span></th>
                        <th style="min-width:12rem">Lokasi <span class="text-danger">*</span></th>
                        <th style="min-width:7rem">Bandwidth</th>
                        <th style="min-width:7rem">Uptime</th>
                        <th style="min-width:7rem">Avg Ping</th>
                        <th style="min-width:12rem">Keterangan</th>
                        <th style="width:3rem"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, idx) in form.items" :key="idx">
                        <td class="text-center">{{ idx + 1 }}</td>
                        <td>
                          <input type="text" class="form-control form-control-sm" v-model="item.pid" placeholder="SL2505-..." required />
                        </td>
                        <td>
                          <input type="text" class="form-control form-control-sm" v-model="item.lokasi" placeholder="Nama lokasi" required />
                        </td>
                        <td>
                          <input type="text" class="form-control form-control-sm" v-model="item.bandwidth" placeholder="Open" />
                        </td>
                        <td>
                          <input type="text" class="form-control form-control-sm" v-model="item.uptimeStatus" placeholder="100%" />
                        </td>
                        <td>
                          <input type="number" step="any" class="form-control form-control-sm" v-model.number="item.averagePing" placeholder="40" />
                        </td>
                        <td>
                          <input type="text" class="form-control form-control-sm" v-model="item.keterangan" placeholder="Paket layanan..." />
                        </td>
                        <td class="text-center">
                          <button
                            type="button"
                            class="btn btn-sm btn-text-danger btn-icon"
                            :disabled="form.items.length <= 1"
                            @click="removeItem(idx)"
                          >
                            <i class="ri-delete-bin-line"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <NuxtLink to="/operations/berita-acara" class="btn btn-outline-secondary">Batal</NuxtLink>
              <button type="submit" class="btn btn-primary" :disabled="saving || !form.customerId">
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
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useBeritaAcaraStore,
  getBeritaAcaraNo,
  emptyItem,
  type BeritaAcaraItem,
} from '~/stores/berita-acara'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { apiFetch } from '~/utils/apiFetch'

const route = useRoute()
const store = useBeritaAcaraStore()
const { saving } = storeToRefs(store)

const pageLoading = ref(false)
const isEditMode = computed(() => !!route.params.id)
const currentNo = ref('')

const customerOptions = ref<{ label: string; value: number }[]>([])

const form = ref({
  documentDate: new Date().toISOString().slice(0, 10),
  customerId: null as number | null,
  contractNo: '',
  periodStart: new Date().toISOString().slice(0, 10),
  periodEnd: new Date().toISOString().slice(0, 10),
  partnerName: 'SKYLINK',
  notes: 'SLA 99%',
  items: [emptyItem()] as BeritaAcaraItem[],
})

function addItem() {
  form.value.items.push(emptyItem())
}

function removeItem(idx: number) {
  if (form.value.items.length <= 1) return
  form.value.items.splice(idx, 1)
}

async function searchCustomers(query: string = '') {
  try {
    const { $api } = useNuxtApp()
    const params = new URLSearchParams({
      search: query?.trim() || '',
      rows: '50',
      page: '1',
    })
    const url = `${$api.customer()}?${params.toString()}`
    const res = await apiFetch<any>(url, { credentials: 'include' })
    const list = res?.data ?? res ?? []
    customerOptions.value = (Array.isArray(list) ? list : []).map((c: any) => ({
      label: c.name,
      value: c.id,
    }))
  } catch (e) {
    console.warn('Gagal memuat customer:', e)
  }
}

async function loadCustomerById(id: number) {
  try {
    const { $api } = useNuxtApp()
    const res = await apiFetch<any>(`${$api.customer()}/${id}`, { credentials: 'include' })
    const c = res?.data ?? res
    if (c?.id) {
      const exists = customerOptions.value.find((o) => o.value === c.id)
      if (!exists) customerOptions.value.push({ label: c.name, value: c.id })
    }
  } catch {}
}

async function loadForEdit(id: string) {
  pageLoading.value = true
  try {
    await store.getBeritaAcaraDetails(id)
    const raw = store.beritaAcara
    if (!raw) return
    currentNo.value = getBeritaAcaraNo(raw)
    store.openForm(raw)
    form.value = {
      documentDate: store.form.documentDate,
      customerId: store.form.customerId,
      contractNo: store.form.contractNo,
      periodStart: store.form.periodStart,
      periodEnd: store.form.periodEnd,
      partnerName: store.form.partnerName,
      notes: store.form.notes,
      items: store.form.items.map((i) => ({ ...i })),
    }
    if (form.value.customerId) await loadCustomerById(form.value.customerId)
  } finally {
    pageLoading.value = false
  }
}

async function handleSubmit() {
  if (!form.value.customerId) {
    useToast().error({
      title: 'Validasi',
      message: 'Customer wajib dipilih',
      color: 'red',
      position: 'bottomRight',
      layout: 2,
    })
    return
  }

  const invalidItem = form.value.items.find((i) => !i.pid?.trim() || !i.lokasi?.trim())
  if (invalidItem) {
    useToast().error({
      title: 'Validasi',
      message: 'Setiap baris wajib mengisi PID dan Lokasi',
      color: 'red',
      position: 'bottomRight',
      layout: 2,
    })
    return
  }

  if (form.value.periodEnd < form.value.periodStart) {
    useToast().error({
      title: 'Validasi',
      message: 'Tanggal akhir periode harus setelah tanggal mulai',
      color: 'red',
      position: 'bottomRight',
      layout: 2,
    })
    return
  }

  const existingId = isEditMode.value ? Number(route.params.id) : null
  store.openForm(existingId ? { ...(store.beritaAcara as any), id: existingId } : null)
  Object.assign(store.form, {
    ...(existingId ? { id: existingId } : {}),
    ...form.value,
    items: form.value.items.map((i) => ({ ...i })),
  })
  const result = await store.saveBeritaAcara()
  if (result) {
    const newId = typeof result === 'number' ? result : existingId
    if (newId) await navigateTo(`/operations/berita-acara/detail/${newId}`)
    else await navigateTo('/operations/berita-acara')
  }
}

onMounted(async () => {
  await searchCustomers('')
  if (isEditMode.value) await loadForEdit(String(route.params.id))
})

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Berita Acara Form',
})
</script>
