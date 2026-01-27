<template>
    <div class="page-wrapper">
        <div class="content-wrapper">
            <!-- Loading Overlay -->
            <div v-if="isInitialLoading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">Memuat data Site Investment...</p>
                </div>
            </div>

            <!-- Content -->
            <div v-else class="container-xxl flex-grow-1 container-p-y">
                <h4 class="mb-1">Site Investment</h4>
                <p class="mb-6">List site investment yang terdaftar di sistem</p>

                <!-- Statistics Cards -->
                <div class="row g-6 mb-6">
                    <div class="col-xl-3 col-lg-6 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Total Site Investment</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-primary">
                                            <i class="ri-building-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.total || 0 }}</h5>
                                        <span class="text-muted">Site Investment terdaftar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Draft</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-secondary">
                                            <i class="ri-draft-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.draft || 0 }}</h5>
                                        <span class="text-muted">Draft</span>
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
                                        <h5 class="mb-1">{{ stats.pending || 0 }}</h5>
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
                                    <p class="mb-0">Approved</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-success">
                                            <i class="ri-checkbox-circle-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.approved || 0 }}</h5>
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
                                    <p class="mb-0">Rejected</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-danger">
                                            <i class="ri-close-circle-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.rejected || 0 }}</h5>
                                        <span class="text-muted">Rejected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Expired</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-secondary">
                                            <i class="ri-pass-expired-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.expired || 0 }}</h5>
                                        <span class="text-muted">Expired</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="row g-6">
                    <div class="col-12">
                        <h4 class="mt-6 mb-1">Filter Site Investment</h4>
                        <p class="mb-0">Temukan semua site investment perusahaan Anda</p>
                    </div>
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label text-muted mb-2">Filter Customer</label>
                                        <CustomSelect2
                                            v-model="filters.customerId"
                                            :options="customers"
                                            :get-option-label="c => c.name"
                                            :reduce="c => c.id"
                                            placeholder="Pilih Customer"
                                            searchable
                                            clearable
                                            :loading="customerStore.loading"
                                            loading-text="Memuat customer..."
                                        />
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label text-muted mb-2">Filter Status</label>
                                        <CustomSelect2
                                            v-model="filters.status"
                                            :options="statusOptions"
                                            :get-option-label="option => option.label"
                                            :reduce="option => option.value"
                                            placeholder="Pilih Status"
                                            searchable
                                            clearable
                                        />
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label text-muted mb-2">Filter Priority</label>
                                        <CustomSelect2
                                            v-model="filters.priority"
                                            :options="priorityOptions"
                                            :get-option-label="option => option.label"
                                            :reduce="option => option.value"
                                            placeholder="Pilih Priority"
                                            searchable
                                            clearable
                                        />
                                    </div>
                                </div>
                                <div class="row mt-3">
                                    <div class="col-md-4 mb-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="filters.startDate" class="form-control" placeholder="Tanggal Mulai" @change="onDateChange">
                                            <label>Tanggal Mulai</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="filters.endDate" class="form-control" placeholder="Tanggal Akhir" @change="onDateChange">
                                            <label>Tanggal Akhir</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3 reset-filter-button">
                                        <button @click="clearDateFilters" class="btn btn-outline-secondary me-2">
                                            <i class="ri-refresh-line me-1"></i> Reset Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="col-12">
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
                                        v-if="userHasRole('superadmin') || userHasPermission('create_site_investment')"
                                        @click="siteInvestStore.openModal(null)"
                                        class="btn btn-primary"
                                    >
                                        <i class="ri-add-line me-1"></i>
                                        Tambah Site Investment
                                    </button>
                                    <button @click="exportData('csv')" class="btn btn-outline-secondary" :disabled="loading">
                                        <i class="ri-download-line me-1"></i>
                                        Export
                                    </button>
                                    <span class="p-input-icon-left">
                                        <InputText
                                            v-model="globalFilterValue"
                                            placeholder="Cari Site Investment..."
                                            class="w-full md:w-20rem"
                                        />
                                    </span>
                                </div>
                            </div>
                            <div class="card-datatable table-responsive py-3 px-3">
                                <MyDataTable
                                    ref="myDataTableRef"
                                    :data="siteInvests"
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
                                    <Column field="siNumber" header="SI Number" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <a 
                                                @click="navigateTo(`/sales/site-investment/detail/${slotProps.data.id}`)" 
                                                style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                                title="View detail"
                                                class="text-primary"
                                            >
                                                {{ slotProps.data.siNumber || '-' }}
                                            </a>
                                        </template>
                                    </Column>
                                    <Column field="name" header="Project Name" :sortable="true" class="text-nowrap"></Column>
                                    <Column field="customer.name" header="Customer" :sortable="true" class="text-nowrap fw-semibold"></Column>
                                    <Column field="location" header="Lokasi" :sortable="true"></Column>
                                    <Column field="businessScheme.name" header="Skema" :sortable="true" class="text-nowrap fw-semibold"></Column>
                                    <Column field="priority" header="Priority" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getPriorityBadge(slotProps.data.priority).class">
                                                {{ getPriorityBadge(slotProps.data.priority).text }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="status" header="Status" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadge(slotProps.data.status).class">
                                                {{ getStatusBadge(slotProps.data.status).text }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="grandTotal" header="Total Investment" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ formatRupiah(slotProps.data.grandTotal) }}
                                        </template>
                                    </Column>
                                    <Column field="siDate" header="Tanggal" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.siDate ? new Date(slotProps.data.siDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="attachment" header="Attachment" :sortable="false">
                                        <template #body="slotProps">
                                            <a v-if="slotProps.data.attachment" :href="getAttachmentUrl(slotProps.data.attachment)" target="_blank" rel="noopener noreferrer" download class="badge rounded-pill bg-label-primary" style="text-decoration: none;">
                                                <i class="ri-attachment-2 me-1"></i> File
                                            </a>
                                            <span v-else class="text-muted">—</span>
                                        </template>
                                    </Column>
                                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                                        <template #body="slotProps">
                                            <div class="dropdown d-inline-block">
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'>
                                                    <i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu dropdown-menu-end si-actions-dropdown">
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('edit_site_investment')) && slotProps.data.status === 'draft'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="siteInvestStore.submitSiteInvest(slotProps.data.id)">
                                                            <i class="ri-send-plane-line me-2"></i> Submit SI
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('approve_site_investment')) && slotProps.data.status === 'pending'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="siteInvestStore.approveSiteInvest(slotProps.data.id)">
                                                            <i class="ri-check-line me-2"></i> Approve
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('reject_site_investment')) && slotProps.data.status === 'pending'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="siteInvestStore.rejectSiteInvest(slotProps.data.id)">
                                                            <i class="ri-close-line me-2"></i> Reject
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || userHasPermission('edit_site_investment')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="siteInvestStore.openModal(slotProps.data)">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('delete_site_investment'))">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="siteInvestStore.deleteSiteInvest(slotProps.data.id)">
                                                            <i class="ri-delete-bin-7-line me-2"></i> Hapus
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </template>
                                    </Column>
                                </MyDataTable>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal -->
                <Modal
                    id="SiteInvestmentModal"
                    :title="modalTitle"
                    :description="modalDescription"
                    :validation-errors-from-parent="validationErrors"
                    class="modal-xl"
                >
                    <template #default>
                        <form @submit.prevent="handleSubmit" novalidate>
                            <div class="row">
                                <div class="col">
                                    <ul class="nav nav-tabs" role="tablist">
                                        <li class="nav-item">
                                            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#form-tabs-info" role="tab" aria-selected="true" type="button">
                                                <span class="ri-information-line ri-20px d-sm-none"></span>
                                                <span class="d-none d-sm-block">Informasi</span>
                                            </button>
                                        </li>
                                        <li class="nav-item">
                                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-materials" role="tab" aria-selected="false" type="button">
                                                <span class="ri-box-line ri-20px d-sm-none"></span>
                                                <span class="d-none d-sm-block">Material/Product</span>
                                            </button>
                                        </li>
                                        <li class="nav-item">
                                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-services" role="tab" aria-selected="false" type="button">
                                                <span class="ri-service-line ri-20px d-sm-none"></span>
                                                <span class="d-none d-sm-block">Services</span>
                                            </button>
                                        </li>
                                        <li class="nav-item">
                                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-dids" role="tab" aria-selected="false" type="button">
                                                <span class="ri-truck-line ri-20px d-sm-none"></span>
                                                <span class="d-none d-sm-block">DID (Delivery/Installation)</span>
                                            </button>
                                        </li>
                                        <li class="nav-item">
                                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-budgets" role="tab" aria-selected="false" type="button">
                                                <span class="ri-money-dollar-circle-line ri-20px d-sm-none"></span>
                                                <span class="d-none d-sm-block">Budget</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div class="tab-content pt-6">
                                <!-- Tab Info -->
                                <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
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
                                                :get-option-label="c => c.name"
                                                :reduce="c => c.id"
                                                placeholder="Pilih Customer"
                                                searchable
                                                clearable
                                            />
                                        </div>
                                        <div class="col-md-6">
                                            <CustomSelect2
                                                v-model="form.siteId"
                                                :options="sites"
                                                :get-option-label="s => (s.code || '') + ' - ' + (s.name || '')"
                                                :reduce="s => s.id"
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
                                                :get-option-label="b => (b.code || '') + ' - ' + (b.name || '')"
                                                :reduce="b => b.id"
                                                placeholder="Pilih Business Scheme"
                                                searchable
                                                clearable
                                            />
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
                                                :get-option-label="option => option.label"
                                                :reduce="option => option.value"
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
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" v-model="form.lat" class="form-control" placeholder="Latitude">
                                                <label>Latitude</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" v-model="form.long" class="form-control" placeholder="Longitude">
                                                <label>Longitude</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <textarea v-model="form.notes" class="form-control" placeholder="Catatan" rows="3"></textarea>
                                                <label>Notes</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
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
                                                    <img v-if="isImageFile(form.attachment?.name || form.attachmentPreview)" :src="form.attachmentPreview" alt="Preview" class="attachment-preview" style="height: 60px; max-width: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;">
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

                                                    <div class="investment-summary-row investment-summary-row-contingency">
                                                        <span class="investment-summary-label d-flex align-items-center gap-2">
                                                            Contingency
                                                            <input
                                                                type="text"
                                                                :value="formatForDisplay(form.contingencyPercent)"
                                                                class="form-control form-control-sm contingency-input"
                                                                placeholder="10"
                                                                @input="onContingencyPercentInput"
                                                                @blur="onContingencyPercentBlur"
                                                            >
                                                            <span class="text-muted">%</span>
                                                        </span>
                                                        <span class="investment-summary-value">{{ formatRupiah(contingencyAmount) }}</span>
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
                                <div class="tab-pane fade" id="form-tabs-materials" role="tabpanel">
                                    <div v-for="(item, index) in form.siteInvestMaterials" :key="index" class="repeater-item mb-4">
                                        <div class="row g-3">
                                            <div class="col-md-3">
                                                <CustomSelect2
                                                    v-model="item.warehouseId"
                                                    :options="warehouses"
                                                    :get-option-label="w => `${w.code} - ${w.name}`"
                                                    :reduce="w => w.id"
                                                    placeholder="Pilih Gudang"
                                                    searchable
                                                    clearable
                                                />
                                            </div>
                                            <div class="col-md-3">
                                                <CustomSelect2
                                                    v-model="item.productId"
                                                    :options="products"
                                                    :get-option-label="p => `${p.name} (${p.sku})`"
                                                    :reduce="p => p.id"
                                                    placeholder="Pilih Product"
                                                    searchable
                                                    clearable
                                                    @update:modelValue="onProductChange(index)"
                                                />
                                            </div>
                                            <div class="col-md-1">
                                                <div class="form-floating form-floating-outline">
                                                    <input type="number" v-model.number="item.quantity" @input="calculateMaterialSubtotal(index)" class="form-control" :class="{ 'is-invalid': getStockValidationError(index) }" placeholder="Qty" min="1">
                                                    <label>Qty</label>
                                                    <div v-if="getStockValidationError(index)" class="invalid-feedback">
                                                        {{ getStockValidationError(index) }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-2">
                                                <div class="form-floating form-floating-outline">
                                                    <input type="text" :value="formatRupiah(item.price)" class="form-control" placeholder="Harga" readonly>
                                                    <label>Harga Satuan</label>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-floating form-floating-outline">
                                                    <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" placeholder="Subtotal" readonly>
                                                    <label>Subtotal</label>
                                                </div>
                                            </div>
                                            <div class="col-md-12 d-flex justify-content-end">
                                                <button @click.prevent="siteInvestStore.removeMaterialItem(index)" class="btn btn-outline-danger">Hapus</button>
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
                                <div class="tab-pane fade" id="form-tabs-services" role="tabpanel">
                                    <div v-for="(item, index) in form.siteInvestServices" :key="index" class="repeater-item mb-4">
                                        <div class="row g-3">
                                            <div class="col-md-4">
                                                <CustomSelect2
                                                    v-model="item.serviceId"
                                                    :options="services"
                                                    :get-option-label="s => s.name"
                                                    :reduce="s => s.id"
                                                    placeholder="Pilih Service"
                                                    searchable
                                                    clearable
                                                    @update:modelValue="onServiceChange(index)"
                                                />
                                            </div>
                                            <div class="col-md-2">
                                                <CustomSelect2
                                                    v-model="item.unitId"
                                                    :options="units"
                                                    :get-option-label="u => u.symbol"
                                                    :reduce="u => u.id"
                                                    placeholder="Unit"
                                                    searchable
                                                    clearable
                                                />
                                            </div>
                                            <div class="col-md-2">
                                                <div class="form-floating form-floating-outline">
                                                    <input type="number" v-model.number="item.quantity" @input="calculateServiceSubtotal(index)" class="form-control" placeholder="Qty" min="1">
                                                    <label>Qty</label>
                                                </div>
                                            </div>
                                            <div class="col-md-2">
                                                <div class="form-floating form-floating-outline">
                                                    <input type="text" :value="formatRupiah(item.price)" class="form-control" placeholder="Harga" readonly>
                                                    <label>Harga</label>
                                                </div>
                                            </div>
                                            <div class="col-md-2">
                                                <div class="form-floating form-floating-outline">
                                                    <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" placeholder="Subtotal" readonly>
                                                    <label>Subtotal</label>
                                                </div>
                                            </div>
                                            <div class="col-md-12 d-flex justify-content-end">
                                                <button @click.prevent="siteInvestStore.removeServiceItem(index)" class="btn btn-outline-danger">Hapus</button>
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
                                <div class="tab-pane fade" id="form-tabs-dids" role="tabpanel">
                                    <!-- Dropdown DID di atas (col-12, di luar repeater) -->
                                    <div class="row g-3 mb-4">
                                        <div class="col-12">
                                            <label class="form-label text-muted mb-2">DID <span class="text-danger">*</span></label>
                                            <CustomSelect2
                                                v-model="selectedDidId"
                                                :options="dids"
                                                :get-option-label="d => `${d.code} - ${d.name || ''}`"
                                                :reduce="d => d.id"
                                                placeholder="Pilih DID"
                                                searchable
                                                clearable
                                                @update:modelValue="onDidChange"
                                            />
                                        </div>
                                    </div>

                                    <!-- Repeater items untuk services dari DID yang dipilih -->
                                    <div v-for="(item, index) in form.siteInvestDids" :key="index" class="repeater-item mb-4">
                                        <div class="row g-3">
                                            <div class="col-md-4">
                                                <label class="form-label text-muted mb-2">Service Plan</label>
                                                <CustomSelect2
                                                    v-model="item.servicePlanId"
                                                    :options="getDidServicePlans(selectedDidId)"
                                                    :get-option-label="sp => sp?.name || ''"
                                                    :reduce="sp => sp?.id || null"
                                                    placeholder="Service Plan"
                                                    searchable
                                                    clearable
                                                    :disabled="!selectedDidId"
                                                />
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label text-muted mb-2">Category</label>
                                                <CustomSelect2
                                                    v-model="item.category"
                                                    :options="categoryOptions"
                                                    :get-option-label="opt => opt.label"
                                                    :reduce="opt => opt.value"
                                                    placeholder="Category"
                                                    searchable
                                                    clearable
                                                />
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label text-muted mb-2">Unit</label>
                                                <CustomSelect2
                                                    v-model="item.unitId"
                                                    :options="units"
                                                    :get-option-label="u => u.symbol || u.name"
                                                    :reduce="u => u.id"
                                                    placeholder="Unit"
                                                    searchable
                                                    clearable
                                                />
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label text-muted mb-2">Quantity</label>
                                                <input type="number" v-model.number="item.quantity" @input="calculateDidSubtotal(index)" class="form-control" placeholder="Qty" min="1">
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label text-muted mb-2">Harga</label>
                                                <input type="text" :value="formatRupiah(item.price)" @input="updateDidPriceFromInput(index, $event)" class="form-control" placeholder="Harga">
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label text-muted mb-2">Subtotal</label>
                                                <input type="text" :value="formatRupiah((item.quantity || 1) * (item.price || 0))" class="form-control bg-light" placeholder="Subtotal" readonly>
                                            </div>
                                        </div>
                                        <div class="col-md-1 offset-md-11 mt-3 mb-2">
                                            <button @click.prevent="siteInvestStore.removeDidItem(index)" class="btn btn-outline-danger w-100">Hapus</button>
                                        </div>
                                        <hr class="my-4">
                                    </div>
                                    <div v-if="!selectedDidId || form.siteInvestDids.length === 0" class="text-center text-muted py-4">
                                        <p>Pilih DID terlebih dahulu untuk menampilkan services</p>
                                    </div>
                                    <div v-if="selectedDidId" class="mt-4">
                                        <button @click.prevent="addDidServiceItem()" class="btn btn-primary">Tambah Service</button>
                                    </div>
                                    <div class="d-flex justify-content-end mt-4">
                                        <span class="fw-bold fs-5">Subtotal DID: {{ formatRupiah(didSubtotal) }}</span>
                                    </div>
                                </div>

                                <!-- Tab Budget -->
                                <div class="tab-pane fade" id="form-tabs-budgets" role="tabpanel">
                                    <div class="alert alert-info mb-4">
                                        <i class="ri-information-line me-2"></i>
                                        <strong>Info:</strong> Pilih sumber budget dan penanggung jawab (budget holder) untuk masing-masing alokasi.
                                    </div>
                                    <div v-for="(item, index) in (form.siteInvestBudgets || [])" :key="index" class="repeater-item mb-4">
                                        <div class="row g-3">
                                            <div class="col-md-5">
                                                <label class="form-label text-muted">Sumber Budget</label>
                                                <CustomSelect2
                                                    v-model="item.budgetSourceId"
                                                    :options="approvedBudgets || []"
                                                    :get-option-label="b => (b && `${b.budgetCode || b.budget_code || ''} - ${b.budgetName || b.budget_name || ''}`) || '—'"
                                                    :reduce="b => (b && b.id) ?? null"
                                                    placeholder="Pilih Budget"
                                                    searchable
                                                    clearable
                                                />
                                            </div>
                                            <div class="col-md-5">
                                                <label class="form-label text-muted">Budget Holder (Penanggung Jawab)</label>
                                                <CustomSelect2
                                                    v-model="item.budgetHolderId"
                                                    :options="usersForBudget"
                                                    :get-option-label="u => u.fullName || u.email || `User #${u.id}`"
                                                    :reduce="u => u.id"
                                                    placeholder="Pilih User"
                                                    searchable
                                                    clearable
                                                />
                                            </div>
                                            <div class="col-md-2 d-flex align-items-end">
                                                <button @click.prevent="removeBudgetItem(index)" class="btn btn-outline-danger w-100">Hapus</button>
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
                                <button type="button" class="btn btn-outline-secondary" @click="siteInvestStore.closeModal()">Tutup</button>
                                <button type="submit" class="btn btn-primary ms-2" :disabled="loading">
                                    <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </template>
                </Modal>
            </div>
        </div>
        <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSiteInvestStore } from '~/stores/site-invest'
import { useCustomerStore } from '~/stores/customer'
import { useProductStore } from '~/stores/product'
import { useServiceStore } from '~/stores/service'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { useWarehouseStore } from '~/stores/warehouse'
import { useBudgetStore } from '~/stores/budget'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()
const route = useRoute()
const router = useRouter()

const isInitialLoading = ref(true)
const siteInvestStore = useSiteInvestStore()
const customerStore = useCustomerStore()
const productStore = useProductStore()
const warehouseStore = useWarehouseStore()
const serviceStore = useServiceStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()
const budgetStore = useBudgetStore()
const formatRupiah = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, isImageFile } = useImageUrl()

const { siteInvests, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, stats } = storeToRefs(siteInvestStore)
const { customers } = storeToRefs(customerStore)
const { products } = storeToRefs(productStore)
const { warehouses } = storeToRefs(warehouseStore)
const { services } = storeToRefs(serviceStore)
const { user } = storeToRefs(userStore)
const { permissions } = storeToRefs(permissionStore)
const { budgets } = storeToRefs(budgetStore)

// Filter budgets untuk tab budget - hanya tampilkan yang status approved
const approvedBudgets = computed(() => {
    return (budgets.value || []).filter(b => b.status === 'approved')
})

const myDataTableRef = ref(null)
const filters = ref({
    customerId: null,
    status: null,
    priority: null,
    startDate: null,
    endDate: null,
    search: '',
})
const globalFilterValue = ref('')

const tableControls = ref({
    rows: 10,
    search: ''
})

const units = ref([])
const dids = ref([])
const usersForBudget = ref([])
const sites = ref([])
const businessSchemes = ref([])
const selectedDidId = ref(null)

const fetchBudgetsAndUsers = async () => {
    const prevRows = budgetStore.params.rows
    budgetStore.params.rows = 500
    await budgetStore.fetchBudgets(true)
    budgetStore.params.rows = prevRows
    const { $api } = useNuxtApp()
    try {
        const r = await fetch(`${$api.users()}?page=1&rows=500`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
        if (r.ok) {
            const j = await r.json()
            usersForBudget.value = j.data || []
        }
    } catch (e) {
        console.error('Error fetching users for budget holder:', e)
    }
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

const fetchUnitsAndDids = async () => {
    const { $api } = useNuxtApp()
    try {
        const [unitsRes, didsRes] = await Promise.all([
            fetch($api.unit(), {
                headers: { 'Accept': 'application/json' },
                credentials: 'include'
            }),
            fetch(`${$api.did()}?page=1&rows=500&includeServices=true`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'include'
            })
        ])

        if (unitsRes.ok) {
            const unitsData = await unitsRes.json()
            units.value = unitsData.data || []
        }

        if (didsRes.ok) {
            const didsData = await didsRes.json()
            dids.value = didsData.data || []
        }
    } catch (error) {
        console.error('Error fetching units and dids:', error)
    }
}

const fetchSitesForSelect = async () => {
    const { $api } = useNuxtApp()
    try {
        const res = await fetch(`${$api.sites()}?page=1&rows=500`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
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
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
        if (res.ok) {
            const j = await res.json()
            businessSchemes.value = j.data || []
        }
    } catch (e) {
        console.error('Error fetching business schemes for select:', e)
    }
}

function onSiteChange(siteId) {
    const s = sites.value.find(x => x.id === siteId)
    if (s && form.value) {
        form.value.location = s.address || ''
        form.value.lat = s.latitude != null ? String(s.latitude) : ''
        form.value.long = s.longitude != null ? String(s.longitude) : ''
    }
}

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const modalTitle = computed(() => isEditMode.value ? 'Edit Site Investment' : 'Tambah Site Investment')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data Site Investment di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan data Site Investment baru.')

const statusOptions = ref([
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Expired', value: 'expired' },
])

const priorityOptions = ref([
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
])

const categoryOptions = ref([
    { label: 'Delivery', value: 'delivery' },
    { label: 'Installation', value: 'installation' },
    { label: 'Survey', value: 'survey' },
    { label: 'Dismantle', value: 'dismantle' },
])

const materialSubtotal = computed(() => {
    if (!form.value || !form.value.siteInvestMaterials) return 0
    return form.value.siteInvestMaterials.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const serviceSubtotal = computed(() => {
    if (!form.value || !form.value.siteInvestServices) return 0
    return form.value.siteInvestServices.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const didSubtotal = computed(() => {
    if (!form.value || !form.value.siteInvestDids) return 0
    return form.value.siteInvestDids.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 1
        const price = Number(item.price) || 0
        return sum + (quantity * price)
    }, 0)
})

const totalInvestment = computed(() => {
    const fromItems = materialSubtotal.value + serviceSubtotal.value + didSubtotal.value
    if (fromItems > 0) return fromItems
    if (isEditMode.value && form.value && (form.value.total != null && form.value.total !== '')) {
      return Number(form.value.total) || 0
    }
    return fromItems
})

const contingencyAmount = computed(() => {
    const fromCalc = totalInvestment.value * ((form.value?.contingencyPercent ?? 0) / 100)
    if (fromCalc > 0) return fromCalc
    if (isEditMode.value && form.value && (form.value.contingencyAmount != null && form.value.contingencyAmount !== '')) {
      return Number(form.value.contingencyAmount) || 0
    }
    return fromCalc
})

const grandTotal = computed(() => {
    const fromCalc = totalInvestment.value + contingencyAmount.value
    if (fromCalc > 0) return fromCalc
    if (isEditMode.value && form.value && (form.value.grandTotal != null && form.value.grandTotal !== '')) {
      return Number(form.value.grandTotal) || 0
    }
    return fromCalc
})

const { isLoading: isDataLoading, error: dataError } = usePageData({
    pageName: 'Site Investment',
    loaders: [
        () => productStore.fetchProducts(),
        () => serviceStore.fetchServices(),
        () => customerStore.fetchCustomers(),
        () => warehouseStore.fetchWarehouses(),
        () => permissionStore.fetchPermissions(),
        () => userStore.loadUser(),
        () => fetchUnitsAndDids(),
        () => fetchSitesForSelect(),
        () => fetchBusinessSchemesForSelect(),
        () => fetchBudgetsAndUsers(),
        () => siteInvestStore.fetchSiteInvests(),
        () => siteInvestStore.fetchStats(),
    ],
    onSuccess: () => {
        setListTitle('Site Investment', stats.value.total || 0)
    },
    waitAll: true
})

watch(isDataLoading, (value) => {
    isInitialLoading.value = value
})

let modalInstance = null

onMounted(() => {
    const modalElement = document.getElementById('SiteInvestmentModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }

    tableControls.value.rows = Number(params.value.rows) || 10
    tableControls.value.search = globalFilterValue.value

    const editId = route.query.edit
    if (editId && typeof editId === 'string') {
        nextTick(() => siteInvestStore.openModal({ id: editId }))
    }
})

watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10
})

watch(() => globalFilterValue.value, (newValue) => {
    tableControls.value.search = newValue
})

watch(showModal, async (newValue) => {
    if (newValue) {
        nextTick(() => {
            const modalElement = document.getElementById('SiteInvestmentModal')
            if (modalElement && !modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement)
            }
            modalInstance?.show()
            // Saat edit, pastikan site terpilih ada di daftar opsi (jika dari preload dan tidak di 500 teratas)
            if (form.value?.site && form.value?.siteId && !sites.value.find(s => s.id === form.value.siteId)) {
                sites.value = [{ ...form.value.site, id: form.value.siteId }, ...sites.value]
            }
            // Saat edit, pastikan business scheme terpilih ada di daftar opsi
            if (form.value?.businessScheme && form.value?.businessSchemeId && !businessSchemes.value.find(b => b.id === form.value.businessSchemeId)) {
                businessSchemes.value = [{ ...form.value.businessScheme, id: form.value.businessSchemeId }, ...businessSchemes.value]
            }
            // Set selectedDidId dari form.siteInvestDids jika ada (edit mode)
            if (form.value?.siteInvestDids && form.value.siteInvestDids.length > 0) {
                const firstDidId = form.value.siteInvestDids[0]?.didId
                if (firstDidId) {
                    selectedDidId.value = firstDidId
                    // Fetch services untuk DID yang dipilih jika belum ada (hanya untuk preload, tidak overwrite existing items)
                    const selectedDid = dids.value.find(d => d.id === firstDidId)
                    if (selectedDid && (!selectedDid.services || selectedDid.services.length === 0)) {
                        // Fetch services untuk preload, tapi jangan overwrite existing items
                        const { $api } = useNuxtApp()
                        fetch(`${$api.did()}/${selectedDid.id}`, {
                            headers: { 'Accept': 'application/json' },
                            credentials: 'include'
                        }).then(response => {
                            if (response.ok) {
                                return response.json()
                            }
                        }).then(result => {
                            if (result) {
                                const didData = result.data || result
                                if (didData && didData.services) {
                                    selectedDid.services = didData.services
                                }
                            }
                        }).catch(error => {
                            console.error('Error fetching DID details:', error)
                        })
                    }
                }
            } else {
                selectedDidId.value = null
            }
        })
    } else {
        modalInstance?.hide()
        selectedDidId.value = null
        if (route.query.edit) {
            const q = { ...route.query }
            delete q.edit
            router.replace({ path: route.path, query: q })
        }
    }
})

const debouncedSearch = useDebounceFn(() => {
    siteInvestStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

watch(filters, (newFilters) => {
    const { page, rows, ...restFilters } = newFilters
    siteInvestStore.setFilters(restFilters)
}, { deep: true })

// Filter daftar produk berdasarkan customer yang dipilih (relasi product_customer)
watch(
    () => form.value?.customerId,
    (newCustomerId) => {
        productStore.params.customerId = newCustomerId || null
        // Ambil ulang daftar produk, tanpa notifikasi error (preload)
        productStore.fetchProducts(true)
    }
)

const onPage = (event) => {
    if (event) {
        const validEvent = {
            first: Number(event.first) || 0,
            rows: Number(event.rows) || 10,
            page: Number(event.page) || 0
        }
        siteInvestStore.setPagination(validEvent)
    }
}

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10
    params.value.rows = rowsValue
    params.value.first = 0
    siteInvestStore.fetchSiteInvests()
}

const handleSearch = (value) => {
    globalFilterValue.value = value
    params.value.first = 0
    siteInvestStore.fetchSiteInvests()
}

const onSort = (event) => {
    if (event) {
        siteInvestStore.setSort(event)
    }
}

const exportData = async (format) => {
    const toast = useToast()
    if (format === 'csv') {
        myDataTableRef.value.exportCSV()
    } else {
        toast.info({
            title: 'Info',
            message: 'Export PDF akan segera tersedia',
            color: 'blue'
        })
    }
}

const convertToNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0
    if (typeof value === 'number') return value
    const stringValue = String(value).trim()
    const normalizedValue = stringValue.replace(',', '.')
    const numValue = parseFloat(normalizedValue)
    return isNaN(numValue) ? 0 : numValue
}

const formatForDisplay = (value) => {
    const numValue = convertToNumber(value)
    if (numValue === 0) return ''
    return numValue.toString().replace('.', ',')
}

const onContingencyPercentInput = (event) => {
    const target = event.target
    let value = target.value
    if (value && !/^[0-9]*([,\.][0-9]*)?$/.test(value)) {
        value = value.slice(0, -1)
        target.value = value
    }
    const numValue = convertToNumber(value)
    form.value.contingencyPercent = numValue
}

const onContingencyPercentBlur = (event) => {
    const target = event.target
    const numValue = convertToNumber(target.value)
    form.value.contingencyPercent = numValue
    target.value = formatForDisplay(numValue)
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

const handleSubmit = () => {
    form.value.contingencyPercent = convertToNumber(form.value.contingencyPercent)
    siteInvestStore.saveSiteInvest()
}

const onProductChange = async (index) => {
    const item = form.value.siteInvestMaterials[index]
    const selectedProduct = products.value.find(p => p.id === item.productId)
    if (selectedProduct) {
        item.price = Number(selectedProduct.priceSell) || 0
        calculateMaterialSubtotal(index)
        
        // Validasi stock saat product dipilih
        await validateStockQuantity(index)
    }
}

const calculateMaterialSubtotal = async (index) => {
    const item = form.value.siteInvestMaterials[index]
    const quantity = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    item.subtotal = quantity * price
    
    // Validasi stock saat quantity berubah
    if (item.productId) {
        await validateStockQuantity(index)
    }
}

// Fungsi untuk validasi stock quantity
const validateStockQuantity = async (index) => {
    const item = form.value.siteInvestMaterials[index]
    if (!item.productId || !item.quantity) return
    
    const selectedProduct = products.value.find(p => p.id === item.productId)
    if (!selectedProduct) return
    
    // Jika gudang belum dipilih, tidak bisa validasi per-gudang
    if (!item.warehouseId) return

    // Ambil stok hanya di gudang yang dipilih
    const stocksForWarehouse = (selectedProduct.stocks || []).filter(
        (stock) => Number(stock.warehouseId) === Number(item.warehouseId)
    )

    const totalStock = stocksForWarehouse.reduce(
        (sum, stock) => sum + (Number(stock.quantity) || 0),
        0
    ) || 0

    // Jika tidak ada stok sama sekali di gudang ini, tampilkan alert khusus
    if (stocksForWarehouse.length === 0 || totalStock <= 0) {
        const toast = useToast()
        toast.error({
            title: 'Produk tidak tersedia',
            message: 'Product yang dipilih tidak tersedia di gudang ini',
            color: 'red',
            position: 'topRight',
            layout: 2,
        })
        return
    }

    const requestedQuantity = Number(item.quantity) || 0
    
    if (requestedQuantity > totalStock) {
        const toast = useToast()
        toast.warning({
            title: 'Peringatan Stock',
            message: `Stock pada product ID ${item.productId} tidak mencukupi. Stock tersedia: ${totalStock}, Quantity diminta: ${requestedQuantity}`,
            color: 'orange',
            position: 'topRight',
            layout: 2,
        })
    }
}

const onServiceChange = (index) => {
    const item = form.value.siteInvestServices[index]
    const selectedService = services.value.find(s => s.id === item.serviceId)
    if (selectedService) {
        item.price = Number(selectedService.price) || 0
        calculateServiceSubtotal(index)
    }
}

const calculateServiceSubtotal = (index) => {
    const item = form.value.siteInvestServices[index]
    const quantity = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    item.subtotal = quantity * price
}

function getDidUnitLabel(item) {
    if (!item?.unitId) return '—'
    const u = (units.value || []).find(x => x.id === item.unitId)
    return (u?.symbol || u?.name) || '—'
}

const getDidServicePlans = (didId) => {
    if (!didId) return []
    const selectedDid = dids.value.find(d => d.id === didId)
    if (!selectedDid || !selectedDid.services) return []
    
    // Get unique service plans from DID services
    const servicePlanMap = new Map()
    selectedDid.services.forEach(service => {
        if (service.servicePlan && !servicePlanMap.has(service.servicePlan.id)) {
            servicePlanMap.set(service.servicePlan.id, service.servicePlan)
        }
    })
    return Array.from(servicePlanMap.values())
}

const onDidChange = async () => {
    if (!selectedDidId.value) {
        // Clear all DID items if DID is cleared
        form.value.siteInvestDids = []
        return
    }
    
    const selectedDid = dids.value.find(d => d.id === selectedDidId.value)
    
    if (selectedDid) {
        // Fetch full DID data with services if not already loaded
        if (!selectedDid.services || selectedDid.services.length === 0) {
            const { $api } = useNuxtApp()
            try {
                const response = await fetch(`${$api.did()}/${selectedDid.id}`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include'
                })
                if (response.ok) {
                    const result = await response.json()
                    // Response can be either { data: did } or did directly
                    const didData = result.data || result
                    if (didData && didData.services) {
                        selectedDid.services = didData.services
                    }
                }
            } catch (error) {
                console.error('Error fetching DID details:', error)
            }
        }
        
        // Clear existing items and populate with services from selected DID
        form.value.siteInvestDids = []
        
        if (selectedDid.services && selectedDid.services.length > 0) {
            // Create items for each service from DID
            selectedDid.services.forEach(service => {
                form.value.siteInvestDids.push({
                    didId: selectedDid.id,
                    servicePlanId: service.servicePlanId || null,
                    category: service.category || null,
                    unitId: null, // Unit will need to be set manually or from service plan
                    quantity: Number(service.quantity) || 1,
                    price: Number(service.price) || 0,
                    isPriceOverridden: false,
                })
            })
        } else {
            // If no services, create one empty item
            form.value.siteInvestDids.push({
                didId: selectedDid.id,
                servicePlanId: null,
                category: null,
                unitId: null,
                quantity: 1,
                price: Number(selectedDid.total) || 0,
                isPriceOverridden: false,
            })
        }
    }
}

// Watch selectedDidId to ensure all items have the same didId
watch(selectedDidId, (newDidId) => {
    if (form.value.siteInvestDids) {
        form.value.siteInvestDids.forEach(item => {
            item.didId = newDidId
        })
    }
})

const addDidServiceItem = () => {
    if (!form.value.siteInvestDids) {
        form.value.siteInvestDids = []
    }
    form.value.siteInvestDids.push({
        didId: selectedDidId.value,
        servicePlanId: null,
        category: null,
        unitId: null,
        quantity: 1,
        price: 0,
        isPriceOverridden: false,
    })
}

const calculateDidSubtotal = (index) => {
    const item = form.value.siteInvestDids[index]
    // Subtotal is calculated in template, this is just for triggering reactivity
}

const parseRupiahToNumber = (rupiahString) => {
    if (!rupiahString) return 0
    return Number(String(rupiahString).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0
}

const updateDidPriceFromInput = (index, event) => {
    const numericValue = parseRupiahToNumber(event.target?.value || '')
    if (form.value.siteInvestDids && form.value.siteInvestDids[index]) {
        form.value.siteInvestDids[index].price = Math.round(numericValue)
        form.value.siteInvestDids[index].isPriceOverridden = true
        calculateDidSubtotal(index)
    }
}

const getStatusBadge = (status) => {
    switch (status) {
        case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
        case 'pending': return { text: 'Pending', class: 'badge rounded-pill bg-label-warning' }
        case 'approved': return { text: 'Approved', class: 'badge rounded-pill bg-label-success' }
        case 'rejected': return { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' }
        case 'expired': return { text: 'Expired', class: 'badge rounded-pill bg-label-dark' }
        default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
    }
}

const getPriorityBadge = (priority) => {
    switch (priority) {
        case 'low': return { text: 'Low', class: 'badge rounded-pill bg-label-info' }
        case 'medium': return { text: 'Medium', class: 'badge rounded-pill bg-label-warning' }
        case 'high': return { text: 'High', class: 'badge rounded-pill bg-label-danger' }
        default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
    }
}

// Fungsi untuk mendapatkan error message validasi stock
const getStockValidationError = (index) => {
    const item = form.value.siteInvestMaterials[index]
    if (!item.productId || !item.quantity || !item.warehouseId) return null
    
    const selectedProduct = products.value.find(p => p.id === item.productId)
    if (!selectedProduct) return null
    
    const stocksForWarehouse = (selectedProduct.stocks || []).filter(
        (stock) => Number(stock.warehouseId) === Number(item.warehouseId)
    )

    const totalStock = stocksForWarehouse.reduce(
        (sum, stock) => sum + (Number(stock.quantity) || 0),
        0
    ) || 0

    if (stocksForWarehouse.length === 0 || totalStock <= 0) {
        return 'Product yang dipilih tidak tersedia di gudang ini'
    }

    const requestedQuantity = Number(item.quantity) || 0
    
    if (requestedQuantity > totalStock) {
        return `Stock tidak mencukupi. Tersedia: ${totalStock}`
    }
    
    return null
}

const clearDateFilters = () => {
    filters.value.startDate = null
    filters.value.endDate = null
    siteInvestStore.setFilters(filters.value)
}

const onDateChange = () => {
    siteInvestStore.setFilters(filters.value)
}

definePageMeta({
    layout: 'default',
    middleware: ['auth', 'check-permission'],
    title: 'Site Investment',
    description: 'Site Investment Management',
    keywords: 'Site Investment, Sales, Kainnova Digital Solutions',
    author: 'Kainnova Digital Solutions',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})
</script>

<style scoped>
/* Dropdown Actions table: tampil di atas agar tidak tertutup overflow */
:deep(.si-actions-dropdown) {
    z-index: 1100 !important;
}

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

/* Total Investment Summary */
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

.investment-summary-row-contingency .contingency-input {
    width: 72px;
    display: inline-block;
    text-align: center;
    font-weight: 600;
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
