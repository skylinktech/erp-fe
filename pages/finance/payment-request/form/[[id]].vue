<template>
  <PaymentRequestFormPage />
</template>

<script setup>
import PaymentRequestFormPage from '~/components/payment-request/PaymentRequestFormPage.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Payment Request Form',
})
</script>
