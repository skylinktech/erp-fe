<template>
  <div>
    <div class="d-flex align-items-center mb-3">
      <i class="ri-diamond-line me-2" style="font-size: 24px; color: #ffc107;"></i>
      <h5 class="mb-0">Sales Pipeline / Deals</h5>
    </div>
    <p class="mb-4 text-muted">Ringkasan opportunity dan deals langsung dari dashboard.</p>

    <!-- Statistics Cards: Opportunities -->
    <div class="row g-6 mb-4">
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

    <!-- Statistics Cards: Quotation & Site Investment -->
    <div class="row g-6 mb-4">
      <!-- Quotation Stats -->
      <div class="col-xxl-6 col-md-6">
        <div class="card h-100">
          <div class="card-header pb-3">
            <h6 class="mb-1">Quotation by Status</h6>
            <p class="mb-0 text-muted small">Ringkasan quotation berdasarkan status terbaru.</p>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-6 col-md-3">
                <div class="status-tile bg-label-primary">
                  <div class="status-icon">
                    <i class="ri-file-text-line"></i>
                  </div>
                  <div>
                    <div class="status-value">
                      {{ quotationStats?.totalQuotations ?? 0 }}
                    </div>
                    <div class="status-label">Total</div>
                  </div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="status-tile bg-label-success">
                  <div class="status-icon">
                    <i class="ri-checkbox-circle-line"></i>
                  </div>
                  <div>
                    <div class="status-value">
                      {{ quotationStats?.approvedQuotations ?? 0 }}
                    </div>
                    <div class="status-label">Approved</div>
                  </div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="status-tile bg-label-warning">
                  <div class="status-icon">
                    <i class="ri-time-line"></i>
                  </div>
                  <div>
                    <div class="status-value">
                      {{ quotationStats?.pendingQuotations ?? 0 }}
                    </div>
                    <div class="status-label">Pending</div>
                  </div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="status-tile bg-label-danger">
                  <div class="status-icon">
                    <i class="ri-close-circle-line"></i>
                  </div>
                  <div>
                    <div class="status-value">
                      {{ quotationStats?.rejectedQuotations ?? 0 }}
                    </div>
                    <div class="status-label">Rejected</div>
                  </div>
                </div>
              </div>
            </div>
            <hr class="my-3" />
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <p class="mb-0 text-muted small">Total Nilai Quotation</p>
                <h6 class="mb-0">
                  {{ formatRupiah(quotationStats?.totalValue ?? 0) }}
                </h6>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Site Investment Stats -->
      <div class="col-xxl-6 col-md-6">
        <div class="card h-100">
          <div class="card-header pb-3">
            <h6 class="mb-1">Site Investment by Status</h6>
            <p class="mb-0 text-muted small">Status pipeline site investment saat ini.</p>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-6 col-md-4">
                <div class="status-tile bg-label-primary">
                  <div class="status-icon">
                    <i class="ri-community-line"></i>
                  </div>
                  <div>
                    <div class="status-value">
                      {{ siteInvestStats?.total ?? 0 }}
                    </div>
                    <div class="status-label">Total</div>
                  </div>
                </div>
              </div>
              <div class="col-6 col-md-4">
                <div class="status-tile bg-label-secondary">
                  <div class="status-icon">
                    <i class="ri-draft-line"></i>
                  </div>
                  <div>
                    <div class="status-value">
                      {{ siteInvestStats?.draft ?? 0 }}
                    </div>
                    <div class="status-label">Draft</div>
                  </div>
                </div>
              </div>
              <div class="col-6 col-md-4">
                <div class="status-tile bg-label-warning">
                  <div class="status-icon">
                    <i class="ri-time-line"></i>
                  </div>
                  <div>
                    <div class="status-value">
                      {{ siteInvestStats?.pending ?? 0 }}
                    </div>
                    <div class="status-label">Pending</div>
                  </div>
                </div>
              </div>
              <div class="col-6 col-md-4">
                <div class="status-tile bg-label-success">
                  <div class="status-icon">
                    <i class="ri-checkbox-circle-line"></i>
                  </div>
                  <div>
                    <div class="status-value">
                      {{ siteInvestStats?.approved ?? 0 }}
                    </div>
                    <div class="status-label">Approved</div>
                  </div>
                </div>
              </div>
              <div class="col-6 col-md-4">
                <div class="status-tile bg-label-danger">
                  <div class="status-icon">
                    <i class="ri-close-circle-line"></i>
                  </div>
                  <div>
                    <div class="status-value">
                      {{ siteInvestStats?.rejected ?? 0 }}
                    </div>
                    <div class="status-label">Rejected</div>
                  </div>
                </div>
              </div>
              <div class="col-6 col-md-4">
                <div class="status-tile bg-label-dark">
                  <div class="status-icon">
                    <i class="ri-calendar-close-line"></i>
                  </div>
                  <div>
                    <div class="status-value">
                      {{ siteInvestStats?.expired ?? 0 }}
                    </div>
                    <div class="status-label">Expired</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reminder: Quotation Hampir Expired (hanya draft) -->
    <div v-if="canViewExpiryReminder" class="row g-6 mb-4">
      <div class="col-12">
        <div class="card h-100">
          <div class="card-header pb-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">Reminder Quotation Hampir Expired</h6>
                <p class="mb-0 text-muted small">
                  Menampilkan quotation draft yang akan expired dalam {{ reminderWindowDays }} hari ke depan.
                </p>
              </div>
              <span class="badge bg-label-warning">
                {{ reminderQuotations.length }} Quotation
              </span>
            </div>
          </div>
          <div class="card-body pt-0">
            <div v-if="quotationLoading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="reminderQuotations.length === 0" class="text-center py-4">
              <p class="mb-0 text-muted small">
                Tidak ada quotation draft yang akan expired dalam {{ reminderWindowDays }} hari ke depan.
              </p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-sm table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th class="text-nowrap">No</th>
                    <th class="text-nowrap">No. Quotation</th>
                    <th class="text-nowrap">Customer</th>
                    <th class="text-nowrap text-end">Nilai</th>
                    <th class="text-nowrap">Tgl Expired</th>
                    <th class="text-nowrap text-center">Sisa Hari</th>
                    <th class="text-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in reminderQuotations" :key="item.id">
                    <td class="text-nowrap">{{ idx + 1 }}</td>
                    <td class="text-nowrap fw-semibold">
                      {{ item.noQuotation || '-' }}
                    </td>
                    <td class="text-nowrap">
                      {{ item.customerName || '-' }}
                    </td>
                    <td class="text-end text-nowrap">
                      {{ formatRupiah(item.totalValue || 0) }}
                    </td>
                    <td class="text-nowrap">
                      {{ item.validUntilFormatted }}
                    </td>
                    <td class="text-center">
                      <span
                        class="badge rounded-pill"
                        :class="{
                          'bg-label-danger': item.daysLeft <= 1,
                          'bg-label-warning': item.daysLeft > 1 && item.daysLeft <= 3,
                          'bg-label-primary': item.daysLeft > 3
                        }"
                      >
                        {{ item.daysLeft }} hari
                      </span>
                    </td>
                    <td class="text-nowrap text-capitalize">
                      {{ item.status || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Kanban Pipeline -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Memuat data pipeline...</p>
        </div>
        <div v-else-if="!stages || stages.length === 0" class="text-center py-5">
          <div class="alert alert-warning mb-0">
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
                    <div
                      class="kanban-card-info-item"
                      v-if="opportunity.expectedCloseDate || opportunity.expected_close_date"
                    >
                      <i class="ri-calendar-line"></i>
                      <span>
                        {{ formatDate(opportunity.expectedCloseDate || opportunity.expected_close_date) }}
                      </span>
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
                    <div class="d-flex align-items-center gap-2">
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
                    <small class="text-muted">
                      {{ formatRelativeTime(opportunity.createdAt || opportunity.created_at) }}
                    </small>
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
              <strong>
                {{
                  formatRupiah(
                    selectedOpportunity.estimatedValue ||
                      selectedOpportunity.estimated_value ||
                      0
                  )
                }}
              </strong>
            </div>
            <div class="mb-3 d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted d-block">Probability</small>
                <strong>{{ getProbability(selectedOpportunity) }}%</strong>
              </div>
              <span
                class="badge probability-badge"
                :style="{
                  backgroundColor: getProbabilityColor(
                    getProbability(selectedOpportunity)
                  ),
                }"
              >
                {{ getProbability(selectedOpportunity) }}%
              </span>
            </div>
            <div class="mb-3">
              <small class="text-muted d-block">Assigned Sales</small>
              <strong>
                {{
                  selectedOpportunity.assignedSales?.full_name ||
                  selectedOpportunity.assignedSales?.fullName ||
                  '-'
                }}
              </strong>
            </div>
            <div class="mb-3 d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted d-block">Expected Close</small>
                <strong>
                  {{
                    formatDate(
                      selectedOpportunity.expectedCloseDate ||
                        selectedOpportunity.expected_close_date
                    )
                  }}
                </strong>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSalesPipelineStore } from '~/stores/sales-pipeline'
import { useCustomerStore } from '~/stores/customer'
import { useQuotationStore } from '~/stores/quotation'
import { useSiteInvestStore } from '~/stores/site-invest'
import { usePermissions } from '~/composables/usePermissions'
import Swal from 'sweetalert2'

const salesPipelineStore = useSalesPipelineStore()
const customerStore = useCustomerStore()
const quotationStore = useQuotationStore()
const siteInvestStore = useSiteInvestStore()
const { userHasRole, userHasPermission } = usePermissions()
const formatRupiah = useFormatRupiah()

const { opportunities, stages, loading } = storeToRefs(salesPipelineStore)
const { quotations, statistics: quotationStats, loading: quotationLoading } = storeToRefs(quotationStore)
const { stats: siteInvestStats } = storeToRefs(siteInvestStore)

const reminderWindowDays = 7

const canViewExpiryReminder = computed(
  () =>
    userHasRole('superadmin') ||
    userHasRole('sales_manager') ||
    userHasPermission('access_sales_pipeline'),
)

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
const activeOpportunities = computed(() =>
  opportunities.value.filter((opp) => (opp.isActive !== false && opp.is_active !== false)).length,
)

const reminderQuotations = computed(() => {
  const list = quotations.value || []
  if (!Array.isArray(list) || list.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + reminderWindowDays)

  const results = list
    .map((q) => {
      // Hanya ambil yang statusnya draft
      if ((q.status || '').toLowerCase() !== 'draft') return null

      const validUntilStr = q.validUntil || q.valid_until
      if (!validUntilStr) return null
      const validDate = new Date(validUntilStr)
      if (Number.isNaN(validDate.getTime())) return null
      validDate.setHours(0, 0, 0, 0)

      const diffMs = validDate.getTime() - today.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays < 0 || validDate > endDate) return null

      return {
        id: q.id,
        noQuotation: q.noQuotation || q.no_quotation,
        customerName: q.customer?.name || '-',
        totalValue: q.totalValue || q.total_value || q.grandTotal || q.grand_total || 0,
        validUntilDate: validDate,
        validUntilFormatted: validDate.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        daysLeft: diffDays,
        status: q.status,
      }
    })
    .filter((x) => x !== null)

  // @ts-ignore
  return results.sort((a, b) => a.validUntilDate - b.validUntilDate)
})

const showQuickView = ref(false)
const selectedOpportunity = ref(null)

const draggedOpportunityId = ref(null)
const draggedFromStageId = ref(null)
const dropTargetStageId = ref(null)
const isDragging = ref(false)

function getOpportunitiesByStage(stageId) {
  if (!opportunities.value || opportunities.value.length === 0) {
    return []
  }

  const result = opportunities.value.filter((opp) => {
    const oppStageId = opp.pipelineStageId || opp.pipeline_stage_id
    const isActive =
      (opp.isActive !== false && opp.isActive !== undefined) ||
      (opp.is_active !== false && opp.is_active !== undefined)
    const match = Number(oppStageId) === Number(stageId) && isActive

    return match
  })

  return result
}

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

  const opp = opportunities.value.find((o) => Number(o.id) === Number(opportunityId))
  const prevStage = opp ? (opp.pipelineStageId || opp.pipeline_stage_id) : null
  if (opp) {
    opp.pipelineStageId = toStageId
  }

  try {
    let remarks

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
        if (opp && prevStage != null) opp.pipelineStageId = Number(prevStage)
        return
      }
      remarks = String(result.value || '').trim()
    }

    await salesPipelineStore.moveStage(opportunityId, toStageId, remarks)
  } catch (e) {
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
    '#696cff',
    '#71dd37',
    '#03c3ec',
    '#ffab00',
    '#ff3e1d',
    '#233446',
    '#ea5455',
    '#28c76f',
    '#00cfe8',
    '#ff9f43',
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

onMounted(async () => {
  await salesPipelineStore.fetchStages()
  await salesPipelineStore.fetchOpportunities()
  customerStore.fetchCustomers()
  // Quotations: statistik + data dasar untuk reminder
  quotationStore.params.rows = 50
  quotationStore.params.first = 0
  await quotationStore.fetchQuotations(true)
  quotationStore.fetchStatistics()
  // Site investment stats
  siteInvestStore.fetchStats()
})
</script>

<style scoped>
.status-tile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
}

.status-icon i {
  font-size: 18px;
}

.status-value {
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
  line-height: 1.2;
}

.status-label {
  font-size: 0.75rem;
  color: #4b5563;
}

.kanban-board {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  min-height: 400px;
}

.kanban-column {
  flex: 0 0 320px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 360px);
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

.kanban-column-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kanban-column-body.is-drop-target {
  outline: 2px dashed rgba(105, 108, 255, 0.6);
  outline-offset: 6px;
  background: rgba(105, 108, 255, 0.04);
}

.kanban-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #696cff;
}

.kanban-card-overdue {
  border-color: #fbbf24;
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
  border-top: 1px solid #f3f4f6;
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

.probability-badge {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #111827;
}

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

@media (max-width: 768px) {
  .kanban-column {
    flex: 0 0 280px;
  }
}
</style>

