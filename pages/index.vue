<script setup>
import { useRouter } from '#app'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()

if (process.client) {
  // Cookie-based auth: check via user store instead of localStorage
  if (userStore.user) {
    router.push('/dashboard')
  } else {
    // Try to load user from cookie
    userStore.loadUser().then(() => {
      if (userStore.user) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    })
  }
}
</script>