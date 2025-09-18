<template>
  <div class="content-wrapper">
      <!-- Content -->
      <div class="container-xxl flex-grow-1 container-p-y">
          <h4 class="mb-1">List Surat Jalan</h4>
          <p class="mb-6">
          List suratJalan yang terdaftar di sistem
          </p>
          <!-- suratJalan cards -->
          <div class="row g-6 mb-6">
              <!-- Static cards for display, can be made dynamic later -->
              <div class="col-xl-4 col-lg-6 col-md-6">
                  <div class="card">
                      <div class="card-body">
                          <div class="d-flex justify-content-between align-items-center mb-4">
                              <h5 class="mb-1">Total Surat Jalan</h5>
                              <span class="badge bg-label-primary rounded-pill">Total</span>
                          </div>
                          <div class="d-flex align-items-center">
                              <h1 class="mb-0 display-4">{{ statistics?.totalSuratJalans || 0 }}</h1>
                              <i class="ri-truck-line ri-24px text-primary ms-2"></i>
                          </div>
                          <p class="mb-0 mt-2">Total semua surat jalan dalam sistem</p>
                      </div>
                  </div>
              </div>
              <div class="col-xl-4 col-lg-6 col-md-6">
                  <div class="card">
                      <div class="card-body">
                          <div class="d-flex justify-content-between align-items-center mb-4">
                              <h5 class="mb-1">From Delivered SO</h5>
                              <span class="badge bg-label-success rounded-pill">Delivered</span>
                          </div>
                          <div class="d-flex align-items-center">
                              <h1 class="mb-0 display-4">{{ statistics?.withDeliveredSO || 0 }}</h1>
                              <i class="ri-check-line ri-24px text-success ms-2"></i>
                          </div>
                          <p class="mb-0 mt-2">Surat jalan dari SO delivered</p>
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
                                  <button v-if="userHasRole('superadmin') || userHasPermission('create_surat_jalan')" @click="suratJalanStore.openModal(null)" class="btn btn-primary mb-2 text-wrap add-new-role">
                                      Tambah Surat Jalan
                                  </button>
                                  <p class="mb-0 mt-1">Buat Surat Jalan baru</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div class="row g-6">
              <div class="col-12">
                  <h4 class="mt-6 mb-1">Total & Filter Surat Jalan</h4>
                  <p class="mb-0">Temukan semua akun administrator perusahaan Anda dan Surat Jalan terkait.</p>
              </div>
              <div class="col-12">
                  <div class="card">
                      <div class="card-body">
                          <div class="row">
                              <div class="col-md-12">
                                  <CustomSelect2 v-model="filters.customerId" :options="customers" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Customer" />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="col-12">
                  <!-- suratJalan Table -->
                  <div class="card">
                      <div class="card-header">
                          <TableControls
                              v-model="tableControls"
                              :rows-per-page-options="rowsPerPageOptionsArray"
                              search-placeholder="Cari Surat Jalan..."
                              @rows-change="handleRowsChange"
                              @search="handleSearch"
                              @export="exportData"
                          />
                      </div>
                      <div class="card-datatable table-responsive py-3 px-3">
                          <MyDataTable 
                              ref="myDataTableRef"
                              :data="suratJalans"
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
                              >
                                  <Column header="#" :sortable="false">
                                      <template #body="slotProps">
                                          {{ params.first + slotProps.index + 1 }}
                                      </template>
                                  </Column>
                                  <Column field="noSuratJalan" header="No. Surat Jalan" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <a 
                                                @click="navigateTo(`/sales/surat-jalan-detail?id=${slotProps.data.id}`)" 
                                                style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                                title="View detail"
                                                class="text-primary"
                                            >
                                                {{ slotProps.data.noSuratJalan }}
                                            </a>
                                        </template>
                                  </Column>
                                  <Column field="salesOrder.noSo" header="No. SO" :sortable="true" class="text-nowrap">
                                      <template #body="slotProps">
                                          <span v-if="slotProps.data.salesOrder?.noSo && slotProps.data.salesOrder?.id">
                                              <a :href="`/sales/sales-order-detail?id=${slotProps.data.salesOrder.id}`"
                                              class="text-primary"
                                              style="text-decoration: underline;"
                                              title="Lihat Sales Order"
                                              >
                                                  {{ slotProps.data.salesOrder.noSo }}
                                              </a>
                                          </span>
                                          <span v-else>
                                              -
                                          </span>
                                      </template>
                                  </Column>
                                  <Column field="customer.name" header="Customer" :sortable="true">
                                      <template #body="slotProps">
                                          <span>
                                              {{ slotProps.data.customer?.name || '-' }}
                                          </span>
                                      </template>
                                  </Column>
                                  <Column field="date" header="Tanggal" :sortable="true">
                                      <template #body="slotProps">
                                          {{ slotProps.data.date ? new Date(slotProps.data.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                      </template>
                                  </Column>
                                  <Column field="salesOrder.perusahaan.nmPerusahaan" header="Perusahaan" :sortable="true">
                                      <template #body="slotProps">
                                          <span>
                                              {{ slotProps.data.salesOrder?.perusahaan?.nmPerusahaan || '-' }}
                                          </span>
                                      </template>
                                  </Column>
                                  <Column header="Actions" :exportable="false" style="min-width:8rem">
                                      <template #body="slotProps">
                                          <div class="d-inline-block">
                                              <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                              </a>
                                              <ul class="dropdown-menu">
                                                  <li v-if="userHasRole('superadmin') || userHasPermission('view_surat_jalan')">
                                                      <a class="dropdown-item" href="javascript:void(0)" @click="viewSuratJalanDetails(slotProps.data.id)">
                                                          <i class="ri-eye-line me-2"></i> Lihat Detail
                                                      </a>
                                                  </li>
                                                  <li v-if="userHasRole('superadmin') || userHasPermission('edit_surat_jalan')">
                                                      <a class="dropdown-item" href="javascript:void(0)" @click="suratJalanStore.openModal(slotProps.data)">
                                                          <i class="ri-edit-box-line me-2"></i> Edit
                                                      </a>
                                                  </li>
                                                  <li v-if="userHasRole('superadmin') || userHasPermission('delete_surat_jalan')">
                                                      <a class="dropdown-item text-danger" href="javascript:void(0)" @click="suratJalanStore.deleteSuratJalan(slotProps.data.id)" >
                                                          <i v-if="loading" class="ri-loader-4-line me-2 animate-spin"></i>
                                                          <i v-else class="ri-delete-bin-7-line me-2"></i> 
                                                          {{ loading ? 'Menghapus...' : 'Hapus' }}
                                                      </a>
                                                  </li>
                                              </ul>
                                          </div>
                                      </template>
                                  </Column>
                          </MyDataTable>
                      </div>
                  </div>
                  <!--/ suratJalan Table -->
              </div>
          </div>
          <!--/ suratJalan cards -->

          <Modal 
              id="SuratJalanModal"
              :title="modalTitle" 
              :description="modalDescription"
              :validation-errors-from-parent="validationErrors"
          >
              <template #default>
                  <form @submit.prevent="suratJalanStore.saveSuratJalan()">
                       <div class="row">
                          <div class="col">
                              <ul class="nav nav-tabs" role="tablist">
                                  <li class="nav-item">
                                      <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#form-tabs-info" role="tab" aria-selected="true" type="button">
                                          <span class="ri-user-line ri-20px d-sm-none"></span>
                                          <span class="d-none d-sm-block">Informasi Surat Jalan</span>
                                      </button>
                                  </li>
                                  <li class="nav-item">
                                      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-items" role="tab" aria-selected="false" type="button">
                                          <span class="ri-folder-user-line ri-20px d-sm-none"></span>
                                          <span class="d-none d-sm-block">List Produk</span>
                                      </button>
                                  </li>
                              </ul>
                          </div>
                      </div>
                      <div class="tab-content pt-6">
                          <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                              <div class="row g-4">
                                  <div class="col-md-6">
                                      <CustomSelect2 
                                          v-model="form.salesOrderId" 
                                          :options="filteredSalesOrders" 
                                          :get-option-label="getSalesOrderLabel" 
                                          :reduce="option => option.id" 
                                          placeholder="Pilih Sales Order"
                                          searchable
                                          clearable
                                          :loading="loading"
                                      >
                                          <template #option="option">
                                              <div class="d-flex justify-content-between align-items-center w-100">
                                                  <div>
                                                      <div class="fw-bold">{{ option.noSo }}</div>
                                                      <small class="text-muted">{{ option.customer?.name || 'No Customer' }}</small>
                                                  </div>
                                                  <div class="text-end">
                                                      <small class="text-muted">{{ formatDate(option.date) }}</small>
                                                  </div>
                                              </div>
                                          </template>
                                      </CustomSelect2>
                                  </div>
                                  <div class="col-md-6">
                                      <CustomSelect2 v-model="form.customerId" :options="customers" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Customer"  :disabled="!!form.salesOrderId"/>
                                      <div v-if="form.salesOrderId" class="form-text mt-1">
                                          <small class="text-muted">📋 Customer diambil dari Sales Order yang dipilih</small>
                                      </div>
                                  </div>
                                  <div class="col-md-3">
                                      <div class="form-floating form-floating-outline">
                                          <input type="date" v-model="form.date" class="form-control" >
                                          <label>Tanggal Surat Jalan</label>
                                      </div>
                                  </div>
                                  <div class="col-md-3">
                                      <div class="form-floating form-floating-outline">
                                          <input type="text" v-model="form.picName" class="form-control" placeholder="Nama PIC">
                                          <label>Nama PIC</label>
                                      </div>
                                  </div>
                                  <div class="col-md-6">
                                      <div class="form-floating form-floating-outline">
                                          <input type="text" v-model="form.penerima" class="form-control" placeholder="Nama Penerima">
                                          <label>Nama Penerima</label>
                                      </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="form-check form-switch mt-3 d-flex align-items-center">
                                        <input
                                          class="form-check-input me-2"
                                          type="checkbox"
                                          v-model="alamatSamaDenganCustomer"
                                        />
                                        <label class="form-check-label mb-0">
                                          Sama dengan alamat customer?
                                        </label>
                                    </div>
                                  </div>
                                  <div class="col-md-6" v-if="!alamatSamaDenganCustomer">
                                      <div class="form-floating form-floating-outline">
                                          <textarea v-model="form.alamatPengiriman" class="form-control" placeholder="Alamat Pengiriman"></textarea>
                                          <label>Alamat Pengiriman</label>
                                      </div>
                                  </div>
                                  <div class="col-md-12">
                                      <div class="form-floating form-floating-outline">
                                          <textarea v-model="form.description" class="form-control" placeholder="Deskripsi Surat Jalan"></textarea>
                                          <label>Deskripsi Surat Jalan</label>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div class="tab-pane fade" id="form-tabs-items" role="tabpanel">
                              <!-- Alert Info jika tidak ada item dengan status partial -->
                              <div v-if="form.salesOrderId && !hasPartialItems" class="alert alert-warning mb-4">
                                  <i class="ri-alert-line me-2"></i>
                                  <strong>Info:</strong> 
                                  <p class="mb-0 mt-2">
                                      Sales Order yang dipilih belum memiliki item dengan status partial. 
                                      Silakan ubah status partial di halaman sales order detail atau pilih sales order lain yang sudah memiliki item dengan status partial.
                                  </p>
                                  <div class="mt-2">
                                      <a :href="`/sales/sales-order-detail?id=${form.salesOrderId}`" target="_blank" class="btn btn-sm btn-outline-warning">
                                          <i class="ri-external-link-line me-1"></i>
                                          Buka Sales Order Detail
                                      </a>
                                  </div>
                              </div>
                              
                              <div v-for="(item, index) in (form.suratJalanItems || [])" :key="index" class="repeater-item mb-4">
                                  <div class="row g-3">
                                      <div class="col-md-6">
                                          <CustomSelect2 v-model="item.productId" :options="customerProducts || []" 
                                              :get-option-label="option => option.label" searchable clearable 
                                              :reduce="p => p.id" 
                                              placeholder="Pilih Produk" 
                                              @update:modelValue="onProductChange(index)" 
                                              
                                              :disabled="form.salesOrderId && !hasPartialItems"
                                          />
                                      </div>
                                      <div class="col-md-6">
                                          <CustomSelect2 v-model="item.warehouseId" :options="warehouses" 
                                              :get-option-label="option => option.label" searchable clearable 
                                              :reduce="w => w.id" 
                                              placeholder="Pilih Gudang" 
                                               
                                              @update:modelValue="updateStockInfo(index)"
                                              :disabled="form.salesOrderId && !hasPartialItems"
                                          />
                                      </div>
                                      <div class="col-md-3">
                                          <div class="form-floating form-floating-outline">
                                              <input 
                                                  type="number" 
                                                  v-model.number="item.quantity" 
                                                  @input="onQuantityChange(index)" 
                                                  class="form-control" 
                                                  placeholder="Qty" 
                                                  step="1" 
                                                  min="0"
                                                  :disabled="form.salesOrderId && !hasPartialItems"
                                              >
                                              <label>Jumlah</label>
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="form-floating form-floating-outline">
                                              <input 
                                                  type="text" 
                                                  v-model="item.description" 
                                                  class="form-control" 
                                                  placeholder="Deskripsi item"
                                                  :disabled="form.salesOrderId && !hasPartialItems"
                                              >
                                              <label>Deskripsi</label>
                                          </div>
                                      </div>
                                      <div class="col-md-3 d-flex align-items-center">
                                          <button 
                                              @click.prevent="removeSuratJalanItem(index)" 
                                              class="btn btn-outline-danger w-100"
                                              :disabled="form.salesOrderId && !hasPartialItems"
                                          >
                                              Hapus
                                          </button>
                                      </div>
                                  </div>
                                  <hr class="my-4">
                              </div>
                              <div class="mt-4">
                                  <button 
                                      @click.prevent="addSuratJalanItem()" 
                                      class="btn btn-primary"
                                      :disabled="form.salesOrderId && !hasPartialItems"
                                  >
                                      Tambah Item
                                  </button>
                              </div>
                          </div>
                      </div>
                      <div class="modal-footer mt-6">
                           <button type="button" class="btn btn-outline-secondary" @click="suratJalanStore.closeModal()">Tutup</button>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSuratJalanStore } from '~/stores/surat-jalan'
import { useCustomerStore } from '~/stores/customer'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import { useProductStore } from '~/stores/product'
import { useWarehouseStore } from '~/stores/warehouse'
import { useStocksStore } from '~/stores/stocks'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useSalesOrderStore } from '~/stores/sales-order'
import { useFormatRupiah } from '~/composables/formatRupiah'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import TableControls from '~/components/table/TableControls.vue'
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
const toast = useToast();

// Store
const myDataTableRef        = ref(null)
const suratJalanStore       = useSuratJalanStore()
const perusahaanStore       = usePerusahaanStore()
const cabangStore           = useCabangStore()
const customerStore         = useCustomerStore()
const warehouseStore        = useWarehouseStore()
const productStore          = useProductStore()
const userStore             = useUserStore()
const formatRupiah          = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions();
const permissionStore       = usePermissionsStore()
const salesOrderStore       = useSalesOrderStore()

const { suratJalans, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, statistics } = storeToRefs(suratJalanStore)
const { customers }   = storeToRefs(customerStore)
const { salesOrders, customerProducts } = storeToRefs(salesOrderStore)
const { warehouses }  = storeToRefs(warehouseStore)

// State
const filters = ref({
customerId: null,
search: '',
});

const globalFilterValue = ref('');
const alamatSamaDenganCustomer = ref(false)
const salesOrderItems = ref([]) // State untuk menyimpan sales order items
const tableControls = ref({
    rows: 10,
    search: '',
});

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);
const modalTitle = computed(() => isEditMode.value ? 'Edit Surat Jalan' : 'Tambah Surat Jalan');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data Surat Jalan di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan data Surat Jalan baru.');

let modalInstance = null;
onMounted(async () => {
  userStore.loadUser();
  suratJalanStore.fetchSuratJalans();
  suratJalanStore.fetchStatistics();
  customerStore.fetchCustomers();
  salesOrderStore.fetchSalesOrders();
  warehouseStore.fetchWarehouses();
  permissionStore.fetchPermissions();

  // Gunakan endpoint data baru untuk load data
  try {
      const [perusahaanData, cabangData, customerData] = await Promise.all([
          salesOrderStore.fetchPerusahaanData(),
          salesOrderStore.fetchCabangData(),
          salesOrderStore.fetchCustomerData(),
      ]);
      
      // Assign data ke store yang sesuai
      perusahaanStore.perusahaans = perusahaanData;
      cabangStore.cabangs         = cabangData;
      customerStore.customers     = customerData;

  } catch (error) {
      console.error('Error loading data:', error);
      // Fallback ke method lama jika endpoint data baru gagal
      customerStore.fetchCustomers();
      perusahaanStore.fetchPerusahaans();
      cabangStore.fetchCabangs();
  }

  const modalElement = document.getElementById('SuratJalanModal')
  if (modalElement) {
      modalInstance = new bootstrap.Modal(modalElement)
  }
  setListTitle('Surat Jalan', suratJalans.value.length)
  
  // Initialize table controls
  tableControls.value.rows = Number(params.value.rows) || 10;
  tableControls.value.search = globalFilterValue.value;
});

watch(showModal, (newValue) => {
  if (newValue) {
      modalInstance?.show()
      if (isEditMode.value) {
        // Fetch stock for existing items
        if (form.value.suratJalanItems && form.value.suratJalanItems.length > 0) {
            form.value.suratJalanItems.forEach((item, index) => {
                updateStockInfo(index);
            });
        }
      }
  } else {
      modalInstance?.hide()
  }
})

// Watcher untuk salesOrderId - auto fill data ketika dipilih
watch(() => form.value.salesOrderId, async (newSalesOrderId, oldSalesOrderId) => {
  if (newSalesOrderId && newSalesOrderId !== oldSalesOrderId) {
    // Filter salesOrders hanya yang status-nya 'approved' atau 'partial'
    const filteredSalesOrders = salesOrders.value?.filter(so => so.status === 'approved' || so.status === 'partial' || so.status === 'delivered') || [];
    const selectedSalesOrder = filteredSalesOrders.find(so => so.id === newSalesOrderId);

    if (selectedSalesOrder) {

      // Auto fill data dari sales order yang dipilih
      form.value.customerId = selectedSalesOrder.customerId || selectedSalesOrder.customer?.id;

      // Jika ada data perusahaan dan cabang di sales order
      if (selectedSalesOrder.perusahaanId) {
        form.value.perusahaanId = selectedSalesOrder.perusahaanId;
      }

      // Auto fill tanggal jika belum ada
      if (!form.value.date && selectedSalesOrder.date) {
        form.value.date = new Date(selectedSalesOrder.date).toISOString().split('T')[0];
      }

      // ✅ AUTO FILL SALES ORDER ITEMS - HANYA JIKA BUKAN EDIT MODE
      if (!isEditMode.value) {
        try {
          // Fetch detail sales order dengan items
          await salesOrderStore.getSalesOrderDetails(newSalesOrderId);
          const detailedSalesOrder = salesOrderStore.salesOrder;

          if (detailedSalesOrder && detailedSalesOrder.salesOrderItems) {
            // ✅ NEW: Simpan semua sales order items ke state untuk pengecekan
            salesOrderItems.value = detailedSalesOrder.salesOrderItems;

            // Pastikan suratJalanItems selalu ada
            if (!form.value.suratJalanItems) {
              form.value.suratJalanItems = [];
            }

            // Clear existing items
            form.value.suratJalanItems = [];

            // Auto fill items dari sales order - YANG STATUS_PARTIAL = TRUE ATAU JIKA STATUS DELIVERED
            const itemsToProcess = detailedSalesOrder.salesOrderItems.filter(soItem => {
              // Jika ada item dengan status partial, gunakan yang partial saja
              const hasPartialItems = detailedSalesOrder.salesOrderItems.some(item => item.statusPartial === true);
              if (hasPartialItems) {
                return soItem.statusPartial === true;
              }
              // Fallback: jika tidak ada item partial tapi status delivered, gunakan semua item
              return detailedSalesOrder.status === 'delivered';
            });

            itemsToProcess.forEach((soItem, index) => {
              const suratJalanItem = {
                productId: soItem.productId,
                warehouseId: soItem.warehouseId,
                quantity: Math.floor(Number(soItem.quantity)) || 0,
                description: soItem.description || '',
                // Sertakan info produk jika ada
                product: soItem.product ? {
                  id: soItem.product.id,
                  name: soItem.product.name,
                  sku: soItem.product.sku,
                  priceSell: soItem.product.priceSell,
                  unit: soItem.product.unit
                } : null,
                // Sertakan info gudang jika ada
                warehouse: soItem.warehouse ? {
                  id: soItem.warehouse.id,
                  name: soItem.warehouse.name
                } : null,
                // Referensi ke sales order item
                salesOrderItemId: soItem.id
              };

              form.value.suratJalanItems.push(suratJalanItem);
            });

          } else {
            // ✅ NEW: Reset sales order items jika tidak ada
            salesOrderItems.value = [];
          }
        } catch (error) {
          // Fallback: buat array kosong
          form.value.suratJalanItems = [];
        }
        } else {
      }

    }
  } else if (!newSalesOrderId && oldSalesOrderId) {
    // Jika sales order dihapus/di-clear, reset beberapa field ke kondisi manual

    // Reset ke default values tapi tetap biarkan user bisa edit
    if (!isEditMode.value) {
      form.value.customerId = null;
      // Clear surat jalan items
      if (!form.value.suratJalanItems) {
        form.value.suratJalanItems = [];
      } else {
        form.value.suratJalanItems = [];
      }
      // ✅ NEW: Reset sales order items
      salesOrderItems.value = [];
    }
  }
});

// ✅ NEW: Watcher untuk customerId - fetch products untuk customer yang dipilih
watch(() => form.value.customerId, (newCustomerId, oldCustomerId) => {
if (newCustomerId && newCustomerId !== oldCustomerId) {
  // Hanya fetch jika customerId valid dan berubah
  if (typeof newCustomerId === 'number' || typeof newCustomerId === 'string') {
    salesOrderStore.fetchProductsForCustomer(newCustomerId);
  }
} else if (!newCustomerId) {
  // Reset customer products jika customer dihapus
  salesOrderStore.customerProducts = [];
}
});

watch(() => customerProducts, (newProducts) => {
if (form.value.suratJalanItems && Array.isArray(form.value.suratJalanItems) && newProducts && Array.isArray(newProducts)) {
  form.value.suratJalanItems.forEach(item => {
    if (!item) return;
    const productExists = newProducts.some(p => p && p.id === item.productId);
    if (!productExists) {
      item.productId = null;
    }
  });
}
}, { deep: true });

watch(alamatSamaDenganCustomer, (val) => {
  if (val) {
    // Ambil data customer yang dipilih
    const selectedCustomer = customers.value.find(c => c.id === form.value.customerId)
    form.value.alamatPengiriman = selectedCustomer?.address || ''
  } else {
    form.value.alamatPengiriman = ''
  }
})

// Jika customerId berubah dan checkbox aktif, update alamat otomatis
watch(() => form.value.customerId, (val) => {
  if (alamatSamaDenganCustomer.value) {
    const selectedCustomer = customers.value.find(c => c.id === val)
    form.value.alamatPengiriman = selectedCustomer?.address || ''
  }
})

watch(globalFilterValue, useDebounceFn((newValue) => {
  filters.value.search = newValue;
}, 500));

// Watch untuk sinkronisasi table controls
watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10;
});

watch(() => globalFilterValue.value, (newValue) => {
    tableControls.value.search = newValue;
});

watch(filters, (newFilters) => {
  const { page, rows, ...restFilters } = newFilters;
  suratJalanStore.setFilters(restFilters);
}, { deep: true });

const onPage = (event) => {
  if (event) {
    suratJalanStore.setPagination(event);
  }
};

const handleRowsChange = (value) => {
  const rowsValue = Number(value) || 10;
  params.value.rows = rowsValue;
  params.value.first = 0;
  suratJalanStore.fetchSuratJalans();
};

const handleSearch = (value) => {
  globalFilterValue.value = value;
  params.value.first = 0;
  suratJalanStore.fetchSuratJalans();
};

const onSort = (event) => {
  if (event) {
    suratJalanStore.setSort(event);
  }
};

const exportData = (format) => {
  if (format === 'csv') myDataTableRef.value.exportCSV();
};

// ✅ NEW: Function untuk menangani perubahan produk pada suratJalan items
const onProductChange = (index) => {
const selectedProductId = form.value.suratJalanItems[index].productId;
const selectedProduct = customerProducts.value && Array.isArray(customerProducts.value) 
  ? customerProducts.value.find(p => p && p.id === selectedProductId)
  : null;

if (selectedProduct) {
  const item = form.value.suratJalanItems[index];
  item.price = Number(selectedProduct.priceSell) || 0;
  calculateSubtotal(index);
  updateStockInfo(index);
}
};

// ✅ NEW: Function untuk getSalesOrderLabel
const getSalesOrderLabel = (salesOrder) => {
  if (!salesOrder) return '';
  return `${salesOrder.noSo} - ${salesOrder.customer?.name || 'No Customer'}`;
};

// ✅ NEW: Function untuk calculateSubtotal
const calculateSubtotal = (index) => {
  const item = form.value.suratJalanItems[index];
  if (item && item.quantity && item.price) {
    item.subtotal = Number(item.quantity) * Number(item.price);
  } else {
    item.subtotal = 0;
  }
};

// ✅ NEW: Function untuk handle perubahan quantity
const onQuantityChange = (index) => {
  const item = form.value.suratJalanItems[index];
  if (item && item.quantity !== null && item.quantity !== undefined) {
    item.quantity = Math.floor(Number(item.quantity)) || 0;
    calculateSubtotal(index);
  }
};

// ✅ NEW: Computed property untuk suratJalanItemsTotal
const suratJalanItemsTotal = computed(() => {
  if (!form.value.suratJalanItems || !Array.isArray(form.value.suratJalanItems)) {
    return 0;
  }
  return form.value.suratJalanItems.reduce((total, item) => {
    return total + (Number(item.subtotal) || 0);
  }, 0);
});

// ✅ NEW: Computed property untuk grandTotal
const grandTotal = computed(() => {
  return suratJalanItemsTotal.value;
});

// ✅ NEW: Function untuk update stock info
const updateStockInfo = async (index) => {
const item = form.value.suratJalanItems[index];
if (item.productId && item.warehouseId) {
  try {
    const stockStore = useStocksStore();
    stockStore.params.search = ''; // Reset search if any
    stockStore.params.rows = 1; // We only need one record
    const response = await stockStore.fetchStocksPaginated({
      productId: item.productId,
      warehouseId: item.warehouseId,
    });
    if (response && response.data && response.data.length > 0) {
      item.stock = response.data[0];
    } else {
      item.stock = { quantity: 0 };
    }
  } catch (error) {
    console.error('Failed to fetch stock info:', error);
    item.stock = { quantity: 0 };
  }
} else {
  item.stock = { quantity: 0 };
}
};

// ✅ NEW: Function untuk menambah item suratJalan
const addSuratJalanItem = () => {
// Pastikan suratJalanItems selalu ada
if (!form.value.suratJalanItems) {
  form.value.suratJalanItems = [];
}
form.value.suratJalanItems.push({
  productId: null,
  warehouseId: null,
  quantity: 1,
  price: 0,
  description: '',
  subtotal: 0,
  deliveredQty: 0,
  isReturned: false,
  stock: { quantity: 0 },
});
};

// ✅ NEW: Function untuk menghapus item suratJalan
const removeSuratJalanItem = (index) => {
form.value.suratJalanItems.splice(index, 1);
};

const viewSuratJalanDetails = (suratJalanId) => {
  
  if (!suratJalanId) {
      console.error('❌ Page Debug - No suratJalanId provided');
      toast.fire({
          icon: 'error',
          title: 'Parameter Tidak Valid',
          text: 'ID Surat Jalan tidak valid.',
          confirmButtonText: 'OK'
      });
      return;
  }
  
  router.push({ path: `/sales/surat-jalan-detail`, query: { id: suratJalanId } });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('id-ID', { 
      day  : '2-digit',
      month: '2-digit',
      year : 'numeric'
  });
};

const filteredSalesOrders = computed(() => {
  return (salesOrders.value || []).filter(so => so.status === 'approved' || so.status === 'partial' || so.status === 'delivered')
})

// ✅ NEW: Computed property untuk mengecek apakah ada item dengan status partial
const hasPartialItems = computed(() => {
  if (!form.value.salesOrderId || !salesOrderItems.value || !Array.isArray(salesOrderItems.value)) {
    return false;
  }
  
  // Cek apakah ada item dengan status partial = true
  const hasPartial = salesOrderItems.value.some(item => item.statusPartial === true);
  
  // Fallback: jika tidak ada item partial, cek apakah sales order status adalah 'delivered'
  if (!hasPartial) {
    const selectedSalesOrder = salesOrders.value?.find(so => so.id === form.value.salesOrderId);
    if (selectedSalesOrder && selectedSalesOrder.status === 'delivered') {
      return true; // Allow editing jika status delivered
    }
  }
  
  return hasPartial;
})

// ✅ NEW: Watcher untuk memantau perubahan sales order items
watch(salesOrderItems, (newItems) => {
  // Watcher untuk memantau perubahan sales order items
}, { deep: true })

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
