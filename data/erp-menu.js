export const erpMenuItems = [
  // Dashboard
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "ri-home-smile-line",
    category: "Dashboard",
    type: "main"
  },

  // HRD Module
  {
    name: "Pegawai",
    path: "/hrd/pegawai",
    icon: "ri-team-line",
    category: "HRD",
    type: "main"
  },
  {
    name: "Kehadiran",
    path: "/hrd/kehadiran",
    icon: "ri-calendar-check-line",
    category: "HRD",
    type: "main"
  },
  {
    name: "Cuti & Izin",
    path: "/hrd/cuti",
    icon: "ri-calendar-event-line",
    category: "HRD",
    type: "main"
  },
  {
    name: "Lembur",
    path: "/hrd/lembur",
    icon: "ri-time-line",
    category: "HRD",
    type: "main"
  },
  {
    name: "Perjalanan Dinas",
    path: "/hrd/perjalanan-dinas",
    icon: "ri-flight-takeoff-line",
    category: "HRD",
    type: "main"
  },
  {
    name: "Saldo Cuti",
    path: "/hrd/saldo-cuti",
    icon: "ri-wallet-3-line",
    category: "HRD",
    type: "main"
  },
  {
    name: "Struktur Organisasi",
    path: "/hrd/struktur-organisasi",
    icon: "ri-organization-chart",
    category: "HRD",
    type: "main"
  },
  {
    name: "Kalender",
    path: "/hrd/kalender",
    icon: "ri-calendar-line",
    category: "HRD",
    type: "main"
  },
  {
    name: "Departemen",
    path: "/hrd/departemen",
    icon: "ri-building-line",
    category: "HRD",
    type: "main"
  },
  {
    name: "Jabatan",
    path: "/hrd/jabatan",
    icon: "ri-user-settings-line",
    category: "HRD",
    type: "main"
  },
  {
    name: "Divisi",
    path: "/hrd/divisi",
    icon: "ri-sitemap-line",
    category: "HRD",
    type: "main"
  },

  // Inventory Module
  {
    name: "Barang",
    path: "/inventory/barang",
    icon: "ri-store-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Kategori Barang",
    path: "/inventory/kategori",
    icon: "ri-price-tag-3-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Stok Barang",
    path: "/inventory/stok",
    icon: "ri-box-3-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Barang Masuk",
    path: "/inventory/barang-masuk",
    icon: "ri-login-box-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Barang Keluar",
    path: "/inventory/barang-keluar",
    icon: "ri-logout-box-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Adjustment Stok",
    path: "/inventory/adjustment",
    icon: "ri-settings-3-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Purchase Return",
    path: "/inventory/purchase-return",
    icon: "ri-arrow-go-back-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Stock Card",
    path: "/inventory/stock-card",
    icon: "ri-file-list-3-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Stock Movements",
    path: "/inventory/stock-movements",
    icon: "ri-exchange-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Inventory Valuation",
    path: "/inventory/valuation",
    icon: "ri-funds-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Inventory Cost Balance",
    path: "/inventory/cost-balance",
    icon: "ri-wallet-3-line",
    category: "Inventory",
    type: "main"
  },
  {
    name: "Rekonsiliasi Stok",
    path: "/inventory/reconciliation",
    icon: "ri-scales-3-line",
    category: "Inventory",
    type: "main"
  },

  // Sales Module
  {
    name: "POS",
    path: "/sales/pos",
    icon: "ri-shopping-basket-line",
    category: "Sales",
    type: "main"
  },
  {
    name: "Penjualan",
    path: "/sales/penjualan",
    icon: "ri-shopping-cart-line",
    category: "Sales",
    type: "main"
  },
  {
    name: "Customer",
    path: "/sales/customer",
    icon: "ri-user-line",
    category: "Sales",
    type: "main"
  },
  {
    name: "Sales Order",
    path: "/sales/sales-order",
    icon: "ri-file-list-3-line",
    category: "Sales",
    type: "main"
  },
  {
    name: "Invoice",
    path: "/sales/invoice",
    icon: "ri-bill-line",
    category: "Sales",
    type: "main"
  },
  {
    name: "Retur Penjualan",
    path: "/sales/retur",
    icon: "ri-arrow-go-back-line",
    category: "Sales",
    type: "main"
  },

  // Purchasing Module
  {
    name: "Purchase Order",
    path: "/purchasing/purchase-order",
    icon: "ri-shopping-bag-4-line",
    category: "Purchasing",
    type: "main"
  },
  {
    name: "Vendor",
    path: "/purchasing/vendor",
    icon: "ri-store-2-line",
    category: "Purchasing",
    type: "main"
  },
  {
    name: "Barang Masuk",
    path: "/purchasing/barang-masuk",
    icon: "ri-login-box-line",
    category: "Purchasing",
    type: "main"
  },
  {
    name: "Retur Pembelian",
    path: "/purchasing/retur",
    icon: "ri-arrow-go-back-line",
    category: "Purchasing",
    type: "main"
  },

  // Finance — Inventory Accounting visibility (Phase 17)
  {
    name: "Inventory Accounting Events",
    path: "/finance/inventory-accounting-events",
    icon: "ri-calendar-event-line",
    category: "Finance",
    type: "main"
  },
  {
    name: "Accounting Processing Monitor",
    path: "/finance/accounting-processing-monitor",
    icon: "ri-radar-line",
    category: "Finance",
    type: "main"
  },
  {
    name: "Accounting Exceptions",
    path: "/finance/accounting-exceptions",
    icon: "ri-error-warning-line",
    category: "Finance",
    type: "main"
  },
  {
    name: "GRNI",
    path: "/finance/grni",
    icon: "ri-inbox-unarchive-line",
    category: "Finance",
    type: "main"
  },
  {
    name: "Inventory COGS",
    path: "/finance/inventory-cogs",
    icon: "ri-shopping-bag-3-line",
    category: "Finance",
    type: "main"
  },
  {
    name: "Purchase Price Variance",
    path: "/finance/ppv",
    icon: "ri-contrast-2-line",
    category: "Finance",
    type: "main"
  },
  {
    name: "Inventory NRV",
    path: "/finance/nrv",
    icon: "ri-subtract-line",
    category: "Finance",
    type: "main"
  },
  {
    name: "Inventory Accounting Reconciliation",
    path: "/finance/inventory-accounting-reconciliation",
    icon: "ri-scales-3-line",
    category: "Finance",
    type: "main"
  },

  // Accounting Module
  {
    name: "Jurnal",
    path: "/accounting/jurnal",
    icon: "ri-calculator-line",
    category: "Accounting",
    type: "main"
  },
  {
    name: "Jurnal Detail",
    path: "/accounting/jurnal-detail",
    icon: "ri-file-list-line",
    category: "Accounting",
    type: "main"
  },
  {
    name: "Buku Besar",
    path: "/accounting/buku-besar",
    icon: "ri-book-open-line",
    category: "Accounting",
    type: "main"
  },
  {
    name: "Laba Rugi",
    path: "/accounting/laba-rugi",
    icon: "ri-bar-chart-line",
    category: "Accounting",
    type: "main"
  },

  // Master Data
  {
    name: "Customer",
    path: "/master/customer",
    icon: "ri-user-line",
    category: "Master Data",
    type: "main"
  },
  {
    name: "Supplier",
    path: "/master/supplier",
    icon: "ri-store-2-line",
    category: "Master Data",
    type: "main"
  },
  {
    name: "Kategori",
    path: "/master/kategori",
    icon: "ri-price-tag-3-line",
    category: "Master Data",
    type: "main"
  },
  {
    name: "Satuan",
    path: "/master/satuan",
    icon: "ri-ruler-line",
    category: "Master Data",
    type: "main"
  },

  // Company Module
  {
    name: "Profil Perusahaan",
    path: "/company/profile",
    icon: "ri-building-line",
    category: "Company",
    type: "main"
  },
  {
    name: "Pengaturan",
    path: "/company/settings",
    icon: "ri-settings-4-line",
    category: "Company",
    type: "main"
  },

  // Admin Module
  {
    name: "Menu Group",
    path: "/admin/menu-group",
    icon: "ri-menu-line",
    category: "Admin",
    type: "main"
  },
  {
    name: "Menu Detail",
    path: "/admin/menu-detail",
    icon: "ri-list-check-2",
    category: "Admin",
    type: "main"
  },
  {
    name: "Role",
    path: "/admin/role",
    icon: "ri-shield-user-line",
    category: "Admin",
    type: "main"
  },
  {
    name: "Permission",
    path: "/admin/permission",
    icon: "ri-lock-line",
    category: "Admin",
    type: "main"
  },
  {
    name: "User",
    path: "/admin/user",
    icon: "ri-user-settings-line",
    category: "Admin",
    type: "main"
  }
];

// Helper function untuk mencari menu berdasarkan query
export const searchMenuItems = (query, menuItems = erpMenuItems) => {
  if (!query || !query.trim()) return [];
  
  const searchQuery = query.toLowerCase().trim();
  
  return menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery) ||
    item.category.toLowerCase().includes(searchQuery) ||
    item.path.toLowerCase().includes(searchQuery)
  );
};

// Helper function untuk mendapatkan menu berdasarkan kategori
export const getMenuByCategory = (category, menuItems = erpMenuItems) => {
  return menuItems.filter(item => item.category === category);
};

// Helper function untuk mendapatkan semua kategori
export const getAllCategories = (menuItems = erpMenuItems) => {
  return [...new Set(menuItems.map(item => item.category))];
};
