<template>
  <PaymentRequestFormPage />
</template>

<script setup>
import PaymentRequestFormPage from '~/components/payment-request/PaymentRequestFormPage.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Payment Request Form',
})
</script>
