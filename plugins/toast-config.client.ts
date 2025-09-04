export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  // Konfigurasi default untuk toast
  toast.options = {
    position: 'top-right',
    duration: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false
  }
})
