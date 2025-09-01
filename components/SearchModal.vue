<template>
  <div class="search-modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="search-modal" @click.stop>
      <!-- Search Input -->
      <div class="search-input-container">
        <div class="search-input-wrapper">
          <i class="ri-search-line search-icon"></i>
                      <input
              ref="searchInput"
              :value="searchQuery"
              type="text"
              class="search-input"
              placeholder="Cari menu aplikasi..."
              @input="(e) => setSearchQuery(e.target.value)"
              @keydown.esc="closeModal"
              @keydown.enter="handleEnterKey"
            />
          <button class="search-close-btn" @click="closeModal">
            <i class="ri-close-line"></i>
          </button>
        </div>
      </div>

      <!-- Search Results -->
      <div class="search-results" v-if="searchQuery && filteredResults.length > 0">
        <div class="results-header">
          <span class="results-count">{{ filteredResults.length }} hasil ditemukan</span>
        </div>
        
        <div class="results-list">
          <div
            v-for="(result, index) in filteredResults"
            :key="`${result.type}-${result.id || index}`"
            class="result-item"
            :class="{ 'active': selectedIndex === index }"
            @click="navigateToPage(result)"
            @mouseenter="selectedIndex = index"
          >
            <div class="result-icon">
              <i :class="getIconClass(result)"></i>
            </div>
            <div class="result-content">
              <div class="result-title">{{ result.name }}</div>
              <div class="result-subtitle">
                <span class="result-category">{{ result.category }}</span>
                <span class="result-path">{{ result.path }}</span>
              </div>
            </div>
            <div class="result-action">
              <i class="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div class="no-results" v-else-if="searchQuery && filteredResults.length === 0">
        <div class="no-results-icon">
          <i class="ri-search-line"></i>
        </div>
        <div class="no-results-text">
          <h4>Tidak ada hasil ditemukan</h4>
          <p>Coba kata kunci yang berbeda atau periksa ejaan</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions" v-if="!searchQuery">
        <div class="quick-actions-header">
          <h5>Akses Cepat</h5>
        </div>
        <div class="quick-actions-grid">
          <div
            v-for="quickAction in quickActions"
            :key="quickAction.name"
            class="quick-action-item"
            @click="navigateToPage(quickAction)"
          >
            <div class="quick-action-icon">
              <i :class="quickAction.icon"></i>
            </div>
            <div class="quick-action-text">{{ quickAction.name }}</div>
          </div>
        </div>
      </div>

      <!-- Keyboard Shortcuts -->
      <div class="keyboard-shortcuts">
        <div class="shortcut-item">
          <kbd>↑↓</kbd>
          <span>Navigasi</span>
        </div>
        <div class="shortcut-item">
          <kbd>Enter</kbd>
          <span>Buka</span>
        </div>
        <div class="shortcut-item">
          <kbd>Esc</kbd>
          <span>Tutup</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { useSearch } from '~/composables/useSearch'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
const userStore = useUserStore()
const { 
  searchQuery, 
  filteredResults, 
  selectedIndex, 
  setSearchQuery, 
  selectNext, 
  selectPrevious, 
  resetSelection 
} = useSearch()

// Reactive data
const searchInput = ref(null)
const allMenuItems = ref([])



const quickActions = [
  { name: 'Dashboard', path: '/dashboard', icon: 'ri-home-smile-line', category: 'Dashboard', type: 'quick' },
  { name: 'Pegawai', path: '/hrd/pegawai', icon: 'ri-team-line', category: 'HRD', type: 'quick' },
  { name: 'Barang', path: '/inventory/barang', icon: 'ri-store-line', category: 'Inventory', type: 'quick' },
  { name: 'Penjualan', path: '/sales/penjualan', icon: 'ri-shopping-cart-line', category: 'Sales', type: 'quick' },
  { name: 'Purchase Order', path: '/purchasing/purchase-order', icon: 'ri-shopping-bag-4-line', category: 'Purchasing', type: 'quick' },
  { name: 'Jurnal', path: '/accounting/jurnal', icon: 'ri-calculator-line', category: 'Accounting', type: 'quick' }
]

// Methods
const loadAllMenuItems = async () => {
  try {
    // Import ERP menu items
    const { erpMenuItems } = await import('~/data/erp-menu')
    
    // Gabungkan ERP menu items dengan quick actions
    const items = [...erpMenuItems]
    
    // Tambahkan quick actions
    quickActions.forEach(action => {
      items.push({
        id: `quick-${action.name}`,
        name: action.name,
        path: action.path,
        category: action.category,
        icon: action.icon,
        type: 'quick'
      })
    })

    allMenuItems.value = items
  } catch (error) {
    console.error('Error loading menu items:', error)
  }
}

const handleSearch = () => {
  resetSelection()
}

const handleEnterKey = () => {
  if (filteredResults.value.length > 0) {
    navigateToPage(filteredResults.value[selectedIndex.value])
  }
}

const navigateToPage = (item) => {
  if (item.path && item.path !== '#') {
    router.push(item.path)
    closeModal()
  }
}

const closeModal = () => {
  setSearchQuery('')
  resetSelection()
  emit('close')
}

const getIconClass = (item) => {
  return item.icon || 'ri-file-line'
}

const handleKeydown = (event) => {
  if (!props.isVisible) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectNext()
      break
    case 'ArrowUp':
      event.preventDefault()
      selectPrevious()
      break
    case 'Escape':
      closeModal()
      break
  }
}

// Lifecycle
onMounted(() => {
  loadAllMenuItems()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Watch for visibility changes
watch(() => props.isVisible, async (newValue) => {
  if (newValue) {
    await nextTick()
    searchInput.value?.focus()
    // Menu items sudah dimuat di onMounted
  }
})
</script>

<style scoped>
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
}

.search-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-input-container {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #6c757d;
  font-size: 18px;
}

.search-input {
  width: 100%;
  padding: 12px 50px 12px 45px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #696cff;
}

.search-close-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.search-close-btn:hover {
  background-color: #f8f9fa;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.results-header {
  padding: 16px 20px 8px;
  border-bottom: 1px solid #f1f3f4;
}

.results-count {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.results-list {
  padding: 8px 0;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-left: 3px solid transparent;
}

.result-item:hover,
.result-item.active {
  background-color: #f8f9fa;
  border-left-color: #696cff;
}

.result-icon {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #696cff;
  font-size: 18px;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
  font-size: 14px;
}

.result-subtitle {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.result-category {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.result-path {
  color: #6c757d;
  font-family: monospace;
}

.result-action {
  color: #6c757d;
  font-size: 18px;
}

.no-results {
  padding: 40px 20px;
  text-align: center;
}

.no-results-icon {
  font-size: 48px;
  color: #dee2e6;
  margin-bottom: 16px;
}

.no-results-text h4 {
  color: #495057;
  margin-bottom: 8px;
  font-size: 18px;
}

.no-results-text p {
  color: #6c757d;
  font-size: 14px;
}

.quick-actions {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.quick-actions-header h5 {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.quick-action-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.quick-action-icon {
  width: 32px;
  height: 32px;
  background: #696cff;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 16px;
}

.quick-action-text {
  font-size: 12px;
  color: #495057;
  font-weight: 500;
}

.keyboard-shortcuts {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6c757d;
}

.shortcut-item kbd {
  background: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  color: #495057;
}

/* Scrollbar styling */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .search-modal {
    width: 95%;
    margin: 20px;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .keyboard-shortcuts {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
}
</style>
