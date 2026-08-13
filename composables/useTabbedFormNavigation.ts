import { computed, nextTick, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

export interface TabbedFormStep {
  id: string
  label: string
  icon?: string
  badge?: string | number | null
  badgeClass?: string
  visible?: boolean
}

export interface TabbedFormNavigationOptions {
  steps: MaybeRefOrGetter<TabbedFormStep[]>
  validateStep?: (step: TabbedFormStep, index: number) => boolean | Promise<boolean>
  formRoot?: MaybeRefOrGetter<HTMLElement | null | undefined>
}

function visibleStepsFrom(steps: TabbedFormStep[]): TabbedFormStep[] {
  return steps.filter((step) => step.visible !== false)
}

function focusFirstInvalid(pane: Element | null) {
  if (!pane || typeof pane.querySelector !== 'function') return
  const invalid = pane.querySelector<HTMLElement>('.is-invalid, :invalid')
  if (!invalid) return
  invalid.focus?.()
  invalid.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
}

export function useTabbedFormNavigation(options: TabbedFormNavigationOptions) {
  const currentIndex = ref(0)
  const navigating = ref(false)

  const visibleSteps = computed(() => visibleStepsFrom(toValue(options.steps) || []))
  const currentStep = computed(() => visibleSteps.value[currentIndex.value] || visibleSteps.value[0] || null)
  const isFirstStep = computed(() => currentIndex.value <= 0)
  const isLastStep = computed(
    () => visibleSteps.value.length <= 1 || currentIndex.value >= visibleSteps.value.length - 1
  )

  watch(
    visibleSteps,
    (steps) => {
      if (!steps.length) {
        currentIndex.value = 0
        return
      }
      if (currentIndex.value > steps.length - 1) {
        currentIndex.value = steps.length - 1
      }
      if (currentIndex.value < 0) {
        currentIndex.value = 0
      }
    },
    { immediate: true }
  )

  function paneFor(step: TabbedFormStep | null): HTMLElement | null {
    if (!step || typeof document === 'undefined') return null
    const root = toValue(options.formRoot) || document
    return (
      (root.querySelector(`[data-step-id="${step.id}"]`) as HTMLElement | null) ||
      (root.querySelector(`#${step.id}`) as HTMLElement | null)
    )
  }

  async function defaultValidate(step: TabbedFormStep): Promise<boolean> {
    const pane = paneFor(step)
    if (!pane) return true
    const fields = pane.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input, select, textarea'
    )
    for (const field of Array.from(fields)) {
      if (field.disabled) continue
      if (typeof field.checkValidity === 'function' && !field.checkValidity()) {
        field.reportValidity()
        field.focus()
        field.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        return false
      }
    }
    return true
  }

  async function runValidate(index: number): Promise<boolean> {
    const step = visibleSteps.value[index]
    if (!step) return true
    const validator = options.validateStep || defaultValidate
    const ok = await validator(step, index)
    if (!ok) focusFirstInvalid(paneFor(step))
    return ok
  }

  async function goTo(index: number, opts: { skipValidation?: boolean } = {}): Promise<boolean> {
    if (navigating.value) return false
    const target = Math.max(0, Math.min(index, visibleSteps.value.length - 1))
    if (target === currentIndex.value) return true

    if (!opts.skipValidation && target > currentIndex.value) {
      navigating.value = true
      try {
        for (let i = currentIndex.value; i < target; i++) {
          const valid = await runValidate(i)
          if (!valid) {
            currentIndex.value = i
            return false
          }
        }
      } finally {
        navigating.value = false
      }
    }

    currentIndex.value = target
    await nextTick()
    const pane = paneFor(visibleSteps.value[target])
    pane?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
    return true
  }

  async function next(): Promise<boolean> {
    if (isLastStep.value) return false
    return goTo(currentIndex.value + 1)
  }

  async function previous(): Promise<boolean> {
    if (isFirstStep.value) return false
    return goTo(currentIndex.value - 1, { skipValidation: true })
  }

  async function validateCurrentStep(): Promise<boolean> {
    return runValidate(currentIndex.value)
  }

  async function validateAll(): Promise<boolean> {
    if (navigating.value) return false
    navigating.value = true
    try {
      for (let i = 0; i < visibleSteps.value.length; i++) {
        const valid = await runValidate(i)
        if (!valid) {
          currentIndex.value = i
          await nextTick()
          focusFirstInvalid(paneFor(visibleSteps.value[i]))
          return false
        }
      }
      return true
    } finally {
      navigating.value = false
    }
  }

  async function submitOrNext(onSubmit: () => unknown): Promise<boolean> {
    if (!isLastStep.value) return next()
    const ok = await validateAll()
    if (!ok) return false
    await onSubmit()
    return true
  }

  async function goToId(id: string, opts: { skipValidation?: boolean } = {}): Promise<boolean> {
    const index = visibleSteps.value.findIndex((step) => step.id === id)
    if (index < 0) return false
    return goTo(index, opts)
  }

  function isCurrent(id: string): boolean {
    return currentStep.value?.id === id
  }

  function paneClass(id: string) {
    const active = isCurrent(id)
    return {
      'tab-pane': true,
      fade: true,
      show: active,
      active,
    }
  }

  function reset(index = 0) {
    currentIndex.value = index
  }

  return {
    currentIndex,
    currentStep,
    visibleSteps,
    isFirstStep,
    isLastStep,
    navigating,
    next,
    previous,
    goTo,
    goToId,
    isCurrent,
    paneClass,
    reset,
    validateCurrentStep,
    validateAll,
    submitOrNext,
  }
}
