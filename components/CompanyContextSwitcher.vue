<template>
  <li class="nav-item dropdown company-context-switcher" ref="rootRef">
    <button
      v-if="store.initialized"
      class="nav-link company-switcher-btn d-flex align-items-center gap-2 px-2"
      type="button"
      :aria-expanded="open"
      :aria-haspopup="store.canSwitchCompany"
      :disabled="store.loading"
      @click="toggle"
    >
      <span class="company-switcher-text text-start">
        <span class="company-name d-block text-truncate" :title="displayName">{{ displayName }}</span>
        <span v-if="profileLabel" class="company-profile-badge">{{ profileLabel }}</span>
      </span>
      <i v-if="store.canSwitchCompany" class="ri-arrow-down-s-line" aria-hidden="true"></i>
    </button>

    <div
      v-if="open && store.canSwitchCompany"
      class="dropdown-menu dropdown-menu-end show company-switcher-menu"
      role="menu"
    >
      <button
        v-for="company in store.allowedCompanies"
        :key="company.id"
        type="button"
        class="dropdown-item company-option"
        role="menuitem"
        :class="{ active: company.id === store.companyId }"
        @click="onSelect(company.id)"
      >
        <span class="d-flex flex-column">
          <span class="fw-medium text-truncate" :title="company.name">{{ company.name }}</span>
          <small class="text-muted">
            {{ company.businessProfileCode || company.code }}
            <span v-if="company.id === store.defaultCompanyId"> · default</span>
          </small>
        </span>
      </button>
      <div class="dropdown-divider"></div>
      <button
        v-if="store.companyId"
        type="button"
        class="dropdown-item"
        :disabled="store.companyId === store.defaultCompanyId"
        @click="onSetDefault"
      >
        Set as Default Company
      </button>
    </div>

    <div
      v-if="store.selectionRequired"
      class="company-chooser-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Pilih perusahaan"
    >
      <div class="company-chooser-card">
        <h2 class="h5 mb-2">Pilih Active Company</h2>
        <p class="text-muted small mb-3">
          Superadmin / multi-company user harus memilih konteks perusahaan sebelum transaksi.
        </p>
        <ul class="list-unstyled mb-0">
          <li v-for="company in store.allowedCompanies" :key="company.id" class="mb-2">
            <button type="button" class="btn btn-outline-primary w-100 text-start" @click="onSelect(company.id)">
              <span class="d-block fw-medium">{{ company.name }}</span>
              <small>{{ company.businessProfileCode || company.code }}</small>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCompanyContextStore } from '~/stores/companyContext'
import { isRouteAllowedForContext, businessAwareLanding } from '~/utils/businessFlowRoute'

const store = useCompanyContextStore()
const router = useRouter()
const route = useRoute()
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const displayName = computed(() => store.company?.name || 'Pilih perusahaan')
const profileLabel = computed(() => store.businessProfile?.code || null)

function toggle() {
  if (!store.canSwitchCompany) return
  open.value = !open.value
}

async function onSelect(id: number) {
  open.value = false
  try {
    await store.switchCompany(id)
  } catch {
    return
  }
  const allowed = isRouteAllowedForContext(route.path, {
    effectiveFlowCodes: store.effectiveFlowCodes,
    profileCode: store.profileCode,
  })
  if (!allowed) {
    await router.push(businessAwareLanding({
      effectiveFlowCodes: store.effectiveFlowCodes,
      profileCode: store.profileCode,
    }))
  }
}

async function onSetDefault() {
  if (!store.companyId) return
  await store.setDefaultCompany(store.companyId)
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (!open.value) return
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

watch(
  () => store.companyId,
  () => {
    open.value = false
  }
)
</script>

<style scoped>
.company-switcher-btn {
  border: 0;
  background: transparent;
  max-width: min(200px, 28vw);
  color: inherit;
}
.company-name {
  max-width: min(180px, 24vw);
  font-size: 0.85rem;
  line-height: 1.2;
}
.company-profile-badge {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  color: var(--bs-secondary-color, #6c757d);
  text-transform: uppercase;
}
.company-switcher-menu {
  min-width: 260px;
  max-width: min(360px, 92vw);
  max-height: 70vh;
  overflow: auto;
}
.company-chooser-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1080;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.company-chooser-card {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.25rem;
  width: min(420px, 100%);
  max-height: 80vh;
  overflow: auto;
}
@media (max-width: 1024px) {
  .company-switcher-btn {
    max-width: min(160px, 30vw);
  }
  .company-switcher-menu {
    max-width: min(340px, 88vw);
  }
}
@media (max-width: 767.98px) {
  .company-switcher-btn {
    max-width: min(120px, 36vw);
  }
  .company-name {
    max-width: min(100px, 32vw);
  }
  .company-chooser-card {
    width: min(100%, 420px);
    max-height: 86vh;
  }
}
</style>
