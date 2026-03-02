<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">List Purchase Invoice</h4>
            <p class="mb-6">
            List Purchase Invoice yang terdaftar di sistem
            </p>
            <!-- purchaseInvoice cards -->
            <div class="row g-6 mb-6">
                <!-- Dynamic cards for invoice statistics -->
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h5 class="mb-1">Total Invoices</h5>
                                <span class="badge bg-label-primary rounded-pill">All Time</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <h1 class="mb-0 display-4">{{ statistics?.counts?.total || 0 }}</h1>
                                <div class="ms-2">
                                    <div class="d-flex align-items-center">
                                        <i class="ri-file-list-3-line ri-24px text-primary"></i>
                                    </div>
                                </div>
                            </div>
                            <p class="mb-0 mt-2">Total invoice yang dibuat</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h5 class="mb-1">Unpaid Invoices</h5>
                                <span class="badge bg-label-danger rounded-pill">{{ statistics?.percentages?.unpaid || 0 }}%</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <h1 class="mb-0 display-4">{{ statistics?.counts?.unpaid || 0 }}</h1>
                                <div class="ms-2">
                                    <div class="d-flex align-items-center">
                                        <i class="ri-close-circle-line ri-24px text-danger"></i>
                                    </div>
                                </div>
                            </div>
                            <p class="mb-0 mt-2"> {{ formatRupiah(statistics?.amounts?.unpaid || 0) }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h5 class="mb-1">Partial Invoices</h5>
                                <span class="badge bg-label-warning rounded-pill">{{ statistics?.percentages?.partial || 0 }}%</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <h1 class="mb-0 display-4">{{ statistics?.counts?.partial || 0 }}</h1>
                                <div class="ms-2">
                                    <div class="d-flex align-items-center">
                                        <i class="ri-time-line ri-24px text-warning"></i>
                                    </div>
                                </div>
                            </div>
                            <p class="mb-0 mt-2"> {{ formatRupiah(statistics?.amounts?.partial || 0) }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h5 class="mb-1">Paid Invoices</h5>
                                <span class="badge bg-label-success rounded-pill">{{ statistics?.percentages?.paid || 0 }}%</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <h1 class="mb-0 display-4">{{ statistics?.counts?.paid || 0 }}</h1>
                                <div class="ms-2">
                                    <div class="d-flex align-items-center">
                                        <i class="ri-checkbox-circle-line ri-24px text-success"></i>
                                    </div>
                                </div>
                            </div>
                            <p class="mb-0 mt-2"> {{ formatRupiah(statistics?.amounts?.paid || 0) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Outstanding Amount Card -->
            <div class="row g-6 mb-6">
                <div class="col-6">
                    <div class="card border-warning">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h5 class="mb-1 text-warning">
                                        <i class="ri-alert-line me-2"></i>
                                        Total Outstanding
                                    </h5>
                                    <p class="mb-0 text-muted">Total invoice yang belum lunas (unpaid + partial)</p>
                                </div>
                                <div class="col-md-4 text-end">
                                    <h4 class="mb-0 text-warning"> {{ formatRupiah(statistics?.amounts?.outstanding || 0) }}</h4>
                                    <small class="text-muted">{{ (statistics?.counts?.unpaid || 0) + (statistics?.counts?.partial || 0) }} invoices</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h5 class="mb-1">Buat Purchase Invoice Baru</h5>
                                    <p class="mb-0 text-muted">Tambahkan invoice baru untuk customer Anda</p>
                                </div>
                                <div class="col-md-4 text-end">
                                    <button v-if="userHasRole('superadmin') || userHasPermission('create_purchase_invoice')" @click="purchaseInvoiceStore.openModal(null, 'admin')" class="btn btn-primary btn-sm me-2">
                                        <i class="ri-add-line me-2"></i>
                                        Tambah Purchase Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Total & Filter Purchase Invoice</h4>
                    <p class="mb-0">Temukan semua akun administrator perusahaan Anda dan Purchase Invoice terkait.</p>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <CustomSelect2 v-model="filters.vendorId" :options="vendors" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Vendor" />
                                </div>
                                <div class="col-md-6 mb-3">
                                    <CustomSelect2 v-model="filters.status" :options="statusOptions" :get-option-label="option => option?.label || 'Unknown Status'" :reduce="option => option.value" searchable clearable placeholder="Pilih Status" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <!-- purchaseInvoice Table -->
                    <div class="card">
                        <div class="card-header">
                            <TableControls
                                v-model="tableControls"
                                :rows-per-page-options="rowsPerPageOptionsArray"
                                search-placeholder="Cari Purchase Order..."
                                @rows-change="handleRowsChange"
                                @search="handleSearch"
                                @export="exportData"
                            />
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="purchaseInvoices"
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
                                    <Column field="noInvoice" header="No. Invoice" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <a 
                                                @click="navigateTo(`/purchasing/purchase-invoice-detail?id=${slotProps.data.id}`)" 
                                                style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                                class="text-primary"
                                                title="View detail"
                                            >
                                                {{ slotProps.data.noInvoice || '-' }}
                                            </a>
                                        </template>
                                    </Column>
                                    <Column field="perusahaan.nmPerusahaan" header="Perusahaan" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.perusahaan?.nmPerusahaan || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="cabang.nmCabang" header="Cabang" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.cabang?.nmCabang || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="purchaseOrder.noPo" header="No. PO" :sortable="true">
                                        <template #body="slotProps">
                                            <span v-if="slotProps.data.purchaseOrder?.noPo && slotProps.data.purchaseOrder?.id">
                                                <a :href="`/purchasing/purchase-order-detail?id=${slotProps.data.purchaseOrder.id}`" class="text-primary"
                                                style="text-decoration: underline;"
                                                title="Lihat Purchase Order"
                                                >
                                                    {{ slotProps.data.purchaseOrder.noPo }}
                                                </a>
                                            </span>
                                            <span v-else>
                                                -
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="vendor.name" header="Vendor" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.vendor?.name || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="email" header="Email Penagihan" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.email || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="paymentDate" header="Tanggal" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.paymentDate ? new Date(slotProps.data.paymentDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
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
                                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                                        <template #body="slotProps">
                                            <div class="d-inline-block">
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu">
                                                    <li v-if="userHasRole('superadmin') || userHasPermission('view_purchase_invoice')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="viewPurchaseInvoiceDetails(slotProps.data.id)">
                                                            <i class="ri-eye-line me-2"></i> Lihat Detail
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || userHasPermission('edit_purchase_invoice') && (slotProps.data.status == 'unpaid' || slotProps.data.status == 'partial')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="purchaseInvoiceStore.openModal(slotProps.data, 'admin')">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || userHasPermission('delete_purchase_invoice')">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="purchaseInvoiceStore.deletePurchaseInvoice(slotProps.data.id)">
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
                    <!--/ purchaseInvoice Table -->
                </div>
            </div>
            <!--/ purchaseInvoice cards -->

            <Modal 
                id="PurchaseInvoiceModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="purchaseInvoiceStore.savePurchaseInvoice()">
                         <div class="row">
                            <div class="col">
                                <ul class="nav nav-tabs" role="tablist">
                                    <li class="nav-item">
                                        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#form-tabs-info" role="tab" aria-selected="true" type="button">
                                            <span class="ri-user-line ri-20px d-sm-none"></span>
                                            <span class="d-none d-sm-block">Informasi Purchase Invoice</span>
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
                        <div class="tab-content pt-6">
                            <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                                <div class="row g-4">
                                    <div class="col-md-6">
                                        <CustomSelect2 
                                            v-model="form.purchaseOrderId" 
                                            :options="purchaseOrders || []" 
                                            :get-option-label="getPurchaseOrderLabel" 
                                            :reduce="option => option.id" 
                                            placeholder="Pilih Purchase Order"
                                            searchable
                                            clearable
                                            :loading="loading"
                                        >
                                            <template #option="{ option }">
                                                <div class="d-flex justify-content-between align-items-center w-100">
                                                    <div>
                                                        <div class="fw-bold">{{ option.noPo || 'No PO Number' }}</div>
                                                        <small class="text-muted">{{ option.vendor?.name || 'No Vendor Data' }}</small>
                                                    </div>
                                                    <div class="text-end">
                                                        <small class="text-muted">{{ formatDate(option.date) }}</small>
                                                    </div>
                                                </div>
                                            </template>
                                        </CustomSelect2>
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 v-model="form.vendorId" :options="vendors" :get-option-label="option => option.name" :reduce="option => option.id" searchable clearable placeholder="Pilih Vendor"  :disabled="!!form.purchaseOrderId"/>
                                        <div v-if="form.purchaseOrderId" class="form-text mt-1">
                                            <small class="text-muted">📋 Vendor diambil dari Purchase Order yang dipilih</small>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 v-model="form.perusahaanId" :options="perusahaans" :get-option-label="option => option.nmPerusahaan" :reduce="option => option.id" searchable clearable placeholder="Pilih Perusahaan"  @update:modelValue="onPerusahaanChange"/>
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 v-model="form.cabangId" :options="filteredCabangs" :get-option-label="option => option.nmCabang" :reduce="option => option.id" searchable clearable placeholder="Pilih Cabang"  :disabled="!form.perusahaanId"/>
                                        <div v-if="!form.perusahaanId" class="form-text mt-1">
                                            <small class="text-muted">⚠️ Pilih perusahaan terlebih dahulu</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="form.paymentDate" class="form-control" >
                                            <label>Tanggal Pembayaran</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" v-model="form.up" class="form-control" placeholder="UP">
                                            <label>UP</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" v-model="form.email" class="form-control" placeholder="Email">
                                            <label>Email Penagihan</label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <CustomSelect2 v-model="form.status" :options="statusOptions"
                                            :get-option-label="option => option?.label || 'Unknown Status'"
                                            :reduce="option => option.value" searchable clearable
                                            placeholder="-- Pilih Status --"
                                            id="status"
                                            class="status"
                                        />   
                                    </div>
                                    <div class="col-md-3">
                                        <CustomSelect2 v-model="form.paymentMethod" :options="paymentMethodOptions"
                                            :get-option-label="option => option?.label || 'Unknown Payment Method'"
                                            :reduce="option => option.value" searchable clearable
                                            placeholder="-- Pilih Metode Pembayaran --"
                                            id="paymentMethod"
                                            
                                            :clearable="false"
                                        />   
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="number" v-model="form.discountPercent" class="form-control" placeholder="Discount (%)" :readonly="!!form.purchaseOrderId">
                                            <label>Discount Pembayaran (%)</label>
                                            <div v-if="form.purchaseOrderId" class="form-text">
                                                <small class="text-muted">Diambil dari Purchase Order</small>
                                            </div>
                                            <div class="form-text mt-1">
                                                <small class="text-muted">{{ formatRupiah(discountAmount) }}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="number" v-model="form.taxPercent" class="form-control" placeholder="Tax (%)" :readonly="!!form.purchaseOrderId">
                                            <label>Tax Pembayaran (%)</label>
                                            <div v-if="form.purchaseOrderId" class="form-text">
                                                <small class="text-muted">Diambil dari Purchase Order</small>
                                            </div>
                                            <div class="form-text mt-1">
                                                <small class="text-muted">{{ formatRupiah(taxAmount) }}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" :value="formatRupiah(form.total)" @input="updateTotalFromInput" class="form-control" placeholder="Total" :readonly="!!form.purchaseOrderId">
                                            <label>Total Pembayaran</label>
                                            <div v-if="form.purchaseOrderId" class="form-text">
                                                <small class="text-muted">Diambil dari Purchase Order</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" :value="formatRupiah(form.dpp)" class="form-control" placeholder="DPP" readonly>
                                            <label>DPP (Dasar Pengenaan Pajak)</label>
                                            <div class="form-text">
                                                <small class="text-muted">Otomatis: Subtotal Items × 11/12</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" :value="formatRupiah(form.paidAmount)" @input="updatePaidAmountFromInput" class="form-control" placeholder="Paid Amount" >
                                            <label>Paid Amount</label>
                                            <div v-if="!isPaidAmountValid" class="invalid-feedback">
                                                <template v-if="form.status === 'unpaid'">Paid amount harus 0 untuk status unpaid</template>
                                                <template v-else-if="form.status === 'paid'">Paid amount harus sama dengan grand total ({{ formatRupiah(grandTotal) }}) untuk status paid</template>
                                                <template v-else-if="form.status === 'partial'">Paid amount harus lebih dari 0 dan kurang dari grand total ({{ formatRupiah(grandTotal) }}) untuk status partial</template>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" :value="formatRupiah(computedRemainingAmount)" class="form-control" readonly>
                                            <label>Sisa Pembayaran</label>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="form-floating form-floating-outline">
                                            <textarea v-model="form.description" class="form-control" placeholder="Deskripsi Invoice"></textarea>
                                            <label>Deskripsi Invoice</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card border-primary">
                                            <div class="card-header">
                                                <h6 class="mb-0">💰 Ringkasan Pembayaran</h6>
                                            </div>
                                            <div class="card-body mt-3">
                                                <div class="row text-sm">
                                                    <div class="col-6">
                                                        <div class="mb-2">
                                                            <span class="text-muted">Subtotal:</span><br>
                                                            <strong>{{ formatRupiah(form.total) }}</strong>
                                                        </div>
                                                        <div v-if="form.purchaseOrderId" class="mb-2">
                                                            <span class="text-muted">Total dari PO (sudah termasuk PPN):</span><br>
                                                            <strong class="text-info">{{ formatRupiah(form.total) }}</strong>
                                                        </div>
                                                        <div class="mb-2">
                                                            <span class="text-muted">DPP (Subtotal × 11/12):</span><br>
                                                            <strong class="text-info">{{ formatRupiah(form.dpp) }}</strong>
                                                        </div>
                                                        <div v-if="!form.purchaseOrderId" class="mb-2">
                                                            <span class="text-muted">Discount ({{ form.discountPercent }}%):</span><br>
                                                            <strong class="text-danger">-{{ formatRupiah(discountAmount) }}</strong>
                                                        </div>
                                                        <div v-if="!form.purchaseOrderId" class="mb-2">
                                                            <span class="text-muted">Tax ({{ form.taxPercent }}%):</span><br>
                                                            <strong class="text-success">+{{ formatRupiah(taxAmount) }}</strong>
                                                        </div>
                                                        <hr class="my-2">
                                                        <div class="mb-2">
                                                            <span class="text-muted">Grand Total:</span><br>
                                                            <strong class="fs-5 text-primary">{{ formatRupiah(grandTotal) }}</strong>
                                                        </div>
                                                    </div>
                                                    <div class="col-6">
                                                        <div class="mb-2">
                                                            <span class="text-muted">Status:</span><br>
                                                            <span >{{ form.status?.toUpperCase() || 'UNKNOWN' }}</span>
                                                        </div>
                                                        <div class="mb-2">
                                                            <span class="text-muted">Paid Amount:</span><br>
                                                            <strong class="text-success">{{ formatRupiah(form.paidAmount) }}</strong>
                                                        </div>
                                                        <div class="mb-2">
                                                            <span class="text-muted">Remaining:</span><br>
                                                            <strong >
                                                                {{ formatRupiah(computedRemainingAmount) }}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="alert alert-info">
                                            <div class="d-flex align-items-center">
                                                <div class="me-2">
                                                    <i class="ri-information-line ri-24px"></i>
                                                </div>
                                                <div>
                                                    <strong>Info Pembayaran:</strong><br>
                                                    <small class="text-muted">
                                                        <template v-if="form.purchaseOrderId">
                                                            • Total diambil dari Purchase Order (sudah termasuk PPN)<br>
                                                            • Status akan otomatis berubah berdasarkan jumlah pembayaran<br>
                                                            • Unpaid: Rp 0 | Partial: Sebagian | Paid: Lunas
                                                        </template>
                                                        <template v-else>
                                                            • PPN akan dihitung otomatis berdasarkan subtotal<br>
                                                            • Status akan otomatis berubah berdasarkan jumlah pembayaran<br>
                                                            • Unpaid: Rp 0 | Partial: Sebagian | Paid: Lunas
                                                        </template>
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="form-tabs-items" role="tabpanel">

                                <!-- ✅ NEW: Info items dari Purchase Order -->
                                <div v-if="form.purchaseOrderId && form.purchaseInvoiceItems && form.purchaseInvoiceItems.length > 0" class="alert alert-info mb-4">
                                    <div class="d-flex align-items-center">
                                        <div class="me-2">
                                            <i class="ri-information-line ri-24px"></i>
                                        </div>
                                        <div>
                                            <strong>Items dari Purchase Order:</strong><br>
                                            <small class="text-muted">
                                                Items berikut diambil otomatis dari Purchase Order yang dipilih. 
                                                Semua items akan ditampilkan tanpa validasi status.
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- ✅ NEW: Info jika tidak ada items -->
                                <div v-if="form.purchaseOrderId && (!form.purchaseInvoiceItems || form.purchaseInvoiceItems.length === 0)" class="alert alert-warning mb-4">
                                    <div class="d-flex align-items-center">
                                        <div class="me-2">
                                            <i class="ri-alert-line ri-24px"></i>
                                        </div>
                                        <div>
                                            <strong>Tidak ada items yang tersedia:</strong><br>
                                            <small class="text-muted">
                                                Purchase Order yang dipilih tidak memiliki items. 
                                                Silakan pilih Purchase Order lain atau buat items secara manual.
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                
                                <div v-for="(item, index) in (form.purchaseInvoiceItems || [])" :key="index" class="repeater-item mb-4">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <CustomSelect2 v-model="item.productId" :options="getProductOptions(item)" 
                                                :get-option-label="option => option?.name || option?.label || 'Unknown Product'" searchable clearable 
                                                :reduce="p => p.id" 
                                                placeholder="Pilih Produk" 
                                                @update:modelValue="onProductChange(index)" 
                                                
                                                :disabled="!!form.purchaseOrderId"
                                            />
                                        </div>
                                        <div class="col-md-6">
                                            <CustomSelect2 v-model="item.warehouseId" :options="getWarehouseOptions(item)" 
                                                :get-option-label="option => option?.name || option?.label || 'Unknown Warehouse'" searchable clearable 
                                                :reduce="w => w.id" 
                                                placeholder="Pilih Gudang" 
                                                 
                                                @update:modelValue="updateStockInfo(index)"
                                                :disabled="!!form.purchaseOrderId"
                                            />
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="number" v-model.number="item.quantity" @input="onQuantityChange(index)" class="form-control" placeholder="Qty" step="1" min="0" :readonly="!!form.purchaseOrderId">
                                                <label>Jumlah</label>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="number" v-model.number="item.receivedQty" @input="onReceivedQtyChange(index)" class="form-control" placeholder="Received Qty" step="1" min="0">
                                                <label>Received Qty</label>
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
                                                <input type="text" v-model="item.description" class="form-control" placeholder="Deskripsi item" :readonly="!!form.purchaseOrderId">
                                                <label>Deskripsi</label>
                                            </div>
                                        </div>
                                        <div class="col-md-3 d-flex align-items-center">
                                            <button @click.prevent="removePurchaseInvoiceItem(index)" class="btn btn-outline-danger w-100" :disabled="!!form.purchaseOrderId">Hapus</button>
                                        </div>
                                    </div>
                                    <hr class="my-4">
                                </div>
                                
                                <!-- ✅ NEW: Tombol tambah item hanya jika tidak ada purchase order -->
                                <div class="mt-4" v-if="!form.purchaseOrderId">
                                    <button @click.prevent="addPurchaseInvoiceItem()" class="btn btn-primary">Tambah Item</button>
                                </div>
                                
                                <div class="d-flex justify-content-end mt-4">
                                    <div class="text-end">
                                        <div class="mb-2">
                                            <span class="fw-medium">Subtotal Items: {{ formatRupiah(purchaseInvoiceItemsTotal) }}</span>
                                        </div>
                                        <div class="fw-bold fs-5">Grand Total: {{ formatRupiah(grandTotal) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer mt-6">
                             <button type="button" class="btn btn-outline-secondary" @click="purchaseInvoiceStore.closeModal()">Tutup</button>
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
import { usePurchaseInvoiceStore } from '~/stores/purchase-invoice'
import { useVendorStore } from '~/stores/vendor'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { useCabangStore } from '~/stores/cabang'
import { useProductStore } from '~/stores/product'
import { useWarehouseStore } from '~/stores/warehouse'
import { useStocksStore } from '~/stores/stocks'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { usePurchaseOrderStore } from '~/stores/purchaseOrder'
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
import Swal from 'sweetalert2'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()

const config = useRuntimeConfig();
const router = useRouter();

// Store
const myDataTableRef                     = ref(null)
const purchaseInvoiceStore               = usePurchaseInvoiceStore()
const vendorStore                        = useVendorStore()
const perusahaanStore                    = usePerusahaanStore()
const warehouseStore                     = useWarehouseStore()
const cabangStore                        = useCabangStore()
const productStore                       = useProductStore()
const userStore                          = useUserStore()
const formatRupiah                       = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions();
const permissionStore                    = usePermissionsStore()
const purchaseOrderStore                 = usePurchaseOrderStore()

const { purchaseInvoices, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, statistics } = storeToRefs(purchaseInvoiceStore)
const { vendors }   = storeToRefs(vendorStore)
const { perusahaans } = storeToRefs(perusahaanStore)
const { cabangs } = storeToRefs(cabangStore)
const { purchaseOrders } = storeToRefs(purchaseOrderStore)
const { warehouses }  = storeToRefs(warehouseStore)

// Table Controls
const tableControls = ref({
    rows: 10,
    search: '',
});

// State
const filters = ref({
  vendorId: null,
  source: null,
  status: null,
  search: '',
});
const globalFilterValue = ref('');
const attachmentPreview = ref(null);

// ✅ NEW: Initialize form dengan paymentMethod default
const initialForm = {
  noInvoice: '',
  vendorId: null,
  purchaseOrderId: null,
  perusahaanId: null,
  cabangId: null,
  up: '',
  email: '',
  paymentDate: new Date().toISOString().split('T')[0], // ✅ FIX: Gunakan paymentDate
  paymentMethod: 'cash', // ✅ NEW: Default payment method
  discountPercent: 0,
  taxPercent: 0,
  total: 0,
  dpp: 0,
  description: '',
  attachment: null,
  status: 'unpaid',
  paidAmount: 0,
  remainingAmount: 0,
  purchaseInvoiceItems: [],
};

// ✅ NEW: Gunakan initialForm untuk reset form
const resetFormToDefault = () => {
  Object.assign(form.value, JSON.parse(JSON.stringify(initialForm)));
};

// ✅ NEW: Computed untuk filter cabang berdasarkan perusahaan yang dipilih
const filteredCabangs = computed(() => {
  if (!form.value.perusahaanId || !cabangs.value) {
    return [];
  }
  
  const filtered = cabangs.value.filter(cabang => cabang.perusahaanId === form.value.perusahaanId);
  return filtered;
});

// Function untuk handle perubahan perusahaan
const onPerusahaanChange = (newValue) => {
  // Reset cabang ketika perusahaan berubah atau di-clear
  // Note: v-model sudah mengatur form.value.perusahaanId, jadi tidak perlu set manual
  if (form.value.cabangId !== null) {
    form.value.cabangId = null;
  }
};

// Flag untuk mencegah recursive watcher updates
const isUpdatingFromWatcher = ref(false);

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);
const modalTitle = computed(() => isEditMode.value ? 'Edit Purchase Invoice' : 'Tambah Purchase Invoice');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data Purchase Invoice di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan data Purchase Invoice baru.');

// Computed untuk menghitung sisa pembayaran berdasarkan grand total
const remainingAmount = computed(() => {
  const total = grandTotal.value;
  const paid = Number(form.value.paidAmount) || 0;
  return total - paid;
});

// Computed untuk menentukan apakah paid amount valid
const isPaidAmountValid = computed(() => {
  const total = grandTotal.value;
  const paid = Number(form.value.paidAmount) || 0;
  
  if (form.value.status === 'unpaid') {
    return paid === 0;
  } else if (form.value.status === 'paid') {
    return paid === total;
  } else if (form.value.status === 'partial') {
    return paid > 0 && paid < total;
  }
  
  return true;
});

// Computed untuk status badge class
const paymentStatusClass = computed(() => {
  if (form.value.status === 'paid') {
    return 'badge bg-success';
  } else if (form.value.status === 'partial') {
    return 'badge bg-warning';
  } else if (form.value.status === 'unpaid') {
    return 'badge bg-danger';
  }
  return 'badge bg-secondary';
});

// Computed untuk discount amount dalam rupiah
const discountAmount = computed(() => {
  const total = Number(form.value.total) || 0;
  const discountPercent = Number(form.value.discountPercent) || 0;
  const result = total * (discountPercent / 100);
  // Bulatkan ke integer untuk menghindari desimal
  return Math.round(result);
});

// Computed untuk DPP (Dasar Pengenaan Pajak) = subtotal purchase order items * 11/12
const dppAmount = computed(() => {
  // DPP dihitung dari subtotal purchase invoice items, bukan dari total
  const subtotalItems = purchaseInvoiceItemsTotal.value;
  const result = subtotalItems * 11 / 12;
  // Bulatkan ke integer untuk menghindari desimal
  return Math.round(result);
});

// Computed untuk tax amount dalam rupiah
const taxAmount = computed(() => {
  const total = Number(form.value.total) || 0;
  const discountPercent = Number(form.value.discountPercent) || 0;
  const taxPercent = Number(form.value.taxPercent) || 0;
  
  // Tax dihitung setelah discount
  const totalAfterDiscount = total - (total * (discountPercent / 100));
  const result = totalAfterDiscount * (taxPercent / 100);
  // Bulatkan ke integer untuk menghindari desimal
  return Math.round(result);
});

// Computed untuk grand total (total + tax - discount)
const grandTotal = computed(() => {
  const total = Number(form.value.total) || 0;
  
  // ✅ FIX: Jika ada Purchase Order, total sudah final (sudah termasuk PPN)
  if (form.value.purchaseOrderId) {
    return Math.round(total);
  }
  
  // ✅ FIX: Jika tidak ada Purchase Order, hitung PPN seperti biasa
  const discount = discountAmount.value;
  const tax = taxAmount.value;
  const result = total - discount + tax;
  // Bulatkan ke integer untuk menghindari desimal
  return Math.round(result);
});

// ✅ NEW: Computed untuk menghitung total dari purchase invoice items
const purchaseInvoiceItemsTotal = computed(() => {
  if (!form.value.purchaseInvoiceItems || !Array.isArray(form.value.purchaseInvoiceItems) || form.value.purchaseInvoiceItems.length === 0) {
    return 0;
  }
  
  const result = form.value.purchaseInvoiceItems.reduce((total, item) => {
    if (!item) return total;
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.price) || 0;
    return total + (quantity * unitPrice);
  }, 0);
  
  // Bulatkan ke integer untuk menghindari desimal
  return Math.round(result);
});

// Computed untuk remainingAmount yang selalu ter-update
const computedRemainingAmount = computed(() => {
  const total = grandTotal.value;
  const paid = Number(form.value.paidAmount) || 0;
  return total - paid;
});

// Watch untuk sinkronisasi table controls
watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10;
});

watch(() => globalFilterValue.value, (newValue) => {
    tableControls.value.search = newValue;
});

// ✅ NEW: Watcher untuk mengupdate total form berdasarkan purchase invoice items
watch(purchaseInvoiceItemsTotal, (newTotal) => {
  // Hanya update jika tidak ada purchase order yang dipilih (manual input)
  if (!form.value.purchaseOrderId) {
    form.value.total = Math.round(newTotal);
  }
});

// ✅ NEW: Watcher untuk auto update DPP berdasarkan subtotal items
watch(purchaseInvoiceItemsTotal, (newSubtotal) => {
  // Auto calculate DPP: subtotal items * 11/12
  form.value.dpp = Math.round(Number(newSubtotal) * 11 / 12);
});

// ✅ NEW: Watcher untuk memastikan remainingAmount selalu ter-update
watch([() => form.value.paidAmount, () => grandTotal.value], () => {
  // Trigger computed untuk update remainingAmount
  const newRemainingAmount = computedRemainingAmount.value;
  
  // Update form state jika berbeda
  if (form.value.remainingAmount !== newRemainingAmount) {
    form.value.remainingAmount = newRemainingAmount;
  }
}, { immediate: true });

const statusOptions = ref([
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Partial', value: 'partial' },
    { label: 'Paid', value: 'paid' },
]);

const paymentMethodOptions = ref([
    { label: 'Cash', value: 'cash' },
    { label: 'Transfer Bank', value: 'transfer' },
    { label: 'QRIS', value: 'qris' },
    { label: 'Card', value: 'card' },
]);

let modalInstance = null;
onMounted(() => {
    userStore.loadUser();
    purchaseInvoiceStore.fetchPurchaseInvoices();
    purchaseInvoiceStore.fetchInvoiceStatistics();
    vendorStore.fetchVendors();
    perusahaanStore.fetchPerusahaans();
    cabangStore.fetchCabangs();
    purchaseOrderStore.fetchPurchaseOrders();
    warehouseStore.fetchWarehouses();
    permissionStore.fetchPermissions();
    

    const modalElement = document.getElementById('PurchaseInvoiceModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
    setListTitle('Purchase Invoice', purchaseInvoices.value.length)

    // Initialize table controls
    tableControls.value.rows = Number(params.value.rows) || 10;
    tableControls.value.search = globalFilterValue.value;
});

watch(showModal, (newValue) => {
    if (newValue) {
        modalInstance?.show()
        if (isEditMode.value) {
            if (form.value.attachment_url) {
                attachmentPreview.value = form.value.attachment_url
            } else if (form.value.attachment) {
                attachmentPreview.value = getAttachmentUrl(form.value.attachment)
            } else {
                attachmentPreview.value = null
            }
            
            // Fetch stock for existing items
            if (form.value.purchaseInvoiceItems && form.value.purchaseInvoiceItems.length > 0) {
                form.value.purchaseInvoiceItems.forEach((item, index) => {
                    updateStockInfo(index);
                });
            }
        } else {
            attachmentPreview.value = null
        }
    } else {
        modalInstance?.hide()
    }
})

// Note: onPerusahaanChange function sudah handle perubahan perusahaan
// Watcher ini dihapus untuk menghindari konflik dengan onPerusahaanChange

// Watcher untuk purchaseOrderId - auto fill data ketika dipilih
watch(() => form.value.purchaseOrderId, async (newPurchaseOrderId, oldPurchaseOrderId) => {
  if (newPurchaseOrderId && newPurchaseOrderId !== oldPurchaseOrderId) {
    const selectedPurchaseOrder = purchaseOrders.value?.find(so => so.id === newPurchaseOrderId);
    
    if (selectedPurchaseOrder) {
      // Auto fill data dari purchase order yang dipilih
      form.value.vendorId = selectedPurchaseOrder.vendorId || selectedPurchaseOrder.vendor?.id;
      form.value.discountPercent = selectedPurchaseOrder.discountPercent || 0;
      form.value.taxPercent = selectedPurchaseOrder.taxPercent || 0;
      form.value.total = Math.round(Number(selectedPurchaseOrder.total)) || 0;
      
      // Jika ada data perusahaan dan cabang di purchase order
      if (selectedPurchaseOrder.perusahaanId) {
        form.value.perusahaanId = selectedPurchaseOrder.perusahaanId;
      }
      if (selectedPurchaseOrder.cabangId) {
        form.value.cabangId = selectedPurchaseOrder.cabangId;
      }
      
      // Set createdBy dari current user
      if (userStore.user && userStore.user.id) {
        form.value.createdBy = userStore.user.id;
      }
      
      // Auto fill tanggal jika belum ada
      if (!form.value.paymentDate && selectedPurchaseOrder.date) {
        form.value.paymentDate = new Date(selectedPurchaseOrder.date).toISOString().split('T')[0];
      }
      
      // Auto fill due date jika belum ada (misal 30 hari dari purchase order date)
      if (!form.value.dueDate && selectedPurchaseOrder.date) {
        const dueDate = new Date(selectedPurchaseOrder.date);
        dueDate.setDate(dueDate.getDate() + 30); // 30 hari dari tanggal SO
        form.value.dueDate = dueDate.toISOString().split('T')[0];
      }
      
      // Set status default
      if (!form.value.status) {
        form.value.status = 'unpaid';
      }
      
      // Set paid amount default
      if (!form.value.paidAmount) {
        form.value.paidAmount = 0;
      } else {
        // Pastikan paid amount juga integer
        form.value.paidAmount = Math.round(Number(form.value.paidAmount));
      }
      
      // ✅ AUTO FILL PURCHASE ORDER ITEMS - SEMUA ITEMS TANPA VALIDASI STATUS
      if (!isEditMode.value) {
        try {
          
          // Fetch detail purchase order dengan items
          await purchaseOrderStore.getPurchaseOrderDetails(newPurchaseOrderId);
          const detailedPurchaseOrder = purchaseOrderStore.purchaseOrder;
          
          if (detailedPurchaseOrder && detailedPurchaseOrder.purchaseOrderItems) {
            
            // Pastikan purchaseInvoiceItems selalu ada
            if (!form.value.purchaseInvoiceItems) {
              form.value.purchaseInvoiceItems = [];
            }
            
            // Clear existing items
            form.value.purchaseInvoiceItems = [];
            
            // Auto fill items dari purchase order - SEMUA ITEMS TANPA VALIDASI STATUS
            detailedPurchaseOrder.purchaseOrderItems.forEach((poItem, index) => {
              
              const invoiceItem = {
                productId: poItem.productId,
                warehouseId: poItem.warehouseId,
                quantity: Math.floor(Number(poItem.quantity)) || 0,
                price: poItem.price,
                subtotal: Math.round(Number(poItem.subtotal)) || 0,
                description: poItem.description || '',
                receivedQty: Math.floor(Number(poItem.receivedQty || poItem.quantity)) || 0, // ✅ FIX: Gunakan receivedQty
                isReturned: false,
                // Include product info if available
                product: poItem.product ? {
                  id: poItem.product.id,
                  name: poItem.product.name,
                  sku: poItem.product.sku,
                  priceSell: poItem.product.priceSell,
                  unit: poItem.product.unit
                } : null,
                // Include warehouse info if available
                warehouse: poItem.warehouse ? {
                  id: poItem.warehouse.id,
                  name: poItem.warehouse.name
                } : null,
                // Reference to purchase order item
                purchaseOrderItemId: poItem.id
              };
              
              form.value.purchaseInvoiceItems.push(invoiceItem);
            });
            
            // DPP akan otomatis dihitung dari watcher purchaseInvoiceItemsTotal
            
          } else {
            form.value.purchaseInvoiceItems = [];
          }
        } catch (error) {
          // Fallback: create empty items array
          form.value.purchaseInvoiceItems = [];
        }
      } else {
      }

    }
  } else if (!newPurchaseOrderId && oldPurchaseOrderId) {
    // Jika purchase order dihapus/di-clear, reset beberapa field ke kondisi manual
    // Reset ke default values tapi tetap biarkan user bisa edit
    if (!isEditMode.value) {
      form.value.vendorId = null;
      form.value.discountPercent = 0;
      form.value.taxPercent = 0;
      form.value.total = 0;
      form.value.dpp = 0;
      form.value.paidAmount = 0;
      form.value.status = 'unpaid';
      // Clear purchase invoice items
      if (!form.value.purchaseInvoiceItems) {
        form.value.purchaseInvoiceItems = [];
      } else {
        form.value.purchaseInvoiceItems = [];
      }
    }
  }
});

// Watcher untuk status - auto adjust paid amount
watch(() => form.value.status, (newStatus, oldStatus) => {
  if (newStatus !== oldStatus && !isUpdatingFromWatcher.value) {
    isUpdatingFromWatcher.value = true;
    
    const totalAmount = grandTotal.value;
    
    if (newStatus === 'paid') {
      // Jika status paid, paid amount harus sama dengan grand total
      form.value.paidAmount = Math.round(totalAmount);
    } else if (newStatus === 'unpaid') {
      // Jika status unpaid, paid amount harus 0
      form.value.paidAmount = 0;
    }
    
    // Reset flag setelah update selesai
    nextTick(() => {
      isUpdatingFromWatcher.value = false;
    });
  }
});

// Watcher untuk grand total - adjust paid amount jika status paid
watch(() => grandTotal.value, (newGrandTotal, oldGrandTotal) => {
  if (form.value.status === 'paid' && newGrandTotal !== oldGrandTotal) {
    form.value.paidAmount = Math.round(newGrandTotal);
  }
});

// Watcher untuk paid amount - auto adjust status berdasarkan jumlah yang dibayar
watch(() => form.value.paidAmount, (newPaidAmount, oldPaidAmount) => {
  if (newPaidAmount !== oldPaidAmount && !isUpdatingFromWatcher.value) {
    isUpdatingFromWatcher.value = true;
    
    const totalAmount = grandTotal.value;
    const paidAmount = Number(newPaidAmount) || 0;
    
    let newStatus = form.value.status;
    
    if (paidAmount === 0) {
      newStatus = 'unpaid';
    } else if (paidAmount >= totalAmount && totalAmount > 0) {
      newStatus = 'paid';
      // Batasi paid amount tidak boleh lebih dari grand total
      if (paidAmount > totalAmount) {
        form.value.paidAmount = Math.round(totalAmount);
      }
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
      newStatus = 'partial';
    }
    
    if (newStatus !== form.value.status) {
      form.value.status = newStatus;
    }
    
    // Reset flag setelah update selesai
    nextTick(() => {
      isUpdatingFromWatcher.value = false;
    });
  }
});

watch(globalFilterValue, useDebounceFn((newValue) => {
    filters.value.search = newValue;
}, 500));

watch(filters, (newFilters) => {
    const { page, rows, ...restFilters } = newFilters;
    purchaseInvoiceStore.setFilters(restFilters);
}, { deep: true });

// ✅ NEW: Refresh statistics when filters change
watch(filters, () => {
    purchaseInvoiceStore.fetchInvoiceStatistics();
}, { deep: true });

const onPage = (event) => {
    if (event) {
        // Ensure the event has valid values
        const validEvent = {
            first: Number(event.first) || 0,
            rows: Number(event.rows) || 10,
            page: Number(event.page) || 0
        };
        purchaseInvoiceStore.setPagination(validEvent);
    }
};

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10;
    params.value.rows = rowsValue;
    params.value.first = 0;
    purchaseInvoiceStore.fetchPurchaseInvoices();
};

const handleSearch = (value) => {
    globalFilterValue.value = value;
    params.value.first = 0;
    purchaseInvoiceStore.fetchPurchaseInvoices();
};

const onSort = (event) => {
    if (event) {
        purchaseInvoiceStore.setSort(event);
    }
};

const exportData = (format) => {
    if (format === 'csv') myDataTableRef.value.exportCSV();
};

const onQuantityChange = (index) => {
  // Pastikan quantity selalu integer
  const item = form.value.purchaseInvoiceItems[index];
  if (item && item.quantity !== null && item.quantity !== undefined) {
    item.quantity = Math.floor(Number(item.quantity)) || 0;
  }
  calculateSubtotal(index);
};

const calculateSubtotal = (index) => {
  const item = form.value.purchaseInvoiceItems[index];
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.price) || 0;
  const result = quantity * unitPrice;
  // Bulatkan ke integer untuk menghindari desimal
  item.subtotal = Math.round(result);
};

// ✅ NEW: Function untuk mendapatkan options product
const getProductOptions = (item) => {
  // Jika ada purchase order, gunakan product dari item tersebut
  if (form.value.purchaseOrderId && item?.product) {
    return [item.product];
  }
  
  // Jika tidak ada purchase order, gunakan semua products
  return productStore.products || [];
};

// ✅ NEW: Function untuk mendapatkan options warehouse
const getWarehouseOptions = (item) => {
  // Jika ada purchase order, gunakan warehouse dari item tersebut
  if (form.value.purchaseOrderId && item?.warehouse) {
    return [item.warehouse];
  }
  
  // Jika tidak ada purchase order, gunakan semua warehouses
  return warehouses.value || [];
};

// ✅ NEW: Function untuk handle perubahan received quantity
const onReceivedQtyChange = (index) => {
  const item = form.value.purchaseInvoiceItems[index];
  if (item && item.receivedQty !== null && item.receivedQty !== undefined) {
    item.receivedQty = Math.floor(Number(item.receivedQty)) || 0;
  }
};

// ✅ NEW: Function untuk menangani perubahan produk pada purchase invoice items
const onProductChange = (index) => {
  const selectedProductId = form.value.purchaseInvoiceItems[index].productId;
  const selectedProduct = purchaseOrderStore.vendorProducts.value && Array.isArray(purchaseOrderStore.vendorProducts.value) 
    ? purchaseOrderStore.vendorProducts.value.find(p => p && p.id === selectedProductId)
    : null;

  if (selectedProduct) {
    const item = form.value.purchaseInvoiceItems[index];
    item.price = Number(selectedProduct.priceSell) || 0;
    calculateSubtotal(index);
    updateStockInfo(index);
  }
};

// ✅ NEW: Function untuk update stock info
const updateStockInfo = async (index) => {
  const item = form.value.purchaseInvoiceItems[index];
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
      item.stock = { quantity: 0 };
    }
  } else {
    item.stock = { quantity: 0 };
  }
};

// ✅ NEW: Function untuk menambah item purchase invoice
const addPurchaseInvoiceItem = () => {
  // Pastikan purchaseInvoiceItems selalu ada
  if (!form.value.purchaseInvoiceItems) {
    form.value.purchaseInvoiceItems = [];
  }
  form.value.purchaseInvoiceItems.push({
    productId: null,
    warehouseId: null,
    quantity: 1,
    price: 0,
    description: '',
    subtotal: 0,
    receivedQty: 0, // ✅ FIX: Gunakan receivedQty
    isReturned: false,
    stock: { quantity: 0 },
  });
};

// ✅ NEW: Function untuk menghapus item purchase invoice
const removePurchaseInvoiceItem = (index) => {
  form.value.purchaseInvoiceItems.splice(index, 1);
};

// Function to convert formatted rupiah back to number
const parseRupiahToNumber = (rupiahString) => {
  if (!rupiahString) return 0;
  // Remove 'Rp', spaces, dots (thousand separators) and convert to number
  return Number(rupiahString.replace(/[Rp\s.]/g, '').replace(',', '.')) || 0;
};

// Handler untuk update total dari input yang diformat
const updateTotalFromInput = (event) => {
  if (!form.value.purchaseOrderId) { // Only allow manual input if no purchase order selected
    const inputValue = event.target.value;
    const numericValue = parseRupiahToNumber(inputValue);
    form.value.total = Math.round(numericValue);
  }
};

// Handler untuk update paid amount dari input yang diformat
const updatePaidAmountFromInput = (event) => {
  const inputValue = event.target.value;
  const numericValue = parseRupiahToNumber(inputValue);
  form.value.paidAmount = Math.round(numericValue);
};

const viewPurchaseInvoiceDetails = (purchaseInvoiceId) => {
    if (!purchaseInvoiceId) {
        toast.fire({
            icon: 'error',
            title: 'Parameter Tidak Valid',
            text: 'ID Purchase Invoice tidak valid.',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    router.push({ path: `/purchasing/purchase-invoice-detail`, query: { id: purchaseInvoiceId } });
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'unpaid': return { text: 'Unpaid', class: 'badge rounded-pill bg-label-danger' };
        case 'partial': return { text: 'Partial', class: 'badge rounded-pill bg-label-warning' };
        case 'paid': return { text: 'Paid', class: 'badge rounded-pill bg-label-success' };
        default: return { text: '-', class: 'badge rounded-pill bg-label-light' };
    }
};

const printPurchaseInvoice = (purchaseInvoiceId) => {
    if (!purchaseInvoiceId) {
        toast.fire({
            icon: 'error',
            title: 'Parameter Tidak Valid',
            text: 'ID Purchase Invoice tidak valid.',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    router.push({ path: `/purchasing/cetak-invoice`, query: { id: purchaseInvoiceId } });
};

const getPurchaseOrderLabel = (option) => {
    if (!option) return '';
    if (!option.noPo) return 'Invalid Purchase Order';
    
    return `${option.noPo} - ${option.vendor?.name || 'No Vendor'}`;
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', { 
        day  : '2-digit',
        month: '2-digit',
        year : 'numeric'
    });
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Purchase Invoice',
  description: 'Purchase Invoice Management',
  keywords: 'Purchase Invoice, Purchasing, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});

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
