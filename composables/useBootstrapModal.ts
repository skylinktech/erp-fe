import {
  onBeforeUnmount,
  nextTick,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'

export type BootstrapModalInstance = {
  show: () => void
  hide: () => void
  dispose: () => void
}

type BootstrapModalApi = {
  getOrCreateInstance: (
    element: Element,
    config?: { backdrop?: boolean | 'static'; keyboard?: boolean; focus?: boolean }
  ) => BootstrapModalInstance
  getInstance: (element: Element) => BootstrapModalInstance | null
}

function getModalApi(): BootstrapModalApi | null {
  if (typeof window === 'undefined') return null
  return (window as any).bootstrap?.Modal ?? null
}

/**
 * Single Bootstrap Modal instance bound to Vue open state.
 * Backdrop, ESC, X, and programmatic hide all funnel through `onClose`.
 */
export function useBootstrapModal(
  getElement: () => HTMLElement | null | undefined,
  isOpen: MaybeRefOrGetter<boolean>,
  onClose: () => void,
  options?: { backdrop?: boolean | 'static'; keyboard?: boolean }
) {
  let boundEl: HTMLElement | null = null

  const handleHidden = () => {
    if (toValue(isOpen)) onClose()
  }

  const handleShown = () => {
    const el = getElement()
    const dialog = el?.querySelector('.modal-dialog') as HTMLElement | null
    dialog?.focus?.()
  }

  function ensureInstance(): BootstrapModalInstance | null {
    const el = getElement()
    const Modal = getModalApi()
    if (!el || !Modal) return null

    if (boundEl && boundEl !== el) {
      boundEl.removeEventListener('hidden.bs.modal', handleHidden)
      boundEl.removeEventListener('shown.bs.modal', handleShown)
      Modal.getInstance(boundEl)?.dispose()
      boundEl = null
    }

    if (boundEl !== el) {
      el.addEventListener('hidden.bs.modal', handleHidden)
      el.addEventListener('shown.bs.modal', handleShown)
      boundEl = el
    }

    return Modal.getOrCreateInstance(el, {
      backdrop: options?.backdrop ?? true,
      keyboard: options?.keyboard ?? true,
      focus: true,
    })
  }

  watch(
    () => [toValue(isOpen), getElement()] as const,
    async ([open]) => {
      await nextTick()
      if (open) {
        ensureInstance()?.show()
        return
      }
      const el = getElement()
      const existing = el ? getModalApi()?.getInstance(el) : null
      existing?.hide()
    },
    { flush: 'post' }
  )

  onBeforeUnmount(() => {
    const el = boundEl || getElement() || null
    if (el) {
      el.removeEventListener('hidden.bs.modal', handleHidden)
      el.removeEventListener('shown.bs.modal', handleShown)
    }
    const Modal = getModalApi()
    const instance = el ? Modal?.getInstance(el) : null
    instance?.dispose()
    boundEl = null
  })

  return {
    show() {
      ensureInstance()?.show()
    },
    hide() {
      ensureInstance()?.hide()
    },
  }
}
