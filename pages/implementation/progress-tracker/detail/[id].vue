<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <div v-if="loading" class="d-flex justify-content-center pt-5">
        <div class="spinner-border text-primary" />
      </div>

      <div v-else-if="!project" class="alert alert-danger">
        Project tidak ditemukan.
        <NuxtLink to="/implementation/progress-tracker" class="alert-link ms-2">Kembali</NuxtLink>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div class="d-flex flex-wrap align-items-center gap-3">
            <NuxtLink to="/implementation/progress-tracker" class="btn btn-outline-secondary btn-sm">
              <i class="ri-arrow-left-line me-1"></i> Kembali
            </NuxtLink>
            <div>
              <h4 class="mb-0">{{ project.name }}</h4>
              <small class="text-muted">{{ getProjectCode(project) }}</small>
            </div>
            <span :class="getProjectStatusBadge(project.status).class">
              {{ getProjectStatusBadge(project.status).text }}
            </span>
          </div>
          <div v-if="canEdit || canDelete" class="btn-group" role="group">
            <button
              id="progressTrackerActionsDropdown"
              type="button"
              class="btn btn-outline-secondary dropdown-toggle btn-sm"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span class="d-none d-sm-inline">Actions</span>
              <span class="d-sm-none"><i class="ri-more-2-line"></i></span>
            </button>
            <div class="dropdown-menu dropdown-menu-end" aria-labelledby="progressTrackerActionsDropdown">
              <a
                v-if="canEdit"
                class="dropdown-item"
                href="javascript:void(0)"
                @click="navigateTo(`/implementation/progress-tracker/form/${project.id}`)"
              >
                <i class="ri-edit-box-line me-2"></i> Edit
              </a>
              <a
                v-if="canDelete"
                class="dropdown-item text-danger"
                href="javascript:void(0)"
                @click="onDelete"
              >
                <i class="ri-delete-bin-7-line me-2"></i> Hapus
              </a>
            </div>
          </div>
        </div>

        <div class="row g-4 mb-4">
          <div class="col-xl-8">
            <div class="card shadow-sm border-0">
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="small text-muted">Site Investment</div>
                    <div class="fw-medium">
                      {{
                        project.siteInvestment?.siNumber ||
                        project.siteInvestment?.si_number ||
                        '—'
                      }}
                      <span v-if="project.siteInvestment?.name" class="text-muted">
                        — {{ project.siteInvestment.name }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="small text-muted">Customer</div>
                    <div class="fw-medium">
                      {{
                        project.customer?.name ||
                        project.customer?.customerName ||
                        project.customer?.customer_name ||
                        '—'
                      }}
                    </div>
                  </div>
                  <div v-if="project.description" class="col-12">
                    <div class="small text-muted">Deskripsi</div>
                    <p class="mb-0">{{ project.description }}</p>
                  </div>
                </div>

                <hr class="my-4" />

                <h6 class="mb-3">Progress Keseluruhan Project</h6>
                <ProgressTrackerStatusBar :status="overallRepresentativeStatus" />
                <p class="small text-muted mb-0 mt-2">
                  Rata-rata progres {{ projectProgressPercent }}% dari
                  {{ project.nodes?.length ?? 0 }} node
                </p>
              </div>
            </div>
          </div>
          <div class="col-xl-4">
            <div class="card shadow-sm border-0">
              <div class="card-body">
                <h6 class="mb-3">Ringkasan Node per Status</h6>
                <div v-for="opt in PROGRESS_TRACKER_STATUS_OPTIONS" :key="opt.value" class="d-flex justify-content-between small mb-1">
                  <span>{{ opt.label }}</span>
                  <span class="fw-medium">{{ nodeCountByStatus(opt.value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h5 class="mb-3">Progress per Node / Network</h5>
        <NodeProgressPanel
          v-for="node in project.nodes"
          :key="node.id"
          :node="node"
          :project-id="project.id"
          @updated="refresh"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import NodeProgressPanel from '~/components/progress-tracker/NodeProgressPanel.vue'
import ProgressTrackerStatusBar from '~/components/progress-tracker/ProgressTrackerStatusBar.vue'
import {
  useProgressTrackerStore,
  getProjectCode,
  getNodeStatus,
} from '~/stores/progress-tracker'
import { usePermissions } from '~/composables/usePermissions'
import {
  getProjectStatusBadge,
  getProgressTrackerPercent,
  PROGRESS_TRACKER_STATUS_OPTIONS,
  PROGRESS_TRACKER_STATUSES,
  type ProgressTrackerStatus,
} from '~/constants/implementation/progressTrackerStatuses'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Detail Progress Tracker',
})

const route = useRoute()
const id = computed(() => String(route.params.id))

const store = useProgressTrackerStore()
const { project, loading } = storeToRefs(store)
const { userHasRole, userHasPermission } = usePermissions()

const canEdit = computed(
  () => userHasRole('superadmin') || userHasPermission('edit_progress_tracker')
)
const canDelete = computed(
  () => userHasRole('superadmin') || userHasPermission('delete_progress_tracker')
)

function nodeCountByStatus(status: ProgressTrackerStatus) {
  return (project.value?.nodes ?? []).filter((n) => getNodeStatus(n) === status).length
}

const projectProgressPercent = computed(() => {
  const nodes = project.value?.nodes ?? []
  if (!nodes.length) return 0
  const sum = nodes.reduce((s, n) => s + getProgressTrackerPercent(getNodeStatus(n)), 0)
  return Math.round(sum / nodes.length)
})

/** Status representatif untuk progress bar project (median tahap node). */
const overallRepresentativeStatus = computed((): ProgressTrackerStatus => {
  const nodes = project.value?.nodes ?? []
  if (!nodes.length) return 'material_readiness'
  const indices = nodes
    .map((n) => PROGRESS_TRACKER_STATUSES.indexOf(getNodeStatus(n)))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)
  const mid = indices[Math.floor(indices.length / 2)] ?? 0
  return PROGRESS_TRACKER_STATUSES[mid] ?? 'material_readiness'
})

async function refresh() {
  if (id.value) await store.getProjectDetails(id.value)
}

async function onDelete() {
  if (!project.value?.id) return
  const ok = await store.deleteProject(project.value.id)
  if (ok) navigateTo('/implementation/progress-tracker')
}

onMounted(() => refresh())
</script>
