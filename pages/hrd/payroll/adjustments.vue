<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'check-permission'], alias: '/payroll/adjustments' })
await navigateTo('/payroll/runs')
</script>
