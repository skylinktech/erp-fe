<template>
  <aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div class="app-brand demo">
      <a href="index.html" class="app-brand-link">
        <span class="app-brand-logo demo">
          <img src="/img/branding/logo.png" alt="" height="40" />
        </span>
        <span class="app-brand-text demo menu-text fw-semibold ms-2">SkyFlow</span>
      </a>
      <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large ms-auto" @click="toggleSidebar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.47365 11.7183C8.11707 12.0749 8.11707 12.6531 8.47365 13.0097L12.071 16.607C12.4615 16.9975 12.4615 17.6305 12.071 18.021C11.6805 18.4115 11.0475 18.4115 10.657 18.021L5.83009 13.1941C5.37164 12.7356 5.37164 11.9924 5.83009 11.5339L10.657 6.707C11.0475 6.31653 11.6805 6.31653 12.071 6.707C12.4615 7.09747 12.4615 7.73053 12.071 8.121L8.47365 11.7183Z"
            fill-opacity="0.9" />
          <path
            d="M14.3584 11.8336C14.0654 12.1266 14.0654 12.6014 14.3584 12.8944L18.071 16.607C18.4615 16.9975 18.4615 17.6305 18.071 18.021C17.6805 18.4115 17.0475 18.4115 16.657 18.021L11.6819 13.0459C11.3053 12.6693 11.3053 12.0587 11.6819 11.6821L16.657 6.707C17.0475 6.31653 17.6805 6.31653 18.071 6.707C18.4615 7.09747 18.4615 7.73053 18.071 8.121L14.3584 11.8336Z"
            fill-opacity="0.4" />
        </svg>
      </a>
    </div>

    <div class="menu-inner-shadow"></div>

    <ul class="menu-inner py-7">
      <li
        class="menu-item"
        :class="{
          open: isDashboardMenuOpen,
          active: isDashboardMenuActive,
        }"
      >
        <a href="javascript:void(0);" class="menu-link menu-toggle" @click="toggleDashboardMenu">
          <i class="menu-icon tf-icons ri-home-smile-line"></i>
          <div data-i18n="Dashboard">Dashboard</div>
        </a>
        <transition
          name="menu-expand"
          @before-enter="beforeEnter"
          @enter="enter"
          @after-enter="afterEnter"
          @before-leave="beforeLeave"
          @leave="leave"
        >
          <ul class="menu-sub" v-show="isDashboardMenuOpen">
            <li class="menu-item" :class="{ active: $route.path === '/dashboard' }">
              <NuxtLink to="/dashboard" class="menu-link" @click="handleMenuClick">
                <div data-i18n="Main">Main</div>
              </NuxtLink>
            </li>
            <li class="menu-item" :class="{ active: $route.path === '/dashboard/settings' }">
              <NuxtLink to="/dashboard/settings" class="menu-link" @click="handleMenuClick">
                <div data-i18n="Settings">Settings</div>
              </NuxtLink>
            </li>
          </ul>
        </transition>
      </li>

      <li class="menu-header mt-5">
        <span class="menu-header-text" data-i18n="Apps & Pages">Apps &amp; Pages</span>
      </li>

      <template v-if="filteredAndSortedMenuGroups.length">
        <li
          class="menu-item"
          v-for="group in filteredAndSortedMenuGroups"
          :key="group.id"
          :class="{
            open: isGroupOpen(group),
            active: isGroupActive(group)
          }"
        >
          <a href="javascript:void(0);" class="menu-link menu-toggle" @click="toggleGroup(group.id)">
            <i :class="['menu-icon', 'tf-icons', group.icon]"></i>
            <div>{{ group.name }}</div>
          </a>
          <transition
            name="menu-expand"
            @before-enter="beforeEnter"
            @enter="enter"
            @after-enter="afterEnter"
            @before-leave="beforeLeave"
            @leave="leave"
          >
            <ul class="menu-sub" v-show="isGroupOpen(group)" v-if="group.menuDetails && group.menuDetails.length">
              <SidebarMenuNode
                v-for="detail in sortedRoots(group.menuDetails)"
                :key="detail.id"
                :item="detail"
                :open-ids="openDetailIds"
                :current-path="$route.path"
                @toggle="toggleDetail"
                @navigate="handleMenuClick"
                @prefetch="handlePrefetch"
              />
            </ul>
          </transition>
        </li>
      </template>
    </ul>
  </aside>
</template>

<script setup>
import { useMenuGroupStore } from '~/stores/menu-group';
import { useCustomerStore } from '~/stores/customer';
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useLayoutStore } from '~/stores/layout';
import { useUserStore } from '~/stores/user';
import SidebarMenuNode from '~/components/SidebarMenuNode.vue';
import { isStockMenuParentRoute, isStockWorkspacePath } from '~/utils/inventory/stockWorkspace';

const menuGroupsStore = useMenuGroupStore();
const route = useRoute();
const layoutStore = useLayoutStore();
const customerStore = useCustomerStore();
const userStore = useUserStore();

const openGroupIds = ref(new Set());
const openDetailIds = ref(new Set());
const isNavigatingFromMenu = ref(false);
const DASHBOARD_MENU_ID = 'static-dashboard';

const isDashboardMenuActive = computed(() => {
  return route.path === '/dashboard' || route.path === '/dashboard/settings';
});

const isDashboardMenuOpen = computed(() => openGroupIds.value.has(DASHBOARD_MENU_ID));

const toggleDashboardMenu = () => {
  toggleGroup(DASHBOARD_MENU_ID);
};

const filteredAndSortedMenuGroups = computed(() => {
  const filteredGroups = menuGroupsStore.filteredMenuGroups;
  if (!filteredGroups || filteredGroups.length === 0) return [];
  return filteredGroups.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

const prefetchMap = {
  '/master/customer': () => customerStore.prefetchCustomers(),
  '/admin/menu-group': () => menuGroupsStore.prefetchMenuGroups(),
};

const handlePrefetch = (routePath) => {
  if (prefetchMap[routePath]) {
    prefetchMap[routePath]();
  }
};

const handleMenuClick = () => {
  isNavigatingFromMenu.value = true;
  if (layoutStore.isSidebarExpanded) {
    layoutStore.toggleSidebar();
  }
  setTimeout(() => {
    isNavigatingFromMenu.value = false;
  }, 200);
};

const handleMouseEnter = () => {
  layoutStore.setSidebarHovered(true);
};

const handleMouseLeave = () => {
  layoutStore.setSidebarHovered(false);
};

const toggleGroup = (groupId) => {
  if (openGroupIds.value.has(groupId)) {
    openGroupIds.value.delete(groupId);
  } else {
    openGroupIds.value.clear();
    openGroupIds.value.add(groupId);
  }
};

const toggleDetail = (detailId) => {
  const next = new Set(openDetailIds.value);
  if (next.has(detailId)) {
    next.delete(detailId);
  } else {
    next.add(detailId);
  }
  openDetailIds.value = next;
};

function isNodeActive(node, path) {
  if (node.route && node.route === path) return true;
  if (isStockMenuParentRoute(node.route) && isStockWorkspacePath(path)) return true;
  if (!Array.isArray(node.children)) return false;
  return node.children.some((child) => isNodeActive(child, path));
}

function collectActiveAncestorIds(nodes, path, acc = []) {
  for (const node of nodes) {
    if (isNodeActive(node, path)) {
      if (Array.isArray(node.children) && node.children.length > 0) {
        acc.push(node.id);
        collectActiveAncestorIds(node.children, path, acc);
      }
      return acc;
    }
  }
  return acc;
}

const isGroupActive = (group) => {
  return (group.menuDetails || []).some((detail) => isNodeActive(detail, route.path));
};

const isGroupOpen = (group) => {
  return openGroupIds.value.has(group.id);
};

const sortedRoots = (details) => {
  return [...(details || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
};

function toggleSidebar() {
  layoutStore.toggleSidebar();
}

const setActiveGroup = () => {
  if (isDashboardMenuActive.value) {
    if (!openGroupIds.value.has(DASHBOARD_MENU_ID)) {
      openGroupIds.value.clear();
      openGroupIds.value.add(DASHBOARD_MENU_ID);
    }
    return;
  }

  const activeGroup = filteredAndSortedMenuGroups.value.find(isGroupActive);
  if (activeGroup) {
    if (!openGroupIds.value.has(activeGroup.id)) {
      openGroupIds.value.clear();
      openGroupIds.value.add(activeGroup.id);
    }
    const ancestorIds = collectActiveAncestorIds(activeGroup.menuDetails || [], route.path);
    const next = new Set(openDetailIds.value);
    for (const id of ancestorIds) {
      next.add(id);
    }
    openDetailIds.value = next;
  }
};

onMounted(async () => {
  await userStore.loadUser();
  if (userStore.user) {
    await menuGroupsStore.fetchAllMenuGroups();
    setActiveGroup();
  }
});

watch(() => userStore.user, async (newUser, oldUser) => {
  if (newUser && newUser !== oldUser) {
    await menuGroupsStore.fetchAllMenuGroups();
    setActiveGroup();
  }
});

watch(() => route.path, () => {
  setActiveGroup();
  if (!isNavigatingFromMenu.value && layoutStore.isSidebarExpanded) {
    layoutStore.toggleSidebar();
  }
});

const beforeEnter = (el) => {
  el.style.height = '0';
  el.style.overflow = 'hidden';
};

const enter = (el, done) => {
  el.style.height = el.scrollHeight + 'px';
  el.addEventListener('transitionend', done, { once: true });
};

const afterEnter = (el) => {
  el.style.height = 'auto';
};

const beforeLeave = (el) => {
  el.style.height = el.scrollHeight + 'px';
  el.style.overflow = 'hidden';
};

const leave = (el, done) => {
  getComputedStyle(el).height;
  requestAnimationFrame(() => {
      el.style.height = '0';
  });
  el.addEventListener('transitionend', done, { once: true });
};
</script>

<style>
.layout-menu {
  transition: width 0.25s ease-in-out;
}

html:not(.layout-menu-collapsed) .layout-menu,
html.layout-menu-collapsed.layout-menu-hover .layout-menu {
    width: 260px;
    border-right: 1px solid var(--bs-card-border-color, #ededed);
}

html.layout-menu-collapsed:not(.layout-menu-hover) .layout-menu {
    width: 82px;
    border-right: 0;
}

[dir=rtl]:not(.layout-menu-collapsed) .layout-menu,
[dir=rtl].layout-menu-collapsed.layout-menu-hover .layout-menu {
    border-right: 0;
    border-left: 1px solid var(--bs-card-border-color, #ededed);
}

[dir=rtl].layout-menu-collapsed:not(.layout-menu-hover) .layout-menu {
    border-left: 0;
}

#layout-menu {
  padding-top: 1rem;
  height: 100%;
}

.menu-sub {
  transition: height 0.3s ease-in-out;
  overflow: hidden;
}

.menu-inner {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1 1 auto;
  min-height: 0;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 1200px) {
  html.layout-menu-fixed:not(.layout-menu-collapsed) .layout-page {
    padding-left: 260px;
  }

  html.layout-menu-fixed.layout-menu-collapsed .layout-page {
    padding-left: 82px;
  }
}
</style>
