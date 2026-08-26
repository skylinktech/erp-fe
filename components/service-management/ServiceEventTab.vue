<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <p class="mb-0 text-muted">Global lifecycle event log</p>
        <p v-if="serviceId" class="mb-0 small mt-1">
          Difilter service:
          <NuxtLink :to="`/service-management/${serviceId}`">{{ serviceId }}</NuxtLink>
          <button type="button" class="btn btn-link btn-sm p-0 ms-2" @click="clearServiceFilter">
            Hapus filter
          </button>
        </p>
      </div>
      <button class="btn btn-outline-secondary btn-sm" :disabled="loading" @click="load(page)">
        Refresh
      </button>
    </div>

    <div v-if="loading && !events.length" class="text-muted mb-3">Memuat events…</div>
    <div v-if="error" class="alert alert-danger mb-3">{{ error }}</div>

    <div class="card">
      <div class="card-body table-responsive">
        <table class="table mb-0">
          <thead>
            <tr>
              <th>When</th>
              <th>Event</th>
              <th>From → To</th>
              <th>Source</th>
              <th>Reason</th>
              <th>Instance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ev in events" :key="ev.id">
              <td>{{ ev.createdAt || ev.created_at }}</td>
              <td>{{ ev.eventType || ev.event_type }}</td>
              <td>
                {{ ev.fromStatus || ev.from_status || '—' }} →
                {{ ev.toStatus || ev.to_status || '—' }}
              </td>
              <td>{{ ev.source }}</td>
              <td>{{ ev.reason || '—' }}</td>
              <td>
                <NuxtLink
                  v-if="instanceIdOf(ev)"
                  :to="`/service-management/${instanceIdOf(ev)}`"
                >
                  {{
                    ev.serviceInstance?.serviceNumber ||
                    ev.service_instance?.service_number ||
                    'Detail'
                  }}
                </NuxtLink>
                <span v-else>—</span>
              </td>
            </tr>
            <tr v-if="!loading && !events.length">
              <td colspan="6" class="text-center text-muted">Belum ada event</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="totalRecords > limit"
        class="card-footer d-flex justify-content-between align-items-center"
      >
        <small class="text-muted">
          Halaman {{ page }} · {{ events.length }} / {{ totalRecords }} event
        </small>
        <div class="d-flex gap-2">
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="loading || page <= 1"
            @click="load(page - 1)"
          >
            Prev
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="loading || page * limit >= totalRecords"
            @click="load(page + 1)"
          >
            Next
          </button>
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

const emit = defineEmits<{
  'clear-service-id': []
}>()

const store = useServiceInstanceStore()
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const limit = 50
const totalRecords = ref(0)
const events = computed(() => store.events)
const lastKey = ref('')

function instanceIdOf(ev: any) {
  return ev.serviceInstanceId || ev.service_instance_id || null
}

function clearServiceFilter() {
  emit('clear-service-id')
}

async function load(nextPage = 1) {
  loading.value = true
  error.value = null
  try {
    const result = await store.fetchEvents({
      page: nextPage,
      limit,
      serviceInstanceId: props.serviceId || undefined,
    })
    page.value = nextPage
    totalRecords.value = Number(store.eventsTotal || result?.length || 0)
    lastKey.value = `${props.serviceId || ''}:${nextPage}`
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat events'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.active, props.serviceId] as const,
  ([on, sid]) => {
    if (!on) return
    const key = `${sid || ''}:1`
    if (key !== lastKey.value || !events.value.length) {
      load(1)
    }
  },
  { immediate: true }
)
</script>
