<template>
  <section class="card mb-3">
    <div class="card-body">
      <h3 class="h6">Riwayat perubahan</h3>
      <article v-for="row in rows" :key="row.id" class="border-bottom py-2">
        <div class="small text-muted">{{ row.createdAt }} · pengguna {{ row.userId }}</div>
        <div>Profil {{ row.before?.profileId }} → {{ row.after?.profileId }}</div>
        <div class="small text-break">{{ row.after?.reason }}</div>
      </article>
      <p v-if="!rows.length" class="text-muted mb-0">Belum ada perubahan konfigurasi.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ rows: any[] }>()
</script>
