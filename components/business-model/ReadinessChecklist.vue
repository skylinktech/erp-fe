<template>
  <section class="card mb-3">
    <div class="card-body">
      <h3 class="h6">Kesiapan</h3>
      <p v-if="overall === 'BLOCKED'" class="alert alert-warning py-2">Konfigurasi belum siap dioperasikan. Perubahan profil tidak mengaktifkan Retail dengan sendirinya.</p>
      <ul v-if="findings.length" class="list-group mb-3">
        <li
          v-for="finding in findings"
          :key="finding.code + finding.message"
          class="list-group-item"
        >
          <div class="d-flex justify-content-between gap-2 flex-wrap">
            <span class="fw-medium">{{ finding.code }}</span>
            <span class="badge" :class="severityBadge(finding.severity)">{{ finding.severity }}</span>
          </div>
          <p class="mb-1 small">{{ finding.message }}</p>
          <p v-if="finding.area" class="mb-1 small text-muted">Area: {{ finding.area }}</p>
          <p v-if="finding.remediationHint" class="mb-0 small text-muted">{{ finding.remediationHint }}</p>
        </li>
      </ul>
      <ul v-else class="list-group">
        <li v-for="item in items" :key="item.label" class="list-group-item d-flex justify-content-between gap-2">
          <span>{{ item.label }}</span>
          <span class="badge text-bg-light text-wrap">{{ item.value }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
export type ReadinessFindingView = {
  code: string
  severity: string
  message: string
  area?: string
  remediationHint?: string
}

withDefaults(
  defineProps<{
    overall: string
    items: Array<{ label: string; value: string }>
    findings?: ReadinessFindingView[]
  }>(),
  { findings: () => [] }
)

function severityBadge(severity: string) {
  if (severity === 'BLOCKER') return 'text-bg-danger'
  if (severity === 'WARNING') return 'text-bg-warning'
  return 'text-bg-light'
}
</script>
