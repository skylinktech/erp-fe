<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="loading" class="text-center py-10">
        <ProgressSpinner
          style="width: 50px; height: 50px"
          strokeWidth="4"
          fill="transparent"
          animationDuration="1s"
        />
        <div class="mt-3 text-muted">Memuat data...</div>
      </div>

      <div v-else-if="customer" class="row">
        <!-- Left: profile + summary -->
        <div class="col-xl-4 col-lg-5 col-md-5">
          <div class="card mb-6">
            <div class="card-body pt-12">
              <div class="user-avatar-section">
                <div class="d-flex align-items-center flex-column">
                  <img
                    class="img-fluid rounded mb-4"
                    :src="getCustomerLogo(customer.logo)"
                    alt="Logo Customer"
                    height="120"
                    width="120"
                    style="object-fit: contain; max-height: 120px"
                    @error="(e) => handleImageError(e, '/img/default-customer-logo.png')"
                  />
                  <div class="user-info text-center">
                    <h5 class="mb-2">{{ customer.name }}</h5>
                    <span :class="typeBadgeClass(customer.type)" class="badge">
                      {{ typeLabel(customer.type) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-around flex-wrap my-6 gap-0 gap-md-3 gap-lg-4">
                <div class="d-flex align-items-center gap-4 me-4">
                  <div class="avatar">
                    <div class="avatar-initial rounded bg-label-primary">
                      <i class="ri-checkbox-circle-line ri-24px"></i>
                    </div>
                  </div>
                  <div>
                    <h5 class="mb-0">{{ serviceStats.active }}</h5>
                    <span class="text-muted">Active</span>
                  </div>
                </div>
                <div class="d-flex align-items-center gap-4">
                  <div class="avatar">
                    <div class="avatar-initial rounded bg-label-warning">
                      <i class="ri-pause-circle-line ri-24px"></i>
                    </div>
                  </div>
                  <div>
                    <h5 class="mb-0">{{ serviceStats.suspended }}</h5>
                    <span class="text-muted">Suspended</span>
                  </div>
                </div>
              </div>

              <h5 class="pb-4 border-bottom mb-4">Details</h5>
              <div class="info-container">
                <ul class="list-unstyled mb-6">
                  <li class="mb-2">
                    <span class="h6 me-1">Kode:</span>
                    <span>{{ customer.code || '—' }}</span>
                  </li>
                  <li class="mb-2">
                    <span class="h6 me-1">Email:</span>
                    <span>{{ customer.email || '—' }}</span>
                  </li>
                  <li class="mb-2">
                    <span class="h6 me-1">Telepon:</span>
                    <span>{{ customer.phone || '—' }}</span>
                  </li>
                  <li class="mb-2">
                    <span class="h6 me-1">Tipe:</span>
                    <span>{{ typeLabel(customer.type) }}</span>
                  </li>
                  <li class="mb-2">
                    <span class="h6 me-1">NPWP:</span>
                    <span>{{ customer.npwp || '—' }}</span>
                  </li>
                  <li class="mb-2">
                    <span class="h6 me-1">KTP:</span>
                    <span>{{ customer.ktp || '—' }}</span>
                  </li>
                  <li class="mb-2">
                    <span class="h6 me-1">Alamat:</span>
                    <span>{{ customer.address || '—' }}</span>
                  </li>
                </ul>
                <div class="d-flex justify-content-center gap-2">
                  <NuxtLink to="/sales/customer" class="btn btn-primary">
                    <i class="ri-arrow-left-line me-1"></i> Kembali
                  </NuxtLink>
                  <NuxtLink
                    :to="`/service-management/customer-service`"
                    class="btn btn-outline-primary"
                  >
                    Customer Service
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-6">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <span class="badge bg-label-primary mb-2">Layanan</span>
                  <h5 class="mb-0">Ringkasan Service</h5>
                </div>
                <div class="text-end">
                  <h4 class="mb-0">{{ serviceStats.total }}</h4>
                  <small class="text-muted">total instance</small>
                </div>
              </div>
              <ul class="list-unstyled mb-4">
                <li class="d-flex align-items-center mb-2">
                  <i class="ri-checkbox-circle-fill text-success me-2"></i>
                  <span>{{ serviceStats.active }} Active</span>
                </li>
                <li class="d-flex align-items-center mb-2">
                  <i class="ri-pause-circle-fill text-warning me-2"></i>
                  <span>{{ serviceStats.suspended }} Suspended</span>
                </li>
                <li class="d-flex align-items-center mb-2">
                  <i class="ri-close-circle-fill text-secondary me-2"></i>
                  <span>{{ serviceStats.terminated }} Terminated</span>
                </li>
                <li class="d-flex align-items-center">
                  <i class="ri-bill-line text-primary me-2"></i>
                  <span>Outstanding {{ formatMoney(serviceStats.outstanding) }}</span>
                </li>
              </ul>
              <div class="d-grid">
                <button type="button" class="btn btn-primary" @click="openServices">
                  Lihat Services
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: tabs + content -->
        <div class="col-xl-8 col-lg-7 col-md-7">
          <div class="nav-align-top mb-6">
            <ul class="nav nav-pills flex-column flex-md-row mb-6 gap-2 gap-md-0">
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link"
                  :class="{ active: tab === 'info' }"
                  @click="tab = 'info'"
                >
                  <i class="ri-user-3-line me-1_5"></i>
                  <span class="d-none d-sm-inline-block">Info</span>
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link"
                  :class="{ active: tab === 'services' }"
                  @click="openServices"
                >
                  <i class="ri-server-line me-1_5"></i>
                  <span class="d-none d-sm-inline-block">Services</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Info tab -->
          <div v-if="tab === 'info'" class="card mb-6">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Informasi Customer</h5>
            </div>
            <div class="card-body">
              <div class="row g-4">
                <div class="col-md-6">
                  <label class="form-label text-muted mb-1">Nama</label>
                  <p class="mb-0 fw-medium">{{ customer.name }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted mb-1">Kode</label>
                  <p class="mb-0 fw-medium">{{ customer.code || '—' }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted mb-1">Email</label>
                  <p class="mb-0">{{ customer.email || '—' }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted mb-1">Telepon</label>
                  <p class="mb-0">{{ customer.phone || '—' }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted mb-1">NPWP</label>
                  <p class="mb-0">{{ customer.npwp || '—' }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted mb-1">KTP</label>
                  <p class="mb-0">{{ customer.ktp || '—' }}</p>
                </div>
                <div class="col-12">
                  <label class="form-label text-muted mb-1">Alamat</label>
                  <p class="mb-0">{{ customer.address || '—' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Services tab -->
          <div v-if="tab === 'services'" class="card mb-6">
            <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h5 class="card-title mb-0">Service List</h5>
              <div class="d-flex align-items-center gap-2">
                <span class="p-input-icon-left">
                  <InputText
                    v-model="serviceSearch"
                    placeholder="Cari service..."
                    class="w-full md:w-15rem"
                  />
                </span>
              </div>
            </div>
            <div class="card-datatable table-responsive">
              <div v-if="servicesLoading" class="p-4 text-muted">Memuat layanan...</div>
              <div v-else-if="servicesError" class="p-4 text-danger">{{ servicesError }}</div>
              <table v-else class="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>No. Service</th>
                    <th>Product</th>
                    <th>Subscription</th>
                    <th>Status</th>
                    <th>Activated</th>
                    <th>Suspended</th>
                    <th>Outstanding</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in filteredServices" :key="row.id">
                    <td class="text-nowrap fw-medium">
                      {{ row.serviceNumber || row.service_number }}
                    </td>
                    <td>
                      {{ row.serviceName || row.service_name || '—' }}
                      <small class="d-block text-muted">{{
                        row.planName || row.plan_name || ''
                      }}</small>
                    </td>
                    <td>
                      {{
                        row.subscription?.noSubscription ||
                        row.subscription?.no_subscription ||
                        '—'
                      }}
                    </td>
                    <td>
                      <span :class="statusBadgeClass(row.status || '')">
                        {{ getStatusLabel(row.status || '') }}
                      </span>
                    </td>
                    <td>{{ formatDateId(row.activatedAt || row.activated_at) }}</td>
                    <td>{{ formatDateId(row.suspendedAt || row.suspended_at) }}</td>
                    <td>{{ formatMoney(row.outstanding ?? 0) }}</td>
                    <td>
                      <NuxtLink
                        class="btn btn-sm btn-icon btn-text-secondary rounded-pill"
                        :to="`/service-management/${row.id}`"
                        title="Detail"
                      >
                        <i class="ri-eye-line"></i>
                      </NuxtLink>
                    </td>
                  </tr>
                  <tr v-if="!filteredServices.length">
                    <td colspan="8" class="text-center text-muted py-4">
                      Belum ada Service Instance
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Activity timeline (from loaded services) -->
          <div v-if="tab === 'info'" class="card mb-6">
            <div class="card-header">
              <h5 class="card-title mb-0">Service Activity</h5>
            </div>
            <div class="card-body pt-1">
              <ul v-if="activityItems.length" class="timeline mb-0">
                <li
                  v-for="(item, idx) in activityItems"
                  :key="idx"
                  class="timeline-item timeline-item-transparent"
                >
                  <span :class="['timeline-point', item.pointClass]"></span>
                  <div class="timeline-event">
                    <div class="timeline-header mb-1">
                      <h6 class="mb-0">{{ item.title }}</h6>
                      <small class="text-muted">{{ item.date }}</small>
                    </div>
                    <p class="mb-0 text-muted">{{ item.subtitle }}</p>
                  </div>
                </li>
              </ul>
              <p v-else class="text-muted mb-0">
                Belum ada aktivitas layanan. Buka tab Services untuk memuat data.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="alert alert-danger" role="alert">Customer tidak ditemukan.</div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCustomerStore } from '~/stores/customer'
import { storeToRefs } from 'pinia'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import { useServiceInstanceStore } from '~/stores/service-instances'

const { setDetailTitle } = useDynamicTitle()
const { getCustomerLogo, handleImageError } = useImageUrl()

const route = useRoute()
const customerStore = useCustomerStore()
const customerId = route.query.id
const serviceStore = useServiceInstanceStore()

const { selectedCustomer: customer, loading } = storeToRefs(customerStore)
const tab = ref<'info' | 'services'>('info')
const services = ref<any[]>([])
const servicesLoading = ref(false)
const servicesError = ref<string | null>(null)
const serviceSearch = ref('')
const servicesLoaded = ref(false)

const serviceStats = computed(() => {
  const rows = services.value
  return {
    total: rows.length,
    active: rows.filter((r) => r.status === 'active').length,
    suspended: rows.filter((r) => r.status === 'suspended').length,
    terminated: rows.filter((r) => r.status === 'terminated').length,
    outstanding: rows.reduce((sum, r) => sum + (Number(r.outstanding) || 0), 0),
  }
})

const filteredServices = computed(() => {
  const q = serviceSearch.value.trim().toLowerCase()
  if (!q) return services.value
  return services.value.filter((row) => {
    const hay = [
      row.serviceNumber || row.service_number,
      row.serviceName || row.service_name,
      row.planName || row.plan_name,
      row.subscription?.noSubscription || row.subscription?.no_subscription,
      row.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

const activityItems = computed(() => {
  return [...services.value]
    .map((row) => {
      const activated = row.activatedAt || row.activated_at
      const suspended = row.suspendedAt || row.suspended_at
      const number = row.serviceNumber || row.service_number
      const name = row.serviceName || row.service_name || number
      if (row.status === 'suspended' && suspended) {
        return {
          title: 'Service Suspended',
          subtitle: `${number} · ${name}`,
          date: formatDateId(suspended),
          pointClass: 'timeline-point-warning',
          sortAt: new Date(suspended).getTime(),
        }
      }
      if (activated) {
        return {
          title: 'Service Activated',
          subtitle: `${number} · ${name}`,
          date: formatDateId(activated),
          pointClass: 'timeline-point-success',
          sortAt: new Date(activated).getTime(),
        }
      }
      return {
        title: 'Service Instance',
        subtitle: `${number} · ${row.status || ''}`,
        date: formatDateId(row.createdAt || row.created_at),
        pointClass: 'timeline-point-primary',
        sortAt: new Date(row.createdAt || row.created_at || 0).getTime(),
      }
    })
    .sort((a, b) => b.sortAt - a.sortAt)
    .slice(0, 8)
})

function formatDateId(value: string | Date | null | undefined) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatMoney(v: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(v) || 0)
}

function statusBadgeClass(status: string) {
  if (status === 'active') return 'badge bg-label-success'
  if (status === 'suspended') return 'badge bg-label-warning'
  if (status === 'terminated') return 'badge bg-label-secondary'
  return 'badge bg-label-primary'
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    active: 'Active',
    suspended: 'Suspended',
    terminated: 'Terminated',
    pending_activation: 'Pending',
  }
  return map[status] ?? status
}

function typeLabel(type?: string | null) {
  if (!type) return 'Customer'
  const map: Record<string, string> = {
    prospect: 'Prospect',
    regular: 'Regular',
    vip: 'VIP',
  }
  return map[type] ?? type
}

function typeBadgeClass(type?: string | null) {
  if (type === 'vip') return 'bg-label-warning'
  if (type === 'prospect') return 'bg-label-info'
  if (type === 'regular') return 'bg-label-success'
  return 'bg-label-primary'
}

async function loadServices() {
  if (!customerId) return
  servicesLoading.value = true
  servicesError.value = null
  try {
    services.value = await serviceStore.fetchByCustomer(customerId as string)
    servicesLoaded.value = true
  } catch (e: any) {
    servicesError.value = e.message
    services.value = []
  } finally {
    servicesLoading.value = false
  }
}

async function openServices() {
  tab.value = 'services'
  if (!servicesLoaded.value) await loadServices()
}

onMounted(async () => {
  if (customerId) {
    await customerStore.getCustomerDetails(customerId as string)
    await loadServices()
  }
  setDetailTitle('Customer', customer.value?.name ?? '')
})
</script>
