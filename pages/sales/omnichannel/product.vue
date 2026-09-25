<script setup lang="ts">
/** Alias route — sidebar uses /produk */
definePageMeta({ middleware: ['auth', 'check-permission'] })
await navigateTo('/sales/omnichannel/produk')
</script>
