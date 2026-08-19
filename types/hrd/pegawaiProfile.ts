export interface ProfileLookup {
  id: number
  nama: string
}

export interface ProfileHistoryRow {
  id: number
  created_at: string | null
  updated_at: string | null
  jabatan: ProfileLookup | null
  perusahaan: ProfileLookup | null
  cabang: ProfileLookup | null
  divisi: ProfileLookup | null
  departemen: ProfileLookup | null
}

export interface ProfileKontrakRow {
  id: number
  jenis_kontrak: number | null
  nomor_kontrak: string | null
  tgl_mulai: string | null
  tgl_selesai: string | null
  status: number | null
  file_sk: string | null
  catatan: string | null
  induk_id: number | null
  current_approval_step: number | null
  submitted_at: string | null
  reject_reason: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ProfileKontrakAktif extends ProfileKontrakRow {
  durasi_hari: number | null
  sisa_hari: number | null
  progres_persen: number | null
}

export interface PegawaiProfileResponse {
  pegawai: {
    id_pegawai: number
    nm_pegawai: string | null
    tgl_lahir_pegawai: string | null
    tmp_lahir_pegawai: string | null
    no_tlp_pegawai: string | null
    pendidikan_pegawai: number | null
    alamat_pegawai: string | null
    status_pegawai: number | null
    no_ktp_pegawai: string | null
    nik_pegawai: string | null
    npwp_pegawai: string | null
    jenis_kelamin_pegawai: number | null
    tgl_masuk_pegawai: string | null
    tgl_keluar_pegawai: string | null
    istri_suami_pegawai: string | null
    anak_1: string | null
    anak_2: string | null
    anak_3: string | null
    avatar: string | null
    cv_attachment: string | null
    kk_attachment: string | null
    ijazah_attachment: string | null
    skck_attachment: string | null
    bpjstk: string | null
    bpjsk: string | null
    nomor_rekening: string | null
    agama: string | null
    no_tlp_keluarga: string | null
    user_id: number | null
    user: {
      id: number
      full_name: string | null
      email: string | null
      username: string | null
      is_active: boolean
    } | null
  }
  current_jabatan: ProfileHistoryRow | null
  kontrak_aktif: ProfileKontrakAktif | null
  history_jabatan: ProfileHistoryRow[]
  kontraks: ProfileKontrakRow[]
  masa_kerja: {
    total_bulan: number | null
    tgl_masuk: string | null
    tgl_keluar: string | null
  }
}

export interface AccountProfileRole {
  id: number
  name: string
}

export interface AccountProfileAccount {
  id: number
  username: string
  full_name: string | null
  email: string
  is_active: boolean
  sso_user_id: number | null
  created_at: string | null
  updated_at: string | null
  roles: AccountProfileRole[]
}

export interface AccountProfileResponse {
  account: AccountProfileAccount
  pegawai_linked: boolean
  profile: PegawaiProfileResponse | null
}
