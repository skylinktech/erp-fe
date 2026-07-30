<template>
    <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-pt-10">
            <h4 class="mb-1">Invoice Tagihan</h4>
            <p class="mb-6">
                Kelola tagihan pelanggan untuk perangkat yang sudah terpasang dan aktif di lokasi
            </p>

            <!-- ── Statistics Cards ──────────────────────────────────────────── -->
            <div class="row g-6 mb-6">
                <!-- Total Invoice -->
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div v-if="loadingStats" class="d-flex align-items-center">
                                <div class="skeleton-loader me-3" style="width:40px;height:40px;border-radius:8px"></div>
                                <div class="flex-grow-1">
                                    <div class="skeleton-loader mb-2" style="width:60%;height:16px"></div>
                                    <div class="skeleton-loader" style="width:40%;height:20px"></div>
                                </div>
                            </div>
                            <template v-else>
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Total Invoice</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-primary">
                                            <i class="ri-bill-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-end">
                                    <div>
                                        <h5 class="mb-0">{{ statistics?.counts.total ?? 0 }}</h5>
                                        <small class="text-muted">Invoice Terdaftar</small>
                                    </div>
                                    <span class="text-muted small">
                                        {{ formatRupiah(statistics?.amounts.grandTotal ?? 0) }}
                                    </span>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Unpaid -->
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div v-if="loadingStats" class="d-flex align-items-center">
                                <div class="skeleton-loader me-3" style="width:40px;height:40px;border-radius:8px"></div>
                                <div class="flex-grow-1">
                                    <div class="skeleton-loader mb-2" style="width:60%;height:16px"></div>
                                    <div class="skeleton-loader" style="width:40%;height:20px"></div>
                                </div>
                            </div>
                            <template v-else>
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Belum Dibayar</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-danger">
                                            <i class="ri-error-warning-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-end">
                                    <div>
                                        <h5 class="mb-0 text-danger">{{ statistics?.counts.unpaid ?? 0 }}</h5>
                                        <small class="text-muted">Invoice Unpaid</small>
                                    </div>
                                    <span class="text-danger small fw-semibold">
                                        {{ formatRupiah(statistics?.amounts.unpaid ?? 0) }}
                                    </span>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Partial -->
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div v-if="loadingStats" class="d-flex align-items-center">
                                <div class="skeleton-loader me-3" style="width:40px;height:40px;border-radius:8px"></div>
                                <div class="flex-grow-1">
                                    <div class="skeleton-loader mb-2" style="width:60%;height:16px"></div>
                                    <div class="skeleton-loader" style="width:40%;height:20px"></div>
                                </div>
                            </div>
                            <template v-else>
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Sebagian Dibayar</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-warning">
                                            <i class="ri-timer-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-end">
                                    <div>
                                        <h5 class="mb-0 text-warning">{{ statistics?.counts.partial ?? 0 }}</h5>
                                        <small class="text-muted">Invoice Partial</small>
                                    </div>
                                    <span class="text-warning small fw-semibold">
                                        {{ formatRupiah(statistics?.amounts.partial ?? 0) }}
                                    </span>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Paid -->
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div v-if="loadingStats" class="d-flex align-items-center">
                                <div class="skeleton-loader me-3" style="width:40px;height:40px;border-radius:8px"></div>
                                <div class="flex-grow-1">
                                    <div class="skeleton-loader mb-2" style="width:60%;height:16px"></div>
                                    <div class="skeleton-loader" style="width:40%;height:20px"></div>
                                </div>
                            </div>
                            <template v-else>
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Lunas</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-success">
                                            <i class="ri-checkbox-circle-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-end">
                                    <div>
                                        <h5 class="mb-0 text-success">{{ statistics?.counts.paid ?? 0 }}</h5>
                                        <small class="text-muted">Invoice Lunas</small>
                                    </div>
                                    <span class="text-success small fw-semibold">
                                        {{ formatRupiah(statistics?.amounts.paid ?? 0) }}
                                    </span>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ── Filter Card ────────────────────────────────────────────────── -->
            <div class="card mb-6 invoice-filter-card">
                <div
                    class="card-header d-flex justify-content-between align-items-center"
                    style="cursor: pointer"
                    @click="showFilter = !showFilter"
                >
                    <div class="d-flex align-items-center gap-2">
                        <i class="ri-filter-line"></i>
                        <span class="fw-semibold">Filter Invoice</span>
                        <span v-if="hasActiveFilters" class="badge bg-primary ms-1">Aktif</span>
                    </div>
                    <i :class="showFilter ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                </div>
                <div v-show="showFilter" class="card-body">
                    <div class="invoice-filter-grid">
                        <div class="invoice-filter-field">
                            <label class="form-label">Status Pembayaran</label>
                            <select
                                class="form-select"
                                v-model="filterStatus"
                                @change="applyFilter('status', filterStatus)"
                            >
                                <option value="">Semua Status</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="partial">Partial</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                        <div class="invoice-filter-field">
                            <label class="form-label">Sumber Invoice</label>
                            <select
                                class="form-select"
                                v-model="filterSource"
                                @change="applyFilter('documentSource', filterSource)"
                            >
                                <option value="">Semua Sumber</option>
                                <option value="manual">Manual</option>
                                <option value="subscription_signed">Form Berlangganan</option>
                                <option value="billing_prep">Billing Preparation</option>
                                <option value="cron_monthly">Bulanan (Legacy)</option>
                            </select>
                        </div>
                        <div class="invoice-filter-field">
                            <label class="form-label">Tanggal Dari</label>
                            <input
                                type="date"
                                class="form-control"
                                v-model="filterDateFrom"
                                @change="applyFilter('dateFrom', filterDateFrom)"
                            />
                        </div>
                        <div class="invoice-filter-field">
                            <label class="form-label">Tanggal Sampai</label>
                            <input
                                type="date"
                                class="form-control"
                                v-model="filterDateTo"
                                @change="applyFilter('dateTo', filterDateTo)"
                            />
                        </div>
                        <div class="invoice-filter-field">
                            <label class="form-label">Periode Billing</label>
                            <input
                                type="month"
                                class="form-control"
                                v-model="filterBillingPeriod"
                                @change="applyFilter('billingPeriod', filterBillingPeriod)"
                            />
                        </div>
                    </div>
                    <div class="mt-3 d-flex justify-content-end">
                        <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
                            <i class="ri-refresh-line me-1"></i>
                            Reset Filter
                        </button>
                    </div>
                </div>
            </div>

            <!-- ── Tabs ───────────────────────────────────────────────────────── -->
            <div class="row g-6">
                <div class="col-12">
                    <div class="card">
                        <!-- Tab Navigation -->
                        <div class="card-header p-0">
                            <ul class="nav nav-tabs" role="tablist">
                                <li class="nav-item">
                                    <button
                                        class="nav-link px-4 py-3"
                                        :class="{ active: activeTab === 'invoices' }"
                                        @click="store.setActiveTab('invoices')"
                                    >
                                        <i class="ri-bill-line me-1"></i>
                                        Daftar Invoice
                                        <span v-if="totalRecords > 0" class="badge bg-label-primary ms-1">
                                            {{ totalRecords }}
                                        </span>
                                    </button>
                                </li>
                                <li class="nav-item">
                                    <button
                                        class="nav-link px-4 py-3"
                                        :class="{ active: activeTab === 'billable' }"
                                        @click="store.setActiveTab('billable')"
                                    >
                                        <i class="ri-router-line me-1"></i>
                                        Perangkat Aktif
                                        <span v-if="totalBillable > 0" class="badge bg-label-success ms-1">
                                            {{ totalBillable }}
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <!-- ── Tab: Daftar Invoice ────────────────────────────── -->
                        <div v-show="activeTab === 'invoices'">
                            <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="me-1">Baris:</span>
                                    <Dropdown
                                        v-model="params.rows"
                                        :options="rowsOptions"
                                        @change="handleRowsChange"
                                        placeholder="Jumlah"
                                        style="width:8rem"
                                    />
                                    <button
                                        v-if="userHasRole('superadmin') || userHasPermission('edit_invoice')"
                                        class="btn btn-primary btn-sm"
                                        :disabled="!selectedInvoices.length || store.sending"
                                        @click="bulkSendInvoices"
                                    >
                                        <i class="ri-mail-send-line me-1"></i>
                                        {{ store.sending ? 'Mengirim...' : `Kirim (${selectedInvoices.length})` }}
                                    </button>
                                    <button
                                        v-if="selectedInvoices.length"
                                        class="btn btn-outline-secondary btn-sm"
                                        :disabled="store.sending"
                                        @click="clearInvoiceSelection"
                                    >
                                        Bersihkan
                                    </button>
                                </div>
                                <div class="d-flex align-items-center gap-2">
                                    <button
                                        class="btn btn-outline-secondary btn-sm"
                                        :disabled="exportingCsv"
                                        @click="exportCSV"
                                    >
                                        <i class="ri-download-line me-1"></i>
                                        {{ exportingCsv ? 'Mengekspor...' : 'Export' }}
                                    </button>
                                    <InputText
                                        v-model="searchQuery"
                                        placeholder="Cari nomor invoice, pelanggan..."
                                        style="width:260px"
                                    />
                                </div>
                            </div>

                            <div class="card-datatable table-responsive py-3 px-3">
                                <MyDataTable
                                    ref="invoiceTableRef"
                                    v-model:selection="selectedInvoices"
                                    :data="invoices"
                                    :rows="Number(params.rows)"
                                    :loading="loading"
                                    :totalRecords="totalRecords"
                                    :first="params.first"
                                    :lazy="true"
                                    @page="onPage"
                                    @sort="onSort"
                                    @selection-change="onInvoiceSelectionChange"
                                    responsiveLayout="scroll"
                                    paginatorPosition="bottom"
                                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                                    currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                                >
                                    <Column
                                        selectionMode="multiple"
                                        headerStyle="width: 3rem"
                                        :exportable="false"
                                    />
                                    <!-- No -->
                                    <Column header="#" :sortable="false" style="width:50px">
                                        <template #body="slotProps">
                                            {{ params.first + slotProps.index + 1 }}
                                        </template>
                                    </Column>

                                    <!-- No Invoice -->
                                    <Column field="noInvoice" header="No Invoice" :sortable="true" style="min-width:160px">
                                        <template #body="slotProps">
                                            <div>
                                                <NuxtLink
                                                    :to="`/finance/invoices/detail/${slotProps.data.id}`"
                                                    class="fw-semibold text-primary text-decoration-none"
                                                >
                                                    {{ slotProps.data.noInvoice }}
                                                </NuxtLink>
                                                <div v-if="slotProps.data.billingPeriod" class="text-muted small">
                                                    <i class="ri-calendar-line me-1"></i>
                                                    {{ slotProps.data.billingPeriod }}
                                                </div>
                                            </div>
                                        </template>
                                    </Column>

                                    <!-- Pelanggan -->
                                    <Column field="customer.name" header="Pelanggan" :sortable="true" style="min-width:160px">
                                        <template #body="slotProps">
                                            <div v-if="slotProps.data.customer">
                                                <span class="fw-semibold">{{ slotProps.data.customer.name }}</span>
                                                <div class="text-muted small">{{ slotProps.data.customer.email }}</div>
                                            </div>
                                            <span v-else class="text-muted">—</span>
                                        </template>
                                    </Column>

                                    <!-- Tanggal -->
                                    <Column field="date" header="Tanggal" :sortable="true" style="min-width:120px">
                                        <template #body="slotProps">
                                            <span>{{ formatDate(slotProps.data.date) }}</span>
                                        </template>
                                    </Column>

                                    <!-- Jatuh Tempo -->
                                    <Column field="dueDate" header="Jatuh Tempo" :sortable="true" style="min-width:130px">
                                        <template #body="slotProps">
                                            <span :class="getDueDateClass(slotProps.data)">
                                                {{ formatDate(slotProps.data.dueDate) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Total -->
                                    <Column field="total" header="Total" :sortable="true" style="min-width:140px">
                                        <template #body="slotProps">
                                            <span class="fw-semibold">
                                                {{ formatRupiah(slotProps.data.total) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Sisa Tagihan -->
                                    <Column field="remainingAmount" header="Sisa Tagihan" :sortable="true" style="min-width:140px">
                                        <template #body="slotProps">
                                            <span
                                                class="fw-semibold"
                                                :class="slotProps.data.remainingAmount > 0 ? 'text-danger' : 'text-success'"
                                            >
                                                {{ formatRupiah(slotProps.data.remainingAmount) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Status Pembayaran -->
                                    <Column field="status" header="Status" :sortable="true" style="min-width:110px">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadgeClass(slotProps.data.status)">
                                                {{ getStatusLabel(slotProps.data.status) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Status Dokumen -->
                                    <Column field="documentStatus" header="Dokumen" :sortable="true" style="min-width:140px">
                                        <template #body="slotProps">
                                            <span :class="getDocumentStatusBadge(slotProps.data.documentStatus)">
                                                {{ getDocumentStatusLabel(slotProps.data.documentStatus) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Sumber -->
                                    <Column field="documentSource" header="Sumber" :sortable="true" style="min-width:120px">
                                        <template #body="slotProps">
                                            <span :class="getSourceBadgeClass(slotProps.data.documentSource)">
                                                {{ getSourceLabel(slotProps.data.documentSource) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Actions -->
                                    <Column header="Aksi" :exportable="false" style="min-width:100px">
                                        <template #body="slotProps">
                                            <div class="d-inline-block dropdown">
                                                <a
                                                    href="javascript:;"
                                                    class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                                                    data-bs-toggle="dropdown"
                                                    data-bs-popper-config='{"strategy":"fixed"}'
                                                >
                                                    <i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu dropdown-menu-end invoice-actions-dropdown">
                                                    <li
                                                        v-if="canSubmitInvoice(slotProps.data)"
                                                    >
                                                        <a
                                                            class="dropdown-item"
                                                            href="javascript:void(0)"
                                                            @click="submitInvoice(slotProps.data)"
                                                        >
                                                            <i class="ri-send-plane-line me-2"></i>
                                                            {{ slotProps.data.documentStatus === 'rejected' ? 'Submit Revisi' : 'Submit Approval' }}
                                                        </a>
                                                    </li>
                                                    <li
                                                        v-if="canApproveInvoice(slotProps.data)"
                                                    >
                                                        <a
                                                            class="dropdown-item text-success"
                                                            href="javascript:void(0)"
                                                            @click="approveInvoice(slotProps.data)"
                                                        >
                                                            <i class="ri-check-line me-2"></i> Approve
                                                        </a>
                                                    </li>
                                                    <li
                                                        v-if="canRejectInvoice(slotProps.data)"
                                                    >
                                                        <a
                                                            class="dropdown-item text-danger"
                                                            href="javascript:void(0)"
                                                            @click="rejectInvoice(slotProps.data)"
                                                        >
                                                            <i class="ri-close-line me-2"></i> Reject
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            class="dropdown-item"
                                                            href="javascript:void(0)"
                                                            @click="viewInvoiceDetail(slotProps.data)"
                                                        >
                                                            <i class="ri-eye-line me-2"></i> Lihat Detail
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            class="dropdown-item"
                                                            href="javascript:void(0)"
                                                            @click="printInvoice(slotProps.data)"
                                                        >
                                                            <i class="ri-printer-line me-2"></i> Cetak
                                                        </a>
                                                    </li>
                                                    <li
                                                        v-if="userHasRole('superadmin') || userHasPermission('edit_invoice')"
                                                    >
                                                        <a
                                                            class="dropdown-item"
                                                            href="javascript:void(0)"
                                                            @click="openEditDialog(slotProps.data)"
                                                        >
                                                            <i class="ri-pencil-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li
                                                        v-if="userHasRole('superadmin') || userHasPermission('edit_invoice')"
                                                    >
                                                        <a
                                                            class="dropdown-item text-primary"
                                                            href="javascript:void(0)"
                                                            @click="sendInvoice(slotProps.data)"
                                                        >
                                                            <i class="ri-mail-send-line me-2"></i> Send
                                                        </a>
                                                    </li>
                                                    <li
                                                        v-if="(userHasRole('superadmin') || userHasPermission('create_ar_receipt'))
                                                            && slotProps.data.status !== 'paid'"
                                                    >
                                                        <a
                                                            class="dropdown-item text-success"
                                                            href="javascript:void(0)"
                                                            @click="goToArReceipt(slotProps.data)"
                                                        >
                                                            <i class="ri-money-dollar-circle-line me-2"></i>
                                                            Buat Tanda Terima
                                                        </a>
                                                    </li>
                                                    <li
                                                        v-if="(userHasRole('superadmin') || userHasPermission('delete_invoice'))
                                                            && slotProps.data.status === 'unpaid'"
                                                    >
                                                        <hr class="dropdown-divider">
                                                    </li>
                                                    <li
                                                        v-if="(userHasRole('superadmin') || userHasPermission('delete_invoice'))
                                                            && slotProps.data.status === 'unpaid'"
                                                    >
                                                        <a
                                                            class="dropdown-item text-danger"
                                                            href="javascript:void(0)"
                                                            @click="deleteInvoice(slotProps.data)"
                                                        >
                                                            <i class="ri-delete-bin-line me-2"></i> Hapus
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </template>
                                    </Column>
                                </MyDataTable>
                            </div>
                        </div>

                        <!-- ── Tab: Perangkat Aktif ───────────────────────────── -->
                        <div v-show="activeTab === 'billable'">
                            <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="me-1">Baris:</span>
                                    <Dropdown
                                        v-model="billableParams.rows"
                                        :options="rowsOptions"
                                        @change="handleBillableRowsChange"
                                        placeholder="Jumlah"
                                        style="width:8rem"
                                    />
                                </div>
                                <InputText
                                    v-model="billableSearchQuery"
                                    placeholder="Cari nomor SI, pelanggan, site..."
                                    style="width:280px"
                                />
                            </div>

                            <div class="card-datatable table-responsive py-3 px-3">
                                <MyDataTable
                                    :data="billableItems"
                                    :rows="Number(billableParams.rows)"
                                    :loading="loadingBillable"
                                    :totalRecords="totalBillable"
                                    :first="billableParams.first"
                                    :lazy="true"
                                    @page="onBillablePage"
                                    responsiveLayout="scroll"
                                    paginatorPosition="bottom"
                                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                                    currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                                >
                                    <!-- No -->
                                    <Column header="#" :sortable="false" style="width:50px">
                                        <template #body="slotProps">
                                            {{ billableParams.first + slotProps.index + 1 }}
                                        </template>
                                    </Column>

                                    <!-- No SI -->
                                    <Column field="siNumber" header="No. SI" style="min-width:140px">
                                        <template #body="slotProps">
                                            <span class="fw-semibold text-primary">
                                                {{ slotProps.data.siNumber }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Nama Proyek -->
                                    <Column field="name" header="Nama Proyek" style="min-width:180px">
                                        <template #body="slotProps">
                                            <div>
                                                <div class="fw-semibold">{{ slotProps.data.name }}</div>
                                                <div v-if="slotProps.data.location" class="text-muted small">
                                                    <i class="ri-map-pin-line me-1"></i>
                                                    {{ slotProps.data.location }}
                                                </div>
                                            </div>
                                        </template>
                                    </Column>

                                    <!-- Pelanggan -->
                                    <Column field="customer.name" header="Pelanggan" style="min-width:160px">
                                        <template #body="slotProps">
                                            <div v-if="slotProps.data.customer">
                                                <span class="fw-semibold">{{ slotProps.data.customer.name }}</span>
                                                <div class="text-muted small">{{ slotProps.data.customer.email }}</div>
                                            </div>
                                            <span v-else class="text-muted">—</span>
                                        </template>
                                    </Column>

                                    <!-- Site / Lokasi -->
                                    <Column field="site.name" header="Site / Lokasi" style="min-width:160px">
                                        <template #body="slotProps">
                                            <div v-if="slotProps.data.site">
                                                <span class="badge bg-label-info me-1">
                                                    {{ slotProps.data.site.code }}
                                                </span>
                                                <span>{{ slotProps.data.site.name }}</span>
                                            </div>
                                            <span v-else class="text-muted">—</span>
                                        </template>
                                    </Column>

                                    <!-- Skema Bisnis -->
                                    <Column field="businessScheme.name" header="Skema" style="min-width:130px">
                                        <template #body="slotProps">
                                            <span v-if="slotProps.data.businessScheme" class="badge bg-label-secondary">
                                                {{ slotProps.data.businessScheme.name }}
                                            </span>
                                            <span v-else class="text-muted">—</span>
                                        </template>
                                    </Column>

                                    <!-- Grand Total -->
                                    <Column field="grandTotal" header="Grand Total" style="min-width:150px">
                                        <template #body="slotProps">
                                            <span class="fw-semibold">
                                                {{ formatRupiah(slotProps.data.grandTotal) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Prioritas -->
                                    <Column field="priority" header="Prioritas" style="min-width:100px">
                                        <template #body="slotProps">
                                            <span :class="getPriorityBadgeClass(slotProps.data.priority)">
                                                {{ getPriorityLabel(slotProps.data.priority) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Disetujui -->
                                    <Column field="approvedAt" header="Disetujui" style="min-width:120px">
                                        <template #body="slotProps">
                                            <span class="text-muted small">
                                                {{ formatDate(slotProps.data.approvedAt) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Actions -->
                                    <Column header="Aksi" :exportable="false" style="min-width:100px">
                                        <template #body="slotProps">
                                            <button
                                                class="btn btn-sm btn-outline-primary"
                                                @click="goToSiteInvestment(slotProps.data)"
                                            >
                                                <i class="ri-external-link-line me-1"></i> Detail
                                            </button>
                                        </template>
                                    </Column>
                                </MyDataTable>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ── Outstanding Summary Footer ───────────────────────────────── -->
            <div v-if="statistics && statistics.amounts.outstanding > 0" class="row g-6 mt-2">
                <div class="col-12">
                    <div class="alert alert-warning d-flex align-items-center gap-3 mb-0">
                        <i class="ri-alert-line ri-24px"></i>
                        <div>
                            <strong>Total Outstanding:</strong>
                            {{ formatRupiah(statistics.amounts.outstanding) }}
                            &nbsp;—&nbsp; terdapat
                            <strong>{{ (statistics.counts.unpaid + statistics.counts.partial) }} invoice</strong>
                            yang belum lunas.
                            <a
                                href="/finance/ar-receipts"
                                class="alert-link ms-1"
                            >
                                Catat Pembayaran di AR Receipts →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Invoice Dialog (metadata only — nominal locked) -->
    <Dialog
        v-model:visible="editDialogVisible"
        modal
        header="Edit Invoice"
        :style="{ width: '520px' }"
        :closable="!store.saving"
    >
        <div v-if="editForm" class="d-flex flex-column gap-3">
            <div class="alert alert-info py-2 mb-0 small">
                <i class="ri-lock-line me-1"></i>
                Nominal invoice terkunci dan tidak dapat diubah.
                <strong class="ms-1">{{ formatRupiah(editForm.total) }}</strong>
            </div>
            <div>
                <label class="form-label">No. Invoice</label>
                <input type="text" class="form-control" :value="editForm.noInvoice" disabled>
            </div>
            <div>
                <label class="form-label">UP / Attention</label>
                <input v-model="editForm.up" type="text" class="form-control" :disabled="store.saving">
            </div>
            <div>
                <label class="form-label">Email</label>
                <input v-model="editForm.email" type="email" class="form-control" :disabled="store.saving">
            </div>
            <div class="row g-3">
                <div class="col-6">
                    <label class="form-label">Tanggal</label>
                    <input v-model="editForm.date" type="date" class="form-control" :disabled="store.saving">
                </div>
                <div class="col-6">
                    <label class="form-label">Jatuh Tempo</label>
                    <input v-model="editForm.dueDate" type="date" class="form-control" :disabled="store.saving">
                </div>
            </div>
            <div>
                <label class="form-label">Status Pembayaran</label>
                <CustomSelect2
                    v-model="editForm.status"
                    :options="statusOptions"
                    :get-option-label="(opt) => opt?.label ?? ''"
                    :reduce="(opt) => opt?.value"
                    :disabled="store.saving"
                    searchable
                    :clearable="false"
                    placeholder="Pilih Status"
                >
                    <template #option="{ option }">
                        <div class="d-flex align-items-center gap-2">
                            <span
                                class="badge"
                                :class="{
                                    'bg-danger': option.value === 'unpaid',
                                    'bg-warning': option.value === 'partial',
                                    'bg-success': option.value === 'paid',
                                }"
                            >
                                {{ option.label }}
                            </span>
                            <span class="text-muted small">{{ option.description }}</span>
                        </div>
                    </template>
                    <template #selection="{ option }">
                        <span
                            class="badge"
                            :class="{
                                'bg-danger': option.value === 'unpaid',
                                'bg-warning': option.value === 'partial',
                                'bg-success': option.value === 'paid',
                            }"
                        >
                            {{ option.label }}
                        </span>
                    </template>
                </CustomSelect2>
            </div>
            <div v-if="editForm.status === 'paid'">
                <label class="form-label">
                    Tanggal Dibayar
                    <span class="text-danger">*</span>
                </label>
                <input
                    v-model="editForm.paidAt"
                    type="date"
                    class="form-control"
                    :disabled="store.saving"
                    :max="financeInvoiceTodayDateInput()"
                    required
                >
                <div class="form-text">Wajib diisi saat menandai invoice sebagai lunas.</div>
            </div>
            <div>
                <label class="form-label">Deskripsi / Catatan</label>
                <textarea v-model="editForm.description" class="form-control" rows="3" :disabled="store.saving"></textarea>
            </div>
            <div class="form-check">
                <input
                    id="editTtdDigital"
                    v-model="editForm.ttdDigital"
                    class="form-check-input"
                    type="checkbox"
                    :disabled="store.saving"
                >
                <label class="form-check-label" for="editTtdDigital">Tanda Tangan Digital</label>
            </div>
        </div>
        <template #footer>
            <button class="btn btn-outline-secondary" :disabled="store.saving" @click="editDialogVisible = false">
                Batal
            </button>
            <button class="btn btn-primary" :disabled="store.saving" @click="submitEdit">
                <span v-if="store.saving" class="spinner-border spinner-border-sm me-1"></span>
                Simpan
            </button>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useFinanceInvoiceStore } from '~/stores/finance-invoices'
import { usePermissions } from '~/composables/usePermissions'
import { useFormatRupiah } from '~/composables/formatRupiah'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useDebounceFn } from '@vueuse/core'
import { useUserStore } from '~/stores/user'
import {
  applyFinanceInvoicePaymentStatusChange,
  financeInvoiceDateInput,
  financeInvoiceTodayDateInput,
  validateFinanceInvoicePaymentStatus,
} from '~/composables/useFinanceInvoicePaymentStatus'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'

// ── Setup ─────────────────────────────────────────────────────────────────────

const router    = useRouter()
const store     = useFinanceInvoiceStore()
const { setListTitle } = useDynamicTitle()
const { userHasRole, userHasPermission } = usePermissions()
const formatRupiah = useFormatRupiah()
const userStore = useUserStore()
const currentUserId = computed(() => userStore.user?.id ?? null)

// ── Computed from store ────────────────────────────────────────────────────────

const invoices       = computed(() => store.invoices       ?? [])
const billableItems  = computed(() => store.billableItems  ?? [])
const statistics     = computed(() => store.statistics)
const loading        = computed(() => store.loading)
const loadingStats   = computed(() => store.loadingStats)
const loadingBillable= computed(() => store.loadingBillable)
const totalRecords   = computed(() => store.totalRecords)
const totalBillable  = computed(() => store.totalBillable)
const params         = computed(() => store.params)
const billableParams = computed(() => store.billableParams)

const selectedInvoices = ref([])

const clearInvoiceSelection = () => {
  selectedInvoices.value = []
}

const onInvoiceSelectionChange = (e) => {
  selectedInvoices.value = e?.value || []
}

const bulkSendInvoices = async () => {
  const ids = (selectedInvoices.value || []).map((row) => row.id).filter(Boolean)
  const result = await store.sendInvoicesBulk(ids)
  if (result) clearInvoiceSelection()
}
const activeTab      = computed(() => store.activeTab)

// ── Local refs ─────────────────────────────────────────────────────────────────

const invoiceTableRef     = ref(null)
const searchQuery         = ref('')
const billableSearchQuery = ref('')
const rowsOptions         = ref([10, 25, 50, 100])

// filter locals (kept in sync with store.params via watchers)
const filterStatus        = ref('')
const filterSource        = ref('')
const filterDateFrom      = ref('')
const filterDateTo        = ref('')
const filterBillingPeriod = ref('')
const showFilter          = ref(true)
const exportingCsv        = ref(false)

// ── Computed helpers ──────────────────────────────────────────────────────────

const hasActiveFilters = computed(() =>
    store.params.status         ||
    store.params.documentSource ||
    store.params.dateFrom       ||
    store.params.dateTo         ||
    store.params.billingPeriod
)

// ── Formatter helpers ─────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        })
    } catch { return dateStr }
}

const getStatusBadgeClass = (status) => {
    const map = {
        unpaid : 'badge bg-label-danger',
        partial: 'badge bg-label-warning',
        paid   : 'badge bg-label-success',
    }
    return map[status] ?? 'badge bg-label-secondary'
}

const getStatusLabel = (status) => {
    const map = { unpaid: 'Unpaid', partial: 'Partial', paid: 'Lunas' }
    return map[status] ?? status
}

const getSourceBadgeClass = (source) => {
    const map = {
        cron_monthly        : 'badge bg-label-info',
        subscription_signed : 'badge bg-label-primary',
        billing_prep        : 'badge bg-label-success',
        manual              : 'badge bg-label-secondary',
    }
    return map[source] ?? 'badge bg-label-secondary'
}

const getSourceLabel = (source) => {
    const map = {
        cron_monthly        : 'Bulanan (Legacy)',
        subscription_signed : 'Berlangganan',
        billing_prep        : 'Billing Preparation',
        manual              : 'Manual',
    }
    return map[source] ?? source
}

const getDocumentStatusBadge = (status) => {
    const map = {
        draft            : 'badge bg-label-secondary',
        pending_approval : 'badge bg-label-warning',
        approved         : 'badge bg-label-success',
        rejected         : 'badge bg-label-danger',
    }
    return map[status] ?? 'badge bg-label-secondary'
}

const getDocumentStatusLabel = (status) => {
    const map = {
        draft            : 'Draft',
        pending_approval : 'Menunggu Approval',
        approved         : 'Approved',
        rejected         : 'Rejected',
    }
    return map[status] ?? status
}

const toDateInput = (value) => {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
    return d.toISOString().slice(0, 10)
}

const getPriorityBadgeClass = (priority) => {
    const map = { high: 'badge bg-label-danger', medium: 'badge bg-label-warning', low: 'badge bg-label-info' }
    return map[priority] ?? 'badge bg-label-secondary'
}

const getPriorityLabel = (priority) => {
    const map = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' }
    return map[priority] ?? priority
}

const getDueDateClass = (invoice) => {
    if (invoice.status === 'paid') return 'text-muted'
    const today   = new Date()
    const dueDate = new Date(invoice.dueDate)
    if (dueDate < today) return 'text-danger fw-semibold'
    const diff = (dueDate - today) / (1000 * 60 * 60 * 24)
    if (diff <= 7) return 'text-warning fw-semibold'
    return ''
}

// ── Actions ───────────────────────────────────────────────────────────────────

const editDialogVisible = ref(false)
const editForm = ref(null)

const statusOptions = [
    { label: 'Unpaid', value: 'unpaid', description: 'Belum dibayar' },
    { label: 'Partial', value: 'partial', description: 'Dibayar sebagian' },
    { label: 'Paid', value: 'paid', description: 'Lunas' },
]

const viewInvoiceDetail = (invoice) => {
    router.push(`/finance/invoices/detail/${invoice.id}`)
}

const printInvoice = (invoice) => {
    router.push({
        path : '/finance/cetak-invoice',
        query: { id: invoice.id, print: 'true' },
    })
}

const openEditDialog = (invoice) => {
    editForm.value = {
        id         : invoice.id,
        noInvoice : invoice.noInvoice,
        up         : invoice.up || '',
        email      : invoice.email || '',
        date       : toDateInput(invoice.date),
        dueDate   : toDateInput(invoice.dueDate),
        status     : invoice.status || 'unpaid',
        paidAt     : financeInvoiceDateInput(invoice.paidAt),
        description: invoice.description || '',
        ttdDigital: !!invoice.ttdDigital,
        total      : invoice.total,
    }
    applyFinanceInvoicePaymentStatusChange(editForm.value)
    editDialogVisible.value = true
}

watch(
    () => editForm.value?.status,
    () => {
        if (editForm.value) {
            applyFinanceInvoicePaymentStatusChange(editForm.value)
        }
    }
)

const submitEdit = async () => {
    if (!editForm.value?.id) return

    const validationMessage = validateFinanceInvoicePaymentStatus(editForm.value)
    if (validationMessage) {
        useToast().error({
            title: 'Validasi',
            message: validationMessage,
            color: 'red',
            position: 'topRight',
        })
        return
    }

    try {
        const payload = {
            up         : editForm.value.up,
            email      : editForm.value.email,
            date       : editForm.value.date,
            dueDate    : editForm.value.dueDate,
            status     : editForm.value.status,
            description: editForm.value.description,
            ttdDigital : editForm.value.ttdDigital,
        }
        if (editForm.value.status === 'paid') {
            payload.paidAt = editForm.value.paidAt
        }

        await store.updateInvoice(editForm.value.id, payload)
        editDialogVisible.value = false
        await store.fetchInvoices()
    } catch {
        // toast sudah ditampilkan di store
    }
}

const sendInvoice = async (invoice) => {
    await store.sendInvoice(invoice.id)
}

const isCurrentApprover = (invoice) => {
    const approvers = invoice?.currentApprovers || []
    const uid = currentUserId.value
    if (uid == null) return false
    return approvers.length === 0 || approvers.some((a) => Number(a.userId) === Number(uid))
}

const canSubmitInvoice = (invoice) => {
    if (!(userHasRole('superadmin') || userHasPermission('edit_invoice'))) return false
    return invoice?.documentStatus === 'draft' || invoice?.documentStatus === 'rejected'
}

const canApproveInvoice = (invoice) => {
    if (!(userHasRole('superadmin') || userHasPermission('approve_invoice'))) return false
    if (invoice?.documentStatus !== 'pending_approval') return false
    if (userHasRole('superadmin')) return true
    return isCurrentApprover(invoice)
}

const canRejectInvoice = (invoice) => {
    if (!(userHasRole('superadmin') || userHasPermission('reject_invoice'))) return false
    if (invoice?.documentStatus !== 'pending_approval') return false
    if (userHasRole('superadmin')) return true
    return isCurrentApprover(invoice)
}

const submitInvoice = async (invoice) => {
    const ok = await store.submitInvoice(invoice.id)
    if (ok) await store.fetchInvoices()
}

const approveInvoice = async (invoice) => {
    const result = await Swal.fire({
        title: 'Approve Invoice',
        input: 'textarea',
        inputLabel: 'Catatan (opsional)',
        inputPlaceholder: 'Tulis catatan approval jika diperlukan...',
        showCancelButton: true,
        confirmButtonText: 'Approve',
        cancelButtonText: 'Batal',
    })
    if (!result.isConfirmed) return
    const ok = await store.approveInvoice(invoice.id, result.value || '', true)
    if (ok) await store.fetchInvoices()
}

const rejectInvoice = async (invoice) => {
    const result = await Swal.fire({
        title: 'Reject Invoice',
        input: 'textarea',
        inputLabel: 'Alasan penolakan',
        inputPlaceholder: 'Tulis alasan reject...',
        inputValidator: (value) => (!value ? 'Alasan wajib diisi' : undefined),
        showCancelButton: true,
        confirmButtonText: 'Reject',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ea5455',
    })
    if (!result.isConfirmed) return
    const ok = await store.rejectInvoice(invoice.id, result.value || '', true)
    if (ok) await store.fetchInvoices()
}

const deleteInvoice = async (invoice) => {
    const ok = await store.deleteInvoice(invoice.id)
    if (ok) await store.fetchStatistics()
}

const goToArReceipt = (invoice) => {
    router.push({
        path : '/finance/ar-receipts',
        query: {
            invoiceId : invoice.id,
            customerId: invoice.customerId,
        },
    })
}

const goToSiteInvestment = (item) => {
    router.push(`/sales/site-investment/${item.id}`)
}

const applyFilter = (key, value) => {
    store.setFilter(key, value || '')
}

const resetFilters = () => {
    filterStatus.value        = ''
    filterSource.value        = ''
    filterDateFrom.value      = ''
    filterDateTo.value        = ''
    filterBillingPeriod.value = ''
    store.resetFilters()
}

const csvCell = (value) => {
    const str = value === null || value === undefined ? '' : String(value)
    return `"${str.replace(/"/g, '""')}"`
}

const exportCSV = async () => {
    const toast = useToast()
    exportingCsv.value = true

    try {
        const data = await store.fetchAllInvoicesForExport()

        if (!data.length) {
            toast.warning({
                title: 'Peringatan',
                message: 'Tidak ada data untuk diexport',
                color: 'orange',
                position: 'topRight',
            })
            return
        }

        const headers = [
            'No Invoice',
            'Periode Billing',
            'Pelanggan',
            'Email Pelanggan',
            'Tanggal',
            'Jatuh Tempo',
            'Status Pembayaran',
            'Status Dokumen',
            'Sumber',
            'Produk / Deskripsi Item',
            'SKU',
            'Qty',
            'Harga Satuan',
            'Subtotal Item',
            'DPP',
            'Diskon (%)',
            'Pajak (%)',
            'Materai',
            'Total Invoice',
            'Dibayar',
            'Sisa Tagihan',
        ]

        const lines = [`\uFEFF${headers.map(csvCell).join(',')}`]

        for (const inv of data) {
            const items = inv.salesInvoiceItems?.length
                ? inv.salesInvoiceItems
                : [null]

            const invoiceBase = [
                inv.noInvoice ?? '',
                inv.billingPeriod ?? '',
                inv.customer?.name ?? '',
                inv.customer?.email ?? inv.email ?? '',
                formatDate(inv.date),
                formatDate(inv.dueDate),
                getStatusLabel(inv.status),
                getDocumentStatusLabel(inv.documentStatus),
                getSourceLabel(inv.documentSource),
            ]

            const nominals = [
                inv.dpp ?? 0,
                inv.discountPercent ?? 0,
                inv.taxPercent ?? 0,
                inv.materaiAmount ?? 0,
                inv.total ?? 0,
                inv.paidAmount ?? 0,
                inv.remainingAmount ?? 0,
            ]

            for (const item of items) {
                const productName =
                    item?.product?.name ||
                    item?.description ||
                    (item ? '—' : 'Tidak ada item')

                const row = [
                    ...invoiceBase,
                    productName,
                    item?.product?.sku ?? '',
                    item?.quantity ?? '',
                    item?.price ?? '',
                    item?.subtotal ?? '',
                    ...nominals,
                ]
                lines.push(row.map(csvCell).join(','))
            }
        }

        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.href = url
        link.download = `finance-invoices_${new Date().toISOString().slice(0, 10)}.csv`
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success({
            title: 'Berhasil',
            message: `CSV berhasil diunduh (${data.length} invoice)`,
            color: 'green',
            position: 'topRight',
        })
    } catch (error) {
        toast.error({
            title: 'Error',
            message: `Gagal export CSV: ${error?.message || 'Unknown error'}`,
            color: 'red',
            position: 'topRight',
        })
    } finally {
        exportingCsv.value = false
    }
}

// ── Table event handlers ──────────────────────────────────────────────────────

const onPage = (event) => {
  clearInvoiceSelection()
  store.setPagination(event)
}
const onSort = (event) => store.setSort(event)

const handleRowsChange = (value) => {
    const rows = Number(value) || 10
    store.params.rows  = rows
    store.params.first = 0
    clearInvoiceSelection()
    store.fetchInvoices()
}

const onBillablePage = (event) => store.setBillablePagination(event)

const handleBillableRowsChange = (value) => {
    const rows = Number(value) || 10
    store.billableParams.rows  = rows
    store.billableParams.first = 0
    store.fetchBillableItems()
}

// ── Search debounce ───────────────────────────────────────────────────────────

const debouncedInvoiceSearch  = useDebounceFn(() => store.setSearch(searchQuery.value), 500)
const debouncedBillableSearch = useDebounceFn(() => store.setBillableSearch(billableSearchQuery.value), 500)

watch(searchQuery,        debouncedInvoiceSearch)
watch(billableSearchQuery, debouncedBillableSearch)

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(async () => {
    const route = useRoute()
    const qs = route.query.documentSource
    if (typeof qs === 'string' && qs) {
        filterSource.value = qs
        applyFilter('documentSource', qs)
    } else {
        await Promise.all([
            store.fetchInvoices(),
            store.fetchStatistics(),
        ])
    }
    setListTitle('Finance Invoice', totalRecords.value)
})

// ── Page Meta ─────────────────────────────────────────────────────────────────

definePageMeta({
    layout     : 'default',
    middleware : ['auth', 'check-permission'],
    title      : 'Finance Invoice',
    description: 'Manajemen tagihan pelanggan untuk perangkat aktif di lokasi',
    keywords   : 'Finance, Invoice, Tagihan, Perangkat Aktif, Sinergi Innovate Pratama',
    author     : 'Sinergi Innovate Pratama',
    robots     : 'index, follow',
    viewport   : 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0',
})
</script>

<style scoped>
.nav-tabs .nav-link {
    border-radius: 0;
    border-bottom: none;
    color: var(--bs-secondary-color);
}
.nav-tabs .nav-link.active {
    color: var(--bs-primary);
    border-bottom: 2px solid var(--bs-primary);
    font-weight: 600;
}
.skeleton-loader {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}
@keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.invoice-filter-card {
    border: 0;
    box-shadow: 0 2px 6px rgba(67, 89, 113, 0.12);
}

.invoice-filter-grid {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1.5rem;
    align-items: start;
}

.invoice-filter-field:nth-child(1),
.invoice-filter-field:nth-child(2) {
    grid-column: span 3;
}

.invoice-filter-field:nth-child(3),
.invoice-filter-field:nth-child(4),
.invoice-filter-field:nth-child(5) {
    grid-column: span 2;
}

.invoice-filter-field .form-label {
    display: block;
    margin-bottom: 0.375rem;
    font-size: 0.8125rem;
    color: #697a8d;
}

.invoice-filter-field .form-control,
.invoice-filter-field .form-select {
    width: 100%;
    min-height: 2.375rem;
}

@media (max-width: 1199.98px) {
    .invoice-filter-grid {
        grid-template-columns: repeat(6, minmax(0, 1fr));
    }

    .invoice-filter-field:nth-child(1),
    .invoice-filter-field:nth-child(2) {
        grid-column: span 3;
    }

    .invoice-filter-field:nth-child(3),
    .invoice-filter-field:nth-child(4),
    .invoice-filter-field:nth-child(5) {
        grid-column: span 2;
    }
}

@media (max-width: 767.98px) {
    .invoice-filter-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .invoice-filter-field:nth-child(n) {
        grid-column: span 1;
    }
}

/* Dropdown aksi: fixed strategy agar tidak ter-clip overflow datatable */
:deep(.invoice-actions-dropdown) {
    z-index: 1100 !important;
}
</style>
