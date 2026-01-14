export default defineNuxtRouteMiddleware(async (to) => {
    // Cookie-based auth: cek apakah user sudah ter-load di store
    if (import.meta.client) {
        const { useUserStore } = await import('~/stores/user')
        const userStore = useUserStore()
        
        // Cek apakah user sudah login (ada data di store)
        if (userStore.user) {
            // Jika sudah login, redirect ke halaman sebelumnya atau dashboard
            const redirect = to.query.redirect as string || '/dashboard'
            return navigateTo(redirect)
        }
    }
})