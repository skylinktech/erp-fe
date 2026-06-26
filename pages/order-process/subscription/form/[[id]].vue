<template>
  <SubscriptionFormPage />
</template>

<script setup>
import SubscriptionFormPage from '~/components/subscription/SubscriptionFormPage.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Subscription Form',
})
</script>
