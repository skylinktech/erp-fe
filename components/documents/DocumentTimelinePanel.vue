<script setup lang="ts">
const props = defineProps<{
  entityType: string
  entityId: string | number
}>()

type TraceNode = {
  entityType: string
  entityId: string | number
  number: string | null
  status: string | null
  date: string | null
  relation: 'self' | 'parent' | 'child' | 'related'
  label: string
}

const loading = ref(false)
const error = ref('')
const nodes = ref<TraceNode[]>([])

async function load() {
  if (!props.entityType || !props.entityId) return
  loading.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  try {
    const url = $api.documentTimeline(props.entityType, props.entityId)
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.message || 'Gagal memuat timeline')
    nodes.value = json.data?.nodes || []
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat timeline'
    nodes.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.entityType, props.entityId],
  () => load(),
  { immediate: true }
)

const relationClass: Record<string, string> = {
  self: 'border-primary',
  parent: 'border-success',
  child: 'border-info',
  related: 'border-secondary',
}
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
      <h6 class="mb-0">Document Timeline</h6>
      <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="loading" @click="load">
        Refresh
      </button>
    </div>
    <div class="card-body pt-0">
      <div v-if="loading" class="text-muted small">Memuat...</div>
      <div v-else-if="error" class="text-danger small">{{ error }}</div>
      <ul v-else-if="nodes.length" class="list-unstyled mb-0">
        <li
          v-for="(n, i) in nodes"
          :key="`${n.entityType}-${n.entityId}-${i}`"
          class="border-start ps-3 mb-3"
          :class="relationClass[n.relation] || 'border-secondary'"
        >
          <div class="small text-muted text-uppercase">{{ n.relation }} · {{ n.label }}</div>
          <div class="fw-medium">{{ n.number || n.entityId }}</div>
          <div class="small text-muted">
            <span v-if="n.status">{{ n.status }}</span>
            <span v-if="n.date"> · {{ n.date }}</span>
          </div>
        </li>
      </ul>
      <div v-else class="text-muted small">Tidak ada dokumen terkait.</div>
    </div>
  </div>
</template>
