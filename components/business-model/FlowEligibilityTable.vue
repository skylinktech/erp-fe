<template>
  <section class="card mb-3">
    <div class="card-body">
      <h3 class="h6">Business Flow</h3>
      <div class="d-none d-lg-block table-responsive">
        <table class="table table-sm align-middle">
          <thead>
            <tr><th>Flow</th><th>Sumber</th><th>Status</th><th>Versi</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="flow in flows" :key="flow.flowCode">
              <td class="text-break">{{ flow.flowCode }}<div class="small text-muted">{{ flow.profileCode }}</div></td>
              <td>{{ flow.eligibilitySource }}</td>
              <td>{{ flow.effectiveEligible ? 'Enabled' : 'Disabled' }}</td>
              <td>{{ flow.publishedVersion ? `v${flow.publishedVersion}` : 'Belum terbit' }}</td>
              <td>
                <button v-if="canManage && grantControlsPrimaryFlow(flow.eligibilitySource)" class="btn btn-outline-secondary btn-sm" type="button" @click="$emit('toggle', flow)">
                  {{ flow.explicitlyGranted ? 'Cabut grant' : 'Beri grant' }}
                </button>
                <span v-else class="small text-muted">Mengikuti profil utama</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-lg-none">
        <article v-for="flow in flows" :key="`card-${flow.flowCode}`" class="border rounded p-2 mb-2">
          <div class="fw-semibold text-break">{{ flow.flowCode }}</div>
          <div class="small">{{ flow.eligibilitySource }} · {{ flow.effectiveEligible ? 'Enabled' : 'Disabled' }} · {{ flow.publishedVersion ? `v${flow.publishedVersion}` : 'Belum terbit' }}</div>
          <button v-if="canManage && grantControlsPrimaryFlow(flow.eligibilitySource)" class="btn btn-outline-secondary btn-sm mt-2" type="button" @click="$emit('toggle', flow)">
            {{ flow.explicitlyGranted ? 'Cabut grant' : 'Beri grant' }}
          </button>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { grantControlsPrimaryFlow } from '~/utils/businessModelConfiguration'
defineProps<{ flows: any[]; canManage: boolean }>()
defineEmits<{ toggle: [flow: any] }>()
</script>
