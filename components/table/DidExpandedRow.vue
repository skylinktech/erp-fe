<template>
  <div class="expanded-row-content bg-white">
    <div v-if="did?.services && did.services.length > 0">
      <h6 class="mb-3 text-secondary">
        Services
      </h6>
      
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Service Plan</th>
              <th>Kategori</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(service, index) in did.services" :key="index">
              <td>{{ service.servicePlan?.name || '-' }}</td>
              <td>
                <span
                  :class="getCategoryBadgeClass(service.category)"
                  class="badge"
                >
                  {{ getCategoryLabel(service.category) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Empty State untuk Services -->
    <div v-else class="text-center py-4">
      <div class="mb-3">
        <i class="ri-inbox-line ri-48px text-muted"></i>
      </div>
      <p class="text-muted mb-2">Tidak ada service untuk DID ini</p>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  did: {
    type: Object,
    required: true
  }
})

// Methods
const getCategoryBadgeClass = (category) => {
  const badgeMap = {
    delivery: 'bg-primary',
    dismantle: 'bg-danger',
    installation: 'bg-secondary',
    survey: 'bg-success',
  }
  return badgeMap[category] || 'bg-secondary'
}

const getCategoryLabel = (category) => {
  const labelMap = {
    delivery: 'Delivery',
    dismantle: 'Dismantle',
    installation: 'Installation',
    survey: 'Survey',
  }
  return labelMap[category] || category
}
</script>

<style scoped>
.expanded-row-content {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-left: 3px solid #d9d9d9;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.table tfoot tr {
  background-color: #f8f9fa;
  border-top: 2px solid #dee2e6;
}
</style>
