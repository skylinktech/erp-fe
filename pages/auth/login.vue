<template>
  <div class="position-relative">
    <div class="authentication-wrapper authentication-basic container-p-y p-4 p-sm-0">
      <div class="authentication-inner py-6">
        <div class="card p-md-7 p-1">
          <div class="app-brand justify-content-center mt-5">
            <a href="/" class="app-brand-link gap-2">
              <span class="app-brand-logo demo">
                <img src="/img/branding/logo.png" alt="" height="60" />
              </span>
              <span class="app-brand-text demo text-heading fw-bold" style="font-size: 24px;">Skylink ERP</span>
            </a>
          </div>
          <small class="manage-by mt-3 text-center text-muted">by PT Sinergi Innovate Pratama</small>
          <div class="card-body mt-1">
            <h4 class="mb-1">Welcome to Skylink ERP! 👋</h4>
            <p class="mb-5">Please sign-in to your account and start the adventure</p>

            <form class="mb-5" @submit.prevent="handleLogin">
              <div class="form-floating form-floating-outline mb-5">
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="username"
                  placeholder="Enter your username"
                  autofocus
                  
                />
                <label for="username">Username</label>
              </div>
              <div class="mb-5">
                <div class="form-password-toggle">
                  <div class="input-group input-group-merge">
                    <div class="form-floating form-floating-outline">
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        id="password"
                        class="form-control"
                        v-model="password"
                        placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                        
                        aria-describedby="password"
                      />
                      <label for="password">Password</label>
                    </div>
                    <span class="input-group-text cursor-pointer" @click="togglePassword">
                      <i ></i>
                    </span>
                  </div>
                </div>
              </div>
              <div class="mb-5 d-flex justify-content-between mt-5">
                <div class="form-check mt-2">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="remember-me" 
                    v-model="rememberMe"
                  />
                  <label class="form-check-label" for="remember-me"> Remember Me </label>
                </div>
                <NuxtLink to="/auth/forgot-password" class="float-end mb-1 mt-2">
                  <span>Forgot Password?</span>
                </NuxtLink>
              </div>
              <div class="mb-5">
                <button class="btn btn-primary d-grid w-100" type="submit" :disabled="pending">
                  <span v-if="pending">Signing In...</span>
                  <span v-else>Sign in</span>
                </button>
              </div>
            </form>
            <p v-if="error" class="text-danger mt-3">{{ error }}</p>
          </div>
        </div>
        <img
          alt="mask"
          src="/img/illustrations/auth-basic-login-mask-light.png"
          class="authentication-image d-none d-lg-block"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  definePageMeta({
      layout: 'auth',
      middleware: 'redirect-auth',
      title: 'Login',
      description: 'Login',
      keywords: 'Login, Skylink ERP',
      author: 'KaiFlow',
      robots: 'index, follow',
      viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0',
      generator: 'KaiFlow'
  })

  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '~/stores/user';
  import { checkMyRole } from '~/utils/checkRole';
  import { getAccessTokenCookieOptions } from '~/utils/authCookie';

  const { $api }  = useNuxtApp()
  const toast     = useToast();
  const userStore = useUserStore();
  const router    = useRouter();
  const ssoService = useSsoService();

  const username    = ref('');
  const password    = ref('');
  const rememberMe  = ref(false);
  const pending     = ref(false);
  const error       = ref(null);

  // Load saved credentials on component mount
  onMounted(() => {
    loadSavedCredentials();
  });

  const loadSavedCredentials = () => {
    try {
      // Gunakan cookie untuk username saja, jangan simpan password
      const savedUsername = useCookie('remembered_username');
      if (savedUsername.value) {
        username.value = savedUsername.value;
        rememberMe.value = true;
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const saveCredentials = () => {
    if (rememberMe.value) {
      // Hanya simpan username di cookie, jangan simpan password
      const usernameCookie = useCookie('remembered_username', {
        maxAge: 30 * 24 * 60 * 60, // 30 hari
        secure: true,
        sameSite: 'strict'
      });
      usernameCookie.value = username.value;
    } else {
      // Hapus cookie jika remember me tidak dicentang
      const usernameCookie = useCookie('remembered_username');
      usernameCookie.value = null;
    }
  };

  const handleLogin = async () => {
    pending.value = true;
    error.value = null;
    
    // Clear any invalid cookies before login
    if (process.client) {
      const { clearInvalidCookies } = await import('~/utils/clearInvalidCookies')
      clearInvalidCookies()
    }
    
    try {
      // Step 1: Authenticate dengan SSO
      const ssoResponse = await ssoService.authenticate(username.value, password.value);
      
      if (!ssoResponse || !ssoResponse.access_token) {
        error.value = 'Gagal autentikasi dengan SSO.';
        toast.error({
          title: 'Login Gagal!',
          icon: 'ri-close-line',
          message: error.value,
          timeout: 3000,
          position: 'topRight',
          layout: 2,
        });
        pending.value = false;
        return;
      }
      
      // Validasi token sebelum menyimpan
      if (ssoResponse.access_token === 'null' || ssoResponse.access_token === 'undefined' || !ssoResponse.access_token.trim()) {
        error.value = 'Token tidak valid dari SSO.';
        toast.error({
          title: 'Login Gagal!',
          icon: 'ri-close-line',
          message: error.value,
          timeout: 3000,
          position: 'topRight',
          layout: 2,
        });
        pending.value = false;
        return;
      }

      // Step 2: Get user info dari SSO
      const ssoUserInfo = await ssoService.getUserInfo(ssoResponse.access_token);
      
      if (!ssoUserInfo) {
        error.value = 'Gagal mendapatkan informasi user dari SSO.';
        toast.error({
          title: 'Login Gagal!',
          icon: 'ri-close-line',
          message: error.value,
          timeout: 3000,
          position: 'topRight',
          layout: 2,
        });
        pending.value = false;
        return;
      }

      // Step 3: Save credentials if remember me is checked
      saveCredentials();

      // Step 4: Dengan cookie-based auth, token sudah otomatis disimpan di httpOnly cookie
      // Tidak perlu simpan ke localStorage lagi untuk keamanan yang lebih baik
      
      // Step 5: Fetch user data dari backend ERP menggunakan SSO token
      // Backend ERP akan sync user data dari SSO dan mengembalikan data user yang benar
      let userData = null;
      try {
        const requestHeaders = {
          'Authorization': `Bearer ${ssoResponse.access_token}`,
          'Content-Type': 'application/json',
        };
        
        // Kirim token di Authorization header untuk cross-domain request
        // Cookie dari SSO domain tidak akan dikirim ke ERP domain (different domain)
        const backendResponse = await fetch($api.me(), {
          method: 'GET',
          headers: requestHeaders,
          credentials: 'include' // Untuk menerima cookie dari ERP backend
        });

        if (backendResponse.ok) {
          userData = await backendResponse.json();
          // Gunakan data dari backend ERP (yang sudah sync dengan SSO)
          userStore.setUser(userData);

          // Simpan token ke cookie yang bisa dibaca frontend untuk Authorization header
          // Penting untuk production cross-origin: ERP httpOnly cookie mungkin tidak terkirim
          const accessTokenCookie = useCookie('access_token', getAccessTokenCookieOptions());
          accessTokenCookie.value = ssoResponse.access_token;
        } else {
          // Jika 401, kemungkinan token invalid atau user sync gagal
          // Tetap simpan token agar API call berikutnya bisa pakai Authorization header
          const accessTokenCookie = useCookie('access_token', getAccessTokenCookieOptions());
          accessTokenCookie.value = ssoResponse.access_token;

          userData = {
            id: ssoUserInfo.id,
            username: ssoUserInfo.username || ssoUserInfo.email,
            email: ssoUserInfo.email,
            fullName: ssoUserInfo.name,
            roles: (ssoUserInfo.roles || []).map((roleName) => ({
              id: 0,
              name: roleName,
              permissions: []
            })),
          };
          userStore.setUser(userData);
        }
      } catch (backendError) {
        // Jika error, simpan token dan gunakan data dari SSO sebagai fallback
        const accessTokenCookie = useCookie('access_token', getAccessTokenCookieOptions());
        accessTokenCookie.value = ssoResponse.access_token;

        userData = {
          id: ssoUserInfo.id,
          username: ssoUserInfo.username || ssoUserInfo.email,
          email: ssoUserInfo.email,
          fullName: ssoUserInfo.name,
          roles: (ssoUserInfo.roles || []).map((roleName) => ({
            id: 0,
            name: roleName,
            permissions: []
          })),
        };
        userStore.setUser(userData);
      }
      
      // Pastikan user data sudah tersimpan dan store sudah ter-update
      await new Promise(resolve => setTimeout(resolve, 200));

      toast.success({
        title: 'Login Berhasil!',
        icon: 'ri-check-line',
        message: 'Selamat datang',
        timeout: 3000,
        position: 'topRight',
        layout: 2,
      });
      
      // Redirect ke dashboard setelah user data tersimpan
      await router.push('/dashboard');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat login.';
      error.value = errorMessage;
      toast.error({
        title: 'Login Gagal!',
        icon: 'ri-close-line',
        message: `Gagal login: ${errorMessage}`,
        timeout: 3000,
        position: 'topRight',
        layout: 2,
      });
    } finally {
      pending.value = false;
    }
  };

  const showPassword = ref(false);
  const togglePassword = () => {
    showPassword.value = !showPassword.value;
  };
</script>

<style scoped>
</style>