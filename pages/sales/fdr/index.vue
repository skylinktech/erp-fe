<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div v-if="isInitialLoading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
          <p class="mt-3 text-muted">Memuat data FDR...</p>
        </div>
      </div>

      <div v-else class="container-xxl flex-grow-1 container-pt-12">
        <h4 class="mb-1">Form Design Request</h4>
        <p class="mb-6">List Form Design Request yang terdaftar di sistem</p>

        <!-- Statistics Cards -->
        <div class="row g-6 mb-6">
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Total FDR</p>
                  <span class="avatar-initial rounded bg-label-primary"><i class="ri-file-list-3-line"></i></span>
                </div>
                <h5 class="mb-1">{{ stats.total || 0 }}</h5>
                <span class="text-muted">FDR terdaftar</span>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Draft</p>
                  <span class="avatar-initial rounded bg-label-secondary"><i class="ri-draft-line"></i></span>
                </div>
                <h5 class="mb-1">{{ stats.draft || 0 }}</h5>
                <span class="text-muted">Draft</span>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Pending</p>
                  <span class="avatar-initial rounded bg-label-warning"><i class="ri-time-line"></i></span>
                </div>
                <h5 class="mb-1">{{ stats.pending || 0 }}</h5>
                <span class="text-muted">Pending</span>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Approved</p>
                  <span class="avatar-initial rounded bg-label-success"><i class="ri-checkbox-circle-line"></i></span>
                </div>
                <h5 class="mb-1">{{ stats.approved || 0 }}</h5>
                <span class="text-muted">Approved</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="row g-6">
          <div class="col-12">
            <h4 class="mt-6 mb-1">Filter FDR</h4>
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label text-muted mb-2">Filter Customer</label>
                    <CustomSelect2
                      v-model="filters.customerId"
                      :options="customers"
                      :get-option-label="getCustomerLabel"
                      :reduce="getCustomerId"
                      placeholder="Pilih Customer"
                      searchable
                      clearable
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label text-muted mb-2">Filter Status</label>
                    <CustomSelect2
                      v-model="filters.status"
                      :options="statusOptions"
                      :get-option-label="getOptionLabel"
                      :reduce="getOptionValue"
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
                      :get-option-label="getOptionLabel"
                      :reduce="getOptionValue"
                      placeholder="Pilih Priority"
                      searchable
                      clearable
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <div class="form-floating form-floating-outline">
                      <input type="date" v-model="filters.startDate" class="form-control" @change="onDateChange">
                      <label>Tanggal Mulai</label>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <div class="form-floating form-floating-outline">
                      <input type="date" v-model="filters.endDate" class="form-control" @change="onDateChange">
                      <label>Tanggal Akhir</label>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <button @click="clearDateFilters" class="btn btn-outline-secondary">
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
                    v-if="userHasRole('superadmin') || userHasPermission('create_fdr')"
                    @click="fdrStore.openModal(null)"
                    class="btn btn-primary"
                  >
                    <i class="ri-add-line me-1"></i> Tambah FDR
                  </button>
                  <span class="p-input-icon-left">
                    <InputText
                      v-model="globalFilterValue"
                      placeholder="Cari FDR..."
                      class="w-full md:w-20rem"
                    />
                  </span>
                </div>
              </div>
              <div class="card-datatable table-responsive py-3 px-3">
                <MyDataTable
                  ref="myDataTableRef"
                  :data="fdrs"
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
                    <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
                  </Column>
                  <Column field="fdrNumber" header="FDR Number" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">
                      <NuxtLink
                        :to="`/sales/fdr/detail/${slotProps.data.id}`"
                        class="text-primary text-decoration-underline"
                      >{{ slotProps.data.fdrNumber || '-' }}</NuxtLink>
                    </template>
                  </Column>
                  <Column field="name" header="Project Name" :sortable="true" class="text-nowrap"></Column>
                  <Column field="customer.name" header="Customer" :sortable="true" class="text-nowrap fw-semibold"></Column>
                  <Column field="location" header="Lokasi" :sortable="true"></Column>
                  <Column field="businessScheme.name" header="Skema" :sortable="true" class="text-nowrap"></Column>
                  <Column field="priority" header="Priority" :sortable="true">
                    <template #body="slotProps">
                      <span :class="getPriorityBadgeClass(slotProps.data.priority)">{{ getPriorityBadgeText(slotProps.data.priority) }}</span>
                    </template>
                  </Column>
                  <Column field="status" header="Status" :sortable="true">
                    <template #body="slotProps">
                      <span :class="getStatusBadgeClass(slotProps.data)">{{ getStatusBadgeText(slotProps.data) }}</span>
                    </template>
                  </Column>
                  <Column field="grandTotal" header="Total" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">{{ formatRupiah(slotProps.data.grandTotal) }}</template>
                  </Column>
                  <Column field="fdrDate" header="Tanggal" :sortable="true">
                    <template #body="slotProps">{{ formatFdrDate(slotProps.data.fdrDate) }}</template>
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
                        <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                          <i class="ri-more-2-fill"></i>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                          <li v-if="(userHasRole('superadmin') || userHasPermission('edit_fdr')) && slotProps.data.status === 'draft'">
                            <a class="dropdown-item" href="javascript:void(0)" @click="fdrStore.submitFdr(slotProps.data.id)"><i class="ri-send-plane-line me-2"></i> Submit</a>
                          </li>
                          <li v-if="(userHasRole('superadmin') || userHasPermission('approve_fdr')) && slotProps.data.status === 'pending'">
                            <a class="dropdown-item" href="javascript:void(0)" @click="fdrStore.approveFdr(slotProps.data.id)"><i class="ri-check-line me-2"></i> Approve</a>
                          </li>
                          <li v-if="(userHasRole('superadmin') || userHasPermission('approve_fdr')) && slotProps.data.status !== 'cancelled'">
                            <a class="dropdown-item" href="javascript:void(0)" @click="fdrStore.cancelFdr(slotProps.data.id)"><i class="ri-close-circle-line me-2"></i> Cancel</a>
                          </li>
                          <li v-if="(userHasRole('superadmin') || userHasPermission('reject_fdr')) && slotProps.data.status === 'pending'">
                            <a class="dropdown-item" href="javascript:void(0)" @click="fdrStore.rejectFdr(slotProps.data.id)"><i class="ri-close-line me-2"></i> Reject</a>
                          </li>
                          <li v-if="userHasRole('superadmin') || userHasPermission('edit_fdr')">
                            <a class="dropdown-item" href="javascript:void(0)" @click="fdrStore.openModal(slotProps.data)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                          </li>
                          <li v-if="userHasRole('superadmin') || userHasPermission('delete_fdr')">
                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="fdrStore.deleteFdr(slotProps.data.id)"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
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
          id="FdrModal"
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
                      <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#fdr-tabs-info" type="button">Informasi</button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#fdr-tabs-materials" type="button">Material/Product</button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#fdr-tabs-services" type="button">Services</button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#fdr-tabs-dids" type="button">DID</button>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="tab-content pt-6">
                <!-- Tab Info -->
                <div class="tab-pane fade active show" id="fdr-tabs-info">
                  <div class="row g-4">
                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <input type="text" v-model="form.name" class="form-control" placeholder="Nama" required>
                        <label>Nama Project</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <CustomSelect2 v-model="form.customerId" :options="customers" :get-option-label="getCustomerLabel" :reduce="getCustomerId" placeholder="Pilih Customer" searchable clearable />
                    </div>
                    <div class="col-md-6">
                      <CustomSelect2 v-model="form.siteId" :options="sites" :get-option-label="getSiteLabel" :reduce="getSiteId" placeholder="Pilih Site" searchable clearable @update:modelValue="onSiteChange" />
                    </div>
                    <div class="col-md-6">
                      <CustomSelect2 v-model="form.businessSchemeId" :options="businessSchemes" :get-option-label="getBranchLabel" :reduce="getBranchId" placeholder="Pilih Business Scheme" searchable clearable />
                    </div>
                    <div class="col-md-12">
                      <label class="form-label text-muted">Isi dari Site Investment</label>
                      <CustomSelect2
                        v-model="selectedSiteInvestId"
                        :options="siteInvestOptions"
                        :get-option-label="getSiteInvestLabel"
                        :reduce="getSiteInvestId"
                        placeholder="Pilih Site Investment untuk mengisi data project + Price List"
                        searchable
                        clearable
                        @update:modelValue="onSiteInvestSelect"
                      />
                      <small class="text-muted">Pilih Site Investment yang sudah berisi Price List untuk mengisi Material, Service, DID dan data project ke FDR.</small>
                    </div>
                    <div class="col-md-12">
                      <label class="form-label text-muted">Isi dari Price List</label>
                      <CustomSelect2
                        v-model="selectedPriceListId"
                        :options="priceListOptions"
                        :get-option-label="getPriceListLabel"
                        :reduce="getPriceListId"
                        placeholder="Pilih Price List untuk mengisi Material, Service, DID"
                        searchable
                        clearable
                        @update:modelValue="onPriceListSelect"
                      />
                      <small class="text-muted">Pilih untuk mengisi tab Material/Product, Services, dan DID secara otomatis.</small>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <input type="text" v-model="form.location" class="form-control" placeholder="Lokasi" required>
                        <label>Lokasi</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <CustomSelect2 v-model="form.priority" :options="priorityOptions" :get-option-label="getOptionLabel" :reduce="getOptionValue" placeholder="Priority" searchable clearable />
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="number" v-model.number="form.quantity" class="form-control" min="1">
                        <label>Quantity</label>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input type="date" v-model="form.fdrDate" class="form-control">
                        <label>Tanggal FDR</label>
                      </div>
                    </div>
                    <div class="col-md-3">
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
                    <div class="col-md-12">
                      <div class="form-check form-switch mt-4">
                        <input class="form-check-input" type="checkbox" v-model="form.pocNeeded" id="pocNeeded">
                        <label class="form-check-label" for="pocNeeded">POC Needed</label>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-floating form-floating-outline">
                        <textarea v-model="form.notes" class="form-control" placeholder="Catatan" rows="3"></textarea>
                        <label>Notes</label>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <label class="form-label">Attachment</label>
                      <input type="file" @change="onAttachmentChange" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv">
                    </div>

                    <div class="col-12 mt-5">
                      <div class="investment-summary-card">
                        <h6 class="investment-summary-title"><i class="ri-pie-chart-2-line me-2"></i>Ringkasan Total</h6>
                        <div class="investment-summary-body">
                          <div class="investment-summary-row"><span class="investment-summary-label">Service</span><span class="investment-summary-value">{{ formatRupiah(serviceSubtotal) }}</span></div>
                          <div class="investment-summary-row"><span class="investment-summary-label">Material</span><span class="investment-summary-value">{{ formatRupiah(materialSubtotal) }}</span></div>
                          <div class="investment-summary-row"><span class="investment-summary-label">DID</span><span class="investment-summary-value">{{ formatRupiah(didSubtotal) }}</span></div>
                          <div class="investment-summary-divider"></div>
                          <div class="investment-summary-row investment-summary-row-grand"><span class="investment-summary-label">Grand Total</span><span class="investment-summary-value">{{ formatRupiah(totalInvestment) }}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tab Materials -->
                <div class="tab-pane fade" id="fdr-tabs-materials">
                  <div v-for="(item, index) in form.fdrItems" :key="index" class="repeater-item mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="text-muted fw-medium">Item #{{ index + 1 }}</span>
                      <button class="btn btn-sm btn-outline-danger" @click.prevent="fdrStore.removeItem(index)" type="button"><i class="ri-delete-bin-line me-1"></i> Hapus</button>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-12 form-check mb-2">
                        <input class="form-check-input" type="checkbox" v-model="item.isPriceOverridden" :id="'customPriceMat' + index">
                        <label class="form-check-label" :for="'customPriceMat' + index">Custom Price</label>
                      </div>
                      <div class="col-md-6">
                        <CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesProduct" :get-option-label="getMaterialLineLabel" :reduce="getMaterialLineId" placeholder="Pilih Product" searchable clearable @update:modelValue="onItemLineChange(index, $event)" />
                      </div>
                      <div class="col-md-2">
                        <div class="form-floating form-floating-outline">
                          <input type="number" v-model.number="item.quantity" @input="calculateItemSubtotal(index)" class="form-control" min="0.01" step="0.01">
                          <label>Qty</label>
                        </div>
                      </div>
                      <div class="col-md-2">
                        <div class="form-floating form-floating-outline">
                          <input type="text" :value="formatRupiah(item.price)" @input="updateItemPriceFromInput(index, $event)" class="form-control" :readonly="!item.isPriceOverridden" :class="item && !item.isPriceOverridden ? 'bg-light' : ''">
                          <label>Harga</label>
                        </div>
                      </div>
                      <div class="col-md-2">
                        <div class="form-floating form-floating-outline">
                          <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" readonly>
                          <label>Subtotal</label>
                        </div>
                      </div>
                    </div>
                    <hr class="my-4">
                  </div>
                  <button @click.prevent="fdrStore.addItem()" class="btn btn-primary">Tambah Material</button>
                  <div class="d-flex justify-content-end mt-4"><span class="fw-bold fs-5">Subtotal Material: {{ formatRupiah(materialSubtotal) }}</span></div>
                </div>

                <!-- Tab Services -->
                <div class="tab-pane fade" id="fdr-tabs-services">
                  <div v-for="(item, index) in form.fdrServices" :key="index" class="repeater-item mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="text-muted fw-medium">Item #{{ index + 1 }}</span>
                      <button class="btn btn-sm btn-outline-danger" @click.prevent="fdrStore.removeService(index)" type="button"><i class="ri-delete-bin-line me-1"></i> Hapus</button>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-12 form-check mb-2">
                        <input class="form-check-input" type="checkbox" v-model="item.isPriceOverridden" :id="'customPriceSvc' + index">
                        <label class="form-check-label" :for="'customPriceSvc' + index">Custom Price</label>
                      </div>
                      <div class="col-md-6">
                        <CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesService" :get-option-label="getServiceLineLabel" :reduce="getServiceLineId" placeholder="Pilih Service" searchable clearable @update:modelValue="onServiceLineChange(index, $event)" />
                      </div>
                      <div class="col-md-2">
                        <div class="form-floating form-floating-outline">
                          <input type="number" v-model.number="item.quantity" @input="calculateServiceSubtotal(index)" class="form-control" min="0.01" step="0.01">
                          <label>Qty</label>
                        </div>
                      </div>
                      <div class="col-md-2">
                        <div class="form-floating form-floating-outline">
                          <input type="text" :value="formatRupiah(item.price)" @input="updateServicePriceFromInput(index, $event)" class="form-control" :readonly="!item.isPriceOverridden" :class="item && !item.isPriceOverridden ? 'bg-light' : ''">
                          <label>Harga</label>
                        </div>
                      </div>
                      <div class="col-md-2">
                        <div class="form-floating form-floating-outline">
                          <input type="text" :value="formatRupiah(item.subtotal)" class="form-control" readonly>
                          <label>Subtotal</label>
                        </div>
                      </div>
                    </div>
                    <hr class="my-4">
                  </div>
                  <button @click.prevent="fdrStore.addService()" class="btn btn-primary">Tambah Service</button>
                  <div class="d-flex justify-content-end mt-4"><span class="fw-bold fs-5">Subtotal Service: {{ formatRupiah(serviceSubtotal) }}</span></div>
                </div>

                <!-- Tab DIDs -->
                <div class="tab-pane fade" id="fdr-tabs-dids">
                  <div v-for="(item, index) in form.fdrDids" :key="index" class="repeater-item mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="text-muted fw-medium">Item #{{ index + 1 }}</span>
                      <button class="btn btn-sm btn-outline-danger" @click.prevent="fdrStore.removeDid(index)" type="button"><i class="ri-delete-bin-line me-1"></i> Hapus</button>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-12 form-check mb-2">
                        <input class="form-check-input" type="checkbox" v-model="item.isPriceOverridden" :id="'customPriceDid' + index">
                        <label class="form-check-label" :for="'customPriceDid' + index">Custom Price</label>
                      </div>
                      <div class="col-md-6">
                        <CustomSelect2 v-model="item.priceListLineId" :options="priceListLinesDid" :get-option-label="getDidLineLabel" :reduce="getDidLineId" placeholder="Pilih DID" searchable clearable @update:modelValue="onDidLineChange(index, $event)" />
                      </div>
                      <div class="col-md-2">
                        <div class="form-floating form-floating-outline">
                          <input type="number" v-model.number="item.quantity" @input="calculateDidSubtotal(index)" class="form-control" min="1">
                          <label>Qty</label>
                        </div>
                      </div>
                      <div class="col-md-2">
                        <div class="form-floating form-floating-outline">
                          <input type="text" :value="formatRupiah(item.price)" @input="updateDidPriceFromInput(index, $event)" class="form-control" :readonly="!item.isPriceOverridden" :class="item && !item.isPriceOverridden ? 'bg-light' : ''">
                          <label>Harga</label>
                        </div>
                      </div>
                      <div class="col-md-2">
                        <div class="form-floating form-floating-outline">
                          <input type="text" :value="formatRupiah(item.subtotal || (item.quantity || 1) * (item.price || 0))" class="form-control" readonly>
                          <label>Subtotal</label>
                        </div>
                      </div>
                    </div>
                    <hr class="my-4">
                  </div>
                  <button @click.prevent="fdrStore.addDid()" class="btn btn-primary">Tambah DID</button>
                  <div class="d-flex justify-content-end mt-4"><span class="fw-bold fs-5">Subtotal DID: {{ formatRupiah(didSubtotal) }}</span></div>
                </div>
              </div>

              <div class="modal-footer mt-6">
                <button type="button" class="btn btn-outline-secondary" @click="fdrStore.closeModal()">Tutup</button>
                <button type="submit" class="btn btn-primary ms-2" :disabled="loading">Simpan</button>
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
import { useFdrStore } from '~/stores/fdr'
import { useCustomerStore } from '~/stores/customer'
import { usePermissions } from '~/composables/usePermissions'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { useImageUrl } from '~/composables/useImageUrl'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useDebounceFn } from '@vueuse/core'

const { setListTitle } = useDynamicTitle()
const route = useRoute()
const router = useRouter()
const isInitialLoading = ref(true)
const fdrStore = useFdrStore()
const customerStore = useCustomerStore()
const formatRupiah = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions()
const { getStatusBadge } = useApprovalStatus()
const { getAttachmentUrl, isImageFile } = useImageUrl()

const { fdrs, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, stats } = storeToRefs(fdrStore)
const { customers } = storeToRefs(customerStore)

const priceListLinesProduct = ref([])
const priceListLinesService = ref([])
const priceListLinesDid = ref([])
const selectedPriceListId = ref(null)
const priceListOptions = ref([])
const selectedSiteInvestId = ref(null)
const siteInvestOptions = ref([])
const sites = ref([])
const businessSchemes = ref([])

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const modalTitle = computed(() => isEditMode.value ? 'Edit FDR' : 'Tambah FDR')
const modalDescription = computed(() => isEditMode.value ? 'Ubah data FDR' : 'Isi form untuk menambahkan FDR baru')

const statusOptions = ref([
  { label: 'Draft', value: 'draft' }, { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' }, { label: 'Cancelled', value: 'cancelled' },
])
const priorityOptions = ref([
  { label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' },
])

const filters = ref({ customerId: null, status: null, priority: null, startDate: null, endDate: null })
const globalFilterValue = ref('')
const tableControls = ref({ rows: 10 })
const myDataTableRef = ref(null)

function formatFdrDate(v) {
  if (v == null || v === '') return '-'
  try {
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch { return '-' }
}

function getCustomerLabel(c) { return c ? c.name : '' }
function getCustomerId(c) { return c ? c.id : null }
function getOptionLabel(o) { return o ? o.label : '' }
function getOptionValue(o) { return o ? o.value : null }
function getSiteLabel(s) { return s ? `${s.code || ''} - ${s.name || ''}` : '' }
function getSiteId(s) { return s ? s.id : null }
function getBranchLabel(b) { return b ? `${b.code || ''} - ${b.name || ''}` : '' }
function getBranchId(b) { return b ? b.id : null }
function getPriceListLabel(pl) { return pl ? (pl.name || '') + (pl.type ? ` (${pl.type})` : '') || '—' : '—' }
function getPriceListId(pl) { return pl ? pl.id : null }
function getSiteInvestLabel(si) { return si ? `${si.siNumber || si.si_number || ''} - ${si.name || ''}`.trim() || '—' : '—' }
function getSiteInvestId(si) { return si ? si.id : null }
function toNum(v) { return (v !== null && v !== undefined && v !== '') ? Number(v) : 0 }
function getServiceLineEffectivePriceFromLine(line) {
  if (!line) return 0
  const base = toNum(line.price) || 0
  const tk = toNum(line.terminalKitCount ?? line.terminal_kit_count) || 0
  const qp = toNum(line.quotaPriority ?? line.quota_priority) || 0
  const nsl = toNum(line.newServiceLine ?? line.new_service_line) || 0
  const ad = toNum(line.additionalData ?? line.additional_data) || 0
  return base + tk + qp + nsl + ad
}
function getMaterialLineLabel(l) { return l ? (l.product ? `${l.product.name} (${l.product.sku || ''})` : `Line #${l.id}`) || '—' : '—' }
function getMaterialLineId(l) { return l ? l.id : null }
function getServiceLineLabel(l) { return l ? (l.service ? l.service.name : `Line #${l.id}`) || '—' : '—' }
function getServiceLineId(l) { return l ? l.id : null }
function getDidLineLabel(l) { return l ? (l.did ? `${l.did.code} - ${l.did.name}` : `Line #${l.id}`) || '—' : '—' }
function getDidLineId(l) { return l ? l.id : null }

const materialSubtotal = computed(() => (form.value?.fdrItems ?? []).reduce((s, i) => s + (Number(i.subtotal) || 0), 0))
const serviceSubtotal = computed(() => (form.value?.fdrServices ?? []).reduce((s, i) => s + (Number(i.subtotal) || 0), 0))
const didSubtotal = computed(() => (form.value?.fdrDids ?? []).reduce((s, i) => s + ((Number(i.quantity) || 1) * (Number(i.price) || 0)), 0))
const totalInvestment = computed(() => materialSubtotal.value + serviceSubtotal.value + didSubtotal.value)

const parseRupiahToNumber = (s) => !s ? 0 : Number(String(s).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0

async function onItemLineChange(index, lineId) {
  const line = priceListLinesProduct.value.find(l => l.id === lineId)
  if (!line || !form.value?.fdrItems?.[index]) return
  const item = form.value.fdrItems[index]
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = item.quantity * item.price
}

function calculateItemSubtotal(index) {
  const item = form.value?.fdrItems?.[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}

function updateItemPriceFromInput(index, e) {
  const v = parseRupiahToNumber(e.target?.value || '')
  if (form.value.fdrItems?.[index]) { form.value.fdrItems[index].price = v; calculateItemSubtotal(index) }
}

function getServiceLineUnitPrice(line) {
  if (!line) return 0
  const base = Number(line.price) || 0
  const tk = Number(line.terminal_kit_count ?? line.terminalKitCount) || 0
  const qp = Number(line.quota_priority ?? line.quotaPriority) || 0
  const nsl = Number(line.new_service_line ?? line.newServiceLine) || 0
  const ad = Number(line.additional_data ?? line.additionalData) || 0
  return base + tk + qp + nsl + ad
}

async function onServiceLineChange(index, lineId) {
  const line = priceListLinesService.value.find(l => l.id === lineId)
  if (!line || !form.value?.fdrServices?.[index]) return
  const item = form.value.fdrServices[index]
  item.price = getServiceLineUnitPrice(line)
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = item.quantity * item.price
}

function calculateServiceSubtotal(index) {
  const item = form.value?.fdrServices?.[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
}

function updateServicePriceFromInput(index, e) {
  const v = parseRupiahToNumber(e.target?.value || '')
  if (form.value.fdrServices?.[index]) { form.value.fdrServices[index].price = v; calculateServiceSubtotal(index) }
}

async function onDidLineChange(index, lineId) {
  const line = priceListLinesDid.value.find(l => l.id === lineId)
  if (!line || !form.value?.fdrDids?.[index]) return
  const item = form.value.fdrDids[index]
  item.price = Number(line.price) || 0
  item.quantity = Number(line.quantity) || 1
  item.isPriceOverridden = false
  item.subtotal = item.quantity * item.price
}

function calculateDidSubtotal(index) {
  const item = form.value?.fdrDids?.[index]
  if (!item) return
  item.subtotal = (Number(item.quantity) || 1) * (Number(item.price) || 0)
}

function updateDidPriceFromInput(index, e) {
  const v = parseRupiahToNumber(e.target?.value || '')
  if (form.value.fdrDids?.[index]) { form.value.fdrDids[index].price = v; calculateDidSubtotal(index) }
}

function onSiteChange(siteId) {
  const s = sites.value.find(x => x.id === siteId)
  if (s && form.value) { form.value.location = s.address || '' }
}

function onAttachmentChange(e) {
  const file = e.target.files?.[0]
  if (!form.value) return
  if (file) {
    if (file.size > 2 * 1024 * 1024) { useToast().error({ title: 'Error', message: 'Maks. 2MB', color: 'red' }); return }
    form.value.attachment = file
    form.value.attachmentPreview = URL.createObjectURL(file)
  } else { form.value.attachment = null; form.value.attachmentPreview = null }
  e.target.value = ''
}

const fetchPriceListLines = async () => {
  const [p, s, d] = await Promise.all([fdrStore.fetchPriceListLines('product'), fdrStore.fetchPriceListLines('service'), fdrStore.fetchPriceListLines('did')])
  priceListLinesProduct.value = p
  priceListLinesService.value = s
  priceListLinesDid.value = d
}

const fetchPriceListsForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.priceList()}?page=1&rows=500&type=site_investment`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) { const j = await r.json(); priceListOptions.value = j.data || [] }
    else priceListOptions.value = []
  } catch (e) {
    console.error('Error fetching price lists for FDR:', e)
    priceListOptions.value = []
  }
}

const fetchSiteInvestsForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.siteInvestment()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) { const j = await r.json(); siteInvestOptions.value = j.data || [] }
    else siteInvestOptions.value = []
  } catch (e) {
    console.error('Error fetching site investments for FDR:', e)
    siteInvestOptions.value = []
  }
}

async function onSiteInvestSelect(siId) {
  if (!form.value || !siId) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.siteInvestmentShow(siId), { credentials: 'include', headers: { Accept: 'application/json' } })
    if (!res.ok) return
    const j = await res.json()
    const si = j.data || j

    const svcField = (o, key) => o[key] ?? o[key.replace(/([A-Z])/g, '_$1').toLowerCase()]

    form.value.name = si.name || form.value.name
    form.value.customerId = si.customerId ?? si.customer_id ?? form.value.customerId
    form.value.siteId = si.siteId ?? si.site_id ?? form.value.siteId
    form.value.businessSchemeId = si.businessSchemeId ?? si.business_scheme_id ?? form.value.businessSchemeId
    form.value.priority = si.priority || form.value.priority
    form.value.location = si.location || form.value.location
    form.value.fdrDate = si.siDate ? new Date(si.siDate).toISOString().split('T')[0] : si.si_date ? new Date(si.si_date).toISOString().split('T')[0] : form.value.fdrDate
    form.value.estimatedStartDate = si.estimatedStartDate ? new Date(si.estimatedStartDate).toISOString().split('T')[0] : si.estimated_start_date ? new Date(si.estimated_start_date).toISOString().split('T')[0] : form.value.estimatedStartDate
    form.value.estimatedCompletionDate = si.estimatedCompletionDate ? new Date(si.estimatedCompletionDate).toISOString().split('T')[0] : si.estimated_completion_date ? new Date(si.estimated_completion_date).toISOString().split('T')[0] : form.value.estimatedCompletionDate

    const mats = si.siteInvestMaterials ?? si.site_invest_materials ?? []
    const svcs = si.siteInvestServices ?? si.site_invest_services ?? []
    const dids = si.siteInvestDids ?? si.site_invest_dids ?? []

    form.value.fdrItems = mats.map((m) => {
      const q = toNum(m.quantity) || 1
      const p = toNum(m.price) || 0
      const plId = m.priceListLineId ?? m.price_list_line_id
      return { priceListLineId: plId, quantity: q, price: p, subtotal: toNum(m.subtotal) || q * p, isPriceOverridden: m.isPriceOverridden ?? m.is_price_overridden ?? false }
    })
    form.value.fdrServices = svcs.map((s) => {
      const q = toNum(s.quantity) || 1
      const p = toNum(s.price) || 0
      const plId = s.priceListLineId ?? s.price_list_line_id
      return {
        priceListLineId: plId,
        quantity: q,
        price: p,
        subtotal: q * p,
        isPriceOverridden: s.isPriceOverridden ?? s.is_price_overridden ?? false,
        terminalKitCount: svcField(s, 'terminalKitCount') != null ? Number(svcField(s, 'terminalKitCount')) : null,
        quotaPriority: svcField(s, 'quotaPriority') != null ? Number(svcField(s, 'quotaPriority')) : null,
        newServiceLine: svcField(s, 'newServiceLine') != null ? Number(svcField(s, 'newServiceLine')) : null,
        additionalData: svcField(s, 'additionalData') != null ? Number(svcField(s, 'additionalData')) : null,
      }
    })
    form.value.fdrDids = dids.map((d) => {
      const q = toNum(d.quantity) || 1
      const p = toNum(d.price) || 0
      const plId = d.priceListLineId ?? d.price_list_line_id
      return { priceListLineId: plId, quantity: q, price: p, subtotal: toNum(d.subtotal) || q * p, isPriceOverridden: d.isPriceOverridden ?? d.is_price_overridden ?? false }
    })

    const addIfMissing = (arr, item) => { if (item && !arr.find((x) => x.id === item.id)) arr.push(item) }
    mats.forEach((m) => { const pl = m.priceListLine ?? m.price_list_line; if (pl) addIfMissing(priceListLinesProduct.value, pl) })
    svcs.forEach((s) => { const pl = s.priceListLine ?? s.price_list_line; if (pl) addIfMissing(priceListLinesService.value, pl) })
    dids.forEach((d) => { const pl = d.priceListLine ?? d.price_list_line; if (pl) addIfMissing(priceListLinesDid.value, pl) })

    const firstPlId = mats[0]?.priceListLine?.price_list_id ?? mats[0]?.priceListLine?.priceList?.id ?? mats[0]?.price_list_line?.price_list_id ?? svcs[0]?.priceListLine?.price_list_id ?? dids[0]?.priceListLine?.price_list_id
    if (firstPlId) selectedPriceListId.value = firstPlId

    if (form.value.fdrItems.length === 0) fdrStore.addItem()
    if (form.value.fdrServices.length === 0) fdrStore.addService()
    if (form.value.fdrDids.length === 0) fdrStore.addDid()

    const siteId = form.value.siteId
    if (siteId) {
      const s = sites.value.find((x) => x.id === siteId)
      if (s) form.value.location = s.address || form.value.location
    }
  } catch (e) {
    console.error('Error filling FDR from Site Investment:', e)
  }
}

async function onPriceListSelect(priceListId) {
  if (!form.value || !priceListId) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.priceListShow(priceListId)}?includeLines=true`, { credentials: 'include', headers: { Accept: 'application/json' } })
    if (!res.ok) return
    const priceList = await res.json()
    const lines = priceList.lines || []
    const pt = (l) => l.priceableType ?? l.priceable_type

    const productLines = lines.filter((l) => pt(l) === 'product')
    form.value.fdrItems = productLines.map((l) => {
      const q = toNum(l.quantity) || 1
      const p = toNum(l.price) || 0
      return { priceListLineId: l.id, quantity: q, price: p, subtotal: toNum(l.subtotal) || q * p, isPriceOverridden: false }
    })

    const serviceLines = lines.filter((l) => pt(l) === 'service')
    const svcField = (l, key) => l[key] ?? l[key.replace(/([A-Z])/g, '_$1').toLowerCase()]
    form.value.fdrServices = serviceLines.map((l) => {
      const q = toNum(l.quantity) || 1
      const p = getServiceLineEffectivePriceFromLine(l)
      return {
        priceListLineId: l.id,
        quantity: q,
        price: p,
        subtotal: q * p,
        isPriceOverridden: false,
        terminalKitCount: svcField(l, 'terminalKitCount') != null ? Number(svcField(l, 'terminalKitCount')) : null,
        quotaPriority: svcField(l, 'quotaPriority') != null ? Number(svcField(l, 'quotaPriority')) : null,
        newServiceLine: svcField(l, 'newServiceLine') != null ? Number(svcField(l, 'newServiceLine')) : null,
        additionalData: svcField(l, 'additionalData') != null ? Number(svcField(l, 'additionalData')) : null,
      }
    })

    const didLines = lines.filter((l) => pt(l) === 'did')
    form.value.fdrDids = didLines.map((l) => {
      const q = toNum(l.quantity) || 1
      const p = toNum(l.price) || 0
      return { priceListLineId: l.id, quantity: q, price: p, subtotal: toNum(l.subtotal) || q * p, isPriceOverridden: false }
    })

    const addIfMissing = (arr, item) => { if (item && !arr.find((x) => x.id === item.id)) arr.push(item) }
    productLines.forEach((l) => addIfMissing(priceListLinesProduct.value, l))
    serviceLines.forEach((l) => addIfMissing(priceListLinesService.value, l))
    didLines.forEach((l) => addIfMissing(priceListLinesDid.value, l))

    if (form.value.fdrItems.length === 0) fdrStore.addItem()
    if (form.value.fdrServices.length === 0) fdrStore.addService()
    if (form.value.fdrDids.length === 0) fdrStore.addDid()
  } catch (e) {
    console.error('Error filling FDR from price list:', e)
  }
}

const fetchSites = async () => {
  const { $api } = useNuxtApp()
  const r = await fetch(`${$api.sites()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' })
  if (r.ok) { const j = await r.json(); sites.value = j.data || [] }
}

const fetchBusinessSchemes = async () => {
  const { $api } = useNuxtApp()
  const r = await fetch(`${$api.businessSchemes()}?page=1&rows=500`, { headers: { Accept: 'application/json' }, credentials: 'include' })
  if (r.ok) { const j = await r.json(); businessSchemes.value = j.data || [] }
}

const handleSubmit = () => {
  fdrStore.saveFdr()
}

function getPriorityBadge(p) {
  switch (p) { case 'low': return { text: 'Low', class: 'badge rounded-pill bg-label-info' }; case 'medium': return { text: 'Medium', class: 'badge rounded-pill bg-label-warning' }; case 'high': return { text: 'High', class: 'badge rounded-pill bg-label-danger' }; default: return { text: '-', class: 'badge rounded-pill bg-label-light' } }
}
function getPriorityBadgeClass(p) { return getPriorityBadge(p).class }
function getPriorityBadgeText(p) { return getPriorityBadge(p).text }
function getStatusBadgeClass(d) { return getStatusBadge(d).class }
function getStatusBadgeText(d) { return getStatusBadge(d).text }
const clearDateFilters = () => { filters.value.startDate = null; filters.value.endDate = null; fdrStore.setFilters(filters.value) }
const onDateChange = () => fdrStore.setFilters(filters.value)

const { isLoading: isDataLoading } = usePageData({
  pageName: 'FDR',
  loaders: [
    () => customerStore.fetchCustomers(),
    () => fetchSites(),
    () => fetchBusinessSchemes(),
    () => fdrStore.fetchFdrs(),
    () => fdrStore.fetchStats(),
  ],
  onSuccess: () => setListTitle('FDR', stats.value.total || 0),
  waitAll: true,
})

watch(isDataLoading, (v) => { isInitialLoading.value = v })

let modalInstance = null
onMounted(() => {
  const el = document.getElementById('FdrModal')
  if (el) modalInstance = new bootstrap.Modal(el)
  tableControls.value.rows = Number(params.value.rows) || 10
  const editId = route.query.edit
  if (editId && typeof editId === 'string') nextTick(() => fdrStore.openModal({ id: editId }))
})

watch(() => params.value.rows, (v) => { tableControls.value.rows = Number(v) || 10 })
watch(globalFilterValue, useDebounceFn(() => fdrStore.setSearch(globalFilterValue.value), 500))
watch(filters, (f) => { fdrStore.setFilters({ ...f, search: params.value.search || globalFilterValue.value }) }, { deep: true })

watch(showModal, async (v) => {
  if (v) {
    await Promise.all([fetchPriceListLines(), fetchPriceListsForSelect(), fetchSiteInvestsForSelect()])
    if (!isEditMode.value) {
      selectedPriceListId.value = null
      selectedSiteInvestId.value = null
    }
    nextTick(() => {
      const el = document.getElementById('FdrModal')
      if (el && !modalInstance) modalInstance = new bootstrap.Modal(el)
      modalInstance?.show()
    })
  } else {
    modalInstance?.hide()
    if (route.query.edit) { const q = { ...route.query }; delete q.edit; router.replace({ path: route.path, query: q }) }
  }
})

const onPage = (e) => { if (e) fdrStore.setPagination({ first: Number(e.first) || 0, rows: Number(e.rows) || 10, page: Number(e.page) || 0 }) }
const handleRowsChange = (v) => { params.value.rows = Number(v) || 10; params.value.first = 0; fdrStore.fetchFdrs() }
const onSort = (e) => { if (e) fdrStore.setSort(e) }

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'FDR',
})
</script>

<style scoped>
.repeater-item { background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #e9ecef; }
.investment-summary-card { background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%); border: 1px solid #e0e7ff; border-radius: 12px; overflow: hidden; }
.investment-summary-title { margin: 0; padding: 14px 18px; font-size: 0.95rem; font-weight: 600; color: #4f46e5; background: rgba(99, 102, 241, 0.08); border-bottom: 1px solid #e0e7ff; }
.investment-summary-body { padding: 16px 18px 18px; }
.investment-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 0.9rem; }
.investment-summary-label { color: #64748b; font-weight: 500; }
.investment-summary-value { font-weight: 600; color: #1e293b; font-variant-numeric: tabular-nums; text-align: right; }
.investment-summary-divider { height: 1px; background: linear-gradient(90deg, transparent, #e0e7ff, transparent); margin: 10px 0; }
.investment-summary-row-total .investment-summary-value { font-weight: 700; color: #4f46e5; }
.investment-summary-row-grand { padding-top: 12px; margin-top: 2px; }
.investment-summary-row-grand .investment-summary-label { font-size: 1rem; font-weight: 700; color: #334155; }
.investment-summary-row-grand .investment-summary-value { font-size: 1.15rem; font-weight: 800; color: #4f46e5; }
</style>
