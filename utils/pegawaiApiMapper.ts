/**
 * Lucid / Adonis mengirim JSON model dengan properti camelCase (mis. `nmPegawai`, `idPegawai`),
 * sementara form HR memakai snake_case (`nm_pegawai`, `id_pegawai`). Fungsi ini menormalisasi payload GET pegawai.
 */

const PEGAWAI_SNAKE_KEYS = [
  'id_pegawai',
  'nm_pegawai',
  'tgl_lahir_pegawai',
  'tmp_lahir_pegawai',
  'no_tlp_pegawai',
  'pendidikan_pegawai',
  'alamat_pegawai',
  'status_pegawai',
  'no_ktp_pegawai',
  'nik_pegawai',
  'npwp_pegawai',
  'jenis_kelamin_pegawai',
  'tgl_masuk_pegawai',
  'tgl_keluar_pegawai',
  'istri_suami_pegawai',
  'anak_1',
  'anak_2',
  'anak_3',
  'avatar',
  'cv_attachment',
  'kk_attachment',
  'ijazah_attachment',
  'skck_attachment',
  'bpjstk',
  'bpjsk',
  'nomor_rekening',
  'agama',
  'no_tlp_keluarga',
  'user_id',
] as const

function snakeToCamelCase(snakeKey: string): string {
  return snakeKey.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function pickSnakeOrCamel(raw: Record<string, unknown>, snakeKey: string): unknown {
  const camel = snakeToCamelCase(snakeKey)
  if (Object.prototype.hasOwnProperty.call(raw, snakeKey)) {
    return raw[snakeKey]
  }
  if (Object.prototype.hasOwnProperty.call(raw, camel)) {
    return raw[camel]
  }
  return undefined
}

/**
 * Salin nilai ke kunci snake_case yang dipakai form (tanpa menghapus kunci lain pada `raw`).
 */
export function normalizeLucidPegawaiRow(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw }
  for (const snakeKey of PEGAWAI_SNAKE_KEYS) {
    const v = pickSnakeOrCamel(raw, snakeKey)
    if (v !== undefined) {
      out[snakeKey] = v
    }
  }
  return out
}

/**
 * Normalizes GET /pegawai/:id (Lucid + relations) into the same "row" shape
 * used by the datatable index and `prepareFormForPage` (expects `history` + flat email/username).
 */
export function mapPegawaiShowResponseToListRow(raw: Record<string, unknown>): Record<string, unknown> {
  const normalized = normalizeLucidPegawaiRow(raw)
  const out: Record<string, unknown> = { ...normalized }

  const user = (normalized.users ?? normalized.user) as Record<string, unknown> | undefined
  out.email = (user?.email as string) ?? (normalized.email as string) ?? '-'
  out.username = (user?.username as string) ?? (normalized.username as string) ?? '-'

  const rawHist =
    (normalized.pegawaiHistory as unknown[]) ??
    (normalized.PegawaiHistory as unknown[]) ??
    (normalized.pegawai_histories as unknown[]) ??
    []
  const histories = Array.isArray(rawHist) ? rawHist : []
  const history = histories
    .slice()
    .sort((a, b) => {
      const aRec = a as Record<string, unknown>
      const bRec = b as Record<string, unknown>
      const da = new Date(String(aRec.created_at ?? aRec.createdAt ?? 0)).getTime()
      const db = new Date(String(bRec.created_at ?? bRec.createdAt ?? 0)).getTime()
      return db - da
    })[0] as Record<string, unknown> | undefined

  if (history) {
    const jb = history.jabatan as Record<string, unknown> | undefined
    const pr = history.perusahaan as Record<string, unknown> | undefined
    const cb = history.cabang as Record<string, unknown> | undefined
    const dv = history.divisi as Record<string, unknown> | undefined
    const dp = history.departemen as Record<string, unknown> | undefined

    out.history = {
      id: history.id,
      jabatan: jb
        ? {
            id_jabatan: (jb.id_jabatan ?? jb.idJabatan ?? jb.id) as number,
            id: jb.id,
            nama: (jb.nm_jabatan ?? jb.nmJabatan) as string,
          }
        : null,
      perusahaan: pr
        ? {
            id: pr.id as number,
            nama: (pr.nmPerusahaan ?? pr.nm_perusahaan) as string,
          }
        : null,
      cabang: cb
        ? {
            id: cb.id as number,
            nama: (cb.nmCabang ?? cb.nm_cabang) as string,
          }
        : null,
      divisi: dv
        ? {
            id: dv.id as number,
            nama: (dv.nm_divisi ?? dv.nmDivisi) as string,
          }
        : null,
      departemen: dp
        ? {
            id: dp.id as number,
            nama: (dp.nm_departemen ?? dp.nmDepartemen) as string,
          }
        : null,
    }
  } else {
    out.history = null
  }

  return out
}
