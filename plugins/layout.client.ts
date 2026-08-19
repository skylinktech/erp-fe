export default defineNuxtPlugin(() => {
  const layoutStore = useLayoutStore()
  layoutStore.initializeLayout()
})
