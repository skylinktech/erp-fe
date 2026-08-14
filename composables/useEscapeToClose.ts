import { onBeforeUnmount, onMounted, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * Close a Vue-owned overlay (v-if + d-block) via ESC using the same handler as backdrop/X.
 */
export function useEscapeToClose(
  isOpen: MaybeRefOrGetter<boolean>,
  close: () => void
) {
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    if (!toValue(isOpen)) return
    event.preventDefault()
    close()
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
  })
}
