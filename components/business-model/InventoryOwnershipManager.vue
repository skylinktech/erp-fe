<template>
  <section class="card mb-3">
    <div class="card-body">
      <h3 class="h6">Kepemilikan persediaan</h3>
      <p class="small text-muted">Satu produk dan gudang hanya boleh punya satu pemilik aktif. Penggantian pemilik harus eksplisit dan tidak memindahkan stok.</p>
      <div class="input-group mb-2">
        <input v-model="search" class="form-control" aria-label="Cari produk" placeholder="Cari produk" @keyup.enter="$emit('search', search)" />
        <button class="btn btn-outline-secondary" type="button" @click="$emit('search', search)">Cari</button>
      </div>
      <form v-if="canManage" class="row g-2 mb-3" @submit.prevent="submitGrant">
        <div class="col-12 col-md-4">
          <label class="form-label" for="own-product">ID produk</label>
          <input id="own-product" v-model.number="grant.productId" type="number" class="form-control" required min="1" />
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label" for="own-warehouse">ID gudang</label>
          <input id="own-warehouse" v-model.number="grant.warehouseId" type="number" class="form-control" required min="1" />
        </div>
        <div class="col-12 col-md-4 d-flex align-items-end gap-2">
          <div class="form-check mb-2">
            <input id="own-replace" v-model="grant.replace" class="form-check-input" type="checkbox" />
            <label class="form-check-label" for="own-replace">Ganti pemilik lain</label>
          </div>
          <button class="btn btn-outline-primary btn-sm" type="submit">Berikan</button>
        </div>
      </form>
      <div class="table-responsive">
        <table class="table table-sm">
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td class="text-break">{{ row.productName }}<div class="small text-muted">{{ row.warehouseName }}</div></td>
              <td>{{ row.isActive ? 'Pemilik aktif' : 'Nonaktif' }}</td>
              <td class="text-nowrap">
                <template v-if="canManage">
                  <button
                    v-if="row.isActive"
                    class="btn btn-outline-warning btn-sm me-1"
                    type="button"
                    @click="$emit('deactivate', row)"
                  >
                    Nonaktifkan
                  </button>
                  <button
                    v-else
                    class="btn btn-outline-primary btn-sm me-1"
                    type="button"
                    @click="$emit('grant', { productId: row.productId, warehouseId: row.warehouseId, replace: false })"
                  >
                    Aktifkan
                  </button>
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    type="button"
                    @click="$emit('replace', row)"
                  >
                    Ganti
                  </button>
                </template>
              </td>
            </tr>
            <tr v-if="!rows.length"><td class="text-muted" colspan="3">Belum ada kepemilikan pada halaman ini.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

defineProps<{ rows: any[]; canManage?: boolean }>()
const emit = defineEmits<{
  search: [value: string]
  grant: [payload: { productId: number; warehouseId: number; replace: boolean }]
  deactivate: [row: any]
  replace: [row: any]
}>()

const search = ref('')
const grant = reactive({ productId: null as number | null, warehouseId: null as number | null, replace: false })

function submitGrant() {
  if (!grant.productId || !grant.warehouseId) return
  emit('grant', {
    productId: Number(grant.productId),
    warehouseId: Number(grant.warehouseId),
    replace: Boolean(grant.replace),
  })
}
</script>
