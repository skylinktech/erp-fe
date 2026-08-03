<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <NuxtLink
            to="/service-management/customer-service"
            class="btn btn-outline-secondary btn-sm mb-2"
          >
            ← Customer Service
          </NuxtLink>
          <h4 class="mb-1">{{ row?.serviceNumber || row?.service_number || 'Service Instance' }}</h4>
          <p class="mb-0 text-muted"><span :class="statusBadgeClass(row?.status || '')">{{ getStatusLabel(row?.status || '') }}</span> · {{ row?.customer?.name || '' }}</p>
        </div>
        <div v-if="row && hasActions" class="btn-group">
          <button
            type="button"
            class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="ri-more-2-fill"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-end">
            <a
              v-if="row.status === 'pending_activation'"
              class="dropdown-item"
              href="javascript:void(0)"
              @click="doTransition('activate')"
            >
              <i class="ri-checkbox-circle-line me-2"></i> Activate
            </a>
            <a
              v-if="row.status === 'active'"
              class="dropdown-item"
              href="javascript:void(0)"
              @click="doTransition('suspend')"
            >
              <i class="ri-pause-circle-line me-2"></i> Suspend
            </a>
            <a
              v-if="row.status === 'suspended'"
              class="dropdown-item"
              href="javascript:void(0)"
              @click="doTransition('resume')"
            >
              <i class="ri-play-circle-line me-2"></i> Resume
            </a>
            <a
              v-if="['active', 'suspended', 'pending_activation'].includes(row.status)"
              class="dropdown-item text-danger"
              href="javascript:void(0)"
              @click="doTransition('terminate')"
            >
              <i class="ri-close-circle-line me-2"></i> Terminate
            </a>
            <a
              v-if="row.status === 'terminated'"
              class="dropdown-item"
              href="javascript:void(0)"
              @click="doTransition('archive')"
            >
              <i class="ri-archive-line me-2"></i> Archive
            </a>
          </div>
        </div>
      </div>

      <div v-if="store.loading" class="text-muted">Memuat...</div>
      <div v-else-if="store.error" class="text-danger">{{ store.error }}</div>
      <div v-else-if="row" class="row g-4">
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="mb-3">Detail</h6>
              <dl class="row mb-0">
                <dt class="col-sm-4">Product</dt>
                <dd class="col-sm-8">{{ row.serviceName || row.service_name || '—' }}</dd>
                <dt class="col-sm-4">Plan</dt>
                <dd class="col-sm-8">{{ row.planName || row.plan_name || '—' }}</dd>
                <dt class="col-sm-4">Subscription</dt>
                <dd class="col-sm-8">
                  {{ row.subscription?.noSubscription || row.subscription?.no_subscription || '—' }}
                </dd>
                <dt class="col-sm-4">SN Kit</dt>
                <dd class="col-sm-8">{{ row.snKit || row.sn_kit || '—' }}</dd>
                <dt class="col-sm-4">Location</dt>
                <dd class="col-sm-8">{{ row.locationName || row.location_name || '—' }}</dd>
                <dt class="col-sm-4">Billable</dt>
                <dd class="col-sm-8">{{ row.billable ? 'Yes' : 'No' }}</dd>
                <dt class="col-sm-4">Outstanding</dt>
                <dd class="col-sm-8">{{ row.billingSummary?.outstanding ?? 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="mb-3">Timeline Events</h6>
              <ul class="list-unstyled mb-0">
                <li v-for="ev in events" :key="ev.id" class="mb-3 border-bottom pb-2">
                  <div class="fw-medium">{{ ev.eventType || ev.event_type }}</div>
                  <small class="text-muted">
                    {{ ev.fromStatus || ev.from_status || '—' }} → {{ ev.toStatus || ev.to_status || '—' }}
                    · {{ ev.source }}
                  </small>
                  <div v-if="ev.reason" class="small">{{ ev.reason }}</div>
                </li>
                <li v-if="!events.length" class="text-muted">Belum ada event</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useServiceInstanceStore } from '~/stores/service-instances'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Service Instance Detail',
})

const route = useRoute()
const store = useServiceInstanceStore()
const row = computed(() => store.selected)
const events = computed(() => store.events)
const hasActions = computed(() => {
  const status = row.value?.status
  if (!status) return false
  return ['pending_activation', 'active', 'suspended', 'terminated'].includes(status)
})

async function load() {
  const id = String(route.params.id)
  await store.fetchOne(id)
  await store.fetchEvents({ serviceInstanceId: id })
}

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

async function doTransition(action: 'activate' | 'suspend' | 'resume' | 'terminate' | 'archive') {
  const reason = window.prompt(`Alasan ${action} (opsional)`) || undefined
  const id = String(route.params.id)
  const ok = await store.transition(id, action, { reason })
  if (ok) await load()
}

onMounted(load)
</script>
