<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb breadcrumb-style1 mb-0">
      <li class="breadcrumb-item">
        <NuxtLink to="/dashboard" class="page-breadcrumb__link" title="Dashboard">
          <i class="ri-home-smile-line"></i>
        </NuxtLink>
      </li>
      <li
        v-for="(crumb, index) in displayCrumbs"
        :key="`${crumb.label}-${index}`"
        class="breadcrumb-item"
        :class="{ active: index === displayCrumbs.length - 1 }"
      >
        <NuxtLink
          v-if="index !== displayCrumbs.length - 1 && crumb.to"
          :to="crumb.to"
          class="page-breadcrumb__link"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span v-else>{{ crumb.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import type { PageCrumb } from '~/composables/usePageHeading'

const props = defineProps<{
  currentLabel?: string | null
}>()

const { crumbs } = usePageHeading()

const displayCrumbs = computed<PageCrumb[]>(() => {
  const list = crumbs.value.map((crumb) => ({ ...crumb }))
  const label = props.currentLabel?.trim()
  if (!label) return list
  if (list.length) {
    list[list.length - 1] = { label }
    return list
  }
  return [{ label }]
})
</script>

<style scoped>
nav {
  padding: 0;
  margin: 0;
}
.page-breadcrumb__link {
  color: #a8aab4;
  text-decoration: none;
}
.page-breadcrumb__link:hover {
  color: var(--bs-primary, #008fec);
}
.breadcrumb {
  font-size: 0.8125rem;
  padding: 0;
  margin: 0;
  list-style: none;
}
.breadcrumb-item,
.breadcrumb-item.active {
  color: #676b7b;
}
.breadcrumb-item.active {
  color: #3b4056;
}
.breadcrumb-item + .breadcrumb-item::before {
  color: #a8aab4;
}
</style>
