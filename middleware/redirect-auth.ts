export default defineNuxtRouteMiddleware(async (to) => {
    if (!import.meta.client) return

    // Setelah logout (hard redirect), jangan rehydrate ke dashboard
    if (to.query.logged_out === '1') {
        return
    }

    const { useUserStore } = await import('~/stores/user')
    const userStore = useUserStore()
    await userStore.ensureUserLoaded()

    if (userStore.user) {
        const redirect = (to.query.redirect as string) || '/dashboard'
        return navigateTo(redirect)
    }
})
