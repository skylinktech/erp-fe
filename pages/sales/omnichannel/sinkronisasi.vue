<script setup lang="ts">
/** Legacy leaf → Settings › Sinkronisasi */
definePageMeta({ middleware: ['auth', 'check-permission'] })
await navigateTo('/sales/omnichannel/settings?tab=sinkronisasi')
</script>
