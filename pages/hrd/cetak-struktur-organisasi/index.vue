<template>
  <CetakDocument
    type="STRUKTUR_ORGANISASI"
    :subtitle="companySubtitle"
    :header-note="filterSummary ? `Filter: ${filterSummary}` : ''"
    :company="perusahaan"
    :generated-at="printedAt"
    :loading="loading"
    :error="error"
    :not-found="false"
  >
    <div v-if="!hasChartData" class="org-print-empty">
      Tidak ada data struktur organisasi untuk filter yang dipilih.
    </div>

    <div v-else class="oc-chart">
      <!-- Level 1: Executive -->
      <div v-if="executives.length" class="oc-block">
        <ul class="oc-list oc-list-root" :data-count="executives.length">
          <li v-for="exec in executives" :key="exec.id_pegawai" class="oc-item">
            <div class="oc-card oc-card-exec">
              <div class="oc-photo oc-photo-exec">
                <img
                  :src="getUserAvatar(exec.avatar)"
                  :alt="exec.nm_pegawai"
                  @error="(e) => handleImageError(e, '/img/default-avatar.png')"
                />
              </div>
              <p class="oc-name">{{ exec.nm_pegawai }}</p>
              <p class="oc-role">{{ exec.jabatanLabel }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Levels 2–5 -->
      <template v-for="(levelBlock, levelIdx) in branchLevels" :key="levelBlock.level">
        <ul
          class="oc-list oc-list-branch"
          :data-count="visibleJabatans(levelBlock).length"
        >
          <li
            v-for="jabatan in visibleJabatans(levelBlock)"
            :key="jabatan.id_jabatan"
            class="oc-item oc-item-branch"
          >
            <div class="oc-card oc-card-dept">{{ jabatan.nm_jabatan }}</div>

            <!-- Staff di bawah jabatan -->
            <ul
              v-if="jabatan.pegawais.length"
              class="oc-list oc-list-staff"
              :data-count="jabatan.pegawais.length"
            >
              <li
                v-for="pegawai in jabatan.pegawais"
                :key="pegawai.id_pegawai"
                class="oc-item"
              >
                <div class="oc-card oc-card-staff">
                  <div class="oc-photo oc-photo-staff">
                    <img
                      :src="getUserAvatar(pegawai.avatar)"
                      :alt="pegawai.nm_pegawai"
                      @error="(e) => handleImageError(e, '/img/default-avatar.png')"
                    />
                  </div>
                  <p class="oc-name oc-name-staff">{{ pegawai.nm_pegawai }}</p>
                  <p class="oc-role oc-role-staff">{{ jabatan.nm_jabatan }}</p>
                </div>
              </li>
            </ul>
          </li>
        </ul>

        <!-- Bridge antar level (hanya jika ada level berikutnya) -->
        <div
          v-if="levelIdx < branchLevels.length - 1 && visibleJabatans(branchLevels[levelIdx + 1]).length"
          class="oc-bridge"
          :data-count="visibleJabatans(branchLevels[levelIdx + 1]).length"
        ></div>
      </template>
    </div>
  </CetakDocument>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import { apiFetch } from '~/utils/apiFetch'
import type {
  OrgStructureJabatan,
  OrgStructureLevelDto,
  OrgStructureResponse,
} from '~/constants/hrd/orgStructure'

definePageMeta({
  layout: 'cetak',
  middleware: ['auth', 'check-permission'],
  title: 'Cetak Struktur Organisasi',
})

type ExecutiveNode = {
  id_pegawai: number
  nm_pegawai: string
  avatar: string | null
  jabatanLabel: string
}

const { setDetailTitle } = useDynamicTitle()
const { getUserAvatar, handleImageError } = useImageUrl()
const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const levels = ref<OrgStructureLevelDto[]>([])
const perusahaan = ref<Record<string, any> | null>(null)
const divisiLabel = ref<string | null>(null)
const departemenLabel = ref<string | null>(null)

const searchQuery = computed(() => String(route.query.search ?? '').trim())
const divisiId = computed(() => {
  const v = route.query.divisi_id
  return v ? Number(v) : null
})
const departemenId = computed(() => {
  const v = route.query.departemen_id
  return v ? Number(v) : null
})

const companyName = computed(
  () => perusahaan.value?.nmPerusahaan ?? perusahaan.value?.nm_perusahaan ?? 'Perusahaan'
)

const companySubtitle = computed(() => {
  const nm = companyName.value
  return nm && nm !== 'Perusahaan' ? nm : 'organisasi perusahaan'
})

const printedAt = computed(() =>
  new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
)

const filterSummary = computed(() => {
  const parts: string[] = []
  if (searchQuery.value) parts.push(`"${searchQuery.value}"`)
  if (divisiLabel.value) parts.push(`Divisi: ${divisiLabel.value}`)
  if (departemenLabel.value) parts.push(`Departemen: ${departemenLabel.value}`)
  return parts.length ? parts.join(' · ') : null
})

const executives = computed<ExecutiveNode[]>(() => {
  const l1 = levels.value.find((l) => l.level === 1)
  if (!l1) return []
  const result: ExecutiveNode[] = []
  for (const jabatan of l1.jabatans) {
    for (const pegawai of jabatan.pegawais) {
      result.push({
        id_pegawai: pegawai.id_pegawai,
        nm_pegawai: pegawai.nm_pegawai,
        avatar: pegawai.avatar,
        jabatanLabel: `${jabatan.nm_jabatan} ${companyName.value}`,
      })
    }
  }
  return result
})

const branchLevels = computed(() =>
  levels.value.filter((l) => l.level >= 2 && visibleJabatans(l).length > 0)
)

const hasChartData = computed(
  () => executives.value.length > 0 || branchLevels.value.length > 0
)

/** Tampilkan jabatan yang punya pegawai, atau semua jabatan level ini jika tidak ada satupun yang terisi. */
function visibleJabatans(level: OrgStructureLevelDto): OrgStructureJabatan[] {
  const withPegawai = level.jabatans.filter((j) => j.pegawais.length > 0)
  return withPegawai.length > 0 ? withPegawai : level.jabatans
}

async function resolveFilterLabels() {
  const { $api } = useNuxtApp()
  try {
    const tasks: Promise<void>[] = []
    if (divisiId.value) {
      tasks.push(
        fetch(`${$api.divisi()}?rows=500&page=1`, { credentials: 'include' })
          .then((r) => r.json())
          .then((json) => {
            const list = json?.data ?? []
            const found = (Array.isArray(list) ? list : []).find(
              (d: any) => Number(d.id) === divisiId.value
            )
            divisiLabel.value = found?.nm_divisi ?? found?.nmDivisi ?? null
          })
      )
    }
    if (departemenId.value) {
      tasks.push(
        fetch($api.dataDepartemen(), { credentials: 'include' })
          .then((r) => r.json())
          .then((json) => {
            const list = json?.data ?? json ?? []
            const found = (Array.isArray(list) ? list : []).find(
              (d: any) => Number(d.id) === departemenId.value
            )
            departemenLabel.value = found?.nm_departemen ?? found?.nmDepartemen ?? null
          })
      )
    }
    await Promise.all(tasks)
  } catch {
    // opsional
  }
}

onMounted(async () => {
  setDetailTitle('Cetak Struktur Organisasi', '', false)
  const { $api } = useNuxtApp()

  try {
    const qs = new URLSearchParams()
    if (searchQuery.value) qs.set('search', searchQuery.value)
    if (divisiId.value) qs.set('divisi_id', String(divisiId.value))
    if (departemenId.value) qs.set('departemen_id', String(departemenId.value))

    const structureUrl = qs.toString()
      ? `${$api.hrStrukturOrganisasi()}?${qs.toString()}`
      : $api.hrStrukturOrganisasi()

    const [structureRes, perusahaanRes] = await Promise.all([
      apiFetch<{ data: OrgStructureResponse }>(structureUrl, { credentials: 'include' }),
      fetch($api.dataPerusahaan(), { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      resolveFilterLabels(),
    ])

    levels.value = structureRes.data?.levels ?? []

    const perusahaanList = perusahaanRes?.data ?? perusahaanRes ?? []
    perusahaan.value = Array.isArray(perusahaanList) && perusahaanList.length ? perusahaanList[0] : null
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal memuat data cetak.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.oc-chart,
.org-print-empty {
  --oc-navy: #1e3348;
  --oc-navy-light: #3d5166;
  --oc-peach: #f5c4a8;
  --oc-peach-border: #e8b090;
  --oc-line: #4a5568;
  --oc-v-gap: 24px;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: var(--oc-navy);
}

.org-print-empty {
  text-align: center;
  padding: 3rem;
  color: var(--oc-navy-light);
}

/* ── Chart container ── */
.oc-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.oc-block {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* ── Generic tree list ── */
.oc-list {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}

.oc-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 0 0 auto;
  padding: 0 14px;
}

/* ── Cards ── */
.oc-card-exec {
  position: relative;
  background: #fff;
  border: 1.5px solid var(--oc-navy);
  border-radius: 14px;
  padding: 2.75rem 1.75rem 1.15rem;
  min-width: 240px;
  max-width: 300px;
  text-align: center;
  margin-top: 2.5rem;
}

.oc-photo-exec {
  position: absolute;
  top: -2.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1.5px var(--oc-navy);
  background: #eee;
}

.oc-photo-exec img,
.oc-photo-staff img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.oc-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  line-height: 1.3;
}

.oc-role {
  font-size: 0.8rem;
  color: var(--oc-navy-light);
  margin: 0;
  line-height: 1.4;
}

.oc-card-dept {
  background: var(--oc-peach);
  border: 1.5px solid var(--oc-peach-border);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  font-size: 0.88rem;
  font-weight: 700;
  text-align: center;
  min-width: 140px;
  max-width: 220px;
  line-height: 1.35;
}

.oc-card-staff {
  position: relative;
  background: #fff;
  border: 1.5px solid var(--oc-navy);
  border-radius: 12px;
  padding: 2.25rem 0.65rem 0.75rem;
  width: 124px;
  min-height: 138px;
  text-align: center;
  margin-top: 1.75rem;
}

.oc-photo-staff {
  position: absolute;
  top: -1.75rem;
  left: 50%;
  transform: translateX(-50%);
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1.5px var(--oc-navy);
  background: #eee;
}

.oc-name-staff {
  font-size: 0.75rem;
}

.oc-role-staff {
  font-size: 0.62rem;
  line-height: 1.35;
}

/* ── Connector: root → branch level ── */
.oc-block + .oc-list-branch {
  padding-top: var(--oc-v-gap);
}

.oc-block + .oc-list-branch::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5px;
  height: var(--oc-v-gap);
  background: var(--oc-line);
}

/* ── Connector: branch level items ── */
.oc-list-branch {
  padding-top: 0;
}

.oc-list-branch > .oc-item {
  padding-top: var(--oc-v-gap);
}

.oc-list-branch > .oc-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5px;
  height: var(--oc-v-gap);
  background: var(--oc-line);
}

/* Satu anak: garis vertikal saja */
.oc-list-branch[data-count='1'] > .oc-item::before {
  display: none;
}

.oc-list-branch[data-count='1'] > .oc-item::after {
  display: none;
}

.oc-block + .oc-list-branch > .oc-item {
  padding-top: 0;
}

.oc-block + .oc-list-branch[data-count='1'] > .oc-item {
  padding-top: 0;
}

.oc-bridge + .oc-list-branch > .oc-item {
  padding-top: var(--oc-v-gap);
}

.oc-bridge + .oc-list-branch[data-count='1'] > .oc-item {
  padding-top: 0;
}

.oc-chart > .oc-list-branch:first-child > .oc-item {
  padding-top: 0;
}

/* Horizontal bar between siblings (branch level) */
.oc-list-branch > .oc-item::after {
  content: '';
  position: absolute;
  top: 0;
  height: 1.5px;
  background: var(--oc-line);
}

.oc-list-branch[data-count='1'] > .oc-item::after {
  display: none;
}

.oc-list-branch > .oc-item:first-child::after {
  left: 50%;
  right: 0;
}

.oc-list-branch > .oc-item:last-child::after {
  left: 0;
  right: 50%;
}

.oc-list-branch > .oc-item:not(:first-child):not(:last-child)::after {
  left: 0;
  right: 0;
}

/* ── Connector: staff under jabatan ── */
.oc-list-staff {
  padding-top: var(--oc-v-gap);
}

.oc-list-staff > .oc-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5px;
  height: var(--oc-v-gap);
  background: var(--oc-line);
}

.oc-list-staff > .oc-item::after {
  content: '';
  position: absolute;
  top: 0;
  height: 1.5px;
  background: var(--oc-line);
}

.oc-list-staff[data-count='1'] > .oc-item::after {
  display: none;
}

.oc-list-staff[data-count='1'] > .oc-item::before {
  display: none;
}

.oc-list-staff[data-count='1'] {
  padding-top: var(--oc-v-gap);
}

.oc-list-staff[data-count='1']::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5px;
  height: var(--oc-v-gap);
  background: var(--oc-line);
}

.oc-list-staff > .oc-item:first-child::after {
  left: 50%;
  right: 0;
}

.oc-list-staff > .oc-item:last-child::after {
  left: 0;
  right: 50%;
}

.oc-list-staff > .oc-item:not(:first-child):not(:last-child)::after {
  left: 0;
  right: 0;
}

/* ── Connector: root executives (multi) ── */
.oc-list-root[data-count]:not([data-count='1']) {
  padding-bottom: var(--oc-v-gap);
}

.oc-list-root[data-count]:not([data-count='1']) > .oc-item::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5px;
  height: var(--oc-v-gap);
  background: var(--oc-line);
}

.oc-list-root[data-count]:not([data-count='1']) > .oc-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  height: 1.5px;
  background: var(--oc-line);
}

.oc-list-root[data-count]:not([data-count='1']) > .oc-item:first-child::after {
  left: 50%;
  right: 0;
}

.oc-list-root[data-count]:not([data-count='1']) > .oc-item:last-child::after {
  left: 0;
  right: 50%;
}

.oc-list-root[data-count]:not([data-count='1']) > .oc-item:not(:first-child):not(:last-child)::after {
  left: 0;
  right: 0;
}

/* Bridge between branch levels */
.oc-bridge {
  width: 1.5px;
  height: var(--oc-v-gap);
  background: var(--oc-line);
  margin: 0 auto;
}

.oc-item-branch {
  min-width: 150px;
}
</style>

<style>
@media print {
  .oc-card-dept {
    background: #f5c4a8 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .oc-card-exec,
  .oc-card-staff,
  .oc-item-branch {
    page-break-inside: avoid;
  }
}
</style>
