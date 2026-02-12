// plugins/bootstrap.client.ts
// Load Bootstrap from bundle (avoids OpaqueResponseBlocking from static script + single source for dropdown/modal)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - bundle has default export
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

export default defineNuxtPlugin(() => {
  if (import.meta.client && typeof window !== 'undefined') {
    (window as any).bootstrap = bootstrap
  }
})