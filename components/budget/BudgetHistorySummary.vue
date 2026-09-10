<template>
  <div class="row g-3 mb-4">
    <div class="col-md-3 col-6">
      <div class="card h-100">
        <div class="card-body">
          <div class="text-muted small">Approved</div>
          <div class="fw-semibold">{{ formatMoney(summary?.approved) }}</div>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card h-100">
        <div class="card-body">
          <div class="text-muted small">Reserved</div>
          <div class="fw-semibold">{{ formatMoney(summary?.reserved) }}</div>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card h-100">
        <div class="card-body">
          <div class="text-muted small">Committed</div>
          <div class="fw-semibold">{{ formatMoney(summary?.committed) }}</div>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card h-100">
        <div class="card-body">
          <div class="text-muted small">Actual</div>
          <div class="fw-semibold">{{ formatMoney(summary?.actual) }}</div>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card h-100">
        <div class="card-body">
          <div class="text-muted small">Released</div>
          <div class="fw-semibold">{{ formatMoney(summary?.released) }}</div>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card h-100">
        <div class="card-body">
          <div class="text-muted small">Transfer In</div>
          <div class="fw-semibold">{{ formatMoney(summary?.transferIn) }}</div>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card h-100">
        <div class="card-body">
          <div class="text-muted small">Transfer Out</div>
          <div class="fw-semibold">{{ formatMoney(summary?.transferOut) }}</div>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card h-100 border-primary">
        <div class="card-body">
          <div class="text-muted small">Available</div>
          <div class="fw-bold text-primary">{{ formatMoney(summary?.available) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFormatRupiah } from '~/composables/formatRupiah'

defineProps({
  summary: {
    type: Object,
    default: null,
  },
})

const formatRupiah = useFormatRupiah()

function formatMoney(n) {
  return formatRupiah(Number(n || 0))
}
</script>
