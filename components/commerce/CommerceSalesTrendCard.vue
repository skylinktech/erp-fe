<template>
  <div class="card h-100 commerce-sales-trend-card">
    <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2">
      <div class="min-w-0">
        <h5 class="mb-1">Analisis penjualan (marketplace)</h5>
        <p class="mb-0 card-subtitle text-muted small">
          Tren nominal External Order (cache SkyFlow) — bukan revenue Finance
        </p>
      </div>
    </div>

    <div class="card-body">
      <div class="row g-2 mb-3 mt-1">
        <div class="col-sm-4">
          <div class="border rounded p-2 h-100">
            <div class="d-flex align-items-center gap-2">
              <div class="avatar avatar-sm">
                <div class="avatar-initial bg-label-primary rounded-3">
                  <i class="ri-money-dollar-circle-line" aria-hidden="true" />
                </div>
              </div>
              <div class="min-w-0">
                <p class="mb-0 text-muted small">Nominal marketplace</p>
                <h5 class="mb-0 text-break">{{ formatCommerceMoney(summary.marketplaceOrderNominal) }}</h5>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="border rounded p-2 h-100">
            <div class="d-flex align-items-center gap-2">
              <div class="avatar avatar-sm">
                <div class="avatar-initial bg-label-info rounded-3">
                  <i class="ri-shopping-bag-3-line" aria-hidden="true" />
                </div>
              </div>
              <div class="min-w-0">
                <p class="mb-0 text-muted small">Jumlah order</p>
                <h5 class="mb-0">{{ summary.orderCount ?? 0 }}</h5>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="border rounded p-2 h-100">
            <div class="d-flex align-items-center gap-2">
              <div class="avatar avatar-sm">
                <div class="avatar-initial bg-label-secondary rounded-3">
                  <i class="ri-bank-card-line" aria-hidden="true" />
                </div>
              </div>
              <div class="min-w-0">
                <p class="mb-0 text-muted small">Revenue Finance diakui</p>
                <h5 class="mb-0">—</h5>
                <p class="mb-0 text-muted" style="font-size: 0.7rem; line-height: 1.3">
                  {{ summary.financeRecognizedRevenueNote || 'F0/F1: auto-release diblokir.' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h6 class="mb-2">Tren penjualan / hari</h6>
      <div v-if="!trend.length" class="text-muted small py-4 text-center border rounded">
        Belum ada data tren untuk periode ini.
      </div>
      <div v-else class="commerce-sales-chart">
        <Chart type="line" :data="chartData" :options="chartOptions" class="commerce-sales-chart__canvas" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCommerceDay, formatCommerceMoney } from '~/utils/commerceFormat'

export type CommerceTrendPoint = {
  day: string
  orderCount: number
  marketplaceNominal: number
}

const props = withDefaults(
  defineProps<{
    summary?: {
      marketplaceOrderNominal?: number | null
      orderCount?: number | null
      financeRecognizedRevenueNote?: string | null
    }
    trend?: CommerceTrendPoint[]
  }>(),
  {
    summary: () => ({}),
    trend: () => [],
  }
)

const summary = computed(() => props.summary || {})
const trend = computed(() => props.trend || [])

const chartData = computed(() => ({
  labels: trend.value.map((row) => formatCommerceDay(row.day)),
  datasets: [
    {
      label: 'Nominal marketplace',
      data: trend.value.map((row) => Number(row.marketplaceNominal) || 0),
      borderColor: '#008fec',
      backgroundColor: 'rgba(0, 143, 236, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
      yAxisID: 'y',
    },
    {
      label: 'Jumlah order',
      data: trend.value.map((row) => Number(row.orderCount) || 0),
      borderColor: '#28c76f',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
      yAxisID: 'y1',
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: { boxWidth: 10, usePointStyle: true },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { dataset: { label?: string; yAxisID?: string }; raw: number }) => {
          const n = Number(ctx.raw) || 0
          if (ctx.dataset.yAxisID === 'y1') return `${ctx.dataset.label}: ${n}`
          return `${ctx.dataset.label}: ${formatCommerceMoney(n)}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10, padding: 4 },
    },
    y: {
      beginAtZero: true,
      position: 'left' as const,
      ticks: {
        padding: 4,
        callback: (value: number | string) => {
          const n = Number(value) || 0
          if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`
          if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
          if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`
          return String(n)
        },
      },
    },
    y1: {
      beginAtZero: true,
      position: 'right' as const,
      grid: { drawOnChartArea: false },
      ticks: {
        padding: 4,
        precision: 0,
      },
    },
  },
}))
</script>

<style scoped>
.commerce-sales-chart {
  position: relative;
  width: 100%;
  height: 350px;
}

.commerce-sales-chart__canvas,
.commerce-sales-chart :deep(canvas) {
  width: 100% !important;
  height: 350px !important;
}
</style>
