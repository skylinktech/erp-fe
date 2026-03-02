<template>
  <div class="invoice-print p-6">
    <Head>
      <Title>{{ title ? title + ' - Sinergi Innovate Pratama' : 'Sinergi Innovate Pratama' }}</Title>
      <Link rel="stylesheet" href="/vendor/css/pages/app-invoice-print.css" />
    </Head>
    <slot />
  </div>
</template>

<script setup>
  const route = useRoute();
  const title = route.meta.title;
</script>

<style>

</style>