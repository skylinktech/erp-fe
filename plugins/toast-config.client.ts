export default defineNuxtPlugin(() => {
  const toast = useToast()

  // Global default untuk semua toast (iziToast.settings).
  // Posisi konsisten: pojok kanan bawah di seluruh aplikasi.
  toast.settings({
    position: 'bottomRight',
    timeout: 5000,
    closeOnClick: true,
    pauseOnHover: true,
    drag: true,
    progressBar: true,
    resetOnHover: false,
  })
})
