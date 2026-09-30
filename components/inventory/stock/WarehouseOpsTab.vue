<template>
  <div>
    <div class="row g-6">
      <div class="col-12">
        <div class="card">
          <ListPageTableHeader
            :rows="Number(tableControls.rows)"
            :rows-options="rowsPerPageOptions"
            :search="globalFilterValue"
            search-placeholder="Cari no. penjualan / pelanggan..."
            :show-export="false"
            @update:rows="onToolbarRows"
            @update:search="onToolbarSearch"
          >
            <template #add>
              <div class="d-flex flex-wrap gap-2 align-items-center">
                <Dropdown
                  v-model="statusFilter"
                  :options="statusOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Status gudang"
                  class="w-auto"
                  show-clear
                  @change="onFilterChange"
                />
                <Dropdown
                  v-model="deliveryFilter"
                  :options="deliveryOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Status pengiriman"
                  class="w-auto"
                  show-clear
                  @change="onFilterChange"
                />
              </div>
            </template>
            <template #toolbar-extra>
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                :disabled="loading"
                @click="loadQueue"
              >
                <i class="ri-refresh-line me-1" />
                Refresh
              </button>
            </template>
          </ListPageTableHeader>

          <div class="card-datatable table-responsive py-3 px-3">
            <MyDataTable
              :data="displayRows"
              :loading="loading"
              :rows="Number(params.rows)"
              :total-records="totalRecords"
              :first="params.first"
              :expanded-rows="expandedRows"
              responsive-layout="scroll"
              paginator-position="bottom"
              paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
              @page="onPage"
              @update:expanded-rows="onExpandedRowsUpdate"
            >
              <Column :expander="true" header-style="width: 3rem" />
              <Column header="#" :sortable="false" style="width: 4rem">
                <template #body="slotProps">
                  {{ params.first + slotProps.index + 1 }}
                </template>
              </Column>
              <Column field="saleNumber" header="No. Penjualan" :sortable="true" style="min-width: 10rem">
                <template #body="slotProps">
                  <span class="badge bg-primary">{{ slotProps.data.saleNumber }}</span>
                </template>
              </Column>
              <Column header="Pelanggan" style="min-width: 12rem">
                <template #body="slotProps">
                  {{ slotProps.data.walkInName || slotProps.data.customerId || '—' }}
                </template>
              </Column>
              <Column field="warehouseOpsStatus" header="Status Gudang" style="min-width: 9rem">
                <template #body="slotProps">
                  <span :class="opsBadge(slotProps.data.warehouseOpsStatus)">
                    {{ formatStatusLabel(slotProps.data.warehouseOpsStatus) }}
                  </span>
                </template>
              </Column>
              <Column header="Pengiriman" style="min-width: 9rem">
                <template #body="slotProps">
                  <span
                    v-if="slotProps.data.deliveryStatus || (slotProps.data.deliveryStatuses || []).length"
                    :class="deliveryBadge(slotProps.data.deliveryStatus || slotProps.data.deliveryStatuses?.[0])"
                  >
                    {{
                      slotProps.data.deliveryStatus
                        ? formatStatusLabel(slotProps.data.deliveryStatus)
                        : (slotProps.data.deliveryStatuses || [])
                            .map(formatStatusLabel)
                            .filter((s) => s !== '—')
                            .join(', ')
                    }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </template>
              </Column>
              <Column header="Outstanding" style="min-width: 9rem">
                <template #body="slotProps">
                  <span class="small text-nowrap">
                    P {{ slotProps.data.totals?.pick ?? 0 }}
                    / Pk {{ slotProps.data.totals?.pack ?? 0 }}
                    / D {{ slotProps.data.totals?.dispatch ?? 0 }}
                  </span>
                </template>
              </Column>
              <Column header="POD" style="min-width: 8rem">
                <template #body="slotProps">
                  <span v-if="slotProps.data.podSummary" class="small">
                    {{ slotProps.data.podSummary.accepted ?? 0 }}/{{ slotProps.data.podSummary.dispatched ?? 0 }}
                    <span v-if="slotProps.data.podSummary.hasRejection || slotProps.data.podSummary.rejected > 0" class="text-danger ms-1">
                      rej {{ slotProps.data.podSummary.rejected }}
                    </span>
                  </span>
                  <span v-else class="text-muted">—</span>
                </template>
              </Column>
              <Column header="Dikirim" style="min-width: 7rem">
                <template #body="slotProps">
                  {{ slotProps.data.dispatchedAt ? formatDate(slotProps.data.dispatchedAt) : '—' }}
                </template>
              </Column>
              <Column header="Dikonfirmasi" style="min-width: 7rem">
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.confirmedAt) }}
                </template>
              </Column>

              <template #expansion="{ data: row }">
                <div v-if="detailError[row.id]" class="p-3">
                  <div class="text-danger small mb-2">{{ detailError[row.id] }}</div>
                  <Button
                    label="Coba lagi"
                    size="small"
                    outlined
                    :loading="!!detailLoading[row.id]"
                    @click="ensureDetail(row.id, { force: true })"
                  />
                </div>
                <div v-else-if="detailsCache[row.id]" class="p-3 outbound-expansion">
                  <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                    <div>
                      <div class="fw-semibold">
                        {{ detailsCache[row.id].sale?.saleNumber || row.saleNumber }}
                      </div>
                      <div class="text-muted small">
                        Gudang: {{ formatStatusLabel(detailsCache[row.id].sale?.warehouseOpsStatus) }}
                        · Pengiriman:
                        {{
                          (detailsCache[row.id].dispatches || [])
                            .map((d) => formatStatusLabel(d.deliveryStatus))
                            .filter((s) => s !== '—')
                            .join(', ') || '—'
                        }}
                      </div>
                      <div v-if="detailsCache[row.id].note" class="small text-muted mt-1">
                        {{ detailsCache[row.id].note }}
                      </div>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <Button
                        v-if="canPick(detailsCache[row.id])"
                        label="Pick"
                        size="small"
                        :loading="busy"
                        @click="runAction(row.id, 'pick')"
                      />
                      <Button
                        v-if="canPack(detailsCache[row.id])"
                        label="Pack"
                        size="small"
                        severity="secondary"
                        :loading="busy"
                        @click="runAction(row.id, 'pack')"
                      />
                      <Button
                        v-if="canDispatch(detailsCache[row.id])"
                        label="Dispatch"
                        size="small"
                        severity="success"
                        :loading="busy"
                        @click="runAction(row.id, 'dispatch')"
                      />
                      <Button
                        v-if="canCancelRemainder(detailsCache[row.id])"
                        label="Batalkan sisa"
                        size="small"
                        severity="danger"
                        outlined
                        :loading="busy"
                        @click="cancelRemainder(row.id)"
                      />
                    </div>
                  </div>

                  <div class="table-responsive mb-3">
                    <table class="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th class="text-end">Ordered</th>
                          <th class="text-end">Picked</th>
                          <th class="text-end">Packed</th>
                          <th class="text-end">Dispatched</th>
                          <th class="text-end">Sisa P/Pk/D</th>
                          <th style="width: 7rem">Qty aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="line in detailsCache[row.id].items || []"
                          :key="line.id"
                        >
                          <td>{{ line.skuSnapshot || line.productId }}</td>
                          <td class="text-end">{{ line.quantity }}</td>
                          <td class="text-end">{{ line.pickedQty }}</td>
                          <td class="text-end">{{ line.packedQty }}</td>
                          <td class="text-end">{{ line.dispatchedQty }}</td>
                          <td class="text-end small">
                            {{ line.outstanding?.pick ?? 0 }}
                            / {{ line.outstanding?.pack ?? 0 }}
                            / {{ line.outstanding?.dispatch ?? 0 }}
                          </td>
                          <td style="width: 7rem">
                            <InputNumber
                              v-model="qtyDraft[line.id]"
                              :min="0"
                              :use-grouping="false"
                              class="w-100"
                              input-class="w-100 text-end"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div
                    v-if="(detailsCache[row.id].dispatches || []).length"
                    class="border-top pt-3"
                  >
                    <div class="fw-semibold mb-2">Proof of Delivery (POD)</div>
                    <div class="d-flex flex-wrap gap-2 mb-3">
                      <Button
                        v-for="d in detailsCache[row.id].dispatches"
                        :key="d.id"
                        :label="d.dispatchNumber"
                        size="small"
                        :severity="podPanelId === d.id ? 'primary' : 'secondary'"
                        :outlined="podPanelId !== d.id"
                        @click="openPodPanel(d.id)"
                      />
                    </div>

                    <div v-if="podLoading && podPanelId" class="text-muted small py-2">Memuat POD…</div>
                    <div v-else-if="podPanel && podPanelId" class="pod-panel">
                      <div class="d-flex flex-wrap gap-2 mb-3 small text-muted">
                        <span>
                          Status pengiriman:
                          <strong>{{ formatStatusLabel(podPanel.deliveryStatus || podPanel.dispatch?.deliveryStatus) }}</strong>
                        </span>
                        <span v-if="(podPanel.pods || []).length">
                          · POD: {{ (podPanel.pods || []).length }}
                        </span>
                      </div>

                      <template v-if="hasOpenPodBalance(podPanel)">
                        <div
                          v-for="line in podPanel.items || []"
                          :key="line.id"
                          class="pod-line-card border rounded p-3 mb-3"
                        >
                          <div class="fw-semibold small mb-3">
                            {{ line.skuSnapshot || line.sku || line.product?.sku || line.productId }}
                            <span class="text-muted fw-normal">
                              · disp {{ Number(line.quantity) }}
                              · sisa {{ Number(line.pod?.unconfirmed ?? 0) }}
                            </span>
                          </div>

                          <div class="row g-3">
                            <div class="col-6 col-sm-4 col-lg-2">
                              <label class="form-label small mb-1" :for="`pod-acc-${line.id}`">Accepted</label>
                              <InputNumber
                                :input-id="`pod-acc-${line.id}`"
                                v-model="podForm[line.id].acceptedQty"
                                :min="0"
                                :max="Number(line.pod?.unconfirmed ?? line.quantity)"
                                :use-grouping="false"
                                class="w-100"
                                input-class="w-100 text-end"
                              />
                            </div>
                            <div class="col-6 col-sm-4 col-lg-2">
                              <label class="form-label small mb-1" :for="`pod-rej-${line.id}`">Rejected</label>
                              <InputNumber
                                :input-id="`pod-rej-${line.id}`"
                                v-model="podForm[line.id].rejectedQty"
                                :min="0"
                                :max="Number(line.pod?.unconfirmed ?? line.quantity)"
                                :use-grouping="false"
                                class="w-100"
                                input-class="w-100 text-end"
                              />
                            </div>
                            <div class="col-6 col-sm-4 col-lg-2">
                              <label class="form-label small mb-1" :for="`pod-short-${line.id}`">Shortage</label>
                              <InputNumber
                                :input-id="`pod-short-${line.id}`"
                                v-model="podForm[line.id].shortageQty"
                                :min="0"
                                :max="Number(line.pod?.unconfirmed ?? line.quantity)"
                                :use-grouping="false"
                                class="w-100"
                                input-class="w-100 text-end"
                              />
                            </div>
                            <div class="col-12 col-lg-6">
                              <label class="form-label small mb-1" :for="`pod-reason-${line.id}`">Alasan reject</label>
                              <InputText
                                :id="`pod-reason-${line.id}`"
                                v-model="podForm[line.id].rejectReason"
                                class="w-100"
                                placeholder="Wajib jika rejected > 0"
                              />
                            </div>
                            <div class="col-12 col-lg-6">
                              <label class="form-label small mb-1" for="pod-notes">Catatan</label>
                              <InputText id="pod-notes" v-model="podNotes" class="w-100" />
                            </div>
                            <div class="col-12 col-lg-6">
                              <label class="form-label small mb-1" for="pod-recipient">Nama penerima</label>
                              <InputText id="pod-recipient" v-model="podRecipientName" class="w-100" />
                            </div>
                          </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2">
                          <Button
                            label="Simpan & konfirmasi POD"
                            icon="pi pi-check"
                            size="small"
                            :loading="busy"
                            @click="submitPodConfirm"
                          />
                          <label class="btn btn-sm btn-outline-secondary mb-0">
                            Upload lampiran
                            <input
                              type="file"
                              class="d-none"
                              accept="image/*,application/pdf"
                              @change="onPodAttachment"
                            />
                          </label>
                        </div>
                      </template>

                      <div v-else class="small text-muted mb-2">
                        Semua qty dispatch sudah dikonfirmasi POD, atau belum ada sisa unconfirmed.
                      </div>

                      <div v-if="(podPanel.pods || []).length" class="mt-2">
                        <div class="fw-semibold small mb-1">Riwayat POD</div>
                        <div
                          v-for="p in podPanel.pods"
                          :key="p.id"
                          class="border rounded p-2 mb-2 small"
                        >
                          <div class="d-flex flex-wrap justify-content-between gap-2">
                            <span>
                              <strong>{{ humanizeLabel(p.status, { fallback: '—' }) }}</strong>
                              <span v-if="p.recipientName"> · {{ p.recipientName }}</span>
                            </span>
                            <div class="d-flex gap-1">
                              <Button
                                v-if="p.status === 'confirmed' && hasRejection(p)"
                                label="Buat retur"
                                size="small"
                                severity="warning"
                                outlined
                                :loading="busy"
                                @click="createReturnFromPod(p.id)"
                              />
                            </div>
                          </div>
                          <div
                            v-for="it in p.items || []"
                            :key="it.id"
                            class="text-muted"
                          >
                            acc {{ it.acceptedQty }} / rej {{ it.rejectedQty }} / short {{ it.shortageQty }}
                            <span v-if="it.rejectReason" class="text-danger"> — {{ it.rejectReason }}</span>
                          </div>
                          <div v-if="(p.attachments || []).length" class="text-muted">
                            Lampiran: {{ p.attachments.length }} file
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="p-3 text-muted small">
                  Memuat detail outbound…
                </div>
              </template>
            </MyDataTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { toastApiError } from '~/utils/apiError'
import { humanizeLabel } from '~/utils/humanizeLabel'

const { $api, $apiFetch } = useNuxtApp()
const toast = useToast()

const loading = ref(false)
const busy = ref(false)
const rows = ref([])
const totalRecords = ref(0)
const statusFilter = ref(null)
const deliveryFilter = ref(null)
const expandedRows = ref({})
const detailsCache = reactive({})
const detailLoading = reactive({})
const detailError = reactive({})
const qtyDraft = reactive({})
const inflightDetails = new Map()

const podPanelId = ref(null)
const podLoading = ref(false)
const podPanel = ref(null)
const podForm = reactive({})
const podNotes = ref('')
const podRecipientName = ref('')
const lastConfirmedPodId = ref(null)

const globalFilterValue = ref('')
const tableControls = ref({ rows: 20, search: '' })
const params = ref({ first: 0, rows: 20 })
const rowsPerPageOptions = [10, 25, 50]

let searchDebounceTimer = null

const statusOptions = [
  { label: 'READY TO PICK', value: 'READY_TO_PICK' },
  { label: 'PICKING', value: 'PICKING' },
  { label: 'PACKING', value: 'PACKING' },
  { label: 'READY TO DISPATCH', value: 'READY_TO_DISPATCH' },
  { label: 'PARTIAL', value: 'PARTIAL' },
  { label: 'COMPLETE', value: 'COMPLETE' },
]

const deliveryOptions = [
  { label: 'PENDING POD', value: 'PENDING_POD' },
  { label: 'PARTIAL', value: 'PARTIAL' },
  { label: 'DELIVERED', value: 'DELIVERED' },
  { label: 'EXCEPTION', value: 'EXCEPTION' },
  { label: 'COMPLETE', value: 'COMPLETE' },
]

const displayRows = computed(() => {
  const q = String(globalFilterValue.value || '').trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((r) => {
    const hay = [r.saleNumber, r.walkInName, r.customerId, r.warehouseOpsStatus, r.deliveryStatus]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

function formatStatusLabel(value) {
  return humanizeLabel(value, { fallback: '—' })
}

function formatDate(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'})
  } catch {
    return String(v)
  }
}

function opsBadge(s) {
  if (s === 'COMPLETE') return 'badge bg-label-success'
  if (s === 'READY_TO_DISPATCH') return 'badge bg-label-info'
  if (s === 'PARTIAL' || s === 'PACKING' || s === 'PICKING') return 'badge bg-label-warning'
  return 'badge bg-label-secondary'
}

function deliveryBadge(s) {
  if (s === 'DELIVERED' || s === 'COMPLETE') return 'badge bg-label-success'
  if (s === 'EXCEPTION') return 'badge bg-label-danger'
  if (s === 'PARTIAL' || s === 'PENDING_POD') return 'badge bg-label-warning'
  return 'badge bg-label-secondary'
}

function canPick(d) {
  return (d?.items || []).some((l) => Number(l.outstanding?.pick || 0) > 0)
}

function canPack(d) {
  return (d?.items || []).some((l) => Number(l.outstanding?.pack || 0) > 0)
}

function canDispatch(d) {
  return (d?.items || []).some((l) => Number(l.outstanding?.dispatch || 0) > 0)
}

function canCancelRemainder(d) {
  const s = d?.sale?.warehouseOpsStatus
  return s && s !== 'COMPLETE'
}

function hasOpenPodBalance(panel) {
  return (panel?.items || []).some((l) => Number(l.pod?.unconfirmed || 0) > 0)
}

function hasRejection(pod) {
  return (pod?.items || []).some((i) => Number(i.rejectedQty || 0) > 0)
}

function hydrateQtyDraft(detail, { reset = false } = {}) {
  for (const line of detail.items || []) {
    if (reset || qtyDraft[line.id] == null) {
      const o = line.outstanding || {}
      qtyDraft[line.id] = o.dispatch || o.pack || o.pick || 0
    }
  }
}

async function loadQueue() {
  loading.value = true
  try {
    const page = Math.floor(params.value.first / params.value.rows) + 1
    const query = {
      page,
      rows: params.value.rows}
    if (statusFilter.value) query.status = statusFilter.value
    if (deliveryFilter.value) query.deliveryStatus = deliveryFilter.value

    const res = await $apiFetch($api.retailWarehouseOpsQueue(), { query })
    rows.value = res?.data || []
    totalRecords.value = Number(res?.meta?.total || 0)
    if (res?.meta?.rows) {
      params.value.rows = Number(res.meta.rows)
      tableControls.value.rows = Number(res.meta.rows)
    }
  } catch (e) {
    toastApiError(e, 'Gagal memuat antrean outbound')
    rows.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

async function ensureDetail(saleId, { resetQty = false, force = false } = {}) {
  if (!saleId) return null

  if (!force && !resetQty && detailsCache[saleId]?.sale) {
    return detailsCache[saleId]
  }

  if (!force && inflightDetails.has(saleId)) {
    return inflightDetails.get(saleId)
  }

  const request = (async () => {
    detailLoading[saleId] = true
    delete detailError[saleId]
    try {
      if (force || resetQty) delete detailsCache[saleId]

      const res = await $apiFetch($api.retailWarehouseOps(saleId))
      const detail = res?.data || res
      if (!detail || (!detail.sale && !Array.isArray(detail.items))) {
        throw new Error('Respons detail outbound tidak valid')
      }

      detailsCache[saleId] = detail
      hydrateQtyDraft(detail, { reset: force || resetQty })

      // POD is secondary — never block line detail UI
      const firstDispatch = (detail.dispatches || [])[0]
      if (firstDispatch?.id) {
        void openPodPanel(firstDispatch.id)
      } else if (podPanelId.value) {
        podPanelId.value = null
        podPanel.value = null
      }

      return detail
    } catch (e) {
      detailError[saleId] = e?.data?.message || e?.message || 'Gagal memuat detail outbound'
      toastApiError(e, 'Gagal memuat detail outbound')
      return null
    } finally {
      detailLoading[saleId] = false
      inflightDetails.delete(saleId)
    }
  })()

  inflightDetails.set(saleId, request)
  return request
}

async function refreshDetail(saleId) {
  await ensureDetail(saleId, { force: true, resetQty: true })
}

function normalizeExpandedMap(next) {
  if (!next || typeof next !== 'object' || Array.isArray(next)) return {}
  return next
}

/** Single open row keeps shared POD panel state consistent. */
function onExpandedRowsUpdate(next) {
  const map = normalizeExpandedMap(next)
  const ids = Object.keys(map)

  if (ids.length > 1) {
    const lastId = ids[ids.length - 1]
    expandedRows.value = { [lastId]: true }
    void ensureDetail(lastId)
    return
  }

  expandedRows.value = map
  if (!ids.length) {
    podPanelId.value = null
    podPanel.value = null
    return
  }
  void ensureDetail(ids[0])
}

function onPage(event) {
  params.value.first = event.first
  params.value.rows = event.rows
  tableControls.value.rows = event.rows
  expandedRows.value = {}
  loadQueue()
}

function onToolbarRows(value) {
  const rowsValue = Number(value) || 20
  tableControls.value.rows = rowsValue
  params.value.rows = rowsValue
  params.value.first = 0
  expandedRows.value = {}
  loadQueue()
}

function onToolbarSearch(value) {
  globalFilterValue.value = value ?? ''
  tableControls.value.search = globalFilterValue.value
}

function onFilterChange() {
  params.value.first = 0
  expandedRows.value = {}
  loadQueue()
}

function selectedLines(detail) {
  return (detail?.items || [])
    .map((line) => ({
      retailSaleItemId: line.id,
      quantity: Number(qtyDraft[line.id] || 0)}))
    .filter((l) => l.quantity > 0)
}

async function runAction(saleId, kind) {
  const detail = detailsCache[saleId]
  if (!detail?.sale?.id) return
  const lines = selectedLines(detail)
  if (!lines.length) {
    toast.error({
      title: 'Validasi',
      message: 'Isi qty aksi > 0 pada baris yang diproses',
      color: 'red',
      position: 'bottomRight'})
    return
  }
  busy.value = true
  try {
    const endpoint =
      kind === 'pick'
        ? $api.retailWarehouseOpsPick(detail.sale.id)
        : kind === 'pack'
          ? $api.retailWarehouseOpsPack(detail.sale.id)
          : $api.retailWarehouseOpsDispatch(detail.sale.id)
    await $apiFetch(endpoint, {
      method: 'POST',
      body: { lines, idempotencyKey: crypto.randomUUID() }})
    toast.success({
      title: 'Berhasil',
      message:
        kind === 'pick' ? 'Pick tersimpan' : kind === 'pack' ? 'Pack tersimpan' : 'Dispatch berhasil',
      color: 'green',
      position: 'bottomRight'})
    await loadQueue()
    await refreshDetail(saleId)
  } catch (e) {
    toastApiError(e, `Gagal ${kind}`)
  } finally {
    busy.value = false
  }
}

async function cancelRemainder(saleId) {
  const detail = detailsCache[saleId]
  if (!detail?.sale?.id) return
  busy.value = true
  try {
    await $apiFetch($api.retailWarehouseOpsCancelRemainder(detail.sale.id), {
      method: 'POST',
      body: {
        idempotencyKey: crypto.randomUUID(),
        reason: 'cancel remainder from UI'}})
    toast.success({
      title: 'Berhasil',
      message: 'Sisa dibatalkan',
      color: 'green',
      position: 'bottomRight'})
    await loadQueue()
    await refreshDetail(saleId)
  } catch (e) {
    toastApiError(e, 'Gagal batalkan sisa')
  } finally {
    busy.value = false
  }
}

function hydratePodForm(panel) {
  Object.keys(podForm).forEach((k) => delete podForm[k])
  for (const line of panel.items || []) {
    const open = Number(line.pod?.unconfirmed ?? line.quantity ?? 0)
    podForm[line.id] = {
      acceptedQty: open,
      rejectedQty: 0,
      shortageQty: 0,
      rejectReason: ''}
  }
  podNotes.value = ''
  podRecipientName.value = panel.dispatch?.recipientName || ''
}

async function openPodPanel(dispatchId) {
  podPanelId.value = dispatchId
  await loadPodPanel(dispatchId)
}

async function loadPodPanel(dispatchId) {
  podLoading.value = true
  try {
    const res = await $apiFetch($api.retailWarehouseOpsDispatchPods(dispatchId))
    const panel = res?.data || res
    podPanel.value = panel
    hydratePodForm(panel)
    const confirmed = (panel.pods || []).find((p) => p.status === 'confirmed')
    lastConfirmedPodId.value = confirmed?.id || null
  } catch (e) {
    toastApiError(e, 'Gagal memuat POD')
    podPanel.value = null
  } finally {
    podLoading.value = false
  }
}

async function submitPodConfirm() {
  if (!podPanelId.value || !podPanel.value) return
  const lines = (podPanel.value.items || [])
    .map((l) => ({
      retailDispatchItemId: l.id,
      acceptedQty: Number(podForm[l.id]?.acceptedQty ?? 0),
      rejectedQty: Number(podForm[l.id]?.rejectedQty ?? 0),
      shortageQty: Number(podForm[l.id]?.shortageQty ?? 0),
      rejectReason: podForm[l.id]?.rejectReason || undefined}))
    .filter((l) => l.acceptedQty + l.rejectedQty + l.shortageQty > 0)

  if (!lines.length) {
    toast.error({
      title: 'Validasi',
      message: 'Isi accepted / rejected / shortage',
      color: 'red',
      position: 'bottomRight'})
    return
  }

  busy.value = true
  try {
    const draftRes = await $apiFetch($api.retailWarehouseOpsDispatchPods(podPanelId.value), {
      method: 'POST',
      body: {
        recipientName: podRecipientName.value || undefined,
        notes: podNotes.value || undefined,
        deliveredAt: new Date().toISOString(),
        lines}})
    const podId = draftRes?.data?.id || draftRes?.data?.pod?.id
    if (!podId) throw new Error('POD draft tidak mengembalikan id')

    await $apiFetch($api.retailWarehouseOpsPodConfirm(podId), {
      method: 'POST',
      body: { idempotencyKey: crypto.randomUUID() }})
    lastConfirmedPodId.value = podId
    toast.success({
      title: 'Berhasil',
      message: 'POD dikonfirmasi',
      color: 'green',
      position: 'bottomRight'})

    await loadQueue()
    const saleId = Object.keys(detailsCache).find((id) =>
      (detailsCache[id]?.dispatches || []).some((d) => d.id === podPanelId.value)
    )
    if (saleId) await refreshDetail(saleId)
    else await loadPodPanel(podPanelId.value)
  } catch (e) {
    toastApiError(e, 'Gagal konfirmasi POD')
  } finally {
    busy.value = false
  }
}

async function createReturnFromPod(podId) {
  busy.value = true
  try {
    await $apiFetch($api.retailWarehouseOpsPodCreateReturn(podId), {
      method: 'POST',
      body: { idempotencyKey: crypto.randomUUID() }})
    toast.success({
      title: 'Berhasil',
      message: 'Draft retur dibuat — stok belum bertambah sampai retur diposting',
      color: 'green',
      position: 'bottomRight'})
    if (podPanelId.value) await loadPodPanel(podPanelId.value)
  } catch (e) {
    toastApiError(e, 'Gagal buat retur dari POD')
  } finally {
    busy.value = false
  }
}

async function onPodAttachment(event) {
  const file = event?.target?.files?.[0]
  const podId =
    lastConfirmedPodId.value ||
    (podPanel.value?.pods || []).find((p) => p.status === 'draft' || p.status === 'confirmed')?.id
  if (!file || !podId) {
    toast.error({
      title: 'Validasi',
      message: 'Konfirmasi POD dulu sebelum upload lampiran',
      color: 'red',
      position: 'bottomRight'})
    if (event?.target) event.target.value = ''
    return
  }
  busy.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    await $apiFetch($api.retailWarehouseOpsPodAttachments(podId), {
      method: 'POST',
      body: form})
    toast.success({
      title: 'Berhasil',
      message: 'Lampiran diunggah',
      color: 'green',
      position: 'bottomRight'})
    if (podPanelId.value) await loadPodPanel(podPanelId.value)
  } catch (e) {
    toastApiError(e, 'Gagal upload lampiran POD')
  } finally {
    busy.value = false
    if (event?.target) event.target.value = ''
  }
}

watch(
  () => params.value.rows,
  (newValue) => {
    tableControls.value.rows = Number(newValue) || 20
  }
)

watch(globalFilterValue, (newValue) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    tableControls.value.search = newValue
  }, 300)
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})

onMounted(loadQueue)
</script>

<style scoped>
.outbound-expansion {
  background: var(--surface-ground, #f8f9fa);
  border-radius: 0.25rem;
}
.pod-panel {
  width: 100%;
  max-width: 100%;
}
.pod-line-card {
  background: #fff;
}
.pod-panel :deep(.p-inputnumber),
.outbound-expansion :deep(.p-inputnumber) {
  display: flex;
  width: 100%;
}
.pod-panel :deep(.p-inputnumber-input),
.outbound-expansion :deep(.p-inputnumber-input),
.pod-panel :deep(.p-inputtext) {
  width: 100%;
}
.pod-panel :deep(.form-label) {
  display: block;
}
</style>
