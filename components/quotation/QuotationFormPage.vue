<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-5">
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <NuxtLink to="/sales/quotation" class="text-muted small text-decoration-none">Quotation</NuxtLink>
            <span class="text-muted small">/</span>
            <span class="text-muted small">{{ pageTitle }}</span>
          </div>
          <h4 class="mb-0">{{ pageTitle }}</h4>
          <p class="text-muted mb-0 small">{{ pageSubtitle }}</p>
        </div>
        <NuxtLink to="/sales/quotation" class="btn btn-outline-secondary btn-sm">
          <i class="ri-arrow-left-line me-1"></i> Kembali
        </NuxtLink>
      </div>

      <div class="row g-4">
        <div class="col-xl-8 col-12">
          <div class="card">
            <div class="card-body">
              <form @submit.prevent="onSubmit">
            <div v-if="validationErrors?.length" class="alert alert-warning mb-4">
              <ul class="mb-0 ps-3">
                <li v-for="(err, i) in validationErrors" :key="i">{{ err?.message || err }}</li>
              </ul>
            </div>

            <ul class="nav nav-tabs" role="tablist">
              <li class="nav-item">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#quotation-tab-info" role="tab" type="button">
                  <span class="d-none d-sm-block">Informasi</span>
                  <span class="d-sm-none ri-information-line"></span>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#quotation-tab-product" role="tab" type="button">
                  <span class="d-none d-sm-block">Products</span>
                  <span class="d-sm-none ri-box-3-line"></span>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#quotation-tab-services" role="tab" type="button">
                  <span class="d-none d-sm-block">Services</span>
                  <span class="d-sm-none ri-service-line"></span>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#quotation-tab-did" role="tab" type="button">
                  <span class="d-none d-sm-block">DID</span>
                  <span class="d-sm-none ri-phone-line"></span>
                </button>
              </li>
            </ul>

            <div class="tab-content pt-4">
              <div class="tab-pane fade show active" id="quotation-tab-info" role="tabpanel">
                <div class="row g-3">
                  <div class="col-md-3"><label class="form-label">Site Investment</label><CustomSelect2 v-model="form.siteInvestId" :options="siteInvests" :get-option-label="s => s ? `${s.siNumber || ''} - ${s.name || ''}` : ''" :reduce="s => s?.id" searchable clearable placeholder="Pilih Site Investment" /></div>
                  <div class="col-md-3"><label class="form-label">Customer</label><CustomSelect2 v-model="form.customerId" :options="customers || []" :get-option-label="c => c?.name || ''" :reduce="c => c?.id" searchable clearable placeholder="Pilih Customer" /></div>
                  <div class="col-md-3"><label class="form-label">Site</label><CustomSelect2 v-model="form.siteId" :options="sites" :get-option-label="s => s ? `${s.code || ''} - ${s.name || ''}` : ''" :reduce="s => s?.id" searchable clearable placeholder="Pilih Site" /></div>
                  <div class="col-md-3"><label class="form-label">Cost Center</label><CustomSelect2 v-model="form.costCenterId" :options="costCenters" :get-option-label="c => c ? `${c.code || ''} - ${c.name || ''}` : ''" :reduce="c => c?.id" searchable clearable placeholder="Pilih Cost Center" /></div>
                  <div class="col-md-3"><label class="form-label">UP</label><input v-model="form.up" class="form-control" type="text" /></div>
                  <div class="col-md-3"><label class="form-label">Ref PO</label><input v-model="form.refPo" class="form-control" type="text" maxlength="100" /></div>
                  <div class="col-md-3"><label class="form-label">Tanggal Quotation</label><input v-model="form.date" class="form-control" type="date" /></div>
                  <div class="col-md-3"><label class="form-label">Valid Until</label><input v-model="form.validUntil" class="form-control" type="date" /></div>
                  <div class="col-md-3"><label class="form-label">Terms of Payment</label><CustomSelect2 v-model="form.termsOfPayment" :options="termsOfPaymentOptions" :get-option-label="o => o.label" :reduce="o => o.value" /></div>
                  <div class="col-md-3"><label class="form-label">Discount (%)</label><input v-model.number="form.discountPercent" class="form-control" type="number" /></div>
                  <div class="col-md-3"><label class="form-label">Tax (%)</label><input v-model.number="form.taxPercent" class="form-control" type="number" /></div>
                  <div class="col-12"><label class="form-label">Deskripsi</label><Editor v-model="form.description" editor-style="min-height: 180px" /></div>
                </div>
              </div>

              <div class="tab-pane fade" id="quotation-tab-product" role="tabpanel">
                <div class="mb-2"><h6 class="mb-0">Products</h6></div>
                <div v-for="(item, idx) in form.quotationItems" :key="'p-'+idx" class="row g-2 mb-2">
                  <div class="col-md-5"><CustomSelect2 v-model="item.productId" :options="customerProducts || []" :get-option-label="p => `${p?.sku || ''} | ${p?.name || ''}`" :reduce="p => p?.id" searchable clearable placeholder="Produk" /></div>
                  <div class="col-md-2"><input v-model.number="item.quantity" type="number" min="1" class="form-control" placeholder="Qty" /></div>
                  <div class="col-md-3"><input v-model.number="item.price" type="number" min="0" class="form-control" placeholder="Harga" /></div>
                  <div class="col-md-2"><button type="button" class="btn btn-outline-danger w-100" @click="quotationStore.removeItem(idx)">Hapus</button></div>
                </div>
                <button type="button" class="btn btn-primary w-100 mt-2" @click="quotationStore.addItem()">Tambah Item</button>
              </div>

              <div class="tab-pane fade" id="quotation-tab-services" role="tabpanel">
                <div class="mb-2"><h6 class="mb-0">Services</h6></div>
                <div v-for="(item, idx) in form.quotationServices" :key="'s-'+idx" class="row g-2 mb-2">
                  <div class="col-md-4"><CustomSelect2 v-model="item.serviceId" :options="services || []" :get-option-label="s => s?.name || ''" :reduce="s => s?.id" searchable clearable placeholder="Service" /></div>
                  <div class="col-md-2"><CustomSelect2 v-model="item.unitId" :options="units" :get-option-label="u => u?.symbol || u?.name || ''" :reduce="u => u?.id" searchable clearable placeholder="Unit" /></div>
                  <div class="col-md-2"><input v-model.number="item.quantity" type="number" min="1" class="form-control" placeholder="Qty" /></div>
                  <div class="col-md-2"><input v-model.number="item.price" type="number" min="0" class="form-control" placeholder="Harga" /></div>
                  <div class="col-md-2"><button type="button" class="btn btn-outline-danger w-100" @click="quotationStore.removeServiceItem(idx)">Hapus</button></div>
                </div>
                <button type="button" class="btn btn-primary w-100 mt-2" @click="quotationStore.addServiceItem()">Tambah Service</button>
              </div>

              <div class="tab-pane fade" id="quotation-tab-did" role="tabpanel">
                <div class="mb-2"><h6 class="mb-0">DID (Delivery / Installation)</h6></div>
                <div v-for="(item, idx) in form.quotationDids" :key="'d-'+idx" class="row g-2 mb-2">
                  <div class="col-md-4">
                    <CustomSelect2 v-model="item.priceListLineId" :options="didPriceListLines" :get-option-label="line => line ? ((line.did?.code || '') + ' - ' + (line.did?.name || line.priceList?.name || `Line #${line.id}`)) : ''" :reduce="line => line?.id" searchable clearable placeholder="Pilih DID" />
                  </div>
                  <div class="col-md-2"><input v-model.number="item.quantity" type="number" min="1" class="form-control" placeholder="Qty" /></div>
                  <div class="col-md-2"><input v-model.number="item.price" type="number" min="0" class="form-control" placeholder="Harga" /></div>
                  <div class="col-md-2"><input :value="formatRupiah((Number(item.quantity) || 0) * (Number(item.price) || 0))" type="text" class="form-control" readonly /></div>
                  <div class="col-md-2"><button type="button" class="btn btn-outline-danger w-100" @click="quotationStore.removeDidItem(idx)">Hapus</button></div>
                </div>
                <button type="button" class="btn btn-primary w-100 mt-2" @click="quotationStore.addDidItem(true)">Tambah DID</button>
              </div>
            </div>

                <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <NuxtLink to="/sales/quotation" class="btn btn-outline-secondary">Batal</NuxtLink>
                  <button type="submit" class="btn btn-primary" :disabled="saving"><span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>Simpan</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-xl-4 col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header border-0 bg-transparent px-5 py-4">
              <h5 class="card-title mb-0 d-flex align-items-center">
                <i class="ri-menu-2-line me-2 text-primary"></i>
                Modul Sales
              </h5>
            </div>
            <div class="card-body px-5 pt-0 pb-5">
              <div class="list-group list-group-flush">
                <NuxtLink
                  v-for="item in moduleNavItems"
                  :key="item.to"
                  :to="item.to"
                  class="list-group-item list-group-item-action d-flex align-items-center justify-content-between gap-3"
                  :class="{ active: isModuleNavActive(item.to) }"
                >
                  <span class="d-flex align-items-center gap-2">
                    <i :class="item.icon" class="text-primary"></i>
                    {{ item.label }}
                  </span>
                  <i class="ri-arrow-right-s-line text-muted"></i>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuotationStore } from '~/stores/quotation'
import { useCustomerStore } from '~/stores/customer'
import { useServiceStore } from '~/stores/service'
import CustomSelect2 from '~/components/CustomSelect2.vue'

const route = useRoute()
const formatRupiah = useFormatRupiah()
const quotationStore = useQuotationStore()
const customerStore = useCustomerStore()
const serviceStore = useServiceStore()
const { form, saving, validationErrors, customerProducts } = storeToRefs(quotationStore)
const { customers } = storeToRefs(customerStore)
const { services } = storeToRefs(serviceStore)
const siteInvests = ref<any[]>([])
const sites = ref<any[]>([])
const costCenters = ref<any[]>([])
const units = ref<any[]>([])
const didPriceListLines = ref<any[]>([])

const quotationId = computed(() => {
  const raw = route.params.id
  if (Array.isArray(raw)) return raw[0] ? String(raw[0]) : undefined
  return raw ? String(raw) : undefined
})
const pageTitle = computed(() => (quotationId.value ? 'Edit Quotation' : 'Tambah Quotation'))
const pageSubtitle = computed(() => (quotationId.value ? 'Perbarui data quotation.' : 'Isi form untuk membuat quotation baru.'))
const termsOfPaymentOptions = [{ label: 'Postpaid', value: 'postpaid' }, { label: 'Prepaid', value: 'prepaid' }, { label: 'Down Payment', value: 'down_payment' }]
const moduleNavItems = computed(() => [
  { label: 'Quotation', to: '/sales/quotation', icon: 'ri-file-list-3-line' },
  { label: 'Site Investment', to: '/sales/site-investment', icon: 'ri-building-line' },
  { label: 'Sales Order', to: '/sales/sales-order', icon: 'ri-shopping-bag-3-line' },
  { label: 'Sales Invoice', to: '/sales/sales-invoice', icon: 'ri-receipt-line' },
])

function isModuleNavActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

async function loadMasters() {
  const { $api } = useNuxtApp()
  const [siRes, siteRes, ccRes, unitRes] = await Promise.all([
    fetch(`${$api.siteInvestment()}?page=1&rows=500&status=approved`, { credentials: 'include', headers: { Accept: 'application/json' } }),
    fetch(`${$api.sites()}?page=1&rows=500`, { credentials: 'include', headers: { Accept: 'application/json' } }),
    fetch(`${$api.costCenters()}?page=1&rows=500`, { credentials: 'include', headers: { Accept: 'application/json' } }),
    fetch($api.unit(), { credentials: 'include', headers: { Accept: 'application/json' } }),
  ])
  siteInvests.value = siRes.ok ? ((await siRes.json()).data || []) : []
  sites.value = siteRes.ok ? ((await siteRes.json()).data || []) : []
  costCenters.value = ccRes.ok ? ((await ccRes.json()).data || []) : []
  units.value = unitRes.ok ? ((await unitRes.json()).data || []) : []
  const didRes = await fetch($api.siteInvestmentPriceListLines('did'), { credentials: 'include', headers: { Accept: 'application/json' } })
  if (didRes.ok) {
    const didJson = await didRes.json()
    didPriceListLines.value = Array.isArray(didJson) ? didJson : (didJson.data || [])
  } else didPriceListLines.value = []
}

async function loadForm() {
  quotationStore.closeModal()
  await Promise.all([customerStore.fetchCustomers(), serviceStore.fetchServices(), loadMasters()])
  if (quotationId.value) {
    await quotationStore.fetchQuotationForEdit(quotationId.value)
    quotationStore.showModal = false
  } else {
    quotationStore.openModal(null)
    quotationStore.showModal = false
  }

  // Keep DID tab consistent with Products/Services: always show one row by default.
  if (!Array.isArray(form.value?.quotationDids) || form.value.quotationDids.length === 0) {
    quotationStore.addDidItem(true)
  }
}

async function onSubmit() {
  await quotationStore.saveQuotation({ navigateToList: true })
}

watch(() => form.value?.customerId, async (customerId) => { if (customerId) await quotationStore.fetchProductsForCustomer(customerId) }, { immediate: true })
onMounted(loadForm)
</script>
