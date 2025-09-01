# Fitur Search Menu Aplikasi

## Deskripsi
Fitur search menu aplikasi memungkinkan pengguna untuk mencari dan mengakses semua menu yang tersedia dalam aplikasi ERP secara cepat dan mudah.

## Fitur Utama

### 1. Search Modal
- Modal search yang dapat diakses dari navbar
- Input search dengan placeholder "Cari menu aplikasi..."
- Keyboard shortcut `Ctrl + /` untuk membuka search

### 2. Pencarian Menu
- Mencari berdasarkan nama menu
- Mencari berdasarkan kategori menu
- Mencari berdasarkan path/route menu
- Hasil pencarian real-time

### 3. Akses Cepat (Quick Actions)
- Dashboard
- Pegawai (HRD)
- Barang (Inventory)
- Penjualan (Sales)
- Purchase Order (Purchasing)
- Jurnal (Accounting)

### 4. Navigasi Keyboard
- **↑↓** - Navigasi hasil pencarian
- **Enter** - Buka halaman yang dipilih
- **Esc** - Tutup modal search

### 5. Kategori Menu yang Tersedia
- **Dashboard** - Halaman utama dashboard
- **HRD** - Modul sumber daya manusia
- **Inventory** - Modul inventaris dan stok
- **Sales** - Modul penjualan dan customer
- **Purchasing** - Modul pembelian dan vendor
- **Accounting** - Modul akuntansi dan keuangan
- **Master Data** - Data master aplikasi
- **Company** - Pengaturan perusahaan
- **Admin** - Pengaturan sistem dan user

## Cara Penggunaan

### 1. Membuka Search
- Klik tombol search di navbar (ikon kaca pembesar)
- Atau gunakan keyboard shortcut `Ctrl + /`

### 2. Mencari Menu
- Ketik nama menu yang ingin dicari
- Hasil pencarian akan muncul secara real-time
- Gunakan tombol ↑↓ untuk navigasi hasil

### 3. Mengakses Menu
- Klik pada hasil pencarian yang diinginkan
- Atau gunakan Enter untuk membuka hasil yang dipilih
- Aplikasi akan langsung mengarahkan ke halaman tersebut

### 4. Menutup Search
- Klik tombol close (X)
- Atau tekan tombol Esc
- Atau klik di luar area modal

## Struktur File

### Components
- `SearchModal.vue` - Komponen modal search utama
- `Navbar.vue` - Navbar dengan tombol search

### Data
- `erp-menu.js` - Data menu aplikasi ERP
- `menu.js` - Data menu lama (untuk kompatibilitas)

### Composables
- `useSearch.ts` - Logic dan state management untuk search

## Implementasi Teknis

### 1. State Management
- Menggunakan composable `useSearch` untuk state management
- Reactive search query dan results
- Keyboard navigation state

### 2. Data Source
- Menu items diambil dari file `erp-menu.js`
- Quick actions untuk akses cepat
- Dynamic loading menu dari store (jika diperlukan)

### 3. Search Algorithm
- Case-insensitive search
- Search berdasarkan multiple fields (name, category, path)
- Real-time filtering

### 4. Navigation
- Menggunakan Vue Router untuk navigasi
- Auto-close modal setelah navigasi
- Preserve search state

## Customization

### 1. Menambah Menu Baru
Edit file `erp-menu.js`:
```javascript
{
  name: "Nama Menu",
  path: "/path/menu",
  icon: "ri-icon-name",
  category: "Kategori",
  type: "main"
}
```

### 2. Menambah Quick Action
Edit array `quickActions` di `SearchModal.vue`:
```javascript
{ 
  name: 'Nama Action', 
  path: '/path/action', 
  icon: 'ri-icon-name', 
  category: 'Kategori', 
  type: 'quick' 
}
```

### 3. Mengubah Styling
- Edit CSS di `SearchModal.vue`
- Gunakan CSS variables untuk theming
- Responsive design untuk mobile

## Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance
- Lazy loading menu items
- Debounced search input
- Efficient filtering algorithm
- Minimal re-renders

## Troubleshooting

### 1. Search tidak muncul
- Pastikan komponen `SearchModal` sudah diimport
- Cek console untuk error JavaScript
- Pastikan data menu tersedia

### 2. Keyboard shortcut tidak berfungsi
- Pastikan event listener sudah terpasang
- Cek konflik dengan shortcut lain
- Pastikan focus tidak di input field lain

### 3. Menu tidak ditemukan
- Pastikan path menu sudah benar
- Cek permission user untuk menu tersebut
- Pastikan menu sudah terdaftar di `erp-menu.js`

## Future Enhancements
- Search history
- Favorite menu
- Recent accessed menu
- Advanced filtering
- Search suggestions
- Voice search
- Search analytics
