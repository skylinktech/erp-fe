<template>
    <div class="content-wrapper">
        <div class="container-xxl flex-grow-1">
            
            <p class="mb-6">Kelola master data produk dan komponen bundling.</p>

            <ListPageStatsCards :items="statCards" />

            <CollapsibleFilterCard
                title="Filter Product"
                :has-active-filters="hasActiveFilters"
                :show-reset="false"
                @reset="resetFilters"
            >
                <FilterFieldsRow :columns="3">
                    <FilterField>
                        <label class="form-label">Kategori</label>
                        <CustomSelect2
                            v-model="filters.categoryId"
                            :options="kategori"
                            :get-option-label="option => option?.name || ''"
                            :reduce="option => option?.id"
                            searchable
                            clearable
                            placeholder="Semua kategori"
                        />
                    </FilterField>
                    <FilterField>
                        <label class="form-label">Scope Penggunaan</label>
                        <CustomSelect2
                            v-model="filters.isInternal"
                            :options="scopeFilterOptions"
                            :get-option-label="option => option.label"
                            :reduce="option => option.value"
                            :get-option-key="option => option.value"
                            searchable
                            clearable
                            placeholder="Semua scope"
                        />
                    </FilterField>
                    <FilterField>
                        <label class="form-label">Device</label>
                        <CustomSelect2
                            v-model="filters.isDevice"
                            :options="booleanFilterOptions"
                            :get-option-label="option => option.label"
                            :reduce="option => option.value"
                            :get-option-key="option => option.value"
                            searchable
                            clearable
                            placeholder="Semua"
                        />
                    </FilterField>
                    <FilterField>
                        <label class="form-label">Bundling</label>
                        <CustomSelect2
                            v-model="filters.isBundling"
                            :options="booleanFilterOptions"
                            :get-option-label="option => option.label"
                            :reduce="option => option.value"
                            :get-option-key="option => option.value"
                            searchable
                            clearable
                            placeholder="Semua"
                        />
                    </FilterField>
                    <FilterField v-if="!isRetailCompany">
                        <label class="form-label">Tipe Tagihan</label>
                        <CustomSelect2
                            v-model="filters.billingType"
                            :options="billingTypeOptions"
                            :get-option-label="option => option.label"
                            :reduce="option => option.value"
                            :get-option-key="option => option.value"
                            searchable
                            clearable
                            placeholder="Semua tipe tagihan"
                        />
                    </FilterField>
                    <FilterField>
                        <label class="form-label">Kondisi</label>
                        <CustomSelect2
                            v-model="filters.condition"
                            :options="conditionOptions"
                            :get-option-label="option => option.label"
                            :reduce="option => option.value"
                            :get-option-key="option => option.value"
                            searchable
                            clearable
                            placeholder="Semua kondisi"
                        />
                    </FilterField>
                </FilterFieldsRow>
                <div class="col-12 d-flex justify-content-end mt-4">
                    <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
                        <i class="ri-refresh-line me-1"></i>
                        Reset Filter
                    </button>
                </div>
            </CollapsibleFilterCard>

            <div class="col-12">
                <div class="card">
                    <ListPageTableHeader
                        :rows="Number(tableControls.rows)"
                        :rows-options="rowsPerPageOptionsArray"
                        :search="globalFilterValue"
                        search-placeholder="Cari berdasarkan nama, atau part number..."
                        :export-disabled="loading"
                        :export-items="[
                            { value: 'csv', label: 'CSV' },
                            { value: 'excel', label: 'Excel' },
                            { value: 'pdf', label: 'PDF' },
                        ]"
                        @update:rows="onProductToolbarRows"
                        @update:search="(v) => { globalFilterValue = v }"
                        @export="exportData"
                    >
                        <template #add>
                            <button
                                v-if="userHasRole('superadmin') || userHasPermission('create_product')"
                                type="button"
                                class="btn btn-primary"
                                @click="productStore.openModal()"
                            >
                                <i class="ri-add-line me-1"></i>
                                Tambah Product
                            </button>
                        </template>
                        <template #toolbar-extra>
                            <NuxtLink
                                v-if="userHasRole('superadmin')"
                                to="/inventory/import-product"
                                class="btn btn-dark"
                            >
                                <i class="ri-download-line me-1"></i> Import Excel
                            </NuxtLink>
                        </template>
                    </ListPageTableHeader>
                    <div class="card-datatable table-responsive py-3 px-3">
                        <MyDataTable
                            ref="myDataTableRef"
                            :data="products"
                            :rows="Number(params.rows)"
                            :loading="loading"
                            :totalRecords="totalRecords"
                            :first="params.first"
                            :lazy="true"
                            :sort-field="params.sortField"
                            :sort-order="params.sortOrder"
                            sort-mode="single"
                            @page="onPage($event)"
                            @sort="onSort($event)"
                            responsiveLayout="scroll"
                            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                            :expandedRows="expandedRows"
                            @row-toggle="onRowToggle"
                        >
                            <Column :expander="true" headerStyle="width: 3rem" />
                            <Column header="#" :sortable="false">
                                <template #body="slotProps">
                                    {{ params.first + slotProps.index + 1 }}
                                </template>
                            </Column>
                            <Column field="image" header="Gambar" :sortable="true">
                                <template #body="slotProps">
                                    <div v-if="slotProps.data.image">
                                        <img
                                            :src="getProductImage(slotProps.data.image)"
                                            alt="Gambar Produk"
                                            style="height: 40px; max-width: 80px; object-fit: contain; cursor: pointer;"
                                            @error="(e) => handleImageError(e, '/img/default-product-image.png')"
                                            @click="productStore.openImageInNewTab(slotProps.data.image)"
                                            @load="debugImageUrl(slotProps.data.image)"
                                            title="Klik untuk melihat gambar lengkap"
                                        />
                                    </div>
                                    <div v-else>
                                        <img
                                            src="/img/default-product-image.png"
                                            alt="Default Image"
                                            style="height: 40px; max-width: 80px; object-fit: contain;"
                                        />
                                    </div>
                                </template>
                            </Column>
                            <Column field="sku" class="text-nowrap" header="SKU/Serial Number" :sortable="true"></Column>
                            <Column field="name" header="Nama" :sortable="true"></Column>
                            <Column v-if="!isRetailCompany" field="productType" header="Jenis / Type KIT" :sortable="true">
                                <template #body="slotProps">
                                    {{ slotProps.data.productType || '-' }}
                                </template>
                            </Column>
                            <Column field="isDevice" header="Device" :sortable="true">
                                <template #body="slotProps">
                                    <span :class="getStatusBadge(slotProps.data.isDevice).class">
                                        {{ getStatusBadge(slotProps.data.isDevice).text }}
                                    </span>
                                </template>
                            </Column>
                            <Column field="isBundling" header="Bundling" :sortable="true">
                                <template #body="slotProps">
                                    <span :class="getStatusBadge(slotProps.data.isBundling ?? slotProps.data.isKit).class">
                                        {{ getStatusBadge(slotProps.data.isBundling ?? slotProps.data.isKit).text }}
                                    </span>
                                </template>
                            </Column>
                            <Column field="isInternal" header="Scope" :sortable="true">
                                <template #body="slotProps">
                                    <span :class="getInternalScopeBadge(slotProps.data.isInternal).class">
                                        {{ getInternalScopeBadge(slotProps.data.isInternal).text }}
                                    </span>
                                </template>
                            </Column>
                            <Column v-if="!isRetailCompany" field="billingType" header="Tipe Tagihan" :sortable="true">
                                <template #body="slotProps">
                                    {{ slotProps.data.billingType === 'recurring' ? 'Recurring' : 'One Time' }}
                                </template>
                            </Column>
                            <Column v-if="isRetailCompany" class="text-nowrap" field="expiredAt" header="Expired At" :sortable="true">
                                <template #body="slotProps">
                                    {{ formatProductExpiredAtDisplay(slotProps.data.expiredAt ?? slotProps.data.expired_at) }}
                                </template>
                            </Column>
                            <Column field="condition" header="Kondisi" :sortable="true">
                                <template #body="slotProps">
                                    {{ conditionLabel(slotProps.data.condition) }}
                                </template>
                            </Column>
                            <Column header="Kategori" field="category.name" :sortable="true">
                                <template #body="slotProps">
                                    {{ slotProps.data.category?.name || '-' }}
                                </template>
                            </Column>
                            <Column field="createdByUser.fullName" class="text-nowrap" header="Dibuat Oleh" :sortable="true">
                                <template #body="slotProps">
                                    {{ slotProps.data.createdByUser?.fullName || '-' }}
                                </template>
                            </Column>
                            <Column header="Actions" :exportable="false" style="min-width:8rem">
                                <template #body="slotProps">
                                    <div class="d-inline-block">
                                        <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                            <i class="ri-more-2-fill"></i>
                                        </a>
                                        <ul class="dropdown-menu">
                                            <li v-if="userHasRole('superadmin') || userHasPermission('edit_product')">
                                                <a class="dropdown-item" href="javascript:void(0)" @click="productStore.openModal(slotProps.data)">
                                                    <i class="ri-edit-box-line me-2"></i> Edit
                                                </a>
                                            </li>
                                            <li v-if="userHasRole('superadmin') || userHasPermission('delete_product')">
                                                <a class="dropdown-item text-danger" href="javascript:void(0)" @click="productStore.deleteProduct(slotProps.data.id)">
                                                    <i class="ri-delete-bin-7-line me-2"></i> Hapus
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </template>
                            </Column>
                            <template #expansion="slotProps">
                                <div class="p-3 bg-light">
                                    <h6 class="mb-3">Komponen Bundling</h6>
                                    <div v-if="(slotProps.data.isBundling ?? slotProps.data.isKit) && (slotProps.data.productBundlingComponents || slotProps.data.productKits)?.length">
                                        <div class="table-responsive">
                                            <table class="table table-sm table-bordered mb-0">
                                                <thead>
                                                    <tr>
                                                        <th style="width: 60px">#</th>
                                                        <th>Name</th>
                                                        <th>Serial Number</th>
                                                        <th v-if="!isRetailCompany">Type</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr
                                                        v-for="(item, index) in (slotProps.data.productBundlingComponents || slotProps.data.productKits)"
                                                        :key="item.id || `bundling-${index}`"
                                                    >
                                                        <td>{{ index + 1 }}</td>
                                                        <td>{{ item.name || '-' }}</td>
                                                        <td>{{ item.serialNumber || item.serial_number || '-' }}</td>
                                                        <td v-if="!isRetailCompany" class="text-capitalize">{{ item.type || '-' }}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div v-else class="text-muted">
                                        Product ini tidak memiliki komponen bundling.
                                    </div>
                                </div>
                            </template>
                        </MyDataTable>
                    </div>
                </div>
            </div>

            <Modal
                :model-value="showModal"
                @close="productStore.closeModal"
                id="ProductModal"
                :title="modalTitle"
                :description="modalDescription"
                :validationErrorsFromParent="validationErrors"
            >
                <template #default>
                    <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
                        <TabbedFormNav
                            :steps="visibleSteps"
                            :current-index="currentIndex"
                            :disabled="navigating || loading"
                            nav-class="mb-4"
                            @select="goTo"
                        />
                        <div v-show="isCurrent('product-info')" class="row g-4" data-step-id="product-info">
                            <div class="col-md-6">
                                <label class="form-label">Part Number <span class="text-danger" aria-hidden="true">*</span></label>
                                <input type="text" class="form-control" v-model="form.sku" placeholder="Masukkan part number" id="sku">
                                <div v-if="hasFieldError('sku')" class="invalid-feedback">
                                    {{ getFieldError('sku') }}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Nama Barang <span class="text-danger" aria-hidden="true">*</span></label>
                                <input type="text" class="form-control" v-model="form.name" placeholder="Masukkan nama barang" id="name" @input="form.name = $event.target.value.toUpperCase()">
                                <div v-if="hasFieldError('name')" class="invalid-feedback">
                                    {{ getFieldError('name') }}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Satuan <span class="text-danger" aria-hidden="true">*</span></label>
                                <CustomSelect2
                                    v-model="form.unitId"
                                    :options="units"
                                    :get-option-label="option => option?.name || ''"
                                    :reduce="option => option?.id"
                                    searchable
                                    clearable
                                    placeholder="-- Pilih Satuan --"
                                    class="unit"
                                    id="unitId"
                                />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Kategori <span class="text-danger" aria-hidden="true">*</span></label>
                                <CustomSelect2
                                    v-model="form.categoryId"
                                    :options="kategori"
                                    :get-option-label="option => option?.name || ''"
                                    :reduce="option => option?.id"
                                    searchable
                                    clearable
                                    placeholder="-- Pilih Kategori --"
                                    class="kategori"
                                    id="categoryId"
                                />
                            </div>
                            <div v-if="!isRetailCompany" class="col-md-6">
                                <label class="form-label">Jenis / Type KIT</label>
                                <input type="text" class="form-control" v-model="form.productType" placeholder="e.g. Flat Standard-V4, Standard Actuated-V3" id="productType">
                            </div>
                            <div v-if="showExpiredAtField" class="col-md-6">
                                <label class="form-label">
                                    Expired At
                                    <span v-if="expiredAtRequired" class="text-danger" aria-hidden="true">*</span>
                                </label>
                                <input
                                    id="expiredAt"
                                    v-model="form.expiredAt"
                                    type="date"
                                    class="form-control"
                                    :class="{ 'is-invalid': hasFieldError('expiredAt') }"
                                    :required="expiredAtRequired"
                                    :aria-required="expiredAtRequired"
                                >
                                <div v-if="hasFieldError('expiredAt')" class="invalid-feedback d-block">
                                    {{ getFieldError('expiredAt') }}
                                </div>
                            </div>
                            <div v-if="!isRetailCompany" class="col-md-6">
                                <label class="form-label">Tipe Tagihan</label>
                                <CustomSelect2 v-model="form.billingType" :options="billingTypeOptions" :get-option-label="option => option.label" :reduce="option => option.value" searchable clearable :get-option-key="option => option.value" placeholder="-- Pilih Tipe Tagihan --" id="billingType" class="select-billing-type" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Kondisi</label>
                                <CustomSelect2 v-model="form.condition" :options="conditionOptions" :get-option-label="option => option.label" :reduce="option => option.value" searchable :clearable="false" placeholder="-- Pilih Kondisi --" id="condition" />
                            </div>
                            <div class="col-md-6">
                                <FormLabel required for="image">Gambar Produk</FormLabel>
                                <input
                                    type="file"
                                    class="form-control"
                                    @change="onImageChange"
                                    accept="image/*"
                                    id="image"
                                >
                                <small class="text-muted d-block mt-1">Maks. 5MB. Format: jpg, jpeg, png, gif, webp</small>
                                <div v-if="form.imagePreview" class="mt-2">
                                    <img
                                        :src="form.imagePreview"
                                        alt="Image Preview"
                                        class="image-preview"
                                        style="height: 60px; max-width: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;"
                                        @error="(e) => handleImageError(e, '/img/default-product-image.png')"
                                    />
                                    <a :href="form.imagePreview" target="_blank" rel="noopener noreferrer" class="d-block mt-1">Lihat Gambar</a>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Scope Penggunaan</label>
                                <CustomSelect2
                                    v-model="isInternalSelect"
                                    :options="isInternalOptions"
                                    :get-option-label="option => option.label"
                                    :reduce="option => option.value"
                                    :get-option-key="option => option.value"
                                    searchable
                                    clearable
                                    placeholder="-- Pilih Scope --"
                                    id="isInternal"
                                />
                                <small class="text-muted">Kosongkan untuk produk yang bisa dipakai internal maupun eksternal.</small>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Tracking Policy</label>
                                <CustomSelect2
                                    v-model="form.trackingPolicy"
                                    :options="trackingPolicyOptions"
                                    :get-option-label="option => option.label"
                                    :reduce="option => option.value"
                                    :get-option-key="option => option.value"
                                    :clearable="false"
                                    placeholder="-- Pilih Policy --"
                                />
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex align-items-center gap-4 mt-3 flex-wrap">
                                    <div class="form-check form-switch d-flex align-items-center mb-0">
                                        <input class="form-check-input me-2" type="checkbox" v-model="form.isDevice" @change="onDeviceToggle" />
                                        <label class="form-check-label mb-0">Is Device?</label>
                                    </div>
                                    <div class="form-check form-switch d-flex align-items-center mb-0">
                                        <input class="form-check-input me-2" type="checkbox" v-model="form.isBundling" @change="onBundlingToggle" />
                                        <label class="form-check-label mb-0">Is Bundling?</label>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6" v-if="form.trackingPolicy === 'DEFERRED_COMPONENT_SERIAL'">
                                <div class="form-check mt-4">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        v-model="form.assignmentRequiresSerialVerification"
                                    />
                                    <label class="form-check-label">Assignment memerlukan serial komponen terverifikasi</label>
                                </div>
                            </div>
                        </div>

                        <div v-if="form.isBundling" v-show="isCurrent('product-bundling')" class="mt-2" data-step-id="product-bundling">
                            <div class="alert alert-secondary mb-4">
                                Tambahkan komponen bundling di bawah ini.
                            </div>
                            <div v-for="(item, index) in form.productBundlingComponents" :key="`bundling-${index}`" class="repeater-item mb-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <span class="text-muted fw-medium">Bundling Item #{{ index + 1 }}</span>
                                    <button class="btn btn-sm btn-outline-danger" @click.prevent="productStore.removeProductBundlingComponent(index)" type="button">
                                        <i class="ri-delete-bin-line me-1"></i> Hapus
                                    </button>
                                </div>
                                <div class="row g-3">
                                    <div :class="isRetailCompany ? 'col-md-6' : 'col-md-4'">
                                        <label class="form-label">Name <span v-if="form.isBundling" class="text-danger" aria-hidden="true">*</span></label>
                                        <input type="text" class="form-control" v-model="item.name" placeholder="Nama komponen bundling">
                                    </div>
                                    <div :class="isRetailCompany ? 'col-md-6' : 'col-md-4'">
                                        <label class="form-label">SKU / Serial Number</label>
                                        <input type="text" class="form-control" v-model="item.serialNumber" placeholder="SKU / Serial Number">
                                    </div>
                                    <div v-if="!isRetailCompany" class="col-md-4">
                                        <label class="form-label">Type</label>
                                        <CustomSelect2
                                            v-model="item.type"
                                            :options="productBundlingTypeOptions"
                                            :get-option-label="option => option.label"
                                            :reduce="option => option.value"
                                            :get-option-key="option => option.value"
                                            :clearable="false"
                                            placeholder="-- Pilih Type --"
                                        />
                                    </div>
                                </div>
                                <hr class="my-4">
                            </div>
                            <button type="button" class="btn btn-outline-primary" @click="productStore.addProductBundlingComponent()">
                                Tambah Item Bundling
                            </button>
                        </div>
                        <TabbedFormActions
                            :is-first-step="isFirstStep"
                            :is-last-step="isLastStep"
                            :loading="navigating"
                            :saving="loading"
                            cancel-label="Tutup"
                            @next="next"
                            @previous="previous"
                            @cancel="productStore.closeModal()"
                        />
                    </form>
                </template>
            </Modal>
        </div>
        <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCompanyScopedReload } from '~/composables/useCompanyScopedReload'
import { storeToRefs } from 'pinia'
import { useProductStore } from '~/stores/product'
import { useKategoriStore } from '~/stores/kategori'
import { useUserStore } from '~/stores/user'
import { useUnitStore } from '~/stores/unit'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { usePermissionsStore } from '~/stores/permissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import FormLabel from '~/components/form/FormLabel.vue'
import { useCompanyContextStore } from '~/stores/companyContext'
import {
  formatProductExpiredAtDisplay,
  isProductExpiredAtRequired,
  isProductExpiredAtVisible,
} from '~/utils/productExpiry'

const { setListTitle } = useDynamicTitle()
const { getProductImage, handleImageError, debugImageUrl } = useImageUrl()
const { userHasPermission, userHasRole } = usePermissions()
const companyContextStore = useCompanyContextStore()
const { profileCode } = storeToRefs(companyContextStore)

/** Active Company dengan business profile RETAIL — Type KIT / Tipe Tagihan tidak relevan. */
const isRetailCompany = computed(() => profileCode.value === 'RETAIL')

const myDataTableRef = ref(null)
const productStore = useProductStore()
const kategoriStore = useKategoriStore()
const unitStore = useUnitStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()

const { products, loading, totalRecords, params, statistics, form, isEditMode, showModal, validationErrors } = storeToRefs(productStore)
const { kategori } = storeToRefs(kategoriStore)
const { units } = storeToRefs(unitStore)

const showExpiredAtField = computed(() =>
  isProductExpiredAtVisible({
    isRetailCompany: isRetailCompany.value,
    isBundling: !!form.value?.isBundling,
  })
)

const expiredAtRequired = computed(() =>
  isProductExpiredAtRequired({
    isRetailCompany: isRetailCompany.value,
    isBundling: !!form.value?.isBundling,
  })
)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = [10, 25, 50, 100]
const formRoot = ref(null)
const formSteps = computed(() => [
  { id: 'product-info', label: 'Informasi Produk' },
  { id: 'product-bundling', label: 'Komponen Bundling', visible: !!form.value.isBundling },
])
function isEmptyProductField(value) {
  return value === null || value === undefined || String(value).trim() === ''
}

function validateProductStep(step) {
  const toast = useToast()
  const fail = (message) => {
    toast.error({ title: 'Validasi', message, color: 'red' })
    return false
  }

  if (step.id === 'product-info') {
    if (isEmptyProductField(form.value.sku)) return fail('Part Number wajib diisi.')
    if (isEmptyProductField(form.value.name)) return fail('Nama Barang wajib diisi.')
    if (isEmptyProductField(form.value.unitId)) return fail('Satuan wajib dipilih.')
    if (isEmptyProductField(form.value.categoryId)) return fail('Kategori wajib dipilih.')
    if (
      isProductExpiredAtRequired({
        isRetailCompany: isRetailCompany.value,
        isBundling: !!form.value.isBundling,
      }) &&
      isEmptyProductField(form.value.expiredAt)
    ) {
      return fail('Tanggal kedaluwarsa wajib diisi untuk produk Retail atau Bundling.')
    }
    return true
  }

  if (step.id === 'product-bundling' && form.value.isBundling) {
    const components = form.value.productBundlingComponents || []
    if (components.some((item) => isEmptyProductField(item?.name))) {
      return fail('Nama komponen bundling wajib diisi.')
    }
  }

  return true
}

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
  isCurrent,
  reset,
  validateAll,
} = useTabbedFormNavigation({ steps: formSteps, formRoot, validateStep: validateProductStep })
const expandedRows = ref({})
const tableControls = ref({ rows: 10, search: '' })

const filters = ref({
    categoryId: null,
    isInternal: null,
    isDevice: null,
    isBundling: null,
    billingType: null,
    condition: null,
})

const modalTitle = computed(() => (isEditMode.value ? 'Edit Product' : 'Tambah Product'))
const modalDescription = computed(() =>
    isEditMode.value
        ? 'Silakan ubah data product di bawah ini.'
        : 'Silakan isi form di bawah ini untuk menambahkan product baru.'
)

const statCards = computed(() => [
  {
    key: 'total-product',
    label: 'Total Product',
    value: statistics.value.total ?? 0,
    subtitle: 'Product terdaftar',
    icon: 'ri-box-3-line',
    iconBgClass: 'bg-label-primary',
    info: {
      title: 'Jumlah Keseluruhan',
      description: 'Jumlah keseluruhan data Product yang terdaftar berdasarkan statistik API.',
    },
  },
  {
    key: 'internal',
    label: 'Internal',
    value: statistics.value.internal ?? 0,
    subtitle: 'Khusus penggunaan internal',
    icon: 'ri-building-line',
    iconBgClass: 'bg-label-info',
    info: {
      title: 'Internal',
      description: 'Jumlah product dengan scope penggunaan internal.',
    },
  },
  {
    key: 'eksternal',
    label: 'Eksternal',
    value: statistics.value.external ?? 0,
    subtitle: 'Khusus client / eksternal',
    icon: 'ri-user-star-line',
    iconBgClass: 'bg-label-warning',
    info: {
      title: 'Eksternal',
      description: 'Jumlah product dengan scope penggunaan eksternal/client.',
    },
  },
  {
    key: 'keduanya',
    label: 'Keduanya',
    value: statistics.value.both ?? 0,
    subtitle: 'Internal & eksternal',
    icon: 'ri-exchange-line',
    iconBgClass: 'bg-label-secondary',
    info: {
      title: 'Keduanya',
      description: 'Jumlah product yang dapat dipakai internal dan eksternal.',
    },
  },
])

const hasActiveFilters = computed(() =>
    filters.value.categoryId != null
    || filters.value.isInternal != null
    || filters.value.isDevice != null
    || filters.value.isBundling != null
    || filters.value.billingType != null
    || filters.value.condition != null
)

const billingTypeOptions = [
    { label: 'One Time', value: 'one_time' },
    { label: 'Recurring', value: 'recurring' },
]

const conditionOptions = [
    { label: 'Baru', value: 'baru' },
    { label: 'Bekas', value: 'bekas' },
    { label: 'Rusak', value: 'rusak' },
]

const scopeFilterOptions = [
    { label: 'Internal', value: 'true' },
    { label: 'Eksternal (Client)', value: 'false' },
    { label: 'Internal & Eksternal', value: 'null' },
]

const booleanFilterOptions = [
    { label: 'Ya', value: 'true' },
    { label: 'Tidak', value: 'false' },
]

const conditionLabels = {
    baru: 'Baru',
    bekas: 'Bekas',
    rusak: 'Rusak',
    good: 'Baru',
    bad: 'Bekas',
    reject: 'Bekas',
    damaged: 'Rusak',
}

function conditionLabel(value) {
    if (!value) return '-'
    return conditionLabels[value] ?? '-'
}

const productBundlingTypeOptions = [
    { label: 'Router', value: 'router' },
    { label: 'Adaptor', value: 'adaptor' },
    { label: 'Cable', value: 'cable' },
]

const trackingPolicyOptions = [
    { label: 'NONE — tidak perlu identifier', value: 'NONE' },
    { label: 'UNIT_SERIAL — serial per quantity', value: 'UNIT_SERIAL' },
    { label: 'KIT_SERIAL — kit number / identifier resmi', value: 'KIT_SERIAL' },
    { label: 'DEFERRED_COMPONENT_SERIAL — kit/UTID dulu, serial komponen saat unbox', value: 'DEFERRED_COMPONENT_SERIAL' },
]

const isInternalOptions = [
    { label: 'Internal & Eksternal', value: '' },
    { label: 'Internal', value: 'true' },
    { label: 'Eksternal (Client)', value: 'false' },
]

const isInternalSelect = computed({
    get() {
        if (form.value.isInternal === true) return 'true'
        if (form.value.isInternal === false) return 'false'
        return ''
    },
    set(value) {
        if (value === 'true') {
            form.value.isInternal = true
        } else if (value === 'false') {
            form.value.isInternal = false
        } else {
            form.value.isInternal = null
        }
    },
})

function resetFilters() {
    filters.value = {
        categoryId: null,
        isInternal: null,
        isDevice: null,
        isBundling: null,
        billingType: null,
        condition: null,
    }
}

function reload() {
    params.value.first = 0
    productStore.fetchProducts()
}

const companyScoped = useCompanyScopedReload(async (_companyId, generation) => {
    productStore.closeModal()
    resetFilters()
    globalFilterValue.value = ''
    params.value.first = 0
    params.value.search = ''
    await Promise.all([
        productStore.fetchStatistics(),
        productStore.fetchProducts(),
    ])
    if (!companyScoped.isCurrent(generation)) return
    setListTitle('Product', statistics.value.total)
})

onMounted(async () => {
    tableControls.value.rows = Number(params.value.rows) || 10
    tableControls.value.search = globalFilterValue.value

    kategoriStore.fetchKategori()
    unitStore.fetchUnit()
    permissionStore.fetchPermissions()
    userStore.loadUser()

    companyScoped.start()
})

onUnmounted(() => {
    companyScoped.stop()
})

async function onFormSubmit() {
    if (!isLastStep.value) {
        await next()
        return
    }
    if (!(await validateAll())) return
    await productStore.saveProduct()
}

watch(showModal, (newValue) => {
    if (newValue) {
        reset()
    }
})

watch(
    filters,
    () => {
        params.value.categoryId = filters.value.categoryId
        params.value.isInternal = filters.value.isInternal
        params.value.isDevice = filters.value.isDevice
        params.value.isBundling = filters.value.isBundling
        params.value.isKit = filters.value.isBundling
        params.value.billingType = isRetailCompany.value ? null : filters.value.billingType
        params.value.condition = filters.value.condition
        reload()
    },
    { deep: true }
)

watch(isRetailCompany, (retail) => {
    if (!retail) return
    if (filters.value.billingType != null) {
        filters.value.billingType = null
    }
    params.value.billingType = null
})

const onBundlingToggle = () => {
    if (form.value.isBundling) {
        if (!Array.isArray(form.value.productBundlingComponents) || form.value.productBundlingComponents.length === 0) {
            productStore.addProductBundlingComponent()
        }
        goToId('product-bundling', { skipValidation: true })
    } else {
        form.value.productBundlingComponents = []
        goToId('product-info', { skipValidation: true })
    }
}

const onDeviceToggle = () => {
    if (form.value.isDevice && (!form.value.trackingPolicy || form.value.trackingPolicy === 'NONE')) {
        form.value.trackingPolicy = 'UNIT_SERIAL'
    }
    if (!form.value.isDevice && form.value.trackingPolicy === 'UNIT_SERIAL') {
        form.value.trackingPolicy = 'NONE'
    }
}

watch(
    () => form.value.trackingPolicy,
    (policy) => {
        if (policy && policy !== 'NONE') {
            form.value.isDevice = true
        }
    }
)

const onProductToolbarRows = (value) => {
    tableControls.value.rows = Number(value) || 10
    handleRowsChange(value)
}

const handleRowsChange = (value) => {
    params.value.rows = Number(value) || 10
    params.value.first = 0
    productStore.fetchProducts()
}

watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10
})

watch(() => params.value.search, (newValue) => {
    if (newValue !== globalFilterValue.value) {
        globalFilterValue.value = newValue
        tableControls.value.search = newValue
    }
})

const debouncedSearch = useDebounceFn(() => {
    productStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => productStore.setPagination(event)
const onSort = (event) => productStore.setSort(event)
const onRowToggle = (event) => {
    expandedRows.value = event.data
}

const exportData = async (format) => {
    const toast = useToast()
    try {
        if (format === 'csv') {
            myDataTableRef.value.exportCSV({
                title: 'Data Produk',
                border: true,
            })
        } else if (format === 'excel') {
            const exportResult = await productStore.fetchProductsForExport()
            myDataTableRef.value.exportExcel({
                title: `Data Produk ${exportResult.nmPerusahaan}`,
                data: exportResult.data,
            })
        }
    } catch (error) {
        console.error('Export error:', error)
        toast.error({
            title: 'Error',
            message: 'Gagal melakukan export data',
            color: 'red',
            position: 'bottomRight',
        })
    }
}

function onImageChange(e) {
    const file = e.target.files[0]
    if (file) {
        productStore.handleImageChange(file)
    }
}

const getStatusBadge = (status) => {
    switch (status) {
        case true:
            return { text: 'Ya', class: 'badge rounded-pill bg-label-primary' }
        case false:
            return { text: 'Tidak', class: 'badge rounded-pill bg-label-danger' }
        default:
            return { text: '-', class: 'badge rounded-pill bg-label-light' }
    }
}

const getInternalScopeBadge = (value) => {
    if (value === true) {
        return { text: 'Internal', class: 'badge rounded-pill bg-label-primary' }
    }
    if (value === false) {
        return { text: 'Eksternal', class: 'badge rounded-pill bg-label-info' }
    }
    return { text: 'Keduanya', class: 'badge rounded-pill bg-label-secondary' }
}

const hasFieldError = (fieldName) => {
    if (!validationErrors.value || !Array.isArray(validationErrors.value)) return false
    return validationErrors.value.some((error) => {
        if (typeof error === 'string') return false
        return error.field === fieldName || error.rule === fieldName
    })
}

const getFieldError = (fieldName) => {
    if (!validationErrors.value || !Array.isArray(validationErrors.value)) return ''
    const error = validationErrors.value.find((error) => {
        if (typeof error === 'string') return false
        return error.field === fieldName || error.rule === fieldName
    })
    return error ? error.message : ''
}

definePageMeta({
    layout: 'default',
    middleware: ['auth', 'check-permission'],
    title: 'Product',
    description: 'Product Management',
    keywords: 'Product, Inventory, Sinergi Innovate Pratama',
    author: 'Sinergi Innovate Pratama',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0',
    alias: ['/inventory/barang'],
})
</script>

<style scoped>
.form-label {
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
}

.form-control {
    border-radius: 0.375rem;
    border: 1px solid #d1d5db;
    padding: 0.75rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
    border-color: #008fec;
    box-shadow: 0 0 0 0.2rem rgba(0, 143, 236, 0.25);
    outline: 0;
}

.image-preview {
    transition: all 0.3s ease;
}

.image-preview:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
    .card-body {
        padding: 16px;
    }

    .form-label {
        font-size: 13px;
        margin-bottom: 6px;
    }
}

@media (max-width: 576px) {
    .card-body {
        padding: 12px;
    }
}
</style>
