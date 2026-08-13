<template>
  <div>
    <CetakInfoGrid :left="infoLeft" :right="infoRight" />

    <CetakTable>
      <template #head>
        <tr>
          <th class="text-center" style="width: 40px;">No</th>
          <th class="text-start">Item Description</th>
          <th class="text-center" style="width: 60px;">Qty</th>
          <th class="text-end" style="width: 110px;">Unit Price</th>
          <th class="text-end" style="width: 120px;">Total</th>
        </tr>
      </template>

      <template v-if="fdrItems.length > 0">
        <tr class="cetak-table__section">
          <td colspan="5" class="text-start">Material</td>
        </tr>
        <tr v-for="(m, idx) in fdrItems" :key="'item-' + (m.id || idx)">
          <td class="text-center">{{ idx + 1 }}</td>
          <td class="cetak-desc">{{ itemName(m) }}</td>
          <td class="text-center">{{ m.quantity ?? 0 }}</td>
          <td class="cetak-num">{{ formatRupiahNum(m.price) }}</td>
          <td class="cetak-num">{{ formatRupiahNum(m.subtotal) }}</td>
        </tr>
      </template>

      <template v-if="fdrServices.length > 0">
        <tr class="cetak-table__section">
          <td colspan="5" class="text-start">Service</td>
        </tr>
        <tr v-for="(s, idx) in fdrServices" :key="'srv-' + (s.id || idx)">
          <td class="text-center">{{ fdrItems.length + idx + 1 }}</td>
          <td class="cetak-desc">{{ itemName(s) }}</td>
          <td class="text-center">{{ s.quantity ?? 0 }}</td>
          <td class="cetak-num">{{ formatRupiahNum(s.price) }}</td>
          <td class="cetak-num">{{ formatRupiahNum(s.subtotal) }}</td>
        </tr>
      </template>

      <template v-if="groupedFdrDids.length > 0">
        <tr class="cetak-table__section">
          <td colspan="5" class="text-start">DID</td>
        </tr>
        <template v-for="(group, idx) in groupedFdrDids" :key="'did-' + group.didKey">
          <tr>
            <td class="text-center">{{ fdrItems.length + fdrServices.length + idx + 1 }}</td>
            <td class="cetak-desc fw-medium">{{ group.didName }}</td>
            <td class="text-center">{{ group.totalQty }}</td>
            <td class="cetak-num">{{ formatRupiahNum(group.totalQty ? group.totalSubtotal / group.totalQty : 0) }}</td>
            <td class="cetak-num">{{ formatRupiahNum(group.totalSubtotal) }}</td>
          </tr>
          <tr
            v-for="(svc, si) in group.services"
            :key="'did-' + group.didKey + '-svc-' + si"
            class="cetak-fdr-did-child"
          >
            <td class="text-center"></td>
            <td class="cetak-desc ps-4 text-muted small">
              <span class="me-1">└</span>
              {{ svc.servicePlan?.name || '—' }} ({{ didCategoryLabel(svc.category) }})
            </td>
            <td></td>
            <td class="cetak-num">{{ formatRupiahNum(svc.price) }}</td>
            <td></td>
          </tr>
        </template>
      </template>

      <template v-if="hasTableItems">
        <tr v-if="fdr.materialSubtotal > 0" class="cetak-table__subtotal">
          <td colspan="4" class="text-end">Subtotal Material</td>
          <td class="cetak-num">{{ formatRupiahNum(fdr.materialSubtotal) }}</td>
        </tr>
        <tr v-if="fdr.serviceSubtotal > 0" class="cetak-table__subtotal">
          <td colspan="4" class="text-end">Subtotal Service</td>
          <td class="cetak-num">{{ formatRupiahNum(fdr.serviceSubtotal) }}</td>
        </tr>
        <tr v-if="fdr.didSubtotal > 0" class="cetak-table__subtotal">
          <td colspan="4" class="text-end">Subtotal DID</td>
          <td class="cetak-num">{{ formatRupiahNum(fdr.didSubtotal) }}</td>
        </tr>
        <tr class="cetak-table__total">
          <td colspan="4" class="text-end">Grand Total</td>
          <td class="cetak-num">{{ formatRupiahNum(fdr.grandTotal ?? fdr.total) }}</td>
        </tr>
      </template>

      <tr v-if="!hasTableItems">
        <td colspan="5" class="text-center py-4 text-muted">Tidak ada item</td>
      </tr>
    </CetakTable>

    <CetakNotes :text="notesText" />

    <CetakSignature
      :show="showSignatureSection"
      caption="Dokumen FDR ini telah disetujui dan ditandatangani secara digital."
      document-type="fdrs"
      :document-id="fdr.id != null ? String(fdr.id) : ''"
      :legacy-signature-token="fdr.signatureToken || undefined"
      :legacy-signer-name="legacySignerName"
      :legacy-signer-title="legacySignerTitle"
    />
  </div>
</template>

<script setup lang="ts">
type FdrRecord = Record<string, any>

const props = defineProps<{
  fdr: FdrRecord
}>()

const fdrItems = computed(() => props.fdr?.fdrItems ?? props.fdr?.fdr_items ?? [])
const fdrServices = computed(() => props.fdr?.fdrServices ?? props.fdr?.fdr_services ?? [])
const fdrDids = computed(() => props.fdr?.fdrDids ?? props.fdr?.fdr_dids ?? [])

const priorityLabel = computed(() => {
  const p = props.fdr?.priority
  const map: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High' }
  return p ? (map[p] || p) : '—'
})

const groupedFdrDids = computed(() => {
  const items = fdrDids.value
  const map = new Map<string | number, any>()
  for (const d of items) {
    const pl = d?.priceListLine ?? d?.price_list_line
    const did = pl?.did
    const didId = did?.id ?? `_${d.id ?? Math.random()}`
    const didName = did?.name || did?.code || '—'
    const services = did?.services ?? did?.did_services ?? []
    const svcList = Array.isArray(services) ? services : []
    if (map.has(didId)) {
      const g = map.get(didId)
      g.items.push(d)
      g.totalQty += Number(d.quantity ?? 1)
      g.totalSubtotal += Number(d.subtotal ?? 0)
    } else {
      map.set(didId, {
        didKey: didId,
        didName,
        services: svcList,
        items: [d],
        totalQty: Number(d.quantity ?? 1),
        totalSubtotal: Number(d.subtotal ?? 0),
      })
    }
  }
  return Array.from(map.values()).map((g) => {
    const servicesWithPrice = (g.services || []).map((svc: any, i: number) => {
      const it = g.items?.[i]
      const price = it?.price ?? it?.priceListLine?.price ?? it?.price_list_line?.price ?? (svc?.price ?? 0)
      return { ...svc, price: Number(price) || 0 }
    })
    return { ...g, services: servicesWithPrice }
  })
})

const hasTableItems = computed(
  () => fdrItems.value.length + fdrServices.value.length + groupedFdrDids.value.length > 0
)

const notesText = computed(() => {
  const n = props.fdr?.notes
  return n && String(n).trim() ? String(n).trim() : ''
})

const showSignatureSection = computed(() => props.fdr?.status === 'approved')
const legacySignerName = computed(() => props.fdr?.approvedByUser?.fullName || undefined)
const legacySignerTitle = computed(() => {
  const user = props.fdr?.approvedByUser
  return user?.roles?.[0]?.name || undefined
})

const infoLeft = computed(() => [
  { label: 'No. FDR', value: props.fdr.fdrNumber || '—' },
  { label: 'Tanggal FDR', value: formatDate(props.fdr.fdrDate) },
  { label: 'Nama Project', value: props.fdr.name || '—' },
  { label: 'Customer', value: props.fdr.customer?.name || '—' },
  { label: 'PIC', value: props.fdr.createdByUser?.fullName || '—' },
  { label: 'Lokasi', value: props.fdr.location || '—' },
])

const infoRight = computed(() => [
  { label: 'Priority', value: priorityLabel.value },
  { label: 'Quantity', value: props.fdr.quantity ?? '—' },
  { label: 'Est. Start', value: formatDate(props.fdr.estimatedStartDate) },
  { label: 'Est. Completion', value: formatDate(props.fdr.estimatedCompletionDate) },
  { label: 'Site', value: props.fdr.site?.name || props.fdr.site?.code || '—' },
  { label: 'Skema', value: props.fdr.businessScheme?.name || props.fdr.businessScheme?.code || '—' },
])

function itemName(item: any) {
  const pl = item?.priceListLine ?? item?.price_list_line
  if (pl?.product) return pl.product.name || pl.product.sku || '—'
  if (pl?.service) return pl.service.name || pl.service.code || '—'
  if (pl?.did) return pl.did.name || pl.did.code || '—'
  return '—'
}

function didCategoryLabel(category: string | null | undefined) {
  const map: Record<string, string> = {
    delivery: 'Delivery',
    dismantle: 'Dismantle',
    installation: 'Installation',
    survey: 'Survey',
  }
  return map[(category || '').toLowerCase()] || category || '—'
}

function formatRupiahNum(val: unknown) {
  if (val === null || val === undefined || val === '') return '—'
  const n = typeof val === 'string' ? Number(val.replace(/[^0-9.-]/g, '')) : Number(val)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(n))
}

function formatDate(val: unknown) {
  if (!val) return '—'
  const d = typeof val === 'string' ? new Date(val) : (val as Date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.cetak-fdr-did-child td {
  background-color: #fafbfc;
  font-size: 11px;
}
</style>
