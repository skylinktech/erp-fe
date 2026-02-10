<template>
  <div class="pos-layout">
    <!-- Left Sidebar -->
    <aside class="pos-sidebar">
      <div class="pos-sidebar-header">
        <NuxtLink to="/" class="pos-logo">
          <img src="/img/branding/logo.png" alt="Logo" class="pos-logo-icon">
          <span class="pos-logo-text">Skylink</span>
        </NuxtLink>
      </div>
      <nav class="pos-nav">
        <NuxtLink to="/sales/pos" class="pos-nav-item" active-class="active">
          <i class="fas fa-th-large pos-nav-icon"></i>
          <span class="pos-nav-label">Menu</span>
        </NuxtLink>
        <NuxtLink to="/sales/pos" class="pos-nav-item">
          <i class="fas fa-list pos-nav-icon"></i>
          <span class="pos-nav-label">Order List</span>
          <span class="pos-nav-badge">1</span>
        </NuxtLink>
        <NuxtLink to="/sales/pos" class="pos-nav-item">
          <i class="fas fa-history pos-nav-icon"></i>
          <span class="pos-nav-label">History</span>
        </NuxtLink>
        <NuxtLink to="/sales/pos" class="pos-nav-item">
          <i class="fas fa-file-invoice-dollar pos-nav-icon"></i>
          <span class="pos-nav-label">Bills</span>
        </NuxtLink>
        <NuxtLink to="/sales/pos" class="pos-nav-item">
          <i class="fas fa-cog pos-nav-icon"></i>
          <span class="pos-nav-label">Settings</span>
        </NuxtLink>
        <NuxtLink to="/sales/pos" class="pos-nav-item">
          <i class="fas fa-question-circle pos-nav-icon"></i>
          <span class="pos-nav-label">Help Center</span>
        </NuxtLink>
      </nav>
      <div class="pos-sidebar-footer">
        <button type="button" class="pos-nav-item pos-sign-out" @click="signOut">
          <i class="fas fa-sign-out-alt pos-nav-icon"></i>
          <span class="pos-nav-label">Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main + Right Sidebar wrapper -->
    <div class="pos-main-wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup>
useHead({
  link: [
    { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' }
  ]
})

function signOut() {
  // Redirect to login or call auth logout
  navigateTo('/auth/login')
}
</script>

<style scoped>
.pos-layout {
  display: flex;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  background: #fff;
}

/* Sidebar: hijau segar seperti referensi gambar POS */
.pos-sidebar {
  width: 260px;
  min-width: 260px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.06);
}

.pos-sidebar-header {
  padding: 0 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.pos-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #000;
  font-weight: 600;
  font-size: 1.125rem;
}

.pos-logo-icon {
  width: 32px;
  height: 32px;
  background: #e5e7eb;
  border-radius: 8px;
}

.pos-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0 0.75rem;
}

.pos-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: #000;
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.pos-nav-item:hover {
  background: #f1f5f9;
  color: #000;
}

.pos-nav-item.active {
  background: var(--pos-primary-light, rgba(102, 108, 255, 0.12));
  color: var(--pos-primary, #666cff);
}

.pos-nav-item.active .pos-nav-icon {
  color: var(--pos-primary, #666cff);
}

.pos-nav-icon {
  width: 1.25rem;
  margin-right: 0.5rem;
  text-align: center;
  font-size: 1rem;
  opacity: 0.9;
}

.pos-nav-label {
  flex: 1;
}

.pos-nav-badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.pos-sidebar-footer {
  padding: 1rem 0.75rem 0;
  border-top: 1px solid #e5e7eb;
}

.pos-sign-out {
  color: #000;
}

.pos-main-wrapper {
  flex: 1;
  display: flex;
  min-width: 0;
  background: #fff;
}
</style>
