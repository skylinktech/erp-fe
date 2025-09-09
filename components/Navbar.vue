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

                <!-- Notification: Stock notifications -->
                <li class="nav-item dropdown-notifications navbar-dropdown dropdown me-4 me-xl-1" ref="notificationDropdownRef">
                    <a
                    class="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow notification-bell-wrapper"
                    href="javascript:void(0);"
                    @click.prevent="isNotificationDropdownOpen = !isNotificationDropdownOpen"
                    >
                    <div class="notification-bell-container">
                        <i class="ri-notification-line ri-22px notification-bell-icon"></i>
                        <span
                            v-if="notificationsStore.unreadCount > 0"
                            class="notification-badge"
                        >
                            {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
                        </span>
                    </div>
                    </a>
                    <!-- Dropdown content here -->
                    <ul class="dropdown-menu dropdown-menu-end py-0 mt-3" :class="{show: isNotificationDropdownOpen}">
                        <li class="dropdown-menu-header border-bottom py-50">
                            <div class="dropdown-header d-flex align-items-center py-2">
                            <h6 class="mb-0 me-auto">Notifikasi</h6>
                            <div class="d-flex align-items-center h6 mb-0">
                                <span v-if="notificationsStore.unreadCount > 0" class="badge rounded-pill bg-label-primary fs-xsmall me-2">{{ notificationsStore.unreadCount }} New</span>
                                <a href="javascript:void(0)" class="dropdown-notifications-all p-2" @click="markAllNotificationsAsRead" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Mark all as read" data-bs-original-title="Mark all as read"><i class="icon-base ri ri-mail-open-line text-heading"></i></a>
                            </div>
                            </div>
                        </li>
                        <li class="dropdown-notifications-list">
                            <ul class="list-group list-group-flush">
                                <!-- Loading state -->
                                <li v-if="notificationsStore.loading" class="list-group-item text-center py-3">
                                    <div class="spinner-border spinner-border-sm" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <small class="text-muted ms-2">Memuat notifikasi...</small>
                                </li>
                                
                                <!-- No notifications -->
                                <li v-else-if="notificationsStore.navbarNotifications.length === 0" class="list-group-item text-center py-3">
                                    <i class="ri-checkbox-circle-line ri-24px text-success mb-2"></i>
                                    <p class="text-muted mb-0">Tidak ada notifikasi</p>
                                    <small class="text-muted">Semua sudah di-posting</small>
                                </li>
                                
                                <!-- All notifications -->
                                <li 
                                    v-for="notification in notificationsStore.navbarNotifications" 
                                    :key="notification.id"
                                    class="list-group-item list-group-item-action dropdown-notifications-item waves-effect"
                                    @click="handleNotificationClick(notification)"
                                >
                                    <div class="d-flex">
                                        <div class="flex-shrink-0 me-3">
                                            <div class="avatar">
                                                <span 
                                                    class="avatar-initial rounded-circle"
                                                    :class="getNotificationBadgeClass(notification.type)"
                                                >
                                                    <i 
                                                        class="icon-base"
                                                        :class="getNotificationIcon(notification.type)"
                                                    ></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div class="flex-grow-1">
                                            <h6 class="small mb-1">
                                                {{ getNotificationTitle(notification) }}
                                            </h6>
                                            <small class="mb-1 d-block text-body">
                                                {{ getNotificationSubtitle(notification) }}
                                            </small>
                                            <small class="text-body-secondary">
                                                {{ notificationsStore.formatTimeAgo(notification.createdAt) }} • 
                                                {{ notification.createdByName }}
                                            </small>
                                        </div>
                                        <div class="flex-shrink-0 dropdown-notifications-actions">
                                            <a href="javascript:void(0)" class="dropdown-notifications-read" @click.stop="markNotificationAsRead(notification.id)">
                                                <span class="badge badge-dot"></span>
                                            </a>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li class="border-top">
                            <div class="d-grid p-4">
                                <a class="btn btn-primary btn-sm d-flex waves-effect waves-light" href="javascript:void(0);" @click="viewAllNotifications">
                                    <small class="align-middle">Lihat semua notifikasi</small>
                                </a>
                            </div>
                        </li>
                        </ul>
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
    import { useNotificationsStore } from '~/stores/notifications'
    import { usePermissions } from '~/composables/usePermissions'

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
    const notificationsStore = useNotificationsStore()
    const { userHasPermission, userHasRole } = usePermissions()
    
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

    // --- Notification Dropdown Logic ---
    const isNotificationDropdownOpen = ref(false);
    const notificationDropdownRef = ref(null);

    const handleNotificationClickOutside = (event) => {
        if (notificationDropdownRef.value && !notificationDropdownRef.value.contains(event.target)) {
            isNotificationDropdownOpen.value = false;
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        await notificationsStore.markAsRead(notificationId);
    };

    const markAllNotificationsAsRead = async () => {
        try {
            await notificationsStore.markAllAsRead();
            
            // Show success toast
            const toast = useToast();
            toast.success({
                title: 'Berhasil',
                message: 'Semua notifikasi telah ditandai sebagai dibaca',
                color: 'green',
                position: 'topRight'
            });
            
            // Close dropdown after marking as read
            isNotificationDropdownOpen.value = false;
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            const toast = useToast();
            toast.error({
                title: 'Error',
                message: 'Gagal menandai notifikasi sebagai dibaca',
                color: 'red',
                position: 'topRight'
            });
        }
    };

    const handleNotificationClick = (notification) => {
        // Navigate to appropriate page based on notification type
        switch (notification.type) {
            case 'stock_in':
                router.push('/inventory/stock-in');
                break;
            case 'stock_out':
                router.push('/inventory/stock-out');
                break;
            case 'purchase_order':
                router.push('/purchasing/purchase-order');
                break;
            case 'sales_order':
                router.push('/sales/sales-order');
                break;
        }
        isNotificationDropdownOpen.value = false;
    };

    const viewAllNotifications = () => {
        router.push('/notifications');
        isNotificationDropdownOpen.value = false;
    };

    // Helper functions for notifications
    const getNotificationBadgeClass = (type) => {
        switch (type) {
            case 'stock_in':
                return 'bg-label-warning'
            case 'stock_out':
                return 'bg-label-danger'
            case 'purchase_order':
                return 'bg-label-info'
            case 'sales_order':
                return 'bg-label-success'
            default:
                return 'bg-label-secondary'
        }
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'stock_in':
                return 'ri-arrow-down-line'
            case 'stock_out':
                return 'ri-stock-line'
            case 'purchase_order':
                return 'ri-shopping-bag-4-line'
            case 'sales_order':
                return 'ri-file-list-3-line'
            default:
                return 'ri-notification-line'
        }
    }

    const getNotificationTitle = (notification) => {
        switch (notification.type) {
            case 'stock_in':
                return `Stock In ${notification.noSi} belum di-posting`
            case 'stock_out':
                return `Stock Out ${notification.noSo} belum di-posting`
            case 'purchase_order':
                return `Purchase Order ${notification.noPo} memerlukan approval`
            case 'sales_order':
                return `Sales Order ${notification.noSo} memerlukan approval`
            default:
                return 'Notifikasi'
        }
    }

    const getNotificationSubtitle = (notification) => {
        switch (notification.type) {
            case 'stock_in':
            case 'stock_out':
                return `Quantity: ${notification.quantity} | ${notification.warehouseName}`
            case 'purchase_order':
                return `Vendor: ${notification.vendorName} | Total: ${formatCurrency(notification.total)}`
            case 'sales_order':
                return `Customer: ${notification.customerName} | Total: ${formatCurrency(notification.total)}`
            default:
                return ''
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }
    // --- End Notification Dropdown Logic ---

    onMounted(async () => {
        userStore.loadUser()
        
        // Load notifications
        await notificationsStore.fetchNotifications()
        
        // Set up polling for notifications every 30 seconds
        const notificationInterval = setInterval(async () => {
            await notificationsStore.fetchNotifications()
        }, 30000)
        
        // Pre-load data untuk search (jika belum ada)
        try {
            const preloadPromises = []
            
            // Hanya preload accounts jika user memiliki permission
            if (!accountLocalStore.accounts.length && (userHasRole('superadmin') || userHasPermission('view_account'))) {
                preloadPromises.push(accountLocalStore.fetchAccounts(true).catch(e => console.warn('Failed to pre-load accounts:', e)))
            }
            if (!customerLocalStore.customers.length) {
                preloadPromises.push(customerLocalStore.fetchCustomers(true).catch(e => console.warn('Failed to pre-load customers:', e)))
            }
            if (!productLocalStore.products.length) {
                preloadPromises.push(productLocalStore.fetchProducts(true).catch(e => console.warn('Failed to pre-load products:', e)))
            }
            if (!roleLocalStore.roles.length) {
                preloadPromises.push(roleLocalStore.fetchRoles(true).catch(e => console.warn('Failed to pre-load roles:', e)))
            }
            if (!salesOrderLocalStore.salesOrders.length) {
                preloadPromises.push(salesOrderLocalStore.fetchSalesOrders(true).catch(e => console.warn('Failed to pre-load sales orders:', e)))
            }
            if (!purchaseOrderLocalStore.purchaseOrders.length) {
                preloadPromises.push(purchaseOrderLocalStore.fetchPurchaseOrders(true).catch(e => console.warn('Failed to pre-load purchase orders:', e)))
            }
            if (!salesReturnLocalStore.salesReturns.length) {
                preloadPromises.push(salesReturnLocalStore.fetchSalesReturns(true).catch(e => console.warn('Failed to pre-load sales returns:', e)))
            }
            if (!suratJalanLocalStore.suratJalans.length) {
                preloadPromises.push(suratJalanLocalStore.fetchSuratJalans(true).catch(e => console.warn('Failed to pre-load surat jalans:', e)))
            }
            if (!quotationLocalStore.quotations.length) {
                preloadPromises.push(quotationLocalStore.fetchQuotations(true).catch(e => console.warn('Failed to pre-load quotations:', e)))
            }
            if (!vendorLocalStore.vendors.length) {
                preloadPromises.push(vendorLocalStore.fetchVendors(true).catch(e => console.warn('Failed to pre-load vendors:', e)))
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
        document.addEventListener('click', handleNotificationClickOutside);
        
        // Store interval for cleanup
        window.notificationInterval = notificationInterval
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('click', handleNotificationClickOutside);
        
        // Clear notification polling interval
        if (window.notificationInterval) {
            clearInterval(window.notificationInterval);
        }
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

.dropdown-user {
    z-index: 9999;
}

/* Notification bell design like in the image */
.notification-bell-wrapper {
  position: relative;
  background: #f5f5f5 !important;
  border-radius: 50% !important;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.notification-bell-wrapper:hover {
  background: #e9ecef !important;
  transform: scale(1.05);
}

.notification-bell-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.notification-bell-icon {
  color: #333 !important;
  font-size: 20px;
  z-index: 2;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  padding: 0 4px;
  border: 2px solid white;
  z-index: 3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Envelope button styling */
.dropdown-notifications-all {
  transition: all 0.2s ease;
  border-radius: 6px;
}

.dropdown-notifications-all:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.dropdown-notifications-all i {
  transition: all 0.2s ease;
}

.dropdown-notifications-all:hover i {
  color: #28a745 !important;
}

/* Replicate Popper.js positioning for the user dropdown */
.navbar-nav .dropdown .dropdown-menu {
  position: absolute;
  top: 100%;
  left: auto;
  right: 0;
  margin-top: 0.125rem;
}

/* Notification dropdown specific styling */
.navbar-nav .dropdown-notifications .dropdown-menu {
  min-width: 350px;
  max-width: 400px;
  max-height: 500px;
  overflow: hidden;
}

/* Force scroll on notification dropdown */
.dropdown-notifications .dropdown-menu {
  max-height: 900px !important;
}

.dropdown-notifications .dropdown-menu .dropdown-notifications-list {
  max-height: 500px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

.dropdown-notifications .dropdown-menu .dropdown-notifications-list .list-group {
  max-height: 550px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
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
    min-width: 100px;
  }

  .navbar-search-wrapper .search-toggler {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding-left: 12px !important;
  padding-right: 12px;
  transform: scale(1.0);
  transition: all 0.3s ease;
  width: 100px;
}

  .navbar-search-wrapper .search-toggler:hover {
    width: 100px;
  }
  
  .search-results-dropdown {
    max-height: 250px;
  }
}
</style>