<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Purchase Return</h4>
      <p class="mb-6">
        Retur pembelian operasional berdasarkan qty yang sudah di-receive (Stock In posted).
        Melewati InventoryPostingService.
      </p>

      <div v-if="actionError" class="alert alert-warning d-flex justify-content-between align-items-start" role="alert">
        <div>
          <strong>Validasi</strong>
          <div class="small mt-1">{{ actionError }}</div>
        </div>
        <button type="button" class="btn-close" aria-label="Close" @click="actionError = ''"></button>
      </div>

      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card">
            <div class="card-header"><strong>Buat Purchase Return</strong></div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Purchase Order</label>
                <CustomSelect2
                  v-model="form.purchaseOrderId"
                  :options="purchaseOrders"
                  :get-option-label="poLabel"
                  :reduce="(o) => o.id"
                  :loading="loadingOptions"
                  searchable
                  clearable
                  placeholder="Pilih PO (status received)"
                  @update:modelValue="onPurchaseOrderChange"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Warehouse</label>
                <CustomSelect2
                  v-model="form.warehouseId"
                  :options="warehouses"
                  :get-option-label="(o) => o.name || o.code || String(o.id)"
                  :reduce="(o) => o.id"
                  searchable
                  clearable
                  placeholder="Pilih warehouse"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Product</label>
                <CustomSelect2
                  v-model="form.productId"
                  :options="products"
                  :get-option-label="productLabel"
                  :reduce="(o) => o.id"
                  :loading="loadingProducts"
                  :disabled="!form.purchaseOrderId"
                  searchable
                  clearable
                  :placeholder="form.purchaseOrderId ? 'Pilih product dari PO' : 'Pilih PO terlebih dahulu'"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Quantity</label>
                <div class="input-group">
                  <input
                    v-model.number="form.quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    class="form-control"
                  />
                  <button class="btn btn-outline-secondary" type="button" @click="checkEligible">
                    Cek Eligible
                  </button>
                </div>
                <small v-if="eligible != null" class="text-muted">Eligible return qty: {{ eligible }}</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Reason</label>
                <input v-model="form.reason" class="form-control" />
              </div>
              <button class="btn btn-primary" :disabled="saving || !canSubmit" @click="createReturn">
                {{ saving ? 'Saving...' : 'Create Draft' }}
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card">
            <div class="card-header d-flex justify-content-between">
              <strong>Daftar Purchase Return</strong>
              <button class="btn btn-sm btn-outline-secondary" @click="loadList">Refresh</button>
            </div>
            <div class="card-body table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>PO</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.id">
                    <td>{{ row.noPrtn }}</td>
                    <td class="text-truncate" style="max-width:140px">{{ poDisplay(row.purchaseOrderId) }}</td>
                    <td><span :class="statusBadge(row.status)">{{ getDocumentStatusLabel(row.status) }}</span></td>
                    <td>
                      <div class="d-inline-block">
                        <a
                          href="javascript:;"
                          class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i class="ri-more-2-fill"></i>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                          <li v-if="row.status === 'draft' || row.status === 'rejected'">
                            <a class="dropdown-item" href="javascript:void(0)" @click="submit(row)">
                              <i class="ri-send-plane-line me-2"></i> Submit
                            </a>
                          </li>
                          <li v-if="canApprove(row)">
                            <a class="dropdown-item" href="javascript:void(0)" @click="approve(row)">
                              <i class="ri-checkbox-circle-line me-2"></i> Approve
                            </a>
                          </li>
                          <li v-if="canReject(row)">
                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="reject(row)">
                              <i class="ri-close-circle-line me-2"></i> Reject
                            </a>
                          </li>
                          <li v-if="row.status === 'approved'">
                            <a
                              class="dropdown-item"
                              href="javascript:void(0)"
                              :title="blocksSelfAction(row.createdBy) ? 'Maker-checker: tidak boleh post dokumen sendiri' : ''"
                              @click="post(row)"
                            >
                              <i class="ri-upload-2-line me-2"></i> Post
                            </a>
                          </li>
                          <li v-if="row.status === 'posted'">
                            <a
                              class="dropdown-item text-danger"
                              href="javascript:void(0)"
                              @click="reverse(row.id)"
                            >
                              <i class="ri-arrow-go-back-line me-2"></i> Reverse
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!rows.length">
                    <td colspan="4" class="text-muted">Belum ada data</td>
                  </tr>
                </tbody>
              </table>
              <p class="small text-muted mb-0 mt-2">
                Approval: submit → workflow approvers. Post tetap maker-checker
                (pembuat ≠ poster, kecuali superadmin).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useMakerChecker } from '~/composables/useMakerChecker'
import { useWorkflowApproval } from '~/composables/useWorkflowApproval'
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api, $apiFetch } = useNuxtApp()
const toast = useToast()
const { blocksSelfAction, selfBlockMessage } = useMakerChecker()
const { canApprove, canReject } = useWorkflowApproval({
  approvePermission: 'approve_purchase_return',
  rejectPermission: 'reject_purchase_return',
})

const purchaseOrders = ref([])
const products = ref([])
const warehouses = ref([])
const rows = ref([])
const eligible = ref(null)
const saving = ref(false)
const loadingOptions = ref(false)
const loadingProducts = ref(false)
const actionError = ref('')

const form = reactive({
  purchaseOrderId: '',
  warehouseId: '',
  productId: null,
  quantity: 1,
  reason: '',
})

const canSubmit = computed(() =>
  Boolean(form.purchaseOrderId && form.warehouseId && form.productId && Number(form.quantity) > 0)
)

const poById = computed(() => {
  const map = new Map()
  for (const po of purchaseOrders.value) map.set(po.id, po)
  return map
})

const statusBadge = (s) => ({
  draft: 'badge bg-label-secondary',
  pending: 'badge bg-label-warning',
  approved: 'badge bg-label-success',
  rejected: 'badge bg-label-danger',
  cancelled: 'badge bg-label-danger',
  posted: 'badge bg-label-info',
  reversed: 'badge bg-label-dark',
}[s] || 'badge bg-label-secondary')

const getDocumentStatusLabel = (s) => ({
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  posted: 'Posted',
  reversed: 'Reversed',
}[s] || s)

function poLabel(option) {
  if (!option) return ''
  const vendor = option.vendor?.name || ''
  const no = option.noPo || option.no_po || shortId(option.id)
  return vendor ? `${no} — ${vendor}` : String(no)
}

function productLabel(option) {
  if (!option) return ''
  const sku = option.sku || ''
  const name = option.name || ''
  return sku ? `${sku} — ${name}` : name || String(option.id)
}

function shortId(id) {
  const s = String(id || '')
  return s.length > 12 ? `${s.slice(0, 8)}…` : s
}

function poDisplay(id) {
  const po = poById.value.get(id)
  return po ? poLabel(po) : shortId(id)
}

function unwrapList(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  return []
}

function showApiError(e, fallback = 'Terjadi kesalahan') {
  const message = getApiErrorMessage(e, fallback)
  const code = e?.data?.meta?.code || e?.data?.code
  const isValidation = code === 'FORBIDDEN' || /maker-checker/i.test(message)
  toast.error({
    title: isValidation ? 'Validasi' : 'Error',
    message,
    color: 'red',
    position: 'bottomRight',
  })
  actionError.value = message
}

function productsFromPoItems(items) {
  const map = new Map()
  for (const item of items || []) {
    const product = item.product
    const productId = product?.id ?? item.productId
    if (!productId || map.has(productId)) continue
    map.set(productId, product || { id: productId, name: `Product #${productId}`, sku: '' })
  }
  return Array.from(map.values())
}

async function loadOptions() {
  loadingOptions.value = true
  try {
    const [poRes, whRes] = await Promise.all([
      $apiFetch($api.dataPurchaseOrder('received')),
      $apiFetch($api.dataWarehouse()),
    ])
    purchaseOrders.value = unwrapList(poRes)
    warehouses.value = unwrapList(whRes)
  } catch (e) {
    purchaseOrders.value = []
    warehouses.value = []
    showApiError(e, 'Gagal memuat opsi form')
  } finally {
    loadingOptions.value = false
  }
}

async function loadProductsForPurchaseOrder(purchaseOrderId) {
  products.value = []
  form.productId = null
  eligible.value = null
  if (!purchaseOrderId) return

  loadingProducts.value = true
  try {
    const res = await $apiFetch($api.getPurchaseOrderDetails(purchaseOrderId))
    const po = res?.data || res
    const items = po?.purchaseOrderItems || po?.purchase_order_items || []
    products.value = productsFromPoItems(items)
    if (!products.value.length) {
      const message = 'PO ini tidak memiliki item produk'
      toast.error({ title: 'Validasi', message, color: 'red', position: 'bottomRight' })
      actionError.value = message
    }
  } catch (e) {
    products.value = []
    showApiError(e, 'Gagal memuat produk dari PO')
  } finally {
    loadingProducts.value = false
  }
}

async function onPurchaseOrderChange(purchaseOrderId) {
  await loadProductsForPurchaseOrder(purchaseOrderId || '')
}

async function loadList() {
  try {
    const res = await $apiFetch($api.purchaseReturn(), { query: { page: 1, limit: 50 } })
    rows.value = Array.isArray(res?.data) ? res.data : unwrapList(res)
  } catch (e) {
    showApiError(e, 'Gagal load purchase return')
  }
}

async function checkEligible() {
  if (!form.purchaseOrderId || !form.productId || !form.warehouseId) {
    toast.error({
      title: 'Validasi',
      message: 'Pilih PO, Product, dan Warehouse terlebih dahulu',
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  try {
    const res = await $apiFetch($api.purchaseReturnEligible(), {
      query: {
        purchaseOrderId: form.purchaseOrderId,
        productId: form.productId,
        warehouseId: form.warehouseId,
      },
    })
    eligible.value = res?.data?.eligible ?? null
  } catch (e) {
    eligible.value = null
    showApiError(e, 'Gagal cek eligible')
  }
}

async function createReturn() {
  if (!canSubmit.value) return
  saving.value = true
  actionError.value = ''
  try {
    await $apiFetch($api.purchaseReturn(), {
      method: 'POST',
      body: {
        purchaseOrderId: form.purchaseOrderId,
        warehouseId: Number(form.warehouseId),
        reason: form.reason || null,
        items: [{ productId: Number(form.productId), quantity: Number(form.quantity) }],
      },
    })
    toast.success({
      title: 'Berhasil',
      message: 'Purchase Return draft dibuat',
      color: 'green',
      position: 'bottomRight',
    })
    form.purchaseOrderId = ''
    form.productId = null
    form.quantity = 1
    form.reason = ''
    products.value = []
    eligible.value = null
    await loadList()
  } catch (e) {
    showApiError(e, 'Gagal create')
  } finally {
    saving.value = false
  }
}

async function submit(row) {
  actionError.value = ''
  try {
    await $apiFetch($api.submitPurchaseReturn(row.id), { method: 'PATCH' })
    toast.success({ title: 'Berhasil', message: 'Submitted for approval', color: 'green', position: 'bottomRight' })
    await loadList()
  } catch (e) {
    showApiError(e, 'Submit gagal')
  }
}

async function approve(row) {
  actionError.value = ''
  try {
    await $apiFetch($api.approvePurchaseReturn(row.id), { method: 'PATCH' })
    toast.success({ title: 'Berhasil', message: 'Approved', color: 'green', position: 'bottomRight' })
    await loadList()
  } catch (e) {
    showApiError(e, 'Approve gagal')
  }
}

async function reject(row) {
  actionError.value = ''
  try {
    await $apiFetch($api.rejectPurchaseReturn(row.id), {
      method: 'PATCH',
      body: { remarks: 'Rejected' },
    })
    toast.success({ title: 'Berhasil', message: 'Rejected', color: 'green', position: 'bottomRight' })
    await loadList()
  } catch (e) {
    showApiError(e, 'Reject gagal')
  }
}

async function post(row) {
  actionError.value = ''
  if (blocksSelfAction(row.createdBy)) {
    const message = selfBlockMessage('post purchase return')
    toast.error({ title: 'Validasi', message, color: 'red', position: 'bottomRight' })
    actionError.value = message
    return
  }
  try {
    await $apiFetch($api.postPurchaseReturn(row.id), { method: 'POST' })
    toast.success({
      title: 'Berhasil',
      message: 'Posted (PURCHASE_RETURN OUT)',
      color: 'green',
      position: 'bottomRight',
    })
    await loadList()
  } catch (e) {
    showApiError(e, 'Post gagal')
  }
}

async function reverse(id) {
  actionError.value = ''
  const reason = window.prompt('Alasan reverse (wajib):')
  if (!reason?.trim()) return
  try {
    await $apiFetch($api.reversePurchaseReturn(id), {
      method: 'POST',
      body: { reason },
    })
    toast.success({ title: 'Berhasil', message: 'Reversed', color: 'green', position: 'bottomRight' })
    await loadList()
  } catch (e) {
    showApiError(e, 'Reverse gagal')
  }
}

onMounted(async () => {
  await userStore.ensureUserLoaded?.()
  await Promise.all([loadOptions(), loadList()])
})
</script>
