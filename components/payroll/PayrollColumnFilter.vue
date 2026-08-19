<template>
  <Dropdown
    v-if="options && filterModel"
    v-model="filterModel.value"
    :options="options"
    :option-label="optionLabel || undefined"
    :option-value="optionValue || undefined"
    :placeholder="placeholder"
    show-clear
    class="p-column-filter w-100"
    @change="onFilter()"
  />
  <InputText
    v-else-if="filterModel"
    v-model="filterModel.value"
    type="text"
    class="p-column-filter w-100"
    :placeholder="placeholder"
    @input="onFilter()"
  />
</template>
<script setup lang="ts">
const props = defineProps<{
  filterModel?: { value: unknown } | null
  filterCallback?: () => void
  placeholder?: string
  options?: unknown[] | null
  optionLabel?: string
  optionValue?: string
}>()

function onFilter() {
  props.filterCallback?.()
}
</script>
