<template>
    <nav class="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
      <div class="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
        <a class="nav-item nav-link px-0 me-xl-6" href="javascript:void(0)" @click="toggleSidebar">
          <i class="ri-menu-fill ri-22px"></i>
        </a>
      </div>
  
      <div class="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
        <!-- Search Bar - Always Visible -->
        <div class="navbar-nav align-items-center">
            <div class="nav-item navbar-search-wrapper mb-0">
                <!-- Search Input -->
                <div class="search-input-container" v-if="isSearchVisible">
                    <div class="search-input-wrapper">
                        <i class="ri-search-line search-icon"></i>
                        <input
                            ref="searchInput"
                            v-model="searchQuery"
                            type="text"
                            class="search-input"
                            placeholder="Cari..."
                            @input="handleSearch"
                            @keydown.esc="toggleSearch"
                            @keydown.enter="handleEnterKey"
                            @blur="handleSearchBlur"
                        />
                        <button class="search-close-btn" @click="clearSearch" aria-label="Clear search">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                    
                    <!-- Search Results Dropdown -->
                    <div class="search-results-dropdown" v-if="searchQuery">
                        <div class="results-list">
                            <template v-if="searchResults.length > 0">
                                <div
                                    v-for="(result, index) in searchResults"
                                    :key="`result-${index}`"
                                    class="result-item"
                                    @click="navigateToResult(result)"
                                >
                                    <div class="result-icon">
                                        <i :class="result.icon || 'ri-file-line'"></i>
                                    </div>
                                    <div class="result-content">
                                        <div class="result-title" v-html="highlightMatch(result.name, searchQuery)"></div>
                                        <div class="result-category">{{ result.category }}</div>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="no-result-item ms-5">
                                    <p class="text-muted mt-3">Pencarian tidak ditemukan</p>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                
                <!-- Search Toggle Button -->
                <a 
                    v-else
                    class="nav-item nav-link search-toggler fw-normal px-0" 
                    href="javascript:void(0);" 
                    @click="toggleSearch"
                >
                    <i class="ri-search-line ri-22px scaleX-n1-rtl me-3"></i>
                    <span class="d-none d-md-inline-block text-muted">Cari...</span>
                </a>
            </div>
        </div>
    
            <ul class="navbar-nav flex-row align-items-center ms-auto">
              <!-- Language -->
                <li class="nav-item dropdown-language dropdown">
                    <a
                    class="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    href="javascript:void(0);"
                    data-bs-toggle="dropdown">
                    <i class="ri-translate-2 ri-22px"></i>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <a class="dropdown-item" href="javascript:void(0);" data-language="en" data-text-direction="ltr">
                        <span class="align-middle">English</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="javascript:void(0);" data-language="fr" data-text-direction="ltr">
                        <span class="align-middle">French</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="javascript:void(0);" data-language="ar" data-text-direction="rtl">
                        <span class="align-middle">Arabic</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="javascript:void(0);" data-language="de" data-text-direction="ltr">
                        <span class="align-middle">German</span>
                        </a>
                    </li>
                    </ul>
                </li>
                <!--/ Language -->

                <!-- Quick links: This dropdown will also need a Vue-native implementation if used. -->
                <li class="nav-item dropdown-shortcuts navbar-dropdown dropdown me-1 me-xl-0">
                    <a
                    class="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    href="javascript:void(0);"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false">
                    <i class="ri-star-smile-line ri-22px"></i>
                    </a>
                    <!-- Dropdown content here -->
                </li>
                <!-- Quick links -->

                <!-- Notification: This dropdown will also need a Vue-native implementation if used. -->
                <li class="nav-item dropdown-notifications navbar-dropdown dropdown me-4 me-xl-1">
                    <a
                    class="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    href="javascript:void(0);"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false">
                    <i class="ri-notification-2-line ri-22px"></i>
                    <span
                        class="position-absolute top-0 start-50 translate-middle-y badge badge-dot bg-danger mt-2 border"></span>
                    </a>
                    <!-- Dropdown content here -->
                </li>
                <!--/ Notification -->

                <!-- User -->
                <li class="nav-item navbar-dropdown dropdown-user dropdown" ref="avatarDropdownRef">
                    <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" @click.prevent="isAvatarDropdownOpen = !isAvatarDropdownOpen">
                        <div class="avatar avatar-online">
                            <img src="/img/avatars/1.png" alt class="rounded-circle" />
                        </div>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" :class="{show: isAvatarDropdownOpen}">
                    <li>
                        <a class="dropdown-item" href="#">
                        <div class="d-flex">
                            <div class="flex-shrink-0 me-2">
                            <div class="avatar avatar-online">
                                <img src="/img/avatars/1.png" alt class="rounded-circle" />
                            </div>
                            </div>
                            <div class="flex-grow-1">
                            <span class="fw-medium d-block small">{{ userStore.user?.fullName || 'Guest' }}</span>
                            <small class="text-muted">{{ userStore.user?.roles?.[0]?.name || 'Guest' }}</small>
                            </div>
                        </div>
                        </a>
                    </li>
                    <li>
                        <div class="dropdown-divider"></div>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#">
                        <i class="ri-user-3-line ri-22px me-3"></i><span class="align-middle">My Profile</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#">
                        <i class="ri-settings-4-line ri-22px me-3"></i><span class="align-middle">Settings</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#">
                        <span class="d-flex align-items-center align-middle">
                            <i class="flex-shrink-0 ri-file-text-line ri-22px me-3"></i>
                            <span class="flex-grow-1 align-middle">Billing</span>
                            <span class="flex-shrink-0 badge badge-center rounded-pill bg-danger">4</span>
                        </span>
                        </a>
                    </li>
                    <li>
                        <div class="dropdown-divider"></div>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#">
                        <i class="ri-money-dollar-circle-line ri-22px me-3"></i
                        ><span class="align-middle">Pricing</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#">
                        <i class="ri-question-line ri-22px me-3"></i><span class="align-middle">FAQ</span>
                        </a>
                    </li>
                    <li>
                        <div class="d-grid px-4 pt-2 pb-1">
                        <a class="btn btn-sm btn-danger d-flex" href="javascript:void(0);" @click="handleLogout">
                            <small class="align-middle">Logout</small>
                            <i class="ri-logout-box-r-line ms-2 ri-16px"></i>
                        </a>
                        </div>
                    </li>
                    </ul>
                </li>
                <!--/ User -->
            </ul>
      </div>
    </nav>
  </template>
  
  <script setup>
    import { useUserStore } from '~/stores/user'
    import { ref, onMounted, onUnmounted, nextTick } from 'vue'
    import { useRouter } from 'vue-router'
    import { useLayoutStore } from '~/stores/layout';
    import { useCustomerStore } from '~/stores/customer'
    import { useProductStore } from '~/stores/product'

    const { $api }    = useNuxtApp()
    const userStore   = useUserStore()
    const router      = useRouter()
    const layoutStore = useLayoutStore();
    const customerLocalStore = useCustomerStore()
    const productLocalStore  = useProductStore()

    // --- Search bar logic ---
    const isSearchVisible = ref(false);
    const searchQuery = ref('');
    const searchInput = ref(null);
    const searchResults = ref([]);

    const toggleSearch = async () => {
        isSearchVisible.value = !isSearchVisible.value;
        if (isSearchVisible.value) {
            await nextTick();
            searchInput.value?.focus();
        }
    };

    const handleSearch = async () => {
        const query = (searchQuery.value || '').trim()
        if (!query) {
            searchResults.value = []
            return
        }

        try {
            // 1) Pencarian menu lokal (client-side)
            const { erpMenuItems, searchMenuItems } = await import('~/data/erp-menu')
            const menuMatches = searchMenuItems(query, erpMenuItems)
                .slice(0, 5)
                .map((m) => ({
                    name: m.name,
                    category: `Menu · ${m.category}`,
                    icon: m.icon || 'ri-file-line',
                    path: m.path
                }))

            // 2) Pencarian data server (server-side) dijalankan paralel
            const buildUrl = (base) => {
                const params = new URLSearchParams()
                params.set('page', '1')
                params.set('rows', '5')
                params.set('sortField', '')
                params.set('sortOrder', 'asc')
                params.set('search', query)
                return `${base}?${params.toString()}`
            }
            const endpoints = [
                { key: 'product', label: 'Produk', icon: 'ri-price-tag-3-line', list: $api.dataProduct?.() || $api.product?.(), path: '/inventory/barang' },
                { key: 'invoice', label: 'Sales Invoice', icon: 'ri-bill-line', list: $api.salesInvoice?.(), path: '/sales/sales-invoice' },
                { key: 'customer', label: 'Customer', icon: 'ri-user-line', list: $api.dataCustomer?.() || $api.customer?.(), path: '/sales/customer' },
                { key: 'vendor', label: 'Vendor', icon: 'ri-store-2-line', list: $api.dataVendor?.() || $api.vendor?.(), path: '/purchasing/vendor' },
                { key: 'po', label: 'Purchase Order', icon: 'ri-shopping-bag-4-line', list: $api.purchaseOrder?.(), path: '/purchasing/purchase-order' },
                { key: 'so', label: 'Sales Order', icon: 'ri-file-list-3-line', list: $api.salesOrder?.(), path: '/sales/sales-order' }
            ].filter(e => !!e.list)

            const token = process.client 
                ? (useCookie('token')?.value || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null))
                : null
            const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

            const requests = endpoints.map(async (e) => {
                try {
                    const data = await $fetch(buildUrl(e.list), {
                        credentials: 'include',
                        headers: {
                            ...authHeader,
                            Accept: 'application/json'
                        },
                    })
                    const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
                    const qLower = query.toLowerCase()
                    // Saring hanya yang benar-benar cocok dengan query pada field penting
                    const filtered = items.filter((item) => {
                        const fields = [
                            item.number, item.no, item.no_invoice, item.invoiceNumber, item.kode,
                            item.sku, item.SKU, item.kd_barang,
                            item.name, item.productName, item.nama, item.customerName, item.fullname, item.title
                        ]
                        return fields.some(v => v && String(v).toLowerCase().includes(qLower))
                    })
                    return filtered.slice(0, 5).map((item) => {
                        const id = item.id || item.uuid || item._id
                        const number = item.number || item.no || item.no_invoice || item.invoiceNumber || item.kode
                        const sku = item.sku || item.SKU || item.kd_barang
                        const name = item.name || item.productName || item.nama || item.customerName || item.fullname || item.title
                        const primary = number || sku || name || JSON.stringify(item).slice(0, 60)
                        return {
                            name: primary,
                            category: `${e.label}`,
                            icon: e.icon,
                            path: `${e.path}?search=${encodeURIComponent(primary)}`,
                            _raw: item,
                            _id: id
                        }
                    })
                } catch {
                    return []
                }
            })

            const serverGroups = await Promise.all(requests)
            const serverMatches = serverGroups.flat()

            // 3) Fallback dari store lokal (jika ada data yang sudah ter-cache)
            const localMatches = []
            try {
                if (Array.isArray(customerLocalStore?.customers) && customerLocalStore.customers.length) {
                    const filtered = customerLocalStore.customers
                        .filter(c => (c.name || '').toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 5)
                        .map(c => ({
                            name: c.name,
                            category: 'Customer',
                            icon: 'ri-user-line',
                            path: `/sales/customer?search=${encodeURIComponent(c.name)}`
                        }))
                    localMatches.push(...filtered)
                }
                if (Array.isArray(productLocalStore?.products) && productLocalStore.products.length) {
                    const filtered = productLocalStore.products
                        .filter(p => ((p.sku || p.SKU || p.kode || '') + ' ' + (p.name || p.productName || '')).toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 5)
                        .map(p => ({
                            name: p.sku || p.SKU || p.kode || p.name,
                            category: 'Produk',
                            icon: 'ri-price-tag-3-line',
                            path: `/inventory/barang?search=${encodeURIComponent(p.sku || p.SKU || p.kode || p.name)}`
                        }))
                    localMatches.push(...filtered)
                }
            } catch {}

            const combined = [...menuMatches, ...serverMatches, ...localMatches]
            searchResults.value = combined.length > 0 ? combined.slice(0, 20) : []
        } catch (error) {
            console.error('Error searching:', error)
            searchResults.value = []
        }
    };

    const handleEnterKey = () => {
        if (searchQuery.value.trim() && searchResults.value.length > 0) {
            navigateToResult(searchResults.value[0]);
        }
    };

    const navigateToResult = (result) => {
        if (result.path && result.path !== '#') {
            router.push(result.path);
            searchQuery.value = '';
            searchResults.value = [];
            isSearchVisible.value = false;
        }
    };
    
    const clearSearch = async () => {
        searchQuery.value = '';
        searchResults.value = [];
        await nextTick();
        searchInput.value?.focus();
    };

    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    const highlightMatch = (text, query) => {
        const q = (query || '').trim()
        if (!q) return text
        try {
            const pattern = new RegExp(escapeRegExp(q), 'ig')
            return String(text).replace(pattern, (m) => `<mark class="search-mark">${m}</mark>`)
        } catch {
            return text
        }
    }

    const handleSearchBlur = () => {
        // Auto-close search setelah delay untuk memberikan waktu user mengklik hasil
        setTimeout(() => {
            if (!searchQuery.value.trim()) {
                isSearchVisible.value = false;
            }
        }, 200);
    };

    const handleKeydown = (event) => {
        if (event.ctrlKey && event.key === '/') {
            event.preventDefault();
            toggleSearch();
        }
    };
    // --- End search bar logic ---

    // --- Avatar Dropdown Logic ---
    const isAvatarDropdownOpen = ref(false);
    const avatarDropdownRef = ref(null);

    const handleClickOutside = (event) => {
        if (avatarDropdownRef.value && !avatarDropdownRef.value.contains(event.target)) {
            isAvatarDropdownOpen.value = false;
        }
    };
    // --- End Avatar Dropdown Logic ---

    onMounted(() => {
        userStore.loadUser()
        window.addEventListener('keydown', handleKeydown);
        document.addEventListener('click', handleClickOutside);
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('click', handleClickOutside);
    });

    const toggleSidebar = () => {
        layoutStore.toggleSidebar();
    }

    const handleLogout = async () => {
        try {
            // Bersihkan data lokal terlebih dahulu
            userStore.clearUser()
            document.documentElement.className = ''
            localStorage.removeItem('token')

            // Coba logout dari server
            const response = await fetch($api.logout(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            // Cek status response sebelum parsing data
            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Ignore parsing error
                }
                console.warn('Logout dari server gagal:', errorData?.message || `Status: ${response.status}`);
                // Tidak menampilkan error ke user karena logout lokal sudah berhasil
            }
        } catch (error) {
            // Tangani error fetch (network error, server tidak tersedia, dll)
            console.warn('Gagal menghubungi server untuk logout:', error.message);
            // Tidak menampilkan error ke user karena logout lokal sudah berhasil
        } finally {
            // Selalu redirect ke halaman login, meskipun logout server gagal
            router.push('/auth/login')
        }
    }
  </script>

<style>
/* Replicate Popper.js positioning for the user dropdown */
.navbar-nav .dropdown .dropdown-menu {
  position: absolute;
  top: 100%;
  left: auto;
  right: 0;
  margin-top: 0.125rem;
}

/* Search bar styling */
.navbar-search-wrapper .search-toggler {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding-left: 24px !important;
  padding-right: 24px;
  transform: scale(1.0);
  transition: all 0.3s ease;
  width: 900px;
}

.navbar-search-wrapper .search-toggler:hover {
  background-color: #ebeced;
  color: #e4e4e7;
  transform: scale(1.0);
  transition: all 0.3s ease;
  padding-left: 24px;
  padding-right: 24px;
  width: 900px;
}

/* Search input styling */
.search-input-container {
  position: relative;
  min-width: 900px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper .search-icon {
  position: absolute;
  padding-right: 24px;
  left: 24px;
  color: #e4e4e7;
  font-size: 16px;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 8px 40px 8px 55px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  border-color: #e4e4e7;
  box-shadow: 0 0 0 3px rgba(105, 108, 255, 0.1);
}

.search-close-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #e4e4e7;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  z-index: 2;
}

.search-close-btn:hover {
  background-color: #f8f9fa;
  color: #495057;
}

/* Search Results Dropdown */
.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 4px;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.results-list {
  padding: 8px 0;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f8f9fa;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: #f8f9fa;
}

.result-icon {
  width: 32px;
  height: 32px;
  background: #666bff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #e4e4e7;
  font-size: 16px;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 600;
  color: #212529;
  margin-bottom: 2px;
  font-size: 14px;
}

.search-mark {
  background-color: rgba(105, 108, 255, 0.2);
  color: inherit;
  padding: 0 2px;
  border-radius: 3px;
}

.result-category {
  font-size: 12px;
  color: #626264;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 10px;
  display: inline-block;
}

/* Responsive */
@media (max-width: 768px) {
  .search-input-container {
    min-width: 250px;
  }
  
  .search-results-dropdown {
    max-height: 250px;
  }
}
</style>