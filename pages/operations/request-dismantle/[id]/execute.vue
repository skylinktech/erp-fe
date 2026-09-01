<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 pb-5">
      <div class="sticky-top bg-body pt-2 pb-3 mb-3 border-bottom" style="z-index: 1020; top: 0">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <NuxtLink :to="`/operations/request-dismantle/detail/${requestId}`" class="btn btn-sm btn-outline-secondary mb-1">
              <i class="ri-arrow-left-line"></i>
            </NuxtLink>
            <h5 class="mb-0">{{ selected?.requestNumber }}</h5>
            <small class="text-muted">{{ selected?.customer?.name }} · {{ selected?.site?.name }}</small>
          </div>
          <DismantleRecoveryProgress v-if="recoverySummary" :recovery="recoverySummary" />
        </div>
        <div v-if="!online" class="alert alert-warning py-2 mt-2 mb-0 small">Koneksi tidak tersedia — tindakan disimpan mungkin gagal.</div>
      </div>

      <div v-if="loadingDetail" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

      <div v-else class="row g-3">
        <div v-for="eq in companyEquipment" :key="eq.id" class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-title">{{ eq.equipmentNo }}</h6>
              <p class="small mb-2">{{ eq.serialNumber || '—' }} · {{ eq.ownershipType }}</p>
              <div class="mb-2">
                <label class="form-label">Found Status</label>
                <select v-model="forms[eq.id].foundStatus" class="form-select form-select-sm">
                  <option v-for="o in foundOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </div>
              <div class="mb-2">
                <label class="form-label">Actual Serial</label>
                <input v-model="forms[eq.id].actualSerial" class="form-control form-control-sm" />
              </div>
              <div class="mb-2">
                <label class="form-label">Kondisi</label>
                <input v-model="forms[eq.id].physicalCondition" class="form-control form-control-sm" />
              </div>
              <div class="mb-3">
                <label class="form-label">Catatan</label>
                <textarea v-model="forms[eq.id].notes" class="form-control form-control-sm" rows="2"></textarea>
              </div>
              <button
                type="button"
                class="btn btn-primary w-100"
                :disabled="executingEquipment || eq.dismantledAt"
                @click="submitRemoval(eq)"
              >
                <span v-if="executingEquipment" class="spinner-border spinner-border-sm me-1"></span>
                {{ eq.dismantledAt ? 'Sudah di-remove' : 'Physical Removal' }}
              </button>
            </div>
          </div>
        </div>

        <div v-for="eq in customerEquipment" :key="`cust-${eq.id}`" class="col-12 col-md-6">
          <div class="card border-info h-100">
            <div class="card-body">
              <h6 class="card-title">Customer Handover — {{ eq.equipmentNo }}</h6>
              <label class="form-label small">Bukti CUSTOMER_HANDOVER (wajib)</label>
              <select v-model="handoverForms[eq.id].attachmentId" class="form-select form-select-sm mb-2">
                <option value="">— Pilih evidence —</option>
                <option
                  v-for="att in handoverEvidenceOptions(eq.id)"
                  :key="att.id"
                  :value="att.id"
                >
                  {{ att.originalFileName }} ({{ att.status }})
                </option>
              </select>
              <input v-model="handoverForms[eq.id].receivedBy" class="form-control form-control-sm mb-2" placeholder="PIC penerima" />
              <input v-model="handoverForms[eq.id].documentRef" class="form-control form-control-sm mb-2" placeholder="Referensi dokumen" />
              <textarea v-model="handoverForms[eq.id].notes" class="form-control form-control-sm mb-2" rows="2" placeholder="Catatan"></textarea>
              <button
                type="button"
                class="btn btn-outline-info w-100"
                :disabled="receivingEquipment || !handoverForms[eq.id].attachmentId"
                @click="submitHandover(eq)"
              >
                Confirm Handover
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOnline } from '@vueuse/core'
import { useRequestDismantleStore } from '~/stores/request-dismantle'
import { FOUND_STATUS_OPTIONS } from '~/utils/dismantleLabels'
import DismantleRecoveryProgress from '~/components/dismantle/DismantleRecoveryProgress.vue'
import type { DismantleRequestEquipment } from '~/types/operations/dismantle'

definePageMeta({ middleware: ['auth', 'check-permission'], title: 'Dismantle Execute', hidePageHeading: true })

const route = useRoute()
const store = useRequestDismantleStore()
const online = useOnline()
const { selected, loadingDetail, executingEquipment, receivingEquipment, recoverySummary, attachments } = storeToRefs(store)

const requestId = computed(() => String(route.params.id))
const foundOptions = FOUND_STATUS_OPTIONS

const allEquipment = computed(() => selected.value?.services?.flatMap((s) => s.equipments) ?? [])
const companyEquipment = computed(() =>
  allEquipment.value.filter((e) => e.expectedToReturn && e.ownershipType === 'COMPANY_OWNED')
)
const customerEquipment = computed(() =>
  allEquipment.value.filter((e) => e.ownershipType === 'CUSTOMER_OWNED')
)

const forms = reactive<Record<string, { foundStatus: string; actualSerial: string; physicalCondition: string; notes: string }>>({})
const handoverForms = reactive<Record<string, { attachmentId: string; receivedBy: string; documentRef: string; notes: string }>>({})

function handoverEvidenceOptions(equipmentLineId: string) {
  return attachments.value.filter(
    (a) =>
      a.status === 'ACTIVE' &&
      a.attachmentType === 'CUSTOMER_HANDOVER' &&
      (!a.equipmentLineId || a.equipmentLineId === equipmentLineId)
  )
}

function ensureForms() {
  for (const eq of allEquipment.value) {
    if (!forms[eq.id]) {
      forms[eq.id] = { foundStatus: 'FOUND', actualSerial: '', physicalCondition: '', notes: '' }
    }
    if (!handoverForms[eq.id]) {
      handoverForms[eq.id] = { attachmentId: '', receivedBy: '', documentRef: '', notes: '' }
    }
  }
}

async function submitRemoval(eq: DismantleRequestEquipment) {
  if (!eq.equipmentWithdrawalId) {
    useToast().error({ title: 'Blocker', message: 'Withdrawal ID belum tersedia dari backend', color: 'red', position: 'bottomRight', layout: 2 })
    return
  }
  const f = forms[eq.id]
  await store.physicalRemoval(requestId.value, eq.id, {
    withdrawalId: eq.equipmentWithdrawalId,
    foundStatus: f.foundStatus as DismantleRequestEquipment['foundStatus'],
    actualSerial: f.actualSerial || undefined,
    physicalCondition: f.physicalCondition || undefined,
    notes: f.notes || undefined,
  })
}

async function submitHandover(eq: DismantleRequestEquipment) {
  const f = handoverForms[eq.id]
  if (!f.attachmentId) {
    useToast().error({
      title: 'Blocker',
      message: 'Pilih bukti CUSTOMER_HANDOVER terlebih dahulu',
      color: 'red',
      position: 'bottomRight',
      layout: 2,
    })
    return
  }
  await store.customerHandover(requestId.value, eq.id, {
    attachmentId: f.attachmentId,
    receivedBy: f.receivedBy || undefined,
    documentRef: f.documentRef || undefined,
    notes: f.notes || undefined,
  })
}

onMounted(async () => {
  await store.fetchDetail(requestId.value)
  await store.fetchRecoverySummary(requestId.value)
  await store.fetchAttachments(requestId.value)
  ensureForms()
})
</script>
