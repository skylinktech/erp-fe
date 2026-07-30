<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-5">
      <div v-if="!formReady && loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat…</span>
        </div>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <NuxtLink to="/finance/payment-request" class="text-muted small text-decoration-none">
                Payment Request
              </NuxtLink>
              <span class="text-muted small">/</span>
              <span class="text-muted small">{{ pageTitle }}</span>
            </div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
          </div>
          <NuxtLink to="/finance/payment-request" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i>Kembali
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div class="col-xl-8 col-12">
            <div class="card shadow-sm border-0">
              <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2 py-3 border-0 bg-transparent">
                <h5 class="card-title mb-0">Form Payment Request</h5>
                <span class="text-muted small">Pengajuan dana ke Direktur Utama</span>
              </div>
              <div class="card-body pt-0">
                <form @submit.prevent="handleSubmit">
                  <ul class="nav nav-tabs mb-0" role="tablist">
                    <li class="nav-item">
                      <button class="nav-link active" type="button" data-bs-toggle="tab" data-bs-target="#prq-tab-info">
                        <i class="ri-information-line me-1"></i>Informasi
                      </button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" type="button" data-bs-toggle="tab" data-bs-target="#prq-tab-payee">
                        <i class="ri-bank-line me-1"></i>Penerima
                      </button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" type="button" data-bs-toggle="tab" data-bs-target="#prq-tab-items">
                        <i class="ri-list-check-2 me-1"></i>
                        Item
                        <span v-if="itemCount" class="badge bg-primary ms-1">{{ itemCount }}</span>
                      </button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" type="button" data-bs-toggle="tab" data-bs-target="#prq-tab-other">
                        <i class="ri-truck-line me-1"></i>
                        Biaya lainnya
                        <span v-if="otherChargeCount" class="badge bg-secondary ms-1">{{ otherChargeCount }}</span>
                      </button>
                    </li>
                  </ul>

                  <div class="tab-content pt-4">
                    <div id="prq-tab-info" class="tab-pane fade show active">
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Sumber Dokumen <span class="text-danger">*</span></label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.sourceType"
                            :options="sourceTypeOptions"
                            :get-option-label="(o) => o.label"
                            :reduce="(o) => o.value"
                            searchable
                            clearable
                            placeholder="Pilih PO / MRF / ARF"
                            required
                          />
                          <small class="text-muted">Hanya dokumen yang sudah disetujui yang dapat dipilih. Diskon &amp; pajak ikut terisi otomatis dari sumber.</small>
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Dokumen Referensi <span class="text-danger">*</span></label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.sourceId"
                            :options="sourceOptions"
                            :get-option-label="(o) => o.label"
                            :reduce="(o) => o.id"
                            searchable
                            clearable
                            :disabled="!form.sourceType"
                            placeholder="Cari & pilih dokumen sumber"
                            required
                            @search="onSourceSearch"
                          />
                          <div class="d-flex gap-2 mt-2">
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-primary"
                              :disabled="!form.sourceType || !form.sourceId || loadingSource"
                              @click="onLoadSource"
                            >
                              <span v-if="loadingSource" class="spinner-border spinner-border-sm me-1"></span>
                              <i v-else class="ri-download-line me-1"></i>
                              Muat Data dari Sumber
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tanggal Request</label>
                        <div class="col-sm-9">
                          <input v-model="form.requestDate" type="date" class="form-control" required />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tanggal Dibutuhkan</label>
                        <div class="col-sm-9">
                          <input v-model="form.neededDate" type="date" class="form-control" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Due Date / Jatuh Tempo</label>
                        <div class="col-sm-9">
                          <input v-model="form.dueDate" type="date" class="form-control" />
                          <small class="text-muted">Tanggal jatuh tempo pembayaran.</small>
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Prioritas</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.priority"
                            :options="priorityOptions"
                            :get-option-label="(o) => o.label"
                            :reduce="(o) => o.value"
                            searchable
                            clearable
                            placeholder="Prioritas"
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Mata Uang</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.currency"
                            :options="currencyOptions"
                            :get-option-label="(o) => o.label"
                            :reduce="(o) => o.value"
                            searchable
                            clearable
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Diskon (%)</label>
                        <div class="col-sm-9">
                          <input
                            v-model.number="form.discountPercent"
                            type="number"
                            min="0"
                            step="0.01"
                            class="form-control"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Pajak</label>
                        <div class="col-sm-9">
                          <div class="border rounded p-3">
                            <div class="form-check form-switch mb-2">
                              <input
                                id="prqApplyTax"
                                v-model="form.applyTax"
                                class="form-check-input"
                                type="checkbox"
                              >
                              <label class="form-check-label fw-semibold" for="prqApplyTax">
                                Gunakan Tax Master
                              </label>
                            </div>

                            <template v-if="form.applyTax">
                              <label class="form-label">Pajak (Tax Master)</label>
                              <CustomSelect2
                                v-model="form.taxMasterIds"
                                :options="taxMasterOptions"
                                :get-option-label="taxMasterLabel"
                                :reduce="(o) => o.id"
                                :loading="loadingTaxes"
                                searchable
                                clearable
                                multiple
                                :close-on-select="false"
                                placeholder="Pilih satu atau lebih pajak"
                                no-options-text="Tidak ada tax master aktif"
                              />

                              <div v-if="selectedTaxPreviews.length" class="mt-3">
                                <div class="small text-muted mb-2">Perkiraan dari DPP</div>
                                <div
                                  v-for="tax in selectedTaxPreviews"
                                  :key="tax.id"
                                  class="d-flex justify-content-between align-items-start border-bottom py-2 gap-2"
                                >
                                  <div>
                                    <div class="fw-semibold">{{ tax.code }} — {{ tax.name }}</div>
                                    <small class="text-muted">
                                      {{ tax.type }} · {{ formatTaxRate(tax) }}
                                    </small>
                                  </div>
                                  <div class="text-end fw-medium">
                                    {{ formatRupiah(previewTaxAmount(tax)) }}
                                  </div>
                                </div>
                              </div>
                              <p v-else class="text-muted small mb-0 mt-2">
                                Pilih pajak untuk menampilkan tarif dari Tax Master.
                              </p>
                            </template>

                            <template v-else>
                              <label class="form-label">Pajak / PPN (%)</label>
                              <input
                                v-model.number="form.taxPercent"
                                type="number"
                                min="0"
                                step="0.01"
                                class="form-control"
                                placeholder="Contoh: 11"
                              />
                              <small class="text-muted">Nilai pajak dihitung dari DPP (subtotal setelah diskon).</small>
                            </template>
                          </div>
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Departemen</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.departmentId"
                            :options="departemens"
                            :get-option-label="(d) => d?.nm_departemen || d?.nmDepartemen || ''"
                            :reduce="(d) => d?.id"
                            searchable
                            clearable
                            placeholder="Pilih departemen"
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Keperluan / Tujuan</label>
                        <div class="col-sm-9">
                          <textarea
                            v-model="form.purpose"
                            class="form-control"
                            rows="2"
                            placeholder="Contoh: Pembayaran vendor atas PO bulan ini"
                          ></textarea>
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Catatan</label>
                        <div class="col-sm-9">
                          <textarea v-model="form.notes" class="form-control" rows="2" placeholder="Catatan tambahan"></textarea>
                        </div>
                      </div>
                    </div>

                    <div id="prq-tab-payee" class="tab-pane fade">
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Nama Penerima</label>
                        <div class="col-sm-9">
                          <input v-model="form.payeeName" type="text" class="form-control" placeholder="Nama penerima dana / vendor" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Bank</label>
                        <div class="col-sm-9">
                          <input v-model="form.bankName" type="text" class="form-control" placeholder="Nama bank" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">No. Rekening</label>
                        <div class="col-sm-9">
                          <input v-model="form.bankAccountNumber" type="text" class="form-control" placeholder="Nomor rekening" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Atas Nama</label>
                        <div class="col-sm-9">
                          <input v-model="form.bankAccountName" type="text" class="form-control" placeholder="Nama pemilik rekening" />
                        </div>
                      </div>
                    </div>

                    <div id="prq-tab-items" class="tab-pane fade">
                      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                        <p class="mb-0 text-muted small">
                          Item pengajuan dana. Bisa dimuat otomatis dari dokumen sumber.
                        </p>
                        <button type="button" class="btn btn-sm btn-primary" @click="paymentRequestStore.addItem()">
                          <i class="ri-add-line me-1"></i>Tambah Item
                        </button>
                      </div>

                      <div v-if="!form.paymentRequestItems.length" class="text-center py-5 border rounded text-muted">
                        <i class="ri-inbox-line fs-3 d-block mb-2"></i>
                        Belum ada item. Muat dari sumber atau klik <strong>Tambah Item</strong>.
                      </div>

                      <div v-else class="table-responsive border rounded">
                        <table class="table table-sm table-hover mb-0">
                          <thead class="table-light">
                            <tr>
                              <th style="width: 40px;">#</th>
                              <th>Deskripsi</th>
                              <th style="width: 90px;">Qty</th>
                              <th style="width: 140px;">Nominal</th>
                              <th style="width: 140px;">Subtotal</th>
                              <th>Catatan</th>
                              <th style="width: 48px;"></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(item, index) in form.paymentRequestItems" :key="index">
                              <td>{{ index + 1 }}</td>
                              <td>
                                <input v-model="item.description" type="text" class="form-control form-control-sm" required />
                              </td>
                              <td>
                                <input
                                  v-model.number="item.qty"
                                  type="number"
                                  min="0.01"
                                  step="any"
                                  class="form-control form-control-sm"
                                  @input="paymentRequestStore.updateItemAmount(index)"
                                />
                              </td>
                              <td>
                                <input
                                  :value="formatRupiah(item.unitAmount)"
                                  type="text"
                                  class="form-control form-control-sm text-end"
                                  @input="onAmountInput(index, $event)"
                                />
                              </td>
                              <td class="text-end fw-medium align-middle">{{ formatRupiah(item.subtotal) }}</td>
                              <td>
                                <input v-model="item.remarks" type="text" class="form-control form-control-sm" />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  class="btn btn-sm btn-icon btn-text-danger"
                                  @click="paymentRequestStore.removeItem(index)"
                                >
                                  <i class="ri-delete-bin-line"></i>
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div class="d-flex justify-content-end mt-3">
                        <div class="prq-items-totals">
                          <div class="d-flex justify-content-between gap-4 py-1">
                            <span class="text-muted">Subtotal sumber</span>
                            <span class="fw-medium text-end">{{ formatRupiah(itemsSubtotal) }}</span>
                          </div>
                          <div v-if="otherChargesSubtotal > 0" class="d-flex justify-content-between gap-4 py-1">
                            <span class="text-muted">Biaya lainnya</span>
                            <span class="fw-medium text-end">{{ formatRupiah(otherChargesSubtotal) }}</span>
                          </div>
                          <div class="d-flex justify-content-between gap-4 py-1">
                            <span class="text-muted">
                              Diskon
                              <template v-if="Number(form.discountPercent) > 0">({{ form.discountPercent }}%)</template>
                            </span>
                            <span class="fw-medium text-end">
                              <template v-if="Number(form.discountPercent) > 0">-{{ formatRupiah(discountAmount) }}</template>
                              <template v-else>—</template>
                            </span>
                          </div>
                          <div class="d-flex justify-content-between gap-4 py-1">
                            <span class="text-muted">DPP</span>
                            <span class="fw-medium text-end">{{ formatRupiah(dppAmount) }}</span>
                          </div>
                          <template v-if="form.applyTax && selectedTaxPreviews.length">
                            <div
                              v-for="tax in selectedTaxPreviews"
                              :key="`total-${tax.id}`"
                              class="d-flex justify-content-between gap-4 py-1"
                            >
                              <span class="text-muted">
                                {{ tax.code }}
                                <small>({{ formatTaxRate(tax) }})</small>
                              </span>
                              <span class="fw-medium text-end">{{ formatRupiah(previewTaxAmount(tax)) }}</span>
                            </div>
                          </template>
                          <div v-else class="d-flex justify-content-between gap-4 py-1">
                            <span class="text-muted">
                              Pajak / PPN
                              <template v-if="Number(form.taxPercent) > 0">({{ form.taxPercent }}%)</template>
                            </span>
                            <span class="fw-medium text-end">
                              <template v-if="Number(form.taxPercent) > 0">{{ formatRupiah(taxAmount) }}</template>
                              <template v-else>—</template>
                            </span>
                          </div>
                          <div class="d-flex justify-content-between gap-4 py-2 mt-1 border-top">
                            <span class="fw-bold">Grand Total</span>
                            <span class="fw-bold text-primary text-end">{{ formatRupiah(grandTotal) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div id="prq-tab-other" class="tab-pane fade">
                      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                        <p class="mb-0 text-muted small">
                          Biaya di luar dokumen sumber (ongkir, transportasi, materai, dll). Tidak terhapus saat muat ulang sumber.
                        </p>
                        <button type="button" class="btn btn-sm btn-primary" @click="paymentRequestStore.addOtherCharge()">
                          <i class="ri-add-line me-1"></i>Tambah Biaya
                        </button>
                      </div>

                      <div v-if="!form.otherCharges.length" class="text-center py-5 border rounded text-muted">
                        <i class="ri-truck-line fs-3 d-block mb-2"></i>
                        Belum ada biaya tambahan. Klik <strong>Tambah Biaya</strong> untuk menambah.
                      </div>

                      <div v-else class="table-responsive border rounded">
                        <table class="table table-sm table-hover mb-0">
                          <thead class="table-light">
                            <tr>
                              <th style="width: 40px;">#</th>
                              <th>Deskripsi</th>
                              <th style="width: 90px;">Qty</th>
                              <th style="width: 140px;">Nominal</th>
                              <th style="width: 140px;">Subtotal</th>
                              <th>Catatan</th>
                              <th style="width: 48px;"></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(item, index) in form.otherCharges" :key="`other-${index}`">
                              <td>{{ index + 1 }}</td>
                              <td>
                                <input
                                  v-model="item.description"
                                  type="text"
                                  class="form-control form-control-sm"
                                  placeholder="Contoh: Ongkos kirim / Uang transport"
                                />
                              </td>
                              <td>
                                <input
                                  v-model.number="item.qty"
                                  type="number"
                                  min="0.01"
                                  step="any"
                                  class="form-control form-control-sm"
                                  @input="paymentRequestStore.updateOtherChargeAmount(index)"
                                />
                              </td>
                              <td>
                                <input
                                  :value="formatRupiah(item.unitAmount)"
                                  type="text"
                                  class="form-control form-control-sm text-end"
                                  @input="onOtherAmountInput(index, $event)"
                                />
                              </td>
                              <td class="text-end fw-medium align-middle">{{ formatRupiah(item.subtotal) }}</td>
                              <td>
                                <input v-model="item.remarks" type="text" class="form-control form-control-sm" />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  class="btn btn-sm btn-icon btn-text-danger"
                                  @click="paymentRequestStore.removeOtherCharge(index)"
                                >
                                  <i class="ri-delete-bin-line"></i>
                                </button>
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr class="table-light">
                              <td colspan="4" class="text-end fw-semibold">Total biaya lainnya</td>
                              <td class="text-end fw-bold">{{ formatRupiah(otherChargesSubtotal) }}</td>
                              <td colspan="2"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex flex-wrap justify-content-end gap-2 mt-4 pt-3 border-top">
                    <NuxtLink to="/finance/payment-request" class="btn btn-outline-secondary">Batal</NuxtLink>
                    <button type="submit" class="btn btn-primary" :disabled="saving">
                      <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else class="ri-save-line me-1"></i>
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-12">
            <FormPageSidebar
              summary-title="Ringkasan"
              summary-icon="ri-file-info-line"
              nav-title="Modul Finance"
              nav-icon="ri-wallet-3-line"
              :summary-rows="summaryRows"
              :nav-items="moduleNav"
            >
              <template #append>
                <div class="card border-0 bg-label-primary">
                  <div class="card-body small">
                    <strong class="d-flex align-items-center gap-1 mb-2">
                      <i class="ri-lightbulb-line"></i>
                      Tips
                    </strong>
                    <ul class="mb-0 ps-3">
                      <li>Pilih sumber dokumen yang sudah <strong>approved</strong>.</li>
                      <li>Gunakan <strong>Muat Data dari Sumber</strong> untuk mengisi item otomatis.</li>
                      <li>Tambahkan ongkir/transport di tab <strong>Biaya lainnya</strong> (tidak terhapus saat muat ulang sumber).</li>
                      <li>Setelah draft tersimpan, submit agar masuk ke alur Finance → Direktur Utama.</li>
                    </ul>
                  </div>
                </div>
              </template>
            </FormPageSidebar>
          </div>
        </div>
      </template>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  usePaymentRequestStore,
  getSourceTypeLabel,
  type PaymentRequestSourceType,
  type PaymentRequestSourceOption,
} from '~/stores/payment-request'
import { useTaxMasterStore } from '~/stores/tax-masters'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import FormPageSidebar from '~/components/form/FormPageSidebar.vue'
import { FINANCE_MODULE_NAV } from '~/constants/finance/formNav'
import type { FormPageSummaryRow } from '~/types/form-page'

const route = useRoute()
const paymentRequestStore = usePaymentRequestStore()
const taxMasterStore = useTaxMasterStore()
const formatRupiah = useFormatRupiah()

const { form, isEditMode, loading, saving } = storeToRefs(paymentRequestStore)
const formReady = ref(false)
const loadingSource = ref(false)
const loadingTaxes = ref(false)
const sourceOptions = ref<PaymentRequestSourceOption[]>([])
const taxMasterOptions = ref<any[]>([])
const departemens = ref<any[]>([])

const moduleNav = FINANCE_MODULE_NAV
const itemsSubtotal = computed(() => paymentRequestStore.formItemsSubtotal)
const otherChargesSubtotal = computed(() => paymentRequestStore.formOtherChargesSubtotal)
const discountAmount = computed(() => paymentRequestStore.formDiscountAmount)
const dppAmount = computed(() => paymentRequestStore.formDpp)
const itemCount = computed(() => form.value?.paymentRequestItems?.length ?? 0)
const otherChargeCount = computed(() => form.value?.otherCharges?.length ?? 0)

const selectedTaxPreviews = computed(() => {
  const ids = new Set(form.value.taxMasterIds || [])
  return (taxMasterOptions.value || []).filter((t) => ids.has(t.id))
})

const taxMasterLabel = (o: any) => {
  if (!o) return ''
  const rate =
    o.calculationType === 'FIXED'
      ? formatRupiah(o.defaultRate || 0)
      : `${Number(o.defaultRate || 0)}%`
  return `${o.code} — ${o.name} (${rate})`
}

const formatTaxRate = (tax: any) => {
  if (!tax) return '—'
  if (tax.calculationType === 'FIXED') return formatRupiah(tax.defaultRate || 0)
  return `${Number(tax.defaultRate || 0)}%`
}

function previewTaxAmount(tax: any) {
  const rate = Number(tax?.defaultRate || 0)
  const dpp = dppAmount.value
  if (tax?.calculationType === 'FIXED') {
    return tax?.type === 'WITHHOLDING' ? -Math.abs(rate) : Math.abs(rate)
  }
  const pct = (dpp * rate) / 100
  return tax?.type === 'WITHHOLDING' ? -Math.abs(pct) : Math.abs(pct)
}

const taxMasterPreviewTotal = computed(() =>
  selectedTaxPreviews.value.reduce((sum, tax) => sum + previewTaxAmount(tax), 0)
)
const taxAmount = computed(() =>
  form.value.applyTax ? taxMasterPreviewTotal.value : paymentRequestStore.formTaxAmount
)
const grandTotal = computed(() => dppAmount.value + taxAmount.value)

const pageTitle = computed(() => (isEditMode.value ? 'Edit Payment Request' : 'Tambah Payment Request'))
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Perbarui pengajuan dana sebelum di-submit ke Direktur Utama.'
    : 'Buat pengajuan dana dari PO, MRF, atau ARF untuk persetujuan Direktur Utama.'
)

const sourceTypeOptions = [
  { label: 'Purchase Order', value: 'purchase_order' },
  { label: 'Material Request Form', value: 'material_request' },
  { label: 'Advanced Request Form', value: 'arf' },
]
const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]
const currencyOptions = [
  { label: 'IDR', value: 'IDR' },
  { label: 'USD', value: 'USD' },
]

function formatDateId(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function findDepartemenName(id: number | null | undefined): string {
  if (!id) return '—'
  const d = departemens.value.find((x) => Number(x.id) === Number(id))
  return d?.nm_departemen || d?.nmDepartemen || '—'
}

const summaryRows = computed<FormPageSummaryRow[]>(() => {
  const f = form.value
  return [
    { label: 'Mode', value: isEditMode.value ? 'Edit' : 'Baru' },
    { label: 'Sumber', value: getSourceTypeLabel(f.sourceType) },
    { label: 'No. Dokumen', value: f.sourceNumber || '—' },
    { label: 'Tgl request', value: formatDateId(f.requestDate) },
    { label: 'Dibutuhkan', value: formatDateId(f.neededDate) },
    { label: 'Jatuh tempo', value: formatDateId(f.dueDate) },
    { label: 'Penerima', value: f.payeeName || '—' },
    { label: 'Departemen', value: findDepartemenName(f.departmentId) },
    { label: 'Jumlah item', value: String(itemCount.value) },
    { label: 'Biaya lainnya', value: otherChargeCount.value ? String(otherChargeCount.value) : '—' },
    { label: 'Subtotal sumber', value: formatRupiah(itemsSubtotal.value) },
    {
      label: 'Biaya lainnya (Rp)',
      value: otherChargesSubtotal.value > 0 ? formatRupiah(otherChargesSubtotal.value) : '—',
    },
    {
      label: 'Diskon',
      value:
        Number(f.discountPercent) > 0
          ? `${f.discountPercent}% (−${formatRupiah(discountAmount.value)})`
          : '—',
    },
    {
      label: 'Pajak',
      value: form.value.applyTax
        ? selectedTaxPreviews.value.length
          ? `${selectedTaxPreviews.value.map((t) => t.code).join(', ')} (${formatRupiah(taxAmount.value)})`
          : 'Tax Master (belum dipilih)'
        : Number(f.taxPercent) > 0
          ? `${f.taxPercent}% (${formatRupiah(taxAmount.value)})`
          : '—',
    },
    { label: 'Total', value: formatRupiah(grandTotal.value) },
  ]
})

function onAmountInput(index: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const row = form.value.paymentRequestItems[index]
  if (row) {
    row.unitAmount = Number(raw) || 0
    paymentRequestStore.updateItemAmount(index)
  }
}

function onOtherAmountInput(index: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const row = form.value.otherCharges[index]
  if (row) {
    row.unitAmount = Number(raw) || 0
    paymentRequestStore.updateOtherChargeAmount(index)
  }
}

async function loadSources(search = '') {
  if (!form.value.sourceType) {
    sourceOptions.value = []
    return
  }
  try {
    sourceOptions.value = await paymentRequestStore.searchSources(
      form.value.sourceType as PaymentRequestSourceType,
      search
    )
  } catch {
    sourceOptions.value = []
  }
}

function onSourceSearch(query: string) {
  if (query.length >= 1) loadSources(query)
}

async function onLoadSource() {
  if (!form.value.sourceType || !form.value.sourceId) return
  loadingSource.value = true
  try {
    await paymentRequestStore.loadSourceIntoForm(
      form.value.sourceType as PaymentRequestSourceType,
      form.value.sourceId
    )
  } finally {
    loadingSource.value = false
  }
}

watch(
  () => form.value.sourceType,
  async (type, prev) => {
    if (type !== prev) {
      if (!isEditMode.value || prev != null) {
        form.value.sourceId = null
        form.value.sourceNumber = ''
      }
      await loadSources()
    }
  }
)

watch(
  () => form.value.sourceId,
  async (id, prev) => {
    const opt = sourceOptions.value.find((o) => String(o.id) === String(id))
    if (opt) form.value.sourceNumber = opt.number
    // Auto-muat item + diskon/pajak saat user memilih dokumen referensi
    if (id && id !== prev && form.value.sourceType && !isEditMode.value) {
      await onLoadSource()
    } else if (id && id !== prev && form.value.sourceType && isEditMode.value && prev != null) {
      await onLoadSource()
    }
  }
)

watch(
  () => form.value.applyTax,
  (on) => {
    if (!on) form.value.taxMasterIds = []
    else form.value.taxPercent = 0
  }
)

async function loadTaxMasters() {
  loadingTaxes.value = true
  try {
    taxMasterOptions.value = await taxMasterStore.fetchActiveOptions()
  } catch {
    taxMasterOptions.value = []
  } finally {
    loadingTaxes.value = false
  }
}

async function loadMasterData() {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.dataDepartemen(), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json()
    departemens.value = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
  } catch {
    departemens.value = []
  }
  await loadTaxMasters()
}

async function handleSubmit() {
  const savedId = await paymentRequestStore.savePaymentRequest()
  if (savedId) navigateTo(`/finance/payment-request/detail/${savedId}`)
}

onMounted(async () => {
  paymentRequestStore.resetForm()
  await loadMasterData()
  const id = route.params.id ? String(route.params.id) : ''
  if (id) {
    await paymentRequestStore.fetchPaymentRequestForEdit(id)
    if (form.value.sourceType) await loadSources()
  } else if (!form.value.paymentRequestItems.length) {
    paymentRequestStore.addItem()
  }
  formReady.value = true
})
</script>

<style scoped>
.prq-items-totals {
  min-width: 280px;
  font-size: 0.925rem;
}
.prq-items-totals .text-end {
  min-width: 120px;
}
</style>
