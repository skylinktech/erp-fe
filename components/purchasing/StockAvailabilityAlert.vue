<template>
  <div v-if="resolvedLoading" class="alert alert-secondary d-flex align-items-center gap-2 mb-5">
    <span class="spinner-border spinner-border-sm" role="status"></span>
    <span>Memeriksa ketersediaan stok…</span>
  </div>

  <div v-else-if="errorMessage" class="alert alert-danger mb-5">
    <i class="ri-error-warning-line me-2"></i>{{ errorMessage }}
  </div>

  <template v-else-if="resolvedResult">
    <div v-if="showWarningAlert" class="alert alert-warning mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="ri-alert-line fs-5"></i>
            <strong>Stok tidak mencukupi</strong>
          </div>
          <p class="mb-2 small">{{ summaryText }}</p>
          <ul v-if="shortageList.length" class="mb-0 ps-3 small">
            <li v-for="(line, i) in shortageList" :key="line.itemId ?? `${line.productId}-${i}`">
              <span class="fw-medium">{{ line.productSku ? `${line.productSku} — ` : '' }}{{ line.productName }}</span>
              <span v-if="line.warehouseName" class="text-muted"> ({{ line.warehouseName }})</span>
              — {{ line.message || 'Stok kosong' }}
            </li>
          </ul>
        </div>
        <button
          v-if="showCreatePoButton && canCreatePo"
          type="button"
          class="btn btn-primary btn-sm flex-shrink-0"
          @click="onCreatePoClick"
        >
          <i class="ri-shopping-cart-line me-1"></i>Tambah PO
        </button>
      </div>
    </div>

    <div v-else-if="showSuccessAlert" class="alert alert-success mb-4">
      <div class="d-flex align-items-center gap-2">
        <i class="ri-checkbox-circle-line fs-5"></i>
        <div>
          <strong>Stok mencukupi</strong>
          <p class="mb-0 small">{{ summaryText }}</p>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-secondary mb-4">
      <i class="ri-information-line me-2"></i>
      <span class="small">Tidak ada item produk dengan gudang untuk dicek ketersediaan stok.</span>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, unref, watch } from 'vue'
import type { StockAvailabilityResult } from '~/types/purchasing/stock-availability'
import { shortageLines, stockAvailabilitySummary } from '~/utils/purchasing/stockAvailability'

const props = withDefaults(
  defineProps<{
    result: StockAvailabilityResult | null
    loading?: boolean
    error?: string | null
    showCreatePoButton?: boolean
    purchaseRequestId?: string | number | null
    notifyOnSufficient?: boolean
  }>(),
  {
    loading: false,
    error: null,
    showCreatePoButton: false,
    purchaseRequestId: null,
    notifyOnSufficient: true,
  }
)

const emit = defineEmits<{
  createPo: [purchaseRequestId: string | number]
}>()

const { userHasPermission, userHasRole } = usePermissions()
const toast = useToast()

const canCreatePo = computed(
  () => userHasRole('superadmin') || userHasPermission('create_purchase_order')
)

const resolvedResult = computed(() => unref(props.result) as StockAvailabilityResult | null)
const resolvedLoading = computed(() => !!unref(props.loading))
const errorMessage = computed((): string | null => {
  const err = unref(props.error)
  if (err == null || err === '') return null
  if (typeof err === 'string') return err
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = (err as { message?: unknown }).message
    return typeof msg === 'string' ? msg : 'Gagal memeriksa stok'
  }
  return 'Gagal memeriksa stok'
})

const shortageList = computed(() => {
  const r = resolvedResult.value
  if (!r?.lines?.length) return []
  const short = shortageLines(r)
  const skipped = (r.lines ?? []).filter((l) => l.status === 'skipped' && l.productId)
  return [...short, ...skipped]
})

const showWarningAlert = computed(() => {
  const r = resolvedResult.value
  if (!r) return false
  if (r.hasShortage) return true
  return shortageList.value.length > 0
})

const showSuccessAlert = computed(() => {
  const r = resolvedResult.value
  if (!r || showWarningAlert.value) return false
  return !!r.allSufficient && !!r.hasStockableItems
})

const summaryText = computed(() => stockAvailabilitySummary(resolvedResult.value))

const successToastShown = ref(false)

watch(
  () => resolvedResult.value?.allSufficient,
  (sufficient) => {
    if (
      !props.notifyOnSufficient ||
      !sufficient ||
      !resolvedResult.value?.hasStockableItems ||
      successToastShown.value
    ) {
      return
    }
    successToastShown.value = true
    toast.success({
      title: 'Stok mencukupi',
      message: stockAvailabilitySummary(resolvedResult.value),
      color: 'green',
      position: 'topRight',
      layout: 2,
    })
  },
  { immediate: true }
)

function onCreatePoClick() {
  const id = props.purchaseRequestId
  if (!id) return
  emit('createPo', id)
  navigateTo({
    path: '/purchasing/purchase-order/form',
    query: { fromPurchaseRequestId: String(id) },
  })
}
</script>
