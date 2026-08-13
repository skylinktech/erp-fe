<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">Service Events</h4>
          <p class="mb-0 text-muted">Global lifecycle event log</p>
        </div>
        <button class="btn btn-outline-secondary btn-sm" @click="load">Refresh</button>
      </div>
      <div class="card">
        <div class="card-body table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Event</th>
                <th>From → To</th>
                <th>Source</th>
                <th>Reason</th>
                <th>Instance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ev in store.events" :key="ev.id">
                <td>{{ ev.createdAt || ev.created_at }}</td>
                <td>{{ ev.eventType || ev.event_type }}</td>
                <td>{{ ev.fromStatus || ev.from_status || '—' }} → {{ ev.toStatus || ev.to_status || '—' }}</td>
                <td>{{ ev.source }}</td>
                <td>{{ ev.reason || '—' }}</td>
                <td>
                  <NuxtLink
                    v-if="ev.serviceInstanceId || ev.service_instance_id"
                    :to="`/service-management/${ev.serviceInstanceId || ev.service_instance_id}`"
                  >
                    Detail
                  </NuxtLink>
                </td>
              </tr>
              <tr v-if="!store.events.length">
                <td colspan="6" class="text-center text-muted">Belum ada event</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useServiceInstanceStore } from '~/stores/service-instances'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Service Events',
})

const store = useServiceInstanceStore()
async function load() {
  await store.fetchEvents()
}
onMounted(load)
</script>
