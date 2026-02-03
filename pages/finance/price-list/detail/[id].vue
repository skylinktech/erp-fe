<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container p-y">
        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat detail Price List...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !priceList" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/finance/price-list" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="priceList">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/finance/price-list" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ priceList.name || '—' }}</h4>
                <small class="text-muted">ID: {{ priceList.id }}</small>
              </div>
              <span :class="priceList.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                {{ priceList.isActive ? 'Aktif' : 'Nonaktif' }}
              </span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button v-if="userHasRole('superadmin') || userHasPermission('edit_price_list')" class="btn btn-outline-secondary btn-sm" @click="navigateTo(`/finance/price-list?edit=${priceList.id}`)">
                <i class="ri-edit-box-line me-1"></i> Edit
              </button>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-xl-8 col-12">
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-information-line me-2 text-primary"></i>
                    Informasi Price List
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Nama</label>
                      <p class="mb-0 fw-medium">{{ priceList.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Tipe</label>
                      <p class="mb-0">{{ getTypeLabel(priceList.type) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Berlaku Dari</label>
                      <p class="mb-0">{{ formatDate(priceList.validFrom) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Berlaku Sampai</label>
                      <p class="mb-0">{{ priceList.validTo ? formatDate(priceList.validTo) : 'Tidak terbatas' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Dibuat</label>
                      <p class="mb-0">{{ formatDate(priceList.createdAt) }}</p>
                    </div>
                    <div class="col-12" v-if="priceList.description">
                      <label class="form-label text-muted medium">Catatan</label>
                      <p class="mb-0 text-break">{{ priceList.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lines -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-list-check me-2 text-primary"></i>
                    Item Lines
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-if="!(priceList.lines && priceList.lines.length)" class="text-muted text-center py-4">Tidak ada item</div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Tipe</th>
                          <th>Item</th>
                          <th>Jenis Harga</th>
                          <th>Billing</th>
                          <th>Tipe Service</th>
                          <th class="text-center">Qty</th>
                          <th class="text-end">Harga</th>
                          <th class="text-end">Subtotal</th>
                          <th class="text-end">Terminal Kit</th>
                          <th class="text-end">Quota Priority</th>
                          <th class="text-end">New Service Line</th>
                          <th class="text-end">Additional Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(line, idx) in priceList.lines" :key="line.id || idx">
                          <td>
                            <span class="badge" :class="getPriceableTypeBadge(line.priceableType)">
                              {{ getPriceableTypeLabel(line.priceableType) }}
                            </span>
                          </td>
                          <td>{{ getLineItemName(line) }}</td>
                          <td>
                            <span v-if="line.priceType && line.priceType !== 'default'" class="badge bg-light text-dark">
                              {{ getPriceTypeLabel(line.priceType) }}
                            </span>
                            <span v-else class="text-muted">{{ getPriceTypeLabel(line.priceType || 'default') }}</span>
                          </td>
                          <td>
                            {{ line.billingType === 'one_time' ? 'One Time' : 'Recurring' }}
                            <span v-if="line.billingCycle" class="text-muted">
                              ({{ getBillingCycleLabel(line.billingCycle) }})
                            </span>
                          </td>
                          <td class="text-muted">{{ line.service?.servicePlan?.serviceType?.name || '—' }}</td>
                          <td class="text-center">{{ line.quantity || 0 }}</td>
                          <td class="text-end">{{ formatRupiah(line.price) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah(line.subtotal) }}</td>
                          <td class="text-end text-muted">{{ line.terminalKitCount != null ? line.terminalKitCount : '—' }}</td>
                          <td class="text-end text-muted">{{ line.quotaPriority != null ? line.quotaPriority : '—' }}</td>
                          <td class="text-end text-muted">{{ line.newServiceLine != null ? formatRupiah(line.newServiceLine) : '—' }}</td>
                          <td class="text-end text-muted">{{ line.additionalData != null ? formatRupiah(line.additionalData) : '—' }}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="10" class="text-end fw-bold">Total:</td>
                          <td class="text-end fw-bold">{{ formatRupiah(calculateTotal()) }}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-4 col-12">
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-pie-chart-2-line me-2 text-primary"></i>
                    Ringkasan
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Total Items</label>
                    <p class="mb-0 fw-medium">{{ (priceList.lines && priceList.lines.length) || 0 }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Total Produk</label>
                    <p class="mb-0 fw-medium">{{ countByType('product') }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Total Service</label>
                    <p class="mb-0 fw-medium">{{ countByType('service') }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Total DID</label>
                    <p class="mb-0 fw-medium">{{ countByType('did') }}</p>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Total Nilai</label>
                    <p class="mb-0 fw-bold text-primary">{{ formatRupiah(calculateTotal()) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { usePermissions } from '~/composables/usePermissions'
import { useFormatRupiah } from '~/composables/formatRupiah'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const route = useRoute()
const { $api } = useNuxtApp()
const { userHasPermission, userHasRole } = usePermissions()
const formatRupiah = useFormatRupiah()
const { setListTitle } = useDynamicTitle()

const id = route.params.id
const loading = ref(true)
const error = ref(null)
const priceList = ref(null)

const formatDate = (d) => {
  if (!d) return '-'
  const dt = new Date(d)
  return dt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

function getTypeLabel(type) {
  if (type === 'site_investment') return 'Site Investment'
  if (type === 'walk_in') return 'Walk In'
  if (type === 'promo') return 'Promo'
  if (type === 'starlink') return 'Starlink'
  if (type === 'skylink') return 'Skylink'
  return type
}

function getPriceableTypeLabel(type) {
  if (type === 'product') return 'Produk'
  if (type === 'service') return 'Service'
  if (type === 'did') return 'DID'
  return type
}

function getPriceableTypeBadge(type) {
  if (type === 'product') return 'bg-primary'
  if (type === 'service') return 'bg-info'
  if (type === 'did') return 'bg-warning'
  return 'bg-secondary'
}

function getBillingCycleLabel(cycle) {
  if (cycle === 'monthly') return 'Bulanan'
  if (cycle === 'quarterly') return 'Triwulan'
  if (cycle === 'semi_annually') return 'Semesteran'
  if (cycle === 'yearly') return 'Tahunan'
  return cycle
}

function getPriceTypeLabel(priceType) {
  if (priceType === 'default') return 'Default'
  if (priceType === 'starlink') return 'Starlink'
  if (priceType === 'skylink') return 'Skylink'
  if (priceType === 'terminal_access_charge') return 'Terminal Access Charge'
  if (priceType === 'open_service_line') return 'Open Service Line'
  if (priceType === 'additional_data') return 'Additional Data'
  return priceType
}

function getLineItemName(line) {
  if (line.priceableType === 'product' && line.product) {
    return line.product.name || '-'
  }
  if (line.priceableType === 'service' && line.service) {
    return line.service.name || '-'
  }
  if (line.priceableType === 'did' && line.did) {
    return `${line.did.code || ''} ${line.did.name ? '- ' + line.did.name : ''}`.trim() || '-'
  }
  return '-'
}

function calculateTotal() {
  if (!priceList.value?.lines) return 0
  return priceList.value.lines.reduce((sum, line) => sum + (line.subtotal || 0), 0)
}

function countByType(type) {
  if (!priceList.value?.lines) return 0
  return priceList.value.lines.filter(line => line.priceableType === type).length
}

async function fetchPriceList() {
  try {
    loading.value = true
    const res = await fetch(`${$api.priceListShow(id)}?includeLines=true`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    const json = await res.json()
    priceList.value = json
    setListTitle(json.name || 'Price List')
  } catch (e) {
    error.value = e
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPriceList()
})

</script>

<style scoped>
.qo-detail-summary .card-body p { margin: 0; }
</style>

