<template>
  <div class="col-12">
    <div class="card">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h5 class="mb-1">
            <i class="ri-team-line me-1 text-warning"></i>
            Saldo Cuti Tahunan & Cuti Bersama
          </h5>
          <p class="mb-0 small text-muted">
            Ringkasan jatah cuti tahunan setelah potongan cuti bersama perusahaan.
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <label class="small text-muted mb-0" for="cuti-summary-tahun">Tahun</label>
          <select
            id="cuti-summary-tahun"
            v-model.number="selectedTahun"
            class="form-select form-select-sm"
            style="width: 6rem"
            :disabled="loading"
            @change="onTahunChange"
          >
            <option v-for="y in tahunOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <p class="text-muted small mt-2 mb-0">Memuat ringkasan cuti tahunan...</p>
        </div>

        <div v-else-if="!summary" class="text-center py-4 text-muted">
          <i class="ri-user-unfollow-line ri-24px d-block mb-2"></i>
          <p class="mb-0 small">
            Ringkasan cuti tahunan tidak tersedia. Pastikan akun Anda terhubung ke data pegawai.
          </p>
        </div>

        <template v-else>
          <div class="pb-8 pt-5 mb-6">
            <div class="row g-3">
            <div class="col-sm-6 col-xl-3">
              <div class="border rounded p-3 h-100">
                <div class="text-muted small">Jatah Tahunan</div>
                <div class="fs-4 fw-semibold">{{ summary.jatah_tahunan }}</div>
                <div class="text-muted small">hari</div>
              </div>
            </div>
            <div class="col-sm-6 col-xl-3">
              <div class="border rounded p-3 h-100 border-warning-subtle bg-label-warning">
                <div class="text-muted small">Cuti Bersama</div>
                <div class="fs-4 fw-semibold text-warning">-{{ summary.cuti_bersama_total }}</div>
                <div class="text-muted small">hari dipotong</div>
              </div>
            </div>
            <div class="col-sm-6 col-xl-3">
              <div class="border rounded p-3 h-100">
                <div class="text-muted small">Cuti Diambil</div>
                <div class="fs-4 fw-semibold">-{{ summary.cuti_pengajuan_terpakai }}</div>
                <div class="text-muted small">hari (pengajuan disetujui)</div>
              </div>
            </div>
            <div class="col-sm-6 col-xl-3">
              <div class="border rounded p-3 h-100 border-success-subtle bg-label-success">
                <div class="text-muted small">Sisa Cuti</div>
                <div class="fs-4 fw-semibold text-success">{{ summary.sisa_jatah_cuti }}</div>
                <div class="text-muted small">hari tersedia</div>
              </div>
            </div>
            </div>
          </div>

          <div class="border-top pt-6">
            <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0">Breakdown Cuti Bersama</h6>
            <NuxtLink
              v-if="canViewKalender"
              to="/hrd/kalender"
              class="btn btn-sm btn-outline-secondary"
            >
              <i class="ri-calendar-line me-1"></i>
              Lihat Kalender HR
            </NuxtLink>
          </div>

          <div v-if="!summary.breakdown.length" class="text-center py-4 text-muted border rounded">
            <i class="ri-calendar-check-line ri-24px d-block mb-2"></i>
            <p class="mb-0 small">Belum ada cuti bersama yang memotong saldo cuti tahunan pada tahun {{ summary.tahun }}.</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th style="width: 5%">#</th>
                  <th>Nama Event</th>
                  <th style="width: 22%">Rentang</th>
                  <th class="text-end" style="width: 10%">Hari</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in summary.breakdown" :key="item.hr_calendar_event_id">
                  <td class="text-muted">{{ idx + 1 }}</td>
                  <td class="fw-medium">{{ item.nama }}</td>
                  <td class="text-nowrap">
                    {{ formatRangeTanggal(item.tanggal_mulai, item.tanggal_selesai) }}
                  </td>
                  <td class="text-end">
                    <span class="badge bg-label-warning">-{{ item.hari }} hari</span>
                  </td>
                </tr>
              </tbody>
              <tfoot class="table-light">
                <tr>
                  <th colspan="3" class="text-end">Total Cuti Bersama</th>
                  <th class="text-end text-warning">-{{ summary.cuti_bersama_total }} hari</th>
                </tr>
              </tfoot>
            </table>
          </div>

          <p class="small text-muted mt-3 mb-0">
            <i class="ri-information-line me-1"></i>
            Cuti bersama otomatis mengurangi jatah cuti tahunan (CT).
            Sisa {{ summary.sisa_jatah_cuti }} hari = jatah {{ summary.jatah_tahunan }}
            − cuti bersama {{ summary.cuti_bersama_total }}
            − cuti diambil {{ summary.cuti_pengajuan_terpakai }}.
          </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCutiStore } from '~/stores/cuti'
import { usePermissions } from '~/composables/usePermissions'
import { formatRangeTanggal } from '~/constants/hrd/cutiForm'

const props = defineProps<{
  pegawaiId?: number | null
}>()

const store = useCutiStore()
const { userHasPermission, userHasRole } = usePermissions()
const { cutiTahunanSummary: summary, cutiTahunanSummaryLoading: loading, cutiTahunanSummaryTahun } =
  storeToRefs(store)

const currentYear = new Date().getFullYear()
const selectedTahun = ref(cutiTahunanSummaryTahun.value || currentYear)

const tahunOptions = computed(() => [currentYear - 1, currentYear, currentYear + 1])

const canViewKalender = computed(
  () => userHasRole('superadmin') || userHasPermission('view_kalender')
)

function reload() {
  void store.fetchCutiTahunanSummary(selectedTahun.value, props.pegawaiId ?? null)
}

function onTahunChange() {
  reload()
}

watch(
  () => props.pegawaiId,
  () => reload()
)

onMounted(() => {
  reload()
})
</script>
