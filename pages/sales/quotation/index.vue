<!-- Updated export functionality -->
<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-pt-12">
            <h4 class="mb-1">List Quotation</h4>
            <p class="mb-6">
            List quotation yang terdaftar di sistem
            </p>
            <!-- Statistics Cards -->
            <div class="row g-6 mb-6">
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Quotations</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary">
                                        <i class="ri-file-text-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ statistics?.totalQuotations || 0 }}</h5>
                                    <span class="text-muted">Quotation terdaftar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Approved</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success">
                                        <i class="ri-checkbox-circle-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ statistics?.approvedQuotations || 0 }}</h5>
                                    <span class="text-muted">Approved</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Pending</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-warning">
                                        <i class="ri-time-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ statistics?.pendingQuotations || 0 }}</h5>
                                    <span class="text-muted">Pending</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Rejected</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-danger">
                                        <i class="ri-close-circle-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="account-heading">
                                    <h5 class="mb-1">{{ statistics?.rejectedQuotations || 0 }}</h5>
                                    <span class="text-muted">Rejected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-6">
                <div class="col-12">
                    <CollapsibleFilterCard
                        title="Filter Quotation"
                        description="Temukan semua quotation perusahaan Anda"
                        :has-active-filters="hasActiveFilters"
                        @reset="resetFilters"
                    >
                        <FilterFieldsRow>
                            <FilterField>
                                <label class="form-label">Customer</label>
                                <CustomSelect2 v-model="filters.customerId" :options="customers || []" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Customer" />
                            </FilterField>
                            <FilterField>
                                <label class="form-label">Status</label>
                                <CustomSelect2 v-model="filters.status" :options="statusOptions" :get-option-label="option => option.label" :reduce="option => option.value" searchable clearable placeholder="Pilih Status" />
                            </FilterField>
                        </FilterFieldsRow>
                    </CollapsibleFilterCard>
                </div>
                <div class="col-12">
                    <!-- quotation Table -->
                    <div class="card">
                        <ListPageTableHeader
                            :rows="Number(tableControls.rows)"
                            :rows-options="rowsPerPageOptionsArray"
                            :search="globalFilterValue"
                            search-placeholder="Cari Quotation..."
                            :export-disabled="loading"
                            @update:rows="onToolbarRows"
                            @update:search="(v) => { globalFilterValue = v }"
                            @export="exportData"
                        >
                            <template #add>
                                <button
                                    v-if="userHasRole('superadmin') || userHasPermission('create_purchase_order')"
                                    type="button"
                                    class="btn btn-primary quotation-add-button"
                                    @click="navigateTo('/sales/quotation/form')"
                                >
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Quotation
                                </button>
                            </template>
                        </ListPageTableHeader>
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
                                                @click="navigateTo(`/sales/quotation/detail/${slotProps.data.id}`)" 
                                                style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                                class="text-primary"
                                                title="View detail"
                                            >
                                                {{ slotProps.data.noQuotation }}
                                            </a>
                                        </template>
                                  </Column>
                                    <Column field="customer.name" header="Customer" :sortable="true"></Column>
                                    <Column field="status" header="Status" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadgeClass(slotProps.data)">
                                                {{ getStatusBadgeText(slotProps.data) }}
                                            </span>
                                            <span v-if="(slotProps.data.revision ?? 0) > 0" class="badge bg-label-info ms-1">R{{ slotProps.data.revision }}</span>
                                        </template>
                                    </Column>
                                    <Column field="approvedByUser.fullName" header="Approved By" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <span>
                                                {{ getApprovalStepJabatan(slotProps.data, 'approved') || slotProps.data.approvedByUser?.fullName || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="up" header="UP" :sortable="true"></Column>
                                    <Column field="created_at" header="Tanggal" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.date ? new Date(slotProps.data.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="validUntil" header="Valid Until" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ slotProps.data.validUntil ? new Date(slotProps.data.validUntil).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="siteInvest.siNumber" header="SI" :sortable="true">
                                        <template #body="slotProps">
                                            <span class="text-nowrap">
                                                {{ slotProps.data.siteInvest?.siNumber || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="site.name" header="Site" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.site?.name || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="costCenter.name" header="Cost Center" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ slotProps.data.costCenter?.name || '-' }}
                                        </template>
                                    </Column>
                                    <Column field="createdByUser.fullName" header="Dibuat Oleh" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.createdByUser?.fullName || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                                        <template #body="slotProps">
                                            <div class="dropdown d-inline-block">
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'><i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu dropdown-menu-end quotation-actions-dropdown">
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('create_quotation') || userHasPermission('approve_quotation')) && (slotProps.data.status === 'draft' || slotProps.data.status === 'rejected')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="quotationStore.submitQuotation(slotProps.data.id)">
                                                            <i class="ri-send-plane-line me-2"></i> {{ slotProps.data.status === 'rejected' ? 'Submit Revisi' : 'Submit Quotation' }}
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('approve_quotation')) && canApproveQuotation(slotProps.data)">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="quotationStore.approveQuotation(slotProps.data.id)">
                                                            <i class="ri-check-line me-2"></i> Approve
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('approve_quotation')) && canRejectQuotation(slotProps.data)">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="quotationStore.rejectQuotation(slotProps.data.id)">
                                                            <i class="ri-close-line me-2"></i> Reject
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('view_purchase_order') && (slotProps.data.status == 'approved' || slotProps.data.status == 'partial' || slotProps.data.status == 'partial'))">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="viewQuotationDetails(slotProps.data.id)">
                                                            <i class="ri-eye-line me-2"></i> Lihat Detail
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('edit_purchase_order')) && canEditQuotation(slotProps.data)">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/sales/quotation/form/${slotProps.data.id}`)">
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

         </div>
          <div class="content-backdrop fade"></div>
      </div>
  </template>

  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useQuotationStore } from '~/stores/quotation'
  import { useCustomerStore } from '~/stores/customer'
  import { useUserStore } from '~/stores/user'
  import { usePermissionsStore } from '~/stores/permissions'
  import { usePermissions } from '~/composables/usePermissions'
import MyDataTable from '~/components/table/MyDataTable.vue'
import QuotationExpandedRow from '~/components/table/QuotationExpandedRow.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import Column from 'primevue/column'
  import { useDebounceFn } from '@vueuse/core'
  import { useDynamicTitle } from '~/composables/useDynamicTitle'

  // Composables
  const { setListTitle } = useDynamicTitle()

  // Store
  const myDataTableRef                     = ref(null)
  const quotationStore                     = useQuotationStore()
  const customerStore                      = useCustomerStore()
  const userStore                          = useUserStore()

  const formatRupiah                       = useFormatRupiah()
  const { userHasPermission, userHasRole } = usePermissions();
  const permissionStore                    = usePermissionsStore()

  const { quotations, loading, totalRecords, params, statistics } = storeToRefs(quotationStore)
  const { customers }   = storeToRefs(customerStore)

// State
const globalFilterValue = ref('');
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

const hasActiveFilters = computed(
    () => !!filters.value.customerId || !!filters.value.status
)

function resetFilters() {
    filters.value.customerId = null
    filters.value.status = null
}

  const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);
  const statusOptions = ref([
      { label: 'Draft', value: 'draft' },
      { label: 'Pending', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' },
      { label: 'Expired', value: 'expired' },
  ]);

  watch(filters, (newFilters) => {
      if (!newFilters) return;
      quotationStore.setFilters({
        customerId: newFilters.customerId,
        status: newFilters.status,
        search: newFilters.search || '',
      });
  }, { deep: true });

  const debouncedSearch = useDebounceFn(() => {
      quotationStore.setSearch(globalFilterValue.value || '')
  }, 500)

  watch(globalFilterValue, () => {
      debouncedSearch();
  });

  watch(() => params.value.rows, (newValue) => {
      tableControls.value.rows = Number(newValue) || 10;
  });

  watch(() => globalFilterValue.value, (newValue) => {
      tableControls.value.search = newValue;
  });

  const onPage = (event) => {
      if (event) quotationStore.setPagination(event);
  };
  const handleRowsChange = (value) => {
      const rowsValue = Number(value) || 10;
      params.value.rows = rowsValue;
      params.value.first = 0;
      quotationStore.fetchQuotations();
  };
  const onToolbarRows = (value) => {
      tableControls.value.rows = Number(value) || 10;
      handleRowsChange(value);
  };
  const onSort = (event) => {
      if (event) quotationStore.setSort(event);
  };

  onMounted(() => {
      quotationStore.fetchQuotations();
      quotationStore.fetchStatistics();
      customerStore.fetchCustomers();
      userStore.loadUser();
      permissionStore.fetchPermissions();
      setListTitle('Quotation', quotations.value.length)
      tableControls.value.rows = Number(params.value.rows) || 10;
      tableControls.value.search = globalFilterValue.value;
  });

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

  const viewQuotationDetails = (quotationId) => {
      if (!quotationId) {
          return;
      }
      navigateTo(`/sales/quotation/detail/${quotationId}`);
  };

  const { getStatusBadge, getApprovalStepJabatan, getStepCountForApproved } = useApprovalStatus();

  function canEditQuotation(row) {
    if (!row) return false
    const s = row.status
    if (s === 'draft' || s === 'pending' || s === 'rejected') return true
    if (s === 'approved') {
      const stepCount = getStepCountForApproved(row)
      return stepCount != null && stepCount.total > 0 && stepCount.current < stepCount.total
    }
    return false
  }

  function canApproveQuotation(row) {
    if (!row) return false
    const uid = userStore.user?.id
    if (uid == null) return false
    const approvers = row.currentApprovers ?? row.current_approvers ?? []
    const isCurrentApprover = approvers.length === 0 || approvers.some((a) => {
      const aid = a.userId ?? a.user_id
      return aid != null && Number(aid) === Number(uid)
    })
    if (row.status === 'pending') return isCurrentApprover
    if (row.status === 'approved') {
      const stepCount = getStepCountForApproved(row)
      if (stepCount && stepCount.current < stepCount.total) return isCurrentApprover
    }
    return false
  }

  function canRejectQuotation(row) {
    return canApproveQuotation(row)
  }

  function getStatusBadgeClass(data) {
    return getStatusBadge(data).class
  }

  function getStatusBadgeText(data) {
    return getStatusBadge(data).text
  }

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
              value = (col.field === 'total' ? (row.grandTotal ?? row.total) : row[col.field]) || '-';
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

      // Hitung grand total (gunakan grandTotal atau total)
      let grandTotal = 0;
      dataToExport.forEach(row => {
          const totalValue = parseFloat(row.grandTotal ?? row.total) || 0;
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

        // Hitung grand total (gunakan grandTotal atau total)
        let grandTotal = 0;
        dataToExport.forEach(row => {
            const totalValue = parseFloat(row.grandTotal ?? row.total) || 0;
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
                    value = (col.field === 'total' ? (row.grandTotal ?? row.total) : row[col.field]) || '-';
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

  definePageMeta({
    layout: 'default',
    middleware: ['auth', 'check-permission'],
    title: 'Quotation',
    description: 'Quotation Management',
    keywords: 'Quotation, Sales, Sinergi Innovate Pratama',
    author: 'Sinergi Innovate Pratama',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
  });

  </script>

<style scoped>
/* Dropdown Actions table: tampil di atas agar tidak tertutup overflow */
:deep(.quotation-actions-dropdown) {
  z-index: 1100 !important;
}

/* Repeater item styling */
.repeater-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease-in-out;
}

.quotation-add-button {
  flex: 0 0 auto;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
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
