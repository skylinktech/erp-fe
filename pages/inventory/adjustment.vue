<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Inventory Adjustment</h4>
      <p class="mb-6">Penyesuaian stok operasional (IN/OUT) melalui inventory ledger. Tidak ada valuasi/akuntansi.</p>

      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card">
            <div class="card-header"><strong>Buat Adjustment</strong></div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Warehouse</label>
                <select v-model="form.warehouseId" class="form-select">
                  <option value="">Pilih warehouse</option>
                  <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Reason</label>
                <select v-model="form.reason" class="form-select">
                  <option v-for="r in reasons" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea v-model="form.notes" class="form-control" rows="2" />
              </div>
              <div class="mb-3">
                <label class="form-label">Product ID</label>
                <input v-model.number="form.productId" type="number" class="form-control" />
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Quantity</label>
                  <input v-model.number="form.quantity" type="number" min="0.01" step="0.01" class="form-control" />
                </div>
                <div class="col-6">
                  <label class="form-label">Direction</label>
                  <select v-model="form.direction" class="form-select">
                    <option value="IN">IN (+)</option>
                    <option value="OUT">OUT (−)</option>
                  </select>
                </div>
              </div>
              <button class="btn btn-primary" :disabled="saving" @click="createAdjustment">
                {{ saving ? 'Saving...' : 'Create Draft' }}
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong>Daftar Adjustment</strong>
              <button class="btn btn-sm btn-outline-secondary" @click="loadList">Refresh</button>
            </div>
            <div class="card-body table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>WH</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.id">
                    <td>{{ row.noAdj }}</td>
                    <td>{{ row.warehouse?.name || row.warehouseId }}</td>
                    <td>{{ row.reason }}</td>
                    <td><span class="badge bg-label-secondary">{{ row.status }}</span></td>
                    <td class="text-nowrap">
                      <button
                        v-if="row.status === 'draft' || row.status === 'rejected'"
                        class="btn btn-xs btn-outline-secondary me-1"
                        @click="submit(row)"
                      >Submit</button>
                      <button
                        v-if="canApprove(row)"
                        class="btn btn-xs btn-outline-primary me-1"
                        @click="approve(row)"
                      >Approve</button>
                      <button
                        v-if="canReject(row)"
                        class="btn btn-xs btn-outline-danger me-1"
                        @click="reject(row)"
                      >Reject</button>
                      <button
                        v-if="row.status === 'approved'"
                        class="btn btn-xs btn-outline-success me-1"
                        :title="blocksSelfAction(row.createdBy) ? 'Maker-checker: tidak boleh post dokumen sendiri' : ''"
                        @click="post(row)"
                      >Post</button>
                      <button v-if="row.status === 'posted'" class="btn btn-xs btn-outline-danger" @click="reverse(row.id)">Reverse</button>
                    </td>
                  </tr>
                  <tr v-if="!rows.length">
                    <td colspan="5" class="text-muted">Belum ada data</td>
                  </tr>
                </tbody>
              </table>
              <p class="small text-muted mb-0 mt-2">
                Approval: submit → workflow. Post tetap maker-checker (kecuali superadmin).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMakerChecker } from '~/composables/useMakerChecker'
import { useWorkflowApproval } from '~/composables/useWorkflowApproval'
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api } = useNuxtApp()
const toast = useToast()
const { blocksSelfAction, selfBlockMessage } = useMakerChecker()
const { canApprove, canReject } = useWorkflowApproval({
  approvePermission: 'approve_inventory_adjustment',
  rejectPermission: 'reject_inventory_adjustment',
})
const warehouses = ref([])
const reasons = ref([])
const rows = ref([])
const saving = ref(false)
const form = reactive({
  warehouseId: '',
  reason: 'STOCK_OPNAME_DIFFERENCE',
  notes: '',
  productId: null,
  quantity: 1,
  direction: 'IN',
})

function showApiError(e, fallback = 'Terjadi kesalahan') {
  const message = getApiErrorMessage(e, fallback)
  const isValidation = /maker-checker/i.test(message) || e?.data?.meta?.code === 'FORBIDDEN'
  toast.error({
    title: isValidation ? 'Validasi' : 'Error',
    message,
    color: 'red',
    position: 'bottomRight',
  })
}

const loadWarehouses = async () => {
  try {
    const res = await $fetch($api.warehouse(), { credentials: 'include' })
    warehouses.value = res?.data || res || []
  } catch {
    warehouses.value = []
  }
}

const loadReasons = async () => {
  try {
    const res = await $fetch($api.inventoryAdjustmentReasons(), { credentials: 'include' })
    reasons.value = res?.data || []
    if (reasons.value.length) form.reason = reasons.value[0]
  } catch {
    reasons.value = ['STOCK_OPNAME_DIFFERENCE', 'DAMAGE', 'LOSS', 'FOUND', 'EXPIRED', 'DATA_CORRECTION', 'OTHER']
  }
}

const loadList = async () => {
  try {
    const res = await $fetch($api.inventoryAdjustment(), { credentials: 'include', query: { page: 1, limit: 50 } })
    rows.value = res?.data || res?.meta ? (res.data || []) : (Array.isArray(res) ? res : [])
    if (res?.meta && Array.isArray(res.data)) rows.value = res.data
  } catch (e) {
    showApiError(e, 'Gagal load adjustment')
  }
}

const createAdjustment = async () => {
  saving.value = true
  try {
    await $fetch($api.inventoryAdjustment(), {
      method: 'POST',
      credentials: 'include',
      body: {
        warehouseId: Number(form.warehouseId),
        reason: form.reason,
        notes: form.notes || null,
        items: [{
          productId: Number(form.productId),
          quantity: Number(form.quantity),
          direction: form.direction,
        }],
      },
    })
    toast.success({ title: 'Berhasil', message: 'Adjustment draft dibuat', color: 'green', position: 'bottomRight' })
    await loadList()
  } catch (e) {
    showApiError(e, 'Gagal create')
  } finally {
    saving.value = false
  }
}

const approve = async (row) => {
  try {
    await $fetch($api.approveInventoryAdjustment(row.id), { method: 'PATCH', credentials: 'include' })
    toast.success({ title: 'Berhasil', message: 'Approved', color: 'green', position: 'bottomRight' })
    await loadList()
  } catch (e) {
    showApiError(e, 'Approve gagal')
  }
}

const submit = async (row) => {
  try {
    await $fetch($api.submitInventoryAdjustment(row.id), { method: 'PATCH', credentials: 'include' })
    toast.success({ title: 'Berhasil', message: 'Submitted for approval', color: 'green', position: 'bottomRight' })
    await loadList()
  } catch (e) {
    showApiError(e, 'Submit gagal')
  }
}

const reject = async (row) => {
  try {
    await $fetch($api.rejectInventoryAdjustment(row.id), {
      method: 'PATCH',
      credentials: 'include',
      body: { remarks: 'Rejected' },
    })
    toast.success({ title: 'Berhasil', message: 'Rejected', color: 'green', position: 'bottomRight' })
    await loadList()
  } catch (e) {
    showApiError(e, 'Reject gagal')
  }
}

const post = async (row) => {
  if (blocksSelfAction(row.createdBy)) {
    toast.error({
      title: 'Validasi',
      message: selfBlockMessage('post inventory adjustment'),
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  try {
    await $fetch($api.postInventoryAdjustment(row.id), { method: 'POST', credentials: 'include' })
    toast.success({ title: 'Berhasil', message: 'Posted ke ledger', color: 'green', position: 'bottomRight' })
    await loadList()
  } catch (e) {
    showApiError(e, 'Post gagal')
  }
}

const reverse = async (id) => {
  const reason = window.prompt('Alasan reverse (wajib):')
  if (!reason?.trim()) return
  try {
    await $fetch($api.reverseInventoryAdjustment(id), {
      method: 'POST',
      credentials: 'include',
      body: { reason },
    })
    toast.success({ title: 'Berhasil', message: 'Reversed', color: 'green', position: 'bottomRight' })
    await loadList()
  } catch (e) {
    showApiError(e, 'Reverse gagal')
  }
}

onMounted(async () => {
  await Promise.all([loadWarehouses(), loadReasons(), loadList()])
})
</script>
