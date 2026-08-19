<template>
  <div class="pegawai-profile-panel">
<!-- Header card: avatar + nama + status -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="d-flex flex-column flex-md-row gap-4 align-items-center align-items-md-start">
              <div class="position-relative">
                <img
                  :src="getUserAvatar(profile.pegawai.avatar)"
                  alt="Avatar"
                  class="rounded-circle"
                  style="width: 96px; height: 96px; object-fit: cover; border: 3px solid var(--bs-border-color);"
                  @error="(e) => handleImageError(e, '/img/default-avatar.png')"
                />
              </div>
              <div class="flex-grow-1 text-center text-md-start">
                <h4 class="mb-1">{{ profile.pegawai.nm_pegawai || '-' }}</h4>
                <div class="text-muted small mb-4">
                  <span class="badge rounded-pill bg-label-dark fw-bold">{{ profile.current_jabatan?.jabatan?.nama || 'Belum ada jabatan' }}</span>
                  <template v-if="profile.current_jabatan?.perusahaan?.nama">
                    · {{ profile.current_jabatan.perusahaan.nama }}
                  </template>
                </div>
                <div class="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                  <span :class="getStatusPegawaiBadge(profile.pegawai.status_pegawai).class">
                    {{ getStatusPegawaiBadge(profile.pegawai.status_pegawai).text }}
                  </span>
                  <span :class="getKontrakAktifDisplay(profile.kontrak_aktif).class">
                    {{ getKontrakAktifDisplay(profile.kontrak_aktif).text }}
                  </span>
                  <span v-if="profile.masa_kerja?.total_bulan != null" class="badge rounded-pill bg-label-secondary">
                    Masa kerja: {{ formatMasaKerja(profile.masa_kerja.total_bulan) }}
                  </span>
                </div>
              </div>
              <div class="d-flex flex-column align-items-center align-items-md-end text-muted small gap-1">
                <div v-if="profile.pegawai.nik_pegawai"><span class="me-1">NIK:</span><span class="fw-medium">{{ profile.pegawai.nik_pegawai }}</span></div>
                <div v-if="profile.pegawai.user?.email"><i class="ri-mail-line me-1"></i>{{ profile.pegawai.user.email }}</div>
                <div v-if="profile.pegawai.no_tlp_pegawai"><i class="ri-phone-line me-1"></i>{{ profile.pegawai.no_tlp_pegawai }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">

          <!-- Kolom kiri: Informasi Pribadi (tabbed: Pribadi / Perusahaan / Keluarga / BPJS) -->
          <div class="col-lg-7">
            <div class="card mb-4">
              <div class="card-header pt-5">
                <ul class="nav nav-tabs profile-info-tabs mb-3" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link active"
                      data-bs-toggle="tab"
                      :data-bs-target="`#${tab('tab-pribadi')}`"
                      type="button"
                      role="tab"
                      aria-selected="true"
                    >
                      <i class="ri-user-line me-1"></i>
                      <span class="d-none d-sm-inline">Informasi Pribadi</span>
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      data-bs-toggle="tab"
                      :data-bs-target="`#${tab('tab-perusahaan')}`"
                      type="button"
                      role="tab"
                      aria-selected="false"
                    >
                      <i class="ri-building-2-line me-1"></i>
                      <span class="d-none d-sm-inline">Perusahaan</span>
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      data-bs-toggle="tab"
                      :data-bs-target="`#${tab('tab-keluarga')}`"
                      type="button"
                      role="tab"
                      aria-selected="false"
                    >
                      <i class="ri-group-line me-1"></i>
                      <span class="d-none d-sm-inline">Keluarga</span>
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      data-bs-toggle="tab"
                      :data-bs-target="`#${tab('tab-bpjs')}`"
                      type="button"
                      role="tab"
                      aria-selected="false"
                    >
                      <i class="ri-shield-check-line me-1"></i>
                      <span class="d-none d-sm-inline">BPJS</span>
                    </button>
                  </li>
                </ul>

                <div class="tab-content">
                  <!-- Tab 1: Informasi Pribadi -->
                  <div :id="tab('tab-pribadi')" class="tab-pane fade show active" role="tabpanel">
                    <div v-for="(block, bIdx) in personalBlocks" :key="`pb-${bIdx}`" class="profile-dl-block">
                      <dl class="profile-dl profile-dl-col mb-0">
                        <ProfileField v-for="(f, i) in block.left" :key="`l-${i}`" :label="f.label" :value="f.value" :value-badge="f.valueBadge" />
                      </dl>
                      <dl class="profile-dl profile-dl-col mb-0">
                        <ProfileField v-for="(f, i) in block.right" :key="`r-${i}`" :label="f.label" :value="f.value" :value-badge="f.valueBadge" />
                      </dl>
                    </div>
                  </div>

                  <!-- Tab 2: Informasi Perusahaan -->
                  <div :id="tab('tab-perusahaan')" class="tab-pane fade" role="tabpanel">
                    <template v-if="profile.current_jabatan">
                      <div v-for="(block, bIdx) in perusahaanBlocks" :key="`cb-${bIdx}`" class="profile-dl-block">
                        <dl class="profile-dl profile-dl-col mb-0">
                          <ProfileField v-for="(f, i) in block.left" :key="`l-${i}`" :label="f.label" :value="f.value" :value-badge="f.valueBadge" />
                        </dl>
                        <dl class="profile-dl profile-dl-col mb-0">
                          <ProfileField v-for="(f, i) in block.right" :key="`r-${i}`" :label="f.label" :value="f.value" :value-badge="f.valueBadge" />
                        </dl>
                      </div>
                    </template>
                    <div v-else class="text-muted small">Belum ada data jabatan aktif.</div>
                  </div>

                  <!-- Tab 3: Informasi Keluarga -->
                  <div :id="tab('tab-keluarga')" class="tab-pane fade" role="tabpanel">
                    <div v-for="(block, bIdx) in keluargaBlocks" :key="`fb-${bIdx}`" class="profile-dl-block">
                      <dl class="profile-dl profile-dl-col mb-0">
                        <ProfileField v-for="(f, i) in block.left" :key="`l-${i}`" :label="f.label" :value="f.value" :value-badge="f.valueBadge" />
                      </dl>
                      <dl class="profile-dl profile-dl-col mb-0">
                        <ProfileField v-for="(f, i) in block.right" :key="`r-${i}`" :label="f.label" :value="f.value" :value-badge="f.valueBadge" />
                      </dl>
                    </div>
                  </div>

                  <!-- Tab 4: BPJS + Dokumen -->
                  <div :id="tab('tab-bpjs')" class="tab-pane fade" role="tabpanel">
                    <div v-for="(block, bIdx) in bpjsBlocks" :key="`bb-${bIdx}`" class="profile-dl-block mb-3">
                      <dl class="profile-dl profile-dl-col mb-0">
                        <ProfileField v-for="(f, i) in block.left" :key="`l-${i}`" :label="f.label" :value="f.value" :value-badge="f.valueBadge" />
                      </dl>
                      <dl class="profile-dl profile-dl-col mb-0">
                        <ProfileField v-for="(f, i) in block.right" :key="`r-${i}`" :label="f.label" :value="f.value" :value-badge="f.valueBadge" />
                      </dl>
                    </div>
                    <div class="text-muted small fw-bold mb-2">Dokumen Pendukung</div>
                    <div class="row g-3">
                      <DocumentLink label="Curriculum Vitae" :path="profile.pegawai.cv_attachment" />
                      <DocumentLink label="Kartu Keluarga" :path="profile.pegawai.kk_attachment" />
                      <DocumentLink label="Ijazah" :path="profile.pegawai.ijazah_attachment" />
                      <DocumentLink label="SKCK" :path="profile.pegawai.skck_attachment" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Kolom kanan: Kontrak Aktif & Periode -->
          <div class="col-lg-5">
            <div class="card mb-4">
              <div class="card-header pt-5">
                <ul v-if="showRightTabs" class="nav nav-tabs profile-info-tabs mb-3" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link active"
                      data-bs-toggle="tab"
                      :data-bs-target="`#${tab('tab-kontrak')}`"
                      type="button"
                      role="tab"
                      aria-selected="true"
                    >
                      <i class="ri-draft-line me-1"></i>
                      <span>Kontrak</span>
                    </button>
                  </li>
                  <li v-if="canViewCutiModule" class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      data-bs-toggle="tab"
                      :data-bs-target="`#${tab('tab-cuti')}`"
                      type="button"
                      role="tab"
                      aria-selected="false"
                    >
                      <i class="ri-calendar-todo-line me-1"></i>
                      <span>Cuti</span>
                    </button>
                  </li>
                  <li v-if="canViewPayslipTab" class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      data-bs-toggle="tab"
                      :data-bs-target="`#${tab('tab-payslip')}`"
                      type="button"
                      role="tab"
                      aria-selected="false"
                      @click="activatePayslipTab"
                    >
                      <i class="ri-money-dollar-circle-line me-1"></i>
                      <span>Payslip</span>
                    </button>
                  </li>
                </ul>
                <div :class="showRightTabs ? 'tab-content' : undefined">
                  <div
                    :id="showRightTabs ? tab('tab-kontrak') : undefined"
                    :class="showRightTabs ? 'tab-pane fade show active' : undefined"
                    :role="showRightTabs ? 'tabpanel' : undefined"
                  >
                    <template v-if="profile.kontrak_aktif">
                      <dl class="profile-dl mb-0">
                        <ProfileField label="Jenis Kontrak" :value="getJenisKontrakPegawaiLabel(profile.kontrak_aktif.jenis_kontrak)" />
                        <ProfileField label="Nomor SK" :value="profile.kontrak_aktif.nomor_kontrak" />
                        <ProfileField label="Tgl. Mulai" :value="formatTanggalDisplay(profile.kontrak_aktif.tgl_mulai)" />
                        <ProfileField label="Tgl. Selesai" :value="formatTanggalDisplay(profile.kontrak_aktif.tgl_selesai)" />
                        <ProfileField
                          v-if="profile.kontrak_aktif.durasi_hari != null"
                          label="Durasi"
                          :value="`${profile.kontrak_aktif.durasi_hari} hari`"
                        />
                        <ProfileField
                          v-if="profile.kontrak_aktif.sisa_hari != null"
                          label="Sisa"
                          :value="formatSisaHari(profile.kontrak_aktif.sisa_hari)"
                        />
                      </dl>

                      <div v-if="profile.kontrak_aktif.progres_persen != null" class="mt-3">
                        <div class="d-flex justify-content-between small text-muted mb-1">
                          <span>Progres periode kontrak</span>
                          <span>{{ profile.kontrak_aktif.progres_persen }}%</span>
                        </div>
                        <div class="progress" style="height: 8px;">
                          <div
                            class="progress-bar"
                            :class="progressBarClass(profile.kontrak_aktif)"
                            :style="{ width: `${profile.kontrak_aktif.progres_persen}%` }"
                            role="progressbar"
                          ></div>
                        </div>
                      </div>

                      <a
                        v-if="profile.kontrak_aktif.file_sk"
                        :href="getAttachmentUrl(profile.kontrak_aktif.file_sk)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-sm btn-outline-primary mt-3"
                      >
                        <i class="ri-download-line me-1"></i> Unduh SK Kontrak
                      </a>

                      <div v-if="profile.kontrak_aktif.reject_reason" class="alert alert-danger small mt-3 mb-0 py-2">
                        <strong>Alasan ditolak:</strong> {{ profile.kontrak_aktif.reject_reason }}
                      </div>
                    </template>
                    <div v-else class="text-muted small">
                      Belum ada kontrak. Default sistem: <strong>PKWTT (Sedang ditinjau)</strong>.
                    </div>
                  </div>

                  <div
                    v-if="canViewCutiModule"
                    :id="tab('tab-cuti')"
                    class="tab-pane fade"
                    role="tabpanel"
                  >
                    <div v-if="cutiPanelLoading" class="text-center py-3 text-muted small">
                      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                      <span class="ms-2">Memuat data cuti…</span>
                    </div>
                    <template v-else>
                      <div class="mb-3">
                        <label class="form-label small text-muted mb-1">Tahun kuota &amp; saldo</label>
                        <select
                          v-model.number="cutiTahun"
                          class="form-select form-select-sm"
                          @change="loadPegawaiCutiBalancesOnly"
                        >
                          <option v-for="y in cutiTahunOptions" :key="y" :value="y">{{ y }}</option>
                        </select>
                      </div>
                      <dl class="profile-dl mb-3">
                        <ProfileField
                          label="Total cuti terpakai (tahun)"
                          :value="`${cutiBalanceTotals.terpakai} hari`"
                        />
                        <ProfileField label="Sisa jatah (tahun)" :value="`${cutiBalanceTotals.sisa} hari`" />
                        <ProfileField
                          label="Kuota referensi (Σ jatah tipe)"
                          :value="cutiBalanceTotals.kuotaRef > 0 ? `${cutiBalanceTotals.kuotaRef} hari` : '— (ada tipe tanpa kuota hari)'"
                        />
                      </dl>
                      <div class="small fw-semibold text-muted mb-2">Per tipe (tahun {{ cutiTahun }})</div>
                      <div class="table-responsive mb-3">
                        <table class="table table-sm table-bordered table-striped align-middle mb-0 small">
                          <thead class="table-light">
                            <tr>
                              <th>Tipe</th>
                              <th class="text-end">Kuota / th</th>
                              <th class="text-end">Terpakai</th>
                              <th class="text-end">Sisa</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(br, idx) in pegawaiCutiBalances" :key="idx">
                              <td>{{ cutiBalanceTypeName(br) }}</td>
                              <td class="text-end">{{ cutiBalanceKuotaHari(br) }}</td>
                              <td class="text-end">{{ cutiBalanceNum(br, 'cuti_terpakai', 'cutiTerpakai') }}</td>
                              <td class="text-end">{{ cutiBalanceNum(br, 'sisa_jatah_cuti', 'sisaJatahCuti') }}</td>
                            </tr>
                            <tr v-if="!pegawaiCutiBalances.length">
                              <td colspan="4" class="text-center text-muted py-2">Belum ada saldo untuk tahun ini.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="small fw-semibold text-muted mb-2">Riwayat pengajuan</div>
                      <div class="table-responsive" style="max-height: 280px; overflow-y: auto">
                        <table class="table table-sm table-bordered table-striped align-middle mb-0 small">
                          <thead class="table-light sticky-top">
                            <tr>
                              <th>#</th>
                              <th>Periode</th>
                              <th>Tipe</th>
                              <th class="text-end">Durasi</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="row in pegawaiCutiHistorySorted" :key="row.id">
                              <td>{{ row.id }}</td>
                              <td>{{ formatRangeTanggal(row.tanggalMulai ?? row.tanggal_mulai, row.tanggalSelesai ?? row.tanggal_selesai) }}</td>
                              <td>{{ cutiRowTypeName(row) }}</td>
                              <td class="text-end">{{ cutiRowDurasiLabel(row) }}</td>
                              <td>
                                <span :class="getStatusCutiBadge(row.status).class">{{ getStatusCutiBadge(row.status).text }}</span>
                              </td>
                            </tr>
                            <tr v-if="!pegawaiCutiList.length">
                              <td colspan="5" class="text-center text-muted py-2">Belum ada pengajuan cuti.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </template>
                  </div>

                  <div
                    v-if="canViewPayslipTab"
                    :id="tab('tab-payslip')"
                    class="tab-pane fade"
                    role="tabpanel"
                  >
                    <PegawaiPayslipHistory
                      v-if="payslipTabReady && resolvedPegawaiId"
                      :key="resolvedPegawaiId"
                      :pegawai-id="resolvedPegawaiId"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Riwayat Jabatan (Timeline) -->
          <div class="col-12">
            <div class="card mb-4">
              <div class="card-header history-card-header d-flex align-items-center gap-2">
                <i class="ri-history-line"></i>
                <h6 class="mb-0">Riwayat Jabatan</h6>
                <span class="badge bg-label-secondary ms-auto">{{ profile.history_jabatan.length }} entri</span>
              </div>
              <div class="card-body">
                <ul v-if="paginatedHistory.length" class="timeline ms-1 mb-0">
                  <li
                    v-for="(h, idx) in paginatedHistory"
                    :key="h.id"
                    class="timeline-item timeline-item-transparent"
                    :class="{ 'timeline-item-last': idx === paginatedHistory.length - 1 }"
                  >
                    <span class="timeline-indicator-advanced" :class="timelineDotClass(historyPageStart + idx)">
                      <i class="ri-briefcase-line ri-16px"></i>
                    </span>
                    <div class="timeline-event">
                      <div class="timeline-header d-flex flex-wrap justify-content-between align-items-start gap-2 mb-1">
                        <h6 class="mb-0 fw-semibold">{{ h.jabatan?.nama || 'Jabatan tidak diketahui' }}</h6>
                        <small class="text-muted text-nowrap">{{ formatTanggalDisplay(h.created_at) }}</small>
                      </div>
                      <div class="text-muted small mb-2">
                        <i class="ri-building-2-line me-1"></i>
                        <span class="fw-medium">{{ h.perusahaan?.nama || '-' }}</span>
                        <template v-if="h.cabang?.nama">
                          · <i class="ri-map-pin-line me-1"></i>{{ h.cabang.nama }}
                        </template>
                      </div>
                      <div class="d-flex flex-wrap gap-2 small">
                        <span v-if="h.divisi?.nama" class="badge bg-label-secondary">
                          <i class="ri-group-line me-1"></i>{{ h.divisi.nama }}
                        </span>
                        <span v-if="h.departemen?.nama" class="badge bg-label-secondary">
                          <i class="ri-folder-user-line me-1"></i>{{ h.departemen.nama }}
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>
                <div v-else class="text-center text-muted py-4 small">
                  Belum ada riwayat jabatan.
                </div>

                <!-- Pagination -->
                <nav
                  v-if="historyTotal > HISTORY_PAGE_SIZE"
                  class="history-pagination d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4 pt-3"
                  aria-label="Pagination Riwayat Jabatan"
                >
                  <small class="text-muted">
                    Menampilkan {{ historyShowingFrom }}–{{ historyShowingTo }} dari {{ historyTotal }} entri
                  </small>
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{ disabled: historyPage <= 1 }">
                      <button
                        type="button"
                        class="page-link"
                        :disabled="historyPage <= 1"
                        aria-label="Halaman sebelumnya"
                        @click="goToHistoryPage(historyPage - 1)"
                      >
                        <i class="ri-arrow-left-s-line"></i>
                      </button>
                    </li>
                    <li
                      v-for="(p, i) in historyPageNumbers"
                      :key="`hp-${i}-${p}`"
                      class="page-item"
                      :class="{ active: p === historyPage, disabled: p === '…' }"
                    >
                      <span v-if="p === '…'" class="page-link">…</span>
                      <button
                        v-else
                        type="button"
                        class="page-link"
                        :aria-current="p === historyPage ? 'page' : undefined"
                        @click="goToHistoryPage(p)"
                      >
                        {{ p }}
                      </button>
                    </li>
                    <li class="page-item" :class="{ disabled: historyPage >= historyTotalPages }">
                      <button
                        type="button"
                        class="page-link"
                        :disabled="historyPage >= historyTotalPages"
                        aria-label="Halaman berikutnya"
                        @click="goToHistoryPage(historyPage + 1)"
                      >
                        <i class="ri-arrow-right-s-line"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          <!-- Riwayat Kontrak -->
          <div class="col-12">
            <div class="card mb-4">
              <div class="card-header d-flex align-items-center gap-2">
                <i class="ri-file-text-line"></i>
                <h6 class="mb-0">Riwayat Kontrak</h6>
                <span class="badge bg-label-secondary ms-auto">{{ profile.kontraks.length }} kontrak</span>
              </div>
              <div class="card-body pt-0">
                <div class="table-responsive">
                  <table class="table table-sm table-bordered table-striped mb-0 align-middle">
                    <thead class="table-light">
                      <tr>
                        <th>Jenis</th>
                        <th>Nomor SK</th>
                        <th>Periode</th>
                        <th>Status</th>
                        <th>File</th>
                        <th>Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="k in profile.kontraks" :key="k.id">
                        <td>{{ getJenisKontrakPegawaiLabel(k.jenis_kontrak) }}</td>
                        <td>{{ k.nomor_kontrak || '-' }}</td>
                        <td>
                          <div class="small">{{ formatTanggalDisplay(k.tgl_mulai) }}</div>
                          <div class="small text-muted">s/d {{ formatTanggalDisplay(k.tgl_selesai) }}</div>
                        </td>
                        <td>
                          <span :class="getStatusKontrakPegawaiBadge(k.status).class">
                            {{ getStatusKontrakPegawaiBadge(k.status).text }}
                          </span>
                          <div v-if="k.reject_reason" class="small text-danger mt-1">{{ k.reject_reason }}</div>
                        </td>
                        <td>
                          <a
                            v-if="k.file_sk"
                            :href="getAttachmentUrl(k.file_sk)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="small"
                          >Unduh</a>
                          <span v-else class="text-muted small">—</span>
                        </td>
                        <td class="small text-muted">{{ k.catatan || '-' }}</td>
                      </tr>
                      <tr v-if="!profile.kontraks.length">
                        <td colspan="6" class="text-center text-muted py-3">Belum ada data kontrak.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, h } from 'vue'
import { useNuxtApp } from '#app'
import { apiFetch } from '~/utils/apiFetch'
import { useImageUrl } from '~/composables/useImageUrl'
import { usePermissions } from '~/composables/usePermissions'
import { usePayrollPermissions } from '~/composables/usePayrollPermissions'
import { useUserStore } from '~/stores/user'
import PegawaiPayslipHistory from '~/components/hrd/PegawaiPayslipHistory.vue'
import {
  getStatusPegawaiBadge,
  getStatusKontrakPegawaiBadge,
  getKontrakAktifDisplay,
  getJenisKontrakPegawaiLabel,
  getJenisKelaminLabel,
  getPendidikanLabel,
  formatTanggalDisplay,
  formatMasaKerja,
} from '~/constants/hrd/pegawaiForm'
import { getStatusCutiBadge, formatRangeTanggal } from '~/constants/hrd/cutiForm'
import type {
  PegawaiProfileResponse,
  ProfileHistoryRow,
  ProfileKontrakAktif,
} from '~/types/hrd/pegawaiProfile'

const props = withDefaults(defineProps<{
  profile: PegawaiProfileResponse
  /** ID pegawai untuk load panel cuti (opsional). */
  pegawaiId?: number | null
  /** Prefiks id tab agar tidak bentrok jika ada 2 panel di DOM. */
  tabIdPrefix?: string
}>(), {
  pegawaiId: null,
  tabIdPrefix: 'pegawai-profile',
})

const { $api } = useNuxtApp()
const { getUserAvatar, handleImageError, getAttachmentUrl } = useImageUrl()
const { userHasPermission, userHasRole } = usePermissions()
const { canAny } = usePayrollPermissions()
const userStore = useUserStore()

const resolvedPegawaiId = computed(() => {
  if (props.pegawaiId != null && Number.isFinite(props.pegawaiId) && props.pegawaiId > 0) {
    return props.pegawaiId
  }
  const id = props.profile?.pegawai?.id_pegawai
  return id != null && Number.isFinite(id) && id > 0 ? id : null
})

const canViewCutiModule = computed(() => userHasPermission('view_cuti') || userHasRole('superadmin'))

const isOwnProfile = computed(() => {
  const linkedUserId = props.profile?.pegawai?.user_id ?? props.profile?.pegawai?.user?.id
  const me = userStore.user?.id
  return Boolean(me && linkedUserId && Number(me) === Number(linkedUserId))
})

const canViewPayslipTab = computed(() => {
  if (!resolvedPegawaiId.value) return false
  if (canAny('view_all_payslip', 'view_payroll_run_detail', 'access_payroll')) return true
  return isOwnProfile.value && canAny('view_own_payslip')
})

const showRightTabs = computed(() => canViewCutiModule.value || canViewPayslipTab.value)
const payslipTabReady = ref(false)

function activatePayslipTab() {
  payslipTabReady.value = true
}

const cutiTahun = ref(new Date().getFullYear())
const pegawaiCutiList = ref<Record<string, any>[]>([])
const pegawaiCutiBalances = ref<Record<string, any>[]>([])
const cutiPanelLoading = ref(false)

const cutiTahunOptions = computed(() => {
  const y = new Date().getFullYear()
  return [y + 1, y, y - 1, y - 2, y - 3]
})

function tab(suffix: string) {
  return `${props.tabIdPrefix}-${suffix}`
}

async function loadPegawaiCuti() {
  if (!resolvedPegawaiId.value || !canViewCutiModule.value) return
  cutiPanelLoading.value = true
  try {
    const pid = resolvedPegawaiId.value
    const [listRes, balRes] = await Promise.all([
      apiFetch<{ data: Record<string, any>[] }>($api.cutiByPegawai(pid), { credentials: 'include' }),
      apiFetch<{ data: Record<string, any>[]; tahun?: number }>(
        `${$api.cutiBalance(pid)}?tahun=${cutiTahun.value}`,
        { credentials: 'include' }
      ),
    ])
    pegawaiCutiList.value = listRes.data || []
    pegawaiCutiBalances.value = balRes.data || []
    if (balRes.tahun != null) cutiTahun.value = Number(balRes.tahun)
  } catch {
    pegawaiCutiList.value = []
    pegawaiCutiBalances.value = []
  } finally {
    cutiPanelLoading.value = false
  }
}

async function loadPegawaiCutiBalancesOnly() {
  if (!resolvedPegawaiId.value || !canViewCutiModule.value) return
  cutiPanelLoading.value = true
  try {
    const balRes = await apiFetch<{ data: Record<string, any>[]; tahun?: number }>(
      `${$api.cutiBalance(resolvedPegawaiId.value)}?tahun=${cutiTahun.value}`,
      { credentials: 'include' }
    )
    pegawaiCutiBalances.value = balRes.data || []
    if (balRes.tahun != null) cutiTahun.value = Number(balRes.tahun)
  } catch {
    pegawaiCutiBalances.value = []
  } finally {
    cutiPanelLoading.value = false
  }
}

function cutiBalanceNum(br: Record<string, any>, snake: string, camel: string): string {
  const b = br.balance
  if (!b) return '—'
  const v = b[snake] ?? b[camel]
  return v != null && v !== '' ? String(v) : '—'
}

function cutiBalanceKuotaHari(br: Record<string, any>): string {
  const j = br.cuti_type?.jatahCuti ?? br.cuti_type?.jatah_cuti
  if (j == null) return '—'
  const n = Number(j)
  return n > 0 ? String(n) : '—'
}

function cutiBalanceTypeName(br: Record<string, any>): string {
  return br.cuti_type?.nmTipeCuti || br.cuti_type?.nm_tipe_cuti || '-'
}

const cutiBalanceTotals = computed(() => {
  let terpakai = 0
  let sisa = 0
  let kuotaRef = 0
  for (const br of pegawaiCutiBalances.value) {
    const b = br.balance || {}
    const t = Number(b.cuti_terpakai ?? b.cutiTerpakai ?? 0) || 0
    const s = Number(b.sisa_jatah_cuti ?? b.sisaJatahCuti ?? 0) || 0
    terpakai += t
    sisa += s
    const j = Number(br.cuti_type?.jatahCuti ?? br.cuti_type?.jatah_cuti ?? 0) || 0
    if (j > 0) kuotaRef += j
  }
  return { terpakai, sisa, kuotaRef }
})

const pegawaiCutiHistorySorted = computed(() => {
  const list = [...pegawaiCutiList.value]
  list.sort((a, b) => {
    const da = new Date(a.createdAt ?? a.created_at ?? 0).getTime()
    const db = new Date(b.createdAt ?? b.created_at ?? 0).getTime()
    return db - da
  })
  return list
})

function cutiRowTypeName(row: Record<string, any>): string {
  return row.cutiType?.nmTipeCuti || row.cuti_type?.nm_tipe_cuti || '-'
}

function cutiRowDurasiLabel(row: Record<string, any>): string {
  const perJam = row.isPerJam ?? row.is_per_jam
  if (perJam) {
    const j = row.durasiJam ?? row.durasi_jam
    return j != null ? `${Number(j)} jam` : '—'
  }
  const h = row.lamaCuti ?? row.lama_cuti
  return h != null ? `${h} hari` : '—'
}

function formatSisaHari(sisa: number): string {
  if (sisa < 0) return `Berakhir ${Math.abs(sisa)} hari lalu`
  if (sisa === 0) return 'Berakhir hari ini'
  return `${sisa} hari lagi`
}

function progressBarClass(k: ProfileKontrakAktif | null): string {
  if (!k || k.progres_persen == null) return 'bg-primary'
  if (k.progres_persen >= 90) return 'bg-danger'
  if (k.progres_persen >= 70) return 'bg-warning'
  return 'bg-success'
}

const TIMELINE_DOT_COLORS = [
  'timeline-indicator-primary',
  'timeline-indicator-success',
  'timeline-indicator-info',
  'timeline-indicator-warning',
  'timeline-indicator-danger',
  'timeline-indicator-secondary',
] as const
function timelineDotClass(index: number): string {
  return TIMELINE_DOT_COLORS[index % TIMELINE_DOT_COLORS.length]
}

const HISTORY_PAGE_SIZE = 5
const historyPage = ref(1)

const historyEntries = computed<ProfileHistoryRow[]>(
  () => props.profile?.history_jabatan ?? []
)
const historyTotal = computed(() => historyEntries.value.length)
const historyTotalPages = computed(() =>
  Math.max(1, Math.ceil(historyTotal.value / HISTORY_PAGE_SIZE))
)
const historyPageStart = computed(() => (historyPage.value - 1) * HISTORY_PAGE_SIZE)
const paginatedHistory = computed<ProfileHistoryRow[]>(() =>
  historyEntries.value.slice(historyPageStart.value, historyPageStart.value + HISTORY_PAGE_SIZE)
)
const historyShowingFrom = computed(() =>
  historyTotal.value === 0 ? 0 : historyPageStart.value + 1
)
const historyShowingTo = computed(() =>
  Math.min(historyPageStart.value + HISTORY_PAGE_SIZE, historyTotal.value)
)

const historyPageNumbers = computed<(number | '…')[]>(() => {
  const total = historyTotalPages.value
  const current = historyPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const result: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) result.push('…')
  for (let i = start; i <= end; i++) result.push(i)
  if (end < total - 1) result.push('…')
  result.push(total)
  return result
})

function goToHistoryPage(page: number | '…'): void {
  if (page === '…') return
  const next = Math.min(Math.max(1, page), historyTotalPages.value)
  if (next !== historyPage.value) historyPage.value = next
}

interface FieldDef { label: string; value: unknown; valueBadge?: 'success' | 'danger' }

const COLUMN_HEIGHT = 5
function chunkFieldBlocks(fields: FieldDef[]): { left: FieldDef[]; right: FieldDef[] }[] {
  if (!fields.length) return []
  const blocks: { left: FieldDef[]; right: FieldDef[] }[] = []
  const blockSize = COLUMN_HEIGHT * 2
  for (let i = 0; i < fields.length; i += blockSize) {
    const slice = fields.slice(i, i + blockSize)
    blocks.push({
      left: slice.slice(0, COLUMN_HEIGHT),
      right: slice.slice(COLUMN_HEIGHT, blockSize),
    })
  }
  return blocks
}

const personalFields = computed<FieldDef[]>(() => {
  const p = props.profile?.pegawai
  if (!p) return []
  return [
    { label: 'Nama Lengkap', value: p.nm_pegawai },
    { label: 'NIK Pegawai', value: p.nik_pegawai },
    { label: 'No. KTP', value: p.no_ktp_pegawai },
    { label: 'NPWP', value: p.npwp_pegawai },
    { label: 'Tempat Lahir', value: p.tmp_lahir_pegawai },
    { label: 'Tanggal Lahir', value: formatTanggalDisplay(p.tgl_lahir_pegawai) },
    { label: 'Jenis Kelamin', value: getJenisKelaminLabel(p.jenis_kelamin_pegawai) },
    { label: 'Agama', value: p.agama },
    { label: 'Pendidikan', value: getPendidikanLabel(p.pendidikan_pegawai) },
    { label: 'No. Telepon', value: p.no_tlp_pegawai },
    { label: 'Alamat', value: p.alamat_pegawai },
  ]
})

const perusahaanFields = computed<FieldDef[]>(() => {
  const j = props.profile?.current_jabatan
  const p = props.profile?.pegawai
  if (!j || !p) return []
  return [
    { label: 'Perusahaan', value: j.perusahaan?.nama },
    { label: 'Cabang', value: j.cabang?.nama },
    { label: 'Divisi', value: j.divisi?.nama },
    { label: 'Departemen', value: j.departemen?.nama },
    { label: 'Jabatan', value: j.jabatan?.nama },
    { label: 'Tgl. Masuk', value: formatTanggalDisplay(p.tgl_masuk_pegawai), valueBadge: 'success' },
    { label: 'Tgl. Keluar', value: formatTanggalDisplay(p.tgl_keluar_pegawai), valueBadge: 'danger' },
  ]
})

const keluargaFields = computed<FieldDef[]>(() => {
  const p = props.profile?.pegawai
  if (!p) return []
  return [
    { label: 'Istri / Suami', value: p.istri_suami_pegawai },
    { label: 'Anak 1', value: p.anak_1 },
    { label: 'Anak 2', value: p.anak_2 },
    { label: 'Anak 3', value: p.anak_3 },
    { label: 'No. Tlp Keluarga', value: p.no_tlp_keluarga },
  ]
})

const bpjsFields = computed<FieldDef[]>(() => {
  const p = props.profile?.pegawai
  if (!p) return []
  return [
    { label: 'BPJS Ketenagakerjaan', value: p.bpjstk },
    { label: 'BPJS Kesehatan', value: p.bpjsk },
    { label: 'No. Rekening', value: p.nomor_rekening },
  ]
})

const personalBlocks = computed(() => chunkFieldBlocks(personalFields.value))
const perusahaanBlocks = computed(() => chunkFieldBlocks(perusahaanFields.value))
const keluargaBlocks = computed(() => chunkFieldBlocks(keluargaFields.value))
const bpjsBlocks = computed(() => chunkFieldBlocks(bpjsFields.value))

const ProfileField = (fieldProps: {
  label: string
  value: unknown
  wide?: boolean
  valueBadge?: 'success' | 'danger'
}) => {
  const safeValue =
    fieldProps.value === null || fieldProps.value === undefined || fieldProps.value === ''
      ? '-'
      : String(fieldProps.value)
  const valueInner =
    fieldProps.valueBadge != null && safeValue !== '-'
      ? h('span', { class: `badge bg-label-${fieldProps.valueBadge}` }, safeValue)
      : safeValue
  return h('div', { class: 'profile-dl-row' }, [
    h('div', { class: 'profile-dl-label fw-bold' }, [
      h('span', { class: 'profile-dl-label-text' }, fieldProps.label),
      h('span', { class: 'profile-dl-colon' }, ':'),
    ]),
    h('div', { class: 'profile-dl-value' }, valueInner),
  ])
}
;(ProfileField as any).props = ['label', 'value', 'wide', 'valueBadge']

const DocumentLink = (docProps: { label: string; path: string | null | undefined }) => {
  const hasFile = !!docProps.path
  return h('div', { class: 'col-md-6' }, [
    h('div', { class: 'd-flex justify-content-between align-items-center border rounded p-2' }, [
      h('div', [
        h('div', { class: 'small text-muted' }, docProps.label),
        h(
          'div',
          { class: 'small fw-medium', style: 'word-break: break-all;' },
          hasFile ? docProps.path!.split('/').pop() || docProps.path : 'Belum ada file'
        ),
      ]),
      hasFile
        ? h(
            'a',
            {
              href: getAttachmentUrl(docProps.path),
              target: '_blank',
              rel: 'noopener noreferrer',
              class: 'btn btn-sm btn-outline-primary ms-2',
            },
            [h('i', { class: 'ri-download-line' })]
          )
        : null,
    ]),
  ])
}
;(DocumentLink as any).props = ['label', 'path']

watch(
  () => [resolvedPegawaiId.value, canViewCutiModule.value] as const,
  async ([id, canView]) => {
    historyPage.value = 1
    payslipTabReady.value = false
    if (id && canView) await loadPegawaiCuti()
    else {
      pegawaiCutiList.value = []
      pegawaiCutiBalances.value = []
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.profile-dl {
  font-size: 0.875rem;
  line-height: 1.65;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
.profile-dl-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0;
}
.profile-dl-label {
  flex: 0 0 11rem;
  display: flex;
  align-items: baseline;
  color: var(--bs-body-color);
  padding-right: 0.5rem;
}
.profile-dl-label-text {
  flex: 1 1 auto;
  min-width: 0;
  word-break: break-word;
}
.profile-dl-colon {
  flex: 0 0 auto;
  padding-left: 0.25rem;
}
.profile-dl-value {
  flex: 1 1 auto;
  min-width: 0;
  color: var(--bs-body-color);
  word-break: break-word;
}
.card-header h6 {
  font-weight: 600;
}

.profile-info-tabs {
  border-bottom: 1px solid var(--bs-border-color);
  flex-wrap: wrap;
  gap: 0.25rem;
}
.profile-info-tabs .nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
}

/**
 * Layout 5×2: setiap block = 2 kolom (kiri & kanan), masing-masing max 5 baris.
 * Lebih dari 10 item akan muncul sebagai block ke-2 (di bawah) dengan pola sama.
 */
.profile-dl-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 1.5rem;
}
.profile-dl-block + .profile-dl-block {
  margin-top: 1rem;
}
.profile-dl-col {
  padding: 0;
  margin: 0;
}
/* Saat 2 kolom aktif, label boleh lebih sempit supaya value tidak ketekuk. */
@media (min-width: 992px) {
  .profile-dl-block .profile-dl-label {
    flex: 0 0 9rem;
  }
}

@media (max-width: 991.98px) {
  /* Di bawah lg: kolom kanan jatuh ke bawah kolom kiri (single column flow). */
  .profile-dl-block {
    grid-template-columns: 1fr;
    row-gap: 0;
  }
}

@media (max-width: 575.98px) {
  .profile-dl-label {
    flex: 0 0 8.5rem;
  }
  .profile-info-tabs .nav-link {
    padding: 0.4rem 0.5rem;
  }
}

/* ============================================================ *
 *  Card khusus Riwayat Jabatan
 *  - Hairline tipis di bawah header, di-inset agar:
 *      left  : sejajar dengan teks "Riwayat" (lewat ikon + gap)
 *      right : sejajar dengan badge "X entri" (= padding-right header)
 *  - Padding-right header diset agar badge "X entri" sejajar dengan
 *    tanggal di setiap timeline-event card (event card punya
 *    padding-right internal 1.5rem + card-body 1.25rem).
 * ============================================================ */
.history-card-header {
  position: relative;
  padding-right: 2.75rem;
}
.history-card-header::after {
  content: '';
  position: absolute;
  left: 2.75rem;   /* = padding-left header (1.25rem) + lebar ikon (~1rem) + gap-2 (0.5rem) */
  right: 2.75rem;  /* = padding-right header → sejajar dengan badge "X entri" */
  bottom: 0;
  height: 1px;
  background: var(--bs-border-color);
}

/* Beri jarak ekstra antara hairline & baris pertama timeline supaya
   teks "Direktur Keuangan" tidak terkesan menempel di garis. */
.history-card-header + .card-body {
  padding-top: 1.5rem;
}

/* Pagination Riwayat Jabatan: hairline tipis di atas baris pagination
   sebagai pemisah visual dengan timeline-event terakhir. */
.history-pagination {
  border-top: 1px solid var(--bs-border-color);
}
.history-pagination .pagination .page-link {
  border-radius: 0.375rem;
  margin-left: 0.125rem;
  border-color: var(--bs-border-color);
}
.history-pagination .pagination .page-item:first-child .page-link {
  margin-left: 0;
}

/* ============================================================ *
 *  Timeline (Riwayat Jabatan)
 *  Self-contained — tidak bergantung pada timeline theme global.
 * ============================================================ */
.timeline {
  position: relative;
  list-style: none;
  padding-left: 0;
}
.timeline::before {
  content: '';
  position: absolute;
  /* Mulai dari sekitar tengah icon (top icon 0.9rem + ½ icon 0.75rem ≈ 1.65rem)
     agar garis "keluar" dari belakang dot, bukan menggantung di atasnya. */
  top: 1.65rem;
  bottom: 0.5rem;
  left: 0.65rem;
  width: 2px;
  background: var(--bs-border-color);
  border-radius: 2px;
}
.timeline-item {
  position: relative;
  padding-left: 2.25rem;
  padding-bottom: 1.5rem;
}
.timeline-item-last {
  padding-bottom: 0;
}
.timeline-indicator-advanced {
  position: absolute;
  /* Sejajarkan center dot dengan baris title "Direktur Keuangan".
     Title berada di padding-top 1rem timeline-event (line-height ~1.3rem),
     center title ≈ 1.65rem; icon 1.5rem → top = 1.65 − 0.75 ≈ 0.9rem. */
  top: 0.9rem;
  left: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  background: var(--bs-primary);
  box-shadow: 0 0 0 4px var(--bs-card-bg, #fff);
  z-index: 1;
  font-size: 0.875rem;
  line-height: 1;
}
.timeline-indicator-primary   { background: var(--bs-primary); }
.timeline-indicator-success   { background: var(--bs-success); }
.timeline-indicator-info      { background: var(--bs-info); }
.timeline-indicator-warning   { background: var(--bs-warning); color: #000; }
.timeline-indicator-danger    { background: var(--bs-danger); }
.timeline-indicator-secondary { background: var(--bs-secondary); }

.timeline-event {
  position: relative;
  padding: 1rem 1.5rem 1rem 1.75rem;
  line-height: 1.55;
}
.timeline-event > * + * {
  margin-top: 0.5rem;
}
.timeline-header h6 {
  line-height: 1.3;
}
.timeline-event .badge {
  padding: 0.4rem 0.6rem;
  font-weight: 500;
}

@media (max-width: 575.98px) {
  .timeline-item {
    padding-left: 2rem;
  }
  .timeline-event {
    padding: 1rem 1.125rem 1rem 1.25rem;
  }
  /* Di layar kecil card-header diberi padding-end yang lebih kecil agar
     badge tetap sejajar dengan tanggal di timeline-event. */
  .history-card-header {
    padding-right: 2.375rem;
  }
  .history-card-header::after {
    /* di-mobile padding header lebih kecil, sesuaikan juga inset hairline */
    left: 2.5rem;
    right: 2.375rem;
  }
}
</style>
