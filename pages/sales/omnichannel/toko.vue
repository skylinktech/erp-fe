<script setup lang="ts">
/** Legacy leaf → Settings › Toko Terhubung */
definePageMeta({ middleware: ['auth', 'check-permission'] })
await navigateTo('/sales/omnichannel/settings?tab=toko')
</script>
