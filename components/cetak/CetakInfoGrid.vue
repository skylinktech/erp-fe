<template>
  <div class="cetak-info-grid">
    <div v-if="left.length" class="cetak-info-grid__col text-start">
      <p v-for="(item, idx) in left" :key="'l-' + idx" class="mb-1">
        <strong>{{ item.label }} :</strong> {{ display(item.value) }}
      </p>
    </div>
    <div v-if="right.length" class="cetak-info-grid__col text-end">
      <p v-for="(item, idx) in right" :key="'r-' + idx" class="mb-1">
        <strong>{{ item.label }} :</strong> {{ display(item.value) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface CetakInfoItem {
  label: string
  value?: string | number | null
}

withDefaults(
  defineProps<{
    left?: CetakInfoItem[]
    right?: CetakInfoItem[]
  }>(),
  {
    left: () => [],
    right: () => [],
  }
)

function display(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}
</script>
