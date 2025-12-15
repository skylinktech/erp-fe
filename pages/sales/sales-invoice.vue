<!-- Updated export functionality -->
<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">List Sales Invoice</h4>
            <p class="mb-6">
            List salesInvoice yang terdaftar di sistem
            </p>
            <!-- salesInvoice cards -->
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
                                    <h5 class="mb-1">Buat Sales Invoice Baru</h5>
                                    <p class="mb-0 text-muted">Tambahkan invoice baru untuk customer Anda</p>
                                </div>
                                <div class="col-md-4 text-end">
                                    <button v-if="userHasRole('superadmin') || userHasPermission('create_sales_invoice')" @click="salesInvoiceStore.openModal(null, 'admin')" class="btn btn-primary btn-sm me-2">
                                        <i class="ri-add-line me-2"></i>
                                        Tambah Sales Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Total & Filter Sales Invoice</h4>
                    <p class="mb-0">Temukan semua akun administrator perusahaan Anda dan Sales Invoice terkait.</p>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-muted mb-2">Filter Customer</label>
                                    <CustomSelect2 
                                        v-model="filters.customerId" 
                                        :options="customers" 
                                        :get-option-label="c => c.name" 
                                        :reduce="c => c.id" 
                                        placeholder="Pilih Customer"
                                        searchable
                                        clearable
                                    />
                                </div>
                                <div class="col-md-6 mb-3">
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
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <!-- salesInvoice Table -->
                    <div class="card">
                        <div class="card-header">
                            <TableControls
                                v-model="tableControls"
                                :rows-per-page-options="rowsPerPageOptionsArray"
                                search-placeholder="Cari Sales Order..."
                                @rows-change="handleRowsChange"
                                @search="handleSearch"
                                @export="exportData"
                            />
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="salesInvoices"
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
                                                @click="navigateTo(`/sales/sales-invoice-detail?id=${slotProps.data.id}`)" 
                                                style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                                title="View detail"
                                            >
                                                {{ slotProps.data.noInvoice || '-' }}
                                            </a>
                                        </template>
                                    </Column>
                                    <Column field="salesOrder.noSo" header="No. SO" :sortable="true">
                                        <template #body="slotProps">
                                            <span v-if="slotProps.data.salesOrder?.noSo && slotProps.data.salesOrder?.id">
                                                <a :href="`/sales/sales-order-detail?id=${slotProps.data.salesOrder.id}`" class="text-primary"
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
                                    <Column field="email" header="Email Penagihan" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.email || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="date" header="Tanggal" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.date ? new Date(slotProps.data.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="dueDate" header="Jatuh Tempo" :sortable="true">
                                        <template #body="slotProps">
                                            {{ slotProps.data.dueDate ? new Date(slotProps.data.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}
                                        </template>
                                    </Column>
                                    <Column field="status" header="Status" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadge(slotProps.data.status).class">
                                                {{ getStatusBadge(slotProps.data.status).text }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="salesOrder.perusahaan.nmPerusahaan" header="Perusahaan" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.salesOrder?.perusahaan?.nmPerusahaan || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="salesOrder.cabang.nmCabang" header="Cabang" :sortable="true">
                                        <template #body="slotProps">
                                            <span>
                                                {{ slotProps.data.salesOrder?.cabang?.nmCabang || '-' }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                                        <template #body="slotProps">
                                            <div class="d-inline-block">
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu">
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('view_sales_invoice'))">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="viewSalesInvoiceDetails(slotProps.data.id)">
                                                            <i class="ri-eye-line me-2"></i> Lihat Detail
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('edit_sales_invoice') && (slotProps.data.status == 'unpaid' || slotProps.data.status == 'partial'))">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="salesInvoiceStore.openModal(slotProps.data, 'admin')">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="userHasRole('superadmin') || (userHasPermission('delete_sales_invoice'))">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="salesInvoiceStore.deleteSalesInvoice(slotProps.data.id)">
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
                    <!--/ salesInvoice Table -->
                </div>
            </div>
            <!--/ salesInvoice cards -->

            <Modal 
                id="SalesInvoiceModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="salesInvoiceStore.saveSalesInvoice()" novalidate>
                         <div class="row">
                            <div class="col">
                                <ul class="nav nav-tabs" role="tablist">
                                    <li class="nav-item">
                                        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#form-tabs-info" role="tab" aria-selected="true" type="button">
                                            <span class="ri-user-line ri-20px d-sm-none"></span>
                                            <span class="d-none d-sm-block">Informasi Sales Invoice</span>
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
                                            v-model="form.salesOrderId" 
                                            :options="salesOrders || []" 
                                            :get-option-label="getSalesOrderLabel" 
                                            :reduce="so => so.id" 
                                            placeholder="Pilih Sales Order"
                                            searchable
                                            clearable
                                            :loading="loading"
                                        >
                                            <template #option="{ option }">
                                                <div v-if="option" class="d-flex justify-content-between align-items-center w-100">
                                                    <div>
                                                        <div class="fw-bold">{{ option.noSo }}</div>
                                                        <small class="text-muted">{{ option.customer?.name || 'No Customer' }}</small>
                                                    </div>
                                                    <div class="text-end">
                                                        <small class="text-muted">{{ formatDate(option.date) }}</small>
                                                    </div>
                                                </div>
                                            </template>
                                            <template #selection="{ option }">
                                                <div v-if="option" class="d-flex align-items-center">
                                                    <span class="fw-bold text-primary">{{ option.noSo }}</span>
                                                    <span class="text-muted ms-2">- {{ option.customer?.name || 'No Customer' }}</span>
                                                </div>
                                            </template>
                                        </CustomSelect2>
                                        <div v-if="hasFieldError('salesOrderId')" class="invalid-feedback d-block">
                                            {{ getFieldError('salesOrderId') }}
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
                                            :disabled="!!form.salesOrderId"
                                        >
                                            <template #option="{ option }">
                                                <div v-if="option" class="d-flex justify-content-between align-items-center w-100">
                                                    <div>
                                                        <div class="fw-bold">{{ option.name }}</div>
                                                        <small class="text-muted">{{ option.email || 'No Email' }}</small>
                                                    </div>
                                                    <div class="text-end">
                                                        <small class="text-muted">{{ option.phone || '-' }}</small>
                                                    </div>
                                                </div>
                                            </template>
                                            <template #selection="{ option }">
                                                <div v-if="option" class="d-flex align-items-center">
                                                    <span class="fw-bold">{{ option.name }}</span>
                                                </div>
                                            </template>
                                        </CustomSelect2>
                                        <div v-if="hasFieldError('customerId')" class="invalid-feedback d-block">
                                            {{ getFieldError('customerId') }}
                                        </div>
                                        <div v-if="form.salesOrderId" class="form-text mt-1">
                                            <small class="text-muted">📋 Customer diambil dari Sales Order yang dipilih</small>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 
                                            v-model="form.perusahaanId" 
                                            :options="perusahaanOptions" 
                                            :get-option-label="p => p.nmPerusahaan" 
                                            :reduce="p => p.id" 
                                            placeholder="Pilih Perusahaan"
                                            searchable
                                            clearable
                                            :disabled="!!form.salesOrderId"
                                        >
                                            <template #option="{ option }">
                                                <div v-if="option" class="d-flex justify-content-between align-items-center w-100">
                                                    <div>
                                                        <div class="fw-bold">{{ option.nmPerusahaan }}</div>
                                                        <small class="text-muted">{{ option.kodePerusahaan || '-' }}</small>
                                                    </div>
                                                </div>
                                            </template>
                                            <template #selection="{ option }">
                                                <div v-if="option" class="d-flex align-items-center">
                                                    <span class="fw-bold">{{ option.nmPerusahaan }}</span>
                                                </div>
                                            </template>
                                        </CustomSelect2>
                                        <div v-if="form.salesOrderId" class="form-text mt-1">
                                            <small class="text-muted">📋 Perusahaan diambil dari Sales Order</small>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <CustomSelect2 
                                            v-model="form.cabangId" 
                                            :options="cabangOptions" 
                                            :get-option-label="c => c.nmCabang" 
                                            :reduce="c => c.id" 
                                            placeholder="Pilih Cabang"
                                            searchable
                                            clearable
                                            :disabled="!!form.salesOrderId || !form.perusahaanId"
                                        >
                                            <template #option="{ option }">
                                                <div v-if="option" class="d-flex justify-content-between align-items-center w-100">
                                                    <div>
                                                        <div class="fw-bold">{{ option.nmCabang }}</div>
                                                        <small class="text-muted">ID: {{ option.id }}</small>
                                                    </div>
                                                </div>
                                            </template>
                                            <template #selection="{ option }">
                                                <div v-if="option" class="d-flex align-items-center">
                                                    <span class="fw-bold">{{ option.nmCabang }}</span>
                                                </div>
                                            </template>
                                        </CustomSelect2>
                                        <div v-if="form.salesOrderId" class="form-text mt-1">
                                            <small class="text-muted">📋 Cabang diambil dari Sales Order</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input 
                                                type="date" 
                                                v-model="form.date" 
                                                class="form-control" 

                                            >
                                            <label>Tanggal Invoice</label>
                                            <div v-if="hasFieldError('date')" class="invalid-feedback">
                                                {{ getFieldError('date') }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input 
                                                type="date" 
                                                v-model="form.dueDate" 
                                                class="form-control" 

                                            >
                                            <label>Jatuh Tempo Invoice</label>
                                            <div v-if="hasFieldError('dueDate')" class="invalid-feedback">
                                                {{ getFieldError('dueDate') }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input 
                                                type="text" 
                                                v-model="form.up" 
                                                class="form-control" 
                                                
                                                placeholder="UP"
                                            >
                                            <label>UP</label>
                                            <div v-if="hasFieldError('up')" class="invalid-feedback">
                                                {{ getFieldError('up') }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input 
                                                type="text" 
                                                v-model="form.email" 
                                                class="form-control" 
                                                
                                                placeholder="Email"
                                            >
                                            <label>Email Penagihan</label>
                                            <div v-if="hasFieldError('email')" class="invalid-feedback">
                                                {{ getFieldError('email') }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <CustomSelect2
                                            v-model="form.status"
                                            :options="statusOptions"
                                            :get-option-label="option => option.label"
                                            :reduce="option => option.value"
                                            placeholder="Pilih Status"
                                            searchable
                                            clearable
                                        >
                                            <template #option="{ option }">
                                                <div class="d-flex align-items-center">
                                                    <span 
                                                        class="badge me-2"
                                                        :class="{
                                                            'bg-danger': option.value === 'unpaid',
                                                            'bg-warning': option.value === 'partial', 
                                                            'bg-success': option.value === 'paid'
                                                        }"
                                                    >
                                                        {{ option.label }}
                                                    </span>
                                                    <span class="text-muted">
                                                        {{ option.value === 'unpaid' ? 'Belum dibayar' : 
                                                           option.value === 'partial' ? 'Dibayar sebagian' : 
                                                           'Lunas' }}
                                                    </span>
                                                </div>
                                            </template>
                                            <template #selection="{ option }">
                                                <span 
                                                    class="badge"
                                                    :class="{
                                                        'bg-danger': option.value === 'unpaid',
                                                        'bg-warning': option.value === 'partial', 
                                                        'bg-success': option.value === 'paid'
                                                    }"
                                                >
                                                    {{ option.label }}
                                                </span>
                                            </template>
                                        </CustomSelect2>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input 
                                                type="text" 
                                                :value="formatForDisplay(form.discountPercent)"
                                                class="form-control" 
                                                placeholder="Discount (%)" 
                                                :readonly="!!form.salesOrderId"
                                                @input="onDiscountPercentInput"
                                                @blur="onDiscountPercentBlur"
                                                pattern="[0-9]+([,\.][0-9]+)?"
                                                :required="false"
                                            >
                                            <label>Discount Invoice (%)</label>
                                            <div v-if="form.salesOrderId" class="form-text">
                                                <small class="text-muted">Diambil dari Sales Order</small>
                                            </div>
                                            <div class="form-text mt-1">
                                                <small class="text-muted">{{ formatRupiah(discountAmount) }}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input 
                                                type="text" 
                                                :value="formatForDisplay(form.taxPercent)"
                                                class="form-control" 
                                                placeholder="Tax (%)" 
                                                :readonly="!!form.salesOrderId"
                                                @input="onTaxPercentInput"
                                                @blur="onTaxPercentBlur"
                                                pattern="[0-9]+([,\.][0-9]+)?"
                                                :required="false"
                                            >
                                            <label>Tax Invoice (%)</label>
                                            <div v-if="form.salesOrderId" class="form-text">
                                                <small class="text-muted">Diambil dari Sales Order</small>
                                            </div>
                                            <div class="form-text mt-1">
                                                <small class="text-muted">{{ formatRupiah(taxAmount) }}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" :value="formatRupiah(form.total)" @input="updateTotalFromInput" class="form-control" placeholder="Total" :readonly="!!form.salesOrderId">
                                            <label>Total</label>
                                            <div v-if="form.salesOrderId" class="form-text">
                                                <small class="text-muted">Diambil dari Sales Order</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="text" :value="formatRupiah(form.dpp)" class="form-control" placeholder="DPP" readonly>
                                            <label>DPP</label>
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
                                            <input type="text" :value="formatRupiah(form.remainingAmount)" class="form-control" readonly>
                                            <label>Sisa Pembayaran</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating form-floating-outline">
                                            <textarea 
                                                v-model="form.description" 
                                                class="form-control" 
                                                
                                                placeholder="Deskripsi Invoice"
                                            ></textarea>
                                            <label>Deskripsi Invoice</label>
                                            <div v-if="hasFieldError('description')" class="invalid-feedback">
                                                {{ getFieldError('description') }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 d-flex align-items-center">
                                        <div class="form-check form-switch mt-4">
                                            <input class="form-check-input" type="checkbox" id="ttdDigitalCheckbox" v-model="form.ttdDigital">
                                            <label class="form-check-label" for="ttdDigitalCheckbox">TTD Digital</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card" style="box-shadow: none; border: #e9eaec 1px solid;">
                                            <div class="card-header">
                                                <h6 class="mb-0">💰 Ringkasan Pembayaran</h6>
                                            </div>
                                            <div class="card-body mt-3">
                                                <div class="row text-sm">
                                                    <div class="col-6">
                                                        <div v-if="!form.salesOrderId" class="mb-2">
                                                            <span class="text-muted">Subtotal:</span><br>
                                                            <strong>{{ formatRupiah(form.total) }}</strong>
                                                        </div>
                                                        <div v-if="form.salesOrderId" class="mb-2">
                                                            <span class="text-muted">Total dari Sales Order:</span><br>
                                                            <strong>{{ formatRupiah(form.total) }}</strong>
                                                            <br><small class="text-info">Sudah termasuk discount & PPN</small>
                                                        </div>
                                                        <div class="mb-2">
                                                            <span class="text-muted">DPP (Subtotal × 11/12):</span><br>
                                                            <strong class="text-info">{{ formatRupiah(form.dpp) }}</strong>
                                                        </div>
                                                        <div v-if="!form.salesOrderId" class="mb-2">
                                                            <span class="text-muted">Discount ({{ form.discountPercent }}%):</span><br>
                                                            <strong class="text-danger">-{{ formatRupiah(discountAmount) }}</strong>
                                                        </div>
                                                        <div v-if="!form.salesOrderId" class="mb-2">
                                                            <span class="text-muted">Tax ({{ form.taxPercent }}%):</span><br>
                                                            <strong class="text-success">+{{ formatRupiah(taxAmount) }}</strong>
                                                        </div>
                                                        <div v-if="form.salesOrderId" class="mb-2">
                                                            <span class="text-muted">Discount & Tax:</span><br>
                                                            <small class="text-muted">Sudah termasuk dalam total SO</small>
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
                                                                {{ formatRupiah(form.remainingAmount) }}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="alert alert-dark">
                                            <div class="d-flex align-items-center">
                                                <div class="me-2">
                                                    <i class="ri-information-line ri-24px"></i>
                                                </div>
                                                <div>
                                                    <strong>Info Pembayaran:</strong><br>
                                                    <small class="text-muted">
                                                        • Status akan otomatis berubah berdasarkan jumlah pembayaran<br>
                                                        • Unpaid: Rp 0 | Partial: Sebagian | Paid: Lunas
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="form-tabs-items" role="tabpanel">
                                <div v-for="(item, index) in (form.salesInvoiceItems || [])" :key="index" class="repeater-item mb-4">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Produk</label>
                                            <CustomSelect2 
                                                v-model="item.productId" 
                                                :options="customerProducts || []" 
                                                :get-option-label="p => `${p.name} (${p.unit?.name || 'No Unit'})`" 
                                                :reduce="p => p.id" 
                                                placeholder="Pilih Produk" 
                                                searchable
                                                clearable
                                                @update:modelValue="onProductChange(index)"
                                            >
                                                <template #option="{ option }">
                                                    <div v-if="option" class="d-flex justify-content-between align-items-center w-100">
                                                        <div>
                                                            <div class="fw-bold">{{ option.name }}</div>
                                                            <small class="text-muted">{{ option.sku }} - {{ option.unit?.name || 'No Unit' }}</small>
                                                        </div>
                                                        <div class="text-end">
                                                            <small class="text-success">{{ formatRupiah(option.priceSell || 0) }}</small>
                                                        </div>
                                                    </div>
                                                </template>
                                                <template #selection="{ option }">
                                                    <div v-if="option" class="d-flex align-items-center">
                                                        <span class="fw-bold">{{ option.name }}</span>
                                                        <span class="text-muted ms-2">({{ option.unit?.name || 'No Unit' }})</span>
                                                    </div>
                                                </template>
                                            </CustomSelect2>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Gudang</label>
                                            <CustomSelect2 
                                                v-model="item.warehouseId" 
                                                :options="warehouses" 
                                                :get-option-label="w => `${w.name} (${w.code})`" 
                                                :reduce="w => w.id" 
                                                placeholder="Pilih Gudang"
                                                searchable
                                                clearable
                                                @update:modelValue="updateStockInfo(index)"
                                            >
                                                <template #option="{ option }">
                                                    <div v-if="option" class="d-flex justify-content-between align-items-center w-100">
                                                        <div>
                                                            <div class="fw-bold">{{ option.name }}</div>
                                                            <small class="text-muted">{{ option.code }}</small>
                                                        </div>
                                                        <div class="text-end">
                                                            <small class="text-info">{{ option.address || '-' }}</small>
                                                        </div>
                                                    </div>
                                                </template>
                                                <template #selection="{ option }">
                                                    <div v-if="option" class="d-flex align-items-center">
                                                        <span class="fw-bold">{{ option.name }}</span>
                                                        <span class="text-muted ms-2">({{ option.code }})</span>
                                                    </div>
                                                </template>
                                            </CustomSelect2>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="number" v-model.number="item.quantity" @input="onQuantityChange(index)" class="form-control" placeholder="Qty" step="1" min="0">
                                                <label>Jumlah</label>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="number" v-model.number="item.deliveredQty" @input="onDeliveredQtyChange(index)" class="form-control" placeholder="Delivered Qty" step="1" min="0">
                                                <label>Delivered Qty</label>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" :value="formatRupiah(item.price)" class="form-control" placeholder="Harga" readonly>
                                                <label>Harga Jual</label>
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
                                            <button @click.prevent="removeSalesInvoiceItem(index)" class="btn btn-outline-danger w-100">Hapus</button>
                                        </div>
                                    </div>
                                    <hr class="my-4">
                                </div>
                                <div class="mt-4">
                                    <button @click.prevent="addSalesInvoiceItem()" class="btn btn-primary">Tambah Item</button>
                                </div>
                                <div class="d-flex justify-content-end mt-4">
                                    <div class="text-end">
                                        <div class="mb-2">
                                            <span class="fw-medium">Subtotal Items: {{ formatRupiah(salesInvoiceItemsTotal) }}</span>
                                        </div>
                                        <div class="fw-bold fs-5">Grand Total: {{ formatRupiah(grandTotal) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer mt-6">
                             <button type="button" class="btn btn-outline-secondary" @click="salesInvoiceStore.closeModal()">Tutup</button>
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
import { useSalesInvoiceStore } from '~/stores/sales-invoice'
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
import { useImageUrl } from '~/composables/useImageUrl'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()
const { getAttachmentUrl } = useImageUrl()

const config = useRuntimeConfig();
const router = useRouter();

// Store
const myDataTableRef        = ref(null)
const salesInvoiceStore       = useSalesInvoiceStore()
const customerStore         = useCustomerStore()
const perusahaanStore       = usePerusahaanStore()
const warehouseStore        = useWarehouseStore()
const cabangStore           = useCabangStore()
const productStore          = useProductStore()
const userStore             = useUserStore()
const formatRupiah          = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions();
const permissionStore       = usePermissionsStore()
const salesOrderStore       = useSalesOrderStore()

const { salesInvoices, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, statistics } = storeToRefs(salesInvoiceStore)
const { customers }   = storeToRefs(customerStore)
const { salesOrders, customerProducts } = storeToRefs(salesOrderStore)
const { warehouses }  = storeToRefs(warehouseStore)
const { perusahaans } = storeToRefs(perusahaanStore)
const { cabangs }     = storeToRefs(cabangStore)

// Table Controls
const tableControls = ref({
    rows: 10,
    search: '',
});

// State
const filters = ref({
  customerId: null,
  source: null,
  status: null,
  search: '',
});
const globalFilterValue = ref('');
const attachmentPreview = ref(null);

// Data Perusahaan & Cabang (untuk select) mengikuti pola purchase-invoice
const perusahaanOptions = computed(() => perusahaans.value || [])
const filteredCabangs = computed(() => {
  if (!form.value.perusahaanId || !cabangs.value) return []
  return cabangs.value.filter((c) => Number(c.perusahaanId) === Number(form.value.perusahaanId))
})
const cabangOptions = computed(() => {
  // ✅ FIX: Pastikan cabangOptions selalu reactive terhadap perubahan perusahaanId
  const filtered = filteredCabangs.value;
  return filtered;
})

// Flag untuk mencegah recursive watcher updates
const isUpdatingFromWatcher = ref(false);

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);
const modalTitle = computed(() => isEditMode.value ? 'Edit Sales Invoice' : 'Tambah Sales Invoice');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data Sales Invoice di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan data Sales Invoice baru.');

// ✅ Helper function untuk mendapatkan validation error per field (VineJS)
const getFieldError = (fieldName) => {
  if (!validationErrors.value) {
    return null;
  }
  
  // ✅ VineJS struktur error: Array of objects dengan format { field: 'fieldName', message: 'Error message', rule: 'ruleName' }
  if (Array.isArray(validationErrors.value)) {
    const error = validationErrors.value.find(err => {
      
      if (typeof err === 'object' && err !== null) {
        // VineJS error structure: { field: 'description', message: 'Field description wajib diisi', rule: '' }
        return err.field === fieldName;
      }
      
      // Fallback untuk string errors
      if (typeof err === 'string') {
        return err.toLowerCase().includes(fieldName.toLowerCase());
      }
      
      return false;
    });
    
    if (error) {
      
      if (typeof error === 'object' && error.message) {
        return error.message;
      } else if (typeof error === 'string') {
        return error;
      }
    }
  }
  
  // ✅ Fallback: Jika validationErrors berupa object (compatibility)
  if (typeof validationErrors.value === 'object' && !Array.isArray(validationErrors.value)) {
    if (validationErrors.value[fieldName]) {
      const fieldErrors = validationErrors.value[fieldName];
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        return fieldErrors[0]; // Ambil error pertama
      } else if (typeof fieldErrors === 'string') {
        return fieldErrors;
      }
    }
  }
  
  return null;
};

// ✅ Helper function untuk mengecek apakah field memiliki error
const hasFieldError = (fieldName) => {
  return getFieldError(fieldName) !== null;
};

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
  
  // ✅ FIX: Jika menggunakan Sales Order, discount sudah include di total, jadi discountAmount = 0
  if (form.value.salesOrderId) {
    return 0; // Karena discount sudah include di total Sales Order
  }
  
  const result = total * (discountPercent / 100);
  // Bulatkan ke integer untuk menghindari desimal
  return Math.round(result);
});

// Computed untuk DPP (Dasar Pengenaan Pajak) = subtotal sales order items * 11/12
const dppAmount = computed(() => {
  // DPP dihitung dari subtotal sales invoice items, bukan dari total
  const subtotalItems = salesInvoiceItemsTotal.value;
  const result = subtotalItems * 11 / 12;
  // Bulatkan ke integer untuk menghindari desimal
  return Math.round(result);
});

// Computed untuk tax amount dalam rupiah
const taxAmount = computed(() => {
  const total = Number(form.value.total) || 0;
  const discountPercent = Number(form.value.discountPercent) || 0;
  const taxPercent = Number(form.value.taxPercent) || 0;
  
  // ✅ FIX: Jika menggunakan Sales Order, total sudah include PPN, jadi taxAmount = 0
  if (form.value.salesOrderId) {
    return 0; // Karena PPN sudah include di total Sales Order
  }
  
  // Tax dihitung setelah discount (untuk manual input tanpa Sales Order)
  const totalAfterDiscount = total - (total * (discountPercent / 100));
  const result = totalAfterDiscount * (taxPercent / 100);
  // Bulatkan ke integer untuk menghindari desimal
  return Math.round(result);
});

// Computed untuk grand total (total + tax - discount)
const grandTotal = computed(() => {
  const total = Number(form.value.total) || 0;
  const discount = discountAmount.value;
  const tax = taxAmount.value;
  const result = total - discount + tax;
  // Bulatkan ke integer untuk menghindari desimal
  return Math.round(result);
});

// ✅ NEW: Computed untuk menghitung total dari sales invoice items
const salesInvoiceItemsTotal = computed(() => {
  if (!form.value.salesInvoiceItems || !Array.isArray(form.value.salesInvoiceItems) || form.value.salesInvoiceItems.length === 0) {
    return 0;
  }
  
  const result = form.value.salesInvoiceItems.reduce((total, item) => {
    if (!item) return total;
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.price) || 0;
    return total + (quantity * unitPrice);
  }, 0);
  
  // Bulatkan ke integer untuk menghindari desimal
  return Math.round(result);
});

// Helper function untuk mengkonversi format Indonesia (koma) ke format internasional (titik)
const convertToNumber = (value) => {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    
    // Jika sudah berupa number, langsung return
    if (typeof value === 'number') {
        return value;
    }
    
    // Konversi string: ganti koma dengan titik, lalu parse ke number
    const stringValue = String(value).trim();
    const normalizedValue = stringValue.replace(',', '.');
    const numValue = parseFloat(normalizedValue);
    
    // Jika hasilnya NaN, return 0
    return isNaN(numValue) ? 0 : numValue;
};

// Helper function untuk format number ke string dengan koma (untuk tampilan)
const formatForDisplay = (value) => {
    const numValue = convertToNumber(value);
    if (numValue === 0) {
        return '';
    }
    return numValue.toString().replace('.', ',');
};

// Handler untuk discountPercent input
const onDiscountPercentInput = (event) => {
    if (form.value.salesOrderId) return; // Jangan update jika readonly
    
    const target = event.target;
    let value = target.value;
    
    // Validasi format: hanya angka, koma, atau titik
    if (value && !/^[0-9]*([,\.][0-9]*)?$/.test(value)) {
        // Jika format tidak valid, hapus karakter terakhir
        value = value.slice(0, -1);
        target.value = value;
    }
    
    // Update form.value dengan number (konversi koma ke titik)
    const numValue = convertToNumber(value);
    form.value.discountPercent = numValue;
};

// Handler untuk discountPercent blur (saat field kehilangan fokus)
const onDiscountPercentBlur = (event) => {
    if (form.value.salesOrderId) return; // Jangan update jika readonly
    
    const target = event.target;
    const numValue = convertToNumber(target.value);
    form.value.discountPercent = numValue;
    // Update tampilan dengan format yang benar (gunakan koma untuk Indonesia)
    target.value = formatForDisplay(numValue);
};

// Handler untuk taxPercent input
const onTaxPercentInput = (event) => {
    if (form.value.salesOrderId) return; // Jangan update jika readonly
    
    const target = event.target;
    let value = target.value;
    
    // Validasi format: hanya angka, koma, atau titik
    if (value && !/^[0-9]*([,\.][0-9]*)?$/.test(value)) {
        // Jika format tidak valid, hapus karakter terakhir
        value = value.slice(0, -1);
        target.value = value;
    }
    
    // Update form.value dengan number (konversi koma ke titik)
    const numValue = convertToNumber(value);
    form.value.taxPercent = numValue;
};

// Handler untuk taxPercent blur (saat field kehilangan fokus)
const onTaxPercentBlur = (event) => {
    if (form.value.salesOrderId) return; // Jangan update jika readonly
    
    const target = event.target;
    const numValue = convertToNumber(target.value);
    form.value.taxPercent = numValue;
    // Update tampilan dengan format yang benar (gunakan koma untuk Indonesia)
    target.value = formatForDisplay(numValue);
};

// Watch untuk sinkronisasi table controls
watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10;
});

watch(() => globalFilterValue.value, (newValue) => {
    tableControls.value.search = newValue;
});

// ✅ NEW: Watcher untuk mengupdate total form berdasarkan sales invoice items
watch(salesInvoiceItemsTotal, (newTotal) => {
  // Hanya update jika tidak ada sales order yang dipilih (manual input)
  if (!form.value.salesOrderId) {
    form.value.total = Math.round(newTotal);
  }
});

// ✅ NEW: Watcher untuk auto update DPP berdasarkan subtotal items
watch(salesInvoiceItemsTotal, (newSubtotal) => {
  // Auto calculate DPP: subtotal items * 11/12
  form.value.dpp = Math.round(Number(newSubtotal) * 11 / 12);
});

const statusOptions = ref([
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Partial', value: 'partial' },
    { label: 'Paid', value: 'paid' },
]);

const paymentMethodOptions = ref([
    { label: 'Cash', value: 'cash' },
    { label: 'Transfer Bank', value: 'transfer' },
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'Debit Card', value: 'debit_card' },
    { label: 'Cheque', value: 'cheque' },
    { label: 'E-Wallet', value: 'e_wallet' },
]);

let modalInstance = null;
onMounted(() => {
    userStore.loadUser();
    salesInvoiceStore.fetchSalesInvoices();
    salesInvoiceStore.fetchInvoiceStatistics();
    customerStore.fetchCustomers();
    perusahaanStore.fetchPerusahaans();
    cabangStore.fetchCabangs();
    salesOrderStore.fetchAllSalesOrdersForSelect(true); // Fetch semua sales orders untuk select2 dropdown
    warehouseStore.fetchWarehouses();
    permissionStore.fetchPermissions();

    const modalElement = document.getElementById('SalesInvoiceModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
    setListTitle('Sales Invoice', salesInvoices.value.length)

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
            
            // Pastikan discountPercent dan taxPercent berupa number
            form.value.discountPercent = convertToNumber(form.value.discountPercent);
            form.value.taxPercent = convertToNumber(form.value.taxPercent);
            
            // Fetch stock for existing items
            if (form.value.salesInvoiceItems && form.value.salesInvoiceItems.length > 0) {
                form.value.salesInvoiceItems.forEach((item, index) => {
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

watch(() => form.value.perusahaanId, (newPerusahaanId, oldPerusahaanId) => {
    // ✅ FIX: Reset cabangId ketika perusahaan berubah (kecuali saat autofill dari sales order)
    if (newPerusahaanId !== oldPerusahaanId && !isUpdatingFromWatcher.value) {
        form.value.cabangId = null;
    }
});

// Watcher untuk salesOrderId - auto fill data ketika dipilih
watch(() => form.value.salesOrderId, async (newSalesOrderId, oldSalesOrderId) => {
  if (newSalesOrderId && newSalesOrderId !== oldSalesOrderId) {
    const selectedSalesOrder = salesOrders.value?.find(so => so.id === newSalesOrderId);
    
    if (selectedSalesOrder) {
      // ✅ FIX: Set flag untuk mencegah recursive updates
      isUpdatingFromWatcher.value = true;
      
      // Auto fill data dari sales order yang dipilih
      form.value.customerId = selectedSalesOrder.customerId || selectedSalesOrder.customer?.id;
      form.value.discountPercent = convertToNumber(selectedSalesOrder.discountPercent);
      form.value.taxPercent = convertToNumber(selectedSalesOrder.taxPercent);
      // ✅ FIX: Total dari SO sudah final (termasuk discount & PPN)
      form.value.total = Math.round(Number(selectedSalesOrder.total)) || 0;
      
      // ✅ FIX: Set perusahaanId terlebih dahulu, tunggu computed property ter-update
      if (selectedSalesOrder.perusahaanId) {
        form.value.perusahaanId = selectedSalesOrder.perusahaanId;
        
        // Tunggu computed property cabangOptions ter-update
        await nextTick();
        
        // Set cabangId setelah cabangOptions sudah ter-update
        if (selectedSalesOrder.cabangId) {
          form.value.cabangId = Number(selectedSalesOrder.cabangId);
        }
      }
      
      // ✅ FIX: Reset flag setelah autofill selesai
      await nextTick();
      isUpdatingFromWatcher.value = false;
      
      // Auto fill tanggal jika belum ada
      if (!form.value.date && selectedSalesOrder.date) {
        form.value.date = new Date(selectedSalesOrder.date).toISOString().split('T')[0];
      }
      
      // Auto fill due date jika belum ada (misal 30 hari dari sales order date)
      if (!form.value.dueDate && selectedSalesOrder.date) {
        const dueDate = new Date(selectedSalesOrder.date);
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
      
      // ✅ AUTO FILL SALES ORDER ITEMS - HANYA JIKA BUKAN EDIT MODE
      if (!isEditMode.value) {
        // Fetch detail sales order dengan items
        salesOrderStore.getSalesOrderDetails(newSalesOrderId)
          .then(() => {
            const detailedSalesOrder = salesOrderStore.salesOrder;
          
            if (detailedSalesOrder && detailedSalesOrder.salesOrderItems) {
            
            // Pastikan salesInvoiceItems selalu ada
            if (!form.value.salesInvoiceItems) {
              form.value.salesInvoiceItems = [];
            }
            
            // Clear existing items
            form.value.salesInvoiceItems = [];
            
            // Auto fill items dari sales order - HANYA YANG STATUS_PARTIAL = TRUE
            detailedSalesOrder.salesOrderItems
              .filter(soItem => soItem.statusPartial === true)
              .forEach((soItem, index) => {
              const invoiceItem = {
                productId: soItem.productId,
                warehouseId: soItem.warehouseId,
                quantity: Math.floor(Number(soItem.quantity)) || 0,
                price: soItem.price,
                subtotal: Math.round(Number(soItem.subtotal)) || 0,
                description: soItem.description || '',
                deliveredQty: Math.floor(Number(soItem.deliveredQty || soItem.quantity)) || 0,
                isReturned: false,
                // Include product info if available
                product: soItem.product ? {
                  id: soItem.product.id,
                  name: soItem.product.name,
                  sku: soItem.product.sku,
                  priceSell: soItem.product.priceSell,
                  unit: soItem.product.unit
                } : null,
                // Include warehouse info if available
                warehouse: soItem.warehouse ? {
                  id: soItem.warehouse.id,
                  name: soItem.warehouse.name
                } : null,
                // Reference to sales order item
                salesOrderItemId: soItem.id
              };
              
              form.value.salesInvoiceItems.push(invoiceItem);
            });
            
            // DPP akan otomatis dihitung dari watcher salesInvoiceItemsTotal
            
          }
          })
          .catch((error) => {
            // Fallback: create empty items array
            form.value.salesInvoiceItems = [];
          });
        }

    }
  } else if (!newSalesOrderId && oldSalesOrderId) {
    // Jika sales order dihapus/di-clear, reset beberapa field ke kondisi manual
    
    // ✅ FIX: Set flag untuk mencegah recursive updates
    isUpdatingFromWatcher.value = true;
    
    // Reset ke default values tapi tetap biarkan user bisa edit
    if (!isEditMode.value) {
      form.value.customerId = null;
      form.value.discountPercent = 0;
      form.value.taxPercent = 0;
      form.value.total = 0;
      form.value.dpp = 0;
      form.value.paidAmount = 0;
      form.value.status = 'unpaid';
      form.value.perusahaanId = null;
      form.value.cabangId = null;
      // Clear sales invoice items
      if (!form.value.salesInvoiceItems) {
        form.value.salesInvoiceItems = [];
      } else {
        form.value.salesInvoiceItems = [];
      }
    }
    
    // ✅ FIX: Reset flag setelah reset selesai
    await nextTick();
    isUpdatingFromWatcher.value = false;
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
  if (form.value.salesInvoiceItems && Array.isArray(form.value.salesInvoiceItems) && newProducts && Array.isArray(newProducts)) {
    form.value.salesInvoiceItems.forEach(item => {
      if (!item) return;
      const productExists = newProducts.some(p => p && p.id === item.productId);
      if (!productExists) {
        item.productId = null;
        item.price = 0;
        item.quantity = 1;
        item.subtotal = 0;
      }
    });
  }
}, { deep: true });

watch(globalFilterValue, useDebounceFn((newValue) => {
    filters.value.search = newValue;
}, 500));

watch(filters, (newFilters) => {
    const { page, rows, ...restFilters } = newFilters;
    salesInvoiceStore.setFilters(restFilters);
}, { deep: true });

// ✅ NEW: Refresh statistics when filters change
watch(filters, () => {
    salesInvoiceStore.fetchInvoiceStatistics();
}, { deep: true });

const onPage = (event) => {
    if (event) {
        // Ensure the event has valid values
        const validEvent = {
            first: Number(event.first) || 0,
            rows: Number(event.rows) || 10,
            page: Number(event.page) || 0
        };
        salesInvoiceStore.setPagination(validEvent);
    }
};

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10;
    params.value.rows = rowsValue;
    params.value.first = 0;
    salesInvoiceStore.fetchSalesInvoices();
};

const handleSearch = (value) => {
    globalFilterValue.value = value;
    params.value.first = 0;
    salesInvoiceStore.fetchSalesInvoices();
};

const onSort = (event) => {
    if (event) {
        salesInvoiceStore.setSort(event);
    }
};

// Export data function
const exportData = (format) => {
    if (format === 'excel') {
        const toast = useToast();
        
        // Cek apakah ada filter yang diterapkan
        const hasFilters = filters.value.customerId || filters.value.source || filters.value.status || filters.value.search;
        
        toast.info({
            title: 'Info',
            message: hasFilters 
                ? 'Sedang mempersiapkan data sesuai filter untuk export Excel...' 
                : 'Sedang mempersiapkan semua data untuk export Excel...',
            color: 'blue'
        });
        
        // Ambil semua data yang sesuai dengan filter untuk export Excel
        salesInvoiceStore.fetchAllSalesInvoicesForExport()
            .then((allData) => {
                if (allData && allData.length > 0) {
                    // Gunakan fungsi export Excel khusus untuk Sales Invoice
                    return exportSalesInvoiceExcel(allData)
                        .then(() => {
                            toast.success({
                                title: 'Success',
                                message: `Excel berhasil dibuat dengan ${allData.length} data Sales Invoice${hasFilters ? ' sesuai filter' : ''}`,
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
        const hasFilters = filters.value.customerId || filters.value.source || filters.value.status || filters.value.search;
        
        toast.info({
            title: 'Info',
            message: hasFilters 
                ? 'Sedang mempersiapkan data sesuai filter untuk export PDF...' 
                : 'Sedang mempersiapkan semua data untuk export PDF...',
            color: 'blue'
        });
        
        // Ambil semua data yang sesuai dengan filter untuk export PDF
        salesInvoiceStore.fetchAllSalesInvoicesForExport()
            .then((allData) => {
                if (allData && allData.length > 0) {
                    // Gunakan fungsi export PDF khusus untuk Sales Invoice
                    return exportSalesInvoicePDF(allData)
                        .then(() => {
                            toast.success({
                                title: 'Success',
                                message: `PDF berhasil dibuat dengan ${allData.length} data Sales Invoice${hasFilters ? ' sesuai filter' : ''}`,
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

const onQuantityChange = (index) => {
  // Pastikan quantity selalu integer
  const item = form.value.salesInvoiceItems[index];
  if (item && item.quantity !== null && item.quantity !== undefined) {
    item.quantity = Math.floor(Number(item.quantity)) || 0;
  }
  calculateSubtotal(index);
};

const calculateSubtotal = (index) => {
  const item = form.value.salesInvoiceItems[index];
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.price) || 0;
  const result = quantity * unitPrice;
  // Bulatkan ke integer untuk menghindari desimal
  item.subtotal = Math.round(result);
};

// ✅ NEW: Function untuk menangani perubahan produk pada sales invoice items
const onProductChange = (index) => {
  const selectedProductId = form.value.salesInvoiceItems[index].productId;
  const selectedProduct = customerProducts.value && Array.isArray(customerProducts.value) 
    ? customerProducts.value.find(p => p && p.id === selectedProductId)
    : null;

  if (selectedProduct) {
    const item = form.value.salesInvoiceItems[index];
    item.price = Number(selectedProduct.priceSell) || 0;
    calculateSubtotal(index);
    updateStockInfo(index);
  }
};

// ✅ NEW: Function untuk update stock info
const updateStockInfo = (index) => {
  const item = form.value.salesInvoiceItems[index];
  if (item.productId && item.warehouseId) {
    const stockStore = useStocksStore();
    stockStore.params.search = ''; // Reset search if any
    stockStore.params.rows = 1; // We only need one record
    stockStore.fetchStocksPaginated({
      productId: item.productId,
      warehouseId: item.warehouseId,
    }).then((response) => {
      if (response && response.data && response.data.length > 0) {
        item.stock = response.data[0];
      } else {
        item.stock = { quantity: 0 };
      }
    }).catch((error) => {
      item.stock = { quantity: 0 };
    });
  } else {
    item.stock = { quantity: 0 };
  }
};

// ✅ NEW: Function untuk menambah item sales invoice
const addSalesInvoiceItem = () => {
  // Pastikan salesInvoiceItems selalu ada
  if (!form.value.salesInvoiceItems) {
    form.value.salesInvoiceItems = [];
  }
  form.value.salesInvoiceItems.push({
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

// ✅ NEW: Function untuk menghapus item sales invoice
const removeSalesInvoiceItem = (index) => {
  form.value.salesInvoiceItems.splice(index, 1);
};

// ✅ NEW: Function untuk handle perubahan delivered quantity
const onDeliveredQtyChange = (index) => {
  const item = form.value.salesInvoiceItems[index];
  if (item && item.deliveredQty !== null && item.deliveredQty !== undefined) {
    item.deliveredQty = Math.floor(Number(item.deliveredQty)) || 0;
  }
};

// Function to convert formatted rupiah back to number
const parseRupiahToNumber = (rupiahString) => {
  if (!rupiahString) return 0;
  // Remove 'Rp', spaces, dots (thousand separators) and convert to number
  return Number(rupiahString.replace(/[Rp\s.]/g, '').replace(',', '.')) || 0;
};

// Handler untuk update total dari input yang diformat
const updateTotalFromInput = (event) => {
  if (!form.value.salesOrderId) { // Only allow manual input if no sales order selected
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

const viewSalesInvoiceDetails = (salesInvoiceId) => {
    
    if (!salesInvoiceId) {
        toast.fire({
            icon: 'error',
            title: 'Parameter Tidak Valid',
            text: 'ID Sales Invoice tidak valid.',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    router.push({ path: `/sales/sales-invoice-detail`, query: { id: salesInvoiceId } });
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'unpaid': return { text: 'Unpaid', class: 'badge rounded-pill bg-label-danger' };
        case 'partial': return { text: 'Partial', class: 'badge rounded-pill bg-label-warning' };
        case 'paid': return { text: 'Paid', class: 'badge rounded-pill bg-label-success' };
        default: return { text: '-', class: 'badge rounded-pill bg-label-light' };
    }
};

const printSalesInvoice = (salesInvoiceId) => {
    
    if (!salesInvoiceId) {
        toast.fire({
            icon: 'error',
            title: 'Parameter Tidak Valid',
            text: 'ID Sales Invoice tidak valid.',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    router.push({ path: `/sales/cetak-invoice`, query: { id: salesInvoiceId } });
};

const getSalesOrderLabel = (option) => {
    if (!option) return '';
    return `${option.noSo} - ${option.customer?.name || 'No Customer'}`;
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', { 
        day  : '2-digit',
        month: '2-digit',
        year : 'numeric'
    });
};

// Fungsi export PDF khusus untuk Sales Invoice
const exportSalesInvoicePDF = (dataToExport) => {
    return Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
    ]).then(([{ default: jsPDF }, { default: autoTable }]) => {

    // Definisikan kolom yang akan diexport
    const columnDefinitions = [
        { field: 'noInvoice', header: 'No. Invoice' },
        { field: 'customer.name', header: 'Nama Customer' },
        { field: 'status', header: 'Status' },
        { field: 'date', header: 'Tanggal' },
        { field: 'dueDate', header: 'Jatuh Tempo' },
        { field: 'salesOrder.perusahaan.nmPerusahaan', header: 'Perusahaan' },
        { field: 'total', header: 'Total' },
        { field: 'paidAmount', header: 'Dibayar' },
        { field: 'remainingAmount', header: 'Sisa' }
    ];

    const head = [columnDefinitions.map(col => col.header)];

    if (!dataToExport || dataToExport.length === 0) {
        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text('Laporan Sales Invoices', 14, 15);
        doc.setFontSize(12);
        doc.text('Tidak ada data yang tersedia untuk export', 14, 50);
        doc.save('sales-invoices-empty.pdf');
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
        if (col.field === 'date' || col.field === 'dueDate') {
            if (value && value !== '-') {
                value = new Date(value).toLocaleDateString('id-ID');
            }
        } else if (col.field === 'total' || col.field === 'paidAmount' || col.field === 'remainingAmount') {
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
            if (value === 'unpaid') value = 'Unpaid';
            else if (value === 'partial') value = 'Partial';
            else if (value === 'paid') value = 'Paid';
        }

        return String(value);
    }));

    // Definisikan lebar kolom
    const columnStyles = {
        0: { cellWidth: 30 }, // No. Invoice
        1: { cellWidth: 32 }, // Nama Customer
        2: { cellWidth: 30 }, // Status
        3: { cellWidth: 30 }, // Tanggal
        4: { cellWidth: 30 }, // Jatuh Tempo
        5: { cellWidth: 30 }, // Perusahaan
        6: { cellWidth: 30 }, // Dibayar
        7: { cellWidth: 30 }, // Sisa
        8: { cellWidth: 30 } // Total
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
    let totalPaid = 0;
    let totalRemaining = 0;
    dataToExport.forEach(row => {
        const totalValue = parseFloat(row.total) || 0;
        const paidValue = parseFloat(row.paidAmount) || 0;
        const remainingValue = parseFloat(row.remainingAmount) || 0;
        grandTotal += totalValue;
        totalPaid += paidValue;
        totalRemaining += remainingValue;
    });

    // Format grand total
    const formattedGrandTotal = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(grandTotal);

    const formattedTotalPaid = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(totalPaid);

    const formattedTotalRemaining = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(totalRemaining);

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
    doc.text('Laporan Sales Invoices', 14, 15);

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
    if (filters.value.source) {
        filterInfo.push(`Source: ${filters.value.source}`);
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
            if (data.column.index === columnDefinitions.findIndex(col => col.field === 'paidAmount')) {
                if (data.section === 'head') {
                    data.cell.styles.textColor = [255, 255, 255];
                } else {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [200, 255, 200];
                }
            }
            if (data.column.index === columnDefinitions.findIndex(col => col.field === 'remainingAmount')) {
                if (data.section === 'head') {
                    data.cell.styles.textColor = [255, 255, 255];
                } else {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [255, 200, 200];
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

    // Total dibayar
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'bold');
    doc.text('Total Dibayar:', 10, finalY + 30);
    doc.text(String(formattedTotalPaid), doc.internal.pageSize.width - 10, finalY + 30, { align: 'right' });

    // Total sisa
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'bold');
    doc.text('Total Sisa:', 10, finalY + 40);
    doc.text(String(formattedTotalRemaining), doc.internal.pageSize.width - 10, finalY + 40, { align: 'right' });

    // Info ringkasan
    doc.setFontSize(8);
    doc.setFont(fontFamily, 'normal');
    doc.text(`Total Sales Invoices: ${dataToExport.length}`, 10, finalY + 55);

    // Pastikan pembagian tidak menghasilkan NaN atau Infinity
    let rataRata = 0;
    if (dataToExport.length > 0) {
        rataRata = grandTotal / dataToExport.length;
    }
    doc.text(
        `Rata-rata per Invoice: ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(rataRata)}`,
        10,
        finalY + 62
    );

    doc.save('sales-invoices.pdf');
    });
};

// Fungsi export Excel khusus untuk Sales Invoice
const exportSalesInvoiceExcel = (dataToExport) => {
    return Promise.all([
        import('xlsx')
    ]).then(([XLSX]) => {
        // Definisikan kolom yang akan diexport
        const columnDefinitions = [
            { field: 'noInvoice', header: 'No. Invoice' },
            { field: 'customer.name', header: 'Nama Customer' },
            { field: 'status', header: 'Status' },
            { field: 'date', header: 'Tanggal' },
            { field: 'dueDate', header: 'Jatuh Tempo' },
            { field: 'salesOrder.perusahaan.nmPerusahaan', header: 'Perusahaan' },
            { field: 'total', header: 'Total' },
            { field: 'paidAmount', header: 'Dibayar' },
            { field: 'remainingAmount', header: 'Sisa' }
        ];

        if (!dataToExport || dataToExport.length === 0) {
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
        let totalPaid = 0;
        let totalRemaining = 0;
        dataToExport.forEach(row => {
            const totalValue = parseFloat(row.total) || 0;
            const paidValue = parseFloat(row.paidAmount) || 0;
            const remainingValue = parseFloat(row.remainingAmount) || 0;
            grandTotal += totalValue;
            totalPaid += paidValue;
            totalRemaining += remainingValue;
        });

        // Format grand total
        const formattedGrandTotal = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(grandTotal);

        const formattedTotalPaid = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(totalPaid);

        const formattedTotalRemaining = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(totalRemaining);

        // Buat data untuk Excel
        const excelData = [];

        // Header perusahaan
        excelData.push([companyInfo.name]);
        excelData.push([companyInfo.address]);
        excelData.push([`Email: ${companyInfo.email}`]);
        excelData.push([`Telp: ${companyInfo.phone}`]);
        excelData.push([]); // Baris kosong

        // Judul laporan
        excelData.push(['Laporan Sales Invoices']);
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
        if (filters.value.source) {
            const sourceLabel = filters.value.source.charAt(0).toUpperCase() + filters.value.source.slice(1);
            filterInfo.push(`Source: ${sourceLabel}`);
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
                if (col.field === 'date' || col.field === 'dueDate') {
                    if (value && value !== '-') {
                        value = new Date(value).toLocaleDateString('id-ID');
                    }
                } else if (col.field === 'total' || col.field === 'paidAmount' || col.field === 'remainingAmount') {
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
                    if (value === 'unpaid') value = 'Unpaid';
                    else if (value === 'partial') value = 'Partial';
                    else if (value === 'paid') value = 'Paid';
                }

                return String(value);
            });
            excelData.push(rowData);
        });

        // Baris kosong
        excelData.push([]);

        // Summary
        excelData.push(['Grand Total:', formattedGrandTotal]);
        excelData.push(['Total Dibayar:', formattedTotalPaid]);
        excelData.push(['Total Sisa:', formattedTotalRemaining]);
        excelData.push(['Total Sales Invoices:', dataToExport.length]);

        // Pastikan pembagian tidak menghasilkan NaN atau Infinity
        let rataRata = 0;
        if (dataToExport.length > 0) {
            rataRata = grandTotal / dataToExport.length;
        }
        excelData.push([
            'Rata-rata per Invoice:', 
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
            { wch: 20 }, // No. Invoice
            { wch: 25 }, // Nama Customer
            { wch: 15 }, // Status
            { wch: 15 }, // Tanggal
            { wch: 15 }, // Jatuh Tempo
            { wch: 25 }, // Perusahaan
            { wch: 20 }, // Total
            { wch: 20 }, // Dibayar
            { wch: 20 }  // Sisa
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
        if (ws[`A${summaryStartRow + 4}`]) {
            ws[`A${summaryStartRow + 4}`].s = { font: { bold: true } };
        }
        if (ws[`A${summaryStartRow + 5}`]) {
            ws[`A${summaryStartRow + 5}`].s = { font: { bold: true } };
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Sales Invoices');
        XLSX.writeFile(wb, 'sales-invoices.xlsx');
    });
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Sales Invoice',
  description: 'Sales Invoice Management',
  keywords: 'Sales Invoice, Sales, Kainnova Digital Solutions',
  author: 'Kainnova Digital Solutions',
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
