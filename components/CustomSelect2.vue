<template>
  <div class="custom-select2-wrapper">
    <div 
      class="custom-select2"
      :class="{ 
        'is-open': isOpen,
        'is-disabled': disabled,
        'has-value': hasValue,
        'is-invalid': isInvalid
      }"
      @click="toggleDropdown"
      v-click-outside="closeDropdown"
    >
      <!-- Main Input Area -->
      <div class="select2-selection">
        <div class="select2-selection__rendered">
          <span v-if="!hasValue && placeholder" class="select2-selection__placeholder">
            {{ placeholder }}
          </span>
          <div v-else-if="hasValue" class="select2-selection__single">
            <slot name="selection" :option="selectedOption" :options="selectedOptions">
              <template v-if="Array.isArray(modelValue)">
                <span v-for="(option, index) in selectedOptions" :key="getOptionKey(option, index)" class="selected-tag">
                  {{ getOptionLabel(option) }}
                  <button type="button" class="tag-remove" @click.stop="removeOption(option)">×</button>
                </span>
              </template>
              <template v-else>
                {{ getOptionLabel(selectedOption) }}
              </template>
            </slot>
          </div>
        </div>
        <span class="select2-selection__arrow">
          <svg 
            class="select2-arrow-icon" 
            :class="{ 'rotate-180': isOpen }"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </span>
      </div>

      <!-- Dropdown -->
      <transition name="dropdown">
        <div v-if="isOpen" class="select2-dropdown">
          <!-- Search Input -->
          <div v-if="searchable" class="select2-search">
            <input
              ref="searchInput"
              v-model="searchTerm"
              type="text"
              class="select2-search__field"
              :placeholder="searchPlaceholder"
              @keydown.prevent.enter="selectFirstOption"
              @keydown.prevent.escape="closeDropdown"
              @keydown.prevent.arrow-down="navigateDown"
              @keydown.prevent.arrow-up="navigateUp"
            />
          </div>

          <!-- Options List -->
          <div class="select2-results">
            <ul class="select2-results__options" role="listbox">
              <!-- Loading State -->
              <li v-if="loading" class="select2-results__option select2-results__option--loading">
                <div class="loading-wrapper">
                  <div class="loading-spinner"></div>
                  <span>{{ loadingText }}</span>
                </div>
              </li>

              <!-- No Options -->
              <li v-else-if="filteredOptions.length === 0" class="select2-results__option select2-results__option--no-results">
                <slot name="no-options">
                  <div class="no-options-wrapper">
                    <svg class="no-options-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{{ noOptionsText }}</span>
                  </div>
                </slot>
              </li>

              <!-- Options -->
              <li
                v-else
                v-for="(option, index) in filteredOptions"
                :key="getOptionKey(option, index)"
                class="select2-results__option"
                :class="{
                  'select2-results__option--highlighted': highlightedIndex === index,
                  'select2-results__option--selected': isSelected(option)
                }"
                role="option"
                :aria-selected="isSelected(option)"
                @click.stop="selectOption(option)"
                @mouseenter="highlightedIndex = index"
              >
                <slot name="option" :option="option" :index="index">
                  {{ getOptionLabel(option) }}
                </slot>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>

    <!-- Clear Button -->
    <button
      v-if="clearable && hasValue && !disabled"
      type="button"
      class="select2-clear-btn"
      @click.stop="clearSelection"
      :title="clearTitle"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Array, Boolean],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Pilih opsi...'
  },
  searchPlaceholder: {
    type: String,
    default: 'Cari...'
  },
  noOptionsText: {
    type: String,
    default: 'Tidak ada opsi ditemukan'
  },
  loadingText: {
    type: String,
    default: 'Memuat...'
  },
  clearTitle: {
    type: String,
    default: 'Hapus pilihan'
  },
  getOptionLabel: {
    type: Function,
    default: (option) => {
      // ✅ FIX: Handle undefined/null options
      if (option === null || option === undefined) {
        return ''
      }
      if (typeof option === 'string' || typeof option === 'number') {
        return option
      }
      return option?.label || option?.name || option?.title || String(option || '')
    }
  },
  getOptionKey: {
    type: Function,
    default: (option, index) => {
      if (typeof option === 'string' || typeof option === 'number') return option
      return option?.id || option?.value || index
    }
  },
  reduce: {
    type: Function,
    default: (option) => option
  },
  searchable: {
    type: Boolean,
    default: true
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  filterBy: {
    type: Function,
    default: null
  },
  closeOnSelect: {
    type: Boolean,
    default: true
  },
  preserveSearch: {
    type: Boolean,
    default: false
  },
  isInvalid: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'search', 'open', 'close', 'select', 'clear'])

// Refs
const isOpen = ref(false)
const searchTerm = ref('')
const highlightedIndex = ref(-1)
const searchInput = ref(null)

// Computed
const hasValue = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0
  }
  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== ''
})

const selectedOption = computed(() => {
  if (!hasValue.value) return null
  
  // ✅ FIX: Filter out undefined/null options
  const validOptions = (props.options || []).filter(option => option !== null && option !== undefined)
  
  return validOptions.find(option => {
    try {
      const reducedOption = props.reduce(option)
      return reducedOption === props.modelValue
    } catch (error) {
      console.warn('Error in reduce function:', error, option)
      return false
    }
  })
})

const selectedOptions = computed(() => {
  if (!Array.isArray(props.modelValue)) return []
  
  // ✅ FIX: Filter out undefined/null options
  const validOptions = (props.options || []).filter(option => option !== null && option !== undefined)
  
  return validOptions.filter(option => {
    try {
      const reducedOption = props.reduce(option)
      return props.modelValue.includes(reducedOption)
    } catch (error) {
      console.warn('Error in reduce function:', error, option)
      return false
    }
  })
})

const filteredOptions = computed(() => {
  // ✅ FIX: Filter out undefined/null options terlebih dahulu
  const validOptions = (props.options || []).filter(option => option !== null && option !== undefined)
  
  if (!searchTerm.value || !props.searchable) {
    return validOptions
  }

  if (props.filterBy && typeof props.filterBy === 'function') {
    return validOptions.filter(option => {
      if (!option) return false
      try {
        return props.filterBy(option, props.getOptionLabel(option), searchTerm.value)
      } catch (error) {
        console.warn('Error in filterBy function:', error, option)
        return false
      }
    })
  }

  // Default filter
  return validOptions.filter(option => {
    if (!option) return false
    try {
      const label = props.getOptionLabel(option)?.toString()?.toLowerCase() || ''
      return label.includes(searchTerm.value.toLowerCase())
    } catch (error) {
      console.warn('Error filtering option:', error, option)
      return false
    }
  })
})

// Methods
const toggleDropdown = (event) => {
  if (props.disabled) return
  
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = async () => {
  if (props.disabled) return
  
  isOpen.value = true
  highlightedIndex.value = -1
  
  if (props.searchable) {
    await nextTick()
    searchInput.value?.focus()
  }
  
  emit('open')
}

const closeDropdown = () => {
  isOpen.value = false
  highlightedIndex.value = -1
  
  if (!props.preserveSearch) {
    searchTerm.value = ''
  }
  
  emit('close')
}

const selectOption = (option) => {
  try {
    const value = props.reduce(option)
    
    // Handle multiple selection
    if (Array.isArray(props.modelValue)) {
      const currentValues = [...props.modelValue]
      if (currentValues.includes(value)) {
        // Remove if already selected
        const newValue = currentValues.filter(v => v !== value)
        emit('update:modelValue', newValue)
      } else {
        // Add if not selected
        currentValues.push(value)
        emit('update:modelValue', currentValues)
      }
    } else {
      // Single selection
      emit('update:modelValue', value)
    }
    
    emit('select', option)
    
    // Close dropdown after a small delay to ensure value is updated
    if (props.closeOnSelect && !Array.isArray(props.modelValue)) {
      setTimeout(() => {
        closeDropdown()
      }, 10)
    }
  } catch (error) {
    console.error('Error in selectOption:', error)
  }
}

const clearSelection = () => {
  if (Array.isArray(props.modelValue)) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', null)
  }
  emit('clear')
}

const removeOption = (option) => {
  if (!Array.isArray(props.modelValue)) return
  
  const reducedOption = props.reduce(option)
  const newValue = props.modelValue.filter(value => value !== reducedOption)
  emit('update:modelValue', newValue)
}

const isSelected = (option) => {
  if (!hasValue.value) return false
  const reducedOption = props.reduce(option)
  
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(reducedOption)
  }
  
  return reducedOption === props.modelValue
}

const navigateDown = () => {
  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++
  }
}

const navigateUp = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  }
}

const selectFirstOption = () => {
  if (filteredOptions.value.length > 0) {
    const optionToSelect = highlightedIndex.value >= 0 
      ? filteredOptions.value[highlightedIndex.value] 
      : filteredOptions.value[0]
    selectOption(optionToSelect)
  }
}

// Click outside directive
const clickOutsideDirective = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  }
}

// Watch for search changes
watch(searchTerm, (newTerm) => {
  emit('search', newTerm)
  highlightedIndex.value = -1
})

// Global click outside handler
onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

const handleGlobalKeydown = (event) => {
  if (isOpen.value && event.key === 'Escape') {
    closeDropdown()
  }
}
</script>

<script>
export default {
  name: 'CustomSelect2',
  directives: {
    clickOutside: {
      beforeMount(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event)
          }
        }
        document.body.addEventListener('click', el.clickOutsideEvent)
      },
      unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
      }
    }
  }
}
</script>

<style scoped>
.custom-select2-wrapper {
  position: relative;
  width: 100%;
}

.custom-select2 {
  position: relative;
  width: 100%;
  min-height: 48px;
  font-size: 14px;
  line-height: 1.5;
}

/* Selection Container */
.select2-selection {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 48px;
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  z-index: 1;
}

.custom-select2:not(.is-disabled):hover .select2-selection {
  border-color: #696cff;
}

.custom-select2.is-open .select2-selection {
  border-color: #696cff;
  box-shadow: 0 0 0 3px rgba(105, 108, 255, 0.1);
}

.custom-select2.is-invalid .select2-selection {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.custom-select2.is-disabled .select2-selection {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  cursor: not-allowed;
  opacity: 0.65;
}

/* Selection Content */
.select2-selection__rendered {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  flex-wrap: wrap;
  gap: 4px;
  position: relative;
  min-height: 20px;
}

.select2-selection__placeholder {
  color: #6b7280;
  font-weight: normal;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;
}

.select2-selection__single {
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  z-index: 2;
  background-color: transparent;
}

/* Selected Tags */
.selected-tag {
  display: inline-flex;
  align-items: center;
  background-color: #e0e7ff;
  color: #4338ca;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin: 2px;
  border: 1px solid #c7d2fe;
  position: relative;
  z-index: 2;
}

.tag-remove {
  background: none;
  border: none;
  color: #4338ca;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  margin-left: 4px;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease-in-out;
}

.tag-remove:hover {
  background-color: #4338ca;
  color: white;
}

/* Arrow Icon */
.select2-selection__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 8px;
  color: #6b7280;
  transition: transform 0.2s ease-in-out;
}

.select2-arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease-in-out;
}

.select2-arrow-icon.rotate-180 {
  transform: rotate(180deg);
}

/* Clear Button */
.select2-clear-btn {
  position: absolute;
  right: 36px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  z-index: 1;
}

.select2-clear-btn:hover {
  color: #dc3545;
  background-color: #f8f9fa;
}

.select2-clear-btn svg {
  width: 14px;
  height: 14px;
}

/* Dropdown */
.select2-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 9999;
  margin-top: 4px;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Search Input */
.select2-search {
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.select2-search__field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease-in-out;
}

.select2-search__field:focus {
  border-color: #696cff;
  box-shadow: 0 0 0 3px rgba(105, 108, 255, 0.1);
}

/* Results Container */
.select2-results {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0;
  /* ✅ FIX: Disable scroll anchoring untuk mencegah warning */
  overflow-anchor: none;
  contain: layout style paint;
  scroll-behavior: smooth;
  will-change: scroll-position;
}

.select2-results__options {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Option Styling */
.select2-results__option {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.4;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease-in-out;
  position: relative;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  background-color: #fff;
  color: #374151;
  pointer-events: auto;
  z-index: 10;
  user-select: none;
}

.select2-results__option:last-child {
  border-bottom: none;
}

/* Hover State - Light blue background */
.select2-results__option:hover {
  background-color: #f0f4ff !important;
  color: #4338ca !important;
  border-radius: 4px;
  margin: 2px 8px;
  padding: 12px 16px;
  border-bottom: none !important;
}

/* Keyboard Navigation Highlight */
.select2-results__option--highlighted {
  background-color: #696cff !important;
  color: #fff !important;
  border-radius: 4px;
  margin: 2px 8px;
  padding: 12px 16px;
  border-bottom: none !important;
  box-shadow: 0 2px 4px rgba(105, 108, 255, 0.2);
}

/* Selected State */
.select2-results__option--selected {
  background-color: #e0e7ff !important;
  color: #4338ca !important;
  font-weight: 600;
  border-left: 3px solid #696cff;
  padding-left: 13px;
}

/* Selected + Hover State */
.select2-results__option--selected:hover {
  background-color: #c7d2fe !important;
  color: #3730a3 !important;
}

/* Selected + Highlighted State (keyboard) */
.select2-results__option--selected.select2-results__option--highlighted {
  background-color: #696cff !important;
  color: #fff !important;
  border-left: 3px solid #fff;
}

/* Loading State */
.select2-results__option--loading {
  cursor: default;
  background-color: #f8f9fa;
}

.select2-results__option--loading:hover {
  background-color: #f8f9fa;
  color: inherit;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #696cff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* No Options State */
.select2-results__option--no-results {
  cursor: default;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.select2-results__option--no-results:hover {
  background-color: transparent;
  color: #6b7280;
}

.no-options-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
}

.no-options-icon {
  width: 16px;
  height: 16px;
}

/* Dropdown Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease-in-out;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .select2-results {
    max-height: 250px;
  }
  
  .select2-results__option {
    padding: 14px 16px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .select2-search__field {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

@media (max-width: 576px) {
  .select2-dropdown {
    max-height: 60vh;
  }
  
  .select2-results {
    max-height: calc(60vh - 60px);
  }
}

/* Force Light Mode - Override any dark mode detection */
.custom-select2-wrapper {
  color-scheme: light;
}

/* Fix for form floating conflicts */
.custom-select2-wrapper .select2-selection {
  background-color: #fff !important;
  border: 1px solid #d1d5db !important;
  color: #374151 !important;
  position: relative;
  z-index: 1;
}

.custom-select2-wrapper .select2-selection__rendered {
  background-color: transparent !important;
  position: relative;
  z-index: 2;
}

.custom-select2-wrapper .select2-selection__placeholder {
  background-color: transparent !important;
  color: #6b7280 !important;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;
}

.custom-select2-wrapper .select2-selection__single {
  background-color: transparent !important;
  color: #374151 !important;
  position: relative;
  z-index: 2;
}

.select2-selection {
  background-color: #fff !important;
  border-color: #d1d5db !important;
  color: #374151 !important;
}

.select2-selection__placeholder {
  color: #6b7280 !important;
}

.select2-selection__single {
  color: #374151 !important;
}

.select2-dropdown {
  background-color: #fff !important;
  border-color: #d1d5db !important;
}

.select2-search__field {
  background-color: #fff !important;
  border-color: #d1d5db !important;
  color: #374151 !important;
}

.select2-results__option--loading {
  background-color: #f8f9fa !important;
  color: #6b7280 !important;
}

/* Enhanced Hover Effects */
.select2-results__option {
  transform: translateX(0);
  box-shadow: none;
}

.select2-results__option:hover {
  transform: translateX(2px) !important;
  box-shadow: 0 2px 8px rgba(105, 108, 255, 0.15) !important;
}

.select2-results__option--highlighted {
  transform: translateX(4px) !important;
  box-shadow: 0 4px 12px rgba(105, 108, 255, 0.25) !important;
}

/* Smooth animation for option content */
.select2-results__option .d-flex,
.select2-results__option .fw-bold,
.select2-results__option small {
  transition: all 0.2s ease-in-out;
}

.select2-results__option:hover .fw-bold {
  font-weight: 700 !important;
}

.select2-results__option--highlighted .fw-bold {
  font-weight: 700 !important;
}

/* Focus styles for accessibility */
.custom-select2:focus-within .select2-selection {
  outline: 2px solid #696cff;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .select2-selection {
    border-width: 2px;
  }
  
  .select2-results__option--highlighted {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .custom-select2 *,
  .custom-select2 *::before,
  .custom-select2 *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
