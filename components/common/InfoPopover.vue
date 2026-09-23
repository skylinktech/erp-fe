<template>
  <button
    ref="triggerRef"
    type="button"
    class="info-popover-trigger"
    :aria-label="ariaLabel"
    :aria-expanded="open ? 'true' : 'false'"
    :aria-controls="open ? popoverId : undefined"
    :aria-describedby="open ? popoverId : undefined"
    @click.stop.prevent="toggle"
    @keydown="onKeydown"
  >
    <i class="ri-information-line" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useRoute } from 'vue-router'

export interface InfoPopoverProps {
  title: string
  description: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  /** Override default aria-label; defaults to "Lihat informasi {title}" */
  label?: string
}

const props = withDefaults(defineProps<InfoPopoverProps>(), {
  placement: 'auto',
  label: undefined,
})

const triggerRef = ref<HTMLButtonElement | null>(null)
const open = ref(false)
const uid = useId()
const popoverId = computed(() => `info-popover-${uid}`)

const ariaLabel = computed(
  () => props.label || `Lihat informasi ${props.title || ''}`.trim()
)

type BootstrapPopover = {
  show: () => void
  hide: () => void
  dispose: () => void
  setContent?: (content: { '.popover-header'?: string; '.popover-body'?: string }) => void
}

type BootstrapNamespace = {
  Popover: new (
    element: HTMLElement,
    options: Record<string, unknown>
  ) => BootstrapPopover
}

let popover: BootstrapPopover | null = null
let mounted = false

/** Only one informational popover open at a time across the app */
let activeController: { close: () => void } | null = null

function getBootstrap(): BootstrapNamespace | null {
  if (!import.meta.client || typeof window === 'undefined') return null
  return (window as unknown as { bootstrap?: BootstrapNamespace }).bootstrap || null
}

function ensurePopover(): BootstrapPopover | null {
  if (!import.meta.client || !mounted) return null
  const el = triggerRef.value
  const bs = getBootstrap()
  if (!el || !bs?.Popover) return null

  if (!popover) {
    popover = new bs.Popover(el, {
      trigger: 'manual',
      placement: props.placement === 'auto' ? 'auto' : props.placement,
      title: props.title,
      content: props.description,
      html: false,
      sanitize: true,
      container: 'body',
      customClass: 'skyflow-info-popover',
      fallbackPlacements: ['top', 'bottom', 'left', 'right'],
      popperConfig: {
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
              padding: 12,
            },
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top', 'bottom', 'left', 'right'],
            },
          },
        ],
      },
    })
  } else if (typeof popover.setContent === 'function') {
    popover.setContent({
      '.popover-header': props.title,
      '.popover-body': props.description,
    })
  }

  return popover
}

function syncPopoverDomId() {
  if (!import.meta.client) return
  const tip = document.getElementById(popoverId.value)
  if (tip) return
  // Bootstrap assigns its own id; sync aria-controls to the live tip
  const tips = document.querySelectorAll('.skyflow-info-popover.show, .popover.skyflow-info-popover')
  const last = tips[tips.length - 1] as HTMLElement | undefined
  if (last && !last.id) last.id = popoverId.value
}

function close() {
  if (!open.value) return
  try {
    popover?.hide()
  } catch {
    /* ignore */
  }
  open.value = false
  if (activeController?.close === close) activeController = null
  removeGlobalListeners()
}

function openPopover() {
  if (!import.meta.client || !mounted) return
  if (activeController && activeController.close !== close) {
    activeController.close()
  }
  const inst = ensurePopover()
  if (!inst) return
  inst.show()
  open.value = true
  activeController = { close }
  nextTick(() => {
    syncPopoverDomId()
    const tip = document.querySelector('.popover.skyflow-info-popover') as HTMLElement | null
    if (tip) {
      tip.id = popoverId.value
      tip.setAttribute('role', 'tooltip')
    }
  })
  addGlobalListeners()
}

function toggle() {
  if (open.value) close()
  else openPopover()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    e.stopPropagation()
    close()
    triggerRef.value?.focus()
  }
}

function onDocumentPointerDown(e: Event) {
  if (!open.value) return
  const target = e.target as Node | null
  const tip = document.getElementById(popoverId.value)
  if (triggerRef.value?.contains(target as Node)) return
  if (tip?.contains(target as Node)) return
  // Also match any skyflow info popover tip
  const anyTip = document.querySelector('.popover.skyflow-info-popover')
  if (anyTip?.contains(target as Node)) return
  close()
}

function onDocumentKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    close()
    triggerRef.value?.focus()
  }
}

let listenersAttached = false

function addGlobalListeners() {
  if (!import.meta.client || listenersAttached) return
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('keydown', onDocumentKeydown, true)
  listenersAttached = true
}

function removeGlobalListeners() {
  if (!import.meta.client || !listenersAttached) return
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onDocumentKeydown, true)
  listenersAttached = false
}

function disposePopover() {
  close()
  try {
    popover?.dispose()
  } catch {
    /* ignore */
  }
  popover = null
  // Remove orphaned tips that may linger after dispose races
  if (import.meta.client) {
    document.querySelectorAll(`#${CSS.escape(popoverId.value)}`).forEach((n) => n.remove())
  }
}

const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    close()
  }
)

watch(
  () => [props.title, props.description, props.placement] as const,
  () => {
    if (!popover) return
    // Recreate so placement/title/content stay in sync
    const wasOpen = open.value
    disposePopover()
    if (wasOpen) openPopover()
  }
)

onMounted(() => {
  mounted = true
})

onBeforeUnmount(() => {
  mounted = false
  disposePopover()
  removeGlobalListeners()
})
</script>

<style scoped>
.info-popover-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  margin: -6px -4px -6px 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--bs-secondary-color, #6c757d);
  line-height: 1;
  cursor: pointer;
  vertical-align: middle;
}

.info-popover-trigger:hover,
.info-popover-trigger:focus-visible {
  color: var(--bs-primary, #008fec);
  background: rgba(0, 143, 236, 0.08);
  outline: none;
}

.info-popover-trigger:focus-visible {
  box-shadow: 0 0 0 2px rgba(0, 143, 236, 0.35);
}

.info-popover-trigger i {
  font-size: 15px;
  line-height: 1;
  pointer-events: none;
}

@media (min-width: 768px) {
  .info-popover-trigger {
    width: 36px;
    height: 36px;
  }
}
</style>

<!-- Global popover skin (teleported to body) -->
<style>
.popover.skyflow-info-popover {
  --bs-popover-max-width: 320px;
  z-index: 1080;
  max-width: min(320px, calc(100vw - 24px));
}

.popover.skyflow-info-popover .popover-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2f2b3d;
  background: #fff;
  border-bottom: 1px solid rgba(47, 43, 61, 0.08);
  padding: 0.625rem 0.875rem;
}

.popover.skyflow-info-popover .popover-body {
  font-size: 0.8125rem;
  line-height: 1.45;
  color: #6d6777;
  padding: 0.625rem 0.875rem;
  white-space: normal;
  word-break: break-word;
}

@media (max-width: 575.98px) {
  .popover.skyflow-info-popover {
    --bs-popover-max-width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
  }
}
</style>
