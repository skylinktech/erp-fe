<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <p class="mb-0 text-muted">KPI pending SLA, suspended aging, billable mismatch</p>
        <p v-if="serviceId" class="mb-0 small mt-1">
          Konteks layanan:
          <NuxtLink :to="`/service-management/${serviceId}`">{{ serviceId }}</NuxtLink>
          <span class="text-muted"> (KPI tetap agregat global)</span>
        </p>
      </div>
      <button class="btn btn-outline-secondary btn-sm" :disabled="loading" @click="load">
        Refresh
      </button>
    </div>

    <div v-if="loading && !data" class="text-muted mb-3">Memuat monitoring…</div>
    <div v-if="error" class="alert alert-danger mb-3">{{ error }}</div>

    <div class="row g-3">
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <h6>Pending SLA</h6>
            <p class="mb-1">Over 7d: <strong>{{ data?.pendingSla?.over7d ?? 0 }}</strong></p>
            <p class="mb-0">Over 14d: <strong>{{ data?.pendingSla?.over14d ?? 0 }}</strong></p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <h6>Suspended Aging</h6>
            <p class="mb-1">Over 7d: <strong>{{ data?.suspendedAging?.over7d ?? 0 }}</strong></p>
            <p class="mb-0">Over 30d: <strong>{{ data?.suspendedAging?.over30d ?? 0 }}</strong></p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <h6>Billable Mismatch</h6>
            <p class="mb-0 fs-3 fw-semibold">{{ data?.billableMismatch ?? 0 }}</p>
            <small class="text-muted">Instance billable tetapi subscription bukan signed/active</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useServiceInstanceStore } from '~/stores/service-instances'

const props = defineProps<{
  serviceId?: string | null
  active?: boolean
}>()

const store = useServiceInstanceStore()
const loading = ref(false)
const error = ref<string | null>(null)
const data = computed(() => store.monitoring)
const fetchedOnce = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    await store.fetchMonitoring()
    fetchedOnce.value = true
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat monitoring'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.active,
  (on) => {
    if (on && !fetchedOnce.value) load()
  },
  { immediate: true }
)
</script>
