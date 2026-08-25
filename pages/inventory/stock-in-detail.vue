<template>
    <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">Detail Stock in</h4>
            <PageBreadcrumb class="mt-1" current-label="Detail Stock in" />
            <p class="mb-6">
            Berikut di bawah ini data detail stock in
            </p>
            <div v-if="loading" class="text-center">
                <ProgressSpinner 
                    style="width: 50px; height: 50px" 
                    strokeWidth="4"
                    fill="transparent"
                    animationDuration="1s"
                />
                <div class="mt-3 text-muted">Memuat data...</div>
            </div>
            <div v-else-if="error" class="alert alert-danger">{{ error.message }}</div>
            <div v-else-if="stockIn" class="row g-6">
                <div class="col-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 class="mb-1">
                                        Detail Stock In
                                    </h5>
                                </div>
                            </div>
                             <div class="row mt-4">
                                <div class="col-md-6">
                                    <ul class="list-unstyled">
                                        <li class="mb-2"><strong>Tanggal:</strong> {{ new Date(stockIn.date).toLocaleDateString() }}</li>
                                        <li class="mb-2"><strong>Gudang:</strong> {{ stockIn.warehouse?.name }}</li>
                                        <li class="mb-2"><strong>No. Purchase Order:</strong> {{ stockIn.purchaseOrder?.noPo || '-' }}</li>
                                        <li class="mb-2"><strong>Status:</strong> <span >{{ stockIn.status }}</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-8">
                    <div class="card mb-4">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h4 class="mb-1">Nomor Stock In: {{ stockIn.noSi }}</h4>
                                    <p class="text-muted mb-0" style="font-size: 0.95em;">
                                        Identifier requirement mengikuti tracking policy produk.
                                    </p>
                                </div>
                                <NuxtLink to="/inventory/stock-in" class="btn btn-sm btn-primary">
                                    <i class="ri-arrow-left-line me-1"></i>
                                </NuxtLink>
                            </div>
                             <div class="row mt-4">
                                <div class="col-md-6">
                                    <ul class="list-unstyled">
                                        <li class="mb-2"><strong>Posted by:</strong> {{ stockIn.postedByUser?.fullName || '-' }}</li>
                                        <li class="mb-2"><strong>Description:</strong> {{ stockIn.description || '-' }}</li>
                                        <li class="mb-2"><strong>Posted At:</strong> {{ stockIn.postedAt ? new Date(stockIn.postedAt).toLocaleDateString() : '-' }}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Daftar Produk</h5>
                        </div>
                         <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable :data="stockIn.stockInDetails || []" :loading="loading">
                                <Column field="product.sku" header="Part Number" :sortable="true"></Column>
                                <Column field="product.name" header="Produk" :sortable="true"></Column>
                                <Column field="description" header="Deskripsi" :sortable="true"></Column>
                                <Column field="quantity" header="Quantity Stock In" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.quantity || 0 }}
                                    </template>
                                </Column>
                                <Column header="Serialized">
                                    <template #body="slotProps">
                                        <span v-if="trackingPolicyOf(slotProps.data.product) === 'NONE'" class="badge bg-label-secondary">Qty only</span>
                                        <span v-else class="badge bg-label-warning">{{ trackingPolicyOf(slotProps.data.product) }}</span>
                                    </template>
                                </Column>
                                <Column header="Serials">
                                    <template #body="slotProps">
                                        <template v-if="needsIdentifierCapture(slotProps.data.product)">
                                          Required: {{ Number(slotProps.data.quantity) || 0 }}
                                          / Captured: {{ (slotProps.data.serials || []).length }}
                                        </template>
                                        <span v-else class="text-muted">—</span>
                                    </template>
                                </Column>
                            </MyDataTable>
                        </div>
                    </div>
                </div>

                <div
                  v-for="detail in deviceDetails"
                  :id="detail.id === deviceDetails[0]?.id ? 'serial-capture' : undefined"
                  :key="detail.id"
                  class="col-12"
                >
                  <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h5 class="card-title mb-0">
                          {{ identifierCardTitle(detail.product) }} — {{ detail.product?.sku }}
                        </h5>
                        <small class="text-muted">
                          Required: {{ Number(detail.quantity) || 0 }} · Captured: {{ (serialDrafts[detail.id] || []).length }}
                        </small>
                        <div
                          v-if="trackingPolicyOf(detail.product) === 'DEFERRED_COMPONENT_SERIAL'"
                          class="small text-info mt-1"
                        >
                          Kit identifier lengkap; serial komponen akan dilengkapi saat unboxing
                        </div>
                      </div>
                      <button
                        v-if="canEditSerials"
                        class="btn btn-sm btn-primary"
                        :disabled="savingDetailId === detail.id"
                        @click="saveSerials(detail)"
                      >
                        {{ savingDetailId === detail.id ? 'Saving...' : 'Save Serials' }}
                      </button>
                    </div>
                    <div class="card-body table-responsive">
                      <table class="table table-sm">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th v-if="showUnitSerialField(detail.product)">Serial Number</th>
                            <th>UTID</th>
                            <th>Kit Number</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(row, idx) in (serialDrafts[detail.id] || [])" :key="idx">
                            <td>{{ idx + 1 }}</td>
                            <td v-if="showUnitSerialField(detail.product)">
                              <input
                                v-model="row.serialNumber"
                                class="form-control form-control-sm"
                                :readonly="!canEditSerials"
                              />
                            </td>
                            <td>
                              <input
                                v-model="row.utid"
                                class="form-control form-control-sm"
                                :readonly="!canEditSerials"
                              />
                            </td>
                            <td>
                              <input
                                v-model="row.kitNumber"
                                class="form-control form-control-sm"
                                :readonly="!canEditSerials"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <p v-if="!canEditSerials" class="small text-muted mb-0">
                        Post-receipt identity correction is deferred (admin-controlled). Serials are not editable after posting.
                      </p>
                      <p
                        v-else-if="(serialDrafts[detail.id] || []).length !== Number(detail.quantity)"
                        class="small text-danger mb-0"
                      >
                        Jumlah identifier tidak sesuai quantity — post akan ditolak sampai Required = Captured.
                      </p>
                    </div>
                  </div>
                </div>
            </div>
            <div v-else class="alert alert-danger" role="alert">
                Stock In tidak ditemukan.
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
  hidePageHeading: true,
})

import { onMounted, onBeforeUnmount, computed, reactive, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Column from 'primevue/column'
import { useStockStore } from '~/stores/stockin'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { getApiErrorMessage } from '~/utils/apiError'

const { setDetailTitle } = useDynamicTitle()
const { userHasPermission, userHasRole } = usePermissions()
const { $api } = useNuxtApp()
const toast = useToast()

const route = useRoute()
const stockInStore = useStockStore()
const { selectedStockIn: stockIn, loading, error } = storeToRefs(stockInStore)
const serialDrafts = reactive({})
const savingDetailId = ref(null)

function isDeviceProduct(product) {
  return !!(product?.isDevice ?? product?.is_device)
}

function trackingPolicyOf(product) {
  return product?.trackingPolicy || product?.tracking_policy || (isDeviceProduct(product) ? 'UNIT_SERIAL' : 'NONE')
}

function needsIdentifierCapture(product) {
  return trackingPolicyOf(product) !== 'NONE'
}

function showUnitSerialField(product) {
  const policy = trackingPolicyOf(product)
  return policy === 'UNIT_SERIAL' || policy === 'KIT_SERIAL'
}

function identifierCardTitle(product) {
  const policy = trackingPolicyOf(product)
  if (policy === 'DEFERRED_COMPONENT_SERIAL') return 'Kit / UTID'
  if (policy === 'KIT_SERIAL') return 'Kit Identifier'
  return 'Serial / Equipment Units'
}

const canEditSerials = computed(() => {
  if (stockIn.value?.status !== 'draft') return false
  return (
    userHasRole('superadmin') ||
    userHasRole('admin') ||
    userHasPermission('capture_equipment_serial') ||
    userHasPermission('approve_stock_in') ||
    userHasPermission('edit_stock_in')
  )
})

const deviceDetails = computed(() =>
  (stockIn.value?.stockInDetails || stockIn.value?.stock_in_details || []).filter((d) =>
    needsIdentifierCapture(d.product)
  )
)

function syncDraftsFromStockIn() {
  const details = stockIn.value?.stockInDetails || stockIn.value?.stock_in_details || []
  for (const detail of details) {
    if (!needsIdentifierCapture(detail.product)) continue
    const qty = Number(detail.quantity) || 0
    const existing = detail.serials || []
    const rows = []
    for (let i = 0; i < qty; i++) {
      const src = existing[i] || {}
      rows.push({
        serialNumber: src.serialNumber || src.serial_number || '',
        utid: src.utid || '',
        kitNumber: src.kitNumber || src.kit_number || '',
      })
    }
    serialDrafts[detail.id] = rows
  }
}

watch(stockIn, () => syncDraftsFromStockIn(), { immediate: true })

async function saveSerials(detail) {
  savingDetailId.value = detail.id
  try {
    await $fetch($api.stockInSerials(stockIn.value.id, detail.id), {
      method: 'PUT',
      credentials: 'include',
      body: { serials: serialDrafts[detail.id] || [] },
    })
    toast.success({
      title: 'Berhasil',
      message: 'Serial tersimpan (draft)',
      color: 'green',
      position: 'bottomRight',
    })
    await stockInStore.fetchStockInById(stockIn.value.id)
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal simpan serial'),
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    savingDetailId.value = null
  }
}

function scrollToSerialCapture() {
  if (route.query.focus !== 'serials') return
  nextTick(() => {
    document.getElementById('serial-capture')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

onMounted(async () => {
  const stockInId = route.query.id;
  if (stockInId) {
    try {
      await stockInStore.fetchStockInById(stockInId);
      setDetailTitle('Stock In', stockIn.value.noSi)
      scrollToSerialCapture()
    } catch (e) {
      toast.error({
        title: 'Error',
        message: getApiErrorMessage(e, 'Gagal memuat detail stock in.'),
        color: 'red',
        position: 'bottomRight',
      })
    }
  } else {
    toast.error({
      title: 'Error',
      message: 'ID Stock In tidak ditemukan di URL.',
      color: 'red',
      position: 'bottomRight',
    })
  }
});

onBeforeUnmount(() => {
    stockInStore.resetStockIn();
});
</script>
