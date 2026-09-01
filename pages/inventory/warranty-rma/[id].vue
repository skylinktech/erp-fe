<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">Warranty RMA {{ row?.rmaNo }}</h4>
          <p class="mb-0 text-muted">Ship → resolution → physical receive (return or provider replacement).</p>
        </div>
        <NuxtLink to="/inventory/warranty?tab=rma" class="btn btn-outline-secondary btn-sm">RMA List</NuxtLink>
      </div>

      <div v-if="loading" class="text-muted">Loading...</div>
      <div v-else-if="row" class="card">
        <div class="card-body">
          <ul class="list-unstyled mb-4">
            <li class="mb-2"><strong>Status:</strong> {{ row.status }}</li>
            <li class="mb-2">
              <strong>Equipment:</strong>
              {{ row.equipment?.equipmentNo }} / {{ row.equipment?.serialNumber }}
              <span v-if="row.equipment?.status" class="text-muted">({{ row.equipment.status }})</span>
            </li>
            <li class="mb-2"><strong>Provider:</strong> {{ row.provider?.name }}</li>
            <li class="mb-2"><strong>Source WH:</strong> {{ row.sourceWarehouse?.code }}</li>
            <li class="mb-2"><strong>Claim:</strong> {{ row.claim?.claimNo }}</li>
            <li class="mb-2"><strong>Carrier:</strong> {{ row.carrier || '—' }}</li>
            <li class="mb-2"><strong>Tracking:</strong> {{ row.trackingNumber || '—' }}</li>
            <li class="mb-2"><strong>RMA_SHIP:</strong> {{ row.rmaShipMovementId || '—' }}</li>
            <li class="mb-2"><strong>Resolution:</strong> {{ row.resolutionType || '—' }}</li>
            <li class="mb-2"><strong>RMA_RETURN:</strong> {{ row.rmaReturnMovementId || '—' }}</li>
            <li class="mb-2">
              <strong>Provider replacement EQ:</strong>
              <template v-if="row.providerReplacementEquipment">
                {{ row.providerReplacementEquipment.equipmentNo }} /
                {{ row.providerReplacementEquipment.serialNumber }}
              </template>
              <template v-else>—</template>
            </li>
            <li class="mb-2"><strong>RMA_REPLACEMENT_RECEIPT:</strong> {{ row.rmaReplacementReceiptMovementId || '—' }}</li>
          </ul>

          <button
            v-if="['AUTHORIZED','READY_TO_SHIP'].includes(row.status) && canShip"
            class="btn btn-danger me-2"
            :disabled="saving"
            @click="ship"
          >
            {{ saving ? 'Shipping...' : 'Ship to Warranty Provider' }}
          </button>

          <div
            v-if="['SHIPPED_TO_PROVIDER','RESOLUTION_RECORDED'].includes(row.status)"
            class="border-top pt-3 mt-3"
          >
            <h6 class="mb-3">Record Provider Resolution</h6>
            <div class="row g-2 align-items-end mb-3">
              <div class="col-md-5">
                <label class="form-label">Resolution type</label>
                <select v-model="resolutionType" class="form-select" :disabled="!!row.resolutionType">
                  <option value="">— select —</option>
                  <option v-for="o in resolutionOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <button
                  v-if="canResolve && !row.resolutionType"
                  class="btn btn-primary"
                  :disabled="saving || !resolutionType"
                  @click="recordResolution"
                >
                  Save Resolution
                </button>
              </div>
            </div>

            <div
              v-if="isOriginalReturnType && canReceiveReturn"
              class="border rounded p-3 mb-3"
            >
              <h6 class="mb-2">Receive Original Equipment (RMA_RETURN)</h6>
              <div class="row g-2 align-items-end">
                <div class="col-md-4">
                  <label class="form-label">Destination Warehouse</label>
                  <CustomSelect2
                    v-model="destinationWarehouseId"
                    :options="warehouses"
                    :get-option-label="(o) => `${o.code} — ${o.name}`"
                    :reduce="(o) => o.id"
                    searchable
                    clearable
                    placeholder="Warehouse"
                  />
                </div>
                <div class="col-md-3">
                  <button class="btn btn-success" :disabled="saving || !destinationWarehouseId" @click="receiveOriginal">
                    Receive Original
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="isProviderReplacement && canReceiveReplacement"
              class="border rounded p-3"
            >
              <h6 class="mb-2">Receive Provider Replacement (new serial)</h6>
              <div class="row g-2 mb-2">
                <div class="col-md-3">
                  <label class="form-label">Serial *</label>
                  <input v-model="repl.serialNumber" class="form-control" />
                </div>
                <div class="col-md-2">
                  <label class="form-label">UTID</label>
                  <input v-model="repl.utid" class="form-control" />
                </div>
                <div class="col-md-2">
                  <label class="form-label">Kit Number</label>
                  <input v-model="repl.kitNumber" class="form-control" />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Destination Warehouse *</label>
                  <CustomSelect2
                    v-model="destinationWarehouseId"
                    :options="warehouses"
                    :get-option-label="(o) => `${o.code} — ${o.name}`"
                    :reduce="(o) => o.id"
                    searchable
                    clearable
                    placeholder="Warehouse"
                  />
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button
                    class="btn btn-success w-100"
                    :disabled="saving || !repl.serialNumber || !destinationWarehouseId"
                    @click="receiveReplacement"
                  >
                    Receive
                  </button>
                </div>
              </div>
              <p class="text-muted small mb-0">
                Creates new Equipment identity. Original stays historical (not on-hand). Warranty coverage = needs review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const route = useRoute()
const { $api } = useNuxtApp()
const toast = useToast()
const { userHasPermission, userHasRole } = usePermissions()

const loading = ref(true)
const saving = ref(false)
const row = ref(null)
const warehouses = ref([])
const resolutionType = ref('')
const destinationWarehouseId = ref(null)
const repl = reactive({ serialNumber: '', utid: '', kitNumber: '' })

const resolutionOptions = [
  { value: 'ORIGINAL_UNIT_REPAIRED', label: 'Original unit repaired' },
  { value: 'ORIGINAL_UNIT_RETURNED_UNREPAIRED', label: 'Original returned unrepaired' },
  { value: 'PROVIDER_REPLACEMENT', label: 'Provider replacement' },
  { value: 'NO_UNIT_RETURN', label: 'No unit return' },
  { value: 'OTHER', label: 'Other' },
]

const canShip = computed(
  () => userHasRole('superadmin') || userHasPermission('ship_warranty_rma')
)
const canResolve = computed(
  () => userHasRole('superadmin') || userHasPermission('record_rma_resolution')
)
const canReceiveReturn = computed(
  () => userHasRole('superadmin') || userHasPermission('receive_rma_return')
)
const canReceiveReplacement = computed(
  () => userHasRole('superadmin') || userHasPermission('receive_rma_replacement')
)

const effectiveResolution = computed(() => row.value?.resolutionType || resolutionType.value)
const isOriginalReturnType = computed(() =>
  ['ORIGINAL_UNIT_REPAIRED', 'ORIGINAL_UNIT_RETURNED_UNREPAIRED', 'OTHER'].includes(
    effectiveResolution.value
  )
)
const isProviderReplacement = computed(
  () => effectiveResolution.value === 'PROVIDER_REPLACEMENT'
)

async function loadWarehouses() {
  try {
    const res = await $fetch($api.warehouses(), { credentials: 'include' })
    warehouses.value = res?.data || res || []
  } catch {
    warehouses.value = []
  }
}

async function load() {
  loading.value = true
  try {
    const res = await $fetch($api.warrantyRmaShow(route.params.id), { credentials: 'include' })
    row.value = res?.data || res
    resolutionType.value = row.value?.resolutionType || ''
    if (row.value?.sourceWarehouseId) {
      destinationWarehouseId.value = row.value.sourceWarehouseId
    }
  } catch (e) {
    row.value = null
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal load RMA'),
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    loading.value = false
  }
}

async function ship() {
  if (!confirm('Confirm RMA_SHIP? On Hand will decrease by 1. Equipment becomes UNDER_RMA.')) return
  saving.value = true
  try {
    const carrier = prompt('Carrier (optional)') || undefined
    const trackingNumber = prompt('Tracking (optional)') || undefined
    await $fetch($api.warrantyRmaShip(route.params.id), {
      method: 'POST',
      credentials: 'include',
      body: { carrier, trackingNumber },
    })
    toast.success({
      title: 'Shipped',
      message: 'RMA_SHIP posted — equipment UNDER_RMA',
      color: 'green',
      position: 'bottomRight',
    })
    await load()
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal ship RMA'),
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    saving.value = false
  }
}

async function recordResolution() {
  saving.value = true
  try {
    await $fetch($api.warrantyRmaResolution(route.params.id), {
      method: 'POST',
      credentials: 'include',
      body: { resolutionType: resolutionType.value },
    })
    toast.success({
      title: 'Resolution recorded',
      message: resolutionType.value,
      color: 'green',
      position: 'bottomRight',
    })
    await load()
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal record resolution'),
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    saving.value = false
  }
}

async function receiveOriginal() {
  if (!confirm('Post RMA_RETURN? Stock +1. Equipment → UNDER_INSPECTION.')) return
  saving.value = true
  try {
    await $fetch($api.warrantyRmaReceiveOriginal(route.params.id), {
      method: 'POST',
      credentials: 'include',
      body: { destinationWarehouseId: destinationWarehouseId.value },
    })
    toast.success({
      title: 'Received',
      message: 'RMA_RETURN posted',
      color: 'green',
      position: 'bottomRight',
    })
    await load()
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal receive original'),
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    saving.value = false
  }
}

async function receiveReplacement() {
  if (!confirm('Post RMA_REPLACEMENT_RECEIPT? Creates new Equipment. Stock +1.')) return
  saving.value = true
  try {
    await $fetch($api.warrantyRmaReceiveReplacement(route.params.id), {
      method: 'POST',
      credentials: 'include',
      body: {
        serialNumber: repl.serialNumber,
        utid: repl.utid || undefined,
        kitNumber: repl.kitNumber || undefined,
        destinationWarehouseId: destinationWarehouseId.value,
        productId: row.value?.equipment?.productId,
      },
    })
    toast.success({
      title: 'Replacement received',
      message: 'New equipment UNDER_INSPECTION — warranty needs review',
      color: 'green',
      position: 'bottomRight',
    })
    await load()
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal receive replacement'),
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadWarehouses()
  await load()
})
</script>
