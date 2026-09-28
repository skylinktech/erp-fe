<template>
    <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-pt-10">
            <h4 class="mb-1">Detail Stock Transfer</h4>
            <PageBreadcrumb class="mt-1" current-label="Detail Stock Transfer" />
            <p class="mb-4 text-muted">
              Qty kumulatif (base UOM): Ordered / Dispatched / Received / Returned / Lost.
              In-transit = dispatched − received − returned − lost. Nama penerima bukan bukti barang diterima.
            </p>
            <div v-if="loading" class="text-center">
                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
                <div class="mt-3 text-muted">Memuat data...</div>
            </div>
            <div v-else-if="error" class="alert alert-danger mt-5">{{ error.message || error }}</div>
            <div v-else-if="stockTransfer" class="row g-6">
                <div class="col-md-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="mb-3">{{ stockTransfer.noTransfer }}</h5>
                            <ul class="list-unstyled mb-0">
                                <li class="mb-2"><strong>Perusahaan:</strong> {{ stockTransfer.perusahaan?.nmPerusahaan }}</li>
                                <li class="mb-2"><strong>Cabang:</strong> {{ stockTransfer.cabang?.nmCabang }}</li>
                                <li class="mb-2"><strong>Tanggal:</strong> {{ stockTransfer.date ? new Date(stockTransfer.date).toLocaleDateString() : '-' }}</li>
                                <li class="mb-2"><strong>Asal:</strong> {{ stockTransfer.fromWarehouse?.name }}</li>
                                <li class="mb-2"><strong>Tujuan:</strong> {{ stockTransfer.toWarehouse?.name }}</li>
                                <li class="mb-2"><strong>Approval:</strong> {{ stockTransfer.status }}</li>
                                <li class="mb-2">
                                  <strong>Fulfillment:</strong>
                                  <span class="badge bg-label-info ms-1">{{ stockTransfer.fulfillmentStatus || progress?.fulfillmentStatus || '-' }}</span>
                                </li>
                                <li class="mb-2"><strong>Lifecycle:</strong> v{{ stockTransfer.lifecycleVersion || progress?.lifecycleVersion || '-' }}</li>
                                <li class="mb-2">
                                  <strong>Posting integrity:</strong>
                                  <span :class="progress?.actions?.postingBlocked ? 'text-danger' : 'text-success'">
                                    {{ progress?.postingIntegrity || 'OK' }}
                                  </span>
                                </li>
                                <li v-if="progress?.postingIntegrityNote" class="mb-2 small text-muted">{{ progress.postingIntegrityNote }}</li>
                                <li v-if="progress?.actions?.isLegacy" class="mb-2 text-warning">Legacy atomik (OUT+IN pada approve) — tidak di-dispatch ulang.</li>
                                <li v-if="progress?.uomPolicy" class="mb-2 small text-muted">{{ progress.uomPolicy.note }}</li>
                            </ul>
                            <div class="d-flex flex-wrap gap-2 mt-3">
                              <NuxtLink to="/inventory/stock?tab=transfer" class="btn btn-sm btn-outline-secondary">
                                <i class="ri-arrow-left-line me-1"></i> Kembali
                              </NuxtLink>
                              <a href="javascript:void(0)" class="btn btn-sm btn-secondary" @click="cetakStockTransfer(stockTransfer.id)">
                                <i class="ri-printer-line me-1"></i> Cetak ulang
                              </a>
                              <NuxtLink
                                class="btn btn-sm btn-outline-primary"
                                :to="`/inventory/stock?tab=movements&sourceDocumentType=stock_transfer&sourceDocumentId=${stockTransfer.id}`"
                              >
                                Lihat Movements
                              </NuxtLink>
                            </div>
                        </div>
                    </div>
                    <div v-if="progress?.totals" class="card mb-4">
                      <div class="card-body">
                        <h6 class="mb-3">Progress qty (base UOM)</h6>
                        <div class="row g-2 text-center">
                          <div class="col-4"><div class="small text-muted">Ordered</div><strong>{{ progress.totals.ordered }}</strong></div>
                          <div class="col-4"><div class="small text-muted">Dikirim</div><strong>{{ progress.totals.dispatched }}</strong></div>
                          <div class="col-4"><div class="small text-muted">Diterima</div><strong>{{ progress.totals.received }}</strong></div>
                          <div class="col-4"><div class="small text-muted">In-transit</div><strong>{{ progress.totals.inTransit }}</strong></div>
                          <div class="col-4"><div class="small text-muted">Returned</div><strong>{{ progress.totals.returned }}</strong></div>
                          <div class="col-4"><div class="small text-muted">Lost</div><strong>{{ progress.totals.lost }}</strong></div>
                        </div>
                      </div>
                    </div>
                    <div v-if="progress?.value" class="card mb-4">
                      <div class="card-body">
                        <h6 class="mb-2">Nilai in-transit</h6>
                        <div class="d-flex justify-content-between mb-1">
                          <span class="text-muted">Qty</span>
                          <strong>{{ formatNum(progress.value.inTransitQty) }}</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                          <span class="text-muted">Nilai</span>
                          <strong>{{ formatMoney(progress.value.inTransitValue) }}</strong>
                        </div>
                        <p class="small text-muted mb-0">{{ progress.value.note }}</p>
                        <p v-if="progress.glAccounting" class="small text-muted mt-2 mb-0">
                          GL: {{ progress.glAccounting.mode }} — revenue/COGS/gain-loss tidak dibuat
                          ({{ progress.glAccounting.status }}).
                        </p>
                      </div>
                    </div>
                </div>

                <div class="col-md-8">
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">Baris &amp; tindakan</h5>
                            <div class="d-flex gap-2">
                              <button
                                v-if="progress?.actions?.canDispatch"
                                type="button"
                                class="btn btn-sm btn-primary"
                                :disabled="actionBusy"
                                @click="doDispatch"
                              >Kirim</button>
                              <button
                                v-if="progress?.actions?.canReceive"
                                type="button"
                                class="btn btn-sm btn-success"
                                :disabled="actionBusy"
                                @click="doReceive"
                              >Terima</button>
                              <button
                                v-if="progress?.actions?.canCancelRemainder"
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                :disabled="actionBusy"
                                @click="doCancelRemainder"
                              >Batalkan sisa</button>
                            </div>
                        </div>
                        <div class="card-body table-responsive">
                          <div v-if="actionError" class="alert alert-danger py-2 mt-5">{{ actionError }}</div>
                          <div v-if="progress?.actions?.postingBlocked" class="alert alert-warning py-2 mt-5">
                            Tindakan fulfillment diblokir karena exception posting. Lihat Movements / integrity note.
                          </div>
                          <table class="table table-sm mt-5">
                            <thead>
                              <tr>
                                <th>Produk</th>
                                <th>UOM</th>
                                <th class="text-end">Ordered</th>
                                <th class="text-end">Dispatched</th>
                                <th class="text-end">Received</th>
                                <th class="text-end">In-transit</th>
                                <th class="text-end">Open</th>
                                <th class="text-end text-nowrap">Kirim qty</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="d in (progress?.details || [])" :key="d.id">
                                <td>{{ d.productName || d.productId }}</td>
                                <td class="small">{{ d.baseUom || 'BASE' }}</td>
                                <td class="text-end">{{ d.ordered }}</td>
                                <td class="text-end">{{ d.dispatched }}</td>
                                <td class="text-end">{{ d.received }}</td>
                                <td class="text-end">{{ d.inTransit }}</td>
                                <td class="text-end">{{ d.openToShip }}</td>
                                <td class="text-end" style="width:7rem">
                                  <input
                                    v-model.number="dispatchQty[d.id]"
                                    type="number"
                                    min="0"
                                    :max="d.openToShip"
                                    class="form-control form-control-sm"
                                    :disabled="!progress?.actions?.canDispatch || d.openToShip <= 0"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                    </div>

                    <div class="card mb-4" v-if="(progress?.shipments || []).length">
                      <div class="card-header"><h6 class="mb-0">Shipment &amp; outstanding</h6></div>
                      <div class="card-body mt-5">
                        <div v-for="sh in progress.shipments" :key="sh.id" class="mb-3 border-bottom pb-3">
                          <div class="d-flex justify-content-between">
                            <strong>{{ sh.shipmentNumber }}</strong>
                            <span class="text-muted small">{{ sh.dispatchedAt ? new Date(sh.dispatchedAt).toLocaleString() : '' }}</span>
                          </div>
                          <div style="overflow-x:auto;">
                            <table class="table table-stripped table-responsive table-sm mt-5 mb-0" style="min-width: 920px;">
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th class="text-end">Kirim</th>
                                  <th class="text-end">Terima</th>
                                  <th class="text-end">Sisa IT</th>
                                  <th class="text-end">Nilai sisa</th>
                                  <th class="text-end text-nowrap">Terima qty</th>
                                  <th>Kondisi</th>
                                  <th class="text-end text-nowrap">Qty selisih</th>
                                  <th class="text-center">Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="it in (sh.items || [])" :key="it.id">
                                  <td class="small">{{ it.productId }} <span class="text-muted">{{ it.baseUom || 'BASE' }}</span></td>
                                  <td class="text-end">{{ it.quantity }}</td>
                                  <td class="text-end">{{ it.receivedQty }}</td>
                                  <td class="text-end">{{ it.inTransitQty ?? openQty(it) }}</td>
                                  <td class="text-end">{{ formatMoney(it.remainingValue) }}</td>
                                  <td class="text-end" style="width:5.5rem">
                                    <input
                                      v-model.number="receiveQty[it.id]"
                                      type="number"
                                      min="0"
                                      class="form-control form-control-sm"
                                      :disabled="!progress?.actions?.canReceive"
                                    />
                                  </td>
                                  <td style="width:7rem">
                                    <select v-model="receiveCondition[it.id]" class="form-select form-select-sm" :disabled="!progress?.actions?.canReceive">
                                      <option value="good">good</option>
                                      <option value="damaged">damaged</option>
                                      <option value="quarantine">quarantine</option>
                                    </select>
                                  </td>
                                  <td class="text-end" style="width:5.5rem">
                                    <input
                                      v-model.number="discrepancyQty[it.id]"
                                      type="number"
                                      min="0"
                                      class="form-control form-control-sm"
                                      :disabled="!canDiscrepancy(it)"
                                      placeholder="qty"
                                    />
                                  </td>
                                  <td class="text-center">
                                    <div class="d-inline-block">
                                      <a
                                        href="javascript:;"
                                        class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                                        :class="{ disabled: actionBusy || !canDiscrepancy(it) }"
                                        data-bs-toggle="dropdown"
                                        data-bs-popper-config='{"strategy":"fixed"}'
                                        :aria-disabled="actionBusy || !canDiscrepancy(it)"
                                      >
                                        <i class="ri-more-2-fill"></i>
                                      </a>
                                      <ul class="dropdown-menu dropdown-menu-end">
                                        <li>
                                          <a
                                            class="dropdown-item"
                                            href="javascript:void(0)"
                                            :class="{ disabled: actionBusy || !canDiscrepancy(it) }"
                                            @click.prevent="onReturnClick(it)"
                                          >
                                            <i class="ri-arrow-go-back-line me-2"></i> Return ke sumber
                                          </a>
                                        </li>
                                        <li>
                                          <a
                                            class="dropdown-item text-danger"
                                            href="javascript:void(0)"
                                            :class="{ disabled: actionBusy || !canDiscrepancy(it) }"
                                            @click.prevent="onLossClick(it)"
                                          >
                                            <i class="ri-error-warning-line me-2"></i> Catat loss
                                          </a>
                                        </li>
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <button
                            v-if="progress?.actions?.canReceive"
                            type="button"
                            class="btn btn-sm btn-success mt-2"
                            :disabled="actionBusy"
                            @click="doReceiveShipment(sh.id)"
                          >Terima shipment ini</button>
                        </div>
                        <p class="small text-muted mb-0">
                          Return = konfirmasi penerimaan fisik di gudang sumber (saldo sumber baru bertambah setelah aksi ini).
                          Loss = write-off nilai shipment via adjustment LOSS resmi. Barang damaged pada terima = received + QC hold, bukan loss.
                        </p>
                      </div>
                    </div>

                    <div class="card mb-4" v-if="(progress?.receipts || []).length">
                      <div class="card-header"><h6 class="mb-0">Riwayat penerimaan</h6></div>
                      <div class="card-body table-responsive">
                        <table class="table table-stripped table-responsive table-sm mt-5">
                          <thead>
                            <tr>
                              <th>No Receipt</th>
                              <th>Shipment</th>
                              <th>Waktu</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="rc in progress.receipts" :key="rc.id">
                              <td>{{ rc.receiptNumber }}</td>
                              <td class="small">{{ rc.shipmentId }}</td>
                              <td>{{ rc.receivedAt ? new Date(rc.receivedAt).toLocaleString() : '-' }}</td>
                              <td>{{ rc.status }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div class="card mb-4" v-if="(progress?.discrepancies || []).length">
                      <div class="card-header"><h6 class="mb-0">Riwayat keputusan (return / loss)</h6></div>
                      <div class="card-body table-responsive">
                        <table class="table table-stripped table-responsive table-sm mt-5">
                          <thead>
                            <tr>
                              <th>Tipe</th>
                              <th class="text-end">Qty</th>
                              <th class="text-end">Nilai</th>
                              <th>Alasan</th>
                              <th>Pelaksana</th>
                              <th>Waktu</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="dc in progress.discrepancies" :key="dc.id">
                              <td>{{ dc.type }}</td>
                              <td class="text-end">{{ dc.quantity }}</td>
                              <td class="text-end">{{ dc.movementValue != null ? formatMoney(dc.movementValue) : '-' }}</td>
                              <td>{{ dc.reason }}</td>
                              <td>{{ dc.resolvedBy || '-' }}</td>
                              <td>{{ dc.resolvedAt ? new Date(dc.resolvedAt).toLocaleString() : '-' }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                </div>
            </div>
            <div v-else class="alert alert-danger mt-5" role="alert">
                Stock Transfer tidak ditemukan.
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
  hidePageHeading: true,
})

import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { useStockTransferStore } from '~/stores/stock-transfer'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { normalizeApiError, toastNormalizedError } from '~/utils/apiError'

const { setDetailTitle } = useDynamicTitle()
const route = useRoute()
const toast = useToast()
const stockTransferStore = useStockTransferStore()
const { selectedStockTransfer: stockTransfer, loading, error } = storeToRefs(stockTransferStore)

const actionBusy = ref(false)
const actionError = ref('')
const dispatchQty = ref({})
const receiveQty = ref({})
const receiveCondition = ref({})
const discrepancyQty = ref({})

const progress = computed(() => stockTransfer.value?.progress || null)

function notifySuccess(title, message) {
  toast.success({
    title,
    message,
    color: 'green',
    position: 'bottomRight',
  })
}

function notifyError(raw, fallback) {
  const err = normalizeApiError(raw, fallback)
  actionError.value = err.message
  toastNormalizedError(err)
  return err
}

function openQty(it) {
  return Math.max(
    0,
    Number(it.quantity) - Number(it.receivedQty || 0) - Number(it.returnedQty || 0) - Number(it.lostQty || 0)
  )
}

function canDiscrepancy(it) {
  return (
    (progress.value?.actions?.canReturnToSource || progress.value?.actions?.canResolveLoss) &&
    openQty(it) > 0
  )
}

function formatMoney(v) {
  if (v == null || Number.isNaN(Number(v))) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v))
}

function formatNum(v) {
  if (v == null) return '-'
  return Number(v)
}

function seedInputs() {
  const dMap = {}
  for (const d of progress.value?.details || []) {
    dMap[d.id] = d.openToShip > 0 ? d.openToShip : 0
  }
  dispatchQty.value = dMap
  const rMap = {}
  const cMap = {}
  const xMap = {}
  for (const sh of progress.value?.shipments || []) {
    for (const it of sh.items || []) {
      const open = openQty(it)
      rMap[it.id] = open
      cMap[it.id] = 'good'
      xMap[it.id] = open > 0 ? Math.min(1, open) : 0
    }
  }
  receiveQty.value = rMap
  receiveCondition.value = cMap
  discrepancyQty.value = xMap
}

watch(progress, () => seedInputs(), { deep: true })

async function reload() {
  const id = route.query.id
  if (!id) return
  await stockTransferStore.fetchStockTransferById(id)
  seedInputs()
}

onMounted(async () => {
  const stockTransferId = route.query.id
  if (stockTransferId) {
    try {
      await reload()
      setDetailTitle('Stock Transfer', stockTransfer.value?.noTransfer)
    } catch (e) {
      notifyError(e, 'Gagal memuat detail stock transfer.')
    }
  } else {
    notifyError(new Error('ID Stock Transfer tidak ditemukan di URL.'), 'ID tidak ditemukan')
  }
})

onBeforeUnmount(() => {
  stockTransferStore.resetStockTransfer()
})

const cetakStockTransfer = (id) => {
  window.open(`/inventory/cetak-stock-transfer/${id}`, '_blank')
}

async function doDispatch() {
  actionError.value = ''
  actionBusy.value = true
  try {
    const lines = Object.entries(dispatchQty.value)
      .map(([detailId, quantity]) => ({ detailId, quantity: Number(quantity) }))
      .filter((l) => l.quantity > 0)
    if (!lines.length) throw new Error('Isi quantity kirim > 0')
    await stockTransferStore.dispatchStockTransfer(stockTransfer.value.id, {
      lines,
      idempotencyKey: `ui-dispatch-${stockTransfer.value.id}-${Date.now()}`,
    })
    notifySuccess('Berhasil', 'Pengiriman tercatat')
    await reload()
  } catch (e) {
    notifyError(e, 'Pengiriman gagal')
  } finally {
    actionBusy.value = false
  }
}

async function doReceive() {
  const sh = (progress.value?.shipments || []).find((s) =>
    (s.items || []).some((it) => Number(receiveQty.value[it.id] || 0) > 0)
  )
  if (!sh) {
    actionError.value = 'Pilih quantity terima pada shipment'
    toast.error({
      title: 'Validasi',
      message: actionError.value,
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  await doReceiveShipment(sh.id)
}

async function doReceiveShipment(shipmentId) {
  actionError.value = ''
  actionBusy.value = true
  try {
    const sh = (progress.value?.shipments || []).find((s) => s.id === shipmentId)
    const lines = (sh?.items || [])
      .map((it) => ({
        shipmentItemId: it.id,
        quantity: Number(receiveQty.value[it.id] || 0),
        condition: receiveCondition.value[it.id] || 'good',
      }))
      .filter((l) => l.quantity > 0)
    if (!lines.length) throw new Error('Isi quantity terima > 0')
    await stockTransferStore.receiveStockTransfer(stockTransfer.value.id, {
      shipmentId,
      lines,
      idempotencyKey: `ui-receive-${shipmentId}-${Date.now()}`,
    })
    notifySuccess('Berhasil', 'Penerimaan tercatat')
    await reload()
  } catch (e) {
    notifyError(e, 'Penerimaan gagal')
  } finally {
    actionBusy.value = false
  }
}

async function doCancelRemainder() {
  actionError.value = ''
  actionBusy.value = true
  try {
    await stockTransferStore.cancelRemainderStockTransfer(
      stockTransfer.value.id,
      'UI cancel remainder',
      `ui-cancel-${stockTransfer.value.id}-${Date.now()}`
    )
    notifySuccess('Berhasil', 'Sisa undelivered dibatalkan')
    await reload()
  } catch (e) {
    notifyError(e, 'Batalkan sisa gagal')
  } finally {
    actionBusy.value = false
  }
}

async function promptReason(title) {
  const { value } = await Swal.fire({
    title,
    input: 'textarea',
    inputPlaceholder: 'Alasan wajib',
    showCancelButton: true,
    confirmButtonText: 'Lanjut',
    inputValidator: (v) => (!v || !String(v).trim() ? 'Alasan wajib' : undefined),
  })
  return value ? String(value).trim() : null
}

async function doReturn(it) {
  actionError.value = ''
  const qty = Number(discrepancyQty.value[it.id] || 0)
  if (!(qty > 0)) {
    actionError.value = 'Isi qty return > 0'
    toast.error({ title: 'Validasi', message: actionError.value, color: 'red', position: 'bottomRight' })
    return
  }
  if (qty > openQty(it) + 0.0001) {
    actionError.value = `Qty return melebihi outstanding ${openQty(it)}`
    toast.error({ title: 'Validasi', message: actionError.value, color: 'red', position: 'bottomRight' })
    return
  }
  const reason = await promptReason('Return-to-source (konfirmasi fisik sumber)')
  if (!reason) return
  actionBusy.value = true
  try {
    await stockTransferStore.returnToSourceStockTransfer(stockTransfer.value.id, {
      shipmentItemId: it.id,
      quantity: qty,
      reason,
      idempotencyKey: `ui-return-${it.id}-${Date.now()}`,
    })
    notifySuccess('Berhasil', 'Barang dikonfirmasi kembali ke sumber')
    await reload()
  } catch (e) {
    notifyError(e, 'Return gagal')
  } finally {
    actionBusy.value = false
  }
}

async function doLoss(it) {
  actionError.value = ''
  const qty = Number(discrepancyQty.value[it.id] || 0)
  if (!(qty > 0)) {
    actionError.value = 'Isi qty loss > 0'
    toast.error({ title: 'Validasi', message: actionError.value, color: 'red', position: 'bottomRight' })
    return
  }
  if (qty > openQty(it) + 0.0001) {
    actionError.value = `Qty loss melebihi outstanding ${openQty(it)}`
    toast.error({ title: 'Validasi', message: actionError.value, color: 'red', position: 'bottomRight' })
    return
  }
  const reason = await promptReason('Catat kehilangan (disetujui)')
  if (!reason) return
  actionBusy.value = true
  try {
    await stockTransferStore.resolveLossStockTransfer(stockTransfer.value.id, {
      shipmentItemId: it.id,
      quantity: qty,
      reason,
      idempotencyKey: `ui-loss-${it.id}-${Date.now()}`,
    })
    notifySuccess('Berhasil', 'Kehilangan tercatat')
    await reload()
  } catch (e) {
    notifyError(e, 'Loss gagal')
  } finally {
    actionBusy.value = false
  }
}

function onReturnClick(it) {
  if (actionBusy.value || !canDiscrepancy(it)) return
  return doReturn(it)
}

function onLossClick(it) {
  if (actionBusy.value || !canDiscrepancy(it)) return
  return doLoss(it)
}
</script>
