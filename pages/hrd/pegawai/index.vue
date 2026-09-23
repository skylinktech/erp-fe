<template>
  <div>
    <!-- Content wrapper -->
    <div class="content-wrapper">
         <!-- Content -->
 
            <div class="container-xxl flex-grow-1">
                
                <p class="mb-6">
                List pegawai yang terdaftar di sistem
                </p>
                <ListPageStatsCards :items="statItems" />

                <div class="row g-6">
                    <div class="col-12">
                        <h4 class="mt-6 mb-1">Filter Pegawai</h4>
                        <p class="mb-0">Cari dan kelola data pegawai perusahaan Anda</p>
                    </div>
                    <div class="col-12">
                        <!-- pegawai Table -->
                        <div class="card">
                            <ListPageTableHeader
                                :rows="Number(params.rows)"
                                :rows-options="rowsPerPageOptionsArray"
                                :search="globalFilterValue"
                                search-placeholder="Cari pegawai..."
                                :export-disabled="loading"
                                :export-items="[{ value: 'excel', label: 'Excel' }, { value: 'pdf', label: 'PDF' }]"
                                @update:rows="onPegawaiToolbarRows"
                                @update:search="(v) => { globalFilterValue = v }"
                                @export="exportData"
                            >
                                <template #add>
                                    <button
                                        v-if="userHasRole('superadmin') || userHasPermission('create_pegawai')"
                                        type="button"
                                        class="btn btn-primary"
                                        @click="goToCreatePegawaiForm"
                                    >
                                        <i class="ri-add-line me-1"></i>
                                        Tambah
                                    </button>
                                </template>
                            </ListPageTableHeader>
                            <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable 
                                ref="myDataTableRef"
                                :data="pegawais" 
                                :rows="Number(params.rows)" 
                                :loading="loading"
                                :totalRecords="totalRecords"
                            :first="params.first"
                                :lazy="true"
                                @page="onPage($event)"
                                @sort="onSort($event)"
                                responsiveLayout="scroll" 
                                paginatorPosition="bottom"
                                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                                >
                                <Column field="id_pegawai" header="#" :sortable="true" style="width:5%"></Column> 
                                <Column field="avatar" header="Avatar" :sortable="true" style="width:8%">
                                    <template #body="slotProps">
                                        <div v-if="slotProps.data.avatar">
                                            <img 
                                                :src="getUserAvatar(slotProps.data.avatar)" 
                                                alt="Avatar Pegawai" 
                                                style="height: 40px; width: 40px; object-fit: cover; border-radius: 50%;" 
                                                @error="(e) => handleImageError(e, '/img/default-avatar.png')"
                                            />
                                        </div>
                                        <div v-else>
                                            <img 
                                                src="/img/default-avatar.png" 
                                                alt="Default Avatar" 
                                                style="height: 40px; width: 40px; object-fit: cover; border-radius: 50%;"
                                            />
                                        </div>
                                    </template>
                                </Column>
                                <Column field="nm_pegawai" header="Nama Pegawai" :sortable="true" style="width:15%">
                                    <template #body="slotProps">
                                        <NuxtLink
                                            :to="`/hrd/pegawai/profile/${slotProps.data.id_pegawai}`"
                                            class="text-primary fw-medium text-decoration-none pegawai-name-link"
                                        >
                                            {{ slotProps.data.nm_pegawai || '-' }}
                                        </NuxtLink>
                                    </template>
                                </Column>
                                <Column field="username" header="Username" :sortable="true" style="width:12%"></Column>
                                <Column field="email" sortField="users.email" header="Email" :sortable="true" style="width:15%"></Column>
                                <Column field="tmp_lahir_pegawai" header="Tempat Lahir" :sortable="true" style="width:12%"></Column>
                                <Column field="tgl_lahir_pegawai" header="Tanggal Lahir" :sortable="true" style="width:10%">
                                    <template #body="slotProps">
                                        {{ slotProps.data.tgl_lahir_pegawai ? new Date(slotProps.data.tgl_lahir_pegawai).toLocaleDateString() : '-' }}
                                    </template>
                                </Column>
                                <Column field="alamat_pegawai" header="Alamat" :sortable="true" style="width:18%">
                                    <template #body="{ data }">
                                        <span class="text-nowrap" :title="data.alamat_pegawai || ''">
                                            {{ truncateWords(data.alamat_pegawai, 5) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="status_pegawai" header="Status" :sortable="true" style="width:8%">
                                    <template #body="slotProps">
                                        <span >
                                            {{ getStatusPegawaiBadge(slotProps.data.status_pegawai).text }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="kontrak_aktif" header="Kontrak Aktif" :sortable="false" style="width:12%">
                                    <template #body="slotProps">
                                        <span :class="getKontrakAktifDisplay(slotProps.data.kontrak_aktif).class">
                                            {{ getKontrakAktifDisplay(slotProps.data.kontrak_aktif).text }}
                                        </span>
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                <template #body="slotProps">
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
                                        aria-haspopup="true"
                                        aria-controls="pegawai-actions-menu"
                                        @click.stop="toggleActions($event, slotProps.data)"
                                    >
                                        <i class="ri-more-2-fill"></i>
                                    </button>
                                </template>
                            </Column>
                            </MyDataTable>
                            </div>
                        </div>
                        <!--/ pegawai Table -->
                    </div>
                </div>
            </div>
            <!-- / Content -->
        <div class="content-backdrop fade"></div>
    </div>

    <Menu
      id="pegawai-actions-menu"
      ref="actionsMenuRef"
      :model="actionMenuItems"
      :popup="true"
      append-to="body"
    />
     <!-- Content wrapper -->
 </div>
 </template>
 
<script setup lang="ts">
import { navigateTo } from '#app'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import { getStatusPegawaiBadge, getKontrakAktifDisplay } from '~/constants/hrd/pegawaiForm'
import { usePegawaiStore } from '~/stores/pegawai'
import { useUserStore } from '~/stores/user'
import { usePermissions } from '~/composables/usePermissions'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import ListPageStatsCards, { type ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'

type PegawaiRow = {
  id_pegawai: number
  nm_pegawai?: string
}

const pegawaiStore = usePegawaiStore()
const userStore = useUserStore()
const { userHasPermission, userHasRole } = usePermissions()

const { pegawais, loading, totalRecords, params, stats } = storeToRefs(pegawaiStore)

const statItems = computed<ListPageStatItem[]>(() => [
  {
    key: 'total-pegawai',
    label: 'Total Pegawai',
    value: stats.value?.total ?? 0,
    subtitle: 'Pegawai terdaftar',
    icon: 'ri-team-line',
    iconBgClass: 'bg-label-primary',
    info: {
      title: 'Jumlah Keseluruhan',
      description: 'Jumlah keseluruhan data Pegawai yang terdaftar dalam sistem berdasarkan statistik API.',
    },
  },
  {
    key: 'pkwtt',
    label: 'PKWTT',
    value: stats.value?.pkwtt ?? 0,
    subtitle: 'Pegawai PKWTT',
    icon: 'ri-briefcase-line',
    iconBgClass: 'bg-label-success',
    info: {
      title: 'PKWTT',
      description: 'Jumlah pegawai dengan status kontrak kerja PKWTT (Perjanjian Kerja Waktu Tidak Tertentu / karyawan tetap).',
    },
  },
  {
    key: 'pkwt',
    label: 'PKWT',
    value: stats.value?.pkwt ?? 0,
    subtitle: 'Pegawai PKWT',
    icon: 'ri-time-line',
    iconBgClass: 'bg-label-info',
    info: {
      title: 'PKWT',
      description: 'Jumlah pegawai dengan status kontrak kerja PKWT (Perjanjian Kerja Waktu Tertentu / karyawan kontrak).',
    },
  },
  {
    key: 'freelance',
    label: 'Freelance',
    value: stats.value?.freelance ?? 0,
    subtitle: 'Freelance',
    icon: 'ri-user-star-line',
    iconBgClass: 'bg-label-warning',
    info: {
      title: 'Freelance',
      description: 'Ringkasan metrik "Freelance" pada daftar Pegawai berdasarkan data statistik yang disediakan API/store.',
    },
  },
  {
    key: 'resign',
    label: 'Resign',
    value: stats.value?.resign ?? 0,
    subtitle: 'Resign',
    icon: 'ri-user-unfollow-line',
    iconBgClass: 'bg-label-danger',
    info: {
      title: 'Resign',
      description: 'Ringkasan metrik "Resign" pada daftar Pegawai berdasarkan data statistik yang disediakan API/store.',
    },
  }
])

const myDataTableRef = ref(null)

const { setListTitle } = useDynamicTitle()
const { getUserAvatar, handleImageError } = useImageUrl()

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

function goToCreatePegawaiForm() {
    void navigateTo('/hrd/pegawai/form')
}

function goToEditPegawaiForm(row: { id_pegawai: number }) {
    void navigateTo(`/hrd/pegawai/form/${row.id_pegawai}`)
}

function goToPegawaiProfile(row: { id_pegawai: number }) {
    void navigateTo(`/hrd/pegawai/profile/${row.id_pegawai}`)
}

function truncateWords(text: string | null | undefined, maxWords = 5): string {
    const value = String(text || '').trim()
    if (!value) return '-'
    const words = value.split(/\s+/).filter(Boolean)
    if (words.length <= maxWords) return value
    return `${words.slice(0, maxWords).join(' ')} ...`
}

const actionsMenuRef = ref<InstanceType<typeof Menu> | null>(null)
const activeRow = ref<PegawaiRow | null>(null)

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items: Array<Record<string, unknown>> = []

  if (userHasRole('superadmin') || userHasPermission('view_pegawai') || userHasPermission('show_pegawai')) {
    items.push({
      label: 'Lihat Profil',
      icon: 'ri ri-user-line',
      command: () => goToPegawaiProfile(row),
    })
  }
  if (userHasRole('superadmin') || userHasPermission('edit_pegawai')) {
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => goToEditPegawaiForm(row),
    })
  }
  if (userHasRole('superadmin') || userHasPermission('delete_pegawai')) {
    if (items.length) items.push({ separator: true })
    items.push({
      label: 'Hapus',
      icon: 'ri ri-delete-bin-7-line',
      class: 'pegawai-menu-danger',
      command: () => pegawaiStore.deletePegawai(row.id_pegawai),
    })
  }

  return items
})

function toggleActions(event: MouseEvent, row: PegawaiRow) {
  activeRow.value = row
  nextTick(() => actionsMenuRef.value?.toggle(event))
}

onMounted(() => {
    pegawaiStore.fetchPegawais()
    pegawaiStore.fetchStats()
    userStore.loadUser()
    setListTitle('Pegawai', pegawais.value.length)
})

const debouncedSearch = useDebounceFn(() => {
    pegawaiStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

const onPage = (event: unknown) => {
    pegawaiStore.setPagination(event)
}

const onPegawaiToolbarRows = (v: number) => {
    params.value.rows = Number(v) || 10
    params.value.first = 0
    pegawaiStore.fetchPegawais()
}

const onSort = (event: unknown) => {
    pegawaiStore.setSort(event)
}

const exportData = (format: string) => {
    if (format === 'excel' || format === 'csv') {
        myDataTableRef.value?.exportCSV()
        return
    }
    if (format === 'pdf') {
        useToast().info({
            title: 'Info',
            message: 'Export PDF akan tersedia pada rilis berikutnya.',
            color: 'blue',
            position: 'bottomRight',
            layout: 2,
        })
    }
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Pegawai',
  description: 'Employee Management',
  keywords: 'Pegawai, Employee, HRD, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});

</script>

<style scoped>
.pegawai-name-link {
  cursor: pointer;
  transition: color 0.15s ease-in-out;
}
.pegawai-name-link:hover {
  text-decoration: underline !important;
  color: var(--bs-link-hover-color, #0081d4);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-body {
    padding: 16px;
  }
  
  .form-label {
    font-size: 13px;
    margin-bottom: 6px;
  }
}

@media (max-width: 576px) {
  .card-body {
    padding: 12px;
  }
}

:deep(.pegawai-menu-danger .p-menuitem-link) {
  color: var(--bs-danger) !important;
}
</style>
