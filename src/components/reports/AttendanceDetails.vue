<template>
  <v-dialog @after-leave="closeModal" max-width="1200">
    <v-card class="pa-4 px-2">
      <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-space-between">
        <span> عرض تفاصيل حضور الطالب: ( {{ toPreview.fullName }} ) </span>

        <div v-if="details.sessions" class="d-flex align-center ga-2" style="font-size: 15px">
          <v-card class="pa-3 font-weight-bold" flat color="success" variant="outlined">
            <span>اجمالي حصص الحضور: </span>
            <span>{{
              details.sessions ? details.sessions.filter((e) => e.attended).length : 0
            }}</span>
          </v-card>
          <v-card class="pa-3 font-weight-bold" flat color="red" variant="outlined">
            <span>اجمالي حصص الغياب: </span>
            <span>{{
              details.sessions ? details.sessions.filter((e) => !e.attended).length : 0
            }}</span>
          </v-card>
        </div>
      </v-card-title>
      <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
        <!-- items Table -->
        <v-card class="flex-grow-1">
          <v-data-table-server
            :headers="headers"
            :items="details.sessions"
            :loading="loading"
            item-value="_id"
            class="elevation-0 h-100"
            style="height: 60vh"
          >
            <template #item.sessionDate="{ item }">
              {{ item.sessionDate ? moment(item.sessionDate).format('YYYY/MM/DD') : '...' }}
            </template>
            <template #item.scannedAt="{ item }">
              <span>
                <span>
                  {{ item.scannedAt ? `( ${moment(item.scannedAt).format('h:m a')} )` : '' }}
                </span>
                &nbsp;
                <span>
                  {{ item.scannedAt ? moment(item.scannedAt).format('YYYY/MM/DD') : '...' }}
                </span>
              </span>
            </template>

            <template #item.attended="{ item }">
              <v-chip
                class="font-weight-bold"
                :color="item.attended ? 'success' : 'red'"
                size="small"
                label
              >
                {{ item.attended ? 'حاضر' : 'غائب' }}
              </v-chip>
            </template>
            <template #bottom> </template>
          </v-data-table-server>
        </v-card>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import reportService from '@/services/report.js'
import moment from 'moment'

const details = ref({})

const loading = ref(false)

const { toPreview } = defineProps({
  toPreview: {
    type: Object,
    default: () => ({}),
  },
})

const emits = defineEmits(['leave'])

const headers = [
  { title: 'المحاضرة', key: 'title', sortable: false },
  { title: 'تاريخ المحاضرة', key: 'sessionDate', sortable: false },
  { title: 'تاريخ تسجيل الحضور', key: 'scannedAt', sortable: false },
  { title: 'حالة الحضور', key: 'attended', sortable: false },
]

// Watchers
watch(
  () => toPreview,
  (newVal) => {
    if (newVal?._id) {
      listItems()
    }
  },
  { deep: true },
)
// Methods
const closeModal = () => {
  emits('leave')
}

const listItems = async () => {
  loading.value = true
  reportService
    .getAttendanceReportDetails(toPreview._id)
    .then(({ data }) => {
      console.log(data)
      details.value = data
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
