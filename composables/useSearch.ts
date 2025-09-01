import { ref, computed } from 'vue'
import { erpMenuItems, searchMenuItems } from '~/data/erp-menu'

export const useSearch = () => {
  const searchQuery = ref('')
  const isSearchVisible = ref(false)
  const selectedIndex = ref(0)

  // Computed properties
  const filteredResults = computed(() => {
    if (!searchQuery.value.trim()) return []
    return searchMenuItems(searchQuery.value, erpMenuItems)
  })

  const hasResults = computed(() => filteredResults.value.length > 0)

  // Methods
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    selectedIndex.value = 0
  }

  const clearSearch = () => {
    searchQuery.value = ''
    selectedIndex.value = 0
  }

  const toggleSearch = () => {
    isSearchVisible.value = !isSearchVisible.value
    if (isSearchVisible.value) {
      clearSearch()
    }
  }

  const showSearch = () => {
    isSearchVisible.value = true
    clearSearch()
  }

  const hideSearch = () => {
    isSearchVisible.value = false
    clearSearch()
  }

  const selectNext = () => {
    if (selectedIndex.value < filteredResults.value.length - 1) {
      selectedIndex.value++
    }
  }

  const selectPrevious = () => {
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
  }

  const getSelectedResult = () => {
    if (filteredResults.value.length > 0 && selectedIndex.value >= 0) {
      return filteredResults.value[selectedIndex.value]
    }
    return null
  }

  const resetSelection = () => {
    selectedIndex.value = 0
  }

  // Keyboard navigation
  const handleKeydown = (event: KeyboardEvent) => {
    if (!isSearchVisible.value) return

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
        event.preventDefault()
        hideSearch()
        break
      case 'Enter':
        event.preventDefault()
        const selected = getSelectedResult()
        if (selected) {
          // Emit event atau callback untuk navigation
          return selected
        }
        break
    }
  }

  return {
    // State
    searchQuery: readonly(searchQuery),
    isSearchVisible: readonly(isSearchVisible),
    selectedIndex: readonly(selectedIndex),
    
    // Computed
    filteredResults,
    hasResults,
    
    // Methods
    setSearchQuery,
    clearSearch,
    toggleSearch,
    showSearch,
    hideSearch,
    selectNext,
    selectPrevious,
    getSelectedResult,
    resetSelection,
    handleKeydown
  }
}

// Helper function untuk readonly
function readonly<T>(value: T): Readonly<Ref<T>> {
  return value as any
}
