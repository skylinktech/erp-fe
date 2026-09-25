<template>
  <section class="card mb-3">
    <div class="card-body">
      <div class="d-flex flex-wrap justify-content-between gap-2">
        <div>
          <div class="text-muted small">Perusahaan</div>
          <h2 class="h5 mb-1 text-break">{{ company?.name || 'Belum dipilih' }}</h2>
          <div class="small text-muted">{{ company?.code || '-' }}</div>
        </div>
        <div class="text-md-end">
          <div class="small text-muted">Model bisnis</div>
          <div class="fw-semibold">{{ company?.profileName || '-' }}</div>
          <div class="small">Revisi {{ revision }}</div>
          <div class="small">Kesiapan {{ readiness || 'Belum dinilai' }}</div>
          <div class="small text-break">Aktivasi {{ activation || 'NOT_RETAIL_PROFILE' }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ company: any; revision: number; readiness: string; activation: string }>()
</script>
