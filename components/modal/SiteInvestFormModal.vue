<template>
  <Modal
    :id="modalId"
    :title="modalTitle"
    :description="modalDescription"
    :validation-errors-from-parent="validationErrors"
    dialog-class="modal-xl"
  >
    <template #default>
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col">
            <ul class="nav nav-tabs" role="tablist">
              <li class="nav-item">
                <button class="nav-link active" data-bs-toggle="tab" :data-bs-target="`#${modalId}-form-tabs-info`" role="tab" aria-selected="true" type="button">
                  <span class="ri-information-line ri-20px d-sm-none"></span>
                  <span class="d-none d-sm-block">Informasi</span>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" :data-bs-target="`#${modalId}-form-tabs-materials`" role="tab" aria-selected="false" type="button">
                  <span class="ri-box-line ri-20px d-sm-none"></span>
                  <span class="d-none d-sm-block">Material/Product</span>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" :data-bs-target="`#${modalId}-form-tabs-services`" role="tab" aria-selected="false" type="button">
                  <span class="ri-service-line ri-20px d-sm-none"></span>
                  <span class="d-none d-sm-block">Services</span>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" :data-bs-target="`#${modalId}-form-tabs-dids`" role="tab" aria-selected="false" type="button">
                  <span class="ri-truck-line ri-20px d-sm-none"></span>
                  <span class="d-none d-sm-block">DID (Delivery/Installation)</span>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" :data-bs-target="`#${modalId}-form-tabs-budgets`" role="tab" aria-selected="false" type="button">
                  <span class="ri-money-dollar-circle-line ri-20px d-sm-none"></span>
                  <span class="d-none d-sm-block">Budget</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="tab-content pt-6">
          <!-- Tab Info -->
          <div class="tab-pane fade active show" :id="`${modalId}-form-tabs-info`" role="tabpanel">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" v-model="form.name" class="form-control" placeholder="Nama Site Investment" required>
                  <label>Nama Site Investment</label>
                </div>
              </div>
              <div class="col-md-6">
                <CustomSelect2
                  v-model="form.customerId"
                  :options="customers"
                  :get-option-label="getCustomerLabel"
                  :reduce="getCustomerId"
                  placeholder="Pilih Customer"
                  searchable
                  clearable
                />
              </div>
              <div class="col-md-6">
                <CustomSelect2
                  v-model="form.siteId"
                  :options="sites"
                  :get-option-label="getSiteLabel"
                  :reduce="getSiteId"
                  placeholder="Pilih Site"
                  searchable
                  clearable
                  @update:modelValue="onSiteChange"
                />
              </div>
              <div class="col-md-6">
                <CustomSelect2
                  v-model="form.businessSchemeId"
                  :options="businessSchemes"
                  :get-option-label="getBranchLabel"
                  :reduce="getBranchId"
                  placeholder="Pilih Business Scheme"
                  searchable
                  clearable
                />
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">Isi dari FDR</label>
                <CustomSelect2
                  v-model="form.fdrId"
                  :options="fdrsForSelect"
                  :get-option-label="getFdrLabel"
                  :reduce="getFdrId"
                  placeholder="Pilih FDR untuk mengisi Material, Service, DID, dan data lainnya"
                  searchable
                  clearable
                  @update:modelValue="onFdrSelect"
                />
                <small class="text-muted">Pilih FDR untuk mengisi tab Material/Product, Services, DID dan informasi project secara otomatis.</small>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">Isi dari Price List</label>
                <CustomSelect2
                  v-model="selectedPriceListId"
                  :options="priceListOptions"
                  :get-option-label="getPriceListLabel"
                  :reduce="getPriceListId"
                  placeholder="Pilih Price List untuk mengisi Material, Service, DID"
                  searchable
                  clearable
                  @update:modelValue="onPriceListSelect"
                />
                <small class="text-muted">Pilih untuk mengisi tab Material/Product, Services, dan DID secara otomatis.</small>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" v-model="form.location" class="form-control" placeholder="Lokasi" required>
                  <label>Lokasi</label>
                </div>
              </div>
              <div class="col-md-3">
                <CustomSelect2
                  v-model="form.priority"
                  :options="priorityOptions"
                  :get-option-label="getOptionLabel"
                  :reduce="getOptionValue"
                  placeholder="Pilih Priority"
                  searchable
                  clearable
                />
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="date" v-model="form.siDate" class="form-control">
                  <label>Tanggal SI</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input type="date" v-model="form.estimatedStartDate" class="form-control">
                  <label>Estimasi Mulai</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input type="date" v-model="form.estimatedCompletionDate" class="form-control">
                  <label>Estimasi Selesai</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="text" v-model="form.lat" class="form-control" placeholder="Latitude">
                  <label>Latitude</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="text" v-model="form.long" class="form-control" placeholder="Longitude">
                  <label>Longitude</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input
                    type="text"
                    :value="formatRupiah(form.marketingFee)"
                    @input="onMarketingFeeInput"
                    @blur="onMarketingFeeBlur"
                    class="form-control"
                    placeholder="Rp 0"
                  >
                  <label>Marketing Fee</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <textarea v-model="form.notes" class="form-control" placeholder="Catatan" rows="3"></textarea>
                  <label>Notes</label>
                </div>
              </div>
              <div class="col-md-6">
                <CustomSelect2
                  v-model="form.preparedByIds"
                  :options="pegawaiOptions"
                  :get-option-label="getPegawaiLabel"
                  :reduce="getPegawaiId"
                  placeholder="Prepared by (bisa lebih dari satu)"
                  searchable
                  clearable
                  multiple
                />
                <small class="text-muted">Pilih satu atau lebih pegawai yang menyiapkan Site Investment ini.</small>
              </div>
              <div class="col-md-12">
                <div class="form-floating form-floating-outline">
                  <input
                    type="file"
                    @change="onAttachmentChange"
                    class="form-control"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                  >
                  <label>Attachment (PDF, Excel, Word, Image)</label>
                  <small class="text-muted d-block mt-1">Maks. 2MB. Format: jpg, png, pdf, doc, docx, xls, xlsx, csv</small>
                  <div v-if="form.attachmentPreview" class="mt-2">
                    <a :href="form.attachmentPreview" target="_blank" rel="noopener noreferrer" class="d-block mb-1">Lihat Attachment</a>
                    <img v-if="isAttachmentPreviewImage(form)" :src="form.attachmentPreview" alt="Preview" class="attachment-preview" style="height: 60px; max-width: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;">
                  </div>
                </div>
              </div>

              <!-- Total Investment Summary -->
              <div class="col-12 mt-5">
                <div class="investment-summary-card">
                  <h6 class="investment-summary-title">
                    <i class="ri-pie-chart-2-line me-2"></i>
                    Ringkasan Total Investasi
                  </h6>

                  <div class="investment-summary-body">
                    <div class="investment-summary-row">
                      <span class="investment-summary-label">Managed Service</span>
                      <span class="investment-summary-value">{{ formatRupiah(serviceSubtotal) }}</span>
                    </div>
                    <div class="investment-summary-row">
                      <span class="investment-summary-label">Material</span>
                      <span class="investment-summary-value">{{ formatRupiah(materialSubtotal) }}</span>
                    </div>
                    <div class="investment-summary-row">
                      <span class="investment-summary-label">DID (Delivery/Installation)</span>
                      <span class="investment-summary-value">{{ formatRupiah(didSubtotal) }}</span>
                    </div>

                    <div class="investment-summary-divider"></div>

                    <div class="investment-summary-row investment-summary-row-total">
                      <span class="investment-summary-label">Total Investasi</span>
                      <span class="investment-summary-value">{{ formatRupiah(totalInvestment) }}</span>
                    </div>

                    <div class="investment-summary-row">
                      <span class="investment-summary-label">Marketing Fee</span>
                      <span class="investment-summary-value">{{ formatRupiah(marketingFeeAmount) }}</span>
                    </div>

                    <div class="investment-summary-divider"></div>

                    <div class="investment-summary-row investment-summary-row-grand">
                      <span class="investment-summary-label">Grand Total</span>
                      <span class="investment-summary-value">{{ formatRupiah(grandTotal) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Materials -->
          <div class="tab-pane fade" :id="`${modalId}-form-tabs-materials`" role="tabpanel">
            <div v-for="(item, index) in form.siteInvestMaterials" :key="index" class="repeater-item mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-muted fw-medium">Item #{{ index + 1 }}</span>
                <button class="btn btn-sm btn-outline-danger" @click.prevent="siteInvestStore.removeMaterialItem(index)" type="button" title="Hapus item">
                  <i class="ri-delete-bin-line me-1"></i> Hapus
                </button>
              </div>
              <div class="row g-3">
                <div class="col-md-12 form-check mb-2 pl-3">
                  <input class="form-check-input" type="checkbox" v-model="item.isPriceOverridden" :id="`customPriceMaterial${modalId}${index}`">
                  <label class="form-check-label" :for="`customPriceMaterial${modalId}${index}`">Custom Price</label>
                </div>
                <div class="col-md-6">
                  <CustomSelect2
                    v-model="item.priceListLineId"
                    :options="priceListLinesProduct"
                    :get-option-label="getMaterialLineLabel"
                    :reduce="getMaterialLineId"
                    placeholder="Pilih Product (dari Price List)"
                    searchable
                    clearable
                    @update:modelValue="onMaterialLineChange(index, $event)"
                  />
                </div>
                <div class="col-md-1">
                  <div class="form-floating form-floating-outline">
                    <input type="number" v-model.number="item.quantity" @input="calculateMaterialSubtotal(index)" class="form-control" placeholder="Qty" min="0.01" step="0.01">
                    <label>Qty</label>
                  </div>
                </div>
                <div class="col-md-2">
                  <div class="form-floating form-floating-outline">
                    <input
                      type="text"
                      :value="formatRupiah(item.price)"
                      @input="updateMaterialPriceFromInput(index, $event)"
                      class="form-control"
                      placeholder="Harga"
                      :readonly="!item.isPriceOverridden"
                      :class="getReadonlyInputClass(item)"
                    >
                    <label>Harga Satuan</label>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="form-floating form-floating-outline">
                    <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" placeholder="Subtotal" readonly>
                    <label>Subtotal</label>
                  </div>
                </div>
                <div class="col-md-12" v-if="item.isPriceOverridden">
                  <div class="form-floating form-floating-outline">
                    <textarea v-model="item.priceReason" class="form-control" placeholder="Alasan custom price" rows="2"></textarea>
                    <label>Alasan Custom Price <span class="text-danger">*</span></label>
                  </div>
                </div>
                <div class="col-md-12" v-if="isMaterialStockInsufficientRow(index)" role="alert">
                  <div class="alert alert-danger py-2 mb-0">
                    <i class="ri-error-warning-line me-1"></i>
                    Stock pada product ini tidak mencukupi.
                  </div>
                </div>
              </div>
              <hr class="my-4">
            </div>
            <div class="mt-4">
              <button @click.prevent="siteInvestStore.addMaterialItem()" class="btn btn-primary">Tambah Material</button>
            </div>
            <div class="d-flex justify-content-end mt-4">
              <span class="fw-bold fs-5">Subtotal Material: {{ formatRupiah(materialSubtotal) }}</span>
            </div>
          </div>

          <!-- Tab Services -->
          <div class="tab-pane fade" :id="`${modalId}-form-tabs-services`" role="tabpanel">
            <div v-for="(item, index) in form.siteInvestServices" :key="index" class="repeater-item mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-muted fw-medium">Item #{{ index + 1 }}</span>
                <button class="btn btn-sm btn-outline-danger" @click.prevent="siteInvestStore.removeServiceItem(index)" type="button" title="Hapus item">
                  <i class="ri-delete-bin-line me-1"></i> Hapus
                </button>
              </div>
              <div class="row g-3">
                <div class="col-md-12 form-check mb-2 pl-3">
                  <input class="form-check-input" type="checkbox" v-model="item.isPriceOverridden" :id="`customPriceService${modalId}${index}`">
                  <label class="form-check-label" :for="`customPriceService${modalId}${index}`">Custom Price</label>
                </div>
                <div class="col-md-6">
                  <CustomSelect2
                    v-model="item.priceListLineId"
                    :options="priceListLinesService"
                    :get-option-label="getServiceLineLabel"
                    :reduce="getServiceLineId"
                    placeholder="Pilih Service (dari Price List)"
                    searchable
                    clearable
                    @update:modelValue="onServiceLineChange(index, $event)"
                  />
                </div>
                <div class="col-md-1">
                  <div class="form-floating form-floating-outline">
                    <input type="number" v-model.number="item.quantity" @input="calculateServiceSubtotal(index)" class="form-control" placeholder="Qty" min="0.01" step="0.01">
                    <label>Qty</label>
                  </div>
                </div>
                <div class="col-md-2">
                  <div class="form-floating form-floating-outline">
                    <input
                      type="text"
                      :value="formatRupiah(item.price)"
                      @input="updateServicePriceFromInput(index, $event)"
                      class="form-control"
                      placeholder="Harga Satuan"
                      :readonly="!item.isPriceOverridden"
                      :class="getReadonlyInputClass(item)"
                    >
                    <label>Harga Satuan</label>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="form-floating form-floating-outline">
                    <input type="text" :value="getServiceTerminalKitDisplay(item, index)" class="form-control bg-light" readonly placeholder="Terminal Kit">
                    <label>Terminal Kit</label>
                  </div>
                </div>
              </div>
              <div class="row g-3 mt-3">
                <div class="col-6 col-md-3">
                  <div class="form-floating form-floating-outline">
                    <input type="text" :value="getServiceQuotaPriorityDisplay(item, index)" class="form-control bg-light" readonly placeholder="Quota Priority">
                    <label>Quota Priority</label>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="form-floating form-floating-outline">
                    <input type="text" :value="getServiceNewServiceLineDisplay(item, index)" class="form-control bg-light" readonly placeholder="New Service Line">
                    <label>New Service Line</label>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="form-floating form-floating-outline">
                    <input type="text" :value="getServiceAdditionalDataDisplay(item, index)" class="form-control bg-light" readonly placeholder="Additional Data">
                    <label>Additional Data</label>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="form-floating form-floating-outline">
                    <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" placeholder="Subtotal" readonly>
                    <label>Subtotal</label>
                  </div>
                </div>
                <div class="col-md-12" v-if="item.isPriceOverridden">
                  <div class="form-floating form-floating-outline">
                    <textarea v-model="item.priceReason" class="form-control" placeholder="Alasan custom price" rows="2"></textarea>
                    <label>Alasan Custom Price <span class="text-danger">*</span></label>
                  </div>
                </div>
              </div>
              <hr class="my-4">
            </div>
            <div class="mt-4">
              <button @click.prevent="siteInvestStore.addServiceItem()" class="btn btn-primary">Tambah Service</button>
            </div>
            <div class="d-flex justify-content-end mt-4">
              <span class="fw-bold fs-5">Subtotal Service: {{ formatRupiah(serviceSubtotal) }}</span>
            </div>
          </div>

          <!-- Tab DIDs -->
          <div class="tab-pane fade" :id="`${modalId}-form-tabs-dids`" role="tabpanel">
            <div class="mb-4">
              <label class="form-label text-muted">Pilih Price List</label>
              <CustomSelect2
                v-model="selectedDidPriceListId"
                :options="priceListOptionsDid"
                :get-option-label="getDidPriceListLabel"
                :reduce="getDidPriceListId"
                placeholder="Pilih Price List (DID)"
                searchable
                clearable
                @update:modelValue="onDidPriceListSelect"
              />
            </div>
            <div v-for="(item, index) in form.siteInvestDids" :key="index" class="repeater-item mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-muted fw-medium">Item #{{ index + 1 }}</span>
                <span v-if="getDidLineForItem(index)" class="badge bg-primary">{{ getDidLineLabel(item) }}</span>
                <button class="btn btn-sm btn-outline-danger" @click.prevent="siteInvestStore.removeDidItem(index)" type="button" title="Hapus item">
                  <i class="ri-delete-bin-line me-1"></i> Hapus
                </button>
              </div>
              <div class="row g-3">
                <div class="col-md-12 form-check mb-2 pl-3">
                  <input class="form-check-input" type="checkbox" v-model="item.isPriceOverridden" :id="`customPriceDid${modalId}${index}`">
                  <label class="form-check-label" :for="`customPriceDid${modalId}${index}`">Custom Price</label>
                </div>
                <div class="col-md-4">
                  <div class="form-control bg-light form-floating-outline">{{ getDidLineLabel(item) || '—' }}</div>
                </div>
                <div class="col-md-2">
                  <div class="form-floating form-floating-outline">
                    <input type="number" v-model.number="item.quantity" @input="calculateDidSubtotal(index)" class="form-control" placeholder="Qty" min="1">
                    <label>Qty</label>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="form-floating form-floating-outline">
                    <input
                      type="text"
                      :value="formatRupiah(item.price)"
                      @input="updateDidPriceFromInput(index, $event)"
                      class="form-control"
                      placeholder="Harga"
                      :readonly="!item.isPriceOverridden"
                      :class="getReadonlyInputClass(item)"
                    >
                    <label>Harga</label>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="form-floating form-floating-outline">
                    <input type="text" :value="formatRupiah(item.subtotal || (item.quantity || 1) * (item.price || 0))" class="form-control" placeholder="Subtotal" readonly>
                    <label>Subtotal</label>
                  </div>
                </div>
                <div class="col-md-12" v-if="item.isPriceOverridden">
                  <div class="form-floating form-floating-outline">
                    <textarea v-model="item.priceReason" class="form-control" placeholder="Alasan custom price" rows="2"></textarea>
                    <label>Alasan Custom Price <span class="text-danger">*</span></label>
                  </div>
                </div>
              </div>
              <hr class="my-4">
            </div>
            <div class="mt-4">
              <button @click.prevent="siteInvestStore.addDidItem()" class="btn btn-primary">Tambah DID</button>
            </div>
            <div class="d-flex justify-content-end mt-4">
              <span class="fw-bold fs-5">Subtotal DID: {{ formatRupiah(didSubtotal) }}</span>
            </div>
          </div>

          <!-- Tab Budget -->
          <div class="tab-pane fade" :id="`${modalId}-form-tabs-budgets`" role="tabpanel">
            <div class="alert alert-info mb-4">
              <i class="ri-information-line me-2"></i>
              <strong>Info:</strong> Pilih sumber budget dan penanggung jawab (budget holder) untuk masing-masing alokasi.
            </div>
            <div v-for="(item, index) in (form.siteInvestBudgets || [])" :key="index" class="repeater-item mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-muted fw-medium">Item #{{ index + 1 }}</span>
                <button class="btn btn-sm btn-outline-danger" @click.prevent="removeBudgetItem(index)" type="button" title="Hapus item">
                  <i class="ri-delete-bin-line me-1"></i> Hapus
                </button>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label text-muted">Sumber Budget</label>
                  <CustomSelect2
                    v-model="item.budgetSourceId"
                    :options="approvedBudgets || []"
                    :get-option-label="getBudgetLabel"
                    :reduce="getBudgetId"
                    placeholder="Pilih Budget"
                    searchable
                    clearable
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted">Budget Holder (Penanggung Jawab)</label>
                  <CustomSelect2
                    v-model="item.budgetHolderId"
                    :options="usersForBudget"
                    :get-option-label="getUserLabel"
                    :reduce="getUserId"
                    placeholder="Pilih User"
                    searchable
                    clearable
                  />
                </div>
              </div>
              <hr class="my-4">
            </div>
            <div class="mt-4">
              <button @click.prevent="addBudgetItem()" class="btn btn-primary">Tambah Budget</button>
            </div>
          </div>
        </div>

        <div class="modal-footer mt-6">
          <button type="button" class="btn btn-outline-secondary" @click="handleClose">Tutup</button>
          <button type="submit" class="btn btn-primary ms-2" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Simpan
          </button>
        </div>
      </form>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSiteInvestStore } from '~/stores/site-invest'
import { useFdrStore } from '~/stores/fdr'
import { useCustomerStore } from '~/stores/customer'
import { useBudgetStore } from '~/stores/budget'
import { useImageUrl } from '~/composables/useImageUrl'
import Modal from '~/components/modal/Modal.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'

const props = defineProps({
  modalId: {
    type: String,
    default: 'SiteInvestmentModal',
  },
  prefilledFdrId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['saved', 'close'])

const siteInvestStore = useSiteInvestStore()
const fdrStore = useFdrStore()
const customerStore = useCustomerStore()
const budgetStore = useBudgetStore()
const formatRupiah = useFormatRupiah()
const { getAttachmentUrl, isImageFile } = useImageUrl()

const {
  loading,
  form,
  isEditMode,
  showModal,
  validationErrors,
} = storeToRefs(siteInvestStore)
const { customers } = storeToRefs(customerStore)
const { budgets } = storeToRefs(budgetStore)

// Refs for modal form
const priceListLinesProduct = ref([])
const priceListLinesService = ref([])
const priceListLinesDid = ref([])
const fdrsForSelect = ref([])
const selectedPriceListId = ref(null)
const selectedDidPriceListId = ref(null)
const sites = ref([])
const businessSchemes = ref([])
const pegawaiOptions = ref([])
const usersForBudget = ref([])
const materialStockInsufficient = ref({})
const priceListOptions = ref([])

let modalInstance = null

const modalTitle = computed(() => (isEditMode.value ? 'Edit Site Investment' : 'Tambah Site Investment'))
const modalDescription = computed(() =>
  isEditMode.value ? 'Silakan ubah data Site Investment di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan data Site Investment baru.'
)

const priceListOptionsDid = computed(() => {
  const lines = priceListLinesDid.value || []
  const seen = new Set()
  const options = []
  for (const line of lines) {
    const plId = line.price_list_id ?? line.priceList?.id ?? line.price_list?.id
    if (plId != null && !seen.has(plId)) {
      seen.add(plId)
      const name = line.price_list?.name ?? line.priceList?.name ?? `Price List #${plId}`
      options.push({ id: plId, name })
    }
  }
  return options
})

const approvedBudgets = computed(() => (budgets.value || []).filter((b) => b.status === 'approved'))

const materialSubtotal = computed(() => {
  if (!form.value?.siteInvestMaterials) return 0
  return form.value.siteInvestMaterials.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const serviceSubtotal = computed(() => {
  if (!form.value?.siteInvestServices) return 0
  return form.value.siteInvestServices.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const didSubtotal = computed(() => {
  if (!form.value?.siteInvestDids) return 0
  return form.value.siteInvestDids.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 1
    const price = Number(item.price) || 0
    return sum + quantity * price
  }, 0)
})

const totalInvestment = computed(() => {
  const fromItems = materialSubtotal.value + serviceSubtotal.value + didSubtotal.value
  if (fromItems > 0) return fromItems
  if (isEditMode.value && form.value?.total != null && form.value.total !== '') {
    return Number(form.value.total) || 0
  }
  return fromItems
})

const marketingFeeAmount = computed(() => {
  const v = form.value?.marketingFee ?? form.value?.marketing_fee
  if (v === null || v === undefined || v === '') return 0
  return Number(v) || 0
})

const grandTotal = computed(() => {
  const fromCalc = totalInvestment.value + marketingFeeAmount.value
  if (fromCalc > 0) return fromCalc
  if (isEditMode.value && form.value?.grandTotal != null && form.value.grandTotal !== '') {
    return Number(form.value.grandTotal) || 0
  }
  return fromCalc
})

const statusOptions = ref([
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' },
  { label: 'Cancelled', value: 'cancelled' },
])

const priorityOptions = ref([
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
])

function isAttachmentPreviewImage(formData) {
  if (!formData) return false
  const name = formData.attachment?.name
  const preview = formData.attachmentPreview
  return isImageFile(name || preview)
}

function isMaterialStockInsufficientRow(i) {
  return !!(materialStockInsufficient.value && materialStockInsufficient.value[i])
}

function getMaterialLineLabel(line) {
  if (!line) return '—'
  const name = line.price_list?.name || (line.product ? `${line.product.name} (${line.product.sku || ''})` : `Line #${line.id}`)
  return name || '—'
}

function getMaterialLineId(line) {
  return line ? line.id : null
}

function getReadonlyInputClass(item) {
  return item && !item.isPriceOverridden ? 'bg-light' : ''
}

function getServiceTerminalKitDisplay(item, index) {
  const line = getServiceLineForItem(index)
  const val = item?.terminalKitCount ?? serviceLineField(line, 'terminal_kit_count')
  return val != null && val !== '' ? String(val) : '—'
}

function getServiceQuotaPriorityDisplay(item, index) {
  const line = getServiceLineForItem(index)
  const val = item?.quotaPriority ?? serviceLineField(line, 'quota_priority')
  return val != null ? formatRupiah(val) : '—'
}

function getServiceNewServiceLineDisplay(item, index) {
  const line = getServiceLineForItem(index)
  const val = item?.newServiceLine ?? serviceLineField(line, 'new_service_line')
  return val != null ? formatRupiah(val) : '—'
}

function getServiceAdditionalDataDisplay(item, index) {
  const line = getServiceLineForItem(index)
  const val = item?.additionalData ?? serviceLineField(line, 'additional_data')
  return val != null ? formatRupiah(val) : '—'
}

function getPriceListLabel(pl) {
  if (!pl) return '—'
  let label = pl.name || ''
  if (pl.type) label += ` (${pl.type})`
  return label || '—'
}

function getPriceListId(pl) {
  return pl ? pl.id : null
}

function getServiceLineLabel(line) {
  if (!line) return '—'
  return line.price_list?.name || (line.service ? line.service.name : `Line #${line.id}`) || '—'
}

function getServiceLineId(line) {
  return line ? line.id : null
}

function getDidPriceListLabel(pl) {
  return pl ? pl.name : '—'
}

function getDidPriceListId(pl) {
  return pl ? pl.id : null
}

function getPegawaiLabel(p) {
  if (!p) return ''
  return p.nm_pegawai || p.nmPegawai || `Pegawai #${p.id_pegawai || p.idPegawai || ''}`
}

function getPegawaiId(p) {
  return p ? (p.id_pegawai ?? p.idPegawai ?? null) : null
}

function getBudgetLabel(b) {
  if (!b) return '—'
  const code = b.budgetCode || b.budget_code || ''
  const name = b.budgetName || b.budget_name || ''
  return code || name ? `${code} - ${name}` : '—'
}

function getBudgetId(b) {
  return b ? b.id : null
}

function getUserLabel(u) {
  if (!u) return ''
  return u.fullName || u.email || `User #${u.id || ''}`
}

function getUserId(u) {
  return u ? u.id : null
}

function getCustomerLabel(c) {
  return c ? c.name : ''
}

function getCustomerId(c) {
  return c ? c.id : null
}

function getOptionLabel(option) {
  return option ? option.label : ''
}

function getOptionValue(option) {
  return option ? option.value : null
}

function getSiteLabel(s) {
  if (!s) return ''
  const code = s.code || ''
  const name = s.name || ''
  return `${code} - ${name}`
}

function getSiteId(s) {
  return s ? s.id : null
}

function getBranchLabel(b) {
  if (!b) return ''
  const code = b.code || ''
  const name = b.name || ''
  return `${code} - ${name}`
}

function getBranchId(b) {
  return b ? (b.id ?? b) : null
}

function getFdrLabel(f) {
  if (!f) return ''
  return `${f.fdrNumber || f.fdr_number || ''} - ${f.name || ''}`.trim() || `FDR #${f.id}`
}

function getFdrId(f) {
  return f ? f.id : null
}

function addBudgetItem() {
  const f = siteInvestStore.form
  if (!f.siteInvestBudgets) f.siteInvestBudgets = []
  f.siteInvestBudgets.push({ budgetSourceId: null, budgetHolderId: null })
}

function removeBudgetItem(index) {
  const f = siteInvestStore.form
  if (!f.siteInvestBudgets) return
  f.siteInvestBudgets.splice(index, 1)
}

// Fetch functions
const fetchFdrsForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.fdr()}?page=1&rows=500&includeItems=false`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (r.ok) {
      const j = await r.json()
      fdrsForSelect.value = j.data || []
    } else {
      fdrsForSelect.value = []
    }
  } catch (e) {
    console.error('Error fetching FDRs for select:', e)
    fdrsForSelect.value = []
  }
}

const fetchPriceListsForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.priceList()}?page=1&rows=500&type=site_investment`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (res.ok) {
      const j = await res.json()
      priceListOptions.value = j.data || []
    } else {
      priceListOptions.value = []
    }
  } catch (e) {
    console.error('Error fetching price lists for select:', e)
    priceListOptions.value = []
  }
}

const fetchPriceListLinesForModal = async () => {
  try {
    const [productLines, serviceLines, didLines] = await Promise.all([
      siteInvestStore.fetchPriceListLines('product'),
      siteInvestStore.fetchPriceListLines('service'),
      siteInvestStore.fetchPriceListLines('did'),
    ])
    priceListLinesProduct.value = productLines
    priceListLinesService.value = serviceLines
    priceListLinesDid.value = didLines
    recalcServiceItemsFromLines()
  } catch (error) {
    console.error('Error fetching price list lines for site investment:', error)
  }
}

const fetchPegawaiForPreparedBy = async () => {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.pegawai()}?start=0&length=500`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (r.ok) {
      const j = await r.json()
      const data = j.data || []
      pegawaiOptions.value = data
        .map((p) => ({
          id_pegawai: p.id_pegawai ?? p.idPegawai ?? p.id,
          nm_pegawai: p.nm_pegawai ?? p.nmPegawai ?? p.nm_pegawai ?? '',
        }))
        .filter((p) => p.id_pegawai != null)
    } else {
      pegawaiOptions.value = []
    }
  } catch (e) {
    console.error('Error fetching pegawai for prepared by:', e)
    pegawaiOptions.value = []
  }
}

const fetchSitesForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.sites()}?page=1&rows=500`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (res.ok) {
      const j = await res.json()
      sites.value = j.data || []
    }
  } catch (e) {
    console.error('Error fetching sites for select:', e)
  }
}

const fetchBusinessSchemesForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.businessSchemes()}?page=1&rows=500`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (res.ok) {
      const j = await res.json()
      businessSchemes.value = j.data || []
    }
  } catch (e) {
    console.error('Error fetching business schemes for select:', e)
  }
}

const fetchBudgetsAndUsers = async () => {
  const prevRows = budgetStore.params.rows
  budgetStore.params.rows = 500
  await budgetStore.fetchBudgets(true)
  budgetStore.params.rows = prevRows
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.users()}?page=1&rows=500`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (r.ok) {
      const j = await r.json()
      usersForBudget.value = j.data || []
    }
  } catch (e) {
    console.error('Error fetching users for budget holder:', e)
  }
}

function toNum(v) {
  return v !== null && v !== undefined && v !== '' ? Number(v) : 0
}

async function enrichPriceListLinesFromPriceList(priceListId) {
  if (!priceListId) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.priceListShow(priceListId)}?includeLines=true`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return
    const priceList = await res.json()
    const lines = priceList.lines || []
    const pt = (l) => l.priceableType ?? l.priceable_type
    const mergeLine = (arr, fullLine) => {
      const idx = arr.findIndex((x) => (x.id ?? x) === (fullLine.id ?? fullLine))
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...fullLine }
      } else {
        arr.push(fullLine)
      }
    }
    const productLines = lines.filter((l) => pt(l) === 'product')
    productLines.forEach((l) => mergeLine(priceListLinesProduct.value, l))
    const serviceLines = lines.filter((l) => pt(l) === 'service')
    serviceLines.forEach((l) => mergeLine(priceListLinesService.value, l))
    const didLines = lines.filter((l) => pt(l) === 'did')
    didLines.forEach((l) => mergeLine(priceListLinesDid.value, l))
  } catch (e) {
    console.error('Error enriching price list lines from Price List:', e)
  }
}

function getServiceLineEffectivePriceFromLine(line) {
  if (!line) return 0
  const base = toNum(line.price) || 0
  const tk = toNum(line.terminalKitCount ?? line.terminal_kit_count) || 0
  const qp = toNum(line.quotaPriority ?? line.quota_priority) || 0
  const nsl = toNum(line.newServiceLine ?? line.new_service_line) || 0
  const ad = toNum(line.additionalData ?? line.additional_data) || 0
  return base + tk + qp + nsl + ad
}

const recalcServiceItemsFromLines = () => {
  const items = form.value?.siteInvestServices ?? []
  const lines = priceListLinesService.value
  items.forEach((item) => {
    if (!item.priceListLineId) return
    const line = lines.find((l) => l.id === item.priceListLineId || String(l.id) === String(item.priceListLineId))
    if (!line) return
    const unitPrice = getServiceLineEffectivePrice(line)
    item.price = unitPrice
    item.quantity = Number(item.quantity) || Number(line.quantity) || 1
    item.subtotal = (Number(item.quantity) || 1) * unitPrice
    item.terminalKitCount = serviceLineField(line, 'terminal_kit_count') != null ? Number(serviceLineField(line, 'terminal_kit_count')) : null
    item.quotaPriority = serviceLineField(line, 'quota_priority') != null ? Number(serviceLineField(line, 'quota_priority')) : null
    item.newServiceLine = serviceLineField(line, 'new_service_line') != null ? Number(serviceLineField(line, 'new_service_line')) : null
    item.additionalData = serviceLineField(line, 'additional_data') != null ? Number(serviceLineField(line, 'additional_data')) : null
  })
}

function serviceLineField(line, snakeKey) {
  if (!line) return null
  const camelKey = snakeKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
  return line[snakeKey] ?? line[camelKey] ?? null
}

function getServiceLineEffectivePrice(line) {
  if (!line) return 0
  const base = Number(line.price) || 0
  const terminalKit = Number(serviceLineField(line, 'terminal_kit_count')) || 0
  const quotaPriority = Number(serviceLineField(line, 'quota_priority')) || 0
  const newServiceLine = Number(serviceLineField(line, 'new_service_line')) || 0
  const additionalData = Number(serviceLineField(line, 'additional_data')) || 0
  return base + terminalKit + quotaPriority + newServiceLine + additionalData
}

function getServiceLineForItem(index) {
  const item = form.value?.siteInvestServices?.[index]
  if (!item?.priceListLineId) return null
  return priceListLinesService.value.find((l) => l.id === item.priceListLineId) ?? null
}

async function onFdrSelect(fdrId) {
  if (!fdrId || !form.value) return
  try {
    await fdrStore.getFdrDetails(fdrId)
    const fdr = fdrStore.fdr
    if (!fdr) return
    const formatDate = (v) => (v ? new Date(v).toISOString().split('T')[0] : null)
    form.value.fdrId = fdr.id
    form.value.fdr = fdr
    form.value.name = fdr.name || form.value.name
    form.value.customerId = fdr.customerId ?? fdr.customer_id ?? null
    form.value.siteId = fdr.siteId ?? fdr.site_id ?? null
    form.value.businessSchemeId = fdr.businessSchemeId ?? fdr.business_scheme_id ?? null
    form.value.businessScheme = fdr.businessScheme ?? fdr.business_scheme ?? null
    form.value.priority = fdr.priority || 'medium'
    form.value.location = fdr.location || form.value.location
    form.value.siDate = formatDate(fdr.fdrDate ?? fdr.fdr_date) || form.value.siDate
    form.value.estimatedStartDate = formatDate(fdr.estimatedStartDate ?? fdr.estimated_start_date) || form.value.estimatedStartDate
    form.value.estimatedCompletionDate = formatDate(fdr.estimatedCompletionDate ?? fdr.estimated_completion_date) || form.value.estimatedCompletionDate
    const toMat = (i) => ({
      priceListLineId: i.priceListLineId ?? i.price_list_line_id ?? 0,
      quantity: Number(i.quantity) || 1,
      price: Number(i.price) || 0,
      subtotal: Number(i.subtotal) || 0,
      isPriceOverridden: i.isPriceOverridden ?? i.is_price_overridden ?? false,
    })
    const toSvc = (s) => ({
      priceListLineId: s.priceListLineId ?? s.price_list_line_id ?? 0,
      quantity: Number(s.quantity) || 1,
      price: Number(s.price) || 0,
      subtotal: Number(s.subtotal) || 0,
      isPriceOverridden: s.isPriceOverridden ?? s.is_price_overridden ?? false,
      terminalKitCount: s.terminalKitCount ?? s.terminal_kit_count ?? null,
      quotaPriority: s.quotaPriority ?? s.quota_priority ?? null,
      newServiceLine: s.newServiceLine ?? s.new_service_line ?? null,
      additionalData: s.additionalData ?? s.additional_data ?? null,
    })
    const toDid = (d) => ({
      priceListLineId: d.priceListLineId ?? d.price_list_line_id ?? 0,
      quantity: Number(d.quantity) || 1,
      price: Number(d.price) || 0,
      subtotal: Number(d.subtotal) || 0,
      isPriceOverridden: d.isPriceOverridden ?? d.is_price_overridden ?? false,
    })
    form.value.siteInvestMaterials = (fdr.fdrItems ?? fdr.fdr_items ?? []).map(toMat)
    form.value.siteInvestServices = (fdr.fdrServices ?? fdr.fdr_services ?? []).map(toSvc)
    form.value.siteInvestDids = (fdr.fdrDids ?? fdr.fdr_dids ?? []).map(toDid)
    const addIfMissing = (arr, item, key = 'id') => {
      if (item && !arr.find((x) => (x[key] ?? x.id) === (item[key] ?? item.id))) arr.push(item)
    }
    const bs = fdr.businessScheme ?? fdr.business_scheme
    const schemeId = form.value.businessSchemeId
    const exists = schemeId && businessSchemes.value.find((b) => String(b.id ?? b) === String(schemeId))
    if (schemeId && !exists) {
      if (bs) {
        businessSchemes.value = [{ ...bs, id: schemeId }, ...businessSchemes.value]
      } else {
        try {
          const { $api } = useNuxtApp()
          const r = await fetch(`${$api.businessSchemes()}/${schemeId}`, { credentials: 'include', headers: { Accept: 'application/json' } })
          if (r.ok) {
            const j = await r.json()
            const scheme = j.data ?? j
            businessSchemes.value = [{ ...scheme, id: schemeId }, ...businessSchemes.value]
          }
        } catch (_e) {
          /* skip */
        }
      }
    }
    ;(fdr.fdrItems ?? fdr.fdr_items ?? []).forEach((i) => {
      if (i.priceListLine || i.price_list_line) addIfMissing(priceListLinesProduct.value, i.priceListLine || i.price_list_line)
    })
    ;(fdr.fdrServices ?? fdr.fdr_services ?? []).forEach((s) => {
      if (s.priceListLine || s.price_list_line) addIfMissing(priceListLinesService.value, s.priceListLine || s.price_list_line)
    })
    ;(fdr.fdrDids ?? fdr.fdr_dids ?? []).forEach((d) => {
      if (d.priceListLine || d.price_list_line) addIfMissing(priceListLinesDid.value, d.priceListLine || d.price_list_line)
    })
    const firstItem = (fdr.fdrItems ?? fdr.fdr_items ?? [])[0]
    const firstSvc = (fdr.fdrServices ?? fdr.fdr_services ?? [])[0]
    const firstDid = (fdr.fdrDids ?? fdr.fdr_dids ?? [])[0]
    const plLine = firstItem?.priceListLine ?? firstItem?.price_list_line ?? firstSvc?.priceListLine ?? firstSvc?.price_list_line ?? firstDid?.priceListLine ?? firstDid?.price_list_line
    const plId = plLine?.priceListId ?? plLine?.price_list_id ?? plLine?.priceList?.id ?? plLine?.price_list?.id
    if (plId) {
      selectedPriceListId.value = plId
      selectedDidPriceListId.value = plId
      await enrichPriceListLinesFromPriceList(plId)
    }
    if (form.value.siteInvestMaterials.length === 0) siteInvestStore.addMaterialItem()
    if (form.value.siteInvestServices.length === 0) siteInvestStore.addServiceItem()
    if (form.value.siteInvestDids.length === 0) siteInvestStore.addDidItem()
    recalcServiceItemsFromLines()
    await nextTick()
    await Promise.all((form.value.siteInvestMaterials || []).map((_, i) => checkMaterialStock(i)))
  } catch (e) {
    console.error('Error loading FDR for autofill:', e)
    useToast().error({ title: 'Error', message: 'Gagal memuat data FDR', color: 'red' })
  }
}

async function onPriceListSelect(priceListId) {
  if (!form.value || !priceListId) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.priceListShow(priceListId)}?includeLines=true`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return
    const priceList = await res.json()
    const lines = priceList.lines || []
    const pt = (l) => l.priceableType ?? l.priceable_type
    const svcField = (l, key) => l[key] ?? l[key.replace(/([A-Z])/g, '_$1').toLowerCase()]

    const productLines = lines.filter((l) => pt(l) === 'product')
    form.value.siteInvestMaterials = productLines.map((l) => {
      const q = toNum(l.quantity) || 1
      const p = toNum(l.price) || 0
      return {
        priceListLineId: l.id,
        quantity: q,
        price: p,
        subtotal: toNum(l.subtotal) || q * p,
        isPriceOverridden: false,
      }
    })

    const serviceLines = lines.filter((l) => pt(l) === 'service')
    form.value.siteInvestServices = serviceLines.map((l) => {
      const q = toNum(l.quantity) || 1
      const effectivePrice = getServiceLineEffectivePriceFromLine(l)
      return {
        priceListLineId: l.id,
        quantity: q,
        price: effectivePrice,
        subtotal: q * effectivePrice,
        isPriceOverridden: false,
        terminalKitCount: svcField(l, 'terminalKitCount') != null ? Number(svcField(l, 'terminalKitCount')) : null,
        quotaPriority: svcField(l, 'quotaPriority') != null ? Number(svcField(l, 'quotaPriority')) : null,
        newServiceLine: svcField(l, 'newServiceLine') != null ? Number(svcField(l, 'newServiceLine')) : null,
        additionalData: svcField(l, 'additionalData') != null ? Number(svcField(l, 'additionalData')) : null,
      }
    })

    const didLines = lines.filter((l) => pt(l) === 'did')
    form.value.siteInvestDids = didLines.map((l) => {
      const q = toNum(l.quantity) || 1
      const p = toNum(l.price) || 0
      return {
        priceListLineId: l.id,
        quantity: q,
        price: p,
        subtotal: toNum(l.subtotal) || q * p,
        isPriceOverridden: false,
      }
    })
    selectedDidPriceListId.value = priceList.id

    recalcServiceItemsFromLines()
    await nextTick()
    await Promise.all((form.value?.siteInvestMaterials ?? []).map((_, i) => checkMaterialStock(i)))
  } catch (e) {
    console.error('Error filling from price list:', e)
  }
}

function onSiteChange(siteId) {
  const s = sites.value.find((x) => x.id === siteId)
  if (s && form.value) {
    form.value.location = s.address || ''
    form.value.lat = s.latitude != null ? String(s.latitude) : ''
    form.value.long = s.longitude != null ? String(s.longitude) : ''
  }
}

async function checkMaterialStock(index) {
  const item = form.value?.siteInvestMaterials?.[index]
  let line = null
  if (item?.priceListLineId) {
    line = priceListLinesProduct.value.find((l) => l.id === item.priceListLineId) || null
  }
  const productId = line?.product?.id ?? line?.priceable_id
  const priceableType = line?.priceable_type ?? line?.priceableType
  if (!productId || priceableType !== 'product') {
    const next = Object.assign({}, materialStockInsufficient.value)
    next[index] = false
    materialStockInsufficient.value = next
    return
  }
  const res = await siteInvestStore.fetchProductStock(Number(productId))
  const requested = Number(item?.quantity) || 0
  let available = 0
  if (res != null && typeof res.quantity === 'number') available = res.quantity
  const next = Object.assign({}, materialStockInsufficient.value)
  next[index] = requested > 0 && available < requested
  materialStockInsufficient.value = next
}

const onMaterialLineChange = async (index, lineId) => {
  const line = priceListLinesProduct.value.find((l) => l.id === lineId)
  if (!line || !form.value?.siteInvestMaterials?.[index]) return
  const item = form.value.siteInvestMaterials[index]
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = item.quantity * item.price
  await checkMaterialStock(index)
}

const calculateMaterialSubtotal = (index) => {
  const item = form.value?.siteInvestMaterials?.[index]
  if (!item) return
  const quantity = Number(item.quantity) || 0
  const price = Number(item.price) || 0
  item.subtotal = quantity * price
  checkMaterialStock(index)
}

const onServiceLineChange = (index, lineId) => {
  const line = priceListLinesService.value.find((l) => l.id === lineId || String(l.id) === String(lineId))
  if (!line || !form.value?.siteInvestServices?.[index]) return
  const item = form.value.siteInvestServices[index]
  const unitPrice = getServiceLineEffectivePrice(line)
  item.price = unitPrice
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = (Number(item.quantity) || 1) * unitPrice
  item.terminalKitCount = serviceLineField(line, 'terminal_kit_count') != null ? Number(serviceLineField(line, 'terminal_kit_count')) : null
  item.quotaPriority = serviceLineField(line, 'quota_priority') != null ? Number(serviceLineField(line, 'quota_priority')) : null
  item.newServiceLine = serviceLineField(line, 'new_service_line') != null ? Number(serviceLineField(line, 'new_service_line')) : null
  item.additionalData = serviceLineField(line, 'additional_data') != null ? Number(serviceLineField(line, 'additional_data')) : null
}

const calculateServiceSubtotal = (index) => {
  const item = form.value?.siteInvestServices?.[index]
  if (!item) return
  const qty = Number(item.quantity) || 0
  const price = Number(item.price) || 0
  item.subtotal = qty * price
}

function onDidPriceListSelect(priceListId) {
  if (!form.value) return
  if (priceListId == null || priceListId === '') {
    form.value.siteInvestDids = []
    return
  }
  const lines = (priceListLinesDid.value || []).filter(
    (l) => (l.price_list_id ?? l.priceList?.id ?? l.price_list?.id) === priceListId
  )
  form.value.siteInvestDids = lines.map((line) => {
    const q = Number(line.quantity) || 1
    const p = Number(line.price) || 0
    return {
      priceListLineId: line.id,
      quantity: q,
      price: p,
      subtotal: q * p,
      isPriceOverridden: false,
    }
  })
}

function getDidLineForItem(index) {
  const item = form.value?.siteInvestDids?.[index]
  if (!item?.priceListLineId) return null
  return priceListLinesDid.value.find((l) => l.id === item.priceListLineId) ?? null
}

function getDidLineLabel(item) {
  if (!item?.priceListLineId) return '—'
  const line = priceListLinesDid.value.find((l) => l.id === item.priceListLineId)
  if (!line) return '—'
  const didPart = line.did ? `${line.did.code || ''} - ${line.did.name || ''}`.trim() || `Line #${line.id}` : `Line #${line.id}`
  const cat = line.category_did ?? line.categoryDid
  const catStr = cat ? ` (${String(cat).split(',')[0].trim()})` : ''
  return didPart + catStr
}

const calculateDidSubtotal = (index) => {
  const item = form.value?.siteInvestDids?.[index]
  if (!item) return
  const q = Number(item.quantity) || 1
  const p = Number(item.price) || 0
  item.subtotal = q * p
}

const parseRupiahToNumber = (rupiahString) => {
  if (!rupiahString) return 0
  return Number(String(rupiahString).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0
}

const onMarketingFeeInput = (event) => {
  form.value.marketingFee = parseRupiahToNumber(event.target?.value || '')
}

const onMarketingFeeBlur = (event) => {
  const numValue = parseRupiahToNumber(event.target?.value)
  form.value.marketingFee = numValue
  event.target.value = formatRupiah(numValue)
}

function onAttachmentChange(e) {
  if (!form.value) return
  const file = e.target.files?.[0]
  if (file) {
    if (!file.size || file.size === 0) {
      useToast().error({ title: 'Error', message: 'File attachment kosong atau tidak valid', color: 'red' })
      return
    }
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      useToast().error({ title: 'Error', message: 'Ukuran file maksimal 2MB', color: 'red' })
      return
    }
    const ext = file.name?.split('.').pop()?.toLowerCase() || ''
    const allowed = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv']
    if (!allowed.includes(ext)) {
      useToast().error({ title: 'Error', message: `Format tidak didukung. Gunakan: ${allowed.join(', ')}`, color: 'red' })
      return
    }
    form.value.attachment = file
    form.value.attachmentPreview = URL.createObjectURL(file)
  } else {
    form.value.attachment = null
    form.value.attachmentPreview = null
  }
  e.target.value = ''
}

const updateMaterialPriceFromInput = (index, event) => {
  const numericValue = parseRupiahToNumber(event.target?.value || '')
  if (form.value.siteInvestMaterials?.[index]) {
    form.value.siteInvestMaterials[index].price = Math.round(numericValue)
    calculateMaterialSubtotal(index)
  }
}

const updateServicePriceFromInput = (index, event) => {
  const numericValue = parseRupiahToNumber(event.target?.value || '')
  if (form.value.siteInvestServices?.[index]) {
    form.value.siteInvestServices[index].price = Math.round(numericValue)
    calculateServiceSubtotal(index)
  }
}

const updateDidPriceFromInput = (index, event) => {
  const numericValue = parseRupiahToNumber(event.target?.value || '')
  if (form.value.siteInvestDids?.[index]) {
    form.value.siteInvestDids[index].price = Math.round(numericValue)
    calculateDidSubtotal(index)
  }
}

async function handleSubmit() {
  form.value.marketingFee = parseRupiahToNumber(form.value.marketingFee) || 0
  const ok = await siteInvestStore.saveSiteInvest()
  if (ok) emit('saved')
}

function handleClose() {
  siteInvestStore.closeModal()
  emit('close')
}

onMounted(() => {
  const modalElement = document.getElementById(props.modalId)
  if (modalElement) {
    modalInstance = new bootstrap.Modal(modalElement)
    modalElement.addEventListener('hidden.bs.modal', () => {
      siteInvestStore.closeModal()
      emit('close')
    })
  }
})

watch(showModal, async (newValue) => {
  if (newValue) {
    materialStockInsufficient.value = {}
    await Promise.all([
      fetchPriceListsForSelect(),
      fetchFdrsForSelect(),
      fetchPriceListLinesForModal(),
      fetchPegawaiForPreparedBy(),
      fetchSitesForSelect(),
      fetchBusinessSchemesForSelect(),
      fetchBudgetsAndUsers(),
      customerStore.fetchCustomers(),
    ])
    if (!isEditMode.value) {
      selectedPriceListId.value = null
    } else {
      // Saat edit: isi Price List dropdown dari material/service/DID yang ada
      const mats = form.value?.siteInvestMaterials ?? []
      const svcs = form.value?.siteInvestServices ?? []
      const dids = form.value?.siteInvestDids ?? []
      const getPlId = (item) => {
        const pl = item?.priceListLine ?? item?.price_list_line
        return pl?.price_list_id ?? pl?.priceListId ?? pl?.priceList?.id ?? pl?.price_list?.id
      }
      const plId = getPlId(mats[0]) ?? getPlId(svcs[0]) ?? getPlId(dids[0])
      if (plId != null) {
        selectedPriceListId.value = plId
        await enrichPriceListLinesFromPriceList(plId)
      }
    }
    if (props.prefilledFdrId) {
      await onFdrSelect(props.prefilledFdrId)
    }
    if (isEditMode.value && form.value?.siteInvestDids?.length > 0) {
      const first = form.value.siteInvestDids[0]
      const lineId = first.priceListLineId
      const line = priceListLinesDid.value.find((l) => l.id === lineId)
      selectedDidPriceListId.value = line ? (line.price_list_id ?? line.price_list?.id ?? line.priceList?.id) : null
    } else {
      selectedDidPriceListId.value = null
    }
    nextTick(() => {
      const modalElement = document.getElementById(props.modalId)
      if (modalElement && !modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement)
      }
      modalInstance?.show()
      if (form.value?.site && form.value?.siteId && !sites.value.find((s) => s.id === form.value.siteId)) {
        sites.value = [{ ...form.value.site, id: form.value.siteId }, ...sites.value]
      }
      if (form.value?.businessScheme && form.value?.businessSchemeId && !businessSchemes.value.find((b) => String(b.id ?? b) === String(form.value.businessSchemeId))) {
        businessSchemes.value = [{ ...form.value.businessScheme, id: form.value.businessSchemeId }, ...businessSchemes.value]
      }
      if (form.value?.fdr && form.value?.fdrId && !fdrsForSelect.value.find((f) => f.id === form.value.fdrId)) {
        fdrsForSelect.value = [{ ...form.value.fdr, id: form.value.fdrId }, ...fdrsForSelect.value]
      }
    })
  } else {
    modalInstance?.hide()
  }
})
</script>

<style scoped>
.repeater-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease-in-out;
}

.attachment-preview {
  display: block;
  cursor: pointer;
}

.investment-summary-card {
  background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
  border: 1px solid #e0e7ff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.06);
}

.investment-summary-title {
  margin: 0;
  padding: 14px 18px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #4f46e5;
  background: rgba(99, 102, 241, 0.08);
  border-bottom: 1px solid #e0e7ff;
}

.investment-summary-body {
  padding: 16px 18px 18px;
}

.investment-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.9rem;
}

.investment-summary-label {
  color: #64748b;
  font-weight: 500;
}

.investment-summary-value {
  font-weight: 600;
  color: #1e293b;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.investment-summary-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0e7ff, transparent);
  margin: 10px 0;
}

.investment-summary-row-total .investment-summary-value {
  font-weight: 700;
  color: #4f46e5;
}

.investment-summary-row-grand {
  padding-top: 12px;
  margin-top: 2px;
}

.investment-summary-row-grand .investment-summary-label {
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
}

.investment-summary-row-grand .investment-summary-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #4f46e5;
}
</style>
