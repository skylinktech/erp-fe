<template>
  <div
    class="cetak-document"
    :class="documentClass"
    :data-print-type="type"
    :data-print-orientation="preset.orientation"
  >
    <div v-if="loading" class="text-center p-6 no-print">
      <ProgressSpinner
        style="width: 50px; height: 50px"
        strokeWidth="4"
        fill="transparent"
        animationDuration="1s"
      />
      <div class="mt-3 text-muted">Memuat data...</div>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger m-6" role="alert">
      {{ errorMessage }}
    </div>

    <div v-else-if="notFound" class="alert alert-danger m-6" role="alert">
      {{ notFoundText }}
    </div>

    <template v-else>
      <CetakPrintButton />

      <CetakHeader
        :variant="preset.headerVariant"
        :title="resolvedTitle"
        :subtitle="resolvedSubtitle"
        :brand-name="preset.brandName"
        :document-number="documentNumber"
        :show-number-under-title="showNumberUnderTitle"
        :show-npwp="preset.showNpwp"
        :header-note="headerNote"
        :header-meta="headerMeta"
        :profile="profile"
      >
        <template v-if="$slots.header" #header>
          <slot name="header" />
        </template>
      </CetakHeader>

      <hr class="cetak-hr">

      <div class="cetak-document__body">
        <slot />
      </div>

      <CetakFooter
        :title="resolvedTitle"
        :document-number="documentNumber"
        :footer-brand="preset.footerBrand"
        :revision="revision"
        :generated-at="showGeneratedAt ? generatedAtDisplay : ''"
        :show-page-number="preset.showPageNumber"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  getPrintDocumentPreset,
  type PrintDocumentType,
} from '~/constants/print/documents'
import type { CetakHeaderMetaItem } from '~/components/cetak/CetakHeader.vue'
import type { CompanyPrintSource } from '~/composables/useCompanyPrintProfile'

const props = withDefaults(
  defineProps<{
    type: PrintDocumentType
    documentNumber?: string
    status?: unknown
    title?: string
    subtitle?: string
    headerNote?: string
    headerMeta?: CetakHeaderMetaItem[]
    company?: CompanyPrintSource
    revision?: string
    generatedAt?: string | Date | null
    generatedBy?: string
    loading?: boolean
    error?: unknown
    notFound?: boolean
    notFoundMessage?: string
    autoPrint?: boolean
    showNumberUnderTitle?: boolean
  }>(),
  {
    documentNumber: '',
    status: null,
    title: '',
    subtitle: '',
    headerNote: '',
    headerMeta: () => [],
    company: null,
    revision: '',
    generatedAt: null,
    generatedBy: '',
    loading: false,
    error: null,
    notFound: false,
    notFoundMessage: '',
    autoPrint: false,
    showNumberUnderTitle: false,
  }
)

const preset = computed(() => getPrintDocumentPreset(props.type))
const paperState = useCetakPaper()
const orientationState = useCetakOrientation()

useRegisterCetakWatermark(() => props.type, () => props.status)

const { profile, ensureCompanyProfile } = useCompanyPrintProfile(() => props.company)

const resolvedTitle = computed(() => props.title || preset.value.title)
const resolvedSubtitle = computed(() => props.subtitle || preset.value.subtitle || '')
const notFoundText = computed(
  () => props.notFoundMessage || preset.value.notFoundMessage
)
const showGeneratedAt = computed(() => Boolean(props.generatedAt))

const errorMessage = computed(() => {
  const err = props.error
  if (!err) return ''
  if (typeof err === 'string') return err
  if (typeof err === 'object' && err && 'message' in err) {
    const message = (err as { message?: unknown }).message
    return message ? String(message) : ''
  }
  return ''
})

const generatedAtDisplay = computed(() => {
  if (!props.generatedAt) return ''
  const d = props.generatedAt instanceof Date ? props.generatedAt : new Date(props.generatedAt)
  if (Number.isNaN(d.getTime())) return String(props.generatedAt)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const documentClass = computed(() => ({
  'cetak-document--landscape': preset.value.orientation === 'landscape',
  [`cetak-document--${props.type.toLowerCase()}`]: true,
}))

let pageStyleEl: HTMLStyleElement | null = null
let didAutoPrint = false

function maybeAutoPrint() {
  if (!props.autoPrint || didAutoPrint) return
  if (props.loading || props.error || props.notFound) return
  didAutoPrint = true
  window.setTimeout(() => window.print(), 400)
}

function applyPrintEnvironment() {
  paperState.value = preset.value.paper
  orientationState.value = preset.value.orientation

  if (typeof document === 'undefined') return

  document.documentElement.setAttribute('data-print-paper', preset.value.paper)
  document.documentElement.setAttribute('data-print-orientation', preset.value.orientation)
  document.documentElement.setAttribute('data-print-type', props.type)

  if (!pageStyleEl) {
    pageStyleEl = document.createElement('style')
    pageStyleEl.setAttribute('data-cetak-page', 'true')
    document.head.appendChild(pageStyleEl)
  }
  pageStyleEl.textContent = `@page { size: ${preset.value.paper} ${preset.value.orientation}; margin: 0; }`
}

function clearPrintEnvironment() {
  if (typeof document === 'undefined') return
  document.documentElement.removeAttribute('data-print-paper')
  document.documentElement.removeAttribute('data-print-orientation')
  document.documentElement.removeAttribute('data-print-type')
  pageStyleEl?.remove()
  pageStyleEl = null
}

watch(
  () => [props.type, preset.value.orientation, preset.value.paper],
  () => applyPrintEnvironment(),
  { immediate: true }
)

onMounted(async () => {
  await ensureCompanyProfile()
  maybeAutoPrint()
})

watch(
  () => [props.autoPrint, props.loading, props.error, props.notFound],
  () => maybeAutoPrint()
)

onBeforeUnmount(() => {
  clearPrintEnvironment()
})
</script>
