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

                <!-- Notification: This dropdown will also need a Vue-native implementation if used. -->
                <li class="nav-item dropdown-notifications navbar-dropdown dropdown me-4 me-xl-1" @click="showNotificationToast">
                    <a
                    class="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    href="javascript:void(0);"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                    >
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
                        <a class="dropdown-item" href="javascript:void(0);" @click="showProfileToast">
                        <i class="ri-user-3-line ri-22px me-3"></i><span class="align-middle">My Profile</span>
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
    import { useAccountStore } from '~/stores/accounts'
    import { useRolesStore } from '~/stores/roles'
    import { useSalesOrderStore } from '~/stores/sales-order'
    import { usePurchaseOrderStore } from '~/stores/purchaseOrder'
    import { useSalesReturnStore } from '~/stores/sales-return'
    import { useSuratJalanStore } from '~/stores/surat-jalan'
    import { useQuotationStore } from '~/stores/quotation'
    import { useVendorStore } from '~/stores/vendor'

    const { $api }    = useNuxtApp()
    const userStore   = useUserStore()
    const router      = useRouter()
    const layoutStore = useLayoutStore();
    const customerLocalStore = useCustomerStore()
    const productLocalStore  = useProductStore()
    const accountLocalStore  = useAccountStore()
    const roleLocalStore     = useRolesStore()
    const salesOrderLocalStore = useSalesOrderStore()
    const purchaseOrderLocalStore = usePurchaseOrderStore()
    const salesReturnLocalStore = useSalesReturnStore()
    const suratJalanLocalStore = useSuratJalanStore()
    const quotationLocalStore = useQuotationStore()
    const vendorLocalStore = useVendorStore()
    
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
                { key: 'so', label: 'Sales Order', icon: 'ri-file-list-3-line', list: $api.salesOrder?.(), path: '/sales/sales-order' },
                { key: 'sr', label: 'Sales Return', icon: 'ri-arrow-go-back-line', list: $api.salesReturn?.(), path: '/sales/sales-return' },
                { key: 'sj', label: 'Surat Jalan', icon: 'ri-truck-line', list: $api.suratJalan?.(), path: '/sales/surat-jalan' },
                { key: 'quo', label: 'Quotation', icon: 'ri-file-paper-2-line', list: $api.quotation?.(), path: '/sales/quotation' },
                { key: 'acc', label: 'Accounts', icon: 'ri-account-box-line', list: $api.accounts?.(), path: '/accounting/accounts' },
                { key: 'role', label: 'Roles', icon: 'ri-shield-user-line', list: $api.roles?.(), path: '/settings/roles' }
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
                            item.name, item.productName, item.nama, item.customerName, item.fullname, item.title,
                            item.code, item.name, item.name, item.name, item.code, item.code, item.code, item.code,
                            item.name, item.name, item.name, item.name,
                            item.name, item.name, item.name, item.name,
                            item.name, item.name, item.name, item.name,
                            item.name, item.name, item.name, item.name,
                            item.name, item.name, item.name, item.name,
                            item.name, item.name, item.name, item.name,
                            item.name, item.name, item.name, item.name,
                            item.name, item.name, item.name, item.name,
                            // Tambahan field untuk accounts
                            item.category, item.normalBalance,
                            // Tambahan field untuk sales order
                            item.noSo, item.no_so, item.noPo, item.no_po, item.status, item.description,
                            // Tambahan field untuk purchase order
                            item.noPo, item.no_po, item.noSo, item.no_so, item.status, item.description,
                            // Tambahan field untuk sales return
                            item.noSr, item.no_sr, item.noSo, item.no_so, item.status, item.reason,
                            // Tambahan field untuk surat jalan
                            item.noSj, item.no_sj, item.noSo, item.no_so, item.status, item.description,
                            // Tambahan field untuk quotation
                            item.noQuotation, item.no_quotation, item.status, item.description,
                            // Tambahan field untuk vendor
                            item.email, item.phone, item.address
                        ]
                        return fields.some(v => v && String(v).toLowerCase().includes(qLower))
                    })
                    return filtered.slice(0, 5).map((item) => {
                        const id = item.id || item.uuid || item._id
                        const number = item.number || item.no || item.no_invoice || item.invoiceNumber || item.kode
                        const sku = item.sku || item.SKU || item.kd_barang
                        const name = item.name || item.productName || item.nama || item.customerName || item.fullname || item.title || item.code
                        const code = item.code || item.kode

                        // Khusus untuk accounts, tampilkan code - name
                        let primary
                        if (e.key === 'acc') {
                            primary = code && name ? `${code} - ${name}` : (code || name || JSON.stringify(item).slice(0, 60))
                        } else if (e.key === 'so') {
                            // Sales Order: noSo - status
                            const noSo = item.noSo || item.no_so || item.number
                            const status = item.status || 'Draft'
                            primary = noSo ? `${noSo} - ${status}` : (name || JSON.stringify(item).slice(0, 60))
                        } else if (e.key === 'po') {
                            // Purchase Order: noPo - status
                            const noPo = item.noPo || item.no_po || item.number
                            const status = item.status || 'Draft'
                            primary = noPo ? `${noPo} - ${status}` : (name || JSON.stringify(item).slice(0, 60))
                        } else if (e.key === 'sr') {
                            // Sales Return: noSr - status
                            const noSr = item.noSr || item.no_sr || item.number
                            const status = item.status || 'Draft'
                            primary = noSr ? `${noSr} - ${status}` : (name || JSON.stringify(item).slice(0, 60))
                        } else if (e.key === 'sj') {
                            // Surat Jalan: noSj - status
                            const noSj = item.noSj || item.no_sj || item.number
                            const status = item.status || 'Draft'
                            primary = noSj ? `${noSj} - ${status}` : (name || JSON.stringify(item).slice(0, 60))
                        } else if (e.key === 'quo') {
                            // Quotation: noQuotation - status
                            const noQuotation = item.noQuotation || item.no_quotation || item.number
                            const status = item.status || 'Draft'
                            primary = noQuotation ? `${noQuotation} - ${status}` : (name || JSON.stringify(item).slice(0, 60))
                        } else {
                            primary = number || sku || name || JSON.stringify(item).slice(0, 60)
                        }
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
                // Debug: Log store data untuk troubleshooting
                console.log('Store data lengths:')
                console.log('- Customers:', customerLocalStore?.customers?.length || 0)
                console.log('- Products:', productLocalStore?.products?.length || 0)
                console.log('- Accounts:', accountLocalStore?.accounts?.length || 0)
                console.log('- Roles:', roleLocalStore?.roles?.length || 0)
                console.log('- Sales Orders:', salesOrderLocalStore?.salesOrders?.length || 0)
                console.log('- Purchase Orders:', purchaseOrderLocalStore?.purchaseOrders?.length || 0)
                console.log('- Sales Returns:', salesReturnLocalStore?.salesReturns?.length || 0)
                console.log('- Surat Jalans:', suratJalanLocalStore?.suratJalans?.length || 0)
                console.log('- Quotations:', quotationLocalStore?.quotations?.length || 0)
                console.log('- Vendors:', vendorLocalStore?.vendors?.length || 0)
                
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
                if (Array.isArray(accountLocalStore?.accounts) && accountLocalStore.accounts.length) {
                    const filtered = accountLocalStore.accounts
                        .filter(a => {
                            const searchFields = [
                                a.name || '',
                                a.code || '',
                                a.category || ''
                            ].join(' ').toLowerCase()
                            return searchFields.includes(query.toLowerCase())
                        })
                        .slice(0, 5)
                        .map(a => ({
                            name: `${a.code} - ${a.name}`,
                            category: `Account · ${a.category || 'Unknown'}`,
                            icon: 'ri-account-box-line',
                            path: `/accounting/accounts?search=${encodeURIComponent(a.name || a.code)}`
                        }))
                    localMatches.push(...filtered)
                }
                if (Array.isArray(roleLocalStore?.roles) && roleLocalStore.roles.length) {
                    const filtered = roleLocalStore.roles
                        .filter(r => (r.name || '').toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 5)
                        .map(r => ({
                            name: r.name,
                            category: 'Role',
                            icon: 'ri-shield-user-line',
                            path: `/settings/roles?search=${encodeURIComponent(r.name)}`
                        }))
                    localMatches.push(...filtered)
                }
                
                // Sales Order fallback
                if (Array.isArray(salesOrderLocalStore?.salesOrders) && salesOrderLocalStore.salesOrders.length) {
                    const filtered = salesOrderLocalStore.salesOrders
                        .filter(so => {
                            const searchFields = [
                                so.noSo || '',
                                so.noPo || '',
                                so.status || '',
                                so.description || ''
                            ].join(' ').toLowerCase()
                            return searchFields.includes(query.toLowerCase())
                        })
                        .slice(0, 5)
                        .map(so => ({
                            name: `${so.noSo} - ${so.status || 'Draft'}`,
                            category: 'Sales Order',
                            icon: 'ri-file-list-3-line',
                            path: `/sales/sales-order?search=${encodeURIComponent(so.noSo || so.id)}`
                        }))
                    localMatches.push(...filtered)
                }
                
                // Purchase Order fallback
                if (Array.isArray(purchaseOrderLocalStore?.purchaseOrders) && purchaseOrderLocalStore.purchaseOrders.length) {
                    const filtered = purchaseOrderLocalStore.purchaseOrders
                        .filter(po => {
                            const searchFields = [
                                po.noPo || '',
                                po.noSo || '',
                                po.status || '',
                                po.description || ''
                            ].join(' ').toLowerCase()
                            return searchFields.includes(query.toLowerCase())
                        })
                        .slice(0, 5)
                        .map(po => ({
                            name: `${po.noPo} - ${po.status || 'Draft'}`,
                            category: 'Purchase Order',
                            icon: 'ri-shopping-bag-4-line',
                            path: `/purchasing/purchase-order?search=${encodeURIComponent(po.noPo || po.id)}`
                        }))
                    localMatches.push(...filtered)
                }
                
                // Sales Return fallback
                if (Array.isArray(salesReturnLocalStore?.salesReturns) && salesReturnLocalStore.salesReturns.length) {
                    const filtered = salesReturnLocalStore.salesReturns
                        .filter(sr => {
                            const searchFields = [
                                sr.noSr || '',
                                sr.noSo || '',
                                sr.status || '',
                                sr.reason || ''
                            ].join(' ').toLowerCase()
                            return searchFields.includes(query.toLowerCase())
                        })
                        .slice(0, 5)
                        .map(sr => ({
                            name: `${sr.noSr} - ${sr.status || 'Draft'}`,
                            category: 'Sales Return',
                            icon: 'ri-arrow-go-back-line',
                            path: `/sales/sales-return?search=${encodeURIComponent(sr.noSr || sr.id)}`
                        }))
                    localMatches.push(...filtered)
                }
                
                // Surat Jalan fallback
                if (Array.isArray(suratJalanLocalStore?.suratJalans) && suratJalanLocalStore.suratJalans.length) {
                    const filtered = suratJalanLocalStore.suratJalans
                        .filter(sj => {
                            const searchFields = [
                                sj.noSj || '',
                                sj.noSo || '',
                                sj.status || '',
                                sj.description || ''
                            ].join(' ').toLowerCase()
                            return searchFields.includes(query.toLowerCase())
                        })
                        .slice(0, 5)
                        .map(sj => ({
                            name: `${sj.noSj} - ${sj.status || 'Draft'}`,
                            category: 'Surat Jalan',
                            icon: 'ri-truck-line',
                            path: `/sales/surat-jalan?search=${encodeURIComponent(sj.noSj || sj.id)}`
                        }))
                    localMatches.push(...filtered)
                }
                
                // Quotation fallback
                if (Array.isArray(quotationLocalStore?.quotations) && quotationLocalStore.quotations.length) {
                    const filtered = quotationLocalStore.quotations
                        .filter(quo => {
                            const searchFields = [
                                quo.noQuotation || '',
                                quo.status || '',
                                quo.description || ''
                            ].join(' ').toLowerCase()
                            return searchFields.includes(query.toLowerCase())
                        })
                        .slice(0, 5)
                        .map(quo => ({
                            name: `${quo.noQuotation} - ${quo.status || 'Draft'}`,
                            category: 'Quotation',
                            icon: 'ri-file-paper-2-line',
                            path: `/sales/quotation?search=${encodeURIComponent(quo.noQuotation || quo.id)}`
                        }))
                    localMatches.push(...filtered)
                }
                
                // Vendor fallback
                if (Array.isArray(vendorLocalStore?.vendors) && vendorLocalStore.vendors.length) {
                    const filtered = vendorLocalStore.vendors
                        .filter(v => {
                            const searchFields = [
                                v.name || '',
                                v.email || '',
                                v.phone || '',
                                v.address || ''
                            ].join(' ').toLowerCase()
                            return searchFields.includes(query.toLowerCase())
                        })
                        .slice(0, 5)
                        .map(v => ({
                            name: v.name,
                            category: 'Vendor',
                            icon: 'ri-store-2-line',
                            path: `/purchasing/vendor?search=${encodeURIComponent(v.name)}`
                        }))
                    localMatches.push(...filtered)
                }
            } catch {}

            const combined = [...menuMatches, ...serverMatches, ...localMatches]
            searchResults.value = combined.length > 0 ? combined.slice(0, 20) : []

            
            // Debug: Log breakdown per kategori
            const categoryBreakdown = {}
            combined.forEach(result => {
                const category = result.category.split(' · ')[0] // Ambil kategori utama
                categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1
            })
            console.log('- Category breakdown:', categoryBreakdown)
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

    onMounted(async () => {
        userStore.loadUser()
        
        // Pre-load data untuk search (jika belum ada)
        try {
            const preloadPromises = []
            
            if (!accountLocalStore.accounts.length) {
                preloadPromises.push(accountLocalStore.fetchAccounts().catch(e => console.warn('Failed to pre-load accounts:', e)))
            }
            if (!customerLocalStore.customers.length) {
                preloadPromises.push(customerLocalStore.fetchCustomers().catch(e => console.warn('Failed to pre-load customers:', e)))
            }
            if (!productLocalStore.products.length) {
                preloadPromises.push(productLocalStore.fetchProducts().catch(e => console.warn('Failed to pre-load products:', e)))
            }
            if (!roleLocalStore.roles.length) {
                preloadPromises.push(roleLocalStore.fetchRoles().catch(e => console.warn('Failed to pre-load roles:', e)))
            }
            if (!salesOrderLocalStore.salesOrders.length) {
                preloadPromises.push(salesOrderLocalStore.fetchSalesOrders().catch(e => console.warn('Failed to pre-load sales orders:', e)))
            }
            if (!purchaseOrderLocalStore.purchaseOrders.length) {
                preloadPromises.push(purchaseOrderLocalStore.fetchPurchaseOrders().catch(e => console.warn('Failed to pre-load purchase orders:', e)))
            }
            if (!salesReturnLocalStore.salesReturns.length) {
                preloadPromises.push(salesReturnLocalStore.fetchSalesReturns().catch(e => console.warn('Failed to pre-load sales returns:', e)))
            }
            if (!suratJalanLocalStore.suratJalans.length) {
                preloadPromises.push(suratJalanLocalStore.fetchSuratJalans().catch(e => console.warn('Failed to pre-load surat jalans:', e)))
            }
            if (!quotationLocalStore.quotations.length) {
                preloadPromises.push(quotationLocalStore.fetchQuotations().catch(e => console.warn('Failed to pre-load quotations:', e)))
            }
            if (!vendorLocalStore.vendors.length) {
                preloadPromises.push(vendorLocalStore.fetchVendors().catch(e => console.warn('Failed to pre-load vendors:', e)))
            }
            
            // Jalankan semua pre-loading secara paralel
            if (preloadPromises.length > 0) {
                await Promise.allSettled(preloadPromises)
            }
        } catch (error) {
            console.warn('Error pre-loading data for search:', error)
        }
        
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

    const showProfileToast = () => {
        const toast = useToast();
        toast.info({
            title: 'Info',
            message: 'Fitur My Profile akan segera tersedia. Ditunggu ya!',
            color: 'blue'
        });
    }
    const showNotificationToast = () => {
        const toast = useToast();
        toast.info({
            title: 'Info',
            message: 'Fitur Notification akan segera tersedia. Ditunggu ya!',
            color: 'blue'
        });
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
  width: 1000px;
}

/* Search input styling */
.search-input-container {
  position: relative;
  min-width: 1000px;
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