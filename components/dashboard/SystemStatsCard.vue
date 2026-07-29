<template>
  <div class="card system-stats-card">
    <div class="card-header d-flex justify-content-between align-items-center gap-2">
      <div>
        <h5 class="mb-1">Statistik Sistem</h5>
        <p class="mb-0 card-subtitle text-muted">Infrastruktur server &amp; layanan</p>
      </div>
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary"
        :disabled="store.loading"
        @click="refresh"
      >
        <i class="ri-refresh-line"></i>
      </button>
    </div>

    <div class="card-body">
      <div v-if="store.loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="store.error" class="text-center py-4">
        <p class="text-danger small mb-2">{{ store.error }}</p>
        <button type="button" class="btn btn-sm btn-primary" @click="refresh">Coba Lagi</button>
      </div>

      <div v-else-if="store.stats" class="system-stats-grid">
        <div
          v-for="metric in metrics"
          :key="metric.key"
          class="system-stat-item"
        >
          <div class="system-stat-header">
            <span class="avatar avatar-sm flex-shrink-0">
              <span class="avatar-initial rounded" :class="`bg-label-${metric.variant}`">
                <i :class="metric.icon"></i>
              </span>
            </span>
            <span class="system-stat-label">{{ metric.label }}</span>
          </div>

          <div class="system-stat-value" :class="`text-${metric.variant}`">
            {{ metric.value }}
          </div>

          <div v-if="metric.showBar" class="progress system-stat-progress">
            <div
              class="progress-bar"
              :class="`bg-${metric.variant}`"
              role="progressbar"
              :style="{ width: `${metric.percent}%` }"
              :aria-valuenow="metric.percent"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>

          <p v-else-if="metric.hint" class="system-stat-hint mb-0">{{ metric.hint }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useSystemStatsStore } from '~/stores/system-stats'

const store = useSystemStatsStore()
let refreshTimer: ReturnType<typeof setInterval> | null = null

const refresh = async () => {
  await store.fetchSystemStats()
}

function percentVariant(percent: number): 'success' | 'warning' | 'danger' {
  if (percent >= 85) return 'danger'
  if (percent >= 70) return 'warning'
  return 'success'
}

function latencyVariant(ms: number): 'success' | 'warning' | 'danger' {
  if (ms >= 300) return 'danger'
  if (ms >= 150) return 'warning'
  return 'success'
}

const metrics = computed(() => {
  const stats = store.stats
  if (!stats) return []

  return [
    {
      key: 'cpu',
      label: 'CPU',
      icon: 'ri-cpu-line',
      value: `${stats.cpu.percent}%`,
      percent: stats.cpu.percent,
      variant: percentVariant(stats.cpu.percent),
      showBar: true,
      hint: null,
    },
    {
      key: 'ram',
      label: 'RAM',
      icon: 'ri-database-2-line',
      value: `${stats.ram.usedGb} / ${stats.ram.totalGb} GB`,
      percent: stats.ram.percent,
      variant: percentVariant(stats.ram.percent),
      showBar: true,
      hint: null,
    },
    {
      key: 'disk',
      label: 'Disk',
      icon: 'ri-hard-drive-2-line',
      value: `${stats.disk.percent}%`,
      percent: stats.disk.percent,
      variant: percentVariant(stats.disk.percent),
      showBar: true,
      hint: null,
    },
    {
      key: 'redis',
      label: 'Redis',
      icon: 'ri-stack-line',
      value: stats.redis.available ? `${stats.redis.memoryMb} MB` : 'N/A',
      percent: 0,
      variant: 'info' as const,
      showBar: false,
      hint: stats.redis.available ? 'Memory usage' : 'Tidak terhubung',
    },
    {
      key: 'queue',
      label: 'Queue',
      icon: 'ri-list-ordered-2',
      value: stats.queue.available ? `${stats.queue.waiting} waiting` : 'N/A',
      percent: 0,
      variant: stats.queue.waiting > 20 ? 'warning' : 'primary',
      showBar: false,
      hint: stats.queue.available ? 'Job menunggu proses' : 'Queue tidak tersedia',
    },
    {
      key: 'workers',
      label: 'Workers',
      icon: 'ri-server-line',
      value: stats.workers.available ? `${stats.workers.online} Online` : 'N/A',
      percent: 0,
      variant: stats.workers.online > 0 ? 'success' : 'warning',
      showBar: false,
      hint: stats.workers.available ? 'BullMQ workers aktif' : 'Worker tidak terdeteksi',
    },
    {
      key: 'api',
      label: 'API',
      icon: 'ri-pulse-line',
      value: `${stats.api.latencyMs} ms`,
      percent: 0,
      variant: latencyVariant(stats.api.latencyMs),
      showBar: false,
      hint: 'Latency database ping',
    },
  ]
})

onMounted(async () => {
  await refresh()
  refreshTimer = setInterval(refresh, 30000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.system-stats-card {
  height: auto;
}

.system-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .system-stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1200px) {
  .system-stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.system-stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  min-height: 7.5rem;
  padding: 0.875rem;
  border: 1px solid rgba(67, 89, 113, 0.12);
  border-radius: 0.5rem;
  background: rgba(67, 89, 113, 0.02);
}

.system-stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.system-stat-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #697a8d;
  line-height: 1.2;
}

.system-stat-value {
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.35;
  word-break: break-word;
}

.system-stat-progress {
  height: 6px;
  margin-top: auto;
  background-color: rgba(67, 89, 113, 0.08);
}

.system-stat-hint {
  margin-top: auto;
  font-size: 0.75rem;
  color: #a1acb8;
  line-height: 1.35;
}
</style>
