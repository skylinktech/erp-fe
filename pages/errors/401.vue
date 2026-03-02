<template>
    <div class="misc-wrapper">
      <h1 class="mb-2 mx-2" style="font-size: 6rem; line-height: 6rem">401</h1>
      <h4 class="mb-2">Anda tidak diizinkan mengakses halaman ini! 🔐</h4>
      <p class="mb-3 mx-2">Login dulu ya!</p>
      <div>
        <button @click="goToLogin" class="btn btn-primary text-center">Login</button>
      </div>
      <div class="d-flex justify-content-center mt-12">
        <img
          src="/img/illustrations/misc-not-authorized-object.png"
          alt="misc-not-authorized"
          class="img-fluid misc-object d-none d-lg-inline-block"
          width="190" />
        <img
          src="/img/illustrations/misc-bg-light.png"
          alt="misc-not-authorized"
          class="misc-bg d-none d-lg-inline-block"
          data-app-light-img="illustrations/misc-bg-light.png"
          data-app-dark-img="illustrations/misc-bg-dark.png" />
        <div class="d-flex flex-column align-items-center">
          <img
            src="/img/illustrations/misc-not-authorized-illustration.png"
            alt="misc-not-authorized"
            class="img-fluid z-1"
            width="160" />
        </div>
      </div>
    </div>
</template>

<script setup>
import { useDynamicTitle } from '~/composables/useDynamicTitle'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()

// Function to navigate to login page
const goToLogin = () => {
  navigateTo('/auth/login')
}

definePageMeta({
    layout: 'auth',
    title: '401 - Unauthorized',
    description: '401 - Unauthorized',
    keywords: '401 - Unauthorized, Sinergi Innovate Pratama',
    author: 'Sinergi Innovate Pratama',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})
</script>

<style scoped>
.btn {
  cursor: pointer !important;
  text-decoration: none !important;
  display: inline-block !important;
  border: none !important;
  outline: none !important;
}

.btn:hover {
  cursor: pointer !important;
  opacity: 0.9 !important;
}

.btn:active {
  transform: translateY(1px) !important;
}

/* Memastikan button dengan class btn berperilaku dengan benar */
button.btn {
  cursor: pointer !important;
  text-decoration: none !important;
  background: var(--bs-primary) !important;
  color: white !important;
  padding: 0.5rem 1rem !important;
  border-radius: 0.375rem !important;
  font-weight: 500 !important;
  transition: all 0.2s ease-in-out !important;
}

button.btn:hover {
  background: var(--bs-primary-dark, #0056b3) !important;
  cursor: pointer !important;
}
</style>