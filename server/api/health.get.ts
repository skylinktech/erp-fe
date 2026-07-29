export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = String(config.public.apiBase || '').replace(/\/$/, '')

  const frontend = {
    status: 'ok',
    name: String(config.public.appName || 'skylink-erp-fe'),
    version: String(config.public.appVersion || '0.0.0'),
  }

  if (!apiBase) {
    return {
      status: 'ok',
      frontend,
      backend: null,
    }
  }

  try {
    const backend = await $fetch<{
      status?: string
      name?: string
      version?: string
      environment?: string
      startedAt?: string
    }>(`${apiBase}/health`, {
      method: 'GET',
      headers: { accept: 'application/json' },
    })

    return {
      status: 'ok',
      frontend,
      backend,
    }
  } catch {
    return {
      status: 'degraded',
      frontend,
      backend: null,
    }
  }
})
