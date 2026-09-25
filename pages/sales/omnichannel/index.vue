<template>
  <OmnichannelShell title="Dashboard" subtitle="Dashboard Omnichannel SkyFlow">
    <template #actions>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        :disabled="loading"
        @click="load"
      >
        Muat ulang
      </button>
    </template>

    <div v-if="fatalError" class="alert alert-danger text-break mb-3">
      <div class="fw-semibold">{{ fatalError.title }}</div>
      <div class="small">{{ fatalError.detail }}</div>
      <button type="button" class="btn btn-sm btn-outline-danger mt-2" @click="load">Coba lagi</button>
    </div>

    <div
      v-for="se in sectionErrors"
      :key="se.section"
      class="alert alert-warning small text-break mb-2"
    >
      Bagian <strong>{{ se.section }}</strong> gagal: {{ se.message }}
      <button type="button" class="btn btn-link btn-sm p-0 ms-1" @click="load">Retry</button>
    </div>

    <div v-if="loading && !dash" class="text-muted mb-3">Memuat dashboard…</div>

    <template v-if="dash">
      <p class="small text-muted mb-3">
        Periode {{ dash.period?.days }} hari · {{ dash.period?.note }} ·
        sync produk {{ formatTs(dash.syncMeta?.lastProductSyncAt) }} ·
        sync order {{ formatTs(dash.syncMeta?.lastOrderSyncAt) }}
      </p>

      <div class="card mb-3">
        <div class="card-header">
          <h5 class="mb-0">Perlu Ditangani</h5>
        </div>
        <div class="card-body">
          <div v-if="!dash.attention?.items?.length" class="text-muted small">
            {{ dash.attention?.emptyLabel || 'Tidak ada item.' }}
          </div>
          <div v-else class="list-group list-group-flush">
            <NuxtLink
              v-for="item in dash.attention.items"
              :key="item.code"
              :to="item.href"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-0"
            >
              <span>{{ item.label }}</span>
              <span class="badge bg-label-warning">{{ item.count }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <h5 class="mb-3">KPI operasional</h5>
      <ListPageStatsCards :items="kpiStatItems" :loading="loading && !dash" columns-class="col-6 col-md-4 col-xl" />

      <div class="mb-3">
        <CommerceSalesTrendCard
          :summary="dash.analytics || {}"
          :trend="dash.analytics?.trendByDay || []"
        />
      </div>

      <div class="row g-3 mb-3">
        <div class="col-lg-6">
          <CommerceTopShopsCard :days="dash.period?.days || 14" />
        </div>
        <div class="col-lg-6">
          <CommerceTopProductsCard :days="dash.period?.days || 14" />
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header">
          <h5 class="mb-0">FP Growth — Sering Terjual Bersama</h5>
        </div>
        <div class="card-body mt-3">
          <div v-if="!dash.fpGrowth?.eligible" class="alert alert-secondary small mb-0">
            {{ dash.fpGrowth?.reason || 'Data belum cukup.' }}
          </div>
          <div v-else class="table-responsive">
            <table class="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Produk A</th><th>Produk B</th><th>Bersama</th><th>Support</th><th>Lift</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in dash.fpGrowth.pairs" :key="i">
                  <td class="small text-break">{{ p.productLabelA }}</td>
                  <td class="small text-break">{{ p.productLabelB }}</td>
                  <td>{{ p.togetherCount }}</td>
                  <td>{{ pct(p.support) }}</td>
                  <td>{{ p.lift == null ? '—' : p.lift.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </OmnichannelShell>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import OmnichannelShell from '~/components/commerce/OmnichannelShell.vue'
import CommerceSalesTrendCard from '~/components/commerce/CommerceSalesTrendCard.vue'
import CommerceTopShopsCard from '~/components/commerce/CommerceTopShopsCard.vue'
import CommerceTopProductsCard from '~/components/commerce/CommerceTopProductsCard.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'
import { formatCommerceTs } from '~/utils/commerceFormat'
import { readAccessToken } from '~/utils/authCookie'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api } = useNuxtApp() as any
const { companyId } = useActiveCompany()

const loading = ref(false)
const dash = ref<any>(null)
const fatalError = ref<{ title: string; detail: string } | null>(null)

const sectionErrors = computed(() => dash.value?.sectionErrors || [])

const kpiStatItems = computed<ListPageStatItem[]>(() => {
  const k = dash.value?.kpi || {}
  return [
    {
      key: 'new',
      label: 'Order baru',
      value: k.newOrders ?? 0,
      icon: 'ri-shopping-bag-3-line',
      iconBgClass: 'bg-label-primary',
    },
    {
      key: 'await',
      label: 'Siap proses',
      value: k.awaitingFulfillment ?? 0,
      icon: 'ri-truck-line',
      iconBgClass: 'bg-label-info',
    },
    {
      key: 'proc',
      label: 'Dalam proses',
      value: k.inProcess ?? 0,
      icon: 'ri-loader-4-line',
      iconBgClass: 'bg-label-warning',
    },
    {
      key: 'map',
      label: 'Masalah mapping',
      value: k.mappingProblems ?? 0,
      icon: 'ri-link-unlink',
      iconBgClass: 'bg-label-secondary',
    },
    {
      key: 'exc',
      label: 'Exception',
      value: k.exceptions ?? 0,
      icon: 'ri-error-warning-line',
      iconBgClass: 'bg-label-danger',
      valueClass: (k.exceptions ?? 0) > 0 ? 'text-danger' : undefined,
    },
  ]
})

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Active-Company-Id'] = String(companyId.value)
  return h
}

function formatTs(v?: string | null) {
  return formatCommerceTs(v)
}
function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`
}

function classifyHttpError(status: number, message: string) {
  if (status === 403) {
    return {
      title: '403 — Izin atau company tidak eligible',
      detail: message || 'Perlu permission commerce dan Active Company RETAIL.',
    }
  }
  if (status === 401) {
    return { title: '401 — Sesi tidak valid', detail: message || 'Login ulang.' }
  }
  if (status >= 500) {
    return { title: '500 — Server error', detail: message || 'Periksa log backend / request ID.' }
  }
  return { title: `Gagal memuat dashboard (${status})`, detail: message }
}

async function load() {
  if (!companyId.value) {
    dash.value = null
    fatalError.value = {
      title: 'Active Company belum dipilih',
      detail: 'Pilih company RETAIL di field di atas.',
    }
    return
  }
  loading.value = true
  fatalError.value = null
  try {
    const qs = new URLSearchParams({
      perusahaanId: String(companyId.value),
      days: '14',
    })
    const res = await fetch(`${$api.commerceDashboard()}?${qs}`, {
      headers: headers(),
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.success === false) {
      dash.value = null
      fatalError.value = classifyHttpError(res.status, json.message || 'Permintaan Commerce gagal')
      return
    }
    dash.value = json.data
  } catch (e: any) {
    dash.value = null
    fatalError.value = {
      title: 'Tidak dapat menghubungi API',
      detail: e?.message || 'Network error',
    }
  } finally {
    loading.value = false
  }
}

watch(companyId, () => load())
onMounted(() => load())
</script>
