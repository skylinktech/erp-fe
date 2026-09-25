<template>
  <section class="card mb-3">
    <div class="card-body">
      <h3 class="h6">Alokasi gudang</h3>
      <p class="small text-muted">Alokasi memberi akses gudang. Alokasi bukan kepemilikan persediaan.</p>
      <div class="input-group mb-2">
        <input v-model="search" class="form-control" aria-label="Cari gudang" placeholder="Cari gudang" @keyup.enter="$emit('search', search)" />
        <button class="btn btn-outline-secondary" type="button" @click="$emit('search', search)">Cari</button>
      </div>
      <div class="table-responsive">
        <table class="table table-sm">
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td class="text-break">{{ row.name }}</td>
              <td>{{ row.allocated ? 'Teralokasi' : 'Tidak teralokasi' }}</td>
              <td>
                <button v-if="canManage" class="btn btn-outline-primary btn-sm" type="button" @click="$emit('toggle', row)">
                  {{ row.allocated ? 'Cabut alokasi' : 'Alokasikan' }}
                </button>
              </td>
            </tr>
            <tr v-if="!rows.length"><td class="text-muted">Tidak ada gudang pada halaman ini.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ rows: any[]; canManage: boolean }>()
defineEmits<{ search: [value: string]; toggle: [row: any] }>()
const search = ref('')
</script>
