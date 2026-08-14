<template>
  <div class="layout-wrapper layout-content-navbar">
    <div class="layout-container">
      <Sidebar />
      <div class="layout-overlay layout-menu-toggle" @click="closeSidebar"></div>

      <div class="layout-page">
        <Navbar />
        <NotificationPermissionPrompt />
        <div class="content-wrapper">
          <div class="container-xxl flex-grow-1 container-p-y">
            <PageHeading />
            <slot />
          </div>
          <Footer />
          <div class="content-backdrop fade"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLayoutStore } from '~/stores/layout';
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = route.meta.title;

const layoutStore = useLayoutStore();

// Safety: Pastikan loading di-reset saat route berubah
watch(() => route.path, () => {
  // Reset loading setelah navigasi selesai
  setTimeout(() => {
    if (layoutStore.loading) {
      console.warn('⚠️ Loading still true after route change, forcing reset')
      layoutStore.setLoading(false)
    }
  }, 500)
})

onMounted(() => {
    layoutStore.initializeLayout();
    // Pastikan loading di-reset saat layout mounted
    layoutStore.setLoading(false);
});

const closeSidebar = () => {
    if (layoutStore.isSidebarExpanded) {
        layoutStore.toggleSidebar();
    }
};

// Import your components
import Sidebar from '~/components/Sidebar.vue';
import Navbar from '~/components/Navbar.vue';
import Footer from '~/components/Footer.vue';
import NotificationPermissionPrompt from '~/components/NotificationPermissionPrompt.vue';
import PageHeading from '~/components/PageHeading.vue';

</script>

<style>
/* Page shells still wrap themselves in container-xxl; don't add a second inset
   under the layout heading so title, breadcrumb, and body share one left edge. */
.layout-page .content-wrapper > .container-xxl .container-xxl,
.layout-page .content-wrapper > .container-xxl .container-fluid {
  max-width: none;
  padding-left: 0;
  padding-right: 0;
}
</style>