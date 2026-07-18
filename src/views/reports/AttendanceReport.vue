<template>
  <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
    <v-row class="mb-4 align-center flex-grow-0">
      <v-col cols="6">
        <h2 class="text-h4 font-weight-bold text-grey-darken-3">
          <v-icon color="primary" class="me-2">mdi-account-multiple-plus</v-icon>
          تقرير حضور الطلاب
        </h2>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              :id="Math.random()"
              v-model="options.searchWord"
              label="بحث"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col>
            <v-autocomplete
              :id="Math.random()"
              v-model="options.grade"
              :items="grades"
              item-title="name"
              item-value="_id"
              label="الصف"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              @update:model-value="options.group = null"
            />
          </v-col>

          <v-col>
            <v-autocomplete
              :id="Math.random()"
              v-model="options.group"
              :items="relatedGroups"
              item-title="name"
              item-value="_id"
              label="المجموعة"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>

          <v-col>
            <v-text-field
              :id="Math.random()"
              v-model="options.absentCount"
              label="عدد حصص الغياب"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
            />
          </v-col>

          <v-col v-if="options.absentOperator == 'between'">
            <v-text-field
              :id="Math.random()"
              v-model="options.absentTo"
              label="الي"
              density="compact"
              variant="outlined"
              hide-details
              type="number"
            />
          </v-col>

          <v-col>
            <v-select
              :id="Math.random()"
              v-model="options.absentOperator"
              :items="absentCountOptions"
              label="حالة حصص الغياب"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>

          <v-col>
            <v-date-input
              v-model="options.fromDate"
              label="من تاريخ"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>

          <v-col>
            <v-date-input
              v-model="options.toDate"
              label="إلى تاريخ"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- items Table -->
    <v-card class="flex-grow-1">
      <v-data-table-server
        :headers="headers"
        :items="items"
        :loading="loading"
        item-value="_id"
        class="elevation-0 h-100"
        v-model:page="options.page"
        v-model:items-per-page="options.limit"
        :items-length="totalItems"
      >
        <template #item.lastAbsentDate="{ item }">
          {{ item.lastAbsentDate ? moment(item.lastAbsentDate).format('YYYY/MM/DD') : '...' }}
        </template>

        <template #item.lastAttendanceDate="{ item }">
          {{
            item.lastAttendanceDate ? moment(item.lastAttendanceDate).format('YYYY/MM/DD') : '...'
          }}
        </template>

        <template #item.attendanceRate="{ item }">
          <v-chip
            class="font-weight-bold"
            :color="
              item.attendanceRate >= 90
                ? 'green'
                : item.attendanceRate >= 75
                  ? 'blue'
                  : item.attendanceRate >= 50
                    ? 'orange'
                    : 'red'
            "
            size="small"
            label
          >
            {{ item.attendanceRate }}%
          </v-chip>
        </template>

        <template #item.absent="{ item }">
          <v-chip class="font-weight-bold" color="red" size="small" label>
            {{ item.absent }}
          </v-chip>
        </template>

        <template #item.attendanceStatus="{ item }">
          <v-chip class="font-weight-bold" :color="item.attendanceStatus.color" size="small" label>
            {{ item.attendanceStatus.title }}
          </v-chip>
        </template>

        <template #item.attended="{ item }">
          <v-chip class="font-weight-bold" color="green" size="small" label>
            {{ item.attended }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn size="small" variant="text">
            <v-icon>mdi-dots-vertical</v-icon>
            <v-menu activator="parent">
              <v-list elevation="1">
                <v-list-item
                  title="عرض التفاصيل"
                  append-icon="mdi-eye"
                  @click="((toPreview = item), (previewDetailsDialog = true))"
                ></v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <AttendanceDetails
      v-model="previewDetailsDialog"
      @leave="((previewDetailsDialog = false), (toPreview = {}))"
      :toPreview="toPreview"
      @refreshTableData="listItems"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

import reportService from '@/services/report'
import gradeService from '@/services/grade'
import moment from 'moment'
import AttendanceDetails from '@/components/reports/AttendanceDetails.vue'

const items = ref([])
const grades = ref([])

const loading = ref(false)
const toPreview = ref({})
const previewDetailsDialog = ref(false)

const options = ref({
  searchWord: '',
  grade: null,
  group: null,
  absentCount: null,
  absentOperator: 'eq',
  absentTo: null,
  fromDate: null,
  toDate: null,
  page: 1,
  limit: 10,
})

const absentCountOptions = ref([
  {
    title: 'يساوي',
    value: 'eq',
  },
  {
    title: 'اكبر من',
    value: 'gt',
  },
  {
    title: 'اصغر من',
    value: 'lt',
  },
  {
    title: 'بين رقمين',
    value: 'between',
  },
])

const totalItems = ref(0)

const headers = [
  {
    title: 'الطالب',
    key: 'fullName',
  },
  {
    title: 'باركود',
    key: 'barcode',
  },
  {
    title: 'الصف',
    key: 'grade.name',
  },
  {
    title: 'المجموعة',
    key: 'group.name',
  },
  {
    title: 'الحضور',
    key: 'attended',
  },
  {
    title: 'الغياب',
    key: 'absent',
  },
  {
    title: 'إجمالي الحصص',
    key: 'totalSessions',
  },
  {
    title: 'نسبة الحضور',
    key: 'attendanceRate',
  },
  {
    title: 'حالة الحضور',
    key: 'attendanceStatus',
  },
  {
    title: 'تاريخ اخر حضور',
    key: 'lastAttendanceDate',
  },
  {
    title: 'تاريخ اخر غياب',
    key: 'lastAbsentDate',
  },
  {
    title: 'العمليات',
    key: 'actions',
    sortable: false,
  },
]

// Watchers
watch(
  () => options.value,
  () => {
    listItems()
  },
  { deep: true },
)

const relatedGroups = computed(() => {
  const gradeId = options.value.grade
  if (gradeId) {
    return grades.value.find((e) => e._id == gradeId)?.groups || []
  }
  return []
})

const listItems = async () => {
  await reportService
    .getAttendanceReport({ ...options.value })
    .then(({ data }) => {
      console.log(data)
      items.value = data.docs
      totalItems.value = data.totalDocs
    })
    .catch((err) => console.log(err))
}

const getGrades = async () => {
  await gradeService
    .list({ limit: 1000 })
    .then(({ data }) => {
      grades.value = data.docs
    })
    .catch((err) => console.log(err))
}

onMounted(async () => {
  listItems()
  getGrades()
})
</script>
