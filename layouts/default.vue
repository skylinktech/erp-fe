<template>
  <div class="layout-wrapper layout-content-navbar">
    <div class="layout-container">
      <Sidebar />
      <div class="layout-overlay layout-menu-toggle" @click="closeSidebar"></div>

      <div class="layout-page">
        <Navbar />
        <NotificationPermissionPrompt />
        <div ref="contentWrapperRef" class="content-wrapper">
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
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = route.meta.title;
const contentWrapperRef = ref(null);

const layoutStore = useLayoutStore();

const resetContentScroll = () => {
  contentWrapperRef.value?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

// Safety: Pastikan loading di-reset saat route berubah
watch(() => route.path, () => {
  resetContentScroll();
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

/*
 * Sticky app chrome: navbar stays put, only the page body scrolls.
 * Height is locked to the visual viewport so iOS toolbars don't create a
 * second document scrollbar. Other layouts (auth/pos/cetak) are unaffected
 * because they do not render .layout-content-navbar.
 */
html:has(.layout-wrapper.layout-content-navbar),
html:has(.layout-wrapper.layout-content-navbar) body {
  height: 100%;
  overflow: hidden;
}

html:has(.layout-wrapper.layout-content-navbar) #__nuxt,
html:has(.layout-wrapper.layout-content-navbar) #__nuxt > div {
  height: 100%;
}

.layout-wrapper.layout-content-navbar {
  --layout-navbar-height: 4rem;
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  overflow: hidden;
}

.layout-wrapper.layout-content-navbar .layout-container {
  min-height: 0;
  height: 100%;
}

.layout-wrapper.layout-content-navbar .layout-page {
  min-height: 0;
  height: 100%;
  overflow: visible;
}

.layout-wrapper.layout-content-navbar .layout-navbar {
  position: sticky;
  top: 0;
  flex: 0 0 auto;
  z-index: 1080;
}

/* Direct child only: many pages also wrap themselves in .content-wrapper.
   Applying overflow/overscroll there swallows trackpad wheel events in the
   middle of the page while the outer scrollbar still responds. */
.layout-wrapper.layout-content-navbar .layout-page > .content-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  justify-content: flex-start;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.layout-wrapper.layout-content-navbar .layout-page > .content-wrapper > .container-xxl {
  flex: 1 0 auto;
  min-height: min-content;
}

.layout-wrapper.layout-content-navbar .layout-page > .content-wrapper > .content-footer {
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
  width: 100%;
  margin-top: auto;
  background-color: var(--bs-body-bg, #f5f5f9);
}

.layout-wrapper.layout-content-navbar .content-backdrop:not(.show) {
  pointer-events: none;
}

@media (max-width: 575.98px) {
  .layout-wrapper.layout-content-navbar {
    --layout-navbar-height: 3.75rem;
  }
}
</style>