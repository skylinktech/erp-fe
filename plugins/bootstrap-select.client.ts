// Load bootstrap-select AFTER bootstrap is on window (fixes "bootstrap is not defined")
export default defineNuxtPlugin(() => {
  if (import.meta.client && typeof window !== 'undefined' && (window as any).bootstrap) {
    if (document.querySelector('script[src="/vendor/libs/bootstrap-select/bootstrap-select.js"]')) return
    const script = document.createElement('script')
    script.src = '/vendor/libs/bootstrap-select/bootstrap-select.js'
    script.type = 'text/javascript'
    document.body.appendChild(script)
  }
})
