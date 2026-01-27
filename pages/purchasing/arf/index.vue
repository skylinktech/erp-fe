<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <!-- Loading Overlay -->
      <div
        v-if="isInitialLoading"
        class="d-flex justify-content-center align-items-center"
        style="min-height: 400px;"
      >
        <div class="text-center">
          <div
            class="spinner-border text-primary"
            role="status"
            style="width: 3rem; height: 3rem;"
          >
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Memuat data ARF...</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="container-xxl flex-grow-1 container-p-y">
        <h4 class="mb-1">ARF (Asset Request Form)</h4>
        <p class="mb-6">List ARF yang terdaftar di sistem</p>

        <!-- Statistics Cards -->
        <div class="row g-6 mb-6">
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Total ARF</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-primary">
                      <i class="ri-file-list-3-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="account-heading">
                    <h5 class="mb-1">{{ stats.total || 0 }}</h5>
                    <span class="text-muted">ARF terdaftar</span>
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
                  <p class="mb-0">Submitted</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-info">
                      <i class="ri-send-plane-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="account-heading">
                    <h5 class="mb-1">{{ stats.submitted || 0 }}</h5>
                    <span class="text-muted">Submitted</span>
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
                  <p class="mb-0">Disbursed</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-warning">
                      <i class="ri-money-dollar-circle-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="account-heading">
                    <h5 class="mb-1">{{ stats.disbursed || 0 }}</h5>
                    <span class="text-muted">Disbursed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Settled</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-success">
                      <i class="ri-check-double-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="account-heading">
                    <h5 class="mb-1">{{ stats.settled || 0 }}</h5>
                    <span class="text-muted">Settled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Cancelled</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-secondary">
                      <i class="ri-close-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="account-heading">
                    <h5 class="mb-1">{{ stats.cancelled || 0 }}</h5>
                    <span class="text-muted">Cancelled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="row g-6">
          <div class="col-12">
            <h4 class="mt-6 mb-1">Filter ARF</h4>
            <p class="mb-0">Temukan semua ARF perusahaan Anda</p>
          </div>
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label text-muted mb-2">Filter Site</label>
                    <CustomSelect2
                      v-model="filters.siteId"
                      :options="sites"
                      :get-option-label="site => site.name || `Site #${site.id}`"
                      :reduce="site => site.id"
                      placeholder="Pilih Site"
                      searchable
                      clearable
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label text-muted mb-2">Filter Cost Center</label>
                    <CustomSelect2
                      v-model="filters.costCenterId"
                      :options="costCenters"
                      :get-option-label="cc => cc.name || `Cost Center #${cc.id}`"
                      :reduce="cc => cc.id"
                      placeholder="Pilih Cost Center"
                      searchable
                      clearable
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
                </div>
                <div class="row mt-3">
                  <div class="col-md-4 mb-3">
                    <div class="form-floating form-floating-outline">
                      <input
                        type="date"
                        v-model="filters.startDate"
                        class="form-control"
                        placeholder="Tanggal Mulai"
                        @change="onDateChange"
                      >
                      <label>Tanggal Mulai (Request Date)</label>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <div class="form-floating form-floating-outline">
                      <input
                        type="date"
                        v-model="filters.endDate"
                        class="form-control"
                        placeholder="Tanggal Akhir"
                        @change="onDateChange"
                      >
                      <label>Tanggal Akhir (Request Date)</label>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3 reset-filter-button">
                    <button @click="clearFilters" class="btn btn-outline-secondary me-2">
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
                    v-if="userHasRole('superadmin') || userHasPermission('create_arf')"
                    @click="arfStore.openModal(null)"
                    class="btn btn-primary"
                  >
                    <i class="ri-add-line me-1"></i>
                    Tambah ARF
                  </button>
                  <button @click="exportData('csv')" class="btn btn-outline-secondary" :disabled="loading">
                    <i class="ri-download-line me-1"></i>
                    Export
                  </button>
                  <span class="p-input-icon-left">
                    <InputText
                      v-model="globalFilterValue"
                      placeholder="Cari ARF..."
                      class="w-full md:w-20rem"
                    />
                  </span>
                </div>
              </div>
              <div class="card-datatable table-responsive py-3 px-3">
                <MyDataTable
                  ref="myDataTableRef"
                  :data="arfs"
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

                  <Column field="noArf" header="No. ARF" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">
                      <a
                        @click="navigateTo(`/purchasing/arf/detail/${slotProps.data.id}`)"
                        style="cursor: pointer; color: #666bff; text-decoration: underline;"
                        class="text-primary"
                        title="View detail"
                      >
                        {{ slotProps.data.noArf || '-' }}
                      </a>
                    </template>
                  </Column>

                  <Column field="purchaseRequest.noPr" header="Purchase Request" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">
                      <a
                        v-if="slotProps.data.purchaseRequest"
                        @click="navigateTo(`/purchasing/purchase-request/detail/${slotProps.data.purchaseRequest.id}`)"
                        style="cursor: pointer; color: #666bff; text-decoration: underline;"
                        title="View detail"
                        class="text-primary"
                      >
                        {{ slotProps.data.purchaseRequest.noPr || '-' }}
                      </a>
                      <span v-else>—</span>
                    </template>
                  </Column>

                  <Column field="site.name" header="Site" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">
                      {{ slotProps.data.site?.name || '-' }}
                    </template>
                  </Column>

                  <Column field="costCenter.name" header="Cost Center" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">
                      {{ slotProps.data.costCenter?.name || '-' }}
                    </template>
                  </Column>

                  <Column field="requestDate" header="Request Date" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">
                      {{ formatDate(slotProps.data.requestDate) }}
                    </template>
                  </Column>

                  <Column field="status" header="Status" :sortable="true">
                    <template #body="slotProps">
                      <span :class="getStatusBadge(slotProps.data.status).class">
                        {{ getStatusBadge(slotProps.data.status).text }}
                      </span>
                    </template>
                  </Column>

                  <Column field="purpose" header="Tujuan" :sortable="true"></Column>

                  <Column field="estimatedAmount" header="Estimated Amount" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">
                      {{ formatRupiah(slotProps.data.estimatedAmount || 0) }}
                    </template>
                  </Column>

                  <Column header="Actions" :exportable="false" style="min-width:8rem">
                    <template #body="slotProps">
                      <div class="dropdown d-inline-block">
                        <a
                          href="javascript:;"
                          class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                          data-bs-toggle="dropdown"
                          data-bs-popper-config='{"strategy":"fixed"}'
                        >
                          <i class="ri-more-2-fill"></i>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end arf-actions-dropdown">
                          <li
                            v-if="(userHasRole('superadmin') || userHasPermission('edit_arf')) && slotProps.data.status === 'draft'"
                          >
                            <a
                              class="dropdown-item"
                              href="javascript:void(0)"
                              @click="arfStore.submitArf(slotProps.data.id)"
                            >
                              <i class="ri-send-plane-line me-2"></i> Submit ARF
                            </a>
                          </li>

                          <li
                            v-if="(userHasRole('superadmin') || userHasPermission('approve_arf')) && slotProps.data.status === 'submitted'"
                          >
                            <a
                              class="dropdown-item"
                              href="javascript:void(0)"
                              @click="arfStore.approveArf(slotProps.data.id)"
                            >
                              <i class="ri-check-line me-2"></i> Approve
                            </a>
                          </li>
                          <li
                            v-if="(userHasRole('superadmin') || userHasPermission('approve_arf')) && slotProps.data.status === 'submitted'"
                          >
                            <a
                              class="dropdown-item"
                              href="javascript:void(0)"
                              @click="arfStore.rejectArf(slotProps.data.id)"
                            >
                              <i class="ri-close-line me-2"></i> Reject
                            </a>
                          </li>

                          <li
                            v-if="(userHasRole('superadmin') || userHasPermission('approve_arf')) && slotProps.data.status === 'approved'"
                          >
                            <a
                              class="dropdown-item"
                              href="javascript:void(0)"
                              @click="arfStore.disburseArf(slotProps.data.id)"
                            >
                              <i class="ri-money-dollar-circle-line me-2"></i> Disburse
                            </a>
                          </li>

                          <li
                            v-if="(userHasRole('superadmin') || userHasPermission('approve_arf')) && slotProps.data.status === 'disbursed'"
                          >
                            <a
                              class="dropdown-item"
                              href="javascript:void(0)"
                              @click="arfStore.settleArf(slotProps.data.id)"
                            >
                              <i class="ri-check-double-line me-2"></i> Settle
                            </a>
                          </li>

                          <li
                            v-if="(userHasRole('superadmin') || userHasPermission('approve_arf')) && slotProps.data.status !== 'settled' && slotProps.data.status !== 'cancelled'"
                          >
                            <a
                              class="dropdown-item"
                              href="javascript:void(0)"
                              @click="arfStore.cancelArf(slotProps.data.id)"
                            >
                              <i class="ri-close-circle-line me-2"></i> Cancel
                            </a>
                          </li>

                          <li v-if="userHasRole('superadmin') || userHasPermission('edit_arf')">
                            <a
                              class="dropdown-item"
                              href="javascript:void(0)"
                              @click="arfStore.openModal(slotProps.data)"
                            >
                              <i class="ri-edit-box-line me-2"></i> Edit
                            </a>
                          </li>

                          <li
                            v-if="(userHasRole('superadmin') || userHasPermission('delete_arf')) && slotProps.data.status === 'draft'"
                          >
                            <a
                              class="dropdown-item text-danger"
                              href="javascript:void(0)"
                              @click="arfStore.deleteArf(slotProps.data.id)"
                            >
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
          id="ArfModal"
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
                      <button
                        class="nav-link active"
                        data-bs-toggle="tab"
                        data-bs-target="#form-tabs-info"
                        role="tab"
                        aria-selected="true"
                        type="button"
                      >
                        <span class="ri-information-line ri-20px d-sm-none"></span>
                        <span class="d-none d-sm-block">Informasi</span>
                      </button>
                    </li>
                    <li class="nav-item">
                      <button
                        class="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#form-tabs-items"
                        role="tab"
                        aria-selected="false"
                        type="button"
                      >
                        <span class="ri-box-line ri-20px d-sm-none"></span>
                        <span class="d-none d-sm-block">Items</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="tab-content pt-6">
                <!-- Tab Info -->
                <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                  <div class="row g-4">
                    <div class="col-md-4">
                      <div class="form-floating form-floating-outline">
                        <input
                          type="date"
                          v-model="form.requestDate"
                          class="form-control"
                          placeholder="Request Date"
                        >
                        <label>Request Date</label>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-floating form-floating-outline">
                        <input
                          type="date"
                          v-model="form.neededDate"
                          class="form-control"
                          placeholder="Needed Date"
                        >
                        <label>Needed Date</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted mb-2">Purchase Request</label>
                      <CustomSelect2
                        v-model="form.purchaseRequestId"
                        :options="purchaseRequests"
                        :get-option-label="pr => pr.noPr || `PR #${pr.id}`"
                        :reduce="pr => pr.id"
                        placeholder="Pilih Purchase Request"
                        searchable
                        clearable
                        :disabled="isEditMode"
                        @update:modelValue="onPurchaseRequestChange"
                      />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted mb-2">Site</label>
                      <CustomSelect2
                        v-model="form.siteId"
                        :options="sites"
                        :get-option-label="site => site.name || `Site #${site.id}`"
                        :reduce="site => site.id"
                        placeholder="Pilih Site"
                        searchable
                        clearable
                      />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted mb-2">Cost Center</label>
                      <CustomSelect2
                        v-model="form.costCenterId"
                        :options="costCenters"
                        :get-option-label="cc => cc.name || `Cost Center #${cc.id}`"
                        :reduce="cc => cc.id"
                        placeholder="Pilih Cost Center"
                        searchable
                        clearable
                      />
                    </div>
                    <div class="col-md-3">
                      <div class="form-floating form-floating-outline">
                        <input
                          type="text"
                          v-model="form.currency"
                          class="form-control"
                          placeholder="Currency"
                        >
                        <label>Currency</label>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <div class="form-floating form-floating-outline">
                        <textarea
                          v-model="form.purpose"
                          class="form-control"
                          placeholder="Tujuan"
                          rows="3"
                        ></textarea>
                        <label>Tujuan (Purpose)</label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tab Items -->
                <div class="tab-pane fade" id="form-tabs-items" role="tabpanel">
                  <!-- Checkbox untuk enable additional items -->
                  <div class="mb-4" v-if="form.arfItems && form.arfItems.length > 0 && form.purchaseRequestId">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="'enable-additional'"
                        v-model="arfStore.enableAdditional"
                      >
                      <label class="form-check-label" for="enable-additional">
                        Item Tambahan (Additional)
                      </label>
                    </div>
                    <small class="text-muted d-block mt-1">Centang untuk menambahkan item tambahan di luar item dari Purchase Request</small>
                  </div>

                  <div
                    v-for="(item, index) in form.arfItems"
                    :key="index"
                    class="repeater-item mb-4"
                  >
                    <!-- Badge untuk menandai item additional -->
                    <div v-if="item.additional" class="mb-2">
                      <span class="badge bg-label-warning">
                        <i class="ri-add-line me-1"></i> Item Tambahan
                      </span>
                    </div>
                    <div class="row g-3">
                      <div class="col-md-4">
                        <label class="form-label text-muted mb-2">Product</label>
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
                      <div class="col-md-3">
                        <label class="form-label text-muted mb-2">Warehouse</label>
                        <CustomSelect2
                          v-model="item.warehouseId"
                          :options="warehouses"
                          :get-option-label="w => w.name"
                          :reduce="w => w.id"
                          placeholder="Pilih Warehouse"
                          searchable
                          clearable
                        />
                      </div>
                      <div class="col-md-2">
                        <label class="form-label text-muted mb-2">Unit</label>
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
                      <div class="col-md-1">
                        <label class="form-label text-muted mb-2">Quantity</label>
                        <input
                          type="number"
                          v-model.number="item.quantity"
                          @input="calculateSubtotal(index)"
                          class="form-control"
                          placeholder="Qty"
                          min="1"
                        >
                      </div>
                      <div class="col-md-2">
                        <label class="form-label text-muted mb-2">Harga</label>
                        <input
                          type="number"
                          v-model.number="item.price"
                          @input="calculateSubtotal(index)"
                          class="form-control"
                          placeholder="Harga"
                          min="0"
                          step="0.01"
                        >
                      </div>
                      <div class="col-md-12">
                        <label class="form-label text-muted mb-2">Deskripsi Item</label>
                        <textarea
                          v-model="item.description"
                          class="form-control"
                          placeholder="Deskripsi Item"
                          rows="2"
                        ></textarea>
                      </div>
                      <div class="col-md-12 d-flex justify-content-end">
                        <button
                          @click.prevent="arfStore.removeItem(index)"
                          class="btn btn-outline-danger"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                    <hr class="my-4">
                  </div>
                  <div class="mt-4" v-if="arfStore.enableAdditional">
                    <button
                      @click.prevent="arfStore.addItem(true)"
                      class="btn btn-primary"
                    >
                      <i class="ri-add-line me-1"></i> Tambah Item Tambahan
                    </button>
                  </div>
                  <div class="d-flex justify-content-end mt-4">
                    <span class="fw-bold fs-5">Estimated Amount: {{ formatRupiah(totalAmount) }}</span>
                  </div>
                </div>
              </div>

              <div class="modal-footer mt-6">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="arfStore.closeModal()"
                >
                  Tutup
                </button>
                <button type="submit" class="btn btn-primary ms-2" :disabled="loading">
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
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
import { useArfStore } from '~/stores/arf'
import { useProductStore } from '~/stores/product'
import { useWarehouseStore } from '~/stores/warehouse'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
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
const arfStore = useArfStore()
const productStore = useProductStore()
const warehouseStore = useWarehouseStore()
const permissionStore = usePermissionsStore()
const formatRupiah = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions()

const { arfs, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, stats, enableAdditional } = storeToRefs(arfStore)
const { products } = storeToRefs(productStore)
const { warehouses } = storeToRefs(warehouseStore)
const { permissions } = storeToRefs(permissionStore)

const sites = ref([])
const costCenters = ref([])
const purchaseRequests = ref([])
const units = ref([])

const myDataTableRef = ref(null)
const filters = ref({
  siteId: null,
  costCenterId: null,
  status: null,
  startDate: null,
  endDate: null,
  search: '',
})
const globalFilterValue = ref('')

const tableControls = ref({
  rows: 10,
  search: ''
})

const fetchSitesForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.sites(), {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    })
    if (res.ok) {
      const j = await res.json()
      sites.value = j.data || []
    }
  } catch (e) {
    console.error('Error fetching Sites for select:', e)
  }
}

const fetchCostCentersForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.costCenters(), {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    })
    if (res.ok) {
      const j = await res.json()
      costCenters.value = j.data || []
    }
  } catch (e) {
    console.error('Error fetching Cost Centers for select:', e)
  }
}

const fetchPurchaseRequestsForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.purchaseRequest()}?page=1&rows=500&status=approved`, {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    })
    if (res.ok) {
      const j = await res.json()
      purchaseRequests.value = j.data || []
    }
  } catch (e) {
    console.error('Error fetching Purchase Requests for select:', e)
  }
}

const fetchUnitsForSelect = async () => {
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.unit(), {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    })
    if (res.ok) {
      const j = await res.json()
      units.value = j.data || []
    }
  } catch (e) {
    console.error('Error fetching units for select:', e)
  }
}

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const modalTitle = computed(() => isEditMode.value ? 'Edit ARF' : 'Tambah ARF')
const modalDescription = computed(() => isEditMode.value
  ? 'Silakan ubah data ARF di bawah ini.'
  : 'Silakan isi form di bawah ini untuk menambahkan data ARF baru.'
)

const statusOptions = ref([
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Disbursed', value: 'disbursed' },
  { label: 'Settled', value: 'settled' },
  { label: 'Cancelled', value: 'cancelled' },
])

const totalAmount = computed(() => {
  if (!form.value || !form.value.arfItems) return 0
  return form.value.arfItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const formatDate = (v) => {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const { isLoading: isDataLoading, error: dataError } = usePageData({
  pageName: 'ARF',
  loaders: [
    () => productStore.fetchProducts(),
    () => warehouseStore.fetchWarehouses(),
    () => permissionStore.fetchPermissions(),
    () => fetchSitesForSelect(),
    () => fetchCostCentersForSelect(),
    () => fetchPurchaseRequestsForSelect(),
    () => fetchUnitsForSelect(),
    () => arfStore.fetchArfs(),
    () => arfStore.fetchStats(),
  ],
  onSuccess: () => {
    setListTitle('ARF', stats.value.total || 0)
  },
  waitAll: true
})

watch(isDataLoading, (value) => {
  isInitialLoading.value = value
})

let modalInstance = null

onMounted(() => {
  const modalElement = document.getElementById('ArfModal')
  if (modalElement) {
    modalInstance = new bootstrap.Modal(modalElement)
  }

  tableControls.value.rows = Number(params.value.rows) || 10
  tableControls.value.search = globalFilterValue.value

  const editId = route.query.edit
  if (editId && typeof editId === 'string') {
    nextTick(() => arfStore.openModal({ id: editId }))
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
      const modalElement = document.getElementById('ArfModal')
      if (modalElement && !modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement)
      }
      modalInstance?.show()
    })
  } else {
    modalInstance?.hide()
    if (route.query.edit) {
      const q = { ...route.query }
      delete q.edit
      router.replace({ path: route.path, query: q })
    }
  }
})

const debouncedSearch = useDebounceFn(() => {
  arfStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

watch(filters, (newFilters) => {
  const { page, rows, ...restFilters } = newFilters
  arfStore.setFilters(restFilters)
}, { deep: true })

const onPage = (event) => {
  if (event) {
    const validEvent = {
      first: Number(event.first) || 0,
      rows: Number(event.rows) || 10,
      page: Number(event.page) || 0
    }
    arfStore.setPagination(validEvent)
  }
}

const handleRowsChange = (value) => {
  const rowsValue = Number(value) || 10
  params.value.rows = rowsValue
  params.value.first = 0
  arfStore.fetchArfs()
}

const handleSearch = (value) => {
  globalFilterValue.value = value
  params.value.first = 0
  arfStore.fetchArfs()
}

const onSort = (event) => {
  if (event) {
    arfStore.setSort(event)
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

const handleSubmit = () => {
  if (!form.value.arfItems || form.value.arfItems.length === 0) {
    useToast().error({
      title: 'Error',
      message: 'Minimal harus ada 1 item',
      color: 'red'
    })
    return
  }

  const invalidItems = form.value.arfItems.filter((item) => {
    return !item.productId || !item.warehouseId || !item.unitId || !item.quantity || item.quantity <= 0
  })

  if (invalidItems.length > 0) {
    useToast().error({
      title: 'Error',
      message: 'Semua item harus memiliki Product, Warehouse, Unit, dan Quantity yang valid',
      color: 'red'
    })
    return
  }

  form.value.arfItems.forEach((item) => {
    if (!item.subtotal || item.subtotal === 0) {
      item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0)
    }
  })

  form.value.estimatedAmount = totalAmount.value

  arfStore.saveArf()
}

const onPurchaseRequestChange = async (purchaseRequestId) => {
  if (!purchaseRequestId || isEditMode.value) return

  const toast = useToast()
  const { $api } = useNuxtApp()

  try {
    // Fetch Purchase Request details dengan includeItems
    const response = await fetch(`${$api.purchaseRequest()}/${purchaseRequestId}?includeItems=true`, {
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Gagal mengambil data Purchase Request')
    }

    const result = await response.json()
    const prData = result.data

    if (!prData || !prData.purchaseRequestItems) {
      return
    }

    if (prData.purchaseRequestItems.length === 0) {
      toast.info({
        title: 'Info',
        message: 'Purchase Request yang dipilih tidak memiliki item',
        color: 'blue'
      })
      return
    }

    // Map ke format arfItems
    const mappedItems = prData.purchaseRequestItems.map((item) => {
      return {
        productId: item.productId,
        warehouseId: item.warehouseId || null,
        unitId: item.unitId || null,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        subtotal: Number(item.subtotal) || (Number(item.quantity) || 1) * (Number(item.price) || 0),
        additional: false,
        description: item.description || ''
      }
    })

    // Clear existing items dan set new items
    form.value.arfItems = mappedItems
    arfStore.enableAdditional = false

    toast.success({
      title: 'Success',
      message: `${mappedItems.length} item berhasil dimuat dari Purchase Request`,
      color: 'green',
      position: 'topRight',
      layout: 2,
    })
  } catch (error) {
    console.error('Error loading Purchase Request details:', error)
    const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data Purchase Request'
    toast.error({
      title: 'Error',
      message: errorMessage,
      color: 'red',
      position: 'topRight',
      layout: 2,
    })
  }
}

const onProductChange = (index) => {
  const item = form.value.arfItems[index]
  const selectedProduct = products.value.find(p => p.id === item.productId)
  if (selectedProduct) {
    item.price = Number(selectedProduct.priceSell) || 0
    if (!item.unitId && selectedProduct.unitId) {
      item.unitId = selectedProduct.unitId
    }
    calculateSubtotal(index)
  }
}

const calculateSubtotal = (index) => {
  const item = form.value.arfItems[index]
  const quantity = Number(item.quantity) || 0
  const price = Number(item.price) || 0
  item.subtotal = quantity * price
}

const getStatusBadge = (status) => {
  switch (status) {
    case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case 'submitted': return { text: 'Submitted', class: 'badge rounded-pill bg-label-info' }
    case 'approved': return { text: 'Approved', class: 'badge rounded-pill bg-label-success' }
    case 'rejected': return { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' }
    case 'disbursed': return { text: 'Disbursed', class: 'badge rounded-pill bg-label-warning' }
    case 'settled': return { text: 'Settled', class: 'badge rounded-pill bg-label-success' }
    case 'cancelled': return { text: 'Cancelled', class: 'badge rounded-pill bg-label-secondary' }
    default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

const clearFilters = () => {
  filters.value.siteId = null
  filters.value.costCenterId = null
  filters.value.status = null
  filters.value.startDate = null
  filters.value.endDate = null
  arfStore.setFilters(filters.value)
}

const onDateChange = () => {
  arfStore.setFilters(filters.value)
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'ARF',
  description: 'ARF Management',
  keywords: 'ARF, Asset Request Form, Purchasing, Kainnova Digital Solutions',
  author: 'Kainnova Digital Solutions',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})
</script>

<style scoped>
:deep(.arf-actions-dropdown) {
  z-index: 1100 !important;
}

.repeater-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease-in-out;
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
</style>

