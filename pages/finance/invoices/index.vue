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
            <div class="card mb-6">
                <div
                    class="card-header d-flex justify-content-between align-items-center"
                    style="cursor:pointer"
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
                    <div class="row g-4">
                        <div class="col-md-3">
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
                        <div class="col-md-3">
                            <label class="form-label">Sumber Invoice</label>
                            <select
                                class="form-select"
                                v-model="filterSource"
                                @change="applyFilter('documentSource', filterSource)"
                            >
                                <option value="">Semua Sumber</option>
                                <option value="manual">Manual</option>
                                <option value="cron_monthly">Bulanan (Otomatis)</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Tanggal Dari</label>
                            <input
                                type="date"
                                class="form-control"
                                v-model="filterDateFrom"
                                @change="applyFilter('dateFrom', filterDateFrom)"
                            />
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Tanggal Sampai</label>
                            <input
                                type="date"
                                class="form-control"
                                v-model="filterDateTo"
                                @change="applyFilter('dateTo', filterDateTo)"
                            />
                        </div>
                        <div class="col-md-2">
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
                        <button class="btn btn-outline-secondary btn-sm" @click="resetFilters">
                            <i class="ri-refresh-line me-1"></i> Reset Filter
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
                                </div>
                                <div class="d-flex align-items-center gap-2">
                                    <button
                                        class="btn btn-outline-secondary btn-sm"
                                        @click="exportCSV"
                                    >
                                        <i class="ri-download-line me-1"></i> Export
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
                                    :data="invoices"
                                    :rows="Number(params.rows)"
                                    :loading="loading"
                                    :totalRecords="totalRecords"
                                    :first="params.first"
                                    :lazy="true"
                                    @page="onPage"
                                    @sort="onSort"
                                    responsiveLayout="scroll"
                                    paginatorPosition="bottom"
                                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                                    currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                                >
                                    <!-- No -->
                                    <Column header="#" :sortable="false" style="width:50px">
                                        <template #body="slotProps">
                                            {{ params.first + slotProps.index + 1 }}
                                        </template>
                                    </Column>

                                    <!-- No Invoice -->
                                    <Column field="no_invoice" header="No Invoice" :sortable="true" style="min-width:160px">
                                        <template #body="slotProps">
                                            <div>
                                                <span class="fw-semibold text-primary">
                                                    {{ slotProps.data.no_invoice }}
                                                </span>
                                                <div v-if="slotProps.data.billing_period" class="text-muted small">
                                                    <i class="ri-calendar-line me-1"></i>
                                                    {{ slotProps.data.billing_period }}
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
                                    <Column field="due_date" header="Jatuh Tempo" :sortable="true" style="min-width:130px">
                                        <template #body="slotProps">
                                            <span :class="getDueDateClass(slotProps.data)">
                                                {{ formatDate(slotProps.data.due_date) }}
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
                                    <Column field="remaining_amount" header="Sisa Tagihan" :sortable="true" style="min-width:140px">
                                        <template #body="slotProps">
                                            <span
                                                class="fw-semibold"
                                                :class="slotProps.data.remaining_amount > 0 ? 'text-danger' : 'text-success'"
                                            >
                                                {{ formatRupiah(slotProps.data.remaining_amount) }}
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

                                    <!-- Sumber -->
                                    <Column field="document_source" header="Sumber" :sortable="true" style="min-width:120px">
                                        <template #body="slotProps">
                                            <span :class="getSourceBadgeClass(slotProps.data.document_source)">
                                                {{ getSourceLabel(slotProps.data.document_source) }}
                                            </span>
                                        </template>
                                    </Column>

                                    <!-- Actions -->
                                    <Column header="Aksi" :exportable="false" style="min-width:100px">
                                        <template #body="slotProps">
                                            <div class="d-inline-block">
                                                <a
                                                    href="javascript:;"
                                                    class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                                                    data-bs-toggle="dropdown"
                                                >
                                                    <i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu">
                                                    <li>
                                                        <a
                                                            class="dropdown-item"
                                                            href="javascript:void(0)"
                                                            @click="viewInvoiceDetail(slotProps.data)"
                                                        >
                                                            <i class="ri-eye-line me-2"></i> Lihat Detail
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
                                    <Column field="si_number" header="No. SI" style="min-width:140px">
                                        <template #body="slotProps">
                                            <span class="fw-semibold text-primary">
                                                {{ slotProps.data.si_number }}
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
                                    <Column field="business_scheme.name" header="Skema" style="min-width:130px">
                                        <template #body="slotProps">
                                            <span v-if="slotProps.data.business_scheme" class="badge bg-label-secondary">
                                                {{ slotProps.data.business_scheme.name }}
                                            </span>
                                            <span v-else class="text-muted">—</span>
                                        </template>
                                    </Column>

                                    <!-- Grand Total -->
                                    <Column field="grand_total" header="Grand Total" style="min-width:150px">
                                        <template #body="slotProps">
                                            <span class="fw-semibold">
                                                {{ formatRupiah(slotProps.data.grand_total) }}
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
                                    <Column field="approved_at" header="Disetujui" style="min-width:120px">
                                        <template #body="slotProps">
                                            <span class="text-muted small">
                                                {{ formatDate(slotProps.data.approved_at) }}
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceInvoiceStore } from '~/stores/finance-invoices'
import { usePermissions } from '~/composables/usePermissions'
import { useFormatRupiah } from '~/composables/formatRupiah'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useDebounceFn } from '@vueuse/core'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'

// ── Setup ─────────────────────────────────────────────────────────────────────

const router    = useRouter()
const store     = useFinanceInvoiceStore()
const { setListTitle } = useDynamicTitle()
const { userHasRole, userHasPermission } = usePermissions()
const formatRupiah = useFormatRupiah()

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
const activeTab      = computed(() => store.activeTab)

// ── Local refs ─────────────────────────────────────────────────────────────────

const invoiceTableRef     = ref(null)
const showFilter          = ref(false)
const searchQuery         = ref('')
const billableSearchQuery = ref('')
const rowsOptions         = ref([10, 25, 50, 100])

// filter locals (kept in sync with store.params via watchers)
const filterStatus        = ref('')
const filterSource        = ref('')
const filterDateFrom      = ref('')
const filterDateTo        = ref('')
const filterBillingPeriod = ref('')

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
    return source === 'cron_monthly'
        ? 'badge bg-label-info'
        : 'badge bg-label-secondary'
}

const getSourceLabel = (source) => {
    return source === 'cron_monthly' ? 'Bulanan' : 'Manual'
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
    const dueDate = new Date(invoice.due_date)
    if (dueDate < today) return 'text-danger fw-semibold'
    const diff = (dueDate - today) / (1000 * 60 * 60 * 24)
    if (diff <= 7) return 'text-warning fw-semibold'
    return ''
}

// ── Actions ───────────────────────────────────────────────────────────────────

const viewInvoiceDetail = (invoice) => {
    router.push(`/sales/sales-invoice/${invoice.id}`)
}

const goToArReceipt = (invoice) => {
    router.push({
        path : '/finance/ar-receipts',
        query: {
            invoiceId : invoice.id,
            customerId: invoice.customer_id,
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

const exportCSV = () => {
    invoiceTableRef.value?.exportCSV()
}

// ── Table event handlers ──────────────────────────────────────────────────────

const onPage = (event) => store.setPagination(event)
const onSort = (event) => store.setSort(event)

const handleRowsChange = (value) => {
    const rows = Number(value) || 10
    store.params.rows  = rows
    store.params.first = 0
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
    await Promise.all([
        store.fetchInvoices(),
        store.fetchStatistics(),
    ])
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
</style>
