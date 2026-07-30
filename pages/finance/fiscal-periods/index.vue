<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">Fiscal Periods</h4>
          <p class="mb-0 text-muted">Sprint 3 — soft period close untuk posting journal</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" :disabled="loading" @click="load">Refresh</button>
          <button class="btn btn-outline-primary" :disabled="loading" @click="ensureCurrent">Ensure Current</button>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-2">
              <label class="form-label">Year</label>
              <input v-model.number="form.year" type="number" class="form-control" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Month</label>
              <input v-model.number="form.month" type="number" min="1" max="12" class="form-control" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Notes</label>
              <input v-model="form.notes" class="form-control" />
            </div>
            <div class="col-md-4 d-flex gap-2">
              <button class="btn btn-danger" :disabled="loading" @click="closePeriod">Close</button>
              <button class="btn btn-success" :disabled="loading" @click="reopenPeriod">Reopen</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div v-if="error" class="text-danger mb-2">{{ error }}</div>
          <table class="table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Month</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in periods" :key="row.id">
                <td>{{ row.year }}</td>
                <td>{{ row.month }}</td>
                <td>{{ row.periodStart || row.period_start }}</td>
                <td>{{ row.periodEnd || row.period_end }}</td>
                <td>
                  <span :class="row.status === 'closed' ? 'badge bg-danger' : 'badge bg-success'">
                    {{ row.status }}
                  </span>
                </td>
                <td>{{ row.notes || '—' }}</td>
              </tr>
              <tr v-if="!periods.length">
                <td colspan="6" class="text-muted text-center">Belum ada periode</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Fiscal Periods',
})

const periods = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const now = new Date()
const form = reactive({
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  notes: '',
})

async function load() {
  loading.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.fiscalPeriods(), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Gagal memuat periode')
    periods.value = Array.isArray(json.data) ? json.data : []
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function ensureCurrent() {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    const res = await fetch($api.fiscalPeriodsCurrent(), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message)
    toast.success({ title: 'OK', message: `Periode ${json.data?.year}-${json.data?.month}`, color: 'green', position: 'topRight', layout: 2 })
    await load()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
  }
}

async function closePeriod() {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    const res = await fetch($api.fiscalPeriodsClose(), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message)
    toast.success({ title: 'Closed', message: json.message, color: 'green', position: 'topRight', layout: 2 })
    await load()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
  }
}

async function reopenPeriod() {
  const { $api } = useNuxtApp()
  const toast = useToast()
  try {
    const res = await fetch($api.fiscalPeriodsReopen(), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ year: form.year, month: form.month }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message)
    toast.success({ title: 'Reopened', message: json.message, color: 'green', position: 'topRight', layout: 2 })
    await load()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e.message, color: 'red', position: 'topRight', layout: 2 })
  }
}

onMounted(() => load())
</script>
