<!-- Updated export functionality -->
<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
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
                    <h4 class="mt-6 mb-1">Filter Quotation</h4>
                    <p class="mb-0">Temukan semua quotation perusahaan Anda</p>
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
                        <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                                <span class="me-2">Baris:</span>
                                <Dropdown
                                    v-model="tableControls.rows"
                                    :options="rowsPerPageOptionsArray"
                                    @change="handleRowsChange"
                                    placeholder="Jumlah"
                                    style="width: 8rem;"
                                />
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button
                                    v-if="userHasRole('superadmin') || userHasPermission('create_purchase_order')"
                                    @click="quotationStore.openModal()"
                                    class="btn btn-primary"
                                >
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Quotation
                                </button>
                                <button @click="exportData('excel')" class="btn btn-outline-secondary" :disabled="loading">
                                    <i class="ri-download-line me-1"></i>
                                    Export Excel
                                </button>
                                <button @click="exportData('pdf')" class="btn btn-outline-secondary" :disabled="loading">
                                    <i class="ri-file-pdf-line me-1"></i>
                                    Export PDF
                                </button>
                                <span class="p-input-icon-left">
                                    <InputText
                                        v-model="globalFilterValue"
                                        placeholder="Cari Quotation..."
                                        class="w-full md:w-20rem"
                                    />
                                </span>
                            </div>
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
                                            <span :class="getStatusBadge(slotProps.data).class">
                                                {{ getStatusBadge(slotProps.data).text }}
                                            </span>
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
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('edit_purchase_order')) && slotProps.data.status === 'draft'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="quotationStore.submitQuotation(slotProps.data.id)">
                                                            <i class="ri-send-plane-line me-2"></i> Submit Quotation
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('approve_purchase_order')) && slotProps.data.status === 'pending'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="quotationStore.approveQuotation(slotProps.data.id)">
                                                            <i class="ri-check-line me-2"></i> Approve
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('reject_purchase_order')) && slotProps.data.status === 'pending'">
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
                dialog-class="modal-xl"
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
                                    <li class="nav-item">
                                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-services" role="tab" aria-selected="false" type="button">
                                            <span class="ri-service-line ri-20px d-sm-none"></span>
                                            <span class="d-none d-sm-block">Services</span>
                                        </button>
                                    </li>
                                    <li class="nav-item">
                                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-did" role="tab" aria-selected="false" type="button">
                                            <span class="ri-truck-line ri-20px d-sm-none"></span>
                                            <span class="d-none d-sm-block">DID (Delivery/Installation)</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="tab-content pt-4">
                            <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                                <div class="row g-4">
                                    <div class="col-md-12">
                                        <input type="hidden" v-model="form.noQuotation" class="form-control" placeholder="No Quotation" >
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">Site Investment</label>
                                        <CustomSelect2 v-model="form.siteInvestId" :options="siteInvests" :get-option-label="s => s ? ((s.siNumber || '') + ' - ' + (s.name || '')) : ''" :reduce="s => s?.id" searchable clearable placeholder="Pilih Site Investment" @update:modelValue="onSiteInvestChange" />
                                        <small class="text-muted d-block mt-1">Hanya yang sudah approved</small>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">Customer</label>
                                        <CustomSelect2 v-model="form.customerId" :options="customers || []" :get-option-label="option => option?.name ?? ''" :reduce="option => option?.id" searchable clearable placeholder="Pilih Customer" />
                                        <small class="text-muted d-block mt-1">Otomatis berdasarkan Site Investment</small>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">Site</label>
                                        <CustomSelect2 v-model="form.siteId" :options="sites" :get-option-label="s => s ? ((s.code || '') + ' - ' + (s.name || '')) : ''" :reduce="s => s?.id" searchable clearable placeholder="Pilih Site" />
                                        <small class="text-muted d-block mt-1">Otomatis berdasarkan Site Investment</small>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">Cost Center</label>
                                        <CustomSelect2 v-model="form.costCenterId" :options="costCenters" :get-option-label="c => c ? ((c.code || '') + ' - ' + (c.name || '')) : ''" :reduce="c => c?.id" searchable clearable placeholder="Pilih Cost Center" />
                                        <small class="text-muted d-block mt-1">Otomatis berdasarkan Site Investment</small>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted">Untuk Perhatian</label>
                                        <input type="text" v-model="form.up" class="form-control" placeholder="Untuk Perhatian" >
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">Tanggal Quotation</label>
                                        <input type="date" v-model="form.date" class="form-control" >
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">Berlaku Sampai</label>
                                        <input type="date" v-model="form.validUntil" class="form-control" >
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted">Terms of Payment</label>
                                        <CustomSelect2 v-model="form.termsOfPayment" :options="termsOfPaymentOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable placeholder="Pilih" />
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">Minimum Period (bulan)</label>
                                        <CustomSelect2 v-model="form.minimumPeriod" :options="minimumPeriodOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable placeholder="Pilih" @update:modelValue="onPeriodChange" />
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">DP (%)</label>
                                        <input type="number" v-model.number="form.dpPercent" class="form-control" placeholder="DP (%)" :disabled="form.termsOfPayment !== 'down_payment'">
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">Discount (%)</label>
                                        <input type="number" v-model.number="form.discountPercent" class="form-control" placeholder="Discount (%)">
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label text-muted">Tax (%)</label>
                                        <input type="number" v-model.number="form.taxPercent" class="form-control" placeholder="Tax (%)">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted">Attachment (PDF, Excel, Word, Image)</label>
                                        <input type="file" @change="onFileChange" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv">
                                        <small class="text-muted d-block mt-1">Maks. 2MB</small>
                                        <a v-if="form.attachmentPreview" :href="form.attachmentPreview" target="_blank" rel="noopener noreferrer" class="d-block mt-1 small">Lihat attachment saat ini</a>
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label text-muted">Deskripsi</label>
                                        <textarea v-model="form.description" class="form-control" placeholder="Deskripsi"></textarea>
                                    </div>
                                    <div class="col-md-6">
                                        <h6 class="mb-3">Add-ons</h6>
                                        <p class="text-muted mb-4">Pilih layanan tambahan yang akan ditambahkan ke quotation</p>
                                        <div class="form-check form-check-inline mt-4">
                                            <input type="checkbox" v-model="form.slaGuarantee" class="form-check-input" id="slaGuarantee">
                                            <label class="form-check-label" for="slaGuarantee">SLA Guarantee</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input type="checkbox" v-model="form.support" class="form-check-input" id="support">
                                            <label class="form-check-label" for="support">Support</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input type="checkbox" v-model="form.performance" class="form-check-input" id="performance">
                                            <label class="form-check-label" for="performance">Performance</label>
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
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <span class="text-muted fw-medium">Item #{{ index + 1 }}</span>
                                        <button class="btn btn-sm btn-outline-danger" @click.prevent="quotationStore.removeItem(index)" type="button" title="Hapus item">
                                            <i class="ri-delete-bin-line me-1"></i> Hapus
                                        </button>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <CustomSelect2 v-model="item.productId" :options="filteredCustomerProducts" 
                                                :get-option-label="option => option ? (option.displayName || `${option.sku || ''} | ${option.name || ''}`) : ''" 
                                                searchable 
                                                clearable
                                                :reduce="p => p?.id" 
                                                placeholder="Cari berdasarkan part number atau nama produk..." 
                                                @update:modelValue="onProductChange(index)" 
                                                
                                                :disabled="!form.customerId"

                                                :filter-by="(option, label, search) => {
                                                    const product = option;
                                                    const searchLower = search.toLowerCase();
                                                    return (product.name && product.name.toLowerCase().includes(searchLower)) || 
                                                           (product.sku && product.sku.toLowerCase().includes(searchLower)) ||
                                                           (product.noInterchange && String(product.noInterchange).toLowerCase().includes(searchLower));
                                                }"
                                                :close-on-select="true"
                                                :loading="loading"
                                                
                                                :multiple="false"
                                                :taggable="false"

                                            >
                                                <template #selection="{ option }">
                                                    <div v-if="option">
                                                        {{ option.displayName || `${option.sku} | ${option.name}` }}
                                                    </div>
                                                </template>
                                                <template #option="{ option }">
                                                    <div class="d-flex justify-content-between align-items-center w-100">
                                                        <div>
                                                            <div class="fw-bold">{{ option.displayName || `${option.sku} | ${option.name}` }}</div>
                                                            <small class="text-muted">{{ option.unit?.name || 'No Unit' }} - {{ formatRupiah(option.priceSell || 0) }}</small>
                                                        </div>
                                                    </div>
                                                </template>
                                                <template #no-options>
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
                                            <div class="border rounded p-3 bg-light bg-opacity-50">
                                                <div class="form-check mb-3">
                                                    <input class="form-check-input" type="checkbox" v-model="item.isPriceOverridden" :id="'customPriceItem' + index">
                                                    <label class="form-check-label" :for="'customPriceItem' + index">Custom Price</label>
                                                </div>
                                                <label class="form-label text-muted small mb-1">Harga</label>
                                                <input
                                                    type="text"
                                                    :value="formatRupiah(item.price)"
                                                    @input="updateItemPriceFromInput(index, $event)"
                                                    class="form-control"
                                                    placeholder="Harga"
                                                    :readonly="!item.isPriceOverridden"
                                                    :class="{ 'bg-light': !item.isPriceOverridden }"
                                                >
                                            </div>
                                        </div>
                                         <div class="col-md-3">
                                             <div class="form-floating form-floating-outline">
                                                 <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" placeholder="Subtotal" readonly>
                                                 <label>Subtotal</label>
                                             </div>
                                         </div>
                                         <div class="col-12">
                                              <div class="form-floating form-floating-outline">
                                                 <input type="text" v-model="item.description" class="form-control" placeholder="Deskripsi item">
                                                 <label>Deskripsi</label>
                                             </div>
                                             <div v-if="item.isPriceOverridden" class="mt-2">
                                               <div class="form-floating form-floating-outline">
                                                 <textarea v-model="item.priceReason" class="form-control" placeholder="Alasan custom price" rows="2"></textarea>
                                                 <label>Alasan Custom Price <span class="text-danger">*</span></label>
                                               </div>
                                             </div>
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
                                     <span class="fw-bold fs-5">Subtotal Product: {{ formatRupiah(itemsSubtotal) }}</span>
                                 </div>
                                 <div class="d-flex justify-content-end mt-2">
                                     <span class="fw-bold fs-5">Grand Total: {{ formatRupiah(grandTotal) }}</span>
                                 </div>
                             </div>
                             <div class="tab-pane fade" id="form-tabs-services" role="tabpanel">
                                 <div class="alert alert-secondary mb-4">
                                     <strong>Services:</strong> Pilih service, unit, dan quantity. Harga diisi otomatis dari master service.
                                 </div>
                                 <div v-for="(item, idx) in form.quotationServices" :key="'svc-'+idx" class="repeater-item mb-4">
                                     <div class="d-flex justify-content-between align-items-center mb-3">
                                         <span class="text-muted fw-medium">Item #{{ idx + 1 }}</span>
                                         <button class="btn btn-sm btn-outline-danger" @click.prevent="quotationStore.removeServiceItem(idx)" type="button" title="Hapus item">
                                             <i class="ri-delete-bin-line me-1"></i> Hapus
                                         </button>
                                     </div>
                                     <div class="row g-3">
                                         <div class="col-md-3">
                                             <label class="form-label text-muted">Service</label>
                                             <CustomSelect2 v-model="item.serviceId" :options="services" :get-option-label="s => s?.name ?? ''" :reduce="s => s?.id" searchable clearable placeholder="Pilih Service" @update:modelValue="onServiceChange(idx)" />
                                         </div>
                                         <div class="col-md-2">
                                             <label class="form-label text-muted">Unit</label>
                                             <CustomSelect2 v-model="item.unitId" :options="units" :get-option-label="u => u ? (u.symbol || u.name || '') : ''" :reduce="u => u?.id" searchable clearable placeholder="Unit" />
                                         </div>
                                         <div class="col-md-2">
                                            <label class="form-label text-muted">Jumlah</label>
                                            <input type="number" v-model.number="item.quantity" @input="calculateServiceSubtotal(idx)" class="form-control" placeholder="Qty" min="1" disabled>
                                         </div>
                                         <div class="col-md-3">
                                           <div class="border rounded p-3 bg-light bg-opacity-50">
                                             <div class="form-check mb-3">
                                               <input class="form-check-input" type="checkbox" v-model="item.isPriceOverridden" :id="'customPriceSvc' + idx">
                                               <label class="form-check-label" :for="'customPriceSvc' + idx">Custom Price</label>
                                             </div>
                                             <label class="form-label text-muted small mb-1">Harga</label>
                                             <input
                                               type="text"
                                               :value="formatRupiah(item.price)"
                                               @input="updateServicePriceFromInput(idx, $event)"
                                               class="form-control"
                                               placeholder="Harga"
                                               :readonly="!item.isPriceOverridden"
                                               :class="{ 'bg-light': !item.isPriceOverridden }"
                                             >
                                           </div>
                                        </div>
                                         <div class="col-md-2">
                                            <label class="form-label text-muted">Subtotal</label>
                                            <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" placeholder="Subtotal" readonly>
                                         </div>
                                         <!-- Field komponen service: terminal_kit_count, quota_priority, new_service_line, additional_data -->
                                         <div class="col-12 mt-2"><hr class="my-2"><small class="text-muted">Komponen Harga Service</small></div>
                                         <div class="col-md-3">
                                            <label class="form-label text-muted">Terminal Kit</label>
                                            <input type="text" :value="(item.terminalKitCount ?? item.terminal_kit_count) != null ? (item.terminalKitCount ?? item.terminal_kit_count) : '—'" class="form-control bg-light" readonly placeholder="Terminal Kit">
                                         </div>
                                         <div class="col-md-3">
                                            <label class="form-label text-muted">Quota Priority</label>
                                            <input type="text" :value="(item.quotaPriority ?? item.quota_priority) != null ? formatRupiah(item.quotaPriority ?? item.quota_priority) : '—'" class="form-control bg-light" readonly placeholder="Quota Priority">
                                         </div>
                                         <div class="col-md-3">
                                            <label class="form-label text-muted">New Service Line</label>
                                            <input type="text" :value="(item.newServiceLine ?? item.new_service_line) != null ? formatRupiah(item.newServiceLine ?? item.new_service_line) : '—'" class="form-control bg-light" readonly placeholder="New Service Line">
                                         </div>
                                         <div class="col-md-3">
                                            <label class="form-label text-muted">Additional Data</label>
                                            <input type="text" :value="(item.additionalData ?? item.additional_data) != null ? formatRupiah(item.additionalData ?? item.additional_data) : '—'" class="form-control bg-light" readonly placeholder="Additional Data">
                                         </div>
                                         <div v-if="item.isPriceOverridden" class="col-12 mt-2">
                                           <div class="form-floating form-floating-outline">
                                             <textarea v-model="item.priceReason" class="form-control" placeholder="Alasan custom price" rows="2"></textarea>
                                             <label>Alasan Custom Price <span class="text-danger">*</span></label>
                                           </div>
                                         </div>
                                     </div>
                                     <hr class="my-4">
                                 </div>
                                 <div class="mt-4">
                                     <button @click.prevent="quotationStore.addServiceItem()" class="btn btn-primary">Tambah Service</button>
                                 </div>
                                 <div class="d-flex justify-content-end mt-4">
                                     <span class="fw-bold fs-5">Subtotal Service: {{ formatRupiah(serviceSubtotal) }}</span>
                                 </div>
                                 <div class="d-flex justify-content-end mt-2">
                                     <span class="fw-bold fs-5">Grand Total: {{ formatRupiah(grandTotal) }}</span>
                                 </div>
                             </div>
                             <div class="tab-pane fade" id="form-tabs-did" role="tabpanel">
                                 <div v-if="form.useDidFromSiteInvest === null" class="mb-4">
                                     <p class="fw-medium mb-3">Do you want to use DID from Site Investment?</p>
                                     <div class="d-flex gap-3">
                                         <button type="button" class="btn btn-primary" :disabled="!form.siteInvestId" @click="onDidSourceChoice(true)" title="Load DIDs from selected Site Investment">
                                             Yes
                                         </button>
                                         <button type="button" class="btn btn-outline-secondary" @click="onDidSourceChoice(false)">
                                             No
                                         </button>
                                     </div>
                                     <p v-if="!form.siteInvestId" class="text-muted small mt-2 mb-0">Select a Site Investment first to use DIDs from it.</p>
                                 </div>
                                 <template v-else>
                                 <div v-if="form.useDidFromSiteInvest === true" class="alert alert-secondary mb-4">
                                     <strong>DID (Delivery/Installation):</strong> Data dari Site Investment. Bisa diedit quantity, harga, dan custom price.
                                 </div>
                                 <div v-else class="alert alert-secondary mb-4">
                                     <strong>DID (Delivery/Installation):</strong> Custom price. Isi quantity dan harga per item.
                                 </div>
                                 <div v-for="(item, idx) in form.quotationDids" :key="'did-'+idx" class="repeater-item mb-4">
                                     <div class="d-flex justify-content-between align-items-center mb-3">
                                         <span class="text-muted fw-medium">Item #{{ idx + 1 }}</span>
                                         <button class="btn btn-sm btn-outline-danger" @click.prevent="quotationStore.removeDidItem(idx)" type="button" title="Hapus item">
                                             <i class="ri-delete-bin-line me-1"></i> Hapus
                                         </button>
                                     </div>
                                     <div class="row g-3">
                                         <div class="col-md-4">
                                             <label class="form-label text-muted">Item (Price List Line)</label>
                                             <template v-if="form.useDidFromSiteInvest === false">
                                                 <CustomSelect2
                                                     v-model="item.priceListLineId"
                                                     :options="priceListLinesDid"
                                                     :get-option-label="line => line ? (line.price_list?.name || (line.did ? `${line.did.code} - ${line.did.name || ''}` : `Line #${line.id}`)) : '—'"
                                                     :reduce="line => line ? line.id : null"
                                                     placeholder="Pilih DID (dari Price List)"
                                                     searchable
                                                     clearable
                                                     @update:modelValue="onQuotationDidLineChange(idx, $event)"
                                                 />
                                             </template>
                                             <template v-else>
                                                 <input type="text" :value="getDidLineLabel(item)" class="form-control bg-light" readonly placeholder="—">
                                                 <input type="hidden" v-model="item.priceListLineId" />
                                             </template>
                                         </div>
                                         <div class="col-md-2">
                                             <label class="form-label text-muted">Qty</label>
                                             <input type="number" v-model.number="item.quantity" @input="onDidQuantityChange(idx)" class="form-control" placeholder="Qty" min="1">
                                         </div>
                                         <div class="col-md-3">
                                             <div class="border rounded p-3 bg-light bg-opacity-50">
                                                 <div class="form-check mb-3">
                                                     <input class="form-check-input" type="checkbox" v-model="item.isPriceOverridden" :id="'customPriceDid'+idx">
                                                     <label class="form-check-label" :for="'customPriceDid'+idx">Custom Price</label>
                                                 </div>
                                                 <label class="form-label text-muted small mb-1">Harga</label>
                                                 <input
                                                     type="text"
                                                     :value="formatRupiah(item.price)"
                                                     @input="updateDidPriceFromInput(idx, $event)"
                                                     class="form-control"
                                                     placeholder="Harga"
                                                     :readonly="!item.isPriceOverridden"
                                                     :class="{ 'bg-light': !item.isPriceOverridden }"
                                                 >
                                             </div>
                                         </div>
                                         <div class="col-md-2">
                                             <label class="form-label text-muted">Subtotal</label>
                                             <input type="text" :value="formatRupiah(item.subtotal)" class="form-control bg-light" readonly placeholder="Subtotal">
                                         </div>
                                     </div>
                                     <hr class="my-4">
                                 </div>
                                 <div class="mt-4">
                                    <button @click.prevent="quotationStore.addDidItem(form.useDidFromSiteInvest === false)" class="btn btn-outline-primary">Tambah DID</button>
                                 </div>
                                 <div class="d-flex justify-content-end mt-4">
                                     <span class="fw-bold fs-5">Subtotal DID: {{ formatRupiah(didsSubtotal) }}</span>
                                 </div>
                                 <div class="d-flex justify-content-end mt-2">
                                     <span class="fw-bold fs-5">Grand Total: {{ formatRupiah(grandTotal) }}</span>
                                 </div>
                                 </template>
                             </div>
                         </div>
                         <!-- Ringkasan: service_subtotal, product_subtotal, grand_total -->
                         <div class="border-top mt-4 pt-4 px-4">
                             <h6 class="text-muted mb-3">Ringkasan</h6>
                             <div class="d-flex justify-content-between py-1"><span class="text-muted">Product Subtotal</span><span class="fw-medium">{{ formatRupiah(itemsSubtotal) }}</span></div>
                             <div class="d-flex justify-content-between py-1"><span class="text-muted">Service Subtotal</span><span class="fw-medium">{{ formatRupiah(serviceSubtotal) }}</span></div>
                             <div class="d-flex justify-content-between py-1"><span class="text-muted">DID Subtotal</span><span class="fw-medium">{{ formatRupiah(didsSubtotal) }}</span></div>
                             <div class="d-flex justify-content-between py-1"><span class="text-muted">Subtotal</span><span>{{ formatRupiah(formSubtotal) }}</span></div>
                             <div class="d-flex justify-content-between py-1"><span class="text-muted">Discount ({{ form.discountPercent ?? 0 }}%)</span><span>{{ formatRupiah(formDiscountAmount) }}</span></div>
                             <div class="d-flex justify-content-between py-1"><span class="text-muted">Setelah Diskon</span><span>{{ formatRupiah(formAfterDiscount) }}</span></div>
                             <div class="d-flex justify-content-between py-1"><span class="text-muted">Pajak ({{ form.taxPercent ?? 0 }}%)</span><span>{{ formatRupiah(formTaxAmount) }}</span></div>
                             <div class="d-flex justify-content-between py-1 border-top mt-2 pt-2"><span class="fw-bold">Grand Total</span><span class="fw-bold fs-5 text-primary">{{ formatRupiah(grandTotal) }}</span></div>
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
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useQuotationStore } from '~/stores/quotation'
  import { useCustomerStore } from '~/stores/customer'
  import { useProductStore } from '~/stores/product'
  import { useServiceStore } from '~/stores/service'
  import { useUserStore } from '~/stores/user'
  import { usePermissionsStore } from '~/stores/permissions'
  import { usePermissions } from '~/composables/usePermissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
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
  const customerStore                      = useCustomerStore()
  const productStore                       = useProductStore()
  const serviceStore                       = useServiceStore()
  const userStore                          = useUserStore()

  const formatRupiah                       = useFormatRupiah()
  const { userHasPermission, userHasRole } = usePermissions();
  const permissionStore                    = usePermissionsStore()

  const { quotations, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, customerProducts, statistics } = storeToRefs(quotationStore)
  const { customers }   = storeToRefs(customerStore)
  const { products }    = storeToRefs(productStore)
  const { services }    = storeToRefs(serviceStore)
  const { user }        = storeToRefs(userStore)
  const { permissions } = storeToRefs(permissionStore)

  const siteInvests = ref([])
  const sites = ref([])
  const costCenters = ref([])
  const units = ref([])
  const priceListLinesDid = ref([])

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

  const currentPeriod = ref(12);
  const summaryRefreshKey = ref(0);

  const onPeriodChange = (newVal) => {
    currentPeriod.value = Number(newVal) || 12;
    summaryRefreshKey.value += 1;
  };

  watch(() => form.value?.minimumPeriod, (newVal) => {
    currentPeriod.value = Number(newVal) || 12;
    summaryRefreshKey.value += 1;
  }, { immediate: true });

  watch(showModal, async (visible) => {
    if (visible) {
      await nextTick();
      // Ensure all service items have billingType when modal opens
      await ensureServiceBillingTypes();
      summaryRefreshKey.value += 1;
    }
  });

  watch(() => [form.value?.siteInvestId, form.value?.customerId], () => {
    nextTick(() => { summaryRefreshKey.value += 1; });
  });

  watch(customerProducts, () => {
    if (showModal.value) nextTick(() => { summaryRefreshKey.value += 1; });
  }, { deep: true });

  watch(() => [form.value?.quotationItems?.length, form.value?.quotationServices?.length, form.value?.quotationItems, form.value?.quotationServices], () => {
    summaryRefreshKey.value += 1;
  }, { deep: true });

  function refreshModalSummary () {
    nextTick(() => { summaryRefreshKey.value += 1; });
  }

  async function ensureServiceBillingTypes () {
    if (!form.value?.quotationServices) return;
    const { $api } = useNuxtApp();
    const serviceItems = form.value.quotationServices;
    
    for (let i = 0; i < serviceItems.length; i++) {
      const item = serviceItems[i];
      if (!item.serviceId) continue;
      
      // Skip if billingType already exists and is not default
      const currentBt = (item?.billingType ?? item?.billing_type ?? '').toLowerCase();
      if (currentBt && currentBt !== 'one_time') continue;
      
      // Fetch billingType from API
      const svc = services.value?.find(s => s.id === item.serviceId);
      const servicePlanId = item.servicePlanId ?? svc?.servicePlanId ?? svc?.service_plan_id ?? null;
      
      if (!servicePlanId) continue;
      
      try {
        const params = new URLSearchParams({
          serviceId: String(item.serviceId),
          servicePlanId: String(servicePlanId),
          type: 'site_investment'
        });
        const res = await fetch(`${$api.getServicePrice()}?${params.toString()}`, {
          credentials: 'include', headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          const priceData = json?.data ?? json;
          const billingType = (priceData?.billing_type ?? priceData?.billingType ?? 'one_time') + '';
          item.billingType = billingType;
          item.billing_type = billingType;
          // Also update price if needed
          if (!item.price || item.price === 0) {
            const price = Number(priceData?.price_sell ?? priceData?.price) || 0;
            item.price = price;
            const qty = Number(item.quantity) || 0;
            item.subtotal = qty * price;
          }
        }
      } catch (e) {
        console.error('Error fetching service billing type:', e);
      }
    }
  }

  function getModalSummary () {
    summaryRefreshKey.value;
    const period = currentPeriod.value;
    const f = quotationStore.form;
    const items = f?.quotationItems || [];
    const services = f?.quotationServices || [];
    const dids = f?.quotationDids || [];
    const products = customerProducts.value || [];
    let productSub = 0;
    for (const i of items) {
      const qty = Number(i.quantity) || 0;
      const pr = Number(i.price) || 0;
      const bt = (i?.product?.billingType ?? i?.product?.billing_type ?? products.find((p) => p.id === i.productId)?.billingType ?? products.find((p) => p.id === i.productId)?.billing_type ?? 'one_time') + '';
      const isRecurring = bt.toLowerCase() === 'recurring';
      productSub += isRecurring ? qty * pr * period : qty * pr;
    }
    let serviceSub = 0;
    for (const i of services) {
      const qty = Number(i.quantity) || 0;
      const base = Number(i.price) || 0;
      const tk = Number(i?.terminalKitCount ?? i?.terminal_kit_count) || 0;
      const qp = Number(i?.quotaPriority ?? i?.quota_priority) || 0;
      const nsl = Number(i?.newServiceLine ?? i?.new_service_line) || 0;
      const ad = Number(i?.additionalData ?? i?.additional_data) || 0;
      const effectivePrice = base + tk + qp + nsl + ad;
      const bt = (i?.billingType ?? i?.billing_type ?? 'one_time') + '';
      const isRecurring = bt.toLowerCase() === 'recurring';
      serviceSub += isRecurring ? qty * effectivePrice * period : qty * effectivePrice;
    }
    let didSub = 0;
    for (const d of dids) {
      const qty = Number(d.quantity) || 0;
      const pr = Number(d.price) || 0;
      didSub += qty * pr;
    }
    const sub = productSub + serviceSub + didSub;
    const discountPct = Number(f?.discountPercent) || 0;
    const taxPct = Number(f?.taxPercent) || 0;
    const discount = sub * (discountPct / 100);
    const afterDiscount = sub - discount;
    const tax = afterDiscount * (taxPct / 100);
    const total = afterDiscount + tax;
    return { productSubtotal: productSub, serviceSubtotal: serviceSub, didSubtotal: didSub, subtotal: sub, discount, afterDiscount, tax, grandTotal: total };
  }

  const modalSummary = computed(() => getModalSummary());

  const itemsSubtotal = computed(() => modalSummary.value.productSubtotal);
  const serviceSubtotal = computed(() => modalSummary.value.serviceSubtotal);
  const didsSubtotal = computed(() => modalSummary.value.didSubtotal ?? 0);
  const formSubtotal = computed(() => modalSummary.value.subtotal);
  const formDiscountAmount = computed(() => modalSummary.value.discount);
  const formAfterDiscount = computed(() => modalSummary.value.afterDiscount);
  const formTaxAmount = computed(() => modalSummary.value.tax);
  const grandTotal = computed(() => modalSummary.value.grandTotal);

  const statusOptions = ref([
      { label: 'Draft', value: 'draft' },
      { label: 'Pending', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' },
      { label: 'Expired', value: 'expired' },
  ]);

  const termsOfPaymentOptions = ref([
      { label: 'Postpaid', value: 'postpaid' },
      { label: 'Prepaid', value: 'prepaid' },
      { label: 'Down Payment', value: 'down_payment' },
  ]);

  const minimumPeriodOptions = ref([
      { label: '12', value: '12' },
      { label: '24', value: '24' },
      { label: '36', value: '36' },
      { label: '48', value: '48' },
      { label: '60', value: '60' },
  ]);

  const fetchSiteInvests = async () => {
    const { $api } = useNuxtApp();
    try {
      const r = await fetch(`${$api.siteInvestment()}?page=1&rows=500&status=approved`, { headers: { 'Accept': 'application/json' }, credentials: 'include' });
      if (r.ok) { const j = await r.json(); siteInvests.value = j.data || []; }
    } catch (e) { console.error('fetchSiteInvests', e); }
  };
  const fetchSites = async () => {
    const { $api } = useNuxtApp();
    try {
      const r = await fetch(`${$api.sites()}?page=1&rows=500`, { headers: { 'Accept': 'application/json' }, credentials: 'include' });
      if (r.ok) { const j = await r.json(); sites.value = j.data || []; }
    } catch (e) { console.error('fetchSites', e); }
  };
  const fetchCostCenters = async () => {
    const { $api } = useNuxtApp();
    try {
      const r = await fetch(`${$api.costCenters()}?page=1&rows=500`, { headers: { 'Accept': 'application/json' }, credentials: 'include' });
      if (r.ok) { const j = await r.json(); costCenters.value = j.data || []; }
    } catch (e) { console.error('fetchCostCenters', e); }
  };
  const fetchUnits = async () => {
    const { $api } = useNuxtApp();
    try {
      const r = await fetch($api.unit(), { headers: { 'Accept': 'application/json' }, credentials: 'include' });
      if (r.ok) { const j = await r.json(); units.value = j.data || j || []; }
    } catch (e) { console.error('fetchUnits', e); }
  };

  const fetchPriceListLinesDid = async () => {
    const { $api } = useNuxtApp();
    try {
      const r = await fetch($api.siteInvestmentPriceListLines('did'), { headers: { 'Accept': 'application/json' }, credentials: 'include' });
      if (r.ok) { const j = await r.json(); priceListLinesDid.value = Array.isArray(j) ? j : (j.data || j || []); }
    } catch (e) { console.error('fetchPriceListLinesDid', e); }
  };

  watch(showModal, (v) => {
    if (v) fetchPriceListLinesDid();
  });

  let modalInstance = null;
  onMounted(() => {
      
      quotationStore.fetchQuotations();
      quotationStore.fetchStatistics();
      customerStore.fetchCustomers();
      productStore.fetchProducts();
      serviceStore.fetchServices();
      userStore.loadUser();
      permissionStore.fetchPermissions();
      fetchSiteInvests();
      fetchSites();
      fetchCostCenters();
      fetchUnits();
      
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
          // Saat edit: prepend opsi dari relasi ke daftar Select2 agar nilai terpilih bisa tampil (pakai == agar tipe number/string tidak masalah)
          nextTick(() => {
              nextTick(() => {
                  if (!isEditMode.value || !form.value) return
                  const sid = form.value.siteInvestId ?? form.value.siteInvest?.id
                  if (sid != null && !siteInvests.value.some(s => (s.id ?? s) == sid)) {
                      const obj = (typeof form.value.siteInvest === 'object' && form.value.siteInvest)
                          ? { ...form.value.siteInvest, id: sid } : { id: sid, siNumber: '-', name: '-' }
                      siteInvests.value = [obj, ...siteInvests.value]
                  }
                  const siteId = form.value.siteId ?? form.value.site?.id
                  if (siteId != null && !sites.value.some(s => (s.id ?? s) == siteId)) {
                      const obj = (typeof form.value.site === 'object' && form.value.site)
                          ? { ...form.value.site, id: siteId } : { id: siteId, code: '-', name: '-' }
                      sites.value = [obj, ...sites.value]
                  }
                  const ccId = form.value.costCenterId ?? form.value.costCenter?.id
                  if (ccId != null && !costCenters.value.some(c => (c.id ?? c) == ccId)) {
                      const obj = (typeof form.value.costCenter === 'object' && form.value.costCenter)
                          ? { ...form.value.costCenter, id: ccId } : { id: ccId, code: '-', name: '-' }
                      costCenters.value = [obj, ...costCenters.value]
                  }
                  const cid = form.value.customerId ?? form.value.customer?.id
                  if (cid != null && !(customers.value || []).some(c => (c.id ?? c) == cid)) {
                      const obj = (typeof form.value.customer === 'object' && form.value.customer)
                          ? { ...form.value.customer, id: cid } : { id: cid, name: '-' }
                      customers.value = [obj, ...(customers.value || [])]
                  }
              })
          })
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

  // Watcher untuk customerId - fetch products untuk customer yang dipilih
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
    const file = e.target?.files?.[0];
    if (file) {
      form.value.attachment = file;
      attachmentPreview.value = URL.createObjectURL(file);
    } else {
      form.value.attachment = null;
      attachmentPreview.value = null;
    }
    e.target.value = '';
  }

  const onSiteInvestChange = async (siteInvestId) => {
    if (!form.value) return;
    if (!siteInvestId) {
      form.value.customerId = null;
      form.value.siteId = null;
      form.value.costCenterId = null;
      // Reset products, services, dan DIDs jika Site Investment dihapus
      if (!isEditMode.value) {
        form.value.quotationItems = [];
        form.value.quotationServices = [];
        form.value.quotationDids = [];
        form.value.useDidFromSiteInvest = null;
        quotationStore.addItem();
        quotationStore.addServiceItem();
      }
      return;
    }
    const si = siteInvests.value.find(s => s.id === siteInvestId);
    if (si) {
      const cid = si.customerId ?? si.customer_id;
      const sid = si.siteId ?? si.site_id;
      if (cid != null) form.value.customerId = cid;
      if (sid != null) {
        form.value.siteId = sid;
        // Auto-fill Cost Center berdasarkan relasi Site -> CostCenter
        const relatedSite = sites.value.find(s => (s.id ?? s.siteId ?? s.site_id) === sid);
        if (relatedSite) {
          const ccId = relatedSite.costCenterId ?? relatedSite.cost_center_id;
          if (ccId != null) {
            form.value.costCenterId = ccId;
          }
        }
      }
      
      // ✅ NEW: Autofill products dan services dari Site Investment (hanya untuk create mode)
      if (!isEditMode.value) {
        try {
          const { $api } = useNuxtApp();
          const toast = useToast();
          
          // Ambil detail Site Investment dengan materials dan services
          const response = await fetch(`${$api.siteInvestment()}/${siteInvestId}`, {
            headers: {
              'Accept': 'application/json',
            },
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Gagal mengambil data Site Investment');
          }
          
          const result = await response.json();
          const siteInvestData = result.data;
          
          if (siteInvestData) {
            // Tunggu customer products ter-load dulu jika ada customerId
            if (cid) {
              await quotationStore.fetchProductsForCustomer(cid);
              // Tunggu sebentar agar customerProducts sudah ter-load
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Autofill Products dari siteInvestMaterials (setelah refactor: product ada di priceListLine.product)
            if (siteInvestData.siteInvestMaterials && siteInvestData.siteInvestMaterials.length > 0) {
              // Tambahkan products dari Site Investment ke customerProducts agar bisa dipilih di dropdown
              siteInvestData.siteInvestMaterials.forEach((material) => {
                const product = material.priceListLine?.product || material.product || {};
                const productId = product.id ?? material.priceListLine?.priceable_id ?? material.productId;
                if (productId && !quotationStore.customerProducts.some((cp) => cp.id === productId)) {
                  quotationStore.customerProducts.push({
                    id: productId,
                    sku: product.sku || product.SKU || '',
                    name: product.name || '',
                    noInterchange: product.noInterchange || product.no_interchange || '',
                    unit: product.unit || undefined,
                    priceSell: product.priceSell || product.price_sell || material.price || 0,
                  });
                }
              });
              
              const validMaterials = siteInvestData.siteInvestMaterials;
              
              if (validMaterials.length > 0) {
                // ✅ PERBAIKAN: Fetch price dan billing_type untuk semua produk dari price list
                const productPromises = validMaterials.map(async (material) => {
                  const product = material.priceListLine?.product || material.product || {};
                  const productId = product.id ?? material.priceListLine?.priceable_id ?? material.productId;
                  const quantity = Number(material.quantity) || 1;
                  
                  // Fetch price dan billing_type dari price list untuk site_investment (skip jika productId tidak ada)
                  let price = Number(material.price) || 0;
                  let billingType = 'one_time';
                  
                  try {
                    if (!productId) {
                      return {
                        productId: null,
                        quantity,
                        price,
                        subtotal: quantity * price,
                        description: material.description || '',
                        billingType,
                        billing_type: billingType,
                      };
                    }
                    const params = new URLSearchParams({
                      productId: String(productId),
                      type: 'site_investment'
                    });
                    const res = await fetch(`${$api.getProductPrice()}?${params.toString()}`, {
                      credentials: 'include', 
                      headers: { Accept: 'application/json' },
                    });
                    
                    if (res.ok) {
                      const priceData = await res.json();
                      const fetchedPrice = Number(priceData.price_sell) || 0;
                      const fetchedBillingType = (priceData.billing_type ?? priceData.billingType ?? 'one_time') + '';
                      
                      if (fetchedPrice > 0) {
                        price = fetchedPrice;
                      } else {
                        // Fallback ke price dari material atau customerProduct
                        if (cid && quotationStore.customerProducts.length > 0) {
                          const customerProduct = quotationStore.customerProducts.find((cp) => cp.id === productId);
                          if (customerProduct && customerProduct.priceSell) {
                            price = Number(customerProduct.priceSell) || price;
                          }
                        } else {
                          price = Number(product.priceSell) || price;
                        }
                      }
                      billingType = fetchedBillingType;
                    } else {
                      // Fallback ke price dari material atau customerProduct
                      if (cid && quotationStore.customerProducts.length > 0) {
                        const customerProduct = quotationStore.customerProducts.find((cp) => cp.id === productId);
                        if (customerProduct && customerProduct.priceSell) {
                          price = Number(customerProduct.priceSell) || price;
                        }
                      } else {
                        price = Number(product.priceSell) || price;
                      }
                    }
                  } catch (e) {
                    console.error('Error fetching product price for autofill:', e);
                    // Fallback ke price dari material atau customerProduct
                    if (cid && quotationStore.customerProducts.length > 0) {
                      const customerProduct = quotationStore.customerProducts.find((cp) => cp.id === productId);
                      if (customerProduct && customerProduct.priceSell) {
                        price = Number(customerProduct.priceSell) || price;
                      }
                    } else {
                      price = Number(product.priceSell) || price;
                    }
                  }
                  
                  return {
                    productId: productId,
                    quantity: quantity,
                    price: price,
                    subtotal: quantity * price,
                    description: material.description || '',
                    billingType: billingType,
                    billing_type: billingType,
                    product: {
                      ...product,
                      billingType: billingType,
                      billing_type: billingType,
                    }
                  };
                });
                
                // Tunggu semua fetch selesai; buang item yang productId-nya tidak ada (material tanpa product)
                const resolved = await Promise.all(productPromises);
                form.value.quotationItems = resolved.filter((item) => item.productId != null);
              } else {
                // Jika tidak ada material yang valid untuk customer, reset ke satu item kosong
                form.value.quotationItems = [];
                quotationStore.addItem();
              }
              
              // Jika tidak ada item setelah filter, tambahkan satu item kosong
              if (form.value.quotationItems.length === 0) {
                quotationStore.addItem();
              }
            } else {
              // Jika tidak ada materials, reset ke satu item kosong
              form.value.quotationItems = [];
              quotationStore.addItem();
            }
            
            // Autofill Services dari siteInvestServices (setelah refactor: service ada di priceListLine.service)
            if (siteInvestData.siteInvestServices && siteInvestData.siteInvestServices.length > 0) {
              // Tambahkan service dari SI ke opsi dropdown agar bisa ditampilkan (support snake_case & camelCase dari API)
              siteInvestData.siteInvestServices.forEach((service) => {
                const svc = service.priceListLine?.service || service.service || {};
                const serviceId = svc.id ?? service.priceListLine?.priceable_id ?? service.priceListLine?.priceableId ?? service.serviceId;
                if (serviceId && !serviceStore.services.some((s) => (s.id ?? s) === serviceId)) {
                  serviceStore.services.push({
                    id: serviceId,
                    name: svc.name || '',
                    code: svc.code || '',
                    period: 0,
                    servicePlanId: svc.servicePlanId ?? svc.service_plan_id ?? 0,
                    description: '',
                    createdBy: 0,
                    updatedAt: '',
                    createdAt: '',
                  });
                }
              });

              const servicePromises = siteInvestData.siteInvestServices.map(async (service) => {
                const svc = service.priceListLine?.service || service.service || {};
                const unit = service.unit || {};
                const serviceId = svc.id ?? service.priceListLine?.priceable_id ?? service.priceListLine?.priceableId ?? service.serviceId;
                const unitId = unit.id || service.unitId;
                const quantity = Number(service.quantity) || 1;
                const servicePlanId = svc.servicePlanId ?? svc.service_plan_id ?? service.servicePlanId ?? service.service_plan_id ?? null;
                
                let price = Number(service.price) || Number(svc.price) || 0;
                let billingType = (service.priceListLine?.billing_type ?? service.billing_type ?? 'one_time') + '';
                
                try {
                  if (serviceId && servicePlanId) {
                    const params = new URLSearchParams({
                      serviceId: String(serviceId),
                      servicePlanId: String(servicePlanId),
                      type: 'site_investment'
                    });
                    const res = await fetch(`${$api.getServicePrice()}?${params.toString()}`, {
                      credentials: 'include', 
                      headers: { Accept: 'application/json' },
                    });
                    
                    if (res.ok) {
                      const json = await res.json();
                      const priceData = json?.data ?? json;
                      const fetchedPrice = Number(priceData?.price_sell ?? priceData?.price) || 0;
                      const fetchedBillingType = (priceData?.billing_type ?? priceData?.billingType ?? 'one_time') + '';
                      
                      if (fetchedPrice > 0) {
                        price = fetchedPrice;
                      }
                      billingType = fetchedBillingType;
                    }
                  }
                } catch (e) {
                  console.error('Error fetching service price for autofill:', e);
                }

                const terminalKitCount = service.terminalKitCount ?? service.terminal_kit_count;
                const quotaPriority = service.quotaPriority ?? service.quota_priority;
                const newServiceLine = service.newServiceLine ?? service.new_service_line;
                const additionalData = service.additionalData ?? service.additional_data;

                return {
                  unitId: unitId,
                  serviceId: serviceId,
                  servicePlanId: servicePlanId,
                  quantity: quantity,
                  price: price,
                  subtotal: quantity * price,
                  billingType: billingType,
                  billing_type: billingType,
                  terminalKitCount: terminalKitCount != null ? Number(terminalKitCount) : null,
                  quotaPriority: quotaPriority != null ? Number(quotaPriority) : null,
                  newServiceLine: newServiceLine != null ? Number(newServiceLine) : null,
                  additionalData: additionalData != null ? Number(additionalData) : null,
                };
              });
              
              // Tunggu semua fetch selesai; buang item yang serviceId-nya tidak ada
              const resolvedServices = await Promise.all(servicePromises);
              form.value.quotationServices = resolvedServices.filter((item) => item.serviceId != null);
              form.value.quotationServices.forEach((_, idx) => calculateServiceSubtotal(idx));
              
              if (form.value.quotationServices.length === 0) {
                quotationStore.addServiceItem();
              }
            } else {
              form.value.quotationServices = [];
              quotationStore.addServiceItem();
            }

            // DIDs tidak di-autofill; user memilih di tab DID: "Do you want to use DID from Site Investment?"
            
            const productCount = form.value.quotationItems.filter((item) => item.productId).length;
            const serviceCount = form.value.quotationServices.filter((item) => item.serviceId).length;
            
            if (productCount > 0 || serviceCount > 0) {
              const parts = [];
              if (productCount > 0) parts.push(`${productCount} produk`);
              if (serviceCount > 0) parts.push(`${serviceCount} service`);
              toast.success({
                title: 'Berhasil',
                message: `Berhasil autofill ${parts.join(', ')} dari Site Investment. Pilih opsi DID di tab DID (Delivery/Installation).`,
                color: 'green',
                position: 'topRight',
                layout: 2,
              });
            } else {
              toast.warning({
                title: 'Peringatan',
                message: 'Site Investment tidak memiliki produk atau service yang valid untuk customer yang dipilih.',
                color: 'orange',
                position: 'topRight',
                layout: 2,
              });
            }
          }
        } catch (error) {
          console.error('Error autofill dari Site Investment:', error);
          const toast = useToast();
          toast.error({
            title: 'Error',
            message: 'Gagal mengambil data Site Investment untuk autofill',
            color: 'red',
            position: 'topRight',
            layout: 2,
          });
        }
      }
    }
  };

  const onProductChange = (index) => {
    if (!form.value || !form.value.quotationItems) return;
    const selectedProductId = form.value.quotationItems[index].productId;
    const item = form.value.quotationItems[index];
    if (!selectedProductId) {
      item.price = 0;
      item.isPriceOverridden = false;
      item.priceReason = '';
      calculateSubtotal(index);
      refreshModalSummary();
      return;
    }
    const { $api } = useNuxtApp();
    // Fetch price from backend price list
    (async () => {
      try {
        const params = new URLSearchParams({
          productId: String(selectedProductId),
          type: 'site_investment'
        });
        const res = await fetch(`${$api.getProductPrice()}?${params.toString()}`, {
          credentials: 'include', headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const priceData = await res.json();
          item.price = Number(priceData.price_sell) || 0;
          // ✅ PERBAIKAN: Set billing_type dari price list
          const billingType = (priceData?.billing_type ?? priceData?.billingType ?? 'one_time') + '';
          item.billingType = billingType;
          item.billing_type = billingType;
          if (!item.product) item.product = {};
          item.product.billingType = billingType;
          item.product.billing_type = billingType;
          item.isPriceOverridden = false;
          item.priceReason = '';
        } else {
          // fallback to customer product price if available
          const sel = customerProducts.value.find(p => p.id === selectedProductId);
          item.price = sel ? Number(sel.priceSell) || 0 : 0;
          item.isPriceOverridden = item.price === 0;
        }
      } catch (e) {
        console.error('Error fetching product price:', e);
        const sel = customerProducts.value.find(p => p.id === selectedProductId);
        item.price = sel ? Number(sel.priceSell) || 0 : 0;
        item.isPriceOverridden = item.price === 0;
      } finally {
        calculateSubtotal(index);
        refreshModalSummary();
      }
    })();
  };

  const onServiceChange = (index) => {
    if (!form.value?.quotationServices || !services.value) return;
    const item = form.value.quotationServices[index];
    const svc = services.value.find(s => s.id === item.serviceId);
    if (!svc) {
      item.price = 0;
      item.isPriceOverridden = false;
      item.priceReason = '';
      calculateServiceSubtotal(index);
      refreshModalSummary();
      return;
    }
    const servicePlanId = svc.servicePlanId || svc.service_plan_id || null;
    // Simpan servicePlanId ke item secara tersembunyi agar bisa disimpan ke DB,
    // namun jangan tampilkan inputnya di UI.
    item.servicePlanId = servicePlanId;
    const { $api } = useNuxtApp();
    (async () => {
      try {
        if (!servicePlanId) {
          // Jika tidak ada servicePlanId, fallback ke harga dasar service
          item.price = Number(svc.price) || 0;
          item.isPriceOverridden = item.price === 0;
          calculateServiceSubtotal(index);
          refreshModalSummary();
          return;
        }
        const params = new URLSearchParams({
          serviceId: String(item.serviceId),
          servicePlanId: String(servicePlanId),
          type: 'site_investment'
        });
        const res = await fetch(`${$api.getServicePrice()}?${params.toString()}`, {
          credentials: 'include', headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          const priceData = json?.data ?? json;
          const price = Number(priceData?.price_sell ?? priceData?.price) || 0;
          const billingType = (priceData?.billing_type ?? priceData?.billingType ?? 'one_time') + '';
          item.price = price;
          item.billingType = billingType;
          item.billing_type = billingType;
          item.isPriceOverridden = false;
          item.priceReason = '';
        } else {
          item.price = 0;
          item.isPriceOverridden = true;
        }
      } catch (e) {
        console.error('Error fetching service price:', e);
        item.price = 0;
        item.isPriceOverridden = true;
      } finally {
        calculateServiceSubtotal(index);
        refreshModalSummary();
      }
    })();
  };

  /** Harga efektif per service = price + terminal_kit_count + quota_priority + new_service_line + additional_data */
  const getServiceEffectivePrice = (item) => {
    const base = Number(item?.price) || 0;
    const tk = Number(item?.terminalKitCount ?? item?.terminal_kit_count) || 0;
    const qp = Number(item?.quotaPriority ?? item?.quota_priority) || 0;
    const nsl = Number(item?.newServiceLine ?? item?.new_service_line) || 0;
    const ad = Number(item?.additionalData ?? item?.additional_data) || 0;
    return base + tk + qp + nsl + ad;
  };

  const calculateServiceSubtotal = (index) => {
    if (!form.value?.quotationServices) return;
    const item = form.value.quotationServices[index];
    const q = Number(item.quantity) || 0;
    const effectivePrice = getServiceEffectivePrice(item);
    item.subtotal = q * effectivePrice;
  };

  // ✅ IMPROVED: Computed property untuk filtered customer products tanpa limit
  const filteredCustomerProducts = computed(() => {
    if (!customerProducts.value || !Array.isArray(customerProducts.value)) {
      return [];
    }
    
    // Tambahkan displayName untuk pencarian yang lebih baik
    return customerProducts.value.map(product => {
      const displayName = `${product.sku || ''} | ${product.name || ''}${product.noInterchange ? ' | ' + product.noInterchange : ''}`
      return {
        ...product,
        displayName
      }
    });
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

  const parseRupiahToNumber = (rupiahString) => {
    if (!rupiahString) return 0
    return Number(String(rupiahString).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0
  }

  const updateItemPriceFromInput = (index, event) => {
    const numericValue = parseRupiahToNumber(event.target?.value || '')
    if (form.value.quotationItems && form.value.quotationItems[index]) {
      form.value.quotationItems[index].price = Math.round(numericValue)
      calculateSubtotal(index)
    }
  }

  const updateServicePriceFromInput = (index, event) => {
    const numericValue = parseRupiahToNumber(event.target?.value || '')
    if (form.value.quotationServices && form.value.quotationServices[index]) {
      form.value.quotationServices[index].price = Math.round(numericValue)
      calculateServiceSubtotal(index)
    }
  }

  const getDidLineLabel = (item) => {
    if (!item) return '—'
    const pl = item.priceListLine || item.price_list_line
    if (!pl) return item.priceListLineId ? `Line #${item.priceListLineId}` : 'Custom'
    const name = pl.price_list?.name || pl.priceList?.name
    const did = pl.did
    const code = did ? (did.code ?? did.name) : (pl.product?.name || pl.service?.name)
    if (code || name) return [name, code].filter(Boolean).join(' - ')
    return `Line #${pl.id ?? item.priceListLineId}`
  }

  const onDidQuantityChange = (idx) => {
    if (!form.value?.quotationDids?.[idx]) return
    const item = form.value.quotationDids[idx]
    const q = Number(item.quantity) || 1
    const p = Number(item.price) || 0
    item.subtotal = q * p
  }

  const updateDidPriceFromInput = (idx, event) => {
    const numericValue = parseRupiahToNumber(event.target?.value || '')
    if (form.value?.quotationDids?.[idx]) {
      form.value.quotationDids[idx].price = Math.round(numericValue)
      onDidQuantityChange(idx)
    }
  }

  const onQuotationDidLineChange = (idx, lineId) => {
    const line = priceListLinesDid.value.find((l) => l.id === lineId);
    if (!line || !form.value?.quotationDids?.[idx]) return;
    const item = form.value.quotationDids[idx];
    item.price = Number(line.price) || 0;
    item.quantity = Number(line.quantity) || 1;
    item.priceListLine = line;
    item.subtotal = (Number(item.quantity) || 1) * (Number(item.price) || 0);
  };

  const onDidSourceChoice = async (useFromSiteInvest) => {
    quotationStore.setUseDidFromSiteInvest(useFromSiteInvest)
    if (useFromSiteInvest && form.value?.siteInvestId) {
      const toast = useToast()
      try {
        const { $api } = useNuxtApp()
        const response = await fetch(`${$api.siteInvestment()}/${form.value.siteInvestId}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Failed to load Site Investment')
        const result = await response.json()
        const siteInvestData = result.data
        if (siteInvestData?.siteInvestDids?.length) {
          quotationStore.setQuotationDidsFromSiteInvest(siteInvestData.siteInvestDids)
        } else {
          quotationStore.setQuotationDidsFromSiteInvest([])
        }
      } catch (e) {
        console.error('onDidSourceChoice', e)
        toast.error({ title: 'Error', message: 'Failed to load DIDs from Site Investment.', position: 'topRight', layout: 2 })
      }
    }
  }

  const viewQuotationDetails = (quotationId) => {
      if (!quotationId) {
          return;
      }
      navigateTo(`/sales/quotation/detail/${quotationId}`);
  };

  const { getStatusBadge: _getStatusBadge, getApprovalStepJabatan } = useApprovalStatus();
  const getStatusBadge = (row) => _getStatusBadge(row, {
      draft: { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' },
      pending: { text: 'Pending', class: 'badge rounded-pill bg-label-warning' },
      approved: { text: 'Approved', class: 'badge rounded-pill bg-label-success' },
      rejected: { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' },
      expired: { text: 'Expired', class: 'badge rounded-pill bg-label-dark' },
  });

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
    keywords: 'Quotation, Sales, Kainnova Digital Solutions',
    author: 'Kainnova Digital Solutions',
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
