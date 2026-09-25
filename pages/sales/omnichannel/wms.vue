<template>
  <OmnichannelShell
    title="WMS"
    subtitle="Pekerjaan fulfillment marketplace — status jujur sesuai kemampuan F0/F1"
  >
    <div class="alert alert-warning small">
      Operasi <strong>pick / pack / ship</strong> marketplace <strong>belum diaktifkan</strong> di fase ini.
      Tidak ada tombol operasional palsu. Auto-release ke RetailSale tetap diblokir money snapshot blocker.
    </div>

    <div v-if="error" class="alert alert-danger text-break mb-3">{{ error }}</div>

    <div class="card mb-3">
      <div class="card-body">
        <h2 class="h6 mb-2">Ringkasan status fulfillment (External Order)</h2>
        <div class="row g-2">
          <div v-for="c in cards" :key="c.key" class="col-6 col-md-3">
            <div class="border rounded p-3 h-100">
              <div class="small text-muted">{{ c.label }}</div>
              <div class="fs-5 fw-semibold">{{ c.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h2 class="h6 mb-2">Order menunggu pemenuhan (read-only)</h2>
        <ExternalOrdersPanel :orders="orders">
          <template #empty>
            Belum ada order AWAITING_FULFILLMENT / IN_FULFILLMENT di cache SkyFlow.
          </template>
        </ExternalOrdersPanel>
      </div>
    </div>
  </OmnichannelShell>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import OmnichannelShell from '~/components/commerce/OmnichannelShell.vue'
import ExternalOrdersPanel from '~/components/commerce/ExternalOrdersPanel.vue'
import { readAccessToken } from '~/utils/authCookie'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api } = useNuxtApp() as any
const { companyId } = useActiveCompany()

const orders = ref<any[]>([])
const summary = ref<Record<string, number>>({})
const error = ref('')
const loading = ref(false)

const cards = computed(() => [
  { key: 'await', label: 'AWAITING_FULFILLMENT', value: summary.value.AWAITING_FULFILLMENT || 0 },
  { key: 'inf', label: 'IN_FULFILLMENT', value: summary.value.IN_FULFILLMENT || 0 },
  { key: 'ship', label: 'SHIPPED', value: summary.value.SHIPPED || 0 },
  { key: 'exc', label: 'EXCEPTION', value: summary.value.EXCEPTION || 0 },
])

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Active-Company-Id'] = String(companyId.value)
  return h
}

async function load() {
  if (!companyId.value) return
  loading.value = true
  error.value = ''
  try {
    const qs = new URLSearchParams({
      perusahaanId: String(companyId.value),
      page: '1',
      perPage: '50',
      fulfillmentQueue: '1',
    })
    const res = await fetch(`${$api.commerceExternalOrders()}?${qs}`, {
      headers: headers(),
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Gagal memuat antrian fulfillment'
      return
    }
    orders.value = json.data || []
    summary.value = json.meta?.fulfillmentSummary || {}
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat WMS view'
  } finally {
    loading.value = false
  }
}

watch(companyId, () => load())
onMounted(() => load())
</script>
