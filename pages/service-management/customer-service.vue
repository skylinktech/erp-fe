<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Customer Service</h4>
      <p class="mb-6">
        Status operasional layanan pelanggan (Active, Suspended, Terminated) — SSOT Service Instance.
      </p>

      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Active</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-success">
                    <i class="ri-checkbox-circle-line"></i>
                  </span>
                </div>
              </div>
              <h5 class="mb-0">{{ summary.active ?? 0 }}</h5>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Suspended</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-warning">
                    <i class="ri-pause-circle-line"></i>
                  </span>
                </div>
              </div>
              <h5 class="mb-0">{{ summary.suspended ?? 0 }}</h5>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Terminated</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-secondary">
                    <i class="ri-close-circle-line"></i>
                  </span>
                </div>
              </div>
              <h5 class="mb-0">{{ summary.terminated ?? 0 }}</h5>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Billable</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-bill-line"></i>
                  </span>
                </div>
              </div>
              <h5 class="mb-0">{{ summary.billable ?? 0 }}</h5>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <CollapsibleFilterCard
            title="Filter Customer Service"
            :has-active-filters="hasActiveFilters"
            @reset="resetFilters"
          >
            <FilterFieldsRow>
              <FilterField>
                <label class="form-label">Status</label>
                <CustomSelect2
                  v-model="filters.status"
                  :options="statusOptions"
                  :get-option-label="(o) => o.label"
                  :reduce="(o) => o.value"
                  searchable
                  clearable
                  placeholder="Semua (Active / Suspended / Terminated)"
                />
              </FilterField>
              <FilterField>
                <label class="form-label">Technology</label>
                <CustomSelect2
                  v-model="filters.technology"
                  :options="technologyOptions"
                  :get-option-label="(o) => o.label"
                  :reduce="(o) => o.value"
                  searchable
                  clearable
                  placeholder="Semua technology"
                />
              </FilterField>
            </FilterFieldsRow>
          </CollapsibleFilterCard>
        </div>

        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                <span class="me-2">Baris:</span>
                <Dropdown
                  v-model="tableControls.rows"
                  :options="rowsPerPageOptions"
                  @change="handleRowsChange"
                  placeholder="Jumlah"
                  style="width: 8rem"
                />
              </div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-outline-secondary" :disabled="store.loading" @click="reload">
                  <i class="ri-refresh-line me-1"></i>Refresh
                </button>
                <span class="p-input-icon-left">
                  <InputText
                    v-model="globalFilterValue"
                    placeholder="Cari no. service, customer, plan, SN..."
                    class="w-full md:w-20rem"
                  />
                </span>
              </div>
            </div>

            <div class="card-datatable table-responsive py-3 px-3">
              <div v-if="store.error" class="text-danger mb-3">{{ store.error }}</div>
              <MyDataTable
                :data="store.items"
                :rows="Number(params.rows)"
                :loading="store.loading"
                :totalRecords="store.totalRecords"
                :first="params.first"
                :lazy="true"
                @page="onPage($event)"
                responsiveLayout="scroll"
                paginatorPosition="bottom"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
              >
                <Column header="#" :sortable="false">
                  <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
                </Column>
                <Column field="serviceNumber" header="No. Service" class="text-nowrap">
                  <template #body="slotProps">
                    <a
                      class="text-primary"
                      style="cursor: pointer; text-decoration: underline"
                      @click="
                        navigateTo(
                          `/service-management/${slotProps.data.id}`
                        )
                      "
                    >
                      {{ slotProps.data.serviceNumber || slotProps.data.service_number || '—' }}
                    </a>
                  </template>
                </Column>
                <Column field="customer.name" header="Customer">
                  <template #body="slotProps">
                    {{ slotProps.data.customer?.name || '—' }}
                  </template>
                </Column>
                <Column field="serviceName" header="Product / Plan">
                  <template #body="slotProps">
                    <div>{{ slotProps.data.serviceName || slotProps.data.service_name || '—' }}</div>
                    <small class="text-muted">
                      {{ slotProps.data.planName || slotProps.data.plan_name || '' }}
                    </small>
                  </template>
                </Column>
                <Column field="technology" header="Tech">
                  <template #body="slotProps">
                    {{ slotProps.data.technology || '—' }}
                  </template>
                </Column>
                <Column field="subscription.noSubscription" header="Subscription">
                  <template #body="slotProps">
                    {{
                      slotProps.data.subscription?.noSubscription ||
                      slotProps.data.subscription?.no_subscription ||
                      '—'
                    }}
                  </template>
                </Column>
                <Column field="status" header="Status">
                  <template #body="slotProps">
                    <span :class="statusBadgeClass(slotProps.data.status)">
                      {{ getStatusLabel(slotProps.data.status) }}
                    </span>
                  </template>
                </Column>
                <Column field="billable" header="Billable">
                  <template #body="slotProps">
                    {{ slotProps.data.billable ? 'Yes' : 'No' }}
                  </template>
                </Column>
                <Column header="Outstanding">
                  <template #body="slotProps">
                    {{
                      formatMoney(
                        slotProps.data.billingProjection?.outstandingAmount ??
                          slotProps.data.billing_projection?.outstanding_amount ??
                          0
                      )
                    }}
                  </template>
                </Column>
                <Column header="Aksi" class="text-nowrap">
                  <template #body="slotProps">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="navigateTo(`/service-management/${slotProps.data.id}`)"
                    >
                      Detail
                    </button>
                  </template>
                </Column>
              </MyDataTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterField from '~/components/list/FilterField.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import { useServiceInstanceStore } from '~/stores/service-instances'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Customer Service',
})

const store = useServiceInstanceStore()
const summary = computed(() => store.summary || {})

const rowsPerPageOptions = [10, 20, 50, 100]
const tableControls = reactive({ rows: 10 })
const params = computed(() => ({
  rows: store.listParams.rows,
  first: store.listParams.first,
}))

const filters = reactive<{ status: string | null; technology: string | null }>({
  status: null,
  technology: null,
})

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Terminated', value: 'terminated' },
]

const technologyOptions = [
  { label: 'Dedicated Internet', value: 'dedicated_internet' },
  { label: 'Starlink', value: 'starlink' },
  { label: 'Fiber', value: 'fiber' },
  { label: 'Managed Service', value: 'managed_service' },
  { label: 'Public IP', value: 'public_ip' },
  { label: 'Add-on', value: 'addon' },
  { label: 'Bundle', value: 'bundle' },
  { label: 'Other', value: 'other' },
]

const globalFilterValue = ref('')
const hasActiveFilters = computed(
  () => !!(filters.status || filters.technology || globalFilterValue.value.trim())
)

function statusBadgeClass(status: string) {
  if (status === 'active') return 'badge bg-label-success'
  if (status === 'suspended') return 'badge bg-label-warning'
  if (status === 'terminated') return 'badge bg-label-secondary'
  return 'badge bg-label-primary'
}

const getStatusLabel = (status: string) => {
    const map = { active: 'Active', suspended: 'Suspended', terminated: 'Terminated' }
    return map[status as keyof typeof map] ?? status
}

function formatMoney(v: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(v) || 0)
}

function reload() {
  return store.fetchCustomerService({
    page: 1,
    rows: tableControls.rows,
    status: null,
    statuses: filters.status ? [filters.status] : undefined,
    technology: filters.technology,
    search: globalFilterValue.value.trim(),
  })
}

function resetFilters() {
  filters.status = null
  filters.technology = null
  globalFilterValue.value = ''
  reload()
}

const onPage = (e: any) => {
  if (e) store.setPagination(e)
}

const handleRowsChange = (v: any) => {
  tableControls.rows = Number(v) || 10
  store.fetchCustomerService({
    page: 1,
    rows: tableControls.rows,
    first: 0,
    statuses: filters.status ? [filters.status] : undefined,
    technology: filters.technology,
    search: globalFilterValue.value.trim(),
  })
}

const debouncedSearch = useDebounceFn(() => {
  store.fetchCustomerService({
    page: 1,
    first: 0,
    rows: tableControls.rows,
    search: globalFilterValue.value.trim(),
    statuses: filters.status ? [filters.status] : undefined,
    technology: filters.technology,
  })
}, 500)

watch(globalFilterValue, debouncedSearch)
watch(
  filters,
  () => {
    store.fetchCustomerService({
      page: 1,
      first: 0,
      rows: tableControls.rows,
      statuses: filters.status ? [filters.status] : undefined,
      technology: filters.technology,
      search: globalFilterValue.value.trim(),
    })
  },
  { deep: true }
)

onMounted(() => reload())
</script>
