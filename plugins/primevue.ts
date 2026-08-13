import { FilterMatchMode } from '@primevue/core/api';
import PrimeVue from 'primevue/config';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import ProgressSpinner from 'primevue/progressspinner';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';

const SkylinkPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#ebf6fd',
      100: '#cce9fb',
      200: '#99d2f7',
      300: '#66bcf4',
      400: '#33a5f0',
      500: '#008fec',
      600: '#0081d4',
      700: '#0072bd',
      800: '#00568e',
      900: '#00395e',
      950: '#001d2f',
    },
  },
});

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: SkylinkPreset,
      options: {
        prefix: 'p',
        darkModeSelector: '.app-light',
        cssLayer: false
      }
    }
  });
  nuxtApp.vueApp.component('DataTable', DataTable);
  nuxtApp.vueApp.component('Column', Column);
  nuxtApp.vueApp.component('Dropdown', Dropdown);
  nuxtApp.vueApp.component('FilterMatchMode', FilterMatchMode);
  nuxtApp.vueApp.component('InputText', InputText);
  nuxtApp.vueApp.component('Editor', Editor);
  nuxtApp.vueApp.component('Chart', Chart);
  nuxtApp.vueApp.component('ProgressSpinner', ProgressSpinner);
  
  // Register global components
  nuxtApp.vueApp.component('MyDataTable', () => import('~/components/table/MyDataTable.vue'));
  nuxtApp.vueApp.component('Modal', () => import('~/components/modal/Modal.vue'));
});
