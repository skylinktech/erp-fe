<template>
    <footer class="content-footer footer bg-footer-theme layout-footer">
      <div class="container-xxl">
        <div class="footer-container d-flex align-items-center justify-content-between py-2 flex-md-row flex-column gap-2">
          <div class="text-body mb-0 mb-md-0 small">
            © {{ new Date().getFullYear() }}, made with <span class="text-danger"><i class="tf-icons ri-heart-fill"></i></span> by
            <a href="#" target="_blank" class="footer-link">PT Sinergi Innovate Pratama</a>
          </div>
          <div class="d-flex flex-column flex-md-row align-items-center gap-1 gap-md-3 text-body small footer-meta">
            <span class="footer-version" :title="versionTitle">
              Versi {{ versionLabel }}
            </span>
            <span class="footer-brand-skylink">
              SkyFlow by Skylink
            </span>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup>
  const { versionLabel, backendVersion, fetchHealth } = useAppVersion()

  const versionTitle = computed(() =>
    backendVersion.value
      ? `Frontend & API release ${versionLabel.value}`
      : `Frontend release ${versionLabel.value}`
  )

  onMounted(() => {
    fetchHealth()
  })
  </script>
  
  <style scoped>
  .layout-footer {
    margin-top: auto;
    flex-shrink: 0;
  }
  .footer-brand-skylink {
    white-space: nowrap;
    opacity: 0.9;
  }
  .footer-version {
    white-space: nowrap;
    opacity: 0.85;
    font-variant-numeric: tabular-nums;
  }
  .footer-meta {
    text-align: center;
  }
  .footer-container {
    font-size: 14px;
    letter-spacing: 0.05em;
    font-weight: 400;
    font-family: var(--bs-font-sans-serif);
    color: #666666;
    text-align: center;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 20px;
    margin-right: 20px;
  }
  </style>
