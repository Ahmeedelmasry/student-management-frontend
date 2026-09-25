<template>
  <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
    <v-row class="align-center flex-grow-0">
      <v-col cols="12" class="d-flex align-center justify-space-between ga-2">
        <h2 class="text-h4 font-weight-bold text-auto">
          <v-icon class="text-auto me-2">mdi-file-chart</v-icon>
          التقارير الشهرية
        </h2>
        <v-btn icon="mdi-printer" size="small" v-print="printObj"></v-btn>
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
              label="الصف الدراسي"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="((options.group = null), (items = []))"
              clearable
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
              :disabled="!options.grade"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- items Table -->
    <v-card class="flex-grow-1">
      <v-card id="printable" class="h-100">
        <v-data-table-server
          :headers="headers"
          :items="items"
          :loading="loading"
          item-value="_id"
          class="elevation-0 h-100"
          v-model:page="options.page"
          v-model:items-per-page="options.limit"
          :items-length="totalItems"
          :items-per-page-options="perPage"
        >
          <template #item.createdAt="{ item }">
            {{ item.createdAt ? moment(item.correctedAt).format('YYYY/MM/DD') : '...' }}
          </template>

          <template #item.actions="{ item }">
            <v-btn size="small" variant="text">
              <v-icon>mdi-dots-vertical</v-icon>
              <v-menu activator="parent">
                <v-list elevation="1">
                  <v-list-item
                    title="عرض التفاصيل"
                    append-icon="mdi-eye"
                    @click="openPdf(item)"
                  ></v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </template>
        </v-data-table-server>
      </v-card>
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
import examService from '@/services/exam'
import gradeService from '@/services/grade'
import moment from 'moment'
import AttendanceDetails from '@/components/reports/AttendanceDetails.vue'

const items = ref([])
const exams = ref([])
const grades = ref([])

// Print
const printObj = ref({
  id: 'printable',
  popTitle: ' -',
  extraCss:
    'https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css',
  extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
})

const loading = ref(false)
const toPreview = ref({})
const previewDetailsDialog = ref(false)
const gradeId = ref(null)

const options = ref({
  grade: null,
  searchWord: '',
  group: null,
  page: 1,
  limit: 10,
})

const exam = ref({
  maxScore: 0,
})

const totalItems = ref(0)

const headers = [
  {
    title: 'الطالب',
    key: 'student.fullName',
  },
  {
    title: 'الباركود',
    key: 'student.barcode',
  },
  {
    title: 'رقم الطالب',
    key: 'student.studentPhone',
  },
  {
    title: 'رقم ولي الأمر',
    key: 'student.parentPhone',
  },
  {
    title: 'الصف',
    key: 'student.grade.name',
  },
  {
    title: 'المجموعة',
    key: 'student.group.name',
  },
  {
    title: 'تاريخ الارسال',
    key: 'createdAt',
  },
  {
    title: 'العمليات',
    key: 'actions',
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

watch(
  () => gradeId.value,
  (newVal) => {
    if (newVal) {
      getExams()
    }
  },
)

const relatedGroups = computed(() => {
  if (!options.value.grade) return []

  return grades.value.find((e) => e._id == options.value.grade)?.groups || []
})

// Methods
const openPdf = (item) => {
  const url = `${import.meta.env.VITE_API_URL}/${item.pdf.path}`
  window.open(url, '_blank')
}

const listItems = async () => {
  loading.value = true

  await reportService
    .getMonthlyReport({ ...options.value })
    .then(({ data }) => {
      items.value = data.docs
      totalItems.value = data.totalDocs
    })
    .catch((err) => console.log(err))

  loading.value = false
}

const getExams = async () => {
  await examService
    .list({ limit: 100000, grade: gradeId.value })
    .then(({ data }) => {
      exams.value = data.docs
    })
    .catch((err) => console.log(err))
}

const getGrades = async () => {
  await gradeService
    .list({ limit: 10000 })
    .then(({ data }) => {
      grades.value = data.docs
    })
    .catch((err) => console.log(err))
}

onMounted(async () => {
  getGrades()
  listItems()
})
</script>

<style lang="scss">
@media print {
  #printable {
    th:last-child,
    td:last-child {
      display: table-cell !important;
    }
  }
}
</style>
