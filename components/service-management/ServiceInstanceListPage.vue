<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          
          <p class="mb-0 text-muted">Layanan operasional (Service Instance)</p>
        </div>
        <div class="d-flex gap-2">
          <input
            v-model="search"
            class="form-control form-control-sm"
            placeholder="Cari..."
            style="width:220px"
            @keyup.enter="load"
          />
          <button class="btn btn-outline-secondary btn-sm" :disabled="store.loading" @click="load">
            Refresh
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div v-if="store.loading" class="text-muted">Memuat...</div>
          <div v-else-if="store.error" class="text-danger">{{ store.error }}</div>
          <div v-else class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th>No. Service</th>
                  <th>Customer</th>
                  <th>Product / Plan</th>
                  <th>Subscription</th>
                  <th>Status</th>
                  <th>Billable</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in store.items" :key="row.id">
                  <td class="fw-medium">{{ row.serviceNumber || row.service_number }}</td>
                  <td>{{ row.customer?.name || row.customerId || '—' }}</td>
                  <td>
                    <div>{{ row.serviceName || row.service_name || '—' }}</div>
                    <small class="text-muted">{{ row.planName || row.plan_name || '' }}</small>
                  </td>
                  <td>
                    {{ row.subscription?.noSubscription || row.subscription?.no_subscription || '—' }}
                  </td>
                  <td><span class="badge bg-label-secondary">{{ row.status }}</span></td>
                  <td>{{ row.billable ? 'Yes' : 'No' }}</td>
                  <td>
                    <NuxtLink
                      class="btn btn-sm btn-outline-primary"
                      :to="`/service-management/${row.id}`"
                    >
                      Detail
                    </NuxtLink>
                  </td>
                </tr>
                <tr v-if="!store.items.length">
                  <td colspan="7" class="text-center text-muted">Tidak ada data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useServiceInstanceStore } from '~/stores/service-instances'

const props = defineProps<{
  status?: string
  title?: string
}>()

const store = useServiceInstanceStore()
const search = ref('')
const title = computed(() => props.title || 'Service Instances')

async function load() {
  await store.fetchList({ status: props.status, search: search.value })
}

onMounted(load)
watch(
  () => props.status,
  () => {
    load()
  }
)
</script>
