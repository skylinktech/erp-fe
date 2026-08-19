<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'check-permission'], alias: '/payroll/bpjs-profiles' })
await navigateTo('/payroll/configuration?tab=bpjs')
</script>
