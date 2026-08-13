<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-py-2">
      <div class="d-flex align-items-center mb-4">
        <i class="ri-diamond-line me-2" style="font-size: 24px; color: var(--bs-warning);"></i>
        <h4 class="mb-0">Sales Pipeline / Deals</h4>
      </div>
      <p class="mb-6">Kelola opportunities dan deals di dalam sales pipeline</p>

      <!-- Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Total Opportunities</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-file-list-3-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ totalOpportunities }}</h5>
                  <span class="text-muted">Opportunities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Total Value</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-success">
                    <i class="ri-money-dollar-circle-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ formatRupiah(totalValue) }}</h5>
                  <span class="text-muted">Total Nilai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Forecast Value</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-info">
                    <i class="ri-line-chart-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ formatRupiah(forecastValue) }}</h5>
                  <span class="text-muted">Perkiraan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Active Opportunities</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-warning">
                    <i class="ri-checkbox-circle-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ activeOpportunities }}</h5>
                  <span class="text-muted">Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="card mb-4">
        <div class="card-body p-2 py-3">
          <ul class="nav nav-tabs nav-tabs-custom" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'pipeline' }"
                @click="activeTab = 'pipeline'"
                type="button"
              >
                <i class="ri-layout-grid-line me-2"></i>
                Pipeline
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'forecast' }"
                @click="activeTab = 'forecast'"
                type="button"
              >
                <i class="ri-bar-chart-line me-2"></i>
                Forecast
              </button>
            </li>
          </ul>
          <!-- Tab Content: Pipeline (Kanban Board) -->
          <div v-show="activeTab === 'pipeline'" class="tab-content">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Memuat data...</p>
            </div>
            <div v-else-if="!stages || stages.length === 0" class="text-center py-5">
              <div class="alert alert-warning">
                <i class="ri-alert-line me-2"></i>
                Pipeline stages belum dibuat. Silakan setup pipeline stages terlebih dahulu.
                <br />
                <small>Jalankan: <code>node ace setup:pipeline-stages</code></small>
              </div>
            </div>
            <div v-else class="kanban-board">
              <div
                v-for="stage in sortedStages"
                :key="stage.id"
                class="kanban-column"
                :class="{ 'is-closing': (stage.isClosingStage || stage.is_closing_stage) === true }"
              >
                <div class="kanban-column-header">
                  <h6 class="mb-0">{{ stage.name }}</h6>
                  <span class="badge bg-label-secondary">{{ getOpportunitiesByStage(stage.id).length }}</span>
                </div>
                <div
                  class="kanban-column-body"
                  :class="{ 'is-drop-target': dropTargetStageId === stage.id }"
                  @dragover.prevent="onDragOver(stage.id)"
                  @dragleave="onDragLeave(stage.id)"
                  @drop.prevent="onDrop(stage)"
                >
                  <div
                    v-for="opportunity in getOpportunitiesByStage(stage.id)"
                    :key="opportunity.id"
                    class="kanban-card"
                    :class="{ 'kanban-card-overdue': isOverdue(opportunity) }"
                    draggable="true"
                    @dragstart="onDragStart($event, opportunity)"
                    @dragend="onDragEnd"
                    @click="onCardClick(opportunity.id)"
                  >
                    <div class="kanban-card-header">
                      <div class="d-flex align-items-center gap-2">
                        <div
                          class="kanban-card-icon"
                          :style="{
                            backgroundColor: getIconColor(opportunity.customer?.name || 'Unknown'),
                          }"
                        >
                          {{ getInitials(opportunity.customer?.name || 'Unknown') }}
                        </div>
                        <div class="flex-grow-1">
                          <h6 class="mb-0 kanban-card-title">
                            {{ opportunity.customer?.name || 'Unknown Customer' }}
                          </h6>
                          <small class="text-muted">#{{ opportunity.id }}</small>
                        </div>
                        <div class="d-flex align-items-center gap-1">
                          <span
                            v-if="opportunity.pipelineStage?.code === 'WON'"
                            class="badge bg-label-success"
                          >
                            WON
                          </span>
                          <span
                            v-else-if="opportunity.pipelineStage?.code === 'LOST'"
                            class="badge bg-label-danger"
                          >
                            LOST
                          </span>
                          <i
                            v-if="isOverdue(opportunity)"
                            class="ri-alert-line text-warning"
                            title="Sudah melewati tanggal perkiraan selesai"
                          ></i>
                        </div>
                      </div>
                    </div>
                    <div class="kanban-card-body">
                      <div class="kanban-card-info">
                        <div class="kanban-card-info-item" v-if="opportunity.customer?.email">
                          <i class="ri-global-line"></i>
                          <span>{{ opportunity.customer.email }}</span>
                        </div>
                        <div class="kanban-card-info-item">
                          <i class="ri-money-dollar-circle-line"></i>
                          <span>{{ formatRupiah(opportunity.estimatedValue || opportunity.estimated_value || 0) }}</span>
                        </div>
                        <div
                          class="kanban-card-info-item"
                          v-if="opportunity.assignedSales?.full_name || opportunity.assignedSales?.fullName"
                        >
                          <i class="ri-user-line"></i>
                          <span>{{ opportunity.assignedSales?.full_name || opportunity.assignedSales?.fullName }}</span>
                        </div>
                        <div class="kanban-card-info-item" v-if="opportunity.expectedCloseDate || opportunity.expected_close_date">
                          <i class="ri-calendar-line"></i>
                          <span>{{ formatDate(opportunity.expectedCloseDate || opportunity.expected_close_date) }}</span>
                        </div>
                        <div class="kanban-card-info-item">
                          <i class="ri-bar-chart-2-line"></i>
                          <span
                            class="badge probability-badge"
                            :style="{ backgroundColor: getProbabilityColor(getProbability(opportunity)) }"
                          >
                            {{ getProbability(opportunity) }}%
                          </span>
                        </div>
                      </div>
                      <div class="kanban-card-footer">
                        <div class="row">
                          <div class="col-12 d-flex align-items-center gap-3">
                            <span
                              v-if="opportunity.quotations && opportunity.quotations.length > 0"
                              class="badge bg-label-info"
                            >
                              <i class="ri-file-list-3-line me-1"></i>
                              {{ opportunity.quotations.length }} Quotation
                            </span>
                            <span
                              v-if="opportunity.subscriptions && opportunity.subscriptions.length > 0"
                              class="badge bg-label-success"
                            >
                              <i class="ri-file-paper-2-line me-1"></i>
                              {{ opportunity.subscriptions.length }} Subscription
                            </span>
                          </div>
                          <div class="col-12 mt-2 d-flex justify-content-end">
                            <small class="text-muted text-nowrap">{{ formatRelativeTime(opportunity.createdAt || opportunity.created_at) }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="getOpportunitiesByStage(stage.id).length === 0" class="kanban-empty">
                    <i class="ri-inbox-line"></i>
                    <p class="mb-0 text-muted">Tidak ada opportunity</p>
                    <small class="text-muted" v-if="opportunities.length > 0">
                      (Total: {{ opportunities.length }}, Stage ID: {{ stage.id }})
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content: Forecast -->
          <div v-show="activeTab === 'forecast'" class="tab-content mb-3">
            <CollapsibleFilterCard
              title="Filter Forecast"
              :has-active-filters="hasActiveForecastFilters"
              @reset="resetForecastFilters"
            >
              <FilterFieldsRow>
                <FilterField>
                  <label class="form-label">Start Date</label>
                  <InputText v-model="filterStartDate" type="date" class="w-100" @change="fetchForecast" />
                </FilterField>
                <FilterField>
                  <label class="form-label">End Date</label>
                  <InputText v-model="filterEndDate" type="date" class="w-100" @change="fetchForecast" />
                </FilterField>
                <FilterField>
                  <label class="form-label">Group By</label>
                  <CustomSelect2
                    v-model="groupBy"
                    :options="groupByOptions"
                    :get-option-label="(o) => o.label"
                    :reduce="(o) => o.value"
                    searchable
                    clearable
                    placeholder="Pilih Group By"
                    @update:modelValue="fetchForecast"
                  />
                </FilterField>
              </FilterFieldsRow>
            </CollapsibleFilterCard>

            <!-- Forecast Table -->
            <div class="row g-6">
              <div class="card-datatable table-responsive py-3 px-3">
                <MyDataTable
                  :data="forecastData"
                  :rows="50"
                  :loading="loading"
                  :totalRecords="forecastData.length"
                  :first="0"
                  :lazy="false"
                  responsiveLayout="scroll"
                  paginatorPosition="bottom"
                  paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                  currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                >
                  <Column header="#" :sortable="false">
                    <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                  </Column>
                  <Column
                    :field="groupBy === 'month' ? 'month' : 'stage'"
                    :header="groupBy === 'month' ? 'Month' : 'Stage'"
                    :sortable="true"
                    class="text-nowrap"
                  >
                    <template #body="slotProps">
                      {{ groupBy === 'month' ? formatMonth(slotProps.data.month) : slotProps.data.stage }}
                    </template>
                  </Column>
                  <Column field="totalValue" header="Total Value" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">{{ formatRupiah(slotProps.data.totalValue) }}</template>
                  </Column>
                  <Column field="forecastValue" header="Forecast Value" :sortable="true" class="text-nowrap">
                    <template #body="slotProps">{{ formatRupiah(slotProps.data.forecastValue) }}</template>
                  </Column>
                  <Column field="count" header="Count" :sortable="true">
                    <template #body="slotProps">{{ slotProps.data.count }}</template>
                  </Column>
                  <Column header="Percentage" :sortable="false">
                    <template #body="slotProps">
                      {{
                        forecast.totals
                          ? ((slotProps.data.forecastValue / forecast.totals.totalForecast) * 100).toFixed(2)
                          : 0
                      }}%
                    </template>
                  </Column>
                </MyDataTable>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick View Modal -->
      <div
        v-if="showQuickView && selectedOpportunity"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(15, 23, 42, 0.3);"
        @click.self="closeQuickView"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                Opportunity Quick View
              </h5>
              <button type="button" class="btn-close" @click="closeQuickView"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <small class="text-muted d-block">Customer</small>
                <strong>{{ selectedOpportunity.customer?.name || 'Unknown Customer' }}</strong>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block">Deal Value</small>
                <strong>{{
                  formatRupiah(
                    selectedOpportunity.estimatedValue ||
                      selectedOpportunity.estimated_value ||
                      0
                  )
                }}</strong>
              </div>
              <div class="mb-3 d-flex align-items-center justify-content-between">
                <div>
                  <small class="text-muted d-block">Probability</small>
                  <strong>{{ getProbability(selectedOpportunity) }}%</strong>
                </div>
                <span
                  class="badge probability-badge"
                  :style="{
                    backgroundColor: getProbabilityColor(getProbability(selectedOpportunity)),
                  }"
                >
                  {{ getProbability(selectedOpportunity) }}%
                </span>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block">Assigned Sales</small>
                <strong>{{
                  selectedOpportunity.assignedSales?.full_name ||
                  selectedOpportunity.assignedSales?.fullName ||
                  '-'
                }}</strong>
              </div>
              <div class="mb-3 d-flex align-items-center justify-content-between">
                <div>
                  <small class="text-muted d-block">Expected Close</small>
                  <strong>{{
                    formatDate(
                      selectedOpportunity.expectedCloseDate ||
                        selectedOpportunity.expected_close_date
                    )
                  }}</strong>
                </div>
                <span
                  v-if="isOverdue(selectedOpportunity)"
                  class="badge bg-label-warning d-flex align-items-center gap-1"
                >
                  <i class="ri-alert-line"></i>
                  Overdue
                </span>
              </div>
              <div class="mb-1">
                <small class="text-muted d-block">Notes singkat</small>
                <p class="mb-0">
                  {{ selectedOpportunity.notes || '-' }}
                </p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="closeQuickView">
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="content-backdrop fade"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSalesPipelineStore } from '~/stores/sales-pipeline'
import { useCustomerStore } from '~/stores/customer'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import Swal from 'sweetalert2'

const { setListTitle } = useDynamicTitle()
const salesPipelineStore = useSalesPipelineStore()
const customerStore = useCustomerStore()
const formatRupiah = useFormatRupiah()

const {
  opportunities,
  stages,
  loading,
  forecast,
} = storeToRefs(salesPipelineStore)

const activeTab = ref('pipeline')

// Forecast related
const filterStartDate = ref('')
const filterEndDate = ref('')
const groupBy = ref('month')

const groupByOptions = [
  { label: 'By Month', value: 'month' },
  { label: 'By Stage', value: 'stage' },
]

const hasActiveForecastFilters = computed(() => groupBy.value !== 'month')

function setDefaultForecastDates() {
  const today = new Date()
  filterStartDate.value = today.toISOString().split('T')[0]
  const endDate = new Date(today)
  endDate.setMonth(endDate.getMonth() + 6)
  filterEndDate.value = endDate.toISOString().split('T')[0]
}

function resetForecastFilters() {
  setDefaultForecastDates()
  groupBy.value = 'month'
  fetchForecast()
}

const sortedStages = computed(() => {
  const stagesList = stages.value || []
  return [...stagesList].sort((a, b) => (a.order || 0) - (b.order || 0))
})

const totalOpportunities = computed(() => opportunities.value.length)
const totalValue = computed(() => {
  return opportunities.value.reduce((sum, opp) => {
    const value = opp.estimatedValue ?? opp.estimated_value ?? 0
    return sum + (Number(value) || 0)
  }, 0)
})
const forecastValue = computed(() => {
  return opportunities.value.reduce((sum, opp) => {
    const probability = opp.pipelineStage?.probability || 0
    const value = opp.estimatedValue || opp.estimated_value || 0
    return sum + (value * probability) / 100
  }, 0)
})
const activeOpportunities = computed(() => opportunities.value.filter((opp) => (opp.isActive !== false && opp.is_active !== false)).length)

const forecastData = computed(() => {
  return forecast.value?.data || []
})

// Quick view state
const showQuickView = ref(false)
const selectedOpportunity = ref(null)

function getOpportunitiesByStage(stageId) {
  if (!opportunities.value || opportunities.value.length === 0) {
    return []
  }
  
  const result = opportunities.value.filter((opp) => {
    const oppStageId = opp.pipelineStageId || opp.pipeline_stage_id
    const isActive = (opp.isActive !== false && opp.isActive !== undefined) || (opp.is_active !== false && opp.is_active !== undefined)
    const match = Number(oppStageId) === Number(stageId) && isActive
    
    return match
  })
  
  return result
}

// -------------------------
// Drag & Drop (state transition)
// -------------------------
const draggedOpportunityId = ref(null)
const draggedFromStageId = ref(null)
const dropTargetStageId = ref(null)
const isDragging = ref(false)

function onDragStart(e, opportunity) {
  isDragging.value = true
  draggedOpportunityId.value = Number(opportunity.id)
  draggedFromStageId.value = Number(opportunity.pipelineStageId || opportunity.pipeline_stage_id)
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(opportunity.id))
  }
}

function onDragEnd() {
  isDragging.value = false
  draggedOpportunityId.value = null
  draggedFromStageId.value = null
  dropTargetStageId.value = null
}

function onDragOver(stageId) {
  dropTargetStageId.value = stageId
}

function onDragLeave(stageId) {
  if (dropTargetStageId.value === stageId) dropTargetStageId.value = null
}

async function onDrop(stage) {
  const opportunityId = draggedOpportunityId.value
  const fromStageId = draggedFromStageId.value
  const toStageId = Number(stage.id)

  dropTargetStageId.value = null

  if (!opportunityId || !fromStageId) return
  if (Number(fromStageId) === Number(toStageId)) return

  // Optimistic UI: pindahkan dulu, nanti revert kalau gagal
  const opp = opportunities.value.find((o) => Number(o.id) === Number(opportunityId))
  const prevStage = opp ? (opp.pipelineStageId || opp.pipeline_stage_id) : null
  if (opp) {
    opp.pipelineStageId = toStageId
  }

  try {
    let remarks

    // LOST wajib alasan
    if (stage.code === 'LOST') {
      const result = await Swal.fire({
        title: 'Alasan LOST',
        input: 'text',
        inputPlaceholder: 'Masukkan alasan (wajib)',
        inputAttributes: { autocapitalize: 'off' },
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        inputValidator: (value) => {
          if (!value || value.trim().length < 3) return 'Alasan minimal 3 karakter'
          return null
        },
      })
      if (!result.isConfirmed) {
        // user batal -> revert
        if (opp && prevStage != null) opp.pipelineStageId = Number(prevStage)
        return
      }
      remarks = String(result.value || '').trim()
    }

    await salesPipelineStore.moveStage(opportunityId, toStageId, remarks)
  } catch (e) {
    // revert kalau gagal
    if (opp && prevStage != null) opp.pipelineStageId = Number(prevStage)
  } finally {
    onDragEnd()
  }
}

function onCardClick(opportunityId) {
  if (isDragging.value) return
  const opp = opportunities.value.find((o) => Number(o.id) === Number(opportunityId))
  if (!opp) return
  selectedOpportunity.value = opp
  showQuickView.value = true
}

function closeQuickView() {
  showQuickView.value = false
  selectedOpportunity.value = null
}

function goToDetail(id) {
  closeQuickView()
  navigateTo(`/sales/sales-pipeline/detail/${id}`)
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function getIconColor(name) {
  const colors = [
    '#008fec',
    '#00ac4f',
    '#27b4e0',
    '#ffba2f',
    '#f13636',
    '#233446',
    '#f13636',
    '#00ac4f',
    '#27b4e0',
    '#ffba2f',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

function getProbability(opp) {
  const probability =
    (opp.pipelineStage && opp.pipelineStage.probability != null
      ? opp.pipelineStage.probability
      : 0) || 0
  const value = Number(probability)
  return Number.isFinite(value) ? value : 0
}

function getProbabilityColor(probability) {
  const p = Number(probability) || 0
  if (p >= 80) return '#dcfce7'
  if (p >= 50) return '#fef9c3'
  if (p > 0) return '#fee2e2'
  return '#e5e7eb'
}

function isOverdue(opp) {
  const dateStr = opp.expectedCloseDate || opp.expected_close_date
  if (!dateStr) return false
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const stageCode = opp.pipelineStage?.code
  if (stageCode === 'WON' || stageCode === 'LOST' || stageCode === 'CLOSED') return false

  return date < today
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins}m yang lalu`
  if (diffHours < 24) return `${diffHours}j yang lalu`
  if (diffDays < 7) return `${diffDays}h yang lalu`
  return formatDate(dateStr)
}

function formatMonth(monthStr) {
  if (!monthStr) return '-'
  const [year, month] = monthStr.split('-')
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

async function fetchForecast() {
  await salesPipelineStore.fetchForecast(filterStartDate.value, filterEndDate.value, groupBy.value)
}

// Watch for tab change to fetch forecast
watch(activeTab, (newTab) => {
  if (newTab === 'forecast') {
    if (!filterStartDate.value || !filterEndDate.value) {
      setDefaultForecastDates()
    }
    fetchForecast()
  }
})

onMounted(async () => {
  // Fetch stages first
  await salesPipelineStore.fetchStages()
  console.log('Stages after fetch:', stages.value?.length, stages.value)
  
  // Then fetch opportunities
  await salesPipelineStore.fetchOpportunities()
  console.log('Opportunities after fetch:', opportunities.value?.length, opportunities.value)
  
  customerStore.fetchCustomers()
  
  // Debug: Check matching
  if (stages.value && stages.value.length > 0 && opportunities.value && opportunities.value.length > 0) {
    stages.value.forEach((stage) => {
      const opps = getOpportunitiesByStage(stage.id)
      console.log(`Stage ${stage.id} (${stage.name}): ${opps.length} opportunities`, opps)
    })
  } else {
    console.warn('Stages or Opportunities empty:', {
      stagesCount: stages.value?.length || 0,
      oppsCount: opportunities.value?.length || 0,
    })
  }
  
  setListTitle('Sales Pipeline', opportunities.value?.length ?? 0)
})

// Watch for changes and refresh
watch([() => stages.value, () => opportunities.value], () => {
  if (stages.value && stages.value.length > 0 && opportunities.value && opportunities.value.length > 0) {
    console.log('Data updated, recalculating kanban...')
  }
}, { deep: true })

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Sales Pipeline',
})
</script>

<style scoped>
.nav-tabs-custom {
  border-bottom: 1px solid #e9ecef;
}

.nav-tabs-custom .nav-link {
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  padding: 12px 20px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-tabs-custom .nav-link:hover {
  color: #008fec;
  border-bottom-color: #e9ecef;
}

.nav-tabs-custom .nav-link.active {
  color: #008fec;
  border-bottom-color: #008fec;
  background-color: transparent;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Kanban Board Styles */
.kanban-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  min-height: 600px;
}

.kanban-column {
  flex: 0 0 320px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: calc(200vh - 1000px);
}

.kanban-column.is-closing {
  background: #e8f5e9;
}

.kanban-column-header {
  padding: 16px;
  background: white;
  border-bottom: 2px solid #e9ecef;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.kanban-column-header h6 {
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.kanban-column.is-closing .kanban-column-header {
  background: #c8e6c9;
  border-bottom-color: #81c784;
}

.kanban-column-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  padding-bottom: 90px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kanban-column-body.is-drop-target {
  outline: 2px dashed rgba(0, 143, 236, 0.6);
  outline-offset: 6px;
  background: rgba(0, 143, 236, 0.04);
}

.probability-badge {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #111827;
}

.kanban-card-overdue {
  border-color: #fbbf24;
}

.kanban-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--bs-card-border-color, #e6e6e8);
  box-shadow: none;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: none;
  border-color: #008fec;
}

.kanban-card-header {
  margin-bottom: 12px;
}

.kanban-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.kanban-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  line-height: 1.4;
}

.kanban-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kanban-card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kanban-card-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.kanban-card-info-item i {
  font-size: 14px;
  color: #9ca3af;
  width: 16px;
}

.kanban-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--bs-card-border-color, #e6e6e8);
}

.kanban-empty {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.kanban-empty i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* Scrollbar styling */
.kanban-column-body::-webkit-scrollbar {
  width: 6px;
}

.kanban-column-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.kanban-column-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.kanban-column-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.kanban-board::-webkit-scrollbar {
  height: 8px;
}

.kanban-board::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.kanban-board::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.kanban-board::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .kanban-column {
    flex: 0 0 280px;
  }
}
</style>
