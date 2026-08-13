<template>
  <header class="cetak-header" :class="`cetak-header--${variant}`">
    <slot name="header">
      <!-- standard: logo | brand | title -->
      <div
        v-if="variant === 'standard'"
        class="d-flex justify-content-between align-items-center cetak-header__row"
      >
        <div class="cetak-header__brand-group">
          <img
            v-if="profile"
            :src="profile.logoUrl"
            alt="Logo Perusahaan"
            class="cetak-header__logo"
            @error="onLogoError"
          >
          <h2 class="cetak-header__brand mb-0">{{ brandName }}</h2>
        </div>
        <div class="cetak-header__title-wrap text-end">
          <h1 class="cetak-header__title">{{ title }}</h1>
          <p v-if="subtitle" class="cetak-header__subtitle">{{ subtitle }}</p>
          <p v-if="documentNumber && showNumberUnderTitle" class="mb-0" style="font-size: 14px;">
            {{ documentNumber }}
          </p>
        </div>
      </div>

      <!-- company-address / finance: logo+address | title+meta -->
      <div
        v-else-if="variant === 'company-address' || variant === 'finance'"
        class="d-flex justify-content-between align-items-start cetak-header__row"
      >
        <div v-if="profile" class="logo-section">
          <img
            :src="profile.logoUrl"
            alt="Logo Perusahaan"
            class="cetak-header__logo mb-3"
            @error="onLogoError"
          >
          <div class="text-start text-secondary-medium cetak-header__company-meta">
            <p class="cetak-header__company-name">{{ profile.companyName || '—' }}</p>
            <p v-if="profile.address">Alamat: {{ profile.address }}</p>
            <p v-if="profile.phone">Telepon: {{ profile.phone }}</p>
            <p v-if="profile.email">Email: {{ profile.email }}</p>
            <p v-if="showNpwp && profile.npwp">NPWP: {{ profile.npwp }}</p>
          </div>
        </div>
        <div class="invoice-header text-end">
          <h1 class="cetak-header__title mb-2">{{ title }}</h1>
          <p v-if="subtitle" class="cetak-header__subtitle mb-2">{{ subtitle }}</p>
          <p v-if="documentNumber && (variant === 'finance' || showNumberUnderTitle)" class="mb-2 fw-bold" style="font-size: 12px;">
            {{ documentNumber }}
          </p>
          <table v-if="headerMeta.length" class="cetak-header__meta-table">
            <tbody>
              <tr v-for="(item, idx) in headerMeta" :key="idx">
                <td class="text-end pe-1">{{ item.label }}</td>
                <td class="px-1">:</td>
                <td class="text-start">{{ item.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- minimal: title left, logo right -->
      <div
        v-else
        class="d-flex justify-content-between align-items-start cetak-header__row"
      >
        <div>
          <h1 class="cetak-header__title">{{ title }}</h1>
          <p v-if="subtitle" class="cetak-header__subtitle">{{ subtitle }}</p>
          <p v-if="headerNote" class="cetak-header__subtitle">{{ headerNote }}</p>
        </div>
        <div class="text-end">
          <img
            v-if="profile"
            :src="profile.logoUrl"
            alt="Logo Perusahaan"
            class="cetak-header__logo"
            @error="onLogoError"
          >
          <p v-if="profile?.companyName" class="mb-0 mt-1" style="font-size: 12px;">
            {{ profile.companyName }}
          </p>
        </div>
      </div>
    </slot>
  </header>
</template>

<script setup lang="ts">
import type { PrintHeaderVariant } from '~/constants/print/documents'
import type { CompanyPrintProfile } from '~/composables/useCompanyPrintProfile'
import { useImageUrl } from '~/composables/useImageUrl'

export interface CetakHeaderMetaItem {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    variant: PrintHeaderVariant
    title: string
    subtitle?: string
    brandName?: string
    documentNumber?: string
    showNumberUnderTitle?: boolean
    showNpwp?: boolean
    headerNote?: string
    headerMeta?: CetakHeaderMetaItem[]
    profile?: CompanyPrintProfile | null
  }>(),
  {
    subtitle: '',
    brandName: 'SKYLINK',
    documentNumber: '',
    showNumberUnderTitle: false,
    showNpwp: false,
    headerNote: '',
    headerMeta: () => [],
    profile: null,
  }
)

const { handleImageError } = useImageUrl()

function onLogoError(event: Event) {
  handleImageError(event, '/img/branding/logo.png')
}
</script>
