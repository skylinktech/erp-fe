<!-- Updated export functionality -->
<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">List Quotation</h4>
            <p class="mb-6">
            List quotation yang terdaftar di sistem
            </p>
            <!-- quotation cards -->
            <div class="row g-6 mb-6">
                <!-- Static cards for display, can be made dynamic later -->
                <div class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h5 class="mb-1">Total Quotations</h5>
                                <span class="badge bg-label-primary rounded-pill">Total</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <h1 class="mb-0 display-4">{{ statistics?.totalQuotations || 0 }}</h1>
                                <i class="ri-file-text-line ri-24px text-primary ms-2"></i>
                            </div>
                            <p class="mb-0 mt-2">Total semua quotation dalam sistem</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h5 class="mb-1">Quotations Approved</h5>
                                <span class="badge bg-label-success rounded-pill">Approved</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <h1 class="mb-0 display-4">{{ statistics?.approvedQuotations || 0 }}</h1>
                                <i class="ri-check-line ri-24px text-success ms-2"></i>
                            </div>
                            <p class="mb-0 mt-2">Total quotation yang sudah disetujui</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card h-100">
                        <div class="row h-100">
                            <div class="col-sm-5">
                                <div class="d-flex align-items-end h-100 justify-content-center">
                                    <img src="/img/illustrations/add-new-role-illustration.png" class="img-fluid" alt="Image" width="70">
                                </div>
                            </div>
                            <div class="col-sm-7">
                                <div class="card-body text-sm-end text-center ps-sm-0">
                                    <button v-if="userHasRole('superadmin') || userHasPermission('create_purchase_order')" @click="quotationStore.openModal()" class="btn btn-primary mb-2 text-wrap add-new-role">
                                        Tambah Quotation
                                    </button>
                                    <p class="mb-0 mt-1">Buat Quotation baru</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Total Quotation</h4>
                    <p class="mb-0">Find all of your company's administrator accounts and their associate Quotation.</p>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6 mb-2">
                                    <CustomSelect2 v-model="filters.customerId" :options="customers || []" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Customer" />
                                </div>
                                <div class="col-md-6 mb-2">
                                    <CustomSelect2 v-model="filters.status" :options="statusOptions" :get-option-label="option => option.label" :reduce="option => option.value" searchable clearable placeholder="Pilih Status" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <!-- quotation Table -->
                    <div class="card">
                        <div class="card-header">
                            <TableControls
                                v-model="tableControls"
                                :rows-per-page-options="rowsPerPageOptionsArray"
                                search-placeholder="Cari Quotation..."
                                @rows-change="handleRowsChange"
                                @search="handleSearch"
                                @export="exportData"
                            />
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="quotations" 
                                :rows="Number(params.rows)" 
                                :loading="loading"
                                :totalRecords="totalRecords"
                                :first="params.first"
                                :lazy="true"
                                @page="onPage($event)"
                                @sort="onSort($event)"
                                responsiveLayout="scroll" 
                                paginatorPosition="bottom"
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
                                    <Column field="noQuotation" header="No. Quotation" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <a 
                                                @click="navigateTo(`/sales/quotation-detail?id=${slotProps.data.id}`)" 
                                                style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                                class="text-primary"
                                                title="View detail"
                                            >
                                                {{ slotProps.data.noQuotation }}
                                            </a>
                                        </template>
                                  </Column>
                                    <Column field="customer.name" header="Nama Customer" :sortable="true"></Column>
                                    <Column field="status" header="Status" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadge(slotProps.data.status).class">
                                                {{ getStatusBadge(slotProps.data.status).text }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="createdByUser.fullName" header="Dibuat Oleh" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.createdByUser?.fullName || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="approvedByUser.fullName" header="Approved By" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.approvedByUser?.fullName || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="up" header="Untuk Perhatian" :sortable="true"></Column>
                                    <Column field="created_at" header="Tanggal Quotation" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.date ? new Date(slotProps.data.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="validUntil" header="Berlaku Sampai" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.validUntil ? new Date(slotProps.data.validUntil).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="perusahaan.nmPerusahaan" header="Perusahaan" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.perusahaan?.nmPerusahaan || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="cabang.nmCabang" header="Cabang" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.cabang?.nmCabang || '-' }}
                                        </template>
                                    </Column>
                                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                                        <template #body="slotProps">
                                            <div class="d-inline-block">
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu">
                                                    <li v-if="userHasPermission('approve_purchase_order') && slotProps.data.status == 'draft'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="quotationStore.approveQuotation(slotProps.data.id)">
                                                            <i class="ri-check-line me-2"></i> Approve
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('reject_purchase_order') && slotProps.data.status == 'draft')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="quotationStore.rejectQuotation(slotProps.data.id)">
                                                            <i class="ri-close-line me-2"></i> Reject
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('view_purchase_order') && (slotProps.data.status == 'approved' || slotProps.data.status == 'partial' || slotProps.data.status == 'partial'))">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="viewQuotationDetails(slotProps.data.id)">
                                                            <i class="ri-eye-line me-2"></i> Lihat Detail
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('edit_purchase_order') && slotProps.data.status == 'draft')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="quotationStore.fetchQuotationForEdit(slotProps.data.id)">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('delete_purchase_order') && (slotProps.data.status == 'draft'))">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="quotationStore.deleteQuotation(slotProps.data.id)">
                                                            <i class="ri-delete-bin-7-line me-2"></i> Hapus
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </template>
                                    </Column>
                                    
                                    <!-- Expanded Row Template -->
                                    <template #expansion="slotProps">
                                        <QuotationExpandedRow :quotation="slotProps.data" />
                                    </template>
                            </MyDataTable>
                        </div>
                    </div>
                    <!--/ quotation Table -->
                </div>
            </div>
            <!--/ quotation cards -->

            <Modal 
                id="QuotationModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="quotationStore.saveQuotation()">
                         <div class="row">
                            <div class="col">
                                <ul class="nav nav-tabs" role="tablist">
                                    <li class="nav-item">
                                        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#form-tabs-info" role="tab" aria-selected="true" type="button">
                                            <span class="ri-user-line ri-20px d-sm-none"></span>
                                            <span class="d-none d-sm-block">Informasi Quotation</span>
                                        </button>
                                    </li>
                                    <li class="nav-item">
                                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-items" role="tab" aria-selected="false" type="button">
                                            <span class="ri-folder-user-line ri-20px d-sm-none"></span>
                                            <span class="d-none d-sm-block">List Product</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="tab-content pt-4">
                            <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                                <div class="row g-4">
                                    <div class="col-md-12">
                                        <div class="form-floating form-floating-outline">
                                            <input type="hidden" v-model="form.noQuotation" class="form-control" placeholder="No PO" >
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 v-model="form.customerId" :options="customers || []" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Customer" />
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" v-model="form.up" class="form-control" placeholder="Untuk Perhatian" >
                                            <label>Untuk Perhatian</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="form.date" class="form-control" >
                                            <label>Tanggal Quotation</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="form.shipDate" class="form-control">
                                            <label>Tanggal Pengiriman</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="form.validUntil" class="form-control" >
                                            <label>Berlaku Sampai</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans || []" 
                                            :get-option-label="option => option.nmPerusahaan" 
                                            :reduce="option => option.id" searchable clearable 
                                            placeholder="Pilih Perusahaan" 
                                            
                                        />
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs" 
                                            :get-option-label="option => option.nmCabang" 
                                            :reduce="option => option.id" searchable clearable 
                                            placeholder="Pilih Cabang" 
                                            
                                        />
                                    </div>

                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="number" v-model="form.discountPercent" class="form-control" placeholder="Discount (%)">
                                            <label>Discount (%)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="number" v-model="form.taxPercent" class="form-control" placeholder="Tax (%)">
                                            <label>Tax (%)</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" v-model="form.fobPoint" class="form-control" placeholder="FOB Point">
                                            <label>FOB Point</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" v-model="form.termsOfPayment" class="form-control" placeholder="Terms of Payment">
                                            <label>Terms of Payment</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" v-model="form.prNumber" class="form-control" placeholder="PR Number">
                                            <label>PR Number</label>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="form-floating form-floating-outline">
                                            <textarea v-model="form.description" class="form-control" placeholder="Deskripsi"></textarea>
                                            <label>Deskripsi</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="form-tabs-items" role="tabpanel">
                                <div class="alert alert-secondary mb-6">
                                    <ul class="align-items-center py-0 px-2 mt-3">
                                        <li><strong>Pilih customer terlebih dahulu</strong> di tab "Informasi Quotation"</li>
                                    </ul>
                                </div>
                                <div v-for="(item, index) in form.quotationItems" :key="index" class="repeater-item mb-4">
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <CustomSelect2 v-model="item.productId" :options="filteredCustomerProducts" 
                                                :get-option-label="option => option.label" searchable clearable
                                                :reduce="p => p.id" 
                                                placeholder="Cari berdasarkan part number atau nama produk..." 
                                                @update:modelValue="onProductChange(index)" 
                                                
                                                :disabled="!form.customerId"

                                                :filter-by="(option, label, search) => {
                                                    const product = option;
                                                    const searchLower = search.toLowerCase();
                                                    return product.name.toLowerCase().includes(searchLower) || 
                                                           product.sku.toLowerCase().includes(searchLower) ||
                                                           (product.noInterchange ? String(product.noInterchange).toLowerCase().includes(searchLower) : false);
                                                }"
                                                :close-on-select="true"
                                                :loading="loading"
                                                
                                                :multiple="false"
                                                :taggable="false"

                                            >
                                                <template #option="option">
                                                    <div class="d-flex justify-content-between align-items-center w-100">
                                                        <div>
                                                            <div class="fw-bold">{{ option.displayName }}</div>
                                                            <small class="text-muted">{{ option.unit?.name || 'No Unit' }} - {{ formatRupiah(option.priceSell) }}</small>
                                                        </div>
                                                    </div>
                                                </template>
                                                <template #no-options>
                                                    <div class="text-center p-3">
                                                        <i class="ri-search-line me-2"></i>
                                                        Tidak ada produk yang cocok dengan pencarian
                                                    </div>
                                                </template>
                                                <template #no-results>
                                                    <div class="text-center p-3">
                                                        <i class="ri-search-line me-2"></i>
                                                        Tidak ada produk yang cocok dengan pencarian
                                                    </div>
                                                </template>
                                             </CustomSelect2>
                                             <small class="text-muted">
                                                    <span v-if="loading">
                                                        <i class="ri-loader-4-line me-1"></i>
                                                        Memuat produk...
                                                    </span>
                                                    <span v-else>
                                                            <span v-if="form.customerId && customerProducts.length === 0" class="text-warning">
                                                                <i class="ri-error-warning-line me-1"></i>
                                                                Customer ini tidak memiliki produk
                                                            </span>
                                                            <span v-else-if="customerProducts.length > 0">
                                                            {{ customerProducts.length }} produk tersedia
                                                            </span>
                                                            <span v-else>
                                                                Pilih customer terlebih dahulu
                                                            </span>
                                                    </span>
                                             </small>
                                         </div>
                                         <div class="col-md-2">
                                             <div class="form-floating form-floating-outline">
                                                 <input type="number" v-model.number="item.quantity" @input="onQuantityChange(index)" class="form-control" placeholder="Qty">
                                                 <label>Jumlah</label>
                                             </div>
                                         </div>
                                         <div class="col-md-3">
                                             <div class="form-floating form-floating-outline">
                                                 <input type="text" :value="formatRupiah(item.price)" class="form-control" placeholder="Harga" readonly>
                                                 <label>Harga</label>
                                             </div>
                                         </div>
                                         <div class="col-md-3">
                                             <div class="form-floating form-floating-outline">
                                                 <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" placeholder="Subtotal" readonly>
                                                 <label>Subtotal</label>
                                             </div>
                                         </div>
                                         <div class="col-md-9">
                                              <div class="form-floating form-floating-outline">
                                                 <input type="text" v-model="item.description" class="form-control" placeholder="Deskripsi item">
                                                 <label>Deskripsi</label>
                                             </div>
                                         </div>
                                         <div class="col-md-3 d-flex align-items-center">
                                             <button @click.prevent="quotationStore.removeItem(index)" class="btn btn-outline-danger w-100">Hapus</button>
                                         </div>
                                     </div>
                                     <hr class="my-4">
                                 </div>
                                 <div class="mt-4">
                                     <button 
                                         @click.prevent="quotationStore.addItem()" 
                                         class="btn btn-primary"
                                         :disabled="!form.customerId"
                                     >
                                         Tambah Item
                                     </button>
                                 </div>
                                 <div class="d-flex justify-content-end mt-4">
                                     <span class="fw-bold fs-5">Grand Total: {{ formatRupiah(grandTotal) }}</span>
                                 </div>
                             </div>
                         </div>
                         <div class="modal-footer mt-6">
                              <button type="button" class="btn btn-outline-secondary" @click="quotationStore.closeModal()">Tutup</button>
                             <button type="submit" class="btn btn-primary" :disabled="loading">
                                 <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                 Simpan
                             </button>
                         </div>
                     </form>
                 </template>
             </Modal>
         </div>
          <div class="content-backdrop fade"></div>
      </div>
  </template>

  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useQuotationStore } from '~/stores/quotation'
  import { useCustomerStore } from '~/stores/customer'
  import { usePerusahaanStore } from '~/stores/perusahaan'
  import { useCabangStore } from '~/stores/cabang'
  import { useProductStore } from '~/stores/product'
  import { useUserStore } from '~/stores/user'
  import { usePermissionsStore } from '~/stores/permissions'
  import { usePermissions } from '~/composables/usePermissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import TableControls from '~/components/table/TableControls.vue'
import QuotationExpandedRow from '~/components/table/QuotationExpandedRow.vue'
import vSelect from 'vue-select'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
  import 'vue-select/dist/vue-select.css'
  import { useDebounceFn } from '@vueuse/core'
  import { useRouter } from 'vue-router'
  import { useDynamicTitle } from '~/composables/useDynamicTitle'

  // Composables
  const { setListTitle, setFormTitle } = useDynamicTitle()

  const config = useRuntimeConfig();
  const router = useRouter();

  // Store
  const myDataTableRef                     = ref(null)
  const quotationStore                     = useQuotationStore()
  const customerStore                        = useCustomerStore()
  const perusahaanStore                    = usePerusahaanStore()
  const cabangStore                        = useCabangStore()
  const productStore                       = useProductStore()
  const userStore                          = useUserStore()

  const formatRupiah                       = useFormatRupiah()
  const { userHasPermission, userHasRole } = usePermissions();
  const permissionStore                    = usePermissionsStore()

  const { quotations, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, customerProducts, statistics } = storeToRefs(quotationStore)
  const { customers }     = storeToRefs(customerStore)
  const { perusahaans } = storeToRefs(perusahaanStore)
  const { cabangs }     = storeToRefs(cabangStore)
  const { products }    = storeToRefs(productStore)
  const { user }        = storeToRefs(userStore)
  const { permissions } = storeToRefs(permissionStore)

// State
const globalFilterValue = ref('');
const attachmentPreview = ref(null);
const expandedRows = ref({});
const tableControls = ref({
    rows: 10,
    search: '',
});
const filters = ref({
    search: '',
    customerId: null,
    status: null,
});

  const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);
  const modalTitle = computed(() => {
      const title = isEditMode.value ? 'Edit Quotation' : 'Tambah Quotation';
      return title;
  });
  const modalDescription = computed(() => {
      const description = isEditMode.value ? 'Silakan ubah data quotation di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan quotation baru.';
      return description;
  });

  const grandTotal = computed(() => {
    if (!form.value || !form.value.quotationItems) return 0;

    const totalItems = (form.value.quotationItems || []).reduce((total, item) => {
      return total + (Number(item.subtotal) || 0);
    }, 0);

    const discountPercent = Number(form.value.discountPercent) || 0;
    const taxPercent = Number(form.value.taxPercent) || 0;

    const discountAmount = totalItems * (discountPercent / 100);
    const totalAfterDiscount = totalItems - discountAmount;
    const taxAmount = totalAfterDiscount * (taxPercent / 100);

    const finalTotal = totalAfterDiscount + taxAmount;
    
    return finalTotal;
  });

  const statusOptions = ref([
      { label: 'Draft', value: 'draft' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' },
  ]);

  let modalInstance = null;
  onMounted(() => {
      
      quotationStore.fetchQuotations();
      quotationStore.fetchStatistics();
      customerStore.fetchCustomers();
      perusahaanStore.fetchPerusahaans();
      cabangStore.fetchCabangs();
      productStore.fetchProducts();
      userStore.loadUser();
      permissionStore.fetchPermissions();
      
      const modalElement = document.getElementById('QuotationModal')
      if (modalElement) {
          modalInstance = new bootstrap.Modal(modalElement)
      }
      setListTitle('Quotation', quotations.value.length)
      
      // Initialize table controls
      tableControls.value.rows = Number(params.value.rows) || 10;
      tableControls.value.search = globalFilterValue.value;
  });

  watch(showModal, (newValue) => {
      if (newValue) {
          modalInstance?.show()
      } else {
          modalInstance?.hide()
      }
  })

  watch(products, (newProducts) => {
      if (newProducts && newProducts.length > 0) {
      }
  })

  watch(filters, (newFilters) => {
      if (!newFilters) return;
      const { page, rows, ...restFilters } = newFilters;
      quotationStore.setFilters(restFilters);
  }, { deep: true });

  watch(() => form.value?.quotationItems, (newItems) => {
      if (newItems && newItems.length > 0) {
      }
  }, { deep: true })

  watch(() => form.value?.perusahaanId, (newPerusahaanId) => {
      if (newPerusahaanId && form.value) {
          if(!isEditMode.value) {
              form.value.cabangId = null;
          }
      }
  });

  // ✅ NEW: Watcher untuk customerId - fetch products untuk customer yang dipilih
  watch(() => form.value?.customerId, (newCustomerId, oldCustomerId) => {
      if (newCustomerId) {
          quotationStore.fetchProductsForCustomer(newCustomerId);
          
          // ✅ NEW: Jika customer berubah dan ada item yang sudah dipilih, reset item yang tidak valid
          if (oldCustomerId && form.value && form.value.quotationItems) {
              setTimeout(() => {
                  form.value.quotationItems.forEach((item, index) => {
                      if (item.productId) {
                          const isValidProduct = quotationStore.customerProducts.some(p => p.id === item.productId);
                          if (!isValidProduct) {
                              // Reset item yang tidak valid
                              item.productId = null;
                              item.price = 0;
                              item.subtotal = 0;
                              calculateSubtotal(index);
                          } else {
                          }
                      }
                  });
              }, 500); // Tunggu sebentar agar customerProducts sudah ter-load
          }
      } else {
          // Reset customer products jika customer dihapus
          quotationStore.customerProducts = [];
          
          // Reset semua item jika customer dihapus
          if (form.value && form.value.quotationItems) {
              form.value.quotationItems.forEach((item, index) => {
                  item.productId = null;
                  item.price = 0;
                  item.subtotal = 0;
                  calculateSubtotal(index);
              });
          }
      }
  });

  // ✅ IMPROVED: Watcher untuk customerProducts
  watch(() => customerProducts, (newProducts) => {
      if (newProducts && newProducts.length > 0) {
          
          // ✅ NEW: Update harga untuk item yang sudah ada jika dalam edit mode
          if (form.value && form.value.quotationItems && isEditMode.value && newProducts.length > 0) {
              form.value.quotationItems.forEach((item, index) => {
                  if (item.productId) {
                      const selectedProduct = newProducts.find(p => p.id === item.productId);
                      if (selectedProduct) {
                          const oldPrice = item.price;
                          item.price = Number(selectedProduct.priceSell) || 0;
                          calculateSubtotal(index);
                      } else {
                          // Jika produk tidak ditemukan di customerProducts, reset item
                          item.productId = null;
                          item.price = 0;
                          item.subtotal = 0;
                          calculateSubtotal(index);
                      }
                  }
              });
          }
          
          // ✅ NEW: Tampilkan toast jika tidak ada produk (hanya untuk create mode)
          if (form.value?.customerId && newProducts.length === 0 && !isEditMode.value) {
              const toast = useToast();
              toast.warning({
                  title: 'Peringatan',
                  message: 'Customer yang dipilih tidak memiliki produk. Silakan tambahkan produk untuk customer ini.',
                  color: 'orange',
                  position: 'topRight',
                  layout: 2,
              });
          }
          
          // ✅ NEW: Tampilkan toast jika berhasil memuat produk (hanya untuk create mode)
          if (form.value?.customerId && newProducts.length > 0 && !isEditMode.value) {
              const toast = useToast();
              toast.success({
                  title: 'Berhasil',
                  message: `Berhasil memuat ${newProducts.length} produk untuk customer yang dipilih.`,
                  color: 'green',
                  position: 'topRight',
                  layout: 2,
              });
          }
      }
  });

  const filteredCabangs = computed(() => {
      if (!form.value?.perusahaanId || !cabangs.value) return [];
      const filtered = (cabangs.value || []).filter(c => c.perusahaanId === form.value.perusahaanId);
      return filtered;
  });

  const debouncedSearch = useDebounceFn(() => {
      if (globalFilterValue.value !== undefined) {
          quotationStore.setSearch(globalFilterValue.value)
      }
  }, 500)

  watch(globalFilterValue, (newValue) => {
      if (newValue !== undefined) {
          debouncedSearch();
      }
  });

  // Watch untuk sinkronisasi table controls
  watch(() => params.value.rows, (newValue) => {
      tableControls.value.rows = Number(newValue) || 10;
  });

  watch(() => globalFilterValue.value, (newValue) => {
      tableControls.value.search = newValue;
  });

  const onPage = (event) => {
      if (event) {
          quotationStore.setPagination(event);
      }
  };
  const handleRowsChange = (value) => {
      const rowsValue = Number(value) || 10;
      params.value.rows = rowsValue;
      params.value.first = 0;
      quotationStore.fetchQuotations();
  };

  const handleSearch = (value) => {
      globalFilterValue.value = value;
      params.value.first = 0;
      quotationStore.fetchQuotations();
  };
  const onSort = (event) => {
      if (event) {
          quotationStore.setSort(event);
      }
  };

  // Export data function
  const exportData = (format) => {
      if (format === 'excel') {
          const toast = useToast();
          
          // Cek apakah ada filter yang diterapkan
          const hasFilters = filters.value.customerId || filters.value.status || filters.value.search;
          
          toast.info({
              title: 'Info',
              message: hasFilters 
                  ? 'Sedang mempersiapkan data sesuai filter untuk export Excel...' 
                  : 'Sedang mempersiapkan semua data untuk export Excel...',
              color: 'blue'
          });
          
          // Ambil semua data yang sesuai dengan filter untuk export Excel
          quotationStore.fetchAllQuotationsForExport()
              .then((allData) => {
                  if (allData && allData.length > 0) {
                      // Gunakan fungsi export Excel khusus untuk Quotation
                      return exportQuotationExcel(allData)
                          .then(() => {
                              toast.success({
                                  title: 'Success',
                                  message: `Excel berhasil dibuat dengan ${allData.length} data Quotation${hasFilters ? ' sesuai filter' : ''}`,
                                  color: 'green',
                                  position: 'topRight',
                                  layout: 2
                              });
                          });
                  } else {
                      toast.warning({
                          title: 'Warning',
                          message: 'Tidak ada data untuk diexport',
                          color: 'orange',
                          position: 'topRight',
                          layout: 2
                      });
                  }
              })
              .catch((error) => {
                  console.error('Error exporting Excel:', error);
                  toast.error({
                      title: 'Error',
                      message: 'Gagal membuat Excel',
                      color: 'red',
                      position: 'topRight',
                      layout: 2
                  });
              });
      } else if (format === 'pdf') {
          const toast = useToast();
          // Cek apakah ada filter yang diterapkan
          const hasFilters = filters.value.customerId || filters.value.status || filters.value.search;
          
          toast.info({
              title: 'Info',
              message: hasFilters 
                  ? 'Sedang mempersiapkan data sesuai filter untuk export PDF...' 
                  : 'Sedang mempersiapkan semua data untuk export PDF...',
              color: 'blue'
          });
          
          // Ambil semua data yang sesuai dengan filter untuk export PDF
          quotationStore.fetchAllQuotationsForExport()
              .then((allData) => {
                  if (allData && allData.length > 0) {
                      // Gunakan fungsi export PDF khusus untuk Quotation
                      return exportQuotationPDF(allData)
                          .then(() => {
                              toast.success({
                                  title: 'Success',
                                  message: `PDF berhasil dibuat dengan ${allData.length} data Quotation${hasFilters ? ' sesuai filter' : ''}`,
                                  color: 'green',
                                  position: 'topRight',
                                  layout: 2
                              });
                          });
                  } else {
                      toast.warning({
                          title: 'Warning',
                          message: 'Tidak ada data untuk diexport',
                          color: 'orange',
                          position: 'topRight',
                          layout: 2
                      });
                  }
              })
              .catch((error) => {
                  console.error('Error exporting PDF:', error);
                  toast.error({
                      title: 'Error',
                      message: 'Gagal membuat PDF',
                      color: 'red',
                      position: 'topRight',
                      layout: 2
                  });
              });
      }
  };

  function onFileChange(e) {
    if (!form.value) return;
    
    const file = e.target.files[0];
    if (file) {
      form.value.attachment = file;
      attachmentPreview.value = URL.createObjectURL(file);
    } else {
      form.value.attachment = null;
      attachmentPreview.value = null;
    }
  }

  const onProductChange = (index) => {
    if (!form.value || !form.value.quotationItems) return;
    
    const selectedProductId = form.value.quotationItems[index].productId;
    const selectedProduct = customerProducts.value.find(p => p.id === selectedProductId);

    if (selectedProduct) {
      const item = form.value.quotationItems[index];
      // ✅ NEW: Gunakan priceSell dari customerProducts untuk harga jual
      item.price = Number(selectedProduct.priceSell) || 0;
      calculateSubtotal(index);
    }
  };

  // ✅ IMPROVED: Computed property untuk filtered customer products tanpa limit
  const filteredCustomerProducts = computed(() => {
    if (!customerProducts.value || !Array.isArray(customerProducts.value)) {
      return [];
    }
    
    // Tambahkan displayName untuk pencarian yang lebih baik
    const productsWithDisplayName = customerProducts.value.map(product => ({
      ...product,
      displayName: `${product.sku || ''} | ${product.name || ''}${product.noInterchange ? ' | ' + product.noInterchange : ''}`
    }));
    
    return productsWithDisplayName;
  });

  const onQuantityChange = (index) => {
    if (!form.value || !form.value.quotationItems) return;
    
    const item = form.value.quotationItems[index];
    if (item) {
    }
    
    calculateSubtotal(index);
  };

  const calculateSubtotal = (index) => {
    if (!form.value || !form.value.quotationItems) return;
    
    const item = form.value.quotationItems[index];
    if (!item) return;
    
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const oldSubtotal = item.subtotal;
    
    item.subtotal = quantity * price;
    
  };

  const viewQuotationDetails = (quotationId) => {
      if (!quotationId) {
          return;
      }
      router.push({ path: `/sales/quotation-detail`, query: { id: quotationId } });
  };

  const getStatusBadge = (status) => {
      if (!status) {
          return { text: '-', class: 'badge rounded-pill bg-label-light' };
      }
      
      switch (status) {
          case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' };
          case 'approved': return { text: 'Approved', class: 'badge rounded-pill bg-label-primary' };
          case 'rejected': return { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' };
          default: 
              return { text: '-', class: 'badge rounded-pill bg-label-light' };
      }
  };

// Fungsi export PDF khusus untuk Quotation
const exportQuotationPDF = (dataToExport) => {
    return Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
    ]).then(([{ default: jsPDF }, { default: autoTable }]) => {

      // Definisikan kolom yang akan diexport
      const columnDefinitions = [
          { field: 'noQuotation', header: 'No. Quotation' },
          { field: 'customer.name', header: 'Nama Customer' },
          { field: 'status', header: 'Status' },
          { field: 'date', header: 'Tanggal' },
          { field: 'validUntil', header: 'Valid Until' },
          { field: 'perusahaan.nmPerusahaan', header: 'Perusahaan' },
          { field: 'cabang.nmCabang', header: 'Cabang' },
          { field: 'total', header: 'Total' }
      ];

      const head = [columnDefinitions.map(col => col.header)];

      if (!dataToExport || dataToExport.length === 0) {
          console.warn('Tidak ada data untuk diexport');
          const doc = new jsPDF('landscape');
          doc.setFontSize(16);
          doc.text('Laporan Quotations', 14, 15);
          doc.setFontSize(12);
          doc.text('Tidak ada data yang tersedia untuk export', 14, 50);
          doc.save('quotations-empty.pdf');
          return;
      }

      const body = dataToExport.map(row => columnDefinitions.map(col => {
          let value = '';
          
          if (col.field.includes('.')) {
              const fields = col.field.split('.');
              let currentValue = row;
              for (const field of fields) {
                  currentValue = currentValue?.[field];
              }
              value = currentValue || '-';
          } else {
              value = row[col.field] || '-';
          }

          // Format khusus untuk field tertentu
          if (col.field === 'date' || col.field === 'validUntil') {
              if (value && value !== '-') {
                  value = new Date(value).toLocaleDateString('id-ID');
              }
          } else if (col.field === 'total') {
              if (value && value !== '-') {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                      value = new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                      }).format(numValue);
                  }
              }
          } else if (col.field === 'status') {
              if (value === 'draft') value = 'Draft';
              else if (value === 'approved') value = 'Approved';
              else if (value === 'rejected') value = 'Rejected';
          }

          return String(value);
      }));

      // Definisikan lebar kolom
      const columnStyles = {
        0: { cellWidth: 34 }, // No. Quotation
        1: { cellWidth: 37 }, // Nama Customer
        2: { cellWidth: 34 }, // Status
        3: { cellWidth: 34 }, // Tanggal
        4: { cellWidth: 34 }, // Valid Until
        5: { cellWidth: 34 }, // Perusahaan
        6: { cellWidth: 34 }, // Cabang
        7: { cellWidth: 34 } // Total
      };

      // Ambil info perusahaan dari user atau data yang tersedia
      const userData = userStore.user;
      let companyInfo = {
          name: 'PT. ANDARA PRIMA UTAMA',
          address: 'Jl. Kelapa Dua No.21 RT.008 RW.003 Kec. Cilincing Kel. Cilincing - Jakarta Utara',
          email: 'andaraprimautama@gmail.com',
          phone: '+62 812-7522-9704',
          logo: null
      };

      // Coba ambil dari user data jika tersedia
      if (userData?.perusahaan) {
          companyInfo.name = userData.perusahaan.nmPerusahaan || companyInfo.name;
          companyInfo.address = userData.perusahaan.alamatPerusahaan || companyInfo.address;
          companyInfo.email = userData.perusahaan.emailPerusahaan || companyInfo.email;
          companyInfo.phone = userData.perusahaan.tlpPerusahaan || companyInfo.phone;
      }

      // Hitung grand total
      let grandTotal = 0;
      dataToExport.forEach(row => {
          const totalValue = parseFloat(row.total) || 0;
          grandTotal += totalValue;
      });

      // Format grand total
      const formattedGrandTotal = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
      }).format(grandTotal);

      // Buat PDF
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Gunakan font yang tersedia di jsPDF
      const fontFamily = 'helvetica';

      // Logo perusahaan (jika ada)
      if (companyInfo.logo) {
          try {
              doc.addImage(companyInfo.logo, 'PNG', pageWidth - 60, 10, 50, 20);
          } catch (e) {
              void e;
          }
      }

      // Info perusahaan di kanan atas
      doc.setFontSize(10);
      doc.setFont(fontFamily, 'bold');
      if (companyInfo.name) doc.text(String(companyInfo.name), pageWidth - 10, 15, { align: 'right' });

      doc.setFontSize(8);
      doc.setFont(fontFamily, 'normal');
      if (companyInfo.address) doc.text(String(companyInfo.address), pageWidth - 10, 22, { align: 'right' });
      if (companyInfo.email) doc.text(`Email: ${String(companyInfo.email)}`, pageWidth - 10, 28, { align: 'right' });
      if (companyInfo.phone) doc.text(`Telp: ${String(companyInfo.phone)}`, pageWidth - 10, 34, { align: 'right' });

      // Judul di kiri atas
      doc.setFontSize(16);
      doc.setFont(fontFamily, 'bold');
      doc.text('Laporan Quotations', 14, 15);

      // Timestamp dan jumlah data
      doc.setFontSize(10);
      doc.setFont(fontFamily, 'normal');
      doc.text(`Dibuat pada: ${new Date().toLocaleString('id-ID')}`, 14, 25);
      doc.text(`Total Data: ${dataToExport.length}`, 14, 32);

      // Info filter
      const filterInfo = [];
      if (filters.value.customerId) {
          const customer = customers.value?.find(c => c.id === filters.value.customerId);
          if (customer) {
              filterInfo.push(`Customer: ${customer.name}`);
          }
      }
      if (filters.value.status) {
          const statusLabel = filters.value.status.charAt(0).toUpperCase() + filters.value.status.slice(1);
          filterInfo.push(`Status: ${statusLabel}`);
      }
      if (filters.value.search) {
          filterInfo.push(`Pencarian: ${filters.value.search}`);
      }

      // Tampilkan filter info
      if (filterInfo.length > 0) {
          doc.setFontSize(8);
          doc.setFont(fontFamily, 'italic');
          filterInfo.forEach((info, index) => {
              doc.text(info, 14, 40 + (index * 6));
          });
      }

      // Buat tabel
      autoTable(doc, {
          head: head,
          body: body,
          startY: filterInfo.length > 0 ? 50 + (filterInfo.length * 6) : 45,
          styles: {
              font: fontFamily,
              fontSize: 7,
              cellPadding: 2,
              overflow: 'linebreak',
              halign: 'left',
          },
          headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255,
              fontStyle: 'bold',
              halign: 'center',
          },
          alternateRowStyles: {
              fillColor: [245, 245, 245],
          },
          margin: { top: 30, right: 10, bottom: 10, left: 10 },
          tableWidth: 'auto',
          columnStyles: columnStyles,
          didDrawPage: function (data) {
              // Tambahkan nomor halaman
              const pageCount = doc.internal.getNumberOfPages();
              doc.setFontSize(8);
              doc.setFont(fontFamily, 'normal');
              doc.text(`Halaman ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
          },
          didParseCell: function (data) {
              // Highlight kolom total
              if (data.column.index === columnDefinitions.findIndex(col => col.field === 'total')) {
                  if (data.section === 'head') {
                      data.cell.styles.textColor = [255, 255, 255];
                  } else {
                      data.cell.styles.fontStyle = 'bold';
                      data.cell.styles.fillColor = [200, 255, 200];
                  }
              }
          },
      });

      // Grand total setelah tabel
      const finalY = doc.lastAutoTable.finalY || 200;

      // Garis pemisah
      doc.setDrawColor(200, 200, 200);
      doc.line(10, finalY + 5, doc.internal.pageSize.width - 10, finalY + 5);

      // Grand total
      doc.setFontSize(12);
      doc.setFont(fontFamily, 'bold');
      doc.text('Grand Total:', 10, finalY + 20);
      doc.text(String(formattedGrandTotal), doc.internal.pageSize.width - 10, finalY + 20, { align: 'right' });

      // Info ringkasan
      doc.setFontSize(8);
      doc.setFont(fontFamily, 'normal');
      doc.text(`Total Quotations: ${dataToExport.length}`, 10, finalY + 30);

      // Pastikan pembagian tidak menghasilkan NaN atau Infinity
      let rataRata = 0;
      if (dataToExport.length > 0) {
          rataRata = grandTotal / dataToExport.length;
      }
      doc.text(
          `Rata-rata per Quotation: ${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
          }).format(rataRata)}`,
          10,
          finalY + 37
      );

      doc.save('quotations.pdf');
    });
};

// Fungsi export Excel khusus untuk Quotation
const exportQuotationExcel = (dataToExport) => {
    return Promise.all([
        import('xlsx')
    ]).then(([XLSX]) => {
        // Definisikan kolom yang akan diexport
        const columnDefinitions = [
            { field: 'noQuotation', header: 'No. Quotation' },
            { field: 'customer.name', header: 'Nama Customer' },
            { field: 'status', header: 'Status' },
            { field: 'date', header: 'Tanggal' },
            { field: 'validUntil', header: 'Valid Until' },
            { field: 'perusahaan.nmPerusahaan', header: 'Perusahaan' },
            { field: 'cabang.nmCabang', header: 'Cabang' },
            { field: 'total', header: 'Total' }
        ];

        if (!dataToExport || dataToExport.length === 0) {
            console.warn('Tidak ada data untuk diexport');
            return;
        }

        // Ambil info perusahaan dari user atau data yang tersedia
        const userData = userStore.user;
        let companyInfo = {
            name: 'PT. ANDARA PRIMA UTAMA',
            address: 'Jl. Kelapa Dua No.21 RT.008 RW.003 Kec. Cilincing Kel. Cilincing - Jakarta Utara',
            email: 'andaraprimautama@gmail.com',
            phone: '+62 812-7522-9704'
        };

        // Coba ambil dari user data jika tersedia
        if (userData?.perusahaan) {
            companyInfo.name = userData.perusahaan.nmPerusahaan || companyInfo.name;
            companyInfo.address = userData.perusahaan.alamatPerusahaan || companyInfo.address;
            companyInfo.email = userData.perusahaan.emailPerusahaan || companyInfo.email;
            companyInfo.phone = userData.perusahaan.tlpPerusahaan || companyInfo.phone;
        }

        // Hitung grand total
        let grandTotal = 0;
        dataToExport.forEach(row => {
            const totalValue = parseFloat(row.total) || 0;
            grandTotal += totalValue;
        });

        // Format grand total
        const formattedGrandTotal = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(grandTotal);

        // Buat data untuk Excel
        const excelData = [];

        // Header perusahaan
        excelData.push([companyInfo.name]);
        excelData.push([companyInfo.address]);
        excelData.push([`Email: ${companyInfo.email}`]);
        excelData.push([`Telp: ${companyInfo.phone}`]);
        excelData.push([]); // Baris kosong

        // Judul laporan
        excelData.push(['Laporan Quotations']);
        excelData.push([`Dibuat pada: ${new Date().toLocaleString('id-ID')}`]);
        excelData.push([`Total Data: ${dataToExport.length}`]);

        // Info filter
        const filterInfo = [];
        if (filters.value.customerId) {
            const customer = customers.value?.find(c => c.id === filters.value.customerId);
            if (customer) {
                filterInfo.push(`Customer: ${customer.name}`);
            }
        }
        if (filters.value.status) {
            const statusLabel = filters.value.status.charAt(0).toUpperCase() + filters.value.status.slice(1);
            filterInfo.push(`Status: ${statusLabel}`);
        }
        if (filters.value.search) {
            filterInfo.push(`Pencarian: ${filters.value.search}`);
        }

        // Tampilkan filter info
        if (filterInfo.length > 0) {
            filterInfo.forEach((info) => {
                excelData.push([info]);
            });
        }

        excelData.push([]); // Baris kosong

        // Header tabel
        excelData.push(columnDefinitions.map(col => col.header));

        // Data tabel
        dataToExport.forEach(row => {
            const rowData = columnDefinitions.map(col => {
                let value = '';
                
                if (col.field.includes('.')) {
                    const fields = col.field.split('.');
                    let currentValue = row;
                    for (const field of fields) {
                        currentValue = currentValue?.[field];
                    }
                    value = currentValue || '-';
                } else {
                    value = row[col.field] || '-';
                }

                // Format khusus untuk field tertentu
                if (col.field === 'date' || col.field === 'validUntil') {
                    if (value && value !== '-') {
                        value = new Date(value).toLocaleDateString('id-ID');
                    }
                } else if (col.field === 'total') {
                    if (value && value !== '-') {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                            value = new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(numValue);
                        }
                    }
                } else if (col.field === 'status') {
                    if (value === 'draft') value = 'Draft';
                    else if (value === 'approved') value = 'Approved';
                    else if (value === 'rejected') value = 'Rejected';
                }

                return String(value);
            });
            excelData.push(rowData);
        });

        // Baris kosong
        excelData.push([]);

        // Summary
        excelData.push(['Grand Total:', formattedGrandTotal]);
        excelData.push(['Total Quotations:', dataToExport.length]);

        // Pastikan pembagian tidak menghasilkan NaN atau Infinity
        let rataRata = 0;
        if (dataToExport.length > 0) {
            rataRata = grandTotal / dataToExport.length;
        }
        excelData.push([
            'Rata-rata per Quotation:', 
            new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(rataRata)
        ]);

        // Buat workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Set column widths
        const colWidths = [
            { wch: 20 }, // No. Quotation
            { wch: 25 }, // Nama Customer
            { wch: 15 }, // Status
            { wch: 15 }, // Tanggal
            { wch: 15 }, // Valid Until
            { wch: 25 }, // Perusahaan
            { wch: 20 }, // Cabang
            { wch: 20 }  // Total
        ];
        ws['!cols'] = colWidths;

        // Style untuk header perusahaan
        const headerRow = 0;
        if (ws[`A${headerRow + 1}`]) {
            ws[`A${headerRow + 1}`].s = { font: { bold: true, size: 14 } };
        }

        // Style untuk judul laporan
        const titleRow = 5;
        if (ws[`A${titleRow + 1}`]) {
            ws[`A${titleRow + 1}`].s = { font: { bold: true, size: 12 } };
        }

        // Style untuk header tabel
        const tableHeaderRow = titleRow + 3 + filterInfo.length + 1;
        columnDefinitions.forEach((_, index) => {
            const cellRef = XLSX.utils.encode_cell({ r: tableHeaderRow, c: index });
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "2980B9" } },
                    alignment: { horizontal: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    }
                };
            }
        });

        // Tambahkan border pada semua data tabel
        for (let row = tableHeaderRow + 1; row < tableHeaderRow + 1 + dataToExport.length; row++) {
            for (let col = 0; col < columnDefinitions.length; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (ws[cellRef]) {
                    if (!ws[cellRef].s) ws[cellRef].s = {};
                    ws[cellRef].s.border = {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    };
                }
            }
        }

        // Style untuk summary
        const summaryStartRow = tableHeaderRow + dataToExport.length + 2;
        if (ws[`A${summaryStartRow + 1}`]) {
            ws[`A${summaryStartRow + 1}`].s = { font: { bold: true } };
        }
        if (ws[`A${summaryStartRow + 2}`]) {
            ws[`A${summaryStartRow + 2}`].s = { font: { bold: true } };
        }
        if (ws[`A${summaryStartRow + 3}`]) {
            ws[`A${summaryStartRow + 3}`].s = { font: { bold: true } };
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Quotations');
        XLSX.writeFile(wb, 'quotations.xlsx');
    });
};

  // Row expansion methods
  const onRowToggle = (event) => {
      expandedRows.value = event.data;
  };

  </script>

  <style scoped>
<style scoped>

/* Responsive adjustments */
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
