<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-5">
      <div v-if="initializing" class="d-flex justify-content-center align-items-center py-10">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat…</span>
        </div>
      </div>

      <template v-else>
        <div class="d-flex justify-content-between align-items-start mb-4">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <NuxtLink to="/hrd/pegawai" class="text-muted small text-decoration-none">Pegawai</NuxtLink>
              <span class="text-muted small">/</span>
              <span class="text-muted small">{{ pageTitle }}</span>
            </div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
          </div>
          <NuxtLink to="/hrd/pegawai" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i> Kembali ke daftar
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div class="col-xl-8 col-12">
            <div class="card">
              <div class="card-body">
                <form @submit.prevent="handleSubmit" novalidate>
                  <div v-if="validationErrors?.length" class="alert alert-warning mb-4">
                    <ul class="mb-0 ps-3">
                      <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
                    </ul>
                  </div>

                  <div class="row">
                    <div class="col">
                      <ul class="nav nav-tabs pegawai-form-tabs" role="tablist">
                        <li class="nav-item">
                          <button
                            class="nav-link active"
                            data-bs-toggle="tab"
                            data-bs-target="#pegawai-fp-tab-personal"
                            role="tab"
                            type="button"
                          >
                            <span class="ri-user-line ri-20px d-sm-none"></span>
                            <span class="d-none d-sm-block">Informasi Pribadi</span>
                          </button>
                        </li>
                        <li class="nav-item">
                          <button
                            class="nav-link"
                            data-bs-toggle="tab"
                            data-bs-target="#pegawai-fp-tab-perusahaan"
                            role="tab"
                            type="button"
                          >
                            <span class="ri-folder-user-line ri-20px d-sm-none"></span>
                            <span class="d-none d-sm-block">Informasi Perusahaan</span>
                          </button>
                        </li>
                        <li class="nav-item">
                          <button
                            class="nav-link"
                            data-bs-toggle="tab"
                            data-bs-target="#pegawai-fp-tab-social"
                            role="tab"
                            type="button"
                          >
                            <span class="ri-facebook-fill ri-20px d-sm-none"></span>
                            <span class="d-none d-sm-block">Detail Keluarga</span>
                          </button>
                        </li>
                        <li class="nav-item">
                          <button
                            class="nav-link"
                            data-bs-toggle="tab"
                            data-bs-target="#pegawai-fp-tab-dokumen"
                            role="tab"
                            type="button"
                          >
                            <span class="ri-file-upload-line ri-20px d-sm-none"></span>
                            <span class="d-none d-sm-block">Dokumen & BPJS</span>
                          </button>
                        </li>
                        <li v-if="pegawaiIdParam" class="nav-item">
                          <button
                            class="nav-link"
                            data-bs-toggle="tab"
                            data-bs-target="#pegawai-fp-tab-kontrak"
                            role="tab"
                            type="button"
                          >
                            <span class="ri-draft-line ri-20px d-sm-none"></span>
                            <span class="d-none d-sm-block">Kontrak</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div class="tab-content pt-4">
                    <div id="pegawai-fp-tab-personal" class="tab-pane fade show active" role="tabpanel">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-nm" v-model="form.nm_pegawai" type="text" class="form-control" placeholder="Nama Lengkap" name="nm_pegawai" />
                            <label for="pegawai-fp-nm">Nama Lengkap</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-tlp" v-model="form.no_tlp_pegawai" type="text" class="form-control" placeholder="No. Tlp/HP Pegawai" name="no_tlp_pegawai" />
                            <label for="pegawai-fp-tlp">No. Tlp/HP Pegawai</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-tmp" v-model="form.tmp_lahir_pegawai" type="text" class="form-control" placeholder="Tempat Lahir" name="tmp_lahir_pegawai" />
                            <label for="pegawai-fp-tmp">Tempat Lahir</label>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-tgl-lahir" v-model="form.tgl_lahir_pegawai" type="date" class="form-control" name="tgl_lahir_pegawai" />
                            <label for="pegawai-fp-tgl-lahir">Tanggal Lahir</label>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <div class="form-floating form-floating-outline">
                            <CustomSelect2
                              id="pegawai-fp-pendidikan"
                              v-model="form.pendidikan_pegawai"
                              :options="pendidikanOptions"
                              :get-option-label="(o) => o.label"
                              :reduce="(o) => Number(o.value)"
                              searchable
                              clearable
                              placeholder="-- Pilih Pendidikan --"
                              class="select-pendidikan"
                            />
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-ktp" v-model="form.no_ktp_pegawai" type="text" class="form-control" name="no_ktp_pegawai" />
                            <label for="pegawai-fp-ktp">No. KTP Pegawai</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-npwp" v-model="form.npwp_pegawai" type="text" class="form-control" name="npwp_pegawai" />
                            <label for="pegawai-fp-npwp">No. NPWP Pegawai</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <CustomSelect2
                              id="pegawai-fp-jk"
                              v-model="form.jenis_kelamin_pegawai"
                              :options="jenisKelaminOptions"
                              :get-option-label="(o) => o.label"
                              :reduce="(o) => o.value"
                              :get-option-key="(o) => o.value"
                              searchable
                              clearable
                              placeholder="-- Pilih Jenis Kelamin --"
                              class="select-jenis-kelamin"
                            />
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <CustomSelect2
                              id="pegawai-fp-agama"
                              v-model="form.agama"
                              :options="agamaOptions"
                              :get-option-label="(o) => o.label"
                              :reduce="(o) => o.value"
                              :get-option-key="(o) => o.value"
                              searchable
                              clearable
                              placeholder="-- Pilih Agama --"
                              class="select-agama"
                            />
                          </div>
                        </div>
                        <div class="col-md-12">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-avatar" type="file" class="form-control" accept="image/*" @change="onAvatarChange" />
                            <label for="pegawai-fp-avatar">Avatar</label>
                            <div v-if="form.avatarPreview" class="mt-2">
                              <img
                                :src="form.avatarPreview"
                                alt="Avatar Preview"
                                style="height: 60px; width: 60px; object-fit: cover; border-radius: 50%; border: 2px solid #ddd"
                                @error="(e) => handleImageError(e, '/img/default-avatar.png')"
                              />
                              <a :href="form.avatarPreview" target="_blank" rel="noopener noreferrer" class="d-block mt-1 small">Lihat Avatar</a>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-12">
                          <div class="form-floating form-floating-outline">
                            <textarea id="pegawai-fp-alamat" v-model="form.alamat_pegawai" class="form-control h-px-100" placeholder="Alamat"></textarea>
                            <label for="pegawai-fp-alamat">Alamat</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div id="pegawai-fp-tab-perusahaan" class="tab-pane fade" role="tabpanel">
                      <div class="row g-3">
                        <div class="col-12">
                          <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                            <div class="form-check form-switch mb-0">
                              <input
                                id="pegawai-fp-assign"
                                class="form-check-input"
                                type="checkbox"
                                :checked="assignUserAccount"
                                @change="onAssignUserToggleFromEvent"
                              />
                              <label class="form-check-label" for="pegawai-fp-assign">Assign User Account</label>
                            </div>
                            <small class="text-muted">Hubungkan pegawai dengan akun login yang sudah ada.</small>
                          </div>
                        </div>
                        <div v-if="assignUserAccount" class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <CustomSelect2
                              id="pegawai-fp-user"
                              :modelValue="form.user_id"
                              :options="availableUsers"
                              :loading="availableUsersLoading"
                              :get-option-label="userOptionLabel"
                              :reduce="(o) => o.id"
                              placeholder="-- Pilih User --"
                              clearable
                              class="user-account-select"
                              @update:modelValue="onUserSelected"
                              @search="handleUserSearch"
                            >
                              <template #option="{ option }">
                                <div class="d-flex flex-column">
                                  <span class="fw-bold">{{ option.fullName }}</span>
                                  <small class="text-muted">{{ option.email || option.username }}</small>
                                </div>
                              </template>
                              <template #selection="{ option }">
                                <span>{{ option ? userOptionLabel(option) : '' }}</span>
                              </template>
                            </CustomSelect2>
                            <label for="pegawai-fp-user">Akun User</label>
                          </div>
                          <small class="text-muted d-block mt-1">Hanya user aktif tanpa pegawai yang dapat dipilih.</small>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-fullname" v-model="form.full_name" type="text" class="form-control" />
                            <label for="pegawai-fp-fullname">Full Name</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-username" v-model="form.username" type="text" class="form-control" readonly />
                            <label for="pegawai-fp-username">Username (Auto-generated)</label>
                          </div>
                          <small class="text-muted d-block mt-1">Username mengikuti akun user yang ditautkan atau otomatis dari nama pegawai.</small>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input
                              id="pegawai-fp-email"
                              v-model="form.email"
                              type="email"
                              class="form-control"
                              :readonly="true"
                              :disabled="!assignUserAccount"
                            />
                            <label for="pegawai-fp-email">Email</label>
                          </div>
                          <small class="text-muted d-block mt-1">Email mengikuti akun user yang ditautkan.</small>
                        </div>
                        <div class="col-md-6">
                          <template v-if="isEditMode">
                            <div class="form-floating form-floating-outline">
                              <input id="pegawai-fp-nik" v-model="form.nik_pegawai" type="text" class="form-control" name="nik_pegawai" readonly />
                              <label for="pegawai-fp-nik">NIK Pegawai</label>
                            </div>
                          </template>
                          <div v-else class="alert alert-info mb-0 py-2">
                            <small class="mb-0">NIK Pegawai akan dibuat otomatis dengan format <strong>YYYY/MM/#####</strong> (5 digit urut per bulan).</small>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <CustomSelect2
                            id="pegawai-fp-jabatan"
                            v-model="form.jabatan_id"
                            :options="jabatans"
                            :get-option-label="(o) => o.nmJabatan"
                            :reduce="(o) => o.id"
                            :get-option-key="(o) => o.id"
                            searchable
                            clearable
                            placeholder="-- Pilih Jabatan --"
                            class="jabatan"
                          />
                        </div>
                        <div class="col-md-6">
                          <CustomSelect2
                            id="pegawai-fp-perusahaan"
                            v-model="form.perusahaan_id"
                            :options="perusahaans"
                            :get-option-label="(o) => o.nmPerusahaan"
                            :reduce="(o) => o.id"
                            :get-option-key="(o) => o.id"
                            searchable
                            clearable
                            placeholder="-- Pilih Perusahaan --"
                            class="perusahaan"
                            @update:modelValue="handleCompanySelected"
                          />
                        </div>
                        <div class="col-md-6">
                          <CustomSelect2
                            id="pegawai-fp-cabang"
                            v-model="form.cabang_id"
                            :options="filteredCabang"
                            :get-option-label="(o) => o.nmCabang"
                            :reduce="(o) => o.id"
                            :get-option-key="(o) => o.id"
                            searchable
                            clearable
                            placeholder="-- Pilih Cabang --"
                            class="cabang"
                          />
                        </div>
                        <div class="col-md-6">
                          <CustomSelect2
                            id="pegawai-fp-divisi"
                            v-model="form.divisi_id"
                            :options="divisis"
                            :get-option-label="(o) => o.nmDivisi"
                            :reduce="(o) => o.id"
                            :get-option-key="(o) => o.id"
                            searchable
                            clearable
                            placeholder="-- Pilih Divisi --"
                            class="divisi"
                            @update:modelValue="handleDivisiSelected"
                          />
                        </div>
                        <div class="col-md-6">
                          <CustomSelect2
                            id="pegawai-fp-departemen"
                            v-model="form.departemen_id"
                            :options="filteredDepartemen"
                            :get-option-label="(o) => o.nmDepartemen"
                            :reduce="(o) => o.id"
                            :get-option-key="(o) => o.id"
                            searchable
                            clearable
                            placeholder="-- Pilih Departemen --"
                            class="departemen"
                          />
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-tgl-masuk" v-model="form.tgl_masuk_pegawai" type="date" class="form-control" name="tgl_masuk_pegawai" />
                            <label for="pegawai-fp-tgl-masuk">Tanggal Masuk Pegawai</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-tgl-keluar" v-model="form.tgl_keluar_pegawai" type="date" class="form-control" name="tgl_keluar_pegawai" />
                            <label for="pegawai-fp-tgl-keluar">Tanggal Keluar Pegawai</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input
                              id="pegawai-fp-gaji"
                              type="text"
                              class="form-control"
                              name="gaji_pegawai"
                              placeholder="Rp 0,-"
                              :value="gajiPegawaiFormatted"
                              @input="handleGajiInput"
                            />
                            <label for="pegawai-fp-gaji">Gaji Pegawai</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input
                              id="pegawai-fp-tunjangan"
                              type="text"
                              class="form-control"
                              placeholder="Rp 0,-"
                              :value="tunjanganPegawaiFormatted"
                              @input="handleTunjanganInput"
                            />
                            <label for="pegawai-fp-tunjangan">Tunjangan Pegawai</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <CustomSelect2
                              id="pegawai-fp-status"
                              v-model="form.status_pegawai"
                              :options="statusPegawaiOptions"
                              :get-option-label="(o) => o.label"
                              :reduce="(o) => o.value"
                              :get-option-key="(o) => o.value"
                              searchable
                              clearable
                              placeholder="-- Pilih Status Pegawai --"
                              class="select-status-pegawai"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div id="pegawai-fp-tab-social" class="tab-pane fade" role="tabpanel">
                      <div class="row g-3">
                        <div class="col-md-3">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-pasangan" v-model="form.istri_suami_pegawai" type="text" class="form-control" />
                            <label for="pegawai-fp-pasangan">Istri/Suami Pegawai</label>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-anak1" v-model="form.anak_1" type="text" class="form-control" />
                            <label for="pegawai-fp-anak1">Anak 1</label>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-anak2" v-model="form.anak_2" type="text" class="form-control" />
                            <label for="pegawai-fp-anak2">Anak 2</label>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-anak3" v-model="form.anak_3" type="text" class="form-control" />
                            <label for="pegawai-fp-anak3">Anak 3</label>
                          </div>
                        </div>
                        <div class="col-md-12">
                          <div class="form-floating form-floating-outline">
                            <input id="pegawai-fp-tlp-kel" v-model="form.no_tlp_keluarga" type="text" class="form-control" />
                            <label for="pegawai-fp-tlp-kel">Keluarga yang dapat dihubungi</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div id="pegawai-fp-tab-dokumen" class="tab-pane fade" role="tabpanel">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label class="form-label" for="pegawai-fp-cv">CV (PDF / gambar / Word)</label>
                          <input id="pegawai-fp-cv" type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*,application/pdf" @change="onDocChange('cv_attachment', $event)" />
                          <a v-if="form.cv_attachment_url" :href="form.cv_attachment_url" target="_blank" rel="noopener noreferrer" class="d-inline-block mt-1 small">Unduh CV terpasang</a>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label" for="pegawai-fp-kk">Kartu Keluarga</label>
                          <input id="pegawai-fp-kk" type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*,application/pdf" @change="onDocChange('kk_attachment', $event)" />
                          <a v-if="form.kk_attachment_url" :href="form.kk_attachment_url" target="_blank" rel="noopener noreferrer" class="d-inline-block mt-1 small">Unduh KK terpasang</a>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label" for="pegawai-fp-ijazah">Ijazah</label>
                          <input id="pegawai-fp-ijazah" type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*,application/pdf" @change="onDocChange('ijazah_attachment', $event)" />
                          <a v-if="form.ijazah_attachment_url" :href="form.ijazah_attachment_url" target="_blank" rel="noopener noreferrer" class="d-inline-block mt-1 small">Unduh ijazah terpasang</a>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label" for="pegawai-fp-skck">SKCK</label>
                          <input id="pegawai-fp-skck" type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*,application/pdf" @change="onDocChange('skck_attachment', $event)" />
                          <a v-if="form.skck_attachment_url" :href="form.skck_attachment_url" target="_blank" rel="noopener noreferrer" class="d-inline-block mt-1 small">Unduh SKCK terpasang</a>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label" for="pegawai-fp-skck">BPJS Ketenagakerjaan</label>
                          <input id="pegawai-fp-bpjstk" v-model="form.bpjstk" type="text" class="form-control" />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label" for="pegawai-fp-skck">BPJS Kesehatan</label>
                          <input id="pegawai-fp-bpjsk" v-model="form.bpjsk" type="text" class="form-control" />
                        </div>
                        <div class="col-md-12">
                          <label class="form-label" for="pegawai-fp-rek">Nomor rekening Bank Mandiri (opsional)</label>
                          <input id="pegawai-fp-rek" v-model="form.nomor_rekening" type="text" class="form-control" maxlength="13" inputmode="numeric" />
                          <small class="text-muted">Jika diisi, gunakan rekening Bank Mandiri: tepat 13 digit, prefix <code>008</code>.</small>
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="pegawaiIdParam"
                      id="pegawai-fp-tab-kontrak"
                      class="tab-pane fade"
                      role="tabpanel"
                    >
                      <p class="text-muted small mb-3">
                        PKWT dapat diperpanjang berkali-kali (tiap periode = satu baris kontrak). PKWTT tanpa tanggal selesai.
                        <template v-if="kontrakWorkflowConfigured">
                          Simpan <strong>draft</strong>, lalu <strong>Kirim ke persetujuan</strong> — setelah semua step di
                          Approval Workflow disetujui, kontrak aktif dan data pegawai disesuaikan.
                        </template>
                        <template v-else>
                          Simpan <strong>draft</strong>, lalu <strong>Aktifkan</strong> langsung (belum ada workflow aktif untuk
                          entity <code>pegawai_kontrak</code> di menu Approval Workflow).
                        </template>
                      </p>
                      <div v-if="kontraksLoading" class="py-3 text-center text-muted">
                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Memuat riwayat kontrak…
                      </div>
                      <div v-else class="table-responsive mb-4">
                        <table class="table table-sm table-bordered align-middle">
                          <thead class="table-light">
                            <tr>
                              <th>No. referensi</th>
                              <th>Jenis</th>
                              <th>Mulai</th>
                              <th>Selesai</th>
                              <th>Status</th>
                              <th>SK</th>
                              <th class="text-end">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="row in kontraks" :key="String(row.id)">
                              <td>{{ kontrakString(row, 'nomor_kontrak') || '—' }}</td>
                              <td>{{ getJenisKontrakPegawaiLabel(kontrakNumber(row, 'jenis_kontrak')) }}</td>
                              <td>{{ formatTableDate(kontrakField(row, 'tgl_mulai')) }}</td>
                              <td>
                                {{ kontrakNumber(row, 'jenis_kontrak') === 1 ? '—' : formatTableDate(kontrakField(row, 'tgl_selesai')) }}
                              </td>
                              <td>
                                <span :class="getStatusKontrakPegawaiBadge(kontrakNumber(row, 'status')).class">
                                  {{ getStatusKontrakPegawaiBadge(kontrakNumber(row, 'status')).text }}
                                </span>
                                <div
                                  v-if="kontrakNumber(row, 'status') === 5 && kontrakApproverList(row).length"
                                  class="mt-1 small text-muted"
                                >
                                  Approver: {{ kontrakApproverList(row).map((a) => a.fullName || a.email).join(', ') }}
                                </div>
                                <div v-if="kontrakRejectReason(row)" class="mt-1 small text-danger">
                                  {{ kontrakRejectReason(row) }}
                                </div>
                              </td>
                              <td>
                                <a
                                  v-if="kontrakString(row, 'file_sk')"
                                  :href="kontrakFileUrl(kontrakString(row, 'file_sk'))"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="small"
                                >Unduh</a>
                                <span v-else class="text-muted small">—</span>
                              </td>
                              <td class="text-end">
                                <div v-if="kontrakActions(row).length" class="btn-group kontrak-action-dropdown">
                                  <button
                                    type="button"
                                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    data-bs-popper-config='{"strategy":"fixed"}'
                                    data-bs-boundary="viewport"
                                    aria-expanded="false"
                                  >
                                    Aksi
                                  </button>
                                  <ul class="dropdown-menu dropdown-menu-end">
                                    <li v-for="action in kontrakActions(row)" :key="action.key">
                                      <button
                                        type="button"
                                        class="dropdown-item"
                                        :class="action.itemClass"
                                        @click="action.handler(row)"
                                      >
                                        <i v-if="action.icon" :class="[action.icon, 'me-2']" />
                                        {{ action.label }}
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                                <span v-else class="text-muted small">—</span>
                              </td>
                            </tr>
                            <tr v-if="!kontraks.length">
                              <td colspan="7" class="text-center text-muted py-3">Belum ada data kontrak.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <h6 class="mb-3 border-top pt-3">
                        {{ editingKontrakId ? 'Edit kontrak (draft / ditolak)' : 'Tambah draft kontrak' }}
                      </h6>
                      <div class="row g-3">
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <CustomSelect2
                              id="pegawai-fp-kontrak-jenis"
                              v-model="kontrakDraft.jenis_kontrak"
                              :options="jenisKontrakSelectOptions"
                              :get-option-label="(o: { label: string }) => o.label"
                              :reduce="(o: { value: number }) => o.value"
                              :get-option-key="(o: { value: number }) => o.value"
                              placeholder="Jenis kontrak"
                              class="select-kontrak-jenis"
                            />
                            <label for="pegawai-fp-kontrak-jenis">Jenis kontrak</label>
                          </div>
                        </div>
                        <div class="col-md-6 mb-3">
                          <div class="form-floating form-floating-outline">
                            <input
                              id="pegawai-fp-kontrak-nomor"
                              v-model="kontrakDraft.nomor_kontrak"
                              type="text"
                              class="form-control"
                              placeholder="Nomor SK / referensi"
                            />
                            <label for="pegawai-fp-kontrak-nomor">Nomor SK / referensi (opsional)</label>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <div class="form-floating form-floating-outline">
                            <input
                              id="pegawai-fp-kontrak-mulai"
                              v-model="kontrakDraft.tgl_mulai"
                              type="date"
                              class="form-control"
                            />
                            <label for="pegawai-fp-kontrak-mulai">Tanggal mulai</label>
                          </div>
                        </div>
                        <div v-if="kontrakDraft.jenis_kontrak === 2" class="col-md-3">
                          <div class="form-floating form-floating-outline">
                            <input
                              id="pegawai-fp-kontrak-selesai"
                              v-model="kontrakDraft.tgl_selesai"
                              type="date"
                              class="form-control"
                            />
                            <label for="pegawai-fp-kontrak-selesai">Tanggal selesai (PKWT)</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input
                              id="pegawai-fp-kontrak-induk"
                              v-model="kontrakDraft.induk_id"
                              type="number"
                              min="1"
                              class="form-control"
                              placeholder="ID kontrak induk"
                            />
                            <label for="pegawai-fp-kontrak-induk">ID kontrak induk (opsional)</label>
                          </div>
                        </div>
                        <div class="col-md-12">
                          <label class="form-label" for="pegawai-fp-kontrak-cat">Catatan</label>
                          <textarea
                            id="pegawai-fp-kontrak-cat"
                            v-model="kontrakDraft.catatan"
                            class="form-control"
                            rows="2"
                            placeholder="Catatan internal"
                          />
                        </div>
                        <div class="col-md-12">
                          <label class="form-label" for="pegawai-fp-kontrak-file">Lampiran SK (PDF / gambar / Word, maks. 5MB)</label>
                          <input
                            id="pegawai-fp-kontrak-file"
                            type="file"
                            class="form-control"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*,application/pdf"
                            @change="onKontrakSkChange"
                          />
                        </div>
                        <div class="col-12 d-flex flex-wrap gap-2">
                          <button type="button" class="btn btn-primary" :disabled="kontrakSaving" @click="submitKontrakDraft">
                            <span v-if="kontrakSaving" class="spinner-border spinner-border-sm me-1" aria-hidden="true" />
                            Simpan kontrak as draft
                          </button>
                          <button type="button" class="btn btn-outline-secondary" :disabled="kontrakSaving" @click="resetKontrakDraft">
                            Kosongkan form
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end gap-2 pt-4 mt-2 border-top">
                    <NuxtLink to="/hrd/pegawai" class="btn btn-outline-secondary">Batal</NuxtLink>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                      <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-12">
            <div class="card shadow-sm border-0">
              <div class="card-header border-0 bg-transparent px-4 py-3">
                <h5 class="card-title mb-0 d-flex align-items-center">
                  <i class="ri-menu-2-line me-2 text-primary"></i>
                  Modul HR
                </h5>
              </div>
              <div class="card-body px-4 pt-0 pb-4">
                <div class="list-group list-group-flush">
                  <NuxtLink
                    v-for="item in moduleNavItems"
                    :key="item.to"
                    :to="item.to"
                    class="list-group-item list-group-item-action d-flex align-items-center justify-content-between gap-3"
                    :class="{ active: isModuleNavActive(item.to) }"
                  >
                    <span class="d-flex align-items-center gap-2">
                      <i :class="item.icon" class="text-primary"></i>
                      {{ item.label }}
                    </span>
                    <i class="ri-arrow-right-s-line text-muted"></i>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useImageUrl } from '~/composables/useImageUrl'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import {
  AGAMA_OPTIONS,
  getJenisKontrakPegawaiLabel,
  getStatusKontrakPegawaiBadge,
  HRD_MODULE_NAV,
  JENIS_KELAMIN_PEGAWAI_OPTIONS,
  JENIS_KONTRAK_PEGAWAI_OPTIONS,
  PENDIDIKAN_PEGAWAI_OPTIONS,
  STATUS_PEGAWAI_OPTIONS,
} from '~/constants/hrd/pegawaiForm'
import { useCabangStore } from '~/stores/cabang'
import { useDepartemenStore } from '~/stores/departemen'
import { useDivisiStore } from '~/stores/divisi'
import { useJabatanStore } from '~/stores/jabatan'
import { usePegawaiStore } from '~/stores/pegawai'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { usePermissionsStore } from '~/stores/permissions'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const pegawaiStore = usePegawaiStore()
const perusahaanStore = usePerusahaanStore()
const cabangStore = useCabangStore()
const divisiStore = useDivisiStore()
const departemenStore = useDepartemenStore()
const jabatanStore = useJabatanStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()

const {
  form,
  loading,
  validationErrors,
  isEditMode,
  assignUserAccount,
  availableUsers,
  availableUsersLoading,
  kontraks,
  kontraksLoading,
  kontrakWorkflowConfigured,
} = storeToRefs(pegawaiStore)
const { perusahaans } = storeToRefs(perusahaanStore)
const { cabangs } = storeToRefs(cabangStore)
const { divisis } = storeToRefs(divisiStore)
const { departemens } = storeToRefs(departemenStore)
const { jabatans } = storeToRefs(jabatanStore)

const { handleImageError, getAttachmentUrl } = useImageUrl()
const { setFormTitle } = useDynamicTitle()

const initializing = ref(true)
const kontrakSaving = ref(false)

const jenisKontrakSelectOptions = [...JENIS_KONTRAK_PEGAWAI_OPTIONS]

const kontrakDraft = reactive({
  jenis_kontrak: 2 as number,
  nomor_kontrak: '',
  tgl_mulai: '',
  tgl_selesai: '',
  catatan: '',
  induk_id: '' as string | number,
  file_sk: null as File | null,
})

const editingKontrakId = ref<number | null>(null)

const pegawaiIdParam = computed(() => {
  const raw = route.params.id
  if (raw === '' || raw === null || raw === undefined) return null
  if (Array.isArray(raw)) {
    const first = raw[0]
    if (first === '' || first === null || first === undefined) return null
    return String(first)
  }
  return String(raw)
})

const pageTitle = computed(() => (pegawaiIdParam.value ? 'Edit Pegawai' : 'Tambah Pegawai'))
const pageSubtitle = computed(() =>
  pegawaiIdParam.value ? 'Perbarui data pegawai dan lampiran.' : 'Lengkapi data pegawai baru.',
)

const moduleNavItems = [...HRD_MODULE_NAV]

function isModuleNavActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

const pendidikanOptions = [...PENDIDIKAN_PEGAWAI_OPTIONS]
const jenisKelaminOptions = [...JENIS_KELAMIN_PEGAWAI_OPTIONS]
const statusPegawaiOptions = [...STATUS_PEGAWAI_OPTIONS]

function kontrakFileUrl(path: string | null | undefined) {
  return path ? getAttachmentUrl(path) : ''
}

type KontrakApproverRow = { userId?: number; fullName?: string; email?: string; source?: string }

/** Baca field dari row kontrak — toleran terhadap snake_case dan camelCase serialization. */
function kontrakField(row: Record<string, unknown>, snakeKey: string): unknown {
  if (Object.prototype.hasOwnProperty.call(row, snakeKey) && row[snakeKey] !== undefined) {
    return row[snakeKey]
  }
  const camel = snakeKey.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
  if (Object.prototype.hasOwnProperty.call(row, camel) && row[camel] !== undefined) {
    return row[camel]
  }
  return undefined
}

function kontrakNumber(row: Record<string, unknown>, snakeKey: string): number {
  return Number(kontrakField(row, snakeKey) ?? 0)
}

function kontrakString(row: Record<string, unknown>, snakeKey: string): string {
  const v = kontrakField(row, snakeKey)
  return v === null || v === undefined ? '' : String(v)
}

function kontrakApproverList(row: Record<string, unknown>): KontrakApproverRow[] {
  const raw = kontrakField(row, 'current_approvers') ?? row.currentApprovers
  return Array.isArray(raw) ? (raw as KontrakApproverRow[]) : []
}

function kontrakRejectReason(row: Record<string, unknown>): string {
  return kontrakString(row, 'reject_reason')
}

type KontrakActionDef = {
  key: string
  label: string
  icon?: string
  itemClass?: string
  handler: (row: Record<string, unknown>) => void | Promise<void>
}

function kontrakActions(row: Record<string, unknown>): KontrakActionDef[] {
  const status = kontrakNumber(row, 'status')
  const actions: KontrakActionDef[] = []

  if (status === 1) {
    actions.push({
      key: 'edit',
      label: 'Edit',
      icon: 'ri-edit-box-line',
      handler: (r) => startEditKontrak(r),
    })
    if (kontrakWorkflowConfigured.value) {
      actions.push({
        key: 'submit',
        label: 'Kirim persetujuan',
        icon: 'ri-send-plane-line',
        itemClass: 'text-primary',
        handler: (r) => void handleSubmitKontrakApproval(r),
      })
    } else {
      actions.push({
        key: 'activate',
        label: 'Aktifkan',
        icon: 'ri-checkbox-circle-line',
        itemClass: 'text-success',
        handler: (r) => void handleActivateKontrak(r),
      })
    }
    actions.push({
      key: 'cancel',
      label: 'Batalkan draft',
      icon: 'ri-close-circle-line',
      itemClass: 'text-warning',
      handler: (r) => void handleCancelKontrakDraft(r),
    })
    actions.push({
      key: 'delete',
      label: 'Hapus',
      icon: 'ri-delete-bin-7-line',
      itemClass: 'text-danger',
      handler: (r) => void handleDeleteKontrakDraft(r),
    })
    return actions
  }

  if (status === 5) {
    actions.push({
      key: 'approve',
      label: 'Approve',
      icon: 'ri-checkbox-circle-line',
      itemClass: 'text-success',
      handler: (r) => void handleApproveKontrak(r),
    })
    actions.push({
      key: 'reject',
      label: 'Tolak',
      icon: 'ri-close-circle-line',
      itemClass: 'text-danger',
      handler: (r) => void handleRejectKontrak(r),
    })
    actions.push({
      key: 'cancel-pending',
      label: 'Batalkan pengajuan',
      icon: 'ri-arrow-go-back-line',
      handler: (r) => void handleCancelKontrakPending(r),
    })
    return actions
  }

  if (status === 6) {
    actions.push({
      key: 'edit',
      label: 'Edit & ajukan ulang',
      icon: 'ri-edit-box-line',
      handler: (r) => startEditKontrak(r),
    })
    actions.push({
      key: 'delete',
      label: 'Hapus',
      icon: 'ri-delete-bin-7-line',
      itemClass: 'text-danger',
      handler: (r) => void handleDeleteKontrakDraft(r),
    })
    return actions
  }

  return actions
}

function formatTableDate(val: unknown): string {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'object' && val !== null && 'toISODate' in (val as Record<string, unknown>)) {
    try {
      return String((val as { toISODate?: () => string }).toISODate?.() ?? '').slice(0, 10) || '—'
    } catch {
      /* fall through */
    }
  }
  const s = String(val)
  return s.length >= 10 ? s.slice(0, 10) : s || '—'
}

function resetKontrakDraft() {
  editingKontrakId.value = null
  kontrakDraft.jenis_kontrak = 2
  kontrakDraft.nomor_kontrak = ''
  kontrakDraft.tgl_mulai = ''
  kontrakDraft.tgl_selesai = ''
  kontrakDraft.catatan = ''
  kontrakDraft.induk_id = ''
  kontrakDraft.file_sk = null
}

function sliceIsoDate(val: unknown): string {
  if (val === null || val === undefined || val === '') return ''
  if (typeof val === 'object' && val !== null && 'toISODate' in (val as Record<string, unknown>)) {
    try {
      return String((val as { toISODate?: () => string }).toISODate?.() ?? '').slice(0, 10)
    } catch {
      /* fall through */
    }
  }
  return String(val).slice(0, 10)
}

function startEditKontrak(row: Record<string, unknown>) {
  const st = kontrakNumber(row, 'status')
  if (st !== 1 && st !== 6) return
  editingKontrakId.value = kontrakNumber(row, 'id')
  kontrakDraft.jenis_kontrak = kontrakNumber(row, 'jenis_kontrak') || 2
  kontrakDraft.nomor_kontrak = kontrakString(row, 'nomor_kontrak')
  kontrakDraft.tgl_mulai = sliceIsoDate(kontrakField(row, 'tgl_mulai'))
  kontrakDraft.tgl_selesai = sliceIsoDate(kontrakField(row, 'tgl_selesai'))
  kontrakDraft.catatan = kontrakString(row, 'catatan')
  const induk = kontrakField(row, 'induk_id')
  kontrakDraft.induk_id = induk != null && induk !== '' ? String(induk) : ''
  kontrakDraft.file_sk = null
}

function onKontrakSkChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  kontrakDraft.file_sk = file ?? null
}

async function submitKontrakDraft() {
  const pid = pegawaiIdParam.value
  if (!pid) return
  const toast = useToast()
  if (kontrakDraft.jenis_kontrak === 2 && !kontrakDraft.tgl_selesai) {
    toast.error({ title: 'Validasi', message: 'Kontrak PKWT wajib memiliki tanggal selesai.', color: 'red' })
    return
  }
  if (!kontrakDraft.tgl_mulai) {
    toast.error({ title: 'Validasi', message: 'Tanggal mulai kontrak wajib diisi.', color: 'red' })
    return
  }
  kontrakSaving.value = true
  try {
    await pegawaiStore.postPegawaiKontrakDraft({
      pegawaiId: pid,
      editingKontrakId: editingKontrakId.value,
      jenis_kontrak: kontrakDraft.jenis_kontrak,
      nomor_kontrak: kontrakDraft.nomor_kontrak,
      tgl_mulai: kontrakDraft.tgl_mulai,
      tgl_selesai: kontrakDraft.jenis_kontrak === 2 ? kontrakDraft.tgl_selesai : null,
      catatan: kontrakDraft.catatan,
      induk_id: kontrakDraft.induk_id !== '' && kontrakDraft.induk_id != null ? Number(kontrakDraft.induk_id) : null,
      file: kontrakDraft.file_sk,
    })
    resetKontrakDraft()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e?.message || 'Gagal menyimpan kontrak', color: 'red' })
  } finally {
    kontrakSaving.value = false
  }
}

async function handleSubmitKontrakApproval(row: Record<string, unknown>) {
  const pid = pegawaiIdParam.value
  if (!pid) return
  const { default: Swal } = await import('sweetalert2')
  const r = await Swal.fire({
    title: 'Kirim ke persetujuan?',
    text: 'Kontrak akan menunggu approval sesuai workflow pegawai_kontrak.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, kirim',
    cancelButtonText: 'Batal',
  })
  if (!r.isConfirmed) return
  const toast = useToast()
  try {
    await pegawaiStore.submitPegawaiKontrakForApproval(Number(row.id), pid)
    resetKontrakDraft()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e?.message || 'Gagal mengajukan', color: 'red' })
  }
}

async function handleApproveKontrak(row: Record<string, unknown>) {
  const pid = pegawaiIdParam.value
  if (!pid) return
  const { default: Swal } = await import('sweetalert2')
  const r = await Swal.fire({
    title: 'Setujui langkah ini?',
    input: 'textarea',
    inputPlaceholder: 'Catatan (opsional)',
    showCancelButton: true,
    confirmButtonText: 'Approve',
    cancelButtonText: 'Batal',
  })
  if (!r.isConfirmed) return
  const toast = useToast()
  try {
    await pegawaiStore.approvePegawaiKontrak(Number(row.id), pid, (r.value as string) || undefined)
    resetKontrakDraft()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e?.message || 'Gagal approve', color: 'red' })
  }
}

async function handleRejectKontrak(row: Record<string, unknown>) {
  const pid = pegawaiIdParam.value
  if (!pid) return
  const { default: Swal } = await import('sweetalert2')
  const r = await Swal.fire({
    title: 'Tolak pengajuan kontrak',
    input: 'textarea',
    inputLabel: 'Alasan wajib',
    inputPlaceholder: 'Jelaskan alasan penolakan',
    showCancelButton: true,
    confirmButtonText: 'Tolak',
    cancelButtonText: 'Batal',
    inputValidator: (v) => {
      if (!v || !String(v).trim()) return 'Alasan wajib diisi'
      return null
    },
  })
  if (!r.isConfirmed || !r.value) return
  const toast = useToast()
  try {
    await pegawaiStore.rejectPegawaiKontrak(Number(row.id), pid, String(r.value).trim())
    resetKontrakDraft()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e?.message || 'Gagal menolak', color: 'red' })
  }
}

async function handleCancelKontrakPending(row: Record<string, unknown>) {
  const pid = pegawaiIdParam.value
  if (!pid) return
  const { default: Swal } = await import('sweetalert2')
  const r = await Swal.fire({
    title: 'Batalkan pengajuan?',
    text: 'Status kontrak menjadi dibatalkan; Anda dapat membuat draft baru.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, batalkan',
    cancelButtonText: 'Tidak',
  })
  if (!r.isConfirmed) return
  const toast = useToast()
  try {
    await pegawaiStore.cancelPegawaiKontrakPending(Number(row.id), pid)
    resetKontrakDraft()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e?.message || 'Gagal membatalkan', color: 'red' })
  }
}

async function handleActivateKontrak(row: Record<string, unknown>) {
  const pid = pegawaiIdParam.value
  if (!pid) return
  const { default: Swal } = await import('sweetalert2')
  const r = await Swal.fire({
    title: 'Aktifkan kontrak ini?',
    text: 'Kontrak aktif lain untuk pegawai ini akan ditutup. Tanggal keluar dan status pegawai disesuaikan (PKWT / PKWTT).',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, aktifkan',
    cancelButtonText: 'Batal',
  })
  if (!r.isConfirmed) return
  const toast = useToast()
  try {
    await pegawaiStore.activatePegawaiKontrak(Number(row.id), pid)
    resetKontrakDraft()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e?.message || 'Gagal mengaktifkan kontrak', color: 'red' })
  }
}

async function handleCancelKontrakDraft(row: Record<string, unknown>) {
  const pid = pegawaiIdParam.value
  if (!pid) return
  const { default: Swal } = await import('sweetalert2')
  const r = await Swal.fire({
    title: 'Batalkan draft kontrak?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, batalkan',
    cancelButtonText: 'Tidak',
  })
  if (!r.isConfirmed) return
  const toast = useToast()
  try {
    await pegawaiStore.cancelPegawaiKontrakDraft(Number(row.id), pid)
    resetKontrakDraft()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e?.message || 'Gagal membatalkan draft', color: 'red' })
  }
}

async function handleDeleteKontrakDraft(row: Record<string, unknown>) {
  const pid = pegawaiIdParam.value
  if (!pid) return
  const { default: Swal } = await import('sweetalert2')
  const r = await Swal.fire({
    title: 'Hapus draft kontrak?',
    text: 'Data draft akan dihapus permanen.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
  })
  if (!r.isConfirmed) return
  const toast = useToast()
  try {
    await pegawaiStore.deletePegawaiKontrakDraft(Number(row.id), pid)
    resetKontrakDraft()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e?.message || 'Gagal menghapus draft', color: 'red' })
  }
}
const agamaOptions = [...AGAMA_OPTIONS]

const filteredCabang = computed(() => {
  if (!form.value.perusahaan_id) return []
  return cabangs.value.filter((c: { perusahaanId: number }) => c.perusahaanId === form.value.perusahaan_id)
})

const filteredDepartemen = computed(() => {
  if (!form.value.divisi_id) return []
  return departemens.value.filter((dep: { divisiId: number }) => dep.divisiId === form.value.divisi_id)
})

const debouncedAvailableUserSearch = useDebounceFn((term: string) => {
  if (!assignUserAccount.value) return
  pegawaiStore.fetchAvailableUsers(term, form.value.user_id || null)
}, 400)

function handleUserSearch(term: string) {
  debouncedAvailableUserSearch(term)
}

function userOptionLabel(option: { fullName?: string; email?: string; username?: string } | null) {
  if (!option) return ''
  const details = option.email || option.username || ''
  return details ? `${option.fullName} • ${details}` : String(option.fullName || '')
}

async function onAssignUserToggle(checked: boolean) {
  await pegawaiStore.setAssignUserAccount(checked)
}

function onAssignUserToggleFromEvent(e: Event) {
  const t = e.target as HTMLInputElement
  void onAssignUserToggle(t.checked)
}

function onUserSelected(userId: number | null) {
  pegawaiStore.handleUserAssignment(userId)
}

function handleCompanySelected(perusahaanId: number | null) {
  form.value.cabang_id = null
  if (perusahaanId) cabangStore.fetchCabangByPerusahaan(perusahaanId)
}

function handleDivisiSelected(divisiId: number | null) {
  form.value.departemen_id = null
  if (divisiId) departemenStore.fetchDepartemensByDivisi(divisiId)
  else departemenStore.departemens = []
}

function onAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) pegawaiStore.handleAvatarChange(file)
}

function onDocChange(field: 'cv_attachment' | 'kk_attachment' | 'ijazah_attachment' | 'skck_attachment', e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  pegawaiStore.handlePegawaiDocumentChange(field, file)
}

function formatRupiah(angka: string | number | null | undefined) {
  if (angka === null || angka === undefined) return ''
  let number_string = String(angka).replace(/[^,\d]/g, '').toString()
  const split = number_string.split(',')
  const sisa = split[0].length % 3
  let rupiah = split[0].substring(0, sisa)
  const ribuan = split[0].substring(sisa).match(/\d{3}/gi)
  if (ribuan) {
    const separator = sisa ? '.' : ''
    rupiah += separator + ribuan.join('.')
  }
  rupiah = split[1] !== undefined ? `${rupiah},${split[1]}` : rupiah
  return `Rp ${rupiah}`
}

const gajiPegawaiFormatted = computed(() => formatRupiah(form.value.gaji_pegawai))
const tunjanganPegawaiFormatted = computed(() => formatRupiah(form.value.tunjangan_pegawai))

function handleGajiInput(e: Event) {
  const t = e.target as HTMLInputElement
  form.value.gaji_pegawai = t.value.replace(/[^0-9]/g, '')
}

function handleTunjanganInput(e: Event) {
  const t = e.target as HTMLInputElement
  form.value.tunjangan_pegawai = t.value.replace(/[^0-9]/g, '')
}

async function handleSubmit() {
  await pegawaiStore.savePegawai({ navigateTo: '/hrd/pegawai' })
}

watch(
  () => kontrakDraft.jenis_kontrak,
  (v) => {
    if (v === 1) {
      kontrakDraft.tgl_selesai = ''
    }
  },
)

watch(pegawaiIdParam, async (id) => {
  if (!id) {
    pegawaiStore.$patch({ kontraks: [], kontrakWorkflowConfigured: false })
    resetKontrakDraft()
    return
  }
  if (!initializing.value) {
    await pegawaiStore.fetchPegawaiKontraks(id)
    resetKontrakDraft()
  }
})

watch(
  () => form.value.nm_pegawai,
  (newName) => {
    if (newName && !isEditMode.value && !assignUserAccount.value) {
      const firstName = String(newName).trim().split(' ')[0] || ''
      const username = firstName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '')
      if (username) form.value.username = username
    }
  },
  { immediate: true },
)

onMounted(async () => {
  initializing.value = true
  try {
    await Promise.all([
      perusahaanStore.fetchPerusahaans(),
      cabangStore.fetchCabangs(),
      divisiStore.fetchDivisis(),
      jabatanStore.fetchJabatans(),
      permissionStore.fetchPermissions(),
      userStore.loadUser(),
    ])

    if (pegawaiIdParam.value) {
      await pegawaiStore.loadPegawaiForEdit(pegawaiIdParam.value)
      await pegawaiStore.fetchPegawaiKontraks(pegawaiIdParam.value)
    } else {
      await pegawaiStore.prepareFormForPage(null)
    }

    if (form.value.perusahaan_id) {
      await cabangStore.fetchCabangByPerusahaan(form.value.perusahaan_id)
    }
  } finally {
    initializing.value = false
  }

  setFormTitle('Pegawai', !!pegawaiIdParam.value, pegawaiIdParam.value ? `#${pegawaiIdParam.value}` : '')
})
</script>

<style scoped>
/**
 * Fallback agar dropdown aksi kontrak tidak ter-clip oleh `.table-responsive`
 * (overflow-x/overflow-y) saat browser tidak menerapkan popperConfig.strategy=fixed.
 */
:deep(.table-responsive:has(.kontrak-action-dropdown.show)) {
  overflow: visible;
}
:deep(.kontrak-action-dropdown .dropdown-menu.show) {
  z-index: 1080;
}

/**
 * Nav tabs: aktifkan horizontal scroll saat sempit, namun sembunyikan
 * scrollbar agar tidak menutupi label tab.
 */
.pegawai-form-tabs {
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.pegawai-form-tabs::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
.pegawai-form-tabs .nav-item {
  flex-shrink: 0;
}
.pegawai-form-tabs .nav-link {
  white-space: nowrap;
}
</style>
