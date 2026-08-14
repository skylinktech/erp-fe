<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex align-items-center gap-3 mb-4">
        <NuxtLink to="/operations/request-activation" class="btn btn-outline-secondary btn-sm">
          <i class="ri-arrow-left-line me-1"></i> Kembali
        </NuxtLink>
        <div>
          <h4 class="mb-0">{{ isEditMode ? 'Edit Request Activation' : 'Buat Request Activation' }}</h4>
          <PageBreadcrumb class="mt-1" :current-label="isEditMode ? 'Edit Request Activation' : 'Buat Request Activation'" />
          <small class="text-muted">{{ isEditMode ? `No. ${currentNo}` : 'Formulir Request Aktivasi Layanan' }}</small>
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
                  <i class="ri-building-line me-2 text-primary"></i>Informasi Customer &amp; Layanan
                </h5>
              </div>
              <hr class="mx-5 my-0" style="border-width:2px">
              <div class="card-body px-5 pt-4 pb-5">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Tanggal <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" v-model="form.requestDate" required />
                  </div>

                  <div class="col-md-6">
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

                  <div class="col-md-6">
                    <label class="form-label">Service Line</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.serviceLine"
                      placeholder="Contoh: Local (Fix Land)"
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Paket Layanan</label>
                    <CustomSelect2
                      v-model="form.servicePlanId"
                      :options="servicePlanOptions"
                      :get-option-label="o => o.label"
                      :reduce="o => o.value"
                      searchable
                      clearable
                      placeholder="Pilih paket layanan..."
                      @search="searchServicePlans"
                      @update:modelValue="onServicePlanChange"
                    />
                    <input
                      type="text"
                      class="form-control mt-2"
                      v-model="form.planName"
                      placeholder="Nama paket (otomatis / manual)"
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">SN KIT</label>
                    <input type="text" class="form-control" v-model="form.snKit" placeholder="Serial number KIT" />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Nama Lokasi</label>
                    <input type="text" class="form-control" v-model="form.locationName" placeholder="Nama lokasi / site" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="card">
              <div class="card-header bg-transparent border-0 px-5 py-4">
                <h5 class="card-title mb-0">
                  <i class="ri-user-location-line me-2 text-primary"></i>PIC, Alamat &amp; Kontak
                </h5>
              </div>
              <hr class="mx-5 my-0" style="border-width:2px">
              <div class="card-body px-5 pt-4 pb-5">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">PIC</label>
                    <input type="text" class="form-control" v-model="form.picName" placeholder="Nama PIC" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Nomor PIC</label>
                    <input type="tel" class="form-control" v-model="form.picPhone" placeholder="+62 ..." />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Contact AM</label>
                    <input type="text" class="form-control" v-model="form.contactAm" placeholder="Nama AM" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Form Berlangganan (URL)</label>
                    <input type="url" class="form-control" v-model="form.subscriptionFormUrl" placeholder="https://..." />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Address</label>
                    <textarea class="form-control" rows="2" v-model="form.address" placeholder="Alamat lengkap lokasi"></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      class="form-control"
                      v-model.number="form.latitude"
                      placeholder="-6.xxxxxx"
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      class="form-control"
                      v-model.number="form.longitude"
                      placeholder="106.xxxxxx"
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Keterangan</label>
                    <textarea class="form-control" rows="2" v-model="form.notes" placeholder="Catatan tambahan..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <NuxtLink to="/operations/request-activation" class="btn btn-outline-secondary">Batal</NuxtLink>
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
  useRequestActivationStore,
  getRequestActivationNo,
} from '~/stores/request-activation'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { apiFetch } from '~/utils/apiFetch'

const route = useRoute()
const store = useRequestActivationStore()
const { saving } = storeToRefs(store)

const pageLoading = ref(false)
const isEditMode = computed(() => !!route.params.id)
const currentNo = ref('')

const customerOptions = ref<{ label: string; value: number }[]>([])
const servicePlanOptions = ref<{ label: string; value: number; name?: string }[]>([])

const form = ref({
  requestDate: new Date().toISOString().slice(0, 10),
  customerId: null as number | null,
  serviceLine: '',
  servicePlanId: null as number | null,
  planName: '',
  snKit: '',
  locationName: '',
  picName: '',
  picPhone: '',
  subscriptionFormUrl: '',
  notes: '',
  contactAm: '',
  address: '',
  latitude: null as number | null,
  longitude: null as number | null,
})

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

async function searchServicePlans(query: string) {
  try {
    const { $api } = useNuxtApp()
    const url = `${($api as any).servicePlan()}?search=${encodeURIComponent(query || '')}&rows=50`
    const res = await apiFetch<any>(url, { credentials: 'include' })
    const list = res?.data ?? res ?? []
    servicePlanOptions.value = (Array.isArray(list) ? list : []).map((p: any) => ({
      label: p.quota ? `${p.name} (${p.quota})` : p.name,
      value: p.id,
      name: p.name,
    }))
  } catch {
    servicePlanOptions.value = []
  }
}

function onServicePlanChange(id: number | null) {
  if (!id) return
  const plan = servicePlanOptions.value.find((p) => p.value === id)
  if (plan?.name) form.value.planName = plan.name
}

async function loadForEdit(id: string) {
  pageLoading.value = true
  try {
    await store.getRequestActivationDetails(id)
    const raw = store.requestActivation
    if (!raw) return
    currentNo.value = getRequestActivationNo(raw)

    form.value = {
      requestDate: (raw.requestDate ?? raw.request_date ?? '').toString().slice(0, 10),
      customerId: raw.customerId ?? raw.customer_id ?? null,
      serviceLine: raw.serviceLine ?? raw.service_line ?? '',
      servicePlanId: raw.servicePlanId ?? raw.service_plan_id ?? null,
      planName: raw.planName ?? raw.plan_name ?? '',
      snKit: raw.snKit ?? raw.sn_kit ?? '',
      locationName: raw.locationName ?? raw.location_name ?? '',
      picName: raw.picName ?? raw.pic_name ?? '',
      picPhone: raw.picPhone ?? raw.pic_phone ?? '',
      subscriptionFormUrl: raw.subscriptionFormUrl ?? raw.subscription_form_url ?? '',
      notes: raw.notes ?? '',
      contactAm: raw.contactAm ?? raw.contact_am ?? '',
      address: raw.address ?? '',
      latitude: raw.latitude != null ? Number(raw.latitude) : null,
      longitude: raw.longitude != null ? Number(raw.longitude) : null,
    }

    if (form.value.customerId) await loadCustomerById(form.value.customerId)
    if (raw.servicePlan) {
      const p = raw.servicePlan
      const exists = servicePlanOptions.value.find((o) => o.value === p.id)
      if (!exists) {
        servicePlanOptions.value.push({
          label: p.quota ? `${p.name} (${p.quota})` : p.name,
          value: p.id,
          name: p.name,
        })
      }
    }
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

  const existingId = isEditMode.value ? Number(route.params.id) : null
  store.openForm(existingId ? { ...(store.requestActivation as any), id: existingId } : null)
  Object.assign(store.form, {
    ...(existingId ? { id: existingId } : {}),
    ...form.value,
  })
  const result = await store.saveRequestActivation()
  if (result) {
    const newId = typeof result === 'number' ? result : existingId
    if (newId) await navigateTo(`/operations/request-activation/detail/${newId}`)
    else await navigateTo('/operations/request-activation')
  }
}

onMounted(async () => {
  await searchServicePlans('')
  if (isEditMode.value) await loadForEdit(String(route.params.id))
})

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Request Activation Form',
})
</script>
