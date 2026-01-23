<template>
  <div class="expanded-row-content bg-white">
    <div class="row">
      <div class="col-md-6">
        <h6 class="mb-2 text-secondary"><i class="ri-checkbox-circle-line me-2"></i> Compliance Checklist</h6>
        <ul class="list-unstyled small">
          <li><i :class="(review.legalDocMatch ?? review.legal_doc_match) ? 'ri-checkbox-circle-fill text-success' : 'ri-checkbox-blank-circle-line text-muted'"></i> Legal Document Match (NIB / NPWP / Akta)</li>
          <li><i :class="(review.installVerif ?? review.install_verif) ? 'ri-checkbox-circle-fill text-success' : 'ri-checkbox-blank-circle-line text-muted'"></i> Installation Address Verified</li>
          <li><i :class="(review.serviceEligi ?? review.service_eligi) ? 'ri-checkbox-circle-fill text-success' : 'ri-checkbox-blank-circle-line text-muted'"></i> Service Eligibility</li>
          <li><i :class="(review.deviceAvailConf ?? review.device_avail_conf) ? 'ri-checkbox-circle-fill text-success' : 'ri-checkbox-blank-circle-line text-muted'"></i> Device Availability Confirmed</li>
          <li><i :class="(review.slaTermsRev ?? review.sla_terms_rev) ? 'ri-checkbox-circle-fill text-success' : 'ri-checkbox-blank-circle-line text-muted'"></i> SLA / Terms Reviewed</li>
          <li><i :class="(review.contractTermValid ?? review.contract_term_valid) ? 'ri-checkbox-circle-fill text-success' : 'ri-checkbox-blank-circle-line text-muted'"></i> Contract Term Validated</li>
        </ul>
      </div>
      <div class="col-md-6">
        <h6 class="mb-2 text-secondary"><i class="ri-file-text-line me-2"></i> Catatan</h6>
        <p class="small text-muted mb-0">{{ review.notes || '-' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  review: { type: Object, required: true },
})
</script>

<style scoped>
.expanded-row-content {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-left: 3px solid #696cff;
  margin-left: 1rem;
}
</style>
