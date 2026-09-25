<template>
  <div v-if="open" class="border rounded p-3 mb-3 bg-light">
    <h3 class="h6">Pratinjau dampak</h3>
    <p class="mb-1">{{ preview?.currentProfile?.profileCode }} → {{ preview?.proposedProfile?.profileCode }}</p>
    <p v-for="item in preview?.warnings || []" :key="item.code" class="small mb-1">{{ item.message }}</p>
    <p v-for="item in preview?.info || []" :key="item.code" class="small text-muted mb-1">{{ item.message }}</p>
    <p v-if="preview?.readiness" class="small">Kesiapan setelah usulan: {{ preview.readiness.overallStatus }}</p>
    <div class="d-flex flex-wrap gap-2">
      <button class="btn btn-primary btn-sm" type="button" :disabled="saving" @click="$emit('confirm')">Simpan perubahan</button>
      <button class="btn btn-outline-secondary btn-sm" type="button" @click="$emit('close')">Tutup</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ open: boolean; preview: any; saving: boolean }>()
defineEmits<{ confirm: []; close: [] }>()
</script>
