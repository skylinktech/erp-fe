/** Types & helpers for halaman Struktur Organisasi HR. */

export type OrgStructurePegawai = {
  id_pegawai: number
  nm_pegawai: string
  nik_pegawai: string | null
  avatar: string | null
  departemen: { id: number; nama: string } | null
  divisi: { id: number; nama: string } | null
}

export type OrgStructureJabatan = {
  id_jabatan: number
  nm_jabatan: string
  level: number
  pegawais: OrgStructurePegawai[]
}

export type OrgStructureLevelDto = {
  level: number
  label: string
  jabatans: OrgStructureJabatan[]
  total_pegawai: number
}

export type OrgStructureResponse = {
  levels: OrgStructureLevelDto[]
  meta: {
    total_pegawai: number
    total_jabatan: number
    level_min: number
    level_max: number
  }
}

export const ORG_LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: 'Direksi / Pimpinan Tertinggi',
  2: 'Senior Management',
  3: 'Middle Management',
  4: 'Supervisor / Koordinator',
  5: 'Staff / Operasional',
}
