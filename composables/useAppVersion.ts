type BackendHealth = {
  status?: string
  name?: string
  version?: string
  environment?: string
  startedAt?: string
}

export function useAppVersion() {
  const config = useRuntimeConfig()

  const frontendVersion = computed(() => String(config.public.appVersion || '0.0.0'))
  const backendVersion = ref<string | null>(null)
  const healthStatus = ref<'idle' | 'loading' | 'ok' | 'degraded'>('idle')

  const versionLabel = computed(() => {
    if (backendVersion.value) {
      return `v${frontendVersion.value} / API v${backendVersion.value}`
    }
    return `v${frontendVersion.value}`
  })

  async function fetchHealth() {
    healthStatus.value = 'loading'

    const apiBase = String(config.public.apiBase || '').replace(/\/$/, '')
    if (!apiBase) {
      healthStatus.value = 'degraded'
      return
    }

    try {
      const data = await $fetch<BackendHealth>(`${apiBase}/health`, {
        method: 'GET',
        headers: { accept: 'application/json' },
      })
      backendVersion.value = data.version ?? null
      healthStatus.value = data.status === 'ok' ? 'ok' : 'degraded'
    } catch {
      healthStatus.value = 'degraded'
      backendVersion.value = null
    }
  }

  return {
    frontendVersion,
    backendVersion,
    healthStatus,
    versionLabel,
    fetchHealth,
  }
}
