<template>
  <div class="hr-calendar-wrapper">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import type { EventClickArg, DateClickArg, DatesSetArg } from '@fullcalendar/core'
import type { HrCalendarFullCalendarEvent } from '~/constants/hrd/hrCalendar'

const props = defineProps<{
  events: HrCalendarFullCalendarEvent[]
  loading?: boolean
}>()

const emit = defineEmits<{
  dateClick: [dateStr: string]
  eventClick: [event: HrCalendarFullCalendarEvent]
  datesChange: [range: { start: string; end: string }]
}>()

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)

function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function syncEventsToCalendar(events: HrCalendarFullCalendarEvent[]) {
  const api = calendarRef.value?.getApi()
  if (!api) return
  api.removeAllEvents()
  for (const ev of events) {
    api.addEvent(ev)
  }
}

/**
 * Options statis — jangan masukkan `events` di sini.
 * Jika `events` ikut di computed/ref options, FullCalendar me-reset internal
 * state setiap fetch bulan baru sehingga dateClick berhenti berfungsi.
 */
const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: idLocale,
  height: 'auto',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek',
  },
  buttonText: {
    today: 'Hari ini',
    month: 'Bulan',
    week: 'Minggu',
  },
  eventDisplay: 'block',
  dayMaxEvents: 3,
  fixedWeekCount: false,
  dateClick: (info: DateClickArg) => {
    emit('dateClick', info.dateStr.slice(0, 10))
  },
  eventClick: (info: EventClickArg) => {
    info.jsEvent.preventDefault()
    const raw = info.event.toPlainObject() as HrCalendarFullCalendarEvent
    emit('eventClick', raw)
  },
  datesSet: (info: DatesSetArg) => {
    emit('datesChange', {
      start: toIsoDate(info.start),
      end: toIsoDate(info.end),
    })
  },
})

watch(
  () => props.events,
  (events) => {
    syncEventsToCalendar(events)
  },
  { deep: true }
)

onMounted(() => {
  syncEventsToCalendar(props.events)
})
</script>

<style scoped>
.hr-calendar-wrapper :deep(.fc) {
  --fc-border-color: rgba(67, 89, 113, 0.12);
  --fc-today-bg-color: rgba(105, 108, 255, 0.08);
  font-size: 0.9rem;
}

.hr-calendar-wrapper :deep(.fc-toolbar-title) {
  font-size: 1.1rem;
  font-weight: 600;
}

.hr-calendar-wrapper :deep(.fc-daygrid-event) {
  cursor: pointer;
  border-radius: 4px;
  padding: 1px 4px;
}

.hr-calendar-wrapper :deep(.fc-daygrid-day-number) {
  cursor: pointer;
}
</style>
