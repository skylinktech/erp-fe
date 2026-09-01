<template>
  <li
    class="menu-item"
    :class="{
      open: isOpen,
      active: isActive,
    }"
  >
    <!-- Folder / intermediate node -->
    <template v-if="hasChildren">
      <a href="javascript:void(0);" class="menu-link menu-toggle" @click.stop="onToggle">
        <div>{{ item.name }}</div>
      </a>
      <transition
        name="menu-expand"
        @before-enter="beforeEnter"
        @enter="enter"
        @after-enter="afterEnter"
        @before-leave="beforeLeave"
        @leave="leave"
      >
        <ul class="menu-sub" v-show="isOpen">
          <SidebarMenuNode
            v-for="child in sortedChildren"
            :key="child.id"
            :item="child"
            :open-ids="openIds"
            :current-path="currentPath"
            @toggle="$emit('toggle', $event)"
            @navigate="$emit('navigate')"
            @prefetch="$emit('prefetch', $event)"
          />
        </ul>
      </transition>
    </template>

    <!-- Leaf with route -->
    <template v-else-if="item.route">
      <NuxtLink
        :to="item.route"
        class="menu-link"
        @mouseenter="$emit('prefetch', item.route)"
        @click="$emit('navigate')"
      >
        <div>{{ item.name }}</div>
      </NuxtLink>
    </template>

    <!-- Empty folder (no children, no route) -->
    <template v-else>
      <a href="javascript:void(0);" class="menu-link disabled">
        <div>{{ item.name }}</div>
      </a>
    </template>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { isStockMenuParentRoute, isStockWorkspacePath } from '~/utils/inventory/stockWorkspace'

defineOptions({ name: 'SidebarMenuNode' })

const props = defineProps({
  item: { type: Object, required: true },
  openIds: { type: Object, required: true },
  currentPath: { type: String, required: true },
})

const emit = defineEmits(['toggle', 'navigate', 'prefetch'])

const hasChildren = computed(
  () => Array.isArray(props.item.children) && props.item.children.length > 0
)

const sortedChildren = computed(() => {
  if (!hasChildren.value) return []
  return [...props.item.children].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id
  )
})

const isOpen = computed(() => props.openIds.has(props.item.id))

const isActive = computed(() => isNodeActive(props.item, props.currentPath))

function isNodeActive(node, path) {
  if (node.route && node.route === path) return true
  if (isStockMenuParentRoute(node.route) && isStockWorkspacePath(path)) return true
  if (!Array.isArray(node.children)) return false
  return node.children.some((child) => isNodeActive(child, path))
}

function onToggle() {
  emit('toggle', props.item.id)
}

const beforeEnter = (el) => {
  el.style.height = '0'
  el.style.overflow = 'hidden'
}
const enter = (el, done) => {
  el.style.height = `${el.scrollHeight}px`
  el.addEventListener('transitionend', done, { once: true })
}
const afterEnter = (el) => {
  el.style.height = 'auto'
}
const beforeLeave = (el) => {
  el.style.height = `${el.scrollHeight}px`
  el.style.overflow = 'hidden'
}
const leave = (el, done) => {
  getComputedStyle(el).height
  requestAnimationFrame(() => {
    el.style.height = '0'
  })
  el.addEventListener('transitionend', done, { once: true })
}
</script>

<style scoped>
.menu-link.disabled {
  opacity: 0.55;
  pointer-events: none;
  cursor: default;
}
</style>
