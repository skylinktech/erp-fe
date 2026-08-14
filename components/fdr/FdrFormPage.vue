<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 class="mb-0">{{ pageTitle }}</h4>
          <PageBreadcrumb class="mt-1" :current-label="pageTitle" />
          <p class="text-muted mb-0 small">{{ pageSubtitle }}</p>
        </div>
        <NuxtLink to="/sales/fdr" class="btn btn-outline-secondary btn-sm">
          <i class="ri-arrow-left-line me-1"></i> Kembali
        </NuxtLink>
      </div>

      <div class="row g-4">
        <div class="col-xl-8 col-12">
          <div class="card">
            <div class="card-body">
              <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
                <div v-if="validationErrorMessages.length" class="alert alert-warning mb-4">
                  <ul class="mb-0 ps-3">
                    <li v-for="(msg, i) in validationErrorMessages" :key="i">{{ msg }}</li>
                  </ul>
                </div>

                <TabbedFormNav
                  :steps="visibleSteps"
                  :current-index="currentIndex"
                  :disabled="navigating || saving"
                  @select="goTo"
                />

                <div class="tab-content pt-4">
                  <div id="fdr-tab-info" data-step-id="fdr-tab-info" :class="paneClass('fdr-tab-info')">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <FormLabel required html-for="fdr-name">Nama Project</FormLabel>
                        <input id="fdr-name" v-model="form.name" class="form-control" :class="{ 'is-invalid': uiErrors.name }" placeholder="Nama" aria-required="true">
                        <div v-if="uiErrors.name" class="invalid-feedback d-block">{{ uiErrors.name }}</div>
                      </div>
                      <div class="col-md-6"><FormLabel>Customer</FormLabel><CustomSelect2 v-model="form.customerId" :options="customers" :get-option-label="getCustomerLabel" :reduce="getCustomerId" searchable clearable placeholder="Pilih Customer" /></div>
                      <div class="col-md-6">
                        <FormLabel :required="isManualSite">Site</FormLabel>
                        <CustomSelect2
                          v-model="form.siteId"
                          :options="siteSelectOptions"
                          :get-option-label="getSiteLabel"
                          :reduce="getSiteId"
                          searchable
                          clearable
                          placeholder="Pilih Site"
                          @update:modelValue="onSiteChange"
                        >
                          <template #selection>
                            {{ siteSelectionLabel }}
                          </template>
                          <template #option="{ option }">
                            <div
                              v-if="option?.isManual || option?.id === MANUAL_SITE_ID"
                              class="manual-site-option d-flex flex-column gap-1 py-1"
                            >
                              <span class="fw-semibold text-primary">Tambah Site</span>
                              <input
                                v-model="form.siteName"
                                type="text"
                                class="form-control form-control-sm"
                                placeholder="Nama Site..."
                                @click.stop
                                @keydown.enter.stop.prevent="confirmManualSite"
                              />
                              <small class="text-muted">
                                Tekan Enter atau klik opsi ini untuk memilih site baru.
                              </small>
                            </div>
                            <span v-else>
                              {{ getSiteLabel(option) }}
                            </span>
                          </template>
                        </CustomSelect2>
                        <div v-if="isManualSite && uiErrors.siteName" class="invalid-feedback d-block">
                          {{ uiErrors.siteName }}
                        </div>
                      </div>
                      <div class="col-md-6"><label class="form-label">Business Scheme</label><CustomSelect2 v-model="form.businessSchemeId" :options="businessSchemes" :get-option-label="getBranchLabel" :reduce="getBranchId" searchable clearable placeholder="Pilih Business Scheme" /></div>
                      <div class="col-md-12">
                        <label class="form-label">Isi dari Price List</label>
                        <CustomSelect2 v-model="selectedPriceListId" :options="priceListOptions" :get-option-label="getPriceListLabel" :reduce="getPriceListId" searchable clearable placeholder="Pilih Price List" @update:modelValue="onPriceListSelect" />
                        <small class="text-muted">Autofill material, service, dan DID dari Price List.</small>
                      </div>
                      <div class="col-md-4">
                        <FormLabel required html-for="fdr-location">Lokasi</FormLabel>
                        <input id="fdr-location" v-model="form.location" class="form-control" :class="{ 'is-invalid': uiErrors.location }" placeholder="Lokasi" aria-required="true">
                        <div v-if="uiErrors.location" class="invalid-feedback d-block">{{ uiErrors.location }}</div>
                      </div>
                      <div class="col-md-4"><label class="form-label">Priority</label><CustomSelect2 v-model="form.priority" :options="priorityOptions" :get-option-label="getOptionLabel" :reduce="getOptionValue" clearable /></div>
                      <div class="col-md-4"><label class="form-label">Quantity</label><input type="number" v-model.number="form.quantity" class="form-control" min="1"></div>
                      <div class="col-md-4"><label class="form-label">Tanggal FDR</label><input type="date" v-model="form.fdrDate" class="form-control"></div>
                      <div class="col-md-4"><FormLabel html-for="fdr-est-start">Estimasi Mulai</FormLabel><input id="fdr-est-start" type="date" v-model="form.estimatedStartDate" class="form-control" :class="{ 'is-invalid': uiErrors.estimatedStartDate }"></div>
                      <div class="col-md-4">
                        <FormLabel html-for="fdr-est-end">Estimasi Selesai</FormLabel>
                        <input id="fdr-est-end" type="date" v-model="form.estimatedCompletionDate" class="form-control" :class="{ 'is-invalid': uiErrors.estimatedCompletionDate }">
                        <div v-if="uiErrors.estimatedCompletionDate" class="invalid-feedback d-block">{{ uiErrors.estimatedCompletionDate }}</div>
                      </div>
                      <div class="col-md-12"><div class="form-check form-switch"><input id="pocNeededForm" class="form-check-input" type="checkbox" v-model="form.pocNeeded"><label class="form-check-label" for="pocNeededForm">POC Needed</label></div></div>
                      <div class="col-md-12"><label class="form-label">Notes</label><textarea v-model="form.notes" class="form-control" rows="3"></textarea></div>
                      <div class="col-md-12"><label class="form-label">Attachment</label><input type="file" @change="onAttachmentChange" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"></div>
                    </div>
                  </div>

                  <!-- ── TAB MATERIAL ── -->
                  <div id="fdr-tab-materials" data-step-id="fdr-tab-materials" :class="paneClass('fdr-tab-materials')">
                    <div v-if="uiErrors.fdrItems" class="alert alert-danger py-2 mb-3"><i class="ri-error-warning-line me-1"></i>{{ uiErrors.fdrItems }}</div>
                    <div class="repeater-table">
                      <div class="repeater-table-head d-none d-md-grid repeater-cols-4">
                        <span>Product / Material</span><span>Qty</span><span>Harga Satuan</span><span>Subtotal</span>
                      </div>
                      <div v-for="(item, index) in form.fdrItems" :key="'m'+index" class="repeater-table-row">
                        <div class="repeater-cell repeater-cell-main">
                          <span class="repeater-cell-label d-md-none">Product / Material</span>
                          <CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesProduct" :get-option-label="getMaterialLineLabel" :reduce="getMaterialLineId" searchable clearable placeholder="Pilih Product" @update:modelValue="onItemLineChange(index, $event)" />
                        </div>
                        <div class="repeater-cell">
                          <span class="repeater-cell-label d-md-none">Qty</span>
                          <input type="number" v-model.number="item.quantity" @input="calculateItemSubtotal(index)" class="form-control" min="0.01" step="0.01" placeholder="Qty">
                        </div>
                        <div class="repeater-cell">
                          <span class="repeater-cell-label d-md-none">
                            Harga Satuan
                            <span v-if="item.isPriceOverridden" class="badge bg-warning text-dark ms-1 py-0 px-1 badge-custom">Custom</span>
                          </span>
                          <div class="price-input-wrapper" :class="{ 'price-override-active': item.isPriceOverridden }">
                            <input type="text" :value="formatRupiah(item.price)" @input="updateItemPriceFromInput(index, $event)" class="form-control price-field" :class="{ 'price-overridden': item.isPriceOverridden }" :readonly="!item.isPriceOverridden" :tabindex="item.isPriceOverridden ? 0 : -1" placeholder="Harga">
                            <button type="button" class="btn-price-lock" :class="{ 'is-overridden': item.isPriceOverridden }" @click="toggleItemOverride(index)" :title="item.isPriceOverridden ? 'Kunci: kembalikan ke harga price list' : 'Klik untuk atur custom price'"><i :class="item.isPriceOverridden ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i></button>
                          </div>
                        </div>
                        <div class="repeater-cell repeater-cell-subtotal">
                          <span class="repeater-cell-label d-md-none">Subtotal</span>
                          <input type="text" :value="formatRupiah(lineSubtotal(item))" class="form-control repeater-subtotal" readonly disabled tabindex="-1">
                          <button type="button" class="repeater-delete-btn" @click="fdrStore.removeItem(index)" title="Hapus"><i class="ri-delete-bin-6-line"></i></button>
                        </div>
                        <div v-if="item.isPriceOverridden" class="repeater-cell-reason">
                          <i class="ri-information-line me-1 text-warning"></i>
                          <input v-model="item.priceReason" type="text" class="form-control form-control-sm price-reason-input" placeholder="Alasan perubahan harga (opsional)">
                        </div>
                      </div>
                      <div v-if="!form.fdrItems?.length" class="repeater-empty">Belum ada item. Klik tombol di bawah untuk menambahkan.</div>
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm mt-3" @click="fdrStore.addItem()"><i class="ri-add-line me-1"></i>Tambah Material</button>
                  </div>

                  <!-- ── TAB SERVICE ── -->
                  <div id="fdr-tab-services" data-step-id="fdr-tab-services" :class="paneClass('fdr-tab-services')">
                    <div v-if="uiErrors.fdrServices" class="alert alert-danger py-2 mb-3"><i class="ri-error-warning-line me-1"></i>{{ uiErrors.fdrServices }}</div>
                    <div class="repeater-table">
                      <div class="repeater-table-head d-none d-md-grid repeater-cols-4">
                        <span>Service</span><span>Qty</span><span>Harga Satuan</span><span>Subtotal</span>
                      </div>
                      <div v-for="(item, index) in form.fdrServices" :key="'s'+index" class="repeater-table-row">
                        <div class="repeater-cell repeater-cell-main">
                          <span class="repeater-cell-label d-md-none">Service</span>
                          <CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesService" :get-option-label="getServiceLineLabel" :reduce="getServiceLineId" searchable clearable placeholder="Pilih Service" @update:modelValue="onServiceLineChange(index, $event)" />
                        </div>
                        <div class="repeater-cell">
                          <span class="repeater-cell-label d-md-none">Qty</span>
                          <input type="number" v-model.number="item.quantity" @input="calculateServiceSubtotal(index)" class="form-control" min="0.01" step="0.01" placeholder="Qty">
                        </div>
                        <div class="repeater-cell">
                          <span class="repeater-cell-label d-md-none">
                            Harga Satuan
                            <span v-if="item.isPriceOverridden" class="badge bg-warning text-dark ms-1 py-0 px-1 badge-custom">Custom</span>
                          </span>
                          <div class="price-input-wrapper" :class="{ 'price-override-active': item.isPriceOverridden }">
                            <input type="text" :value="formatRupiah(item.price)" @input="updateServicePriceFromInput(index, $event)" class="form-control price-field" :class="{ 'price-overridden': item.isPriceOverridden }" :readonly="!item.isPriceOverridden" :tabindex="item.isPriceOverridden ? 0 : -1" placeholder="Harga">
                            <button type="button" class="btn-price-lock" :class="{ 'is-overridden': item.isPriceOverridden }" @click="toggleServiceOverride(index)" :title="item.isPriceOverridden ? 'Kunci: kembalikan ke harga price list' : 'Klik untuk atur custom price'"><i :class="item.isPriceOverridden ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i></button>
                          </div>
                        </div>
                        <div class="repeater-cell repeater-cell-subtotal">
                          <span class="repeater-cell-label d-md-none">Subtotal</span>
                          <input type="text" :value="formatRupiah(lineSubtotal(item))" class="form-control repeater-subtotal" readonly disabled tabindex="-1">
                          <button type="button" class="repeater-delete-btn" @click="fdrStore.removeService(index)" title="Hapus"><i class="ri-delete-bin-6-line"></i></button>
                        </div>
                        <div v-if="item.isPriceOverridden" class="repeater-cell-reason">
                          <i class="ri-information-line me-1 text-warning"></i>
                          <input v-model="item.priceReason" type="text" class="form-control form-control-sm price-reason-input" placeholder="Alasan perubahan harga (opsional)">
                        </div>
                      </div>
                      <div v-if="!form.fdrServices?.length" class="repeater-empty">Belum ada item.</div>
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm mt-3" @click="fdrStore.addService()"><i class="ri-add-line me-1"></i>Tambah Service</button>
                  </div>

                  <!-- ── TAB DID ── -->
                  <div id="fdr-tab-dids" data-step-id="fdr-tab-dids" :class="paneClass('fdr-tab-dids')">
                    <div v-if="uiErrors.fdrDids" class="alert alert-danger py-2 mb-3"><i class="ri-error-warning-line me-1"></i>{{ uiErrors.fdrDids }}</div>
                    <div class="repeater-table">
                      <div class="repeater-table-head d-none d-md-grid repeater-cols-4">
                        <span>DID</span><span>Qty</span><span>Harga Satuan</span><span>Subtotal</span>
                      </div>
                      <div v-for="(item, index) in form.fdrDids" :key="'d'+index" class="repeater-table-row">
                        <div class="repeater-cell repeater-cell-main">
                          <span class="repeater-cell-label d-md-none">DID</span>
                          <CustomSelect2 v-model="item.priceListLineId" :options="didLineSelectOptions" :get-option-label="getDidLineLabel" :reduce="getDidLineId" searchable clearable placeholder="Pilih DID" @update:modelValue="onDidLineChange(index, $event)" />
                        </div>
                        <div class="repeater-cell">
                          <span class="repeater-cell-label d-md-none">Qty</span>
                          <input type="number" v-model.number="item.quantity" @input="calculateDidSubtotal(index)" class="form-control" min="1" placeholder="Qty">
                        </div>
                        <div class="repeater-cell">
                          <span class="repeater-cell-label d-md-none">
                            Harga Satuan
                            <span v-if="item.isPriceOverridden" class="badge bg-warning text-dark ms-1 py-0 px-1 badge-custom">Custom</span>
                          </span>
                          <div class="price-input-wrapper" :class="{ 'price-override-active': item.isPriceOverridden }">
                            <input type="text" :value="formatRupiah(item.price)" @input="updateDidPriceFromInput(index, $event)" class="form-control price-field" :class="{ 'price-overridden': item.isPriceOverridden }" :readonly="!item.isPriceOverridden" :tabindex="item.isPriceOverridden ? 0 : -1" placeholder="Harga">
                            <button type="button" class="btn-price-lock" :class="{ 'is-overridden': item.isPriceOverridden }" @click="toggleDidOverride(index)" :title="item.isPriceOverridden ? 'Kunci: kembalikan ke harga price list' : 'Klik untuk atur custom price'"><i :class="item.isPriceOverridden ? 'ri-lock-unlock-line' : 'ri-lock-line'"></i></button>
                          </div>
                        </div>
                        <div class="repeater-cell repeater-cell-subtotal">
                          <span class="repeater-cell-label d-md-none">Subtotal</span>
                          <input type="text" :value="formatRupiah(lineSubtotal(item))" class="form-control repeater-subtotal" readonly disabled tabindex="-1">
                          <button type="button" class="repeater-delete-btn" @click="fdrStore.removeDid(index)" title="Hapus"><i class="ri-delete-bin-6-line"></i></button>
                        </div>
                        <div v-if="item.isPriceOverridden" class="repeater-cell-reason">
                          <i class="ri-information-line me-1 text-warning"></i>
                          <input v-model="item.priceReason" type="text" class="form-control form-control-sm price-reason-input" placeholder="Alasan perubahan harga (opsional)">
                        </div>
                      </div>
                      <div v-if="!form.fdrDids?.length" class="repeater-empty">Belum ada item.</div>
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm mt-3" @click="fdrStore.addDid()"><i class="ri-add-line me-1"></i>Tambah DID</button>
                  </div>
                </div>

                <TabbedFormActions
                  :is-first-step="isFirstStep"
                  :is-last-step="isLastStep"
                  :loading="navigating"
                  :saving="saving"
                  cancel-href="/sales/fdr"
                  @next="next"
                  @previous="previous"
                />
              </form>
            </div>
          </div>
        </div>

        <div class="col-xl-4 col-12">
          <div class="card">
            <div class="card-header border-0 bg-transparent px-5 py-4">
              <h5 class="card-title mb-0 d-flex align-items-center"><i class="ri-menu-2-line me-2 text-primary"></i>Modul Sales</h5>
            </div>
            <div class="card-body px-5 pt-0 pb-5">
              <div class="list-group list-group-flush">
                <NuxtLink v-for="item in moduleNavItems" :key="item.to" :to="item.to" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between gap-3" :class="{ active: isModuleNavActive(item.to) }">
                  <span class="d-flex align-items-center gap-2"><i :class="item.icon" class="text-primary"></i>{{ item.label }}</span>
                  <i class="ri-arrow-right-s-line text-muted"></i>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<style scoped>
/* ── Repeater table container ── */
.repeater-table {
  border: 1px solid #dee2e6;
  border-radius: 10px;
}

/* ── Header row (desktop only) ── */
.repeater-table-head {
  background: #f1f3f5;
  border-bottom: 1px solid #dee2e6;
  border-radius: 10px 10px 0 0;
  padding: 8px 16px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6c757d;
  gap: 12px;
  align-items: center;
}

/* ── Data rows ── */
.repeater-table-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: flex-end;
  transition: background 0.12s;
}
.repeater-table-row:last-child { border-bottom: none; }
.repeater-table-row:hover { background: #fafbfc; }

/* ── Cells ── */
.repeater-cell {
  display: flex;
  flex-direction: column;
  flex: 1 1 120px;
  min-width: 0;
}
.repeater-cell-main { flex: 3 1 240px; }
.repeater-cell-subtotal {
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
}
.repeater-cell-subtotal .form-control { flex: 1 1 0; min-width: 0; }

/* ── Mobile cell label ── */
.repeater-cell-label {
  font-size     : 0.7rem;
  font-weight   : 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color         : #6c757d;
  margin-bottom : 4px;
  display       : block;
}

/* ── Desktop grid columns (4 equal columns + delete button space) ── */
.repeater-cols-4 {
  grid-template-columns: 3fr 1fr 1.5fr 1.8fr;
}

/* ── Subtotal read-only field ── */
.repeater-subtotal {
  background : #e9ecef !important;
  color      : #495057 !important;
  font-weight: 600;
  cursor     : default;
}

/* ── Delete button ── */
.repeater-delete-btn {
  flex-shrink    : 0;
  width          : 34px;
  height         : 34px;
  padding        : 0;
  display        : inline-flex;
  align-items    : center;
  justify-content: center;
  background     : transparent;
  border         : 1px solid #f1aeb5;
  border-radius  : 6px;
  color          : #f13636;
  cursor         : pointer;
  transition     : background 0.15s, color 0.15s;
  line-height    : 1;
}
.repeater-delete-btn:hover {
  background  : #f13636;
  color       : #fff;
  border-color: #f13636;
}

/* ── Empty state ── */
.repeater-empty {
  padding   : 20px 16px;
  text-align: center;
  color     : #adb5bd;
  font-size : 0.875rem;
}

/* ── Price override / lock ── */
.price-input-wrapper {
  display: flex;
  align-items: stretch;
  gap: 4px;
}
.price-input-wrapper .price-field { flex: 1; min-width: 0; }
.btn-price-lock {
  flex-shrink    : 0;
  width          : 34px;
  border         : 1px solid #dee2e6;
  border-radius  : 6px;
  background     : #f8f9fa;
  color          : #adb5bd;
  cursor         : pointer;
  display        : inline-flex;
  align-items    : center;
  justify-content: center;
  transition     : all 0.15s;
  padding        : 0;
  font-size      : 0.85rem;
}
.btn-price-lock:hover { border-color: #6c757d; color: #495057; background: #e9ecef; }
.btn-price-lock.is-overridden { border-color: #fd7e14; color: #fd7e14; background: #fff3e0; }
.btn-price-lock.is-overridden:hover { background: #fd7e14; color: #fff; border-color: #fd7e14; }
.price-input-wrapper.price-override-active .price-field {
  border-color: #fd7e14 !important;
  box-shadow: 0 0 0 0.15rem rgba(255, 186, 47, 0.15) !important;
}
.price-field:not(.price-overridden) { background: #f8f9fa !important; color: #6c757d !important; cursor: default; }
.badge-custom { font-size: 0.6rem; vertical-align: middle; }

/* ── Full-width reason row ── */
.repeater-cell-reason {
  flex: 1 1 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0 2px;
  border-top: 1px dashed #ffe69c;
  margin-top: 4px;
}
.repeater-cell-reason .ri-information-line { flex-shrink: 0; font-size: 0.9rem; }
.price-reason-input {
  flex: 1;
  font-size: 0.78rem;
  border-color: var(--bs-warning) !important;
  background: #fffef5 !important;
  color: #856404;
}
.price-reason-input::placeholder { color: #c8a800; }

/* Manual site option inside CustomSelect2 */
:deep(.select2-results__option .manual-site-option) {
  color: inherit;
}

:deep(.select2-results__option--highlighted .manual-site-option),
:deep(.select2-results__option--selected .manual-site-option) {
  color: #fff;
}

:deep(.select2-results__option--highlighted .manual-site-option input),
:deep(.select2-results__option--selected .manual-site-option input) {
  color: #212529;
  background-color: #fff;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFdrStore } from '~/stores/fdr'
import { useCustomerStore } from '~/stores/customer'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import {
  getDidLineLabel,
  getLinePriceListId,
  mergePriceListLine,
  filterLinesByPriceListId,
} from '~/utils/priceListLines'
import { lineSubtotal } from '~/utils/lineSubtotal'
import { firstErrorTab } from '~/utils/apiError'
import {
  MANUAL_SITE_ID,
  MANUAL_SITE_OPTION,
  buildSiteSelectOptions,
  getSiteSelectLabel,
  isManualSiteSelection,
  resolveSiteFormState,
} from '~/utils/fdrSiteSelect'

const route = useRoute()
const fdrStore = useFdrStore()
const customerStore = useCustomerStore()
const formatRupiah = useFormatRupiah()
const toast = useToast()
const uiErrors = ref<Record<string, string>>({})
const formRoot = ref<HTMLFormElement | null>(null)
const { form, saving, validationErrors } = storeToRefs(fdrStore)
const validationErrorMessages = computed(() => {
  const list = validationErrors.value || []
  return list
    .map((err: any) => {
      if (typeof err === 'string') return err
      if (err?.message) return err.message
      if (err && typeof err === 'object') {
        const first = Object.values(err).flat?.() || Object.values(err)
        const item = Array.isArray(first) ? first[0] : first
        return typeof item === 'string' ? item : ''
      }
      return ''
    })
    .filter(Boolean)
})
const FDR_FIELD_TABS: Record<string, string> = {
  name: 'fdr-tab-info',
  location: 'fdr-tab-info',
  siteName: 'fdr-tab-info',
  siteId: 'fdr-tab-info',
  customerId: 'fdr-tab-info',
  businessSchemeId: 'fdr-tab-info',
  fdrDate: 'fdr-tab-info',
  estimatedStartDate: 'fdr-tab-info',
  estimatedCompletionDate: 'fdr-tab-info',
  fdrItems: 'fdr-tab-materials',
  fdrServices: 'fdr-tab-services',
  fdrDids: 'fdr-tab-dids',
  priceListLineId: 'fdr-tab-materials',
}
const formSteps = [
  { id: 'fdr-tab-info', label: 'Informasi', icon: 'ri-information-line' },
  { id: 'fdr-tab-materials', label: 'Material/Product', icon: 'ri-box-3-line' },
  { id: 'fdr-tab-services', label: 'Services', icon: 'ri-service-line' },
  { id: 'fdr-tab-dids', label: 'DID', icon: 'ri-phone-line' },
]
const {
  currentIndex,
  visibleSteps,
  isFirstStep,
  isLastStep,
  navigating,
  next,
  previous,
  goTo,
  goToId,
  paneClass,
  validateAll,
} = useTabbedFormNavigation({
  steps: formSteps,
  formRoot,
  validateStep: validateFdrStep,
})
const { customers } = storeToRefs(customerStore)

const fdrId = computed(() => route.params.id ? String(route.params.id) : null)
const pageTitle = computed(() => (fdrId.value ? 'Edit FDR' : 'Tambah FDR'))
const pageSubtitle = computed(() => (fdrId.value ? 'Perbarui data FDR.' : 'Isi form untuk membuat FDR baru.'))
const moduleNavItems = computed(() => [
  { label: 'FDR', to: '/sales/fdr', icon: 'ri-file-list-3-line' },
  { label: 'Quotation', to: '/sales/quotation', icon: 'ri-file-list-3-line' },
  { label: 'Sales Order', to: '/sales/sales-order', icon: 'ri-shopping-bag-3-line' },
])
const priorityOptions       = ref([{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }])
const sites                 = ref<any[]>([])
const businessSchemes       = ref<any[]>([])
const selectedPriceListId   = ref<number | null>(null)
const priceListOptions      = ref<any[]>([])
const priceListLinesProduct = ref<any[]>([])
const priceListLinesService = ref<any[]>([])
const priceListLinesDid     = ref<any[]>([])

const didLineSelectOptions = computed(() => {
  const plId = Number(selectedPriceListId.value)
  if (!plId) return priceListLinesDid.value || []
  return filterLinesByPriceListId(priceListLinesDid.value || [], plId)
})

const siteSelectOptions = computed(() => buildSiteSelectOptions(sites.value || []))
const isManualSite = computed(() => isManualSiteSelection(form.value?.siteId))
const siteSelectionLabel = computed(() => {
  if (isManualSiteSelection(form.value?.siteId)) {
    const name = String(form.value?.siteName || '').trim()
    if (name) return name
  }
  const site = sites.value.find((s) => Number(s.id) === Number(form.value?.siteId))
  if (site) return getSiteSelectLabel(site)
  return getSiteSelectLabel(MANUAL_SITE_OPTION, form.value?.siteName)
})

const getCustomerLabel     = (c: any) => c ? c.name : ''
const getCustomerId        = (c: any) => c ? c.id : null
const getOptionLabel       = (o: any) => o ? o.label : ''
const getOptionValue       = (o: any) => o ? o.value : null
const getSiteLabel         = (s: any) => getSiteSelectLabel(s, form.value?.siteName)
const getSiteId            = (s: any) => s ? s.id : null
const getBranchLabel       = (b: any) => b ? `${b.code || ''} - ${b.name || ''}` : ''
const getBranchId          = (b: any) => b ? b.id : null
const getPriceListLabel    = (pl: any) => pl ? `${pl.name || ''}${pl.type ? ` (${pl.type})` : ''}` : '—'
const getPriceListId       = (pl: any) => pl ? pl.id : null
const getMaterialLineLabel = (l: any) => l ? (l.product ? `${l.product.name} (${l.product.sku || ''})` : `Line #${l.id}`) : '—'
const getMaterialLineId    = (l: any) => l ? l.id : null
const getServiceLineLabel  = (l: any) => l ? (l.service ? l.service.name : `Line #${l.id}`) : '—'
const getServiceLineId     = (l: any) => l ? l.id : null
const getDidLineId         = (l: any) => l ? l.id : null

function isModuleNavActive(to: string) { return route.path === to || route.path.startsWith(`${to}/`) }
function toNum(v: any) { return (v !== null && v !== undefined && v !== '') ? Number(v) : 0 }
function parseRupiahToNumber(s: any) { return !s ? 0 : Number(String(s).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0 }
function activateTab(tabId: string) {
  void goToId(tabId, { skipValidation: true })
}

function validateFdrStep(step: { id: string }): boolean {
  uiErrors.value = {}
  if (step.id === 'fdr-tab-info') {
    if (!String(form.value?.name || '').trim()) {
      uiErrors.value.name = 'Nama Project wajib diisi'
    }
    if (!String(form.value?.location || '').trim()) {
      uiErrors.value.location = 'Lokasi wajib diisi'
    }
    if (isManualSiteSelection(form.value?.siteId) && !String(form.value?.siteName || '').trim()) {
      uiErrors.value.siteName = 'Nama Site wajib diisi'
    }
    const start = String(form.value?.estimatedStartDate || '')
    const end = String(form.value?.estimatedCompletionDate || '')
    if (start && end && end < start) {
      uiErrors.value.estimatedCompletionDate = 'Estimasi Selesai tidak boleh lebih awal dari Estimasi Mulai.'
    }
    return !uiErrors.value.name && !uiErrors.value.location && !uiErrors.value.siteName && !uiErrors.value.estimatedCompletionDate
  }
  if (step.id === 'fdr-tab-materials') {
    const items = Array.isArray(form.value?.fdrItems) ? form.value.fdrItems : []
    const itemInvalid = items.some((it: any) => (Number(it?.quantity) || 0) > 0 && Number(it?.priceListLineId || 0) <= 0)
    if (itemInvalid) {
      uiErrors.value.fdrItems = 'Material dengan quantity > 0 wajib memilih price list line'
      return false
    }
  }
  if (step.id === 'fdr-tab-services') {
    const services = Array.isArray(form.value?.fdrServices) ? form.value.fdrServices : []
    const serviceInvalid = services.some((it: any) => (Number(it?.quantity) || 0) > 0 && Number(it?.priceListLineId || 0) <= 0)
    if (serviceInvalid) {
      uiErrors.value.fdrServices = 'Service dengan quantity > 0 wajib memilih price list line'
      return false
    }
  }
  if (step.id === 'fdr-tab-dids') {
    const dids = Array.isArray(form.value?.fdrDids) ? form.value.fdrDids : []
    const didInvalid = dids.some((it: any) => (Number(it?.quantity) || 0) > 0 && Number(it?.priceListLineId || 0) <= 0)
    if (didInvalid) {
      uiErrors.value.fdrDids = 'DID dengan quantity > 0 wajib memilih price list line'
      return false
    }
  }
  return true
}
function getServiceLineEffectivePriceFromLine(line: any) {
  const base = toNum(line?.price) || 0
  const tk   = toNum(line?.terminalKitCount ?? line?.terminal_kit_count) || 0
  const qp   = toNum(line?.quotaPriority ?? line?.quota_priority) || 0
  const nsl  = toNum(line?.newServiceLine ?? line?.new_service_line) || 0
  const ad   = toNum(line?.additionalData ?? line?.additional_data) || 0
  return base + tk + qp + nsl + ad
}

function onSiteChange(siteId: number | null) {
  if (siteId == null) {
    if (form.value) form.value.siteName = ''
    return
  }
  if (isManualSiteSelection(siteId)) {
    if (form.value) form.value.siteName = form.value.siteName || ''
    return
  }
  if (form.value) form.value.siteName = ''
  const s = sites.value.find((x) => x.id === siteId)
  if (s && form.value) form.value.location = s.address || ''
}

function confirmManualSite() {
  if (!form.value) return
  const name = String(form.value.siteName || '').trim()
  if (!name) return
  form.value.siteId = MANUAL_SITE_ID
  onSiteChange(MANUAL_SITE_ID)
}
function calculateItemSubtotal(index: number) {
  const item = form.value?.fdrItems?.[index]; if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}
function calculateServiceSubtotal(index: number) {
  const item = form.value?.fdrServices?.[index]; if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}
function calculateDidSubtotal(index: number) {
  const item = form.value?.fdrDids?.[index]; if (!item) return
  item.subtotal = (Number(item.quantity) || 1) * (Number(item.price) || 0)
}
function updateItemPriceFromInput(index: number, e: any) { if (!form.value?.fdrItems?.[index]) return; form.value.fdrItems[index].price = parseRupiahToNumber(e.target?.value); calculateItemSubtotal(index) }
function updateServicePriceFromInput(index: number, e: any) { if (!form.value?.fdrServices?.[index]) return; form.value.fdrServices[index].price = parseRupiahToNumber(e.target?.value); calculateServiceSubtotal(index) }
function updateDidPriceFromInput(index: number, e: any) { if (!form.value?.fdrDids?.[index]) return; form.value.fdrDids[index].price = parseRupiahToNumber(e.target?.value); calculateDidSubtotal(index) }

function toggleItemOverride(index: number) {
  const item = form.value?.fdrItems?.[index]
  if (!item) return
  if (item.isPriceOverridden) {
    const line = priceListLinesProduct.value.find((l) => Number(l.id) === Number(item.priceListLineId))
    if (line) item.price = Number(line.price) || 0
    item.isPriceOverridden = false
    item.priceReason = ''
    calculateItemSubtotal(index)
  } else {
    item.isPriceOverridden = true
  }
}
function toggleServiceOverride(index: number) {
  const item = form.value?.fdrServices?.[index]
  if (!item) return
  if (item.isPriceOverridden) {
    const line = priceListLinesService.value.find((l) => Number(l.id) === Number(item.priceListLineId))
    if (line) item.price = getServiceLineEffectivePriceFromLine(line)
    item.isPriceOverridden = false
    item.priceReason = ''
    calculateServiceSubtotal(index)
  } else {
    item.isPriceOverridden = true
  }
}
function toggleDidOverride(index: number) {
  const item = form.value?.fdrDids?.[index]
  if (!item) return
  if (item.isPriceOverridden) {
    const line = priceListLinesDid.value.find((l) => Number(l.id) === Number(item.priceListLineId))
    if (line) item.price = Number(line.price) || 0
    item.isPriceOverridden = false
    item.priceReason = ''
    calculateDidSubtotal(index)
  } else {
    item.isPriceOverridden = true
  }
}

function onAttachmentChange(e: any) {
  const file = e.target.files?.[0]
  if (!form.value) return
  form.value.attachment = file || null
  form.value.attachmentPreview = file ? URL.createObjectURL(file) : null
  e.target.value = ''
}

async function onItemLineChange(index: number, lineId: number) {
  const line = priceListLinesProduct.value.find((l) => l.id === lineId)
  const item = form.value?.fdrItems?.[index]
  if (!line || !item) return
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.priceReason = ''
  item.subtotal = item.quantity * item.price
}
async function onServiceLineChange(index: number, lineId: number) {
  const line = priceListLinesService.value.find((l) => l.id === lineId)
  const item = form.value?.fdrServices?.[index]
  if (!line || !item) return
  item.price = getServiceLineEffectivePriceFromLine(line)
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.priceReason = ''
  item.subtotal = item.quantity * item.price
}
async function onDidLineChange(index: number, lineId: number) {
  const line = priceListLinesDid.value.find((l) => l.id === lineId)
  const item = form.value?.fdrDids?.[index]
  if (!line || !item) return
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.priceReason = ''
  item.subtotal = item.quantity * item.price
}

async function enrichPriceListLinesFromPriceList(priceListId: number | null) {
  const id = Number(priceListId)
  if (!id) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.priceListShow(id)}?includeLines=true`, { credentials: 'include', headers: { Accept: 'application/json' } })
    if (!res.ok) return
    const priceList = await res.json()
    const lines = priceList.lines || []
    const pt = (l: any) => l.priceableType ?? l.priceable_type
    lines.filter((l: any) => pt(l) === 'product').forEach((l: any) => mergePriceListLine(priceListLinesProduct.value, l, id, priceList.name))
    lines.filter((l: any) => pt(l) === 'service').forEach((l: any) => mergePriceListLine(priceListLinesService.value, l, id, priceList.name))
    lines.filter((l: any) => pt(l) === 'did').forEach((l: any) => mergePriceListLine(priceListLinesDid.value, l, id, priceList.name))
  } catch (e) {
    console.error('Error enriching FDR price list lines:', e)
  }
}

async function ensureDidLinesForSelectedPriceList() {
  const plId = Number(selectedPriceListId.value)
  if (!plId) return
  const hasLines = filterLinesByPriceListId(priceListLinesDid.value || [], plId).length > 0
  if (!hasLines) await enrichPriceListLinesFromPriceList(plId)
}

function mergeFdrFormLinesIntoCache() {
  const mergeRows = (rows: any[], cache: any[]) => {
    for (const row of rows || []) {
      const plLine = row?.priceListLine ?? row?.price_list_line
      if (!plLine?.id) continue
      mergePriceListLine(cache, plLine, getLinePriceListId(plLine))
    }
  }
  mergeRows(form.value?.fdrItems, priceListLinesProduct.value)
  mergeRows(form.value?.fdrServices, priceListLinesService.value)
  mergeRows(form.value?.fdrDids, priceListLinesDid.value)
}

function resolvePriceListIdFromForm(): number | null {
  const rows = [
    ...(form.value?.fdrItems || []),
    ...(form.value?.fdrServices || []),
    ...(form.value?.fdrDids || []),
  ]
  const counts = new Map<number, number>()
  for (const row of rows) {
    const plLine = row?.priceListLine ?? row?.price_list_line
    let plId = getLinePriceListId(plLine)
    if (!plId && row?.priceListLineId) {
      const cached = [...priceListLinesProduct.value, ...priceListLinesService.value, ...priceListLinesDid.value]
        .find((l) => Number(l.id) === Number(row.priceListLineId))
      plId = cached ? getLinePriceListId(cached) : null
    }
    if (plId) counts.set(plId, (counts.get(plId) || 0) + 1)
  }
  let best: number | null = null
  let max = 0
  for (const [id, count] of counts) {
    if (count > max) { max = count; best = id }
  }
  return best
}

async function onPriceListSelect(priceListId: number | null) {
  if (!priceListId || !form.value) return
  const plId = Number(priceListId)
  selectedPriceListId.value = plId
  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.priceListShow(plId)}?includeLines=true`, { credentials: 'include', headers: { Accept: 'application/json' } })
  if (!res.ok) return
  const priceList = await res.json()
  const lines = priceList.lines || []
  const pt = (l: any) => l.priceableType ?? l.priceable_type
  form.value.fdrItems = lines.filter((l: any) => pt(l) === 'product').map((l: any) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: toNum(l.price) || 0, subtotal: toNum(l.subtotal) || (toNum(l.quantity) || 1) * (toNum(l.price) || 0), isPriceOverridden: false, priceReason: '' }))
  form.value.fdrServices = lines.filter((l: any) => pt(l) === 'service').map((l: any) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: getServiceLineEffectivePriceFromLine(l), subtotal: (toNum(l.quantity) || 1) * getServiceLineEffectivePriceFromLine(l), isPriceOverridden: false, priceReason: '' }))
  form.value.fdrDids = lines.filter((l: any) => pt(l) === 'did').map((l: any) => ({ priceListLineId: l.id, quantity: toNum(l.quantity) || 1, price: toNum(l.price) || 0, subtotal: toNum(l.subtotal) || (toNum(l.quantity) || 1) * (toNum(l.price) || 0), isPriceOverridden: false, priceReason: '' }))
  lines.filter((l: any) => pt(l) === 'product').forEach((l: any) => mergePriceListLine(priceListLinesProduct.value, l, plId, priceList.name))
  lines.filter((l: any) => pt(l) === 'service').forEach((l: any) => mergePriceListLine(priceListLinesService.value, l, plId, priceList.name))
  lines.filter((l: any) => pt(l) === 'did').forEach((l: any) => mergePriceListLine(priceListLinesDid.value, l, plId, priceList.name))
  if (!form.value.fdrItems.length) fdrStore.addItem()
  if (!form.value.fdrServices.length) fdrStore.addService()
  if (!form.value.fdrDids.length) fdrStore.addDid()
}

async function loadMasters() {
  const { $api } = useNuxtApp()
  const [siteRes, bsRes, plRes, p, s, d] = await Promise.all([
    fetch(`${$api.sites()}?page=1&rows=500&forSelect=true`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.businessSchemes()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fetch(`${$api.priceList()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' }),
    fdrStore.fetchPriceListLines('product'),
    fdrStore.fetchPriceListLines('service'),
    fdrStore.fetchPriceListLines('did'),
  ])
  sites.value = siteRes.ok ? ((await siteRes.json()).data || []) : []
  businessSchemes.value = bsRes.ok ? ((await bsRes.json()).data || []) : []
  priceListOptions.value = plRes.ok ? ((await plRes.json()).data || []) : []
  priceListLinesProduct.value = p; priceListLinesService.value = s; priceListLinesDid.value = d
}

async function initForm() {
  fdrStore.closeModal()
  await Promise.all([customerStore.fetchCustomers(), loadMasters()])
  if (fdrId.value) {
    await fdrStore.openModal({ id: fdrId.value })
    fdrStore.showModal = false
  } else {
    await fdrStore.openModal(null)
    fdrStore.showModal = false
  }
  mergeFdrFormLinesIntoCache()
  const siteState = resolveSiteFormState(form.value || {})
  if (form.value) {
    form.value.siteId = siteState.siteId
    form.value.siteName = siteState.siteName
  }
  const plId = resolvePriceListIdFromForm()
  if (plId) {
    selectedPriceListId.value = plId
    await enrichPriceListLinesFromPriceList(plId)
  }
  await ensureDidLinesForSelectedPriceList()
}

async function onFormSubmit() {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await onSubmit()
}

async function onSubmit() {
  uiErrors.value = {}
  const errors: Array<{ field: string; message: string; tab: string }> = []
  if (!String(form.value?.name || '').trim()) {
    errors.push({ field: 'name', message: 'Nama Project wajib diisi', tab: 'fdr-tab-info' })
    uiErrors.value.name = 'Nama Project wajib diisi'
  }
  if (!String(form.value?.location || '').trim()) {
    errors.push({ field: 'location', message: 'Lokasi wajib diisi', tab: 'fdr-tab-info' })
    uiErrors.value.location = 'Lokasi wajib diisi'
  }
  if (isManualSiteSelection(form.value?.siteId) && !String(form.value?.siteName || '').trim()) {
    errors.push({ field: 'siteName', message: 'Nama Site wajib diisi', tab: 'fdr-tab-info' })
    uiErrors.value.siteName = 'Nama Site wajib diisi'
  }
  const start = String(form.value?.estimatedStartDate || '')
  const end = String(form.value?.estimatedCompletionDate || '')
  if (start && end && end < start) {
    errors.push({ field: 'estimatedCompletionDate', message: 'Estimasi Selesai tidak boleh lebih awal dari Estimasi Mulai.', tab: 'fdr-tab-info' })
    uiErrors.value.estimatedCompletionDate = 'Estimasi Selesai tidak boleh lebih awal dari Estimasi Mulai.'
  }
  const items = Array.isArray(form.value?.fdrItems) ? form.value.fdrItems : []
  const services = Array.isArray(form.value?.fdrServices) ? form.value.fdrServices : []
  const dids = Array.isArray(form.value?.fdrDids) ? form.value.fdrDids : []
  const itemInvalid = items.some((it: any) => (Number(it?.quantity) || 0) > 0 && Number(it?.priceListLineId || 0) <= 0)
  const serviceInvalid = services.some((it: any) => (Number(it?.quantity) || 0) > 0 && Number(it?.priceListLineId || 0) <= 0)
  const didInvalid = dids.some((it: any) => (Number(it?.quantity) || 0) > 0 && Number(it?.priceListLineId || 0) <= 0)
  if (itemInvalid) { errors.push({ field: 'fdrItems', message: 'Material dengan quantity > 0 wajib memilih price list line', tab: 'fdr-tab-materials' }); uiErrors.value.fdrItems = 'Material dengan quantity > 0 wajib memilih price list line' }
  if (serviceInvalid) { errors.push({ field: 'fdrServices', message: 'Service dengan quantity > 0 wajib memilih price list line', tab: 'fdr-tab-services' }); uiErrors.value.fdrServices = 'Service dengan quantity > 0 wajib memilih price list line' }
  if (didInvalid) { errors.push({ field: 'fdrDids', message: 'DID dengan quantity > 0 wajib memilih price list line', tab: 'fdr-tab-dids' }); uiErrors.value.fdrDids = 'DID dengan quantity > 0 wajib memilih price list line' }
  if (!items.length && !services.length && !dids.length) {
    errors.push({ field: 'fdrItems', message: 'Minimal isi satu item Material/Service/DID', tab: 'fdr-tab-materials' })
    uiErrors.value.fdrItems = 'Minimal isi satu item Material/Service/DID'
  }
  if (errors.length > 0) {
    fdrStore.validationErrors = errors.map((e) => ({ field: e.field, message: e.message }))
    activateTab(errors[0].tab)
    toast.error({
      title: 'Validasi',
      message: errors.length > 1 ? 'Mohon periksa kembali data yang belum valid.' : errors[0].message,
      color: 'red',
      position: 'bottomRight',
      layout: 2,
    })
    return
  }
  const saved = await fdrStore.saveFdr({ navigateToList: true })
  if (!saved) {
    const list = Array.isArray(fdrStore.validationErrors) ? fdrStore.validationErrors : []
    for (const item of list as any[]) {
      if (item?.field && item?.message) uiErrors.value[item.field] = item.message
    }
    const tab = firstErrorTab(list as any, FDR_FIELD_TABS)
    if (tab) activateTab(tab)
  }
}

onMounted(initForm)

watch(selectedPriceListId, async (plId) => {
  if (plId) await ensureDidLinesForSelectedPriceList()
})
</script>
