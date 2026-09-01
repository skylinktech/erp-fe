<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 pb-5">
      <div class="d-flex align-items-center gap-2 mb-4">
        <NuxtLink :to="`/operations/request-dismantle/detail/${requestId}`" class="btn btn-outline-secondary btn-sm">
          <i class="ri-arrow-left-line"></i>
        </NuxtLink>
        <div>
          <h5 class="mb-0">Warehouse Receipt</h5>
          <small class="text-muted">{{ selected?.requestNumber }}</small>
        </div>
      </div>

      <div v-if="loadingDetail" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

      <div v-else class="row g-3">
        <div v-for="eq in receiptEquipment" :key="eq.id" class="col-12 col-lg-6">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <h6 class="mb-0">{{ eq.equipmentNo }}</h6>
                <span class="badge bg-label-warning">In Transit</span>
              </div>
              <p class="small text-muted mb-3">Expected: {{ eq.serialNumber || '—' }}</p>
              <div class="mb-2">
                <label class="form-label">Warehouse <span class="text-danger">*</span></label>
                <CustomSelect2
                  v-model="forms[eq.id].destinationWarehouseId"
                  :options="warehouseOptions"
                  :get-option-label="(o) => o.label"
                  :reduce="(o) => o.value"
                  searchable
                  @search="searchWarehouses"
                />
              </div>
              <div class="mb-2">
                <label class="form-label">Actual Serial</label>
                <input v-model="forms[eq.id].actualSerial" class="form-control form-control-sm" />
              </div>
              <div class="mb-3">
                <label class="form-label">Received Condition</label>
                <input v-model="forms[eq.id].receivedCondition" class="form-control form-control-sm" />
              </div>
              <button
                type="button"
                class="btn btn-primary w-100"
                :disabled="receivingEquipment || !!eq.warehouseReceivedAt"
                @click="submitReceipt(eq)"
              >
                {{ eq.warehouseReceivedAt ? 'Sudah diterima' : 'Confirm Receipt' }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="!receiptEquipment.length" class="col-12">
          <div class="alert alert-info mb-0">Tidak ada equipment company-owned in-transit untuk warehouse receipt.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRequestDismantleStore } from '~/stores/request-dismantle'
import { apiFetch } from '~/utils/apiFetch'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import type { DismantleRequestEquipment } from '~/types/operations/dismantle'

definePageMeta({ middleware: ['auth', 'check-permission'], title: 'Dismantle Receive', hidePageHeading: true })

const route = useRoute()
const { $api } = useNuxtApp()
const store = useRequestDismantleStore()
const { selected, loadingDetail, receivingEquipment } = storeToRefs(store)

const warehouseOptions = ref<{ label: string; value: number }[]>([])
const forms = reactive<Record<string, { destinationWarehouseId: number | null; actualSerial: string; receivedCondition: string }>>({})

const requestId = computed(() => String(route.params.id))

const receiptEquipment = computed(() =>
  (selected.value?.services?.flatMap((s) => s.equipments) ?? []).filter(
    (e) =>
      e.ownershipType === 'COMPANY_OWNED' &&
      e.expectedToReturn &&
      e.dismantledAt &&
      !e.warehouseReceivedAt
  )
)

function ensureForms() {
  for (const eq of receiptEquipment.value) {
    if (!forms[eq.id]) {
      forms[eq.id] = {
        destinationWarehouseId: selected.value?.destinationWarehouseId ?? null,
        actualSerial: '',
        receivedCondition: '',
      }
    }
  }
}

async function searchWarehouses(term: string) {
  const res = await apiFetch<{ data: Array<{ id: number; name: string }> }>(`${$api.dataWarehouse()}?search=${encodeURIComponent(term || '')}`)
  warehouseOptions.value = (res?.data ?? []).map((w) => ({ label: w.name, value: w.id }))
}

async function submitReceipt(eq: DismantleRequestEquipment) {
  const f = forms[eq.id]
  if (!f.destinationWarehouseId) {
    useToast().error({ title: 'Validasi', message: 'Warehouse tujuan wajib dipilih', color: 'red', position: 'bottomRight', layout: 2 })
    return
  }
  if (!eq.equipmentWithdrawalId) {
    useToast().error({ title: 'Blocker', message: 'Withdrawal ID tidak tersedia', color: 'red', position: 'bottomRight', layout: 2 })
    return
  }
  await store.warehouseReceipt(requestId.value, eq.id, {
    withdrawalId: eq.equipmentWithdrawalId,
    destinationWarehouseId: f.destinationWarehouseId,
    actualSerial: f.actualSerial || undefined,
    receivedCondition: f.receivedCondition || undefined,
  })
}

onMounted(async () => {
  await store.fetchDetail(requestId.value)
  ensureForms()
  await searchWarehouses('')
})
</script>
